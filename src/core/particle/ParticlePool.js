/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Pool
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particle Pool - Object pooling for particle performance
 * @author Emotive Engine Team
 * @module core/particle/ParticlePool
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages the OBJECT POOL for particles. Reuses dead particles instead of
 * ║ creating new ones to prevent memory leaks and reduce GC pressure.
 * ║
 * ║ Extracted from ParticleSystem to follow Single Responsibility Principle.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 POOLING STRATEGY
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Lazy initialization (create particles as needed)
 * │ • Max pool size: Min(maxParticles, 50)
 * │ • Reuse dead particles before creating new
 * │ • Track pool hits/misses for optimization
 * │ • Clear references when pooling to prevent memory leaks
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import Particle from '../Particle.js';

class ParticlePool {
    constructor(maxParticles = 50) {
        this.poolSize = Math.min(maxParticles, 50); // Limit pool to max 50 particles
        this.pool = [];

        // Memory leak detection
        this.totalParticlesCreated = 0;
        this.totalParticlesDestroyed = 0;

        // Performance tracking
        this.poolHits = 0;
        this.poolMisses = 0;
    }

    /**
     * Gets a particle from the pool or creates a new one
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} behavior - Particle behavior type
     * @param {number} scaleFactor - Scale multiplier for particle sizes
     * @param {number} particleSizeMultiplier - Additional size multiplier
     * @param {Array|null} emotionColors - Array of color strings or weighted color objects
     * @param {string} emotion - Current emotion
     * @param {string|null} gestureBehavior - Gesture behavior to apply
     * @returns {Particle} Particle instance
     */
    getParticle(x, y, behavior, scaleFactor, particleSizeMultiplier, emotionColors, emotion, gestureBehavior = null) {
        let particle;

        if (this.pool.length > 0) {
            // Reuse from pool
            particle = this.pool.pop();
            particle.reset(x, y, behavior, scaleFactor, particleSizeMultiplier, emotionColors);
            this.poolHits++;
        } else {
            // Create new particle
            particle = new Particle(x, y, behavior, scaleFactor, particleSizeMultiplier, emotionColors);
            this.poolMisses++;
            this.totalParticlesCreated++;
        }

        // Set the emotion for behavior customization
        particle.emotion = emotion;

        // Apply gesture behavior if active (e.g., doppler for rain)
        if (gestureBehavior) {
            particle.gestureBehavior = gestureBehavior;
        }

        return particle;
    }

    /**
     * Returns a particle to the pool for reuse
     * @param {Particle} particle - Particle to return to pool
     */
    returnParticle(particle) {
        if (this.pool.length < this.poolSize) {
            // Clear references before pooling to prevent memory leaks
            particle.cachedGradient = null;
            particle.cachedGradientKey = null;

            // Clear behaviorData properties but keep the object
            if (particle.behaviorData) {
                for (const key in particle.behaviorData) {
                    delete particle.behaviorData[key];
                }
            }

            this.pool.push(particle);
        } else {
            // If pool is full, count as destroyed since it will be GC'd
            this.totalParticlesDestroyed++;
        }
    }

    /**
     * Refreshes the pool by removing excess particles
     */
    refreshPool() {
        const excessParticles = this.pool.length - this.poolSize;
        if (excessParticles > 0) {
            // Remove excess particles from pool
            this.pool.splice(this.poolSize);
            this.totalParticlesDestroyed += excessParticles;
        }
    }

    /**
     * Gets pool statistics for monitoring
     * @returns {object} Pool statistics
     */
    getStats() {
        return {
            poolSize: this.pool.length,
            poolHits: this.poolHits,
            poolMisses: this.poolMisses,
            totalCreated: this.totalParticlesCreated,
            totalDestroyed: this.totalParticlesDestroyed
        };
    }

    /**
     * Clears the pool and resets statistics
     */
    clear() {
        this.pool = [];
        this.poolHits = 0;
        this.poolMisses = 0;
        this.totalParticlesCreated = 0;
        this.totalParticlesDestroyed = 0;
    }
}

export default ParticlePool;
