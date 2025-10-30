/**
 * MovementGestureAnimator - Handles movement gesture animations
 * @module core/renderer/MovementGestureAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles movement gestures: spin, drift, wave, sway, float, orbital, hula, orbit
 */

export class MovementGestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply spin animation - rotation with scale pulse
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with rotation and scale
     */
    applySpin(anim, progress) {
        // Ensure full rotation even if progress doesn't quite reach 1.0
        const actualProgress = Math.min(progress * 1.05, 1.0); // Slight overshoot to ensure completion
        return {
            rotation: actualProgress * anim.params.rotations * 360,
            scale: 1 + Math.sin(progress * Math.PI) * anim.params.scaleAmount
        };
    }

    /**
     * Apply drift animation - gentle movement in random direction
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyDrift(anim, progress) {
        // Initialize drift angle when starting (progress near 0)
        if (progress <= 0.01 && !anim.currentDriftAngle) {
            // Always pick a random angle for drift
            anim.currentDriftAngle = Math.random() * Math.PI * 2; // Random direction in radians
        }

        const distance = anim.params.distance * Math.sin(progress * Math.PI) * this.scaleFactor;
        const angle = anim.currentDriftAngle || 0;

        // Clear the angle when animation completes
        if (progress >= 0.99) {
            anim.currentDriftAngle = null;
        }

        return {
            offsetX: Math.cos(angle) * distance,
            offsetY: Math.sin(angle) * distance
        };
    }

    /**
     * Apply wave animation - infinity symbol motion
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, rotation, scale, and glow
     */
    applyWave(anim, progress) {
        // Completely rewritten wave - a graceful, flowing infinity symbol motion
        const amp = (anim.params.amplitude || 40) * this.scaleFactor;

        // Create a smooth infinity symbol (∞) pattern
        // This feels more like a natural greeting wave
        const t = progress * Math.PI * 2;

        // Infinity symbol parametric equations
        // X: figure-8 horizontal motion
        const infinityX = Math.sin(t) * amp;

        // Y: gentle vertical bob that rises during the wave
        // Creates a "lifting" feeling like a real wave hello
        const liftAmount = -Math.sin(progress * Math.PI) * amp * 0.3; // Lift up during wave
        const infinityY = Math.sin(t * 2) * amp * 0.2 + liftAmount;

        // Add a subtle tilt that follows the wave direction
        // Makes the orb "lean into" the wave
        const tilt = Math.sin(t) * 5; // ±5 degrees of tilt

        // Gentle scale pulse for emphasis
        const scalePulse = 1 + Math.sin(progress * Math.PI * 2) * 0.05; // 5% scale variation

        // Glow brightens slightly during wave
        const glowPulse = 1 + Math.sin(progress * Math.PI) * 0.2; // 20% glow increase

        return {
            offsetX: infinityX,
            offsetY: infinityY,
            rotation: tilt,
            scale: scalePulse,
            glow: glowPulse
        };
    }

    /**
     * Apply sway animation - pendulum-like swaying motion
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, and rotation
     */
    applySway(anim, progress) {
        // Gentle pendulum-like swaying motion for the core
        const swayAmplitude = (anim.params?.amplitude || 30) * this.scaleFactor;
        const swayFrequency = anim.params?.frequency || 1;

        // Sway side to side with a gentle ease
        const swayX = Math.sin(progress * Math.PI * 2 * swayFrequency) * swayAmplitude;

        // Slight vertical bob for realism
        const bobY = Math.sin(progress * Math.PI * 4 * swayFrequency) * swayAmplitude * 0.1;

        // Slight rotation to match the sway
        const rotation = Math.sin(progress * Math.PI * 2 * swayFrequency) * 5; // 5 degrees max

        return {
            offsetX: swayX,
            offsetY: bobY,
            rotation
        };
    }

    /**
     * Apply float animation - ethereal floating with vertical and horizontal drift
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, and scale
     */
    applyFloat(anim, progress) {
        // Ethereal floating motion with both vertical and horizontal drift
        const floatAmplitude = (anim.params?.amplitude || 20) * this.scaleFactor;
        const floatSpeed = anim.params?.speed || 1;

        // Primary vertical float with sine wave
        const floatY = Math.sin(progress * Math.PI * 2 * floatSpeed) * floatAmplitude;

        // Secondary horizontal drift for natural movement
        const driftX = Math.sin(progress * Math.PI * 3 * floatSpeed) * floatAmplitude * 0.3;

        // Slight scale pulsation for breathing effect
        const scalePulse = 1 + Math.sin(progress * Math.PI * 4 * floatSpeed) * 0.02;

        return {
            offsetX: driftX,
            offsetY: floatY,
            scale: scalePulse
        };
    }

    /**
     * Apply orbital animation - particles orbit, core stays still
     * @param {Object} _anim - Animation state object (unused)
     * @param {number} _progress - Animation progress (0-1) (unused)
     * @returns {Object} Transform with no movement
     */
    applyOrbital(_anim, _progress) {
        // Orbital motion - particles orbit around core, core stays still
        // This gesture is for particle motion only, not core movement
        return {
            // No core movement - orbital is a particle-only effect
            offsetX: 0,
            offsetY: 0
        };
    }

    /**
     * Apply hula animation - horizontal figure-8 pattern
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyHula(anim, progress) {
        // Hula motion - horizontal figure-8 pattern
        const amplitude = (anim.params?.amplitude || 40) * this.scaleFactor;
        const t = progress * Math.PI * 2;

        // Figure-8 parametric equations
        const x = Math.sin(t) * amplitude;
        const y = Math.sin(t * 2) * amplitude * 0.5;

        return {
            offsetX: x,
            offsetY: y
        };
    }

    /**
     * Apply orbit animation - circular path around center
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyOrbit(anim, progress) {
        // Orbit motion - circular path around center
        const radius = (anim.params?.radius || 30) * this.scaleFactor;
        const speed = anim.params?.speed || 1;

        // Circular motion
        const angle = progress * Math.PI * 2 * speed;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        return {
            offsetX,
            offsetY
        };
    }
}

export default MovementGestureAnimator;
