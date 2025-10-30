/**
 * RenderStateBuilder
 *
 * Builds the render state object used for frame rendering.
 * Handles:
 * - Delta time acquisition
 * - Emotional state extraction
 * - Audio level capture
 * - Gaze offset retrieval
 * - Performance timing setup
 */
export class RenderStateBuilder {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Build complete render state for current frame
     * @returns {Object} Render state with timing, emotional state, and input data
     */
    buildRenderState() {
        const renderStart = this.mascot.debugMode ? performance.now() : 0;
        const deltaTime = this.getDeltaTime();

        const renderState = this.createRenderState();

        return { renderStart, deltaTime, renderState };
    }

    /**
     * Get delta time from animation controller
     * @returns {number} Delta time in milliseconds
     */
    getDeltaTime() {
        return this.mascot.animationController ?
            this.mascot.animationController.deltaTime :
            16.67; // Default fallback value
    }

    /**
     * Create render state object
     * @returns {Object} Render state with emotional and audio properties
     */
    createRenderState() {
        return {
            properties: this.mascot.stateMachine.getCurrentEmotionalProperties(),
            emotion: this.mascot.stateMachine.getCurrentState().emotion,
            undertone: this.mascot.stateMachine.getCurrentState().undertone,
            particleSystem: this.mascot.particleSystem,
            speaking: this.mascot.speaking,
            audioLevel: this.mascot.audioLevelProcessor.getCurrentLevel(),
            gazeOffset: this.getGazeOffset()
        };
    }

    /**
     * Get current gaze offset
     * @returns {Object} Gaze offset with x and y coordinates
     */
    getGazeOffset() {
        return this.mascot.gazeTracker ?
            this.mascot.gazeTracker.currentGaze :
            { x: 0, y: 0 };
    }
}
