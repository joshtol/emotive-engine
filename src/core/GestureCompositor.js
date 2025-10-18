/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                   ◐ ◑ ◒ ◓  GESTURE COMPOSITOR  ◓ ◒ ◑ ◐                   
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Gesture Compositor - Emotion-Modified Animation Synthesis
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module GestureCompositor
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The ANIMATOR'S MIXER. Takes base gestures (bounce, pulse, etc.) and blends        
 * ║ them with emotional modifiers and undertones to create nuanced animations.        
 * ║ A happy bounce is different from a sad bounce - this is where that happens!       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 COMPOSITION FORMULA                                                             
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Final Animation = Base Gesture × Emotion Modifier × Undertone Modifier            
 * │                                                                                    
 * │ Example: Bounce + Joy + Confident                                                 
 * │   = Fast, big, springy bounce with extra confidence                               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔗 DEPENDENCIES                                                                    
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • gestures/index.js     : Modular gesture system with base configs                
 * │ • emotionModifiers.js   : How emotions affect movement                            
 * │ • undertoneModifiers.js : Subtle variations in expression                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { getGesture, getGestureProperties } from './gestures/gestureCacheWrapper.js';
import { getEmotionModifiers } from './emotions/index.js';
import { emotionCache } from './cache/EmotionCache.js';
import { getUndertoneModifier } from '../config/undertoneModifiers.js';

class GestureCompositor {
    constructor() {
        // Cache for computed parameters
        this.cache = new Map();
        
        // Pre-calculate common easing curves for performance
        this.easingCache = new Map();
        this.preCalculateEasingCurves();
    }
    
    /**
     * Pre-calculate common easing curves to avoid repeated calculations
     */
    preCalculateEasingCurves() {
        const steps = 100;
        const easingTypes = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'];
        
        for (const type of easingTypes) {
            const curve = new Float32Array(steps + 1);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                curve[i] = this.calculateEasing(t, type);
            }
            this.easingCache.set(type, curve);
        }
    }
    
    /**
     * Calculate easing value
     */
    calculateEasing(t, type) {
        switch(type) {
        case 'ease-in':
            return t * t;
        case 'ease-out':
            return t * (2 - t);
        case 'ease-in-out':
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        case 'bounce':
            if (t < 0.363636) return 7.5625 * t * t;
            if (t < 0.727272) return 7.5625 * (t -= 0.545454) * t + 0.75;
            if (t < 0.909090) return 7.5625 * (t -= 0.818181) * t + 0.9375;
            return 7.5625 * (t -= 0.954545) * t + 0.984375;
        default:
            return t; // linear
        }
    }
    
    /**
     * Get easing value from cache
     */
    getEasingValue(progress, type) {
        const curve = this.easingCache.get(type);
        if (!curve) return progress; // Fallback to linear
        
        const index = Math.min(Math.floor(progress * 100), 100);
        return curve[index];
    }
    
    /**
     * Compose final gesture parameters
     * @param {string} gesture - Name of the gesture
     * @param {string} emotion - Current emotion state
     * @param {string} undertone - Current undertone (optional)
     * @returns {Object} Final composed parameters for the gesture
     */
    compose(gesture, emotion, undertone = null) {
        // Check cache first
        const cacheKey = `${gesture}-${emotion}-${undertone || 'none'}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Get base configuration from modular gesture system
        const gestureModule = getGesture(gesture);
        const base = gestureModule ? gestureModule.config : {
            duration: 500,
            amplitude: 20,
            easing: 'sine'
        };
        
        // Use cached gesture properties if available for better performance
        // const cachedProperties = getGestureProperties(gesture);
        const emotionMod = emotionCache && emotionCache.isInitialized ? 
            emotionCache.getModifiers(emotion) : getEmotionModifiers(emotion);
        const undertoneMod = getUndertoneModifier(undertone);
        
        // Compose the final parameters
        const composed = this.applyModifiers(base, emotionMod, undertoneMod, gesture);
        
        // Cache the result with size limit
        if (this.cache.size > 100) {
            // Clear cache if it gets too large
            this.cache.clear();
        }
        this.cache.set(cacheKey, composed);
        
        return composed;
    }
    
    /**
     * Apply modifiers to base parameters
     * @param {Object} base - Base gesture configuration
     * @param {Object} emotionMod - Emotion modifiers
     * @param {Object} undertoneMod - Undertone modifiers
     * @param {string} gesture - Gesture name for special handling
     * @returns {Object} Modified parameters
     */
    applyModifiers(base, emotionMod, undertoneMod, gesture) {
        const result = { ...base };
        
        // Apply speed modifiers (affects duration inversely)
        const speedMultiplier = emotionMod.speed * undertoneMod.speed;
        result.duration = Math.round(base.duration / speedMultiplier);
        
        // Apply amplitude modifiers
        if (result.amplitude !== undefined) {
            result.amplitude = base.amplitude * emotionMod.amplitude * undertoneMod.amplitude;
        }
        
        // Apply scale modifiers
        if (result.scaleAmount !== undefined) {
            result.scaleAmount = base.scaleAmount * emotionMod.intensity * undertoneMod.intensity;
        }
        if (result.scaleTarget !== undefined) {
            const scaleModifier = emotionMod.amplitude * undertoneMod.amplitude;
            result.scaleTarget = 1 + (base.scaleTarget - 1) * scaleModifier;
        }
        
        // Apply glow modifiers
        if (result.glowAmount !== undefined) {
            result.glowAmount = base.glowAmount * emotionMod.intensity * undertoneMod.intensity;
        }
        if (result.glowPeak !== undefined) {
            result.glowPeak = 1 + (base.glowPeak - 1) * emotionMod.intensity * undertoneMod.intensity;
        }
        
        // Apply rotation modifiers
        if (result.rotations !== undefined) {
            result.rotations = base.rotations * emotionMod.amplitude * undertoneMod.amplitude;
        }
        if (result.angle !== undefined) {
            result.angle = base.angle * emotionMod.amplitude * undertoneMod.amplitude;
        }
        
        // Apply distance modifiers (for drift)
        if (result.distance !== undefined) {
            result.distance = base.distance * emotionMod.amplitude * undertoneMod.amplitude;
        }
        
        // Apply smoothness (affects easing)
        const smoothness = emotionMod.smoothness * undertoneMod.smoothness;
        result.smoothness = smoothness;
        result.easing = this.selectEasing(base.easing, smoothness);
        
        // Apply regularity (affects patterns)
        result.regularity = emotionMod.regularity * undertoneMod.regularity;
        
        // Add special effects based on emotion
        result.effects = [];
        if (emotionMod.addBounce) result.effects.push('bounce');
        if (emotionMod.addGravity) result.effects.push('gravity');
        if (emotionMod.addShake) result.effects.push('shake');
        if (emotionMod.addJitter) result.effects.push('shake');
        if (emotionMod.addPop) result.effects.push('pop');
        if (emotionMod.addRecoil) result.effects.push('recoil');
        if (emotionMod.addWarmth) result.effects.push('warmth');
        if (emotionMod.addFlow) result.effects.push('flow');
        if (emotionMod.addWobble) result.effects.push('wobble');
        if (emotionMod.addVibration) result.effects.push('vibration');
        if (emotionMod.addDrag) result.effects.push('drag');
        if (emotionMod.addWeight) result.effects.push('weight');
        if (emotionMod.addTension) result.effects.push('tension');
        if (emotionMod.addPrecision) result.effects.push('precision');
        
        // Add undertone effects
        if (undertoneMod.addFlutter) result.effects.push('flutter');
        if (undertoneMod.addMicroShake) result.effects.push('microShake');
        if (undertoneMod.addPower) result.effects.push('power');
        if (undertoneMod.addHold) result.effects.push('hold');
        if (undertoneMod.addDroop) result.effects.push('droop');
        if (undertoneMod.addPause) result.effects.push('pause');
        if (undertoneMod.addPulse) result.effects.push('pulse');
        if (undertoneMod.addFocus) result.effects.push('focus');
        if (undertoneMod.addSoftness) result.effects.push('softness');
        if (undertoneMod.addFade) result.effects.push('fade');
        
        // Apply gesture-specific modifications
        this.applyGestureSpecificMods(result, gesture, emotionMod, undertoneMod);
        
        // Include particleMotion if it exists in base config
        if (base.particleMotion) {
            result.particleMotion = { ...base.particleMotion };
            
            // Apply modifiers to particle motion strength
            if (result.particleMotion.strength !== undefined) {
                result.particleMotion.strength *= emotionMod.intensity * undertoneMod.intensity;
            }
            
            // Apply speed modifiers to particle motion frequency
            if (result.particleMotion.frequency !== undefined) {
                result.particleMotion.frequency *= speedMultiplier;
            }
            
            // Apply amplitude modifiers to particle motion amplitude
            if (result.particleMotion.amplitude !== undefined) {
                result.particleMotion.amplitude *= emotionMod.amplitude * undertoneMod.amplitude;
            }
        }
        
        return result;
    }
    
    /**
     * Select easing function based on smoothness
     * @param {string} baseEasing - Base easing type
     * @param {number} smoothness - Smoothness multiplier
     * @returns {string} Selected easing function
     */
    selectEasing(baseEasing, smoothness) {
        if (smoothness < 0.5) {
            return 'linear'; // Very sharp
        } else if (smoothness < 0.8) {
            return 'quad'; // Somewhat sharp
        } else if (smoothness < 1.2) {
            return baseEasing; // Normal
        } else if (smoothness < 1.5) {
            return 'cubic'; // Smooth
        } else {
            return 'sine'; // Very smooth
        }
    }
    
    /**
     * Apply gesture-specific modifications
     * @param {Object} result - Current parameters
     * @param {string} gesture - Gesture name
     * @param {Object} emotionMod - Emotion modifiers
     * @param {Object} undertoneMod - Undertone modifiers
     */
    applyGestureSpecificMods(result, gesture, emotionMod, undertoneMod) {
        switch(gesture) {
        case 'bounce':
            // Angry bounce is more violent
            if (emotionMod.addShake) {
                result.frequency = Math.floor(result.frequency * 1.5);
            }
            // Sad bounce barely leaves ground
            if (emotionMod.addGravity) {
                result.amplitude *= 0.6;
                result.frequency = 1;
            }
            break;
                
        case 'pulse':
            // Love pulse is like a heartbeat
            if (emotionMod.addWarmth) {
                result.frequency = 2; // Double beat
                result.glowAmount *= 1.5;
            }
            // Nervous pulse is irregular
            if (undertoneMod.addFlutter) {
                result.irregular = true;
            }
            break;
                
        case 'shake':
            // Fear shake is more intense
            if (emotionMod.addJitter) {
                result.frequency *= 1.5;
                result.amplitude *= 1.2;
            }
            // Anger shake is violent
            if (emotionMod.addShake) {
                result.amplitude *= 1.5;
                result.decay = false; // Sustained shaking
            }
            break;
                
        case 'spin':
            // Joy spin has extra rotations
            if (emotionMod.addBounce) {
                result.rotations *= 1.5;
            }
            // Confused spin reverses direction
            if (emotionMod.addWobble) {
                result.wobble = true;
            }
            break;
                
            // Add more gesture-specific modifications as needed
        }
    }
    
    /**
     * Clear the cache (useful when configs change)
     */
    clearCache() {
        this.cache.clear();
    }
}

export default GestureCompositor;