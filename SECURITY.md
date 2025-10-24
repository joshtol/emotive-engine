# Security Policy

## Supported Versions

We provide security updates for the following versions of Emotive Engine:

| Version | Supported        | End of Support |
| ------- | ---------------- | -------------- |
| 2.5.x   | ✅ Yes (Current) | TBD            |
| 2.4.x   | ✅ Yes           | 2026-06-30     |
| 2.3.x   | ✅ Yes           | 2026-03-31     |
| < 2.3   | ❌ No            | Ended          |

**LTS (Long-Term Support) Policy**: Major versions receive security patches for
18 months after the next major release.

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Emotive
Engine, please report it responsibly.

### 🔒 How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@emotiveengine.com**

Include in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if available)
- Your contact information for follow-up

### 🔐 PGP Encryption (Optional)

For sensitive disclosures, you may encrypt your report using our PGP key:

- **Key ID**: [To be added]
- **Fingerprint**: [To be added]
- **Public Key**: Available at
  `https://emotiveengine.com/.well-known/pgp-key.txt`

---

## Response Timeline

We are committed to handling security reports promptly:

| Stage                  | Timeline | Description                                         |
| ---------------------- | -------- | --------------------------------------------------- |
| **Acknowledgment**     | 24 hours | We confirm receipt of your report                   |
| **Initial Assessment** | 72 hours | We evaluate severity and impact                     |
| **Status Update**      | 7 days   | We provide a detailed response and timeline         |
| **Fix Development**    | Varies   | Depends on complexity (typically 7-30 days)         |
| **Patch Release**      | ASAP     | Critical: <7 days, High: <14 days, Medium: <30 days |
| **Public Disclosure**  | 90 days  | After patch release or by mutual agreement          |

---

## Severity Classification

We use the following severity levels based on CVSS v3.1 scoring:

### 🔴 Critical (CVSS 9.0-10.0)

- Remote code execution
- Authentication bypass
- Data exfiltration at scale
- **Response**: Patch within 7 days

### 🟠 High (CVSS 7.0-8.9)

- Privilege escalation
- SQL injection / XSS
- Denial of service
- **Response**: Patch within 14 days

### 🟡 Medium (CVSS 4.0-6.9)

- Information disclosure
- CSRF vulnerabilities
- Logic flaws
- **Response**: Patch within 30 days

### 🟢 Low (CVSS 0.1-3.9)

- Minor information leaks
- Configuration issues
- **Response**: Patch in next scheduled release

---

## Security Measures

Emotive Engine implements multiple security layers:

### Code Security

- **Input Validation**: All configuration parameters are validated and sanitized
- **Output Encoding**: Canvas rendering prevents injection attacks
- **Dependency Scanning**: Automated vulnerability checks via npm audit
- **Secure Defaults**: All dangerous features disabled by default

### Runtime Security

- **Content Security Policy (CSP)**: Compatible with strict CSP policies
- **Sandboxing**: Isolated execution context
- **Memory Safety**: Object pooling prevents memory exhaustion
- **Error Handling**: Sensitive information never exposed in error messages

### Build Security

- **Supply Chain**: Dependencies pinned to specific versions
- **Build Reproducibility**: Deterministic builds with checksums
- **Code Signing**: Releases signed with GPG key (coming soon)
- **SBOM**: Software Bill of Materials available (coming soon)

### Monitoring

- **Sentry Integration**: Real-time error tracking and anomaly detection
- **Performance Monitoring**: Unusual behavior detection
- **Audit Logging**: Security-relevant events logged (enterprise tier)

---

## Security Updates

### Notification Channels

Stay informed about security updates:

1. **GitHub Security Advisories**:
   https://github.com/joshtol/emotive-engine/security/advisories
2. **npm Security Advisories**: Automatic notifications for npm users
3. **Security Mailing List**: security-announce@emotiveengine.com (enterprise
   customers)
4. **RSS Feed**: https://emotiveengine.com/security.rss

### Update Procedure

When a security patch is released:

1. **Immediate Action Required**:

    ```bash
    npm update @joshtol/emotive-engine
    # or
    npm install @joshtol/emotive-engine@latest
    ```

2. **Verify the Update**:

    ```javascript
    import EmotiveMascot from '@joshtol/emotive-engine';
    console.log(EmotiveMascot.version); // Check version number
    ```

3. **Review Release Notes**: https://github.com/joshtol/emotive-engine/releases

---

## Vulnerability Disclosure Policy

We follow **responsible disclosure** principles:

### Our Commitment to Reporters

- We will acknowledge your report within 24 hours
- We will keep you informed of our progress
- We will credit you in the security advisory (unless you prefer anonymity)
- We will not pursue legal action against good-faith security researchers

### Coordinated Disclosure

- We request a **90-day embargo** before public disclosure
- We will work with you to coordinate disclosure timing
- We will publish a security advisory when patches are available
- We will credit researchers who follow responsible disclosure

---

## Bug Bounty Program

**Status**: 🚧 Coming Soon

We are developing a bug bounty program to reward security researchers. Details
will be announced at:

- https://emotiveengine.com/security/bounty

**Interested in participating?** Email security@emotiveengine.com to join our
early notification list.

---

## Security Best Practices for Users

### Secure Configuration

```javascript
// ✅ Good: Minimal privilege configuration
const mascot = new EmotiveMascot({
    canvasId: 'safe-canvas',
    emotion: 'neutral',
    performanceMode: 'balanced',
    sentry: {
        enabled: true,
        dsn: 'YOUR_SENTRY_DSN',
        environment: 'production',
    },
});

// ❌ Bad: Accepting untrusted user input
const emotion = getUserInput(); // NEVER DO THIS
mascot.setEmotion(emotion); // Could be malicious
```

### Input Validation

Always validate user input before passing to Emotive Engine:

```javascript
// ✅ Whitelist approach
const ALLOWED_EMOTIONS = ['joy', 'neutral', 'calm', 'excited'];

function setUserEmotion(userInput) {
    if (ALLOWED_EMOTIONS.includes(userInput)) {
        mascot.setEmotion(userInput);
    } else {
        console.warn('Invalid emotion rejected:', userInput);
    }
}
```

### Content Security Policy

Emotive Engine is compatible with strict CSP. Recommended policy:

```html
<meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self';
               script-src 'self' 'unsafe-eval';
               worker-src 'self' blob:;
               connect-src 'self' https://sentry.io;"
/>
```

Note: `unsafe-eval` is required for dynamic gesture loading (optional feature).

### Dependency Security

Regularly audit your dependencies:

```bash
npm audit
npm audit fix
```

Monitor for updates:

```bash
npm outdated
```

---

## Known Security Considerations

### Canvas Fingerprinting

Emotive Engine uses HTML5 Canvas, which can theoretically be used for browser
fingerprinting. This is an inherent property of Canvas APIs and not specific to
our implementation.

**Mitigation**: If privacy is critical, consider:

- Using privacy-focused browsers with canvas fingerprinting protection
- Implementing canvas noise injection (browser extensions)
- Limiting mascot deployment to authenticated users only

### Third-Party Dependencies

We minimize dependencies but include:

- `@sentry/browser` (error tracking)
- `@babel/runtime` (polyfills)

All dependencies are:

- Regularly audited for vulnerabilities
- Pinned to specific versions
- Reviewed before updates

### Performance-Based Side Channels

Timing attacks based on animation performance are theoretically possible but
have minimal practical risk for typical use cases.

---

## Security Audits

### Third-Party Audits

| Date    | Auditor | Scope                         | Report |
| ------- | ------- | ----------------------------- | ------ |
| 2025-Q2 | Planned | Full codebase security review | TBD    |

### Internal Reviews

- Code reviews required for all security-relevant changes
- Automated SAST scanning on every commit
- Dependency vulnerability checks on every build
- Manual penetration testing quarterly

---

## Compliance

Emotive Engine is designed to support compliance with:

- ✅ **GDPR** (EU General Data Protection Regulation)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ **WCAG 2.1 AA** (Web Content Accessibility Guidelines)
- 🚧 **SOC 2 Type II** (In progress for enterprise tier)
- 🚧 **ISO 27001** (Planned for 2025)

---

## Contact

- **Security Issues**: security@emotiveengine.com
- **General Questions**: support@emotiveengine.com
- **Enterprise Support**: enterprise@emotiveengine.com

---

## Attribution

We thank the following security researchers for responsible disclosure:

| Researcher   | Vulnerability | Date |
| ------------ | ------------- | ---- |
| _(None yet)_ | -             | -    |

---

**Last Updated**: 2025-01-24 **Version**: 1.0

---

_Emotive Engine is committed to maintaining the security and privacy of our
users. Thank you for helping us keep our software safe._
