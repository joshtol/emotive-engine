/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Popcorn Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spontaneous popping with bounces for joyful celebration
 * @author Emotive Engine Team
 * @module particles/behaviors/popcorn
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a celebratory atmosphere with particles that wait, then POP! and bounce
 * ║ around with gravity. Perfect for pure joy and celebration moments.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *     Stage 1: Wait      Stage 2: POP!       Stage 3: Bounce
 *         ·                  💥 ↗             ↘
 *        ···                ↖ 💥 ↗              ↓
 *       ·⭐·                  💥                 🎊 ← bounce!
 *        ···                ↙ 💥 ↘              ↑
 *         ·                  💥 ↓               ↗
 *
 * USED BY EMOTIONS:
 * - joy (celebration, happiness, excitement)
 *
 * RECIPE TO MODIFY:
 * - Decrease popDelay for faster popping (more energetic)
 * - Increase popStrength for bigger pops
 * - Adjust gravity for different bounce physics
 * - Increase maxBounces for longer bouncing
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PLAYGROUND } from '../config/playground.js';

/**
 * Initialize popcorn behavior for a particle
 * Sets up kernel waiting to pop
 *
 * @param {Particle} particle - The particle to initialize
 */
export function initializePopcorn(particle) {
    // Start with little to no movement (kernel waiting to pop)
    particle.vx = (Math.random() - 0.5) * 0.1;
    particle.vy = (Math.random() - 0.5) * 0.1;
    // Faster, more varied decay for dynamic disappearing
    particle.lifeDecay = 0.008 + Math.random() * 0.012; // Random between 0.008-0.020

    // Use emotion colors if provided, otherwise default popcorn colors
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    } else {
        // Default popcorn colors (buttery whites and yellows)
        const colors = ['#FFFFFF', '#FFFACD', '#FFF8DC', '#FFFFE0', '#FAFAD2'];
        particle.color = selectWeightedColor(colors);
    }

    // Vary sizes more dramatically - some big fluffy pieces, some small
    particle.size =
        Math.random() < 0.3
            ? (8 + Math.random() * 4) * particle.scaleFactor * particle.particleSizeMultiplier // 30% big
            : (2 + Math.random() * 4) * particle.scaleFactor * particle.particleSizeMultiplier; // 70% small
    particle.baseSize = particle.size;

    // Less glow, more solid popcorn look
    particle.hasGlow = Math.random() < 0.2; // Only 20% have glow
    particle.glowSizeMultiplier = particle.hasGlow ? 1.2 : 0;

    particle.behaviorData = {
        // Popcorn popping mechanics
        popDelay: Math.random() * PLAYGROUND.popcorn.POP_DELAY_MAX,
        hasPopped: false,
        popStrength:
            PLAYGROUND.popcorn.POP_FORCE_MIN +
            Math.random() * (PLAYGROUND.popcorn.POP_FORCE_MAX - PLAYGROUND.popcorn.POP_FORCE_MIN),

        // Physics after popping
        gravity: 0.098, // Gravity strength
        bounceDamping: PLAYGROUND.popcorn.BOUNCE_HEIGHT,
        bounceCount: 0,
        maxBounces: 2 + Math.floor(Math.random() * 2), // 2-3 bounces

        // Visual flair
        spinRate: (Math.random() - 0.5) * 10, // Rotation speed (for future use)
        lifetime: 0, // Track time since spawn
    };
}

/**
 * Update popcorn behavior each frame
 * Handles waiting, popping, and bouncing phases
 *
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X position
 * @param {number} centerY - Orb center Y position
 */
export function updatePopcorn(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    data.lifetime += dt * 16.67; // Convert to milliseconds

    // Check if it's time to pop
    if (!data.hasPopped && data.lifetime > data.popDelay) {
        // POP! Sudden burst of velocity in all directions for celebration
        data.hasPopped = true;
        const popAngle = Math.random() * Math.PI * 2; // Full 360 degree spread
        particle.vx = Math.cos(popAngle) * data.popStrength * 1.5; // Extra horizontal spread
        particle.vy = Math.sin(popAngle) * data.popStrength - 0.3; // Slight upward bias for joy

        // Expand size when popping for dramatic effect
        particle.size = particle.baseSize * 1.25;
    }

    if (data.hasPopped) {
        // Apply gravity
        particle.vy += data.gravity * dt;

        // Check for ground bounce
        const groundLevel = centerY + 100 * particle.scaleFactor; // Below the orb
        if (particle.y > groundLevel && data.bounceCount < data.maxBounces) {
            particle.y = groundLevel;
            particle.vy = -Math.abs(particle.vy) * data.bounceDamping; // Bounce up with damping
            particle.vx *= 0.9; // Reduce horizontal speed on bounce
            data.bounceCount++;

            // Shrink slightly with each bounce
            particle.size = particle.baseSize * (1.5 - data.bounceCount * 0.1);
        }

        // Fade dramatically after final bounce
        if (data.bounceCount >= data.maxBounces) {
            particle.lifeDecay = 0.03 + Math.random() * 0.02; // Very fast fade
            particle.size *= 0.95; // Also shrink rapidly
        }

        // Dynamic fading based on velocity - slower particles fade faster
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed < 0.5) {
            particle.lifeDecay *= 1.5; // 50% faster fade when moving slowly
        }
    }
}

// Export behavior definition for registry
export default {
    name: 'popcorn',
    emoji: '🍿',
    description: 'Spontaneous popping with gravity and bounces',
    initialize: initializePopcorn,
    update: updatePopcorn,
};
