/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rising Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Buoyant upward movement for joyful states
 * @author Emotive Engine Team
 * @module particles/behaviors/rising
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a buoyant, uplifting atmosphere with particles rising like bubbles        
 * ║ or balloons. Slight horizontal drift adds organic movement.                       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *      ↗  ↑  ↖
 *     ·  ·  ·    ← particles rise with drift
 *    ·  ·  ·  
 *   ·  ⭐  ·     ← orb center
 *    ·  ·  ·
 *     ·  ·  ·
 * 
 * USED BY EMOTIONS:
 * - joy (subtle happiness)
 * - optimism
 * 
 * RECIPE TO MODIFY:
 * - Increase buoyancy for faster rising (like helium balloons)
 * - Increase driftAmount for more side-to-side movement
 * - Decrease air resistance for longer-lasting momentum
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

/**
 * Initialize rising behavior for a particle
 * Sets up buoyant upward movement with gentle drift
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeRising(particle) {
    particle.vx = (Math.random() - 0.5) * 0.02;  // Even slower horizontal drift
    particle.vy = -0.05 - Math.random() * 0.03;   // Much slower upward movement
    particle.lifeDecay = 0.002;                   // Very slow decay
    particle.baseOpacity = 0.7 + Math.random() * 0.3;  // More opaque (70-100%)
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        buoyancy: 0.001,      // Even gentler upward force
        driftAmount: 0.005    // Minimal drift
    };
}

/**
 * Update rising behavior each frame
 * Applies buoyancy and gentle drift
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateRising(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;
    
    // Add buoyancy (upward force)
    particle.vy -= data.buoyancy * dt;
    
    // Add horizontal drift
    particle.vx += (Math.random() - 0.5) * data.driftAmount * dt;
    
    // Apply air resistance (frame-independent)
    particle.vx *= Math.pow(0.995, dt);
    particle.vy *= Math.pow(0.998, dt);
}

// Export behavior definition for registry
export default {
    name: 'rising',
    emoji: '🎈',
    description: 'Buoyant upward movement like balloons',
    initialize: initializeRising,
    update: updateRising
};