/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Cautious Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Slow, careful movement with pauses for suspicious states
 * @author Emotive Engine Team
 * @module particles/behaviors/cautious
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a watchful, suspicious atmosphere with particles moving slowly and         
 * ║ pausing frequently, as if carefully observing. Like being on guard.               
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    · → · STOP
 *   STOP ← ·        ← move, then pause
 *    · ⭐ ·         ← watching center
 *   · STOP →        ← pause, then move
 *    STOP · ← ·
 * 
 * USED BY EMOTIONS:
 * - suspicion (watchful, guarded)
 * - uncertainty
 * - wariness
 * 
 * RECIPE TO MODIFY:
 * - Increase pauseDuration for longer stops
 * - Decrease moveDuration for shorter movements
 * - Adjust watchRadius to control patrol area
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize cautious behavior for a particle
 * Sets up slow, deliberate movement patterns
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeCautious(particle) {
    // Particles move very slowly and deliberately
    const angle = Math.random() * PHYSICS.TWO_PI;
    const speed = 0.02 + Math.random() * 0.03; // Very slow: 0.02-0.05 units/frame
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.lifeDecay = 0.001;  // Very long-lived for visibility
    particle.life = 1.0;  // Ensure full life
    
    particle.size = (4 + Math.random() * 4) * 
        (particle.scaleFactor || 1) * 
        (particle.particleSizeMultiplier || 1);
    particle.baseSize = particle.size;
    particle.baseOpacity = 0.8 + Math.random() * 0.2;  // Very visible (80-100%)
    particle.opacity = particle.baseOpacity;
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    particle.behaviorData = {
        pauseTimer: Math.random() * 2,      // Start with random pause offset
        pauseDuration: 0.5 + Math.random() * 0.5,  // Pause for 0.5-1s
        moveDuration: 1 + Math.random() * 0.5,     // Move for 1-1.5s
        isMoving: Math.random() > 0.5,             // Randomly start moving or paused
        moveTimer: 0,
        originalVx: particle.vx,
        originalVy: particle.vy,
        watchRadius: 50 + Math.random() * 30       // Stay within 50-80 units of core
    };
}

/**
 * Update cautious behavior - slow movement with frequent pauses
 * 
 * Used for: SUSPICION/UNCERTAINTY emotions (watchful, guarded, wary)
 * Visual effect: Particles move slowly and deliberately, pausing frequently
 *                as if carefully observing their surroundings
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (milliseconds since last frame, typically ~16.67 for 60fps)
 * @param {number} centerX - X coordinate of the orb's center
 * @param {number} centerY - Y coordinate of the orb's center
 */
export function updateCautious(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // STEP 1: Update movement timer
    // Tracks how long we've been in current state (moving or paused)
    data.moveTimer += dt;
    
    // STEP 2: Switch between moving and pausing states
    if (data.isMoving) {
        // Currently moving - check if time to pause
        if (data.moveTimer > data.moveDuration) {
            data.isMoving = false;
            data.moveTimer = 0;
            // Stop movement during pause (watchful stillness)
            particle.vx = 0;
            particle.vy = 0;
        } else {
            // Continue moving at cautious speed
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
        }
    } else {
        // Currently paused - check if time to move
        if (data.moveTimer > data.pauseDuration) {
            data.isMoving = true;
            data.moveTimer = 0;
            // Pick a new careful direction
            const angle = Math.random() * PHYSICS.TWO_PI;
            const speed = 0.02 + Math.random() * 0.03;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            // Store for next movement phase
            data.originalVx = particle.vx;
            data.originalVy = particle.vy;
        }
    }
    
    // STEP 3: Keep particles within watch radius of core
    // They're suspicious, so they don't stray too far
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > data.watchRadius) {
        // Pull back towards core slowly (maintaining caution)
        const pullStrength = 0.02;
        particle.vx -= (dx / dist) * pullStrength * dt;
        particle.vy -= (dy / dist) * pullStrength * dt;
    }
    
    // STEP 4: Apply very light damping
    // Keeps movement controlled and deliberate
    particle.vx *= Math.pow(0.995, dt);
    particle.vy *= Math.pow(0.995, dt);
    
    // STEP 5: Subtle opacity flicker during pauses
    // Creates a watchful "blinking" effect
    if (!data.isMoving) {
        particle.opacity = particle.baseOpacity * (0.9 + Math.sin(particle.age * 5) * 0.1);
    } else {
        particle.opacity = particle.baseOpacity;
    }
}

// Export behavior definition for registry
export default {
    name: 'cautious',
    emoji: '🤨',
    description: 'Slow careful movement with watchful pauses',
    initialize: initializeCautious,
    update: updateCautious
};