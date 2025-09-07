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
        // Store original position
        gestureData.originalX = particle.x;
        gestureData.originalY = particle.y;
        gestureData.originalZ = particle.z;
        
        // Calculate initial angle and radius from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        gestureData.radius = Math.sqrt(dx * dx + dy * dy);
        gestureData.initialAngle = Math.atan2(dy, dx);
        
        // Random orbit parameters for variety
        gestureData.orbitSpeed = config.speed * (0.8 + Math.random() * 0.4); // Speed variation
        gestureData.orbitTilt = Math.random() * 0.3; // Slight tilt for realism
        
        gestureData.initialized = true;
    }
    
    // Calculate current angle based on progress
    const angle = gestureData.initialAngle + (progress * Math.PI * 2 * config.rotations);
    
    // Calculate orbital radius (can pulse slightly)
    const radiusPulse = 1 + Math.sin(progress * Math.PI * 4) * 0.05; // Subtle pulse effect
    const currentRadius = gestureData.radius * strength * radiusPulse;
    
    // Calculate new position in orbit
    const targetX = centerX + Math.cos(angle) * currentRadius;
    const targetY = centerY + Math.sin(angle) * currentRadius;
    
    // CRITICAL: Update z-coordinate for 3D effect
    // Particles in front (positive z) when at top of orbit, behind (negative z) at bottom
    const zAngle = angle * config.zRotations; // Can rotate in z-plane at different rate
    particle.z = Math.sin(zAngle) * 0.8; // Z-depth range for layering
    
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
    
    // Apply centripetal acceleration effect (particles speed up when closer)
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
    }
};