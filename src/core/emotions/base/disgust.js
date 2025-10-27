/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Disgust Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Disgust emotional state - revulsion with repelling particles (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/disgust
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'disgust',
    emoji: '🤢',
    description: 'Revulsion with repelling particles',

    // Visual properties
    visual: {
        glowColor: '#9ACD32',       // Sickly yellow-green (YellowGreen)
        glowIntensity: 1.0,         // Stronger, toxic glow
        particleRate: 15,           // More particles for nauseating effect
        minParticles: 5,            // Maintain visible repulsion
        maxParticles: 12,           // Controlled rejection display
        particleBehavior: 'repelling', // Particles flee from center
        breathRate: 0.7,            // Slow, queasy breathing
        breathDepth: 0.04,          // Shallow, uncomfortable breaths
        coreJitter: false,          // Stable but uneasy core
        particleColors: [
            { color: '#9ACD32', weight: 25 },  // Yellow-green toxic
            { color: '#ADFF2F', weight: 20 },  // Bright acid green
            { color: '#7FFF00', weight: 15 },  // Chartreuse nausea
            { color: '#BDB76B', weight: 15 },  // Dark khaki sick
            { color: '#6B8E23', weight: 10 },  // Olive drab decay
            { color: '#CCFF00', weight: 8 },   // Fluorescent bile
            { color: '#556B2F', weight: 7 }    // Dark olive shadow
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.9,        // Slightly slowed movements
        amplitude: 0.7,    // Restricted, withdrawn motion
        intensity: 0.9,    // Controlled repulsion force
        smoothness: 0.8,   // Mostly smooth with discomfort
        regularity: 1.0,   // Consistent rejection pattern
        addRecoil: true    // Recoiling motion effect
    },

    // Typical gestures for disgust
    typicalGestures: ['contract', 'shake', 'recoil', 'wobble'],

    // Transition configuration
    transitions: {
        duration: 600,       // Moderate transition speed
        easing: 'easeIn',   // Gradual onset of revulsion
        priority: 4         // Mid-level priority state
    }
};
