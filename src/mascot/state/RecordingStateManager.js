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
     *
     * @example
     * // New DI style:
     * new RecordingStateManager({ errorBoundary, renderer, state, emit })
     *
     * // Legacy style:
     * new RecordingStateManager(mascot)
     */
    constructor(deps) {
        if (deps && deps.errorBoundary && deps.state !== undefined && deps.emit) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.renderer = deps.renderer;
            this._state = deps.state;
            this._emit = deps.emit;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.renderer = mascot.renderer;
            this._state = {
                get recording() { return mascot.recording; },
                set recording(v) { mascot.recording = v; }
            };
            this._emit = (event, data) => mascot.emit(event, data);
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
    }

    /**
     * Start recording state (listening/capturing mode)
     * @returns {Object} Chain target for method chaining
     */
    startRecording() {
        return this.errorBoundary.wrap(() => {
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
        }, 'recording-start', this._chainTarget)();
    }

    /**
     * Stop recording state
     * @returns {Object} Chain target for method chaining
     */
    stopRecording() {
        return this.errorBoundary.wrap(() => {
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
        }, 'recording-stop', this._chainTarget)();
    }
}
