/**
 * ConfigurationManager - Manages settings and configuration
 * @module mascot/ConfigurationManager
 * @complexity ⭐⭐ Intermediate
 * @audience Modify this when adding new configuration options
 */

export class ConfigurationManager {
    constructor(mascot, config = {}) {
        this.mascot = mascot;
        this.config = this.validateConfig(config);
    }

    /**
     * Validate and set defaults for configuration
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
     * Methods to be moved here:
     * - getConfig()
     * - updateConfig()
     * - Configuration validation
     */

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        return this.config;
    }
}