/**
 * StanceRegistry — Named morph stances with visual config and metadata.
 *
 * UP-RESONANCE-2 Feature 7
 * @module core/state/StanceRegistry
 */

export class StanceRegistry {
    constructor() {
        this._stances = new Map();
        this._active = null; // { name, config }
    }

    /**
     * Register a named stance.
     * @param {string} name - Stance name
     * @param {Object} config
     * @param {string} config.shape - Shape name to morph to
     * @param {string[]} [config.elements] - Associated elements
     * @param {Object} [config.visualConfig] - Visual overrides (tint, glow, etc.)
     * @param {Object} [config.modifiers] - Consumer-defined modifiers
     * @param {string} [config.description] - Human-readable description
     */
    registerStance(name, config) {
        this._stances.set(name, { ...config });
    }

    /**
     * Check if a name is a registered stance.
     * @param {string} name
     * @returns {boolean}
     */
    hasStance(name) {
        return this._stances.has(name);
    }

    /**
     * Get stance config.
     * @param {string} name
     * @returns {Object|null}
     */
    getStance(name) {
        const s = this._stances.get(name);
        return s ? { ...s } : null;
    }

    /**
     * Activate a stance.
     * @param {string} name
     * @returns {Object|null} The stance config, or null if not found
     */
    activate(name) {
        const config = this._stances.get(name);
        if (!config) return null;
        this._active = { name, config: { ...config } };
        return this._active.config;
    }

    /**
     * Dismiss the active stance.
     * @returns {boolean} Whether a stance was dismissed
     */
    dismiss() {
        if (!this._active) return false;
        this._active = null;
        return true;
    }

    /** @returns {{name: string, config: Object}|null} */
    getActiveStance() {
        return this._active
            ? { name: this._active.name, config: { ...this._active.config } }
            : null;
    }

    /** @returns {string[]} */
    getAvailableStances() {
        return [...this._stances.keys()];
    }
}
