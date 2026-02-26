/**
 * BreathGestureAnimator - Handles breathing gesture animations
 * @module core/renderer/BreathGestureAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles breathing-related gestures: breathe, breathIn, breathOut, breathHold, breathHoldEmpty
 */

export class BreathGestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Apply breathe animation - full breathing cycle with holds
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale, glow, and breathPhase
     */
    applyBreathe(anim, progress) {
        // Deliberate, mindful breathing animation
        const { params } = anim;
        const holdPercent = params.particleMotion?.holdPercent || 0.1;

        // Create a breathing curve with holds at peaks
        let breathPhase;
        if (progress < 0.4) {
            // Inhale phase (0-40%)
            breathPhase = Math.sin(((progress / 0.4) * Math.PI) / 2);
        } else if (progress < 0.4 + holdPercent) {
            // Hold at full inhale
            breathPhase = 1.0;
        } else if (progress < 0.9) {
            // Exhale phase
            const exhaleProgress = (progress - 0.4 - holdPercent) / (0.5 - holdPercent);
            breathPhase = Math.cos((exhaleProgress * Math.PI) / 2);
        } else {
            // Hold at full exhale
            breathPhase = 0;
        }

        // Apply scale changes - expand on inhale
        const scaleAmount = params.scaleAmount || 0.25;
        const scale = 1 + breathPhase * scaleAmount;

        // Apply glow changes - brighten on inhale
        const glowAmount = params.glowAmount || 0.4;
        const glow = 1 + breathPhase * glowAmount;

        // Store breath phase for particle system
        anim.breathPhase = breathPhase;

        return {
            scale,
            glow,
            breathPhase, // Pass to particles for synchronized motion
        };
    }

    /**
     * Apply breathIn animation - gradual expansion
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale
     */
    applyBreathIn(anim, progress) {
        const breathScale = 1 + (anim.params.scaleAmount - 1) * Math.sin((progress * Math.PI) / 2);
        return {
            scale: breathScale,
        };
    }

    /**
     * Apply breathOut animation - gradual contraction
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale
     */
    applyBreathOut(anim, progress) {
        const breathScale = 1 - (1 - anim.params.scaleAmount) * Math.sin((progress * Math.PI) / 2);
        return {
            scale: breathScale,
        };
    }

    /**
     * Apply breathHold animation - hold at expanded state
     * @param {Object} anim - Animation state object
     * @param {number} _progress - Animation progress (0-1) - not used
     * @returns {Object} Transform with scale
     */
    applyBreathHold(anim, _progress) {
        // Hold at expanded state
        return {
            scale: anim.params.scaleAmount,
        };
    }

    /**
     * Apply breathHoldEmpty animation - hold at contracted state
     * @param {Object} anim - Animation state object
     * @param {number} _progress - Animation progress (0-1) - not used
     * @returns {Object} Transform with scale
     */
    applyBreathHoldEmpty(anim, _progress) {
        // Hold at contracted state
        return {
            scale: anim.params.scaleAmount,
        };
    }
}

export default BreathGestureAnimator;
