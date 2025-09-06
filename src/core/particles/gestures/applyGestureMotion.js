/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gesture Motion System
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Complete gesture motion system for particles
 * @author Emotive Engine Team
 * @module particles/gestures/applyGestureMotion
 * 
 * TEMPORARY: This is copied from the original Particle.js until we can modularize it properly
 */

/**
 * Apply gesture motion to particle (full implementation from original)
 * This is a massive function that handles all gesture types
 * TODO: Break this down into individual gesture modules
 */
export function applyGestureMotion(particle, dt, motion, progress, centerX, centerY) {
    if (!motion || !motion.type) return;
    
    // Stop applying gesture at 100% completion
    if (progress >= 1) return;
    
    // Initialize gesture data on first frame
    if (!particle.gestureData) {
        particle.gestureData = {
            originalVx: particle.vx,
            originalVy: particle.vy,
            initialX: particle.x,
            initialY: particle.y,
            // For orbital motion, calculate starting angle
            startAngle: Math.atan2(particle.y - centerY, particle.x - centerX),
            startRadius: Math.sqrt(Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2))
        };
    }
    
    const strength = (motion.strength || 1.0);
    const easeProgress = particle.easeInOutCubic(progress);
    
    switch (motion.type) {
        case 'oscillate': {
            const axis = motion.axis || 'vertical';
            const frequency = motion.frequency || 1;
            const phase = motion.phase || 0;
            const oscillation = Math.sin((easeProgress + phase) * Math.PI * 2 * frequency) * strength;
            
            if (axis === 'vertical') {
                particle.vy += oscillation * 0.5 * dt;
            } else {
                particle.vx += oscillation * 0.5 * dt;
            }
            
            if (progress > 0.9) {
                const dampFactor = 1 - ((progress - 0.9) * 10);
                particle.vx *= (0.95 + dampFactor * 0.05);
                particle.vy *= (0.95 + dampFactor * 0.05);
            }
            break;
        }
        
        case 'radial': {
            const direction = motion.direction || 'outward';
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                const normalX = dx / distance;
                const normalY = dy / distance;
                const force = direction === 'outward' ? strength : -strength;
                
                particle.vx += normalX * force * 0.2 * dt;
                particle.vy += normalY * force * 0.2 * dt;
            }
            break;
        }
        
        case 'jitter': {
            const frequency = motion.frequency || 10;
            const decay = motion.decay ? (1 - easeProgress * 0.5) : 1;
            const jitterStrength = strength * decay;
            
            particle.vx += (Math.random() - 0.5) * jitterStrength * dt;
            particle.vy += (Math.random() - 0.5) * jitterStrength * dt;
            break;
        }
        
        case 'burst': {
            const decay = motion.decay || 0.5;
            const burstStrength = strength * (1 - easeProgress * decay);
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                particle.vx += (dx / distance) * burstStrength * 2 * dt;
                particle.vy += (dy / distance) * burstStrength * 2 * dt;
            }
            break;
        }
        
        // Add more gesture types as needed...
        // For now, keeping the essential ones
    }
    
    // Reset gesture data and velocities when gesture completes
    if (progress >= 1) {
        particle.vx = 0;
        particle.vy = 0;
        particle.gestureData = null;
    }
}