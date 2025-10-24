# Versioning & Release Policy

## Overview

Emotive Engine follows **Semantic Versioning 2.0.0** (semver.org) to communicate
the impact of changes clearly and predictably to our users.

---

## Semantic Versioning

### Version Format: `MAJOR.MINOR.PATCH`

```
Example: 2.5.1
         │ │ │
         │ │ └─── PATCH: Bug fixes, security patches
         │ └───── MINOR: New features, backward compatible
         └─────── MAJOR: Breaking changes, API redesigns
```

### Version Increment Rules

#### PATCH (2.5.1 → 2.5.2)

- **Bug fixes** that don't change the API
- **Security patches** (CVE fixes)
- **Performance improvements** that don't alter behavior
- **Documentation updates**
- **Internal refactoring** with no external impact

**Example Changes**:

```
✅ Fixed particle memory leak in Safari
✅ Resolved emotion transition timing bug
✅ Security patch for dependency vulnerability
✅ Performance optimization for mobile devices
```

**Compatibility**: 100% backward compatible

---

#### MINOR (2.5.1 → 2.6.0)

- **New features** that are backward compatible
- **New API methods** (additive changes only)
- **New emotions, gestures, or performances**
- **Deprecations** (with warnings, not removals)
- **Opt-in breaking changes** (via config flags)

**Example Changes**:

```
✅ Added new 'excited' emotion
✅ New morphTo() method for shape transformations
✅ Added WebGL rendering mode (opt-in)
✅ Deprecated setColor() in favor of setTheme()
```

**Compatibility**: 100% backward compatible (existing code continues to work)

---

#### MAJOR (2.5.1 → 3.0.0)

- **Breaking changes** to existing APIs
- **Removal of deprecated features**
- **Architectural redesigns**
- **Changed default behaviors**
- **Minimum version requirement changes** (Node.js, browsers)

**Example Changes**:

```
❌ Removed deprecated setColor() method
❌ Changed setEmotion() signature from (emotion, undertone) to (emotion, options)
❌ Minimum browser requirement increased to Chrome 90+
❌ Renamed EmotiveMascot class to EmotiveEngine
```

**Compatibility**: May require code changes (migration guide provided)

---

## Release Channels

### Stable Releases

**Purpose**: Production-ready releases for general use

**Naming**: `X.Y.Z` (e.g., `2.5.1`)

**Frequency**:

- PATCH: As needed (typically weekly for bug fixes)
- MINOR: Monthly or as features complete
- MAJOR: Annually or when breaking changes accumulated

**Quality Bar**:

- ✅ All tests passing (85%+ coverage)
- ✅ No known critical bugs
- ✅ Performance benchmarks met
- ✅ Documentation complete
- ✅ Backward compatibility verified (for minor/patch)

**Distribution**:

```bash
npm install @joshtol/emotive-engine@latest
# or
npm install @joshtol/emotive-engine@2.5.1
```

---

### Pre-release Versions

#### Beta Releases

**Purpose**: Feature-complete but needs real-world testing

**Naming**: `X.Y.Z-beta.N` (e.g., `3.0.0-beta.1`)

**Frequency**: Before major releases

**Quality Bar**:

- ✅ Feature-complete
- ⚠️ May have minor bugs
- ✅ API stable (no more breaking changes)

**Distribution**:

```bash
npm install @joshtol/emotive-engine@beta
npm install @joshtol/emotive-engine@3.0.0-beta.1
```

---

#### Alpha Releases

**Purpose**: Early access to upcoming features (unstable)

**Naming**: `X.Y.Z-alpha.N` (e.g., `3.0.0-alpha.3`)

**Frequency**: During active development of major features

**Quality Bar**:

- ⚠️ Experimental features
- ⚠️ API may change without notice
- ⚠️ Not for production use

**Distribution**:

```bash
npm install @joshtol/emotive-engine@alpha
```

---

#### Release Candidate (RC)

**Purpose**: Final testing before stable release

**Naming**: `X.Y.Z-rc.N` (e.g., `2.6.0-rc.1`)

**Frequency**: 1-2 weeks before stable release

**Quality Bar**:

- ✅ Production-ready quality
- ✅ All tests passing
- ✅ No known critical issues
- ✅ Documentation complete

**Distribution**:

```bash
npm install @joshtol/emotive-engine@next
npm install @joshtol/emotive-engine@2.6.0-rc.1
```

---

## Long-Term Support (LTS)

### LTS Policy

**Definition**: Major versions receive extended support for stability-critical
users

**Support Duration**:

- **Active Support**: 18 months after major release
    - New features, bug fixes, security patches
- **Maintenance Mode**: 18 months after active support ends
    - Security patches only, critical bug fixes
- **End of Life (EOL)**: No further updates

**Current LTS Versions**:

| Version | Release Date | Active Until | Maintenance Until | EOL Date   |
| ------- | ------------ | ------------ | ----------------- | ---------- |
| **2.x** | 2024-06-01   | 2025-12-01   | 2027-06-01        | 2027-06-01 |
| 1.x     | 2023-01-15   | 2024-07-15   | 2026-01-15        | EOL        |

**LTS Commitment**:

- ✅ Security patches backported to LTS versions
- ✅ Critical bug fixes
- ❌ No new features
- ❌ No non-critical bug fixes

---

## Deprecation Process

We follow a **minimum 6-month deprecation cycle** for breaking changes.

### Phase 1: Deprecation Warning (6+ months)

**Action**: Feature marked as deprecated but still functional

**Developer Experience**:

```javascript
// Console warning displayed
mascot.setColor('red');
// ⚠️  Warning: setColor() is deprecated and will be removed in v3.0.0.
//    Use setTheme({ primaryColor: 'red' }) instead.
//    See migration guide: https://docs.emotiveengine.com/migrate/v3
```

**Changelog Entry**:

```markdown
## [2.5.0] - 2024-10-15

### Deprecated

- `setColor()` method deprecated in favor of `setTheme()`
- Will be removed in v3.0.0 (target: 2025-04-15)
```

---

### Phase 2: Removal (Major Version)

**Action**: Feature removed entirely

**Developer Experience**:

```javascript
mascot.setColor('red');
// ❌ TypeError: mascot.setColor is not a function
```

**Changelog Entry**:

```markdown
## [3.0.0] - 2025-04-15

### BREAKING CHANGES

- Removed deprecated `setColor()` method
- Use `setTheme({ primaryColor: 'red' })` instead
```

**Migration Guide**: Published at `/docs/migration/v2-to-v3.md`

---

### Accelerated Deprecation (Security)

For **security-critical changes**, we may shorten the deprecation cycle to **30
days**.

**Example**:

```markdown
## [2.5.2] - 2024-11-01

### Security

- URGENT: Deprecated unsafe `evalExpression()` method due to RCE vulnerability
- Will be removed in v2.6.0 (30 days)
- Use `safeExpression()` instead
```

---

## Version Support Matrix

### Browser Support by Version

| Emotive Engine      | Chrome | Firefox | Safari | Edge | Last Updated |
| ------------------- | ------ | ------- | ------ | ---- | ------------ |
| **2.5.x** (Current) | 90+    | 88+     | 14+    | 90+  | 2024-10-15   |
| 2.4.x               | 85+    | 85+     | 13.1+  | 85+  | 2024-06-01   |
| 2.3.x               | 80+    | 80+     | 13+    | 80+  | 2024-01-15   |

### Node.js Support by Version

| Emotive Engine | Node.js | npm |
| -------------- | ------- | --- |
| **2.5.x**      | 14+     | 6+  |
| 2.4.x          | 12+     | 6+  |
| 2.3.x          | 12+     | 6+  |

---

## Release Schedule

### Cadence

- **Patch Releases**: As needed (weekly for bug fixes)
- **Minor Releases**: Monthly (first Monday)
- **Major Releases**: Annually (April)

### Release Windows

**Blackout Periods** (no releases except critical security):

- December 15 - January 5 (Holiday freeze)
- Thanksgiving week (US)
- Major conference weeks (as announced)

---

## Breaking Change Communication

When a major version with breaking changes is released, we provide:

### 1. Migration Guide

- Step-by-step upgrade instructions
- Code transformation examples
- API comparison table
- Common pitfalls and solutions

**Location**: `/docs/migration/vX-to-vY.md`

### 2. Automated Migration Tool (where possible)

```bash
npx @joshtol/emotive-migrate 2.x 3.x
# Automatically transforms your codebase
```

### 3. Codemods (for complex changes)

```bash
npx @joshtol/emotive-codemod v3-setTheme
# Transforms setColor() → setTheme()
```

### 4. Email Notification

- Sent to all users who opted in via npm
- Enterprise customers notified directly

### 5. Changelog Entry

- Detailed in `CHANGELOG.md`
- Published on GitHub releases
- Announced on website/blog

---

## Version Locking & Pinning

### Recommended Practices

#### For Applications (Final Products)

```json
{
    "dependencies": {
        "@joshtol/emotive-engine": "2.5.1"
    }
}
```

**Use exact versions** to prevent unexpected updates.

#### For Libraries (Reusable Components)

```json
{
    "peerDependencies": {
        "@joshtol/emotive-engine": "^2.5.0"
    }
}
```

**Use caret ranges** to allow compatible updates.

#### For Enterprise (Maximum Stability)

```json
{
    "dependencies": {
        "@joshtol/emotive-engine": "2.5.1"
    },
    "overrides": {
        "@joshtol/emotive-engine": "2.5.1"
    }
}
```

**Lock all transitive dependencies** with exact versions.

---

## Hotfix Process

### Critical Bug or Security Issue

**Timeline**: Expedited release within 24-72 hours

**Process**:

1. Issue identified and confirmed
2. Fix developed and tested
3. Patch version incremented (e.g., 2.5.1 → 2.5.2)
4. Released to npm immediately
5. Security advisory published (if applicable)
6. Users notified via all channels

**Distribution**:

```bash
npm update @joshtol/emotive-engine
```

---

## Versioning for Enterprise

### Extended Stability Guarantee

Enterprise customers receive:

- **Advance notice** (90 days) before breaking changes
- **Extended support** beyond standard LTS
- **Custom backports** of critical fixes to older versions
- **Private beta access** to test changes early
- **Dedicated migration assistance**

**Contact**: enterprise@emotiveengine.com

---

## Version History

### Major Milestones

| Version   | Date       | Highlights                                    |
| --------- | ---------- | --------------------------------------------- |
| **2.5.x** | 2024-10-15 | Semantic Performance System, Rotation Control |
| 2.4.x     | 2024-06-01 | Shape Morphing, Element Attachment            |
| 2.3.x     | 2024-01-15 | Audio Integration, Beat Detection             |
| 2.0.0     | 2023-06-01 | Plugin System, Performance Optimization       |
| 1.0.0     | 2023-01-15 | Initial stable release                        |

---

## Questions?

- **Documentation**: https://docs.emotiveengine.com/versioning
- **Support**: support@emotiveengine.com
- **GitHub**: https://github.com/joshtol/emotive-engine/releases

---

**Last Updated**: 2025-01-24 **Policy Version**: 1.0

---

_This policy may be updated occasionally. Changes will be announced via
changelog and security mailing list._
