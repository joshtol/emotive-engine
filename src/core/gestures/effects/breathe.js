/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Breathe Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Breathe gesture - inhale/exhale particle motion
 * @author Emotive Engine Team
 * @module gestures/effects/breathe
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'breathe',
    emoji: '🫁',
    type: 'blending',
    description: 'Breathing rhythm with inhale and exhale',
    
    // Default configuration
    config: {
        // Musical duration - one full breath per bar
        musicalDuration: {
            musical: true,
            bars: 1,           // Default to 1 bar breathing cycle
            minBeats: 2,       // Minimum half bar
            maxBeats: 16       // Maximum 4 bars for slow breathing
        },
        
        // Musical phases of breathing
        phases: [
            { name: 'inhale', beats: 1.5 },     // Inhale phase
            { name: 'hold_in', beats: 0.5 },    // Hold at peak
            { name: 'exhale', beats: 1.5 },     // Exhale phase
            { name: 'hold_out', beats: 0.5 }    // Hold at rest
        ],
        
        inhaleRadius: 1.5,     // Maximum expansion distance
        exhaleRadius: 0.3,     // Minimum contraction distance
        breathRate: 0.3,       // Breathing rhythm speed
        spiralStrength: 0.002, // Subtle spiral motion intensity
        scaleAmount: 0.25,     // Core size variation amount
        glowAmount: 0.4,       // Glow intensity variation
        frequency: 1,          // Number of breath cycles
        easing: 'sine',        // Smooth, natural curve type
        strength: 0.8,         // Overall motion influence
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'breathe',
            strength: 0.8,         // Particle response strength
            inhaleRadius: 1.5,     // Particle expansion limit
            exhaleRadius: 0.3      // Particle contraction limit
        }
    },
    
    // Rhythm configuration - breathing synced to musical phrases
    rhythm: {
        enabled: true,
        syncMode: 'phrase',  // Long breathing cycles across musical phrases
        
        // Breath rate syncs to musical tempo
        breathRateSync: {
            mode: 'tempo',
            bpm: 'auto',          // Match song tempo
            subdivision: 'whole', // Full breaths on whole notes
            curve: 'sine'         // Natural breathing curve
        },
        
        // Inhale/exhale expansion syncs to dynamics
        radiusSync: {
            inhale: {
                onUpbeat: 1.8,    // Deeper inhale on upbeats
                onDownbeat: 1.4,  // Standard inhale on downbeats
                curve: 'ease-in'
            },
            exhale: {
                onUpbeat: 0.2,    // Complete exhale on upbeats
                onDownbeat: 0.4,  // Gentle exhale on downbeats
                curve: 'ease-out'
            }
        },
        
        // Duration matches musical phrasing
        durationSync: {
            mode: 'phrases',
            phrases: 2,           // Breathe across 2 musical phrases
            hold: 'fermata'       // Hold breath on fermatas
        },
        
        // Respond to musical accents
        accentResponse: {
            enabled: true,
            multiplier: 1.5,      // Deeper breath on accents
            type: 'expansion'     // Accent affects radius expansion
        },
        
        // Pattern-specific breathing styles
        patternOverrides: {
            'ballad': {
                // Slow, deep breathing for emotional ballads
                breathRateSync: { subdivision: 'double-whole' },
                radiusSync: { 
                    inhale: { onUpbeat: 2.2, onDownbeat: 1.8 },
                    exhale: { onUpbeat: 0.1, onDownbeat: 0.2 }
                }
            },
            'uptempo': {
                // Quick, energetic breathing
                breathRateSync: { subdivision: 'half' },
                radiusSync: { 
                    inhale: { onUpbeat: 1.4, onDownbeat: 1.2 },
                    exhale: { onUpbeat: 0.3, onDownbeat: 0.4 }
                }
            },
            'ambient': {
                // Ethereal, floating breathing
                breathRateSync: { subdivision: 'whole', curve: 'ease' },
                radiusSync: { 
                    inhale: { onUpbeat: 1.6, onDownbeat: 1.6 },
                    exhale: { onUpbeat: 0.2, onDownbeat: 0.2 }
                }
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Powerful, deep breathing
                radiusSync: { 
                    inhale: { multiplier: 1.8 },
                    exhale: { multiplier: 0.5 }
                },
                spiralStrength: 0.004,  // More spiral motion
                scaleAmount: 0.4
            },
            piano: {
                // Gentle, subtle breathing
                radiusSync: { 
                    inhale: { multiplier: 1.2 },
                    exhale: { multiplier: 0.8 }
                },
                spiralStrength: 0.001,  // Minimal spiral
                scaleAmount: 0.1
            }
        }
    },
    
    /**
     * Initialize breathing data for a particle
     * Stores particle's starting position and relationship to center
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Calculate particle's position relative to orb center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.breathe = {
            startX: particle.x,                        // Original X position
            startY: particle.y,                        // Original Y position
            angle: Math.atan2(dy, dx),                // Direction from center
            baseRadius: Math.sqrt(dx * dx + dy * dy), // Distance from center
            phaseOffset: Math.random() * 0.2 - 0.1    // Slight timing variation for organic feel
        };
    },
    
    /**
     * Apply breathing motion to particle
     * Creates expansion/contraction movement synchronized with breath rhythm
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize particle data if needed
        if (!particle.gestureData?.breathe) {
            this.initialize(particle, motion, centerX, centerY);
        }
        

        const config = { ...this.config, ...motion };
        
        // Calculate breath phase - creates smooth sine wave between exhale and inhale
        // Result oscillates smoothly between 0 (exhale) and 1 (inhale)
        const breathPhase = (Math.sin(progress * Math.PI * 2 * config.breathRate) + 1) / 2;
        
        // Define breathing boundaries relative to orb size
        // Scale boundaries based on particle's size factor for consistent appearance
        const referenceRadius = 100 * (particle.scaleFactor || 1);
        const inhaleRadius = config.inhaleRadius * referenceRadius;
        const exhaleRadius = config.exhaleRadius * referenceRadius;
        
        // Interpolate target position between exhale and inhale boundaries
        const targetRadius = exhaleRadius + (inhaleRadius - exhaleRadius) * breathPhase;
        
        // Calculate particle's current distance from center
        const currentDx = particle.x - centerX;
        const currentDy = particle.y - centerY;
        const currentRadius = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
        
        // Calculate radial movement needed to reach target breathing position
        const radiusDiff = targetRadius - currentRadius;
        const moveStrength = (motion.strength || 0.8) * 0.05 * dt;
        
        // Apply radial motion (move in/out from center)
        if (currentRadius > 0) {
            // Normalize direction and apply movement
            const moveX = (currentDx / currentRadius) * radiusDiff * moveStrength;
            const moveY = (currentDy / currentRadius) * radiusDiff * moveStrength;
            
            particle.vx += moveX;
            particle.vy += moveY;
            
            // Add organic spiral motion for more natural breathing feel
            // Creates slight circular drift during expansion/contraction
            const spiralStrength = config.spiralStrength * dt * (motion.strength || 1);
            const tangentX = -currentDy / currentRadius;  // Perpendicular to radial direction
            const tangentY = currentDx / currentRadius;
            
            // Spiral motion stronger during inhale, creating expanding spiral
            particle.vx += tangentX * spiralStrength * breathPhase;
            particle.vy += tangentY * spiralStrength * breathPhase;
        }
        
        // Apply velocity damping for smooth, controlled motion
        // Prevents particles from overshooting or oscillating
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    },
    
    /**
     * Clean up breathing data when gesture completes
     * Removes stored data to free memory
     */
    cleanup(particle) {
        if (particle.gestureData?.breathe) {
            delete particle.gestureData.breathe;
        }
    },

    /**
     * 3D core transformation for breathe gesture
     * Dramatic breathing with expansion/contraction and glow pulsing
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || {};
            const breathRate = config.breathRate || 0.3;

            // Breathing phase - smooth sine wave oscillation
            const breathPhase = Math.sin(progress * Math.PI * 2 * breathRate);

            // Fade-out envelope for smooth return to neutral at end
            // Last 20% of animation fades back to neutral
            const fadeOutStart = 0.8;
            let envelope = 1.0;
            if (progress > fadeOutStart) {
                const fadeProgress = (progress - fadeOutStart) / (1.0 - fadeOutStart);
                // Ease-out cubic for smooth deceleration
                envelope = 1.0 - (fadeProgress * fadeProgress * fadeProgress);
            }

            // Dramatic scale pulsing - exhale (0.7x) to inhale (1.4x)
            const scaleOffset = breathPhase * 0.35 * envelope; // Apply envelope
            const scale = 1.0 + scaleOffset; // Range: 0.65 to 1.35, fading to 1.0

            // Dramatic glow pulsing - dim on exhale, bright on inhale
            // Exhale (dim): 0.5, Inhale (bright): 2.5
            const glowOffset = breathPhase * 1.0 * envelope; // Apply envelope
            const glowIntensity = 1.5 + glowOffset; // Range: 0.5 to 2.5

            // Slight Y-axis position shift - rise on inhale, lower on exhale
            const yOffset = breathPhase * 0.05 * envelope; // Apply envelope

            return {
                position: [0, yOffset, 0],
                rotation: [0, 0, 0],
                scale,
                glowIntensity: 1.0 + glowOffset // Fade glow back toward neutral (1.0)
            };
        }
    }
};