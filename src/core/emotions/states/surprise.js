/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Surprise Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'surprise',
    emoji: '😲',
    description: 'Sudden shock with explosive particles',
    
    // Visual properties
    visual: {
        glowColor: '#FFAB40',       // Bright orange shock
        glowIntensity: 1.5,         // Intense, sudden glow
        particleRate: 30,           // Rapid burst emission
        minParticles: 0,            // Can start from nothing
        maxParticles: 15,           // Burst of shocked particles
        particleBehavior: 'burst',  // Explosive outward motion
        breathRate: 0.3,            // Gasping, held breath
        breathDepth: 0.18,          // Large shocked inhale
        coreJitter: false,          // Frozen in surprise
        particleColors: [
            { color: '#FFAB40', weight: 30 },  // Primary shock orange
            { color: '#C4A373', weight: 20 },  // Muted surprise tone
            { color: '#FF9800', weight: 20 },  // Bright startle burst
            { color: '#FFC773', weight: 15 },  // Light shock highlights
            { color: '#B3772D', weight: 15 }   // Deep surprise shadows
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.6,         // Rapid, startled reactions
        amplitude: 1.5,     // Large, exaggerated movements
        intensity: 1.4,     // Strong shock force
        smoothness: 0.7,    // Abrupt, jerky motions
        regularity: 0.8,    // Erratic surprise patterns
        addPop: true        // Popping, explosive effect
    },
    
    // Typical gestures for surprise
    typicalGestures: ['expand', 'bounce', 'flash', 'pulse', 'pop'],
    
    // Transition configuration
    transitions: { 
        duration: 200,           // Instant shock response
        easing: 'easeOutBack',  // Snappy, elastic reaction
        priority: 6             // High interrupt priority
    }
};