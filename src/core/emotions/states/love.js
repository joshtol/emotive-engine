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
    
    visual: {
        glowColor: '#FF69B4',
        glowIntensity: 1.6,
        particleRate: 25,
        minParticles: 10,
        maxParticles: 18,
        particleBehavior: 'orbiting',
        breathRate: 0.75,
        breathDepth: 0.15,
        coreJitter: false,
        particleColors: [
            { color: '#FF69B4', weight: 25 },
            { color: '#FFB6C1', weight: 20 },
            { color: '#FF1493', weight: 15 },
            { color: '#FFC0CB', weight: 15 },
            { color: '#FFE4E1', weight: 10 },
            { color: '#FFCCCB', weight: 10 },
            { color: '#C71585', weight: 5 }
        ]
    },
    
    modifiers: {
        speed: 0.9,
        amplitude: 1.1,
        intensity: 1.2,
        smoothness: 1.4,
        regularity: 1.2,
        addWarmth: true
    },
    
    typicalGestures: ['pulse', 'sway', 'orbit', 'glow', 'breathe', 'float'],
    transitions: { duration: 700, easing: 'easeInOut', priority: 5 }
};