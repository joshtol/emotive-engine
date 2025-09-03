/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ◐ ◑ ◒ ◓  EMOTION MODIFIERS  ◓ ◒ ◑ ◐                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotion Modifiers - How Emotions Affect Gesture Animation
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module EmotionModifiers
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Defines how EMOTIONS modify GESTURES. While emotionMap.js handles visuals         
 * ║ (colors, particles), this file controls how emotions affect MOVEMENT.             
 * ║ A happy bounce is different from a sad bounce - this is where that's defined.     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 HOW IT WORKS                                                                   
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Base Gesture (gestureConfig.js) × Emotion Modifier × Undertone Modifier           
 * │ = Final Animation                                                                 
 * │                                                                                    
 * │ Example: Bounce + Joy = Faster, bigger, bouncier animation                        
 * │          Bounce + Sadness = Slower, smaller, heavier animation                    
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📊 MULTIPLIER PROPERTIES (Applied to Base Gesture)                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • speed        : Animation speed (0.5=half, 2.0=double)                           
 * │ • amplitude    : Movement size (0.5=smaller, 2.0=bigger)                          
 * │ • intensity    : Effect strength (0.5=subtle, 2.0=extreme)                        
 * │ • smoothness   : Animation curve (0.3=sharp, 1.5=very smooth)                     
 * │ • regularity   : Pattern consistency (0.5=chaotic, 1.0=regular)                   
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ✨ SPECIAL EFFECT FLAGS (Boolean)                                                 
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • addBounce    : Extra springiness (joy)                                          
 * │ • addGravity   : Downward pull (sadness)                                          
 * │ • addShake     : Violent tremor (anger)                                           
 * │ • addJitter    : Nervous shaking (fear)                                           
 * │ • addPop       : Sudden expansion (surprise)                                       
 * │ • addRecoil    : Pull back effect (disgust)                                       
 * │ • addWarmth    : Gentle pulsing (love)                                            
 * │ • addFlow      : Smooth motion (thinking, zen)                                    
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔗 RELATIONSHIP TO OTHER FILES                                                    
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ INPUT:  gestureConfig.js provides base gesture parameters                         
 * │ MODIFY: This file applies emotional modifications                                 
 * │ STACK:  undertoneModifiers.js adds additional nuance                              
 * │ OUTPUT: GestureCompositor.js combines all three                                   
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT ADD HERE                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Visual properties (colors, glow)  → use emotionMap.js                          
 * │ ✗ Particle behaviors                → use emotionMap.js                          
 * │ ✗ Base gesture definitions          → use gestureConfig.js                       
 * │ ✗ Undertone variations              → use undertoneModifiers.js                  
 * │ ✗ State machine logic               → use EmotiveStateMachine.js                 
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                         ADDING NEW EMOTION MODIFIERS                              
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Add emotion object with all 5 base multipliers (default to 1.0)                
 * ║ 2. Consider what makes this emotion's movement unique                             
 * ║ 3. Add special effect flags if needed (addXXX properties)                         
 * ║ 4. Test with ALL gestures for unexpected combinations                             
 * ║ 5. Document the intended "feel" with comments                                     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export const EMOTION_MODIFIERS = {
    neutral: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0,
        regularity: 1.0
    },
    
    joy: {
        speed: 1.2,        // 20% faster
        amplitude: 1.2,    // 20% bigger movements
        intensity: 1.1,    // 10% more intense
        smoothness: 1.0,   // Normal smoothness
        regularity: 0.9,   // Slightly bouncy/irregular
        addBounce: true    // Extra springiness
    },
    
    sadness: {
        speed: 0.7,        // 30% slower
        amplitude: 0.6,    // 40% smaller movements
        intensity: 0.8,    // 20% less intense
        smoothness: 1.3,   // 30% smoother/heavier
        regularity: 1.1,   // More regular/predictable
        addGravity: true   // Downward tendency
    },
    
    anger: {
        speed: 1.5,        // 50% faster
        amplitude: 1.4,    // 40% bigger movements
        intensity: 1.3,    // 30% more intense
        smoothness: 0.3,   // 70% less smooth (sharp)
        regularity: 0.7,   // More erratic
        addShake: true     // Angry tremor
    },
    
    fear: {
        speed: 1.4,        // 40% faster
        amplitude: 0.8,    // 20% smaller (cowering)
        intensity: 1.2,    // 20% more intense
        smoothness: 0.5,   // 50% less smooth (jittery)
        regularity: 0.5,   // Very irregular
        addJitter: true    // Nervous shaking
    },
    
    surprise: {
        speed: 1.6,        // 60% faster
        amplitude: 1.5,    // 50% bigger movements
        intensity: 1.4,    // 40% more intense
        smoothness: 0.7,   // 30% less smooth (sudden)
        regularity: 0.8,   // Somewhat irregular
        addPop: true       // Sudden start
    },
    
    disgust: {
        speed: 0.9,        // 10% slower
        amplitude: 0.7,    // 30% smaller (recoiling)
        intensity: 0.9,    // 10% less intense
        smoothness: 0.8,   // 20% less smooth
        regularity: 1.0,   // Regular
        addRecoil: true    // Pull away motion
    },
    
    love: {
        speed: 0.9,        // 10% slower (gentle)
        amplitude: 1.1,    // 10% bigger (expansive)
        intensity: 1.2,    // 20% more intense (warm)
        smoothness: 1.4,   // 40% smoother
        regularity: 1.2,   // Very regular (steady heartbeat)
        addWarmth: true    // Glowing effect
    },
    
    zen: {
        speed: 0.6,        // 40% slower
        amplitude: 0.8,    // 20% smaller
        intensity: 0.7,    // 30% less intense
        smoothness: 1.5,   // 50% smoother
        regularity: 1.3,   // Very regular
        addFlow: true      // Flowing motion
    },
    
    confused: {
        speed: 0.8,        // 20% slower
        amplitude: 0.9,    // 10% smaller
        intensity: 0.9,    // 10% less intense
        smoothness: 0.9,   // 10% less smooth
        regularity: 0.6,   // Irregular (uncertain)
        addWobble: true    // Uncertain wobble
    },
    
    excited: {
        speed: 1.4,        // 40% faster
        amplitude: 1.3,    // 30% bigger
        intensity: 1.3,    // 30% more intense
        smoothness: 0.8,   // 20% less smooth (energetic)
        regularity: 0.7,   // Irregular (spontaneous)
        addVibration: true // Excited vibration
    },
    
    bored: {
        speed: 0.6,        // 40% slower
        amplitude: 0.5,    // 50% smaller
        intensity: 0.6,    // 40% less intense
        smoothness: 1.2,   // 20% smoother (lazy)
        regularity: 1.1,   // Regular (monotonous)
        addDrag: true      // Sluggish movement
    },
    
    tired: {
        speed: 0.5,        // 50% slower
        amplitude: 0.4,    // 60% smaller
        intensity: 0.5,    // 50% less intense
        smoothness: 1.4,   // 40% smoother (heavy)
        regularity: 0.9,   // Slightly irregular (drowsy)
        addWeight: true    // Heavy, drooping motion
    },
    
    frustrated: {
        speed: 1.3,        // 30% faster
        amplitude: 1.2,    // 20% bigger
        intensity: 1.2,    // 20% more intense
        smoothness: 0.4,   // 60% less smooth (tense)
        regularity: 0.6,   // Irregular (agitated)
        addTension: true   // Tense, restricted motion
    },
    
    focused: {
        speed: 1.0,        // Normal speed
        amplitude: 0.9,    // 10% smaller (controlled)
        intensity: 1.1,    // 10% more intense
        smoothness: 1.1,   // 10% smoother (precise)
        regularity: 1.2,   // Very regular (controlled)
        addPrecision: true // Precise, controlled motion
    }
};

/**
 * Get emotion modifier for a specific emotion
 * @param {string} emotion - Name of the emotion
 * @returns {Object} Modifier object with default values if emotion not found
 */
export function getEmotionModifier(emotion) {
    return EMOTION_MODIFIERS[emotion] || EMOTION_MODIFIERS.neutral;
}