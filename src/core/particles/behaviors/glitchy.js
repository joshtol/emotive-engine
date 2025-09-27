/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glitchy Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Digital glitch behavior with stuttering orbits and corruption
 * @author Emotive Engine Team
 * @module particles/behaviors/glitchy
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT                                                                           
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Particles orbit like in love state but with digital glitches, stutters, and      
 * ║ corruption artifacts. Creates a captivating dubstep-like visual rhythm.           
 * ║ Combines smooth orbiting with sudden position jumps and digital artifacts.        
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 * 
 * BEHAVIOR PATTERN:
 * • Base orbiting motion (like love state)
 * • Random position jumps (teleportation glitches)
 * • Stuttering/freezing (frame drops)
 * • Trail duplication (ghosting artifacts)
 * • RGB channel separation
 * • Digital noise bursts
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  VISUAL: Glitched Orbiting                                                       │
 * │                                                                                   │
 * │       ░░▒▒▓▓█  ←─ Digital trail                                                 │
 * │     •  ┊  •                                                                      │
 * │   •┊  ⚡  ┊•  ←─ Glitch jump                                                    │
 * │     •  ┊  •                                                                      │
 * │       ░░▒▒▓▓█                                                                    │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

export default {
    name: 'glitchy',
    emoji: '⚡',
    description: 'Digital glitch with stuttering orbits and corruption',
    
    // Rhythm configuration for glitchy behavior
    rhythm: {
        enabled: true,
        
        // Glitch events sync to rhythm
        glitchTiming: {
            mode: 'subdivision',     // Glitch on subdivisions
            subdivision: 'sixteenth', // 16th notes for rapid glitches
            probability: 0.3,        // 30% chance on each 16th
            intensityOnBeat: 2.0,    // Stronger glitches on beat
            intensityOffBeat: 0.5    // Weaker between beats
        },
        
        // Stutter/freeze timing
        stutterSync: {
            mode: 'pattern',         // Based on rhythm pattern
            patterns: {
                'dubstep': {
                    freezeOnDrop: true,  // Freeze on the drop (beat 3)
                    dropDuration: 100    // Freeze for 100ms
                },
                'breakbeat': {
                    randomFreeze: 0.1,   // 10% chance per beat
                    duration: 50         // Short 50ms freezes
                }
            }
        },
        
        // Orbital speed modulation
        orbitRhythm: {
            baseSpeed: 'tempo',      // Speed scales with BPM
            wobbleSync: 'eighth',    // Wobble on 8th notes
            beatAcceleration: 1.5,   // Speed boost on beat
            barReset: true           // Reset orbit angle each bar
        },
        
        // RGB split effect rhythm
        rgbSync: {
            enabled: true,
            amount: 'intensity',     // Split based on musical intensity
            direction: 'beat',        // Change split direction on beat
            maxSplit: 10             // Maximum pixel split
        },
        
        // Digital noise bursts
        noiseRhythm: {
            trigger: 'accent',       // Noise on accented beats
            duration: 50,            // 50ms noise bursts
            intensity: 'drop'        // Scale with drop intensity
        }
    },
    
    /**
     * Initialize particle state for glitchy behavior
     */
    initialize(particle, config, centerX, centerY) {
        // Set particle color from emotion palette
        if (particle.emotionColors && particle.emotionColors.length > 0) {
            particle.color = selectWeightedColor(particle.emotionColors);
        }
        
        particle.behaviorState = {
            // Orbital properties (tighter orbit to stay centered)
            orbitAngle: Math.random() * Math.PI * 2,
            orbitRadius: 30 + Math.random() * 40,  // Reduced from 40-120 to 30-70
            orbitSpeed: 0.01 + Math.random() * 0.02,
            
            // Glitch properties
            glitchTimer: 0,
            nextGlitch: Math.random() * 500 + 100,
            isGlitching: false,
            glitchDuration: 0,
            glitchOffset: { x: 0, y: 0 },
            
            // Stutter properties
            stutterTimer: 0,
            nextStutter: Math.random() * 200 + 50,
            isFrozen: false,
            frozenPosition: { x: 0, y: 0 },
            frozenVelocity: { x: 0, y: 0 },
            
            // Trail ghost properties
            hasGhost: Math.random() < 0.3,
            ghostOffset: Math.random() * 20 + 10,
            ghostAngle: Math.random() * Math.PI * 2,
            
            // RGB separation
            rgbSplit: Math.random() < 0.4,
            rgbPhase: Math.random() * Math.PI * 2,
            
            // Digital noise
            noiseLevel: 0,
            noiseBurst: false,
            
            // Dubstep rhythm sync
            beatPhase: Math.random() * Math.PI * 2,
            beatFrequency: 0.05 + Math.random() * 0.03,
            dropIntensity: 0
        };
        
        // Special properties for glitch
        particle.lifeDecay = 0.0015; // Slower decay for trails
        particle.hasGlow = Math.random() < 0.5; // More glow for digital effect
        if (particle.hasGlow) {
            particle.glowSizeMultiplier = 2.0 + Math.random(); // Bigger glows
        }
    },
    
    /**
     * Update particle physics for glitchy behavior
     */
    update(particle, dt, centerX, centerY) {
        const state = particle.behaviorState;
        if (!state) return;
        
        // centerX and centerY are passed correctly from updateBehavior
        // No need for fallbacks - they should always be provided
        
        // Update timers
        state.glitchTimer += dt * 16;
        state.stutterTimer += dt * 16;
        
        // Check for stutter/freeze
        if (state.stutterTimer > state.nextStutter) {
            if (!state.isFrozen) {
                // Start freeze
                state.isFrozen = true;
                state.frozenPosition = { x: particle.x, y: particle.y };
                state.frozenVelocity = { x: particle.vx, y: particle.vy };
                state.stutterTimer = 0;
                state.nextStutter = 20 + Math.random() * 40; // Short freeze
            } else {
                // End freeze
                state.isFrozen = false;
                state.stutterTimer = 0;
                state.nextStutter = 100 + Math.random() * 300;
                
                // Sometimes jump on unfreeze (smaller jumps to stay centered)
                if (Math.random() < 0.3) {
                    particle.x += (Math.random() - 0.5) * 20;  // Reduced from 50
                    particle.y += (Math.random() - 0.5) * 20;  // Reduced from 50
                }
            }
        }
        
        // Check for glitch events
        if (state.glitchTimer > state.nextGlitch && !state.isGlitching) {
            state.isGlitching = true;
            state.glitchDuration = 50 + Math.random() * 100;
            state.glitchOffset = {
                x: (Math.random() - 0.5) * 30,  // Reduced from 100 to keep particles closer
                y: (Math.random() - 0.5) * 30   // Reduced from 100 to keep particles closer
            };
            state.glitchTimer = 0;
            
            // Change color during glitch
            if (Math.random() < 0.5 && particle.emotionColors) {
                particle.color = selectWeightedColor(particle.emotionColors);
            }
        }
        
        // End glitch
        if (state.isGlitching && state.glitchTimer > state.glitchDuration) {
            state.isGlitching = false;
            state.glitchTimer = 0;
            state.nextGlitch = 200 + Math.random() * 800;
            state.glitchOffset = { x: 0, y: 0 };
        }
        
        // Update beat phase for dubstep rhythm
        state.beatPhase += state.beatFrequency * dt;
        const beatIntensity = Math.sin(state.beatPhase) * 0.5 + 0.5;
        
        // Calculate drop intensity (periodic bass drops)
        const dropCycle = state.beatPhase % (Math.PI * 4);
        if (dropCycle < Math.PI * 0.5) {
            state.dropIntensity = Math.min(1, state.dropIntensity + dt * 0.1);
        } else {
            state.dropIntensity = Math.max(0, state.dropIntensity - dt * 0.05);
        }
        
        if (!state.isFrozen) {
            // Update orbital position with beat modulation
            state.orbitAngle += state.orbitSpeed * dt * (1 + beatIntensity * 0.5);
            
            // Add drop wobble
            const wobbleRadius = state.orbitRadius * (1 + state.dropIntensity * 0.3 * Math.sin(state.beatPhase * 4));
            
            // Calculate target position relative to center
            let targetX = centerX + Math.cos(state.orbitAngle) * wobbleRadius;
            let targetY = centerY + Math.sin(state.orbitAngle) * wobbleRadius * 0.6; // Elliptical
            
            // Apply glitch offset (smaller random factor to stay closer)
            if (state.isGlitching) {
                targetX += state.glitchOffset.x * Math.random() * 0.5;  // Reduced effect
                targetY += state.glitchOffset.y * Math.random() * 0.5;  // Reduced effect
            }
            
            // RGB split effect
            if (state.rgbSplit) {
                const splitAmount = 3 * (1 + state.dropIntensity);
                targetX += Math.sin(state.rgbPhase) * splitAmount;
                targetY += Math.cos(state.rgbPhase) * splitAmount;
                state.rgbPhase += 0.1 * dt;
            }
            
            // Digital noise bursts on drops (smaller to stay centered)
            if (state.dropIntensity > 0.8 && Math.random() < 0.1) {
                targetX += (Math.random() - 0.5) * 10;  // Reduced from 20
                targetY += (Math.random() - 0.5) * 10;  // Reduced from 20
            }
            
            // Stronger pull to center to prevent wandering
            const smoothing = state.isGlitching ? 0.05 : 0.08;  // Increased from 0.02/0.05
            particle.vx = (targetX - particle.x) * smoothing;
            particle.vy = (targetY - particle.y) * smoothing;
            
            // Add jitter based on beat
            particle.vx += (Math.random() - 0.5) * beatIntensity * 2;
            particle.vy += (Math.random() - 0.5) * beatIntensity * 2;
            
        } else {
            // Frozen - vibrate in place
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = (Math.random() - 0.5) * 0.5;
        }
        
        // Apply velocity
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        
        // Flicker opacity for digital effect
        if (Math.random() < 0.02) {
            particle.opacity = 0.1 + Math.random() * 0.9;
        }
        
        // Size pulsing with beat
        particle.size = particle.baseSize * (1 + beatIntensity * 0.3 + state.dropIntensity * 0.5);
    }
};