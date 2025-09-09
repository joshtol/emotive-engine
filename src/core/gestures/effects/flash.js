/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flash Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flash gesture - bright burst effect
 * @author Emotive Engine Team
 * @module gestures/effects/flash
 */

export default {
    name: 'flash',
    emoji: '⚡',
    type: 'blending',
    description: 'Bright flash burst effect',
    
    // Default configuration
    config: {
        duration: 400,       // Animation duration
        glowAmount: 2.5,     // Overall brightness increase
        glowPeak: 3.0,       // Maximum intensity level
        scalePeak: 1.1,      // Size expansion at peak
        easing: 'cubic',     // Animation curve type
        strength: 1.0,       // Effect intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'burst',
            strength: 1.0,   // Burst force intensity
            decay: 0.3       // Force reduction rate
        }
    },
    
    // Rhythm configuration - flash on beats and accents
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Flash on beats
        timingSync: 'immediate',    // Flash immediately (for impact)
        interruptible: true,         // Can interrupt
        priority: 8,                 // High priority
        blendable: true,             // Can layer over other effects
        
        // Flash intensity syncs to beat strength
        intensitySync: {
            onBeat: 3.5,              // Bright flash on beat
            offBeat: 1.0,             // Dim between beats
            accent: 5.0,              // Blinding on accent
            subdivision: 'quarter',    // Flash every quarter note
            curve: 'exponential'      // Sharp flash attack
        },
        
        // Duration varies with tempo
        durationSync: {
            mode: 'tempo',
            baseDuration: 400,        // Base at 120 BPM
            scaling: 'inverse'        // Faster tempo = shorter flash
        },
        
        // Scale pulse with flash
        scaleSync: {
            onBeat: 1.2,              // Expand on beat
            offBeat: 1.0,             // Normal size off beat
            accent: 1.4,              // Big expansion on accent
            curve: 'elastic'          // Bouncy scale
        },
        
        // Strobe patterns
        strobeSync: {
            enabled: false,           // Enable for strobe effect
            pattern: 'XXOX',          // X=flash, O=dark
            subdivision: 'sixteenth'  // Strobe rate
        },
        
        // Musical dynamics
        dynamics: {
            forte: { glowPeak: 4.0, scalePeak: 1.3, duration: 300 },
            piano: { glowPeak: 2.0, scalePeak: 1.05, duration: 500 }
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.flash = {
            originalOpacity: particle.opacity,
            originalSize: particle.size,
            initialized: true
        };
    },
    
    /**
     * Apply flash effect to particle
     * Creates bright burst with size expansion and outward motion
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.flash?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.flash;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate flash intensity curve
        let flashIntensity;
        if (progress < 0.3) {
            // Quick rise to peak brightness
            flashIntensity = (progress / 0.3) * config.glowPeak;
        } else {
            // Gradual fade from peak
            flashIntensity = config.glowPeak * (1 - (progress - 0.3) / 0.7);
        }
        
        // Apply brightness and size changes
        particle.opacity = Math.min(1, data.originalOpacity * (1 + flashIntensity * strength));
        particle.size = data.originalSize * (1 + (config.scalePeak - 1) * flashIntensity * strength * 0.1);
        
        // Initial burst motion - particles briefly explode outward
        if (progress < 0.2) {
            const burstStrength = (1 - progress / 0.2) * strength;
            const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
            particle.vx += Math.cos(angle) * burstStrength * 2 * dt;
            particle.vy += Math.sin(angle) * burstStrength * 2 * dt;
        }
        
        // Apply velocity decay for natural deceleration
        particle.vx *= (1 - config.particleMotion.decay * 0.1);
        particle.vy *= (1 - config.particleMotion.decay * 0.1);
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.flash) {
            particle.opacity = particle.gestureData.flash.originalOpacity;
            particle.size = particle.gestureData.flash.originalSize;
            delete particle.gestureData.flash;
        }
    }
};