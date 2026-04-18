@echo off
echo.
echo ==========================================
echo   ZENITH DESIGNER - FINAL REPO LAUNCH
echo ==========================================
echo.
echo This script will push your sanitized code to GitHub.
echo You may be prompted for your GitHub password or token.
echo.

cd /d "c:\Users\Asus\Desktop\ve"

echo [1/3] Staging all files...
git add .

echo [2/3] Committing sanitized codebase...
git commit -m "feat: Zenith Designer - Finalized Initial Release (Sanitized)"

echo [3/3] Initiating Force Push to GitHub...
git push origin main --force

echo.
echo ==========================================
echo   DONE! Refresh https://github.com/AmanTShekar/Zenith-Extension
echo ==========================================
pause
