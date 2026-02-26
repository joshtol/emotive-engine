/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE 3D
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotive Engine 3D - Experimental WebGL Rendering
 * @author Emotive Engine Team
 * @version 3.3.0
 * @module EmotiveEngine3D
 *
 * EXPERIMENTAL: 3D rendering variant with WebGL core + Canvas2D particles
 *
 * Features:
 * - 3D core geometries (crystal, diamond, sphere, etc.)
 * - Procedural animations (bounce, pulse, rotate)
 * - Same API as 2D version: express(), setEmotion(), morphTo()
 * - WebGL rendering with shader-based glow effects
 * - Canvas2D particle overlay (existing particle system)
 *
 * Usage:
 *   import EmotiveMascot3D from '@joshtol/emotive-engine/3d';
 *
 *   const mascot = new EmotiveMascot3D({
 *       canvasId: 'mascot-canvas',
 *       coreGeometry: 'crystal'  // or 'diamond', 'sphere', etc.
 *   });
 *
 *   await mascot.init(canvas);
 *   mascot.start();
 *
 *   // Same API as 2D version
 *   mascot.setEmotion('joy');
 *   mascot.express('bounce');
 */

import { Core3DManager } from './Core3DManager.js';
import { CanvasLayerManager } from './CanvasLayerManager.js';
import ParticleSystem from '../core/ParticleSystem.js'; // Reuse 2D particles!
import { EventManager } from '../core/events/EventManager.js';
import ErrorBoundary from '../core/events/ErrorBoundary.js';
import { getEmotion, listEmotions, hasEmotion } from '../core/emotions/index.js';
import { getGesture, listGestures, warmUpGestures as _warmUpGestures, GESTURE_CATEGORIES } from '../core/gestures/index.js';
import { FrameBudgetScheduler } from './FrameBudgetScheduler.js';
// Import bare registry — element type registrations are side effects in
// ElementRegistrations.js, loaded only by index-with-elementals.js.
import { ElementTypeRegistry } from './effects/ElementTypeRegistry.js';
import { applySSSPreset as applySSS, SSSPresets } from './presets/SSSPresets.js';
import { IntentParser } from '../core/intent/IntentParser.js';
import { AudioBridge } from './audio/AudioBridge.js';
import { DanceChoreographer } from './animation/DanceChoreographer.js';
import { ResizeObserverManager } from './managers/ResizeObserverManager.js';
import { FRAME_TIMING, ACCESSIBILITY } from '../core/config/defaults.js';

/**
 * Valid geometry types for morphTo()
 * @type {string[]}
 */
const VALID_GEOMETRIES = ['sphere', 'crystal', 'diamond', 'rough', 'heart', 'star', 'moon', 'sun'];

/**
 * EmotiveMascot3D - 3D rendering variant
 *
 * Hybrid architecture:
 * - Layer 1 (back): WebGL canvas with 3D core
 * - Layer 2 (front): Canvas2D with particles
 *
 * @class EmotiveMascot3D
 * @example
 * const mascot = new EmotiveMascot3D({
 *     canvasId: 'mascot-canvas',
 *     coreGeometry: 'crystal'
 * });
 * await mascot.init(container);
 * mascot.start();
 * mascot.setEmotion('joy');
 */
export class EmotiveMascot3D {
    /**
     * Create a new EmotiveMascot3D instance
     * @param {Object} [config={}] - Configuration options
     * @param {string} [config.canvasId='emotive-canvas'] - Base ID for canvas elements
     * @param {string} [config.coreGeometry='sphere'] - 3D geometry type (sphere, crystal, diamond, moon, sun, etc.)
     * @param {number} [config.targetFPS=60] - Target frames per second
     * @param {boolean} [config.enableParticles=true] - Enable particle effects
     * @param {string} [config.defaultEmotion='neutral'] - Initial emotion state
     * @param {boolean} [config.enablePostProcessing=true] - Enable post-processing effects (bloom, etc.)
     * @param {boolean} [config.enableShadows=false] - Enable shadow rendering
     * @param {boolean} [config.enableControls=true] - Enable camera controls (mouse/touch)
     * @param {boolean} [config.autoRotate=true] - Enable auto-rotation
     * @param {boolean} [config.enableBlinking=true] - Enable blinking animation
     * @param {boolean} [config.enableBreathing=true] - Enable breathing animation
     * @param {number} [config.cameraDistance] - Camera Z distance from origin
     * @param {number} [config.fov=45] - Camera field of view in degrees
     * @param {number} [config.minZoom] - Minimum zoom distance
     * @param {number} [config.maxZoom] - Maximum zoom distance
     * @param {string} [config.materialVariant] - Material variant override
     */
    constructor(config = {}) {
        this.config = {
            canvasId: config.canvasId || 'emotive-canvas',
            coreGeometry: config.coreGeometry || 'sphere',
            targetFPS: config.targetFPS || 60,
            enableParticles: config.enableParticles !== false,
            defaultEmotion: config.defaultEmotion || 'neutral',
            ...config
        };

        // Canvas layer manager (dual canvas architecture)
        this._canvasLayerManager = null;
        this._resizeObserver = null;
        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;

        // Renderers
        this.core3D = null;
        this.particleSystem = null;

        // Dance choreographer (auto dance once BPM is locked)
        this.danceChoreographer = null;

        // State
        this.isRunning = false;
        this._destroyed = false;
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.gestureTimeouts = []; // Track setTimeout IDs for cleanup

        // Event system (reuse from 2D engine)
        this.eventManager = new EventManager();

        // Add emit/on/off methods to EventManager (DOM event manager doesn't have these)
        if (!this.eventManager.emit) {
            this.eventManager._listeners = {};
            this.eventManager.emit = (event, data) => {
                const listeners = this.eventManager._listeners[event];
                if (listeners) {
                    listeners.forEach(listener => listener(data));
                }
            };
            this.eventManager.on = (event, listener) => {
                if (!this.eventManager._listeners[event]) {
                    this.eventManager._listeners[event] = [];
                }
                this.eventManager._listeners[event].push(listener);
            };
            this.eventManager.off = (event, listener) => {
                const listeners = this.eventManager._listeners[event];
                if (listeners) {
                    const index = listeners.indexOf(listener);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            };
        }

        // Error boundary (no parameters needed)
        this.errorBoundary = new ErrorBoundary();

        // State tracking
        this.emotion = 'neutral';
        this.undertone = null;

        // Intent parser for feel() API
        this._intentParser = new IntentParser();
        this._feelRateLimiter = {
            calls: new Array(10).fill(0),
            index: 0,
            windowMs: 1000,
            maxCallsPerSecond: 10
        };

        // Audio bridge for audio-reactive animations (initialized lazily)
        this._audioBridge = null;

        // Accessibility: Check reduced motion preference
        this._prefersReducedMotion = ACCESSIBILITY.prefersReducedMotion();
        this._reducedMotionMediaQuery = null;
    }

    /**
     * Check if user prefers reduced motion
     * @returns {boolean} True if reduced motion is preferred
     */
    prefersReducedMotion() {
        return this._prefersReducedMotion;
    }

    /**
     * Set reduced motion mode manually
     * @param {boolean} enabled - Whether to enable reduced motion
     * @returns {EmotiveMascot3D} This instance for chaining
     */
    setReducedMotion(enabled) {
        this._prefersReducedMotion = enabled;

        // Apply reduced motion settings
        if (enabled) {
            if (ACCESSIBILITY.REDUCED_MOTION_DISABLE_AUTO_ROTATE) {
                this.disableAutoRotate();
            }
            if (ACCESSIBILITY.REDUCED_MOTION_DISABLE_PARTICLES) {
                this.disableParticles();
            }
        }

        this.eventManager.emit('accessibility:reducedMotion', { enabled });
        return this;
    }

    /**
     * Setup listener for reduced motion media query changes
     * @private
     */
    _setupReducedMotionListener() {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        this._reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Handler for preference changes
        this._reducedMotionHandler = event => {
            this._prefersReducedMotion = event.matches;
            this.setReducedMotion(event.matches);
        };

        // Use addEventListener for modern browsers, addListener for legacy
        if (this._reducedMotionMediaQuery.addEventListener) {
            this._reducedMotionMediaQuery.addEventListener('change', this._reducedMotionHandler);
        } else if (this._reducedMotionMediaQuery.addListener) {
            this._reducedMotionMediaQuery.addListener(this._reducedMotionHandler);
        }
    }

    /**
     * Check if the mascot has been destroyed
     * @private
     * @returns {boolean} True if destroyed
     */
    _isDestroyed() {
        return this._destroyed || !this.eventManager || !this.eventManager._listeners;
    }

    /**
     * Get or create the AudioBridge instance (lazy initialization)
     * @private
     * @returns {AudioBridge}
     */
    _getAudioBridge() {
        if (!this._audioBridge) {
            this._audioBridge = new AudioBridge({
                onRhythmStart: (bpm, feel) => this.startRhythm(bpm, feel),
                onRhythmStop: () => this.stopRhythm(),
                onBPMChange: bpm => {
                    if (this.isRhythmPlaying()) {
                        this.setRhythmBPM(bpm);
                    }
                },
                onGrooveConfidenceChange: confidence => {
                    if (this.core3D?.rhythm3DAdapter) {
                        this.core3D.rhythm3DAdapter.setGrooveConfidence(confidence);
                    }
                }
            });
        }
        return this._audioBridge;
    }

    /**
     * Initialize the 3D engine
     * @param {HTMLElement} container - Container element or canvas
     * @returns {EmotiveMascot3D} This instance for chaining
     * @throws {Error} If initialization fails or called in SSR environment
     */
    init(container) {
        // SSR Guard: Prevent crashes in server-side rendering environments
        if (typeof window === 'undefined') {
            throw new Error(
                'EmotiveMascot3D.init() requires a browser environment. ' +
                'For SSR frameworks, use dynamic import with ssr:false (Next.js) or <ClientOnly> (Nuxt).'
            );
        }

        try {
            // Setup dual canvas layers via CanvasLayerManager
            this._canvasLayerManager = new CanvasLayerManager({
                canvasId: this.config.canvasId,
                enableControls: this.config.enableControls
            });
            const layers = this._canvasLayerManager.setup(container);
            this.container = layers.container;
            this.webglCanvas = layers.webglCanvas;
            this.canvas2D = layers.canvas2D;

            // Initialize 3D core renderer
            this.core3D = new Core3DManager(this.webglCanvas, {
                geometry: this.config.coreGeometry,
                emotion: this.config.defaultEmotion,
                enableParticles: this.config.enableParticles,
                enablePostProcessing: this.config.enablePostProcessing,
                enableShadows: this.config.enableShadows,
                enableControls: this.config.enableControls,
                enableShatter: this.config.enableShatter,
                autoRotate: this.config.autoRotate,
                enableBlinking: this.config.enableBlinking,
                enableBreathing: this.config.enableBreathing,
                cameraDistance: this.config.cameraDistance,
                fov: this.config.fov,
                minZoom: this.config.minZoom,
                maxZoom: this.config.maxZoom,
                materialVariant: this.config.materialVariant,
                assetBasePath: this.config.assetBasePath,
                preloadElements: this.config.preloadElements,
                backgroundPrewarm: this.config.backgroundPrewarm
            });

            // Cache 2D canvas context to prevent repeated getContext() calls
            this.ctx2D = this.canvas2D.getContext('2d');

            // Initialize particle system (2D overlay)
            // ONLY create 2D particles if 3D WebGL particles are NOT available
            // 3D demos should use WebGL particles, not 2D canvas overlay
            if (this.config.enableParticles && !this.core3D?.particleOrchestrator) {
                const maxParticles = this.config.maxParticles || 300;
                this.particleSystem = new ParticleSystem(maxParticles, this.errorBoundary);

                // Set canvas dimensions for particle containment
                this.particleSystem.canvasWidth = this.canvas2D.width;
                this.particleSystem.canvasHeight = this.canvas2D.height;
            }

            // Observe container for resize (orientation change, layout shift, viewport resize)
            this._resizeObserver = new ResizeObserverManager(this.container, (width, height) => {
                this._canvasLayerManager.resize(width, height);
                this.core3D.renderer.resize(width, height);
                if (this.particleSystem) {
                    this.particleSystem.canvasWidth = width;
                    this.particleSystem.canvasHeight = height;
                }
            });

            // Initialize dance choreographer (for auto-dancing when BPM locks)
            this.danceChoreographer = new DanceChoreographer();
            this.danceChoreographer.setRhythmAdapter(this.core3D?.rhythm3DAdapter);
            this.danceChoreographer.setMascot(this);
            // Note: audioDeformer is set later when listenTo() is called

            // Accessibility: Listen for reduced motion preference changes
            this._setupReducedMotionListener();

            // Apply reduced motion settings if preference is set
            if (this._prefersReducedMotion) {
                this.setReducedMotion(true);
            }

            return this;
        } catch (error) {
            console.error('Failed to initialize 3D engine:', error);
            throw error;
        }
    }

    /**
     * Start animation loop
     * Waits for geometry to be fully loaded before starting render
     * @async
     * @returns {Promise<void>}
     */
    async start() {
        if (this.isRunning) return;

        // Wait for core to be fully initialized (geometry loaded)
        // This prevents Three.js errors from async OBJ loading
        if (this.core3D) {
            await this.core3D.waitUntilReady();
        }

        this.isRunning = true;
        this.lastFrameTime = null; // Will be set on first animate() call
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main animation loop
     * @private
     * @param {number} currentTime - Current timestamp in milliseconds
     */
    animate(currentTime) {
        // Guard against calls after destroy or stop
        if (!this.isRunning || this._destroyed) {
            return;
        }

        // Initialize lastFrameTime on first frame
        if (this.lastFrameTime === null) {
            this.lastFrameTime = currentTime;
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        // Calculate deltaTime and cap it to prevent huge jumps when tab is inactive
        // Max cap prevents rotation explosions when tabbing back in
        const rawDeltaTime = currentTime - this.lastFrameTime;
        const deltaTime = Math.min(rawDeltaTime, FRAME_TIMING.RENDER_DELTA_CAP);

        this.lastFrameTime = currentTime;

        // Measure frame work time for budget scheduler
        const frameStart = performance.now();

        // Render 3D core - check again as state may have changed
        if (this.core3D && !this._destroyed) {
            this.core3D.render(deltaTime);

            // CRITICAL: Append canvas to DOM after first frame renders
            // Canvas is created but NOT added to DOM during setup to prevent garbage data flash
            // Only after the first successful render do we add it to the document
            if (this._canvasLayerManager && !this._canvasLayerManager.isCanvasAppended()) {
                this._canvasLayerManager.appendWebGLCanvas();
            }
        }

        // Update dance choreographer (auto-triggers gestures when BPM is locked)
        if (this.danceChoreographer && !this._destroyed) {
            this.danceChoreographer.update(deltaTime / 1000); // Convert to seconds
        }

        // Render 2D particles (or clear canvas if disabled)
        if (this.canvas2D && this.ctx2D) {
            // Always clear canvas first
            this.ctx2D.clearRect(0, 0, this.canvas2D.width, this.canvas2D.height);

            // Fill with transparent to ensure clearing
            this.ctx2D.fillStyle = 'rgba(0,0,0,0)';
            this.ctx2D.fillRect(0, 0, this.canvas2D.width, this.canvas2D.height);

            if (this.particleSystem) {
                const centerX = this.canvas2D.width / 2;
                const centerY = this.canvas2D.height / 2;

                // Get current emotion and its visual parameters
                const currentEmotion = this.core3D ? this.core3D.emotion : 'neutral';
                const emotionData = getEmotion(currentEmotion);
                const glowColor = this.core3D ? this.rgbToHex(this.core3D.glowColor) : '#FFFFFF';

                // Extract emotion-specific particle parameters
                const particleBehavior = emotionData?.visual?.particleBehavior || 'ambient';
                const particleRate = emotionData?.visual?.particleRate || 15;
                const minParticles = emotionData?.visual?.minParticles || 5;
                const maxParticles = emotionData?.visual?.maxParticles || 30;
                const particleColors = emotionData?.visual?.particleColors || null;

                // Spawn particles - EXACT same as 2D site, no modifications
                this.particleSystem.spawn(
                    particleBehavior,   // Use emotion's particle behavior
                    currentEmotion,     // emotion
                    particleRate,       // Use emotion's spawn rate
                    centerX, centerY,   // position
                    deltaTime,          // deltaTime in milliseconds
                    null,               // count (rate-based)
                    minParticles,       // Use emotion's min particles
                    maxParticles,       // Use emotion's max particles
                    1.0,                // scaleFactor (same as 2D)
                    1.0,                // particleSizeMultiplier
                    particleColors,     // Use emotion's color palette
                    this.undertone      // undertone modifier
                );

                // Apply gesture to particles if active
                let gestureMotion = null;
                let gestureProgress = 0;
                if (this.currentGesture) {
                    const elapsed = currentTime - this.currentGesture.startTime;
                    gestureProgress = Math.min(elapsed / this.currentGesture.duration, 1);
                    gestureMotion = {
                        ...this.currentGesture.config,
                        type: this.currentGesture.name  // Use gesture NAME (e.g., "bounce"), not TYPE
                    };
                }

                // Update particles - EXACT same as 2D site
                this.particleSystem.update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, this.undertone);

                // Render particles with emotion color
                this.particleSystem.render(this.ctx2D, glowColor, null);
            }
        }

        // Frame-budget scheduler: process one queued work item if budget allows
        if (this._frameBudgetScheduler) {
            const frameTime = performance.now() - frameStart;
            this._frameBudgetScheduler.tick(frameTime);
        }

        // Continue loop
        this.animationFrameId = requestAnimationFrame(time => this.animate(time));
    }

    /**
     * Set emotional state (same API as 2D version)
     * @param {string} emotion - Emotion name
     * @param {string|number|Object|null} undertoneOrDurationOrOptions - Undertone string, duration number, or options object
     * @param {number} [_timestamp] - Optional timestamp (unused in 3D, for API compatibility)
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    setEmotion(emotion, undertoneOrDurationOrOptions, _timestamp) {
        // Guard against calls after destroy
        if (this._isDestroyed()) return this;

        // Validate emotion parameter
        if (!emotion || typeof emotion !== 'string') {
            console.warn(`[EmotiveMascot3D] setEmotion: Invalid emotion "${emotion}". Use getAvailableEmotions() for valid options.`);
            return this;
        }

        // Warn on unknown emotion (but still allow it for custom emotions)
        if (!hasEmotion(emotion)) {
            console.warn(`[EmotiveMascot3D] Unknown emotion "${emotion}". Valid emotions: ${listEmotions().join(', ')}`);
        }

        this.emotion = emotion;

        // Handle different parameter formats (matching 2D API)
        // let duration = 500; // Default duration (unused for now, could be used for particle transition)

        if (undertoneOrDurationOrOptions !== undefined) {
            if (typeof undertoneOrDurationOrOptions === 'string') {
                // It's an undertone
                this.undertone = undertoneOrDurationOrOptions;
            } else if (typeof undertoneOrDurationOrOptions === 'number') {
                // It's a duration - accepted for API compatibility but 3D doesn't use it yet
                // Keep existing undertone
            } else if (undertoneOrDurationOrOptions && typeof undertoneOrDurationOrOptions === 'object') {
                // It's an options object
                this.undertone = undertoneOrDurationOrOptions.undertone || null;
                // duration = undertoneOrDurationOrOptions.duration || 500;
            } else if (undertoneOrDurationOrOptions === null) {
                // Explicitly clearing undertone
                this.undertone = null;
            }
        }
        // else: undefined, keep existing this.undertone

        if (this.core3D) {
            this.core3D.setEmotion(emotion, this.undertone);
        }

        // Clear all particles for instant transition
        if (this.particleSystem) {
            this.particleSystem.particles = [];
        }

        this.eventManager.emit('emotion:change', { emotion, undertone: this.undertone });
        return this;
    }

    /**
     * Update the undertone without resetting emotion
     * @param {string|null} undertone - The undertone to apply
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    updateUndertone(undertone) {
        // Guard against calls after destroy
        if (this._isDestroyed()) return this;

        this.undertone = undertone;

        // Re-apply emotion with new undertone
        if (this.core3D && this.emotion) {
            this.core3D.setEmotion(this.emotion, undertone);
        }

        this.eventManager.emit('undertone:change', { undertone });
        return this;
    }

    /**
     * Set the undertone (alias for updateUndertone)
     * @param {string|null} undertone - The undertone to apply
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    setUndertone(undertone) {
        return this.updateUndertone(undertone);
    }

    /**
     * Express a gesture (same API as 2D version)
     * @param {string} gestureName - Gesture name
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    express(gestureName) {
        // Guard against calls after destroy
        if (this._isDestroyed()) return this;

        // Validate gesture parameter
        if (!gestureName || typeof gestureName !== 'string') {
            console.warn(`[EmotiveMascot3D] express: Invalid gesture "${gestureName}". Use getAvailableGestures() for valid options.`);
            return this;
        }

        // Apply gesture to 3D core
        if (this.core3D) {
            this.core3D.playGesture(gestureName);
        }

        // Apply gesture to particles (same as 2D)
        const gesture = getGesture(gestureName);
        if (gesture) {
            const config = gesture.config || {};
            const duration = config.musicalDuration?.musical
                ? (config.musicalDuration.beats || 2) * 500
                : (config.duration || 800);


            // Track current gesture for particle system
            this.currentGesture = {
                name: gestureName,
                gesture,
                config,
                startTime: performance.now(),
                duration
            };

            // Clear gesture when complete
            const timeoutId = setTimeout(() => {
                if (this.currentGesture && this.currentGesture.name === gestureName) {
                    this.currentGesture = null;
                }
            }, duration);
            this.gestureTimeouts.push(timeoutId);
        } else {
            // Warn on unknown gesture
            const gestureNames = listGestures().map(g => g.name);
            console.warn(`[EmotiveMascot3D] Unknown gesture "${gestureName}". Valid gestures: ${gestureNames.slice(0, 10).join(', ')}...`);
        }

        this.eventManager.emit('gesture:trigger', { gesture: gestureName });
        return this;
    }

    /**
     * Trigger a gesture (alias for express, used by DanceChoreographer)
     * @param {string} gestureName - Gesture name
     * @param {Object} options - Options object
     * @param {number} options.scale - Scale multiplier for gesture amplitude
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    gesture(gestureName, _options = {}) {
        // Scale is applied via the 3D core's gesture system
        // For now, just call express - the scale option can be wired in later
        return this.express(gestureName);
    }

    /**
     * Execute a gesture chain combo (same API as 2D version)
     * @param {string|Array} chainName - Chain combo name or array of gestures
     */
    chain(chainName) {
        // Chain definitions from site demo
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

        // Get chain definition
        const chainString = typeof chainName === 'string' ? chainDefinitions[chainName] || chainName : chainName.join('>');

        // Parse chain: split by '>' for sequential steps
        const steps = chainString.split('>').map(step =>
            step.trim().split('+').map(g => g.trim()).filter(g => g.length > 0)
        );

        // Execute chain sequence
        this.executeChainSequence(steps);
    }

    /**
     * Execute a sequence of gesture steps with proper timing
     * @param {Array<Array<string>>} steps - Array of steps, each containing simultaneous gestures
     * @private
     */
    executeChainSequence(steps) {
        if (!steps || steps.length === 0) return;

        let currentStep = 0;
        const stepDuration = 800; // Base duration per step (ms)

        const executeStep = () => {
            if (currentStep >= steps.length) return;

            const step = steps[currentStep];

            // Execute all gestures in this step simultaneously
            step.forEach(gestureName => {
                this.express(gestureName);
            });

            currentStep++;
            if (currentStep < steps.length) {
                const timeoutId = setTimeout(executeStep, stepDuration);
                this.gestureTimeouts.push(timeoutId);
            }
        };

        executeStep();
    }

    /**
     * Morph to shape (same API as 2D version)
     * Supports interruption - calling this during an active morph will
     * smoothly transition to the new target without visual glitches.
     *
     * @param {string} shapeName - Shape name
     * @param {Object} options - Optional configuration
     * @param {number} options.duration - Transition duration in ms (default: 800ms)
     * @param {string} options.materialVariant - Material variant to use (e.g., 'multiplexer' for moon blood moon)
     * @param {Function} options.onMaterialSwap - Callback when material is swapped (at morph midpoint)
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    morphTo(shapeName, options = {}) {
        // Guard against calls after destroy
        if (this._isDestroyed()) return this;

        // Validate shapeName parameter
        if (!shapeName || typeof shapeName !== 'string') {
            console.warn(`[EmotiveMascot3D] morphTo: Invalid shape "${shapeName}". Use getAvailableGeometries() for valid options.`);
            return this;
        }

        // Warn on unknown geometry
        if (!VALID_GEOMETRIES.includes(shapeName)) {
            console.warn(`[EmotiveMascot3D] Unknown geometry "${shapeName}". Valid geometries: ${VALID_GEOMETRIES.join(', ')}`);
        }

        if (this.core3D) {
            // Set material variant before morphing (if specified)
            if (options.materialVariant !== undefined) {
                this.core3D.setMaterialVariant(options.materialVariant);
            }

            // Set up one-time material swap callback if specified
            if (options.onMaterialSwap) {
                const existingCallback = this.core3D.onMaterialSwap;
                this.core3D.onMaterialSwap = info => {
                    // Call existing callback first (e.g., SSS preset re-apply)
                    if (existingCallback) {
                        existingCallback(info);
                    }
                    // Then call user-provided callback
                    options.onMaterialSwap(info);
                    // Restore original callback (one-time use)
                    this.core3D.onMaterialSwap = existingCallback;
                };
            }

            const duration = options.duration || 800;
            this.core3D.morphToShape(shapeName, duration);
        }
        this.eventManager.emit('shape:morph', { shape: shapeName });
        return this;
    }

    /**
     * Trigger reassembly of frozen shards (for shatterFreeze gesture)
     * Call this after using the 'shatterFreeze' gesture to reassemble the shards.
     * Only works when shatter is in FROZEN state (shards are frozen mid-air).
     *
     * @param {number} [duration=1500] - Animation duration in ms
     * @returns {boolean} True if reassembly started
     *
     * @example
     * mascot.express('shatterFreeze');  // Shatter and freeze
     * // ... later, when ready to reassemble
     * mascot.triggerReassembly(2000);   // Reassemble over 2 seconds
     */
    triggerReassembly(duration = 1500) {
        if (this.core3D) {
            return this.core3D.triggerReassembly(duration);
        }
        return false;
    }

    /**
     * Check if shatter is currently in frozen state (awaiting manual reassembly)
     * Use this to know when triggerReassembly() can be called.
     *
     * @returns {boolean} True if shards are frozen and awaiting reassembly
     *
     * @example
     * mascot.express('shatterFreeze');
     * // Poll until frozen
     * const checkFrozen = setInterval(() => {
     *     if (mascot.isShatterFrozen()) {
     *         clearInterval(checkFrozen);
     *         // Now safe to trigger reassembly
     *         setTimeout(() => mascot.triggerReassembly(), 3000);
     *     }
     * }, 100);
     */
    isShatterFrozen() {
        return this.core3D?.isShatterFrozen() || false;
    }

    /**
     * Express emotions, gestures, and shapes using natural language
     *
     * This is the primary API for LLM integration. Instead of calling
     * setEmotion(), express(), and morphTo() separately, you can describe
     * what you want in plain text.
     *
     * @param {string} intent - Natural language description of desired state
     * @returns {Object} Result with success status, any errors, and parsed intent
     *
     * @example
     * mascot.feel('happy, bouncing')
     * mascot.feel('curious, leaning in')
     * mascot.feel('calm crystal breathing')
     * mascot.feel('yes')  // nods
     * mascot.feel('no')   // shakes head
     */
    feel(intent) {
        // Guard against calls after destroy
        if (this._isDestroyed()) {
            return { success: false, error: 'Engine destroyed', parsed: null };
        }

        // Rate limiting (circular buffer — no array allocation per call)
        const now = Date.now();
        const limiter = this._feelRateLimiter;

        // Count calls within the window
        let callsInWindow = 0;
        for (let i = 0; i < limiter.maxCallsPerSecond; i++) {
            if (now - limiter.calls[i] < limiter.windowMs) callsInWindow++;
        }

        // Check rate limit
        if (callsInWindow >= limiter.maxCallsPerSecond) {
            console.warn(`[EmotiveMascot3D] feel: Rate limit exceeded. Max ${limiter.maxCallsPerSecond} calls per second.`);
            return {
                success: false,
                error: 'Rate limit exceeded',
                parsed: null
            };
        }

        // Record this call in circular buffer
        limiter.calls[limiter.index] = now;
        limiter.index = (limiter.index + 1) % limiter.maxCallsPerSecond;

        // Parse the intent
        const parsed = this._intentParser.parse(intent);

        // Validate
        const validation = this._intentParser.validate(parsed);
        if (!validation.valid) {
            console.warn('[feel] Invalid intent:', validation.errors);
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
                this.setEmotion(parsed.emotion, emotionOptions);
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
            console.error('[feel] Execution error:', error);
            return {
                success: false,
                error: error.message,
                parsed
            };
        }
    }

    /**
     * Check if a geometry morph is currently in progress
     * Useful for UI feedback or preventing certain actions during transitions
     * @returns {boolean} True if morphing
     */
    isMorphing() {
        return this.core3D ? this.core3D.isMorphing() : false;
    }

    /**
     * Get current morph state for debugging or UI display
     * @returns {Object} Morph state including progress, current/target geometry, etc.
     */
    getMorphState() {
        return this.core3D ? this.core3D.getMorphState() : null;
    }

    /**
     * Grow in from scale 0 (pop-in animation)
     * Used for initial appearance of mascots
     * @param {number} duration - Duration in milliseconds (default: 500ms)
     */
    growIn(duration = 500) {
        if (this.core3D) {
            this.core3D.growIn(duration);
        }
        this.eventManager.emit('animation:growIn', { duration });
    }

    /**
     * Enable or disable the inner soul/core glow
     * When disabled, the crystal appears as an empty shell without the glowing core
     * @param {boolean} enabled - True to show soul, false to hide
     */
    setCoreGlowEnabled(enabled) {
        if (this.core3D) {
            this.core3D.setCoreGlowEnabled(enabled);
        }
        this.eventManager.emit('coreGlow:toggle', { enabled });
    }

    /**
     * Check if core glow is currently enabled
     * @returns {boolean} True if core glow is enabled
     */
    isCoreGlowEnabled() {
        return this.core3D ? this.core3D.coreGlowEnabled : true;
    }

    /**
     * Enable auto-rotation
     */
    enableAutoRotate() {
        if (this.core3D) {
            // Don't enable rotation for geometries with special rotation rules (moon is tidally locked)
            if (this.core3D.geometryType !== 'moon') {
                // Enable OrbitControls camera rotation
                if (this.core3D.renderer?.controls) {
                    this.core3D.renderer.controls.autoRotate = true;
                    this.core3D.renderer.controls.autoRotateSpeed = this.core3D.options?.autoRotateSpeed ?? 0.5;
                }

                // Enable geometry's internal rotation behavior
                this.core3D.rotationDisabled = false;
                // Re-trigger emotion to restore rotation behavior
                this.setEmotion(this.core3D.emotion, this.undertone);
            }
        }
    }

    /**
     * Disable auto-rotation (stops both camera and emotion-based rotation)
     */
    disableAutoRotate() {
        if (this.core3D?.renderer?.controls) {
            this.core3D.renderer.controls.autoRotate = false;
            this.core3D.renderer.controls.autoRotateSpeed = 0;
        }
        if (this.core3D) {
            this.core3D.rotationDisabled = true;
            this.core3D.rotationBehavior = null;
            // Zero out any accumulated rotation velocity
            if (this.core3D.baseEuler) {
                // Keep current position but stop future rotation
                this.core3D.baseEuler[0] = 0;
                this.core3D.baseEuler[1] = 0;
                this.core3D.baseEuler[2] = 0;
            }
        }
    }

    /**
     * Set camera to a preset position
     * @param {string} preset - Camera preset: 'front', 'side', 'top', 'bottom', 'angle', 'back'
     * @param {number} duration - Animation duration in ms (0 for instant)
     */
    setCameraPreset(preset, duration = 1000) {
        if (this.core3D?.renderer?.setCameraPreset) {
            this.core3D.renderer.setCameraPreset(preset, duration);
        }
    }

    /**
     * Check if auto-rotate is enabled
     * @type {boolean}
     * @readonly
     */
    get autoRotateEnabled() {
        // Check rotationDisabled flag (inverse logic) for accurate state
        // rotationDisabled is the source of truth set by enable/disableAutoRotate
        return this.core3D?.rotationDisabled === false;
    }

    /**
     * Enable particles
     */
    enableParticles() {
        // Enable 3D WebGL particle system rendering
        if (this.core3D?.particleOrchestrator?.renderer) {
            // Enable visibility and force emotion recalculation to spawn particles immediately
            this.core3D.particleVisibility = true;
            this.core3D.particleOrchestrator.renderer.setVisible(true);
            this.core3D.particleOrchestrator.setEmotion(this.core3D.emotion, this.core3D.undertone);

        }

        // Only enable 2D canvas particle system if we don't have 3D particles
        // (3D mode uses WebGL particles, not 2D canvas particles)
        if (!this.core3D?.particleOrchestrator) {
            // Enable 2D canvas particle system (if needed)
            if (!this.particleSystem && this.canvas2D) {
                const maxParticles = this.config.maxParticles || 300;
                this.particleSystem = new ParticleSystem(maxParticles, this.errorBoundary);
                this.particleSystem.canvasWidth = this.canvas2D.width;
                this.particleSystem.canvasHeight = this.canvas2D.height;
            }
            // else: particleSystem already exists, no action needed
        }
    }

    /**
     * Disable particles
     */
    disableParticles() {
        // Disable 3D WebGL particle system rendering
        if (this.core3D?.particleOrchestrator?.renderer) {
            this.core3D.particleVisibility = false;
            this.core3D.particleOrchestrator.renderer.setVisible(false);
            // Clear particles immediately and let update loop handle draw range naturally
            this.core3D.particleOrchestrator.clear();
        }

        // Only disable 2D canvas particle system if we don't have 3D particles
        // (3D mode uses WebGL particles, not 2D canvas particles)
        if (!this.core3D?.particleOrchestrator) {
            // Disable 2D canvas particle system
            if (this.particleSystem) {
                this.particleSystem.destroy();
                this.particleSystem = null;
                // Canvas will be automatically cleared on next animation frame
            }
            // else: no 2D particle system to disable
        }
    }

    /**
     * Check if particles are enabled
     * @type {boolean}
     * @readonly
     */
    get particlesEnabled() {
        // Check 3D particle visibility first (3D mode uses particleOrchestrator)
        if (this.core3D?.particleOrchestrator) {
            return this.core3D.particleVisibility === true;
        }
        // Fall back to 2D particle system check
        return this.particleSystem !== null;
    }

    /**
     * Enable blinking
     */
    enableBlinking() {
        if (this.core3D) {
            this.core3D.blinkingManuallyDisabled = false;
            if (this.core3D.blinkAnimator) {
                this.core3D.blinkAnimator.resume();
            }
        }
    }

    /**
     * Disable blinking
     */
    disableBlinking() {
        if (this.core3D) {
            this.core3D.blinkingManuallyDisabled = true;
            if (this.core3D.blinkAnimator) {
                this.core3D.blinkAnimator.pause();
            }
        }
    }

    /**
     * Check if blinking is enabled
     * @type {boolean}
     * @readonly
     */
    get blinkingEnabled() {
        return this.core3D && this.core3D.blinkAnimator ? this.core3D.blinkAnimator.enabled : false;
    }

    /**
     * Enable breathing
     */
    enableBreathing() {
        if (this.core3D) {
            this.core3D.breathingEnabled = true;
        }
    }

    /**
     * Disable breathing
     */
    disableBreathing() {
        if (this.core3D) {
            this.core3D.breathingEnabled = false;
        }
    }

    /**
     * Check if breathing is enabled
     * @type {boolean}
     * @readonly
     */
    get breathingEnabled() {
        return this.core3D ? this.core3D.breathingEnabled !== false : true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IMPERATIVE BREATHING PHASE API (for meditation)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Animate mascot scale for a breathing phase over a specified duration.
     * Used by meditation controller for precise breathing exercise timing.
     *
     * Scale targets:
     * - 'inhale': grows to 1.3x normal size
     * - 'exhale': shrinks to 0.85x normal size
     * - 'hold': maintains current scale
     *
     * @param {string} phase - 'inhale' | 'exhale' | 'hold'
     * @param {number} durationSec - Duration in seconds for the animation
     *
     * @example
     * // 4-7-8 breathing pattern
     * mascot.breathePhase('inhale', 4);  // Grow over 4 seconds
     * // ... after 4 seconds
     * mascot.breathePhase('hold', 7);    // Hold for 7 seconds
     * // ... after 7 seconds
     * mascot.breathePhase('exhale', 8);  // Shrink over 8 seconds
     */
    breathePhase(phase, durationSec) {
        if (this.core3D) {
            this.core3D.breathePhase(phase, durationSec);
        }
    }

    /**
     * Stop any active breathing phase animation and reset to neutral scale
     */
    stopBreathingPhase() {
        if (this.core3D) {
            this.core3D.stopBreathingPhase();
        }
    }

    /**
     * Enable wobble/shake effects
     */
    enableWobble() {
        if (this.core3D) {
            this.core3D.setWobbleEnabled(true);
        }
    }

    /**
     * Disable wobble/shake effects
     */
    disableWobble() {
        if (this.core3D) {
            this.core3D.setWobbleEnabled(false);
        }
    }

    /**
     * Check if wobble is enabled
     * @type {boolean}
     * @readonly
     */
    get wobbleEnabled() {
        return this.core3D ? this.core3D.wobbleEnabled !== false : true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RHYTHM SYNC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Enable rhythm sync for 3D animations
     * When enabled, gestures and idle animations will sync to the beat
     */
    enableRhythmSync() {
        if (this.core3D) {
            this.core3D.setRhythmEnabled(true);
        }
    }

    /**
     * Disable rhythm sync for 3D animations
     */
    disableRhythmSync() {
        if (this.core3D) {
            this.core3D.setRhythmEnabled(false);
        }
    }

    /**
     * Check if rhythm sync is enabled
     * @type {boolean}
     * @readonly
     */
    get rhythmSyncEnabled() {
        return this.core3D ? this.core3D.rhythmEnabled : false;
    }

    /**
     * Enable ambient groove (subtle idle animation synced to beat)
     */
    enableGroove() {
        if (this.core3D) {
            this.core3D.setGrooveEnabled(true);
        }
    }

    /**
     * Disable ambient groove
     */
    disableGroove() {
        if (this.core3D) {
            this.core3D.setGrooveEnabled(false);
        }
    }

    /**
     * Set beat sync strength for gesture animations
     * @param {number} strength - Sync strength (0-1), higher = more pronounced beat sync
     */
    setBeatSyncStrength(strength) {
        if (this.core3D) {
            this.core3D.setBeatSyncStrength(strength);
        }
    }

    /**
     * Set groove confidence (animation intensity scalar)
     *
     * This controls how pronounced the groove animations are:
     * - 0.15 = Very subtle, tentative feel (like searching for the beat)
     * - 0.5 = Moderate groove
     * - 1.0 = Full groove intensity
     *
     * When BPM detection is active, this is set automatically based on lock stage.
     * Use this method to manually control groove intensity when not using BPM detection,
     * or to override the automatic behavior.
     *
     * @example
     * // Start with tentative groove, then ramp up
     * mascot.setGrooveConfidence(0.2);
     * setTimeout(() => mascot.setGrooveConfidence(1.0), 3000);
     *
     * @param {number} confidence - Groove confidence (0-1, typically 0.15-1.0)
     */
    setGrooveConfidence(confidence) {
        if (this.core3D?.rhythm3DAdapter) {
            this.core3D.rhythm3DAdapter.setGrooveConfidence(confidence);
        }
    }

    /**
     * Get current groove confidence
     * @returns {number} Current groove confidence (0-1)
     */
    getGrooveConfidence() {
        return this.core3D?.rhythm3DAdapter?.grooveConfidence ?? 1.0;
    }

    /**
     * Set BPM multiplier for groove animation speed control
     *
     * This scales the effective BPM used for groove animations without affecting
     * the actual BPM detection or rhythm engine. Useful for controlling how fast
     * the mascot dances regardless of the detected song tempo.
     *
     * Common use cases:
     * - Set to 0.5 to halve animation speed for high BPM songs (>90 BPM)
     * - Set to 2.0 to double animation speed for very slow songs
     * - Set to 1.0 (default) to use detected BPM as-is
     *
     * @example
     * // Halve animation speed for fast songs
     * const status = mascot.getBPMStatus();
     * if (status.bpm > 90) {
     *     mascot.setBPMMultiplier(0.5);
     * } else {
     *     mascot.setBPMMultiplier(1.0);
     * }
     *
     * @param {number} multiplier - BPM multiplier (0.25 to 4.0, default 1.0)
     */
    setBPMMultiplier(multiplier) {
        if (this.core3D?.rhythm3DAdapter) {
            this.core3D.rhythm3DAdapter.setBPMMultiplier(multiplier);
        }
    }

    /**
     * Get current BPM multiplier
     * @returns {number} Current BPM multiplier (default 1.0)
     */
    getBPMMultiplier() {
        return this.core3D?.rhythm3DAdapter?.getBPMMultiplier() ?? 1.0;
    }

    /**
     * Set groove configuration for idle animations (advanced tuning)
     * @param {Object} config - Groove settings
     * @param {number} config.grooveBounceAmount - Vertical bounce amplitude (default: 0.02)
     * @param {number} config.grooveSwayAmount - Horizontal sway amplitude (default: 0.015)
     * @param {number} config.groovePulseAmount - Scale pulse amplitude (default: 0.03)
     * @param {number} config.grooveRotationAmount - Rotation sway amplitude (default: 0.02)
     */
    setGrooveConfig(config) {
        if (this.core3D) {
            this.core3D.setGrooveConfig(config);
        }
    }

    /**
     * Set the active groove preset for ambient animation
     *
     * Groove presets define the character of the ambient groove:
     * - 'groove1': Subtle, elegant - gentle bounce and sway (default)
     * - 'groove2': Energetic, bouncy - pronounced vertical motion, playful
     * - 'groove3': Smooth, flowing - emphasis on rotation and sway, languid
     *
     * @example
     * // Immediate switch to energetic groove
     * mascot.setGroove('groove2');
     *
     * // Morph to flowing groove over 2 bars
     * mascot.setGroove('groove3', { bars: 2 });
     *
     * // Transition over specific duration
     * mascot.setGroove('groove1', { duration: 3 }); // 3 seconds
     *
     * @param {string} grooveName - Groove preset name ('groove1', 'groove2', 'groove3')
     * @param {Object} [options] - Transition options
     * @param {number} [options.bars] - Transition duration in bars (e.g., 2 = morph over 2 bars)
     * @param {number} [options.duration] - Transition duration in seconds (alternative to bars)
     */
    setGroove(grooveName, options = {}) {
        if (this.core3D) {
            this.core3D.setGroove(grooveName, options);
        }
    }

    /**
     * Get available groove preset names
     * @returns {string[]} Array of groove preset names
     */
    getGroovePresets() {
        if (this.core3D) {
            return this.core3D.getGroovePresets();
        }
        return ['groove1', 'groove2', 'groove3'];
    }

    /**
     * Get current groove preset name
     * @returns {string} Current groove preset name
     */
    getCurrentGroove() {
        if (this.core3D) {
            return this.core3D.getCurrentGroove();
        }
        return 'groove1';
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // DANCE CHOREOGRAPHER API
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Enable automatic dance choreography
     * When enabled, the mascot will automatically trigger gestures based on
     * audio signals once BPM is locked.
     */
    enableDance() {
        if (this.danceChoreographer) {
            this.danceChoreographer.enable();
        }
    }

    /**
     * Disable automatic dance choreography
     */
    disableDance() {
        if (this.danceChoreographer) {
            this.danceChoreographer.disable();
        }
    }

    /**
     * Check if dance choreography is enabled
     * @returns {boolean} True if dance is enabled
     */
    isDanceEnabled() {
        return this.danceChoreographer?.enabled ?? false;
    }

    /**
     * Set dance intensity (affects gesture frequency and amplitude)
     *
     * @example
     * mascot.setDanceIntensity(0.2);  // Subtle, occasional gestures
     * mascot.setDanceIntensity(0.8);  // Energetic, frequent gestures
     *
     * @param {number} intensity - Intensity value 0-1
     */
    setDanceIntensity(intensity) {
        if (this.danceChoreographer) {
            this.danceChoreographer.setIntensity(intensity);
        }
    }

    /**
     * Get current dance intensity
     * @returns {number} Current intensity 0-1
     */
    getDanceIntensity() {
        return this.danceChoreographer?.getIntensity() ?? 0.5;
    }

    /**
     * Get dance choreographer status for debugging
     * @returns {Object} Status object with enabled, intensity, currentGroove, etc.
     */
    getDanceStatus() {
        return this.danceChoreographer?.getStatus() ?? { enabled: false };
    }

    /**
     * Check if rhythm is currently playing
     * @returns {boolean}
     */
    isRhythmPlaying() {
        return this.core3D?.isRhythmPlaying() || false;
    }

    /**
     * Get current BPM from rhythm system
     * @returns {number}
     */
    getRhythmBPM() {
        return this.core3D?.getRhythmBPM() || 120;
    }

    /**
     * Start rhythm playback for 3D animations
     * This MUST be called for rhythm sync to work - it starts the internal rhythm clock.
     * @param {number} bpm - Beats per minute (default: 120)
     * @param {string} pattern - Rhythm pattern: 'straight', 'swing', 'waltz', 'dubstep', etc. (default: 'straight')
     */
    startRhythm(bpm = 120, pattern = 'straight') {
        if (this.core3D) {
            this.core3D.startRhythm(bpm, pattern);
        }
    }

    /**
     * Stop rhythm playback
     */
    stopRhythm() {
        if (this.core3D) {
            this.core3D.stopRhythm();
        }
    }

    /**
     * Set rhythm BPM
     * @param {number} bpm - Beats per minute (20-360)
     */
    setRhythmBPM(bpm) {
        if (this.core3D) {
            this.core3D.setRhythmBPM(bpm);
        }
    }

    /**
     * Set rhythm pattern
     * @param {string} pattern - Pattern name: 'straight', 'swing', 'waltz', 'dubstep', 'breakbeat', etc.
     */
    setRhythmPattern(pattern) {
        if (this.core3D) {
            this.core3D.setRhythmPattern(pattern);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIO CONNECTION API (delegated to AudioBridge)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Connect an audio element for audio-reactive animations
     * This starts rhythm sync automatically when audio plays
     * @param {HTMLAudioElement} audioElement - Audio element to connect
     * @returns {Promise<void>}
     */
    connectAudio(audioElement) {
        return this._getAudioBridge().connectAudio(audioElement);
    }

    /**
     * Disconnect audio and stop audio-reactive animations
     */
    disconnectAudio() {
        if (this._audioBridge) {
            this._audioBridge.disconnectAudio();
        }
    }

    /**
     * Get BPM detection status
     * @returns {Object} Detection status object
     * @returns {number} returns.bpm - Current detected BPM (60-180)
     * @returns {number} returns.confidence - Detection confidence (0-1)
     * @returns {boolean} returns.locked - Whether BPM is locked (Stage 1+)
     * @returns {number} returns.lockStage - Lock stage (0=detecting, 1=initial, 2=refining, 3=final)
     * @returns {string} returns.correctionType - 'none', 'halved', or 'doubled'
     * @returns {boolean} returns.finalized - True when fully locked and memory cleaned
     * @returns {number} returns.grooveConfidence - Animation intensity scalar (0.15-1.0)
     * @returns {number} returns.agentCount - Number of BPM candidates in histogram
     * @returns {number} returns.peakCount - Total peaks detected
     * @returns {Array} returns.topAgents - Top 5 BPM candidates with scores
     * @returns {number} returns.intervalCount - Number of intervals in buffer
     */
    getBPMStatus() {
        if (this._audioBridge) {
            return this._audioBridge.getBPMStatus();
        }
        return {
            bpm: 120,
            subdivision: 1,
            confidence: 0,
            locked: false,
            lockStage: 0,
            correctionType: 'none',
            finalized: false,
            grooveConfidence: 1.0,
            agentCount: 0,
            peakCount: 0,
            histogramSize: 0,
            topAgents: [],
            intervalCount: 0
        };
    }

    /**
     * Get BPM debug log for clipboard copy
     * @returns {string} Formatted debug log
     */
    getBPMDebugLog() {
        if (this._audioBridge) {
            return this._audioBridge.getBPMDebugLog();
        }
        return 'No audio bridge active.';
    }

    /**
     * Reset BPM detection to start fresh
     * @param {number} [seedBPM] - Optional initial BPM guess
     */
    resetBPMDetection(seedBPM = null) {
        if (this._audioBridge) {
            this._audioBridge.resetBPMDetection(seedBPM);
        }
    }

    /**
     * Helper: Convert RGB array to hex color
     */
    rgbToHex(rgb) {
        const r = Math.round(rgb[0] * 255);
        const g = Math.round(rgb[1] * 255);
        const b = Math.round(rgb[2] * 255);
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        }).join('')}`;
    }

    /**
     * Set position offset of the mascot (moves the container)
     * Compatible with 2D mascot's positioning API for scroll-based movement
     * @param {number} x - X offset from base position (pixels)
     * @param {number} y - Y offset from base position (pixels)
     * @param {number} z - Z offset (unused for container positioning)
     * @returns {EmotiveMascot3D} this instance for chaining
     * @fires position:change
     */
    setPosition(x, y, z = 0) {
        if (!this.container) return this;

        // Store previous position for event
        const previous = this.position || { x: 0, y: 0, z: 0 };

        // Store new position
        this.position = { x, y, z };

        // Use transform only to avoid conflicting with CSS position properties
        // The container is positioned with CSS (top: 50%, left: X%, transform: translateY(-50%))
        // We combine the base centering transform with our offset
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile: container is centered (top: 50%, left: 50%, transform: translate(-50%, -50%))
            // Apply offset from center using transform only
            this.container.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        } else {
            // Desktop: container is at left: 12%, top: 50%, transform: translateY(-50%)
            // Use translate for both x and y offset to keep base position intact
            this.container.style.transform = `translate(${x}px, calc(-50% + ${y}px))`;
        }

        // Emit position change event
        if (this.eventManager) {
            this.eventManager.emit('position:change', { x, y, z, previous });
        }

        return this;
    }

    /**
     * Get current position
     * @returns {{x: number, y: number, z: number}}
     */
    getPosition() {
        return this.position || { x: 0, y: 0, z: 0 };
    }

    /**
     * Get list of available emotions
     * @returns {string[]} Array of emotion names
     */
    getAvailableEmotions() {
        return listEmotions();
    }

    /**
     * Get list of available gestures
     * @returns {Array<{name: string, emoji: string, type: string, category: string, description: string}>} Array of gesture info objects
     */
    getAvailableGestures() {
        return listGestures();
    }

    /**
     * Populate gesture names instantly, then pre-warm factories in the background.
     *
     * Phase 1 (instant): onBatch/onComplete fire synchronously with gesture names.
     * Phase 2 (background): Lazy factory getters resolve one-per-frame via the
     * FrameBudgetScheduler, only when the render frame had budget to spare.
     * Phase 3 (background): Element model GLBs preload serially through the scheduler.
     * Each preload is async (fetch off-thread), but the scheduler waits for each
     * to complete (including sync parse/compile) before starting the next.
     *
     * @param {Object} options
     * @param {Function} [options.onBatch] - Called with gesture name/category objects
     * @param {Function} [options.onComplete] - Called when all names are yielded (DOM ready)
     * @param {Function} [options.onFactoriesReady] - Called when all lazy factories are pre-warmed
     * @param {boolean} [options.prewarmFactories=true] - Whether to pre-warm factories in background
     * @param {boolean} [options.prewarmModels=false] - Whether to pre-warm element model GLBs.
     *   Disabled by default — each type's GLB parse + shader compile is 50-200ms of
     *   synchronous work that can't be broken into frame-budget-safe chunks.
     * @param {Function} [options.onModelsReady] - Called when all element models are pre-loaded
     */
    warmUpGestures({ onBatch, onComplete, onFactoriesReady, prewarmFactories = true, prewarmModels = false, onModelsReady } = {}) {
        // Phase 1: Yield names instantly
        const factoryWork = _warmUpGestures({ onBatch, onComplete });

        // Phase 2: Queue factory pre-warming into frame-budget scheduler
        if (prewarmFactories && factoryWork && factoryWork.length > 0) {
            if (!this._frameBudgetScheduler) {
                this._frameBudgetScheduler = new FrameBudgetScheduler();
            }
            this._frameBudgetScheduler.enqueueAll(factoryWork);
            if (onFactoriesReady && !prewarmModels) {
                this._frameBudgetScheduler.onDrain = onFactoriesReady;
            }
        }

        // Phase 3: Queue element model preloading (async work items)
        // Each preload fetches GLBs, merges geometry, compiles shaders.
        // The scheduler serializes them so synchronous post-fetch work doesn't overlap.
        // NOTE: Each type's post-fetch sync work (50-200ms) exceeds frame budget.
        // The scheduler prevents CONCURRENT loads but can't prevent per-type drops.
        if (prewarmModels && this.core3D?.elementSpawner) {
            if (!this._frameBudgetScheduler) {
                this._frameBudgetScheduler = new FrameBudgetScheduler();
            }
            const elementTypes = ElementTypeRegistry.types();
            const modelWork = elementTypes.map(type =>
                () => this.core3D.elementSpawner.preloadModels(type)
            );
            this._frameBudgetScheduler.enqueueAll(modelWork);
            const finalCallback = onModelsReady || onFactoriesReady;
            if (finalCallback) {
                this._frameBudgetScheduler.onDrain = finalCallback;
            }
        }
    }

    /**
     * Get gesture categories mapping (for UI generation)
     * Returns semantic categories: idle, dance, actions, reactions, destruction, atmosphere
     * @returns {Object<string, string[]>} Category name to array of gesture names
     */
    getGestureCategories() {
        return GESTURE_CATEGORIES;
    }

    /**
     * Get list of available geometries for morphTo()
     * @returns {string[]} Array of geometry names
     */
    getAvailableGeometries() {
        return [...VALID_GEOMETRIES];
    }

    /**
     * Animate to a target position smoothly
     * @param {number} x - Target X offset
     * @param {number} y - Target Y offset
     * @param {number} z - Target Z offset (unused for container positioning)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name (currently only 'easeOutCubic' supported)
     */
    animateToPosition(x, y, z = 0, duration = 1000, _easing = 'easeOutCubic') {
        if (!this.container) return;

        const startPos = this.getPosition();
        const startTime = performance.now();

        // Easing function
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            const currentX = startPos.x + (x - startPos.x) * easedProgress;
            const currentY = startPos.y + (y - startPos.y) * easedProgress;
            const currentZ = startPos.z + (z - startPos.z) * easedProgress;

            this.setPosition(currentX, currentY, currentZ);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Set particle containment bounds and scale
     * For 3D, this primarily affects the particle system containment
     * @param {Object|null} bounds - Bounds object {width, height} in pixels, null to disable
     * @param {number} scale - Scale factor for mascot (affects particle spawn radius)
     * @returns {EmotiveMascot3D} This instance for chaining
     * @fires scale:change
     */
    setContainment(bounds, scale = 1) {
        // Store previous scale for event
        const previousScale = this._containmentScale || 1;

        // Store containment settings
        this._containmentBounds = bounds;
        this._containmentScale = scale;

        // Apply scale to particle system spawn radius
        if (this.particleSystem && scale !== 1) {
            // The particle system uses spawnRadius for particle positioning
            // Adjust based on scale factor
            const baseRadius = this.config.particleSpawnRadius || 150;
            this.particleSystem.setSpawnRadius(baseRadius * scale);
        }

        // Emit scale change event if scale changed
        if (this.eventManager && scale !== previousScale) {
            this.eventManager.emit('scale:change', { scale, previous: previousScale });
        }

        return this;
    }

    /**
     * Attach mascot to a DOM element with automatic position tracking
     * @param {HTMLElement|string} elementOrSelector - Element or CSS selector
     * @param {Object} options - Attachment options
     * @param {number} options.offsetX - X offset from element center (default: 0)
     * @param {number} options.offsetY - Y offset from element center (default: 0)
     * @param {boolean} options.animate - Animate to position (default: true)
     * @param {number} options.duration - Animation duration in ms (default: 1000)
     * @param {number} options.scale - Scale factor for mascot (default: 1)
     * @param {boolean} options.containParticles - Whether to contain particles within element bounds (default: true)
     * @returns {EmotiveMascot3D} This instance for chaining
     */
    attachToElement(elementOrSelector, options = {}) {
        // Get the target element
        const element = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;

        if (!element) {
            console.error(`[EmotiveMascot3D] Element not found: ${elementOrSelector}`);
            return this;
        }

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
        this._hasAttachedBefore = this._hasAttachedBefore || false;

        // Set containment bounds and scale if requested
        const rect = element.getBoundingClientRect();
        if (this._attachOptions.containParticles) {
            this.setContainment({ width: rect.width, height: rect.height }, this._attachOptions.scale);
        } else if (this._attachOptions.scale !== 1) {
            this.setContainment(null, this._attachOptions.scale);
        }

        // Position mascot at element
        this._updateAttachedPosition();

        // Set up automatic tracking on scroll and resize
        this._setupElementTracking();

        return this;
    }

    /**
     * Update mascot position to match attached element
     * @private
     */
    _updateAttachedPosition() {
        if (!this._attachedElement || !this.container) return;

        const targetRect = this._attachedElement.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Get element center in viewport coordinates
        const elementCenterX = targetRect.left + targetRect.width / 2;
        const elementCenterY = targetRect.top + targetRect.height / 2;

        // Get container center from actual DOM position (works with any CSS layout)
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;

        // Calculate offset needed to move from container's position to element center
        const offsetX = elementCenterX - containerCenterX + this._attachOptions.offsetX;
        const offsetY = elementCenterY - containerCenterY + this._attachOptions.offsetY;

        // Use animation on first attach, instant updates on scroll/resize
        const isFirstAttach = !this._hasAttachedBefore;
        this._hasAttachedBefore = true;

        if (isFirstAttach && this._attachOptions.animate) {
            this.animateToPosition(offsetX, offsetY, 0, this._attachOptions.duration);
        } else {
            this.setPosition(offsetX, offsetY, 0);
        }
    }

    /**
     * Set up scroll and resize event listeners for element tracking
     * @private
     */
    _setupElementTracking() {
        if (this._elementTrackingHandlers) return; // Already set up

        this._elementTrackingHandlers = {
            scroll: () => this._updateAttachedPosition(),
            resize: () => this._updateAttachedPosition()
        };

        window.addEventListener('scroll', this._elementTrackingHandlers.scroll, { passive: true });
        window.addEventListener('resize', this._elementTrackingHandlers.resize);
    }

    /**
     * Check if mascot is attached to an element
     * @returns {boolean} True if attached to an element
     */
    isAttachedToElement() {
        return !!this._attachedElement;
    }

    /**
     * Detach mascot from tracked element and cleanup
     * @returns {EmotiveMascot3D} This instance for chaining
     */
    detachFromElement() {
        this._attachedElement = null;
        this._hasAttachedBefore = false;

        // Remove event listeners
        if (this._elementTrackingHandlers) {
            window.removeEventListener('scroll', this._elementTrackingHandlers.scroll);
            window.removeEventListener('resize', this._elementTrackingHandlers.resize);
            this._elementTrackingHandlers = null;
        }

        // Clear containment and reset scale
        this.setContainment(null, 1);

        // Reset to neutral state (but do NOT change geometry - let caller decide)
        this.setEmotion('neutral');

        return this;
    }

    /**
     * Apply an SSS (Subsurface Scattering) preset to the crystal material
     * Available presets: quartz, emerald, ruby, sapphire, amethyst, topaz, citrine, diamond
     * @param {string} presetName - Name of the SSS preset to apply
     * @param {Object} [options] - Optional configuration
     * @param {boolean} [options.immediate=false] - Skip smooth transition, apply immediately
     * @returns {boolean} True if preset was applied successfully
     */
    setSSSPreset(presetName, options = {}) {
        // Store preset name so it can be re-applied after geometry morph (material swap)
        this._currentSSSPreset = presetName;

        // Set up material swap callback if not already done
        if (this.core3D && !this._materialSwapCallbackSet) {
            this._materialSwapCallbackSet = true;
            this.core3D.onMaterialSwap = () => {
                // Re-apply SSS preset after material is swapped during morph
                if (this._currentSSSPreset) {
                    // Small delay to ensure material uniforms are fully initialized
                    // Apply immediately after morph (no transition needed)
                    setTimeout(() => {
                        applySSS(this, this._currentSSSPreset);
                    }, 50);
                }
            };
        }

        // Get preset values
        const preset = SSSPresets[presetName];
        if (!preset || !this.core3D?.customMaterial?.uniforms) {
            return false;
        }

        const u = this.core3D.customMaterial.uniforms;

        // For immediate application or first-time setup, skip transition
        if (options.immediate || !this.core3D._targetSSSValues) {
            const success = applySSS(this, presetName);
            if (success) {
                // Initialize current values for future transitions
                this.core3D._targetSSSValues = { ...preset };
                this.core3D._sssTransitionProgress = 1; // Mark as complete
                this.eventManager.emit('sss:presetChanged', { preset: presetName });
            }
            return success;
        }

        // Capture current values as transition start
        this.core3D._sssTransitionStart = {
            sssStrength: u.sssStrength?.value ?? preset.sssStrength,
            sssAbsorption: u.sssAbsorption?.value ? [u.sssAbsorption.value.x, u.sssAbsorption.value.y, u.sssAbsorption.value.z] : [...preset.sssAbsorption],
            sssScatterDistance: u.sssScatterDistance?.value ? [u.sssScatterDistance.value.x, u.sssScatterDistance.value.y, u.sssScatterDistance.value.z] : [...preset.sssScatterDistance],
            sssThicknessBias: u.sssThicknessBias?.value ?? preset.sssThicknessBias,
            sssThicknessScale: u.sssThicknessScale?.value ?? preset.sssThicknessScale,
            sssCurvatureScale: u.sssCurvatureScale?.value ?? preset.sssCurvatureScale,
            sssAmbient: u.sssAmbient?.value ?? preset.sssAmbient,
            frostiness: u.frostiness?.value ?? preset.frostiness,
            innerGlowStrength: u.innerGlowStrength?.value ?? preset.innerGlowStrength,
            fresnelIntensity: u.fresnelIntensity?.value ?? preset.fresnelIntensity,
            causticIntensity: u.causticIntensity?.value ?? preset.causticIntensity,
            emotionColorBleed: u.emotionColorBleed?.value ?? preset.emotionColorBleed
        };

        // Set target values (the preset we're transitioning to)
        this.core3D._targetSSSValues = {
            sssStrength: preset.sssStrength,
            sssAbsorption: [...preset.sssAbsorption],
            sssScatterDistance: [...preset.sssScatterDistance],
            sssThicknessBias: preset.sssThicknessBias,
            sssThicknessScale: preset.sssThicknessScale,
            sssCurvatureScale: preset.sssCurvatureScale,
            sssAmbient: preset.sssAmbient,
            frostiness: preset.frostiness,
            innerGlowStrength: preset.innerGlowStrength,
            fresnelIntensity: preset.fresnelIntensity,
            causticIntensity: preset.causticIntensity,
            emotionColorBleed: preset.emotionColorBleed
        };

        // Start transition
        this.core3D._sssTransitionProgress = 0;

        this.eventManager.emit('sss:presetChanged', { preset: presetName, transitioning: true });
        return true;
    }

    /**
     * Change the geometry type (alias for morphTo)
     * @deprecated Use morphTo() instead. This method will be removed in v4.0.
     * @param {string} geometryName - Name of geometry: crystal, moon, sun, heart, rough, sphere, star
     * @param {Object} options - Optional configuration
     * @param {number} options.duration - Transition duration in ms (default: 800ms)
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    setGeometry(geometryName, options = {}) {
        console.warn('[EmotiveMascot3D] setGeometry() is deprecated. Use morphTo() instead.');
        return this.morphTo(geometryName, options);
    }

    /**
     * Start a solar eclipse animation
     * @param {Object} options - Eclipse options
     * @param {string} options.type - Eclipse type: 'annular' or 'total' (default: 'total')
     * @param {number} options.duration - Duration in ms (default: 10000)
     */
    startSolarEclipse(options = {}) {
        if (this.core3D && typeof this.core3D.startSolarEclipse === 'function') {
            this.core3D.startSolarEclipse(options);
        } else {
            // Fallback: morph to sun and emit event
            this.morphTo('sun');
            this.eventManager.emit('eclipse:solar:start', { type: options.type || 'total' });
        }
    }

    /**
     * Start a lunar eclipse animation (blood moon)
     * @param {Object} options - Eclipse options
     * @param {string} options.type - Eclipse type: 'total' (blood moon), 'partial', 'penumbral'
     * @param {number} options.duration - Duration in ms (default: 10000)
     */
    startLunarEclipse(options = {}) {
        if (this.core3D && typeof this.core3D.startLunarEclipse === 'function') {
            this.core3D.startLunarEclipse(options);
        } else {
            // Fallback: morph to moon and emit event
            this.morphTo('moon');
            this.eventManager.emit('eclipse:lunar:start', { type: options.type || 'total' });
        }
    }

    /**
     * Set the duration for smooth emotion color transitions
     * @param {number} durationMs - Transition duration in milliseconds (default: 500)
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    setColorTransitionDuration(durationMs) {
        if (this.core3D) {
            this.core3D.colorTransitionDuration = durationMs;
        }
        return this;
    }

    /**
     * Set the duration for smooth SSS preset transitions
     * @param {number} durationMs - Transition duration in milliseconds (default: 500)
     * @returns {EmotiveMascot3D} this instance for chaining
     */
    setSSSTransitionDuration(durationMs) {
        if (this.core3D) {
            this.core3D.sssTransitionDuration = durationMs;
        }
        return this;
    }

    /**
     * Stop any active eclipse animation
     */
    stopEclipse() {
        if (this.core3D && typeof this.core3D.stopEclipse === 'function') {
            this.core3D.stopEclipse();
        }
        if (this.eventManager) {
            this.eventManager.emit('eclipse:stop');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Set destroyed flag first to stop any pending animation frames
        this._destroyed = true;
        this.stop();

        // Clean up frame budget scheduler
        if (this._frameBudgetScheduler) {
            this._frameBudgetScheduler.destroy();
            this._frameBudgetScheduler = null;
        }

        // Clean up audio bridge
        if (this._audioBridge) {
            this._audioBridge.destroy();
            this._audioBridge = null;
        }

        // Clean up element attachment tracking
        if (this._elementTrackingHandlers) {
            window.removeEventListener('scroll', this._elementTrackingHandlers.scroll);
            window.removeEventListener('resize', this._elementTrackingHandlers.resize);
            this._elementTrackingHandlers = null;
        }
        this._attachedElement = null;

        // Clean up reduced motion listener
        if (this._reducedMotionMediaQuery && this._reducedMotionHandler) {
            if (this._reducedMotionMediaQuery.removeEventListener) {
                this._reducedMotionMediaQuery.removeEventListener('change', this._reducedMotionHandler);
            } else if (this._reducedMotionMediaQuery.removeListener) {
                this._reducedMotionMediaQuery.removeListener(this._reducedMotionHandler);
            }
            this._reducedMotionMediaQuery = null;
            this._reducedMotionHandler = null;
        }

        // Clear all pending gesture timeouts
        this.gestureTimeouts.forEach(id => clearTimeout(id));
        this.gestureTimeouts = [];

        // Clear all event listeners to prevent memory leaks
        if (this.eventManager && this.eventManager._listeners) {
            Object.keys(this.eventManager._listeners).forEach(key => {
                this.eventManager._listeners[key] = [];
            });
            this.eventManager._listeners = null;
        }

        if (this.core3D) {
            this.core3D.destroy();
        }
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
        if (this.danceChoreographer) {
            this.danceChoreographer.destroy();
            this.danceChoreographer = null;
        }

        // Clean up resize observer
        if (this._resizeObserver) {
            this._resizeObserver.destroy();
            this._resizeObserver = null;
        }

        // Clean up canvas layers
        if (this._canvasLayerManager) {
            this._canvasLayerManager.destroy();
            this._canvasLayerManager = null;
        }

        // Null out DOM element references to prevent memory leaks
        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;
        this.ctx2D = null;

        // Null out config object
        this.config = null;

        // Null out ErrorBoundary
        this.errorBoundary = null;

        // Null out current gesture reference
        this.currentGesture = null;
    }
}

// Default export
export default EmotiveMascot3D;

// Named exports for tree-shaking
export { Core3DManager } from './Core3DManager.js';
export { createSphere } from './geometries/Sphere.js';
export { createCrystal } from './geometries/Crystal.js';
export { createDiamond } from './geometries/Diamond.js';
export { createSunGeometry, createSunMaterial, updateSunMaterial, disposeSun } from './geometries/Sun.js';
export { createMoon, createMoonMaterial, createMoonCrescentMaterial, createMoonFallbackMaterial, updateMoonGlow, updateCrescentShadow, disposeMoon } from './geometries/Moon.js';

// Export moon phase utilities
export {
    MOON_PHASES,
    getMoonPhaseNames,
    getPhaseFromProgress,
    setMoonPhase,
    animateMoonPhase
} from './geometries/Moon.js';

// Export blend mode utilities
export {
    blendModeNames,
    getBlendModeName,
    getBlendModeIndex
} from './shaders/utils/blendModes.js';

// Export geometry cache for preloading
export { default as GeometryCache } from './utils/GeometryCache.js';

// Export SSS material presets
export {
    SSSPresets,
    applySSSPreset,
    getPresetNames as getSSSPresetNames,
    getPreset as getSSSPreset
} from './presets/SSSPresets.js';

// Export rhythm 3D adapter for advanced rhythm sync customization
export { rhythm3DAdapter, Rhythm3DAdapter, GROOVE_PRESETS } from './animation/Rhythm3DAdapter.js';

// Export CrystalSoul for geometry preloading
export { CrystalSoul } from './effects/CrystalSoul.js';

// Export AudioInterpreter for LLM-based audio semantic interpretation
export { AudioInterpreter, audioInterpreter, ENGINE_VOCABULARY, LLM_ENDPOINTS } from '../core/audio/AudioInterpreter.js';

// Export performance profiler for debugging
export { profiler, PerformanceProfiler } from './debug/PerformanceProfiler.js';

// SSR detection helper for framework integration
export const isSSR = () => typeof window === 'undefined';
