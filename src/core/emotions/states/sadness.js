/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sadness Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sadness emotional state - melancholic sorrow
 * @author Emotive Engine Team
 * @module emotions/states/sadness
 */

export default {
    name: 'sadness',
    emoji: '😢',
    description: 'Deep melancholic sorrow',
    
    visual: {
        glowColor: '#4090CE',
        glowIntensity: 0.7,
        particleRate: 25,
        minParticles: 0,
        maxParticles: 25,
        particleBehavior: 'falling',
        breathRate: 0.6,
        breathDepth: 0.12,
        coreJitter: false,
        particleColors: [
            { color: '#4090CE', weight: 30 },
            { color: '#6B97B8', weight: 20 },
            { color: '#00A0FF', weight: 20 },
            { color: '#70B8E8', weight: 15 },
            { color: '#2A5A86', weight: 15 }
        ]
    },
    
    modifiers: {
        speed: 0.7,
        amplitude: 0.6,
        intensity: 0.8,
        smoothness: 1.3,
        regularity: 1.1,
        addGravity: true
    },
    
    typicalGestures: [
        'droop',
        'sway',
        'contract',
        'drift',
        'sink'
    ],
    
    transitions: {
        duration: 800,
        easing: 'easeInOut',
        priority: 3
    }
};