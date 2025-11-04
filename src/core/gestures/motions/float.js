/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Float Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'float',
    type: 'blending',
    emoji: '🎈',
    description: 'Gentle floating upward motion',
    
    config: {
        duration: 2000,
        amplitude: 80,  // Increased for more visible effect
        wobbleAmount: 20,  // More wobble
        strength: 1.0  // Full strength
    },
    
    // Rhythm configuration - defines how this gesture responds to musical timing
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // 'beat', 'bar', 'continuous', or 'none'
        
        // How amplitude changes with beat
        amplitudeSync: {
            onBeat: 1.5,      // Multiply amplitude on beat
            offBeat: 0.8,     // Reduce amplitude off beat
            curve: 'bounce'   // Animation curve: 'linear', 'ease', 'bounce', 'pulse'
        },
        
        // How wobble syncs to subdivisions
        wobbleSync: {
            subdivision: 'eighth',  // Sync to 8th notes
            intensity: 0.7          // How much rhythm affects wobble
        },
        
        // Duration can sync to musical time
        durationSync: {
            mode: 'bars',     // Duration in bars instead of milliseconds
            bars: 2           // Float for 2 bars
        },
        
        // Response to musical accents
        accentResponse: {
            enabled: true,
            multiplier: 1.3   // Boost effect on accented beats
        },
        
        // Optional: Different behavior for different patterns
        patternOverrides: {
            'waltz': {
                wobbleSync: { subdivision: 'quarter', intensity: 0.9 }
            },
            'dubstep': {
                amplitudeSync: { onBeat: 2.0, curve: 'pulse' }
            }
        }
    },
    
    /**
     * Apply float motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Store original values on first frame
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        if (!particle.gestureData.float) {
            particle.gestureData.float = {
                originalSize: particle.size,
                originalOpacity: particle.opacity || 1
            };
        }
        
        const config = { ...this.config, ...motion };
        let amplitude = config.amplitude || this.config.amplitude;
        let wobbleAmount = config.wobbleAmount || this.config.wobbleAmount;
        const strength = config.strength || this.config.strength;
        
        // Apply rhythm modulation if present (passed from GestureMotion.js)
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            wobbleAmount *= (motion.rhythmModulation.wobbleMultiplier || 1);
        }
        
        // Upward floating with slight wobble
        const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount;
        
        // Apply upward force and wobble
        particle.vy -= amplitude * 0.01 * dt * strength * (1 - progress * 0.5);
        particle.vx += wobble * 0.01 * dt * strength;
        
        // Slight size variation for depth effect
        particle.size = particle.baseSize * (1 + progress * 0.1);
        
        // Fade slightly as it floats up
        particle.opacity = 1 - progress * 0.3;
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        // Reset to original values
        if (particle.gestureData?.float) {
            particle.opacity = particle.gestureData.float.originalOpacity;
            particle.size = particle.gestureData.float.originalSize;
            delete particle.gestureData.float;
        } else {
            // Fallback if no data stored
            particle.opacity = 1;
            particle.size = particle.baseSize;
        }

        // Dampen velocity to help particle settle
        particle.vx *= 0.5;
        particle.vy *= 0.5;
    },

    /**
     * 3D translation for float gesture
     * Upward floating motion with Y position and gentle rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude || this.config.amplitude;
            let wobbleAmount = config.wobbleAmount || this.config.wobbleAmount;
            const strength = config.strength || this.config.strength;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
                wobbleAmount *= (motion.rhythmModulation.wobbleMultiplier || 1);
            }

            // Upward Y movement - float up and back down (return to origin)
            // Use sine wave: starts at 0, peaks at middle, returns to 0
            const PIXEL_TO_3D = 0.005; // 80px = 0.4 units
            const floatCurve = Math.sin(progress * Math.PI); // 0 → 1 → 0
            const floatDistance = amplitude * floatCurve * strength * PIXEL_TO_3D;

            // Horizontal wobble as it floats - scale from pixels
            const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount * 0.3 * PIXEL_TO_3D;

            // Gentle spinning rotation as it rises
            const spinRotation = progress * Math.PI * 0.5 * strength;

            // Slight tilt for natural balloon-like motion
            const tiltX = Math.sin(progress * Math.PI * 2) * 0.1;
            const tiltZ = Math.cos(progress * Math.PI * 3) * 0.08;

            // Scale pulses with float height (depth perception) - returns to 1.0
            const scale = 1.0 + floatCurve * 0.1; // Grows with height, shrinks back

            return {
                position: [wobble, floatDistance, 0], // Positive Y for upward in 3D
                rotation: [tiltX, spinRotation, tiltZ],
                scale
            };
        }
    }
};