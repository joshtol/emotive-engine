import { RotationBrake } from '../animation/RotationBrake.js';

/**
 * RotationManager - Manages rotation state and animations for the emotive renderer
 *
 * Handles:
 * - Manual rotation control (speed and angle)
 * - Rotation brake system integration
 * - Gesture rotation accumulation
 * - Rotation state updates per frame
 *
 * @class RotationManager
 */
export class RotationManager {
    /**
     * Create a RotationManager
     * @param {Object} renderer - Reference to the EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Initialize rotation brake
        this.rotationBrake = new RotationBrake(renderer);

        // Note: rotation state (manualRotation, rotationSpeed, lastRotationUpdate)
        // is initialized in renderer.state object before this constructor runs
    }

    /**
     * Set manual rotation speed
     * @param {number} speed - Rotation speed in degrees per frame (like velocity)
     */
    setRotationSpeed(speed) {
        this.renderer.state.rotationSpeed = speed;
    }

    /**
     * Set manual rotation angle directly (for scratching)
     * @param {number} angle - Rotation angle in DEGREES
     */
    setRotationAngle(angle) {
        this.renderer.state.manualRotation = angle;
    }

    /**
     * Get the current rotation angle in degrees
     * @returns {number} Current rotation angle in degrees
     */
    getRotationAngle() {
        return this.renderer.state.manualRotation;
    }

    /**
     * Get the current rotation speed
     * @returns {number} Current rotation speed in degrees per frame
     */
    getRotationSpeed() {
        return this.renderer.state.rotationSpeed;
    }

    /**
     * Check if the rotation brake is active
     * @returns {boolean} True if brake is active
     */
    isBraking() {
        return this.rotationBrake && this.rotationBrake.isBraking();
    }

    /**
     * Update rotation state for the current frame
     * Handles both braking and normal rotation
     * @param {number} now - Current timestamp from performance.now()
     */
    updateRotation(now) {
        // Check if brake is active and update rotation accordingly
        if (this.rotationBrake && this.rotationBrake.isBraking()) {
            // Brake is active - let it control rotation
            const brakeUpdate = this.rotationBrake.updateBrake(now);
            if (brakeUpdate) {
                this.renderer.state.manualRotation = brakeUpdate.rotation;
                this.renderer.state.rotationSpeed = brakeUpdate.complete ? 0 : brakeUpdate.speed;
            }
        } else if (this.renderer.state.rotationSpeed !== 0) {
            // Normal rotation update - just add velocity each frame (DEGREES)
            this.renderer.state.manualRotation += this.renderer.state.rotationSpeed;
        }

        this.renderer.state.lastRotationUpdate = now;
    }

    /**
     * Calculate total rotation angle including gestures and manual rotation
     * @param {number} gestureRotation - Rotation from gestures in degrees
     * @param {number} ambientRotation - Rotation from ambient effects in degrees (optional)
     * @returns {number} Total rotation in radians (for canvas rendering)
     */
    calculateTotalRotation(gestureRotation = 0, ambientRotation = 0) {
        // Accumulate all rotation sources (in degrees)
        const totalDegrees = gestureRotation + ambientRotation + this.renderer.state.manualRotation;

        // Convert to radians for canvas rendering
        return totalDegrees * Math.PI / 180;
    }

    /**
     * Apply rotation transform to canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} rotationRadians - Rotation angle in radians
     */
    applyRotation(ctx, rotationRadians) {
        if (rotationRadians !== 0) {
            ctx.rotate(rotationRadians);
        }
    }

    /**
     * Reset rotation state to default values
     */
    reset() {
        this.renderer.state.manualRotation = 0;
        this.renderer.state.rotationSpeed = 0;
        this.renderer.state.lastRotationUpdate = performance.now();
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.rotationBrake) {
            // RotationBrake doesn't have a destroy method, but clear the reference
            this.rotationBrake = null;
        }
    }
}
