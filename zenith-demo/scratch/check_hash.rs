fn workspace_hash(canonical: &str) -> u32 {
    let mut h: u32 = 2166136261;
    let normalized = canonical.to_lowercase().replace('\\', "/");
    for byte in normalized.bytes() {
        h ^= byte as u32;
        h = h.wrapping_mul(16777619);
    }
    h
}

fn main() {
    let path = r"C:\Users\Asus\Desktop\ve\zenith-demo";
    let hash = workspace_hash(path);
    println!("{:08x}", hash);
}
