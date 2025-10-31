/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbit Gesture Motion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview 3D orbital motion where particles circle around the orb
 * @author Emotive Engine Team
 * @module gestures/motions/orbit
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a mesmerizing 3D orbit effect where particles circle around the orb,      
 * ║ dynamically transitioning between foreground and background layers using the      
 * ║ z-coordinate system. Like planets orbiting a star or a hula-hoop in motion.       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM (Top View):
 *     · → · → ·
 *   ↓           ↑
 *   ·    ⭐    ·   ← particles orbit around center
 *   ↑           ↓  
 *     · ← · ← ·
 * 
 * VISUAL DIAGRAM (Side View):
 *   front  ·····   back
 *         /     \
 *        ·   ⭐  ·  ← z-coordinate changes as particles orbit
 *         \     /
 *   back   ·····   front
 */

/**
 * Apply orbital motion to a particle
 * Particles orbit around the center with dynamic z-depth changes
 * 
 * @param {Object} particle - The particle to animate
 * @param {Object} gestureData - Persistent data for this particle's gesture
 * @param {Object} config - Gesture configuration
 * @param {number} progress - Gesture progress (0-1)
 * @param {number} strength - Gesture strength multiplier
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 */
export function applyOrbit(particle, gestureData, config, progress, strength, centerX, centerY) {
    // Initialize gesture data if needed
    if (!gestureData.initialized) {
        // Store original position and velocity
        gestureData.originalX = particle.x;
        gestureData.originalY = particle.y;
        gestureData.originalZ = particle.z || 0;
        gestureData.originalVx = particle.vx || 0;
        gestureData.originalVy = particle.vy || 0;
        
        // Calculate initial angle and radius from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        gestureData.radius = Math.sqrt(dx * dx + dy * dy);
        
        // Ensure minimum radius to prevent clustering at center
        if (gestureData.radius < 50) {
            gestureData.radius = 50 + Math.random() * 100;
        }
        
        gestureData.initialAngle = Math.atan2(dy, dx);
        
        // Random orbit parameters for variety
        gestureData.orbitSpeed = config.speed * (0.8 + Math.random() * 0.4); // Speed variation
        gestureData.orbitTilt = Math.random() * 0.3; // Slight tilt for realism
        
        gestureData.initialized = true;
    }
    
    // Apply rhythm modulation if present
    let {rotations} = config;
    let radiusPulseAmount = 0.05;
    if (config.rhythmModulation) {
        if (config.rhythmModulation.speedMultiplier) {
            gestureData.orbitSpeed *= config.rhythmModulation.speedMultiplier;
        }
        if (config.rhythmModulation.rotationMultiplier) {
            rotations *= config.rhythmModulation.rotationMultiplier;
        }
        if (config.rhythmModulation.radiusPulse) {
            radiusPulseAmount = config.rhythmModulation.radiusPulse;
        }
    }
    
    // Smooth entry/exit transitions
    let transitionFactor = 1.0;
    let velocityTransition = 1.0;
    
    if (progress < 0.15) {
        // Smooth entry (first 15%)
        transitionFactor = progress / 0.15;
        transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor); // Smooth step
        velocityTransition = transitionFactor;
    } else if (progress > 0.85) {
        // Smooth exit (last 15%)
        transitionFactor = (1 - progress) / 0.15;
        transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor); // Smooth step
        velocityTransition = transitionFactor;
    }
    
    // Calculate current angle based on progress with smooth acceleration
    const angle = gestureData.initialAngle + (progress * Math.PI * 2 * rotations * transitionFactor);
    
    // Calculate orbital radius (can pulse slightly) with transition
    const radiusPulse = 1 + Math.sin(progress * Math.PI * 4) * radiusPulseAmount * transitionFactor;
    const currentRadius = gestureData.radius * strength * radiusPulse * transitionFactor;
    
    // Calculate new position in orbit
    const targetX = centerX + Math.cos(angle) * currentRadius;
    const targetY = centerY + Math.sin(angle) * currentRadius;
    
    // CRITICAL: Update z-coordinate for 3D effect with smooth transition
    // Particles in front (positive z) when at top of orbit, behind (negative z) at bottom
    const zAngle = angle * config.zRotations; // Can rotate in z-plane at different rate
    particle.z = Math.sin(zAngle) * 0.8 * transitionFactor + gestureData.originalZ * (1 - transitionFactor);
    
    // During entry, smoothly transition from original position
    if (progress < 0.15) {
        const entryLerp = transitionFactor * 0.3; // Slower entry
        particle.x = gestureData.originalX + (targetX - gestureData.originalX) * entryLerp;
        particle.y = gestureData.originalY + (targetY - gestureData.originalY) * entryLerp;
        
        // Smooth velocity transition
        const orbitalVx = -Math.sin(angle) * currentRadius * gestureData.orbitSpeed;
        const orbitalVy = Math.cos(angle) * currentRadius * gestureData.orbitSpeed;
        particle.vx = gestureData.originalVx + (orbitalVx - gestureData.originalVx) * velocityTransition;
        particle.vy = gestureData.originalVy + (orbitalVy - gestureData.originalVy) * velocityTransition;
    } 
    // During exit, smoothly return to original
    else if (progress > 0.85) {
        particle.x = targetX + (gestureData.originalX - targetX) * (1 - transitionFactor);
        particle.y = targetY + (gestureData.originalY - targetY) * (1 - transitionFactor);
        
        // Smooth velocity transition back
        const orbitalVx = -Math.sin(angle) * currentRadius * gestureData.orbitSpeed;
        const orbitalVy = Math.cos(angle) * currentRadius * gestureData.orbitSpeed;
        particle.vx = orbitalVx * velocityTransition + gestureData.originalVx * (1 - velocityTransition);
        particle.vy = orbitalVy * velocityTransition + gestureData.originalVy * (1 - velocityTransition);
    }
    // Normal orbit
    else {
        // Add vertical oscillation for hula-hoop effect if enabled
        if (config.verticalOscillation > 0) {
            const verticalOffset = Math.sin(angle * 2) * config.verticalOscillation * strength;
            particle.y = targetY + verticalOffset;
            particle.x = targetX;
        } else {
            // Smooth interpolation to target position
            const lerpFactor = config.smoothness || 0.1;
            particle.x += (targetX - particle.x) * lerpFactor;
            particle.y += (targetY - particle.y) * lerpFactor;
        }
        
        // Set orbital velocity
        particle.vx = -Math.sin(angle) * currentRadius * gestureData.orbitSpeed;
        particle.vy = Math.cos(angle) * currentRadius * gestureData.orbitSpeed;
    }
    
    // Apply centripetal acContinceleration effect (particles speed up when closer)
    if (config.centripetal) {
        const speed = 1 + (1 - Math.abs(particle.z)) * 0.3; // Speed varies with z-position
        const speedAngle = gestureData.initialAngle + (progress * Math.PI * 2 * config.rotations * speed);
        particle.x = centerX + Math.cos(speedAngle) * currentRadius;
        particle.y = centerY + Math.sin(speedAngle) * currentRadius;
    }
}

// Export gesture configuration
export default {
    name: 'orbit',
    emoji: '🪐',
    description: '3D orbital motion around center',
    type: 'override', // Takes full control of particle position
    
    // Default configuration
    config: {
        speed: 1.0,              // Base orbital speed
        rotations: 1,            // Number of full rotations per gesture
        zRotations: 1,           // Z-plane rotation ratio (1 = same as xy, 2 = twice as fast)
        smoothness: 0.15,        // Position interpolation factor
        verticalOscillation: 0,  // Hula-hoop vertical movement (0 = flat orbit)
        centripetal: false,      // Enable speed variation based on position
    },
    
    // Rhythm configuration - orbital motion syncs to musical cycles
    rhythm: {
        enabled: true,
        syncMode: 'bar',  // Complete orbit per bar
        
        // Orbital speed syncs to tempo
        speedSync: {
            mode: 'tempo',
            baseSpeed: 1.0,
            scaling: 'linear'  // Speed scales with BPM
        },
        
        // Rotations per musical period
        rotationSync: {
            mode: 'bars',
            rotationsPerBar: 1,  // One full orbit per bar
            zSync: true  // Z-rotation also syncs
        },
        
        // Radius pulses with beat
        radiusSync: {
            subdivision: 'quarter',
            pulsAmount: 0.1,  // 10% radius variation
            curve: 'ease'
        },
        
        // Pattern-specific orbital styles
        patternOverrides: {
            'waltz': {
                // Elegant 3-step orbit
                rotationSync: { rotationsPerBar: 0.75 },
                radiusSync: { pulsAmount: 0.15 }
            },
            'swing': {
                // Jazzy elliptical orbit
                speedSync: { mode: 'swing', ratio: 0.67 },
                verticalOscillation: 0.2
            },
            'dubstep': {
                // Wobbling orbit with drops
                radiusSync: { 
                    subdivision: 'eighth',
                    pulsAmount: 0.3,
                    dropMultiplier: 2.0
                }
            },
            'breakbeat': {
                // Chaotic orbital patterns
                speedSync: { mode: 'random', range: [0.5, 2.0] },
                centripetal: true
            }
        }
    },
    
    // Apply function
    apply: applyOrbit,
    
    // Supported emotions (great for mystical/energetic states)
    emotions: ['zen', 'love', 'excited', 'surprise'],
    
    // Gesture-specific features
    features: {
        uses3D: true,           // Uses z-coordinate system
        smooth: true,           // Smooth continuous motion
        looping: true,          // Natural looping animation
        dramatic: true          // Visually impressive effect
    },

    /**
     * 3D translation for orbit gesture
     * Note: Orbit is a motion BLENDING gesture, not to be confused with orbital
     * This creates subtle 3D rotation to enhance the blended motion feel
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            let {rotations} = config;
            const {zRotations} = config;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                if (motion.rhythmModulation.rotationMultiplier) {
                    rotations *= motion.rhythmModulation.rotationMultiplier;
                }
            }

            // Smooth entry/exit transitions
            let transitionFactor = 1.0;
            if (progress < 0.15) {
                transitionFactor = progress / 0.15;
                transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);
            } else if (progress > 0.85) {
                transitionFactor = (1 - progress) / 0.15;
                transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);
            }

            // Circular motion creates gentle rotation effect
            const angle = progress * Math.PI * 2 * rotations * transitionFactor;
            const zAngle = angle * zRotations;

            // Subtle rotation around all axes for blended orbital feel
            const yRotation = Math.sin(angle) * 0.1 * transitionFactor;
            const xRotation = Math.cos(angle) * 0.05 * transitionFactor;
            const zRotation = Math.sin(zAngle) * 0.05 * transitionFactor;

            // Minimal z-depth variation
            const zPosition = Math.sin(zAngle) * 0.2 * transitionFactor;

            // Slight scale pulsing
            const scalePulse = 1 + Math.sin(angle * 2) * 0.03 * transitionFactor;

            return {
                position: [0, 0, zPosition * 0.25],
                rotation: [xRotation * 0.25, yRotation * 0.25, zRotation * 0.25],
                scale: scalePulse
            };
        }
    }
};