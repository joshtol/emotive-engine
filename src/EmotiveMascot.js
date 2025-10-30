/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                   ◐ ◑ ◒ ◓  EMOTIVE MASCOT  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview EmotiveMascot - Main API Class for the Emotive Engine
 * @author Emotive Engine Team
 * @version 2.1.0
 * @module EmotiveMascot
 * @complexity ⭐⭐⭐⭐ Advanced (Core orchestrator - 3,096 lines)
 * @audience Most contributors won't need to modify this file. It coordinates all subsystems.
 * @see docs/ARCHITECTURE.md for system overview
 * @changelog 2.1.0 - Added resize handling with visual resampling for consistent quality
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The MAIN ORCHESTRATOR of the Emotive Engine. This is the primary API class        
 * ║ that developers interact with. It coordinates all subsystems, manages the         
 * ║ lifecycle, and provides the fluent API for emotional expression.                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 CORE FEATURES                                                                  
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Emotional state management with smooth transitions                              
 * │ • Gesture triggering and animation control                                        
 * │ • Particle system orchestration                                                   
 * │ • Dynamic visual resampling on resize                                             
 * │ • Plugin system for extensibility                                                 
 * │ • Event handling and listener management                                          
 * │ • Performance optimization and degradation                                        
 * │ • Accessibility features                                                          
 * │ • Mobile optimization                                                             
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import CanvasManager from './core/canvas/CanvasManager.js';
import ErrorBoundary from './core/events/ErrorBoundary.js';
import EmotiveStateMachine from './core/state/EmotiveStateMachine.js';
import ParticleSystem from './core/ParticleSystem.js';
import EmotiveRenderer from './core/EmotiveRenderer.js';
import GazeTracker from './core/behavior/GazeTracker.js';
import IdleBehavior from './core/behavior/IdleBehavior.js';
import { getEmotionVisualParams, getEmotion } from './core/emotions/index.js';
import * as Emotions from './core/emotions/index.js';
import * as Gestures from './core/gestures/index.js';
import * as ParticleBehaviors from './core/particles/behaviors/index.js';
import PositionController from './utils/PositionController.js';
import { initSentry, addBreadcrumb } from './utils/sentry.js';
import { SoundSystem } from './core/audio/SoundSystem.js';
import AnimationController from './core/AnimationController.js';
import AudioLevelProcessor from './core/audio/AudioLevelProcessor.js';
import { EventManager } from './core/events/EventManager.js';
import AccessibilityManager from './core/optimization/AccessibilityManager.js';
import MobileOptimization from './core/optimization/MobileOptimization.js';
import PluginSystem from './core/plugins/PluginSystem.js';
import { browserCompatibility, CanvasContextRecovery } from './utils/browserCompatibility.js';
import { emotiveDebugger, runtimeCapabilities } from './utils/debugger.js';
import rhythmIntegration from './core/audio/rhythmIntegration.js';
import ShapeMorpher from './core/ShapeMorpher.js';
import { AudioAnalyzer } from './core/audio/AudioAnalyzer.js';
import gestureCompatibility from './core/GestureCompatibility.js';
import GrooveTemplates from './core/audio/GrooveTemplates.js';

// Import modular handlers
import { AudioHandler } from './mascot/audio/AudioHandler.js';
import { GestureController } from './mascot/control/GestureController.js';
import { StateCoordinator } from './mascot/state/StateCoordinator.js';
import { VisualizationRunner } from './mascot/control/VisualizationRunner.js';
import { ExecutionLifecycleManager } from './mascot/control/ExecutionLifecycleManager.js';
import { AnimationFrameController } from './mascot/control/AnimationFrameController.js';
import { ConfigurationManager } from './mascot/system/ConfigurationManager.js';
import { DiagnosticsManager } from './mascot/system/DiagnosticsManager.js';
import { InitializationManager } from './mascot/system/InitializationManager.js';
import { RenderStateBuilder } from './mascot/rendering/RenderStateBuilder.js';
import { ThreatLevelCalculator } from './mascot/rendering/ThreatLevelCalculator.js';
import { ParticleConfigCalculator } from './mascot/rendering/ParticleConfigCalculator.js';
import { GestureMotionProvider } from './mascot/rendering/GestureMotionProvider.js';
import { RenderLayerOrchestrator } from './mascot/rendering/RenderLayerOrchestrator.js';
import { DebugInfoRenderer } from './mascot/rendering/DebugInfoRenderer.js';
import { ShapeTransformManager } from './mascot/rendering/ShapeTransformManager.js';
import { LLMIntegrationBridge } from './mascot/integration/LLMIntegrationBridge.js';
import { DestructionManager } from './mascot/system/DestructionManager.js';
import { BreathingAnimationController } from './mascot/animation/BreathingAnimationController.js';
import { SystemStatusReporter } from './mascot/system/SystemStatusReporter.js';
import { SleepWakeManager } from './mascot/state/SleepWakeManager.js';
import { SpeechManager } from './mascot/audio/SpeechManager.js';
import { AudioLevelCallbackManager } from './mascot/audio/AudioLevelCallbackManager.js';
import { OrbScaleAnimator } from './mascot/animation/OrbScaleAnimator.js';
import { RecordingStateManager } from './mascot/state/RecordingStateManager.js';
import { BreathingPatternManager } from './mascot/animation/BreathingPatternManager.js';
import { EventListenerManager } from './mascot/events/EventListenerManager.js';
import { EmotionalStateQueryManager } from './mascot/state/EmotionalStateQueryManager.js';
import { TTSManager } from './mascot/audio/TTSManager.js';
import { SpeechReactivityManager } from './mascot/audio/SpeechReactivityManager.js';
import { CanvasResizeManager } from './mascot/rendering/CanvasResizeManager.js';
import { OffsetPositionManager } from './mascot/rendering/OffsetPositionManager.js';
import { RotationController } from './mascot/rendering/RotationController.js';
import { VisualTransformationManager } from './mascot/rendering/VisualTransformationManager.js';
import { FrustrationContextManager } from './mascot/state/FrustrationContextManager.js';
import { PerformanceBehaviorManager } from './mascot/performance/PerformanceBehaviorManager.js';
import { PerformanceMonitoringManager } from './mascot/performance/PerformanceMonitoringManager.js';
import { DebugProfilingManager } from './mascot/debug/DebugProfilingManager.js';
import { HealthCheckManager } from './mascot/system/HealthCheckManager.js';

// Import Semantic Performance System
import { PerformanceSystem } from './core/plugins/PerformanceSystem.js';
import { ContextManager } from './core/state/ContextManager.js';
import { SequenceExecutor } from './core/plugins/SequenceExecutor.js';

// Import LLM Integration
import LLMResponseHandler from './core/integration/LLMResponseHandler.js';
import { generateSystemPrompt } from './core/integration/llm-templates.js';

class EmotiveMascot {
    constructor(config = {}) {
        // Initialize error boundary first
        this.errorBoundary = new ErrorBoundary();
        
        // Initialize EventManager with simple event emitter functionality
        this.eventManager = new EventManager({
            maxListeners: config.maxEventListeners || 100,
            enableDebugging: config.enableEventDebugging || false,
            enableMonitoring: config.enableEventMonitoring || true,
            memoryWarningThreshold: config.eventMemoryWarningThreshold || 50
        });

        // Add simple event emitter methods if not present
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
        
        // Wrap initialization in error boundary
        this.errorBoundary.wrap(() => {
            this.initialize(config);
        }, 'initialization')();
    }

    /**
     * Get default duration for a gesture
     */
    /**
     * Initialize the mascot system
     * @param {Object} config - Configuration options
     */
    initialize(config) {
        // Expose Emotions, Gestures, and ParticleBehaviors modules for plugin access
        this.Emotions = Emotions;
        this.Gestures = Gestures;
        this.ParticleBehaviors = ParticleBehaviors;

        // Initialize managers BEFORE calling initManager.initialize()
        // This is critical because InitializationManager calls setupAudioLevelProcessorCallbacks()
        // which needs audioLevelCallbackManager to be instantiated
        this.speechManager = new SpeechManager(this);
        this.audioLevelCallbackManager = new AudioLevelCallbackManager(this);
        this.orbScaleAnimator = new OrbScaleAnimator(this);
        this.recordingStateManager = new RecordingStateManager(this);
        this.breathingPatternManager = new BreathingPatternManager(this);

        // Delegate initialization to InitializationManager
        const initManager = new InitializationManager(this, config);
        initManager.initialize();

        // Initialize render managers (after all components are initialized)
        this.renderStateBuilder = new RenderStateBuilder(this);
        this.threatLevelCalculator = new ThreatLevelCalculator(this);
        this.particleConfigCalculator = new ParticleConfigCalculator(this);
        this.gestureMotionProvider = new GestureMotionProvider(this);
        this.renderLayerOrchestrator = new RenderLayerOrchestrator(this);
        this.debugInfoRenderer = new DebugInfoRenderer(this);
        this.destructionManager = new DestructionManager(this);
        this.breathingAnimationController = new BreathingAnimationController(this);
        this.systemStatusReporter = new SystemStatusReporter(this);
        this.sleepWakeManager = new SleepWakeManager(this);
    }

    /**
     * Handle degradation manager events
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    handleDegradationEvent(event, data) {
        switch (event) {
        case 'degradationApplied':
            // Silently handle performance degradation
            this.applyDegradationSettings(data.settings);
            this.emit('performanceDegradation', data);
            break;
                
        case 'recoveryApplied':
            // Silently handle performance recovery
            this.applyDegradationSettings(data.settings);
            this.emit('performanceRecovery', data);
            break;
                
        case 'levelChanged':
            // Silently handle degradation level change
            this.applyDegradationSettings(data.settings);
            this.emit('degradationLevelChanged', data);
            break;
        }
    }

    /**
     * Apply degradation settings to all systems
     * @param {Object} settings - Degradation settings
     */
    applyDegradationSettings(settings) {
        // Update particle system limits
        if (this.particleSystem && settings.particleLimit !== undefined) {
            this.particleSystem.setMaxParticles(settings.particleLimit);
        }
        
        // Update audio system
        if (this.soundSystem && settings.audioEnabled !== undefined) {
            if (!settings.audioEnabled && this.soundSystem.isAvailable()) {
                this.soundSystem.stopAmbientTone(200);
            }
        }
        
        // DISABLED - Don't change FPS based on degradation
        /*
        // Update animation controller target FPS
        if (this.animationController && settings.targetFPS !== undefined) {
            this.animationController.setTargetFPS(settings.targetFPS);
        }
        */
        
        // Update renderer quality
        if (this.renderer && settings.qualityLevel !== undefined) {
            this.renderer.setQualityLevel(settings.qualityLevel);
        }
    }

    /**
     * Set up callbacks for the audio level processor
     */
    setupAudioLevelProcessorCallbacks() {
        this.audioLevelCallbackManager.setupAudioLevelProcessorCallbacks();
    }

    /**
     * Sets the emotional state with optional undertone
     * @param {string} emotion - The emotion to set
     * @param {Object|string|null} options - Options object or undertone string
     * @returns {EmotiveMascot} This instance for chaining
     */
    setEmotion(emotion, options = null) {
        return this.errorBoundary.wrap(() => {
            return this.stateCoordinator.setEmotion(emotion, options);
        }, 'emotion-setting', this)();
    }
    
    /**
     * Update the undertone without resetting emotion
     * @param {string|null} undertone - The undertone to apply (subdued, tired, nervous, energetic, confident, intense, or null)
     * @returns {EmotiveMascot} This instance for chaining
     */
    updateUndertone(undertone) {
        return this.errorBoundary.wrap(() => {
            // Update state machine's undertone
            this.stateMachine.applyUndertoneModifier(undertone);
            // Update renderer's undertone without resetting emotion
            if (this.renderer && this.renderer.updateUndertone) {
                this.renderer.updateUndertone(undertone);
            }
            return this;
        }, 'undertone-update', this)();
    }
    
    /**
     * Set BPM for rhythm-linked subsystems
     * @param {number} bpm - Beats per minute (forwarded to audio/rhythm helpers)
     * @note Manual rotation now uses degrees per frame; BPM no longer drives rotation speed directly.
     * @returns {EmotiveMascot} This instance for chaining
     */
    setBPM(bpm) {
        return this.rotationController.setBPM(bpm);
    }

    /**
     * Set manual rotation speed for the shape
     * @param {number} speed - Rotation speed in degrees per frame (negative for reverse)
     * @note Speeds between -10 and 10 feel natural; higher values may cause motion blur.
     * @returns {EmotiveMascot} This instance for chaining
     */
    setRotationSpeed(speed) {
        return this.rotationController.setRotationSpeed(speed);
    }

    /**
     * Set manual rotation angle directly (for scratching)
     * @param {number} angle - Rotation angle in degrees
     * @returns {EmotiveMascot} This instance for chaining
     */
    setRotationAngle(angle) {
        return this.rotationController.setRotationAngle(angle);
    }

    /**
     * Get the current position information
     * @returns {Object|null} Current position metadata or null if not available
     */
    getPosition() {
        return this.animationFrameController.getPosition();
    }

    /**
     * Enable or disable gaze tracking
     * @param {boolean} enabled - Whether to enable gaze tracking
     * @returns {EmotiveMascot} This instance for chaining
     */
    setGazeTracking(enabled) {
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.setGazeTracking) {
                this.renderer.setGazeTracking(enabled);
            }
            return this;
        }, 'gaze-tracking-update', this)();
    }

    /**
     * Executes a single gesture or chord (multiple simultaneous gestures)
     * @param {string|Array<string>|Object} gesture - Single gesture, array of gestures, or chord object
     * @param {Object} options - Options for the gesture execution
     * @returns {EmotiveMascot} This instance for chaining
     */
    express(gesture, options = {}) {
        // Delegate to GestureController (check for initialization first)
        if (!this.gestureController) {
            console.warn('GestureController not initialized, skipping gesture');
            return this;
        }
        return this.gestureController.express(gesture, options);
    }

    /**
     * Express multiple gestures simultaneously (chord)
     * @param {Array<string>} gestures - Array of gesture names to execute together
     * @param {Object} options - Options for the chord execution
     * @returns {EmotiveMascot} This instance for chaining
     */
    expressChord(gestures, options = {}) {
        // Delegate to GestureController
        return this.gestureController.expressChord(gestures, options);
    }

    /**
     * Execute a gesture directly on the renderer (bypasses routing)
     * @private
     */
    executeGestureDirectly(gesture, options = {}) {
        // Delegate to GestureController
        this.gestureController.executeGestureDirectly(gesture, options);

        // Emit event
        this.emit('gesture', { name: gesture, options });
    }

    /**
     * Chains multiple gestures for sequential execution
     * @param {...string} gestures - Gestures to chain
     * @returns {EmotiveMascot} This instance for chaining
     */
    chain(...gestures) {
        // Delegate to GestureController
        return this.gestureController.chain(...gestures);
    }

    /**
     * Execute a sequence of gesture steps with proper timing
     * @param {Array<Array<string>>} steps - Array of steps, each containing simultaneous gestures
     */
    executeChainSequence(steps) {
        // Delegate to GestureController
        return this.gestureController.executeChainSequence(steps);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SEMANTIC PERFORMANCE API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Execute a semantic performance (e.g., 'celebrating', 'empathizing', 'success_major')
     * @param {string} semanticAction - The semantic action to perform
     * @param {Object} options - Performance options
     * @param {Object} [options.context] - Context for intensity calculation
     * @param {number} [options.context.frustration] - User frustration level (0-100)
     * @param {string} [options.context.urgency] - Urgency level (low/medium/high)
     * @param {string} [options.context.magnitude] - Magnitude (small/moderate/major/epic)
     * @param {number} [options.intensity] - Override calculated intensity (0-1)
     * @param {number} [options.delay] - Override default delay
     * @returns {Promise<EmotiveMascot>} Promise resolving to this instance for chaining
     */
    perform(semanticAction, options = {}) {
        return this.performanceBehaviorManager.perform(semanticAction, options);
    }

    /**
     * Update conversation context for context-aware performances
     * @param {Object} updates - Context updates
     * @param {number} [updates.frustration] - Frustration level (0-100)
     * @param {string} [updates.urgency] - Urgency level (low/medium/high)
     * @param {string} [updates.magnitude] - Magnitude (small/moderate/major/epic)
     * @param {Object} [updates.custom] - Custom context values
     * @returns {EmotiveMascot} This instance for chaining
     */
    updateContext(updates) {
        return this.frustrationContextManager.updateContext(updates);
    }

    /**
     * Get current conversation context
     * @returns {Object} Current context state
     */
    getContext() {
        return this.emotionalStateQueryManager.getContext();
    }

    /**
     * Increment user frustration level
     * @param {number} amount - Amount to increment (default: 10)
     * @returns {EmotiveMascot} This instance for chaining
     */
    incrementFrustration(amount = 10) {
        return this.frustrationContextManager.incrementFrustration(amount);
    }

    /**
     * Decrement user frustration level
     * @param {number} amount - Amount to decrement (default: 10)
     * @returns {EmotiveMascot} This instance for chaining
     */
    decrementFrustration(amount = 10) {
        return this.frustrationContextManager.decrementFrustration(amount);
    }

    /**
     * Reset user frustration to zero
     * @returns {EmotiveMascot} This instance for chaining
     */
    resetFrustration() {
        return this.frustrationContextManager.resetFrustration();
    }

    /**
     * Get all available performance names
     * @returns {Array<string>} Array of performance names
     */
    getAvailablePerformances() {
        return this.performanceBehaviorManager.getAvailablePerformances();
    }

    /**
     * Register a custom performance
     * @param {string} name - Performance name
     * @param {Object} definition - Performance definition
     * @returns {EmotiveMascot} This instance for chaining
     */
    registerPerformance(name, definition) {
        return this.performanceBehaviorManager.registerPerformance(name, definition);
    }

    /**
     * Get performance analytics (if enabled)
     * @returns {Object|null} Performance analytics data
     */
    getPerformanceAnalytics() {
        return this.performanceBehaviorManager.getPerformanceAnalytics();
    }

    /**
     * Get context analytics (if history is enabled)
     * @returns {Object|null} Context analytics data
     */
    getContextAnalytics() {
        return this.performanceBehaviorManager.getContextAnalytics();
    }

    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Starts speech reactivity mode with audio level monitoring
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {EmotiveMascot} This instance for chaining
     */
    startSpeaking(audioContext) {
        return this.speechManager ? this.speechManager.startSpeaking(audioContext) : this;
    }

    /**
     * Stops speech reactivity mode and returns to base emotional state
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopSpeaking() {
        return this.speechManager ? this.speechManager.stopSpeaking() : this;
    }

    
    
    /**
     * Start recording state (listening/capturing mode)
     * @returns {EmotiveMascot} This instance for chaining
     */
    startRecording() {
        return this.recordingStateManager ? this.recordingStateManager.startRecording() : this;
    }

    /**
     * Stop recording state
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopRecording() {
        return this.recordingStateManager ? this.recordingStateManager.stopRecording() : this;
    }
    
    /**
     * Enter sleep state with animation sequence
     * @returns {EmotiveMascot} This instance for chaining
     */
    sleep() {
        return this.sleepWakeManager.sleep();
    }
    
    /**
     * Wake up from sleep state with animation sequence
     * @returns {EmotiveMascot} This instance for chaining
     */
    wake() {
        return this.sleepWakeManager.wake();
    }
    
    /**
     * Gets available TTS voices
     * @returns {Array} Array of available voice objects
     */
    getTTSVoices() {
        return this.ttsManager.getTTSVoices();
    }

    /**
     * Checks if TTS is currently speaking
     * @returns {boolean} True if currently speaking
     */
    isTTSSpeaking() {
        return this.ttsManager.isTTSSpeaking();
    }

    /**
     * Starts the animation loop at target 60 FPS
     * @returns {EmotiveMascot} This instance for chaining
     */
    start() {
        return this.executionLifecycleManager.start();
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {EmotiveMascot} This instance for chaining
     */
    stop() {
        return this.executionLifecycleManager.stop();
    }



    /**
     * Sets a breathing pattern for the orb
     * @param {number} inhale - Inhale duration in seconds
     * @param {number} hold1 - Hold after inhale in seconds
     * @param {number} exhale - Exhale duration in seconds
     * @param {number} hold2 - Hold after exhale in seconds
     * @returns {EmotiveMascot} This instance for chaining
     */
    setBreathePattern(inhale, hold1, exhale, hold2) {
        return this.breathingPatternManager ? this.breathingPatternManager.setBreathePattern(inhale, hold1, exhale, hold2) : this;
    }
    
    /**
     * Directly sets the orb scale with animation
     * @param {number} scale - Target scale (1.0 = normal)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function ('linear', 'ease', 'easeIn', 'easeOut', 'easeInOut')
     * @returns {EmotiveMascot} This instance for chaining
     */
    setOrbScale(scale, duration = 1000, easing = 'easeInOut') {
        return this.orbScaleAnimator ? this.orbScaleAnimator.setOrbScale(scale, duration, easing) : this;
    }
    
    /**
     * Applies a preset breathing pattern
     * @param {string} type - Preset type: 'calm', 'anxious', 'meditative', 'deep', 'sleep'
     * @returns {EmotiveMascot} This instance for chaining
     */
    breathe(type = 'calm') {
        return this.breathingPatternManager ? this.breathingPatternManager.breathe(type) : this;
    }
    
    /**
     * Starts the custom breathing animation
     * @private
     */
    startBreathingAnimation() {
        this.breathingAnimationController.startBreathingAnimation();
    }
    
    /**
     * Stops any active breathing animation
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopBreathing() {
        return this.breathingPatternManager ? this.breathingPatternManager.stopBreathing() : this;
    }
    
    /**
     * Adds an event listener for external integration hooks
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} This instance for chaining
     */
    on(event, callback) {
        return this.eventListenerManager.on(event, callback);
    }

    /**
     * Removes an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function to remove
     * @returns {EmotiveMascot} This instance for chaining
     */
    off(event, callback) {
        return this.eventListenerManager.off(event, callback);
    }

    /**
     * Adds a one-time event listener that removes itself after first execution
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} This instance for chaining
     */
    once(event, callback) {
        return this.eventListenerManager.once(event, callback);
    }

    /**
     * Removes all listeners for a specific event or all events
     * @param {string|null} event - Event name to clear, or null to clear all
     * @returns {EmotiveMascot} This instance for chaining
     */
    removeAllListeners(event = null) {
        return this.eventListenerManager.removeAllListeners(event);
    }

    /**
     * Gets the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.eventListenerManager.listenerCount(event);
    }

    /**
     * Gets all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return this.eventListenerManager.getEventNames();
    }

    /**
     * Gets comprehensive event system statistics
     * @returns {Object} Event system statistics and monitoring data
     */
    getEventStats() {
        return this.eventListenerManager.getEventStats();
    }

    /**
     * Gets EventManager debugging information
     * @returns {Object} Debug information about the event system
     */
    getEventDebugInfo() {
        return this.eventListenerManager.getEventDebugInfo();
    }

    /**
     * Gets browser compatibility information
     * @returns {Object} Browser compatibility details
     */
    getBrowserCompatibility() {
        return this.diagnosticsManager.getBrowserCompatibility();
    }

    /**
     * Gets degradation manager status and settings
     * @returns {Object|null} Degradation manager information or null if disabled
     */
    getDegradationStatus() {
        return this.performanceMonitoringManager.getDegradationStatus();
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Degradation level index or name
     * @returns {boolean} True if level was set successfully
     */
    setDegradationLevel(level) {
        return this.performanceMonitoringManager.setDegradationLevel(level);
    }

    /**
     * Check if a specific feature is available in current degradation level
     * @param {string} feature - Feature name (audio, particles, fullEffects, etc.)
     * @returns {boolean} True if feature is available
     */
    isFeatureAvailable(feature) {
        return this.performanceMonitoringManager.isFeatureAvailable(feature);
    }

    /**
     * Force canvas context recovery
     * @returns {boolean} True if recovery was successful
     */
    recoverCanvasContext() {
        if (!this.contextRecovery) {
            return false;
        }
        
        return this.contextRecovery.recover();
    }

    /**
     * Check if canvas context is currently lost
     * @returns {boolean} True if context is lost
     */
    isCanvasContextLost() {
        if (!this.contextRecovery) {
            return false;
        }
        
        return this.contextRecovery.isLost();
    }


    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report including all system states
     */
    getDebugReport() {
        return this.debugProfilingManager.getDebugReport();
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     */
    exportDebugData() {
        return this.debugProfilingManager.exportDebugData();
    }

    /**
     * Start profiling a named operation
     * @param {string} name - Profile name
     * @param {Object} metadata - Additional metadata
     */
    startProfiling(name, metadata = {}) {
        this.debugProfilingManager.startProfiling(name, metadata);
    }

    /**
     * End profiling and get results
     * @param {string} name - Profile name
     * @returns {Object|null} Profile results
     */
    endProfiling(name) {
        return this.debugProfilingManager.endProfiling(name);
    }

    /**
     * Take a memory snapshot
     * @param {string} label - Snapshot label
     */
    takeMemorySnapshot(label) {
        this.debugProfilingManager.takeMemorySnapshot(label);
    }

    /**
     * Clear all debug data
     */
    clearDebugData() {
        this.debugProfilingManager.clearDebugData();
    }

    /**
     * Get runtime performance capabilities
     * @returns {Object} Runtime capabilities report
     */
    getRuntimeCapabilities() {
        return this.debugProfilingManager.getRuntimeCapabilities();
    }

    /**
     * Emits an event to all registered listeners with error boundary protection
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        this.eventListenerManager.emit(event, data);
    }

    /**
     * Updates audio level monitoring (called by AnimationController)
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        this.errorBoundary.wrap(() => {
            this.visualizationRunner.update(deltaTime);
        }, 'audio-update')();
    }





    /**
     * Renders the current frame (called by AnimationController)
     */
    render() {
        try {
            // Build render state and timing (delegated to RenderStateBuilder)
            const { renderStart, deltaTime, renderState } = this.renderStateBuilder.buildRenderState();

            // Track frame timing for debugging
            if (this.debugMode) {
                emotiveDebugger.trackFrameTiming(deltaTime);
            }

            // Clear canvas ONCE at the beginning
            this.canvasManager.clear();

            // Update gaze tracker
            if (this.gazeTracker) {
                this.gazeTracker.update(deltaTime);
            }

            // Update threat level for suspicion emotion (delegated to ThreatLevelCalculator)
            this.threatLevelCalculator.updateThreatLevel(renderState);

            // Convert emotion to visual params (AFTER updating threat level)
            const emotionParams = getEmotionVisualParams(renderState.emotion);

            // Set emotional state on renderer
            this.renderer.setEmotionalState(renderState.emotion, emotionParams, renderState.undertone);

            // Calculate particle configuration (delegated to ParticleConfigCalculator)
            const particleConfig = this.particleConfigCalculator.calculateParticleConfig(renderState, emotionParams);
            const { orbX, orbY, particleBehavior, particleRate, minParticles, maxParticles } = particleConfig;

            // Spawn particles at orb position
            this.particleSystem.spawn(
                particleBehavior,
                renderState.emotion,
                particleRate,
                orbX,
                orbY,
                deltaTime,
                null,  // no forced count
                minParticles,
                maxParticles,
                this.renderer.particleScaleFactor || this.renderer.scaleFactor || 1,
                this.config.classicConfig?.particleSizeMultiplier || 1,
                emotionParams.particleColors || null,
                renderState.undertone
            );

            // Get particle modifier (delegated to ParticleConfigCalculator)
            const particleModifier = this.particleConfigCalculator.getParticleModifier(renderState);

            // Get gesture motion and progress (delegated to GestureMotionProvider)
            const { gestureMotion, gestureProgress } = this.gestureMotionProvider.getGestureMotion();

            // Update particles with orb position, gesture motion, and modifier
            this.particleSystem.update(deltaTime, orbX, orbY, gestureMotion, gestureProgress, particleModifier);

            // Get gesture transform from renderer (delegated to GestureMotionProvider)
            const gestureTransform = this.gestureMotionProvider.getGestureTransform();

            // Render all layers in order (delegated to RenderLayerOrchestrator)
            this.renderLayerOrchestrator.renderAllLayers({
                renderState, deltaTime, emotionParams, gestureTransform, renderStart
            });
        } catch (error) {
            this.errorBoundary.logError(error, 'main-render');
        }
    }

    /**
     * Renders debug information overlay
     * Delegates to DebugInfoRenderer
     * @param {number} _deltaTime - Time since last frame in milliseconds (unused but kept for API consistency)
     */
    renderDebugInfo(_deltaTime) {
        this.debugInfoRenderer.renderDebugInfo(_deltaTime);
    }

    /**
     * Gets the current emotional color
     * @returns {string} Hex color for current emotion
     */
    getEmotionalColor() {
        return this.emotionalStateQueryManager.getEmotionalColor();
    }

    /**
     * Gets the current emotional state information
     * @returns {Object} Current state with properties
     */
    getCurrentState() {
        return this.emotionalStateQueryManager.getCurrentState();
    }

    /**
     * Gets all available emotions
     * @returns {Array<string>} Array of emotion names
     */
    getAvailableEmotions() {
        return this.emotionalStateQueryManager.getAvailableEmotions();
    }

    /**
     * Gets all available undertones
     * @returns {Array<string>} Array of undertone names
     */
    getAvailableUndertones() {
        return this.emotionalStateQueryManager.getAvailableUndertones();
    }


    /**
     * Gets audio level processing statistics
     * @returns {Object} Audio processing statistics
     */
    getAudioStats() {
        return this.speechReactivityManager.getAudioStats();
    }

    /**
     * Updates audio level processor configuration
     * @param {Object} config - New configuration options
     */
    updateAudioConfig(config) {
        this.speechReactivityManager.updateAudioConfig(config);
    }

    /**
     * Gets all available gestures
     * @returns {Array<string>} Array of gesture names
     */
    getAvailableGestures() {
        return this.emotionalStateQueryManager.getAvailableGestures();
    }

    /**
     * Connects an audio source to the speech analyser
     * @param {AudioNode} audioSource - Web Audio API source node
     * @returns {EmotiveMascot} This instance for chaining
     */
    connectAudioSource(audioSource) {
        return this.speechReactivityManager.connectAudioSource(audioSource);
    }

    /**
     * Sets master volume for all audio output
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setVolume(volume) {
        return this.errorBoundary.wrap(() => {
            return this.audioHandler.setVolume(volume);
        }, 'volume-setting', this)();
    }

    /**
     * Gets current master volume
     * @returns {number} Current volume level (0.0 to 1.0)
     */
    getVolume() {
        return this.config.masterVolume;
    }

    /**
     * Enable or disable gesture sounds
     * @param {boolean} enabled - Whether to enable gesture sounds
     * @returns {EmotiveMascot} This instance for chaining
     */
    setSoundEnabled(enabled) {
        this.config.soundEnabled = enabled;
        return this;
    }

    /**
     * Check if gesture sounds are enabled
     * @returns {boolean} Whether gesture sounds are enabled
     */
    isSoundEnabled() {
        return this.config.soundEnabled;
    }

    /**
     * Pauses the animation loop (can be resumed with start())
     * @returns {EmotiveMascot} This instance for chaining
     */
    pause() {
        return this.executionLifecycleManager.pause();
    }

    /**
     * Resumes the animation loop from paused state
     * @returns {EmotiveMascot} This instance for chaining
     */
    resume() {
        return this.executionLifecycleManager.resume();
    }

    /**
     * Checks if the mascot is currently running
     * @returns {boolean} True if animation loop is active
     */
    isActive() {
        return this.executionLifecycleManager.isActive();
    }

    /**
     * Sets the target FPS for performance monitoring
     * @param {number} targetFPS - Target frames per second (default: 60)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setTargetFPS(targetFPS) {
        return this.performanceMonitoringManager.setTargetFPS(targetFPS);
    }

    /**
     * Gets the current target FPS
     * @returns {number} Target frames per second
     */
    getTargetFPS() {
        return this.performanceMonitoringManager.getTargetFPS();
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset for scaling (optional)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setPosition(x, y, z = 0) {
        return this.animationFrameController.setPosition(x, y, z);
    }

    /**
     * Animate mascot to position offset from viewport center
     * @param {number} x - Target X offset from center
     * @param {number} y - Target Y offset from center
     * @param {number} z - Target Z offset for scaling (optional)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name (optional)
     * @returns {EmotiveMascot} This instance for chaining
     */
    animateToPosition(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        return this.animationFrameController.animateToPosition(x, y, z, duration, easing);
    }

    /**
     * Clear all particles from the particle system
     * Useful when repositioning mascot to remove particles from old position
     * @returns {EmotiveMascot} This instance for chaining
     */
    clearParticles() {
        return this.visualTransformationManager.clearParticles();
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascot} This instance for chaining
     */
    setParticleSystemCanvasDimensions(width, height) {
        return this.visualTransformationManager.setParticleSystemCanvasDimensions(width, height);
    }

    /**
     * Forces performance degradation mode (for testing)
     * @param {boolean} enabled - Whether to enable degradation mode
     * @returns {EmotiveMascot} This instance for chaining
     */
    setPerformanceDegradation(enabled) {
        return this.performanceMonitoringManager.setPerformanceDegradation(enabled);
    }

    /**
     * Gets the current audio level (0-1) if speech reactivity is active
     * @returns {number} Current audio level or 0 if not speaking
     */
    getAudioLevel() {
        return this.speechReactivityManager.getAudioLevel();
    }

    /**
     * Checks if speech reactivity is currently active
     * @returns {boolean} True if speech monitoring is active
     */
    isSpeaking() {
        return this.speechReactivityManager.isSpeaking();
    }

    /**
     * Sets the audio analyser smoothing time constant
     * @param {number} smoothing - Smoothing value (0-1, default: 0.8)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setAudioSmoothing(smoothing) {
        return this.speechReactivityManager.setAudioSmoothing(smoothing);
    }

    /**
     * Gets comprehensive system status for debugging and monitoring
     * @returns {Object} Complete system status
     */
    getSystemStatus() {
        return this.healthCheckManager.getSystemStatus();
    }

    /**
     * Enables or disables debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     * @returns {EmotiveMascot} This instance for chaining
     */
    setDebugMode(enabled) {
        return this.healthCheckManager.setDebugMode(enabled);
    }

    /**
     * Triggers a manual error for testing error boundary
     * @param {string} context - Error context for testing
     * @returns {EmotiveMascot} This instance for chaining
     */
    triggerTestError(context = 'manual-test') {
        return this.healthCheckManager.triggerTestError(context);
    }

    /**
     * Gets current performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        return this.healthCheckManager.getPerformanceMetrics();
    }

    /**
     * Register a plugin
     * @param {Object} plugin - Plugin to register
     * @returns {Promise<boolean>} Success status
     */
    registerPlugin(plugin) {
        return this.pluginSystem.registerPlugin(plugin);
    }
    
    /**
     * Set accessibility options
     * @param {Object} options - Accessibility options
     */
    setAccessibility(options) {
        if (options.colorBlindMode) {
            this.accessibilityManager.setColorBlindMode(options.colorBlindMode);
        }
        if (options.reducedMotion !== undefined) {
            this.accessibilityManager.reducedMotionPreferred = options.reducedMotion;
        }
        if (options.highContrast !== undefined) {
            this.accessibilityManager.highContrastEnabled = options.highContrast;
        }
    }
    
    /**
     * Get mobile optimization status
     * @returns {Object} Mobile optimization status
     */
    getMobileStatus() {
        return this.healthCheckManager.getMobileStatus();
    }

    /**
     * Get accessibility status
     * @returns {Object} Accessibility status
     */
    getAccessibilityStatus() {
        return this.healthCheckManager.getAccessibilityStatus();
    }
    
    /**
     * Set the emotional state (alias for setEmotion for compatibility)
     * @param {string} newState - The emotion/state to set
     * @returns {EmotiveMascot} This instance for chaining
     */
    setState(newState) {
        return this.setEmotion(newState);
    }
    
    /**
     * Speak text using TTS with synchronized animation
     * @param {string} text - The text to speak
     * @param {Object} options - TTS options
     * @returns {SpeechSynthesisUtterance} The utterance object for additional control
     */
    speak(text, options = {}) {
        return this.ttsManager.speak(text, options);
    }

    /**
     * Set TTS speaking state (triggers visual animation)
     * @param {boolean} speaking - Whether TTS is speaking
     */
    setTTSSpeaking(speaking) {
        this.ttsManager.setTTSSpeaking(speaking);
    }

    /**
     * Get available TTS voices
     * @returns {Array} Array of available voices
     */
    getVoices() {
        return this.ttsManager.getVoices();
    }

    /**
     * Stop any ongoing TTS speech
     */
    stopTTS() {
        this.ttsManager.stopTTS();
    }
    
    /**
     * Handle canvas resize events to trigger visual resampling
     * This ensures visuals look crisp at any size
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     * @param {number} dpr - Device pixel ratio
     */
    handleResize(width, height, dpr) {
        this.visualTransformationManager.handleResize(width, height, dpr);
    }

    /**
     * Morph the core to a different shape
     * @param {string} shape - Target shape name (circle, heart, star, sun, moon, eclipse, square, triangle)
     * @param {Object} config - Morph configuration
     * @returns {EmotiveMascot} This instance for chaining
     */
    morphTo(shape, config = {}) {
        return this.visualTransformationManager.morphTo(shape, config);
    }
    
    /**
     * Connect audio element for vocal visualization
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     * @returns {EmotiveMascot} This instance for chaining
     */
    connectAudio(audioElement) {
        return this.errorBoundary.wrap(() => {
            return this.audioHandler.connectAudio(audioElement);
        }, 'connectAudio', this)();
    }
    
    /**
     * Disconnect audio analysis
     * @returns {EmotiveMascot} This instance for chaining
     */
    disconnectAudio() {
        return this.errorBoundary.wrap(() => {
            return this.audioHandler.disconnectAudio();
        }, 'disconnectAudio', this)();
    }
    
    /**
     * Set offset values for eccentric positioning
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} z - Z offset (for pseudo-3D scaling)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setOffset(x, y, z = 0) {
        return this.visualTransformationManager.setOffset(x, y, z);
    }

    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     */
    getOffset() {
        return this.visualTransformationManager.getOffset();
    }

    /**
     * Configure backdrop rendering
     * @param {Object} options - Backdrop configuration
     * @param {boolean} [options.enabled] - Enable/disable backdrop
     * @param {string} [options.type='radial-gradient'] - Type: 'radial-gradient', 'vignette', 'glow'
     * @param {number} [options.intensity=0.7] - Darkness/opacity (0-1)
     * @param {number} [options.radius=1.5] - Radius multiplier of mascot size
     * @param {string} [options.color='rgba(0, 0, 0, 0.6)'] - Base color
     * @param {boolean} [options.responsive=true] - React to audio/emotion
     * @returns {EmotiveMascot} This instance for chaining
     * @example
     * mascot.setBackdrop({ enabled: true, intensity: 0.8, radius: 2 });
     */
    setBackdrop(options = {}) {
        return this.visualTransformationManager.setBackdrop(options);
    }

    /**
     * Get current backdrop configuration
     * @returns {Object} Current backdrop config
     */
    getBackdrop() {
        return this.visualTransformationManager.getBackdrop();
    }

    /**
     * Animate to new offset values
     * @param {number} x - Target X offset
     * @param {number} y - Target Y offset
     * @param {number} z - Target Z offset
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - Easing function name
     * @returns {EmotiveMascot} This instance for chaining
     */
    animateOffset(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        return this.visualTransformationManager.animateOffset(x, y, z, duration, easing);
    }
    
    /**
     * Get available shapes for morphing
     * @returns {Array} List of available shape names
     */
    getAvailableShapes() {
        return this.emotionalStateQueryManager.getAvailableShapes();
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // LLM INTEGRATION API
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Handle an LLM response and automatically choreograph mascot reaction
     *
     * @param {Object} response - Structured LLM response
     * @param {string} response.message - Message content
     * @param {string} response.emotion - Emotion to express
     * @param {string} response.sentiment - Sentiment (positive/neutral/negative)
     * @param {string} response.action - Action context
     * @param {number} response.frustrationLevel - User frustration (0-100)
     * @param {string} [response.shape] - Optional shape to morph to
     * @param {string} [response.gesture] - Optional gesture to perform
     * @param {Object} options - Handler options
     * @returns {Promise<EmotiveMascot>} This instance for chaining
     *
     * @example
     * const llmResponse = {
     *   message: "I'd be happy to help!",
     *   emotion: 'joy',
     *   sentiment: 'positive',
     *   action: 'offer_help',
     *   frustrationLevel: 20,
     *   shape: 'heart',
     *   gesture: 'reach'
     * };
     * await mascot.handleLLMResponse(llmResponse);
     */
    // eslint-disable-next-line require-await
    async handleLLMResponse(response, options = {}) {
        return this.llmIntegrationBridge.handleLLMResponse(response, options);
    }

    /**
     * Configure LLM response handling behavior
     *
     * @param {Object} config - Handler configuration
     * @param {boolean} [config.autoMorphShapes] - Automatically morph shapes
     * @param {number} [config.morphDuration] - Shape morph duration (ms)
     * @param {boolean} [config.autoExpressGestures] - Automatically express gestures
     * @param {number} [config.gestureTiming] - Gesture delay (ms)
     * @param {number} [config.gestureIntensity] - Default gesture intensity (0-1)
     * @param {Object} [config.emotionToShapeMap] - Custom emotion→shape mappings
     * @param {Object} [config.actionToGestureMap] - Custom action→gesture mappings
     * @returns {EmotiveMascot} This instance for chaining
     *
     * @example
     * mascot.configureLLMHandler({
     *   emotionToShapeMap: {
     *     joy: 'sun',      // Override default
     *     empathy: 'moon'  // Custom mapping
     *   },
     *   gestureIntensity: 0.9
     * });
     */
    configureLLMHandler(config) {
        return this.llmIntegrationBridge.configureLLMHandler(config);
    }

    /**
     * Get the LLM response schema for validation
     * @returns {Object} Response schema
     */
    getLLMResponseSchema() {
        return this.llmIntegrationBridge.getLLMResponseSchema();
    }

    /**
     * Get system prompt template for LLM integration
     *
     * @param {Object} options - Prompt customization options
     * @param {string} [options.domain] - Domain context (e.g., 'retail checkout')
     * @param {string} [options.personality] - Mascot personality
     * @param {string} [options.brand] - Brand name
     * @returns {string} System prompt
     *
     * @example
     * const prompt = EmotiveMascot.getLLMPromptTemplate({
     *   domain: 'customer support',
     *   personality: 'friendly and professional',
     *   brand: 'Acme Corp'
     * });
     *
     * // Use with Claude, GPT, Gemini, etc.
     * const response = await llm.generate({
     *   system: prompt,
     *   message: userInput
     * });
     */
    static getLLMPromptTemplate(options = {}) {
        return LLMIntegrationBridge.getLLMPromptTemplate(options);
    }

    /**
     * Get available emotions for LLM responses
     * @returns {Array<string>} List of valid emotion names
     */
    static getLLMEmotions() {
        return LLMIntegrationBridge.getLLMEmotions();
    }

    /**
     * Get available actions for LLM responses
     * @returns {Array<string>} List of valid action names
     */
    static getLLMActions() {
        return LLMIntegrationBridge.getLLMActions();
    }

    /**
     * Get available shapes for LLM responses
     * @returns {Array<string>} List of valid shape names
     */
    static getLLMShapes() {
        return LLMIntegrationBridge.getLLMShapes();
    }

    /**
     * Get available gestures for LLM responses
     * @returns {Array<string>} List of valid gesture names
     */
    static getLLMGestures() {
        return LLMIntegrationBridge.getLLMGestures();
    }

    /**
     * Destroys the mascot instance and cleans up resources
     */
    destroy() {
        this.destructionManager.destroy();
    }
    
    /**
     * Throttled warning to reduce console spam
     * @param {string} message - Warning message
     * @param {string} key - Unique key for this warning type
     */
    throttledWarn(message, key) {
        const now = Date.now();
        const lastWarning = this.warningTimestamps[key] || 0;
        
        if (now - lastWarning > this.warningThrottle) {
            // Warning message throttled
            this.warningTimestamps[key] = now;
        }
    }
}

export default EmotiveMascot;