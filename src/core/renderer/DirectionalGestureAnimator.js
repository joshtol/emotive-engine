/**
 * DirectionalGestureAnimator - Handles directional gesture animations
 * @module core/renderer/DirectionalGestureAnimator
 *
 * Extracted from GestureAnimator as part of god object refactoring.
 * Handles directional gestures: point, lean, reach
 */

export class DirectionalGestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.scaleFactor = renderer.scaleFactor || 1;
    }

    /**
     * Apply point animation - directional lean/stretch with return to center
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, scale, rotation
     */
    applyPoint(anim, progress) {
        // Point gesture - directional lean/stretch with return to center

        // Random direction if not specified - only left or right
        if (anim.pointDirection === undefined) {
            // Randomly choose left (1) or right (-1)
            anim.pointDirection = Math.random() < 0.5 ? -1 : 1;
        }

        const direction =
            anim.params?.direction !== undefined ? anim.params.direction : anim.pointDirection;
        const distance = (anim.params?.distance || 40) * this.scaleFactor;

        // Three-phase animation:
        // 0.0-0.4: Move to point position
        // 0.4-0.6: Hold at point
        // 0.6-1.0: Return to center
        let motionProgress;
        let scaleProgress;

        if (progress < 0.4) {
            // Phase 1: Move to point (ease out)
            motionProgress = 1 - Math.pow(1 - progress / 0.4, 3);
            scaleProgress = motionProgress;
        } else if (progress < 0.6) {
            // Phase 2: Hold at point
            motionProgress = 1.0;
            scaleProgress = 1.0;
        } else {
            // Phase 3: Return to center (ease in)
            motionProgress = Math.pow(1 - (progress - 0.6) / 0.4, 3);
            scaleProgress = motionProgress;
        }

        // Move in direction (direction is -1 for left, 1 for right)
        const offsetX = direction * distance * motionProgress;
        const offsetY = -Math.abs(distance * 0.15 * motionProgress); // Slight upward movement when pointing

        // Stretch effect in pointing direction
        const scale = 1 + 0.15 * scaleProgress; // 15% stretch

        // Add slight tilt when pointing
        const rotation = direction * 5 * scaleProgress; // Tilt 5 degrees in pointing direction

        return {
            offsetX,
            offsetY,
            scale,
            rotation,
        };
    }

    /**
     * Apply lean animation - tilt to one side
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX and rotation
     */
    applyLean(anim, progress) {
        // Lean gesture - tilt to one side
        const angle = anim.params?.angle || 15; // Degrees
        const side = anim.params?.side || 1; // 1 for right, -1 for left

        // Smooth ease in-out
        const easedProgress = Math.sin(progress * Math.PI);

        // Apply rotation and slight offset
        const rotation = angle * side * easedProgress;
        const offsetX = side * 10 * this.scaleFactor * easedProgress;

        return {
            offsetX,
            rotation,
        };
    }

    /**
     * Apply reach animation - stretch upward or outward
     * @param {Object} anim - Animation state object
     * @param {number} progress - Animation progress (0-1)
     * @returns {Object} Transform with offsetX, offsetY, and scale
     */
    applyReach(anim, progress) {
        // Reach gesture - stretch upward or outward
        const direction =
            anim.params?.direction !== undefined ? anim.params.direction : -Math.PI / 2; // Default upward
        const distance = (anim.params?.distance || 40) * this.scaleFactor;

        // Two-phase motion: reach out, then return
        let motionProgress;
        if (progress < 0.4) {
            // Reaching phase
            motionProgress = progress / 0.4;
        } else if (progress < 0.6) {
            // Hold phase
            motionProgress = 1;
        } else {
            // Return phase
            motionProgress = 1 - (progress - 0.6) / 0.4;
        }

        // Apply easing
        motionProgress = motionProgress * motionProgress * (3 - 2 * motionProgress);

        const offsetX = Math.cos(direction) * distance * motionProgress;
        const offsetY = Math.sin(direction) * distance * motionProgress;

        // Stretch slightly when reaching
        const scale = 1 + motionProgress * 0.15;

        return {
            offsetX,
            offsetY,
            scale,
        };
    }
}

export default DirectionalGestureAnimator;
