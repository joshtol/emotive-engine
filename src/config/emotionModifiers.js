/**
 * Emotion modifiers for gestures
 * Defines how each emotion affects gesture parameters
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