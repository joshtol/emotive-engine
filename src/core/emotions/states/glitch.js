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
        primaryColor: '#00FFAA',    // Bright digital cyan-green
        glowColor: '#00FFAA',       // Bright digital cyan-green
        glowIntensity: 2.2,         // Intense, flickering energy
        particleRate: 30,           // High rate for glitchy effect
        minParticles: 12,           // Constant digital noise
        maxParticles: 20,           // Maximum chaos
        particleBehavior: 'glitchy', // New glitch behavior
        particleSpeed: 1.5,         // Fast, erratic speeds
        breathRate: 0.3,            // Rapid, stuttering breaths
        breathDepth: 0.08,          // Shallow, digital hiccups
        coreJitter: 0.04,           // Constant digital tremor
        coreSize: 1.1,              // Slightly enlarged core
        eyeOpenness: 1.0,           // Wide open eyes
        particleColors: [
            { color: '#00FFAA', weight: 25 },  // Bright cyan-green
            { color: '#FF00AA', weight: 20 },  // Hot magenta
            { color: '#00FF00', weight: 15 },  // Pure digital green
            { color: '#FF0099', weight: 15 },  // Neon pink
            { color: '#00FFFF', weight: 10 },  // Electric cyan
            { color: '#FFAA00', weight: 8 },   // Digital amber warning
            { color: '#FF00FF', weight: 5 },   // Pure magenta glitch
            { color: '#FFFFFF', weight: 2 }    // Rare white static
        ],
        // Glitch-specific properties
        glitchIntensity: 0.8,      // How intense the glitching is
        flickerChance: 0.05,       // 5% chance per frame to flicker
        rgbShift: true,            // Enable RGB channel separation
        digitalNoise: true,        // Add digital noise pattern
        getGlowIntensity() {
            // Random intensity flickers
            if (Math.random() < this.flickerChance) {
                return 0.2 + Math.random() * 2.5;
            }
            return this.glowIntensity;
        },
        getGlowColor() {
            // Occasionally shift to random glitch colors
            if (Math.random() < 0.02) {
                const glitchColors = ['#FF00AA', '#00FFFF', '#FF0099', '#00FFAA', '#FFAA00'];
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