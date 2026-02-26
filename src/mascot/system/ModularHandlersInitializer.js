/**
 * ModularHandlersInitializer
 *
 * Initializes all modular handler managers with explicit dependency injection.
 * Extracted from InitializationManager Phase 9 to reduce file complexity.
 *
 * Manager Layers:
 * - Layer 1: Managers with minimal dependencies (audio, state, visualization)
 * - Layer 2: Managers that depend on Layer 1 (diagnostics, emotional state)
 * - Layer 3: Managers that depend on Layer 2 (performance, health, config)
 *
 * @module ModularHandlersInitializer
 */

import { AudioHandler } from '../audio/AudioHandler.js';
import { StateCoordinator } from '../state/StateCoordinator.js';
import { VisualizationRunner } from '../control/VisualizationRunner.js';
import { ExecutionLifecycleManager } from '../control/ExecutionLifecycleManager.js';
import { AnimationFrameController } from '../control/AnimationFrameController.js';
import { ShapeTransformManager } from '../rendering/ShapeTransformManager.js';
import { EventListenerManager } from '../events/EventListenerManager.js';
import { TTSManager } from '../audio/TTSManager.js';
import { SpeechReactivityManager } from '../audio/SpeechReactivityManager.js';
import { CanvasResizeManager } from '../rendering/CanvasResizeManager.js';
import { OffsetPositionManager } from '../rendering/OffsetPositionManager.js';
import { VisualTransformationManager } from '../rendering/VisualTransformationManager.js';
import { FrustrationContextManager } from '../state/FrustrationContextManager.js';
import { LLMIntegrationBridge } from '../integration/LLMIntegrationBridge.js';
import { DiagnosticsManager } from './DiagnosticsManager.js';
import { EmotionalStateQueryManager } from '../state/EmotionalStateQueryManager.js';
import { DebugProfilingManager } from '../debug/DebugProfilingManager.js';
import { PerformanceBehaviorManager } from '../performance/PerformanceBehaviorManager.js';
import { PerformanceMonitoringManager } from '../performance/PerformanceMonitoringManager.js';
import { HealthCheckManager } from './HealthCheckManager.js';
import { ConfigurationManager } from './ConfigurationManager.js';

/**
 * ModularHandlersInitializer - Initializes all modular handler managers
 */
export class ModularHandlersInitializer {
    /**
     * @param {Object} mascot - Reference to parent EmotiveMascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Initialize all modular handlers with explicit dependency injection
     * @param {Object} config - User configuration
     */
    initialize(config) {
        const m = this.mascot;

        // Layer 1: Managers with minimal dependencies
        this._initializeLayer1(m, config);

        // Layer 2: Managers that depend on Layer 1
        this._initializeLayer2(m, config);

        // Layer 3: Managers that depend on Layer 2
        this._initializeLayer3(m, config);

        // Initialize the handlers
        m.audioHandler.init();
        m.stateCoordinator.init();
        m.visualizationRunner.init();
    }

    /**
     * Layer 1: Initialize managers with minimal dependencies
     * @private
     */
    _initializeLayer1(m, _config) {
        // AudioHandler - depends on audio systems
        m.audioHandler = new AudioHandler({
            audioAnalyzer: m.audioAnalyzer,
            audioLevelProcessor: m.audioLevelProcessor,
            shapeMorpher: m.shapeMorpher,
            soundSystem: m.soundSystem,
            renderer: m.renderer,
            errorBoundary: m.errorBoundary,
            config: m.config,
            state: {
                get speaking() { return m.speaking; },
                set speaking(v) { m.speaking = v; },
                get audioLevel() { return m.audioLevel; },
                set audioLevel(v) { m.audioLevel = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // StateCoordinator - depends on state machine, renderer
        m.stateCoordinator = new StateCoordinator({
            stateMachine: m.stateMachine,
            particleSystem: m.particleSystem,
            canvasManager: m.canvasManager,
            renderer: m.renderer,
            soundSystem: m.soundSystem,
            config: m.config,
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // VisualizationRunner - depends on animation controller, state machine, renderer
        m.visualizationRunner = new VisualizationRunner({
            animationController: m.animationController,
            stateMachine: m.stateMachine,
            particleSystem: m.particleSystem,
            canvasManager: m.canvasManager,
            renderer: m.renderer,
            audioHandler: m.audioHandler,
            audioLevelProcessor: m.audioLevelProcessor,
            gazeTracker: m.gazeTracker,
            idleBehavior: m.idleBehavior,
            degradationManager: m.degradationManager,
            pluginSystem: m.pluginSystem,
            config: m.config,
            canvas: m.canvas,
            state: {
                get speaking() { return m.speaking; },
                set speaking(v) { m.speaking = v; },
                get isRunning() { return m.isRunning; },
                set isRunning(v) { m.isRunning = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // ExecutionLifecycleManager - depends on animation controller, idle behavior, visualization runner
        m.executionLifecycleManager = new ExecutionLifecycleManager({
            animationController: m.animationController,
            visualizationRunner: m.visualizationRunner,
            idleBehavior: m.idleBehavior,
            gazeTracker: m.gazeTracker,
            renderer: m.renderer,
            errorBoundary: m.errorBoundary,
            state: {
                get isRunning() { return m.isRunning; },
                set isRunning(v) { m.isRunning = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // AnimationFrameController - depends on animation controller, position controller
        m.animationFrameController = new AnimationFrameController({
            animationController: m.animationController,
            positionController: m.positionController,
            config: m.config,
            errorBoundary: m.errorBoundary,
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // ShapeTransformManager - depends on shape morpher, renderer
        m.shapeTransformManager = new ShapeTransformManager({
            shapeMorpher: m.shapeMorpher,
            renderer: m.renderer,
            errorBoundary: m.errorBoundary,
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // EventListenerManager - depends on event manager
        m.eventListenerManager = new EventListenerManager({
            eventManager: m.eventManager,
            errorBoundary: m.errorBoundary,
            chainTarget: m
        });

        // TTSManager - depends on TTS state, sound system
        m.ttsManager = new TTSManager({
            soundSystem: m.soundSystem,
            errorBoundary: m.errorBoundary,
            config: m.config,
            tts: m.tts,
            state: {
                get speaking() { return m.speaking; },
                set speaking(v) { m.speaking = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // SpeechReactivityManager - depends on audio level processor
        m.speechReactivityManager = new SpeechReactivityManager({
            audioLevelProcessor: m.audioLevelProcessor,
            renderer: m.renderer,
            errorBoundary: m.errorBoundary,
            config: m.config,
            state: {
                get speaking() { return m.speaking; },
                set speaking(v) { m.speaking = v; },
                get audioLevel() { return m.audioLevel; },
                set audioLevel(v) { m.audioLevel = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // CanvasResizeManager - depends on renderer, state machine, particle system
        m.canvasResizeManager = new CanvasResizeManager({
            renderer: m.renderer,
            stateMachine: m.stateMachine,
            particleSystem: m.particleSystem,
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });

        // OffsetPositionManager - depends on position controller, error boundary
        m.offsetPositionManager = new OffsetPositionManager({
            positionController: m.positionController,
            errorBoundary: m.errorBoundary,
            chainTarget: m
        });

        // VisualTransformationManager - depends on canvas resize, offset position, shape transform managers
        m.visualTransformationManager = new VisualTransformationManager({
            canvasResizeManager: m.canvasResizeManager,
            offsetPositionManager: m.offsetPositionManager,
            shapeTransformManager: m.shapeTransformManager,
            chainTarget: m
        });

        // FrustrationContextManager - depends on context manager
        m.frustrationContextManager = new FrustrationContextManager({
            contextManager: m.contextManager,
            errorBoundary: m.errorBoundary,
            chainTarget: m
        });

        // LLMIntegrationBridge - depends on state machine, gesture controller
        m.llmIntegrationBridge = new LLMIntegrationBridge({
            stateMachine: m.stateMachine,
            gestureController: m.gestureController,
            errorBoundary: m.errorBoundary,
            state: {
                get llmHandler() { return m.llmHandler; },
                set llmHandler(v) { m.llmHandler = v; }
            },
            emit: (event, data) => m.emit(event, data),
            chainTarget: m
        });
    }

    /**
     * Layer 2: Initialize managers that depend on Layer 1
     * @private
     */
    _initializeLayer2(m, _config) {
        // DiagnosticsManager - depends on animation controller, state machine, performance system
        m.diagnosticsManager = new DiagnosticsManager({
            errorBoundary: m.errorBoundary,
            degradationManager: m.degradationManager,
            animationController: m.animationController,
            stateMachine: m.stateMachine,
            performanceSystem: m.performanceSystem,
            config: m.config,
            state: {
                get isRunning() { return m.isRunning; },
                get speaking() { return m.speaking; },
                get debugMode() { return m.debugMode; }
            },
            getCurrentState: () => m.getCurrentState(),
            getAudioStats: () => m.getAudioStats(),
            getEventStats: () => m.getEventStats(),
            chainTarget: m
        });

        // EmotionalStateQueryManager - depends on state machine, performance system, context manager
        m.emotionalStateQueryManager = new EmotionalStateQueryManager({
            stateMachine: m.stateMachine,
            performanceSystem: m.performanceSystem,
            contextManager: m.contextManager,
            errorBoundary: m.errorBoundary,
            chainTarget: m
        });

        // DebugProfilingManager - depends on diagnostics manager
        m.debugProfilingManager = new DebugProfilingManager({
            diagnosticsManager: m.diagnosticsManager,
            errorBoundary: m.errorBoundary,
            state: {
                get debugMode() { return m.debugMode; },
                set debugMode(v) { m.debugMode = v; }
            },
            chainTarget: m
        });
    }

    /**
     * Layer 3: Initialize managers that depend on Layer 2
     * @private
     */
    _initializeLayer3(m, config) {
        // PerformanceBehaviorManager - depends on performance system, frustration context manager
        m.performanceBehaviorManager = new PerformanceBehaviorManager({
            errorBoundary: m.errorBoundary,
            performanceSystem: m.performanceSystem,
            frustrationContextManager: m.frustrationContextManager,
            emotionalStateQueryManager: m.emotionalStateQueryManager,
            diagnosticsManager: m.diagnosticsManager,
            chainTarget: m
        });

        // HealthCheckManager - depends on diagnostics manager (must be before PerformanceMonitoringManager)
        m.healthCheckManager = new HealthCheckManager({
            errorBoundary: m.errorBoundary,
            systemStatusReporter: m.systemStatusReporter,
            diagnosticsManager: m.diagnosticsManager,
            mobileOptimization: m.mobileOptimization,
            accessibilityManager: m.accessibilityManager,
            config: m.config,
            chainTarget: m
        });

        // PerformanceMonitoringManager - depends on diagnostics manager, health check manager
        m.performanceMonitoringManager = new PerformanceMonitoringManager({
            diagnosticsManager: m.diagnosticsManager,
            degradationManager: m.degradationManager,
            animationFrameController: m.animationFrameController,
            animationController: m.animationController,
            particleSystem: m.particleSystem,
            healthCheckManager: m.healthCheckManager,
            config: m.config,
            chainTarget: m
        });

        // ConfigurationManager - depends on config, multiple systems
        m.configurationManager = new ConfigurationManager({
            config: m.config,
            userConfig: config,
            animationController: m.animationController,
            particleSystem: m.particleSystem,
            soundSystem: m.soundSystem,
            renderer: m.renderer,
            gazeTracker: m.gazeTracker,
            idleBehavior: m.idleBehavior,
            mobileOptimization: m.mobileOptimization,
            accessibilityManager: m.accessibilityManager,
            errorBoundary: m.errorBoundary,
            chainTarget: m
        });
    }
}
