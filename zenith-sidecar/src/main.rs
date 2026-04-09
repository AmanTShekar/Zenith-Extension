//! # Zenith Sidecar — Main Entry Point
//!
//! Orchestrates the multi-threaded engine:
//!
//! - **Thread 1 (Hot Path):** Polls SAB ring buffer, emits CSS overrides.
//! - **Thread 2 (JSON-RPC):** Handles WebSocket commands.
//! - **Thread 3 (Agent Stream):** Receives AI patches, applies LWW resolution.
//! - **Thread Pool (Rayon):** Predictive pre-patching, AST computation.
//!
//! ## Startup Sequence
//!
//! 1. Parse CLI args (workspace path, SAB path, port).
//! 2. Initialize shared state (VFS, conflict resolver, ledger, caches).
//! 3. Spawn the hot path thread (dedicated OS thread, not tokio).
//! 4. Spawn the predictive patcher (tokio task feeding rayon).
//! 5. Start the JSON-RPC WebSocket server (tokio).
//! 6. Listen for agent stream connections (tokio).




use std::path::PathBuf;
use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::{mpsc, RwLock};
use tracing::{info, error, warn};

use zenith_sidecar::conflict::ConflictResolver;
use zenith_sidecar::rebase::RebaseEngine;
use zenith_sidecar::hot_path::predictive::{PredictivePatcher, PrecomputedPatch, PredictCacheKey};
use zenith_sidecar::hot_path::ring_buffer::{RingBufferConsumer, SAB_TOTAL_SIZE};
use zenith_sidecar::ledger::ChangeLedger;
use zenith_sidecar::types::*;
use zenith_sidecar::vfs::{VirtualFileSystem, GhostRegistry};
use zenith_sidecar::rpc::start_rpc_server;
use zenith_sidecar::project::detector::Framework;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

struct Args {
    workspace: PathBuf,
    sab_path: Option<PathBuf>,
    port: u16,
    /// Global Ghost Index path (Change #6 — from extension.globalStorageUri)
    /// If provided, the sidecar loads/saves the ghost index here instead of .zenith/
    global_index_path: Option<PathBuf>,
    /// Log level override (maps to RUST_LOG)
    log_level: String,
    /// Framework provided by the extension's robust TS detector
    framework: Option<String>,
    /// Target port for the sandbox header stripper (Header Mirroring)
    target_port: u16,
    /// Listening port for the sandbox proxy (Header Stripper)
    sandbox_port: u16,
}

fn workspace_hash(canonical: &std::path::Path) -> u32 {
    let mut path_str = canonical.to_string_lossy().into_owned();
    
    // On Windows, canonicalize() often adds \\?\ prefix (UNC). 
    // We strip it to match the hashing logic in the JS-based Vite plugin.
    if path_str.starts_with(r"\\?\") {
        path_str = path_str[4..].to_string();
    }

    let normalized = if cfg!(windows) {
        path_str.to_lowercase().replace('\\', "/")
    } else {
        path_str
    };
    let mut h: u32 = 2166136261;
    for byte in normalized.bytes() {
        h ^= byte as u32;
        h = h.wrapping_mul(16777619);
    }
    h
}

fn parse_args() -> Args {
    let mut args_iter = std::env::args().skip(1);
    let mut workspace = PathBuf::from(".");
    let mut sab_path = None;
    let mut port = 8082;
    let mut global_index_path: Option<PathBuf> = None;
    let mut log_level = "info".to_string();
    let mut framework: Option<String> = None;
    let mut target_port = 5173; // Default to Vite standard
    let mut sandbox_port = 3005; // Default sandbox port

    while let Some(flag) = args_iter.next() {
        match flag.as_str() {
            "--workspace" | "--project-root" => {
                if let Some(val) = args_iter.next() { workspace = PathBuf::from(val); }
            }
            "--sab-path" => {
                if let Some(val) = args_iter.next() { sab_path = Some(PathBuf::from(val)); }
            }
            "--port" => {
                if let Some(val) = args_iter.next() {
                    if let Ok(p) = val.parse() { port = p; }
                }
            }
            "--global-index-path" => {
                if let Some(val) = args_iter.next() { global_index_path = Some(PathBuf::from(val)); }
            }
            "--log-level" => {
                if let Some(val) = args_iter.next() { log_level = val; }
            }
            "--framework" => {
                if let Some(val) = args_iter.next() { framework = Some(val); }
            }
            "--target-port" => {
                if let Some(val) = args_iter.next() {
                    if let Ok(p) = val.parse() { target_port = p; }
                }
            }
            "--sandbox-port" => {
                if let Some(val) = args_iter.next() {
                    if let Ok(p) = val.parse() { sandbox_port = p; }
                }
            }
            _ => {
                // Ignore unknown flags or positional args
            }
        }
    }

    Args { workspace, sab_path, port, global_index_path, log_level, framework, target_port, sandbox_port }
}

use zenith_sidecar::SharedState;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_target(false)
        .with_timer(tracing_subscriber::fmt::time::uptime())
        .init();

    let args = parse_args();
    info!("[SIDECAR] Phase 1/6: Args parsed — workspace={:?} port={} target_port={}", args.workspace, args.port, args.target_port);

    ctrlc::set_handler(move || {
        info!("[SIDECAR] Shutdown signal received — cleaning up");
        std::process::exit(0);
    }).expect("Failed to set ctrlc handler");

    let raw_path = std::path::PathBuf::from(&args.workspace);

    let zenith_dir = raw_path.join(".zenith");
    std::fs::create_dir_all(&zenith_dir).unwrap_or_else(|e| {
        eprintln!("ZENITH_ERROR: Cannot create .zenith directory: {}", e);
        std::process::exit(1);
    });

    let workspace_root = std::fs::canonicalize(&raw_path).unwrap_or_else(|e| {
        eprintln!("ZENITH_ERROR: Cannot resolve workspace path '{}': {}", raw_path.display(), e);
        std::process::exit(1);
    });

    info!(
        "Zenith sidecar starting. Workspace: {:?}, .zenith: {:?}",
        workspace_root, zenith_dir
    );
    info!("Listening on port: {}", args.port);

    // Change #3 & Fix #4: Framework auto-detected by extension and passed in
    let framework = args.framework
        .as_deref()
        .and_then(|s| std::str::FromStr::from_str(s).ok())
        .unwrap_or(Framework::Unknown);

    info!("Detected framework: {:?}", framework);

    // Change #6: Use global index path if provided by extension (from globalStorageUri)
    let ghost_index_path = args.global_index_path
        .unwrap_or_else(|| zenith_dir.join("ghost_index.msgpack"));

    // -----------------------------------------------------------------------
    // Initialize shared state
    // -----------------------------------------------------------------------

    let ledger_path = zenith_dir.join("ledger.ndjson");
    let ledger = match ChangeLedger::replay_from_file(&ledger_path) {
        Ok(l) => {
            l
        }
        Err(_) => {
            ChangeLedger::new(Some(ledger_path.clone()))
        }
    };

    let predict_cache = Arc::new(DashMap::new());
    let id_reverse_map = Arc::new(DashMap::new());
    let rpc_history = DashMap::new();

    let mut ghost_registry = GhostRegistry::new();
    if let Err(e) = ghost_registry.load_from_root(&workspace_root, Some(ghost_index_path)) {
        warn!("Failed to load ghost manifest: {e}");
    }
    info!("[SIDECAR] Phase 2/6: Registry initialized");

    let project_root = workspace_root.clone();

    // ── WAL Crash Recovery ──────────────────────────────────────────────────
    // Recover any staged-but-not-committed mutations from the last session.
    let mut recovery_msg = None;
    let vfs = match VirtualFileSystem::recover_from_wal(&zenith_dir) {
        Ok(recovered) => {
            let count = recovered.staged_intents.len();
            if count > 0 {
                recovery_msg = Some(format!("Recovered {} staged changes from previous session", count));
            }
            info!("[SIDECAR] Phase 3/6: WAL replayed — {} entries", count);
            recovered
        }
        Err(zenith_sidecar::vfs::VfsError::WalNotFound) => {
            info!("[SIDECAR] Phase 3/6: WAL replayed — 0 entries (First start)");
            VirtualFileSystem::with_wal(&zenith_dir).expect("Failed to create WAL")
        }
        Err(e) => {
            tracing::error!("WAL recovery failed: {}. Staged edits may be lost.", e);
            eprintln!("ZENITH_WAL_ERROR: {}", e);
            VirtualFileSystem::with_wal(&zenith_dir).expect("Failed to create WAL fallback")
        }
    };

    let (hmr_tx, _) = tokio::sync::broadcast::channel(256);
    
    // Core state
    let state = Arc::new(SharedState {
        vfs: Arc::new(RwLock::new(vfs)),
        conflict: ConflictResolver::new(),
        rebase: RwLock::new(RebaseEngine::default()),
        ledger: RwLock::new(ledger),
        predict_cache: predict_cache.clone(),
        ghost_registry: Arc::new(RwLock::new(ghost_registry)),
        id_reverse_map: id_reverse_map.clone(),
        surgical_mode: RwLock::new(true),
        recovery_notification: RwLock::new(recovery_msg),
        rpc_history,
        hmr_tx,
        project_root: workspace_root.clone(),
        active_sandboxes: Arc::new(DashMap::new()),
    });


    // -----------------------------------------------------------------------
    // Channels
    // -----------------------------------------------------------------------

    // Hot path → Predictive patcher
    let (predict_tx, predict_rx) = mpsc::channel::<ScrubMessage>(512);

    // Hot path → Webview bridge (CSS overrides)
    let (css_tx, mut css_rx) = mpsc::channel::<CssOverride>(256);

    // -----------------------------------------------------------------------
    // Thread 1: Hot Path (dedicated OS thread — NOT tokio)
    // -----------------------------------------------------------------------

    if let Some(ref sab_path) = args.sab_path {
        let sab_path = sab_path.clone();
        let reverse_map = id_reverse_map.clone();
        let predict_tx = predict_tx.clone();

        std::thread::Builder::new()
            .name("zenith-hot-path".into())
            .spawn(move || {
                // Memory-map the SAB file (Shared Array Buffer)
                // Use create(true) and set_len to ensure the file exists and is the right size for mmap.
                let file = match std::fs::OpenOptions::new()
                    .read(true)
                    .write(true)
                    .create(true)
                    .open(&sab_path)
                {
                    Ok(f) => {
                        // Pre-allocate the file size if it's new or truncated
                        if let Ok(metadata) = f.metadata() {
                            if metadata.len() < SAB_TOTAL_SIZE as u64 {
                                info!("Pre-allocating SAB file ({} bytes) at {:?}", SAB_TOTAL_SIZE, sab_path);
                                let _ = f.set_len(SAB_TOTAL_SIZE as u64);
                                
                                // v12.5 Hardening: Write magic header immediately to prevent aborts
                                let mut buf = [0u8; 4];
                                buf[0] = 0x48; // 'H'
                                buf[1] = 0x54; // 'T'
                                buf[2] = 0x4E; // 'N'
                                buf[3] = 0x5A; // 'Z'
                                
                                #[cfg(windows)]
                                {
                                    use std::os::windows::fs::FileExt;
                                    let _ = f.seek_write(&buf, 0);
                                }
                                #[cfg(unix)]
                                {
                                    use std::os::unix::fs::FileExt;
                                    let _ = f.write_at(&buf, 0);
                                }
                            }
                        }
                        f
                    },
                    Err(e) => {
                        error!("Failed to open/create SAB file at {:?}: {}", sab_path, e);
                        return;
                    }
                };

                let mmap = match unsafe { memmap2::Mmap::map(&file) } {
                    Ok(m) => m,
                    Err(e) => {
                        error!("Failed to mmap SAB: {e}");
                        return;
                    }
                };

                if mmap.len() < SAB_TOTAL_SIZE {
                    error!("SAB file too small: {} < {}", mmap.len(), SAB_TOTAL_SIZE);
                    return;
                }

                let mut consumer = unsafe {
                    RingBufferConsumer::new(
                        mmap.as_ptr(),
                        mmap.len(),
                        id_reverse_map.clone(),
                        predict_tx,
                        css_tx,
                    )
                };

                info!("Hot path thread started — polling SAB ring buffer");
                consumer.run();
            })
            .expect("Failed to spawn hot path thread");
    } else {
        info!("No SAB path provided — hot path disabled (WebSocket-only mode)");
    }

    // -----------------------------------------------------------------------
    // Predictive pre-patcher (tokio task → Rayon pool)
    // -----------------------------------------------------------------------

    let predict_cache_clone = predict_cache.clone();
    tokio::spawn(async move {
        let mut patcher = PredictivePatcher::new(predict_rx, predict_cache_clone);
        patcher.run().await;
    });

    // -----------------------------------------------------------------------
    // CSS override forwarder (receives from hot path, sends to WebSocket clients)
    // -----------------------------------------------------------------------

    // CSS override forwarder (receives from hot path, sends to WebSocket clients)
    // L3 Fix: Actually log and prepare for forwarding to WebSocket — the JSON-RPC
    // broadcast mechanism will be wired here when the push-notification API is added.
    let _state_for_css = state.clone();
    tokio::spawn(async move {
        while let Some(ovr) = css_rx.recv().await {
            // Forward the CSS override to any connected WebSocket subscriber.
            // For the v3.10 release this is prepared but the WS push channel
            // is driven by the sidecar_status / HMR pathway instead.
            tracing::debug!(
                "[CSS Override] {} = {} on {} (queued for WS push)",
                ovr.property, ovr.value, ovr.zenith_id
            );
        }
    });

    // C4 Fix: Periodic memory pruning (every 5 minutes)
    let state_for_prune = state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
        loop {
            interval.tick().await;
            state_for_prune.prune();
            tracing::debug!("[Prune] Memory pruning cycle complete");
        }
    });

    // Start Ghost-Proxy IPC server for virtualization
    let proxy_state = state.clone();
    let proxy_root = workspace_root.clone();
    let socket_hash = workspace_hash(&workspace_root);
    
    tokio::spawn(async move {
        let proxy = zenith_sidecar::proxy::GhostProxyServer::new(socket_hash, proxy_root);
 
        if let Err(e) = proxy.run(move |path| {
            let state = proxy_state.clone();
            async move {
                let vfs = state.vfs.read().await;
                vfs.read_virtual(&path)
            }
        }).await {
            error!("[SIDECAR] Ghost-Proxy server failed: {}", e);
        }
        info!("Ghost-Proxy background task initialized (IPC port encrypted)");
    });
 
    // v11.5 Lifecycle Hardening: The Sandbox Proxy is now managed EXCLUSIVELY via 
    // JSON-RPC. This prevents the "two proxies per session" bug (3006/3007 drift).
    info!("[SIDECAR] Phase 4/6: Sandbox proxy manager ready (awaiting RPC latch)");

    // JSON-RPC WebSocket server (Thread 2)

    let state_for_rpc = state.clone();
    let port = args.port;
    let hmr_tx_for_rpc = state.hmr_tx.clone();
    tokio::spawn(async move {
        if let Err(e) = start_rpc_server(port, state_for_rpc, hmr_tx_for_rpc).await {
            error!("[SIDECAR] JSON-RPC server error: {e}");
        }
    });
    info!("[SIDECAR] Phase 5/6: RPC server ready on :{}", port);
    info!("[SIDECAR] Phase 6/6: SAB hot path {}", if args.sab_path.is_some() { "ENABLED" } else { "DISABLED" });

    info!("[SIDECAR] ✓ Zenith Sidecar fully ready");
    // CRITICAL: extension host reads this from stdout
    info!("  Hot Path:   {}", if args.sab_path.is_some() { "ACTIVE" } else { "DISABLED (no SAB)" });
    info!("  Predictive: ACTIVE ({} cores)", num_cpus::get().saturating_sub(2).max(2));
    info!("  JSON-RPC:   ws://localhost:{}", args.port);
    info!("  Ledger:     {:?}", ledger_path);

    // Keep the main task alive
    tokio::signal::ctrl_c().await.ok();
    info!("Zenith Sidecar shutting down");
}
