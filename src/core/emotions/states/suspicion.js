/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'suspicion',
    emoji: '🤨',
    description: 'Watchful alertness with scanning particles',
    
    visual: {
        glowColor: '#8B7355',
        glowIntensity: 0.85,
        particleRate: 15,
        minParticles: 4,
        maxParticles: 8,
        particleBehavior: 'burst',
        breathRate: 0.8,
        breathDepth: 0.05,
        coreJitter: false,
        particleColors: [
            { color: '#8B7355', weight: 30 },
            { color: '#9A8A7A', weight: 20 },
            { color: '#A67C52', weight: 20 },
            { color: '#B39880', weight: 15 },
            { color: '#5C4A3A', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 0.8,
        amplitude: 0.9,
        intensity: 0.9,
        smoothness: 0.9,
        regularity: 0.6,
        addWobble: true
    },
    
    typicalGestures: ['scan', 'tilt', 'squint', 'peer', 'wobble'],
    transitions: { duration: 500, easing: 'linear', priority: 4 },
    
    special: {
        coreSquint: 0.4,
        scanInterval: 3000,
        scanDuration: 800,
        scanAngle: 45
    }
};