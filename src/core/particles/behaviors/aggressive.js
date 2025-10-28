/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Aggressive Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sharp, chaotic movement for angry emotional states
 * @author Emotive Engine Team
 * @module particles/behaviors/aggressive
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an intense, volatile atmosphere with particles moving erratically.        
 * ║ Sharp jitters and sudden bursts of movement convey anger and frustration.         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *      ⚡→    ←⚡
 *        ↘  ↙       ← erratic, sharp movements
 *    ⚡← ⭐ →⚡      ← orb center (shaking)
 *        ↗  ↖
 *      ⚡←    →⚡
 * 
 * USED BY EMOTIONS:
 * - anger (rage, fury)
 * - frustration
 * - irritation
 * 
 * RECIPE TO MODIFY:
 * - Increase jitter for more chaotic movement
 * - Increase acceleration for more violent bursts
 * - Decrease speedDecay for longer-lasting energy
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize aggressive behavior for a particle
 * Sets up chaotic, sharp movement patterns
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeAggressive(particle) {
    const angle = Math.random() * PHYSICS.TWO_PI;
    const speed = 1.5 + Math.random() * 2;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.lifeDecay = 0.015;
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        acceleration: 0.05,
        jitter: 0.3,
        speedDecay: 0.95
    };
}

/**
 * Update aggressive behavior each frame
 * Applies jitter and random acceleration bursts
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateAggressive(particle, dt, _centerX, _centerY) {
    const data = particle.behaviorData;
    
    // Add jitter to movement
    particle.vx += (Math.random() - 0.5) * data.jitter * dt;
    particle.vy += (Math.random() - 0.5) * data.jitter * dt;
    
    // Apply speed decay (frame-independent)
    particle.vx *= Math.pow(data.speedDecay, dt);
    particle.vy *= Math.pow(data.speedDecay, dt);
    
    // Occasionally add burst of acceleration
    // Scale probability with frame time
    if (Math.random() < Math.min(0.05 * dt, 0.5)) {
        const angle = Math.random() * PHYSICS.TWO_PI;
        particle.vx += Math.cos(angle) * data.acceleration;
        particle.vy += Math.sin(angle) * data.acceleration;
    }
}

// Export behavior definition for registry
export default {
    name: 'aggressive',
    emoji: '⚡',
    description: 'Sharp, chaotic movement with violent bursts',
    initialize: initializeAggressive,
    update: updateAggressive
};