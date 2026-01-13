/**
 * ConfigurationManager - Manages settings and configuration
 * @module mascot/ConfigurationManager
 */

export class ConfigurationManager {
    /**
     * Create ConfigurationManager
     *
     * @param {Object} deps - Dependencies or mascot instance
     * @param {Object} [config] - Configuration object (legacy style)
     *
     * @example
     * // New DI style:
     * new ConfigurationManager({ config: { canvasId: 'my-canvas' } })
     *
     * // Legacy style:
     * new ConfigurationManager(mascot, { canvasId: 'my-canvas' })
     */
    constructor(deps, config) {
        // Support both new DI style and legacy mascot style
        if (deps && deps.config !== undefined && config === undefined) {
            // New DI style - deps contains config directly
            this.config = this.validateConfig(deps.config || {});
        } else {
            // Legacy: deps is mascot, config is second arg
            this.config = this.validateConfig(config || {});
            this._legacyMode = true;
        }
    }

    /**
     * Validate and set defaults for configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Validated configuration with defaults
     */
    validateConfig(config) {
        return {
            canvasId: config.canvasId || 'emotive-canvas',
            startingEmotion: config.startingEmotion || 'neutral',
            emotionalResponsiveness: config.emotionalResponsiveness ?? 0.5,
            particleIntensity: config.particleIntensity ?? 1.0,
            glowIntensity: config.glowIntensity ?? 1.0,
            audioEnabled: config.audioEnabled ?? false,
            showFPS: config.showFPS ?? false,
            debugMode: config.debugMode ?? false,
            renderMode: config.renderMode || 'default',
            maxParticles: config.maxParticles || 100,
            ...config
        };
    }

    /**
     * Get current configuration
     * @returns {Object} Copy of current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {Object} updates - Configuration updates
     * @returns {Object} Updated configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        return this.config;
    }
}
