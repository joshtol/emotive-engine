/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Euphoria Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'euphoria',
    emoji: '🌟',
    description: 'Radiant hope and new beginnings',
    
    visual: {
        glowColor: '#FFD700',
        glowIntensity: 1.8,
        particleRate: 3,
        minParticles: 15,
        maxParticles: 30,
        particleBehavior: 'radiant',
        breathRate: 1.3,
        breathDepth: 0.25,
        coreJitter: false,
        particleColors: [
            { color: '#FFD700', weight: 30 },
            { color: '#C4B888', weight: 20 },
            { color: '#FFFF00', weight: 20 },
            { color: '#FFE57F', weight: 15 },
            { color: '#B39A00', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 1.4,
        amplitude: 1.5,
        intensity: 1.6,
        smoothness: 1.3,
        regularity: 0.8,
        addWarmth: true,
        addLift: true
    },
    
    typicalGestures: ['expand', 'radiate', 'pulse', 'glow', 'float', 'bloom'],
    transitions: { duration: 600, easing: 'easeOutExpo', priority: 8 }
};