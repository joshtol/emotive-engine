@echo off
echo Setting up GitHub token for NPM publishing...
echo.
echo Please paste your GitHub Personal Access Token:
set /p GITHUB_TOKEN=

echo.
echo Testing authentication...
npm whoami --registry https://npm.pkg.github.com

echo.
echo Ready to publish! Run: npm publish
pause