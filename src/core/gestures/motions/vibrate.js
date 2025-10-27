/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Vibrate Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Vibrate gesture - high frequency micro-shake
 * @author Emotive Engine Team
 * @module gestures/motions/vibrate
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 */

export default {
    name: 'vibrate',
    emoji: '📳',
    type: 'blending',
    description: 'High frequency vibration',
    
    // Default configuration
    config: {
        duration: 500,      // Animation duration
        frequency: 20,      // Vibration frequency
        amplitude: 8,       // Vibration amplitude
        easing: 'linear',   // Animation curve type
        strength: 2.0,      // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'shake',
            strength: 2.0,
            frequency: 20,
            amplitude: 8
        }
    },
    
    // Rhythm configuration - vibrate as tremolo effect
    rhythm: {
        enabled: true,
        syncMode: 'subdivision',
        
        // Vibration frequency syncs to tempo
        frequencySync: {
            subdivision: 'thirty-second',  // Very fast subdivisions
            baseFrequency: 20,
            tempoScaling: true  // Scale with BPM
        },
        
        // Amplitude pulses with beat
        amplitudeSync: {
            onBeat: 1.5,
            offBeat: 0.8,
            curve: 'pulse'
        },
        
        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 1  // Vibrate for 1 beat
        },
        
        // Pattern-specific vibration
        patternOverrides: {
            'dubstep': {
                // Bass wobble vibration
                frequencySync: { subdivision: 'sixteenth' },
                amplitudeSync: { onBeat: 2.0, dropBeat: 3.0 }
            },
            'breakbeat': {
                // Chaotic vibration
                frequencySync: { mode: 'random', range: [15, 30] }
            }
        }
    },
    
    initialize(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.vibrate = {
            timer: 0,
            seed: Math.random() * 1000,
            initialized: true
        };
    },
    
    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.vibrate?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.vibrate;
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Apply rhythm modulation if present
        let {amplitude} = config;
        let {frequency} = config;
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }
        
        // Update timer
        data.timer += dt * frequency;
        
        // High frequency vibration
        const vibrateX = (Math.random() - 0.5) * amplitude * strength;
        const vibrateY = (Math.random() - 0.5) * amplitude * strength;
        
        // Apply rapid vibration movements
        particle.vx += vibrateX * 0.5 * dt;
        particle.vy += vibrateY * 0.5 * dt;
        
        // Apply damping for control
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        
        // Fade out at the end
        if (progress > 0.8) {
            const fadeFactor = 1 - ((progress - 0.8) * 5);
            particle.vx *= fadeFactor;
            particle.vy *= fadeFactor;
        }
    },
    
    cleanup(particle) {
        if (particle.gestureData?.vibrate) {
            delete particle.gestureData.vibrate;
        }
    }
};