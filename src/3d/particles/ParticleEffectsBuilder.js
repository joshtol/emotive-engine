/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Effects Builder
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Builds visual effect transforms for particle rendering based on gestures
 * @author Emotive Engine Team
 * @module 3d/particles/ParticleEffectsBuilder
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Maps gesture types to particle visual effects:
 * ║ • Firefly effect: Pulsing glow based on position + time (sparkle, twinkle)
 * ║ • Flicker effect: Rapid shimmer at 12Hz frequency
 * ║ • Shimmer effect: Traveling wave from center
 * ║ • Glow effect: Radiant burst with distance-based delay
 * ║ • Extensible architecture for future effects
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL EFFECTS MAPPING:
 * - sparkle → firefly (pulsing glow)
 * - twinkle → firefly (pulsing glow)
 * - flicker → flicker (rapid shimmer)
 * - shimmer → shimmer (traveling wave)
 * - glow → glow (radiant burst)
 */

export class ParticleEffectsBuilder {
    constructor() {
        // Map gesture names to effect builder methods
        this.effectMap = {
            // Firefly effect (pulsing glow)
            'sparkle': this.buildFireflyEffect.bind(this),
            'twinkle': this.buildFireflyEffect.bind(this),

            // Flicker effect (rapid shimmer)
            'flicker': this.buildFlickerEffect.bind(this),

            // Shimmer effect (traveling wave)
            'shimmer': this.buildShimmerEffect.bind(this),

            // Glow effect (radiant burst)
            'glow': this.buildGlowEffect.bind(this),

            // Burst effect (explosion glow)
            'burst': this.buildGlowEffect.bind(this),

            // Flash effect (instant brightness)
            'flash': this.buildFlickerEffect.bind(this)
        };
    }

    /**
     * Build effect transform from gesture data
     * @param {Object} gestureData - Gesture data from GestureDataExtractor
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Object|null} Effect transform for particle renderer
     */
    build(gestureData, centerX, centerY) {
        if (!gestureData || !gestureData.motion) {
            return null;
        }

        const {gestureName} = gestureData;
        const builder = this.effectMap[gestureName];

        if (!builder) {
            // No visual effect for this gesture (motion-only gesture)
            return null;
        }

        // Build the effect
        return builder(gestureData, centerX, centerY);
    }

    /**
     * Build firefly effect (pulsing glow based on particle position)
     * Used by: sparkle, twinkle gestures
     * @param {Object} gestureData - Gesture data
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Object} Firefly effect transform
     */
    buildFireflyEffect(gestureData, centerX, centerY) {
        const config = gestureData.config || {};

        return {
            fireflyEffect: true,
            fireflyTime: Date.now() * 0.001, // Convert to seconds
            particleGlow: config.particleGlow || 2.0,
            centerX,
            centerY
        };
    }

    /**
     * Build flicker effect (rapid shimmer at 12Hz)
     * Used by: flicker, flash gestures
     * @param {Object} gestureData - Gesture data
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Object} Flicker effect transform
     */
    buildFlickerEffect(gestureData, centerX, centerY) {
        const config = gestureData.config || {};

        return {
            flickerEffect: true,
            flickerTime: Date.now() * 0.001,
            particleGlow: config.particleGlow || 2.0,
            centerX,
            centerY
        };
    }

    /**
     * Build shimmer effect (traveling wave from center)
     * Used by: shimmer gesture
     * @param {Object} gestureData - Gesture data
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Object} Shimmer effect transform
     */
    buildShimmerEffect(gestureData, centerX, centerY) {
        const config = gestureData.config || {};
        const progress = gestureData.progress || 0;

        return {
            shimmerEffect: true,
            shimmerTime: Date.now() * 0.001,
            shimmerWave: progress * Math.PI * 2, // Wave phase based on progress
            particleGlow: config.particleGlow || 1.2,
            centerX,
            centerY
        };
    }

    /**
     * Build glow effect (radiant burst with distance-based delay)
     * Used by: glow, burst gestures
     * @param {Object} gestureData - Gesture data
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Object} Glow effect transform
     */
    buildGlowEffect(gestureData, centerX, centerY) {
        const config = gestureData.config || {};
        const progress = gestureData.progress || 0;

        return {
            glowEffect: true,
            glowProgress: progress,
            particleGlow: config.particleGlow || 2.0,
            centerX,
            centerY
        };
    }

    /**
     * Register a custom effect builder
     * Allows extending with new effects without modifying this file
     * @param {string} gestureName - Gesture name to map
     * @param {Function} builderFn - Builder function (gestureData, centerX, centerY) => transform
     */
    registerEffect(gestureName, builderFn) {
        this.effectMap[gestureName] = builderFn.bind(this);
    }

    /**
     * Check if gesture has a visual effect
     * @param {string} gestureName - Gesture name
     * @returns {boolean} True if gesture has effect
     */
    hasEffect(gestureName) {
        return !!this.effectMap[gestureName];
    }

    /**
     * Get all registered effect gesture names
     * @returns {Array} Array of gesture names
     */
    getEffectGestures() {
        return Object.keys(this.effectMap);
    }

    /**
     * Build multiple effects from multiple gestures (for blending)
     * @param {Array} gestureDataArray - Array of gesture data
     * @param {number} centerX - Canvas center X
     * @param {number} centerY - Canvas center Y
     * @returns {Array} Array of effect transforms
     */
    buildAll(gestureDataArray, centerX, centerY) {
        if (!gestureDataArray || gestureDataArray.length === 0) {
            return [];
        }

        const effects = [];

        for (const gestureData of gestureDataArray) {
            const effect = this.build(gestureData, centerX, centerY);
            if (effect) {
                effects.push(effect);
            }
        }

        return effects;
    }

    /**
     * Merge multiple effects into single transform (for multi-gesture scenarios)
     * @param {Array} effects - Array of effect transforms
     * @returns {Object|null} Merged effect transform
     */
    mergeEffects(effects) {
        if (!effects || effects.length === 0) {
            return null;
        }

        if (effects.length === 1) {
            return effects[0];
        }

        // Merge multiple effects (priority: last effect wins for conflicts)
        const merged = {};

        for (const effect of effects) {
            Object.assign(merged, effect);
        }

        return merged;
    }

    /**
     * Dispose of resources and clear references
     */
    destroy() {
        this.effectMap = null;
    }
}

export default ParticleEffectsBuilder;
