/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Contract Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Contract gesture - particles move inward toward center
 * @author Emotive Engine Team
 * @module gestures/effects/contract
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'contract',
    emoji: '🌀',
    type: 'blending',
    description: 'Radial contraction toward center',
    
    // Default configuration
    config: {
        duration: 600,        // Gesture duration
        scaleAmount: 0.2,     // Core scale reduction amount
        scaleTarget: 0.2,     // Target contraction distance ratio
        glowAmount: -0.2,     // Glow intensity reduction
        easing: 'cubic',      // Smooth acceleration curve
        strength: 2.5,        // Inward pull force intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 2.5,        // Particle pull strength
            direction: 'inward',  // Movement toward center
            persist: true         // Effect continues after gesture
        }
    },
    
    // Rhythm configuration - magnetic contraction synced to musical tension
    rhythm: {
        enabled: true,
        syncMode: 'tension',  // Contract during musical tension builds
        
        // Contraction strength responds to musical intensity
        strengthSync: {
            onTension: 4.0,       // Strong pull during tension
            onRelease: 1.5,       // Gentle pull during release
            curve: 'magnetic'     // Smooth magnetic pull curve
        },
        
        // Scale target changes with dynamics
        scaleTargetSync: {
            forte: 0.1,           // Tight contraction for loud sections
            piano: 0.4,           // Gentle contraction for soft sections
            crescendo: 'gradual', // Gradual tightening on crescendos
            diminuendo: 'ease'    // Easy relaxation on diminuendos
        },
        
        // Duration responds to phrase length
        durationSync: {
            mode: 'phrases',
            shortPhrase: 0.8,     // Quick contraction for short phrases  
            longPhrase: 1.5,      // Extended contraction for long phrases
            hold: 'sustain'       // Maintain contraction during holds
        },
        
        // Strong accent response
        accentResponse: {
            enabled: true,
            multiplier: 2.2,      // Sharp contraction on accents
            type: 'strength'      // Accent affects pull force
        },
        
        // Pattern-specific contraction styles
        patternOverrides: {
            'classical': {
                // Elegant, controlled contraction
                strengthSync: { onTension: 3.5, onRelease: 1.8 },
                scaleTargetSync: { forte: 0.15, piano: 0.35 }
            },
            'metal': {
                // Aggressive, tight contraction
                strengthSync: { onTension: 5.0, onRelease: 2.0, curve: 'sharp' },
                scaleTargetSync: { forte: 0.05, piano: 0.25 }
            },
            'ambient': {
                // Slow, atmospheric contraction
                strengthSync: { onTension: 2.8, onRelease: 1.2, curve: 'ease' },
                durationSync: { shortPhrase: 1.2, longPhrase: 2.0 }
            },
            'trap': {
                // Sudden, rhythmic contraction on drops
                strengthSync: { 
                    onTension: 4.5, 
                    onRelease: 1.0,
                    dropBeat: 6.0   // Massive contraction on trap drops
                },
                scaleTargetSync: { forte: 0.08, piano: 0.3 }
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Powerful, crushing contraction
                strengthSync: { 
                    onTension: { multiplier: 1.8 },
                    onRelease: { multiplier: 1.4 }
                },
                scaleTargetSync: { multiplier: 0.6 },  // Tighter contraction
                accentResponse: { multiplier: 2.8 }
            },
            piano: {
                // Gentle, subtle contraction
                strengthSync: { 
                    onTension: { multiplier: 0.7 },
                    onRelease: { multiplier: 0.8 }
                },
                scaleTargetSync: { multiplier: 1.4 },  // Looser contraction
                accentResponse: { multiplier: 1.6 }
            }
        }
    },
    
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        particle.gestureData.contract = {
            startX: particle.x,
            startY: particle.y,
            angle: Math.atan2(dy, dx),
            baseRadius: Math.sqrt(dx * dx + dy * dy),
            initialized: true
        };
    },
    
    /**
     * Apply contraction motion to particle
     * Pulls particles toward center with magnetic-like force
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.contract?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.contract;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate contraction amount based on progress
        const contractFactor = 1 - (1 - config.scaleTarget) * progress * strength;
        const targetRadius = data.baseRadius * contractFactor;
        
        // Calculate target position closer to center
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply strong inward pull forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.5 * dt;  // Strong magnetic pull
        particle.vy += dy * 0.5 * dt;  // Strong magnetic pull
        
        // Apply velocity damping for controlled motion
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup(particle) {
        if (particle.gestureData?.contract) {
            delete particle.gestureData.contract;
        }
    },

    /**
     * 3D core transformation for contract gesture
     * Gradual scale decrease with dimming glow
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const strength = config.strength || 2.5;

            // Gradual scale contraction
            const scaleTarget = config.scaleTarget || 0.2;
            const scale = 1.0 - progress * (1.0 - scaleTarget) * (strength / 2.5);

            // Dimming glow intensity
            const glowAmount = config.glowAmount || -0.2;
            const glowIntensity = 1.0 + progress * glowAmount;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: Math.max(scaleTarget, scale),
                glowIntensity: Math.max(0.5, glowIntensity)
            };
        }
    }
};