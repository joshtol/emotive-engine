/**
 * PositionJitterManager
 *
 * Manages position modifications and jitter effects for rendering.
 * Handles:
 * - Blink squish effect on core radius
 * - Jitter effects (episodic and regular)
 * - Final position calculation with gaze offset
 */
export class PositionJitterManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Apply blink squish effect to core radius
     * @param {number} coreRadius - Current core radius
     * @returns {number} Modified core radius
     */
    applyBlinkSquish(coreRadius) {
        // Apply blinking (only when not sleeping)
        if (!this.renderer.state.sleeping) {
            const blinkScale = this.renderer.eyeRenderer.getBlinkScale();
            coreRadius *= blinkScale; // Apply blink squish
        }
        return coreRadius;
    }

    /**
     * Calculate jitter values
     * @param {number} coreRadius - Current core radius
     * @param {number} glowRadius - Current glow radius
     * @returns {Object} Jitter offsets and modified radii
     */
    calculateJitter(coreRadius, glowRadius) {
        let jitterX = 0,
            jitterY = 0;
        const jitterAmount = this.renderer.state.jitterAmount || 0;

        // Handle episodic effects for undertones
        if (this.renderer.currentUndertone) {
            ({ jitterX, jitterY, coreRadius, glowRadius } =
                this.renderer.episodicEffectController.updateEpisodicEffects(
                    this.renderer.currentUndertone,
                    jitterX,
                    jitterY,
                    coreRadius,
                    glowRadius
                ));
        } else if (this.renderer.state.coreJitter || jitterAmount > 0) {
            // Regular jitter for other emotions
            const jitterStrength = Math.max(
                jitterAmount,
                this.renderer.state.coreJitter ? this.renderer.scaleValue(2) : 0
            );
            jitterX = (Math.random() - 0.5) * jitterStrength;
            jitterY = (Math.random() - 0.5) * jitterStrength;
        }

        return { jitterX, jitterY, coreRadius, glowRadius };
    }

    /**
     * Calculate final position with gaze offset and jitter
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} jitterX - Jitter X offset
     * @param {number} jitterY - Jitter Y offset
     * @returns {Object} Final core position
     */
    calculateFinalPosition(centerX, centerY, jitterX, jitterY) {
        // Calculate positions with gaze offset
        const coreX = centerX + this.renderer.state.gazeOffset.x + jitterX;
        const coreY = centerY + this.renderer.state.gazeOffset.y + jitterY;

        return { coreX, coreY };
    }

    /**
     * Apply all position modifications and calculate final position
     * @param {number} centerX - Initial center X
     * @param {number} centerY - Initial center Y
     * @param {number} rotationAngle - Initial rotation angle
     * @param {number} coreRadius - Initial core radius
     * @param {number} glowRadius - Initial glow radius
     * @returns {Object} All modified values
     */
    applyAllModifications(centerX, centerY, rotationAngle, coreRadius, glowRadius) {
        // Apply blink squish
        coreRadius = this.applyBlinkSquish(coreRadius);

        // Calculate jitter
        let jitterX, jitterY;
        ({ jitterX, jitterY, coreRadius, glowRadius } = this.calculateJitter(
            coreRadius,
            glowRadius
        ));

        // Calculate final position
        const { coreX, coreY } = this.calculateFinalPosition(centerX, centerY, jitterX, jitterY);

        return { coreX, coreY, rotationAngle, coreRadius, glowRadius };
    }
}
