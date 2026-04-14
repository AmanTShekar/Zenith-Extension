use std::path::{Path, PathBuf};
pub mod sandbox;
use serde::{Deserialize, Serialize};
use anyhow::Result;
use tracing::{info, error, debug};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[cfg(unix)]
use tokio::net::{UnixListener, UnixStream};

#[cfg(windows)]
use tokio::net::windows::named_pipe::{ServerOptions, NamedPipeServer};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ProxyRequest {
    GetFile { path: String },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ProxyResponse {
    Content { data: String },
    NotFound,
    Error { message: String },
}

pub enum SidecarListener {
    #[cfg(unix)]
    Unix(UnixListener),
    #[cfg(windows)]
    Windows(NamedPipeServer, String),
}

pub enum SidecarStream {
    #[cfg(unix)]
    Unix(UnixStream),
    #[cfg(windows)]
    Windows(NamedPipeServer),
}

impl SidecarStream {
    pub async fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        match self {
            #[cfg(unix)]
            SidecarStream::Unix(s) => s.read(buf).await,
            #[cfg(windows)]
            SidecarStream::Windows(s) => s.read(buf).await,
        }
    }
    pub async fn write_all(&mut self, buf: &[u8]) -> std::io::Result<()> {
        match self {
            #[cfg(unix)]
            SidecarStream::Unix(s) => s.write_all(buf).await,
            #[cfg(windows)]
            SidecarStream::Windows(s) => s.write_all(buf).await,
        }
    }
}

pub async fn bind_sidecar_socket(workspace_hash: u32, _workspace_root: &Path) -> std::io::Result<SidecarListener> {
    #[cfg(target_os = "linux")]
    return bind_abstract_linux(workspace_hash).await;

    #[cfg(target_os = "macos")]
    return bind_lockfile_macos(workspace_hash, workspace_root).await;

    #[cfg(windows)]
    return bind_named_pipe_windows(workspace_hash).await;
}

#[cfg(target_os = "linux")]
async fn bind_abstract_linux(hash: u32) -> std::io::Result<SidecarListener> {
    use std::os::unix::io::FromRawFd;

    let name = format!("zenith-{:08x}", hash);
    let mut addr = unsafe { std::mem::zeroed::<libc::sockaddr_un>() };
    addr.sun_family = libc::AF_UNIX as u16;

    let bytes = name.as_bytes();
    unsafe {
        addr.sun_path[0] = 0;
        std::ptr::copy_nonoverlapping(
            bytes.as_ptr() as *const libc::c_char,
            addr.sun_path.as_mut_ptr().add(1),
            bytes.len(),
        );
    }

    let fd = unsafe {
        libc::socket(libc::AF_UNIX, libc::SOCK_STREAM | libc::SOCK_CLOEXEC, 0)
    };
    if fd < 0 { return Err(std::io::Error::last_os_error()); }

    let addr_len = (std::mem::offset_of!(libc::sockaddr_un, sun_path)
                    + 1 + bytes.len()) as libc::socklen_t;
    let rc = unsafe {
        libc::bind(fd, &addr as *const _ as *const libc::sockaddr, addr_len)
    };
    if rc < 0 {
        let e = std::io::Error::last_os_error();
        unsafe { libc::close(fd); }
        if e.kind() == std::io::ErrorKind::AddrInUse {
            return Err(std::io::Error::new(
                std::io::ErrorKind::AddrInUse,
                "ZENITH_ALREADY_RUNNING"
            ));
        }
        return Err(e);
    }
    unsafe { libc::listen(fd, 128) };

    let std_listener = unsafe { std::os::unix::net::UnixListener::from_raw_fd(fd) };
    std_listener.set_nonblocking(true)?;
    
    println!("ZENITH_SOCKET:\0{}", name);
    std::io::Write::flush(&mut std::io::stdout()).ok();
    
    Ok(SidecarListener::Unix(tokio::net::UnixListener::from_std(std_listener)?))
}

struct LockfileGuard(std::path::PathBuf);

impl Drop for LockfileGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.0);
    }
}

#[cfg(target_os = "macos")]
async fn bind_lockfile_macos(hash: u32, _workspace_root: &Path) -> std::io::Result<SidecarListener> {
    let dir = std::env::temp_dir();
    let sock_path = dir.join(format!("zenith-{:08x}.sock", hash));
    let lock_path = dir.join(format!("zenith-{:08x}.lock", hash));

    let lock = match std::fs::OpenOptions::new()
        .write(true).create_new(true).open(&lock_path)
    {
        Ok(f) => f,
        Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
            let pid = std::fs::read_to_string(&lock_path).ok()
                .and_then(|s| s.trim().parse::<u32>().ok());
            let alive = pid.map(|p| unsafe { libc::kill(p as libc::pid_t, 0) } == 0)
                          .unwrap_or(false);
            if alive {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::AddrInUse, "ZENITH_ALREADY_RUNNING"
                ));
            }
            let _ = std::fs::remove_file(&lock_path);
            std::fs::OpenOptions::new().write(true).create_new(true).open(&lock_path)?
        }
        Err(e) => return Err(e),
    };

    use std::io::Write;
    let mut lock_ref = lock;
    let _ = writeln!(&mut lock_ref, "{}", std::process::id());

    let _guard = LockfileGuard(lock_path.clone());

    let _ = std::fs::remove_file(&sock_path);
    let listener = UnixListener::bind(&sock_path)?;
    // _guard drops here -> lock_path is automatically removed, even on bind failure

    println!("ZENITH_SOCKET:{}", sock_path.display());
    std::io::Write::flush(&mut std::io::stdout()).ok();

    Ok(SidecarListener::Unix(listener))
}

#[cfg(windows)]
async fn bind_named_pipe_windows(hash: u32) -> std::io::Result<SidecarListener> {
    let final_path = format!(r"\\.\pipe\zenith-{:08x}", hash);
    match ServerOptions::new()
        .first_pipe_instance(true)
        .create(&final_path)
    {
        Ok(server) => {
            println!("ZENITH_SOCKET:{}", final_path);
            std::io::Write::flush(&mut std::io::stdout()).ok();
            Ok(SidecarListener::Windows(server, final_path))
        }
        Err(_) => Err(std::io::Error::new(
            std::io::ErrorKind::AddrInUse, "ZENITH_ALREADY_RUNNING"
        )),
    }
}

pub struct GhostProxyServer {
    hash: u32,
    root: PathBuf,
}

impl GhostProxyServer {
    pub fn new(hash: u32, root: PathBuf) -> Self {
        Self { hash, root }
    }

    pub async fn run<F, Fut>(&self, handler: F) -> Result<()>
    where
        F: Fn(PathBuf) -> Fut + Clone + Send + Sync + 'static,
        Fut: std::future::Future<Output = Option<String>> + Send,
    {
        let mut listener = bind_sidecar_socket(self.hash, &self.root).await?;
        info!("Ghost-Proxy listening on IPC socket (hash: {:08x})", self.hash);

        loop {
            let stream = match &mut listener {
                #[cfg(unix)]
                SidecarListener::Unix(unix_listener) => {
                    let (stream, _) = unix_listener.accept().await?;
                    SidecarStream::Unix(stream)
                }
                #[cfg(windows)]
                SidecarListener::Windows(server, path) => {
                    server.connect().await?;
                    let mut new_server = ServerOptions::new()
                        .first_pipe_instance(false)
                        .create(path)?;
                    std::mem::swap(server, &mut new_server);
                    SidecarStream::Windows(new_server)
                }
            };

            let handler_clone = handler.clone();
            tokio::spawn(async move {
                if let Err(e) = Self::handle_client(stream, handler_clone).await {
                    let err_msg = e.to_string();
                    if err_msg.contains("Broken pipe") || err_msg.contains("pipe is being closed") {
                        debug!("Proxy client disconnected (normal)");
                    } else {
                        error!("Proxy client error: {}", e);
                    }
                }
            });
        }
    }

    async fn handle_client<F, Fut>(mut stream: SidecarStream, handler: F) -> Result<()>
    where
        F: Fn(PathBuf) -> Fut + Send,
        Fut: std::future::Future<Output = Option<String>> + Send,
    {
        let mut buffer = [0u8; 4096];
        let n = stream.read(&mut buffer).await?;
        if n == 0 { return Ok(()); }

        let request: ProxyRequest = serde_json::from_slice(&buffer[..n])?;

        match request {
            ProxyRequest::GetFile { path } => {
                let normalized = path.replace("\\", "/");
                let path_buf = PathBuf::from(normalized);
                let response = if let Some(content) = handler(path_buf).await {
                    ProxyResponse::Content { data: content }
                } else {
                    ProxyResponse::NotFound
                };

                let response_bytes = serde_json::to_vec(&response)?;
                stream.write_all(&response_bytes).await?;
            }
        }

        Ok(())
    }
}
