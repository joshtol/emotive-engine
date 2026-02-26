/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Repelling Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particles pushed away from center for aversion states
 * @author Emotive Engine Team
 * @module particles/behaviors/repelling
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a space of rejection with particles being pushed away from the center,
 * ║ maintaining a minimum distance. Conveys disgust, rejection, and boundaries.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    ← - - - →
 *    ↖       ↗       ← particles pushed away
 *  - - (  ) - -      ← empty zone around center
 *    ↙       ↘       ← minimum distance maintained
 *    ← - - - →
 *
 * USED BY EMOTIONS:
 * - disgust (keeping things at bay)
 * - contempt
 * - aversion
 *
 * RECIPE TO MODIFY:
 * - Increase repelStrength for stronger push
 * - Increase minDistance for larger empty zone
 * - Adjust damping for smoother/rougher motion
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize repelling behavior for a particle
 * Sets up repulsion from center
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeRepelling(particle) {
    particle.vx = 0;
    particle.vy = 0;
    particle.lifeDecay = 0.01; // Moderate life

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    particle.behaviorData = {
        repelStrength: 0.8, // How strongly to push away
        minDistance: 50, // Minimum distance from center
        initialized: false, // Track if initial repel has been applied
    };
}

/**
 * Update repelling behavior - particles maintain distance from center
 *
 * Used for: DISGUST emotion (keeping unpleasant things away)
 * Visual effect: Particles are pushed away from center and maintain a
 *                minimum distance, creating an empty zone
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (canvas center)
 * @param {number} centerY - Y coordinate of the orb's center (canvas center)
 */
export function updateRepelling(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;

    // STEP 1: Calculate distance from center
    // dx/dy = distance from center to particle (can be negative)
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    // dist = straight-line distance using Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);

    // STEP 2: Apply repelling force if too close to center
    // This ensures particles maintain minimum distance
    if (!data.initialized || distance < data.minDistance) {
        if (distance > 0) {
            // Calculate repel force (stronger when closer)
            // Math.max(distance, 5) prevents division by very small numbers
            const repelForce = data.repelStrength / Math.max(distance, 5);

            // Apply force in direction away from center
            // dx/distance = unit vector component pointing away
            // Multiply by dt for frame-rate independence
            particle.vx += (dx / distance) * repelForce * dt;
            particle.vy += (dy / distance) * repelForce * dt;
        }
        data.initialized = true;
    }

    // STEP 3: Apply gentle damping to smooth motion
    // This prevents infinite acceleration and creates natural deceleration
    // Math.pow ensures frame-rate independence
    particle.vx *= Math.pow(0.99, dt);
    particle.vy *= Math.pow(0.99, dt);
}

// Export behavior definition for registry
export default {
    name: 'repelling',
    emoji: '🚫',
    description: 'Particles pushed away from center, maintaining distance',
    initialize: initializeRepelling,
    update: updateRepelling,
};
