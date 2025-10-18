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
    particle.vx = (Math.random() - 0.5) * 0.03;   // MUCH slower horizontal drift
    particle.vy = 0.05 + Math.random() * 0.05;    // MUCH slower falling
    particle.lifeDecay = 0.002;                   // Very slow decay
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        gravity: 0.002,       // Very gentle gravity
        drag: 0.995           // High drag for slow fall
    };
}

/**
 * Update falling behavior each frame
 * Applies gravity with air resistance
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateFalling(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // Apply gravity
    particle.vy += data.gravity * dt;
    
    // Apply drag (frame-independent)
    particle.vx *= Math.pow(data.drag, dt);
    particle.vy *= Math.pow(data.drag, dt);
    
    // Limit terminal velocity
    if (particle.vy > 2) {
        particle.vy = 2;
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