/**
 * GestureMotionProvider
 *
 * Provides gesture motion data for particle system and renderer.
 * Handles:
 * - Modular gesture progress tracking
 * - Renderer gesture fallback
 * - Gesture cleanup timing
 * - Gesture transform extraction
 */
export class GestureMotionProvider {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Get current gesture motion and progress
     * @returns {Object} Gesture motion data with type, amplitude, frequency, intensity, and progress
     */
    getGestureMotion() {
        let gestureMotion = null;
        let gestureProgress = 0;

        // First check for modular gesture
        if (this.mascot.currentModularGesture) {
            ({ gestureMotion, gestureProgress } = this.processModularGesture());
        }
        // Fallback to renderer gesture
        else if (this.mascot.renderer && this.mascot.renderer.getCurrentGesture) {
            ({ gestureMotion, gestureProgress } = this.processRendererGesture());
        }

        return { gestureMotion, gestureProgress };
    }

    /**
     * Process modular gesture data
     * @returns {Object} Gesture motion and progress
     */
    processModularGesture() {
        const elapsed = performance.now() - this.mascot.currentModularGesture.startTime;
        const gestureProgress = Math.min(elapsed / this.mascot.currentModularGesture.duration, 1);

        const gestureMotion = {
            type: this.mascot.currentModularGesture.type,
            amplitude: 1.0,
            frequency: 1.0,
            intensity: 1.0
        };

        if (gestureProgress >= 1) {
            this.handleGestureCleanup();
        }

        return { gestureMotion, gestureProgress };
    }

    /**
     * Handle gesture cleanup when complete
     */
    handleGestureCleanup() {
        // Pass progress = 1 to trigger cleanup
        // Clear gesture on next frame after cleanup
        if (!this.mascot.currentModularGesture.cleanupPending) {
            this.mascot.currentModularGesture.cleanupPending = true;
        } else {
            // Cleanup was called last frame, now clear the gesture
            this.mascot.currentModularGesture = null;
        }
    }

    /**
     * Process renderer gesture data
     * @returns {Object} Gesture motion and progress
     */
    processRendererGesture() {
        const currentGesture = this.mascot.renderer.getCurrentGesture();

        if (currentGesture && currentGesture.particleMotion) {
            return {
                gestureMotion: currentGesture.particleMotion,
                gestureProgress: currentGesture.progress || 0
            };
        }

        return { gestureMotion: null, gestureProgress: 0 };
    }

    /**
     * Get gesture transform from renderer
     * @returns {Object|null} Gesture transform for visual animations
     */
    getGestureTransform() {
        return this.mascot.renderer.gestureAnimator ?
            this.mascot.renderer.gestureAnimator.applyGestureAnimations() :
            null;
    }
}
