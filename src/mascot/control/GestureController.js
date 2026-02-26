/**
 * GestureController - Manages gesture animations and protocols
 * @module mascot/GestureController
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Modify this when adding gesture features or changing execution logic
 */

import { getGesture } from '../../core/gestures/index.js';
import rhythmIntegration from '../../core/audio/rhythmIntegration.js';

export class GestureController {
    /**
     * Create GestureController
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} [deps.performanceMonitor] - Performance monitor instance
     * @param {Object} [deps.soundSystem] - Sound system instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} deps.state - Shared state with currentModularGesture property
     * @param {Function} deps.throttledWarn - Throttled warning function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('GestureController: errorBoundary required');
        if (!deps.config) throw new Error('GestureController: config required');
        if (!deps.state) throw new Error('GestureController: state required');
        if (!deps.throttledWarn) throw new Error('GestureController: throttledWarn required');

        this.errorBoundary = deps.errorBoundary;
        this.renderer = deps.renderer || null;
        this.performanceMonitor = deps.performanceMonitor || null;
        this.soundSystem = deps.soundSystem || null;
        this.config = deps.config;
        this._state = deps.state;
        this._throttledWarn = deps.throttledWarn;
        this._chainTarget = deps.chainTarget || this;

        this.currentGesture = null;
        this.gestureCompatibility = null;

        // Gesture mapping: maps gesture names to renderer method names
        this.rendererMethods = {
            bounce: 'startBounce',
            pulse: 'startPulse',
            shake: 'startShake',
            spin: 'startSpin',
            nod: 'startNod',
            tilt: 'startTilt',
            expand: 'startExpand',
            contract: 'startContract',
            flash: 'startFlash',
            drift: 'startDrift',
            stretch: 'startStretch',
            glow: 'startGlow',
            sparkle: 'startSparkle',
            shimmer: 'startShimmer',
            wiggle: 'startWiggle',
            groove: 'startGroove',
            point: 'startPoint',
            lean: 'startLean',
            reach: 'startReach',
            headBob: 'startHeadBob',
            orbit: 'startOrbit',
            flicker: 'startFlicker',
            vibrate: 'startVibrate',
            wave: 'startWave',
            breathe: 'startBreathe',
            morph: 'startMorph',
            slowBlink: 'startSlowBlink',
            look: 'startLook',
            settle: 'startSettle',
            orbital: 'startOrbital', // Alias for backwards compatibility
            hula: 'startHula',
            sway: 'startSway',
            breathIn: 'startBreathIn',
            breathOut: 'startBreathOut',
            breathHold: 'startBreathHold',
            breathHoldEmpty: 'startBreathHoldEmpty',
            jump: 'startJump',
            rain: 'startRain',
            runningman: 'startRunningMan',
            charleston: 'startCharleston',
            // Ambient dance gestures
            grooveSway: 'startGrooveSway',
            grooveBob: 'startGrooveBob',
            grooveFlow: 'startGrooveFlow',
            groovePulse: 'startGroovePulse',
            grooveStep: 'startGrooveStep',
            // Additional gestures for executeGestureDirectly
            float: 'startFloat',
            twist: 'startTwist',
        };
    }

    /**
     * Initialize gesture controller
     */
    init() {
        // Try to load GestureCompatibility if not already loaded
        if (!this.gestureCompatibility) {
            import('../../core/GestureCompatibility.js')
                .then(module => {
                    this.gestureCompatibility = module.default;
                })
                .catch(err => {
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
        return this.errorBoundary.wrap(
            () => {
                // Check for no gesture first
                if (!gesture) {
                    return this._chainTarget;
                }

                // Performance marker: Gesture start
                const gestureStartTime = performance.now();
                const gestureName = Array.isArray(gesture)
                    ? 'chord'
                    : typeof gesture === 'object' && gesture.type === 'chord'
                      ? 'chord'
                      : gesture;

                if (this.performanceMonitor) {
                    this.performanceMonitor.markGestureStart(gestureName);
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
                if (methodName && this.renderer && this.renderer[methodName]) {
                    // Call the renderer method directly
                    this.renderer[methodName](options);

                    // Play gesture sound effect if available and enabled
                    if (
                        this.config.soundEnabled &&
                        this.soundSystem &&
                        this.soundSystem.isAvailable()
                    ) {
                        this.soundSystem.playGestureSound(gesture);
                    }

                    // Performance marker: Gesture end
                    if (this.performanceMonitor) {
                        const gestureEndTime = performance.now();
                        this.performanceMonitor.markGestureEnd(gestureName);
                        this.performanceMonitor.recordGestureTime(
                            gestureName,
                            gestureEndTime - gestureStartTime
                        );
                    }

                    return this._chainTarget;
                }

                // Try to execute gesture through the particle system
                // This handles modular gestures from the gesture registry
                // Check if gesture exists in the gesture registry
                const gestureConfig = getGesture(gesture);

                if (gestureConfig) {
                    // Register gesture's rhythm configuration
                    rhythmIntegration.registerConfig('gesture', gesture, gestureConfig);

                    // Store the current gesture info for the particle system to use
                    this._state.currentModularGesture = {
                        type: gesture,
                        config: gestureConfig,
                        startTime: performance.now(),
                        duration: gestureConfig.defaultParams?.duration || 1000,
                        progress: 0,
                    };

                    // Executed gesture through particle system

                    // Play gesture sound effect if available and enabled
                    if (
                        this.config.soundEnabled &&
                        this.soundSystem &&
                        this.soundSystem.isAvailable()
                    ) {
                        this.soundSystem.playGestureSound(gesture);
                    }

                    // Performance marker: Gesture end
                    if (this.performanceMonitor) {
                        const gestureEndTime = performance.now();
                        this.performanceMonitor.markGestureEnd(gestureName);
                        this.performanceMonitor.recordGestureTime(
                            gestureName,
                            gestureEndTime - gestureStartTime
                        );
                    }

                    return this._chainTarget;
                }

                // Unknown gesture - throttled warning
                this._throttledWarn(`Unknown gesture: ${gesture}`, `gesture_${gesture}`);

                // Performance marker: Gesture end (failed)
                if (this.performanceMonitor) {
                    this.performanceMonitor.markGestureEnd(gestureName);
                }

                return this._chainTarget;
            },
            'gesture-express',
            this._chainTarget
        )();
    }

    /**
     * Express multiple gestures simultaneously (chord)
     * @param {Array<string>} gestures - Array of gesture names to execute simultaneously
     * @param {Object} options - Gesture options
     * @returns {EmotiveMascot} The mascot instance for chaining
     */
    expressChord(gestures, options = {}) {
        return this.errorBoundary.wrap(
            () => {
                if (!gestures || !Array.isArray(gestures) || gestures.length === 0) {
                    return this._chainTarget;
                }

                // Import gesture compatibility if not loaded
                if (!this.gestureCompatibility) {
                    // Try to load it dynamically
                    import('../../core/GestureCompatibility.js')
                        .then(module => {
                            this.gestureCompatibility = module.default;
                        })
                        .catch(err => {
                            console.warn('GestureCompatibility not available:', err);
                        });
                }

                // Use compatibility system if available
                const compatibleGestures = this.gestureCompatibility
                    ? this.gestureCompatibility.getCompatibleGestures(gestures)
                    : gestures;

                // Execute all compatible gestures simultaneously
                compatibleGestures.forEach(gestureName => {
                    const normalizedGesture =
                        typeof gestureName === 'string' ? gestureName : gestureName.gestureName;

                    // Execute directly to ensure simultaneity
                    this.executeGestureDirectly(normalizedGesture, options);
                });

                // Check for enhancing combination
                if (this.gestureCompatibility?.isEnhancingCombination?.(compatibleGestures)) {
                    // Add extra visual flair
                    this.renderer?.specialEffects?.addSparkle?.();
                }

                return this._chainTarget;
            },
            'gesture-chord',
            this._chainTarget
        )();
    }

    /**
     * Execute a gesture directly on the renderer (bypasses routing)
     * @param {string} gesture - Gesture name
     * @param {Object} options - Gesture options
     * @private
     */
    executeGestureDirectly(gesture, options = {}) {
        const methodName = this.rendererMethods[gesture];
        if (methodName && this.renderer && typeof this.renderer[methodName] === 'function') {
            this.renderer[methodName](options);
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
        return this._chainTarget;
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
