/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wave Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wave gesture - infinity pattern flow
 * @author Emotive Engine Team
 * @module gestures/effects/wave
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a flowing wave motion with particles moving in an infinity (∞) pattern.   
 * ║ This is an OVERRIDE gesture that creates smooth, hypnotic figure-8 movements.     
 * ║ Particles phase in and out for a dreamlike effect.                                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ∞ Infinity Pattern
 *      ↗ → ↘     ↙ ← ↖
 *     ⭐     ⭐ ⭐     ⭐
 *      ↖ ← ↙     ↘ → ↗
 *         (continuous flow)
 * 
 * USED BY:
 * - Hypnotic/mesmerizing effects
 * - Dreamy transitions
 * - Magical gestures
 * - Flow states
 */

/**
 * Wave gesture configuration and implementation
 */
export default {
    name: 'wave',
    emoji: '🌊',
    type: 'override', // Completely replaces motion
    description: 'Infinity pattern flow with phasing',
    
    // Default configuration
    config: {
        // Musical duration - wave flows for exactly 1 bar
        musicalDuration: {
            musical: true,
            bars: 1,           // Default to 1 bar of wave motion
            minBeats: 4,       // Minimum 1 bar
            maxBeats: 16       // Maximum 4 bars
        },
        
        // Musical phases of the wave gesture
        phases: [
            { name: 'gather', beats: 0.5 },     // Particles gather
            { name: 'rise', beats: 0.5 },       // Begin rising motion
            { name: 'waveLeft', beats: 1 },     // Wave to the left
            { name: 'waveRight', beats: 1 },    // Wave to the right
            { name: 'settle', beats: 1 }        // Settle back to center
        ],
        
        amplitude: 40,         // Infinity pattern width
        frequency: 1,          // Complete cycle count
        phaseShift: 0.3,       // Particle timing offset
        liftHeight: 20,        // Vertical movement range
        fadeInOut: true,       // Enable opacity transitions
        smoothness: 0.1,       // Motion fluidity factor
        easing: 'sine',        // Animation curve type
        strength: 1.0,         // Overall effect intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'wave',
            strength: 1.0,     // Wave motion strength
            amplitude: 50      // Pattern size
        }
    },
    
    // Rhythm configuration - flowing wave patterns synchronized to musical waves and phrases
    rhythm: {
        enabled: true,
        syncMode: 'wave',    // Flow with musical wave patterns and melodic contours
        
        // Amplitude responds to musical dynamics and melodic range
        amplitudeSync: {
            onWave: 65,           // Large waves during musical waves
            onStatic: 25,         // Small waves during static sections
            curve: 'flowing'      // Smooth, continuous transitions
        },
        
        // Frequency matches musical phrase rhythm
        frequencySync: {
            mode: 'phrase',
            slow: 0.7,            // Slower waves for slow phrases
            fast: 1.8,            // Faster waves for quick phrases
            curve: 'melodic'      // Follows melodic contour
        },
        
        // Duration automatically syncs to bars via musicalDuration config
        durationSync: {
            mode: 'bars',         // Uses bars from musicalDuration
            adaptToPhrase: true,  // Extend to complete musical phrases
            sustain: true         // Maintain wave through phrase
        },
        
        // Phase shift creates ensemble wave effects
        phaseSync: {
            enabled: true,
            multiplier: 0.5,      // Moderate phase variation
            type: 'ensemble'      // Creates group wave patterns
        },
        
        // Response to melodic contour
        melodicResponse: {
            enabled: true,
            multiplier: 1.4,      // Wave amplitude follows melody
            type: 'amplitude'     // Affects wave size
        },
        
        // Style variations for different music types
        patternOverrides: {
            'ambient': {
                // Slow, hypnotic waves
                amplitudeSync: { onWave: 80, onStatic: 40, curve: 'hypnotic' },
                frequencySync: { slow: 0.5, fast: 1.2 },
                durationSync: { minBeats: 16, maxBeats: 64 }
            },
            'ocean': {
                // Natural, oceanic wave patterns
                amplitudeSync: { onWave: 90, onStatic: 20, curve: 'natural' },
                phaseSync: { multiplier: 0.8 },
                melodicResponse: { multiplier: 1.8 }
            },
            'electronic': {
                // Precise, digital wave forms
                amplitudeSync: { onWave: 70, onStatic: 30, curve: 'digital' },
                frequencySync: { slow: 0.8, fast: 2.5, curve: 'precise' }
            },
            'orchestral': {
                // Rich, complex wave interactions
                amplitudeSync: { onWave: 75, onStatic: 35 },
                phaseSync: { multiplier: 0.7 },
                melodicResponse: { multiplier: 2.0 }
            }
        },
        
        // Musical dynamics
        dynamics: {
            forte: {
                // Powerful, sweeping waves
                amplitudeSync: { 
                    onWave: { multiplier: 1.8 },
                    onStatic: { multiplier: 1.4 }
                },
                frequencySync: { multiplier: 1.3 },
                melodicResponse: { multiplier: 2.2 }
            },
            piano: {
                // Gentle, subtle waves
                amplitudeSync: { 
                    onWave: { multiplier: 0.6 },
                    onStatic: { multiplier: 0.4 }
                },
                frequencySync: { multiplier: 0.7 },
                melodicResponse: { multiplier: 1.1 }
            }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Calculate initial position relative to center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const angle = Math.atan2(dy, dx);
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        // Random direction for wave motion
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        particle.gestureData.wave = {
            startX: particle.x,
            startY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            baseOpacity: particle.opacity || particle.life || 1,
            angle,
            radius,
            offset: Math.random() * Math.PI * 2, // Random phase offset
            role: Math.random(), // 0-1 for variation
            direction, // Random wave direction
            initialized: true
        };
    },
    
    /**
     * Apply wave motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.wave?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.wave;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Apply easing to progress
        const easeProgress = this.easeInOutSine(progress);
        
        // Add phase shift based on particle role (creates wave effect)
        const phaseShift = data.role * config.phaseShift;
        const adjustedPhase = Math.max(0, easeProgress - phaseShift);
        
        // Calculate infinity pattern (lemniscate) with direction
        const t = adjustedPhase * Math.PI * 2 * config.frequency * data.direction + data.offset;
        
        // Scale amplitude based on distance from center
        const radiusFactor = 0.5 + (data.radius / 100) * 0.5;
        const amplitude = config.amplitude * radiusFactor * strength * particle.scaleFactor;
        
        // Infinity pattern equations
        const infinityX = Math.sin(t) * amplitude;
        const infinityY = Math.sin(t * 2) * amplitude * 0.3; // Smaller vertical component
        
        // Add vertical lift effect
        const lift = -Math.abs(Math.sin(easeProgress * Math.PI)) * config.liftHeight * particle.scaleFactor;
        
        // Calculate target position
        const targetX = centerX + infinityX;
        const targetY = centerY + infinityY + lift;
        
        // Smooth movement with role-based variation
        const smoothness = config.smoothness + data.role * 0.12;
        
        // Apply position with smoothing
        particle.x += (targetX - particle.x) * smoothness;
        particle.y += (targetY - particle.y) * smoothness;
        
        // Set velocity for trails
        particle.vx = (targetX - particle.x) * 0.3;
        particle.vy = (targetY - particle.y) * 0.3;
        
        // Apply fade effect if enabled
        if (config.fadeInOut) {
            let fadeFactor;
            
            if (adjustedPhase < 0.1) {
                // Fade in
                fadeFactor = adjustedPhase / 0.1;
            } else if (adjustedPhase > 0.9) {
                // Fade out
                fadeFactor = (1 - adjustedPhase) / 0.1;
            } else {
                // Full opacity with sine variation
                fadeFactor = 0.5 + Math.sin(adjustedPhase * Math.PI) * 0.5;
            }
            
            particle.opacity = data.baseOpacity * (0.3 + fadeFactor * 0.7);
            
            // Update life for particles that use it instead of opacity
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
        }
        
        // Smooth ending
        if (progress >= 0.95) {
            const endFactor = (1 - progress) * 20;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
            
            // Restore opacity
            if (config.fadeInOut) {
                particle.opacity = data.baseOpacity * endFactor;
                if (particle.life !== undefined) {
                    particle.life = particle.opacity;
                }
            }
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.wave) {
            const data = particle.gestureData.wave;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.opacity = data.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            delete particle.gestureData.wave;
        }
    },
    
    /**
     * Sine easing for smooth wave motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    /**
     * 3D core transformation for wave gesture
     * Flowing infinity pattern with graceful sway and glow modulation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number, glowBoost: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;
            const frequency = motion?.frequency || 1;

            // Smooth eased progress
            const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

            // Infinity pattern (lemniscate) - creates flowing figure-8 motion
            const t = easeProgress * Math.PI * 2 * frequency;
            const swayX = Math.sin(t) * 0.12 * strength;
            const swayY = Math.sin(t * 2) * 0.06 * strength; // Half frequency for Y creates figure-8

            // Slight forward/back motion for depth
            const swayZ = Math.sin(t) * 0.03 * strength;

            // Gentle tilt rotation following the wave
            const tiltX = Math.sin(t * 2) * 0.08 * strength;
            const tiltZ = Math.sin(t) * 0.05 * strength;

            // Scale breathes with the wave - larger at peaks
            const scale = 1.0 + Math.abs(Math.sin(easeProgress * Math.PI)) * 0.08 * strength;

            // Glow follows wave peaks - brighter at extremes
            const waveIntensity = Math.abs(Math.sin(t));
            const glowIntensity = 1.0 + waveIntensity * 0.3 * strength;

            // Glow boost pulses gently with wave motion
            const glowBoost = waveIntensity * 0.6 * strength;

            return {
                position: [swayX, swayY, swayZ],
                rotation: [tiltX, 0, tiltZ],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};