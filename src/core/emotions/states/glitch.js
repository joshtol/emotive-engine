/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glitch Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'glitch',
    emoji: '⚡',
    description: 'Digital distortion with erratic particle stutters',
    
    // Visual properties
    visual: {
        glowColor: '#00FF41',       // Matrix green primary
        glowIntensity: 2.0,         // Intense, flickering energy
        particleRate: 30,           // High rate for glitchy effect
        minParticles: 12,           // Constant digital noise
        maxParticles: 20,           // Maximum chaos
        particleBehavior: 'glitchy', // New glitch behavior
        particleSpeed: 1.5,         // Fast, erratic speeds
        breathRate: 0.3,            // Rapid, stuttering breaths
        breathDepth: 0.08,          // Shallow, digital hiccups
        coreJitter: 0.04,           // Constant digital tremor
        particleColors: [
            { color: '#00FF41', weight: 30 },  // Matrix green
            { color: '#FF00FF', weight: 25 },  // Magenta glitch
            { color: '#00FFFF', weight: 20 },  // Cyan corruption
            { color: '#FFFF00', weight: 10 },  // Yellow artifact
            { color: '#FF0080', weight: 10 },  // Pink aberration
            { color: '#FFFFFF', weight: 5 }    // White static
        ],
        // Glitch-specific properties
        glitchIntensity: 0.8,      // How intense the glitching is
        flickerChance: 0.05,       // 5% chance per frame to flicker
        rgbShift: true,            // Enable RGB channel separation
        digitalNoise: true,        // Add digital noise pattern
        getGlowIntensity: function() {
            // Random intensity flickers
            if (Math.random() < this.flickerChance) {
                return 0.2 + Math.random() * 2.5;
            }
            return this.glowIntensity;
        },
        getGlowColor: function() {
            // Occasionally shift to random glitch colors
            if (Math.random() < 0.02) {
                const glitchColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF41'];
                return glitchColors[Math.floor(Math.random() * glitchColors.length)];
            }
            return this.glowColor;
        }
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 2.0,         // Hyper-speed movements
        amplitude: 0.8,     // Constrained but erratic
        intensity: 1.8,     // High energy bursts
        smoothness: 0.1,    // Extremely jerky, stuttering motion
        regularity: 0.1,    // Completely unpredictable
        focus: 0.5,         // Scattered, unfocused
        addGlitch: true,    // Special glitch modifier
        addStutter: true    // Stuttering motion effect
    },
    
    // Typical gestures for glitch
    typicalGestures: ['twitch', 'jitter', 'breathe', 'pulse', 'shake', 'flicker'],
    
    // Transition configuration
    transitions: { 
        duration: 100,          // Instant, jarring transitions
        easing: 'linear',       // No smoothing - digital snap
        priority: 7,            // High priority disruption
        glitchIn: true          // Special glitch transition effect
    },
    
    // Special glitch properties
    special: {
        stutterInterval: 50,        // Stutter every 50ms
        stutterDuration: 20,        // Each stutter lasts 20ms
        rgbOffset: 3,               // Pixel offset for RGB separation
        scanlineEffect: true,       // Add CRT scanlines
        datamoshChance: 0.01,       // 1% chance to datamosh
        corruptionZones: 3,         // Number of corruption areas
        digitalTearHeight: 10       // Height of digital tears
    }
};