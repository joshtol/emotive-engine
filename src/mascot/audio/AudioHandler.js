/**
 * AudioHandler - Manages all audio-related functionality for EmotiveMascot
 * @module mascot/AudioHandler
 * @complexity ⭐⭐⭐⭐ Advanced (Web Audio API complexity)
 * @audience Modify this for audio sync features or BPM detection changes
 */

export class AudioHandler {
    /**
     * Create AudioHandler
     *
     * @param {Object} deps - Dependencies
     * @param {Object} [deps.audioAnalyzer] - Audio analyzer instance
     * @param {Object} [deps.audioLevelProcessor] - Audio level processor
     * @param {Object} [deps.shapeMorpher] - Shape morpher instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} [deps.soundSystem] - Sound system instance
     * @param {Object} [deps.stateMachine] - State machine instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.state - Shared state with speaking property
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.config) throw new Error('AudioHandler: config required');
        if (!deps.state) throw new Error('AudioHandler: state required');
        if (!deps.emit) throw new Error('AudioHandler: emit required');

        this.audioAnalyzer = deps.audioAnalyzer || null;
        this.audioLevelProcessor = deps.audioLevelProcessor || null;
        this.shapeMorpher = deps.shapeMorpher || null;
        this.renderer = deps.renderer || null;
        this.soundSystem = deps.soundSystem || null;
        this.stateMachine = deps.stateMachine || null;
        this.config = deps.config;
        this._state = deps.state;
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
        this.vocalUpdateInterval = null;
    }

    /**
     * Initialize audio handler
     */
    init() {
        // Will contain initialization logic
    }

    /**
     * Disconnect audio analysis
     * @returns {Object} The mascot instance for chaining
     */
    disconnectAudio() {
        // Stop analysis
        if (this.audioAnalyzer) {
            this.audioAnalyzer.stop();
        }

        // Clear update interval
        if (this.vocalUpdateInterval) {
            clearInterval(this.vocalUpdateInterval);
            this.vocalUpdateInterval = null;
        }

        // Clear vocal data and analyzer reference
        if (this.shapeMorpher) {
            this.shapeMorpher.setVocalEnergy(0);
            this.shapeMorpher.setAudioDeformation(0);
            this.shapeMorpher.audioAnalyzer = null;
            this.shapeMorpher.beatGlitchIntensity = 0;
            this.shapeMorpher.glitchPoints = [];
        }

        // Stop ambient groove animation when audio stops
        if (this.renderer) {
            this.renderer.ambientDanceAnimator.stopAmbientAnimation('grooveBob');
        }

        return this._chainTarget;
    }

    /**
     * Connect audio element for vocal visualization
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     * @returns {Object} The mascot instance for chaining
     */
    async connectAudio(audioElement) {
        if (!this.audioAnalyzer) {
            return this._chainTarget;
        }

        // Initialize audio context if needed - this will only happen after user interaction
        if (!this.audioAnalyzer.audioContext) {
            try {
                await this.audioAnalyzer.init();
            } catch (error) {
                console.warn('Failed to initialize AudioContext:', error);
                return this._chainTarget;
            }
        }

        // Resume AudioContext if it's suspended (common after user interaction)
        if (
            this.audioAnalyzer.audioContext &&
            this.audioAnalyzer.audioContext.state === 'suspended'
        ) {
            try {
                await this.audioAnalyzer.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error);
            }
        }

        // Connect the audio element
        this.audioAnalyzer.connectAudioElement(audioElement);

        // Pass analyzer reference to shape morpher for frequency data
        if (this.shapeMorpher) {
            this.shapeMorpher.audioAnalyzer = this.audioAnalyzer;

            // Set up beat detection callback for glitches and rhythm detection
            this.audioAnalyzer.onBeat(amplitude => {
                if (this.shapeMorpher) {
                    // Feed beat to music detector for BPM detection
                    if (this.shapeMorpher.musicDetector) {
                        const now = performance.now();
                        this.shapeMorpher.musicDetector.addOnset(now, amplitude);
                    }

                    // Only trigger beat glitches when vocals are active
                    if (this.shapeMorpher.vocalEffectActive) {
                        this.shapeMorpher.beatGlitchIntensity = amplitude * 0.3;
                    }
                }
            });
        }

        // Start updating shape morpher with vocal data
        if (this.vocalUpdateInterval) {
            clearInterval(this.vocalUpdateInterval);
        }

        // Start ambient groove animation when audio starts
        // This provides the continuous background movement
        if (this.renderer) {
            this.renderer.startGrooveBob({ intensity: 0.5, frequency: 1.0 });
        }

        this.vocalUpdateInterval = setInterval(() => {
            if (this.audioAnalyzer.isAnalyzing && this.shapeMorpher) {
                // Get current analysis data directly from properties
                const amplitude = this.audioAnalyzer.currentAmplitude || 0;
                const vocalInstability = this.audioAnalyzer.getVocalInstability() || 0;

                // Set vocal energy for shape pulsing
                this.shapeMorpher.setVocalEnergy(vocalInstability);

                // Set overall deformation based on amplitude (0 to 1, no shrinking)
                this.shapeMorpher.setAudioDeformation(amplitude * 2); // Keep positive for expansion only
            }
        }, 50); // Update at 20 FPS

        // Pass audio analyzer to renderer
        if (this.renderer) {
            this.renderer.audioAnalyzer = this.audioAnalyzer;
        }

        return this._chainTarget;
    }

    /**
     * Stops speech reactivity mode and returns to base emotional state
     * @returns {Object} The mascot instance for chaining
     */
    stopSpeaking() {
        if (!this._state.speaking) {
            return this._chainTarget;
        }

        // Store previous state for event
        const previousAudioLevel = this.audioLevelProcessor.getCurrentLevel();

        // Clean up audio level processor
        this.audioLevelProcessor.cleanup();

        // Reset speech state
        this._state.speaking = false;

        // Notify renderer about speech stop (triggers 500ms return-to-base transition)
        this.renderer.onSpeechStop();

        // Emit speech stop event
        this._emit('speechStopped', {
            previousAudioLevel,
            returnToBaseTime: 500,
        });

        return this._chainTarget;
    }

    /**
     * Sets master volume for all audio output
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @returns {Object} The mascot instance for chaining
     */
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.config.masterVolume = clampedVolume;

        if (this.soundSystem && this.soundSystem.isAvailable()) {
            const currentEmotion = this.stateMachine.getCurrentState().emotion;
            this.soundSystem.setMasterVolume(clampedVolume, currentEmotion);
        }

        this._emit('volumeChanged', { volume: clampedVolume });

        return this._chainTarget;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.disconnectAudio();
    }
}
