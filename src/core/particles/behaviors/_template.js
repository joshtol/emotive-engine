/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - [YOUR BEHAVIOR NAME] Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview [DESCRIBE WHAT THIS BEHAVIOR DOES]
 * @author [YOUR NAME]
 * @module particles/behaviors/[filename]
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                          🎮 BEHAVIOR TEMPLATE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This is a template for creating new particle behaviors!
 * ║
 * ║ TO CREATE A NEW BEHAVIOR:
 * ║ 1. Copy this file and rename it (e.g., sparkle.js)
 * ║ 2. Fill in the sections marked with [BRACKETS]
 * ║ 3. Implement your initialize and update functions
 * ║ 4. Import it in behaviors/index.js
 * ║ 5. Add it to the BEHAVIORS array
 * ║ 6. Use it in emotionMap.js!
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 * [DRAW YOUR BEHAVIOR HERE]
 * Example:
 *     ✨ ← particle
 *    ╱ ╲
 *   ⭐   → orb
 *    ╲ ╱
 *     ✨
 *
 * USED BY EMOTIONS:
 * - [LIST EMOTIONS THAT USE THIS]
 *
 * RECIPE TO MODIFY:
 * - [WHAT TO CHANGE FOR DIFFERENT EFFECTS]
 * - [ANOTHER THING TO TRY]
 * - [ETC]
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
// import { PHYSICS } from '../config/physics.js';
// import { PLAYGROUND } from '../config/playground.js';

/**
 * Initialize [YOUR BEHAVIOR] behavior for a particle
 * [DESCRIBE WHAT HAPPENS DURING INITIALIZATION]
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeYourBehavior(particle) {
    // Set particle lifespan
    particle.lifeDecay = 0.01; // Adjust based on how long particles should last

    // Set particle color from emotion palette
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    // Set initial velocities
    particle.vx = 0; // Horizontal velocity
    particle.vy = 0; // Vertical velocity

    // Create behavior-specific data
    particle.behaviorData = {
        // Add your behavior's properties here
        // Examples:
        // speed: 1.0,
        // angle: Math.random() * PHYSICS.TWO_PI,
        // phase: 0,
        // customProperty: 'value'
    };
}

/**
 * Update [YOUR BEHAVIOR] behavior each frame
 * [DESCRIBE WHAT HAPPENS EACH FRAME]
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time, typically ~16.67 for 60fps)
 * @param {number} centerX - Orb center X position
 * @param {number} centerY - Orb center Y position
 */
export function updateYourBehavior(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;

    // YOUR UPDATE LOGIC HERE
    // Examples:

    // Apply physics
    // particle.vx += someForce * dt;
    // particle.vy += PHYSICS.GRAVITY * dt;

    // Update position directly
    // particle.x += particle.vx * dt;
    // particle.y += particle.vy * dt;

    // Or set position based on calculation
    // particle.x = centerX + Math.cos(data.angle) * data.radius;
    // particle.y = centerY + Math.sin(data.angle) * data.radius;

    // Update visual properties
    // particle.opacity = Math.sin(data.phase) * 0.5 + 0.5;
    // particle.size = particle.baseSize * (1 + Math.sin(data.phase) * 0.2);
}

// Export behavior definition for registry
export default {
    name: '[behaviorname]', // MUST match filename (without .js)
    emoji: '🎯', // Pick a fun emoji for your behavior
    description: '[One line description of what this does]',
    initialize: initializeYourBehavior,
    update: updateYourBehavior,
};
