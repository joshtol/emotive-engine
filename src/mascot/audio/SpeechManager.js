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
 *
 * @module SpeechManager
 */
export class SpeechManager {
    /**
     * Create SpeechManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.audioLevelProcessor - Audio level processor instance
     * @param {Object} deps.audioHandler - Audio handler instance
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.state - Shared state with speaking property
     * @param {Function} deps.setTTSSpeaking - Function to set TTS speaking state
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation (core deps only - others set post-init)
        if (!deps.errorBoundary) throw new Error('SpeechManager: errorBoundary required');
        if (!deps.emit) throw new Error('SpeechManager: emit required');

        this.errorBoundary = deps.errorBoundary;
        this.audioLevelProcessor = deps.audioLevelProcessor || null;
        this.audioHandler = deps.audioHandler || null;
        this.renderer = deps.renderer || null;
        this.config = deps.config || {};
        this._state = deps.state || { speaking: false };
        this._setTTSSpeaking = deps.setTTSSpeaking || (() => {});
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
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
            this._setTTSSpeaking(true);
            this._emit('tts:start', { text });
        };

        utterance.onend = () => {
            this._setTTSSpeaking(false);
            this._emit('tts:end');
        };

        utterance.onerror = event => {
            this._setTTSSpeaking(false);
            this._emit('tts:error', { error: event });
        };

        utterance.onboundary = event => {
            // Word/sentence boundaries for potential lip-sync
            this._emit('tts:boundary', {
                name: event.name,
                charIndex: event.charIndex,
                charLength: event.charLength,
            });
        };
    }

    /**
     * Start audio reactivity mode (microphone input)
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    startSpeaking(audioContext) {
        return this.errorBoundary.wrap(
            () => {
                if (!this.validateAudioContext(audioContext)) {
                    return this._chainTarget;
                }

                if (!this.initializeAudioProcessor(audioContext)) {
                    return this._chainTarget;
                }

                this.activateSpeechMode(audioContext);

                return this._chainTarget;
            },
            'speech-start',
            this._chainTarget
        )();
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

        if (!this.config.enableAudio) {
            // Audio is disabled, cannot start speech reactivity
            return false;
        }

        if (this._state.speaking) {
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
        const success = this.audioLevelProcessor.initialize(audioContext);

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
        this._state.speaking = true;

        // Notify renderer about speech start
        if (this.renderer) {
            this.renderer.onSpeechStart(audioContext);
        }

        // Emit speech start event with analyser for external connection
        this._emit('speechStarted', {
            audioContext,
            analyser: this.audioLevelProcessor.getAnalyser(),
            chainTarget: this._chainTarget,
        });
    }

    /**
     * Stop audio reactivity mode
     * @returns {EmotiveMascot} Mascot instance for chaining
     */
    stopSpeaking() {
        return this.errorBoundary.wrap(
            () => {
                if (this.audioHandler) {
                    return this.audioHandler.stopSpeaking();
                }
                return this._chainTarget;
            },
            'speech-stop',
            this._chainTarget
        )();
    }
}
