/**
 * RotationBrake - Simple braking system using DEGREES like the working demo
 * @module core/animation/RotationBrake
 */

export class RotationBrake {
    constructor(renderer) {
        this.renderer = renderer;

        // Braking state - EXACTLY like the demo
        this.brakeStartTime = null;
        this.brakeDuration = 2500; // Will be calculated dynamically
        this.brakeStartRotation = 0;
        this.brakeTargetRotation = 0;
        this.brakeStartVelocity = 0;

        // Callbacks
        this.onComplete = null;
        this.onProgress = null;

        // Constants
        this.DURATION_FACTOR = 14; // Tuned for natural deceleration feel
    }

    /**
     * Brake to upright position (0 degrees)
     * @param {Object} options - Brake options
     * @returns {Promise} Resolves when braking complete
     */
    brakeToUpright(options = {}) {
        return this.brakeToTarget(0, options);
    }

    /**
     * Brake to nearest multiple of given angle
     * @param {number} angleStep - Angle step in DEGREES (e.g., 90 for 90°)
     * @param {Object} options - Brake options
     * @returns {Promise} Resolves when braking complete
     */
    brakeToNearest(angleStep, options = {}) {
        const currentAngle = this.renderer.state.manualRotation || 0;
        const steps = Math.round(currentAngle / angleStep);
        const targetAngle = steps * angleStep;
        return this.brakeToTarget(targetAngle, options);
    }

    /**
     * Brake to specific target angle
     * @param {number} targetAngle - Target angle in DEGREES (0 = upright)
     * @param {Object} options - Brake options
     * @returns {Promise} Resolves when braking complete
     */
    brakeToTarget(targetAngle, options = {}) {
        return new Promise(resolve => {
            const {
                onProgress = null,
                onComplete = null
            } = options;

            this.onProgress = onProgress;
            this.onComplete = onComplete;

            // Get current state - ALL IN DEGREES
            const currentVelocity = this.renderer.state.rotationSpeed || 0;
            const rotation = this.renderer.state.manualRotation || 0;

            // Do nothing if not moving or already braking
            if (currentVelocity === 0 || this.brakeStartTime) {
                resolve();
                return;
            }

            // Initialize braking state
            this.brakeStartTime = performance.now();
            this.brakeStartRotation = rotation;
            this.brakeStartVelocity = currentVelocity;

            // Calculate the nearest upright target rotation
            if (targetAngle === 0) {
                // Special case for upright
                if (currentVelocity > 0) { // Spinning clockwise
                    this.brakeTargetRotation = (Math.floor(rotation / 360) + 1) * 360;
                } else { // Spinning counter-clockwise
                    this.brakeTargetRotation = Math.floor(rotation / 360) * 360;
                }
            } else {
                // General case
                const normalizedTarget = targetAngle % 360;
                const baseCycles = Math.floor(rotation / 360);

                if (currentVelocity > 0) {
                    if (normalizedTarget > (rotation % 360)) {
                        this.brakeTargetRotation = baseCycles * 360 + normalizedTarget;
                    } else {
                        this.brakeTargetRotation = (baseCycles + 1) * 360 + normalizedTarget;
                    }
                } else {
                    if (normalizedTarget < (rotation % 360)) {
                        this.brakeTargetRotation = baseCycles * 360 + normalizedTarget;
                    } else {
                        this.brakeTargetRotation = (baseCycles - 1) * 360 + normalizedTarget;
                    }
                }
            }

            // DYNAMIC DURATION CALCULATION - EXACTLY like the demo
            const angleToTravel = Math.abs(this.brakeTargetRotation - this.brakeStartRotation);
            this.brakeDuration = Math.max(500, (angleToTravel / Math.abs(currentVelocity)) * this.DURATION_FACTOR * 5);

            console.warn('Brake started:', {
                from: `${rotation.toFixed(1)}°`,
                to: `${this.brakeTargetRotation.toFixed(1)}°`,
                velocity: currentVelocity,
                duration: `${this.brakeDuration.toFixed(0)}ms`
            });

            // Stop adding velocity immediately
            this.renderer.setRotationSpeed(0);

            this.resolvePromise = resolve;
        });
    }

    /**
     * Update brake state - called by renderer each frame
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     * @returns {Object|null} - Rotation update or null if not braking
     */
    updateBrake(currentTime) {
        if (!this.brakeStartTime) {
            return null; // Not braking
        }

        const elapsed = currentTime - this.brakeStartTime;
        const progress = Math.min(elapsed / this.brakeDuration, 1);

        // Ease-out quartic for smooth deceleration (starts fast, ends slow)
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        // Calculate new rotation based on eased progress
        const rotation = this.brakeStartRotation +
            (this.brakeTargetRotation - this.brakeStartRotation) * easedProgress;

        // Calculate virtual speed for UI (decreases with progress)
        const virtualSpeed = this.brakeStartVelocity * Math.pow(1 - easedProgress, 2);

        // Progress callback
        if (this.onProgress) {
            this.onProgress(easedProgress, virtualSpeed, rotation);
        }

        if (progress >= 1) {
            // Stop the animation when braking is complete
            this.brakeStartTime = null;

            console.warn('Brake complete:', {
                target: `${this.brakeTargetRotation.toFixed(1)}°`,
                duration: `${elapsed.toFixed(0)}ms`
            });

            this.complete();

            // Return final position
            return {
                rotation: this.brakeTargetRotation,
                speed: 0,
                complete: true
            };
        }

        // Continue braking
        return {
            rotation,
            speed: virtualSpeed,
            complete: false
        };
    }

    /**
     * Stop any active braking
     */
    stop() {
        this.brakeStartTime = null;
    }

    /**
     * Complete the braking operation
     * @private
     */
    complete() {
        if (this.onComplete) {
            this.onComplete();
        }

        if (this.resolvePromise) {
            this.resolvePromise();
            this.resolvePromise = null;
        }
    }

    /**
     * Check if currently braking
     * @returns {boolean}
     */
    isBraking() {
        return this.brakeStartTime !== null;
    }

    /**
     * Emergency stop - immediately halt rotation
     */
    emergencyStop() {
        this.stop();
        this.renderer.setRotationSpeed(0);
        this.complete();
    }

    /**
     * Get current brake progress
     * @returns {number} Progress from 0 to 1
     */
    getProgress() {
        if (!this.brakeStartTime) return 0;
        const elapsed = performance.now() - this.brakeStartTime;
        return Math.min(elapsed / this.brakeDuration, 1);
    }

    /**
     * Clean up all resources and references
     * Prevents memory leaks by nulling renderer references and clearing state
     */
    destroy() {
        // Stop any active braking
        this.stop();

        // Clear callbacks to prevent retention
        this.onComplete = null;
        this.onProgress = null;

        // Clear promise reference
        this.resolvePromise = null;

        // Null renderer reference
        this.renderer = null;

        // Clear internal state
        this.brakeStartTime = null;
        this.brakeStartRotation = 0;
        this.brakeTargetRotation = 0;
        this.brakeStartVelocity = 0;
    }
}

export default RotationBrake;