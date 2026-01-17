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
 * Sets up DRAMATIC downward movement for rain effect
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeFalling(particle) {
    // Store original position for rain effect - CAPTURE WHERE PARTICLE IS NOW
    if (!particle.fallingData) {
        particle.fallingData = {
            originalX: particle.x,
            originalY: particle.y,
            originalOpacity: particle.opacity ?? particle.life ?? 1,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.3 + Math.random() * 0.4,
            fallProgress: 0
        };
    }

    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }

    // Generate random 3D direction for uniform sphere distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const theta = u1 * Math.PI * 2;
    const cosPhi = 2.0 * u2 - 1.0;
    const sinPhi = Math.sqrt(1.0 - cosPhi * cosPhi);

    particle.behaviorData = {
        fallSpeed: 8.0,         // DRAMATIC fall speed
        fallDistance: 400,      // Total fall distance
        wobbleAmount: 1.5,      // Wind wobble
        fallingDir: {
            x: sinPhi * Math.cos(theta),
            y: cosPhi,
            z: sinPhi * Math.sin(theta)
        },
        orbitDistanceRatio: 0.7 + Math.random() * 0.4
    };
}

/**
 * Update falling behavior each frame
 * DRAMATIC falling like rain - particles fall from their captured positions
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateFalling(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;
    let fallData = particle.fallingData;

    // Initialize if not done yet
    if (!fallData) {
        initializeFalling(particle);
        fallData = particle.fallingData;
    }

    // Increment fall progress
    fallData.fallProgress += dt * 0.02; // Progress per frame
    const progress = Math.min(fallData.fallProgress, 1.0);

    // Calculate total fall based on progress
    const totalFall = data.fallDistance * progress;

    // Wind wobble
    fallData.wobblePhase += fallData.wobbleSpeed * dt * 0.1;
    const wobble = Math.sin(fallData.wobblePhase) * data.wobbleAmount;

    // DIRECTLY set particle position - fall from original captured position
    particle.x = fallData.originalX + wobble;
    particle.y = fallData.originalY + totalFall;

    // Set velocity for trail effects (doesn't affect position since we set it directly)
    particle.vx = wobble * 0.3;
    particle.vy = data.fallSpeed * 10;

    // Fade out as particles fall
    const fadeStart = 0.6;
    if (progress > fadeStart) {
        const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
        particle.opacity = fallData.originalOpacity * (1 - fadeProgress);
        if (particle.life !== undefined) {
            particle.life = fallData.originalOpacity * (1 - fadeProgress);
        }
    }
}

// Export behavior definition for registry
export default {
    name: 'falling',
    emoji: '💧',
    description: 'Heavy downward drift like tears',
    initialize: initializeFalling,
    update: updateFalling
};