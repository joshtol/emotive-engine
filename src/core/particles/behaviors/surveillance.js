/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Surveillance Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Searchlight scanning behavior for suspicious/paranoid states
 * @author Emotive Engine Team
 * @module particles/behaviors/surveillance
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT                                                                           
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Particles act like searchlights or surveillance cameras, slowly scanning back     
 * ║ and forth in arcs, pausing at edges, occasionally darting to new positions.       
 * ║ Creates a paranoid, watchful atmosphere with deliberate, searching movements.     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 * 
 * BEHAVIOR PATTERN:
 * • Slow horizontal scanning arcs (like searchlights)
 * • Pause at scan extremes (checking corners)
 * • Occasional quick darts to new positions (alert response)
 * • Some particles patrol perimeter (edge surveillance)
 * • Random freezing in place (listening/watching)
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  VISUAL: Searchlight Scanning                                                    │
 * │                                                                                   │
 * │     ←─────────────→  (slow scan)                                                │
 * │    •               •                                                             │
 * │                                                                                   │
 * │   pause...     ...pause                                                         │
 * │                                                                                   │
 * │     DART! ──→ • (quick repositioning)                                          │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 */

import { selectWeightedColor } from '../utils/colorUtils.js';

export default {
    name: 'surveillance',
    emoji: '👁️',
    description: 'Searchlight scanning with paranoid watchfulness',
    
    /**
     * Initialize particle state for surveillance behavior
     */
    initialize(particle, _config) {
        // Set particle color from emotion palette
        if (particle.emotionColors && particle.emotionColors.length > 0) {
            particle.color = selectWeightedColor(particle.emotionColors);
        }
        
        particle.behaviorState = {
            // Scanning properties
            scanAngle: Math.random() * Math.PI - Math.PI/2,  // Current scan angle
            scanDirection: Math.random() < 0.5 ? 1 : -1,      // Scan direction
            scanSpeed: 0.3 + Math.random() * 0.2,             // Individual scan rate
            scanRange: Math.PI/3 + Math.random() * Math.PI/4, // Scan arc size
            scanCenter: Math.random() * Math.PI * 2,          // Center of scan arc
            pauseTimer: 0,                                     // Pause at edges
            pauseDuration: 500 + Math.random() * 500,         // How long to pause
            
            // Movement states
            mode: 'scanning',  // 'scanning', 'darting', 'frozen', 'patrolling'
            modeTimer: 0,
            nextModeChange: 2000 + Math.random() * 3000,
            
            // Dart properties
            dartTarget: { x: 0, y: 0 },
            dartSpeed: 0,
            
            // Patrol properties
            patrolRadius: 150 + Math.random() * 100,
            patrolAngle: Math.random() * Math.PI * 2,
            
            // Threat response
            alertLevel: 0,
            lastPosition: { x: particle.x, y: particle.y }
        };
        
        // Assign roles: 70% scanners, 20% patrollers, 10% watchers
        const role = Math.random();
        if (role < 0.7) {
            particle.behaviorState.primaryRole = 'scanner';
        } else if (role < 0.9) {
            particle.behaviorState.primaryRole = 'patroller';
            particle.behaviorState.mode = 'patrolling';
        } else {
            particle.behaviorState.primaryRole = 'watcher';
            particle.behaviorState.mode = 'frozen';
        }
    },
    
    /**
     * Update particle physics for surveillance behavior
     */
    update(particle, dt, config) {
        const state = particle.behaviorState;
        if (!state) return;
        
        // Update mode timer
        state.modeTimer += dt * 16;
        
        // Check for mode changes
        if (state.modeTimer > state.nextModeChange) {
            this.changeMode(particle, state);
            state.modeTimer = 0;
            state.nextModeChange = 2000 + Math.random() * 4000;
        }
        
        // Update based on current mode
        switch(state.mode) {
        case 'scanning':
            this.updateScanning(particle, dt, state, config);
            break;
        case 'darting':
            this.updateDarting(particle, dt, state, config);
            break;
        case 'frozen':
            this.updateFrozen(particle, dt, state, config);
            break;
        case 'patrolling':
            this.updatePatrolling(particle, dt, state, config);
            break;
        }
        
        // Apply slight downward drift for weight
        particle.vy += 0.05 * dt;
        
        // Update position
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        
        // Store last position
        state.lastPosition.x = particle.x;
        state.lastPosition.y = particle.y;
    },
    
    /**
     * Scanning mode - slow searchlight sweeps
     */
    updateScanning(particle, dt, state, _config) {
        // Update scan angle
        if (state.pauseTimer > 0) {
            // Pausing at edge of scan
            state.pauseTimer -= dt * 16;
            particle.vx *= 0.9;  // Slow down during pause
            particle.vy *= 0.9;
        } else {
            // Active scanning
            state.scanAngle += state.scanDirection * state.scanSpeed * dt * 0.02;
            
            // Check scan limits and pause at edges
            if (Math.abs(state.scanAngle) > state.scanRange / 2) {
                state.scanDirection *= -1;
                state.pauseTimer = state.pauseDuration;
                state.scanAngle = Math.sign(state.scanAngle) * state.scanRange / 2;
            }
        }
        
        // Apply scanning motion
        const actualAngle = state.scanCenter + state.scanAngle;
        const speed = 0.8 + state.alertLevel * 0.5;
        particle.vx = Math.cos(actualAngle) * speed;
        particle.vy = Math.sin(actualAngle) * speed * 0.3;  // Less vertical movement
    },
    
    /**
     * Darting mode - quick repositioning
     */
    updateDarting(particle, dt, state, _config) {
        const dx = state.dartTarget.x - particle.x;
        const dy = state.dartTarget.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Move toward dart target quickly
            particle.vx = (dx / distance) * state.dartSpeed;
            particle.vy = (dy / distance) * state.dartSpeed;
        } else {
            // Reached target, switch back to scanning
            state.mode = 'scanning';
            state.modeTimer = 0;
        }
    },
    
    /**
     * Frozen mode - watchful stillness
     */
    updateFrozen(particle, _dt, _state, _config) {
        // Almost no movement, just tiny vibrations
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        
        // Occasional tiny twitch
        if (Math.random() < 0.01) {
            particle.vx += (Math.random() - 0.5) * 0.5;
            particle.vy += (Math.random() - 0.5) * 0.5;
        }
    },
    
    /**
     * Patrolling mode - edge surveillance
     */
    updatePatrolling(particle, dt, state, _config) {
        // Patrol in a circle around the edge
        state.patrolAngle += 0.01 * dt;
        
        const targetX = Math.cos(state.patrolAngle) * state.patrolRadius;
        const targetY = Math.sin(state.patrolAngle) * state.patrolRadius;
        
        // Move toward patrol position
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        
        particle.vx = dx * 0.02;
        particle.vy = dy * 0.02;
    },
    
    /**
     * Change behavior mode
     */
    changeMode(particle, state) {
        const rand = Math.random();
        
        // Mode transition probabilities based on role
        if (state.primaryRole === 'scanner') {
            if (rand < 0.1) {
                // Dart to new position
                state.mode = 'darting';
                state.dartTarget = {
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200
                };
                state.dartSpeed = 3 + Math.random() * 2;
            } else if (rand < 0.2) {
                // Freeze and watch
                state.mode = 'frozen';
            } else {
                // Continue scanning
                state.mode = 'scanning';
            }
        } else if (state.primaryRole === 'patroller') {
            if (rand < 0.1) {
                state.mode = 'frozen';
            } else {
                state.mode = 'patrolling';
            }
        } else {
            // Watcher role
            if (rand < 0.3) {
                state.mode = 'scanning';
            } else {
                state.mode = 'frozen';
            }
        }
    }
};