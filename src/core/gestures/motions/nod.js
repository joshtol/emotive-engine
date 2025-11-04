/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nod Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Nod gesture - vertical agreement motion
 * @author Emotive Engine Team
 * @module gestures/motions/nod
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 */

export default {
    name: 'nod',
    emoji: '🙂',
    type: 'blending',
    description: 'Vertical nodding motion',
    
    // Default configuration
    config: {
        duration: 500,      // Animation duration
        amplitude: 15,      // Vertical movement range
        frequency: 2,       // Number of nod cycles
        easing: 'sine',     // Animation curve type
        strength: 0.4,      // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'bounce',
            axis: 'vertical',   // Movement direction
            strength: 0.4,      // Particle nod strength
            frequency: 2,       // Particle nod count
            phase: 0           // Synchronization with orb
        }
    },
    
    // Rhythm configuration - nod as agreement to the beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',     // Wait for next beat to start
        interruptible: false,        // Must complete the nod
        priority: 5,                 // Medium priority
        blendable: false,            // Don't blend with other motions
        minDuration: 'halfBar',      // Minimum time before interrupt
        
        // Nod frequency locks to beat
        frequencySync: {
            mode: 'subdivision',
            subdivision: 'half',  // Nod on half notes
            multiplier: 1.0
        },
        
        // Amplitude stronger on downbeats
        amplitudeSync: {
            onBeat: 1.4,
            offBeat: 0.8,
            curve: 'ease'
        },
        
        // Duration in beats
        durationSync: {
            mode: 'beats',
            beats: 2  // Nod for 2 beats
        },
        
        // Pattern-specific nodding
        patternOverrides: {
            'waltz': {
                // Graceful 3/4 nod
                frequencySync: { subdivision: 'quarter' },
                amplitudeSync: { onBeat: 1.6, curve: 'ease' }
            },
            'swing': {
                // Jazzy syncopated nod
                amplitudeSync: { onBeat: 1.5, offBeat: 0.9 }
            },
            'dubstep': {
                // Heavy head-bang on drop
                amplitudeSync: {
                    onBeat: 1.2,
                    dropBeat: 3.0,
                    curve: 'pulse'
                }
            }
        }
    },
    
    initialize(particle, _motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.nod = {
            startY: particle.y,
            initialized: true
        };
    },
    
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        if (!particle.gestureData?.nod?.initialized) {
            this.initialize(particle, motion);
        }
        
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        let {frequency} = config;
        let {amplitude} = config;
        
        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }
        
        const oscillation = Math.sin(progress * Math.PI * 2 * frequency);
        amplitude = amplitude * strength * particle.scaleFactor;
        
        // Apply vertical nodding motion
        particle.vy += oscillation * amplitude * 0.01 * dt;
        
        // Dampen at the end
        if (progress > 0.9) {
            particle.vy *= 0.95;
        }
    },
    
    cleanup(particle) {
        if (particle.gestureData?.nod) {
            delete particle.gestureData.nod;
        }
    },

    /**
     * 3D translation for nod gesture
     * Maps vertical nodding to X-axis rotation (pitch)
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            let {frequency} = config;
            let {amplitude} = config;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
                if (motion.rhythmModulation.frequencyMultiplier) {
                    frequency *= motion.rhythmModulation.frequencyMultiplier;
                }
            }

            // Calculate nodding oscillation
            const oscillation = Math.sin(progress * Math.PI * 2 * frequency);

            // Map to X-axis rotation (pitch) in radians
            // Nodding is rotation around X-axis: positive = looking down, negative = looking up
            const pitchRotation = oscillation * (amplitude * 0.04); // Increased for more visible nod

            // Slight forward/back movement on Z-axis for natural head motion
            // Scale pixels to 3D units to prevent aggressive camera approach
            const PIXEL_TO_3D = 0.01; // Increased from 0.005 for more visible depth
            const depthMovement = oscillation * (amplitude * 0.1) * PIXEL_TO_3D;

            // Dampen at the end
            const dampening = progress > 0.9 ? 0.95 : 1.0;

            return {
                position: [0, 0, depthMovement * dampening],
                rotation: [pitchRotation * dampening, 0, 0],
                scale: 1.0
            };
        }
    }
};