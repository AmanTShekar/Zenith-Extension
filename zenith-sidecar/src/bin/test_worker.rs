use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Write};

fn main() {
    let mut child = Command::new("cmd")
        .args(&["/c", "node", "C:\\Users\\Asus\\Desktop\\ve\\zenith-vite-plugin\\dist\\bin\\surgical-cli.js"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());

    // Send payload
    let source = std::fs::read_to_string("C:\\Users\\Asus\\Desktop\\ve\\zenith-demo\\src\\App.tsx").unwrap();
    let payload = serde_json::json!({
        "id": "123",
        "source": source,
        "instructions": {
            "zenithId": "src/App.tsx:div.0:div.2:section.0:h2.0",
            "textContent": "hwllo"
        }
    });

    let mut data = serde_json::to_string(&payload).unwrap();
    data.push('\n');
    stdin.write_all(data.as_bytes()).unwrap();

    let mut resp = String::new();
    stdout.read_line(&mut resp).unwrap();
    println!("RESP: {}", resp);
}
