/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glow Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Glow gesture - sustained luminous effect
 * @author Emotive Engine Team
 * @module gestures/effects/glow
 */

export default {
    name: 'glow',
    emoji: '✨',
    type: 'blending',
    description: 'Sustained glowing effect',
    
    // Default configuration
    config: {
        duration: 1500,      // Animation duration
        glowAmount: 1.5,     // Sustained brightness level
        glowPeak: 2.0,       // Maximum glow intensity
        easing: 'sine',      // Smooth curve type
        strength: 0.3,       // Overall effect intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 0.3,       // Gentle radial force
            direction: 'outward', // Expansion direction
            gentle: true         // Soft movement mode
        }
    },
    
    // Rhythm configuration - sustained luminosity following musical phrases
    rhythm: {
        enabled: true,
        syncMode: 'phrase',  // Long, sustained glow following musical phrases
        
        // Glow intensity responds to harmonic content
        intensitySync: {
            onPhrase: 2.5,        // Strong glow during musical phrases
            offPhrase: 1.2,       // Gentle glow between phrases
            curve: 'sustained'    // Smooth transitions, no sharp changes
        },
        
        // Duration extends with phrase length
        durationSync: {
            mode: 'phrase',
            minBeats: 4,          // Minimum 4-beat glow
            maxBeats: 16,         // Maximum full phrase glow
            sustain: true         // Maintain glow through phrase
        },
        
        // Gentle response to harmonic changes
        harmonicResponse: {
            enabled: true,
            multiplier: 1.8,      // Moderate brightness increase
            type: 'brightness'    // Affects glow intensity
        },
        
        // Style variations for different music types
        patternOverrides: {
            'ambient': {
                // Ethereal, floating glow
                intensitySync: { onPhrase: 2.8, offPhrase: 1.5, curve: 'ethereal' },
                durationSync: { minBeats: 8, maxBeats: 32 }
            },
            'classical': {
                // Expressive, dynamic glow
                intensitySync: { onPhrase: 2.2, offPhrase: 0.8 },
                harmonicResponse: { multiplier: 2.2 }
            },
            'electronic': {
                // Precise, controlled glow
                intensitySync: { onPhrase: 2.6, offPhrase: 1.0, curve: 'precise' },
                durationSync: { minBeats: 2, maxBeats: 8 }
            }
        },
        
        // Musical dynamics
        dynamics: {
            forte: {
                // Brilliant, radiant glow
                intensitySync: { 
                    onPhrase: { multiplier: 1.8 },
                    offPhrase: { multiplier: 1.4 }
                },
                harmonicResponse: { multiplier: 2.5 }
            },
            piano: {
                // Soft, gentle luminosity
                intensitySync: { 
                    onPhrase: { multiplier: 0.7 },
                    offPhrase: { multiplier: 0.5 }
                },
                harmonicResponse: { multiplier: 1.3 }
            }
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.glow = {
            originalOpacity: particle.opacity,
            originalGlow: particle.glowSizeMultiplier || 0,
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.glow?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.glow;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate smooth glow intensity using sine wave curve
        const glowIntensity = Math.sin(progress * Math.PI) * config.glowPeak;
        
        // Apply glow
        particle.opacity = Math.min(1, data.originalOpacity * (1 + glowIntensity * strength * 0.5));
        particle.hasGlow = true;
        particle.glowSizeMultiplier = data.originalGlow + glowIntensity * strength;
        
        // Gentle radial drift
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        const driftStrength = Math.sin(progress * Math.PI) * strength * 0.1;
        particle.vx += Math.cos(angle) * driftStrength * dt;
        particle.vy += Math.sin(angle) * driftStrength * dt;
        
        // Apply damping for smooth motion
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.glow) {
            particle.opacity = particle.gestureData.glow.originalOpacity;
            particle.glowSizeMultiplier = particle.gestureData.glow.originalGlow;
            delete particle.gestureData.glow;
        }
    }
};