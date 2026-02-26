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
 *
 * @module RenderStateBuilder
 */
export class RenderStateBuilder {
    /**
     * Create RenderStateBuilder
     *
     * @param {Object} deps - Dependencies
     * @param {Object} [deps.animationController] - Animation controller instance
     * @param {Object} [deps.audioLevelProcessor] - Audio level processor instance
     * @param {Object} [deps.gazeTracker] - Gaze tracker instance
     * @param {Object} deps.particleSystem - Particle system instance
     * @param {Object} deps.stateMachine - State machine instance
     * @param {Object} deps.state - Shared state with debugMode and speaking properties
     */
    constructor(deps) {
        this.animationController = deps.animationController || null;
        this.audioLevelProcessor = deps.audioLevelProcessor || null;
        this.gazeTracker = deps.gazeTracker || null;
        this.particleSystem = deps.particleSystem;
        this.stateMachine = deps.stateMachine;
        this._state = deps.state || { debugMode: false, speaking: false };
    }

    /**
     * Build complete render state for current frame
     * @returns {Object} Render state with timing, emotional state, and input data
     */
    buildRenderState() {
        const renderStart = this._state.debugMode ? performance.now() : 0;
        const deltaTime = this.getDeltaTime();

        const renderState = this.createRenderState();

        return { renderStart, deltaTime, renderState };
    }

    /**
     * Get delta time from animation controller
     * @returns {number} Delta time in milliseconds
     */
    getDeltaTime() {
        return this.animationController ? this.animationController.deltaTime : 16.67; // Default fallback value
    }

    /**
     * Create render state object
     * @returns {Object} Render state with emotional and audio properties
     */
    createRenderState() {
        return {
            properties: this.stateMachine.getCurrentEmotionalProperties(),
            emotion: this.stateMachine.getCurrentState().emotion,
            undertone: this.stateMachine.getCurrentState().undertone,
            particleSystem: this.particleSystem,
            speaking: this._state.speaking,
            audioLevel: this.audioLevelProcessor ? this.audioLevelProcessor.getCurrentLevel() : 0,
            gazeOffset: this.getGazeOffset(),
        };
    }

    /**
     * Get current gaze offset
     * @returns {Object} Gaze offset with x and y coordinates
     */
    getGazeOffset() {
        return this.gazeTracker ? this.gazeTracker.currentGaze : { x: 0, y: 0 };
    }
}
