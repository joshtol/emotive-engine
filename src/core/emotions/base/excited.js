/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Excited Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Excited emotional state - high energy with rapid particles (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/excited
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'excited',
    emoji: '🤩',
    description: 'High energy with rapid particles',

    // Visual properties
    visual: {
        glowColor: '#FF6B35',       // Vibrant orange-red energy
        particleRate: 50,           // Increased emission frequency for 3D
        minParticles: 10,           // More constant particles for 3D
        maxParticles: 80,           // More maximum particles for 3D
        particleBehavior: 'burst',  // Explosive particle behavior
        breathRate: 2.0,            // Quick, excited breathing
        breathDepth: 0.14,          // Deep, energized breaths
        coreJitter: true,           // Vibrating with enthusiasm
        blinkRate: 1.5,             // More frequent blinking (energetic)
        blinkSpeed: 1.2,            // Faster blink animation (snappier)
        particleColors: [
            { color: '#FF6B35', weight: 25 },  // Vibrant orange energy
            { color: '#FF1744', weight: 20 },  // Red accent excitement
            { color: '#FFC107', weight: 15 },  // Amber sparkle
            { color: '#FF9100', weight: 15 },  // Deep orange burst
            { color: '#FFEB3B', weight: 10 },  // Yellow flash
            { color: '#FF5722', weight: 10 },  // Deep orange-red
            { color: '#FFF59D', weight: 5 }    // Pale yellow highlight
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.4,         // Quickened, energetic pace
        amplitude: 1.3,     // Expansive, enthusiastic movements
        intensity: 1.3,     // Strong energetic force
        smoothness: 0.8,    // Smooth with energetic bursts
        regularity: 0.7,    // Spontaneous, varied patterns
        addVibration: true  // Buzzing with excitement
    },

    // Typical gestures for excitement
    typicalGestures: ['bounce', 'spin', 'vibrate', 'expand', 'shake', 'pulse'],

    // Transition configuration
    transitions: {
        duration: 300,              // Quick state entry
        easing: 'easeOutElastic',  // Bouncy, elastic entrance
        priority: 6                // High-energy priority level
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'unstable',           // Vibrating pattern - buzzing with excitement
            speed: 1.4,                 // Fast rotation (matches modifiers.speed)
            axes: [0, 0.4, 0],          // Faster Y-axis spin (more energetic than neutral)
            shake: {
                amplitude: 0.01,        // Subtle vibration (reduced to not overcome righting)
                frequency: 4.0          // High-frequency buzzing
            },
            musicSync: false            // Could sync to music in future
        },
        glow: {
            color: '#FF6B35',           // Vibrant orange-red (matches visual.glowColor)
            intensity: 1.5,             // Strong energetic aura
            pulse: {
                speed: 2.0,             // Quick pulsing (matches breathRate)
                range: [1.0, 1.8]       // Strong pulse variation
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.14,            // Deep energized breaths (matches breathDepth)
                rate: 2.0               // Quick breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 1.5,        // Energy movement speed - rapid, buzzing
        shimmerSpeed: 2.0,      // Vertical pulse speed - vibrant pulsing
        turbulence: 0.5         // Chaos/randomness factor - energetic chaos
    }
};
