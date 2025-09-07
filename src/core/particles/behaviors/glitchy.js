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
    
    /**
     * Initialize particle state for glitchy behavior
     */
    initialize: function(particle, config, centerX, centerY) {
        // Set particle color from emotion palette
        if (particle.emotionColors && particle.emotionColors.length > 0) {
            particle.color = selectWeightedColor(particle.emotionColors);
        }
        
        // Set initial position with vertical offset
        const verticalOffset = 50;
        if (centerY) {
            particle.y = centerY + verticalOffset;
        }
        
        particle.behaviorState = {
            // Orbital properties (base from love state)
            orbitAngle: Math.random() * Math.PI * 2,
            orbitRadius: 40 + Math.random() * 80,
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
    update: function(particle, dt, config, centerX, centerY) {
        const state = particle.behaviorState;
        if (!state) return;
        
        // Ensure we have center coordinates
        centerX = centerX || 400;
        centerY = centerY || 300;
        
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
                
                // Sometimes jump on unfreeze
                if (Math.random() < 0.3) {
                    particle.x += (Math.random() - 0.5) * 50;
                    particle.y += (Math.random() - 0.5) * 50;
                }
            }
        }
        
        // Check for glitch events
        if (state.glitchTimer > state.nextGlitch && !state.isGlitching) {
            state.isGlitching = true;
            state.glitchDuration = 50 + Math.random() * 100;
            state.glitchOffset = {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100
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
            // Add vertical offset to move particles down to align with orb
            const verticalOffset = 50; // Move particles down by 50 pixels
            let targetX = centerX + Math.cos(state.orbitAngle) * wobbleRadius;
            let targetY = centerY + verticalOffset + Math.sin(state.orbitAngle) * wobbleRadius * 0.6; // Elliptical
            
            // Apply glitch offset
            if (state.isGlitching) {
                targetX += state.glitchOffset.x * Math.random();
                targetY += state.glitchOffset.y * Math.random();
            }
            
            // RGB split effect
            if (state.rgbSplit) {
                const splitAmount = 3 * (1 + state.dropIntensity);
                targetX += Math.sin(state.rgbPhase) * splitAmount;
                targetY += Math.cos(state.rgbPhase) * splitAmount;
                state.rgbPhase += 0.1 * dt;
            }
            
            // Digital noise bursts on drops
            if (state.dropIntensity > 0.8 && Math.random() < 0.1) {
                targetX += (Math.random() - 0.5) * 20;
                targetY += (Math.random() - 0.5) * 20;
            }
            
            // Smooth approach with occasional jumps
            const smoothing = state.isGlitching ? 0.02 : 0.05;
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