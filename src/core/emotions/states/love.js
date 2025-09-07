/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Love Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'love',
    emoji: '💕',
    description: 'Warm affection with orbiting particles',
    
    // Visual properties
    visual: {
        glowColor: '#FF69B4',       // Warm pink affection
        glowIntensity: 1.6,         // Strong, radiant warmth
        particleRate: 25,           // Generous particle flow
        minParticles: 10,           // Constant loving presence
        maxParticles: 18,           // Abundant affection display
        particleBehavior: 'orbiting', // Particles orbit romantically
        breathRate: 0.75,           // Slow, content breathing
        breathDepth: 0.15,          // Deep, satisfied breaths
        coreJitter: false,          // Stable, secure feeling
        particleColors: [
            { color: '#FF69B4', weight: 25 },  // Primary warm pink
            { color: '#FFB6C1', weight: 20 },  // Soft rose blush
            { color: '#FF1493', weight: 15 },  // Deep passion accent
            { color: '#FFC0CB', weight: 15 },  // Gentle pink glow
            { color: '#FFE4E1', weight: 10 },  // Delicate highlights
            { color: '#FFCCCB', weight: 10 },  // Tender warmth
            { color: '#C71585', weight: 5 }    // Deep romantic undertone
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.9,         // Gentle, romantic pace
        amplitude: 1.1,     // Slightly expanded movements
        intensity: 1.2,     // Enhanced emotional depth
        smoothness: 1.4,    // Extra smooth, flowing motion
        regularity: 1.2,    // Consistent, rhythmic patterns
        addWarmth: true     // Warm, inviting quality
    },
    
    // Typical gestures for love
    typicalGestures: ['pulse', 'sway', 'orbit', 'glow', 'breathe', 'float'],
    
    // Transition configuration
    transitions: { 
        duration: 700,         // Gradual emotional shift
        easing: 'easeInOut',  // Smooth, gentle transition
        priority: 5           // Moderate emotional priority
    }
};