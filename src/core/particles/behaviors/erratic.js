/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Erratic Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Nervous, jittery movement for anxious states
 * @author Emotive Engine Team
 * @module particles/behaviors/erratic
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a nervous, unstable atmosphere with particles jittering and changing       
 * ║ direction unpredictably. Conveys anxiety, nervousness, and instability.           
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    ↗↙↖  ↘↗
 *   ↙ ↗↘  ↖↙       ← unpredictable changes
 *  ↘↖ ⭐ ↗↙        ← jittery movement
 *   ↗ ↙↖  ↘↗       ← nervous energy
 *    ↙↗↘  ↖↙
 * 
 * USED BY EMOTIONS:
 * - nervous (anxiety, jitters)
 * - unstable
 * - agitated
 * 
 * RECIPE TO MODIFY:
 * - Increase jitterStrength for more shaking
 * - Increase directionChangeRate for more frequent changes
 * - Increase speedVariation for more erratic speed changes
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize erratic behavior for a particle
 * Sets up nervous, jittery movement
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeErratic(particle) {
    // Random, chaotic initial direction
    const angle = Math.random() * PHYSICS.TWO_PI;
    const speed = 0.1 + Math.random() * 0.15;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.lifeDecay = 0.004;  // Shorter lived due to nervous energy
    
    particle.size = (2 + Math.random() * 4) * 
        (particle.scaleFactor || 1) * 
        (particle.particleSizeMultiplier || 1);  // Varied sizes scaled
    particle.baseSize = particle.size;
    particle.baseOpacity = 0.4 + Math.random() * 0.3;  // More visible
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        jitterStrength: 0.02,        // Random direction changes
        directionChangeRate: 0.1,    // How often to change direction
        speedVariation: 0.3,         // Speed changes randomly
        spinRate: 0.05 + Math.random() * 0.1  // Particles spin
    };
}

/**
 * Update erratic behavior - nervous, jittery movement
 * 
 * Used for: NERVOUS/ANXIOUS emotions (anxiety, instability, agitation)
 * Visual effect: Particles jitter nervously, changing direction and speed
 *                unpredictably, creating an unstable atmosphere
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (unused)
 * @param {number} centerY - Y coordinate of the orb's center (unused)
 */
export function updateErratic(particle, dt) {
    const data = particle.behaviorData;
    
    // STEP 1: Add constant jitter to movement
    // Creates the nervous shaking effect
    // (Math.random() - 0.5) gives values between -0.5 and 0.5
    // Multiplied by jitterStrength and dt for controlled chaos
    particle.vx += (Math.random() - 0.5) * data.jitterStrength * dt;
    particle.vy += (Math.random() - 0.5) * data.jitterStrength * dt;
    
    // STEP 2: Randomly change direction occasionally
    // Creates unpredictable movement patterns
    // Math.min ensures probability doesn't exceed reasonable bounds
    if (Math.random() < Math.min(data.directionChangeRate * dt, 0.5)) {
        // Pick new random direction
        const newAngle = Math.random() * PHYSICS.TWO_PI;
        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        
        // Apply new direction while maintaining similar speed
        particle.vx = Math.cos(newAngle) * currentSpeed;
        particle.vy = Math.sin(newAngle) * currentSpeed;
    }
    
    // STEP 3: Vary the speed randomly
    // Creates erratic acceleration/deceleration
    const speedMultiplier = 1 + (Math.random() - 0.5) * data.speedVariation * dt;
    particle.vx *= speedMultiplier;
    particle.vy *= speedMultiplier;
    
    // STEP 4: Apply spin to particle size
    // Makes particles appear to rotate/vibrate
    const spinPhase = particle.age * data.spinRate * 1000;
    particle.size = particle.baseSize * (1 + Math.sin(spinPhase) * 0.2);
    
    // STEP 5: Fluctuate opacity nervously
    // Creates a flickering effect
    particle.opacity = particle.baseOpacity * (0.8 + Math.random() * 0.4);
    
    // STEP 6: Apply damping to prevent infinite acceleration
    // Keeps movement bounded
    particle.vx *= Math.pow(0.98, dt);
    particle.vy *= Math.pow(0.98, dt);
    
    // STEP 7: Cap maximum velocity
    // Prevents particles from moving too fast
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > 0.5) {
        particle.vx = (particle.vx / speed) * 0.5;
        particle.vy = (particle.vy / speed) * 0.5;
    }
}

// Export behavior definition for registry
export default {
    name: 'erratic',
    emoji: '😰',
    description: 'Nervous jittery movement for anxious states',
    initialize: initializeErratic,
    update: updateErratic
};