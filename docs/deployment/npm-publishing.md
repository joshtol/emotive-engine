# NPM Publishing Guide for Emotive Engine

**Updated for Open Source (MIT License) - Tailwind Model**

This guide covers publishing the **open-source** `@emotive/engine` package to npmjs.org.

For the **commercial** `@emotive/ui-pro` package, see [UI-PRO-PUBLISHING.md](./UI-PRO-PUBLISHING.md).

---

## Package Structure (Post-Open Source)

| Package | License | Registry | Access |
|---------|---------|----------|--------|
| **@emotive/engine** | MIT | npmjs.org | Public |
| **@emotive/ui-pro** | Commercial | Private repo | Paid customers only |

---

## Initial Setup (One Time)

### 1. Create npmjs.com Account
1. Go to https://www.npmjs.com/signup
2. Create account (free)
3. Verify email

### 2. Login via CLI
```bash
npm login
# Enter username, password, email
# Verify with OTP if enabled
```

### 3. Verify Access
```bash
npm whoami
# Should show your npm username
```

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

### 1. Install the package (no auth needed - it's public!)
```bash
npm install @emotive/engine
# OR
npm install @joshtol/emotive-engine
```

### 2. Import in your code
```javascript
import EmotiveMascot from '@emotive/engine';

// Initialize
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    emotion: 'joy'
});

mascot.start();
```

### 3. For premium mascots (optional)
```bash
# Purchase license at emotive-engine.com/ui-pro
# Then clone private repo or download zip
git clone https://github.com/joshtol/emotive-ui-pro.git

# Use premium mascots
import { robotMascot } from './emotive-ui-pro/mascots/robot';
```

## Package Contents

When published, `@emotive/engine` includes:
- `/dist` - Production builds (UMD, ESM, CJS)
- `/src` - Source code (completely visible - it's MIT!)
- `/types` - TypeScript definitions
- `/assets` - Logo SVGs
- `README.md` - Documentation
- `LICENSE.md` - MIT License

Excluded from package:
- Demo HTML files (`/site`)
- Test files (`*.test.js`)
- Build configuration (`rollup.config.js`)
- Git files (`.git`, `.gitignore`)
- Internal docs (`/docs/internal`)

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

**@emotive/engine** is MIT licensed - completely free and open source!

**@emotive/ui-pro** (premium mascots) is commercially licensed - see UI-PRO-PUBLISHING.md.