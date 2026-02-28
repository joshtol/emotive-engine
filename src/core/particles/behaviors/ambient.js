/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ambient Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Gentle upward drift behavior for neutral emotional state
 * @author Emotive Engine Team
 * @module particles/behaviors/ambient
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a calm, peaceful atmosphere with particles gently drifting upward
 * ║ like smoke or steam. This is the default behavior for neutral emotional states.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↑  ↑  ↑
 *       ·  ·  ·    ← particles drift straight up
 *      ·  ·  ·
 *     ·  ⭐  ·     ← orb center
 *      ·  ·  ·
 *       ·  ·  ·
 *
 * USED BY EMOTIONS:
 * - neutral (default calm state)
 *
 * RECIPE TO MODIFY:
 * - Increase upwardSpeed for faster rising (more energy)
 * - Decrease friction for longer-lasting momentum
 * - Add waviness for side-to-side motion (currently disabled)
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize ambient behavior for a particle
 * Sets up initial velocities and behavior-specific data
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeAmbient(particle) {
    // Start with gentle upward movement
    particle.vx = 0; // NO horizontal drift
    particle.vy = -0.04 - Math.random() * 0.02; // Slower upward movement
    particle.lifeDecay = 0.002; // Even slower fade - particles last ~8 seconds

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    particle.behaviorData = {
        // Languid upward drift
        upwardSpeed: 0.0005, // Very slow continuous upward drift
        waviness: 0, // NO side-to-side (set to 0.5-2 for wave motion)
        friction: 0.998, // Even more gradual slowdown
    };
}

/**
 * Update ambient behavior each frame
 * Applies gentle upward drift with air resistance
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused but kept for consistency)
 * @param {number} centerY - Orb center Y (unused but kept for consistency)
 */
export function updateAmbient(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;

    // Apply friction to y velocity only (frame-rate independent)
    // Use exponential decay: friction^dt where dt is normalized to 60fps
    particle.vy *= Math.pow(data.friction, dt);

    // Add continuous upward drift
    particle.vy -= data.upwardSpeed * dt;

    // NO horizontal movement or waviness (straight up)
    particle.vx = 0;
}

// Export behavior definition for registry
export default {
    name: 'ambient',
    emoji: '☁️',
    description: 'Gentle upward drift like smoke',
    initialize: initializeAmbient,
    update: updateAmbient,
};
