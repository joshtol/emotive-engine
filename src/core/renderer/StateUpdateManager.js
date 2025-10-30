/**
 * StateUpdateManager
 *
 * Manages frame-by-frame state updates for the renderer.
 * Handles:
 * - Undertone modifier application
 * - Color transition updates
 * - Animation timer updates
 * - Gaze offset smoothing
 */
export class StateUpdateManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Update undertone modifiers from state machine
     */
    updateUndertoneModifiers() {
        // Update undertone modifiers every frame during transitions
        if (this.renderer.stateMachine && this.renderer.stateMachine.getWeightedUndertoneModifiers) {
            const weightedModifier = this.renderer.stateMachine.getWeightedUndertoneModifiers();
            if (weightedModifier) {
                this.renderer.applyUndertoneModifiers(weightedModifier);
            } else {
                // Reset to defaults when no undertone
                this.renderer.applyUndertoneModifiers(null);
            }
        }
    }

    /**
     * Update active color transition
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateColorTransition(deltaTime) {
        // Update color transition (if active)
        if (this.renderer.colorTransition && this.renderer.colorTransition.active) {
            this.renderer.updateColorTransition(deltaTime);
        }
    }

    /**
     * Update animation timers
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateAnimationTimers(deltaTime) {
        this.renderer.updateTimers(deltaTime);
    }

    /**
     * Update gaze offset with smoothing
     * Smoothly tracks mouse/touch position or returns to center
     */
    updateGazeOffset() {
        if (this.renderer.state.gazeTrackingEnabled) {
            // When gaze tracking is enabled, follow mouse/touch
            const smoothing = 0.15;
            const maxOffset = 50; // Maximum pixels the orb can move
            this.renderer.state.gazeOffset.x += (this.renderer.state.gazeTarget.x * maxOffset - this.renderer.state.gazeOffset.x) * smoothing;
            this.renderer.state.gazeOffset.y += (this.renderer.state.gazeTarget.y * maxOffset - this.renderer.state.gazeOffset.y) * smoothing;
        } else {
            // When gaze tracking is disabled, return to center
            const smoothing = 0.1;
            this.renderer.state.gazeOffset.x += (0 - this.renderer.state.gazeOffset.x) * smoothing;
            this.renderer.state.gazeOffset.y += (0 - this.renderer.state.gazeOffset.y) * smoothing;
        }
    }

    /**
     * Perform all frame state updates
     * @param {number} deltaTime - Time elapsed since last frame
     */
    performFrameStateUpdates(deltaTime) {
        this.updateUndertoneModifiers();
        this.updateColorTransition(deltaTime);
        this.updateAnimationTimers(deltaTime);
        this.updateGazeOffset();
    }
}
