/**
 * ExpressionGestureAnimator - Handles expression gesture animations
 * @module core/renderer/ExpressionGestureAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles expression gestures: nod, tilt, slowBlink, look, settle
 */

export class ExpressionGestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply nod animation - vertical oscillation
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetY
     */
    applyNod(anim, progress) {
        const nod = Math.sin(progress * Math.PI * anim.params.frequency) * anim.params.amplitude * this.scaleFactor;
        return { offsetY: nod };
    }

    /**
     * Apply tilt animation - rotation with skew and offset
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with rotation, scaleX, scaleY, offsetX, offsetY
     */
    applyTilt(anim, progress) {
        if (!anim.tiltDirection) {
            // Randomly choose left (-1) or right (1) tilt
            anim.tiltDirection = Math.random() < 0.5 ? -1 : 1;
        }
        const frequency = anim.params.frequency || 2;
        const angle = (anim.params.angle || 15) * Math.PI / 180; // Convert to radians
        const tiltProgress = Math.sin(progress * Math.PI * frequency) * anim.tiltDirection;

        // Apply both rotation and skew to make tilt visible on circular orb
        return {
            rotation: tiltProgress * angle,
            // Skew the orb slightly to show tilt motion
            scaleX: 1 + Math.abs(tiltProgress) * 0.1,  // Widen when tilted
            scaleY: 1 - Math.abs(tiltProgress) * 0.05, // Compress slightly
            // Move slightly with tilt
            offsetX: tiltProgress * 10,
            offsetY: Math.abs(tiltProgress) * -5  // Lift slightly when tilted
        };
    }

    /**
     * Apply slowBlink animation - eye blink simulation using glow
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with glow
     */
    applySlowBlink(anim, progress) {
        // Simulate blinking by scaling vertically
        let scaleY = 1;
        if (progress < 0.3) {
            // Closing
            scaleY = 1 - (progress / 0.3);
        } else if (progress < 0.5) {
            // Closed
            scaleY = 0;
        } else if (progress < 0.8) {
            // Opening
            scaleY = (progress - 0.5) / 0.3;
        } else {
            // Open
            scaleY = 1;
        }

        // Since we can't do scaleY separately, dim the orb instead
        return {
            glow: scaleY
        };
    }

    /**
     * Apply look animation - directional gaze with hold
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and offsetY
     */
    applyLook(anim, progress) {
        // Initialize target position if not set
        if (!anim.targetX) {
            const direction = anim.params.lookDirection;
            const distance = anim.params.lookDistance * 50 * this.scaleFactor; // Convert to pixels and scale

            switch(direction) {
            case 'left':
                anim.targetX = -distance;
                anim.targetY = 0;
                break;
            case 'right':
                anim.targetX = distance;
                anim.targetY = 0;
                break;
            case 'up':
                anim.targetX = 0;
                anim.targetY = -distance;
                break;
            case 'down':
                anim.targetX = 0;
                anim.targetY = distance;
                break;
            default: { // random
                const angle = Math.random() * Math.PI * 2;
                anim.targetX = Math.cos(angle) * distance;
                anim.targetY = Math.sin(angle) * distance;
                break;
            }
            }
        }

        // Smooth look with hold
        let lookProgress = progress;
        if (progress < 0.3) {
            // Move to target
            lookProgress = progress / 0.3;
        } else if (progress < 0.7) {
            // Hold
            lookProgress = 1;
        } else {
            // Return
            lookProgress = 1 - (progress - 0.7) / 0.3;
        }

        return {
            offsetX: anim.targetX * lookProgress,
            offsetY: anim.targetY * lookProgress
        };
    }

    /**
     * Apply settle animation - damped oscillation
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetY and scale
     */
    applySettle(anim, progress) {
        // Damped oscillation
        const wobble = Math.sin(progress * Math.PI * anim.params.wobbleFreq) *
                      Math.exp(-progress * 3) * 20 * this.scaleFactor;
        return {
            offsetY: wobble,
            scale: 1 + wobble * 0.01
        };
    }
}

export default ExpressionGestureAnimator;
