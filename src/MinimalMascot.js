/**
 * MinimalMascot — Ultra-light 2D mascot for loading screens
 *
 * Standalone class that directly wires up only the essential subsystems,
 * bypassing InitializationManager and ModularHandlersInitializer entirely.
 * No audio, plugins, performance monitoring, accessibility, or debug systems.
 *
 * @module MinimalMascot
 */

// Core subsystems
import ErrorBoundary from './core/events/ErrorBoundary.js';
import { EventManager } from './core/events/EventManager.js';
import CanvasManager from './core/canvas/CanvasManager.js';
import EmotiveStateMachine from './core/state/EmotiveStateMachine.js';
import ParticleSystem from './core/ParticleSystem.js';
import EmotiveRenderer from './core/EmotiveRenderer.js';
import ShapeMorpher from './core/ShapeMorpher.js';
import AnimationController from './core/AnimationController.js';
import GazeTracker from './core/behavior/GazeTracker.js';
import IdleBehavior from './core/behavior/IdleBehavior.js';
import PositionController from './utils/PositionController.js';
import { browserCompatibility, CanvasContextRecovery } from './utils/browserCompatibility.js';
import { getEmotionVisualParams } from './core/emotions/index.js';
import gestureCompatibility from './core/GestureCompatibility.js';
import { MascotStateManager } from './mascot/state/MascotStateManager.js';
import { GestureController } from './mascot/control/GestureController.js';

// Lightweight rendering helpers (zero/minimal imports)
import { RenderStateBuilder } from './mascot/rendering/RenderStateBuilder.js';
import { ParticleConfigCalculator } from './mascot/rendering/ParticleConfigCalculator.js';
import { GestureMotionProvider } from './mascot/rendering/GestureMotionProvider.js';
import { RenderLayerOrchestrator } from './mascot/rendering/RenderLayerOrchestrator.js';

/**
 * Minimal mascot class for lightweight 2D rendering.
 * Supports emotions, 2D gestures, shape morphing, and particles.
 * Designed as a loading screen that hands off to the full 3D mascot.
 *
 * @example
 * const mascot = new MinimalMascot({ defaultEmotion: 'joy' });
 * await mascot.init('mascot-canvas');
 * mascot.start();
 * mascot.setEmotion('surprise');
 * mascot.express('bounce');
 */
export class MinimalMascot {
    constructor(config = {}) {
        this._config = config;
        this._initialized = false;
    }

    /**
     * Initialize the mascot on a canvas element.
     * @param {string|HTMLCanvasElement} canvasOrId - Canvas element or its ID
     * @returns {Promise<MinimalMascot>} This instance for chaining
     */
    init(canvasOrId) {
        if (this._initialized) return this;

        // Error boundary
        this.errorBoundary = new ErrorBoundary();

        // Event manager with simple emitter
        this.eventManager = new EventManager({
            maxListeners: 100,
            enableMonitoring: false,
        });
        this._ensureEmitter();

        // Configuration with defaults
        const browserOpts = browserCompatibility.browserOptimizations.getOptimizations();
        this.config = {
            canvasId: canvasOrId,
            targetFPS: 60,
            maxParticles: browserOpts.particleLimit,
            defaultEmotion: 'neutral',
            renderingStyle: 'classic',
            enableGazeTracking: true,
            enableIdleBehaviors: true,
            topOffset: 0,
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            classicConfig: {
                coreColor: '#FFFFFF',
                coreSizeDivisor: 12,
                glowMultiplier: 2.5,
                defaultGlowColor: '#14B8A6',
            },
            ...this._config,
        };

        // State manager
        this.stateManager = new MascotStateManager({
            initialState: { debugMode: false },
            emit: (event, data) => this.emit(event, data),
        });
        this._createStateAliases();

        // Canvas
        this.canvas =
            typeof canvasOrId === 'string'
                ? document.getElementById(canvasOrId)
                : canvasOrId;
        if (!this.canvas) {
            throw new Error(`Canvas '${canvasOrId}' not found`);
        }
        this.canvasManager = new CanvasManager(this.canvas);

        // Position controller
        this.positionController = new PositionController({
            offsetX: this.config.offsetX,
            offsetY: this.config.offsetY,
            offsetZ: this.config.offsetZ,
            onUpdate: effectiveCenter => {
                if (this.renderer) {
                    this.renderer.updateEffectiveCenter(effectiveCenter);
                }
            },
        });

        // Render size
        if (this.config.renderSize?.width && this.config.renderSize?.height) {
            this.canvasManager.setRenderSize(
                this.config.renderSize.width,
                this.config.renderSize.height
            );
        }

        // Canvas context recovery
        this.contextRecovery = new CanvasContextRecovery(this.canvas);
        this.contextRecovery.onRecovery(context => {
            if (this.renderer) {
                this.renderer.handleContextRecovery(context);
            }
        });
        browserCompatibility.browserOptimizations.applyCanvasOptimizations(
            this.canvas,
            this.canvasManager.getContext()
        );

        // State machine
        this.stateMachine = new EmotiveStateMachine(this.errorBoundary);

        // Particle system
        this.particleSystem = new ParticleSystem(
            this.config.maxParticles,
            this.errorBoundary
        );
        this.particleSystem.canvasWidth = this.canvasManager.width;
        this.particleSystem.canvasHeight = this.canvasManager.height;

        // Renderer
        this.renderer = new EmotiveRenderer(this.canvasManager, {
            ...this.config.classicConfig,
            topOffset: this.config.topOffset || 0,
            positionController: this.positionController,
        });
        this.renderer.stateMachine = this.stateMachine;
        this.stateMachine.renderer = this.renderer;

        // Shape morpher (brings rhythm.js — lightweight timing singleton)
        this.shapeMorpher = new ShapeMorpher();
        this.renderer.shapeMorpher = this.shapeMorpher;

        // Gesture controller (soundSystem: null is handled gracefully)
        this.gestureController = new GestureController({
            errorBoundary: this.errorBoundary,
            renderer: this.renderer,
            soundSystem: null,
            config: this.config,
            state: {
                get currentModularGesture() { return self.currentModularGesture; },
                set currentModularGesture(v) { self.currentModularGesture = v; },
            },
            throttledWarn: this._throttledWarn.bind(this),
            chainTarget: this,
        });
        const self = this;
        this.gestureController.gestureCompatibility = gestureCompatibility;
        this.gestureController.init();

        // Gaze tracking
        if (this.config.enableGazeTracking) {
            this.gazeTracker = new GazeTracker(this.canvas, {
                smoothing: 0.1,
                maxOffset: 0.15,
                enabled: true,
            });
            this.gazeTracker.setInteractionCallback(() => {
                if (this.sleeping) {
                    // No sleep/wake in minimal — just reset idle
                } else if (this.idleBehavior) {
                    this.idleBehavior.resetIdleTimer();
                }
            });
        }

        // Idle behaviors
        if (this.config.enableIdleBehaviors) {
            this.idleBehavior = new IdleBehavior({
                enabled: true,
                sleepTimeout: Infinity,
            });
            this.idleBehavior.setCallback('onBlink', data => {
                if (this.renderer?.state) {
                    this.renderer.state.blinking = data.phase === 'start';
                }
            });
        }

        // Animation controller
        try {
            this.animationController = new AnimationController(this.errorBoundary, {
                targetFPS: this.config.targetFPS,
            });
        } catch (_err) {
            this.animationController = this._createFallbackAnimController();
        }
        this.animationController.setSubsystems({
            stateMachine: this.stateMachine,
            particleSystem: this.particleSystem,
            renderer: this.renderer,
            soundSystem: null,
            canvasManager: this.canvasManager,
        });
        this.animationController.setEventCallback((event, data) => {
            this.emit(event, data);
        });
        this.animationController.setParentMascot(this);

        // Rendering helpers (zero-dependency)
        this.renderStateBuilder = new RenderStateBuilder({
            animationController: this.animationController,
            gazeTracker: this.gazeTracker || null,
            particleSystem: this.particleSystem,
            stateMachine: this.stateMachine,
            state: { debugMode: false, speaking: false },
        });
        this.particleConfigCalculator = new ParticleConfigCalculator({
            renderer: this.renderer,
            stateMachine: this.stateMachine,
            canvasManager: this.canvasManager,
            config: this.config,
        });
        this.gestureMotionProvider = new GestureMotionProvider({
            renderer: this.renderer,
            state: {
                get currentModularGesture() { return self.currentModularGesture; },
                set currentModularGesture(v) { self.currentModularGesture = v; },
            },
        });
        this.renderLayerOrchestrator = new RenderLayerOrchestrator({
            canvasManager: this.canvasManager,
            config: this.config,
            particleSystem: this.particleSystem,
            renderer: this.renderer,
            stateMachine: this.stateMachine,
            state: { debugMode: false },
        });

        // Set initial emotion
        this.stateMachine.setEmotion(this.config.defaultEmotion);

        // Resize handler
        this.canvasManager.onResize((width, height, dpr) => {
            this.particleSystem.canvasWidth = width;
            this.particleSystem.canvasHeight = height;
            if (this.renderer?.handleResize) {
                this.renderer.handleResize(width, height, dpr);
            }
        });

        this._initialized = true;
        return this;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Start the animation loop.
     * @returns {MinimalMascot} This instance for chaining
     */
    start() {
        if (!this._initialized || this.animationController.isAnimating()) return this;

        const success = this.animationController.start();
        if (success) {
            this.isRunning = true;

            // Spawn initial particles
            if (this.config.renderingStyle === 'classic') {
                const { emotion } = this.stateMachine.getCurrentState();
                const emotionParams = getEmotionVisualParams(emotion);
                const center = this.renderer.getEffectiveCenter?.()
                    || this.canvasManager.getCenter();

                this.particleSystem.clear();
                if (emotionParams.particleRate > 0) {
                    const count = Math.min(3, Math.floor(emotionParams.particleRate / 4));
                    if (count > 0) {
                        this.particleSystem.burst(
                            count,
                            emotionParams.particleBehavior,
                            center.x,
                            center.y
                        );
                    }
                }
            }

            this.emit('started');
        }
        return this;
    }

    /**
     * Stop the animation loop.
     * @returns {MinimalMascot} This instance for chaining
     */
    stop() {
        if (!this._initialized || !this.animationController.isAnimating()) return this;

        const success = this.animationController.stop();
        if (success) {
            this.isRunning = false;
            this.emit('stopped');
        }
        return this;
    }

    /**
     * Set the emotional state.
     * @param {string} emotion - Emotion name (joy, sadness, anger, surprise, etc.)
     * @param {Object|string|null} [options] - Options or undertone string
     * @returns {MinimalMascot} This instance for chaining
     */
    setEmotion(emotion, options = null) {
        if (!this._initialized) return this;

        const emotionMapping = { happy: 'joy', curious: 'surprise', frustrated: 'anger', sad: 'sadness' };
        const mapped = emotionMapping[emotion] || emotion;

        let undertone = null;
        let duration = 500;
        let intensity = 1.0;
        if (typeof options === 'string') {
            undertone = options;
        } else if (options && typeof options === 'object') {
            undertone = options.undertone || null;
            duration = options.duration || 500;
            intensity = options.intensity ?? 1.0;
        }

        const success = this.stateMachine.setEmotion(mapped, { undertone, duration, intensity });

        if (success && this.particleSystem) {
            this.particleSystem.clear();
            const props = this.stateMachine.getCurrentEmotionalProperties();
            let count;
            if (mapped === 'neutral') {
                count = 1;
            } else if (mapped === 'resting') {
                count = 4;
            } else {
                count = Math.min(3, Math.floor(props.particleRate / 4));
            }
            if (count > 0) {
                const center = this.renderer.getEffectiveCenter?.()
                    || { x: this.canvasManager.width / 2, y: this.canvasManager.height / 2 };
                this.particleSystem.burst(count, props.particleBehavior, center.x, center.y);
            }
            this.emit('emotionChanged', { emotion: mapped, undertone, intensity });
        }

        return this;
    }

    /**
     * Trigger a 2D gesture animation.
     * @param {string} gesture - Gesture name
     * @param {Object} [options] - Gesture options
     * @returns {MinimalMascot} This instance for chaining
     */
    express(gesture, options = {}) {
        if (!this._initialized || !this.gestureController) return this;
        return this.gestureController.express(gesture, options);
    }

    /**
     * Morph to a different shape.
     * @param {string} shape - Target shape name
     * @returns {MinimalMascot} This instance for chaining
     */
    setShape(shape) {
        if (!this._initialized || !this.shapeMorpher) return this;
        this.shapeMorpher.morphTo(shape);
        return this;
    }

    /**
     * Set position offset for the mascot.
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} [z=0] - Z offset
     * @returns {MinimalMascot} This instance for chaining
     */
    setPosition(x, y, z = 0) {
        if (this.positionController) {
            this.positionController.setOffset(x, y, z);
        }
        return this;
    }

    /**
     * Manually resize the mascot canvas.
     * @param {number} width - New width
     * @param {number} height - New height
     * @returns {MinimalMascot} This instance for chaining
     */
    resize(width, height) {
        if (this.canvasManager) {
            this.canvasManager.setRenderSize(width, height);
        }
        return this;
    }

    /**
     * Get current state for handing off to the full/3D mascot.
     * @returns {Object} State snapshot
     */
    getState() {
        if (!this._initialized) return { emotion: 'neutral', shape: 'circle', isRunning: false };

        const { emotion, undertone } = this.stateMachine.getCurrentState();
        return {
            emotion,
            undertone,
            shape: this.shapeMorpher?.currentShape || 'circle',
            isRunning: this.stateManager?.isRunning ?? false,
        };
    }

    /**
     * Register an event listener.
     * @param {string} event - Event name
     * @param {Function} callback - Listener callback
     * @returns {MinimalMascot} This instance for chaining
     */
    on(event, callback) {
        if (this.eventManager) {
            this.eventManager.on(event, callback);
        }
        return this;
    }

    /**
     * Remove an event listener.
     * @param {string} event - Event name
     * @param {Function} callback - Listener callback
     * @returns {MinimalMascot} This instance for chaining
     */
    off(event, callback) {
        if (this.eventManager) {
            this.eventManager.off(event, callback);
        }
        return this;
    }

    /**
     * Clean up all resources.
     */
    destroy() {
        if (!this._initialized) return;

        this.stop();

        if (this.animationController?.destroy) this.animationController.destroy();
        if (this.particleSystem?.destroy) this.particleSystem.destroy();
        if (this.renderer?.destroy) this.renderer.destroy();
        if (this.canvasManager?.destroy) this.canvasManager.destroy();
        if (this.shapeMorpher?.destroy) this.shapeMorpher.destroy();
        if (this.positionController?.destroy) this.positionController.destroy();
        if (this.gazeTracker?.destroy) this.gazeTracker.destroy();
        if (this.contextRecovery?.destroy) this.contextRecovery.destroy();

        this._initialized = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATION LOOP CALLBACKS (called by AnimationController)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Per-frame update called by AnimationController.
     * @param {number} _deltaTime - Time since last frame
     */
    update(_deltaTime) {
        // Minimal update — gaze and idle are handled in render()
    }

    /**
     * Render the current frame. Called by AnimationController.
     */
    render() {
        try {
            const { deltaTime, renderState } = this.renderStateBuilder.buildRenderState();

            this.canvasManager.clear();

            // Update gaze
            if (this.gazeTracker) {
                this.gazeTracker.update(deltaTime);
            }

            // Emotion visual params
            const emotionParams = getEmotionVisualParams(renderState.emotion);
            this.renderer.setEmotionalState(renderState.emotion, emotionParams, renderState.undertone);

            // Particles
            const particleConfig = this.particleConfigCalculator.calculateParticleConfig(
                renderState,
                emotionParams
            );
            const { orbX, orbY, particleBehavior, particleRate, minParticles, maxParticles } = particleConfig;
            this.particleSystem.spawn(
                particleBehavior,
                renderState.emotion,
                particleRate,
                orbX,
                orbY,
                deltaTime,
                null,
                minParticles,
                maxParticles,
                this.renderer.particleScaleFactor || this.renderer.scaleFactor || 1,
                this.config.classicConfig?.particleSizeMultiplier || 1,
                emotionParams.particleColors || null,
                renderState.undertone
            );

            const particleModifier = this.particleConfigCalculator.getParticleModifier(renderState);
            const { gestureMotion, gestureProgress } = this.gestureMotionProvider.getGestureMotion();
            this.particleSystem.update(deltaTime, orbX, orbY, gestureMotion, gestureProgress, particleModifier);

            // Render layers
            const gestureTransform = this.gestureMotionProvider.getGestureTransform();
            this.renderLayerOrchestrator.renderAllLayers({
                renderState,
                deltaTime,
                emotionParams,
                gestureTransform,
                renderStart: 0,
            });
        } catch (error) {
            this.errorBoundary.logError(error, 'minimal-render');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTERNAL
    // ═══════════════════════════════════════════════════════════════════════════

    /** Emit an event through the event manager. */
    emit(event, data = null) {
        if (this.eventManager?.emit) {
            this.eventManager.emit(event, data);
        }
    }

    /** Ensure the event manager has a working emitter. */
    _ensureEmitter() {
        if (!this.eventManager.emit) {
            this.eventManager._listeners = {};
            this.eventManager.emit = (event, data) => {
                const listeners = this.eventManager._listeners[event];
                if (listeners) listeners.forEach(l => l(data));
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
                    const i = listeners.indexOf(listener);
                    if (i > -1) listeners.splice(i, 1);
                }
            };
        }
    }

    /** Simple throttled warning. */
    _throttledWarn(key, message) {
        const now = Date.now();
        if (!this._warnTimestamps) this._warnTimestamps = {};
        if (!this._warnTimestamps[key] || now - this._warnTimestamps[key] > 5000) {
            this._warnTimestamps[key] = now;
            console.warn(`[MinimalMascot] ${message}`);
        }
    }

    /** Create state property aliases on this instance. */
    _createStateAliases() {
        const sm = this.stateManager;
        const aliases = [
            'speaking', 'recording', 'sleeping', 'isRunning', 'debugMode',
            'audioLevel', 'rhythmEnabled', 'currentModularGesture',
            'breathePhase', 'breatheStartTime', 'orbScale',
            'warningTimestamps', 'warningThrottle',
        ];
        const props = {};
        for (const key of aliases) {
            props[key] = {
                get() { return sm[key]; },
                set(v) { sm[key] = v; },
                enumerable: true,
                configurable: true,
            };
        }
        Object.defineProperties(this, props);
    }

    /** Fallback animation controller if real one fails. */
    _createFallbackAnimController() {
        const mascot = this;
        return {
            isAnimating: () => mascot.isRunning,
            start: () => { mascot.isRunning = true; return true; },
            stop: () => { mascot.isRunning = false; return true; },
            setTargetFPS: () => {},
            getPerformanceMetrics: () => ({ fps: 0, isRunning: mascot.isRunning }),
            setSubsystems: () => {},
            setEventCallback: () => {},
            setParentMascot: () => {},
            destroy: () => {},
            deltaTime: 16,
        };
    }
}

export default MinimalMascot;
