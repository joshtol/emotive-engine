/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Disgust Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'disgust',
    emoji: '🤢',
    description: 'Revulsion with repelling particles',
    
    visual: {
        glowColor: '#84CFC5',
        glowIntensity: 0.9,
        particleRate: 12,
        minParticles: 5,
        maxParticles: 12,
        particleBehavior: 'repelling',
        breathRate: 0.7,
        breathDepth: 0.04,
        coreJitter: false,
        particleColors: [
            { color: '#84CFC5', weight: 30 },
            { color: '#9BB8B3', weight: 20 },
            { color: '#00FFD9', weight: 20 },
            { color: '#A8E6DD', weight: 15 },
            { color: '#4A8A80', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 0.9,
        amplitude: 0.7,
        intensity: 0.9,
        smoothness: 0.8,
        regularity: 1.0,
        addRecoil: true
    },
    
    typicalGestures: ['contract', 'shake', 'recoil', 'wobble'],
    transitions: { duration: 600, easing: 'easeIn', priority: 4 }
};