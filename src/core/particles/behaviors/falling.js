/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Falling Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Heavy downward drift for sad emotional states
 * @author Emotive Engine Team
 * @module particles/behaviors/falling
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a melancholic atmosphere with particles slowly falling like tears         
 * ║ or autumn leaves. Heavy, weighted movement conveys sadness.                       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *     ·  ·  ·
 *    ·  ·  ·  
 *   ·  ⭐  ·     ← orb center
 *    ·  ·  ·
 *     ·  ·  ·    ← particles fall slowly
 *      ↓  ↓  ↓
 * 
 * USED BY EMOTIONS:
 * - sadness (melancholy, grief)
 * - disappointment
 * - tired
 * 
 * RECIPE TO MODIFY:
 * - Increase gravity for heavier falling (more weight)
 * - Decrease drag for faster falling (less air resistance)
 * - Add horizontal drift for leaf-like falling
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize falling behavior for a particle
 * Sets up slow, heavy downward movement
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeFalling(particle) {
    // Exact copy of ambient but falling DOWN instead of up
    particle.vx = 0;  // NO horizontal drift
    particle.vy = 0.04 + Math.random() * 0.02;  // Same speed as ambient but downward (positive = down)
    particle.lifeDecay = 0.002;  // Same as ambient

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    // Generate random 3D direction for uniform sphere distribution
    // This is used by the 3D translator for positioning
    const u1 = Math.random();
    const u2 = Math.random();
    const theta = u1 * Math.PI * 2;
    const cosPhi = 2.0 * u2 - 1.0;
    const sinPhi = Math.sqrt(1.0 - cosPhi * cosPhi);

    particle.behaviorData = {
        downwardSpeed: 0.0005,  // Same as ambient's upwardSpeed
        friction: 0.998,        // Same as ambient
        // 3D direction for translator (uniform sphere distribution)
        fallingDir: {
            x: sinPhi * Math.cos(theta),
            y: cosPhi,
            z: sinPhi * Math.sin(theta)
        },
        // Random orbit distance (0.7x to 1.1x core radius, actual value set by translator)
        orbitDistanceRatio: 0.7 + Math.random() * 0.4
    };
}

/**
 * Update falling behavior each frame
 * Mirror of ambient but falling DOWN instead of rising up
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateFalling(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;

    // Apply friction to y velocity only (frame-rate independent)
    // Use exponential decay: friction^dt where dt is normalized to 60fps
    particle.vy *= Math.pow(data.friction, dt);

    // Add continuous downward drift (opposite of ambient's upward)
    particle.vy += data.downwardSpeed * dt;

    // NO horizontal movement (zen-like straight down, like ambient goes straight up)
    particle.vx = 0;
}

// Export behavior definition for registry
export default {
    name: 'falling',
    emoji: '💧',
    description: 'Heavy downward drift like tears',
    initialize: initializeFalling,
    update: updateFalling
};