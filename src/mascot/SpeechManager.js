/**
 * SpeechManager
 *
 * Manages both TTS (Text-to-Speech) and audio reactivity.
 * Handles:
 * - TTS speech synthesis with Web Speech API
 * - Audio reactivity initialization
 * - Speech event emission
 * - TTS event handlers (start, end, error, boundary)
 * - Audio level processor integration
 */
export class SpeechManager {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Speak text using Web Speech API (TTS)
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options (voice, rate, pitch, volume, lang)
     * @returns {SpeechSynthesisUtterance|null} Utterance object or null if unavailable
     */
    speak(text, options = {}) {
        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
            // Speech synthesis not available in this browser
            return null;
        }

        const utterance = this.createUtterance(text, options);
        this.setupUtteranceHandlers(utterance, text);

        // Speak the text
        window.speechSynthesis.speak(utterance);

        return utterance;
    }

    /**
     * Create speech synthesis utterance
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     * @returns {SpeechSynthesisUtterance} Configured utterance
     */
    createUtterance(text, options) {
        const utterance = new SpeechSynthesisUtterance(text);

        // Apply options
        if (options.voice) utterance.voice = options.voice;
        if (options.rate) utterance.rate = options.rate;
        if (options.pitch) utterance.pitch = options.pitch;
        if (options.volume) utterance.volume = options.volume;
        if (options.lang) utterance.lang = options.lang;

        return utterance;
    }

    /**
     * Setup event handlers for utterance
     * @param {SpeechSynthesisUtterance} utterance - Utterance to configure
     * @param {string} text - Original text
     */
    setupUtteranceHandlers(utterance, text) {
        utterance.onstart = () => {
            this.mascot.setTTSSpeaking(true);
            this.mascot.emit('tts:start', { text });
        };

        utterance.onend = () => {
            this.mascot.setTTSSpeaking(false);
            this.mascot.emit('tts:end');
        };

        utterance.onerror = event => {
            this.mascot.setTTSSpeaking(false);
            this.mascot.emit('tts:error', { error: event });
        };

        utterance.onboundary = event => {
            // Word/sentence boundaries for potential lip-sync
            this.mascot.emit('tts:boundary', {
                name: event.name,
                charIndex: event.charIndex,
                charLength: event.charLength
            });
        };
    }

    /**
     * Start audio reactivity mode (microphone input)
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    startSpeaking(audioContext) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.validateAudioContext(audioContext)) {
                return this.mascot;
            }

            if (!this.initializeAudioProcessor(audioContext)) {
                return this.mascot;
            }

            this.activateSpeechMode(audioContext);

            return this.mascot;
        }, 'speech-start', this.mascot)();
    }

    /**
     * Validate audio context
     * @param {AudioContext} audioContext - Audio context to validate
     * @returns {boolean} True if valid
     */
    validateAudioContext(audioContext) {
        if (!audioContext) {
            throw new Error('AudioContext is required for speech reactivity');
        }

        if (!this.mascot.config.enableAudio) {
            // Audio is disabled, cannot start speech reactivity
            return false;
        }

        if (this.mascot.speaking) {
            // Speech reactivity is already active
            return false;
        }

        return true;
    }

    /**
     * Initialize audio level processor
     * @param {AudioContext} audioContext - Audio context
     * @returns {boolean} True if successful
     */
    initializeAudioProcessor(audioContext) {
        const success = this.mascot.audioLevelProcessor.initialize(audioContext);

        if (!success) {
            // Failed to initialize audio level processor
            return false;
        }

        return true;
    }

    /**
     * Activate speech reactivity mode
     * @param {AudioContext} audioContext - Audio context
     */
    activateSpeechMode(audioContext) {
        // Update speech state
        this.mascot.speaking = true;

        // Notify renderer about speech start
        this.mascot.renderer.onSpeechStart(audioContext);

        // Emit speech start event with analyser for external connection
        this.mascot.emit('speechStarted', {
            audioContext,
            analyser: this.mascot.audioLevelProcessor.getAnalyser(),
            mascot: this.mascot
        });
    }

    /**
     * Stop audio reactivity mode
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stopSpeaking() {
        return this.mascot.errorBoundary.wrap(() => {
            return this.mascot.audioHandler.stopSpeaking();
        }, 'speech-stop', this.mascot)();
    }
}
