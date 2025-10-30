/**
 * RecordingStateManager
 *
 * Manages recording state for listening/capturing mode.
 * Handles:
 * - Recording state toggling
 * - Renderer integration for visual feedback
 * - Recording event emissions
 * - State validation
 */
export class RecordingStateManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Start recording state (listening/capturing mode)
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    startRecording() {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.recording) {
                // Already recording
                return this.mascot;
            }

            this.mascot.recording = true;

            // Update renderer if using Emotive style
            if (this.mascot.renderer && this.mascot.renderer.startRecording) {
                this.mascot.renderer.startRecording();
            }

            // Emit recording started event
            this.mascot.emit('recordingStarted');

            // Recording started
            return this.mascot;
        }, 'recording-start', this.mascot)();
    }

    /**
     * Stop recording state
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stopRecording() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.recording) {
                // Not currently recording
                return this.mascot;
            }

            this.mascot.recording = false;

            // Update renderer if using Emotive style
            if (this.mascot.renderer && this.mascot.renderer.stopRecording) {
                this.mascot.renderer.stopRecording();
            }

            // Emit recording stopped event
            this.mascot.emit('recordingStopped');

            // Recording stopped
            return this.mascot;
        }, 'recording-stop', this.mascot)();
    }
}
