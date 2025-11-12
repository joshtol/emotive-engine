/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Spawner
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particle Spawner - Manages particle spawning logic
 * @author Emotive Engine Team
 * @module core/particle/ParticleSpawner
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages SPAWNING LOGIC for particles. Calculates spawn positions based on
 * ║ behavior types, handles time-based spawning with accumulator, and clamps
 * ║ positions to canvas boundaries.
 * ║
 * ║ Extracted from ParticleSystem to follow Single Responsibility Principle.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 SPAWNING STRATEGY
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Behavior-based positioning (13 different behaviors)
 * │ • Time-based accumulator for smooth spawning
 * │ • Canvas boundary clamping with configurable margin
 * │ • Emotion-aware spawning (e.g., suspicion, surprise)
 * │ • Delta time capping to prevent spawn spikes
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class ParticleSpawner {
    constructor() {
        // TIME-BASED spawning using accumulation for smooth, consistent particle creation
        this.spawnAccumulator = 0; // Accumulates time to spawn particles
    }

    /**
     * Calculates spawn position based on behavior type
     * @param {string} behavior - Particle behavior type
     * @param {number} centerX - Center X coordinate (mascot position, may be offset)
     * @param {number} centerY - Center Y coordinate (mascot position, may be offset)
     * @param {number} canvasWidth - Actual canvas width
     * @param {number} canvasHeight - Actual canvas height
     * @param {string} emotion - Current emotion (affects some behaviors)
     * @returns {Object} Spawn position {x, y} and optional properties
     */
    getSpawnPosition(behavior, centerX, centerY, canvasWidth, canvasHeight, emotion = null) {
        // Calculate orb radius based on canvas size (matching EmotiveRenderer)
        const canvasSize = Math.min(canvasWidth, canvasHeight);
        const orbRadius = canvasSize / 12;  // Core radius
        const glowRadius = orbRadius * 2.5; // Glow extends this far

        // CONSTRAIN spawn positions to stay within canvas boundaries
        const margin = 30; // Keep spawns away from edges

        // Spawn particles outside the glow radius so they're visible
        const minSpawnRadius = glowRadius * 1.1; // 10% beyond glow edge
        // Constrain to distance from mascot to canvas edge
        const maxDistX = Math.min(centerX - margin, canvasWidth - centerX - margin);
        const maxDistY = Math.min(centerY - margin, canvasHeight - centerY - margin);
        const maxSpawnRadius = Math.min(glowRadius * 1.5, maxDistX, maxDistY);

        switch (behavior) {
        case 'ambient':
        case 'resting': {
            // Spawn at edge of glow where particles become visible
            // They'll move outward to create "emanating from center" effect
            const ambientAngle = Math.random() * Math.PI * 2;
            const ambientRadius = glowRadius * 0.9; // Just at glow edge
            return {
                x: centerX + Math.cos(ambientAngle) * ambientRadius,
                y: centerY + Math.sin(ambientAngle) * ambientRadius,
                angle: ambientAngle  // Pass angle for outward velocity
            };
        }

        case 'rising':
        case 'falling': {
            // These can spawn from outside for visibility
            const angle = Math.random() * Math.PI * 2;
            const radius = minSpawnRadius + Math.random() * (maxSpawnRadius - minSpawnRadius);
            return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        }

        case 'aggressive': {
            // Spawn just outside the glow for aggressive burst effect
            const aggressiveAngle = Math.random() * Math.PI * 2;
            const aggressiveRadius = glowRadius + Math.random() * orbRadius;
            return {
                x: centerX + Math.cos(aggressiveAngle) * aggressiveRadius,
                y: centerY + Math.sin(aggressiveAngle) * aggressiveRadius
            };
        }

        case 'scattering':
            // Spawn at center for outward movement (scattering needs this)
            return { x: centerX, y: centerY };

        case 'burst': {
            // Spawn at edge of orb so particles are visible
            const burstAngle = Math.random() * Math.PI * 2;
            if (emotion === 'suspicion') {
                const burstRadius = orbRadius * 1.5; // Further outside for suspicion
                return {
                    x: centerX + Math.cos(burstAngle) * burstRadius,
                    y: centerY + Math.sin(burstAngle) * burstRadius
                };
            } else if (emotion === 'surprise') {
                // Surprise spawns around the orb edge for visibility
                const burstRadius = orbRadius * 1.2; // Just outside the orb
                return {
                    x: centerX + Math.cos(burstAngle) * burstRadius,
                    y: centerY + Math.sin(burstAngle) * burstRadius
                };
            } else {
                // Other emotions spawn at center
                return { x: centerX, y: centerY };
            }
        }

        case 'repelling': {
            // Spawn at edge of glow so particles are visible
            const repelAngle = Math.random() * Math.PI * 2;
            const repelRadius = glowRadius * 0.9; // Just at glow edge
            return {
                x: centerX + Math.cos(repelAngle) * repelRadius,
                y: centerY + Math.sin(repelAngle) * repelRadius
            };
        }

        case 'orbiting': {
            // Spawn at orbital distance outside the glow
            const orbitAngle = Math.random() * Math.PI * 2;
            const orbitRadius = glowRadius * 1.2 + Math.random() * glowRadius * 0.5;
            return {
                x: centerX + Math.cos(orbitAngle) * orbitRadius,
                y: centerY + Math.sin(orbitAngle) * orbitRadius
            };
        }

        case 'glitchy': {
            // Spawn glitch particles at various distances from center for wide spread
            const glitchAngle = Math.random() * Math.PI * 2;
            const glitchRadius = glowRadius * 3 + Math.random() * glowRadius * 4; // Much wider spread (3-7x glow radius)
            return {
                x: centerX + Math.cos(glitchAngle) * glitchRadius,
                y: centerY + Math.sin(glitchAngle) * glitchRadius
            };
        }

        case 'spaz': {
            // Spawn spaz particles in a wide ring around the center for explosive effect
            const spazAngle = Math.random() * Math.PI * 2;
            const spazRadius = glowRadius * 2 + Math.random() * glowRadius * 3; // Very wide spread (2-5x glow radius)
            return {
                x: centerX + Math.cos(spazAngle) * spazRadius,
                y: centerY + Math.sin(spazAngle) * spazRadius
            };
        }

        default:
            return { x: centerX, y: centerY };
        }
    }

    /**
     * Clamps a position to stay within canvas boundaries
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {number} margin - Distance from edges (default: 30)
     * @returns {Object} Clamped position {x, y}
     */
    clampToCanvas(x, y, canvasWidth, canvasHeight, margin = 30) {
        return {
            x: Math.max(margin, Math.min(canvasWidth - margin, x)),
            y: Math.max(margin, Math.min(canvasHeight - margin, y))
        };
    }

    /**
     * Calculates how many particles to spawn based on rate and delta time
     * Uses time-based accumulation for smooth spawning
     *
     * @param {number} particleRate - Desired particles per second
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @returns {number} Number of particles to spawn this frame
     */
    calculateSpawnRate(particleRate, deltaTime) {
        // Don't spawn if rate is 0
        if (particleRate <= 0) return 0;

        // TIME-BASED SPAWNING using accumulation
        // particleRate represents desired particles per second
        // deltaTime is in milliseconds
        // Cap deltaTime to prevent huge accumulation spikes
        const cappedDeltaTime = Math.min(deltaTime, 50);
        const particlesPerSecond = particleRate;
        const particlesPerMs = particlesPerSecond / 1000;

        // Accumulate spawn time with capped delta
        this.spawnAccumulator += particlesPerMs * cappedDeltaTime;

        // Cap accumulator to prevent excessive spawning after long pauses
        this.spawnAccumulator = Math.min(this.spawnAccumulator, 3.0);

        // Calculate how many particles to spawn
        let particlesToSpawn = 0;
        while (this.spawnAccumulator >= 1.0) {
            particlesToSpawn++;
            this.spawnAccumulator -= 1.0;
        }

        return particlesToSpawn;
    }

    /**
     * Resets the spawn accumulator (for tab switches)
     */
    resetAccumulator() {
        this.spawnAccumulator = 0;
    }
}

export default ParticleSpawner;
