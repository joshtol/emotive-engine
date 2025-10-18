/**
 * Sentry Error Monitoring Configuration
 *
 * Provides production error tracking and monitoring for the Emotive Engine.
 *
 * Usage:
 *   import { initSentry } from './utils/sentry.js';
 *   initSentry({ dsn: 'your-sentry-dsn' });
 *
 * @module utils/sentry
 */

import * as Sentry from '@sentry/browser';

/**
 * Initialize Sentry error monitoring
 *
 * @param {Object} options - Sentry configuration options
 * @param {string} options.dsn - Sentry DSN (Data Source Name)
 * @param {string} [options.environment='production'] - Environment name
 * @param {number} [options.tracesSampleRate=0.1] - Performance monitoring sample rate
 * @param {boolean} [options.enabled=true] - Enable/disable Sentry
 */
export function initSentry(options = {}) {
    const {
        dsn = null,
        environment = 'production',
        tracesSampleRate = 0.1,
        enabled = true
    } = options;

    // Don't initialize if disabled or no DSN provided
    if (!enabled || !dsn) {
        console.warn('Sentry monitoring disabled (no DSN provided or explicitly disabled)');
        return;
    }

    Sentry.init({
        dsn,
        environment,

        // Capture 10% of transactions for performance monitoring
        tracesSampleRate,

        // Release version from package.json
        release: `emotive-engine@${process.env.npm_package_version || '2.5.0'}`,

        // Integrate with error boundaries
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Capture 10% of sessions for debugging
                sessionSampleRate: 0.1,
                // Always capture sessions with errors
                errorSampleRate: 1.0,
            }),
        ],

        // Filter out non-critical errors
        beforeSend(event, hint) {
            // Ignore canvas-related warnings (common in development)
            const error = hint.originalException;
            if (error && error.message && error.message.includes('canvas')) {
                return null;
            }

            return event;
        },

        // Don't send PII (Personally Identifiable Information)
        beforeBreadcrumb(breadcrumb) {
            // Filter sensitive data from breadcrumbs
            if (breadcrumb.category === 'console') {
                return null;
            }
            return breadcrumb;
        },
    });

    console.log(`Sentry initialized in ${environment} mode`);
}

/**
 * Manually capture an error
 *
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureError(error, context = {}) {
    Sentry.captureException(error, {
        contexts: {
            emotive: context
        }
    });
}

/**
 * Add breadcrumb for debugging context
 *
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (e.g., 'gesture', 'emotion', 'audio')
 * @param {Object} data - Additional data
 */
export function addBreadcrumb(message, category = 'info', data = {}) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    });
}

/**
 * Set user context for error tracking
 *
 * @param {Object} user - User information (no PII)
 * @param {string} [user.id] - User ID
 * @param {string} [user.sessionId] - Session ID
 */
export function setUserContext(user) {
    Sentry.setUser(user);
}

/**
 * Set tags for filtering errors
 *
 * @param {Object} tags - Key-value tags
 */
export function setTags(tags) {
    Sentry.setTags(tags);
}

/**
 * Check if Sentry is enabled
 *
 * @returns {boolean}
 */
export function isSentryEnabled() {
    return Sentry.getCurrentHub().getClient() !== undefined;
}

export default {
    initSentry,
    captureError,
    addBreadcrumb,
    setUserContext,
    setTags,
    isSentryEnabled,
};
