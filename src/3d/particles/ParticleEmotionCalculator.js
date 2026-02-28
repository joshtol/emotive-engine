/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Emotion Calculator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Calculates particle system configuration based on emotion and undertone
 * @author Emotive Engine Team
 * @module 3d/particles/ParticleEmotionCalculator
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Extracts and calculates particle configuration for 3D rendering:
 * ║ • Reads particle configs from emotion data
 * ║ • Applies undertone modifiers (behavior override, rate multipliers)
 * ║ • Handles special emotion behaviors
 * ║ • Provides spawn rates and particle count limits
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * Mirrors 2D ParticleConfigCalculator for consistency across rendering systems.
 */

import { getEmotion } from '../../core/emotions/index.js';
import { getUndertoneModifier } from '../../config/undertoneModifiers.js';

export class ParticleEmotionCalculator {
    constructor() {
        // Cache for performance (emotion data rarely changes)
        this.cachedConfigs = new Map();
        // Cache size limit to prevent unbounded growth
        this.maxCacheSize = 100; // Support up to 100 emotion:undertone combinations
    }

    /**
     * Calculate complete particle configuration for emotion + undertone
     * @param {string} emotion - Current emotion name
     * @param {string|null} undertone - Optional undertone modifier
     * @returns {Object} Particle configuration with behavior, rates, and limits
     */
    calculate(emotion, undertone = null) {
        // Check cache first
        const cacheKey = `${emotion}:${undertone || 'none'}`;
        if (this.cachedConfigs.has(cacheKey)) {
            return this.cachedConfigs.get(cacheKey);
        }

        // Get emotion data
        const emotionData = getEmotion(emotion);
        if (!emotionData) {
            console.warn(`[ParticleEmotionCalculator] Unknown emotion: ${emotion}`);
            return this._getDefaultConfig();
        }

        // Extract base configuration
        const baseConfig = this._extractBaseConfig(emotionData, emotion);

        // Apply undertone modifiers
        const modifiedConfig = this._applyUndertoneModifiers(baseConfig, undertone);

        // Apply special emotion behaviors
        const finalConfig = this._applySpecialBehaviors(modifiedConfig, emotion);

        // Enforce cache size limit (LRU-style: remove oldest entry)
        if (this.cachedConfigs.size >= this.maxCacheSize) {
            const firstKey = this.cachedConfigs.keys().next().value;
            this.cachedConfigs.delete(firstKey);
        }

        // Cache and return
        this.cachedConfigs.set(cacheKey, finalConfig);
        return finalConfig;
    }

    /**
     * Extract base particle configuration from emotion data
     * @param {Object} emotionData - Emotion definition
     * @param {string} emotion - Emotion name
     * @returns {Object} Base particle config
     */
    _extractBaseConfig(emotionData, emotion) {
        // Particle config is in visual property for consistency with 2D
        const visual = emotionData.visual || {};

        return {
            behavior: visual.particleBehavior || 'ambient',
            rate: visual.particleRate || 1.0,
            min: visual.minParticles !== undefined ? visual.minParticles : 0,
            max: visual.maxParticles !== undefined ? visual.maxParticles : 10,
            colors: visual.particleColors || null,
            emotion,
        };
    }

    /**
     * Apply undertone modifiers to particle configuration
     * @param {Object} config - Base particle config
     * @param {string|null} undertone - Undertone modifier
     * @returns {Object} Modified config
     */
    _applyUndertoneModifiers(config, undertone) {
        if (!undertone) {
            return config;
        }

        const modifier = getUndertoneModifier(undertone);
        if (!modifier || !modifier.particles) {
            return config;
        }

        const undertoneParticles = modifier.particles;
        const modified = { ...config };

        // Apply behavior override
        if (undertoneParticles.behaviorOverride) {
            modified.behavior = undertoneParticles.behaviorOverride;
        }

        // Apply rate multiplier
        if (undertoneParticles.rateMultiplier) {
            modified.rate = config.rate * undertoneParticles.rateMultiplier;
            modified.max = Math.floor(config.max * undertoneParticles.rateMultiplier);
        }

        // Apply min/max overrides
        if (undertoneParticles.minParticles !== undefined) {
            modified.min = undertoneParticles.minParticles;
        }
        if (undertoneParticles.maxParticles !== undefined) {
            modified.max = undertoneParticles.maxParticles;
        }

        return modified;
    }

    /**
     * Apply special emotion-specific behaviors
     * @param {Object} config - Modified particle config
     * @param {string} emotion - Emotion name
     * @returns {Object} Final config with special behaviors
     */
    _applySpecialBehaviors(config, _emotion) {
        return config;
    }

    /**
     * Get default fallback configuration
     * @returns {Object} Default particle config
     */
    _getDefaultConfig() {
        return {
            behavior: 'ambient',
            rate: 1.0,
            min: 0,
            max: 10,
            colors: null,
            emotion: 'neutral',
        };
    }

    /**
     * Clear cache (useful for hot-reloading emotion data)
     */
    clearCache() {
        this.cachedConfigs.clear();
    }

    /**
     * Get cached config count (debugging)
     * @returns {number} Number of cached configs
     */
    getCacheSize() {
        return this.cachedConfigs.size;
    }
}

export default ParticleEmotionCalculator;
