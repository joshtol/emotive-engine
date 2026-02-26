/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Radiant Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particles radiating outward like sun rays for euphoric states
 * @author Emotive Engine Team
 * @module particles/behaviors/radiant
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a euphoric atmosphere with particles bursting outward like sunbeams,
 * ║ with shimmering and twinkling effects. Perfect for moments of pure joy and hope.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ☀️
 *    ✨  ↗  ✨       ← particles radiate outward
 *  ✨ ↖ ⭐ ↗ ✨     ← orb center (like the sun)
 *    ✨  ↘  ✨       ← with shimmer effect
 *        ☀️
 *
 * USED BY EMOTIONS:
 * - euphoria (first day of spring, sunrise vibes)
 * - elation
 * - triumph
 *
 * RECIPE TO MODIFY:
 * - Increase radialSpeed for faster radiation
 * - Increase shimmerSpeed for faster twinkling
 * - Adjust friction for longer/shorter rays
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize radiant behavior for a particle
 * Sets up sunburst radiation pattern
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializeRadiant(particle) {
    // Particles burst outward from center like sunbeams
    const angle = Math.random() * PHYSICS.TWO_PI;
    const speed = 0.8 + Math.random() * 0.4; // Moderate to fast speed
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.lifeDecay = 0.006; // Moderate life - last ~8-10 seconds

    // Use emotion colors if provided, otherwise default sunrise colors
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    } else {
        // Default golden sunrise colors
        const colors = ['#FFD700', '#FFB347', '#FFA500', '#FF69B4'];
        particle.color = selectWeightedColor(colors);
    }

    // More particles have glow for radiant effect
    particle.hasGlow = Math.random() < 0.7; // 70% chance of glow
    particle.glowSizeMultiplier = particle.hasGlow ? 1.5 + Math.random() * 0.5 : 0;

    particle.behaviorData = {
        // Continuous outward radiation
        radialSpeed: 0.02, // Constant outward acceleration
        shimmer: Math.random() * PHYSICS.TWO_PI, // Initial shimmer phase
        shimmerSpeed: 0.1, // Shimmer oscillation speed
        friction: 0.99, // Very light friction for long rays
    };
}

/**
 * Update radiant behavior - particles radiate outward like sun rays
 *
 * Used for: EUPHORIA emotion (first day of spring, sunrise vibes)
 * Visual effect: Particles burst outward from center like sunbeams, with a
 *                shimmering/twinkling effect as they travel
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (canvas center)
 * @param {number} centerY - Y coordinate of the orb's center (canvas center)
 */
export function updateRadiant(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;

    // STEP 1: Calculate this particle's direction from the orb center
    // dx/dy = distance from center to particle (can be negative)
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    // dist = straight-line distance using Pythagorean theorem
    const dist = Math.sqrt(dx * dx + dy * dy);

    // STEP 2: Push particle outward from center (like sun rays)
    if (dist > 0) {
        // Convert dx/dy into a unit vector (length = 1) pointing away from center
        // This gives us pure direction without magnitude
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Add velocity in the outward direction
        // radialSpeed controls how fast particles shoot outward
        // Multiply by dt to make movement frame-rate independent
        particle.vx += dirX * data.radialSpeed * dt;
        particle.vy += dirY * data.radialSpeed * dt;
    }

    // STEP 3: Create shimmering effect (particles twinkle as they radiate)
    // Increment shimmer phase over time (shimmerSpeed controls twinkle rate)
    data.shimmer += data.shimmerSpeed * dt;
    // Create sine wave oscillation (-1 to 1)
    const shimmerEffect = Math.sin(data.shimmer);
    // Make particle size pulse: baseSize ± 20%
    particle.size = particle.baseSize * (1 + shimmerEffect * 0.2);
    // Make particle opacity pulse: baseOpacity ± 30%
    particle.opacity = particle.baseOpacity * (1 + shimmerEffect * 0.3);

    // STEP 4: Apply friction to slow particles over time
    // This prevents infinite acceleration and creates natural deceleration
    particle.vx *= Math.pow(data.friction, dt);
    particle.vy *= Math.pow(data.friction, dt);
}

// Export behavior definition for registry
export default {
    name: 'radiant',
    emoji: '☀️',
    description: 'Particles radiate outward like sunbeams',
    initialize: initializeRadiant,
    update: updateRadiant,
};
