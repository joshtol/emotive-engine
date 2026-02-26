/**
 * Feature Flags System for Emotive Engine
 * Enables controlled rollout and A/B testing of features
 */

export class FeatureFlags {
    constructor(options = {}) {
        this.flags = new Map();
        this.overrides = new Map();
        this.variants = new Map();
        this.evaluations = new Map();

        this.config = {
            endpoint: options.endpoint || '/api/feature-flags',
            refreshInterval: options.refreshInterval || 300000, // 5 minutes
            storage: options.storage || 'localStorage',
            storageKey: options.storageKey || 'emotive-feature-flags',
            userId: options.userId || this.generateUserId(),
            attributes: options.attributes || {},
            enableAnalytics: options.enableAnalytics !== false,
            enableCache: options.enableCache !== false,
            defaultFlags: options.defaultFlags || {},
        };

        this.callbacks = {
            onFlagChange: options.onFlagChange || null,
            onEvaluation: options.onEvaluation || null,
            onError: options.onError || null,
        };

        this.refreshTimer = null;
        this.initialized = false;

        // Initialize with defaults
        this.loadDefaultFlags();

        // Load from storage if available
        if (this.config.enableCache) {
            this.loadFromStorage();
        }

        // Start auto-refresh
        if (this.config.endpoint) {
            this.startAutoRefresh();
        }
    }

    generateUserId() {
        const stored = this.getStoredUserId();
        if (stored) return stored;

        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.storeUserId(userId);
        return userId;
    }

    getStoredUserId() {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem('emotive-user-id');
            }
        } catch {
            // Storage not available
        }
        return null;
    }

    storeUserId(userId) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('emotive-user-id', userId);
            }
        } catch {
            // Storage not available
        }
    }

    loadDefaultFlags() {
        const defaults = {
            // Core features
            enableParticles: { enabled: true, variant: 'default' },
            enableAudio: { enabled: true, variant: 'default' },
            enableEmotions: { enabled: true, variant: 'default' },
            enableGestures: { enabled: true, variant: 'default' },

            // Performance features
            enableGradientCache: { enabled: true, variant: 'default' },
            enableLazyLoading: { enabled: true, variant: 'default' },
            enableCodeSplitting: { enabled: false, variant: 'default' },

            // Experimental features
            enableWebGL: { enabled: false, variant: 'default' },
            enableWebGPU: { enabled: false, variant: 'default' },
            enableOffscreenCanvas: { enabled: false, variant: 'default' },

            // Debug features
            enableDebugMode: { enabled: false, variant: 'default' },
            enablePerformanceOverlay: { enabled: false, variant: 'default' },
            enableErrorReporting: { enabled: true, variant: 'default' },

            // A/B test examples
            buttonColor: { enabled: true, variant: 'blue' },
            animationSpeed: { enabled: true, variant: 'normal' },
            particleDensity: { enabled: true, variant: 'medium' },

            ...this.config.defaultFlags,
        };

        for (const [key, value] of Object.entries(defaults)) {
            this.flags.set(key, value);
        }
    }

    async fetchFlags() {
        if (!this.config.endpoint) return;

        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.config.userId,
                    attributes: this.config.attributes,
                    flags: Array.from(this.flags.keys()),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.updateFlags(data.flags);

            if (this.config.enableCache) {
                this.saveToStorage();
            }

            return data.flags;
        } catch (error) {
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            console.error('Failed to fetch feature flags:', error);
        }
    }

    updateFlags(newFlags) {
        const changes = [];

        for (const [key, value] of Object.entries(newFlags)) {
            const oldValue = this.flags.get(key);

            if (!this.isEqual(oldValue, value)) {
                this.flags.set(key, value);
                changes.push({ key, oldValue, newValue: value });
            }
        }

        if (changes.length > 0 && this.callbacks.onFlagChange) {
            this.callbacks.onFlagChange(changes);
        }
    }

    isEqual(a, b) {
        if (a === b) return true;
        if (!a || !b) return false;
        return a.enabled === b.enabled && a.variant === b.variant;
    }

    isEnabled(flagKey, defaultValue = false) {
        // Check overrides first
        if (this.overrides.has(flagKey)) {
            return this.overrides.get(flagKey);
        }

        const flag = this.flags.get(flagKey);
        const enabled = flag ? flag.enabled : defaultValue;

        this.trackEvaluation(flagKey, enabled, flag?.variant || 'default');

        return enabled;
    }

    getVariant(flagKey, defaultVariant = 'default') {
        // Check variant overrides
        if (this.variants.has(flagKey)) {
            return this.variants.get(flagKey);
        }

        const flag = this.flags.get(flagKey);
        const variant = flag ? flag.variant : defaultVariant;

        this.trackEvaluation(flagKey, flag?.enabled || false, variant);

        return variant;
    }

    evaluate(flagKey, options = {}) {
        const { defaultEnabled = false, defaultVariant = 'default', attributes = {} } = options;

        // Merge attributes
        const evalAttributes = { ...this.config.attributes, ...attributes };

        // Check for targeted rules
        const flag = this.flags.get(flagKey);

        if (flag && flag.rules) {
            for (const rule of flag.rules) {
                if (this.evaluateRule(rule, evalAttributes)) {
                    const result = {
                        enabled: rule.enabled !== undefined ? rule.enabled : flag.enabled,
                        variant: rule.variant || flag.variant,
                    };

                    this.trackEvaluation(flagKey, result.enabled, result.variant);
                    return result;
                }
            }
        }

        // Default evaluation
        const result = {
            enabled: this.isEnabled(flagKey, defaultEnabled),
            variant: this.getVariant(flagKey, defaultVariant),
        };

        return result;
    }

    evaluateRule(rule, attributes) {
        if (!rule.conditions) return true;

        for (const condition of rule.conditions) {
            if (!this.evaluateCondition(condition, attributes)) {
                return false;
            }
        }

        return true;
    }

    evaluateCondition(condition, attributes) {
        const { attribute, operator, value } = condition;
        const attrValue = attributes[attribute];

        switch (operator) {
            case 'equals':
                return attrValue === value;
            case 'not_equals':
                return attrValue !== value;
            case 'contains':
                return String(attrValue).includes(value);
            case 'not_contains':
                return !String(attrValue).includes(value);
            case 'greater_than':
                return Number(attrValue) > Number(value);
            case 'less_than':
                return Number(attrValue) < Number(value);
            case 'in':
                return value.includes(attrValue);
            case 'not_in':
                return !value.includes(attrValue);
            case 'matches':
                return new RegExp(value).test(String(attrValue));
            default:
                return false;
        }
    }

    trackEvaluation(flagKey, enabled, variant) {
        if (!this.config.enableAnalytics) return;

        const evaluation = {
            flagKey,
            enabled,
            variant,
            timestamp: Date.now(),
            userId: this.config.userId,
            attributes: this.config.attributes,
        };

        // Track locally
        if (!this.evaluations.has(flagKey)) {
            this.evaluations.set(flagKey, []);
        }
        this.evaluations.get(flagKey).push(evaluation);

        // Callback
        if (this.callbacks.onEvaluation) {
            this.callbacks.onEvaluation(evaluation);
        }
    }

    override(flagKey, enabled, variant = null) {
        this.overrides.set(flagKey, enabled);

        if (variant !== null) {
            this.variants.set(flagKey, variant);
        }
    }

    clearOverride(flagKey) {
        this.overrides.delete(flagKey);
        this.variants.delete(flagKey);
    }

    clearAllOverrides() {
        this.overrides.clear();
        this.variants.clear();
    }

    getAllFlags() {
        const result = {};

        for (const [key, value] of this.flags) {
            result[key] = {
                ...value,
                overridden: this.overrides.has(key),
            };
        }

        return result;
    }

    getEnabledFlags() {
        const enabled = [];

        for (const [key] of this.flags) {
            if (this.isEnabled(key)) {
                enabled.push(key);
            }
        }

        return enabled;
    }

    saveToStorage() {
        if (!this.config.enableCache) return;

        try {
            const storage = this.getStorage();
            if (!storage) return;

            const data = {
                flags: Object.fromEntries(this.flags),
                timestamp: Date.now(),
                userId: this.config.userId,
            };

            storage.setItem(this.config.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save feature flags to storage:', error);
        }
    }

    loadFromStorage() {
        if (!this.config.enableCache) return;

        try {
            const storage = this.getStorage();
            if (!storage) return;

            const stored = storage.getItem(this.config.storageKey);
            if (!stored) return;

            const data = JSON.parse(stored);

            // Check if data is stale (older than refresh interval)
            if (Date.now() - data.timestamp > this.config.refreshInterval) {
                return;
            }

            this.updateFlags(data.flags);
        } catch (error) {
            console.error('Failed to load feature flags from storage:', error);
        }
    }

    getStorage() {
        try {
            if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
                return localStorage;
            }
            if (this.config.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
                return sessionStorage;
            }
        } catch {
            // Storage not available
        }
        return null;
    }

    startAutoRefresh() {
        if (this.refreshTimer) return;

        // Initial fetch
        this.fetchFlags();

        // Schedule periodic updates
        this.refreshTimer = setInterval(() => {
            this.fetchFlags();
        }, this.config.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    updateAttributes(attributes) {
        this.config.attributes = { ...this.config.attributes, ...attributes };

        // Refetch flags with new attributes
        if (this.config.endpoint) {
            this.fetchFlags();
        }
    }

    getAnalytics() {
        const analytics = {
            evaluations: {},
            summary: {
                total: 0,
                byFlag: {},
                byVariant: {},
            },
        };

        for (const [flagKey, evals] of this.evaluations) {
            analytics.evaluations[flagKey] = evals;
            analytics.summary.total += evals.length;

            analytics.summary.byFlag[flagKey] = {
                count: evals.length,
                enabled: evals.filter(e => e.enabled).length,
                variants: {},
            };

            for (const evaluation of evals) {
                if (!analytics.summary.byVariant[evaluation.variant]) {
                    analytics.summary.byVariant[evaluation.variant] = 0;
                }
                analytics.summary.byVariant[evaluation.variant]++;

                if (!analytics.summary.byFlag[flagKey].variants[evaluation.variant]) {
                    analytics.summary.byFlag[flagKey].variants[evaluation.variant] = 0;
                }
                analytics.summary.byFlag[flagKey].variants[evaluation.variant]++;
            }
        }

        return analytics;
    }

    reset() {
        this.flags.clear();
        this.overrides.clear();
        this.variants.clear();
        this.evaluations.clear();
        this.loadDefaultFlags();
    }

    destroy() {
        this.stopAutoRefresh();
        this.reset();
    }
}

// Create singleton instance (no endpoint configured to avoid 404 errors)
// Users can configure endpoint via: featureFlags.config.endpoint = '/api/feature-flags'; featureFlags.fetchFlags();
export const featureFlags = new FeatureFlags({
    endpoint: null, // Disable auto-fetch to prevent 404 errors
    enableCache: true,
    enableAnalytics: false, // Disable analytics since we're not fetching
});

// Helper functions
export function isFeatureEnabled(flagKey, defaultValue = false) {
    return featureFlags.isEnabled(flagKey, defaultValue);
}

export function getFeatureVariant(flagKey, defaultVariant = 'default') {
    return featureFlags.getVariant(flagKey, defaultVariant);
}

export default FeatureFlags;
