/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Focused Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'focused',
    emoji: '🎯',
    description: 'Intense concentration with directed flow',
    
    visual: {
        glowColor: '#00CED1',
        glowIntensity: 1.2,
        particleRate: 10,
        minParticles: 5,
        maxParticles: 12,
        particleBehavior: 'directed',
        breathRate: 1.2,
        breathDepth: 0.08,
        coreJitter: true,
        particleColors: [
            { color: '#00CED1', weight: 30 },
            { color: '#4A9FA0', weight: 20 },
            { color: '#00FFFF', weight: 20 },
            { color: '#5FE5E7', weight: 15 },
            { color: '#006B6D', weight: 15 }
        ],
        eyeOpenness: 0.7,
        microAdjustments: true
    },
    
    modifiers: {
        speed: 1.0,
        amplitude: 0.9,
        intensity: 1.1,
        smoothness: 1.1,
        regularity: 1.2,
        addPrecision: true
    },
    
    typicalGestures: ['track', 'lock', 'scan', 'pulse', 'vibrate'],
    transitions: { duration: 400, easing: 'easeIn', priority: 5 },
    
    getCoreParams: function(state) {
        return {
            scaleX: 1.1,
            scaleY: 0.7,  // Narrowed for concentration
            eyeOpenness: 0.7,
            eyeExpression: 'focused',
            pupilOffset: { x: 0, y: 0 },
            microAdjustments: true  // Small tracking movements
        };
    }
};