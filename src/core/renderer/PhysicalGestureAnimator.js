/**
 * PhysicalGestureAnimator - Handles physical gesture animations
 * @module core/renderer/PhysicalGestureAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles gestures that involve physical motion: bounce, shake, jump, vibrate, wiggle
 */

export class PhysicalGestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply bounce animation - vertical bouncing motion
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetY
     */
    applyBounce(anim, progress) {
        const bounce = Math.abs(Math.sin(progress * Math.PI * anim.params.frequency)) * anim.params.amplitude * this.scaleFactor;
        // Apply effects
        const multiplier = anim.params.effects && anim.params.effects.includes('gravity') ? 0.6 : 1;
        return { offsetY: -bounce * multiplier };
    }

    /**
     * Apply shake animation - rapid oscillation in random direction
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyShake(anim, progress) {
        // Initialize random direction for this shake if not set
        if (!anim.randomAngle) {
            anim.randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
        }
        const decay = anim.params.decay ? (1 - progress) : 1;
        const shake = Math.sin(progress * Math.PI * anim.params.frequency) * anim.params.amplitude * decay * this.scaleFactor;
        return {
            offsetX: shake * Math.cos(anim.randomAngle),
            offsetY: shake * Math.sin(anim.randomAngle)
        };
    }

    /**
     * Apply jump animation - parabolic jump with squash and stretch
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetY and optional scaleX/scaleY
     */
    applyJump(anim, progress) {
        let yOffset = 0;
        let scale = 1;
        let scaleX, scaleY;

        if (progress < 0.2) {
            // Squash phase
            const squashProgress = progress / 0.2;
            scale = 1 - (1 - anim.params.squashAmount) * squashProgress;
        } else if (progress < 0.7) {
            // Jump phase
            const jumpProgress = (progress - 0.2) / 0.5;
            const jumpCurve = Math.sin(jumpProgress * Math.PI);
            yOffset = -anim.params.jumpHeight * jumpCurve * this.scaleFactor;
            scale = anim.params.squashAmount +
                   (anim.params.stretchAmount - anim.params.squashAmount) * jumpCurve;
        } else {
            // Landing phase
            const landProgress = (progress - 0.7) / 0.3;
            scale = anim.params.stretchAmount -
                   (anim.params.stretchAmount - 1) * landProgress;
        }

        // Apply gravity effect with squash and stretch if enabled
        if (anim.params.effects && anim.params.effects.includes('gravity')) {
            // Squash horizontally during jump peak, stretch vertically
            const jumpPhase = progress < 0.7 ? (progress - 0.2) / 0.5 : 0;
            const squashEffect = Math.sin(jumpPhase * Math.PI);
            scaleX = 1 + squashEffect * 0.2;
            scaleY = 1 - squashEffect * 0.15;
        }

        const result = {
            offsetY: yOffset,
            scale
        };

        if (scaleX !== undefined) result.scaleX = scaleX;
        if (scaleY !== undefined) result.scaleY = scaleY;

        return result;
    }

    /**
     * Apply vibrate animation - high-frequency small oscillations
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyVibrate(anim, progress) {
        // Initialize random vibration pattern if not set
        if (!anim.vibrateAngles) {
            anim.vibrateAngles = {
                x: Math.random() * 2 - 1, // Random factor between -1 and 1
                y: Math.random() * 2 - 1
            };
            // Normalize to unit vector
            const mag = Math.sqrt(anim.vibrateAngles.x ** 2 + anim.vibrateAngles.y ** 2);
            anim.vibrateAngles.x /= mag;
            anim.vibrateAngles.y /= mag;
        }

        const amplitude = anim.params.amplitude || 5;
        const frequency = anim.params.frequency || 20;

        const vibration = Math.sin(progress * Math.PI * 2 * frequency) * amplitude * this.scaleFactor;

        return {
            offsetX: vibration * anim.vibrateAngles.x,
            offsetY: vibration * anim.vibrateAngles.y
        };
    }

    /**
     * Apply wiggle animation - hip-hop style 4-phase wiggle
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, and rotation
     */
    applyWiggle(anim, progress) {
        // Hip-hop wiggle - 4 phase: center -> side -> opposite -> side -> center
        const amplitude = (anim.params?.amplitude || 15) * this.scaleFactor;

        // Random starting direction (1 for right, -1 for left)
        if (anim.wiggleDirection === undefined) {
            anim.wiggleDirection = Math.random() < 0.5 ? 1 : -1;
        }
        const direction = anim.wiggleDirection;

        // 4-phase movement pattern
        let wiggleX = 0;
        let rotation = 0;

        if (progress < 0.25) {
            // Phase 1: Center to first side (0-25%)
            const phase = progress / 0.25;
            wiggleX = amplitude * direction * phase;
            rotation = 3 * direction * phase;
        } else if (progress < 0.5) {
            // Phase 2: First side to opposite side (25-50%)
            const phase = (progress - 0.25) / 0.25;
            wiggleX = amplitude * direction * (1 - 2 * phase);
            rotation = 3 * direction * (1 - 2 * phase);
        } else if (progress < 0.75) {
            // Phase 3: Opposite side back to first side (50-75%)
            const phase = (progress - 0.5) / 0.25;
            wiggleX = amplitude * -direction * (1 - 2 * phase);
            rotation = 3 * -direction * (1 - 2 * phase);
        } else {
            // Phase 4: First side back to center (75-100%)
            const phase = (progress - 0.75) / 0.25;
            wiggleX = amplitude * direction * (1 - phase);
            rotation = 3 * direction * (1 - phase);
        }

        // Subtle bounce synced with movement
        const bounceY = Math.abs(Math.sin(progress * Math.PI * 4)) * amplitude * 0.15;

        return {
            offsetX: wiggleX,
            offsetY: -bounceY,
            rotation
        };
    }
}

export default PhysicalGestureAnimator;
