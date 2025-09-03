/**
 * Audio-only build entry point - Audio features without visual components
 * For applications that only need audio reactivity and sound generation
 */

import ErrorBoundary from './core/ErrorBoundary.js';
import EmotiveStateMachine from './core/EmotiveStateMachine.js';
import { SoundSystem } from './core/SoundSystem.js';
import AudioLevelProcessor from './core/AudioLevelProcessor.js';
import EventManager from './core/EventManager.js';

/**
 * Audio-only EmotiveMascot - Sound and reactivity without visual rendering
 * Minimal footprint for audio-focused applications
 */
class EmotiveMascotAudio {
    constructor(config = {}) {
        // Initialize error boundary first
        this.errorBoundary = new ErrorBoundary();
        
        // Wrap initialization in error boundary
        this.errorBoundary.wrap(() => {
            this.initialize(config);
        }, 'initialization')();
    }

    /**
     * Initialize the audio-only mascot system
     * @param {Object} config - Configuration options
     */
    initialize(config) {
        // Default configuration (visual features disabled)
        const defaults = {
            enableAudio: true,
            masterVolume: 0.5,
            defaultEmotion: 'neutral',
            spikeThreshold: 1.5,
            minimumSpikeLevel: 0.1,
            spikeMinInterval: 1000
        };
        
        this.config = { ...defaults, ...config };
        
        // Initialize core systems (audio-focused)
        this.stateMachine = new EmotiveStateMachine(this.errorBoundary);
        this.soundSystem = new SoundSystem();
        
        // Initialize audio level processor for speech reactivity
        this.audioLevelProcessor = new AudioLevelProcessor({
            spikeThreshold: this.config.spikeThreshold,
            minimumSpikeLevel: this.config.minimumSpikeLevel,
            spikeMinInterval: this.config.spikeMinInterval
        });
        
        // Initialize EventManager for centralized event management
        this.eventManager = new EventManager({
            maxListeners: this.config.maxEventListeners || 50,
            enableDebugging: this.config.enableEventDebugging || false,
            enableMonitoring: this.config.enableEventMonitoring || true,
            memoryWarningThreshold: this.config.eventMemoryWarningThreshold || 25
        });
        
        // Speech reactivity state
        this.speaking = false;
        this.isRunning = false;
        
        // Set up audio level processor callbacks
        this.setupAudioLevelProcessorCallbacks();
        
        // Initialize sound system
        if (this.config.enableAudio) {
            this.soundSystem.initialize().then(success => {
                if (success) {
                    this.soundSystem.setMasterVolume(this.config.masterVolume);
                    console.log('Audio-only sound system initialized successfully');
                } else {
                    console.log('Sound system initialization failed');
                }
            });
        }
        
        // Set initial emotional state
        this.stateMachine.setEmotion(this.config.defaultEmotion);
        
        console.log('EmotiveMascot Audio-only initialized successfully');
    }

    /**
     * Set up callbacks for the audio level processor
     */
    setupAudioLevelProcessorCallbacks() {
        // Handle audio level updates
        this.audioLevelProcessor.onLevelUpdate((data) => {
            // Emit audio level update event
            this.emit('audioLevelUpdate', {
                level: data.level,
                rawData: Array.from(data.rawData),
                timestamp: data.timestamp
            });
        });
        
        // Handle volume spikes for audio feedback
        this.audioLevelProcessor.onVolumeSpike((spikeData) => {
            // Play audio feedback for volume spike
            if (this.soundSystem.isAvailable()) {
                const currentEmotion = this.stateMachine.getCurrentState().emotion;
                this.soundSystem.playGestureSound('pulse', currentEmotion);
            }
            
            // Emit volume spike event
            this.emit('volumeSpike', {
                ...spikeData,
                audioFeedbackTriggered: true
            });
            
            console.log(`Volume spike detected: ${(spikeData.level * 100).toFixed(1)}% - audio feedback triggered`);
        });
        
        // Handle audio processing errors
        this.audioLevelProcessor.onError((errorData) => {
            console.warn('AudioLevelProcessor error:', errorData.message);
            this.emit('audioProcessingError', errorData);
        });
    }

    /**
     * Sets the emotional state with optional undertone
     * @param {string} emotion - The emotion to set
     * @param {Object|string|null} options - Options object or undertone string
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    setEmotion(emotion, options = null) {
        return this.errorBoundary.wrap(() => {
            let undertone = null;
            let duration = 500;
            
            if (typeof options === 'string') {
                undertone = options;
            } else if (options && typeof options === 'object') {
                undertone = options.undertone || null;
                duration = options.duration || 500;
            }
            
            const success = this.stateMachine.setEmotion(emotion, undertone, duration);
            
            if (success) {
                // Update sound system ambient tone
                if (this.soundSystem.isAvailable()) {
                    this.soundSystem.setAmbientTone(emotion, duration);
                }
                
                this.emit('emotionChanged', { emotion, undertone, duration });
                console.log(`Audio emotion set to: ${emotion}${undertone ? ` (${undertone})` : ''}`);
            }
            
            return this;
        }, 'emotion-setting', this)();
    }

    /**
     * Plays a gesture sound effect
     * @param {string} gesture - The gesture sound to play
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    playGestureSound(gesture) {
        return this.errorBoundary.wrap(() => {
            if (!gesture) {
                console.warn('No gesture provided to playGestureSound()');
                return this;
            }
            
            if (this.soundSystem.isAvailable()) {
                const currentEmotion = this.stateMachine.getCurrentState().emotion;
                this.soundSystem.playGestureSound(gesture, currentEmotion);
                
                this.emit('gestureSoundPlayed', { gesture, emotion: currentEmotion });
                console.log(`Playing gesture sound: ${gesture}`);
            } else {
                console.warn('Sound system not available');
            }
            
            return this;
        }, 'gesture-sound', this)();
    }

    /**
     * Starts speech reactivity mode with audio level monitoring
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    startSpeaking(audioContext) {
        return this.errorBoundary.wrap(() => {
            if (!audioContext) {
                throw new Error('AudioContext is required for speech reactivity');
            }
            
            if (!this.config.enableAudio) {
                console.warn('Audio is disabled, cannot start speech reactivity');
                return this;
            }
            
            if (this.speaking) {
                console.warn('Speech reactivity is already active');
                return this;
            }
            
            const success = this.audioLevelProcessor.initialize(audioContext);
            
            if (!success) {
                console.warn('Failed to initialize audio level processor');
                return this;
            }
            
            this.speaking = true;
            
            this.emit('speechStarted', { 
                audioContext, 
                analyser: this.audioLevelProcessor.getAnalyser(),
                mascot: this
            });
            
            console.log('Audio-only speech reactivity started');
            return this;
        }, 'speech-start', this)();
    }

    /**
     * Stops speech reactivity mode
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    stopSpeaking() {
        return this.errorBoundary.wrap(() => {
            if (!this.speaking) {
                console.warn('Speech reactivity is not active');
                return this;
            }
            
            const previousAudioLevel = this.audioLevelProcessor.getCurrentLevel();
            
            this.audioLevelProcessor.cleanup();
            this.speaking = false;
            
            this.emit('speechStopped', { 
                previousAudioLevel
            });
            
            console.log('Audio-only speech reactivity stopped');
            return this;
        }, 'speech-stop', this)();
    }

    /**
     * Connects an audio source to the speech analyser
     * @param {AudioNode} audioSource - Web Audio API source node
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    connectAudioSource(audioSource) {
        return this.errorBoundary.wrap(() => {
            if (!this.audioLevelProcessor.getAnalyser()) {
                console.warn('Speech reactivity not started. Call startSpeaking() first.');
                return this;
            }
            
            if (!audioSource || typeof audioSource.connect !== 'function') {
                console.warn('Invalid audio source provided to connectAudioSource()');
                return this;
            }
            
            audioSource.connect(this.audioLevelProcessor.getAnalyser());
            
            console.log('Audio source connected to speech analyser');
            this.emit('audioSourceConnected', { audioSource });
            
            return this;
        }, 'audio-source-connection', this)();
    }

    /**
     * Starts audio processing (no visual animation)
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    start() {
        return this.errorBoundary.wrap(() => {
            if (this.isRunning) {
                console.warn('EmotiveMascot Audio is already running');
                return this;
            }
            
            this.isRunning = true;
            
            // Start audio processing loop
            this.startAudioProcessing();
            
            this.emit('started');
            console.log('EmotiveMascot Audio started');
            
            return this;
        }, 'start', this)();
    }

    /**
     * Stops audio processing
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    stop() {
        return this.errorBoundary.wrap(() => {
            if (!this.isRunning) {
                console.warn('EmotiveMascot Audio is not running');
                return this;
            }
            
            if (this.speaking) {
                this.stopSpeaking();
            }
            
            this.isRunning = false;
            
            if (this.audioProcessingId) {
                cancelAnimationFrame(this.audioProcessingId);
                this.audioProcessingId = null;
            }
            
            this.emit('stopped');
            console.log('EmotiveMascot Audio stopped');
            
            return this;
        }, 'stop', this)();
    }

    /**
     * Start the audio processing loop
     */
    startAudioProcessing() {
        const processAudio = () => {
            if (!this.isRunning) return;
            
            // Update audio level monitoring if speaking
            if (this.speaking && this.audioLevelProcessor.isProcessingActive()) {
                this.audioLevelProcessor.updateAudioLevel(16); // Assume 60 FPS
            }
            
            this.audioProcessingId = requestAnimationFrame(processAudio);
        };
        
        processAudio();
    }

    /**
     * Sets master volume for all audio output
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @returns {EmotiveMascotAudio} This instance for chaining
     */
    setVolume(volume) {
        return this.errorBoundary.wrap(() => {
            const clampedVolume = Math.max(0, Math.min(1, volume));
            this.config.masterVolume = clampedVolume;
            
            if (this.soundSystem.isAvailable()) {
                const currentEmotion = this.stateMachine.getCurrentState().emotion;
                this.soundSystem.setMasterVolume(clampedVolume, currentEmotion);
            }
            
            this.emit('volumeChanged', { volume: clampedVolume });
            
            return this;
        }, 'volume-setting', this)();
    }

    /**
     * Gets current master volume
     * @returns {number} Current volume level (0.0 to 1.0)
     */
    getVolume() {
        return this.config.masterVolume;
    }

    // Event system methods
    on(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.on(event, callback);
            if (!success) {
                console.warn(`Failed to add event listener for '${event}'`);
            }
            return this;
        }, 'event-listener-add', this)();
    }

    off(event, callback) {
        return this.errorBoundary.wrap(() => {
            this.eventManager.off(event, callback);
            return this;
        }, 'event-listener-remove', this)();
    }

    once(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.once(event, callback);
            if (!success) {
                console.warn(`Failed to add once event listener for '${event}'`);
            }
            return this;
        }, 'event-listener-once', this)();
    }

    emit(event, data = null) {
        this.eventManager.emit(event, data);
    }

    // State query methods
    getCurrentState() {
        return this.stateMachine.getCurrentState();
    }

    getAvailableEmotions() {
        return this.stateMachine.getAvailableEmotions();
    }

    getAvailableUndertones() {
        return this.stateMachine.getAvailableUndertones();
    }

    getAudioLevel() {
        return this.audioLevelProcessor.getCurrentLevel();
    }

    getAudioStats() {
        return this.audioLevelProcessor.getStats();
    }

    updateAudioConfig(config) {
        this.audioLevelProcessor.updateConfig(config);
    }
}

export default EmotiveMascotAudio;