
# Zenith Designer — Final Deployment Script
# Run this script to finalize the push to GitHub using your local credentials.

Write-Host "🚀 Preparing final Zenith deployment..." -ForegroundColor Cyan

# Ensure we are in the monorepo root
$root = Get-Location
Write-Host "📍 Root: $root"

# Stage all sanitized files
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "📦 Committing final sanitization changes..." -ForegroundColor Yellow
    git commit -m "feat: Zenith Designer - Finalized Initial Release (Sanitized)"
} else {
    Write-Host "✅ Everything already committed." -ForegroundColor Green
}

# Final Force Push
Write-Host "🔥 Initiating Force Push to GitHub..." -ForegroundColor Magenta
Write-Host "⚠️  Note: This will replace the remote history with the sanitized version." -ForegroundColor Gray
git push origin main --force

Write-Host "🎉 Deployment Complete! Check https://github.com/AmanTShekar/Zenith-Extension" -ForegroundColor Green
