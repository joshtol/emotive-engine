/**
 * GestureController - Manages gesture animations and protocols
 * @module mascot/GestureController
 */

import { getGesture } from '../core/gestures/index.js';
import rhythmIntegration from '../core/rhythmIntegration.js';

export class GestureController {
    constructor(mascot) {
        this.mascot = mascot;
        this.currentGesture = null;
        this.gestureCompatibility = null;

        // Gesture mapping: maps gesture names to renderer method names
        this.rendererMethods = {
            'bounce': 'startBounce',
            'pulse': 'startPulse',
            'shake': 'startShake',
            'spin': 'startSpin',
            'nod': 'startNod',
            'tilt': 'startTilt',
            'expand': 'startExpand',
            'contract': 'startContract',
            'flash': 'startFlash',
            'drift': 'startDrift',
            'stretch': 'startStretch',
            'glow': 'startGlow',
            'sparkle': 'startSparkle',
            'shimmer': 'startShimmer',
            'wiggle': 'startWiggle',
            'groove': 'startGroove',
            'point': 'startPoint',
            'lean': 'startLean',
            'reach': 'startReach',
            'headBob': 'startHeadBob',
            'orbit': 'startOrbit',
            'flicker': 'startFlicker',
            'vibrate': 'startVibrate',
            'wave': 'startWave',
            'breathe': 'startBreathe',
            'morph': 'startMorph',
            'slowBlink': 'startSlowBlink',
            'look': 'startLook',
            'settle': 'startSettle',
            'orbital': 'startOrbital',  // Alias for backwards compatibility
            'hula': 'startHula',
            'sway': 'startSway',
            'breathIn': 'startBreathIn',
            'breathOut': 'startBreathOut',
            'breathHold': 'startBreathHold',
            'breathHoldEmpty': 'startBreathHoldEmpty',
            'jump': 'startJump',
            'rain': 'startRain',
            'runningman': 'startRunningMan',
            'charleston': 'startCharleston',
            // Ambient dance gestures
            'grooveSway': 'startGrooveSway',
            'grooveBob': 'startGrooveBob',
            'grooveFlow': 'startGrooveFlow',
            'groovePulse': 'startGroovePulse',
            'grooveStep': 'startGrooveStep',
            // Additional gestures for executeGestureDirectly
            'float': 'startFloat',
            'twist': 'startTwist'
        };
    }

    /**
     * Initialize gesture controller
     */
    init() {
        // Try to load GestureCompatibility if not already loaded
        if (!this.gestureCompatibility) {
            import('../core/GestureCompatibility.js').then(module => {
                this.gestureCompatibility = module.default;
            }).catch(err => {
                console.warn('GestureCompatibility not available:', err);
            });
        }
    }

    /**
     * Express a gesture or chord of gestures
     * @param {string|Array|Object} gesture - Gesture name, array of gestures (chord), or chord object
     * @param {Object} options - Gesture options
     * @returns {EmotiveMascot} The mascot instance for chaining
     */
    express(gesture, options = {}) {
        return this.mascot.errorBoundary.wrap(() => {
            // Check for no gesture first
            if (!gesture) {
                return this.mascot;
            }

            // Performance marker: Gesture start
            const gestureStartTime = performance.now();
            const gestureName = Array.isArray(gesture) ? 'chord' :
                (typeof gesture === 'object' && gesture.type === 'chord') ? 'chord' :
                    gesture;

            if (this.mascot.performanceMonitor) {
                this.mascot.performanceMonitor.markGestureStart(gestureName);
            }

            // Handle chord (multiple simultaneous gestures)
            if (Array.isArray(gesture)) {
                return this.expressChord(gesture, options);
            }

            // Handle chord object
            if (typeof gesture === 'object' && gesture.type === 'chord') {
                return this.expressChord(gesture.gestures, options);
            }

            // Express called with single gesture
            // In rhythm game mode, gestures will be triggered directly by gameplay
            // No queuing needed - immediate response to player actions

            // Check if this gesture has a direct renderer method
            const methodName = this.rendererMethods[gesture];
            if (methodName && this.mascot.renderer && this.mascot.renderer[methodName]) {
                // Call the renderer method directly
                this.mascot.renderer[methodName](options);

                // Play gesture sound effect if available and enabled
                if (this.mascot.config.soundEnabled && this.mascot.soundSystem.isAvailable()) {
                    this.mascot.soundSystem.playGestureSound(gesture);
                }

                // Performance marker: Gesture end
                if (this.mascot.performanceMonitor) {
                    const gestureEndTime = performance.now();
                    this.mascot.performanceMonitor.markGestureEnd(gestureName);
                    this.mascot.performanceMonitor.recordGestureTime(gestureName, gestureEndTime - gestureStartTime);
                }

                return this.mascot;
            }

            // Try to execute gesture through the particle system
            // This handles modular gestures from the gesture registry
            // Check if gesture exists in the gesture registry
            const gestureConfig = getGesture(gesture);

            if (gestureConfig) {
                // Register gesture's rhythm configuration
                rhythmIntegration.registerConfig('gesture', gesture, gestureConfig);

                // Store the current gesture info for the particle system to use
                this.mascot.currentModularGesture = {
                    type: gesture,
                    config: gestureConfig,
                    startTime: performance.now(),
                    duration: gestureConfig.defaultParams?.duration || 1000,
                    progress: 0
                };

                // Executed gesture through particle system

                // Play gesture sound effect if available and enabled
                if (this.mascot.config.soundEnabled && this.mascot.soundSystem.isAvailable()) {
                    this.mascot.soundSystem.playGestureSound(gesture);
                }

                // Performance marker: Gesture end
                if (this.mascot.performanceMonitor) {
                    const gestureEndTime = performance.now();
                    this.mascot.performanceMonitor.markGestureEnd(gestureName);
                    this.mascot.performanceMonitor.recordGestureTime(gestureName, gestureEndTime - gestureStartTime);
                }

                return this.mascot;
            }

            // Unknown gesture - throttled warning
            this.mascot.throttledWarn(`Unknown gesture: ${gesture}`, `gesture_${gesture}`);

            // Performance marker: Gesture end (failed)
            if (this.mascot.performanceMonitor) {
                this.mascot.performanceMonitor.markGestureEnd(gestureName);
            }

            return this.mascot;
        }, 'gesture-express', this.mascot)();
    }

    /**
     * Express multiple gestures simultaneously (chord)
     * @param {Array<string>} gestures - Array of gesture names to execute simultaneously
     * @param {Object} options - Gesture options
     * @returns {EmotiveMascot} The mascot instance for chaining
     */
    expressChord(gestures, options = {}) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!gestures || !Array.isArray(gestures) || gestures.length === 0) {
                return this.mascot;
            }

            // Import gesture compatibility if not loaded
            if (!this.gestureCompatibility) {
                // Try to load it dynamically
                import('../core/GestureCompatibility.js').then(module => {
                    this.gestureCompatibility = module.default;
                }).catch(err => {
                    console.warn('GestureCompatibility not available:', err);
                });
            }

            // Use compatibility system if available
            const compatibleGestures = this.gestureCompatibility ?
                this.gestureCompatibility.getCompatibleGestures(gestures) :
                gestures;

            // Execute all compatible gestures simultaneously
            compatibleGestures.forEach(gestureName => {
                const normalizedGesture = typeof gestureName === 'string' ?
                    gestureName : gestureName.gestureName;

                // Execute directly to ensure simultaneity
                this.executeGestureDirectly(normalizedGesture, options);
            });

            // Check for enhancing combination
            if (this.gestureCompatibility?.isEnhancingCombination?.(compatibleGestures)) {
                // Add extra visual flair
                this.mascot.renderer?.specialEffects?.addSparkle?.();
            }

            return this.mascot;
        }, 'gesture-chord', this.mascot)();
    }

    /**
     * Execute a gesture directly on the renderer (bypasses routing)
     * @param {string} gesture - Gesture name
     * @param {Object} options - Gesture options
     * @private
     */
    executeGestureDirectly(gesture, options = {}) {
        const methodName = this.rendererMethods[gesture];
        if (methodName && this.mascot.renderer && typeof this.mascot.renderer[methodName] === 'function') {
            this.mascot.renderer[methodName](options);
        }
    }

    /**
     * Chain gestures together in sequence
     * @param {...string} gestures - Gesture names to chain
     * @returns {EmotiveMascot} The mascot instance for chaining
     */
    chain(...gestures) {
        // Parse the chain using GestureCompatibility if available
        if (this.gestureCompatibility) {
            const chainString = gestures.join('>');
            const steps = this.gestureCompatibility.parseChain(chainString);

            // Execute all steps with proper timing
            this.executeChainSequence(steps);
        } else {
            console.warn('🔗 No gestureCompatibility available, falling back to first gesture');
            // Fallback: execute first gesture
            if (gestures.length > 0) {
                this.express(gestures[0]);
            }
        }
        return this.mascot;
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

            if (step.length === 1) {
                // Single gesture
                this.express(step[0]);
            } else {
                // Multiple simultaneous gestures
                this.expressChord(step);
            }

            currentStep++;

            // Schedule next step
            if (currentStep < steps.length) {
                setTimeout(executeStep, stepDuration);
            }
        };

        // Start the sequence
        executeStep();
    }

    /**
     * Cleanup
     */
    destroy() {
        this.currentGesture = null;
        this.gestureCompatibility = null;
    }
}
