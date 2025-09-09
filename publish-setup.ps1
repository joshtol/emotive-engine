# PowerShell script to set up GitHub token for NPM publishing
Write-Host "Setting up GitHub token for NPM publishing..." -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "Please paste your GitHub Personal Access Token" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for current session
$env:GITHUB_TOKEN = $plainToken

Write-Host ""
Write-Host "Testing authentication..." -ForegroundColor Yellow
npm whoami --registry https://npm.pkg.github.com

Write-Host ""
Write-Host "Ready to publish! Run: npm publish" -ForegroundColor Green
Read-Host "Press Enter to continue"