/**
 * ParticleSystem - Manages particle lifecycle and behavior based on emotional context
 * Implements object pooling for performance and enforces particle limits
 */

import Particle from './Particle.js';

class ParticleSystem {
    constructor(maxParticles = 50, errorBoundary = null) {
        this.errorBoundary = errorBoundary;
        this.maxParticles = maxParticles;
        
        // Active particles
        this.particles = [];
        
        // Object pool for performance
        this.pool = [];
        this.poolSize = Math.min(maxParticles * 2, 100);
        
        // TIME-BASED spawning using accumulation for smooth, consistent particle creation
        this.spawnAccumulator = 0; // Accumulates time to spawn particles
        
        // Performance tracking
        this.particleCount = 0;
        this.poolHits = 0;
        this.poolMisses = 0;
        
        // Initialize object pool
        this.initializePool();
        
        // ParticleSystem initialized
    }

    /**
     * Initialize the object pool with pre-created particles
     */
    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Particle(0, 0, 'ambient'));
        }
    }

    /**
     * Gets a particle from the pool or creates a new one
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} behavior - Particle behavior type
     * @returns {Particle} Particle instance
     */
    getParticleFromPool(x, y, behavior) {
        let particle;
        
        if (this.pool.length > 0) {
            // Reuse from pool
            particle = this.pool.pop();
            particle.reset(x, y, behavior, this.scaleFactor || 1, this.particleSizeMultiplier || 1);
            this.poolHits++;
        } else {
            // Create new particle
            particle = new Particle(x, y, behavior, this.scaleFactor || 1, this.particleSizeMultiplier || 1);
            this.poolMisses++;
        }
        
        return particle;
    }

    /**
     * Returns a particle to the pool for reuse
     * @param {Particle} particle - Particle to return to pool
     */
    returnParticleToPool(particle) {
        if (this.pool.length < this.poolSize) {
            this.pool.push(particle);
        }
        // If pool is full, let the particle be garbage collected
    }

    /**
     * Spawns particles based on emotional state and particle rate
     * NEW APPROACH: Fixed timestep - only spawn at specific intervals
     */
    spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count = null, minParticles = 0, maxParticles = 10, scaleFactor = 1, particleSizeMultiplier = 1) {
        this.scaleFactor = scaleFactor; // Store for particle creation
        this.particleSizeMultiplier = particleSizeMultiplier; // Store for particle sizing
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles, maxParticles);
            }, 'particle-spawn')();
        } else {
            this._spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles, maxParticles);
        }
    }
    
    /**
     * Resets the spawn accumulator (for tab switches)
     */
    resetAccumulator() {
        this.spawnAccumulator = 0;
    }

    /**
     * Internal spawn implementation - TIME-BASED accumulation for smooth spawning
     */
    _spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles = 0, maxParticles = 10) {
        // If specific count is provided, spawn that many
        if (count !== null) {
            for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
                this.spawnSingleParticle(behavior, centerX, centerY);
            }
            return;
        }
        
        // Always maintain minimum particles
        while (this.particles.length < minParticles && this.particles.length < this.maxParticles) {
            this.spawnSingleParticle(behavior, centerX, centerY);
        }
        
        // If we're at or above max for this emotion, don't spawn more
        if (this.particles.length >= maxParticles) return;
        
        // Don't spawn if rate is 0
        if (particleRate <= 0) return;
        
        // TIME-BASED SPAWNING using accumulation
        // particleRate represents desired particles at 60 FPS
        // So rate of 1 = 1 particle per 60 frames = 1 particle per second at 60fps
        // Cap deltaTime to prevent huge accumulation spikes
        const cappedDeltaTime = Math.min(deltaTime, 50);
        const particlesPerSecond = particleRate; // Direct mapping: rate = particles/second
        const particlesPerMs = particlesPerSecond / 1000;
        
        // Accumulate spawn time with capped delta
        this.spawnAccumulator += particlesPerMs * cappedDeltaTime;
        
        // Cap accumulator to prevent excessive spawning after long pauses
        this.spawnAccumulator = Math.min(this.spawnAccumulator, 3.0);
        
        // Spawn accumulated particles smoothly
        while (this.spawnAccumulator >= 1.0 && this.particles.length < maxParticles) {
            this.spawnSingleParticle(behavior, centerX, centerY);
            this.spawnAccumulator -= 1.0;
        }
    }

    /**
     * Spawns a single particle with the specified behavior
     * @param {string} behavior - Particle behavior type
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    spawnSingleParticle(behavior, centerX, centerY) {
        // Calculate spawn position based on behavior
        let spawnPos = this.getSpawnPosition(behavior, centerX, centerY);
        
        // CLAMP spawn position to canvas boundaries
        const clampedPos = this.clampToCanvas(spawnPos.x, spawnPos.y, centerX, centerY);
        spawnPos.x = clampedPos.x;
        spawnPos.y = clampedPos.y;
        
        // Get particle from pool
        const particle = this.getParticleFromPool(spawnPos.x, spawnPos.y, behavior);
        
        // Pass additional data for meditation_swirl
        if (behavior === 'meditation_swirl' && spawnPos.palmCenter) {
            particle.palmCenter = spawnPos.palmCenter;
            particle.swirlAngle = spawnPos.swirlAngle;
        }
        
        // Add to active particles
        this.particles.push(particle);
        this.particleCount++;
        
        // Debug logging disabled to prevent console spam
        // Only uncomment for debugging particle spawning issues
        // if (this.particleCount <= 3) {
        //     console.log(`Spawned particle #${this.particleCount} at (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)}) with behavior: ${behavior}`);
        // }
    }

    /**
     * Calculates spawn position based on behavior type
     * @param {string} behavior - Particle behavior type
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @returns {Object} Spawn position {x, y}
     */
    getSpawnPosition(behavior, centerX, centerY) {
        // Calculate orb radius based on canvas size (matching EmotiveRenderer)
        const canvasSize = Math.min(centerX * 2, centerY * 2);
        const orbRadius = canvasSize / 12;  // Core radius
        const glowRadius = orbRadius * 2.5; // Glow extends this far
        
        // CONSTRAIN spawn positions to stay within canvas boundaries
        const canvasWidth = centerX * 2;
        const canvasHeight = centerY * 2;
        const margin = 30; // Keep spawns away from edges
        
        // Spawn particles outside the glow radius so they're visible
        const minSpawnRadius = glowRadius * 1.1; // 10% beyond glow edge
        const maxSpawnRadius = Math.min(glowRadius * 1.5, 
            centerX - margin, centerY - margin); // Constrain to canvas
        
        switch (behavior) {
            case 'ambient':
            case 'resting':
                // Spawn at edge of glow where particles become visible
                // They'll move outward to create "emanating from center" effect
                const ambientAngle = Math.random() * Math.PI * 2;
                const ambientRadius = glowRadius * 0.9; // Just at glow edge
                return {
                    x: centerX + Math.cos(ambientAngle) * ambientRadius,
                    y: centerY + Math.sin(ambientAngle) * ambientRadius,
                    angle: ambientAngle  // Pass angle for outward velocity
                };
                
            case 'rising':
            case 'falling':
                // These can spawn from outside for visibility
                const angle = Math.random() * Math.PI * 2;
                const radius = minSpawnRadius + Math.random() * (maxSpawnRadius - minSpawnRadius);
                return {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                };
                
            case 'aggressive':
                // Spawn just outside the glow for aggressive burst effect
                const aggressiveAngle = Math.random() * Math.PI * 2;
                const aggressiveRadius = glowRadius + Math.random() * orbRadius;
                return {
                    x: centerX + Math.cos(aggressiveAngle) * aggressiveRadius,
                    y: centerY + Math.sin(aggressiveAngle) * aggressiveRadius
                };
                
            case 'scattering':
            case 'burst':
                // Spawn at center for outward movement
                return { x: centerX, y: centerY };
                
            case 'repelling':
                // Spawn at edge of glow so particles are visible
                const repelAngle = Math.random() * Math.PI * 2;
                const repelRadius = glowRadius * 0.9; // Just at glow edge
                return {
                    x: centerX + Math.cos(repelAngle) * repelRadius,
                    y: centerY + Math.sin(repelAngle) * repelRadius
                };
                
            case 'orbiting':
                // Spawn at orbital distance outside the glow
                const orbitAngle = Math.random() * Math.PI * 2;
                const orbitRadius = glowRadius * 1.2 + Math.random() * glowRadius * 0.5;
                return {
                    x: centerX + Math.cos(orbitAngle) * orbitRadius,
                    y: centerY + Math.sin(orbitAngle) * orbitRadius
                };
                
                
            default:
                return { x: centerX, y: centerY };
        }
    }
    
    /**
     * Clamps a position to stay within canvas boundaries
     */
    clampToCanvas(x, y, centerX, centerY, margin = 30) {
        const canvasWidth = centerX * 2;
        const canvasHeight = centerY * 2;
        return {
            x: Math.max(margin, Math.min(canvasWidth - margin, x)),
            y: Math.max(margin, Math.min(canvasHeight - margin, y))
        };
    }

    /**
     * Updates all particles and manages lifecycle
     * @param {number} deltaTime - Time since last update in milliseconds
     * @param {number} centerX - Center X coordinate for behavior calculations
     * @param {number} centerY - Center Y coordinate for behavior calculations
     * @param {Object} gestureMotion - Optional gesture motion to apply
     * @param {number} gestureProgress - Progress of gesture (0-1)
     * @param {Object} undertoneModifier - Optional undertone modifications
     */
    update(deltaTime, centerX, centerY, gestureMotion = null, gestureProgress = 0, undertoneModifier = null) {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, undertoneModifier);
            }, 'particle-update')();
        } else {
            this._update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, undertoneModifier);
        }
    }

    /**
     * Internal update implementation
     */
    _update(deltaTime, centerX, centerY, gestureMotion = null, gestureProgress = 0, undertoneModifier = null) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update particle with gesture motion and undertone modifier
            particle.update(deltaTime, centerX, centerY, undertoneModifier, gestureMotion, gestureProgress);
            
            // Remove dead particles
            if (!particle.isAlive()) {
                this.removeParticle(i);
            }
        }
        
        // Enforce particle limit by removing oldest if necessary
        while (this.particles.length > this.maxParticles) {
            this.removeParticle(0); // Remove oldest (first in array)
        }
    }

    /**
     * Removes a particle at the specified index
     * @param {number} index - Index of particle to remove
     */
    removeParticle(index) {
        if (index >= 0 && index < this.particles.length) {
            const particle = this.particles.splice(index, 1)[0];
            this.returnParticleToPool(particle);
            this.particleCount = Math.max(0, this.particleCount - 1);
        }
    }

    /**
     * Renders all particles to the canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} emotionColor - Color to use for particle rendering
     */
    render(ctx, emotionColor = '#ffffff') {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._render(ctx, emotionColor);
            }, 'particle-render')();
        } else {
            this._render(ctx, emotionColor);
        }
    }

    /**
     * Internal render implementation - simple and direct
     */
    _render(ctx, emotionColor) {
        // Simple direct rendering without batching to avoid artifacts
        for (const particle of this.particles) {
            particle.render(ctx, emotionColor);
        }
    }

    /**
     * Clears all particles and returns them to the pool
     */
    clear() {
        // Return all particles to pool
        for (const particle of this.particles) {
            this.returnParticleToPool(particle);
        }
        
        this.particles.length = 0;
        this.particleCount = 0;
        this.spawnAccumulator = 0; // Reset accumulator when clearing
    }

    /**
     * Triggers a burst of particles for gesture effects
     * @param {number} count - Number of particles to burst
     * @param {string} behavior - Behavior type for burst particles
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    burst(count, behavior, centerX, centerY) {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._burst(count, behavior, centerX, centerY);
            }, 'particle-burst')();
        } else {
            this._burst(count, behavior, centerX, centerY);
        }
    }

    /**
     * Internal burst implementation
     */
    _burst(count, behavior, centerX, centerY) {
        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < actualCount; i++) {
            this.spawnSingleParticle(behavior, centerX, centerY);
        }
    }

    /**
     * Gets current particle system statistics
     * @returns {Object} Performance and state information
     */
    getStats() {
        return {
            activeParticles: this.particles.length,
            maxParticles: this.maxParticles,
            poolSize: this.pool.length,
            poolHits: this.poolHits,
            poolMisses: this.poolMisses,
            poolEfficiency: this.poolHits / Math.max(1, this.poolHits + this.poolMisses),
            spawnAccumulator: this.spawnAccumulator
        };
    }

    /**
     * Sets the maximum number of particles
     * @param {number} maxParticles - New maximum particle count
     */
    setMaxParticles(maxParticles) {
        this.maxParticles = Math.max(1, maxParticles);
        
        // Remove excess particles if new limit is lower
        while (this.particles.length > this.maxParticles) {
            this.removeParticle(0);
        }
    }

    /**
     * Gets particles by behavior type for debugging
     * @param {string} behavior - Behavior type to filter by
     * @returns {Array} Particles with matching behavior
     */
    getParticlesByBehavior(behavior) {
        return this.particles.filter(particle => particle.behavior === behavior);
    }

    /**
     * Validates that all particles are in valid state
     * @returns {boolean} True if all particles are valid
     */
    validateParticles() {
        for (const particle of this.particles) {
            if (!particle.isAlive() || particle.life < 0 || particle.life > 1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Forces cleanup of dead particles (for testing)
     */
    cleanup() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].isAlive()) {
                this.removeParticle(i);
            }
        }
    }

    /**
     * Destroys the particle system and cleans up resources
     */
    destroy() {
        this.clear();
        this.pool.length = 0;
        this.poolHits = 0;
        this.poolMisses = 0;
        // ParticleSystem destroyed
    }
}

export default ParticleSystem;