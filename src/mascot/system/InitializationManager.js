/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                 ◐ ◑ ◒ ◓  INITIALIZATION MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview InitializationManager - Handles EmotiveMascot initialization
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module InitializationManager
 * @complexity ⭐⭐⭐ Moderate-High (Orchestrates complex initialization sequence)
 * @audience Modify when changing initialization flow or adding new subsystems
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages the initialization sequence of EmotiveMascot by coordinating all
 * ║ subsystems in the correct order. Breaks down the monolithic initialize()
 * ║ method into logical, testable phases.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🚀 INITIALIZATION PHASES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ 1. Configuration setup and browser compatibility
 * │ 2. Canvas and rendering system initialization
 * │ 3. State machine and particle system setup
 * │ 4. Audio and interaction systems
 * │ 5. Accessibility and mobile optimization
 * │ 6. Plugin and performance systems
 * │ 7. Modular handlers initialization
 * │ 8. Finalization and event setup
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import CanvasManager from '../../core/canvas/CanvasManager.js';
import EmotiveStateMachine from '../../core/state/EmotiveStateMachine.js';
import ParticleSystem from '../../core/ParticleSystem.js';
import EmotiveRenderer from '../../core/EmotiveRenderer.js';
import GazeTracker from '../../core/behavior/GazeTracker.js';
import IdleBehavior from '../../core/behavior/IdleBehavior.js';
import PositionController from '../../utils/PositionController.js';
import { initSentry, addBreadcrumb } from '../../utils/sentry.js';
import { SoundSystem } from '../../core/audio/SoundSystem.js';
import AnimationController from '../../core/AnimationController.js';
import AudioLevelProcessor from '../../core/audio/AudioLevelProcessor.js';
import AccessibilityManager from '../../core/optimization/AccessibilityManager.js';
import MobileOptimization from '../../core/optimization/MobileOptimization.js';
import PluginSystem from '../../core/plugins/PluginSystem.js';
import { browserCompatibility, CanvasContextRecovery } from '../../utils/browserCompatibility.js';
import { emotiveDebugger, runtimeCapabilities } from '../../utils/debugger.js';
import rhythmIntegration from '../../core/audio/rhythmIntegration.js';
import ShapeMorpher from '../../core/ShapeMorpher.js';
import { AudioAnalyzer } from '../../core/audio/AudioAnalyzer.js';
import gestureCompatibility from '../../core/GestureCompatibility.js';
import GrooveTemplates from '../../core/audio/GrooveTemplates.js';
import { PerformanceSystem } from '../../core/plugins/PerformanceSystem.js';
import { ContextManager } from '../../core/state/ContextManager.js';
import { SequenceExecutor } from '../../core/plugins/SequenceExecutor.js';

// Import modular handlers
import { AudioHandler } from '../audio/AudioHandler.js';
import { GestureController } from '../control/GestureController.js';
import { StateCoordinator } from '../state/StateCoordinator.js';
import { VisualizationRunner } from '../control/VisualizationRunner.js';
import { ExecutionLifecycleManager } from '../control/ExecutionLifecycleManager.js';
import { AnimationFrameController } from '../control/AnimationFrameController.js';
import { ConfigurationManager } from './ConfigurationManager.js';
import { DiagnosticsManager } from './DiagnosticsManager.js';
import { ShapeTransformManager } from '../rendering/ShapeTransformManager.js';
import { LLMIntegrationBridge } from '../integration/LLMIntegrationBridge.js';
import { EventListenerManager } from '../events/EventListenerManager.js';
import { EmotionalStateQueryManager } from '../state/EmotionalStateQueryManager.js';
import { TTSManager } from '../audio/TTSManager.js';
import { SpeechReactivityManager } from '../audio/SpeechReactivityManager.js';
import { CanvasResizeManager } from '../rendering/CanvasResizeManager.js';
import { OffsetPositionManager } from '../rendering/OffsetPositionManager.js';
import { RotationController } from '../rendering/RotationController.js';
import { FrustrationContextManager } from '../state/FrustrationContextManager.js';
import { PerformanceBehaviorManager } from '../performance/PerformanceBehaviorManager.js';
import { PerformanceMonitoringManager } from '../performance/PerformanceMonitoringManager.js';
import { DebugProfilingManager } from '../debug/DebugProfilingManager.js';
import { HealthCheckManager } from './HealthCheckManager.js';

/**
 * InitializationManager - Orchestrates EmotiveMascot initialization
 */
export class InitializationManager {
    /**
     * @param {Object} mascot - Reference to parent EmotiveMascot instance
     * @param {Object} config - User configuration
     */
    constructor(mascot, config = {}) {
        this.mascot = mascot;
        this.userConfig = config;
    }

    /**
     * Main initialization method - orchestrates all phases
     * @returns {Object} Initialized configuration
     */
    initialize() {
        // Phase 1: Configuration and browser compatibility
        const config = this.initializeConfiguration();

        // Phase 2: Canvas and rendering
        this.initializeCanvas(config);

        // Phase 3: Core systems (state machine, particles, renderer)
        this.initializeCoreSystems(config);

        // Phase 4: Audio and shape morphing
        this.initializeAudioSystems(config);

        // Phase 5: Interaction systems (gaze, idle behaviors)
        this.initializeInteractionSystems(config);

        // Phase 6: Accessibility, mobile, plugins
        this.initializeOptimizationSystems(config);

        // Phase 7: Animation controller
        this.initializeAnimationController(config);

        // Phase 8: Performance and semantic systems
        this.initializePerformanceSystems(config);

        // Phase 9: Modular handlers
        this.initializeModularHandlers(config);

        // Phase 10: Finalization
        this.finalizeInitialization(config);

        return config;
    }

    /**
     * Phase 1: Initialize configuration with defaults and browser compatibility
     * @returns {Object} Merged configuration
     */
    initializeConfiguration() {
        // Get browser-specific optimizations
        const browserOpts = browserCompatibility.browserOptimizations.getOptimizations();

        // Default configuration with browser-specific optimizations
        const defaults = {
            canvasId: 'emotive-mascot',
            targetFPS: 60,
            enableAudio: browserCompatibility.featureDetection.features.webAudio,
            soundEnabled: false,
            masterVolume: 0.5,
            maxParticles: browserOpts.particleLimit,
            defaultEmotion: 'neutral',
            enableAutoOptimization: true,
            enableGracefulDegradation: true,
            renderingStyle: 'classic',
            enableGazeTracking: true,
            enableIdleBehaviors: true,
            renderSize: null,
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            classicConfig: {
                coreColor: '#FFFFFF',
                coreSizeDivisor: 12,
                glowMultiplier: 2.5,
                defaultGlowColor: '#14B8A6'
            },
            topOffset: 0,
            sentry: {
                enabled: false,
                dsn: null,
                environment: 'production',
                tracesSampleRate: 0.1
            }
        };

        const config = { ...defaults, ...this.userConfig };

        // Initialize Sentry if configured
        if (config.sentry && config.sentry.enabled) {
            initSentry(config.sentry);
            addBreadcrumb('EmotiveMascot initialized', 'lifecycle', {
                emotion: config.defaultEmotion,
                renderingStyle: config.renderingStyle
            });
        }

        this.mascot.config = config;
        return config;
    }

    /**
     * Phase 2: Initialize canvas and position controller
     * @param {Object} config - Configuration object
     */
    initializeCanvas(config) {
        // Get canvas element
        this.mascot.canvas = typeof config.canvasId === 'string'
            ? document.getElementById(config.canvasId)
            : config.canvasId;

        if (!this.mascot.canvas) {
            throw new Error(`Canvas with ID '${config.canvasId}' not found`);
        }

        // Initialize canvas manager
        this.mascot.canvasManager = new CanvasManager(this.mascot.canvas);

        // Initialize position controller for eccentric positioning
        this.mascot.positionController = new PositionController({
            offsetX: config.offsetX,
            offsetY: config.offsetY,
            offsetZ: config.offsetZ,
            onUpdate: effectiveCenter => {
                if (this.mascot.renderer) {
                    this.mascot.renderer.updateEffectiveCenter(effectiveCenter);
                }
            }
        });

        // Set render size if specified
        if (config.renderSize && config.renderSize.width && config.renderSize.height) {
            this.mascot.canvasManager.setRenderSize(config.renderSize.width, config.renderSize.height);
        }

        // Set up canvas context recovery
        this.mascot.contextRecovery = new CanvasContextRecovery(this.mascot.canvas);
        this.mascot.contextRecovery.onRecovery(context => {
            if (this.mascot.renderer) {
                this.mascot.renderer.handleContextRecovery(context);
            }
        });

        // Apply browser-specific canvas optimizations
        browserCompatibility.browserOptimizations.applyCanvasOptimizations(
            this.mascot.canvas,
            this.mascot.canvasManager.getContext()
        );
    }

    /**
     * Phase 3: Initialize core systems (state machine, particles, renderer)
     * @param {Object} config - Configuration object
     */
    initializeCoreSystems(config) {
        // State machine and error boundary
        this.mascot.stateMachine = new EmotiveStateMachine(this.mascot.errorBoundary);

        // Particle system
        this.mascot.particleSystem = new ParticleSystem(config.maxParticles, this.mascot.errorBoundary);
        this.mascot.particleSystem.canvasWidth = this.mascot.canvasManager.width;
        this.mascot.particleSystem.canvasHeight = this.mascot.canvasManager.height;

        // Renderer
        this.mascot.renderer = new EmotiveRenderer(this.mascot.canvasManager, {
            ...config.classicConfig,
            topOffset: config.topOffset || 0,
            positionController: this.mascot.positionController
        });

        // Connect renderer and state machine for undertone modifiers
        this.mascot.renderer.stateMachine = this.mascot.stateMachine;
        this.mascot.stateMachine.renderer = this.mascot.renderer;
    }

    /**
     * Phase 4: Initialize audio and shape morphing systems
     * @param {Object} config - Configuration object
     */
    initializeAudioSystems(config) {
        // Shape morphing and audio analysis
        this.mascot.shapeMorpher = new ShapeMorpher();
        this.mascot.audioAnalyzer = new AudioAnalyzer();

        // Groove templates for musical rhythm patterns
        this.mascot.grooveTemplates = new GrooveTemplates();

        // Connect audio analyzer to shape morpher
        this.mascot.shapeMorpher.audioAnalyzer = this.mascot.audioAnalyzer;

        // Pass to renderer
        this.mascot.renderer.shapeMorpher = this.mascot.shapeMorpher;
        this.mascot.renderer.audioAnalyzer = this.mascot.audioAnalyzer;

        // Initialize gesture controller early
        this.mascot.gestureController = new GestureController(this.mascot);
        this.mascot.gestureController.gestureCompatibility = gestureCompatibility;
        this.mascot.gestureController.init();

        // Sound system
        this.mascot.soundSystem = new SoundSystem();

        // Audio level processor for speech reactivity
        this.mascot.audioLevelProcessor = new AudioLevelProcessor({
            spikeThreshold: config.spikeThreshold || 1.5,
            minimumSpikeLevel: config.minimumSpikeLevel || 0.1,
            spikeMinInterval: config.spikeMinInterval || 1000
        });
    }

    /**
     * Phase 5: Initialize interaction systems (gaze tracking, idle behaviors)
     * @param {Object} config - Configuration object
     */
    initializeInteractionSystems(config) {
        // Gaze tracking
        if (config.enableGazeTracking) {
            this.mascot.gazeTracker = new GazeTracker(this.mascot.canvas, {
                smoothing: 0.1,
                maxOffset: 0.15,
                enabled: true
            });

            // Reset idle timer on interaction and wake if sleeping
            this.mascot.gazeTracker.setInteractionCallback(() => {
                if (this.mascot.sleeping) {
                    this.mascot.wake();
                } else if (this.mascot.idleBehavior) {
                    this.mascot.idleBehavior.resetIdleTimer();
                }
            });
        }

        // Idle behaviors
        if (config.enableIdleBehaviors) {
            this.mascot.idleBehavior = new IdleBehavior({
                enabled: true,
                sleepTimeout: Infinity  // Disable automatic sleep
            });

            // Connect idle behavior callbacks to renderer
            this.mascot.idleBehavior.setCallback('onBlink', data => {
                if (this.mascot.renderer && this.mascot.renderer.state) {
                    this.mascot.renderer.state.blinking = data.phase === 'start';
                }
            });

            this.mascot.idleBehavior.setCallback('onSleep', () => {
                if (this.mascot.renderer && this.mascot.renderer.enterSleepMode) {
                    this.mascot.renderer.enterSleepMode();
                }
            });

            this.mascot.idleBehavior.setCallback('onWake', () => {
                if (this.mascot.renderer && this.mascot.renderer.wakeUp) {
                    this.mascot.renderer.wakeUp();
                }
            });
        }
    }

    /**
     * Phase 6: Initialize accessibility, mobile optimization, and plugins
     * @param {Object} config - Configuration object
     */
    initializeOptimizationSystems(config) {
        // DegradationManager removed - no performance interference
        this.mascot.degradationManager = null;

        // Accessibility manager
        this.mascot.accessibilityManager = new AccessibilityManager({
            enableReducedMotion: config.enableReducedMotion !== false,
            enableHighContrast: config.enableHighContrast !== false,
            enableScreenReaderSupport: config.enableScreenReaderSupport !== false,
            enableKeyboardNavigation: config.enableKeyboardNavigation !== false,
            colorBlindMode: config.colorBlindMode || 'none'
        });

        // Mobile optimization
        this.mascot.mobileOptimization = new MobileOptimization({
            enableTouchOptimization: config.enableTouchOptimization !== false,
            enableViewportHandling: config.enableViewportHandling !== false,
            enableBatteryOptimization: config.enableBatteryOptimization !== false
        });
        this.mascot.mobileOptimization.setCanvas(this.mascot.canvas);

        // Plugin system
        this.mascot.pluginSystem = new PluginSystem({
            mascot: this.mascot,
            enablePlugins: config.enablePlugins !== false,
            validatePlugins: config.validatePlugins !== false,
            sandboxPlugins: config.sandboxPlugins !== false
        });
    }

    /**
     * Phase 7: Initialize animation controller
     * @param {Object} config - Configuration object
     */
    initializeAnimationController(config) {
        // Initialize animation controller with fallback
        try {
            this.mascot.animationController = new AnimationController(this.mascot.errorBoundary, {
                targetFPS: config.targetFPS
            });
        } catch (error) {
            console.error('AnimationController initialization failed:', error);
            // Fallback: create minimal animation controller interface
            this.mascot.animationController = this.createFallbackAnimationController(config.targetFPS);
        }

        // Configure animation controller with subsystems
        this.mascot.animationController.setSubsystems({
            stateMachine: this.mascot.stateMachine,
            particleSystem: this.mascot.particleSystem,
            renderer: this.mascot.renderer,
            soundSystem: this.mascot.soundSystem,
            canvasManager: this.mascot.canvasManager
        });

        // Set up event forwarding
        this.mascot.animationController.setEventCallback((event, data) => {
            this.mascot.emit(event, data);
        });

        // Set parent mascot reference
        this.mascot.animationController.setParentMascot(this.mascot);

        // Runtime state
        this.mascot.isRunning = false;
    }

    /**
     * Create fallback animation controller when initialization fails
     * @param {number} targetFPS - Target frames per second
     * @returns {Object} Minimal animation controller interface
     * @private
     */
    createFallbackAnimationController(targetFPS) {
        return {
            isAnimating: () => this.mascot.isRunning,
            start: () => { this.mascot.isRunning = true; return true; },
            stop: () => { this.mascot.isRunning = false; return true; },
            setTargetFPS: () => {},
            targetFPS,
            getPerformanceMetrics: () => ({
                fps: 0,
                isRunning: this.mascot.isRunning,
                performanceDegradation: false,
                deltaTime: 16,
                frameCount: 0,
                targetFPS
            }),
            setSubsystems: () => {},
            setEventCallback: () => {},
            setParentMascot: () => {},
            destroy: () => {},
            deltaTime: 16
        };
    }

    /**
     * Phase 8: Initialize semantic performance systems
     * @param {Object} config - Configuration object
     */
    initializePerformanceSystems(config) {
        // Context manager
        this.mascot.contextManager = new ContextManager({
            enableHistory: config.enablePerformanceHistory !== false,
            enableDecay: config.enableFrustrationDecay !== false,
            historyLimit: config.performanceHistoryLimit || 50,
            frustrationDecayRate: config.frustrationDecayRate || 5,
            decayInterval: config.frustrationDecayInterval || 10000
        });

        // Sequence executor
        this.mascot.sequenceExecutor = new SequenceExecutor({
            mascot: this.mascot,
            eventManager: this.mascot.eventManager,
            allowConcurrent: config.allowConcurrentPerformances !== false
        });

        // Performance system
        this.mascot.performanceSystem = new PerformanceSystem({
            mascot: this.mascot,
            contextManager: this.mascot.contextManager,
            sequenceExecutor: this.mascot.sequenceExecutor,
            eventManager: this.mascot.eventManager,
            enableAnalytics: config.enablePerformanceAnalytics !== false
        });
    }

    /**
     * Phase 9: Initialize modular handlers
     * @param {Object} config - Configuration object
     */
    initializeModularHandlers(config) {
        // Initialize handlers (gestureController already initialized earlier)
        this.mascot.audioHandler = new AudioHandler(this.mascot);
        this.mascot.stateCoordinator = new StateCoordinator(this.mascot);
        this.mascot.visualizationRunner = new VisualizationRunner(this.mascot);
        this.mascot.executionLifecycleManager = new ExecutionLifecycleManager(this.mascot);
        this.mascot.animationFrameController = new AnimationFrameController(this.mascot);
        this.mascot.diagnosticsManager = new DiagnosticsManager(this.mascot);
        this.mascot.shapeTransformManager = new ShapeTransformManager(this.mascot);
        this.mascot.llmIntegrationBridge = new LLMIntegrationBridge(this.mascot);
        this.mascot.eventListenerManager = new EventListenerManager(this.mascot);
        this.mascot.emotionalStateQueryManager = new EmotionalStateQueryManager(this.mascot);
        this.mascot.ttsManager = new TTSManager(this.mascot);
        this.mascot.speechReactivityManager = new SpeechReactivityManager(this.mascot);
        this.mascot.canvasResizeManager = new CanvasResizeManager(this.mascot);
        this.mascot.offsetPositionManager = new OffsetPositionManager(this.mascot);
        this.mascot.rotationController = new RotationController(this.mascot);
        this.mascot.frustrationContextManager = new FrustrationContextManager(this.mascot);
        this.mascot.performanceBehaviorManager = new PerformanceBehaviorManager(this.mascot);
        this.mascot.performanceMonitoringManager = new PerformanceMonitoringManager(this.mascot);
        this.mascot.debugProfilingManager = new DebugProfilingManager(this.mascot);
        this.mascot.healthCheckManager = new HealthCheckManager(this.mascot);
        this.mascot.configurationManager = new ConfigurationManager(this.mascot, config);

        // Initialize the handlers
        this.mascot.audioHandler.init();
        this.mascot.stateCoordinator.init();
        this.mascot.visualizationRunner.init();
    }

    /**
     * Phase 10: Finalize initialization with state setup and event handlers
     * @param {Object} config - Configuration object
     */
    finalizeInitialization(config) {
        // Initialize sound system if enabled
        if (config.enableAudio) {
            this.mascot.soundSystem.initialize().then(success => {
                if (success) {
                    this.mascot.soundSystem.setMasterVolume(config.masterVolume);
                }
            });
        }

        // Initialize state properties
        this.mascot.speaking = false;
        this.mascot.recording = false;
        this.mascot.sleeping = false;
        this.mascot.warningTimestamps = {};
        this.mascot.rhythmEnabled = false;
        this.mascot.warningThrottle = 5000;

        // Initialize rhythm integration
        rhythmIntegration.initialize();
        this.mascot.rhythmIntegration = rhythmIntegration;

        // Initialize TTS state
        this.mascot.tts = {
            available: typeof window !== 'undefined' && 'speechSynthesis' in window,
            speaking: false,
            currentUtterance: null
        };

        // Expose modules for plugin access (these should already be imported in EmotiveMascot.js)
        // The mascot will set these itself from its imports

        // Initialize debugging if enabled
        this.mascot.debugMode = config.enableDebug || false;
        if (this.mascot.debugMode) {
            emotiveDebugger.log('INFO', 'Debug mode enabled for EmotiveMascot', {
                config,
                runtimeCapabilities: runtimeCapabilities.generateReport()
            });
            emotiveDebugger.startProfile('mascot-initialization', {
                canvasId: config.canvasId,
                maxParticles: config.maxParticles
            });
        }

        // Set up audio level processor callbacks
        this.mascot.setupAudioLevelProcessorCallbacks();

        // Set initial emotional state
        this.mascot.stateMachine.setEmotion(config.defaultEmotion);

        // Register for canvas resize events
        this.mascot.canvasManager.onResize((width, height, dpr) => {
            this.mascot.handleResize(width, height, dpr);
        });

        // Complete initialization profiling
        if (this.mascot.debugMode) {
            emotiveDebugger.endProfile('mascot-initialization');
            emotiveDebugger.takeMemorySnapshot('post-initialization');
        }
    }
}
