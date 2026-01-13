/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *             ◐ ◑ ◒ ◓  SPEECH REACTIVITY MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview SpeechReactivityManager - Audio Source Connection and Speech Analysis
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module SpeechReactivityManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages speech reactivity features including audio source connection, audio level
 * ║ monitoring, and speech analysis configuration. Separate from TTS (text-to-speech
 * ║ synthesis), this handles incoming audio analysis for visual reactivity.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎤 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Connect Web Audio API sources to analyser
 * │ • Monitor real-time audio levels
 * │ • Track speech reactivity state
 * │ • Configure audio analysis parameters (smoothing, etc.)
 * │ • Provide audio processing statistics
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class SpeechReactivityManager {
    /**
     * Create SpeechReactivityManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.audioLevelProcessor - Audio level processor instance
     * @param {Object} deps.state - Shared state with speaking, audioLevel, audioAnalyser properties
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     *
     * @example
     * // New DI style:
     * new SpeechReactivityManager({ errorBoundary, audioLevelProcessor, state, emit })
     *
     * // Legacy style:
     * new SpeechReactivityManager(mascot)
     */
    constructor(deps) {
        // Check for explicit DI style (has _diStyle marker property)
        if (deps && deps._diStyle === true) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.audioLevelProcessor = deps.audioLevelProcessor;
            this._state = deps.state;
            this._emit = deps.emit;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.audioLevelProcessor = mascot.audioLevelProcessor;
            this._state = {
                get speaking() { return mascot.speaking; },
                get audioLevel() { return mascot.audioLevel; },
                get audioAnalyser() { return mascot.audioAnalyser; }
            };
            this._emit = (event, data) => mascot.emit(event, data);
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
    }

    /**
     * Connects an audio source to the speech analyser
     * @param {AudioNode} audioSource - Web Audio API source node
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * const audioContext = new AudioContext();
     * const source = audioContext.createMediaStreamSource(stream);
     * mascot.connectAudioSource(source);
     */
    connectAudioSource(audioSource) {
        return this.errorBoundary.wrap(() => {
            if (!this._state.audioAnalyser) {
                // Speech reactivity not started. Call startSpeaking() first.
                return this._chainTarget;
            }

            if (!audioSource || typeof audioSource.connect !== 'function') {
                // Invalid audio source provided to connectAudioSource()
                return this._chainTarget;
            }

            // Connect the audio source to our analyser
            audioSource.connect(this._state.audioAnalyser);

            // Audio source connected to speech analyser
            this._emit('audioSourceConnected', { audioSource });

            return this._chainTarget;
        }, 'audio-source-connection', this._chainTarget)();
    }

    /**
     * Gets the current audio level (0-1) if speech reactivity is active
     * @returns {number} Current audio level or 0 if not speaking
     *
     * @example
     * const level = mascot.getAudioLevel();
     * console.log(`Current audio level: ${(level * 100).toFixed(0)}%`);
     */
    getAudioLevel() {
        return this._state.speaking ? this._state.audioLevel : 0;
    }

    /**
     * Checks if speech reactivity is currently active
     * @returns {boolean} True if speech monitoring is active
     *
     * @example
     * if (mascot.isSpeaking()) {
     *   console.log('Speech reactivity is active');
     * }
     */
    isSpeaking() {
        return this._state.speaking;
    }

    /**
     * Sets the audio analyser smoothing time constant
     * @param {number} smoothing - Smoothing value (0-1, default: 0.8)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.setAudioSmoothing(0.9); // More smoothing
     * mascot.setAudioSmoothing(0.3); // Less smoothing, more responsive
     */
    setAudioSmoothing(smoothing) {
        return this.errorBoundary.wrap(() => {
            const clampedSmoothing = Math.max(0, Math.min(1, smoothing));

            if (this._state.audioAnalyser) {
                this._state.audioAnalyser.smoothingTimeConstant = clampedSmoothing;
                // Audio smoothing set
            }

            return this._chainTarget;
        }, 'audio-smoothing', this._chainTarget)();
    }

    /**
     * Gets audio level processing statistics
     * @returns {Object} Audio processing statistics
     *
     * @example
     * const stats = mascot.getAudioStats();
     * console.log('Peak level:', stats.peakLevel);
     * console.log('Average level:', stats.averageLevel);
     */
    getAudioStats() {
        return this.audioLevelProcessor.getStats();
    }

    /**
     * Updates audio level processor configuration
     * @param {Object} config - New configuration options
     *
     * @example
     * mascot.updateAudioConfig({
     *   sensitivity: 1.5,
     *   threshold: 0.1,
     *   attackTime: 0.1,
     *   releaseTime: 0.3
     * });
     */
    updateAudioConfig(config) {
        this.audioLevelProcessor.updateConfig(config);
    }
}
