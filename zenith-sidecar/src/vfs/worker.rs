use std::process::{Child, Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use anyhow::{anyhow, Result, Context};
use serde_json::json;

pub struct SurgicalWorker {
    child: Child,
    stdin: std::process::ChildStdin,
    stdout: BufReader<std::process::ChildStdout>,
}

impl SurgicalWorker {
    pub fn spawn() -> Result<Self> {
        let mut child = if cfg!(windows) {
            Command::new("cmd")
                .args(&["/c", "node", "C:\\Users\\Asus\\Desktop\\ve\\zenith-vite-plugin\\dist\\bin\\surgical-cli.js"])
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()?
        } else {
            Command::new("node")
                .arg("/c/Users/Asus/Desktop/ve/zenith-vite-plugin/dist/bin/surgical-cli.js")
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()?
        };

        let stdin = child.stdin.take().ok_or_else(|| anyhow!("Failed to take stdin"))?;
        let stdout = BufReader::new(child.stdout.take().ok_or_else(|| anyhow!("Failed to take stdout"))?);

        Ok(Self { child, stdin, stdout })
    }

    pub fn call(&mut self, source: &str, instructions: &serde_json::Value) -> Result<String> {
        let request_id = uuid::Uuid::new_v4().to_string();
        let envelope = json!({
            "id": request_id,
            "source": source,
            "instructions": instructions
        });

        // 1. Send request
        let mut payload = serde_json::to_string(&envelope)?;
        payload.push('\n');
        self.stdin.write_all(payload.as_bytes())?;
        self.stdin.flush()?;

        // 2. Read response
        let mut response_line = String::new();
        self.stdout.read_line(&mut response_line)?;
        
        let response: serde_json::Value = serde_json::from_str(&response_line)
            .context("Surgical Worker returned invalid JSON")?;

        if let Some(err) = response.get("error").and_then(|e| e.as_str()) {
            return Err(anyhow!("Surgical Engine Error: {}", err));
        }

        let patched = response.get("patched").and_then(|p| p.as_str())
            .ok_or_else(|| anyhow!("Surgical Worker response missing 'patched' field"))?;

        Ok(patched.to_string())
    }
}

// Ensure the child process is killed when the worker is dropped
impl Drop for SurgicalWorker {
    fn drop(&mut self) {
        let _ = self.child.kill();
    }
}
