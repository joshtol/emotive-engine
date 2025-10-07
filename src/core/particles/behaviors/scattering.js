/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scattering Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particles fleeing from center for fear states
 * @author Emotive Engine Team
 * @module particles/behaviors/scattering
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an anxious atmosphere with particles frantically fleeing from the center. 
 * ║ Conveys fear, panic, and the desire to escape.                                    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    ← · · · →
 *    ↖       ↗       ← particles flee outward
 *  · · ⭐ · ·       ← orb center (source of fear)
 *    ↙       ↘
 *    ← · · · →
 * 
 * USED BY EMOTIONS:
 * - fear (panic, anxiety)
 * - startled
 * - nervous
 * 
 * RECIPE TO MODIFY:
 * - Increase fleeSpeed for more frantic escape
 * - Increase panicFactor for more erratic fleeing
 * - Add jitter for nervous shaking while fleeing
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize scattering behavior for a particle
 * Sets up fleeing movement away from center
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeScattering(particle) {
    // Will be set relative to center in update
    particle.vx = 0;
    particle.vy = 0;
    particle.lifeDecay = 0.008;  // Live longer to spread further
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        fleeSpeed: 2.0,     // Much faster fleeing
        panicFactor: 1.2,   // More panicked movement
        initialized: false
    };
}

/**
 * Update scattering behavior each frame
 * Particles flee away from center with panic
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X position
 * @param {number} centerY - Orb center Y position
 */
export function updateScattering(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // Initialize flee direction if not done
    if (!data.initialized) {
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            particle.vx = (dx / distance) * data.fleeSpeed;
            particle.vy = (dy / distance) * data.fleeSpeed;
        } else {
            // If at center, pick random direction
            const angle = Math.random() * PHYSICS.TWO_PI;
            particle.vx = Math.cos(angle) * data.fleeSpeed;
            particle.vy = Math.sin(angle) * data.fleeSpeed;
        }
        data.initialized = true;
    }
    
    // Continue fleeing with panic factor
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        // Add acceleration away from center
        particle.vx += (dx / distance) * data.panicFactor * 0.01 * dt;
        particle.vy += (dy / distance) * data.panicFactor * 0.01 * dt;
    }
    
    // Add nervous jitter
    particle.vx += (Math.random() - 0.5) * 0.1 * dt;
    particle.vy += (Math.random() - 0.5) * 0.1 * dt;
    
    // Apply friction
    particle.vx *= Math.pow(0.98, dt);
    particle.vy *= Math.pow(0.98, dt);
}

// Export behavior definition for registry
export default {
    name: 'scattering',
    emoji: '😨',
    description: 'Particles flee from center in panic',
    initialize: initializeScattering,
    update: updateScattering
};