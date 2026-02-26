/**
 * ConfigurationManager - Manages settings and configuration
 * @module mascot/ConfigurationManager
 */

export class ConfigurationManager {
    /**
     * Create ConfigurationManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.config - Configuration object
     */
    constructor(deps) {
        // Note: config is not strictly required - defaults are applied
        this.config = this.validateConfig(deps.config || {});
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
            ...config,
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
