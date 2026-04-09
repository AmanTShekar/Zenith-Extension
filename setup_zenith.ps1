# Zenith v2.6 — Automated Setup Script
# This script installs all dependencies for the Extension, Plugin, and Demo.

Write-Host "--- Zenith v2.6 Surgical Onboarding ---" -ForegroundColor Cyan

# 1. Extension Setup
Write-Host "[1/3] Setting up VS Code Extension..."
Set-Location c:\Users\Asus\Desktop\ve\zenith-extension
npm install
npm run compile

# 2. Plugin Setup
Write-Host "[2/3] Setting up Vite Plugin..."
Set-Location c:\Users\Asus\Desktop\ve\zenith-plugin
npm install

# 3. Demo Project Setup
Write-Host "[3/3] Setting up Demo Project..."
Set-Location c:\Users\Asus\Desktop\ve\zenith-demo
npm install

Write-Host "--- SETUP COMPLETE ---" -ForegroundColor Green
Write-Host "Next Steps:"
Write-Host "1. Open 'zenith-extension' in VS Code and press F5."
Write-Host "2. In the new window, open 'zenith-demo' and run 'npm run dev'."
Write-Host "3. Click the Zenith Icon in the top-right toolbar."
