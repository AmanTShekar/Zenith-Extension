Param(
    [string]$WorkspaceRoot = "c:\Users\Asus\Desktop\ve"
)

$SidecarDir = Join-Path $WorkspaceRoot "zenith-sidecar"
$DemoDir = Join-Path $WorkspaceRoot "zenith-demo"

Write-Host "--- Zenith Surgical Engine Rebuild ---" -ForegroundColor Cyan

# 1. Kill any running sidecar
Write-Host "[1/4] Stopping zenith-sidecar..."
Stop-Process -Name "zenith-sidecar" -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

# 2. Rebuild sidecar
Write-Host "[2/4] Compiling Rust sidecar..."
Set-Location $SidecarDir
cargo build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Cargo build failed!"
    exit 1
}

# 3. Rebuild Vite Plugin (ensuring Ghost-ID fix is in dist/)
Write-Host "[3/4] Rebuilding Vite Plugin..."
Set-Location (Join-Path $WorkspaceRoot "zenith-vite-plugin")
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vite plugin build failed!"
    exit 1
}

# 4. Cleanup WAL/SAB for a clean test start (Optional but recommended for state testing)
Write-Host "[4/4] Cleaning session state..."
$ZenithData = Join-Path $DemoDir ".zenith"
Remove-Item (Join-Path $ZenithData "stage.wal") -ErrorAction SilentlyContinue
Remove-Item (Join-Path $ZenithData "sidecar_live.log") -ErrorAction SilentlyContinue

Write-Host "--- Rebuild Complete! Restarting Sidecar... ---" -ForegroundColor Green
# The extension will auto-restart it, or we can launch it here for immediate testing
