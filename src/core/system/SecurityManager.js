/**
 * Security Manager for Emotive Engine
 * Handles Content Security Policy, sanitization, and security best practices
 */

export class SecurityManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.strict = options.strict || false;
        this.reportUri = options.reportUri || null;
        this.nonce = this.generateNonce();

        this.cspDirectives = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'blob:'],
            'font-src': ["'self'", 'data:'],
            'connect-src': ["'self'"],
            'media-src': ["'self'"],
            'object-src': ["'none'"],
            'frame-src': ["'none'"],
            'worker-src': ["'self'", 'blob:'],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'manifest-src': ["'self'"],
            ...options.cspDirectives
        };

        // Bound event handler for proper cleanup
        this.boundHandleViolation = null;

        if (this.strict) {
            this.applyStrictCSP();
        }

        if (this.enabled) {
            this.initialize();
        }
    }

    generateNonce() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Math.random().toString(36).substr(2, 15);
    }

    applyStrictCSP() {
        // Remove unsafe-inline and unsafe-eval in strict mode
        this.cspDirectives['script-src'] = ["'self'", `'nonce-${this.nonce}'`];
        this.cspDirectives['style-src'] = ["'self'", `'nonce-${this.nonce}'`];

        // Add additional strict directives
        this.cspDirectives['require-trusted-types-for'] = ["'script'"];
        this.cspDirectives['trusted-types'] = ['default'];
    }

    initialize() {
        if (typeof document === 'undefined') return;

        // Set CSP meta tag
        this.setCSPMeta();

        // Initialize trusted types if available
        this.initTrustedTypes();

        // Set security headers via meta tags
        this.setSecurityHeaders();

        // Monitor violations
        this.monitorViolations();
    }

    setCSPMeta() {
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingCSP) {
            existingCSP.remove();
        }

        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = this.buildCSPString();
        document.head.appendChild(cspMeta);
    }

    buildCSPString() {
        const directives = [];

        for (const [directive, values] of Object.entries(this.cspDirectives)) {
            if (values && values.length > 0) {
                directives.push(`${directive} ${values.join(' ')}`);
            }
        }

        if (this.reportUri) {
            directives.push(`report-uri ${this.reportUri}`);
        }

        return directives.join('; ');
    }

    setSecurityHeaders() {
        // X-Content-Type-Options
        const xContentType = document.createElement('meta');
        xContentType.httpEquiv = 'X-Content-Type-Options';
        xContentType.content = 'nosniff';
        document.head.appendChild(xContentType);

        // X-Frame-Options
        const xFrame = document.createElement('meta');
        xFrame.httpEquiv = 'X-Frame-Options';
        xFrame.content = 'DENY';
        document.head.appendChild(xFrame);

        // Referrer-Policy
        const referrer = document.createElement('meta');
        referrer.name = 'referrer';
        referrer.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrer);

        // Permissions-Policy
        const permissions = document.createElement('meta');
        permissions.httpEquiv = 'Permissions-Policy';
        permissions.content = 'geolocation=(), microphone=(), camera=()';
        document.head.appendChild(permissions);
    }

    initTrustedTypes() {
        if (typeof window === 'undefined' || !window.trustedTypes) return;

        try {
            const policy = window.trustedTypes.createPolicy('emotive-engine', {
                createHTML: string => this.sanitizeHTML(string),
                createScript: string => this.sanitizeScript(string),
                createScriptURL: url => this.sanitizeURL(url)
            });

            window.EmotiveEngineTrustedPolicy = policy;
        } catch (error) {
            console.warn('Failed to create Trusted Types policy:', error);
        }
    }

    monitorViolations() {
        if (typeof window === 'undefined') return;

        // Create bound handler and store reference for cleanup
        this.boundHandleViolation = event => {
            this.handleViolation(event);
        };

        // Listen for CSP violations
        window.addEventListener('securitypolicyviolation', this.boundHandleViolation);

        // Monitor other security events
        this.monitorXSSAttempts();
        this.monitorClickjacking();
    }

    handleViolation(event) {
        const violation = {
            documentURI: event.documentURI,
            violatedDirective: event.violatedDirective,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            blockedURI: event.blockedURI,
            statusCode: event.statusCode,
            timestamp: Date.now()
        };

        console.warn('CSP Violation:', violation);

        // Report to server if configured
        if (this.reportUri) {
            this.reportViolation(violation);
        }
    }

    reportViolation(violation) {
        if (!this.reportUri) return;

        try {
            fetch(this.reportUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'csp-report': violation
                })
            }).catch(error => {
                console.error('Failed to report CSP violation:', error);
            });
        } catch (error) {
            console.error('Error reporting CSP violation:', error);
        }
    }

    monitorXSSAttempts() {
        // Override dangerous methods to monitor usage
        // eslint-disable-next-line no-eval
        const originalEval = window.eval;
        // eslint-disable-next-line no-eval
        window.eval = (...args) => {
            console.warn('eval() usage detected:', args);
            if (this.strict) {
                throw new Error('eval() is disabled in strict mode');
            }
            return originalEval.apply(window, args);
        };

        // Monitor innerHTML usage
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set(value) {
                if (typeof value === 'string' && value.includes('<script')) {
                    console.warn('Potential XSS: Script tag in innerHTML');
                    if (this.strict) {
                        throw new Error('Script tags not allowed in innerHTML');
                    }
                }
                originalInnerHTML.set.call(this, value);
            },
            get: originalInnerHTML.get
        });
    }

    monitorClickjacking() {
        if (window.self !== window.top) {
            console.warn('Page is being framed - potential clickjacking attempt');
            if (this.strict) {
                // Break out of frame
                window.top.location = window.self.location;
            }
        }
    }

    sanitizeHTML(html) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html);
        }

        // Basic sanitization fallback
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    sanitizeScript(script) {
        // Remove potentially dangerous patterns
        const dangerous = [
            /eval\s*\(/g,
            /new\s+Function\s*\(/g,
            /setTimeout\s*\([^,]*,/g,
            /setInterval\s*\([^,]*,/g,
            /document\.write/g,
            /window\.location/g,
            /document\.cookie/g
        ];

        const sanitized = script;
        for (const pattern of dangerous) {
            if (pattern.test(sanitized)) {
                console.warn('Dangerous pattern detected in script:', pattern);
                if (this.strict) {
                    throw new Error('Script contains dangerous patterns');
                }
            }
        }

        return sanitized;
    }

    sanitizeURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);

            // Check protocol
            if (!['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol)) {
                console.warn('Unsafe URL protocol:', parsed.protocol);
                if (this.strict) {
                    throw new Error('Unsafe URL protocol');
                }
            }

            // Check for javascript: URLs
            if (url.toLowerCase().includes('javascript:')) {
                console.warn('JavaScript URL detected');
                if (this.strict) {
                    throw new Error('JavaScript URLs not allowed');
                }
            }

            return url;
        } catch (error) {
            console.error('Invalid URL:', url, error);
            return '';
        }
    }

    validateInput(input, type = 'text') {
        const validators = {
            text: /^[\w\s\-@.]+$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            number: /^\d+$/,
            alphanumeric: /^[a-zA-Z0-9]+$/,
            url: /^https?:\/\/.+$/
        };

        const validator = validators[type];
        if (!validator) {
            console.warn('Unknown input type:', type);
            return false;
        }

        return validator.test(input);
    }

    createSecureContext() {
        return {
            eval: () => {
                throw new Error('eval is not allowed in secure context');
            },
            Function: () => {
                throw new Error('Function constructor is not allowed in secure context');
            },
            setTimeout: (fn, delay) => {
                if (typeof fn !== 'function') {
                    throw new Error('setTimeout with string is not allowed');
                }
                return setTimeout(fn, delay);
            },
            setInterval: (fn, delay) => {
                if (typeof fn !== 'function') {
                    throw new Error('setInterval with string is not allowed');
                }
                return setInterval(fn, delay);
            }
        };
    }

    getNonce() {
        return this.nonce;
    }

    updateCSP(directives) {
        Object.assign(this.cspDirectives, directives);
        this.setCSPMeta();
    }

    getSecurityReport() {
        return {
            enabled: this.enabled,
            strict: this.strict,
            csp: this.buildCSPString(),
            nonce: this.nonce,
            features: {
                trustedTypes: typeof window !== 'undefined' && !!window.trustedTypes,
                csp: true,
                secureContext: typeof window !== 'undefined' && window.isSecureContext
            }
        };
    }

    /**
     * Destroy security manager and cleanup listeners
     */
    destroy() {
        // Remove CSP violation listener
        if (this.boundHandleViolation && typeof window !== 'undefined') {
            window.removeEventListener('securitypolicyviolation', this.boundHandleViolation);
            this.boundHandleViolation = null;
        }
    }
}

// Create singleton instance (disabled by default to avoid console warnings)
// Users can enable via: securityManager.enabled = true; securityManager.initialize();
export const securityManager = new SecurityManager({
    enabled: false,
    strict: false,
    cspDirectives: {
        'connect-src': ["'self'", 'https://api.anthropic.com', 'https://*.firebaseio.com']
    }
});

export default SecurityManager;