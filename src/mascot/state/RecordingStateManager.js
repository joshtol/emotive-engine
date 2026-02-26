/**
 * RecordingStateManager
 *
 * Manages recording state for listening/capturing mode.
 * Handles:
 * - Recording state toggling
 * - Renderer integration for visual feedback
 * - Recording event emissions
 * - State validation
 *
 * @module RecordingStateManager
 */
export class RecordingStateManager {
    /**
     * Create RecordingStateManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.renderer - Renderer instance
     * @param {Object} deps.state - Shared state with recording property
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation (core deps only - others set post-init)
        if (!deps.errorBoundary) throw new Error('RecordingStateManager: errorBoundary required');
        if (!deps.emit) throw new Error('RecordingStateManager: emit required');

        this.errorBoundary = deps.errorBoundary;
        this.renderer = deps.renderer || null;
        this._state = deps.state || { recording: false };
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Start recording state (listening/capturing mode)
     * @returns {Object} Chain target for method chaining
     */
    startRecording() {
        return this.errorBoundary.wrap(
            () => {
                if (this._state.recording) {
                    // Already recording
                    return this._chainTarget;
                }

                this._state.recording = true;

                // Update renderer if using Emotive style
                if (this.renderer && this.renderer.startRecording) {
                    this.renderer.startRecording();
                }

                // Emit recording started event
                this._emit('recordingStarted');

                // Recording started
                return this._chainTarget;
            },
            'recording-start',
            this._chainTarget
        )();
    }

    /**
     * Stop recording state
     * @returns {Object} Chain target for method chaining
     */
    stopRecording() {
        return this.errorBoundary.wrap(
            () => {
                if (!this._state.recording) {
                    // Not currently recording
                    return this._chainTarget;
                }

                this._state.recording = false;

                // Update renderer if using Emotive style
                if (this.renderer && this.renderer.stopRecording) {
                    this.renderer.stopRecording();
                }

                // Emit recording stopped event
                this._emit('recordingStopped');

                // Recording stopped
                return this._chainTarget;
            },
            'recording-stop',
            this._chainTarget
        )();
    }
}
