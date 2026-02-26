/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Spaz Particle Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Ultra-aggressive particle behavior with explosive spread and chaotic motion
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module particles/behaviors/spaz
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates particles that explode outward in all directions with chaotic, erratic
 * ║ motion. Particles spawn far from center and maintain aggressive spread patterns.
 * ║ Perfect for high-energy emotions like glitch, anger, or excitement.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'spaz',
    description: 'Ultra-aggressive particles with explosive spread and chaotic motion',

    /**
     * Initialize particle with spaz behavior
     * @param {Object} particle - Particle object to initialize
     * @param {Object} config - Configuration object
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    initialize(particle, config, centerX, centerY) {
        // Set basic particle properties
        particle.x = centerX;
        particle.y = centerY;
        particle.life = 1.0;
        particle.size = 3 + Math.random() * 4; // Larger particles for visibility

        // Explosive velocity - particles shoot out in random directions
        const angle = Math.random() * Math.PI * 2;
        const speed = 200 + Math.random() * 300; // Very fast initial velocity
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        // Spaz-specific state
        particle.behaviorState = {
            // Explosive properties
            explosionPhase: 0, // 0 = initial explosion, 1 = chaotic motion
            explosionTimer: 0,
            explosionDuration: 1000 + Math.random() * 2000, // 1-3 seconds

            // Chaotic motion properties
            chaosTimer: 0,
            nextChaosChange: 100 + Math.random() * 200, // Change direction every 100-300ms
            chaosAngle: angle,
            chaosSpeed: 50 + Math.random() * 100,

            // Spaz-specific effects
            spazIntensity: 0.8 + Math.random() * 0.4, // How intense the spazzing is
            zigzagPattern: Math.random() < 0.5, // Some particles zigzag
            spiralPattern: Math.random() < 0.3, // Some particles spiral
            teleportChance: 0.02, // 2% chance to teleport to random position

            // Visual effects
            sizePulse: true,
            sizePulseSpeed: 0.1 + Math.random() * 0.05,
            sizePulsePhase: Math.random() * Math.PI * 2,
            colorShift: Math.random() < 0.3, // Some particles shift colors
            colorShiftSpeed: 0.05 + Math.random() * 0.03,
        };

        // Special properties for spaz
        particle.lifeDecay = 0.0008; // Slower decay for longer trails
        particle.hasGlow = true; // Always glow for maximum visibility
        particle.glowSizeMultiplier = 4.0 + Math.random() * 3; // Very large glows
        particle.glowIntensity = 1.5 + Math.random() * 0.5; // Bright glows
    },

    /**
     * Update particle physics for spaz behavior
     * @param {Object} particle - Particle to update
     * @param {number} dt - Delta time in milliseconds
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    update(particle, dt, centerX, centerY) {
        const state = particle.behaviorState;

        // Update timers
        state.explosionTimer += dt;
        state.chaosTimer += dt;

        // Phase 1: Initial explosion (first 500ms)
        if (state.explosionPhase === 0 && state.explosionTimer < 500) {
            // Maintain explosive velocity with slight deceleration
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Add random bursts during explosion
            if (Math.random() < 0.1) {
                particle.vx += (Math.random() - 0.5) * 100;
                particle.vy += (Math.random() - 0.5) * 100;
            }
        }
        // Phase 2: Transition to chaotic motion
        else if (state.explosionPhase === 0 && state.explosionTimer >= 500) {
            state.explosionPhase = 1;
            // Set up chaotic motion
            state.chaosAngle = Math.random() * Math.PI * 2;
            state.chaosSpeed = 30 + Math.random() * 70;
        }
        // Phase 3: Chaotic motion
        else if (state.explosionPhase === 1) {
            // Change direction periodically
            if (state.chaosTimer >= state.nextChaosChange) {
                state.chaosAngle = Math.random() * Math.PI * 2;
                state.chaosSpeed = 20 + Math.random() * 80;
                state.nextChaosChange = 50 + Math.random() * 150;
                state.chaosTimer = 0;
            }

            // Apply chaotic motion
            const chaosVx = Math.cos(state.chaosAngle) * state.chaosSpeed;
            const chaosVy = Math.sin(state.chaosAngle) * state.chaosSpeed;

            // Mix with current velocity for smooth transitions
            particle.vx = particle.vx * 0.7 + chaosVx * 0.3;
            particle.vy = particle.vy * 0.7 + chaosVy * 0.3;

            // Special patterns
            if (state.zigzagPattern) {
                // Zigzag motion
                const zigzagAngle = state.chaosTimer * 0.01;
                particle.vx += Math.sin(zigzagAngle) * 20;
                particle.vy += Math.cos(zigzagAngle) * 20;
            }

            if (state.spiralPattern) {
                // Spiral motion
                const spiralAngle = state.chaosTimer * 0.005;
                const spiralRadius = 50 + Math.sin(state.chaosTimer * 0.003) * 30;
                particle.vx += Math.cos(spiralAngle) * spiralRadius * 0.1;
                particle.vy += Math.sin(spiralAngle) * spiralRadius * 0.1;
            }
        }

        // Teleport effect (rare)
        if (Math.random() < state.teleportChance) {
            const teleportAngle = Math.random() * Math.PI * 2;
            const teleportDistance = 200 + Math.random() * 400;
            particle.x = centerX + Math.cos(teleportAngle) * teleportDistance;
            particle.y = centerY + Math.sin(teleportAngle) * teleportDistance;
            particle.vx = (Math.random() - 0.5) * 200;
            particle.vy = (Math.random() - 0.5) * 200;
        }

        // Update position
        particle.x += particle.vx * (dt / 1000);
        particle.y += particle.vy * (dt / 1000);

        // Size pulsing effect
        if (state.sizePulse) {
            state.sizePulsePhase += state.sizePulseSpeed * dt;
            const pulseMultiplier = 1.0 + Math.sin(state.sizePulsePhase) * 0.5;
            particle.size = (3 + Math.random() * 4) * pulseMultiplier;
        }

        // Color shifting effect
        if (state.colorShift) {
            state.colorShiftPhase = (state.colorShiftPhase || 0) + state.colorShiftSpeed * dt;
            // This would be handled by the renderer if color shifting is implemented
        }

        // Apply friction to prevent infinite acceleration
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Decay life
        particle.life -= particle.lifeDecay * dt;

        // Reset particle if it goes too far or dies
        if (
            particle.life <= 0 ||
            Math.abs(particle.x - centerX) > 2000 ||
            Math.abs(particle.y - centerY) > 2000
        ) {
            particle.life = 0;
        }
    },

    /**
     * Get spawn position for spaz particles
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @returns {Object} Spawn position {x, y}
     */
    getSpawnPosition(centerX, centerY) {
        // Spawn particles in a wide ring around the center
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 200; // Spawn 100-300 pixels from center
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
        };
    },

    /**
     * Get visual properties for spaz particles
     * @returns {Object} Visual properties
     */
    getVisualProperties() {
        return {
            glowColor: '#FF00AA', // Hot magenta
            glowIntensity: 2.0,
            particleColors: [
                { color: '#FF00AA', weight: 30 }, // Hot magenta
                { color: '#00FFAA', weight: 25 }, // Bright cyan-green
                { color: '#FFAA00', weight: 20 }, // Digital amber
                { color: '#AA00FF', weight: 15 }, // Purple
                { color: '#00AAFF', weight: 10 }, // Blue
            ],
        };
    },
};
