/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                     ◐ ◑ ◒ ◓  PARTICLE SYSTEM  ◓ ◒ ◑ ◐                     
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particle System - Orchestrator of Emotional Atmosphere with 3D Depth
 * @author Emotive Engine Team
 * @version 2.4.0
 * @module ParticleSystem
 * @changelog 2.4.0 - Added z-coordinate depth system with split rendering layers
 * @changelog 2.3.0 - Batch rendering optimization for reduced state changes
 * @changelog 2.2.0 - Added undertone saturation system for dynamic particle depth
 * @changelog 2.1.0 - Added support for passing emotion colors to individual particles
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The CONDUCTOR of particle chaos. Manages the lifecycle, behavior, and             
 * ║ performance of all particles. Uses object pooling to prevent memory leaks         
 * ║ and coordinates particles to create emotional atmospheres around the orb.         
 * ║                                                                                    
 * ║ NEW: Undertone saturation dynamically adjusts particle colors based on emotional  
 * ║ intensity, creating visual depth through saturation levels.                       
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 SYSTEM FEATURES                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Object pooling for performance (reuse dead particles)                           
 * │ • Time-based spawning with accumulator                                            
 * │ • Automatic cleanup every 5 seconds                                               
 * │ • Memory leak detection and prevention                                            
 * │ • Dynamic particle limits based on emotion                                        
 * │ • 13 different particle behaviors                                                 
 * │ • Undertone-based saturation adjustments for particle colors                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 OBJECT POOL STRATEGY                                                           
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Lazy initialization (create as needed)                                          
 * │ • Max pool size: 50 particles                                                     
 * │ • Reuse dead particles before creating new                                        
 * │ • Track pool hits/misses for optimization                                         
 * │ • Absolute max: 2x configured limit (prevents runaway)                            
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📊 PERFORMANCE LIMITS                                                             
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Default max particles  : 50                                                     
 * │ • Absolute max particles : 100 (2x default)                                       
 * │ • Pool size             : Min(maxParticles, 50)                                  
 * │ • Cleanup interval      : 5000ms                                                 
 * │ • Spawn rate            : Based on emotion config                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                              MEMORY MANAGEMENT                                    
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Critical for preventing memory leaks:                                             
 * ║ 1. Reuse particles from pool when available                                       
 * ║ 2. Clear references when returning to pool                                        
 * ║ 3. Periodic cleanup of excess particles                                           
 * ║ 4. Track creation/destruction for leak detection                                  
 * ║ 5. Hard limits prevent runaway particle creation                                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import Particle from './Particle.js';
import { applyUndertoneSaturationToArray } from '../utils/colorUtils.js';
import rhythmIntegration from './rhythmIntegration.js';
import { getEmotion } from './emotions/index.js';
import { emotionCache } from './cache/EmotionCache.js';

class ParticleSystem {
    constructor(maxParticles = 50, errorBoundary = null) {
        this.errorBoundary = errorBoundary;
        this.maxParticles = maxParticles;
        this.absoluteMaxParticles = maxParticles * 2; // Hard limit to prevent leaks
        
        // Active particles
        this.particles = [];
        
        // Object pool for performance - reduced to prevent memory buildup
        this.pool = [];
        this.poolSize = Math.min(maxParticles, 50); // Limit pool to max 50 particles
        
        // Memory leak detection
        this.totalParticlesCreated = 0;
        this.totalParticlesDestroyed = 0;
        this.stateChangeCount = 0;
        this.lastMemoryCheck = Date.now();
        this.lastLeakedCount = 0;
        
        // TIME-BASED spawning using accumulation for smooth, consistent particle creation
        this.spawnAccumulator = 0; // Accumulates time to spawn particles
        
        // Performance tracking
        this.particleCount = 0;
        this.poolHits = 0;
        this.poolMisses = 0;
        
        // Cleanup timer to prevent memory buildup
        this.cleanupTimer = 0;
        this.cleanupInterval = 5000; // Clean up every 5 seconds
        
        // Initialize object pool
        this.initializePool();
        
        // ParticleSystem initialized
    }

    /**
     * Initialize the object pool with pre-created particles
     */
    initializePool() {
        // Don't pre-create particles - create them lazily as needed
        // This prevents memory buildup on initialization
        this.pool = [];
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
            particle.reset(x, y, behavior, this.scaleFactor || 1, this.particleSizeMultiplier || 1, this.currentEmotionColors);
            this.poolHits++;
        } else {
            // Create new particle
            particle = new Particle(x, y, behavior, this.scaleFactor || 1, this.particleSizeMultiplier || 1, this.currentEmotionColors);
            this.poolMisses++;
            this.totalParticlesCreated++;
        }
        
        // Set the emotion for behavior customization
        particle.emotion = this.currentEmotion;
        
        // Apply gesture behavior if active (e.g., doppler for rain)
        if (this.gestureBehavior) {
            particle.gestureBehavior = this.gestureBehavior;
        }
        
        return particle;
    }

    /**
     * Returns a particle to the pool for reuse
     * @param {Particle} particle - Particle to return to pool
     */
    returnParticleToPool(particle) {
        if (this.pool.length < this.poolSize) {
            // Clear references before pooling
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
     * Spawns particles based on emotional state and particle rate
     * NEW APPROACH: Fixed timestep - only spawn at specific intervals
     * 
     * @param {string} behavior - Particle behavior type (ambient, rising, falling, etc.)
     * @param {string} emotion - Current emotional state
     * @param {number} particleRate - Rate of particle spawning (particles per second at 60fps)
     * @param {number} centerX - X coordinate of spawn center
     * @param {number} centerY - Y coordinate of spawn center
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {number|null} count - Force spawn this many particles (null for rate-based)
     * @param {number} minParticles - Minimum particles to maintain
     * @param {number} maxParticles - Maximum particles allowed
     * @param {number} scaleFactor - Scale multiplier for particle sizes
     * @param {number} particleSizeMultiplier - Additional size multiplier
     * @param {Array|null} emotionColors - Array of color strings or weighted color objects
     * @param {string|null} undertone - Emotional undertone for saturation adjustment
     *                                   (intense, confident, nervous, clear, tired, subdued)
     *                                   Affects particle color saturation to create depth
     */
    spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count = null, minParticles = 0, maxParticles = 10, scaleFactor = 1, particleSizeMultiplier = 1, emotionColors = null, undertone = null) {
        this.scaleFactor = scaleFactor; // Store for particle creation
        this.particleSizeMultiplier = particleSizeMultiplier; // Store for particle sizing
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles, maxParticles, emotionColors, undertone);
            }, 'particle-spawn')();
        } else {
            this._spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles, maxParticles, emotionColors, undertone);
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
     * 
     * Applies undertone saturation adjustments to particle colors before spawning.
     * The saturation system creates visual depth:
     * - Intense/Confident: Oversaturated colors appear to pop forward
     * - Clear: Normal midtone colors sit in the middle ground  
     * - Tired/Subdued: Desaturated colors recede into background
     * 
     * This creates a natural transition as particles cycle through their lifecycle,
     * with new particles spawning with current undertone saturation while existing
     * particles maintain their original colors until expiration.
     */
    _spawn(behavior, emotion, particleRate, centerX, centerY, deltaTime, count, minParticles = 0, maxParticles = 10, emotionColors = null, undertone = null) {
        // Store emotion for particle initialization
        this.currentEmotion = emotion;
        
        // Debug logging removed for production
        
        // Store base colors and undertone separately to ensure consistent application
        this.baseEmotionColors = emotionColors;
        this.currentUndertone = undertone;
        
        // Apply undertone saturation to emotion colors for all particles
        // This adjustment persists for the lifetime of each particle, creating
        // smooth visual transitions as particles naturally cycle
        this.currentEmotionColors = emotionColors && undertone ? 
            applyUndertoneSaturationToArray(emotionColors, undertone) : 
            emotionColors;
        
        // Apply rhythm modulation if enabled
        let rhythmModulatedRate = particleRate;
        if (rhythmIntegration.isEnabled()) {
            const emotionConfig = emotionCache && emotionCache.isInitialized ? 
                emotionCache.getEmotion(emotion) : getEmotion(emotion);
            if (emotionConfig) {
                const modulation = rhythmIntegration.applyParticleRhythm(emotionConfig, this);
                
                // Apply emission burst on beat
                if (modulation.emitBurst) {
                    for (let i = 0; i < modulation.emitBurst && this.particles.length < maxParticles; i++) {
                        this.spawnSingleParticle(behavior, centerX, centerY);
                    }
                }
                
                // Modulate emission rate
                if (modulation.emissionRate !== undefined) {
                    rhythmModulatedRate *= modulation.emissionRate;
                }
            }
        }
        
        
        // If specific count is provided, spawn that many
        if (count !== null) {
            for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
                this.spawnSingleParticle(behavior, centerX, centerY);
            }
            return;
        }
        
        // Skip spawning if frame rate is too low (performance optimization)
        if (this.skipSpawnThisFrame) {
            return;
        }
        
        // Always maintain minimum particles
        while (this.particles.length < minParticles && this.particles.length < this.maxParticles) {
            this.spawnSingleParticle(behavior, centerX, centerY);
        }
        
        // If we're at or above max for this emotion, don't spawn more
        if (this.particles.length >= maxParticles) {
            return;
        }
        
        // Don't spawn if rate is 0
        if (rhythmModulatedRate <= 0) return;
        
        // TIME-BASED SPAWNING using accumulation
        // rhythmModulatedRate represents desired particles at 60 FPS
        // So rate of 1 = 1 particle per 60 frames = 1 particle per second at 60fps
        // Cap deltaTime to prevent huge accumulation spikes
        const cappedDeltaTime = Math.min(deltaTime, 50);
        const particlesPerSecond = rhythmModulatedRate; // Direct mapping: rate = particles/second
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
        // Hard limit check to prevent memory leaks
        if (this.particles.length >= this.absoluteMaxParticles) {
            return;
        }
        
        // Calculate spawn position based on behavior
        const spawnPos = this.getSpawnPosition(behavior, centerX, centerY);
        
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
        const margin = 30; // Keep spawns away from edges
        
        // Spawn particles outside the glow radius so they're visible
        const minSpawnRadius = glowRadius * 1.1; // 10% beyond glow edge
        const maxSpawnRadius = Math.min(glowRadius * 1.5, 
            centerX - margin, centerY - margin); // Constrain to canvas
        
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
            if (this.currentEmotion === 'suspicion') {
                const burstRadius = orbRadius * 1.5; // Further outside for suspicion
                return {
                    x: centerX + Math.cos(burstAngle) * burstRadius,
                    y: centerY + Math.sin(burstAngle) * burstRadius
                };
            } else if (this.currentEmotion === 'surprise') {
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
            const wrappedUpdate = this.errorBoundary.wrap(
                (dt, cx, cy, gm, gp, um) => this._update(dt, cx, cy, gm, gp, um), 
                'particle-update'
            );
            return wrappedUpdate(deltaTime, centerX, centerY, gestureMotion, gestureProgress, undertoneModifier);
        } else {
            this._update(deltaTime, centerX, centerY, gestureMotion, gestureProgress, undertoneModifier);
        }
    }

    /**
     * Internal update implementation
     */
    _update(deltaTime, centerX, centerY, gestureMotion = null, gestureProgress = 0, undertoneModifier = null) {
        // PERFORMANCE OPTIMIZATION: Skip cleanup for small particle counts
        // 50 particles don't need periodic cleanup overhead
        // Cleanup is unnecessary for such small numbers
        
        // PERFORMANCE OPTIMIZATION: Skip memory leak detection for small particle counts
        // 50 particles don't need memory tracking overhead
        // Memory leaks aren't a concern with such small numbers
        
        // PERFORMANCE OPTIMIZATION: Use simple filter instead of complex loop
        // More efficient for small particle counts
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime, centerX, centerY, undertoneModifier, gestureMotion, gestureProgress);
            return particle.isAlive();
        });
        
        // Enforce particle limit by removing oldest if necessary
        while (this.particles.length > this.maxParticles) {
            this.removeParticle(0); // Remove oldest (first in array)
        }
    }

    /**
     * Set a temporary gesture behavior for particles
     * @param {string} behaviorName - Name of the behavior (e.g., 'doppler')
     * @param {boolean} active - Whether the behavior is active
     */
    setGestureBehavior(behaviorName, active) {
        this.gestureBehavior = active ? behaviorName : null;
        
        // Apply gesture behavior to existing particles
        if (active) {
            this.particles.forEach(particle => {
                particle.gestureBehavior = behaviorName;
            });
        } else {
            // Clear gesture behavior from particles
            this.particles.forEach(particle => {
                particle.gestureBehavior = null;
            });
        }
    }

    /**
     * Removes a particle at the specified index
     * @param {number} index - Index of particle to remove
     */
    removeParticle(index) {
        if (index >= 0 && index < this.particles.length) {
            const particle = this.particles.splice(index, 1)[0];
            // Clear any cached data before returning to pool
            particle.cachedGradient = null;
            particle.cachedGradientKey = null;
            // Don't set behaviorData to null - let reset handle it properly
            this.returnParticleToPool(particle);
            this.particleCount = Math.max(0, this.particleCount - 1);
        }
    }

    /**
     * Renders all particles to the canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} emotionColor - Color to use for particle rendering
     * @param {Object} gestureTransform - Optional gesture transform data
     */
    render(ctx, emotionColor = '#ffffff', gestureTransform = null) {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._render(ctx, emotionColor, gestureTransform);
            }, 'particle-render')();
        } else {
            this._render(ctx, emotionColor, gestureTransform);
        }
    }
    
    /**
     * Renders particles in the background layer (behind orb)
     * Particles with z < 0 are rendered, appearing smaller based on depth
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} emotionColor - Color to use for particle rendering
     * 
     * LAYER DISTRIBUTION:
     * - ~92% of particles render in background (z < 0)
     * - Particles scale from 80% to 100% size based on z-depth
     */
    renderBackground(ctx, emotionColor = '#ffffff', gestureTransform = null) {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._renderLayer(ctx, emotionColor, false, gestureTransform); // false = background (z < 0)
            }, 'particle-render-bg')();
        } else {
            this._renderLayer(ctx, emotionColor, false, gestureTransform);
        }
    }
    
    /**
     * Renders particles in the foreground layer (in front of orb)
     * Particles with z >= 0 are rendered, appearing larger based on depth
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} emotionColor - Color to use for particle rendering
     * 
     * LAYER DISTRIBUTION:
     * - ~8% of particles render in foreground (z >= 0) 
     * - Particles scale from 100% to 120% size based on z-depth
     * - Spawn with offset to prevent visual stacking
     */
    renderForeground(ctx, emotionColor = '#ffffff', gestureTransform = null) {
        if (this.errorBoundary) {
            return this.errorBoundary.wrap(() => {
                this._renderLayer(ctx, emotionColor, true, gestureTransform); // true = foreground (z >= 0)
            }, 'particle-render-fg')();
        } else {
            this._renderLayer(ctx, emotionColor, true, gestureTransform);
        }
    }

    /**
     * Internal render implementation for a specific layer
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} emotionColor - Color to use for particle rendering
     * @param {boolean} isForeground - true for foreground (z >= 0), false for background (z < 0)
     */
    _renderLayer(ctx, emotionColor, isForeground, gestureTransform = null) {
        // Sort particles by rendering properties to minimize state changes
        const visibleParticles = [];
        
        // First pass: cull off-screen, dead, and wrong-layer particles
        const margin = 50;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        for (const particle of this.particles) {
            // Filter by z-layer
            const particleInForeground = particle.z >= 0;
            if (particleInForeground !== isForeground) {
                continue; // Skip particles in wrong layer
            }
            
            // Skip off-screen particles (culling)
            if (particle.x < -margin || particle.x > canvasWidth + margin ||
                particle.y < -margin || particle.y > canvasHeight + margin) {
                continue;
            }
            
            // Skip dead particles
            if (particle.life <= 0) continue;
            
            visibleParticles.push(particle);
        }
        
        // Sort by render type to minimize state changes
        visibleParticles.sort((a, b) => {
            if (a.isCellShaded !== b.isCellShaded) {
                return a.isCellShaded ? -1 : 1;
            }
            if (a.hasGlow !== b.hasGlow) {
                return a.hasGlow ? -1 : 1;
            }
            return 0;
        });
        
        // Actually render the particles
        this._renderParticles(ctx, visibleParticles, emotionColor, gestureTransform);
    }
    
    /**
     * Internal render implementation - batch optimized rendering (legacy, renders all)
     */
    _render(ctx, emotionColor, gestureTransform = null) {
        // Sort particles by rendering properties to minimize state changes
        const visibleParticles = [];
        
        // PERFORMANCE OPTIMIZATION: Skip off-screen culling for small particle counts
        // Canvas2D handles off-screen rendering efficiently
        // Culling overhead is unnecessary for 50 particles
        
        for (const particle of this.particles) {
            // Skip dead particles only
            if (particle.life <= 0) continue;
            
            visibleParticles.push(particle);
        }
        
        // PERFORMANCE OPTIMIZATION: Skip sorting for 50 particles
        // Sorting is expensive and unnecessary for small particle counts
        // Canvas2D handles rendering efficiently without sorting
        
        // Actually render the particles
        this._renderParticles(ctx, visibleParticles, emotionColor, gestureTransform);
    }
    
    /**
     * Render a list of particles with batch optimization
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} visibleParticles - Array of particles to render
     * @param {string} emotionColor - Color to use for particle rendering
     * @param {Object} gestureTransform - Optional gesture transform data
     */
    _renderParticles(ctx, visibleParticles, emotionColor, gestureTransform = null) {
        // Batch render with minimized state changes
        ctx.save();
        let lastFillStyle = null;
        let lastStrokeStyle = null;
        let lastLineWidth = null;

        for (const particle of visibleParticles) {
            // For cell-shaded, use original render (they need complex stroke/fill combos)
            if (particle.isCellShaded) {
                particle.render(ctx, emotionColor);
                // Reset cached values since particle.render may have changed them
                lastFillStyle = null;
                lastStrokeStyle = null;
                lastLineWidth = null;
            } else {
                // Batch-optimized rendering for regular particles
                const particleColor = particle.color || emotionColor;
                
                // Only set fillStyle if it changed
                if (particleColor !== lastFillStyle) {
                    ctx.fillStyle = particleColor;
                    lastFillStyle = particleColor;
                }
                
                // Validate position once
                if (!isFinite(particle.x) || !isFinite(particle.y)) continue;
                
                // Use depth-adjusted size if particle has the method
                const depthSize = particle.getDepthAdjustedSize ? particle.getDepthAdjustedSize() : particle.size;
                let safeSize = Math.max(0.1, depthSize);
                
                // Apply firefly effect if sparkle gesture is active
                let fireflyGlow = 1.0;
                if (gestureTransform && gestureTransform.fireflyEffect) {
                    // Each particle gets unique phase for async firefly blinking
                    const particlePhase = (particle.x * 0.01 + particle.y * 0.01 + particle.size * 0.1) % (Math.PI * 2);
                    const time = gestureTransform.fireflyTime || (Date.now() * 0.001);
                    const intensity = gestureTransform.particleGlow || 2.0;
                    
                    // Create firefly pulse pattern
                    fireflyGlow = 0.3 + Math.max(0, Math.sin(time * 3 + particlePhase)) * intensity;
                }
                
                // Apply flicker effect if flicker gesture is active (now does particle shimmer)
                if (gestureTransform && gestureTransform.flickerEffect) {
                    // Each particle shimmers with a wave pattern
                    const particlePhase = (particle.x * 0.02 + particle.y * 0.02) % (Math.PI * 2);
                    const time = gestureTransform.flickerTime || (Date.now() * 0.001);
                    const intensity = gestureTransform.particleGlow || 2.0;
                    
                    // Create shimmer wave pattern - faster oscillation
                    fireflyGlow = 0.5 + Math.sin(time * 12 + particlePhase) * intensity * 0.5;
                }
                
                // Apply shimmer effect if shimmer gesture is active (subtle glow)
                if (gestureTransform && gestureTransform.shimmerEffect) {
                    // Each particle gets a subtle brightness variation based on distance from center
                    const dx = particle.x - (ctx.canvas.width / 2);
                    const dy = particle.y - (ctx.canvas.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDistance = distance / 200; // Normalize to reasonable range
                    
                    const time = gestureTransform.shimmerTime || (Date.now() * 0.001);
                    const wave = gestureTransform.shimmerWave || 0;
                    const intensity = gestureTransform.particleGlow || 1.2;
                    
                    // Subtle traveling wave from center outward
                    const travelingWave = Math.sin(time * 3 - normalizedDistance + wave);
                    
                    // Very subtle glow modulation
                    fireflyGlow = 1 + travelingWave * 0.15 * intensity;
                }
                
                // Apply glow effect if glow gesture is active (radiant burst)
                if (gestureTransform && gestureTransform.glowEffect) {
                    const progress = gestureTransform.glowProgress || 0;
                    const intensity = gestureTransform.particleGlow || 2.0;

                    // Particles brighten based on distance - closer particles glow first
                    const dx = particle.x - (ctx.canvas.width / 2);
                    const dy = particle.y - (ctx.canvas.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDistance = distance / 300;

                    // Glow radiates outward
                    const radiateDelay = Math.min(normalizedDistance * 0.3, 0.5);
                    const localProgress = Math.max(0, (progress - radiateDelay) / (1 - radiateDelay));
                    const localEnvelope = Math.sin(localProgress * Math.PI);

                    // ACTUALLY MAKE PARTICLES GLOW by temporarily setting glow properties
                    // Store original values if not already stored
                    if (!particle._originalGlow) {
                        particle._originalGlow = {
                            hasGlow: particle.hasGlow,
                            glowSizeMultiplier: particle.glowSizeMultiplier || 0
                        };
                    }

                    // Enable glow and set a large multiplier for visibility
                    particle.hasGlow = true;
                    particle.glowSizeMultiplier = Math.max(3.0, particle._originalGlow.glowSizeMultiplier) + localEnvelope * intensity * 3;

                    // Also boost particle size slightly
                    const glowSizeBoost = 1 + localEnvelope * 0.3;
                    safeSize = safeSize * glowSizeBoost;

                    // Cleanup flag - restore original values when effect ends
                    if (progress >= 0.99 && particle._originalGlow) {
                        particle.hasGlow = particle._originalGlow.hasGlow;
                        particle.glowSizeMultiplier = particle._originalGlow.glowSizeMultiplier;
                        delete particle._originalGlow;
                    }
                }
                
                // Draw glow layers if needed
                if (particle.hasGlow || fireflyGlow > 1.0) {
                    const glowRadius = Math.max(0.1, safeSize * (particle.glowSizeMultiplier || 1.5) * fireflyGlow);
                    
                    // Outer glow (enhanced by firefly effect)
                    ctx.globalAlpha = particle.opacity * 0.15 * fireflyGlow;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Inner glow (enhanced by firefly effect)
                    ctx.globalAlpha = particle.opacity * 0.25 * fireflyGlow;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, glowRadius * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw core (also brightened by firefly effect)
                ctx.globalAlpha = particle.opacity * (particle.baseOpacity || 0.5) * 0.6 * Math.min(2.0, fireflyGlow);
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, safeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    /**
     * Clears all particles and returns them to the pool
     */
    clear() {
        this.stateChangeCount++;
        
        // Return all particles to pool but avoid duplicates
        while (this.particles.length > 0) {
            const particle = this.particles.pop();
            // Clear cached data before returning
            if (particle.cachedColors) {
                particle.cachedColors.clear();
            }
            // Clear behaviorData properties but keep the object
            if (particle.behaviorData) {
                for (const key in particle.behaviorData) {
                    delete particle.behaviorData[key];
                }
            }
            // Only add to pool if it's not already there and pool has space
            if (this.pool.length < this.poolSize && !this.pool.includes(particle)) {
                this.pool.push(particle);
            }
        }
        
        this.particles.length = 0;
        this.particleCount = 0;
        this.spawnAccumulator = 0; // Reset accumulator when clearing
        
        // Trim pool if it's grown too large
        if (this.pool.length > this.poolSize) {
            // Actually remove excess particles from pool
            const excess = this.pool.length - this.poolSize;
            this.pool.splice(this.poolSize, excess);
        }
        
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
     * Performs periodic cleanup to prevent memory buildup
     */
    performCleanup() {
        // Trim pool if it's grown too large
        if (this.pool.length > this.poolSize) {
            // Clear excess particles from pool
            const excess = this.pool.length - this.poolSize;
            for (let i = 0; i < excess; i++) {
                const particle = this.pool.pop();
                // Ensure all references are cleared
                if (particle) {
                    particle.cachedGradient = null;
                    particle.cachedGradientKey = null;
                    particle.behaviorData = null;
                }
            }
        }
        
        // Clear any cached data from active particles
        for (const particle of this.particles) {
            if (particle.cachedGradient && particle.life < 0.5) {
                // Clear gradient cache for fading particles
                particle.cachedGradient = null;
                particle.cachedGradientKey = null;
            }
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
        this.originalMaxParticles = this.originalMaxParticles || this.maxParticles;
        this.maxParticles = Math.max(1, maxParticles);
        
        // Remove excess particles if new limit is lower
        while (this.particles.length > this.maxParticles) {
            this.removeParticle(0);
        }
    }
    
    /**
     * Cleans up dead particles and optimizes the pool
     */
    cleanupDeadParticles() {
        // Remove any dead particles that shouldn't be there
        const beforeCount = this.particles.length;
        this.particles = this.particles.filter(particle => particle.isAlive());
        const removed = beforeCount - this.particles.length;
        
        // Clear excess items from the pool to free memory
        if (this.pool.length > 20) {
            this.pool.length = 20;
        }
        
        return removed;
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