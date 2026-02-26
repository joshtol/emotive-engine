/**
 * GestureMotionProvider - Provides gesture motion data for particle system and renderer
 * @module GestureMotionProvider
 */

export class GestureMotionProvider {
    /**
     * Create GestureMotionProvider
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.renderer - Renderer instance
     * @param {Object} deps.state - Shared state with currentModularGesture
     */
    constructor(deps) {
        this.renderer = deps.renderer;
        this._state = deps.state;
    }

    /**
     * Get current gesture motion and progress
     * @returns {Object} Gesture motion data
     */
    getGestureMotion() {
        let gestureMotion = null;
        let gestureProgress = 0;

        const currentGesture = this._state.currentModularGesture;

        // First check for modular gesture
        if (currentGesture) {
            ({ gestureMotion, gestureProgress } = this.processModularGesture(currentGesture));
        }
        // Fallback to renderer gesture
        else if (this.renderer && this.renderer.getCurrentGesture) {
            ({ gestureMotion, gestureProgress } = this.processRendererGesture());
        }

        return { gestureMotion, gestureProgress };
    }

    /**
     * Process modular gesture data
     * @param {Object} gesture - Current modular gesture
     * @returns {Object} Gesture motion and progress
     */
    processModularGesture(gesture) {
        const elapsed = performance.now() - gesture.startTime;
        const gestureProgress = Math.min(elapsed / gesture.duration, 1);

        const gestureMotion = {
            type: gesture.type,
            amplitude: 1.0,
            frequency: 1.0,
            intensity: 1.0,
        };

        if (gestureProgress >= 1) {
            this.handleGestureCleanup(gesture);
        }

        return { gestureMotion, gestureProgress };
    }

    /**
     * Handle gesture cleanup when complete
     * @param {Object} gesture - Current gesture
     */
    handleGestureCleanup(gesture) {
        if (!gesture.cleanupPending) {
            gesture.cleanupPending = true;
        } else {
            this._state.currentModularGesture = null;
        }
    }

    /**
     * Process renderer gesture data
     * @returns {Object} Gesture motion and progress
     */
    processRendererGesture() {
        const currentGesture = this.renderer.getCurrentGesture();

        if (currentGesture && currentGesture.particleMotion) {
            return {
                gestureMotion: currentGesture.particleMotion,
                gestureProgress: currentGesture.progress || 0,
            };
        }

        return { gestureMotion: null, gestureProgress: 0 };
    }

    /**
     * Get gesture transform from renderer
     * @returns {Object|null} Gesture transform for visual animations
     */
    getGestureTransform() {
        return this.renderer?.gestureAnimator?.applyGestureAnimations() ?? null;
    }
}
