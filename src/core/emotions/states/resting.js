/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Resting Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'resting',
    emoji: '😴',
    description: 'Deep relaxation with slow drift',
    
    visual: {
        glowColor: '#9370DB',
        glowIntensity: 0.8,
        particleRate: 10,
        minParticles: 3,
        maxParticles: 5,
        particleBehavior: 'resting',
        breathRate: 0.8,
        breathDepth: 0.12,
        coreJitter: false,
        particleColors: [
            { color: '#9370DB', weight: 30 },
            { color: '#A591C4', weight: 20 },
            { color: '#B366FF', weight: 20 },
            { color: '#B8A1E6', weight: 15 },
            { color: '#674D9B', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 0.5,
        amplitude: 0.4,
        intensity: 0.5,
        smoothness: 1.4,
        regularity: 0.9,
        addWeight: true
    },
    
    typicalGestures: ['breathe', 'drift', 'sway', 'float'],
    transitions: { duration: 1000, easing: 'easeInOut', priority: 2 }
};