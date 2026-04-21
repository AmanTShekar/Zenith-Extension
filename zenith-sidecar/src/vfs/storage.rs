use std::path::{Path, PathBuf};
// use std::collections::HashMap;
use std::sync::Arc;
use anyhow::{Result, anyhow};
use tracing::{info, warn, debug};
use crate::vfs::FileSnapshot;

pub struct StorageManager;

impl StorageManager {
    /// Persist all staged transactions to the real filesystem.
    pub fn persist(
        project_root: &Path,
        merged_cache: &im::HashMap<PathBuf, Arc<String>>,
        base: &im::HashMap<PathBuf, Arc<FileSnapshot>>,
    ) -> Result<()> {
        let project_root = std::fs::canonicalize(project_root)?;
        if merged_cache.is_empty() {
            info!("  Nothing to persist (staging buffer empty)");
            return Ok(());
        }

        for (file_path, content) in merged_cache.iter() {
                // Skips write if content matches base to save I/O
                if let Some(base_file) = base.get(file_path) {
                    if base_file.content == **content {
                        debug!("  ⏩ Skipping {:?} (content identical to base)", file_path);
                        continue;
                    }
                }
                
                let full_path = project_root.join(&file_path);
                Self::validate_path(&full_path, &project_root)?;

                if let Some(parent) = full_path.parent() {
                    std::fs::create_dir_all(parent)?;
                }

                Self::write_with_retry(&full_path, content, &file_path)?;
        }
        Ok(())
    }

    fn validate_path(full_path: &Path, project_root: &Path) -> Result<()> {
        let norm_full = full_path.to_string_lossy().replace("\\", "/").replace("//?/", "");
        let norm_root = project_root.to_string_lossy().replace("\\", "/").replace("//?/", "");

        let norm_full_cmp = if norm_full.ends_with('/') { norm_full.to_string() } else { format!("{}/", norm_full) };
        let norm_root_cmp = if norm_root.ends_with('/') { norm_root.to_string() } else { format!("{}/", norm_root) };

        let is_inside = if cfg!(windows) {
            norm_full_cmp.to_lowercase().starts_with(&norm_root_cmp.to_lowercase())
        } else {
            norm_full_cmp.starts_with(&norm_root_cmp)
        };

        if !is_inside && !norm_full.to_lowercase().starts_with(&norm_root.to_lowercase()) {
            warn!("🔥 Security violation: write outside project root: {}", norm_full);
            return Err(anyhow!("Security violation: path {} is outside root", norm_full));
        }
        Ok(())
    }

    fn write_with_retry(full_path: &Path, content: &str, relative_path: &Path) -> Result<()> {
        let mut attempts = 0;
        let mut success = false;
        while attempts < 5 && !success {
            match std::fs::OpenOptions::new()
                .write(true)
                .truncate(true)
                .create(true)
                .open(full_path) 
            {
                Ok(mut file) => {
                    use std::io::Write;
                    file.write_all(content.as_bytes())?;
                    file.sync_all()?;
                    success = true;
                }
                Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied || e.raw_os_error() == Some(5) => {
                    attempts += 1;
                    warn!("  ⚠️ File lock detected on {:?}. Retrying in 200ms...", relative_path);
                    std::thread::sleep(std::time::Duration::from_millis(200));
                }
                Err(e) => return Err(anyhow!("File I/O error: {}", e)),
            }
        }
        if !success {
            return Err(anyhow!("Failed to persist after multiple retries due to file locks."));
        }
        Ok(())
    }
}
