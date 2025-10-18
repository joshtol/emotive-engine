/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Burst Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Explosive expansion for surprise and suspicion states
 * @author Emotive Engine Team
 * @module particles/behaviors/burst
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates dramatic expansion effects. For surprise: fast burst then sudden stop.    
 * ║ For suspicion: controlled, watchful expansion. Particles shoot out from center.   
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *   Surprise:                  Suspicion:
 *       💥→                        •→
 *     ↗ 💥 ↘                    ↗ • ↘
 *   ← ⭐ →    STOP!          ← ⭐ →    (controlled)
 *     ↙ 💥 ↖                    ↙ • ↖
 *       💥←                        •←
 * 
 * USED BY EMOTIONS:
 * - surprise (dramatic burst then stop)
 * - suspicion (controlled, watchful expansion)
 * 
 * RECIPE TO MODIFY:
 * - Increase speed for more dramatic burst
 * - Adjust friction for different deceleration
 * - Change stopTime for surprise effect timing
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize burst behavior for a particle
 * Sets up explosive outward movement
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeBurst(particle) {
    // Check emotion type for behavior variation
    const isSuspicion = particle.emotion === 'suspicion';
    const isSurprise = particle.emotion === 'surprise';
    const isGlitch = particle.emotion === 'glitch';
    
    // Random direction for burst
    const angle = Math.random() * PHYSICS.TWO_PI;
    
    // Speed based on emotion
    const speed = isSuspicion ? 
        (1.0 + Math.random() * 0.8) :      // Controlled burst for suspicion (1-1.8)
        (isSurprise ? 
            (7.0 + Math.random() * 5.0) :  // Much faster burst for surprise (7-12)
            (isGlitch ?
                (2.0 + Math.random() * 1.5) : // Moderate burst for glitch (2-3.5)
                (3.5 + Math.random() * 2.5)));  // Normal burst for others (3.5-6)
    
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    
    // Lifespan based on emotion
    particle.lifeDecay = isSuspicion ? 
        0.010 : 
        (isSurprise ? 0.006 + Math.random() * 0.008 : 
            (isGlitch ? 0.012 : 0.015));
    
    // Use emotion colors if provided
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    // Make suspicion particles more visible
    if (isSuspicion) {
        particle.size = (6 + Math.random() * 4) * 
                       (particle.scaleFactor || 1) * 
                       (particle.particleSizeMultiplier || 1);
        particle.baseSize = particle.size;
        particle.opacity = 1.0;  // Full opacity for visibility
        particle.baseOpacity = particle.opacity;
    }
    
    particle.behaviorData = {
        isSuspicion,
        isSurprise,
        isGlitch,
        age: 0,
        fadeStart: isSuspicion ? 0.3 : 0.2,  // When to start fading
        // Glitch wiggle properties
        glitchPhase: Math.random() * Math.PI * 2,
        glitchIntensity: isGlitch ? 0.3 : 0,
        glitchFrequency: isGlitch ? 0.1 : 0
    };
}

/**
 * Update burst behavior each frame
 * Handles explosive expansion with emotion-specific variations
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X (unused)
 * @param {number} centerY - Orb center Y (unused)
 */
export function updateBurst(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // Surprise particles: burst out then STOP suddenly
    if (data.isSurprise) {
        // Track age for timing the stop
        data.age += dt * 0.016; // Convert to seconds
        
        if (data.age < 0.15) {
            // First 0.15 seconds: maintain high speed
            const friction = 0.98;
            particle.vx *= Math.pow(friction, dt);
            particle.vy *= Math.pow(friction, dt);
        } else if (data.age < 0.25) {
            // 0.15-0.25 seconds: SUDDEN STOP!
            const friction = 0.85; // Heavy braking
            particle.vx *= Math.pow(friction, dt);
            particle.vy *= Math.pow(friction, dt);
        } else {
            // After stop: float gently
            const friction = 0.99;
            particle.vx *= Math.pow(friction, dt);
            particle.vy *= Math.pow(friction, dt);
            // Tiny random drift
            particle.vx += (Math.random() - 0.5) * 0.01 * dt;
            particle.vy += (Math.random() - 0.5) * 0.01 * dt;
        }
    } else {
        // Normal burst behavior for other emotions
        const friction = data.isSuspicion ? 0.99 : (data.isGlitch ? 0.97 : 0.95);
        particle.vx *= Math.pow(friction, dt);
        particle.vy *= Math.pow(friction, dt);
    }
    
    // For suspicion, add a subtle scanning motion
    if (data.isSuspicion) {
        // Add a very subtle side-to-side drift
        const time = Date.now() * 0.001;
        particle.vx += Math.sin(time * 2 + particle.id) * 0.01 * dt;
    }
    
    // For glitch, add wiggle effect
    if (data.isGlitch) {
        data.age += dt * 0.016; // Track age for glitch timing
        
        // Update glitch phase
        data.glitchPhase += data.glitchFrequency * dt;
        
        // Add wiggle to velocity
        const wiggleX = Math.sin(data.glitchPhase) * data.glitchIntensity * dt;
        const wiggleY = Math.cos(data.glitchPhase * 1.3) * data.glitchIntensity * dt;
        
        particle.vx += wiggleX;
        particle.vy += wiggleY;
        
        // Occasionally add random glitch bursts
        if (Math.random() < 0.02) { // 2% chance per frame
            const burstAngle = Math.random() * Math.PI * 2;
            const burstSpeed = 0.5 + Math.random() * 0.5;
            particle.vx += Math.cos(burstAngle) * burstSpeed;
            particle.vy += Math.sin(burstAngle) * burstSpeed;
        }
    }
}

// Export behavior definition for registry
export default {
    name: 'burst',
    emoji: '💥',
    description: 'Explosive expansion from center',
    initialize: initializeBurst,
    update: updateBurst
};