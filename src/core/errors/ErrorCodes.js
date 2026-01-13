/**
 * Error Codes for Emotive Engine
 *
 * Each error has a unique code that links to documentation for troubleshooting.
 * Usage: console.warn(ErrorCodes.formatWarning('E001', 'Additional context'));
 *
 * @module core/errors/ErrorCodes
 */

/**
 * Error code definitions with messages and documentation links
 */
export const ERROR_CODES = {
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION ERRORS (E0xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E001: {
        code: 'E001',
        message: 'init() requires a browser environment (window is undefined)',
        docs: 'TROUBLESHOOTING.md#nextjsssr-window-not-defined',
        severity: 'error'
    },
    E002: {
        code: 'E002',
        message: 'Container element not found or invalid',
        docs: 'TROUBLESHOOTING.md#mascot-not-showing',
        severity: 'error'
    },
    E003: {
        code: 'E003',
        message: 'Container has no dimensions (width or height is 0)',
        docs: 'TROUBLESHOOTING.md#mascot-not-showing',
        severity: 'warning'
    },
    E004: {
        code: 'E004',
        message: 'WebGL context creation failed',
        docs: 'TROUBLESHOOTING.md#mascot-shows-as-blackempty',
        severity: 'error'
    },
    E005: {
        code: 'E005',
        message: 'Too many WebGL contexts (browser limit reached)',
        docs: 'TROUBLESHOOTING.md#mascot-shows-as-blackempty',
        severity: 'error'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE ERRORS (E1xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E101: {
        code: 'E101',
        message: 'Method called before init()',
        docs: 'TROUBLESHOOTING.md#gestures-not-triggering',
        severity: 'warning'
    },
    E102: {
        code: 'E102',
        message: 'Method called after destroy()',
        docs: 'TROUBLESHOOTING.md#cannot-read-properties-of-null',
        severity: 'warning'
    },
    E103: {
        code: 'E103',
        message: 'start() called before init()',
        docs: 'TROUBLESHOOTING.md#mascot-not-showing',
        severity: 'error'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // EMOTION/GESTURE ERRORS (E2xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E201: {
        code: 'E201',
        message: 'Unknown emotion name',
        docs: 'QUICK_REFERENCE.md#emotions',
        severity: 'warning'
    },
    E202: {
        code: 'E202',
        message: 'Unknown gesture name',
        docs: 'QUICK_REFERENCE.md#gestures',
        severity: 'warning'
    },
    E203: {
        code: 'E203',
        message: 'Unknown geometry name',
        docs: 'QUICK_REFERENCE.md#geometries-3d-only',
        severity: 'warning'
    },
    E204: {
        code: 'E204',
        message: 'Invalid chain preset or gesture array',
        docs: 'QUICK_REFERENCE.md#gestures',
        severity: 'warning'
    },
    E205: {
        code: 'E205',
        message: 'feel() rate limit exceeded',
        docs: 'LLM_INTEGRATION.md',
        severity: 'warning'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIO ERRORS (E3xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E301: {
        code: 'E301',
        message: 'Audio context suspended (user interaction required)',
        docs: 'TROUBLESHOOTING.md#bpm-detection-not-working',
        severity: 'warning'
    },
    E302: {
        code: 'E302',
        message: 'CORS blocked audio analysis',
        docs: 'TROUBLESHOOTING.md#bpm-detection-not-working',
        severity: 'warning'
    },
    E303: {
        code: 'E303',
        message: 'Audio element not found or invalid',
        docs: 'TROUBLESHOOTING.md#audio-plays-but-no-visual-response',
        severity: 'error'
    },
    E304: {
        code: 'E304',
        message: 'BPM detection failed after max retries',
        docs: 'TROUBLESHOOTING.md#bpm-detection-not-working',
        severity: 'warning'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERING ERRORS (E4xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E401: {
        code: 'E401',
        message: 'WebGL context lost',
        docs: 'TROUBLESHOOTING.md#webgl-context-lost',
        severity: 'error'
    },
    E402: {
        code: 'E402',
        message: 'Shader compilation failed',
        docs: 'TROUBLESHOOTING.md#mascot-shows-as-blackempty',
        severity: 'error'
    },
    E403: {
        code: 'E403',
        message: 'Texture loading failed',
        docs: 'TROUBLESHOOTING.md#mascot-shows-as-blackempty',
        severity: 'warning'
    },
    E404: {
        code: 'E404',
        message: 'Asset not found',
        docs: 'TROUBLESHOOTING.md#mascot-shows-as-blackempty',
        severity: 'warning'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PERFORMANCE WARNINGS (E5xx)
    // ═══════════════════════════════════════════════════════════════════════════
    E501: {
        code: 'E501',
        message: 'Performance degradation triggered',
        docs: 'PERFORMANCE.md#automatic-performance-degradation',
        severity: 'info'
    },
    E502: {
        code: 'E502',
        message: 'Frame rate below target',
        docs: 'PERFORMANCE.md#troubleshooting-performance-issues',
        severity: 'info'
    },
    E503: {
        code: 'E503',
        message: 'Memory usage high',
        docs: 'PERFORMANCE.md#memory-management',
        severity: 'warning'
    }
};

/**
 * Base URL for documentation
 * @type {string}
 */
const DOCS_BASE_URL = 'https://github.com/joshtol/emotive-engine/blob/main/docs/';

/**
 * Format an error/warning message with code and documentation link
 * @param {string} code - Error code (e.g., 'E001')
 * @param {string} [context] - Additional context to append
 * @returns {string} Formatted message
 */
export function formatMessage(code, context = '') {
    const error = ERROR_CODES[code];
    if (!error) {
        return `[EmotiveEngine] Unknown error code: ${code}. ${context}`;
    }

    const contextStr = context ? ` ${context}` : '';
    const docsUrl = `${DOCS_BASE_URL}${error.docs}`;

    return `[EmotiveEngine ${error.code}] ${error.message}.${contextStr} See: ${docsUrl}`;
}

/**
 * Log an error with proper formatting
 * @param {string} code - Error code
 * @param {string} [context] - Additional context
 */
export function logError(code, context = '') {
    const error = ERROR_CODES[code];
    const message = formatMessage(code, context);

    if (!error || error.severity === 'error') {
        console.error(message);
    } else if (error.severity === 'warning') {
        console.warn(message);
    } else {
        // eslint-disable-next-line no-console
        console.info(message);
    }
}

/**
 * Create a throwable error with code
 * @param {string} code - Error code
 * @param {string} [context] - Additional context
 * @returns {Error} Error object
 */
export function createError(code, context = '') {
    const error = new Error(formatMessage(code, context));
    error.code = code;
    return error;
}

/**
 * Get documentation URL for an error code
 * @param {string} code - Error code
 * @returns {string|null} Documentation URL or null if code unknown
 */
export function getDocsUrl(code) {
    const error = ERROR_CODES[code];
    if (!error) return null;
    return `${DOCS_BASE_URL}${error.docs}`;
}

export default {
    ERROR_CODES,
    formatMessage,
    logError,
    createError,
    getDocsUrl
};
