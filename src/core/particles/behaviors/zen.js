/**
 * Calm Particle Behavior
 * Particles drift peacefully with minimal, smooth movement
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

// Behavior configuration
const config = {
    baseSpeed: 0.08, // Very slow base movement
    driftSpeed: 0.02, // Minimal drift speed
    fadeSpeed: 0.0008, // Very slow fade
    sizeChange: 0.0002, // Minimal size variation
    swayAmplitude: 3, // Gentle horizontal sway
    floatAmplitude: 2, // Minimal vertical float
    rotationSpeed: 0.0001, // Barely perceptible rotation
    minOpacity: 0.15, // Minimum visibility
    maxOpacity: 0.35, // Maximum visibility (subtle)
    breathingPeriod: 8000, // 8 second breathing cycle
    connectionDistance: 0, // No connections between particles
    centerAttraction: 0.00005, // Very slight pull to center
};

/**
 * Initialize a particle with calm properties
 * @param {Object} particle - The particle to initialize
 */
export function initializeCalm(particle) {
    // Start with faster initial burst movement
    particle.vx = (Math.random() - 0.5) * 0.5; // Increased 5x from 0.1
    particle.vy = (Math.random() - 0.5) * 0.5; // Increased 5x from 0.1
    particle.lifeDecay = 0.003; // Moderate fade (particles last ~5-6 seconds)

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    // Calm-specific behavior data
    particle.behaviorData = {
        orbitAngle: Math.random() * Math.PI * 2, // Starting angle around center
        orbitRadius: 40 + Math.random() * 60, // Distance from center (40-100 pixels)
        orbitSpeed: 0.0008 + Math.random() * 0.0006, // Faster orbit speed (4x)
        floatOffset: Math.random() * Math.PI * 2,
        breathingOffset: Math.random() * Math.PI * 2,
        lifetime: 0,
    };
}

/**
 * Update calm behavior each frame
 * @param {Object} particle - The particle to update
 * @param {number} dt - Delta time
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 */
export function updateCalm(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    if (!data) return;

    data.lifetime += dt;

    // Breathing effect (very subtle size change)
    const breathPhase =
        (data.lifetime + data.breathingOffset * config.breathingPeriod) / config.breathingPeriod;
    const breathIntensity = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;

    // Apply subtle size pulsing
    particle.size = particle.baseSize * (0.95 + breathIntensity * 0.05);

    // Slow orbital movement around the mascot
    data.orbitAngle += data.orbitSpeed * dt;

    // Vary the orbit radius slightly over time for organic movement
    const radiusVariation = Math.sin(data.lifetime * 0.0001 + data.floatOffset) * 10;
    const currentRadius = data.orbitRadius + radiusVariation;

    // Calculate target position in orbit
    const targetX = centerX + Math.cos(data.orbitAngle) * currentRadius;
    const targetY = centerY + Math.sin(data.orbitAngle) * currentRadius;

    // Add vertical floating motion
    const floatY = Math.sin(data.lifetime * 0.0003 + data.breathingOffset) * 15;

    // Smoothly move toward orbital position
    const dx = targetX - particle.x;
    const dy = targetY + floatY - particle.y;

    // Faster movement toward target position
    particle.vx = dx * 0.03; // Faster following (3x)
    particle.vy = dy * 0.03; // Faster following (3x)

    // Add more random drift for organic feel
    particle.vx += (Math.random() - 0.5) * 0.02; // More drift
    particle.vy += (Math.random() - 0.5) * 0.02; // More drift

    // Apply very light friction
    particle.vx *= 0.98;
    particle.vy *= 0.98;
}

// Export behavior definition for registry
export default {
    name: 'zen',
    emoji: '☯️',
    description: 'Peaceful orbital movement like a hovering aura',
    initialize: initializeCalm,
    update: updateCalm,
};
