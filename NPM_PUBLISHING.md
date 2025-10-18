# NPM Publishing Guide for Emotive Engine

## Initial Setup (One Time)

### 1. Generate GitHub Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `npm-emotive-engine`
4. Required scopes:
   - `write:packages` - Upload packages
   - `read:packages` - Download packages
   - `repo` - Access private repositories
5. Copy the token immediately!

### 2. Configure Authentication

#### Windows (Command Prompt):
```cmd
set GITHUB_TOKEN=your_token_here
npm whoami --registry https://npm.pkg.github.com
```

#### Windows (PowerShell):
```powershell
$env:GITHUB_TOKEN = "your_token_here"
npm whoami --registry https://npm.pkg.github.com
```

#### macOS/Linux:
```bash
export GITHUB_TOKEN=your_token_here
npm whoami --registry https://npm.pkg.github.com
```

Or run the provided setup script:
- Windows: `publish-setup.bat` or `publish-setup.ps1`

## Publishing

### First Time Publishing
```bash
npm publish
```

### Version Updates
```bash
# Patch version (2.1.0 → 2.1.1) - Bug fixes
npm run publish:patch

# Minor version (2.1.0 → 2.2.0) - New features
npm run publish:minor

# Major version (2.1.0 → 3.0.0) - Breaking changes
npm run publish:major
```

## Using the Package in Other Projects

### 1. Create .npmrc in your project
```
@joshtol:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. Install the package
```bash
npm install @joshtol/emotive-engine
```

### 3. Import in your code
```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

// Initialize
const mascot = new EmotiveMascot({
    containerEl: document.getElementById('mascot-container'),
    emotion: 'joy'
});
```

## Package Contents

When published, the package includes:
- `/dist` - Production builds
- `/src` - Source code
- `/types` - TypeScript definitions
- `/assets` - Logo SVGs
- `README.md` - Documentation
- `LICENSE` - Custom license

Excluded from package:
- Demo HTML files
- Test files
- Build configuration
- Git files
- DEFENSIVE_PUBLICATION.md

## Troubleshooting

### Authentication Failed
- Ensure GITHUB_TOKEN is set correctly
- Token must have `write:packages` and `repo` scopes
- Username must match package scope (@joshtol)

### 404 Not Found
- Package name must match: @joshtol/emotive-engine
- Registry must be: https://npm.pkg.github.com

### Version Already Exists
- Use npm version commands to bump version
- Cannot republish same version number

## Security Notes

- **NEVER** commit your token to git
- **NEVER** share your token
- Regenerate token if compromised
- Use environment variables or CI/CD secrets

## License

This is proprietary software. See LICENSE file for details.
Unauthorized use, reproduction, or distribution is strictly prohibited.