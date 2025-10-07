/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ◐ ◑ ◒ ◓  UNDERTONE MODIFIERS  ◓ ◒ ◑ ◐                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Undertone Modifiers - Subtle Emotion Variations
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module UndertoneModifiers
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Undertones add NUANCE to emotions - like being "nervously happy" or              
 * ║ "confidently angry". These modifiers STACK on top of emotion modifiers            
 * ║ to create more complex, realistic emotional expressions.                          
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 MULTIPLIER EFFECTS (Applied to Base Gesture)                                   
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • speed        : Animation speed (0.5=half speed, 2.0=double speed)               
 * │ • amplitude    : Movement size (0.5=smaller, 2.0=bigger)                          
 * │ • intensity    : Effect strength (0.5=subtle, 2.0=extreme)                        
 * │ • smoothness   : Animation smoothing (0.5=jerky, 1.5=very smooth)                 
 * │ • regularity   : Pattern consistency (0.5=chaotic, 1.0=regular)                   
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ SPECIAL EFFECTS (Boolean Flags)                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • addFlutter      : Butterfly-like motion (nervous)                               
 * │ • addMicroShake   : Tiny trembling (nervous, tired)                               
 * │ • addPower        : Strong, decisive motion (confident)                           
 * │ • addDrag         : Sluggish, heavy motion (tired)                                
 * │ • addTension      : Tight, controlled motion (intense)                            
 * │ • addSoftness     : Gentle, flowing motion (subdued)                              
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT ADD HERE (Belongs in Other Files)                                       
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Base gesture definitions   → use gestureConfig.js                              
 * │ ✗ Emotion modifiers         → use emotionModifiers.js                            
 * │ ✗ Visual properties         → use emotionMap.js                                  
 * │ ✗ Particle behaviors        → use Particle.js                                    
 * │ ✗ State logic              → use EmotiveStateMachine.js                          
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           ADDING NEW UNDERTONES                                   
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Create new undertone object with all base multipliers (default to 1.0)         
 * ║ 2. Add special effect flags as needed (addXXX properties)                         
 * ║ 3. Test combinations with ALL emotions for unexpected interactions                
 * ║ 4. Document the intended "feel" and use cases                                     
 * ║ 5. Add to valid undertones in ErrorBoundary.js                                    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export const UNDERTONE_MODIFIERS = {
    // No undertone - neutral multipliers
    none: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0,
        regularity: 1.0
    },
    
    // Clear undertone - no modification
    clear: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0,
        regularity: 1.0
    },
    
    nervous: {
        speed: 1.2,        // 20% faster
        amplitude: 0.9,    // 10% smaller (contained)
        intensity: 1.1,    // 10% more intense
        smoothness: 0.7,   // 30% less smooth (fluttery)
        regularity: 0.6,   // Irregular (butterflies)
        addFlutter: true,  // Butterfly-like flutter
        addMicroShake: true // Subtle tremor
    },
    
    confident: {
        speed: 0.9,        // 10% slower (deliberate)
        amplitude: 1.3,    // 30% bigger (bold)
        intensity: 1.2,    // 20% more intense
        smoothness: 1.1,   // 10% smoother (controlled)
        regularity: 1.2,   // Very regular (assured)
        addPower: true,    // Strong, decisive motion
        addHold: true      // Brief pause at peaks
    },
    
    tired: {
        speed: 0.7,        // 30% slower
        amplitude: 0.7,    // 30% smaller
        intensity: 0.8,    // 20% less intense
        smoothness: 1.3,   // 30% smoother (sluggish)
        regularity: 0.8,   // Slightly irregular (drowsy)
        addDroop: true,    // Downward tendency
        addPause: true     // Occasional hesitation
    },
    
    intense: {
        speed: 1.3,        // 30% faster
        amplitude: 1.2,    // 20% bigger
        intensity: 1.4,    // 40% more intense
        smoothness: 0.6,   // 40% less smooth (sharp)
        regularity: 0.9,   // Slightly irregular
        addPulse: true,    // Pulsing intensity
        addFocus: true     // Concentrated motion
    },
    
    subdued: {
        speed: 0.8,        // 20% slower
        amplitude: 0.8,    // 20% smaller
        intensity: 0.7,    // 30% less intense
        smoothness: 1.2,   // 20% smoother
        regularity: 1.1,   // Regular (restrained)
        addSoftness: true, // Gentle, muted motion
        addFade: true      // Fading at edges
    }
};

/**
 * Get undertone modifier
 * @param {string} undertone - Name of the undertone
 * @returns {Object} Modifier object with default values if undertone not found
 */
export function getUndertoneModifier(undertone) {
    if (!undertone || undertone === '' || undertone === 'clear') {
        return UNDERTONE_MODIFIERS.clear;
    }
    return UNDERTONE_MODIFIERS[undertone] || UNDERTONE_MODIFIERS.clear;
}