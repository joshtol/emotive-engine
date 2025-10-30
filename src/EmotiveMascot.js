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

import CanvasManager from './core/CanvasManager.js';
import ErrorBoundary from './core/ErrorBoundary.js';
import EmotiveStateMachine from './core/EmotiveStateMachine.js';
import ParticleSystem from './core/ParticleSystem.js';
import EmotiveRenderer from './core/EmotiveRenderer.js';
import GazeTracker from './core/GazeTracker.js';
import IdleBehavior from './core/IdleBehavior.js';
import { getEmotionVisualParams, getEmotion } from './core/emotions/index.js';
import * as Emotions from './core/emotions/index.js';
import * as Gestures from './core/gestures/index.js';
import * as ParticleBehaviors from './core/particles/behaviors/index.js';
import PositionController from './utils/PositionController.js';
import { initSentry, addBreadcrumb } from './utils/sentry.js';
import { SoundSystem } from './core/SoundSystem.js';
import AnimationController from './core/AnimationController.js';
import AudioLevelProcessor from './core/AudioLevelProcessor.js';
import { EventManager } from './core/EventManager.js';
import AccessibilityManager from './core/AccessibilityManager.js';
import MobileOptimization from './core/MobileOptimization.js';
import PluginSystem from './core/PluginSystem.js';
import { browserCompatibility, CanvasContextRecovery } from './utils/browserCompatibility.js';
import { emotiveDebugger, runtimeCapabilities } from './utils/debugger.js';
import rhythmIntegration from './core/rhythmIntegration.js';
import ShapeMorpher from './core/ShapeMorpher.js';
import { AudioAnalyzer } from './core/AudioAnalyzer.js';
import gestureCompatibility from './core/GestureCompatibility.js';
import GrooveTemplates from './core/GrooveTemplates.js';

// Import modular handlers
import { AudioHandler } from './mascot/AudioHandler.js';
import { GestureController } from './mascot/GestureController.js';
import { StateCoordinator } from './mascot/StateCoordinator.js';
import { VisualizationRunner } from './mascot/VisualizationRunner.js';
import { ConfigurationManager } from './mascot/ConfigurationManager.js';
import { InitializationManager } from './mascot/InitializationManager.js';
import { RenderStateBuilder } from './mascot/RenderStateBuilder.js';
import { ThreatLevelCalculator } from './mascot/ThreatLevelCalculator.js';
import { ParticleConfigCalculator } from './mascot/ParticleConfigCalculator.js';
import { GestureMotionProvider } from './mascot/GestureMotionProvider.js';
import { RenderLayerOrchestrator } from './mascot/RenderLayerOrchestrator.js';

// Import Semantic Performance System
import { PerformanceSystem } from './core/PerformanceSystem.js';
import { ContextManager } from './core/ContextManager.js';
import { SequenceExecutor } from './core/SequenceExecutor.js';

// Import LLM Integration
import LLMResponseHandler from './core/LLMResponseHandler.js';
import { generateSystemPrompt } from './core/llm-templates.js';

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

        // Delegate initialization to InitializationManager
        const initManager = new InitializationManager(this, config);
        initManager.initialize();

        // Initialize render managers (after all components are initialized)
        this.renderStateBuilder = new RenderStateBuilder(this);
        this.threatLevelCalculator = new ThreatLevelCalculator(this);
        this.particleConfigCalculator = new ParticleConfigCalculator(this);
        this.gestureMotionProvider = new GestureMotionProvider(this);
        this.renderLayerOrchestrator = new RenderLayerOrchestrator(this);
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
        // Handle audio level updates
        this.audioLevelProcessor.onLevelUpdate(data => {
            // Update renderer with current audio level
            this.renderer.updateAudioLevel(data.level);
            
            // Emit audio level update event
            this.emit('audioLevelUpdate', {
                level: data.level,
                rawData: Array.from(data.rawData),
                timestamp: data.timestamp
            });
        });
        
        // Handle volume spikes for gesture triggering
        this.audioLevelProcessor.onVolumeSpike(spikeData => {
            // Trigger pulse gesture if not already active
            // Check if any particle has an active gesture
            const hasActiveGesture = this.particleSystem.particles.some(p => p.gestureProgress < 1);
            if (!hasActiveGesture) {
                // Execute pulse gesture through express method
                this.express('pulse');
                const success = true;
                
                if (success) {
                    // Emit volume spike event with gesture trigger info
                    this.emit('volumeSpike', {
                        ...spikeData,
                        gestureTriggered: true
                    });
                    
                    // Volume spike detected - triggered pulse gesture
                } else {
                    // Emit volume spike event without gesture trigger
                    this.emit('volumeSpike', {
                        ...spikeData,
                        gestureTriggered: false
                    });
                }
            }
        });
        
        // Handle audio processing errors
        this.audioLevelProcessor.onError(errorData => {
            // AudioLevelProcessor error
            this.emit('audioProcessingError', errorData);
        });
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
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.setBPM) {
                this.renderer.setBPM(bpm);
            }
            return this;
        }, 'bpm-update', this)();
    }

    /**
     * Set manual rotation speed for the shape
     * @param {number} speed - Rotation speed in degrees per frame (negative for reverse)
     * @note Speeds between -10 and 10 feel natural; higher values may cause motion blur.
     * @returns {EmotiveMascot} This instance for chaining
     */
    setRotationSpeed(speed) {
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.setRotationSpeed) {
                this.renderer.setRotationSpeed(speed);
            }
            return this;
        }, 'rotation-speed-update', this)();
    }

    /**
     * Set manual rotation angle directly (for scratching)
     * @param {number} angle - Rotation angle in degrees
     * @returns {EmotiveMascot} This instance for chaining
     */
    setRotationAngle(angle) {
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.setRotationAngle) {
                this.renderer.setRotationAngle(angle);
            }
            return this;
        }, 'rotation-angle-update', this)();
    }

    /**
     * Get the current position information
     * @returns {Object|null} Current position metadata or null if not available
     */
    getPosition() {
        return this.errorBoundary.wrap(() => {
            if (!this.positionController || typeof this.positionController.getPosition !== 'function') {
                return null;
            }

            const hasWindow = typeof window !== 'undefined';
            const centerX = hasWindow ? window.innerWidth / 2 : 0;
            const centerY = hasWindow ? window.innerHeight / 2 : 0;

            return this.positionController.getPosition(centerX, centerY);
        }, 'get-position', this)();
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
        return this.errorBoundary.wrap(async () => {
            if (!this.performanceSystem) {
                console.warn('[EmotiveMascot] PerformanceSystem not initialized');
                return this;
            }

            // Update context if provided
            if (options.context) {
                this.updateContext(options.context);
            }

            // Execute the performance
            await this.performanceSystem.perform(semanticAction, {
                ...options,
                mascot: this
            });

            return this;
        }, 'semantic-performance', this)();
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
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this;
            }

            this.contextManager.update(updates);
            return this;
        }, 'context-update', this)();
    }

    /**
     * Get current conversation context
     * @returns {Object} Current context state
     */
    getContext() {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                return null;
            }
            return this.contextManager.getContext();
        }, 'context-get', this)();
    }

    /**
     * Increment user frustration level
     * @param {number} amount - Amount to increment (default: 10)
     * @returns {EmotiveMascot} This instance for chaining
     */
    incrementFrustration(amount = 10) {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this;
            }

            this.contextManager.incrementFrustration(amount);
            return this;
        }, 'frustration-increment', this)();
    }

    /**
     * Decrement user frustration level
     * @param {number} amount - Amount to decrement (default: 10)
     * @returns {EmotiveMascot} This instance for chaining
     */
    decrementFrustration(amount = 10) {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this;
            }

            this.contextManager.decrementFrustration(amount);
            return this;
        }, 'frustration-decrement', this)();
    }

    /**
     * Reset user frustration to zero
     * @returns {EmotiveMascot} This instance for chaining
     */
    resetFrustration() {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this;
            }

            this.contextManager.resetFrustration();
            return this;
        }, 'frustration-reset', this)();
    }

    /**
     * Get all available performance names
     * @returns {Array<string>} Array of performance names
     */
    getAvailablePerformances() {
        return this.errorBoundary.wrap(() => {
            if (!this.performanceSystem) {
                return [];
            }
            return this.performanceSystem.getAllPerformanceNames();
        }, 'performances-list', this)();
    }

    /**
     * Register a custom performance
     * @param {string} name - Performance name
     * @param {Object} definition - Performance definition
     * @returns {EmotiveMascot} This instance for chaining
     */
    registerPerformance(name, definition) {
        return this.errorBoundary.wrap(() => {
            if (!this.performanceSystem) {
                console.warn('[EmotiveMascot] PerformanceSystem not initialized');
                return this;
            }

            this.performanceSystem.registerPerformance(name, definition);
            return this;
        }, 'performance-register', this)();
    }

    /**
     * Get performance analytics (if enabled)
     * @returns {Object|null} Performance analytics data
     */
    getPerformanceAnalytics() {
        return this.errorBoundary.wrap(() => {
            if (!this.performanceSystem) {
                return null;
            }
            return this.performanceSystem.getAnalytics();
        }, 'performance-analytics', this)();
    }

    /**
     * Get context analytics (if history is enabled)
     * @returns {Object|null} Context analytics data
     */
    getContextAnalytics() {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                return null;
            }
            return this.contextManager.getAnalytics();
        }, 'context-analytics', this)();
    }

    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Starts speech reactivity mode with audio level monitoring
     * @param {AudioContext} audioContext - Web Audio API context
     * @returns {EmotiveMascot} This instance for chaining
     */
    startSpeaking(audioContext) {
        return this.errorBoundary.wrap(() => {
            if (!audioContext) {
                throw new Error('AudioContext is required for speech reactivity');
            }
            
            if (!this.config.enableAudio) {
                // Audio is disabled, cannot start speech reactivity
                return this;
            }
            
            if (this.speaking) {
                // Speech reactivity is already active
                return this;
            }
            
            // Initialize audio level processor
            const success = this.audioLevelProcessor.initialize(audioContext);
            
            if (!success) {
                // Failed to initialize audio level processor
                return this;
            }
            
            // Update speech state
            this.speaking = true;
            
            // Notify renderer about speech start
            this.renderer.onSpeechStart(audioContext);
            
            // Emit speech start event with analyser for external connection
            this.emit('speechStarted', { 
                audioContext, 
                analyser: this.audioLevelProcessor.getAnalyser(),
                mascot: this
            });
            
            // Speech reactivity started - connect audio source to analyser
            return this;
        }, 'speech-start', this)();
    }

    /**
     * Stops speech reactivity mode and returns to base emotional state
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopSpeaking() {
        return this.errorBoundary.wrap(() => {
            return this.audioHandler.stopSpeaking();
        }, 'speech-stop', this)();
    }

    
    
    /**
     * Start recording state (listening/capturing mode)
     * @returns {EmotiveMascot} This instance for chaining
     */
    startRecording() {
        return this.errorBoundary.wrap(() => {
            if (this.recording) {
                // Already recording
                return this;
            }
            
            this.recording = true;
            
            // Update renderer if using Emotive style
            if (this.renderer && this.renderer.startRecording) {
                this.renderer.startRecording();
            }
            
            // Emit recording started event
            this.emit('recordingStarted');
            
            // Recording started
            return this;
        }, 'recording-start', this)();
    }
    
    /**
     * Stop recording state
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopRecording() {
        return this.errorBoundary.wrap(() => {
            if (!this.recording) {
                // Not currently recording
                return this;
            }
            
            this.recording = false;
            
            // Update renderer if using Emotive style
            if (this.renderer && this.renderer.stopRecording) {
                this.renderer.stopRecording();
            }
            
            // Emit recording stopped event
            this.emit('recordingStopped');
            
            // Recording stopped
            return this;
        }, 'recording-stop', this)();
    }
    
    /**
     * Enter sleep state with animation sequence
     * @returns {EmotiveMascot} This instance for chaining
     */
    sleep() {
        return this.errorBoundary.wrap(async () => {
            if (this.sleeping) {
                // Already sleeping
                return this;
            }
            
            // Sleep entry animation sequence
            // Starting sleep sequence...
            
            // First: Yawn
            this.express('yawn');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Second: Drowsy sway
            this.express('sway');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Now enter sleep state
            this.sleeping = true;
            
            // Update renderer if using Emotive style (handles eye closing)
            if (this.renderer && this.renderer.enterSleepMode) {
                this.renderer.enterSleepMode();
            }
            
            // Update idle behavior if available
            if (this.idleBehavior && this.idleBehavior.enterSleep) {
                this.idleBehavior.enterSleep();
            }
            
            // Emit sleep event
            this.emit('sleep');
            
            // Mascot entered sleep state
            return this;
        }, 'sleep', this)();
    }
    
    /**
     * Wake up from sleep state with animation sequence
     * @returns {EmotiveMascot} This instance for chaining
     */
    wake() {
        return this.errorBoundary.wrap(async () => {
            if (!this.sleeping) {
                // Not currently sleeping
                return this;
            }
            
            // Exit sleep state first
            this.sleeping = false;
            
            // Update renderer if using Emotive style (handles eye opening)
            if (this.renderer && this.renderer.wakeUp) {
                this.renderer.wakeUp();
            }
            
            // Update idle behavior if available
            if (this.idleBehavior && this.idleBehavior.wakeUp) {
                this.idleBehavior.wakeUp();
            }
            
            // Wake animation sequence
            // Starting wake sequence...
            
            // First: Stretch
            this.express('stretch');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Second: Slow blink
            this.express('slowBlink');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Third: Small shake to fully wake
            this.express('shake');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Emit wake event
            this.emit('wake');
            
            // Mascot fully awake
            return this;
        }, 'wake', this)();
    }
    
    /**
     * Gets available TTS voices
     * @returns {Array} Array of available voice objects
     */
    getTTSVoices() {
        if (!this.tts.available) {
            return [];
        }
        
        return window.speechSynthesis.getVoices();
    }
    
    /**
     * Checks if TTS is currently speaking
     * @returns {boolean} True if currently speaking
     */
    isTTSSpeaking() {
        return this.tts.speaking;
    }

    /**
     * Starts the animation loop at target 60 FPS
     * @returns {EmotiveMascot} This instance for chaining
     */
    start() {
        return this.errorBoundary.wrap(() => {
            return this.visualizationRunner.start();
        }, 'start', this)();
    }

    /**
     * Stops the animation loop and cleans up resources
     * @returns {EmotiveMascot} This instance for chaining
     */
    stop() {
        return this.errorBoundary.wrap(() => {
            return this.visualizationRunner.stop();
        }, 'stop', this)();
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
        return this.errorBoundary.wrap(() => {
            // Calculate total cycle time
            const totalCycle = inhale + hold1 + exhale + hold2;
            
            // Store pattern for custom animation
            this.breathePattern = {
                inhale,
                hold1,
                exhale,
                hold2,
                totalCycle,
                currentPhase: 'inhale',
                phaseStartTime: Date.now(),
                phaseProgress: 0
            };
            
            // Start custom breathing animation
            this.startBreathingAnimation();
            
            return this;
        }, 'setBreathePattern', this)();
    }
    
    /**
     * Directly sets the orb scale with animation
     * @param {number} scale - Target scale (1.0 = normal)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function ('linear', 'ease', 'easeIn', 'easeOut', 'easeInOut')
     * @returns {EmotiveMascot} This instance for chaining
     */
    setOrbScale(scale, duration = 1000, easing = 'easeInOut') {
        return this.errorBoundary.wrap(() => {
            if (this.renderer) {
                // Create scale animation
                const startScale = this.currentOrbScale || 1.0;
                const startTime = Date.now();
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Apply easing
                    let easedProgress = progress;
                    if (easing === 'easeIn') {
                        easedProgress = progress * progress;
                    } else if (easing === 'easeOut') {
                        easedProgress = progress * (2 - progress);
                    } else if (easing === 'easeInOut') {
                        easedProgress = progress < 0.5
                            ? 2 * progress * progress
                            : -1 + (4 - 2 * progress) * progress;
                    }
                    
                    // Calculate current scale
                    this.currentOrbScale = startScale + (scale - startScale) * easedProgress;
                    
                    // Apply to renderer
                    if (this.renderer.setCustomScale) {
                        this.renderer.setCustomScale(this.currentOrbScale);
                    }
                    
                    // Continue animation
                    if (progress < 1 && this.isRunning) {
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }
            
            return this;
        }, 'setOrbScale', this)();
    }
    
    /**
     * Applies a preset breathing pattern
     * @param {string} type - Preset type: 'calm', 'anxious', 'meditative', 'deep'
     * @returns {EmotiveMascot} This instance for chaining
     */
    breathe(type = 'calm') {
        return this.errorBoundary.wrap(() => {
            const presets = {
                calm: { inhale: 4, hold1: 0, exhale: 4, hold2: 0 },        // 4-4 breathing
                anxious: { inhale: 2, hold1: 0, exhale: 2, hold2: 0 },    // Quick shallow
                meditative: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, // 4-7-8 breathing
                deep: { inhale: 5, hold1: 5, exhale: 5, hold2: 5 },       // Box breathing
                sleep: { inhale: 6, hold1: 0, exhale: 8, hold2: 2 }       // Sleep breathing
            };
            
            const pattern = presets[type] || presets.calm;
            return this.setBreathePattern(pattern.inhale, pattern.hold1, pattern.exhale, pattern.hold2);
        }, 'breathe', this)();
    }
    
    /**
     * Starts the custom breathing animation
     * @private
     */
    startBreathingAnimation() {
        // Cancel any existing breathing animation
        if (this.breathingAnimationId) {
            cancelAnimationFrame(this.breathingAnimationId);
        }
        
        const animate = () => {
            if (!this.breathePattern || !this.isRunning) return;
            
            const pattern = this.breathePattern;
            const now = Date.now();
            const phaseElapsed = (now - pattern.phaseStartTime) / 1000; // Convert to seconds
            
            let scale = 1.0;
            let nextPhase = pattern.currentPhase;
            
            // Determine current phase and scale
            switch (pattern.currentPhase) {
            case 'inhale':
                if (phaseElapsed >= pattern.inhale) {
                    nextPhase = 'hold1';
                    pattern.phaseStartTime = now;
                    this.emit('hold-start', { type: 'post-inhale' });
                } else {
                    // Scale up during inhale
                    const progress = phaseElapsed / pattern.inhale;
                    scale = 1.0 + (0.3 * progress); // Expand to 1.3x
                }
                break;
                    
            case 'hold1':
                if (phaseElapsed >= pattern.hold1) {
                    nextPhase = 'exhale';
                    pattern.phaseStartTime = now;
                    this.emit('exhale-start');
                }
                scale = 1.3; // Stay expanded
                break;
                    
            case 'exhale':
                if (phaseElapsed >= pattern.exhale) {
                    nextPhase = 'hold2';
                    pattern.phaseStartTime = now;
                    this.emit('hold-start', { type: 'post-exhale' });
                } else {
                    // Scale down during exhale
                    const progress = phaseElapsed / pattern.exhale;
                    scale = 1.3 - (0.4 * progress); // Contract to 0.9x
                }
                break;
                    
            case 'hold2':
                if (phaseElapsed >= pattern.hold2) {
                    nextPhase = 'inhale';
                    pattern.phaseStartTime = now;
                    this.emit('inhale-start');
                }
                scale = 0.9; // Stay contracted
                break;
            }
            
            // Update phase
            if (nextPhase !== pattern.currentPhase) {
                pattern.currentPhase = nextPhase;
            }
            
            // Apply scale to renderer
            if (this.renderer && this.renderer.setCustomScale) {
                this.renderer.setCustomScale(scale);
            }
            
            // Continue animation
            this.breathingAnimationId = requestAnimationFrame(animate);
        };
        
        // Start with inhale
        this.breathePattern.currentPhase = 'inhale';
        this.breathePattern.phaseStartTime = Date.now();
        this.emit('inhale-start');
        animate();
    }
    
    /**
     * Stops any active breathing animation
     * @returns {EmotiveMascot} This instance for chaining
     */
    stopBreathing() {
        return this.errorBoundary.wrap(() => {
            if (this.breathingAnimationId) {
                cancelAnimationFrame(this.breathingAnimationId);
                this.breathingAnimationId = null;
            }
            
            this.breathePattern = null;
            
            // Reset scale
            if (this.renderer && this.renderer.setCustomScale) {
                this.renderer.setCustomScale(1.0);
            }
            
            return this;
        }, 'stopBreathing', this)();
    }
    
    /**
     * Adds an event listener for external integration hooks
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} This instance for chaining
     */
    on(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.on(event, callback);
            if (!success) {
                // Failed to add event listener
            }
            return this;
        }, 'event-listener-add', this)();
    }

    /**
     * Removes an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function to remove
     * @returns {EmotiveMascot} This instance for chaining
     */
    off(event, callback) {
        return this.errorBoundary.wrap(() => {
            this.eventManager.off(event, callback);
            return this;
        }, 'event-listener-remove', this)();
    }

    /**
     * Adds a one-time event listener that removes itself after first execution
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} This instance for chaining
     */
    once(event, callback) {
        return this.errorBoundary.wrap(() => {
            const success = this.eventManager.once(event, callback);
            if (!success) {
                // Failed to add once event listener
            }
            return this;
        }, 'event-listener-once', this)();
    }

    /**
     * Removes all listeners for a specific event or all events
     * @param {string|null} event - Event name to clear, or null to clear all
     * @returns {EmotiveMascot} This instance for chaining
     */
    removeAllListeners(event = null) {
        return this.errorBoundary.wrap(() => {
            const removedCount = this.eventManager.removeAllListeners(event);
            if (removedCount > 0) {
                // Cleared event listeners
            }
            return this;
        }, 'event-listeners-clear', this)();
    }

    /**
     * Gets the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.eventManager.listenerCount(event);
    }

    /**
     * Gets all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return this.eventManager.getEventNames();
    }

    /**
     * Gets comprehensive event system statistics
     * @returns {Object} Event system statistics and monitoring data
     */
    getEventStats() {
        return this.eventManager.getEventStats();
    }

    /**
     * Gets EventManager debugging information
     * @returns {Object} Debug information about the event system
     */
    getEventDebugInfo() {
        return this.eventManager.getDebugInfo();
    }

    /**
     * Gets browser compatibility information
     * @returns {Object} Browser compatibility details
     */
    getBrowserCompatibility() {
        return {
            browser: browserCompatibility.browser,
            features: browserCompatibility.featureDetection.getFeatures(),
            capabilities: browserCompatibility.capabilities,
            appliedPolyfills: browserCompatibility.appliedPolyfills,
            optimizations: browserCompatibility.browserOptimizations.getOptimizations()
        };
    }

    /**
     * Gets degradation manager status and settings
     * @returns {Object|null} Degradation manager information or null if disabled
     */
    getDegradationStatus() {
        if (!this.degradationManager) {
            return null;
        }
        
        return {
            currentLevel: this.degradationManager.getCurrentLevel(),
            availableFeatures: this.degradationManager.getAvailableFeatures(),
            recommendedSettings: this.degradationManager.getRecommendedSettings(),
            performanceStats: this.degradationManager.getPerformanceStats(),
            allLevels: this.degradationManager.getAllLevels()
        };
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Degradation level index or name
     * @returns {boolean} True if level was set successfully
     */
    setDegradationLevel(level) {
        if (!this.degradationManager) {
            // Degradation manager is not enabled
            return false;
        }
        
        return this.degradationManager.setLevel(level);
    }

    /**
     * Check if a specific feature is available in current degradation level
     * @param {string} feature - Feature name (audio, particles, fullEffects, etc.)
     * @returns {boolean} True if feature is available
     */
    isFeatureAvailable(feature) {
        if (!this.degradationManager) {
            // Fallback to basic feature detection
            const features = browserCompatibility.featureDetection.getFeatures();
            return features[feature] || false;
        }
        
        return this.degradationManager.isFeatureAvailable(feature);
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
        const report = {
            timestamp: Date.now(),
            mascot: {
                isRunning: this.isRunning,
                speaking: this.speaking,
                debugMode: this.debugMode,
                config: this.config
            },
            
            // System states
            currentState: this.getCurrentState(),
            performanceMetrics: this.getPerformanceMetrics(),
            audioStats: this.getAudioStats(),
            eventStats: this.getEventStats(),
            
            // Browser compatibility
            browserCompatibility: this.getBrowserCompatibility(),
            degradationStatus: this.getDegradationStatus(),
            
            // Runtime capabilities
            runtimeCapabilities: runtimeCapabilities.generateReport(),
            
            // Debugger data
            debuggerReport: emotiveDebugger.getDebugReport()
        };

        if (this.debugMode) {
            emotiveDebugger.log('DEBUG', 'Generated debug report', {
                reportSize: JSON.stringify(report).length,
                sections: Object.keys(report)
            });
        }

        return report;
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     */
    exportDebugData() {
        const data = {
            metadata: {
                exportTime: Date.now(),
                version: '1.0.0', // Should be dynamically set
                userAgent: navigator.userAgent,
                url: window.location?.href
            },
            
            mascotState: {
                config: this.config,
                currentState: this.getCurrentState(),
                isRunning: this.isRunning,
                speaking: this.speaking
            },
            
            performance: {
                metrics: this.getPerformanceMetrics(),
                degradationStatus: this.getDegradationStatus(),
                frameTimings: emotiveDebugger.frameTimings
            },
            
            compatibility: {
                browser: this.getBrowserCompatibility(),
                runtimeCapabilities: runtimeCapabilities.generateReport()
            },
            
            debuggerData: emotiveDebugger.exportDebugData()
        };

        if (this.debugMode) {
            emotiveDebugger.log('INFO', 'Exported debug data', {
                dataSize: JSON.stringify(data).length
            });
        }

        return data;
    }

    /**
     * Start profiling a named operation
     * @param {string} name - Profile name
     * @param {Object} metadata - Additional metadata
     */
    startProfiling(name, metadata = {}) {
        if (this.debugMode) {
            emotiveDebugger.startProfile(name, metadata);
        }
    }

    /**
     * End profiling and get results
     * @param {string} name - Profile name
     * @returns {Object|null} Profile results
     */
    endProfiling(name) {
        if (this.debugMode) {
            return emotiveDebugger.endProfile(name);
        }
        return null;
    }

    /**
     * Take a memory snapshot
     * @param {string} label - Snapshot label
     */
    takeMemorySnapshot(label) {
        if (this.debugMode) {
            emotiveDebugger.takeMemorySnapshot(label);
        }
    }

    /**
     * Clear all debug data
     */
    clearDebugData() {
        emotiveDebugger.clear();
        
        if (this.debugMode) {
            emotiveDebugger.log('INFO', 'Debug data cleared');
        }
    }

    /**
     * Get runtime performance capabilities
     * @returns {Object} Runtime capabilities report
     */
    getRuntimeCapabilities() {
        return runtimeCapabilities.generateReport();
    }

    /**
     * Emits an event to all registered listeners with error boundary protection
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        this.eventManager.emit(event, data);
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
     * @param {number} _deltaTime - Time since last frame in milliseconds (unused but kept for API consistency)
     */
    renderDebugInfo(_deltaTime) {
        const ctx = this.canvasManager.getContext();
        ctx.save();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        let y = 20;
        const lineHeight = 16;
        
        if (this.config.showFPS) {
            const metrics = this.animationController.getPerformanceMetrics();
            // Use smoothed FPS for stable display
            const fps = metrics.instantFps || metrics.fps || 0;
            const frameTime = metrics.averageFrameTime ? metrics.averageFrameTime.toFixed(1) : '0.0';
            const particleStats = this.particleSystem.getStats();
            
            // Build simple display
            const lines = [
                `FPS: ${fps}`,
                `Frame: ${frameTime}ms`,
                `Particles: ${particleStats.activeParticles}`
            ];
            
            // Draw each line
            const padding = 8;
            let maxWidth = 0;
            lines.forEach(line => {
                const {width} = ctx.measureText(line);
                if (width > maxWidth) maxWidth = width;
            });
            
            const x = this.canvasManager.width - maxWidth - padding - 10;
            
            // Background box with semi-transparent dark background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - padding, y - 14, maxWidth + padding * 2, 18 * lines.length + 4);
            
            // Border color based on FPS
            let borderColor;
            if (fps >= 55) {
                borderColor = '#00ff00';  // Green for good FPS
            } else if (fps >= 30) {
                borderColor = '#ffff00';  // Yellow for okay FPS
            } else {
                borderColor = '#ff0000';  // Red for poor FPS
            }
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x - padding, y - 14, maxWidth + padding * 2, 18 * lines.length + 4);
            
            // Draw each line of text
            lines.forEach((line, i) => {
                const lineY = y + (i * lineHeight);
                // No stroke for cleaner look
                ctx.fillStyle = '#ffffff';
                ctx.fillText(line, x, lineY);
            });
            
            y += lineHeight * lines.length;
        }
        
        if (this.config.showDebug) {
            const state = this.stateMachine.getCurrentState();
            const particleStats = this.particleSystem.getStats();
            
            const debugInfo = [
                `Emotion: ${state.emotion}${state.undertone ? ` (${state.undertone})` : ''}`,
                `Particles: ${particleStats.activeParticles}/${particleStats.maxParticles}`,
                `Gesture: ${this.currentModularGesture ? this.currentModularGesture.type : 'none'}`,
                `Speaking: ${this.speaking ? 'yes' : 'no'}`,
                `Audio Level: ${(this.audioLevel * 100).toFixed(1)}%`
            ];
            
            // Draw debug info with background for readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const debugWidth = Math.max(...debugInfo.map(line => ctx.measureText(line).width));
            ctx.fillRect(8, y - 14, debugWidth + 16, debugInfo.length * lineHeight + 4);
            
            ctx.fillStyle = '#ffffff';
            for (const info of debugInfo) {
                ctx.fillText(info, 10, y);
                y += lineHeight;
            }
        }
        
        ctx.restore();
    }

    /**
     * Gets the current emotional color
     * @returns {string} Hex color for current emotion
     */
    getEmotionalColor() {
        const properties = this.stateMachine.getCurrentEmotionalProperties();
        // Fallback to neutral gray if properties are undefined
        return properties?.primaryColor || '#B0B0B0';
    }

    /**
     * Gets the current emotional state information
     * @returns {Object} Current state with properties
     */
    getCurrentState() {
        return this.stateMachine.getCurrentState();
    }

    /**
     * Gets all available emotions
     * @returns {Array<string>} Array of emotion names
     */
    getAvailableEmotions() {
        return this.stateMachine.getAvailableEmotions();
    }

    /**
     * Gets all available undertones
     * @returns {Array<string>} Array of undertone names
     */
    getAvailableUndertones() {
        return this.stateMachine.getAvailableUndertones();
    }


    /**
     * Gets audio level processing statistics
     * @returns {Object} Audio processing statistics
     */
    getAudioStats() {
        return this.audioLevelProcessor.getStats();
    }

    /**
     * Updates audio level processor configuration
     * @param {Object} config - New configuration options
     */
    updateAudioConfig(config) {
        this.audioLevelProcessor.updateConfig(config);
    }

    /**
     * Gets all available gestures
     * @returns {Array<string>} Array of gesture names
     */
    getAvailableGestures() {
        return [
            'bounce', 'pulse', 'shake', 'spin', 'drift', 
            'nod', 'tilt', 'expand', 'contract', 'flash',
            'stretch', 'glow', 'flicker', 'vibrate', 'wave',
            'morph', 'slowBlink', 'look', 'settle',
            'breathIn', 'breathOut', 'breathHold', 'breathHoldEmpty', 'jump'
        ];
    }

    /**
     * Connects an audio source to the speech analyser
     * @param {AudioNode} audioSource - Web Audio API source node
     * @returns {EmotiveMascot} This instance for chaining
     */
    connectAudioSource(audioSource) {
        return this.errorBoundary.wrap(() => {
            if (!this.audioAnalyser) {
                // Speech reactivity not started. Call startSpeaking() first.
                return this;
            }
            
            if (!audioSource || typeof audioSource.connect !== 'function') {
                // Invalid audio source provided to connectAudioSource()
                return this;
            }
            
            // Connect the audio source to our analyser
            audioSource.connect(this.audioAnalyser);
            
            // Audio source connected to speech analyser
            this.emit('audioSourceConnected', { audioSource });
            
            return this;
        }, 'audio-source-connection', this)();
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
        return this.errorBoundary.wrap(() => {
            if (!this.animationController.isAnimating()) {
                // EmotiveMascot is not running
                return this;
            }
            
            // Stop animation controller
            this.animationController.stop();
            this.isRunning = false;
            
            // Pause ambient audio
            if (this.soundSystem.isAvailable()) {
                this.soundSystem.stopAmbientTone(200); // Quick fade out
            }
            
            this.emit('paused');
            // EmotiveMascot paused
            return this;
        }, 'pause', this)();
    }

    /**
     * Resumes the animation loop from paused state
     * @returns {EmotiveMascot} This instance for chaining
     */
    resume() {
        return this.errorBoundary.wrap(() => {
            if (this.animationController.isAnimating()) {
                // EmotiveMascot is already running
                return this;
            }
            
            // Start animation controller
            this.animationController.start();
            this.isRunning = true;
            
            // Resume ambient audio
            // Update ambient tone based on emotional state - DISABLED (annoying)
            // if (this.soundSystem.isAvailable()) {
            //     const currentEmotion = this.stateMachine.getCurrentState().emotion;
            //     this.soundSystem.setAmbientTone(currentEmotion, 200);
            // }
            
            this.emit('resumed');
            // EmotiveMascot resumed
            return this;
        }, 'resume', this)();
    }

    /**
     * Checks if the mascot is currently running
     * @returns {boolean} True if animation loop is active
     */
    isActive() {
        return this.animationController.isAnimating();
    }

    /**
     * Sets the target FPS for performance monitoring
     * @param {number} targetFPS - Target frames per second (default: 60)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setTargetFPS(targetFPS) {
        const clampedFPS = Math.max(15, Math.min(120, targetFPS)); // Clamp between 15-120 FPS
        this.config.targetFPS = clampedFPS;
        this.animationController.setTargetFPS(clampedFPS);
        
        // Target FPS set
        this.emit('targetFPSChanged', { targetFPS: clampedFPS });
        
        return this;
    }

    /**
     * Gets the current target FPS
     * @returns {number} Target frames per second
     */
    getTargetFPS() {
        return this.animationController.targetFPS;
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset for scaling (optional)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setPosition(x, y, z = 0) {
        if (this.positionController) {
            // Ensure onUpdate callback exists
            if (!this.positionController.onUpdate) {
                this.positionController.onUpdate = () => {};
            }
            this.positionController.setOffset(x, y, z);
        }
        return this;
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
        if (this.positionController) {
            // Ensure onUpdate callback exists
            if (!this.positionController.onUpdate) {
                this.positionController.onUpdate = () => {};
            }
            this.positionController.animateOffset(x, y, z, duration, easing);
        }
        return this;
    }

    /**
     * Clear all particles from the particle system
     * Useful when repositioning mascot to remove particles from old position
     * @returns {EmotiveMascot} This instance for chaining
     */
    clearParticles() {
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        return this;
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascot} This instance for chaining
     */
    setParticleSystemCanvasDimensions(width, height) {
        if (this.particleSystem) {
            this.particleSystem.canvasWidth = width;
            this.particleSystem.canvasHeight = height;
        }
        return this;
    }

    /**
     * Forces performance degradation mode (for testing)
     * @param {boolean} enabled - Whether to enable degradation mode
     * @returns {EmotiveMascot} This instance for chaining
     */
    setPerformanceDegradation(enabled) {
        const metrics = this.animationController.getPerformanceMetrics();
        
        if (enabled && !metrics.performanceDegradation) {
            const currentMax = this.particleSystem.maxParticles;
            const newMax = Math.max(5, Math.floor(currentMax * 0.5));
            this.particleSystem.setMaxParticles(newMax);
            
            // Forced performance degradation
        } else if (!enabled && metrics.performanceDegradation) {
            this.particleSystem.setMaxParticles(this.config.maxParticles);
            
            // Disabled performance degradation
        }
        
        return this;
    }

    /**
     * Gets the current audio level (0-1) if speech reactivity is active
     * @returns {number} Current audio level or 0 if not speaking
     */
    getAudioLevel() {
        return this.speaking ? this.audioLevel : 0;
    }

    /**
     * Checks if speech reactivity is currently active
     * @returns {boolean} True if speech monitoring is active
     */
    isSpeaking() {
        return this.speaking;
    }

    /**
     * Sets the audio analyser smoothing time constant
     * @param {number} smoothing - Smoothing value (0-1, default: 0.8)
     * @returns {EmotiveMascot} This instance for chaining
     */
    setAudioSmoothing(smoothing) {
        return this.errorBoundary.wrap(() => {
            const clampedSmoothing = Math.max(0, Math.min(1, smoothing));
            
            if (this.audioAnalyser) {
                this.audioAnalyser.smoothingTimeConstant = clampedSmoothing;
                // Audio smoothing set
            } else {
                // No audio analyser available. Start speech reactivity first.
            }
            
            return this;
        }, 'audio-smoothing', this)();
    }

    /**
     * Gets comprehensive system status for debugging and monitoring
     * @returns {Object} Complete system status
     */
    getSystemStatus() {
        return this.errorBoundary.wrap(() => {
            const state = this.stateMachine.getCurrentState();
            const particleStats = this.particleSystem.getStats();
            const rendererStats = this.renderer.getStats();
            
            const animationMetrics = this.animationController.getPerformanceMetrics();
            
            return {
                // Core status
                isRunning: animationMetrics.isRunning,
                fps: animationMetrics.fps,
                targetFPS: animationMetrics.targetFPS,
                performanceDegradation: animationMetrics.performanceDegradation,
                
                // Emotional state
                emotion: state.emotion,
                undertone: state.undertone,
                isTransitioning: state.isTransitioning,
                transitionProgress: state.transitionProgress,
                
                // Gesture system
                currentGesture: this.renderer?.currentGesture || null,
                gestureActive: this.renderer?.isGestureActive() || false,
                
                // Particle system
                particles: {
                    active: particleStats.activeParticles,
                    max: particleStats.maxParticles,
                    poolEfficiency: particleStats.poolEfficiency
                },
                
                // Audio system
                audioEnabled: this.config.enableAudio,
                soundSystemAvailable: this.soundSystem.isAvailable(),
                speaking: this.speaking,
                audioLevel: this.audioLevel,
                masterVolume: this.config.masterVolume,
                
                // Renderer
                renderer: {
                    gradientCacheSize: rendererStats.gradientCacheSize,
                    breathingPhase: rendererStats.breathingPhase,
                    layers: rendererStats.layers
                },
                
                // Event system
                eventListeners: this.getEventNames().length,
                
                // Error boundary
                errorStats: this.errorBoundary.getErrorStats()
            };
        }, 'system-status', {})();
    }

    /**
     * Enables or disables debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     * @returns {EmotiveMascot} This instance for chaining
     */
    setDebugMode(enabled) {
        this.config.showDebug = !!enabled;
        this.config.showFPS = !!enabled;
        
        if (enabled) {
            // Debug mode enabled - performance and state info will be displayed
        } else {
            // Debug mode disabled
        }
        
        return this;
    }

    /**
     * Triggers a manual error for testing error boundary
     * @param {string} context - Error context for testing
     * @returns {EmotiveMascot} This instance for chaining
     */
    triggerTestError(context = 'manual-test') {
        return this.errorBoundary.wrap(() => {
            throw new Error(`Test error triggered in context: ${context}`);
        }, context, this)();
    }

    /**
     * Gets current performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        const animationMetrics = this.animationController.getPerformanceMetrics();
        const state = this.stateMachine.getCurrentState();
        
        return {
            ...animationMetrics,
            currentEmotion: state.emotion,
            currentUndertone: state.undertone,
            isTransitioning: state.isTransitioning,
            errorStats: this.errorBoundary.getErrorStats()
        };
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
        return this.mobileOptimization.getStatus();
    }
    
    /**
     * Get accessibility status
     * @returns {Object} Accessibility status
     */
    getAccessibilityStatus() {
        return this.accessibilityManager.getStatus();
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
        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
            // Speech synthesis not available in this browser
            return null;
        }
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply options
        if (options.voice) utterance.voice = options.voice;
        if (options.rate) utterance.rate = options.rate;
        if (options.pitch) utterance.pitch = options.pitch;
        if (options.volume) utterance.volume = options.volume;
        if (options.lang) utterance.lang = options.lang;
        
        // Set up event handlers for animation sync
        utterance.onstart = () => {
            // TTS: Starting speech
            this.setTTSSpeaking(true);
            this.emit('tts:start', { text });
        };
        
        utterance.onend = () => {
            // TTS: Speech ended
            this.setTTSSpeaking(false);
            this.emit('tts:end');
        };
        
        utterance.onerror = event => {
            // TTS: Speech error
            this.setTTSSpeaking(false);
            this.emit('tts:error', { error: event });
        };
        
        utterance.onboundary = event => {
            // Word/sentence boundaries for potential lip-sync
            this.emit('tts:boundary', { 
                name: event.name,
                charIndex: event.charIndex,
                charLength: event.charLength
            });
        };
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        
        return utterance;
    }
    
    /**
     * Set TTS speaking state (triggers visual animation)
     * @param {boolean} speaking - Whether TTS is speaking
     */
    setTTSSpeaking(speaking) {
        this.ttsSpeaking = speaking;
        
        // Update renderer if using Emotive style
        if (this.renderer && this.renderer.startSpeaking) {
            if (speaking) {
                this.renderer.startSpeaking();
            } else {
                this.renderer.stopSpeaking();
            }
        }
        
        // Also update the speaking flag for compatibility
        this.speaking = speaking;
    }
    
    /**
     * Get available TTS voices
     * @returns {Array} Array of available voices
     */
    getVoices() {
        if (!window.speechSynthesis) {
            return [];
        }
        return window.speechSynthesis.getVoices();
    }
    
    /**
     * Stop any ongoing TTS speech
     */
    stopTTS() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.setTTSSpeaking(false);
        }
    }
    
    /**
     * Handle canvas resize events to trigger visual resampling
     * This ensures visuals look crisp at any size
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     * @param {number} dpr - Device pixel ratio
     */
    handleResize(width, height, dpr) {
        // EmotiveMascot handleResize
        
        // Force a re-initialization of the offscreen canvas in renderer
        if (this.renderer && this.renderer.initOffscreenCanvas) {
            this.renderer.initOffscreenCanvas();
        }
        
        // Trigger a state update to recalculate all visual parameters
        if (this.stateMachine) {
            const {currentEmotion} = this.stateMachine;
            const {currentUndertone} = this.stateMachine;
            
            // Re-apply current emotion to trigger fresh calculations
            if (currentEmotion) {
                this.stateMachine.setEmotion(currentEmotion);
            }
            
            // Re-apply current undertone if any
            if (currentUndertone && currentUndertone !== 'none') {
                this.stateMachine.setUndertone(currentUndertone);
            }
        }
        
        // Emit resize event for any listeners
        this.emit('resize', { width, height, dpr });
    }
    
    /**
     * Morph the core to a different shape
     * @param {string} shape - Target shape name (circle, heart, star, sun, moon, eclipse, square, triangle)
     * @param {Object} config - Morph configuration
     * @returns {EmotiveMascot} This instance for chaining
     */
    morphTo(shape, config = {}) {
        return this.errorBoundary.wrap(() => {
            if (!this.shapeMorpher) {
                // ShapeMorpher not initialized
                return this;
            }
            
            // Start the morph
            this.shapeMorpher.morphTo(shape, config);
            
            // Pass shape morpher to renderer
            if (this.renderer) {
                this.renderer.shapeMorpher = this.shapeMorpher;
            }
            
            // Emit event
            this.emit('shapeMorphStarted', { from: this.shapeMorpher.currentShape, to: shape });
            
            // Morphing to new shape
            return this;
        }, 'morphTo', this)();
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
        return this.errorBoundary.wrap(() => {
            this.positionController.setOffset(x, y, z);
            return this;
        }, 'offset-setting', this)();
    }
    
    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     */
    getOffset() {
        return this.errorBoundary.wrap(() => {
            return this.positionController.getOffset();
        }, 'offset-getting', this)();
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
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.backdropRenderer) {
                this.renderer.backdropRenderer.setConfig(options);
            }
            return this;
        }, 'setBackdrop', this)();
    }

    /**
     * Get current backdrop configuration
     * @returns {Object} Current backdrop config
     */
    getBackdrop() {
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.backdropRenderer) {
                return this.renderer.backdropRenderer.getConfig();
            }
            return null;
        }, 'getBackdrop', this)();
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
        return this.errorBoundary.wrap(() => {
            this.positionController.animateOffset(x, y, z, duration, easing);
            return this;
        }, 'offset-animation', this)();
    }
    
    /**
     * Get available shapes for morphing
     * @returns {Array} List of available shape names
     */
    getAvailableShapes() {
        return ShapeMorpher.getAvailableShapes();
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
        return this.errorBoundary.wrap(async () => {
            // Lazy-initialize LLM handler
            if (!this.llmHandler) {
                this.llmHandler = new LLMResponseHandler(this, options);
            }

            // Process the response
            await this.llmHandler.handle(response, options);

            return this;
        }, 'handleLLMResponse', this)();
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
        return this.errorBoundary.wrap(() => {
            if (!this.llmHandler) {
                this.llmHandler = new LLMResponseHandler(this, config);
            } else {
                this.llmHandler.configure(config);
            }
            return this;
        }, 'configureLLMHandler', this)();
    }

    /**
     * Get the LLM response schema for validation
     * @returns {Object} Response schema
     */
    getLLMResponseSchema() {
        if (!this.llmHandler) {
            this.llmHandler = new LLMResponseHandler(this);
        }
        return this.llmHandler.getSchema();
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
        return generateSystemPrompt(options);
    }

    /**
     * Get available emotions for LLM responses
     * @returns {Array<string>} List of valid emotion names
     */
    static getLLMEmotions() {
        return LLMResponseHandler.getAvailableEmotions();
    }

    /**
     * Get available actions for LLM responses
     * @returns {Array<string>} List of valid action names
     */
    static getLLMActions() {
        return LLMResponseHandler.getAvailableActions();
    }

    /**
     * Get available shapes for LLM responses
     * @returns {Array<string>} List of valid shape names
     */
    static getLLMShapes() {
        return LLMResponseHandler.getAvailableShapes();
    }

    /**
     * Get available gestures for LLM responses
     * @returns {Array<string>} List of valid gesture names
     */
    static getLLMGestures() {
        return LLMResponseHandler.getAvailableGestures();
    }

    /**
     * Destroys the mascot instance and cleans up resources
     */
    destroy() {
        this.errorBoundary.wrap(() => {
            // Stop animation
            this.stop();
            
            // Stop speech reactivity
            if (this.speaking) {
                this.stopSpeaking();
            }
            
            // Destroy animation controller
            if (this.animationController) {
                this.animationController.destroy();
            }
            
            // Destroy position controller
            if (this.positionController) {
                this.positionController.destroy();
            }
            
            // Clean up all subsystems
            if (this.soundSystem) {
                this.soundSystem.cleanup();
            }
            
            if (this.audioLevelProcessor) {
                this.audioLevelProcessor.cleanup();
            }
            
            if (this.particleSystem) {
                this.particleSystem.destroy();
            }
            
            if (this.renderer) {
                // Stop all active gestures
                this.renderer.stopAllGestures();
                this.renderer.destroy();
            }
            
            if (this.canvasManager) {
                this.canvasManager.destroy();
            }
            
            // Clear event listeners
            if (this.eventManager) {
                this.eventManager.destroy();
            }

            // Clean up LLM handler
            if (this.llmHandler) {
                this.llmHandler = null;
            }

            // Destroy new systems
            if (this.accessibilityManager) {
                this.accessibilityManager.destroy();
            }
            
            if (this.mobileOptimization) {
                this.mobileOptimization.destroy();
            }
            
            if (this.pluginSystem) {
                this.pluginSystem.destroy();
            }
            
            // Clean up shape morpher and audio analyzer
            if (this.audioAnalyzer) {
                this.disconnectAudio();
                this.audioAnalyzer.destroy();
            }
            
            if (this.shapeMorpher) {
                this.shapeMorpher.reset();
            }
            
            // DegradationManager removed
            
            // Clear error boundary
            this.errorBoundary.clearErrors();
            
            // EmotiveMascot destroyed
        }, 'destruction')();
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