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
        glowIntensity: 1.5,         // Stronger energetic aura
        particleRate: 25,           // Increased emission frequency (was 15)
        minParticles: 8,            // More constant particles (was 5)
        maxParticles: 30,           // More maximum particles (was 20)
        particleBehavior: 'burst',  // Explosive particle behavior
        breathRate: 2.0,            // Quick, excited breathing
        breathDepth: 0.14,          // Deep, energized breaths
        coreJitter: true,           // Vibrating with enthusiasm
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
                amplitude: 0.03,        // Moderate vibration
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
    }
};
