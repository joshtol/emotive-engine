/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Suspicion emotional state - paranoid watchfulness with surveillance scanning (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/suspicion
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'suspicion',
    emoji: '🤨',
    description: 'Paranoid watchfulness with surveillance scanning',

    // Visual properties
    visual: {
        glowColor: '#6B46C1',       // Deep purple paranoia
        particleRate: 18,           // Increased surveillance particles
        minParticles: 6,            // More eyes watching
        maxParticles: 12,           // Heightened alert capacity
        particleBehavior: 'surveillance',  // NEW: Searchlight scanning behavior
        particleSpeed: 0.2,         // Base particle speed
        breathRate: 0.6,            // Slower, more deliberate breathing
        breathDepth: 0.04,          // Very shallow, tense breaths
        coreJitter: 0.02,           // Slight nervous tremor
        blinkRate: 1.1,             // Slightly more frequent blinking (watchful)
        blinkSpeed: 1.0,            // Normal blink animation speed
        particleColors: [
            { color: '#6B46C1', weight: 30 },  // Deep purple paranoia
            { color: '#4A5568', weight: 25 },  // Shadowy slate gray
            { color: '#8B4789', weight: 20 },  // Dark magenta mystery
            { color: '#9F7AEA', weight: 15 },  // Alert purple highlights
            { color: '#2D3748', weight: 10 }   // Deep shadow lurking
        ],
        // Dynamic threat level properties
        threatLevel: 0,             // 0-1 scale, updated by gaze distance
        getGlowIntensity() {
            return 0.3 + (this.threatLevel * 0.7);
        },
        getParticleSpeed() {
            return 0.2 + (this.threatLevel * 0.8);
        },
        getGlowColor() {
            // Color shifts from purple to red as threat increases
            const baseColor = { r: 107, g: 70, b: 193 };  // #6B46C1
            const alertColor = { r: 220, g: 38, b: 127 }; // #DC267F (magenta-red)

            const t = this.threatLevel || 0;

            const r = Math.round(baseColor.r + (alertColor.r - baseColor.r) * t);
            const g = Math.round(baseColor.g + (alertColor.g - baseColor.g) * t);
            const b = Math.round(baseColor.b + (alertColor.b - baseColor.b) * t);

            // Convert to hex
            const toHex = val => val.toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.4,         // Slower, more deliberate movements
        amplitude: 0.6,     // Smaller, controlled movements
        intensity: 1.2,     // Higher alertness
        smoothness: 0.3,    // Jerky, paranoid movements
        regularity: 0.2,    // Highly unpredictable patterns
        focus: 1.5,         // Hyper-focused attention
        addWobble: true     // Uncertain, questioning motion
    },

    // Typical gestures for suspicion
    typicalGestures: ['scan', 'twitch', 'peek', 'tilt', 'hold'],

    // Transition configuration
    transitions: {
        duration: 500,       // Moderate alertness shift
        easing: 'linear',   // Steady, controlled transition
        priority: 4         // Mid-level alert priority
    },

    // Special suspicion properties
    special: {
        coreSquint: 0.6,        // More pronounced eye narrowing
        scanInterval: 2000,     // More frequent scans
        scanDuration: 1200,     // Longer, more thorough scanning
        scanAngle: 60,          // Wider scanning range
        twitchChance: 0.02,     // 2% chance per frame to twitch
        peekInterval: 4000,     // Time between peek gestures
        maxThreatDistance: 300, // Distance for threat calculation
        alertThreshold: 0.7     // Threat level for maximum alert
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'suspicious',         // Biased toward facing forward - nervous watchfulness
            speed: 1.0,                 // Normal speed for 4-second cycle
            axes: [0, 0, 0],            // Managed by suspicious behavior (sawtooth rotation)
            musicSync: false            // Suspicion doesn't sync to music
        },
        glow: {
            color: '#6B46C1',           // Deep purple paranoia
            intensity: 0.85,            // Watchful glow
            pulse: {
                speed: 0.6,             // Slow deliberate pulse (matches breathRate)
                range: [0.7, 1.0]       // Subtle pulse (tense, controlled)
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.04,            // Very shallow breathing (matches breathDepth)
                rate: 0.6               // Slow deliberate breathing (matches breathRate)
            }
        }
    }
};
