// FORCED FIX
// Zenith JSON-RPC Server
// ---------------------------------------------------------------------------
//
// This module implements the Command Path (WebSocket) for Zenith.
// It handles structural commands like selection, committing VFS drafts,
// and state mocking.

use std::collections::HashMap;
use std::sync::Arc;

use jsonrpsee::core::RpcResult;
use jsonrpsee::proc_macros::rpc;
use jsonrpsee::server::ServerBuilder;
use jsonrpsee::types::Params;
use smallvec::SmallVec;
use tracing::info;

use anyhow::anyhow;

use crate::hot_path::ring_buffer::fnv1a_hash_u64;

use crate::auditor::{AgentAuditor, AuditReport, LayoutAuditor, Rect};
use crate::SharedState;
use crate::types::ZenithId;
use crate::vfs::{ViewMode, GhostEntry};
use crate::conflict::ot_engine::{TransformResult, MutationIntent};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum StageResult {
    Success { new_zenith_id: Option<ZenithId> },
    Conflict(TransformResult),
    Error(String),
}

/// The Zenith JSON-RPC API definition.
#[rpc(server)]
pub trait ZenithApi {
    #[method(name = "element.select")]
    async fn select_element(&self, ghost_id: ZenithId) -> RpcResult<Option<GhostEntry>>;

    #[method(name = "element.hover")]
    async fn hover_element(&self, ghost_id: ZenithId) -> RpcResult<bool>;

    #[method(name = "auditor.check")]
    async fn check_design(&self, ghost_id: ZenithId, props: HashMap<String, String>) -> RpcResult<AuditReport>;

    #[method(name = "view.toggle")]
    async fn toggle_view(&self, original: bool) -> RpcResult<bool>;

    #[method(name = "vfs.persist")]
    async fn persist(&self) -> RpcResult<bool>;

    #[method(name = "auditor.update_layout")]
    async fn update_layout(&self, rects: HashMap<String, Rect>) -> RpcResult<u64>;

    #[method(name = "vfs.commit")]
    async fn commit(&self) -> RpcResult<bool>;

    #[method(name = "zenith.engine.stage")]
    async fn stage(&self, tx_id: String, intent: MutationIntent) -> RpcResult<StageResult>;

    #[method(name = "zenith.engine.stage_batch")]
    async fn stage_batch(&self, tx_id: String, zenith_id: ZenithId, styles: HashMap<String, String>) -> RpcResult<StageResult>;


    #[method(name = "vfs.stage_universal")]
    async fn stage_universal(
        &self,
        tx_id: String,
        signature: crate::vfs::SelectionSignature,
        property: String,
        value: String,
        project_root: String,
    ) -> RpcResult<StageResult>;

    #[method(name = "zenith.engine.rollback")]
    async fn rollback(&self, tx_id: String) -> RpcResult<bool>;

    #[method(name = "zenith.engine.preview")]
    async fn preview(&self, tx_id: String, intent: MutationIntent) -> RpcResult<bool>;

    #[method(name = "zenith.engine.commit")]
    async fn engine_commit(&self, zenith_id: ZenithId) -> RpcResult<bool>;

    #[method(name = "zenith.engine.toggle_surgical")]
    async fn toggle_surgical(&self) -> RpcResult<bool>;

    #[method(name = "vfs.undo")]
    async fn undo(&self) -> RpcResult<bool>;

    #[method(name = "vfs.redo")]
    async fn redo(&self) -> RpcResult<bool>;

    #[method(name = "mock.set_override")]
    async fn set_mock_override(
        &self,
        component_id: ZenithId,
        state_name: String,
        value: String,
    ) -> RpcResult<bool>;

    #[method(name = "telemetry.get_token_usage")]
    async fn get_token_usage(&self) -> RpcResult<u64>;

    #[method(name = "vfs.get_diff")]
    async fn get_diff(&self, zenith_id: ZenithId) -> RpcResult<String>;

    #[method(name = "sidecar/status")]
    async fn sidecar_status(&self) -> RpcResult<serde_json::Value>;

    #[method(name = "zenith.session.get_status")]
    async fn get_session_status(&self) -> RpcResult<Option<String>>;

    #[method(name = "sidecar.prune_memory")]
    async fn prune_memory(&self) -> RpcResult<bool>;

    #[method(name = "zenith.registry.register")]
    async fn register_ghosts(&self, entries: Vec<GhostEntry>) -> RpcResult<bool>;

    #[method(name = "zenith.registry.unregister")]
    async fn unregister_ghosts(&self, ids: Vec<ZenithId>) -> RpcResult<bool>;

    #[method(name = "zenith.registry.clear_file")]
    async fn clear_file(&self, file_path: String) -> RpcResult<bool>;

    /// Change #12: Sandbox Lifecycle Management
    #[method(name = "zenith.sandbox.start")]
    async fn start_sandbox(&self, target_port: u16, listen_port: u16) -> RpcResult<bool>;

    #[method(name = "zenith.sandbox.stop")]
    async fn stop_sandbox(&self, listen_port: u16) -> RpcResult<bool>;

    #[method(name = "vfs.harden_wal")]
    async fn harden_wal(&self) -> RpcResult<bool>;
}

#[derive(Clone)]
pub struct ZenithRpc {
    state: Arc<SharedState>,
    hmr_tx: tokio::sync::broadcast::Sender<String>,
}

impl ZenithRpc {
    pub fn new(state: Arc<SharedState>, hmr_tx: tokio::sync::broadcast::Sender<String>) -> Self {
        Self { state, hmr_tx }
    }
}

#[async_trait::async_trait]
impl ZenithApiServer for ZenithRpc {
    async fn select_element(&self, ghost_id: ZenithId) -> RpcResult<Option<GhostEntry>> {
        let registry = self.state.ghost_registry.read().await;
        if let Some(entry) = registry.lookup(&ghost_id) {
            let hash = fnv1a_hash_u64(&ghost_id);
            let mut bucket = self.state.id_reverse_map.entry(hash).or_insert_with(SmallVec::new);
            if !bucket.contains(&ghost_id) {
                bucket.push(ghost_id.clone());
            }
            Ok(Some(entry.clone()))
        } else {
            Ok(None)
        }
    }

    async fn hover_element(&self, _ghost_id: ZenithId) -> RpcResult<bool> {
        Ok(true)
    }

    async fn check_design(&self, _ghost_id: ZenithId, props: HashMap<String, String>) -> RpcResult<AuditReport> {
        let fg = props.get("color").map(|s| s.as_str()).unwrap_or("#00F0FF");
        let bg = props.get("backgroundColor").map(|s| s.as_str()).unwrap_or("#050505");
        Ok(AgentAuditor::check_contrast(fg, bg))
    }

    async fn toggle_view(&self, original: bool) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        vfs.set_view_mode(if original { ViewMode::Original } else { ViewMode::Shadow });
        Ok(true)
    }

    async fn persist(&self) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        let project_root = self.state.project_root.clone();
        vfs.persist(&project_root).map_err(internal_error)?;
        Ok(true)
    }

    async fn update_layout(&self, rects: HashMap<String, Rect>) -> RpcResult<u64> {
        Ok(LayoutAuditor::compute_layout_hash(&rects))
    }

    async fn commit(&self) -> RpcResult<bool> {
        tracing::info!("[RPC] vfs.commit reached");
        let mut vfs = self.state.vfs.write().await;
        if vfs.all_transactions_are_drafts() { return Ok(false); }
        let project_root = self.state.project_root.clone();
        vfs.persist(&project_root).map_err(internal_error)?;
        Ok(true)
    }

    async fn stage(&self, tx_id: String, intent: MutationIntent) -> RpcResult<StageResult> {
        tracing::info!(tx_id, ?intent, "[RPC] zenith.engine.stage reached");
        if let Some(prev) = self.state.rpc_history.get(&tx_id) {
            return Ok(prev.clone());
        }
        let tx = uuid::Uuid::parse_str(&tx_id).map_err(|e| internal_error(anyhow!(e)))?;
        let mut vfs = self.state.vfs.write().await;
        let project_root = self.state.project_root.clone();
        let (result, new_id) = vfs.stage_mutation(tx, intent, &project_root).map_err(internal_error)?;
        let response = match result {
            TransformResult::NoConflict => StageResult::Success { new_zenith_id: new_id },
            TransformResult::HumanReview { .. } => StageResult::Conflict(result),
            TransformResult::AutoMerge { .. } => StageResult::Success { new_zenith_id: new_id },
        };
        self.state.rpc_history.insert(tx_id, response.clone());
        Ok(response)
    }

    async fn stage_batch(&self, tx_id: String, zenith_id: ZenithId, styles: HashMap<String, String>) -> RpcResult<StageResult> {
        tracing::info!(tx_id, %zenith_id, ?styles, "[RPC] zenith.engine.stage_batch reached");
        if let Some(prev) = self.state.rpc_history.get(&tx_id) {
            return Ok(prev.clone());
        }
        let tx = uuid::Uuid::parse_str(&tx_id).map_err(|e| internal_error(anyhow!(e)))?;

        let intent = MutationIntent::BatchPropertyChange {
            element: zenith_id,
            styles,
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        };

        let mut vfs = self.state.vfs.write().await;
        let project_root = self.state.project_root.clone();
        let (result, new_id) = vfs.stage_mutation(tx, intent, &project_root).map_err(internal_error)?;
        
        let response = match result {
            TransformResult::NoConflict => StageResult::Success { new_zenith_id: new_id },
            TransformResult::HumanReview { .. } => StageResult::Conflict(result),
            TransformResult::AutoMerge { .. } => StageResult::Success { new_zenith_id: new_id },
        };
        self.state.rpc_history.insert(tx_id, response.clone());
        Ok(response)
    }


    async fn stage_universal(
        &self,
        tx_id: String,
        signature: crate::vfs::SelectionSignature,
        property: String,
        value: String,
        project_root: String,
    ) -> RpcResult<StageResult> {
        let tx = uuid::Uuid::parse_str(&tx_id).map_err(|e| internal_error(anyhow!(e)))?;
        let mut vfs = self.state.vfs.write().await;
        let project_root_path = std::path::PathBuf::from(project_root);
        vfs.stage_universal(tx, signature, property, value, &project_root_path).map_err(internal_error)?;
        Ok(StageResult::Success { new_zenith_id: None })
    }

    async fn rollback(&self, tx_id: String) -> RpcResult<bool> {
        let tx = uuid::Uuid::parse_str(&tx_id).map_err(|e| internal_error(anyhow!(e)))?;
        let mut vfs = self.state.vfs.write().await;
        vfs.rollback(tx);
        Ok(true)
    }

    async fn preview(&self, _tx_id: String, _intent: MutationIntent) -> RpcResult<bool> {
        Ok(true)
    }

    async fn engine_commit(&self, zenith_id: ZenithId) -> RpcResult<bool> {
        tracing::info!(?zenith_id, "[RPC] zenith.engine.commit reached (v3.11 hardening)");
        let mut vfs = self.state.vfs.write().await;
        if vfs.all_transactions_are_drafts() { return Ok(false); }
        let project_root = self.state.project_root.clone();
        vfs.persist(&project_root).map_err(internal_error)?;
        Ok(true)
    }

    async fn toggle_surgical(&self) -> RpcResult<bool> {
        let mut mode = self.state.surgical_mode.write().await;
        *mode = !*mode;
        Ok(*mode)
    }

    async fn undo(&self) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        Ok(vfs.visual_undo().is_some())
    }

    async fn redo(&self) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        Ok(vfs.visual_redo().is_some())
    }

    async fn set_mock_override(&self, _id: ZenithId, _state: String, _val: String) -> RpcResult<bool> {
        Ok(true)
    }

    async fn get_token_usage(&self) -> RpcResult<u64> {
        Ok(0)
    }

    async fn get_diff(&self, _id: ZenithId) -> RpcResult<String> {
        Ok("".to_string())
    }

    async fn sidecar_status(&self) -> RpcResult<serde_json::Value> {
        Ok(serde_json::json!({ "status": "active", "version": "0.1.0" }))
    }

    async fn get_session_status(&self) -> RpcResult<Option<String>> {
        Ok(None)
    }

    async fn prune_memory(&self) -> RpcResult<bool> {
        Ok(true)
    }

    async fn register_ghosts(&self, entries: Vec<GhostEntry>) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        
        // v3.10 Fix: Invalidate cache for all affected files to prevent proxy staleness
        let mut affected_files = std::collections::HashSet::new();
        for entry in &entries {
            affected_files.insert(std::path::PathBuf::from(&entry.file));
        }
        
        for file in affected_files {
            vfs.load_file_from_disk(&file).ok(); // Sync VFS with latest disk state (Vite output)
        }

        vfs.ghost_registry.register_entries(entries);
        Ok(true)
    }

    async fn unregister_ghosts(&self, ids: Vec<ZenithId>) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        vfs.ghost_registry.remove_entries(&ids);
        Ok(true)
    }

    async fn clear_file(&self, file_path: String) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        vfs.ghost_registry.clear_for_file(&file_path);
        Ok(true)
    }

    async fn start_sandbox(&self, target_port: u16, listen_port: u16) -> RpcResult<bool> {
        // [W12] Lifecycle Hardening: If a proxy already exists on this port, 
        // we MUST terminate it before starting a new one. This prevents
        // port-drifting (3005 -> 3006) and ensures the webview always hits
        // the correct target.
        if let Some((_, handle)) = self.state.active_sandboxes.remove(&listen_port) {
            handle.abort();
            info!("[RPC] Replaced existing sandbox on port {}", listen_port);
            // Small Sleep to allow OS to release the port socket
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        }

        let proxy = crate::proxy::sandbox::SandboxProxy::new(target_port);
        let handle = tokio::spawn(async move {
            if let Err(e) = proxy.start(listen_port).await {
                tracing::error!("[Sandbox] Proxy failure on port {}: {}", listen_port, e);
            }
        });

        self.state.active_sandboxes.insert(listen_port, handle);
        info!("[RPC] Started Sandbox Latch: {} -> {}", target_port, listen_port);
        Ok(true)
    }

    async fn stop_sandbox(&self, listen_port: u16) -> RpcResult<bool> {
        if let Some((_, handle)) = self.state.active_sandboxes.remove(&listen_port) {
            handle.abort();
            info!("[RPC] Stopped Sandbox on port {}", listen_port);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn harden_wal(&self) -> RpcResult<bool> {
        let mut vfs = self.state.vfs.write().await;
        vfs.truncate_wal().map_err(internal_error)?;
        info!("[RPC] vfs.harden_wal: WAL truncated successfully");
        Ok(true)
    }
}

pub async fn start_rpc_server(
    port: u16,
    state: Arc<SharedState>,
    hmr_tx: tokio::sync::broadcast::Sender<String>
) -> anyhow::Result<()> {
    let addr = format!("127.0.0.1:{}", port);
    let server = ServerBuilder::default().build(addr.clone()).await?;
    
    let rpc_state = ZenithRpc::new(state.clone(), hmr_tx.clone());
    let mut module = rpc_state.into_rpc();

    // v3.10 Infrastructure Hardening: Direct HMR Broadcast channel
    // We register a manual subscription that broadcasts the "reload" signal
    // directly to all connected clients (IDE and Vite plugin).
    module.register_subscription(
        "zenith.hmr.subscribe", 
        "zenith.hmr.update", 
        "zenith.hmr.unsubscribe", 
        move |_: Params, pending_sink: jsonrpsee::server::PendingSubscriptionSink, _ctx, _ext| {
            let mut rx = hmr_tx.subscribe();
            async move {
                if let Ok(sink) = pending_sink.accept().await {
                    while let Ok(msg) = rx.recv().await {
                        if let Ok(sub_msg) = jsonrpsee::SubscriptionMessage::from_json(&msg) {
                            if sink.send(sub_msg).await.is_err() {
                                break;
                            }
                        }
                    }
                }
            }
        }
    )?;

    info!("ZENITH_RPC: Server listening on ws://{} (HMR Active)", addr);
    let handle = server.start(module);
    handle.stopped().await;
    Ok(())
}

fn internal_error(e: anyhow::Error) -> jsonrpsee::types::ErrorObjectOwned {
    jsonrpsee::types::ErrorObjectOwned::owned(
        jsonrpsee::types::error::ErrorCode::InternalError.code(),
        e.to_string(),
        None::<()>,
    )
}
