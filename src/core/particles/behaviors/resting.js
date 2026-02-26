/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Resting Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Ultra-slow movement for deeply relaxed states
 * @author Emotive Engine Team
 * @module particles/behaviors/resting
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an atmosphere of deep calm and rest. Particles barely move, creating
 * ║ a meditative, peaceful environment. Like watching dust motes in sunlight.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ·
 *       · ·         ← barely moving
 *      · · ·        ← vertical drift only
 *     · ⭐ ·        ← no horizontal motion
 *      · · ·
 *       · ·
 *        ·
 *
 * USED BY EMOTIONS:
 * - sleepy (deep rest)
 * - meditative
 * - tranquil
 *
 * RECIPE TO MODIFY:
 * - Decrease upwardSpeed for even slower movement
 * - Increase lifeDecay for shorter-lived particles
 * - Add tiny horizontal drift for slight variation
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize resting behavior for a particle
 * Sets up minimal movement
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeResting(particle) {
    particle.vx = 0; // NO horizontal movement
    particle.vy = -0.01; // Tiniest upward drift
    particle.lifeDecay = 0.001; // Very slow fade - particles last 10+ seconds

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    particle.behaviorData = {
        upwardSpeed: 0.00002, // Barely perceptible upward drift
        friction: 0.999, // Almost no friction (preserve any motion)
    };
}

/**
 * Update resting behavior - ultra-slow vertical drift
 *
 * Used for: SLEEPY/MEDITATIVE emotions (deep rest, tranquility)
 * Visual effect: Particles drift upward so slowly they appear almost still,
 *                creating a deeply peaceful atmosphere
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (unused)
 * @param {number} centerY - Y coordinate of the orb's center (unused)
 */
export function updateResting(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;

    // STEP 1: Apply friction to vertical velocity only
    // This creates a very gentle deceleration
    // Math.pow ensures frame-rate independence
    particle.vy *= Math.pow(data.friction, dt);

    // STEP 2: Add tiny continuous upward drift
    // Negative value because canvas Y increases downward
    // Multiplied by dt for frame-rate independence
    particle.vy -= data.upwardSpeed * dt;

    // STEP 3: Enforce NO horizontal movement
    // This creates the characteristic vertical-only drift
    // Essential for the peaceful, non-chaotic feel
    particle.vx = 0;
}

// Export behavior definition for registry
export default {
    name: 'resting',
    emoji: '😴',
    description: 'Ultra-slow vertical drift for deep rest states',
    initialize: initializeResting,
    update: updateResting,
};
