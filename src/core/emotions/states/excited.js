/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Excited Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'excited',
    emoji: '🤩',
    description: 'High energy with rapid particles',
    
    visual: {
        glowColor: '#FF1493',
        glowIntensity: 1.3,
        particleRate: 15,
        minParticles: 5,
        maxParticles: 20,
        particleBehavior: 'burst',
        breathRate: 2.0,
        breathDepth: 0.14,
        coreJitter: true,
        particleColors: [
            { color: '#FF1493', weight: 30 },
            { color: '#C47FA8', weight: 20 },
            { color: '#FF00FF', weight: 20 },
            { color: '#FF69B4', weight: 15 },
            { color: '#B3006B', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 1.4,
        amplitude: 1.3,
        intensity: 1.3,
        smoothness: 0.8,
        regularity: 0.7,
        addVibration: true
    },
    
    typicalGestures: ['bounce', 'spin', 'vibrate', 'expand', 'shake', 'pulse'],
    transitions: { duration: 300, easing: 'easeOutElastic', priority: 6 }
};