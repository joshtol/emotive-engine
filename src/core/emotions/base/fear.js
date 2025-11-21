/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fear Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fear emotional state - anxious state with fleeing particles (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/fear
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'fear',
    emoji: '😨',
    description: 'Anxious state with fleeing particles',

    // Visual properties
    visual: {
        glowColor: '#8A2BE2',       // Dark violet (BlueViolet) - more ominous
        particleRate: 18,           // More rapid nervous emission
        minParticles: 4,            // Constant anxious presence
        maxParticles: 16,           // Scattered fearful display
        particleBehavior: 'scattering', // Particles flee outward
        breathRate: 2.5,            // Rapid, shallow breathing
        breathDepth: 0.06,          // Short, panicked breaths
        coreJitter: true,           // Trembling with anxiety
        blinkRate: 1.7,             // Very frequent blinking (anxious)
        blinkSpeed: 1.4,            // Faster blink animation (nervous)
        particleColors: [
            { color: '#8A2BE2', weight: 25 },  // Dark violet base
            { color: '#4B0082', weight: 20 },  // Indigo dread
            { color: '#9400D3', weight: 15 },  // Dark violet panic
            { color: '#6B46C1', weight: 15 },  // Deep purple anxiety
            { color: '#9932CC', weight: 10 },  // Dark orchid fear
            { color: '#E6E6FA', weight: 8 },   // Pale lavender flash
            { color: '#301934', weight: 7 }    // Almost black shadow
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.4,        // Quick, reactive movements
        amplitude: 0.8,    // Restricted, defensive range
        intensity: 1.2,    // Heightened fight-or-flight response
        smoothness: 0.5,   // Jerky, startled transitions
        regularity: 0.5,   // Unpredictable panic patterns
        addJitter: true    // Nervous trembling overlay
    },

    // Typical gestures for fear
    typicalGestures: ['shake', 'vibrate', 'contract', 'flicker', 'retreat'],

    // Transition configuration
    transitions: {
        duration: 400,       // Quick fear response
        easing: 'easeOut',  // Sudden onset
        priority: 7         // High alert priority
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'unstable',           // Trembling, jerky pattern - anxious shaking
            speed: 1.4,                 // Faster rotation (matches modifiers.speed)
            axes: [0, 0.3, 0],          // Only Y-axis base spin
            shake: {
                amplitude: 0.015,       // Subtle trembling (reduced to not overcome righting)
                frequency: 3.5          // Rapid shaking (higher than anger)
            },
            musicSync: false            // Fear doesn't sync to music - chaotic
        },
        glow: {
            color: '#8A2BE2',           // Dark violet (matches visual.glowColor)
            intensity: 0.9,             // Pulsing glow
            pulse: {
                speed: 2.5,             // Rapid pulsing (matches breathRate)
                range: [0.6, 1.2]       // Moderate pulse range
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.06,            // Short panicked breaths (matches breathDepth)
                rate: 2.5               // Rapid breathing (matches breathRate)
            }
        }
    }

    // Note: Black hole behavior auto-derives from modifiers (speed: 1.4, intensity: 1.2, smoothness: 0.5)
    // Results in: faster disk rotation, high turbulence, stronger doppler effect, brighter shadow glow
};
