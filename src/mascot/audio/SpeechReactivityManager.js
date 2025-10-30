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
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
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
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.audioAnalyser) {
                // Speech reactivity not started. Call startSpeaking() first.
                return this.mascot;
            }

            if (!audioSource || typeof audioSource.connect !== 'function') {
                // Invalid audio source provided to connectAudioSource()
                return this.mascot;
            }

            // Connect the audio source to our analyser
            audioSource.connect(this.mascot.audioAnalyser);

            // Audio source connected to speech analyser
            this.mascot.emit('audioSourceConnected', { audioSource });

            return this.mascot;
        }, 'audio-source-connection', this.mascot)();
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
        return this.mascot.speaking ? this.mascot.audioLevel : 0;
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
        return this.mascot.speaking;
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
        return this.mascot.errorBoundary.wrap(() => {
            const clampedSmoothing = Math.max(0, Math.min(1, smoothing));

            if (this.mascot.audioAnalyser) {
                this.mascot.audioAnalyser.smoothingTimeConstant = clampedSmoothing;
                // Audio smoothing set
            }

            return this.mascot;
        }, 'audio-smoothing', this.mascot)();
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
        return this.mascot.audioLevelProcessor.getStats();
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
        this.mascot.audioLevelProcessor.updateConfig(config);
    }
}
