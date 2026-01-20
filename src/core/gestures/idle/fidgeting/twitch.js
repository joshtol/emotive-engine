/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Twitch Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Paranoid twitching motion for suspicious/nervous states
 * @author Emotive Engine Team
 * @module gestures/motions/twitch
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 * 
 * GESTURE TYPE:
 * type: 'blending' - Adds to existing particle motion
 * 
 * VISUAL EFFECT:
 * Random, sudden jerky movements that blend with existing behavior.
 * Creates a nervous, paranoid feeling with unpredictable micro-movements.
 */

export default {
    name: 'twitch',
    emoji: '⚡',
    type: 'blending',
    description: 'Nervous, paranoid twitching',
    
    // Default configuration
    config: {
        intensity: 8,           // Twitch strength
        frequency: 0.08,        // Chance of twitching per frame
        duration: 100,          // Legacy fallback (per twitch)
        musicalDuration: { musical: true, beats: 0.5 }, // 0.5 beats per twitch cycle
        recovery: 200,          // Recovery time between twitches
        maxOffset: 15,          // Maximum twitch distance
        sharpness: 0.9         // How sudden the movements are
    },
    
    // Rhythm configuration - twitch syncs to nervous subdivisions
    rhythm: {
        enabled: true,
        syncMode: 'subdivision',
        durationSync: { mode: 'beats', beats: 0.5 }, // 0.5 beats duration

        // Twitch probability increases on beat
        probabilitySync: {
            subdivision: 'sixteenth',
            onBeat: 0.3,        // 30% chance on beat
            offBeat: 0.05,      // 5% chance off beat
            accentBoost: 2.0    // Double on accents
        },
        
        // Intensity follows rhythm
        intensitySync: {
            onBeat: 2.0,
            offBeat: 0.8,
            curve: 'pulse'      // Sharp, sudden
        },
        
        // Pattern-specific twitching
        patternOverrides: {
            'breakbeat': {
                // Erratic broken twitches
                probabilitySync: { onBeat: 0.5, offBeat: 0.1 },
                intensitySync: { onBeat: 3.0, offBeat: 0.5 }
            },
            'dubstep': {
                // Heavy twitch on drop
                intensitySync: {
                    onBeat: 1.5,
                    dropBeat: 5.0,
                    curve: 'pulse'
                }
            }
        }
    },
    
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Initialize twitch data if needed
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        if (!particle.gestureData.twitch) {
            particle.gestureData.twitch = {
                twitchOffset: { x: 0, y: 0 },
                targetOffset: { x: 0, y: 0 },
                isTwitching: false,
                twitchTimer: 0,
                cooldownTimer: 0,
                lastTwitch: 0
            };
        }
        
        const data = particle.gestureData.twitch;
        const {config} = this;
        let intensity = motion.intensity || config.intensity;

        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            intensity *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            intensity *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.probabilityMultiplier) {
                // Frequency modulation applied
            }
        }
        
        // Update timers
        const currentTime = Date.now();
        
        // Check for new twitch
        if (!data.isTwitching && data.cooldownTimer <= 0) {
            if (Math.random() < (motion.frequency || config.frequency)) {
                // Start a new twitch
                data.isTwitching = true;
                data.twitchTimer = config.duration;
                data.cooldownTimer = config.recovery;
                
                // Random twitch direction and distance
                const angle = Math.random() * Math.PI * 2;
                const distance = (config.maxOffset * 0.5) + Math.random() * (config.maxOffset * 0.5);
                
                data.targetOffset = {
                    x: Math.cos(angle) * distance * intensity / 8,
                    y: Math.sin(angle) * distance * intensity / 8
                };
                
                data.lastTwitch = currentTime;
            }
        }
        
        // Update cooldown
        if (data.cooldownTimer > 0) {
            data.cooldownTimer -= dt * 16;
        }
        
        // Apply twitch motion
        if (data.isTwitching) {
            data.twitchTimer -= dt * 16;
            
            if (data.twitchTimer > 0) {
                // Sharp movement toward target
                const {sharpness} = config;
                data.twitchOffset.x += (data.targetOffset.x - data.twitchOffset.x) * sharpness;
                data.twitchOffset.y += (data.targetOffset.y - data.twitchOffset.y) * sharpness;
            } else {
                // Twitch complete, start returning
                data.isTwitching = false;
            }
        } else {
            // Return to normal position
            data.twitchOffset.x *= 0.85;
            data.twitchOffset.y *= 0.85;
        }
        
        // Apply the twitch offset to velocity (blending mode)
        particle.vx += data.twitchOffset.x * dt * 0.5;
        particle.vy += data.twitchOffset.y * dt * 0.5;
        
        // Add micro-jitter for constant nervousness
        if (Math.random() < 0.1) {
            particle.vx += (Math.random() - 0.5) * intensity * 0.3;
            particle.vy += (Math.random() - 0.5) * intensity * 0.3;
        }
    },
    
    cleanup(particle) {
        if (particle.gestureData?.twitch) {
            delete particle.gestureData.twitch;
        }
    },

    /**
     * 3D translation for twitch gesture
     * Quick sudden movements in random directions with rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || {};
            // Reduced intensity by 40% (was 8, now effectively 4.8)
            let intensity = (config.intensity || 8) * 0.6;
            const maxOffset = config.maxOffset || 15;
            const frequency = config.frequency || 0.08;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                intensity *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                intensity *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Create random twitch seed based on progress to get consistent but chaotic movement
            const twitchPhase = Math.floor(progress * 10); // Creates discrete twitch moments
            const seed = twitchPhase * 9999;

            // Pseudo-random but repeatable based on seed
            const random = offset => {
                const x = Math.sin(seed + offset) * 10000;
                return x - Math.floor(x);
            };

            // Determine if currently twitching (sharp probability spikes)
            const isTwitching = random(0) < frequency * 3;

            if (isTwitching) {
                // Random direction for position - reduced by 40%
                const angle = random(1) * Math.PI * 2;
                const PIXEL_TO_3D = 0.003; // Reduced from 0.005
                const distance = maxOffset * intensity / 8 * PIXEL_TO_3D;

                const posX = Math.cos(angle) * distance * random(2);
                const posY = Math.sin(angle) * distance * random(3);
                const posZ = (random(4) - 0.5) * distance;

                // Random rotation twitch - reduced by 40%
                const rotX = (random(5) - 0.5) * 0.12;
                const rotY = (random(6) - 0.5) * 0.12;
                const rotZ = (random(7) - 0.5) * 0.12;

                // Sharp scale variation - reduced by 40%
                const scale = 1.0 + (random(8) - 0.5) * 0.06;

                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale
                };
            } else {
                // Return to neutral with reduced micro-jitter (40% less)
                const microJitter = 0.3;
                return {
                    position: [
                        (random(10) - 0.5) * microJitter,
                        (random(11) - 0.5) * microJitter,
                        (random(12) - 0.5) * microJitter
                    ],
                    rotation: [
                        (random(13) - 0.5) * 0.006,
                        (random(14) - 0.5) * 0.006,
                        (random(15) - 0.5) * 0.006
                    ],
                    scale: 1.0
                };
            }
        }
    }
};