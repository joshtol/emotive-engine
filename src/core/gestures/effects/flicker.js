/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flicker Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flicker gesture - opacity and motion variation
 * @author Emotive Engine Team
 * @module gestures/effects/flicker
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a flickering effect with rapid opacity changes and subtle motion jitter.  
 * ║ This is a BLENDING gesture that adds visual instability, perfect for glitches,   
 * ║ electrical effects, or nervous energy.                                            
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Frame 1      Frame 2      Frame 3      Frame 4
 *      ⭐          ·⭐·         ⭐⭐⭐         ·⭐
 *    (100%)       (30%)        (120%)        (50%)
 *    normal       dimmed       bright        partial
 * 
 * USED BY:
 * - Glitch/digital effects
 * - Electrical sparks
 * - Nervous/unstable states
 * - Teleportation effects
 * - Broken/malfunctioning states
 */

/**
 * Flicker gesture configuration and implementation
 */
export default {
    name: 'flicker',
    emoji: '⚡',
    type: 'blending', // Adds to existing motion
    description: 'Rapid opacity changes with motion jitter',
    
    // Default configuration
    config: {
        duration: 800,         // Animation duration
        flickerRate: 15,       // Flicker speed
        frequency: 6,          // Flicker count
        minOpacity: 0.3,       // Minimum visibility
        maxOpacity: 1.0,       // Maximum visibility
        jitterAmount: 2,       // Position wobble range
        colorShift: false,     // Enable hue variation
        strobe: false,         // Regular vs random pattern
        pulseMode: false,      // Smooth vs sharp transitions
        groupFlicker: 0.3,     // Group synchronization probability
        easing: 'linear',      // Animation curve type
        strength: 0.7,         // Overall effect intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'flicker',
            strength: 0.7,     // Particle flicker strength
            frequency: 6       // Particle flicker rate
        }
    },
    
    // Rhythm configuration - flicker syncs to subdivisions
    rhythm: {
        enabled: true,
        syncMode: 'subdivision',  // Flicker on subdivisions
        
        // Flicker rate syncs to tempo
        rateSync: {
            subdivision: 'sixteenth',  // Flicker on 16th notes
            onBeat: 30,               // Rapid flicker on beat
            offBeat: 10,              // Slower between beats
            triplet: 20,              // Medium on triplets
            curve: 'step'             // Instant changes
        },
        
        // Opacity patterns with rhythm
        opacitySync: {
            pattern: 'HLMH',          // High-Low-Medium-High
            subdivision: 'eighth',     // Pattern rate
            onAccent: 0.1,           // Nearly off on accent (dramatic)
            regular: 0.5              // Medium normally
        },
        
        // Jitter amount varies
        jitterSync: {
            onBeat: 5,                // Big jitter on beat
            offBeat: 1,               // Minimal between
            accent: 10,               // Extreme on accent
            curve: 'random'           // Chaotic motion
        },
        
        // Strobe modes
        strobeSync: {
            verse: false,             // No strobe in verse
            chorus: true,             // Strobe in chorus
            drop: 'intense',          // Intense strobe on drop
            pattern: 'XOXO'          // Strobe pattern
        },
        
        // Musical dynamics
        dynamics: {
            forte: { flickerRate: 25, jitterAmount: 5, minOpacity: 0.1 },
            piano: { flickerRate: 8, jitterAmount: 1, minOpacity: 0.5 }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     */
    initialize(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const config = { ...this.config, ...motion };
        
        // Determine if this particle is part of a synchronized group
        const isGrouped = Math.random() < config.groupFlicker;
        
        particle.gestureData.flicker = {
            baseOpacity: particle.opacity || particle.life || 1,
            baseColor: particle.color,
            baseX: particle.x,
            baseY: particle.y,
            flickerTimer: 0,
            lastFlicker: 0,
            flickerState: true,
            isGrouped,
            groupId: isGrouped ? Math.floor(Math.random() * 3) : -1, // Assign to flicker group
            phase: Math.random() * Math.PI * 2,  // Random phase offset
            colorHue: 0,
            initialized: true
        };
    },
    
    /**
     * Apply flicker effect to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.flicker?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.flicker;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Update flicker timer
        data.flickerTimer += dt * config.flickerRate;
        
        // Calculate opacity based on mode
        let opacityMultiplier;
        
        if (config.strobe) {
            // Strobe pattern - regular on/off
            const strobePhase = (data.flickerTimer + data.phase) % 1;
            opacityMultiplier = strobePhase < 0.5 ? 1 : config.minOpacity;
            
        } else if (config.pulseMode) {
            // Smooth pulsing
            const pulsePhase = data.flickerTimer + data.phase;
            opacityMultiplier = config.minOpacity + 
                (config.maxOpacity - config.minOpacity) * (Math.sin(pulsePhase) * 0.5 + 0.5);
            
        } else {
            // Random flicker
            if (data.flickerTimer - data.lastFlicker > 1) {
                data.lastFlicker = data.flickerTimer;
                
                // Group flicker logic
                if (data.isGrouped) {
                    // Flicker based on group timing
                    const groupPhase = Math.floor(data.flickerTimer) % 3;
                    data.flickerState = groupPhase === data.groupId;
                } else {
                    // Individual random flicker
                    data.flickerState = Math.random() > 0.3;
                }
            }
            
            // Calculate target opacity
            const targetOpacity = data.flickerState ? 
                config.maxOpacity : 
                config.minOpacity + Math.random() * 0.3;
            
            // Smooth transition for less harsh flicker
            const currentOpacity = particle.opacity / data.baseOpacity;
            opacityMultiplier = currentOpacity + (targetOpacity - currentOpacity) * 0.3;
        }
        
        // Apply opacity with strength
        const finalOpacity = data.baseOpacity * (1 + (opacityMultiplier - 1) * strength);
        particle.opacity = Math.max(0, Math.min(1, finalOpacity)); // Clamp to 0-1
        
        // Update life if used instead of opacity
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }
        
        // Apply position jitter
        if (config.jitterAmount > 0 && opacityMultiplier > config.minOpacity) {
            const jitter = config.jitterAmount * strength * particle.scaleFactor;
            const jitterX = (Math.random() - 0.5) * jitter * opacityMultiplier;
            const jitterY = (Math.random() - 0.5) * jitter * opacityMultiplier;
            
            particle.vx += jitterX * 0.1 * dt;
            particle.vy += jitterY * 0.1 * dt;
        }
        
        // Apply color shift if enabled
        if (config.colorShift && particle.color) {
            data.colorHue += 0.01 * dt;
            const hueShift = Math.sin(data.colorHue) * 30; // ±30 degree hue shift
            particle.color = this.shiftHue(data.baseColor, hueShift * strength);
        }
        
        // Smooth fade in/out at gesture boundaries
        let fadeFactor = 1;
        if (progress < 0.1) {
            fadeFactor = progress / 0.1;  // Fade in
        } else if (progress > 0.9) {
            fadeFactor = (1 - progress) / 0.1;  // Fade out
        }
        
        particle.opacity *= fadeFactor;
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }
        
        // Dampen velocity slightly for stability
        if (progress > 0.8) {
            particle.vx *= 0.95;
            particle.vy *= 0.95;
        }
    },
    
    /**
     * Shift the hue of a color
     * @param {string} color - Hex color string
     * @param {number} degrees - Degrees to shift hue
     * @returns {string} New hex color
     */
    shiftHue(color, degrees) {
        // Simple hue shift implementation
        // In production, use a proper color library
        if (!color || !color.startsWith('#')) return color;
        
        // Convert hex to RGB
        const hex = color.slice(1);
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        // Simple hue rotation (approximate)
        const hueRad = degrees * Math.PI / 180;
        const cos = Math.cos(hueRad);
        const sin = Math.sin(hueRad);
        
        // Rotate around luminance axis (simplified)
        const newR = r * cos - g * sin;
        const newG = r * sin + g * cos;
        const newB = b;
        
        // Convert back to hex
        const toHex = n => {
            const val = Math.max(0, Math.min(255, Math.round(n * 255)));
            return val.toString(16).padStart(2, '0');
        };
        
        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.flicker) {
            const data = particle.gestureData.flicker;
            particle.opacity = data.baseOpacity;
            particle.color = data.baseColor;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            delete particle.gestureData.flicker;
        }
    }
};