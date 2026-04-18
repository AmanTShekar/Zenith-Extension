//! # Zenith Sidecar Engine
//!
//! A multi-threaded Rust engine for surgical AST patching, real-time visual
//! manipulation, and AI-agent conflict resolution.
//!
//! ## Thread Architecture
//!
//! - **Thread 1 (Hot Path):** Polls SAB ring buffer for slider scrub events.
//!   Emits CSS variable overrides at <1µs. Zero allocation.
//! - **Thread 2 (JSON-RPC):** Handles WebSocket commands (commit, rollback,
//!   select, lock). Drives the VFS write path.
//! - **Thread 3 (Agent Stream):** Receives streaming AI patches. Applies
//!   LWW conflict resolution. Emits Draft State to canvas.
//!   AST patch computation, Ghost-ID re-injection.

pub mod auditor;
pub mod conflict;
pub mod hmr;
pub mod hot_path;
pub mod ledger;
pub mod patcher;
pub mod project;
pub mod proxy;
pub mod rebase;
pub mod rpc;
pub mod stream;
pub mod types;
pub mod vfs;


use std::path::PathBuf;
use std::sync::Arc;
use dashmap::DashMap;
use tokio::sync::RwLock;
use crate::conflict::ConflictResolver;
use crate::hot_path::predictive::{PrecomputedPatch, PredictCacheKey};
use crate::ledger::ChangeLedger;
use crate::types::{ZenithId, ZenithIdHash};
use crate::vfs::{VirtualFileSystem, GhostRegistry};

use crate::rebase::RebaseEngine;

use smallvec::SmallVec;

/// All shared state accessible by every thread.
pub struct SharedState {
    pub vfs: Arc<RwLock<VirtualFileSystem>>,
    pub conflict: ConflictResolver,
    pub rebase: RwLock<RebaseEngine>,
    pub ledger: RwLock<ChangeLedger>,
    pub predict_cache: Arc<DashMap<PredictCacheKey, PrecomputedPatch>>,
    pub ghost_registry: Arc<RwLock<GhostRegistry>>,
    pub surgical_mode: RwLock<bool>,
    pub recovery_notification: RwLock<Option<String>>, // v3.8 Session Recovery
    pub rpc_history: DashMap<String, crate::rpc::StageResult>, // Issue 5: Idempotency
    pub id_reverse_map: Arc<DashMap<ZenithIdHash, SmallVec<[ZenithId; 1]>>>,
    pub hmr_tx: tokio::sync::broadcast::Sender<String>,
    pub project_root: PathBuf,
    /// Path to the MessagePack ghost index (v12.6 Cold Start)
    pub ghost_index_path: PathBuf,
    /// Change #12: Sandbox Lifecycle Management
    pub active_sandboxes: Arc<DashMap<u16, tokio::task::JoinHandle<()>>>,
}


impl SharedState {
    /// v3.10 Fix: Pruning task to prevent memory leaks (M4: use partial eviction, not clear)
    pub fn prune(&self) {
        // 1. Prune RPC history (keep last 1000 entries)
        //    M4 Fix: Remove oldest 200 entries instead of clearing the whole map
        //    to avoid breaking in-flight idempotency checks during a prune cycle.
        if self.rpc_history.len() > 1200 {
            let keys_to_remove: Vec<String> = self.rpc_history
                .iter()
                .take(200)
                .map(|r| r.key().clone())
                .collect();
            for k in keys_to_remove {
                self.rpc_history.remove(&k);
            }
            tracing::info!("RPC history pruned: removed 200 oldest entries");
        }

        // 2. Prune prediction cache (same strategy)
        if self.predict_cache.len() > 5000 {
            let keys_to_remove: Vec<_> = self.predict_cache
                .iter()
                .take(1000)
                .map(|r| r.key().clone())
                .collect();
            for k in keys_to_remove {
                self.predict_cache.remove(&k);
            }
            tracing::info!("Predict cache pruned: removed 1000 oldest entries");
        }
    }
}
