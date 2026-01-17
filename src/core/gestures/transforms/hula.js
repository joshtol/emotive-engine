/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Hula-Hoop Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Hula-hoop variation of orbital with vertical oscillation
 * @author Emotive Engine Team
 * @module gestures/transforms/hula
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 * 
 * VISUAL EFFECT:
 * Like a hula-hoop spinning around the orb - particles orbit horizontally while
 * oscillating vertically, creating a tilted ring effect with 3D depth.
 */

export default {
    name: 'hula',
    emoji: '🌀',
    type: 'override',
    description: 'Hula-hoop motion with vertical waves',
    
    // Default configuration
    config: {
        speed: 0.015,             // Rotation speed
        maintainRadius: false,     // Allow radius variation for organic feel
        elliptical: true,          // Elliptical orbit shape
        use3D: true,               // Enable 3D depth effect
        zPhaseOffset: Math.PI / 4, // Ring tilt angle
        verticalOscillation: 0.3,  // Vertical wave amount
        wobbleAmount: 0.15,        // Ring wobble intensity
        duration: 2500,            // Legacy fallback
        musicalDuration: { musical: true, bars: 1.5 }, // 1.5 bars (6 beats)
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'hula',
            strength: 1.0,
            verticalOscillation: 0.3
        }
    },
    
    // Rhythm configuration - hula syncs to groove
    rhythm: {
        enabled: true,
        syncMode: 'bar',  // Full rotation per bar
        durationSync: { mode: 'bars', bars: 1.5 }, // 1.5 bars duration

        // Speed syncs to tempo for consistent rotation
        speedSync: {
            mode: 'tempo',
            baseSpeed: 0.015,      // Base speed at 120 BPM
            scaling: 'proportional' // Speed scales with BPM
        },
        
        // Wobble syncs to beat for rhythmic variation
        wobbleSync: {
            onBeat: 0.25,          // More wobble on beat
            offBeat: 0.1,          // Less wobble off beat
            curve: 'sine'          // Smooth transitions
        },
        
        // Vertical oscillation creates wave patterns
        verticalSync: {
            subdivision: 'quarter', // Wave every quarter note
            amplitude: 0.4,        // Wave height on beat
            phase: 'sequential'    // Waves follow rotation
        },
        
        // Musical expression
        dynamics: {
            forte: { wobbleAmount: 0.3, speed: 1.2 },  // Wilder on loud
            piano: { wobbleAmount: 0.05, speed: 0.8 }  // Gentler on soft
        }
    },
    
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const calculatedRadius = Math.sqrt(dx * dx + dy * dy);
        
        // Random direction for hula-hoop
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        // Set minimum radius to prevent center clustering - 3x larger spread
        const MIN_RADIUS = 100; // Slightly larger for hula effect
        const radius = Math.max(calculatedRadius, MIN_RADIUS + Math.random() * 180); // At least 210-390 pixels
        
        const initialAngle = calculatedRadius < 5 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
        particle.gestureData.hula = {
            radius,
            angle: initialAngle,
            initialAngle,  // Store initial angle for relative rotation
            originalVx: particle.vx,
            originalVy: particle.vy,
            originalZ: particle.z || 0,
            zPhase: Math.random() * Math.PI * 2,
            wobblePhase: Math.random() * Math.PI * 2,
            direction  // Random hula direction
        };
    },
    
    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.hula) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.hula;
        const speed = (motion.speed || this.config.speed) * (motion.strength || 1);
        
        // Smooth entry/exit transitions
        let transitionFactor = 1.0;
        if (progress < 0.1) {
            // Smooth entry (first 10%)
            transitionFactor = progress / 0.1;
            transitionFactor = Math.sin(transitionFactor * Math.PI * 0.5); // Smooth ease-in
        } else if (progress > 0.9) {
            // Smooth exit (last 10%)
            transitionFactor = (1 - progress) / 0.1;
            transitionFactor = Math.sin(transitionFactor * Math.PI * 0.5); // Smooth ease-out
        }
        
        // Update angle with direction (dt is already normalized to 60fps)
        data.angle += speed * dt * data.direction * transitionFactor;
        
        // Wobble effect - the hoop wobbles as it spins
        const wobble = Math.sin(data.angle * 2 + data.wobblePhase) * (motion.wobbleAmount || this.config.wobbleAmount) * transitionFactor;
        
        // Calculate elliptical radius with wobble and transition
        const radiusX = data.radius * (1 + wobble) * transitionFactor;
        const radiusY = data.radius * (0.7 + wobble) * transitionFactor; // Elliptical shape factor
        
        // Smoothly transition from original position to orbit position
        const targetX = centerX + Math.cos(data.angle) * radiusX;
        const targetY = centerY + Math.sin(data.angle) * radiusY;
        
        if (progress < 0.1) {
            // During entry, lerp from original position
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const currentRadius = Math.sqrt(dx * dx + dy * dy);
            if (currentRadius < 50) {
                // If particle is at center, move it out smoothly
                particle.x = centerX + Math.cos(data.angle) * radiusX;
                particle.y = centerY + Math.sin(data.angle) * radiusY;
            } else {
                particle.x = particle.x + (targetX - particle.x) * transitionFactor * 0.5;
                particle.y = particle.y + (targetY - particle.y) * transitionFactor * 0.5;
            }
        } else {
            particle.x = targetX;
            particle.y = targetY;
        }
        
        // 3D DEPTH with strong vertical oscillation
        const zAngle = data.angle + data.zPhase + (motion.zPhaseOffset || this.config.zPhaseOffset);
        
        // Z-coordinate for depth (behind/in front) with transition
        particle.z = Math.sin(zAngle) * 0.9 * transitionFactor;
        
        // Vertical oscillation synchronized with z-depth
        const verticalAmount = motion.verticalOscillation || this.config.verticalOscillation;
        const verticalOffset = Math.cos(zAngle * 2) * verticalAmount * data.radius * 0.2 * transitionFactor;
        particle.y += verticalOffset;
        
        // Tilt effect - particles higher when in front, lower when behind
        const tiltOffset = particle.z * data.radius * 0.1;
        particle.y -= tiltOffset;
        
        // Set velocity to match motion with smooth transitions
        const targetVx = -Math.sin(data.angle) * radiusX * speed;
        const targetVy = Math.cos(data.angle) * radiusY * speed;
        
        if (progress < 0.1) {
            // Smooth velocity transition during entry
            particle.vx = data.originalVx + (targetVx - data.originalVx) * transitionFactor;
            particle.vy = data.originalVy + (targetVy - data.originalVy) * transitionFactor;
        } else if (progress > 0.9) {
            // Smooth velocity transition during exit
            particle.vx = targetVx * transitionFactor + data.originalVx * (1 - transitionFactor);
            particle.vy = targetVy * transitionFactor + data.originalVy * (1 - transitionFactor);
            particle.z = particle.z * transitionFactor + data.originalZ * (1 - transitionFactor);
        } else {
            particle.vx = targetVx;
            particle.vy = targetVy;
        }
    },
    
    cleanup(particle) {
        if (particle.gestureData?.hula) {
            const data = particle.gestureData.hula;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.z = data.originalZ;
            delete particle.gestureData.hula;
        }
    },

    /**
     * 3D translation for WebGL rendering
     * Y-axis rotation with XZ position offset for hula-hoop effect
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration with particle data
         * @returns {Object} Transform with position, rotation, scale
         */
        evaluate(progress, motion) {
            const {particle} = motion;
            if (!particle || !particle.gestureData?.hula) {
                return {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: 1.0
                };
            }

            const data = particle.gestureData.hula;
            const config = motion.config || {};

            // Smooth entry/exit envelope - starts from 0, peaks at 1, returns to 0
            let envelope = 1.0;
            if (progress < 0.15) {
                // Smooth entry (first 15%)
                envelope = progress / 0.15;
                envelope = Math.sin(envelope * Math.PI * 0.5); // Ease-in
            } else if (progress > 0.85) {
                // Smooth exit (last 15%)
                envelope = (1 - progress) / 0.15;
                envelope = Math.sin(envelope * Math.PI * 0.5); // Ease-out
            }

            // Hula-hoop motion: RELATIVE circular path in XZ plane with vertical Y oscillation
            const hulaRadius = 0.25; // Hula hoop radius in 3D units

            // Calculate angle based on progress for smooth hula motion
            // Start from initial angle, rotate during gesture
            const angle = data.initialAngle + (progress * Math.PI * 2 * data.direction);

            // RELATIVE circular motion in XZ plane (starts from 0, peaks, returns to 0)
            const xOffset = Math.cos(angle) * hulaRadius * envelope;
            const zOffset = Math.sin(angle) * hulaRadius * envelope;

            // RELATIVE vertical oscillation creates the hula-hoop wave effect
            const verticalOscillation = config.verticalOscillation || 0.3;
            const yOffset = Math.sin(angle * 2 + data.wobblePhase) * verticalOscillation * envelope;

            // RELATIVE Y-axis rotation to face direction of motion
            const yRotation = (angle - data.initialAngle) * envelope;

            // Scale variation based on vertical position (larger at top/bottom of wave)
            const scaleVariation = Math.abs(Math.sin(angle)) * 0.15 * envelope;
            const verticalScale = 1.0 + scaleVariation;

            return {
                position: [xOffset, yOffset, zOffset], // RELATIVE offset from current position
                rotation: [0, yRotation, 0],           // RELATIVE rotation from current
                scale: verticalScale
            };
        }
    }
};