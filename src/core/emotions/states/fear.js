/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fear Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'fear',
    emoji: '😨',
    description: 'Anxious state with fleeing particles',
    
    // Visual properties
    visual: {
        glowColor: '#7B68EE',       // Anxious violet tone
        glowIntensity: 0.8,         // Subdued, uncertain glow
        particleRate: 12,           // Rapid nervous emission
        minParticles: 4,            // Constant anxious presence
        maxParticles: 16,           // Scattered fearful display
        particleBehavior: 'scattering', // Particles flee outward
        breathRate: 2.5,            // Rapid, shallow breathing
        breathDepth: 0.06,          // Short, panicked breaths
        coreJitter: true,           // Trembling with anxiety
        particleColors: [
            { color: '#7B68EE', weight: 30 },  // Primary fearful violet
            { color: '#9A91C4', weight: 20 },  // Pale anxious lavender
            { color: '#6A4FFF', weight: 20 },  // Intense panic purple
            { color: '#A296F3', weight: 15 },  // Light fear highlights
            { color: '#5445A0', weight: 15 }   // Deep dread shadows
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.4,        // Quick, reactive movements
        amplitude: 0.8,    // Restricted, defensive range
        intensity: 1.2,    // Heightened fight-or-flight response
        smoothness: 0.5,   // Jerky, startled transitions
        regularity: 0.5,   // Unpredictable panic patterns
        addJitter: true    // Nervous trembling overlay
    },
    
    // Typical gestures for fear
    typicalGestures: ['shake', 'vibrate', 'contract', 'flicker', 'retreat'],
    
    // Transition configuration
    transitions: { 
        duration: 400,       // Quick fear response
        easing: 'easeOut',  // Sudden onset
        priority: 7         // High alert priority
    }
};