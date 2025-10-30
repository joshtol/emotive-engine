/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                   ◐ ◑ ◒ ◓  TTS MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview TTSManager - Text-to-Speech Synthesis and Control
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module TTSManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages text-to-speech synthesis using the Web Speech API. Provides voice
 * ║ selection, speech state management, and visual feedback coordination during
 * ║ TTS playback.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🗣️ RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Query available TTS voices from browser
 * │ • Speak text using Web Speech API (delegates to SpeechManager)
 * │ • Track TTS speaking state
 * │ • Coordinate visual feedback during speech
 * │ • Stop ongoing TTS playback
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class TTSManager {
    /**
     * Create TTSManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Gets available TTS voices from the browser
     * @returns {Array} Array of available voice objects
     *
     * @example
     * const voices = mascot.getTTSVoices();
     * voices.forEach(voice => {
     *   console.log(`${voice.name} (${voice.lang})`);
     * });
     */
    getTTSVoices() {
        if (!this.mascot.tts.available) {
            return [];
        }

        return window.speechSynthesis.getVoices();
    }

    /**
     * Checks if TTS is currently speaking
     * @returns {boolean} True if currently speaking
     *
     * @example
     * if (mascot.isTTSSpeaking()) {
     *   console.log('Mascot is speaking');
     * }
     */
    isTTSSpeaking() {
        return this.mascot.tts.speaking;
    }

    /**
     * Speak text using TTS (delegates to SpeechManager for actual synthesis)
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options (voice, rate, pitch, etc.)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.speak('Hello world', {
     *   voice: voices[0],
     *   rate: 1.0,
     *   pitch: 1.0
     * });
     */
    speak(text, options = {}) {
        return this.mascot.speechManager ? this.mascot.speechManager.speak(text, options) : this.mascot;
    }

    /**
     * Set TTS speaking state and trigger visual animation
     * @param {boolean} speaking - Whether TTS is speaking
     *
     * @example
     * mascot.setTTSSpeaking(true); // Start visual feedback
     * // ... TTS plays ...
     * mascot.setTTSSpeaking(false); // Stop visual feedback
     */
    setTTSSpeaking(speaking) {
        this.mascot.ttsSpeaking = speaking;

        // Update renderer if using Emotive style
        if (this.mascot.renderer && this.mascot.renderer.startSpeaking) {
            if (speaking) {
                this.mascot.renderer.startSpeaking();
            } else {
                this.mascot.renderer.stopSpeaking();
            }
        }

        // Also update the speaking flag for compatibility
        this.mascot.speaking = speaking;
    }

    /**
     * Get available TTS voices (alias for getTTSVoices)
     * @returns {Array} Array of available voices
     *
     * @example
     * const voices = mascot.getVoices();
     * console.log(`${voices.length} voices available`);
     */
    getVoices() {
        if (!window.speechSynthesis) {
            return [];
        }
        return window.speechSynthesis.getVoices();
    }

    /**
     * Stop any ongoing TTS speech immediately
     *
     * @example
     * mascot.speak('This is a long sentence that will be interrupted');
     * setTimeout(() => mascot.stopTTS(), 500); // Stop after 500ms
     */
    stopTTS() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.setTTSSpeaking(false);
        }
    }
}
