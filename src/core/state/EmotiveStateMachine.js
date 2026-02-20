/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                     ◐ ◑ ◒ ◓  STATE MACHINE CORE  ◓ ◒ ◑ ◐                     
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotive State Machine - Emotional State & Transition Management
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module EmotiveStateMachine
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The BRAIN of the Emotive Engine. Manages emotional states, transitions,           
 * ║ undertones, and gesture queues. This is where emotions become behavior.           
 * ║ Works with emotionMap.js for visuals but defines the LOGIC and TIMING.           
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🧠 CORE RESPONSIBILITIES                                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Emotional state management (current, target, transitions)                       
 * │ • Undertone layering (nervous + happy, tired + angry, etc.)                      
 * │ • Gesture queue processing (sequential animation management)                      
 * │ • Smooth property interpolation during transitions                                
 * │ • Event emission for state changes                                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚠️  CRITICAL STATE PROPERTIES                                                     
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • emotion      : Current emotional state (must be valid emotion)                  
 * │ • undertone    : Optional modifier (null or valid undertone)                      
 * │ • gesture      : Currently playing gesture animation
 * │ • transitions  : Active transition data (progress, timing, easing)
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 TRANSITION SYSTEM                                                              
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Smooth blending between emotional states                                        
 * │ • Configurable transition duration (default 500ms)                                
 * │ • Easing functions for natural motion                                             
 * │ • Property interpolation (colors, sizes, speeds)                                  
 * │ • Prevents jarring visual changes                                                 
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT MODIFY WITHOUT UNDERSTANDING                                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ State validation logic    → Breaks error handling                              
 * │ ✗ Transition timing        → Causes visual glitches                              
 * │ ✗ Event emission order     → Breaks dependent systems                            
 * │ ✗ Property interpolation   → Creates animation artifacts                         
 * │ ✗ Queue processing         → Causes gesture conflicts                            
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                          ADDING NEW EMOTIONAL STATES                              
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Define visual properties in emotionMap.js                                      
 * ║ 2. Add state definition in initializeEmotionalStates()                            
 * ║ 3. Add validation to ErrorBoundary.js                                             
 * ║ 4. Test transitions FROM and TO the new state                                     
 * ║ 5. Verify particle behavior and performance                                       
 * ║ 6. Document any special transition rules                                          
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { interpolateHsl } from '../../utils/colorUtils.js';
import { applyEasing, easeInOutCubic } from '../../utils/easing.js';
import { hasEmotion, listEmotions, getBlendedRhythmModifiers } from '../emotions/index.js';
import { emotionCache } from '../cache/EmotionCache.js';

class EmotiveStateMachine {
    constructor(errorBoundary) {
        this.errorBoundary = errorBoundary;
        
        // Current state
        this.state = {
            emotion: 'neutral',
            undertone: null,
            intensity: 1.0,
            gesture: null,
            speaking: false,
            audioLevel: 0
        };

        // Multi-emotion slots (Feature 2)
        this.slots = [];
        this.maxSlots = 3;

        // Event hooks (UP-RESONANCE-2 Feature 1)
        // Set by StateCoordinator to bubble events to main bus
        this._eventCallback = null;
        this._previousDominant = null;

        // Emotion dampening (UP-RESONANCE-2 Feature 4)
        this._emotionDampening = 0;
        this._negativeEmotions = new Set(['anger', 'fear', 'sadness', 'disgust', 'suspicion']);
        
        // Transition management
        this.transitions = {
            emotional: {
                current: 'neutral',
                target: null,
                progress: 0,
                duration: 500,
                startTime: 0,
                isActive: false
            },
            intensity: {
                from: 1.0,
                to: 1.0,
                progress: 1,
                duration: 500,
                startTime: 0,
                isActive: false
            },
            undertone: {
                current: null,
                target: null,
                progress: 0,
                duration: 300,  // Faster than emotion transitions
                startTime: 0,
                isActive: false,
                currentWeight: 0,  // 0-1 weight of current undertone
                targetWeight: 0    // 0-1 weight of target undertone
            }
        };
        
        // Cache for interpolation results
        this.interpolationCache = {
            lastUpdate: 0,
            cacheInterval: 100, // Cache for 100ms
            cachedProperties: null,
            cachedRenderState: null
        };
        
        // Initialize emotional state definitions
        this.initializeEmotionalStates();
        this.initializeUndertoneModifiers();
    }

    /**
     * Initialize all 8 emotional states with their visual properties
     */
    initializeEmotionalStates() {
        // Always use emotion files - no hardcoded fallback
        this.emotionalStates = this.loadEmotionalStatesFromCache();
    }

    /**
     * Load emotional states from cache
     */
    loadEmotionalStatesFromCache() {
        const states = {};
        const emotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'suspicion', 'excited', 'resting', 'euphoria', 'focused', 'glitch', 'calm'];
        
        emotions.forEach(emotionName => {
            const visualParams = emotionCache.getVisualParams(emotionName);
            if (visualParams) {
                states[emotionName] = {
                    primaryColor: visualParams.primaryColor || '#B0B0B0',
                    glowIntensity: visualParams.glowIntensity || 0.7,
                    particleRate: visualParams.particleRate || 1,
                    minParticles: visualParams.minParticles || 3,
                    maxParticles: visualParams.maxParticles || 4,
                    particleBehavior: visualParams.particleBehavior || 'ambient',
                    coreSize: visualParams.coreSize || 1.0,
                    breathRate: visualParams.breathRate || 1.0,
                    breathDepth: visualParams.breathDepth || 0.1
                };
            }
        });
        
        return states;
    }


    /**
     * Initialize undertone modifiers that affect base emotional properties
     */
    initializeUndertoneModifiers() {
        this.undertoneModifiers = {
            nervous: {
                jitterAmount: 0.3,
                breathRateMultiplier: 1.2,
                glowIntensityMultiplier: 0.9,
                particleRateMultiplier: 1.1
            },
            confident: {
                coreSizeMultiplier: 1.1,
                glowIntensityMultiplier: 1.2,
                breathRateMultiplier: 0.9,
                particleRateMultiplier: 1.0
            },
            tired: {
                breathRateMultiplier: 0.7,
                particleRateMultiplier: 0.5,
                glowIntensityMultiplier: 0.8,
                coreSizeMultiplier: 0.95
            },
            intense: {
                amplificationFactor: 1.3
            },
            subdued: {
                dampeningFactor: 0.7
            }
        };
    }

    /**
     * Sets the emotional state with optional undertone and intensity.
     * Clears all slots and sets a single emotion (convenience wrapper).
     * @param {string} emotion - The emotion to set
     * @param {string|Object|null} undertoneOrOptions - Undertone string, options object, or null
     * @param {number} [duration=500] - Transition duration in milliseconds
     * @returns {boolean} Success status
     */
    setEmotion(emotion, undertoneOrOptions = null, duration = 500) {
        return this.errorBoundary.wrap(() => {
            // Parse overloaded signature
            let undertone = null;
            let intensity = 1.0;
            if (typeof undertoneOrOptions === 'string') {
                undertone = undertoneOrOptions;
            } else if (undertoneOrOptions && typeof undertoneOrOptions === 'object') {
                undertone = undertoneOrOptions.undertone ?? null;
                duration = undertoneOrOptions.duration ?? duration;
                intensity = undertoneOrOptions.intensity ?? 1.0;
            }

            // Clear interpolation cache when emotion changes
            this.interpolationCache.cachedProperties = null;
            this.interpolationCache.cachedRenderState = null;

            // Validate emotion using modular system
            if (!hasEmotion(emotion) && !Object.prototype.hasOwnProperty.call(this.emotionalStates, emotion)) {
                const validEmotions = [...Object.keys(this.emotionalStates), ...listEmotions()];
                const uniqueEmotions = [...new Set(validEmotions)];
                throw new Error(`Invalid emotion: ${emotion}. Valid emotions: ${uniqueEmotions.join(', ')}`);
            }

            // Validate undertone
            if (undertone !== null && !Object.prototype.hasOwnProperty.call(this.undertoneModifiers, undertone)) {
                throw new Error(`Invalid undertone: ${undertone}. Valid undertones: ${Object.keys(this.undertoneModifiers).join(', ')}`);
            }

            // Clamp intensity
            intensity = Math.max(0, Math.min(1, intensity));

            // Clear slots and set single emotion
            this.slots = [{ emotion, intensity }];
            this._previousDominant = emotion;

            // If already in this state with same intensity, just update undertone
            if (this.state.emotion === emotion && this.state.undertone === undertone && this.state.intensity === intensity) {
                return true;
            }

            // Set up emotion transition if emotion is changing
            if (this.state.emotion !== emotion) {
                if (duration > 0) {
                    this.transitions.emotional = {
                        current: this.state.emotion,
                        target: emotion,
                        progress: 0,
                        duration: Math.max(100, duration),
                        startTime: performance.now(),
                        isActive: true
                    };

                    // Reset simulated time for testing
                    if (this._simulatedTime !== undefined) {
                        this._simulatedTime = 0;
                    }
                } else {
                    // Immediate transition
                    this.transitions.emotional = {
                        current: emotion,
                        target: null,
                        progress: 1,
                        duration: 0,
                        startTime: performance.now(),
                        isActive: false
                    };
                }
                this.state.emotion = emotion;
            }

            // Set up intensity transition if intensity is changing
            if (this.state.intensity !== intensity) {
                this.transitions.intensity = {
                    from: this.state.intensity,
                    to: intensity,
                    progress: 0,
                    duration: Math.max(100, duration),
                    startTime: performance.now(),
                    isActive: true
                };
                this.state.intensity = intensity;
            }

            // Set up undertone transition if undertone is changing
            if (this.state.undertone !== undertone) {
                this.transitions.undertone = {
                    current: this.state.undertone,
                    target: undertone,
                    progress: 0,
                    duration: 300,  // Always smooth undertone transitions
                    startTime: performance.now(),
                    isActive: true,
                    currentWeight: this.state.undertone ? 1 : 0,
                    targetWeight: undertone ? 1 : 0
                };
                this.state.undertone = undertone;
            }

            return true;
        }, 'emotion-setting', false)();
    }

    // ═══════════════════════════════════════════════════════════════════
    // EVENT HOOKS (UP-RESONANCE-2 Feature 1)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Set event callback for emotion state changes.
     * Called by StateCoordinator to wire into the main event bus.
     * @param {Function} callback - (eventName, data) => void
     */
    setEventCallback(callback) {
        this._eventCallback = callback;
    }

    /**
     * Emit an event through the callback.
     * @private
     */
    _emitEvent(name, data) {
        if (this._eventCallback) this._eventCallback(name, data);
    }

    /**
     * Check if dominant emotion changed and emit event.
     * @private
     */
    _checkDominantChange() {
        const dom = this.getDominant();
        const currentDominant = dom ? dom.emotion : null;
        const prevDominant = this._previousDominant;

        if (currentDominant !== prevDominant) {
            this._previousDominant = currentDominant;
            this._emitEvent('dominantChanged', {
                previous: prevDominant,
                current: currentDominant,
                intensity: dom ? dom.intensity : 0
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // EMOTION DAMPENING (UP-RESONANCE-2 Feature 4)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Set emotion dampening factor. Reduces the impact of positive nudges
     * on negative emotions (anger, fear, sadness, disgust, suspicion).
     * @param {number} factor - 0.0 (no dampening) to 1.0 (full dampening)
     */
    setEmotionDampening(factor) {
        this._emotionDampening = Math.max(0, Math.min(1, factor));
    }

    /**
     * Get current emotion dampening factor.
     * @returns {number} 0.0-1.0
     */
    getEmotionDampening() {
        return this._emotionDampening;
    }

    /**
     * Configure which emotions are considered "negative" for dampening.
     * @param {string[]} emotions - Array of emotion names
     */
    setNegativeEmotions(emotions) {
        this._negativeEmotions = new Set(emotions);
    }

    // ═══════════════════════════════════════════════════════════════════
    // MULTI-EMOTION SLOT SYSTEM (Feature 2)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Push an emotion into a slot. If emotion already exists, add intensity (stacking).
     * If slots are full, replaces the weakest.
     * @param {string} emotion - Emotion name
     * @param {number} [intensity=0.5] - Intensity 0.0-1.0
     * @returns {boolean} Success
     */
    pushEmotion(emotion, intensity = 0.5) {
        return this.errorBoundary.wrap(() => {
            if (!hasEmotion(emotion) && !Object.prototype.hasOwnProperty.call(this.emotionalStates, emotion)) {
                return false;
            }
            intensity = Math.max(0, Math.min(1, intensity));
            this.interpolationCache.cachedProperties = null;

            // If emotion already in a slot, stack intensity
            const existing = this.slots.find(s => s.emotion === emotion);
            if (existing) {
                const before = existing.intensity;
                existing.intensity = Math.min(1, existing.intensity + intensity);
                this._emitEvent('slotChanged', { emotion, intensity: existing.intensity, action: 'push' });
                if (existing.intensity >= 1 && before < 1) {
                    this._emitEvent('emotionPeaked', { emotion, intensity: existing.intensity });
                }
            } else if (this.slots.length < this.maxSlots) {
                this.slots.push({ emotion, intensity });
                this._emitEvent('slotChanged', { emotion, intensity, action: 'push' });
                if (intensity >= 1) {
                    this._emitEvent('emotionPeaked', { emotion, intensity });
                }
            } else {
                // Replace weakest
                let weakest = 0;
                for (let i = 1; i < this.slots.length; i++) {
                    if (this.slots[i].intensity < this.slots[weakest].intensity) weakest = i;
                }
                const removed = this.slots[weakest];
                this._emitEvent('slotChanged', { emotion: removed.emotion, intensity: 0, action: 'replaced' });
                this.slots[weakest] = { emotion, intensity };
                this._emitEvent('slotChanged', { emotion, intensity, action: 'push' });
            }

            this._syncDominantToState();
            this._checkDominantChange();
            return true;
        }, 'push-emotion', false)();
    }

    /**
     * Nudge an emotion's intensity by delta. Creates slot if emotion not present (positive only).
     * @param {string} emotion - Emotion name
     * @param {number} delta - Intensity change (can be negative)
     * @param {number} [cap=1.0] - Maximum intensity
     */
    nudgeEmotion(emotion, delta, cap = 1.0) {
        // Apply dampening to positive nudges on negative emotions
        if (delta > 0 && this._emotionDampening > 0 && this._negativeEmotions.has(emotion)) {
            delta *= (1 - this._emotionDampening);
        }

        this.interpolationCache.cachedProperties = null;
        const existing = this.slots.find(s => s.emotion === emotion);
        if (existing) {
            const before = existing.intensity;
            existing.intensity = Math.max(0, Math.min(cap, existing.intensity + delta));
            if (existing.intensity <= 0) {
                this.slots = this.slots.filter(s => s !== existing);
                this._emitEvent('slotChanged', { emotion, intensity: 0, action: 'removed' });
            } else {
                this._emitEvent('slotChanged', { emotion, intensity: existing.intensity, action: 'nudge' });
                if (existing.intensity >= cap && before < cap) {
                    this._emitEvent('emotionPeaked', { emotion, intensity: existing.intensity });
                }
            }
        } else if (delta > 0) {
            // Create new slot
            this.pushEmotion(emotion, Math.min(cap, delta));
            return;
        }
        this._syncDominantToState();
        this._checkDominantChange();
    }

    /**
     * Clear all emotion slots. Transition to neutral.
     */
    clearEmotions() {
        const hadSlots = this.slots.length > 0;
        this.slots = [];
        this.interpolationCache.cachedProperties = null;
        this.state.emotion = 'neutral';
        this.state.intensity = 1.0;
        if (hadSlots) {
            this._emitEvent('slotChanged', { emotion: null, intensity: 0, action: 'cleared' });
            this._previousDominant = null;
            this._emitEvent('dominantChanged', { previous: this._previousDominant, current: null, intensity: 0 });
        }
    }

    /**
     * Get all slots (reference — used by EmotionDynamics for decay).
     * @returns {Array<{emotion: string, intensity: number}>}
     */
    getSlots() {
        return this.slots;
    }

    /**
     * Remove slots that have decayed to zero.
     */
    pruneEmptySlots() {
        const before = this.slots.length;
        const removed = this.slots.filter(s => s.intensity <= 0);
        this.slots = this.slots.filter(s => s.intensity > 0);
        if (this.slots.length !== before) {
            this.interpolationCache.cachedProperties = null;
            for (const r of removed) {
                this._emitEvent('emotionDecayed', { emotion: r.emotion, intensity: 0, removed: true });
            }
            this._syncDominantToState();
            this._checkDominantChange();
        }
    }

    /**
     * Get the dominant emotion slot (highest intensity).
     * @returns {{emotion: string, intensity: number}|null}
     */
    getDominant() {
        if (!this.slots.length) return null;
        return this.slots.reduce((a, b) => b.intensity > a.intensity ? b : a);
    }

    /**
     * Get non-dominant slots.
     * @returns {Array<{emotion: string, intensity: number}>}
     */
    getUndercurrents() {
        const dom = this.getDominant();
        if (!dom) return [];
        return this.slots.filter(s => s !== dom);
    }

    /**
     * Full emotional state query.
     * @returns {Object}
     */
    getEmotionalState() {
        const dominant = this.getDominant();
        return {
            dominant: dominant ? { ...dominant } : null,
            undercurrents: this.getUndercurrents().map(s => ({ ...s })),
            slots: this.slots.map(s => ({ ...s }))
        };
    }

    /**
     * Get current blended rhythm modifiers from all emotion slots (Feature 7).
     * @returns {Object} { windowMultiplier, visualNoise, inputDelay, tempoShift }
     */
    getCurrentRhythmModifiers() {
        if (this.slots.length > 0) {
            return getBlendedRhythmModifiers(this.slots);
        }
        // Fallback: single emotion at current intensity
        return getBlendedRhythmModifiers([{ emotion: this.state.emotion, intensity: this.state.intensity }]);
    }

    /**
     * Sync the dominant slot to the legacy state.emotion / state.intensity fields.
     * @private
     */
    _syncDominantToState() {
        const dom = this.getDominant();
        if (dom) {
            if (this.state.emotion !== dom.emotion) {
                // Start visual transition
                this.transitions.emotional = {
                    current: this.state.emotion,
                    target: dom.emotion,
                    progress: 0,
                    duration: 300,
                    startTime: performance.now(),
                    isActive: true
                };
                this.state.emotion = dom.emotion;
            }
            this.state.intensity = dom.intensity;
        } else {
            this.state.emotion = 'neutral';
            this.state.intensity = 1.0;
        }
    }

    /**
     * Applies undertone modifiers to base emotional properties
     * @param {Object} baseProperties - Base emotional properties
     * @param {string|null} undertone - Undertone to apply
     * @returns {Object} Modified properties
     */
    applyUndertone(baseProperties, undertone) {
        if (!undertone || !Object.prototype.hasOwnProperty.call(this.undertoneModifiers, undertone)) {
            return { ...baseProperties };
        }

        const modifier = this.undertoneModifiers[undertone];
        const modified = { ...baseProperties };

        // Apply specific modifiers
        if (modifier.glowIntensityMultiplier !== undefined) {
            modified.glowIntensity *= modifier.glowIntensityMultiplier;
        }
        if (modifier.breathRateMultiplier !== undefined) {
            modified.breathRate *= modifier.breathRateMultiplier;
        }
        if (modifier.particleRateMultiplier !== undefined) {
            modified.particleRate = Math.round(modified.particleRate * modifier.particleRateMultiplier);
        }
        if (modifier.coreSizeMultiplier !== undefined) {
            modified.coreSize *= modifier.coreSizeMultiplier;
        }

        // Apply amplification/dampening factors
        if (modifier.amplificationFactor !== undefined) {
            const factor = modifier.amplificationFactor;
            modified.glowIntensity *= factor;
            modified.breathRate *= factor;
            modified.particleRate = Math.round(modified.particleRate * factor);
            modified.coreSize *= factor;
        }
        if (modifier.dampeningFactor !== undefined) {
            const factor = modifier.dampeningFactor;
            modified.glowIntensity *= factor;
            modified.breathRate *= factor;
            modified.particleRate = Math.round(modified.particleRate * factor);
            modified.coreSize *= factor;
        }

        // Add special properties
        if (modifier.jitterAmount !== undefined) {
            modified.jitterAmount = modifier.jitterAmount;
        }

        return modified;
    }

    /**
     * Updates the state machine with delta time
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        this.errorBoundary.wrap(() => {
            // Update emotional transition
            if (this.transitions.emotional.isActive) {
                this.updateEmotionalTransition(deltaTime);
            }

            // Update intensity transition
            if (this.transitions.intensity.isActive) {
                this.updateIntensityTransition(deltaTime);
            }

            // Update undertone transition
            if (this.transitions.undertone.isActive) {
                this.updateUndertoneTransition(deltaTime);
            }
        }, 'state-machine-update')();
    }

    /**
     * Updates undertone transition progress
     * @param {number} _deltaTime - Time since last update in milliseconds (unused but kept for API consistency)
     */
    updateUndertoneTransition(_deltaTime) {
        const transition = this.transitions.undertone;
        
        // Calculate elapsed time
        const elapsed = performance.now() - transition.startTime;
        const progress = Math.min(elapsed / transition.duration, 1);
        
        // Apply easing
        const easedProgress = easeInOutCubic(progress);
        
        // Update weights for smooth transition
        if (transition.current && transition.target) {
            // Transitioning between two undertones
            transition.currentWeight = 1 - easedProgress;
            transition.targetWeight = easedProgress;
        } else if (transition.current && !transition.target) {
            // Fading out current undertone
            transition.currentWeight = 1 - easedProgress;
            transition.targetWeight = 0;
        } else if (!transition.current && transition.target) {
            // Fading in new undertone
            transition.currentWeight = 0;
            transition.targetWeight = easedProgress;
        }
        
        transition.progress = progress;
        
        // Complete transition
        if (progress >= 1) {
            transition.isActive = false;
            transition.current = transition.target;
            transition.currentWeight = transition.target ? 1 : 0;
            transition.targetWeight = 0;
        }
    }
    
    /**
     * Updates intensity transition progress
     * @param {number} _deltaTime - Time since last update (unused, uses wall clock)
     */
    updateIntensityTransition(_deltaTime) {
        const transition = this.transitions.intensity;
        const elapsed = performance.now() - transition.startTime;
        transition.progress = Math.min(1, elapsed / transition.duration);

        if (transition.progress >= 1) {
            transition.isActive = false;
            transition.from = transition.to;
            transition.progress = 1;
        }
    }

    /**
     * Get interpolated intensity (accounts for active transition).
     * @returns {number} Current effective intensity 0-1
     */
    getEffectiveIntensity() {
        const transition = this.transitions.intensity;
        if (!transition.isActive) return this.state.intensity;
        const eased = easeInOutCubic(transition.progress);
        return transition.from + (transition.to - transition.from) * eased;
    }

    /**
     * Updates emotional state transition progress
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateEmotionalTransition(deltaTime) {
        const transition = this.transitions.emotional;
        
        // Use either real elapsed time or simulated deltaTime for testing
        let elapsed;
        if (this._simulatedTime !== undefined) {
            // For testing - use accumulated simulated time
            this._simulatedTime += deltaTime;
            elapsed = this._simulatedTime;
        } else {
            // For real usage - use actual elapsed time
            elapsed = performance.now() - transition.startTime;
        }
        
        // Calculate progress (0 to 1)
        transition.progress = Math.min(1, elapsed / transition.duration);
        
        // Check if transition is complete
        if (transition.progress >= 1) {
            transition.isActive = false;
            transition.current = transition.target;
            transition.target = null;
            transition.progress = 1;
        }
    }

    /**
     * Gets the current interpolated emotional properties
     * @returns {Object} Current emotional properties with smooth transitions
     */
    getCurrentEmotionalProperties() {
        return this.errorBoundary.wrap(() => {
            const now = performance.now();

            // Use cached result if still valid
            if (this.interpolationCache.cachedProperties &&
                (now - this.interpolationCache.lastUpdate) < this.interpolationCache.cacheInterval) {
                return this.interpolationCache.cachedProperties;
            }

            let properties;

            // Multi-slot blending when we have undercurrents
            if (this.slots.length > 1) {
                properties = this._blendSlotProperties();
            } else {
                // Single emotion path (legacy or single slot)
                const transition = this.transitions.emotional;
                if (transition.isActive && transition.target) {
                    properties = this.interpolateEmotionalProperties(
                        transition.current,
                        transition.target,
                        transition.progress
                    );
                } else {
                    const emotionState = this.emotionalStates[this.state.emotion] || this.emotionalStates.neutral;
                    properties = { ...emotionState };
                }

                // Apply intensity scaling
                const intensity = this.getEffectiveIntensity();
                if (intensity < 1.0) {
                    properties.glowIntensity = this._lerp(0.7, properties.glowIntensity, intensity);
                    properties.particleRate = Math.round(this._lerp(1, properties.particleRate, intensity));
                    properties.breathRate = this._lerp(1.0, properties.breathRate, intensity);
                    properties.breathDepth = properties.breathDepth * intensity;
                    properties.coreSize = this._lerp(1.0, properties.coreSize, intensity);
                }
            }

            // Apply undertone modifiers
            properties = this.applyUndertone(properties, this.state.undertone);

            // Cache the result
            this.interpolationCache.cachedProperties = properties;
            this.interpolationCache.lastUpdate = now;

            return properties;
        }, 'emotional-properties', () => this.emotionalStates.neutral)();
    }

    /**
     * Blend visual properties across all emotion slots.
     * Dominant contributes 75%, undercurrents share the remaining 25%.
     * @private
     * @returns {Object} Blended properties
     */
    _blendSlotProperties() {
        const dom = this.getDominant();
        const undercurrents = this.getUndercurrents();

        const domProps = this.emotionalStates[dom.emotion] || this.emotionalStates.neutral;
        const result = { ...domProps };

        // Scale dominant by its intensity
        const di = dom.intensity;
        result.glowIntensity = this._lerp(0.7, domProps.glowIntensity, di) * 0.75;
        result.particleRate = domProps.particleRate * di * 0.75;
        result.breathRate = this._lerp(1.0, domProps.breathRate, di) * 0.75;
        result.breathDepth = domProps.breathDepth * di * 0.75;
        result.coreSize = this._lerp(1.0, domProps.coreSize, di) * 0.75;

        // Blend in undercurrents
        const ucWeight = undercurrents.length > 0 ? 0.25 / undercurrents.length : 0;
        for (const uc of undercurrents) {
            const ucProps = this.emotionalStates[uc.emotion] || this.emotionalStates.neutral;
            const ui = uc.intensity;
            result.glowIntensity += this._lerp(0.7, ucProps.glowIntensity, ui) * ucWeight;
            result.particleRate += ucProps.particleRate * ui * ucWeight;
            result.breathRate += this._lerp(1.0, ucProps.breathRate, ui) * ucWeight;
            result.breathDepth += ucProps.breathDepth * ui * ucWeight;
            result.coreSize += this._lerp(1.0, ucProps.coreSize, ui) * ucWeight;
        }

        result.particleRate = Math.round(result.particleRate);

        // Color: weighted HSL blend
        if (undercurrents.length > 0) {
            const totalIntensity = this.slots.reduce((sum, s) => sum + s.intensity, 0);
            let blendedColor = domProps.primaryColor;
            for (const uc of undercurrents) {
                const ucProps = this.emotionalStates[uc.emotion] || this.emotionalStates.neutral;
                const weight = uc.intensity / totalIntensity;
                blendedColor = interpolateHsl(blendedColor, ucProps.primaryColor, weight);
            }
            result.primaryColor = blendedColor;
        }

        // Discrete properties use dominant
        result.particleBehavior = domProps.particleBehavior;

        return result;
    }

    /**
     * Linear interpolation helper.
     * @private
     */
    _lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Interpolates between two emotional states
     * @param {string} fromEmotion - Source emotion
     * @param {string} toEmotion - Target emotion
     * @param {number} progress - Interpolation progress (0-1)
     * @returns {Object} Interpolated properties
     */
    interpolateEmotionalProperties(fromEmotion, toEmotion, progress) {
        const fromProps = this.emotionalStates[fromEmotion] || this.emotionalStates.neutral;
        const toProps = this.emotionalStates[toEmotion] || this.emotionalStates.neutral;
        
        // Apply easing to progress
        const easedProgress = applyEasing(progress, 0, 1, 'easeOutCubic');

        return {
            // Interpolate color in HSL space for better transitions
            primaryColor: interpolateHsl(fromProps.primaryColor, toProps.primaryColor, easedProgress),
            
            // Interpolate numeric properties
            glowIntensity: fromProps.glowIntensity + (toProps.glowIntensity - fromProps.glowIntensity) * easedProgress,
            particleRate: Math.round(fromProps.particleRate + (toProps.particleRate - fromProps.particleRate) * easedProgress),
            coreSize: fromProps.coreSize + (toProps.coreSize - fromProps.coreSize) * easedProgress,
            breathRate: fromProps.breathRate + (toProps.breathRate - fromProps.breathRate) * easedProgress,
            breathDepth: fromProps.breathDepth + (toProps.breathDepth - fromProps.breathDepth) * easedProgress,
            
            // Use target behavior when transition is more than 50% complete
            particleBehavior: easedProgress > 0.5 ? toProps.particleBehavior : fromProps.particleBehavior
        };
    }

    /**
     * Gets the current state for external inspection
     * @returns {Object} Current state information
     */
    getCurrentState() {
        return {
            emotion: this.state.emotion,
            undertone: this.state.undertone,
            intensity: this.state.intensity,
            isTransitioning: this.transitions.emotional.isActive,
            transitionProgress: this.transitions.emotional.progress,
            properties: this.getCurrentEmotionalProperties()
        };
    }

    /**
     * Applies an undertone to the current emotional state
     * @param {string|null} undertone - Undertone to apply
     * @returns {boolean} Success status
     */
    applyUndertoneModifier(undertone) {
        return this.errorBoundary.wrap(() => {
            // Validate undertone
            if (undertone !== null && !Object.prototype.hasOwnProperty.call(this.undertoneModifiers, undertone)) {
                throw new Error(`Invalid undertone: ${undertone}. Valid undertones: ${Object.keys(this.undertoneModifiers).join(', ')}`);
            }

            // Apply the undertone
            this.state.undertone = undertone;
            
            return true;
        }, 'undertone-application', false)();
    }

    /**
     * Clears the current undertone and resets to base emotional state
     */
    clearUndertone() {
        this.state.undertone = null;
    }

    /**
     * Gets the raw undertone modifier data for a specific undertone
     * @param {string} undertone - Undertone name
     * @returns {Object|null} Undertone modifier data or null if invalid
     */
    getUndertoneModifier(undertone) {
        return this.errorBoundary.wrap(() => {
            // Try to get from renderer first (comprehensive modifiers)
            if (this.renderer && this.renderer.undertoneModifiers && 
                this.renderer.undertoneModifiers[undertone]) {
                // Return the full modifier from renderer
                return { ...this.renderer.undertoneModifiers[undertone] };
            }
            
            // Fallback to local modifiers
            if (!undertone || !Object.prototype.hasOwnProperty.call(this.undertoneModifiers, undertone)) {
                return null;
            }
            // Ensure essential properties exist in fallback
            const localMod = { ...this.undertoneModifiers[undertone] };
            if (!localMod.glowRadiusMult) {
                localMod.glowRadiusMult = 1.0; // Default value
            }
            return localMod;
        }, 'undertone-retrieval', null)();
    }
    
    /**
     * Gets weighted undertone modifiers based on current transition state
     * @returns {Object|null} Combined undertone modifiers with transition weights applied
     */
    getWeightedUndertoneModifiers() {
        const transition = this.transitions.undertone;
        
        // If no transition is active, return current undertone modifiers directly
        if (!transition.isActive) {
            if (this.state.undertone) {
                const mod = this.getUndertoneModifier(this.state.undertone);
                if (mod) {
                    // Return full modifier with weight of 1.0 (fully applied) and type
                    return { ...mod, weight: 1.0, type: this.state.undertone };
                }
            }
            return null;
        }
        
        // During transition, return the target modifier with interpolated weight
        if (transition.target) {
            const targetMod = this.getUndertoneModifier(transition.target);
            if (targetMod) {
                // Return target modifier with transition weight and type
                return { ...targetMod, weight: transition.targetWeight, type: transition.target };
            }
        }
        
        // Fading out - return current modifier with decreasing weight  
        if (transition.current && transition.currentWeight > 0) {
            const currentMod = this.getUndertoneModifier(transition.current);
            if (currentMod) {
                return { ...currentMod, weight: transition.currentWeight, type: transition.current };
            }
        }
        
        return null;
    }

    /**
     * Resets the state machine to neutral emotion
     * @param {number} duration - Transition duration in milliseconds
     */
    reset(duration = 500) {
        this.slots = [];
        this.setEmotion('neutral', null, duration);
    }

    /**
     * Validates if an emotion is valid
     * @param {string} emotion - Emotion to validate
     * @returns {boolean} True if valid
     */
    isValidEmotion(emotion) {
        return Object.prototype.hasOwnProperty.call(this.emotionalStates, emotion);
    }

    /**
     * Validates if an undertone is valid
     * @param {string} undertone - Undertone to validate
     * @returns {boolean} True if valid
     */
    isValidUndertone(undertone) {
        return undertone === null || Object.prototype.hasOwnProperty.call(this.undertoneModifiers, undertone);
    }

    /**
     * Gets all available emotions
     * @returns {Array} Array of emotion names
     */
    getAvailableEmotions() {
        return Object.keys(this.emotionalStates);
    }

    /**
     * Gets all available undertones
     * @returns {Array} Array of undertone names
     */
    getAvailableUndertones() {
        return Object.keys(this.undertoneModifiers);
    }

    /**
     * Checks if a transition is currently active
     * @returns {boolean} True if transitioning
     */
    isTransitioning() {
        return this.transitions.emotional.isActive;
    }

    /**
     * Gets the current transition progress
     * @returns {number} Progress from 0 to 1, or 1 if not transitioning
     */
    getTransitionProgress() {
        return this.transitions.emotional.isActive ? this.transitions.emotional.progress : 1;
    }

    /**
     * Forces completion of current transition
     */
    completeTransition() {
        if (this.transitions.emotional.isActive) {
            this.transitions.emotional.progress = 1;
            this.transitions.emotional.isActive = false;
            this.transitions.emotional.current = this.transitions.emotional.target;
            this.transitions.emotional.target = null;
        }
    }

    /**
     * Gets interpolated property value with easing
     * @param {number} from - Start value
     * @param {number} to - End value  
     * @param {number} progress - Progress (0-1)
     * @param {string} easingType - Easing function name
     * @returns {number} Interpolated value
     */
    interpolateProperty(from, to, progress, easingType = 'easeOutCubic') {
        return from + (to - from) * applyEasing(progress, 0, 1, easingType);
    }

    /**
     * Enables simulated time for testing purposes
     * @param {boolean} enabled - Whether to use simulated time
     */
    enableSimulatedTime(enabled = true) {
        if (enabled) {
            this._simulatedTime = 0;
        } else {
            delete this._simulatedTime;
        }
    }
}

export default EmotiveStateMachine;