/**
 * EmotiveMascotPublic - Public API wrapper for Emotive Engine
 * Provides safe, controlled access to engine functionality
 * @module EmotiveMascotPublic
 */

import EmotiveMascot from './EmotiveMascot.js';
import { errorHandler, EngineError, ErrorCodes } from './utils/ErrorHandler.js';

class EmotiveMascotPublic {
    constructor(config = {}) {
        // Store config for later initialization
        this._config = this._sanitizeConfig(config);
        this._engine = null;
        this._timeline = [];
        this._isRecording = false;
        this._recordingStartTime = 0;
        this._playbackStartTime = 0;
        this._isPlaying = false;
        this._audioBlob = null;
        this._audioDuration = 0;
        this._initialized = false;
        
        // Bind public methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
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
     * Initialize the Emotive Mascot engine
     * @public
     * @param {HTMLCanvasElement} canvas - Canvas element to render to
     * @returns {Promise<void>} Resolves when initialization is complete
     * @throws {Error} If canvas is invalid or initialization fails
     * @fires EmotiveMascot#initialized
     * @example
     * const canvas = document.getElementById('emotive-canvas');
     * await mascot.init(canvas);
     */
    async init(canvas) {
        return errorHandler.wrapAsync(async () => {
            if (this._initialized) {
                return Promise.resolve();
            }

            // Validate canvas
            if (!canvas) {
                throw new EngineError(
                    'Canvas element is required',
                    ErrorCodes.INVALID_CANVAS,
                    { canvas }
                );
            }

            // Create engine instance with canvas
            const engineConfig = {
                ...this._config,
                canvasId: canvas  // This accepts either string ID or element
            };

            // Create and initialize the engine - wrap in protective proxy
            const engine = new EmotiveMascot(engineConfig);
        }, { context: 'EmotiveMascotPublic.init', fallback: false })();
        
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
    }

    /**
     * Start the animation engine
     */
    start() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.start();
    }

    /**
     * Stop the animation engine
     */
    stop() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.stop();
    }

    /**
     * Pause the animation
     */
    pause() {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        engine.pause();
    }

    /**
     * Resume the animation
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
    async loadAudio(source) {
        if (source instanceof Blob) {
            this._audioBlob = source;
            const audioUrl = URL.createObjectURL(source);
            await this._loadAudioFromUrl(audioUrl);
            URL.revokeObjectURL(audioUrl);
        } else {
            await this._loadAudioFromUrl(source);
        }
    }

    /**
     * Load audio from URL
     * @private
     */
    async _loadAudioFromUrl(url) {
        // Load audio and get duration
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', () => {
                this._audioDuration = audio.duration * 1000; // Convert to ms
                resolve();
            });
            audio.addEventListener('error', reject);
            audio.load();
        });
        
        // Connect to engine's audio system using real engine reference
        if (this._realEngine && this._realEngine.soundSystem) {
            await this._realEngine.soundSystem.loadAudioFromURL(url);
        }
    }

    /**
     * Get audio analysis data
     * @returns {Object} Audio analysis (beats, tempo, energy)
     */
    getAudioAnalysis() {
        const engine = this._getReal();
        if (!engine || !engine.audioAnalyzer) return null;
        
        return {
            bpm: engine.rhythmIntegration?.getBPM() || 0,
            beats: engine.rhythmIntegration?.getBeatMarkers() || [],
            energy: engine.audioAnalyzer?.getEnergyLevel() || 0,
            frequencies: engine.audioAnalyzer?.getFrequencyData() || []
        };
    }
    
    /**
     * Connect audio element for visualization
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     */
    connectAudio(audioElement) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        
        if (engine.connectAudio) {
            engine.connectAudio(audioElement);
        }
    }
    
    /**
     * Disconnect audio element
     * @param {HTMLAudioElement} [audioElement] - Audio element to disconnect
     */
    disconnectAudio(audioElement) {
        const engine = this._getReal();
        if (!engine) return;
        
        if (engine.disconnectAudio) {
            engine.disconnectAudio(audioElement);
        }
    }
    
    /**
     * Get spectrum data for visualization
     * @returns {Array} Frequency spectrum data
     */
    getSpectrumData() {
        const engine = this._getReal();
        if (!engine || !engine.audioAnalyzer) return [];
        
        // Get raw frequency data from the analyzer
        if (engine.audioAnalyzer.dataArray) {
            // Convert Uint8Array to regular array and normalize to 0-1
            return Array.from(engine.audioAnalyzer.dataArray).map(v => v / 255);
        }
        
        // Try alternative sources
        if (engine.shapeMorpher && engine.shapeMorpher.frequencyData) {
            return Array.from(engine.shapeMorpher.frequencyData);
        }
        
        return [];
    }
    
    /**
     * Start rhythm sync
     * @param {number} [bpm] - Optional BPM to sync to
     */
    startRhythmSync(bpm) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        
        if (engine.rhythmIntegration) {
            if (bpm) {
                engine.rhythmIntegration.setBPM(bpm);
            }
            engine.rhythmIntegration.start();
        }
    }
    
    /**
     * Stop rhythm sync
     */
    stopRhythmSync() {
        const engine = this._getReal();
        if (!engine) return;
        
        if (engine.rhythmIntegration) {
            engine.rhythmIntegration.stop();
        }
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        const engine = this._getReal();
        if (!engine) return { fps: 0, frameTime: 0 };
        
        // Try to get from performance monitor
        if (this._engine.performanceMonitor) {
            return {
                fps: this._engine.performanceMonitor.getCurrentFPS() || 0,
                frameTime: this._engine.performanceMonitor.getAverageFrameTime() || 0,
                particleCount: this._engine.particleSystem?.activeParticles || 0
            };
        }
        
        // Fallback to animation controller
        if (this._engine.animationController) {
            return {
                fps: this._engine.animationController.currentFPS || 0,
                frameTime: 1000 / 60, // Default to 60fps timing
                particleCount: 0
            };
        }
        
        return { fps: 0, frameTime: 0, particleCount: 0 };
    }

    // === Animation Control ===

    /**
     * Trigger a gesture animation (alias for express in public API)
     * @public
     * @param {string} gestureName - Name of gesture to trigger (e.g., 'bounce', 'pulse', 'shake')
     * @param {number} [timestamp] - Optional timestamp for recording mode
     * @throws {Error} If engine not initialized
     * @example
     * // Simple gesture trigger
     * mascot.triggerGesture('bounce');
     *
     * // With timestamp for recording
     * mascot.triggerGesture('pulse', 1000);
     */
    triggerGesture(gestureName, timestamp) {
        return errorHandler.wrap(() => {
            const engine = this._getReal();
            if (!engine) {
                throw new EngineError(
                    'Engine not initialized. Call init() first.',
                    ErrorCodes.NOT_INITIALIZED
                );
            }

            // Validate gesture name
            if (!gestureName || typeof gestureName !== 'string') {
                throw new EngineError(
                    'Invalid gesture name',
                    ErrorCodes.INVALID_GESTURE,
                    { gestureName }
                );
            }

            // Record if in recording mode
            if (this._isRecording) {
                const time = timestamp || (Date.now() - this._recordingStartTime);
                this._timeline.push({
                    type: 'gesture',
                    name: gestureName,
                    time: time
                });
            }

            // Trigger in engine
            engine.express(gestureName);
        }, {
            context: 'EmotiveMascotPublic.triggerGesture',
            fallback: undefined,
            retryCallback: () => this.triggerGesture(gestureName, timestamp)
        })();
    }

    /**
     * Set emotion state
     * @param {string} emotion - Emotion name
     * @param {string|Object} [undertoneOrOptions] - Undertone string or options object
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    setEmotion(emotion, undertoneOrOptions, timestamp) {
        return errorHandler.wrap(() => {
            const engine = this._getReal();
            if (!engine) {
                throw new EngineError(
                    'Engine not initialized. Call init() first.',
                    ErrorCodes.NOT_INITIALIZED
                );
            }

            // Validate emotion
            if (!emotion || typeof emotion !== 'string') {
                throw new EngineError(
                    'Invalid emotion name',
                    ErrorCodes.INVALID_EMOTION,
                    { emotion }
                );
            }

            // Handle different parameter formats
            let undertone = null;
            let recordTime = timestamp;

            if (typeof undertoneOrOptions === 'string') {
                // It's an undertone
                undertone = undertoneOrOptions;
            } else if (typeof undertoneOrOptions === 'number') {
                // It's a timestamp (no undertone provided)
                recordTime = undertoneOrOptions;
            } else if (undertoneOrOptions && typeof undertoneOrOptions === 'object') {
                // It's an options object
                undertone = undertoneOrOptions.undertone;
            }

            // Record if in recording mode
            if (this._isRecording) {
                const time = recordTime || (Date.now() - this._recordingStartTime);
                this._timeline.push({
                    type: 'emotion',
                    name: emotion,
                    undertone: undertone,
                    time: time
                });
            }

            // Set in engine with undertone
            if (undertone) {
                engine.setEmotion(emotion, { undertone: undertone });
            } else {
                engine.setEmotion(emotion);
            }
        }, {
            context: 'EmotiveMascotPublic.setEmotion',
            fallback: 'neutral'
        })();
    }

    /**
     * Enable or disable sound
     * @param {boolean} enabled - Whether sound should be enabled
     */
    setSoundEnabled(enabled) {
        return errorHandler.wrap(() => {
            const engine = this._getReal();
            if (!engine) {
                throw new EngineError(
                    'Engine not initialized. Call init() first.',
                    ErrorCodes.NOT_INITIALIZED
                );
            }

            // Set sound state in the engine's sound system
            if (engine.soundSystem) {
                engine.soundSystem.enabled = enabled;
            }
        }, {
            context: 'EmotiveMascotPublic.setSoundEnabled',
            fallback: undefined
        })();
    }

    /**
     * Set shape
     * @param {string} shape - Shape name
     * @param {Object|number} [configOrTimestamp] - Config object or timestamp for recording
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
            config = configOrTimestamp;
            timestamp = config.timestamp;
        }
        
        // Record if in recording mode
        if (this._isRecording) {
            const time = timestamp || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'shape',
                name: shape,
                time: time,
                config: config
            });
        }
        
        // Set in engine with config for rhythm sync
        if (engine) engine.morphTo(shape, config);
    }

    /**
     * Enable gaze tracking
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
     * Get gaze tracker state
     * @returns {Object} Gaze state
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
        
        if (this._engine.performanceMonitor) {
            this._engine.performanceMonitor.setTargetFPS(settings.fps);
        }
        
        if (this._engine.particleSystem) {
            this._engine.particleSystem.setMaxParticles(settings.particleCount);
        }
    }

    // === Timeline Recording ===

    /**
     * Start recording animation sequence
     */
    startRecording() {
        this._timeline = [];
        this._isRecording = true;
        this._recordingStartTime = Date.now();
    }

    /**
     * Stop recording
     * @returns {Array} Recorded timeline
     */
    stopRecording() {
        this._isRecording = false;
        return this._timeline;
    }

    /**
     * Play recorded timeline
     * @param {Array} timeline - Timeline to play
     */
    playTimeline(timeline) {
        if (!timeline || !timeline.length) return;
        
        this._isPlaying = true;
        this._playbackStartTime = Date.now();
        
        // Schedule all events
        timeline.forEach(event => {
            setTimeout(() => {
                if (!this._isPlaying) return;
                
                const engine = this._getReal();
                if (!engine) return;
                
                switch (event.type) {
                    case 'gesture':
                        engine.express(event.name);
                        break;
                    case 'emotion':
                        engine.setEmotion(event.name);
                        break;
                    case 'shape':
                        engine.morphTo(event.name);
                        break;
                }
            }, event.time);
        });
        
        // Stop playback after last event
        const lastEventTime = Math.max(...timeline.map(e => e.time));
        setTimeout(() => {
            this._isPlaying = false;
        }, lastEventTime);
    }

    /**
     * Stop timeline playback
     */
    stopPlayback() {
        this._isPlaying = false;
    }

    /**
     * Get current timeline
     * @returns {Array} Current timeline
     */
    getTimeline() {
        return [...this._timeline];
    }

    /**
     * Load timeline
     * @param {Array} timeline - Timeline to load
     */
    loadTimeline(timeline) {
        this._timeline = [...timeline];
    }

    /**
     * Export timeline as JSON
     * @returns {string} JSON string
     */
    exportTimeline() {
        return JSON.stringify({
            version: '1.0',
            duration: this._audioDuration || 0,
            events: this._timeline
        });
    }

    /**
     * Import timeline from JSON
     * @param {string} json - JSON string
     */
    importTimeline(json) {
        const data = JSON.parse(json);
        this._timeline = data.events || [];
        this._audioDuration = data.duration || 0;
    }

    // === Playback Control ===

    /**
     * Get current playback time
     * @returns {number} Current time in milliseconds
     */
    getCurrentTime() {
        if (this._isPlaying) {
            return Date.now() - this._playbackStartTime;
        }
        return 0;
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in milliseconds
     */
    seek(time) {
        // Find all events up to this time and apply them
        const eventsToApply = this._timeline.filter(e => e.time <= time);
        
        // Apply the last event of each type
        const lastEvents = {};
        eventsToApply.forEach(event => {
            lastEvents[event.type] = event;
        });
        
        // Apply states
        const engine = this._getReal();
        if (engine) {
            if (lastEvents.emotion) {
                engine.setEmotion(lastEvents.emotion.name);
            }
            if (lastEvents.shape) {
                engine.morphTo(lastEvents.shape.name);
            }
        }
    }

    // === Export Capabilities ===

    /**
     * Get current frame as data URL
     * @param {string} [format='png'] - Image format
     * @returns {string} Data URL
     */
    getFrameData(format = 'png') {
        const canvas = this.canvas || this._engine.canvas;
        if (!canvas) return null;
        
        return canvas.toDataURL(`image/${format}`);
    }

    /**
     * Get current frame as Blob
     * @param {string} [format='png'] - Image format
     * @returns {Promise<Blob>} Image blob
     */
    async getFrameBlob(format = 'png') {
        const canvas = this.canvas || this._engine.canvas;
        if (!canvas) return null;
        
        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), `image/${format}`);
        });
    }

    /**
     * Export animation data
     * @returns {Object} Animation state
     */
    getAnimationData() {
        return {
            timeline: this._timeline,
            duration: this._audioDuration,
            currentTime: this.getCurrentTime(),
            emotion: this._engine.state?.emotion || 'neutral',
            shape: this._engine.state?.currentShape || 'circle'
        };
    }

    // === Query Methods ===

    /**
     * Get available gestures
     * @returns {Array<string>} List of gesture names
     */
    getAvailableGestures() {
        return [
            // Motion
            'bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt',
            'drift', 'vibrate', 'sway', 'float', 'wave',
            // Transform
            'expand', 'contract', 'stretch', 'morph', 'jump',
            // Effects
            'flash', 'glow', 'flicker',
            // Complex
            'scan', 'hula', 'orbit', 'breathe', 'settle'
        ];
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
        return '2.4.0';
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