/**
 * AudioLevelCallbackManager
 *
 * Manages audio level processor callbacks and event handling.
 * Handles:
 * - Audio level updates
 * - Volume spike detection and gesture triggering
 * - Audio processing error handling
 * - Event emission for audio data
 */
export class AudioLevelCallbackManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Setup all audio level processor callbacks
     */
    setupAudioLevelProcessorCallbacks() {
        this.setupLevelUpdateCallback();
        this.setupVolumeSpikeCallback();
        this.setupErrorCallback();
    }

    /**
     * Setup audio level update callback
     */
    setupLevelUpdateCallback() {
        this.mascot.audioLevelProcessor.onLevelUpdate(data => {
            // Update renderer with current audio level
            this.mascot.renderer.updateAudioLevel(data.level);

            // Emit audio level update event
            this.mascot.emit('audioLevelUpdate', {
                level: data.level,
                rawData: Array.from(data.rawData),
                timestamp: data.timestamp
            });
        });
    }

    /**
     * Setup volume spike callback for gesture triggering
     */
    setupVolumeSpikeCallback() {
        this.mascot.audioLevelProcessor.onVolumeSpike(spikeData => {
            const gestureTriggered = this.handleVolumeSpike();

            // Emit volume spike event
            this.mascot.emit('volumeSpike', {
                ...spikeData,
                gestureTriggered
            });

            if (gestureTriggered) {
                // Volume spike detected - triggered pulse gesture
            }
        });
    }

    /**
     * Handle volume spike and trigger gesture if appropriate
     * @returns {boolean} True if gesture was triggered
     */
    handleVolumeSpike() {
        // Check if any particle has an active gesture
        const hasActiveGesture = this.mascot.particleSystem.particles.some(p => p.gestureProgress < 1);

        if (!hasActiveGesture) {
            // Execute pulse gesture through express method
            this.mascot.express('pulse');
            return true;
        }

        return false;
    }

    /**
     * Setup audio processing error callback
     */
    setupErrorCallback() {
        this.mascot.audioLevelProcessor.onError(errorData => {
            // AudioLevelProcessor error
            this.mascot.emit('audioProcessingError', errorData);
        });
    }
}
