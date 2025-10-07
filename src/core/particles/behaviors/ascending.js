/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ascending Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Slow, steady upward float for zen and meditative states
 * @author Emotive Engine Team
 * @module particles/behaviors/ascending
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a zen atmosphere with particles rising like incense smoke. Slow, steady,  
 * ║ and ethereal movement that gradually fades as particles ascend.                   
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↑
 *       ~~~        ← gentle wave motion
 *        ↑
 *       ~~~        ← like incense smoke
 *        ↑
 *      ⭐⭐⭐      ← orb center
 *        
 * 
 * USED BY EMOTIONS:
 * - zen (deep meditation)
 * - contemplative
 * - spiritual
 * 
 * RECIPE TO MODIFY:
 * - Decrease ascensionSpeed for slower rise
 * - Increase waveFactor for more horizontal drift
 * - Adjust fadeStartDistance to control when fade begins
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize ascending behavior for a particle
 * Sets up slow, steady upward movement
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeAscending(particle) {
    // Very slow, steady upward movement
    particle.vx = (Math.random() - 0.5) * 0.02;  // Minimal horizontal drift
    particle.vy = -0.03 - Math.random() * 0.02;  // Slow upward movement (0.03-0.05)
    particle.lifeDecay = 0.0008;  // Very long-lived particles (30+ seconds)
    
    // Larger, more ethereal particles for zen
    particle.size = (6 + Math.random() * 6) * 
        (particle.scaleFactor || 1) * 
        (particle.particleSizeMultiplier || 1) * 
        1.33;  // 1.33x larger for zen (reduced from 2x)
    particle.baseSize = particle.size;
    particle.baseOpacity = 0.2 + Math.random() * 0.2;  // Very translucent (20-40%)
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        // Continuous gentle upward drift
        ascensionSpeed: 0.0003,      // Very gentle continuous upward
        waveFactor: 0.5,             // Subtle horizontal wave motion
        waveFrequency: 0.001,        // Very slow wave oscillation
        friction: 0.998,             // Almost no slowdown
        fadeStartDistance: 100       // Start fading after rising 100px
    };
}

/**
 * Update ascending behavior - slow upward float like incense
 * 
 * Used for: ZEN/CONTEMPLATIVE emotions (meditation, spirituality)
 * Visual effect: Particles rise slowly and steadily with subtle wave motion,
 *                gradually fading as they ascend like incense smoke
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (unused)
 * @param {number} centerY - Y coordinate of the orb's center (unused)
 */
export function updateAscending(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // Validate data exists
    if (!data) {
        initializeAscending(particle);
        return;
    }
    
    // STEP 1: Apply friction to velocities
    // Very light friction to maintain smooth motion
    // Math.pow ensures frame-rate independence
    particle.vx *= Math.pow(data.friction, dt);
    particle.vy *= Math.pow(data.friction, dt);
    
    // STEP 2: Add continuous upward ascension
    // Negative because canvas Y increases downward
    // Multiplied by dt for frame-rate independence
    particle.vy -= data.ascensionSpeed * dt;
    
    // STEP 3: Add subtle wave motion for organic feel
    // Creates the characteristic incense smoke waviness
    // Age gives us time-based oscillation
    const waveOffset = Math.sin(particle.age * data.waveFrequency * 1000) * data.waveFactor;
    particle.vx += waveOffset * 0.001 * dt;
    
    // STEP 4: Track initial Y position for fade calculation
    if (particle.initialY === undefined) {
        particle.initialY = particle.y;
    }
    
    // STEP 5: Calculate distance traveled upward
    const distanceTraveled = particle.initialY - particle.y;
    
    // STEP 6: Start fading after traveling fadeStartDistance pixels
    // This creates the incense smoke dissipation effect
    if (distanceTraveled > data.fadeStartDistance) {
        const fadeProgress = (distanceTraveled - data.fadeStartDistance) / 100;
        const fadeFactor = Math.max(0, 1 - fadeProgress);
        particle.baseOpacity *= 0.995;  // Gradual fade
        
        // Accelerate life decay as particle fades
        if (fadeFactor < 0.5) {
            particle.lifeDecay *= 1.02;
        }
    }
    
    // STEP 7: Dampen excessive horizontal movement
    // Keeps the ascension primarily vertical
    if (Math.abs(particle.vx) > 0.05) {
        particle.vx *= Math.pow(0.95, dt);
    }
    
    // STEP 8: Cap upward velocity for consistency
    // Prevents particles from accelerating too much
    if (particle.vy < -0.1) {
        particle.vy = -0.1;
    }
}

// Export behavior definition for registry
export default {
    name: 'ascending',
    emoji: '🧘',
    description: 'Slow steady upward float like incense smoke',
    initialize: initializeAscending,
    update: updateAscending
};