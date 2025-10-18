/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Connecting Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Chaotic particles drawn to center for social connection states
 * @author Emotive Engine Team
 * @module particles/behaviors/connecting
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an energetic social atmosphere with particles moving chaotically but       
 * ║ staying connected to the center. Like a lively party or bustling community.       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    ↗↘ ↖↙ ↗↘
 *   ↙ ↗ ↘ ↖ ↙       ← chaotic but connected
 *  ↘ ↖ ⭐ ↗ ↙       ← drawn to center
 *   ↗ ↙ ↖ ↘ ↗       ← higher energy than ambient
 *    ↙↖ ↗↘ ↙↖
 * 
 * USED BY EMOTIONS:
 * - curiosity (social exploration)
 * - playfulness
 * - engagement
 * 
 * RECIPE TO MODIFY:
 * - Increase attractionForce for stronger pull to center
 * - Increase chaosFactor for more erratic movement
 * - Decrease friction for more energetic motion
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize connecting behavior for a particle
 * Sets up chaotic but connected movement
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeConnecting(particle) {
    // Original Emotive connecting: speed 2-7, higher chaos
    const angle = Math.random() * PHYSICS.TWO_PI;
    const speed = 2 + Math.random() * 5; // Faster than ambient
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.lifeDecay = 0.012; // Shorter life for more dynamic feel
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        // Higher attraction and chaos for connecting state
        attractionForce: 0.008,  // Stronger pull (original)
        chaosFactor: 1.0,        // Higher chaos (original)
        friction: 0.95          // Less friction than ambient
    };
}

/**
 * Update connecting behavior - chaotic movement with center attraction
 * 
 * Used for: CURIOSITY/SOCIAL emotions (engaged, exploring, connecting)
 * Visual effect: Particles move chaotically but are drawn back to center,
 *                creating a bustling, connected atmosphere
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center (canvas center)
 * @param {number} centerY - Y coordinate of the orb's center (canvas center)
 */
export function updateConnecting(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // STEP 1: Apply friction to slow particles gradually
    // This prevents infinite acceleration
    // Math.pow ensures frame-rate independence
    particle.vx *= Math.pow(data.friction, dt);
    particle.vy *= Math.pow(data.friction, dt);
    
    // STEP 2: Apply attraction force towards center
    // (centerX - this.x) gives direction vector to center
    // Multiplied by attractionForce to control strength
    const attractX = (centerX - particle.x) * data.attractionForce;
    const attractY = (centerY - particle.y) * data.attractionForce;
    
    // STEP 3: Add chaos for erratic movement
    // (Math.random() - 0.5) gives random value between -0.5 and 0.5
    // Multiplied by chaosFactor for intensity
    const chaosX = (Math.random() - 0.5) * data.chaosFactor;
    const chaosY = (Math.random() - 0.5) * data.chaosFactor;
    
    // STEP 4: Combine forces
    // Attraction keeps particles connected to center
    // Chaos makes movement unpredictable and lively
    particle.vx += attractX + chaosX;
    particle.vy += attractY + chaosY;
}

// Export behavior definition for registry
export default {
    name: 'connecting',
    emoji: '🔗',
    description: 'Chaotic movement with center attraction for social states',
    initialize: initializeConnecting,
    update: updateConnecting
};