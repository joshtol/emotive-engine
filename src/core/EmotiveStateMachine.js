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
 * │ • gestureQueue : Pending gestures to play sequentially                            
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

import { interpolateHsl } from '../utils/colorUtils.js';
import { applyEasing, easeInOutCubic } from '../utils/easing.js';

class EmotiveStateMachine {
    constructor(errorBoundary) {
        this.errorBoundary = errorBoundary;
        
        // Current state
        this.state = {
            emotion: 'neutral',
            undertone: null,
            gesture: null,
            gestureQueue: [],
            speaking: false,
            audioLevel: 0
        };
        
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
        this.emotionalStates = {
            neutral: {
                primaryColor: '#B0B0B0',
                glowIntensity: 0.7,
                particleRate: 1,  // DECIMATED - minimal particles
                minParticles: 3,  // Always have at least 3 particles for gestures to affect
                maxParticles: 4,  // Max 4 particles
                particleBehavior: 'ambient',
                coreSize: 1.0,
                breathRate: 1.0,
                breathDepth: 0.1
            },
            joy: {
                primaryColor: '#FFD700',
                glowIntensity: 1.2,
                particleRate: 2,           // More frequent popping
                minParticles: 3,           // Always popping
                maxParticles: 8,           // Can have many kernels popping
                particleBehavior: 'popcorn', // Spontaneous popping effect
                coreSize: 1.1,
                breathRate: 1.3,
                breathDepth: 0.15
            },
            sadness: {
                primaryColor: '#4169E1',
                glowIntensity: 0.6,
                particleRate: 2,  // Halved from 3
                minParticles: 1,  // At least 1
                maxParticles: 3,  // Max 3 particles
                particleBehavior: 'falling',
                coreSize: 0.9,
                breathRate: 0.7,
                breathDepth: 0.08
            },
            anger: {
                primaryColor: '#DC143C',
                glowIntensity: 1.3,
                particleRate: 1,  // ~30% chance per frame
                minParticles: 3,  // Always show anger
                maxParticles: 8,  // Can get intense
                particleBehavior: 'aggressive',
                coreSize: 1.2,
                breathRate: 1.5,
                breathDepth: 0.2
            },
            fear: {
                primaryColor: '#8B008B',
                glowIntensity: 0.8,
                particleRate: 1,  // chance per frame
                minParticles: 2,  // Always visible
                maxParticles: 6,  // Moderate max
                particleBehavior: 'scattering',
                coreSize: 0.8,
                breathRate: 1.8,
                breathDepth: 0.12
            },
            surprise: {
                primaryColor: '#FF8C00',
                glowIntensity: 1.4,
                particleRate: 1,
                minParticles: 3,  // Burst effect
                maxParticles: 10,  // Can burst big
                particleBehavior: 'burst',
                coreSize: 1.3,
                breathRate: 2.0,
                breathDepth: 0.25
            },
            disgust: {
                primaryColor: '#9ACD32',
                glowIntensity: 0.9,
                particleRate: 2,
                minParticles: 2,  // Always show disgust
                maxParticles: 4,  // Limited particles
                particleBehavior: 'repelling',
                coreSize: 0.95,
                breathRate: 0.8,
                breathDepth: 0.06
            },
            love: {
                primaryColor: '#FF69B4',
                glowIntensity: 1.1,
                particleRate: 1,  // Halved from 9
                minParticles: 2,  // Always orbiting
                maxParticles: 5,  // Gentle max
                particleBehavior: 'orbiting',
                coreSize: 1.05,
                breathRate: 0.9,
                breathDepth: 0.18
            },
            excited: {
                primaryColor: '#FF00FF',  // Hot magenta
                glowIntensity: 1.2,  // Bright glow for excitement
                particleRate: 360,  // Double rate for more visible particles
                minParticles: 480,  // Double particles for denser effect
                maxParticles: 900,  // Double max particles
                particleBehavior: 'fizzy',
                coreSize: 0.85,  // Slightly smaller than neutral
                breathRate: 1.5,  // Excited breathing
                breathDepth: 0.08,  // Moderate breath
                eyeOpenness: 1.0,  // Wide eyes
                verticalOffset: 0.05  // Move orb down just a bit (5% of canvas height)
            },
            resting: {
                primaryColor: '#7C3AED',   // Soft purple for resting
                glowIntensity: 0.8,
                particleRate: 2,          // Moderate particles for visible effect
                minParticles: 3,  // Always 3-5 visible
                maxParticles: 5,  // Calm max
                particleBehavior: 'resting',
                coreSize: 1.0,
                breathRate: 0.8,           // 12-16 breaths per minute (resting human)
                breathDepth: 0.12          // Gentle, relaxed breathing
            },
            euphoria: {
                primaryColor: '#FFD700',   // Golden sunrise
                glowIntensity: 1.8,        // Radiant warm glow
                particleRate: 3,           // Abundant like sunbeams
                minParticles: 15,          // Always sparkling
                maxParticles: 30,          // Maximum celebration
                particleBehavior: 'radiant', // Radiating outward
                coreSize: 1.15,            // Expanded with joy
                breathRate: 1.3,           // Energized breathing
                breathDepth: 0.25,         // Deep refreshing breaths
            },
            focused: {
                primaryColor: '#00CED1',  // Bright cyan
                glowIntensity: 1.2,
                particleRate: 0.5,  // Frequent, like synapses
                minParticles: 2,
                maxParticles: 5,
                particleBehavior: 'directed',  // Fast, straight paths
                coreSize: 1.05,
                breathRate: 1.2,  // Alert breathing
                breathDepth: 0.08,
                eyeOpenness: 0.7,  // Narrowed for concentration
                microAdjustments: true  // Enable tiny shifts
            },
            suspicion: {
                primaryColor: '#708090',  // Slate gray
                glowIntensity: 0.9,
                particleRate: 20,  // Higher rate for continuous particles
                minParticles: 8,
                maxParticles: 15,  // More particles for better visibility
                particleBehavior: 'burst',  // Use burst like surprise but we'll modify it
                coreSize: 1.0,
                breathRate: 0.8,  // Controlled breathing
                breathDepth: 0.05,  // Shallow, alert breathing
                eyeOpenness: 0.5,  // Narrowed, skeptical eyes
                eyeArc: -0.2  // Slight frown
            }
        };
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
     * Sets the emotional state with optional undertone
     * @param {string} emotion - The emotion to set
     * @param {string|null} undertone - Optional undertone modifier
     * @param {number} duration - Transition duration in milliseconds
     * @returns {boolean} Success status
     */
    setEmotion(emotion, undertone = null, duration = 500) {
        return this.errorBoundary.wrap(() => {
            // Clear interpolation cache when emotion changes
            this.interpolationCache.cachedProperties = null;
            this.interpolationCache.cachedRenderState = null;
            
            // Validate emotion
            if (!this.emotionalStates.hasOwnProperty(emotion)) {
                throw new Error(`Invalid emotion: ${emotion}. Valid emotions: ${Object.keys(this.emotionalStates).join(', ')}`);
            }

            // Validate undertone
            if (undertone !== null && !this.undertoneModifiers.hasOwnProperty(undertone)) {
                throw new Error(`Invalid undertone: ${undertone}. Valid undertones: ${Object.keys(this.undertoneModifiers).join(', ')}`);
            }

            // If already in this state, just update undertone
            if (this.state.emotion === emotion && this.state.undertone === undertone) {
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

    /**
     * Applies undertone modifiers to base emotional properties
     * @param {Object} baseProperties - Base emotional properties
     * @param {string|null} undertone - Undertone to apply
     * @returns {Object} Modified properties
     */
    applyUndertone(baseProperties, undertone) {
        if (!undertone || !this.undertoneModifiers.hasOwnProperty(undertone)) {
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
            
            // Update undertone transition
            if (this.transitions.undertone.isActive) {
                this.updateUndertoneTransition(deltaTime);
            }
        }, 'state-machine-update')();
    }

    /**
     * Updates undertone transition progress
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateUndertoneTransition(deltaTime) {
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
            
            const transition = this.transitions.emotional;
            let properties;

            if (transition.isActive && transition.target) {
                // Interpolate between current and target states
                properties = this.interpolateEmotionalProperties(
                    transition.current,
                    transition.target,
                    transition.progress
                );
            } else {
                // Use current state properties
                properties = { ...this.emotionalStates[this.state.emotion] };
            }

            // Apply undertone modifiers
            properties = this.applyUndertone(properties, this.state.undertone);
            
            // Cache the result
            this.interpolationCache.cachedProperties = properties;
            this.interpolationCache.lastUpdate = now;

            return properties;
        }, 'emotional-properties', this.emotionalStates.neutral)();
    }

    /**
     * Interpolates between two emotional states
     * @param {string} fromEmotion - Source emotion
     * @param {string} toEmotion - Target emotion
     * @param {number} progress - Interpolation progress (0-1)
     * @returns {Object} Interpolated properties
     */
    interpolateEmotionalProperties(fromEmotion, toEmotion, progress) {
        const fromProps = this.emotionalStates[fromEmotion];
        const toProps = this.emotionalStates[toEmotion];
        
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
            if (undertone !== null && !this.undertoneModifiers.hasOwnProperty(undertone)) {
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
            if (!undertone || !this.undertoneModifiers.hasOwnProperty(undertone)) {
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
                    // Return full modifier with weight of 1.0 (fully applied)
                    return { ...mod, weight: 1.0 };
                }
            }
            return null;
        }
        
        // During transition, return the target modifier with interpolated weight
        if (transition.target) {
            const targetMod = this.getUndertoneModifier(transition.target);
            if (targetMod) {
                // Return target modifier with transition weight
                return { ...targetMod, weight: transition.targetWeight };
            }
        }
        
        // Fading out - return current modifier with decreasing weight  
        if (transition.current && transition.currentWeight > 0) {
            const currentMod = this.getUndertoneModifier(transition.current);
            if (currentMod) {
                return { ...currentMod, weight: transition.currentWeight };
            }
        }
        
        return null;
    }

    /**
     * Resets the state machine to neutral emotion
     * @param {number} duration - Transition duration in milliseconds
     */
    reset(duration = 500) {
        this.setEmotion('neutral', null, duration);
    }

    /**
     * Validates if an emotion is valid
     * @param {string} emotion - Emotion to validate
     * @returns {boolean} True if valid
     */
    isValidEmotion(emotion) {
        return this.emotionalStates.hasOwnProperty(emotion);
    }

    /**
     * Validates if an undertone is valid
     * @param {string} undertone - Undertone to validate
     * @returns {boolean} True if valid
     */
    isValidUndertone(undertone) {
        return undertone === null || this.undertoneModifiers.hasOwnProperty(undertone);
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