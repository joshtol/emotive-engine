/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glitch Emotion (Simplified)
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'glitch',
    emoji: '🌈',
    description: 'Surprised sadness with rainbow colors and glitch wiggle',
    
    // Visual properties - simplified combination of surprise + sadness
    visual: {
        primaryColor: '#FF6B9D',    // Pink surprise
        glowColor: '#4169E1',       // Blue sadness
        glowIntensity: 1.2,         // Moderate intensity (surprise + sadness)
        particleRate: 20,           // Moderate rate
        minParticles: 5,            // Some constant presence
        maxParticles: 15,           // Moderate burst
        particleBehavior: 'burst',  // Simplified from spaz to burst
        particleSpeed: 1.0,         // Moderate speed
        breathRate: 0.4,            // Between surprise (0.3) and sadness (0.6)
        breathDepth: 0.15,          // Between surprise (0.18) and sadness (0.12)
        coreJitter: false,          // No core shake
        coreSize: 1.0,              // Normal size
        eyeOpenness: 0.8,           // Wide but not fully open
        particleColors: [
            // Enhanced rainbow colors - more vibrant and balanced
            { color: '#FF0080', weight: 18 },  // Bright magenta
            { color: '#00FF80', weight: 18 },  // Bright green
            { color: '#8000FF', weight: 18 },  // Bright purple
            { color: '#FF8000', weight: 15 },  // Bright orange
            { color: '#0080FF', weight: 15 },  // Bright blue
            { color: '#FFFF00', weight: 10 },  // Bright yellow
            { color: '#FF6B9D', weight: 6 }    // Pink surprise
        ],
        // Glitch wiggle effect for particles
        particleGlitchWiggle: true,
        glitchWiggleIntensity: 0.3,
        glitchWiggleFrequency: 0.1
    },
    
    // Gesture modifiers - simplified
    modifiers: {
        speed: 1.1,         // Moderate speed
        amplitude: 1.0,      // Normal range
        intensity: 1.1,      // Slightly elevated
        smoothness: 0.8,     // Somewhat jerky
        regularity: 0.7,     // Somewhat erratic
        focus: 0.6           // Somewhat scattered
    },
    
    // Typical gestures - simplified
    typicalGestures: ['bounce', 'sway', 'pulse', 'drift', 'flash'],
    
    // Transition configuration - simplified
    transitions: {
        duration: 300,          // Moderate transition
        easing: 'easeInOut',    // Smooth transition
        priority: 5             // Medium priority
    },

    // Rhythm configuration - glitch creates chaotic erratic patterns
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'random',
            burstSize: 8,
            burstRange: [1, 15],
            offBeatRate: 0.3,
            burstSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 7,
            intensity: 0.6
        },

        glowSync: {
            intensityRange: [0.3, 2.0],
            syncTo: 'random',
            attack: 0.01,
            decay: 0.8
        },

        patternBehaviors: {
            'breakbeat': {
                particleEmission: { burstSize: 12, burstRange: [2, 18] }
            },
            'glitch': {
                particleEmission: { burstSize: 15, burstRange: [1, 20] }
            }
        }
    }
};