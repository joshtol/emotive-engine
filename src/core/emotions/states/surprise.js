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
    
    visual: {
        glowColor: '#FFAB40',
        glowIntensity: 1.5,
        particleRate: 30,
        minParticles: 0,
        maxParticles: 15,
        particleBehavior: 'burst',
        breathRate: 0.3,
        breathDepth: 0.18,
        coreJitter: false,
        particleColors: [
            { color: '#FFAB40', weight: 30 },
            { color: '#C4A373', weight: 20 },
            { color: '#FF9800', weight: 20 },
            { color: '#FFC773', weight: 15 },
            { color: '#B3772D', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 1.6,
        amplitude: 1.5,
        intensity: 1.4,
        smoothness: 0.7,
        regularity: 0.8,
        addPop: true
    },
    
    typicalGestures: ['expand', 'bounce', 'flash', 'pulse', 'pop'],
    transitions: { duration: 200, easing: 'easeOutBack', priority: 6 }
};