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
    
    // Visual properties
    visual: {
        glowColor: '#4090CE',       // Melancholic blue tone
        glowIntensity: 0.7,         // Diminished, subdued glow
        particleRate: 25,           // Steady tear-like emission
        minParticles: 0,            // Can fade to emptiness
        maxParticles: 25,           // Abundant sorrow display
        particleBehavior: 'falling', // Tears falling downward
        breathRate: 0.6,            // Slow, heavy breathing
        breathDepth: 0.12,          // Deep, sighing breaths
        coreJitter: false,          // Still, heavy core
        particleColors: [
            { color: '#4090CE', weight: 30 },  // Primary sorrowful blue
            { color: '#6B97B8', weight: 20 },  // Muted gray-blue
            { color: '#00A0FF', weight: 20 },  // Sharp tearful accent
            { color: '#70B8E8', weight: 15 },  // Pale sad highlights
            { color: '#2A5A86', weight: 15 }   // Deep melancholy shadows
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.7,         // Slowed, weary pace
        amplitude: 0.6,     // Diminished movement range
        intensity: 0.8,     // Weakened emotional force
        smoothness: 1.3,    // Smooth, flowing sorrow
        regularity: 1.1,    // Slightly monotonous patterns
        addGravity: true    // Downward, heavy feeling
    },
    
    // Typical gestures for sadness
    typicalGestures: [
        'droop',
        'sway',
        'contract',
        'drift',
        'sink'
    ],
    
    // Transition configuration
    transitions: {
        duration: 800,         // Gradual mood shift
        easing: 'easeInOut',  // Smooth emotional transition
        priority: 3           // Lower emotional priority
    },
};