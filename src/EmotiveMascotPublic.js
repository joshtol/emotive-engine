/**
 * EmotiveMascotPublic - Public API wrapper for Emotive Engine
 * Provides safe, controlled access to engine functionality
 * @module EmotiveMascotPublic
 */

import EmotiveMascot from './EmotiveMascot.js';

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
     * Trigger a gesture
     * @param {string} gestureName - Name of gesture to trigger
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    triggerGesture(gestureName, timestamp) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Record if in recording mode
        if (this._isRecording) {
            const time = timestamp || (Date.now() - this._recordingStartTime);
            this._timeline.push({
                type: 'gesture',
                name: gestureName,
                time
            });
        }

        // Trigger in engine
        engine.express(gestureName);
    }

    /**
     * Express a gesture (alias for triggerGesture for compatibility)
     * @param {string} gestureName - Name of gesture to express
     * @param {number} [timestamp] - Optional timestamp for recording
     */
    express(gestureName, timestamp) {
        return this.triggerGesture(gestureName, timestamp);
    }

    /**
     * Execute a gesture chain combo
     * @param {string} chainName - Name of the chain combo to execute
     */
    chain(chainName) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Chain combo definitions
        const chainDefinitions = {
            'rise': 'breathe > sway+lean+tilt',
            'flow': 'sway > lean+tilt > spin > bounce',
            'burst': 'jump > nod > shake > flash',
            'drift': 'sway+breathe+float+drift',
            'chaos': 'shake+shake > spin+flash > bounce+pulse > twist+sparkle',
            'morph': 'expand > contract > morph+glow > expand+flash',
            'rhythm': 'pulse > pulse+sparkle > pulse+flicker',
            'spiral': 'spin > orbital > twist > orbital+sparkle',
            'routine': 'nod > bounce > spin+sparkle > sway+pulse > nod+flash',
            'radiance': 'sparkle > pulse+flicker > shimmer',
            'twinkle': 'sparkle > flash > pulse+sparkle > shimmer+flicker',
            'stream': 'wave > nod+pulse > sparkle > flash'
        };

        const chainDefinition = chainDefinitions[chainName.toLowerCase()];
        if (!chainDefinition) {
            console.warn(`Chain combo '${chainName}' not found`);
            return;
        }

        // Parse and execute chain
        if (!chainDefinition.includes('>')) {
            // Simultaneous gestures (e.g., 'sway+breathe+float+drift')
            const gestures = chainDefinition.split('+').map(g => g.trim()).filter(g => g.length > 0);
            gestures.forEach(gesture => {
                engine.express(gesture);
            });
        } else {
            // Sequential groups (e.g., 'jump > nod > shake > flash')
            const gestureGroups = chainDefinition.split('>').map(g => g.trim()).filter(g => g.length > 0);

            gestureGroups.forEach((group, groupIndex) => {
                setTimeout(() => {
                    // Each group can have simultaneous gestures (e.g., 'sway+pulse')
                    const simultaneousGestures = group.split('+').map(g => g.trim()).filter(g => g.length > 0);
                    simultaneousGestures.forEach(gesture => {
                        engine.express(gesture);
                    });
                }, groupIndex * 500); // 500ms delay between groups
            });
        }
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
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Apply undertone to current emotion
        if (engine.updateUndertone && typeof engine.updateUndertone === 'function') {
            engine.updateUndertone(undertone);
        } else if (engine.addUndertone && typeof engine.addUndertone === 'function') {
            engine.addUndertone(undertone);
        }
    }

    /**
     * Set emotion state
     * @param {string} emotion - Emotion name
     * @param {string|number|Object} [undertoneOrDurationOrOptions] - Undertone string, duration number, or options object
     * @param {number} [timestamp] - Optional timestamp for recording
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
            const {undertone: newUndertone, duration: newDuration} = undertoneOrDurationOrOptions;
            undertone = newUndertone;
            if (newDuration !== undefined) duration = newDuration;
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

        // Set in engine with undertone and duration
        if (undertone) {
            engine.setEmotion(emotion, { undertone }, duration);
        } else {
            engine.setEmotion(emotion, null, duration);
        }
    }

    /**
     * Enable or disable sound
     * @param {boolean} enabled - Whether sound should be enabled
     */
    setSoundEnabled(enabled) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        
        // Set sound state in the engine's sound system
        if (engine.soundSystem) {
            engine.soundSystem.enabled = enabled;
        }
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
     * Set particle containment bounds
     * @param {Object} bounds - Bounds object {width, height} in pixels, null to disable containment
     * @param {number} scale - Scale factor for mascot (1 = normal, 0.5 = half size, etc.)
     */
    setContainment(bounds, scale = 1) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Set bounds on particle system
        if (engine.particleSystem) {
            engine.particleSystem.setContainmentBounds(bounds);
        }

        // CRITICAL: Set scale on PositionController (affects both core and particles)
        // The renderer recalculates scaleFactor every frame from effectiveCenter.coreScale
        // so we must set it on the PositionController which provides effectiveCenter
        if (engine.positionController) {
            engine.positionController.coreScaleOverride = scale;
            engine.positionController.particleScaleOverride = scale;
        }

        // Also update existing particles immediately (new particles will use PositionController scale)
        if (engine.particleSystem && engine.particleSystem.particles) {
            engine.particleSystem.particles.forEach(p => {
                p.scaleFactor = scale;
                p.size = p.baseSize * scale;
            });
        }
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset for scaling (optional)
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
     * @param {number} z - Target Z offset for scaling (optional)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name (optional)
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
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.particleSystem) {
            engine.particleSystem.clear();
        }
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascotPublic} This instance for chaining
     */
    setParticleSystemCanvasDimensions(width, height) {
        const engine = this._getReal();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');
        if (engine.setParticleSystemCanvasDimensions) {
            engine.setParticleSystemCanvasDimensions(width, height);
        }
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
        console.log('[EmotiveMascot] attachToElement called', elementOrSelector, options);

        const engine = this._getReal();
        if (!engine) {
            console.error('[EmotiveMascot] Engine not initialized');
            throw new Error('Engine not initialized. Call init() first.');
        }

        // Get the target element
        const element = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;

        if (!element) {
            console.error(`[EmotiveMascot] Element not found: ${elementOrSelector}`);
            return this;
        }

        console.log('[EmotiveMascot] Element found, storing tracking info');

        // Store element tracking info
        this._attachedElement = element;
        this._attachOptions = {
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0,
            animate: options.animate !== false,
            duration: options.duration || 1000,
            scale: options.scale || 1,
            containParticles: options.containParticles !== false
        };

        // Set containment bounds and scale if requested
        const rect = element.getBoundingClientRect();
        if (this._attachOptions.containParticles) {
            this.setContainment({ width: rect.width, height: rect.height }, this._attachOptions.scale);
        } else if (this._attachOptions.scale !== 1) {
            this.setContainment(null, this._attachOptions.scale);
        }

        // Position mascot at element - INLINE to prevent tree-shaking
        const canvas = this._canvas;

        if (canvas) {
            // Get viewport center
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;

            // Get element center in viewport coordinates
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;

            // Calculate offset from viewport center (what setPosition expects)
            const offsetX = elementCenterX - viewportCenterX + this._attachOptions.offsetX;
            const offsetY = elementCenterY - viewportCenterY + this._attachOptions.offsetY;

            console.log('[EmotiveMascot] attachToElement positioning:', {
                rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                viewportCenter: { x: viewportCenterX, y: viewportCenterY },
                elementCenter: { x: elementCenterX, y: elementCenterY },
                offset: { x: offsetX, y: offsetY }
            });

            // Use animation on first attach, instant updates on scroll/resize
            const isFirstAttach = !this._hasAttachedBefore;
            this._hasAttachedBefore = true;

            if (isFirstAttach && this._attachOptions.animate) {
                console.log('[EmotiveMascot] Animating to position:', offsetX, offsetY);
                this.animateToPosition(offsetX, offsetY, 0, this._attachOptions.duration);
            } else {
                console.log('[EmotiveMascot] Setting position:', offsetX, offsetY);
                this.setPosition(offsetX, offsetY, 0);
            }
        }

        // Set up automatic tracking on scroll and resize - INLINE to prevent tree-shaking
        if (!this._elementTrackingHandlers) {
            this._elementTrackingHandlers = {
                scroll: () => {
                    if (!this._attachedElement || !this._canvas) return;

                    const rect = this._attachedElement.getBoundingClientRect();
                    const viewportCenterX = window.innerWidth / 2;
                    const viewportCenterY = window.innerHeight / 2;
                    const elementCenterX = rect.left + rect.width / 2;
                    const elementCenterY = rect.top + rect.height / 2;
                    const offsetX = elementCenterX - viewportCenterX + this._attachOptions.offsetX;
                    const offsetY = elementCenterY - viewportCenterY + this._attachOptions.offsetY;

                    this.setPosition(offsetX, offsetY, 0);
                },
                resize: () => {
                    if (!this._attachedElement || !this._canvas) return;

                    const rect = this._attachedElement.getBoundingClientRect();
                    const viewportCenterX = window.innerWidth / 2;
                    const viewportCenterY = window.innerHeight / 2;
                    const elementCenterX = rect.left + rect.width / 2;
                    const elementCenterY = rect.top + rect.height / 2;
                    const offsetX = elementCenterX - viewportCenterX + this._attachOptions.offsetX;
                    const offsetY = elementCenterY - viewportCenterY + this._attachOptions.offsetY;

                    this.setPosition(offsetX, offsetY, 0);
                }
            };
            window.addEventListener('scroll', this._elementTrackingHandlers.scroll, { passive: true });
            window.addEventListener('resize', this._elementTrackingHandlers.resize);
        }

        return this;
    }

    /**
     * Check if mascot is attached to an element
     * @returns {boolean} True if attached to an element
     */
    isAttachedToElement() {
        return !!this._attachedElement;
    }

    /**
     * Detach mascot from tracked element
     */
    detachFromElement() {
        this._attachedElement = null;

        // Remove event listeners
        if (this._elementTrackingHandlers) {
            window.removeEventListener('scroll', this._elementTrackingHandlers.scroll);
            window.removeEventListener('resize', this._elementTrackingHandlers.resize);
            this._elementTrackingHandlers = null;
        }

        // Clear containment and reset scale
        this.setContainment(null, 1);

        return this;
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
        const engine = this._getReal();
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
    getFrameBlob(format = 'png') {
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
        return '2.5.1';
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