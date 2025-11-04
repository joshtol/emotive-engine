/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glitch Emotion Base (Simplified)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Glitch emotional state - surprised sadness with rainbow colors and glitch wiggle (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/glitch
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
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

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'unstable',           // Glitchy, erratic pattern
            speed: 1.1,                 // Moderate speed (matches modifiers.speed)
            axes: [0, 0.35, 0],         // Moderate Y-axis spin
            shake: {
                amplitude: 0.02,        // Moderate glitch wobble (reduced to not overcome righting)
                frequency: 5.0          // Very high frequency glitching
            },
            musicSync: false            // Glitch is chaotic
        },
        glow: {
            color: '#FF6B9D',           // Pink surprise (matches visual.primaryColor)
            intensity: 1.2,             // Moderate intensity
            pulse: {
                speed: 0.4,             // Slow pulsing (matches breathRate)
                range: [0.8, 1.6]       // Wide pulse variation (glitchy)
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.15,            // Moderate breaths (matches breathDepth)
                rate: 0.4               // Slow breathing (matches breathRate)
            }
        }
    }
};
