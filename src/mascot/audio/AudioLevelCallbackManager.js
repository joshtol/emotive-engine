/**
 * AudioLevelCallbackManager
 *
 * Manages audio level processor callbacks and event handling.
 * Handles:
 * - Audio level updates
 * - Volume spike detection and gesture triggering
 * - Audio processing error handling
 * - Event emission for audio data
 *
 * @module AudioLevelCallbackManager
 */
export class AudioLevelCallbackManager {
    /**
     * Create AudioLevelCallbackManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.audioLevelProcessor - Audio level processor instance
     * @param {Object} deps.renderer - Renderer instance
     * @param {Object} deps.particleSystem - Particle system instance
     * @param {Function} deps.express - Express gesture function
     * @param {Function} deps.emit - Event emission function
     *
     * @example
     * // New DI style:
     * new AudioLevelCallbackManager({ audioLevelProcessor, renderer, particleSystem, express, emit })
     *
     * // Legacy style:
     * new AudioLevelCallbackManager(mascot)
     */
    constructor(deps) {
        // Check for explicit DI style (has _diStyle marker property)
        if (deps && deps._diStyle === true) {
            // New DI style
            this.audioLevelProcessor = deps.audioLevelProcessor;
            this.renderer = deps.renderer || null;
            this.particleSystem = deps.particleSystem || null;
            this._express = deps.express;
            this._emit = deps.emit;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.audioLevelProcessor = mascot.audioLevelProcessor;
            this.renderer = mascot.renderer;
            this.particleSystem = mascot.particleSystem;
            this._express = gesture => mascot.express(gesture);
            this._emit = (event, data) => mascot.emit(event, data);
            this._legacyMode = true;
        }
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
        this.audioLevelProcessor.onLevelUpdate(data => {
            // Update renderer with current audio level
            if (this.renderer) {
                this.renderer.updateAudioLevel(data.level);
            }

            // Emit audio level update event
            this._emit('audioLevelUpdate', {
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
        this.audioLevelProcessor.onVolumeSpike(spikeData => {
            const gestureTriggered = this.handleVolumeSpike();

            // Emit volume spike event
            this._emit('volumeSpike', {
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
        if (!this.particleSystem) return false;

        const hasActiveGesture = this.particleSystem.particles.some(p => p.gestureProgress < 1);

        if (!hasActiveGesture) {
            // Execute pulse gesture through express method
            this._express('pulse');
            return true;
        }

        return false;
    }

    /**
     * Setup audio processing error callback
     */
    setupErrorCallback() {
        this.audioLevelProcessor.onError(errorData => {
            // AudioLevelProcessor error
            this._emit('audioProcessingError', errorData);
        });
    }
}
