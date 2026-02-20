/**
 * EmotiveMascotPublic - Public API wrapper for Emotive Engine
 * Provides safe, controlled access to engine functionality
 * @module EmotiveMascotPublic
 * @complexity ⭐⭐ Intermediate (Main entry point for users)
 * @audience This is the file users interact with. Good place to add new public methods.
 * @see docs/ARCHITECTURE.md for how this relates to EmotiveMascot.js
 */

import EmotiveMascot from './EmotiveMascot.js';
import { AudioManager } from './public/AudioManager.js';
import { GestureController } from './public/GestureController.js';
import { TimelineRecorder } from './public/TimelineRecorder.js';
import { ElementAttachmentManager } from './public/ElementAttachmentManager.js';
import { VisualEffectsManager } from './public/VisualEffectsManager.js';
import { IntentParser } from './core/intent/IntentParser.js';
import { listGestures } from './core/gestures/index.js';

/**
 * Public API wrapper for Emotive Engine
 *
 * Provides a safe, controlled interface to the Emotive Engine functionality.
 * This class wraps the internal EmotiveMascot engine and exposes only
 * the methods intended for public use.
 *
 * @class EmotiveMascotPublic
 * @example
 * const mascot = new EmotiveMascotPublic({ enableGazeTracking: true });
 * await mascot.init(canvas);
 * mascot.start();
 * mascot.setEmotion('joy');
 */
class EmotiveMascotPublic {
    /**
     * Create a new EmotiveMascotPublic instance
     * @param {Object} [config={}] - Configuration options
     * @param {boolean} [config.enableGazeTracking=true] - Enable gaze tracking behavior
     * @param {string} [config.canvasId] - Canvas element ID or element reference
     * @param {number} [config.targetFPS=60] - Target frames per second
     * @param {boolean} [config.enableParticles=true] - Enable particle effects
     * @param {string} [config.defaultEmotion='neutral'] - Initial emotion state
     */
    constructor(config = {}) {
        // Store config for later initialization
        this._config = this._sanitizeConfig(config);
        this._engine = null;
        this._timeline = [];
        this._isRecording = false;
        this._recordingStartTime = 0;
        this._playbackStartTime = 0;
        this._isPlaying = false;
        this._initialized = false;

        // Initialize intent parser for feel() method
        this._intentParser = new IntentParser();
        this._feelRateLimiter = {
            calls: [],
            maxCallsPerSecond: 10,
            windowMs: 1000
        };

        // Initialize managers
        this._audioManager = new AudioManager(() => this._getReal());
        this._gestureController = new GestureController(
            () => this._getReal(),
            {
                isRecording: () => this._isRecording,
                startTime: () => this._recordingStartTime,
                timeline: () => this._timeline
            }
        );
        // Create state object with proper context binding
        const self = this;
        this._timelineRecorder = new TimelineRecorder(
            () => this._getReal(),
            this._audioManager,
            {
                get timeline() { return self._timeline; },
                set timeline(value) { self._timeline = value; },
                get isRecording() { return self._isRecording; },
                set isRecording(value) { self._isRecording = value; },
                get recordingStartTime() { return self._recordingStartTime; },
                set recordingStartTime(value) { self._recordingStartTime = value; },
                get isPlaying() { return self._isPlaying; },
                set isPlaying(value) { self._isPlaying = value; },
                get playbackStartTime() { return self._playbackStartTime; },
                set playbackStartTime(value) { self._playbackStartTime = value; }
            }
        );
        this._elementAttachmentManager = new ElementAttachmentManager(
            () => this._getReal(),
            () => this._canvas,
            this
        );
        this._visualEffectsManager = new VisualEffectsManager(
            () => this._getReal(),
            () => this._canvas
        );

        // Bind public methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.setPosition = this.setPosition.bind(this);
        this.animateToPosition = this.animateToPosition.bind(this);
        this.clearParticles = this.clearParticles.bind(this);
    }

    /**
     * Get real engine for internal use
     * @private
     */
    _getReal() {
        return this._realEngine || this._engine;
    }
    
    /**
     * Sanitize configuration to prevent access to internal features
     * @private
     */
    _sanitizeConfig(config) {
        const safeConfig = { ...config };
        
        // Remove any debug or internal flags
        delete safeConfig.enableDebug;
        delete safeConfig.enableInternalAPIs;
        delete safeConfig.exposeInternals;
        
        // Force production mode
        safeConfig.mode = 'production';
        
        // Enable gaze tracking by default
        if (safeConfig.enableGazeTracking === undefined) {
            safeConfig.enableGazeTracking = true;
        }
        
        return safeConfig;
    }

    /**
     * Initialize the engine
     * @param {HTMLCanvasElement} canvas - Canvas element to render to
     * @returns {Promise<void>}
     */
    init(canvas) {
        if (this._initialized) {
            return Promise.resolve();
        }

        try {
            // Store canvas reference for fallback positioning
            this._canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

            // Create engine instance with canvas
            const engineConfig = {
                ...this._config,
                canvasId: canvas  // This accepts either string ID or element
            };

            // Create and initialize the engine - wrap in protective proxy
            const engine = new EmotiveMascot(engineConfig);

            // Keep real engine reference for internal use (hidden from external access)
            Object.defineProperty(this, '_realEngine', {
                value: engine,
                writable: false,
                enumerable: false,  // Hide from Object.keys()
                configurable: false
            });

            // Create a protective proxy that hides internal components
            this._engine = new Proxy(engine, {
                get(target, prop) {
                // Block access to sensitive internal components
                    const blockedProps = [
                        'soundSystem', 'stateMachine', 'emotionLibrary',
                        'audioLevelProcessor', 'particleSystem', 'errorBoundary',
                        'performanceMonitor', 'config', 'debugMode'
                    ];
                
                    if (blockedProps.includes(prop)) {
                    // Return a dummy object that looks empty
                        return new Proxy({}, {
                            get() { return undefined; },
                            set() { return false; },
                            has() { return false; },
                            ownKeys() { return []; },
                            getOwnPropertyDescriptor() { return undefined; }
                        });
                    }
                
                    // For allowed components, wrap them too
                    if (prop === 'renderer' || prop === 'shapeMorpher' || 
                    prop === 'audioAnalyzer' || prop === 'gazeTracker') {
                        const component = target[prop];
                        if (!component) return undefined;
                    
                        // Return wrapped version that hides internals
                        return new Proxy(component, {
                            get(compTarget, compProp) {
                            // Only expose essential methods
                                const allowedMethods = {
                                    'renderer': ['setBlinkingEnabled'],
                                    'shapeMorpher': ['resetMusicDetection', 'frequencyData'],
                                    'audioAnalyzer': ['microphoneStream', 'currentFrequencies'],
                                    'gazeTracker': ['enable', 'disable', 'mousePos', 'updateTargetGaze', 'currentGaze', 'getState']
                                };
                            
                                if (allowedMethods[prop]?.includes(compProp)) {
                                    return compTarget[compProp];
                                }
                                return undefined;
                            },
                            set() { return false; },
                            has() { return false; },
                            ownKeys() { return []; }
                        });
                    }
                
                    // Allow safe methods
                    return target[prop];
                },
                set() {
                    return false; // Prevent any modifications
                },
                has(target, prop) {
                // Hide internal properties from 'in' operator
                    const blockedProps = ['soundSystem', 'stateMachine', 'emotionLibrary'];
                    return !blockedProps.includes(prop) && prop in target;
                },
                ownKeys(target) {
                // Hide internal properties from Object.keys()
                    const allowedKeys = ['canvas', 'start', 'stop', 'pause', 'resume', 
                        'setEmotion', 'morphTo', 'express'];
                    return allowedKeys.filter(key => key in target);
                }
            });

            // Store canvas reference
            this.canvas = this._engine.canvas;
            this._initialized = true;

            // The initialize method is synchronous, but we keep async for future compatibility
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to initialize Emotive Engine:', error);
            throw error;
        }
    }

    /**
     * Start the animation engine
     * @throws {Error} If the engine has not been initialized
     */
    start() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.start();
    }

    /**
     * Stop the animation engine
     * @throws {Error} If the engine has not been initialized
     */
    stop() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stop();
    }

    /**
     * Pause the animation
     * @throws {Error} If the engine has not been initialized
     */
    pause() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.pause();
    }

    /**
     * Resume the animation
     * @throws {Error} If the engine has not been initialized
     */
    resume() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.resume();
    }

    // === Audio Management ===

    /**
     * Load audio from URL or Blob
     * @param {string|Blob} source - Audio URL or Blob
     * @returns {Promise<void>}
     */
    loadAudio(source) {
        return this._audioManager.loadAudio(source);
    }

    /**
     * Get audio analysis data
     * @returns {Object} Audio analysis (beats, tempo, energy)
     */
    getAudioAnalysis() {
        return this._audioManager.getAudioAnalysis();
    }

    /**
     * Connect audio element for visualization
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     */
    connectAudio(audioElement) {
        return this._audioManager.connectAudio(audioElement);
    }

    /**
     * Disconnect audio element
     * @param {HTMLAudioElement} [audioElement] - Audio element to disconnect
     */
    disconnectAudio(audioElement) {
        return this._audioManager.disconnectAudio(audioElement);
    }

    /**
     * Get spectrum data for visualization
     * @returns {Array} Frequency spectrum data
     */
    getSpectrumData() {
        return this._audioManager.getSpectrumData();
    }

    /**
     * Start rhythm sync
     * @param {number} [bpm] - Optional BPM to sync to
     */
    startRhythmSync(bpm) {
        return this._audioManager.startRhythmSync(bpm);
    }

    /**
     * Stop rhythm sync
     */
    stopRhythmSync() {
        return this._audioManager.stopRhythmSync();
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        const engine = this._getReal();
        if (!engine) return { fps: 0, frameTime: 0 };

        // Try to get from performance monitor
        if (engine.performanceMonitor) {
            return {
                fps: engine.performanceMonitor.getCurrentFPS() || 0,
                frameTime: engine.performanceMonitor.getAverageFrameTime() || 0,
                particleCount: engine.particleSystem?.activeParticles || 0
            };
        }

        // Fallback to animation controller
        if (engine.animationController) {
            return {
                fps: engine.animationController.currentFPS || 0,
                frameTime: 1000 / 60, // Default to 60fps timing
                particleCount: 0
            };
        }

        return { fps: 0, frameTime: 0, particleCount: 0 };
    }

    // === Animation Control ===

    /**
     * Trigger a gesture
     * @param {string} gestureName - Name of gesture to trigger
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    triggerGesture(gestureName, timestamp) {
        return this._gestureController.triggerGesture(gestureName, timestamp);
    }

    /**
     * Express a gesture (alias for triggerGesture for compatibility)
     * @param {string} gestureName - Name of gesture to express
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    express(gestureName, timestamp) {
        return this._gestureController.express(gestureName, timestamp);
    }

    /**
     * Execute a gesture chain combo
     * @param {string} chainName - Name of the chain combo to execute
     */
    chain(chainName) {
        return this._gestureController.chain(chainName);
    }

    /**
     * Morph to a shape (alias for setShape for compatibility)
     * @param {string} shape - Shape name to morph to
     * @param {Object} [config] - Optional shape configuration
     */
    morphTo(shape, config) {
        return this.setShape(shape, config);
    }

    /**
     * Update undertone
     * @param {string|null} undertone - Undertone name or null to clear
     */
    updateUndertone(undertone) {
        return this._gestureController.updateUndertone(undertone);
    }

    // ═══════════════════════════════════════════════════════════════════
    // LLM INTEGRATION - Natural Language Intent
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Express intent using natural language
     *
     * This is the primary method for LLM integration. It accepts plain text
     * descriptions of emotional states, gestures, and shapes, and translates
     * them into engine commands.
     *
     * @param {string} intent - Natural language intent description
     * @returns {Object} Result with parsed intent and any errors
     * @throws {Error} If rate limit exceeded or engine not initialized
     *
     * @example
     * // Simple emotion
     * mascot.feel('happy')
     *
     * // Emotion with gesture
     * mascot.feel('curious, leaning in')
     *
     * // Complex intent with undertone
     * mascot.feel('excited but nervous, bouncing')
     *
     * // With shape morph
     * mascot.feel('loving, heart shape')
     *
     * // With intensity modifier
     * mascot.feel('very angry, shaking')
     *
     * // Agreement/disagreement gestures
     * mascot.feel('yes')  // nods
     * mascot.feel('no')   // shakes head
     */
    feel(intent) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Rate limiting
        const now = Date.now();
        const limiter = this._feelRateLimiter;

        // Remove calls outside the window
        limiter.calls = limiter.calls.filter(t => now - t < limiter.windowMs);

        // Check rate limit
        if (limiter.calls.length >= limiter.maxCallsPerSecond) {
            console.warn(`[EmotiveMascot] feel: Rate limit exceeded. Max ${limiter.maxCallsPerSecond} calls per second.`);
            return {
                success: false,
                error: 'Rate limit exceeded',
                parsed: null
            };
        }

        // Record this call
        limiter.calls.push(now);

        // Parse the intent
        const parsed = this._intentParser.parse(intent);

        // Validate
        const validation = this._intentParser.validate(parsed);
        if (!validation.valid) {
            console.warn('[EmotiveMascot] feel: Invalid intent:', validation.errors);
            return {
                success: false,
                error: validation.errors.join('; '),
                parsed
            };
        }

        // Execute the parsed intent
        try {
            // Set emotion if present
            if (parsed.emotion) {
                const emotionOptions = {};
                if (parsed.undertone && parsed.undertone !== 'clear') {
                    emotionOptions.undertone = parsed.undertone;
                }
                // Use intensity to influence transition duration
                const duration = Math.round(500 + (1 - parsed.intensity) * 1000);
                this.setEmotion(parsed.emotion, emotionOptions, duration);
            }

            // Execute gestures
            for (const gesture of parsed.gestures) {
                this.express(gesture);
            }

            // Morph to shape if present
            if (parsed.shape) {
                this.morphTo(parsed.shape);
            }

            return {
                success: true,
                error: null,
                parsed
            };
        } catch (error) {
            console.error('[EmotiveMascot] feel: Execution error:', error);
            return {
                success: false,
                error: error.message,
                parsed
            };
        }
    }

    /**
     * Get available vocabulary for the feel() method
     *
     * Useful for LLMs to understand what they can express.
     *
     * @returns {Object} Available emotions, gestures, shapes, and undertones
     */
    static getFeelVocabulary() {
        return {
            emotions: IntentParser.getAvailableEmotions(),
            undertones: IntentParser.getAvailableUndertones(),
            gestures: IntentParser.getAvailableGestures(),
            shapes: IntentParser.getAvailableShapes()
        };
    }

    /**
     * Parse an intent string without executing it
     *
     * Useful for previewing what an intent will do.
     *
     * @param {string} intent - Natural language intent
     * @returns {Object} Parsed intent result
     */
    parseIntent(intent) {
        return this._intentParser.parse(intent);
    }

    /**
     * Set emotion state
     * @param {string} emotion - Emotion name
     * @param {string|number|Object} [undertoneOrDurationOrOptions] - Undertone string, duration number, or options object
     * @param {number} [timestamp] - Optional timestamp for recording
     * @throws {Error} If the engine has not been initialized
     */
    setEmotion(emotion, undertoneOrDurationOrOptions, timestamp) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Handle different parameter formats
        let undertone = null;
        let duration = 500; // Default 500ms transition
        let recordTime = timestamp;

        if (typeof undertoneOrDurationOrOptions === 'string') {
            // It's an undertone
            undertone = undertoneOrDurationOrOptions;
        } else if (typeof undertoneOrDurationOrOptions === 'number') {
            // Could be duration or timestamp - check if timestamp param is provided
            if (timestamp !== undefined) {
                // It's duration, timestamp is separate
                duration = undertoneOrDurationOrOptions;
            } else {
                // It's a timestamp (backwards compatibility)
                recordTime = undertoneOrDurationOrOptions;
            }
        } else if (undertoneOrDurationOrOptions && typeof undertoneOrDurationOrOptions === 'object') {
            // It's an options object
            const {undertone: newUndertone, duration: newDuration, intensity: newIntensity} = undertoneOrDurationOrOptions;
            undertone = newUndertone;
            if (newDuration !== undefined) duration = newDuration;
            if (newIntensity !== undefined) this._lastIntensity = newIntensity;
        }

        // Record if in recording mode
        if (this._isRecording) {
            const time = recordTime || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'emotion',
                name: emotion,
                undertone,
                time
            });
        }

        // Build options with intensity support
        const opts = {};
        if (undertone) opts.undertone = undertone;
        if (this._lastIntensity !== undefined) {
            opts.intensity = this._lastIntensity;
            this._lastIntensity = undefined;
        }
        engine.setEmotion(emotion, Object.keys(opts).length ? opts : null, duration);
    }

    /**
     * Enable or disable sound
     * @param {boolean} enabled - Whether sound should be enabled
     * @throws {Error} If the engine has not been initialized
     */
    setSoundEnabled(enabled) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        
        // Set sound state in the engine's sound system
        if (engine.soundSystem) {
            engine.soundSystem.enabled = enabled;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MULTI-EMOTION SLOT API (Feature 2)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Push an emotion into a slot (stacks if already present).
     * @param {string} emotion - Emotion name
     * @param {number} [intensity=0.5] - Intensity 0.0-1.0
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    pushEmotion(emotion, intensity = 0.5) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stateCoordinator.pushEmotion(emotion, intensity);
        return this;
    }

    /**
     * Nudge an emotion's intensity by delta.
     * @param {string} emotion - Emotion name
     * @param {number} delta - Intensity change (can be negative)
     * @param {number} [cap=1.0] - Maximum intensity
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    nudgeEmotion(emotion, delta, cap = 1.0) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stateCoordinator.nudgeEmotion(emotion, delta, cap);
        return this;
    }

    /**
     * Set emotion dampening (UP-RESONANCE-2 Feature 4).
     * Reduces the impact of positive nudges on negative emotions
     * (anger, fear, sadness, disgust, suspicion).
     * @param {number} factor - 0.0 (no dampening) to 1.0 (full dampening)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setEmotionDampening(factor) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stateCoordinator.setEmotionDampening(factor);
        return this;
    }

    /**
     * Get current emotion dampening factor.
     * @returns {number} 0.0-1.0
     */
    getEmotionDampening() {
        const engine = this._getReal();
        if (!engine) return 0;
        return engine.stateCoordinator.getEmotionDampening();
    }

    /**
     * Clear all emotion slots. Resets to neutral.
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    clearEmotions() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stateCoordinator.clearEmotions();
        return this;
    }

    /**
     * Get full emotional state (dominant, undercurrents, all slots).
     * @returns {Object} { dominant, undercurrents, slots }
     */
    getEmotionalState() {
        const engine = this._getReal();
        if (!engine) return { dominant: null, undercurrents: [], slots: [] };
        return engine.stateCoordinator.getEmotionalState();
    }

    /**
     * Serialize full engine state for persistence (UP-RESONANCE-2 Feature 3).
     * @returns {Object} Snapshot that can be JSON.stringify'd
     */
    getSnapshot() {
        const engine = this._getReal();
        if (!engine) return null;
        const snapshot = {
            version: 1,
            timestamp: Date.now(),
            stateMachine: engine.stateMachine.serialize(),
        };
        // Include dynamics config if it has been created
        if (engine.stateCoordinator._dynamics) {
            snapshot.dynamics = engine.stateCoordinator._dynamics.serialize();
        }
        return snapshot;
    }

    /**
     * Restore engine state from a snapshot (UP-RESONANCE-2 Feature 3).
     * @param {Object} data - Snapshot from getSnapshot()
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    loadSnapshot(data) {
        const engine = this._getReal();
        if (!engine || !data || data.version !== 1) return this;
        if (data.stateMachine) {
            engine.stateMachine.deserialize(data.stateMachine);
        }
        if (data.dynamics) {
            engine.stateCoordinator.dynamics.deserialize(data.dynamics);
        }
        // Fire event so listeners know state was restored
        engine.stateCoordinator._emit('emotionChanged', {
            emotion: engine.stateMachine.state.emotion,
            slots: engine.stateMachine.getSlots(),
            restored: true
        });
        return this;
    }

    /**
     * Get the EmotionDynamics instance for decay/accumulation control.
     * @returns {Object} EmotionDynamics instance
     */
    get dynamics() {
        const engine = this._getReal();
        if (!engine) return null;
        return engine.stateCoordinator.dynamics;
    }

    /**
     * Get the RhythmInputEvaluator for grading tap timing.
     * @param {Object} [config] - Optional evaluator config
     * @returns {Object|null} RhythmInputEvaluator instance
     */
    getInputEvaluator(config) {
        return this._audioManager.getInputEvaluator(config);
    }

    /**
     * Configure automatic emotion nudges based on rhythm grade (UP-RESONANCE-2 Feature 2).
     * When the evaluator grades a tap, it auto-nudges the emotion system.
     *
     * @param {Object} config - Map of grade → { emotion, delta } or null
     * @param {Object} [config.perfect] - e.g. { emotion: 'joy', delta: 0.10 }
     * @param {Object} [config.great]   - e.g. { emotion: 'calm', delta: 0.05 }
     * @param {Object} [config.good]    - null for no effect
     * @param {Object} [config.miss]    - e.g. { emotion: 'anger', delta: 0.15 }
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setEmotionFeedback(config) {
        const evaluator = this.getInputEvaluator();
        if (evaluator) evaluator.setEmotionFeedback(config);
        return this;
    }

    /**
     * Get the AudioLayerManager for stem-based adaptive music.
     * @returns {Object|null} AudioLayerManager instance
     */
    getAudioLayers() {
        return this._audioManager.getLayers();
    }

    /**
     * Get the effective BPM accounting for emotion + difficulty modifiers.
     * Composites: baseBPM * emotionTempoShift * slowModeMult (Features 5+8).
     * @returns {number} Effective BPM
     */
    getEffectiveBPM() {
        const engine = this._getReal();
        if (!engine || !engine.rhythmIntegration) return 120;
        let bpm = engine.rhythmIntegration.getEffectiveBPM(engine.stateMachine);
        const dm = this._audioManager.getDifficultyManager();
        bpm *= dm.getBPMMultiplier();
        return Math.round(bpm * 100) / 100;
    }

    /**
     * Set difficulty preset (UP-RESONANCE-2 Feature 5).
     * @param {'easy'|'normal'|'hard'} preset
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setDifficulty(preset) {
        this._audioManager.getDifficultyManager().setDifficulty(preset);
        return this;
    }

    /**
     * Set accessibility assists (UP-RESONANCE-2 Feature 5).
     * @param {Object} opts
     * @param {boolean} [opts.autoRhythm] - All inputs auto-succeed at 'good'
     * @param {boolean} [opts.slowMode] - Reduce BPM by 25%
     * @param {boolean} [opts.visualMetronome] - Enable pulse guide
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setAssist(opts) {
        this._audioManager.getDifficultyManager().setAssist(opts);
        return this;
    }

    /**
     * Apply a timed modifier (UP-RESONANCE-2 Feature 6).
     * @param {string} name - Unique modifier name
     * @param {Object} config - { duration, rhythmWindowMult, visualNoise, inputDelay, tempoShift, onTick, onExpire }
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    applyModifier(name, config) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stateCoordinator.modifiers.applyModifier(name, config);
        return this;
    }

    /**
     * Remove a timed modifier by name.
     * @param {string} name
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    removeModifier(name) {
        const engine = this._getReal();
        if (!engine) return this;
        engine.stateCoordinator.modifiers.removeModifier(name);
        return this;
    }

    /**
     * Get all active modifiers.
     * @returns {Array<{name: string, remaining: number|null, config: Object}>}
     */
    getActiveModifiers() {
        const engine = this._getReal();
        if (!engine) return [];
        return engine.stateCoordinator.modifiers.getActiveModifiers();
    }

    /**
     * Set shape
     * @param {string} shape - Shape name
     * @param {Object|number} [configOrTimestamp] - Config object or timestamp for recording
     * @throws {Error} If the engine has not been initialized
     */
    setShape(shape, configOrTimestamp) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        
        let config = {};
        let timestamp = undefined;
        
        // Handle parameter overloading
        if (typeof configOrTimestamp === 'number') {
            timestamp = configOrTimestamp;
        } else if (configOrTimestamp && typeof configOrTimestamp === 'object') {
            const {timestamp: newTimestamp, ...restConfig} = configOrTimestamp;
            config = restConfig;
            timestamp = newTimestamp;
        }
        
        // Record if in recording mode
        if (this._isRecording) {
            const time = timestamp || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'shape',
                name: shape,
                time,
                config
            });
        }
        
        // Set in engine with config for rhythm sync
        if (engine) engine.morphTo(shape, config);
    }

    /**
     * Enable gaze tracking
     * @throws {Error} If the engine has not been initialized
     */
    enableGazeTracking() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.gazeTracker) {
            engine.gazeTracker.enable();
        }
    }

    /**
     * Disable gaze tracking
     * @throws {Error} If the engine has not been initialized
     */
    disableGazeTracking() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.gazeTracker) {
            engine.gazeTracker.disable();
        }
    }

    /**
     * Set gaze target position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @throws {Error} If the engine has not been initialized
     */
    setGazeTarget(x, y) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.gazeTracker) {
            // Update the mouse position directly
            engine.gazeTracker.mousePos = { x, y };
            engine.gazeTracker.updateTargetGaze();
        }
    }

    /**
     * Set particle containment bounds
     * @param {Object} bounds - Bounds object {width, height} in pixels, null to disable containment
     * @param {number} scale - Scale factor for mascot (1 = normal, 0.5 = half size, etc.)
     */
    setContainment(bounds, scale = 1) {
        return this._visualEffectsManager.setContainment(bounds, scale);
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} [z=0] - Z offset for scaling
     * @throws {Error} If the engine has not been initialized
     */
    setPosition(x, y, z = 0) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.positionController) {
            // Ensure onUpdate callback exists
            if (!engine.positionController.onUpdate) {
                engine.positionController.onUpdate = () => {};
            }
            engine.positionController.setOffset(x, y, z);
        } else {
            // Fallback: directly manipulate canvas transform if positionController doesn't exist
            if (this._canvas) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const translateX = centerX + x;
                const translateY = centerY + y;
                const scale = 1 + (z * 0.001); // z affects scale
                this._canvas.style.transform = `translate(${translateX}px, ${translateY}px) translate(-50%, -50%) scale(${scale})`;
            }
        }
    }

    /**
     * Animate mascot to position offset from viewport center
     * @param {number} x - Target X offset from center
     * @param {number} y - Target Y offset from center
     * @param {number} [z=0] - Target Z offset for scaling
     * @param {number} [duration=1000] - Animation duration in milliseconds
     * @param {string} [easing='easeOutCubic'] - Easing function name
     * @throws {Error} If the engine has not been initialized
     */
    animateToPosition(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.positionController) {
            // Ensure onUpdate callback exists
            if (!engine.positionController.onUpdate) {
                engine.positionController.onUpdate = () => {};
            }
            engine.positionController.animateOffset(x, y, z, duration, easing);
        } else {
            // Fallback: simple animation using setPosition if positionController doesn't exist
            // Just immediately set position (animation would require requestAnimationFrame loop)
            this.setPosition(x, y, z);
        }
    }

    /**
     * Clear all particles from the particle system
     * Useful when repositioning mascot to remove particles from old position
     */
    clearParticles() {
        return this._visualEffectsManager.clearParticles();
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setParticleSystemCanvasDimensions(width, height) {
        this._visualEffectsManager.setParticleSystemCanvasDimensions(width, height);
        return this;
    }

    /**
     * Attach mascot to a DOM element - mascot will position itself in the center of the element
     * and follow it automatically on scroll/resize
     * @param {string|HTMLElement} elementOrSelector - DOM element or CSS selector
     * @param {Object} options - Positioning options
     * @param {number} options.offsetX - Additional X offset in pixels (default: 0)
     * @param {number} options.offsetY - Additional Y offset in pixels (default: 0)
     * @param {boolean} options.animate - Animate to position (default: true)
     * @param {number} options.duration - Animation duration in ms (default: 1000)
     * @param {number} options.scale - Scale factor for mascot (default: 1, e.g., 0.5 = half size)
     * @param {boolean} options.containParticles - Whether to contain particles within element bounds (default: true)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    attachToElement(elementOrSelector, options = {}) {
        return this._elementAttachmentManager.attachToElement(elementOrSelector, options);
    }

    /**
     * Check if mascot is attached to an element
     * @returns {boolean} True if attached to an element
     */
    isAttachedToElement() {
        return this._elementAttachmentManager.isAttachedToElement();
    }

    /**
     * Detach mascot from tracked element
     */
    detachFromElement() {
        return this._elementAttachmentManager.detachFromElement();
    }

    /**
     * Get gaze tracker state
     * @returns {Object|null} Gaze state or null if gaze tracker not available
     * @throws {Error} If the engine has not been initialized
     */
    getGazeState() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.gazeTracker) {
            return engine.gazeTracker.getState();
        }
        return null;
    }

    /**
     * Set BPM manually
     * @param {number} bpm - Beats per minute
     */
    setBPM(bpm) {
        const engine = this._getReal();
        if (engine && engine.rhythmIntegration) {
            engine.rhythmIntegration.setBPM(bpm);
        }
    }

    /**
     * Set quality level for performance
     * @param {string} level - 'low', 'medium', 'high'
     */
    setQuality(level) {
        const qualityMap = {
            'low': { particleCount: 50, fps: 30 },
            'medium': { particleCount: 100, fps: 60 },
            'high': { particleCount: 200, fps: 60 }
        };

        const settings = qualityMap[level] || qualityMap['medium'];
        const engine = this._getReal();

        if (engine && engine.performanceMonitor) {
            engine.performanceMonitor.setTargetFPS(settings.fps);
        }

        if (engine && engine.particleSystem) {
            engine.particleSystem.setMaxParticles(settings.particleCount);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // EXTENDED PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Set maximum number of particles
     * @param {number} maxParticles - Maximum particle count
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setMaxParticles(maxParticles) {
        const engine = this._getReal();
        if (engine && engine.particleSystem) {
            engine.particleSystem.setMaxParticles(maxParticles);
        }
        return this;
    }

    /**
     * Get current particle count
     * @returns {number} Current number of active particles
     */
    getParticleCount() {
        const engine = this._getReal();
        if (engine && engine.particleSystem && engine.particleSystem.particles) {
            return engine.particleSystem.particles.length;
        }
        return 0;
    }

    /**
     * Set mascot opacity
     * @param {number} opacity - Opacity value (0.0 to 1.0)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setOpacity(opacity) {
        const engine = this._getReal();
        opacity = Math.max(0, Math.min(1, opacity));

        if (engine && engine.renderer) {
            // Store opacity on canvas context
            const ctx = engine.canvasManager?.getContext();
            if (ctx) {
                ctx.globalAlpha = opacity;
            }
        }

        this._currentOpacity = opacity;
        return this;
    }

    /**
     * Get current opacity
     * @returns {number} Current opacity value
     */
    getOpacity() {
        return this._currentOpacity !== undefined ? this._currentOpacity : 1.0;
    }

    /**
     * Fade in the mascot
     * @param {number} duration - Fade duration in ms (default 1000)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    fadeIn(duration = 1000) {
        const startOpacity = this.getOpacity();
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const opacity = startOpacity + (1.0 - startOpacity) * progress;

            this.setOpacity(opacity);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        return this;
    }

    /**
     * Fade out the mascot
     * @param {number} duration - Fade duration in ms (default 1000)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    fadeOut(duration = 1000) {
        const startOpacity = this.getOpacity();
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const opacity = startOpacity * (1 - progress);

            this.setOpacity(opacity);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        return this;
    }

    /**
     * Set core color
     * @param {string} color - Hex color code (e.g., '#FFFFFF')
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setColor(color) {
        const engine = this._getReal();
        if (engine && engine.renderer && engine.renderer.config) {
            engine.renderer.config.coreColor = color;
        }
        return this;
    }

    /**
     * Set glow color
     * @param {string} color - Hex color code (e.g., '#667eea')
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setGlowColor(color) {
        const engine = this._getReal();
        if (engine && engine.renderer && engine.renderer.config) {
            engine.renderer.config.defaultGlowColor = color;
        }
        return this;
    }

    /**
     * Set color theme (sets both core and glow colors)
     * @param {Object} theme - Theme object with { core, glow } properties
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setTheme(theme) {
        if (theme.core) {
            this.setColor(theme.core);
        }
        if (theme.glow) {
            this.setGlowColor(theme.glow);
        }
        return this;
    }

    /**
     * Set animation speed multiplier
     * @param {number} speed - Speed multiplier (1.0 = normal, 2.0 = double speed, 0.5 = half speed)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setSpeed(speed) {
        this._getReal(); // Ensure engine is initialized
        speed = Math.max(0.1, Math.min(10, speed));

        // Store speed multiplier for potential future use
        this._speedMultiplier = speed;

        // Note: Actual speed control would need deeper engine integration
        // This is a placeholder for the API surface
        return this;
    }

    /**
     * Get current speed multiplier
     * @returns {number} Current speed multiplier
     */
    getSpeed() {
        return this._speedMultiplier || 1.0;
    }

    /**
     * Set target FPS
     * @param {number} fps - Target frames per second (default 60)
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setFPS(fps) {
        const engine = this._getReal();
        fps = Math.max(1, Math.min(120, fps));

        if (engine && engine.animationController) {
            engine.animationController.setTargetFPS(fps);
        }

        return this;
    }

    /**
     * Get current target FPS
     * @returns {number} Target FPS
     */
    getFPS() {
        const engine = this._getReal();
        if (engine && engine.animationController) {
            return engine.animationController.targetFPS || 60;
        }
        return 60;
    }

    /**
     * Check if mascot is paused
     * @returns {boolean} True if paused
     */
    isPaused() {
        const engine = this._getReal();
        if (engine && engine.animationController) {
            return engine.animationController.isPaused === true;
        }
        return false;
    }

    /**
     * Execute multiple updates in a batch for better performance
     * @param {Function} callback - Function containing batch updates
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    batch(callback) {
        // Pause rendering during batch updates
        const wasPaused = this.isPaused();
        if (!wasPaused) {
            this.pause();
        }

        // Execute callback
        if (typeof callback === 'function') {
            callback(this);
        }

        // Resume rendering if it wasn't paused before
        if (!wasPaused) {
            this.resume();
        }

        return this;
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Listener function
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    on(event, listener) {
        const engine = this._getReal();
        if (engine && engine.eventManager) {
            engine.eventManager.on(event, listener);
        }
        return this;
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Listener function
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    off(event, listener) {
        const engine = this._getReal();
        if (engine && engine.eventManager) {
            engine.eventManager.off(event, listener);
        }
        return this;
    }

    /**
     * Set global scale multiplier (independent of viewport size)
     * @param {number|Object} scaleOrOptions - Scale factor or options object
     *   - number: Global scale (1.0 = normal, 0.5 = half size, 2.0 = double size)
     *   - object: { global, core, particles } for independent control
     *     - global: Scale both core and particles (backward compatible)
     *     - core: Scale only the core
     *     - particles: Scale only the particles
     * @returns {EmotiveMascotPublic} This instance for chaining
     * @example
     * // Scale everything to 60%
     * mascot.setScale(0.6)
     *
     * // Scale everything using explicit global property
     * mascot.setScale({ global: 0.6 })
     *
     * // Independent control: larger particles, smaller core
     * mascot.setScale({ particles: 1.2, core: 0.8 })
     *
     * // Adjust only particles, keep core unchanged
     * mascot.setScale({ particles: 1.5 })
     */
    setScale(scaleOrOptions) {
        const engine = this._getReal();
        if (engine && engine.positionController) {
            if (typeof scaleOrOptions === 'number') {
                // Backward compatible: number sets global scale
                engine.positionController.setScaleOverrides(scaleOrOptions);
            } else {
                // Options object for independent control
                engine.positionController.setScaleOverrides(scaleOrOptions);
            }

            // Refresh particle pool when particle scale changes
            if (typeof scaleOrOptions === 'object' && scaleOrOptions.particles !== undefined) {
                if (engine.particleSystem && typeof engine.particleSystem.refreshPool === 'function') {
                    engine.particleSystem.refreshPool();
                }
            }
        }
        return this;
    }

    /**
     * Get current scale
     * @returns {number} Current scale factor
     */
    getScale() {
        const engine = this._getReal();
        if (engine && engine.positionController) {
            return engine.positionController.globalScale || 1.0;
        }
        return 1.0;
    }

    /**
     * Set backdrop configuration for better particle visibility
     * @param {Object} options - Backdrop configuration options
     * @param {boolean} [options.enabled=false] - Enable/disable backdrop
     *
     * @param {number} [options.radius=1.5] - Diameter multiplier (mascot size × radius)
     * @param {string} [options.shape='circle'] - Backdrop shape: 'circle', 'ellipse', 'fullscreen'
     *
     * @param {string} [options.color='rgba(0,0,0,0.6)'] - Base color (CSS color string)
     * @param {number} [options.intensity=0.7] - Overall opacity (0-1)
     * @param {string} [options.blendMode='normal'] - Canvas blend mode: 'normal', 'multiply', 'overlay', 'screen'
     *
     * @param {string} [options.falloff='smooth'] - Gradient falloff type: 'linear', 'smooth', 'exponential', 'custom'
     * @param {Array<{stop: number, alpha: number}>} [options.falloffCurve=null] - Custom falloff curve (array of {stop, alpha})
     * @param {number} [options.edgeSoftness=0.6] - How much of gradient is soft (0-1, controls overall gradient strength)
     * @param {number} [options.coreTransparency=0.2] - How far center stays transparent (0-1, 0=no transparent core, 1=fully transparent)
     *
     * @param {number} [options.blur=0] - Backdrop blur radius (pixels)
     * @param {boolean} [options.responsive=true] - React to audio amplitude
     * @param {boolean} [options.pulse=false] - Enable subtle pulsing effect
     *
     * @param {Object} [options.offset={x:0, y:0}] - Position offset from mascot center
     *
     * @param {string} [options.type='radial-gradient'] - Legacy: backdrop type ('radial-gradient', 'vignette', 'glow')
     * @returns {EmotiveMascotPublic} This instance for chaining
     *
     * @example
     * // Basic usage - simple dark backdrop
     * mascot.setBackdrop({ enabled: true })
     *
     * @example
     * // Custom size and smooth falloff
     * mascot.setBackdrop({
     *   enabled: true,
     *   radius: 5,              // Large backdrop (5x mascot size)
     *   edgeSoftness: 0.8,      // Very soft/gradual falloff
     *   coreTransparency: 0.3   // Transparent in center 30%
     * })
     *
     * @example
     * // Exponential falloff (rapid increase near edges)
     * mascot.setBackdrop({
     *   enabled: true,
     *   falloff: 'exponential',
     *   edgeSoftness: 0.9
     * })
     *
     * @example
     * // Custom falloff curve for complete control
     * mascot.setBackdrop({
     *   enabled: true,
     *   falloff: 'custom',
     *   falloffCurve: [
     *     { stop: 0, alpha: 0 },      // Center: transparent
     *     { stop: 0.5, alpha: 0.1 },  // Middle: barely visible
     *     { stop: 0.9, alpha: 0.8 },  // Near edge: strong
     *     { stop: 1, alpha: 1 }       // Edge: full opacity
     *   ]
     * })
     *
     * @example
     * // Colored backdrop with multiply blend
     * mascot.setBackdrop({
     *   enabled: true,
     *   color: 'rgba(50, 20, 100, 0.7)',
     *   blendMode: 'multiply'
     * })
     */
    setBackdrop(options = {}) {
        const engine = this._getReal();
        if (engine && typeof engine.setBackdrop === 'function') {
            engine.setBackdrop(options);
        }
        return this;
    }

    /**
     * Get current backdrop configuration
     * @returns {Object|null} Current backdrop config or null if not available
     */
    getBackdrop() {
        const engine = this._getReal();
        if (engine && typeof engine.getBackdrop === 'function') {
            return engine.getBackdrop();
        }
        return null;
    }

    // === Timeline Recording ===

    /**
     * Start recording animation sequence
     */
    startRecording() {
        return this._timelineRecorder.startRecording();
    }

    /**
     * Stop recording
     * @returns {Array} Recorded timeline
     */
    stopRecording() {
        return this._timelineRecorder.stopRecording();
    }

    /**
     * Play recorded timeline
     * @param {Array} timeline - Timeline to play
     */
    playTimeline(timeline) {
        return this._timelineRecorder.playTimeline(timeline);
    }

    /**
     * Stop timeline playback
     */
    stopPlayback() {
        return this._timelineRecorder.stopPlayback();
    }

    /**
     * Get current timeline
     * @returns {Array} Current timeline
     */
    getTimeline() {
        return this._timelineRecorder.getTimeline();
    }

    /**
     * Load timeline
     * @param {Array} timeline - Timeline to load
     */
    loadTimeline(timeline) {
        return this._timelineRecorder.loadTimeline(timeline);
    }

    /**
     * Export timeline as JSON
     * @returns {string} JSON string
     */
    exportTimeline() {
        return this._timelineRecorder.exportTimeline();
    }

    /**
     * Import timeline from JSON
     * @param {string} json - JSON string
     */
    importTimeline(json) {
        return this._timelineRecorder.importTimeline(json);
    }

    // === Playback Control ===

    /**
     * Get current playback time
     * @returns {number} Current time in milliseconds
     */
    getCurrentTime() {
        return this._timelineRecorder.getCurrentTime();
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in milliseconds
     */
    seek(time) {
        return this._timelineRecorder.seek(time);
    }

    // === Export Capabilities ===

    /**
     * Get current frame as data URL
     * @param {string} [format='png'] - Image format
     * @returns {string} Data URL
     */
    getFrameData(format = 'png') {
        return this._visualEffectsManager.getFrameData(format);
    }

    /**
     * Get current frame as Blob
     * @param {string} [format='png'] - Image format
     * @returns {Promise<Blob>} Image blob
     */
    getFrameBlob(format = 'png') {
        return this._visualEffectsManager.getFrameBlob(format);
    }

    /**
     * Export animation data
     * @returns {Object} Animation state
     */
    getAnimationData() {
        return this._timelineRecorder.getAnimationData();
    }

    // === Query Methods ===

    /**
     * Get available gestures from the full gesture registry
     * @returns {Array<Object>} List of gesture info objects with name, emoji, type, category, description
     */
    getAvailableGestures() {
        return listGestures();
    }

    /**
     * Get available emotions
     * @returns {Array<string>} List of emotion names
     */
    getAvailableEmotions() {
        return [
            'neutral', 'joy', 'sadness', 'anger', 'fear',
            'surprise', 'disgust', 'love', 'euphoria',
            'excited', 'suspicion', 'resting'
        ];
    }

    /**
     * Get available shapes
     * @returns {Array<string>} List of shape names
     */
    getAvailableShapes() {
        return [
            'circle', 'square', 'triangle', 'star',
            'heart', 'moon', 'sun'
        ];
    }

    /**
     * Get engine version
     * @returns {string} Version string
     */
    getVersion() {
        return '3.2.0';
    }

    /**
     * Get engine capabilities
     * @returns {Object} Capabilities object
     */
    getCapabilities() {
        return {
            audio: true,
            recording: true,
            timeline: true,
            export: true,
            shapes: true,
            gestures: true,
            emotions: true,
            particles: true,
            gazeTracking: true
        };
    }

    // Getter properties for components needed by demo - return safe proxies
    get renderer() {
        const engine = this._getReal();
        if (!engine || !engine.renderer) return null;
        
        // Return safe proxy that only exposes necessary methods
        return new Proxy(engine.renderer, {
            get(target, prop) {
                const allowed = ['setBlinkingEnabled'];
                return allowed.includes(prop) ? target[prop] : undefined;
            }
        });
    }

    get shapeMorpher() {
        const engine = this._getReal();
        if (!engine || !engine.shapeMorpher) return null;
        
        // Return safe proxy
        return new Proxy(engine.shapeMorpher, {
            get(target, prop) {
                const allowed = ['resetMusicDetection', 'frequencyData'];
                return allowed.includes(prop) ? target[prop] : undefined;
            }
        });
    }

    get gazeTracker() {
        const engine = this._getReal();
        if (!engine || !engine.gazeTracker) return null;
        
        // Return safe proxy
        return new Proxy(engine.gazeTracker, {
            get(target, prop) {
                const allowed = ['enable', 'disable', 'mousePos', 'updateTargetGaze', 'currentGaze', 'getState'];
                return allowed.includes(prop) ? target[prop] : undefined;
            }
        });
    }

    /**
     * Destroy the engine and clean up resources
     */
    destroy() {
        this.stop();
        this._timeline = [];
        this._isRecording = false;
        this._isPlaying = false;

        // Clean up element tracking
        this.detachFromElement();

        const engine = this._getReal();
        if (engine && engine.destroy) {
            engine.destroy();
        }
    }
}

// Export as default
export default EmotiveMascotPublic;

// Also export as named for flexibility
export { EmotiveMascotPublic };