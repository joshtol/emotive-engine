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
    
    visual: {
        glowColor: '#7B68EE',
        glowIntensity: 0.8,
        particleRate: 12,
        minParticles: 4,
        maxParticles: 16,
        particleBehavior: 'scattering',
        breathRate: 2.5,
        breathDepth: 0.06,
        coreJitter: true,
        particleColors: [
            { color: '#7B68EE', weight: 30 },
            { color: '#9A91C4', weight: 20 },
            { color: '#6A4FFF', weight: 20 },
            { color: '#A296F3', weight: 15 },
            { color: '#5445A0', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 1.4,
        amplitude: 0.8,
        intensity: 1.2,
        smoothness: 0.5,
        regularity: 0.5,
        addJitter: true
    },
    
    typicalGestures: ['shake', 'vibrate', 'contract', 'flicker', 'retreat'],
    transitions: { duration: 400, easing: 'easeOut', priority: 7 }
};