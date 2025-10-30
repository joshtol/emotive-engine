/**
 * VisualEffectAnimator - Handles visual effect gesture animations
 * @module core/renderer/VisualEffectAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles gestures that create visual effects: flash, glow, flicker, shimmer, sparkle
 */

export class VisualEffectAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply flash animation - quick glow and scale pulse
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow and scale
     */
    applyFlash(anim, progress) {
        const flash = Math.sin(progress * Math.PI); // Quick up and down
        const glowPeak = anim.params.glowPeak || 2.0;  // Default if not defined
        const scalePeak = anim.params.scalePeak || 1.1; // Default if not defined
        return {
            glow: 1 + (glowPeak - 1) * flash,
            scale: 1 + (scalePeak - 1) * flash
        };
    }

    /**
     * Apply glow animation - pure luminosity pulse
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow and subtle scale
     */
    applyGlow(anim, progress) {
        // Glow effect - pure luminosity like pulse but without movement
        // Copy of pulse logic but focused only on glow

        const glowPulse = Math.sin(progress * Math.PI * anim.params.frequency);

        return {
            scale: 1 + glowPulse * (anim.params.scaleAmount || 0.1), // Very subtle scale like new glow config
            glow: 1 + glowPulse * (anim.params.glowAmount || 0.8)    // Strong glow like new glow config
        };
    }

    /**
     * Apply flicker animation - shimmer effect with wave motion
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow, offset, and particle effect data
     */
    applyFlicker(anim, progress) {
        // Flicker effect - particles shimmer with wave-like pulsing
        const intensity = anim.params?.intensity || 2.0;
        const shimmerSpeed = anim.params?.speed || 3;

        // Smooth sine wave for shimmer
        const glow = 1 + Math.sin(progress * Math.PI * 2 * shimmerSpeed) * intensity * 0.3;

        // Slight horizontal wave motion
        const waveX = Math.sin(progress * Math.PI * 4) * 5 * this.scaleFactor;

        // Create time-based shimmer for particles
        const time = Date.now() * 0.001; // Convert to seconds

        // Main shimmer pulse
        const mainPulse = Math.sin(progress * Math.PI * shimmerSpeed * 2) * 0.5 + 0.5;

        return {
            offsetX: waveX,
            glow,
            particleGlow: mainPulse * intensity, // Pass intensity to particles
            flickerTime: time,
            flickerEffect: true // Flag to enable flicker effect on particles (shimmer-like)
        };
    }

    /**
     * Apply sparkle animation - firefly-like particle glow
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow and firefly effect data
     */
    applySparkle(anim, progress) {
        // Sparkle effect - make particles glow like fireflies
        // Each particle gets its own random phase for async blinking
        const intensity = anim.params?.intensity || 2.0;

        // Create firefly-like glow pattern for particles
        // Using time-based phase shifting for each particle
        const time = Date.now() * 0.001; // Convert to seconds

        // Main glow pulse for the effect
        const mainPulse = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;

        // This will be used by particles to create firefly effect
        // Each particle will add its own random offset to this
        return {
            particleGlow: intensity, // Intensity for individual particles
            glow: mainPulse, // Gentle overall glow
            fireflyTime: time, // Pass time for particle calculations
            fireflyEffect: true // Flag to enable firefly effect on particles
        };
    }

    /**
     * Apply shimmer animation - subtle ethereal glow
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow, scale, and shimmer effect data
     */
    applyShimmer(anim, progress) {
        // Shimmer effect - subtle, ethereal glow that travels across surface
        // Like moonlight on calm water

        const time = Date.now() * 0.001; // Current time in seconds
        const intensity = anim.params?.intensity || 0.3; // Very subtle

        // Single slow wave for gentle shimmer
        const wave = Math.sin(time * 2 + progress * Math.PI * 2);

        // Very subtle glow variation
        const glowEffect = 1 + wave * intensity;

        // Tiny breathing effect
        const scaleEffect = 1 + wave * 0.01; // Just 1% variation

        return {
            offsetX: 0, // No movement
            offsetY: 0, // No movement
            glow: glowEffect,
            scale: scaleEffect,
            // Particle-specific data
            particleGlow: 1 + wave * 0.2, // Very subtle particle effect
            shimmerTime: time,
            shimmerWave: wave,
            shimmerEffect: true // Flag to enable shimmer effect on particles
        };
    }
}

export default VisualEffectAnimator;
