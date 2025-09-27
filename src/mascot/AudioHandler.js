/**
 * AudioHandler - Manages all audio-related functionality for EmotiveMascot
 * @module mascot/AudioHandler
 */

export class AudioHandler {
    constructor(mascot) {
        this.mascot = mascot;
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
        if (this.mascot.audioAnalyzer) {
            this.mascot.audioAnalyzer.stop();
        }
        
        // Clear update interval
        if (this.vocalUpdateInterval) {
            clearInterval(this.vocalUpdateInterval);
            this.vocalUpdateInterval = null;
        }
        
        
        // Clear vocal data and analyzer reference
        if (this.mascot.shapeMorpher) {
            this.mascot.shapeMorpher.setVocalEnergy(0);
            this.mascot.shapeMorpher.setAudioDeformation(0);
            this.mascot.shapeMorpher.audioAnalyzer = null;
            this.mascot.shapeMorpher.beatGlitchIntensity = 0;
            this.mascot.shapeMorpher.glitchPoints = [];
        }

        // Stop ambient groove animation when audio stops
        if (this.mascot.renderer) {
            this.mascot.renderer.ambientDanceAnimator.stopAmbientAnimation('grooveBob');
        }

        return this.mascot;
    }

    /**
     * Connect audio element for vocal visualization
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     * @returns {Object} The mascot instance for chaining
     */
    async connectAudio(audioElement) {
        if (!this.mascot.audioAnalyzer) {
            return this.mascot;
        }
        
        // Initialize audio context if needed
        if (!this.mascot.audioAnalyzer.audioContext) {
            await this.mascot.audioAnalyzer.init();
        }
        
        // Connect the audio element
        this.mascot.audioAnalyzer.connectAudioElement(audioElement);
        
        // Pass analyzer reference to shape morpher for frequency data
        if (this.mascot.shapeMorpher) {
            this.mascot.shapeMorpher.audioAnalyzer = this.mascot.audioAnalyzer;
            
            // Set up beat detection callback for glitches and rhythm detection
            this.mascot.audioAnalyzer.onBeat(amplitude => {
                if (this.mascot.shapeMorpher) {
                    // Feed beat to music detector for BPM detection
                    if (this.mascot.shapeMorpher.musicDetector) {
                        const now = performance.now();
                        this.mascot.shapeMorpher.musicDetector.addOnset(now, amplitude);
                    }

                    // Only trigger beat glitches when vocals are active
                    if (this.mascot.shapeMorpher.vocalEffectActive) {
                        this.mascot.shapeMorpher.beatGlitchIntensity = amplitude * 0.3;
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
        if (this.mascot.renderer) {
            this.mascot.renderer.startGrooveBob({ intensity: 0.5, frequency: 1.0 });
        }

        this.vocalUpdateInterval = setInterval(() => {
            if (this.mascot.audioAnalyzer.isAnalyzing && this.mascot.shapeMorpher) {
                // Get current analysis data directly from properties
                const amplitude = this.mascot.audioAnalyzer.currentAmplitude || 0;
                const vocalInstability = this.mascot.audioAnalyzer.getVocalInstability() || 0;

                // Set vocal energy for shape pulsing
                this.mascot.shapeMorpher.setVocalEnergy(vocalInstability);

                // Set overall deformation based on amplitude (0 to 1, no shrinking)
                this.mascot.shapeMorpher.setAudioDeformation(amplitude * 2); // Keep positive for expansion only
            }
        }, 50); // Update at 20 FPS
        
        // Pass audio analyzer to renderer
        if (this.mascot.renderer) {
            this.mascot.renderer.audioAnalyzer = this.mascot.audioAnalyzer;
        }
        
        return this.mascot;
    }

    /**
     * Stops speech reactivity mode and returns to base emotional state
     * @returns {Object} The mascot instance for chaining
     */
    stopSpeaking() {
        if (!this.mascot.speaking) {
            return this.mascot;
        }
        
        // Store previous state for event
        const previousAudioLevel = this.mascot.audioLevelProcessor.getCurrentLevel();
        
        // Clean up audio level processor
        this.mascot.audioLevelProcessor.cleanup();
        
        // Reset speech state
        this.mascot.speaking = false;
        
        // Notify renderer about speech stop (triggers 500ms return-to-base transition)
        this.mascot.renderer.onSpeechStop();
        
        // Emit speech stop event
        this.mascot.emit('speechStopped', { 
            previousAudioLevel,
            returnToBaseTime: 500
        });
        
        return this.mascot;
    }

    /**
     * Sets master volume for all audio output
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @returns {Object} The mascot instance for chaining
     */
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.mascot.config.masterVolume = clampedVolume;
        
        if (this.mascot.soundSystem.isAvailable()) {
            const currentEmotion = this.mascot.stateMachine.getCurrentState().emotion;
            this.mascot.soundSystem.setMasterVolume(clampedVolume, currentEmotion);
        }
        
        this.mascot.emit('volumeChanged', { volume: clampedVolume });
        
        return this.mascot;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.disconnectAudio();
    }
}