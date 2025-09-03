/**
 * Undertone modifiers for gestures
 * Defines how undertones affect gesture parameters
 * These stack on top of emotion modifiers
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
    if (!undertone || undertone === '') {
        return UNDERTONE_MODIFIERS.none;
    }
    return UNDERTONE_MODIFIERS[undertone] || UNDERTONE_MODIFIERS.none;
}