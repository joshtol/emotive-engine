/**
 * ShapeTransformAnimator - Handles shape transformation gesture animations
 * @module core/renderer/ShapeTransformAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles shape transformation gestures: pulse, expand, contract, stretch, morph
 */

export class ShapeTransformAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply pulse animation - rhythmic scale and glow pulsation
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale and glow
     */
    applyPulse(anim, progress) {
        const pulse = Math.sin(progress * Math.PI * anim.params.frequency);
        return {
            scale: 1 + pulse * anim.params.scaleAmount,
            glow: 1 + pulse * anim.params.glowAmount,
        };
    }

    /**
     * Apply expand animation - smooth expansion with glow increase
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale and glow
     */
    applyExpand(anim, progress) {
        // Use scaleAmount or scaleTarget (handle both config formats)
        // Make sure we're expanding, not contracting
        const targetScale = Math.max(
            anim.params.scaleAmount || anim.params.scaleTarget || 1.5,
            1.0
        );
        const easedProgress = Math.sin((progress * Math.PI) / 2); // Smooth ease-out
        const scale = 1 + (targetScale - 1) * easedProgress;
        return {
            scale,
            glow: 1 + Math.abs(anim.params.glowAmount || 0.2) * easedProgress,
        };
    }

    /**
     * Apply contract animation - smooth contraction with glow decrease
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale and glow
     */
    applyContract(anim, progress) {
        // Use scaleAmount or scaleTarget (handle both config formats)
        const targetScale = anim.params.scaleAmount || anim.params.scaleTarget || 0.7;
        const easedProgress = Math.sin((progress * Math.PI) / 2); // Smooth ease-out
        const scale = 1 + (targetScale - 1) * easedProgress;
        return {
            scale,
            glow: 1 + (anim.params.glowAmount || -0.2) * easedProgress,
        };
    }

    /**
     * Apply stretch animation - oscillating scale based on scaleX and scaleY
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale
     */
    applyStretch(anim, progress) {
        const stretch = Math.sin(progress * Math.PI * anim.params.frequency);
        // Note: We'd need to handle scaleX/scaleY separately for proper stretch
        // For now, average them
        const avgScale = (anim.params.scaleX + anim.params.scaleY) / 2;
        return { scale: 1 + (avgScale - 1) * stretch };
    }

    /**
     * Apply morph animation - fluid morphing effect with scale and rotation
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with scale and rotation
     */
    applyMorph(anim, progress) {
        // Fluid morphing effect
        const morph = Math.sin(progress * Math.PI * 2);
        return {
            scale: 1 + morph * 0.1,
            rotation: morph * 10,
        };
    }
}

export default ShapeTransformAnimator;
