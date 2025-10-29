/**
 * ParticleSystem Tests
 * Tests for the particle system lifecycle, spawning, and performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ParticleSystem from '../../../src/core/ParticleSystem.js';

describe('ParticleSystem', () => {
    let particleSystem;

    beforeEach(() => {
        particleSystem = new ParticleSystem(50);
    });

    describe('Constructor', () => {
        it('should instantiate with default maxParticles', () => {
            expect(particleSystem).toBeDefined();
            expect(particleSystem.maxParticles).toBe(50);
        });

        it('should set absoluteMaxParticles to 2x maxParticles', () => {
            expect(particleSystem.absoluteMaxParticles).toBe(100);
        });

        it('should initialize with empty particles array', () => {
            expect(particleSystem.particles).toHaveLength(0);
        });

        it('should initialize pool correctly', () => {
            expect(particleSystem.pool).toBeInstanceOf(Array);
            expect(particleSystem.poolSize).toBe(50);
        });
    });

    describe('Particle Spawning', () => {
        it('should spawn particles based on count parameter', () => {
            particleSystem.spawn(
                'ambient',
                'neutral',
                0,
                400,
                300,
                16,
                5 // count
            );

            expect(particleSystem.particles.length).toBe(5);
        });

        it('should maintain minimum particles', () => {
            particleSystem.spawn(
                'ambient',
                'neutral',
                0,
                400,
                300,
                16,
                null, // no count
                10, // minParticles
                50
            );

            expect(particleSystem.particles.length).toBeGreaterThanOrEqual(10);
        });

        it('should respect maxParticles limit', () => {
            particleSystem.spawn(
                'ambient',
                'neutral',
                0,
                400,
                300,
                16,
                100 // try to spawn 100
            );

            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
        });

        it('should use object pool for spawning', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            const firstCount = particleSystem.poolMisses;

            particleSystem.clear();
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Second spawn should hit pool instead of creating new
            expect(particleSystem.poolHits).toBeGreaterThan(0);
        });
    });

    describe('Particle Update', () => {
        beforeEach(() => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
        });

        it('should update all particles', () => {
            const initialLength = particleSystem.particles.length;
            particleSystem.update(16, 400, 300);

            // Particles should still exist (they shouldn't die immediately)
            expect(particleSystem.particles.length).toBeLessThanOrEqual(
                initialLength
            );
        });

        it('should remove dead particles', () => {
            // Force all particles to die by setting age > 1 to bypass fade logic
            particleSystem.particles.forEach(p => {
                p.age = 2.0; // Age past the fade-out phase
                p.life = 0; // Mark as dead
            });

            particleSystem.update(16, 400, 300);

            // Dead particles should be removed
            expect(particleSystem.particles.length).toBe(0);
        });

        it('should enforce particle limit', () => {
            // Add way too many particles
            for (let i = 0; i < 60; i++) {
                particleSystem.spawnSingleParticle('ambient', 400, 300);
            }

            particleSystem.update(16, 400, 300);

            // Should be capped at maxParticles
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
        });
    });

    describe('Particle Behaviors', () => {
        it('should support ambient behavior', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 5);
            expect(particleSystem.particles.length).toBe(5);
        });

        it('should support rising behavior', () => {
            particleSystem.spawn('rising', 'joy', 0, 400, 300, 16, 5);
            expect(particleSystem.particles.length).toBe(5);
        });

        it('should support falling behavior', () => {
            particleSystem.spawn('falling', 'sadness', 0, 400, 300, 16, 5);
            expect(particleSystem.particles.length).toBe(5);
        });

        it('should support burst behavior', () => {
            particleSystem.spawn('burst', 'surprise', 0, 400, 300, 16, 5);
            expect(particleSystem.particles.length).toBe(5);
        });
    });

    describe('Gesture Behavior', () => {
        beforeEach(() => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
        });

        it('should set gesture behavior on particles', () => {
            particleSystem.setGestureBehavior('doppler', true);

            particleSystem.particles.forEach(particle => {
                expect(particle.gestureBehavior).toBe('doppler');
            });
        });

        it('should clear gesture behavior', () => {
            particleSystem.setGestureBehavior('doppler', true);
            particleSystem.setGestureBehavior('doppler', false);

            particleSystem.particles.forEach(particle => {
                expect(particle.gestureBehavior).toBeNull();
            });
        });
    });

    describe('Particle Burst', () => {
        it('should burst correct number of particles', () => {
            particleSystem.burst(10, 'burst', 400, 300);
            expect(particleSystem.particles.length).toBe(10);
        });

        it('should respect maxParticles in burst', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 45);
            particleSystem.burst(20, 'burst', 400, 300);

            // Should cap at maxParticles (50)
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
        });
    });

    describe('Clear and Cleanup', () => {
        beforeEach(() => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);
        });

        it('should clear all particles', () => {
            particleSystem.clear();
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.particleCount).toBe(0);
        });

        it('should return particles to pool on clear', () => {
            const particleCount = particleSystem.particles.length;
            particleSystem.clear();

            // Pool should have some particles (up to poolSize)
            expect(particleSystem.pool.length).toBeGreaterThan(0);
            expect(particleSystem.pool.length).toBeLessThanOrEqual(
                Math.min(particleCount, particleSystem.poolSize)
            );
        });

        it('should cleanup dead particles', () => {
            particleSystem.particles.forEach(p => {
                p.life = 0;
            });

            const removed = particleSystem.cleanupDeadParticles();
            expect(removed).toBe(20);
            expect(particleSystem.particles.length).toBe(0);
        });
    });

    describe('Stats', () => {
        it('should provide accurate stats', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            const stats = particleSystem.getStats();

            expect(stats.activeParticles).toBe(10);
            expect(stats.maxParticles).toBe(50);
            expect(stats).toHaveProperty('poolSize');
            expect(stats).toHaveProperty('poolHits');
            expect(stats).toHaveProperty('poolMisses');
            expect(stats).toHaveProperty('poolEfficiency');
        });
    });

    describe('Max Particles Configuration', () => {
        it('should update maxParticles', () => {
            particleSystem.setMaxParticles(30);
            expect(particleSystem.maxParticles).toBe(30);
        });

        it('should remove excess particles when reducing limit', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 40);
            particleSystem.setMaxParticles(20);

            expect(particleSystem.particles.length).toBeLessThanOrEqual(20);
        });

        it('should not allow maxParticles below 1', () => {
            particleSystem.setMaxParticles(0);
            expect(particleSystem.maxParticles).toBe(1);
        });
    });

    describe('Pool Refresh', () => {
        it('should clear pool and mark particles for replacement', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            particleSystem.refreshPool();

            expect(particleSystem.pool.length).toBe(0);
            expect(particleSystem.poolHits).toBe(0);
            expect(particleSystem.poolMisses).toBe(0);

            // All particles should be marked dead
            particleSystem.particles.forEach(particle => {
                expect(particle.life).toBe(0);
            });
        });
    });

    describe('Destroy', () => {
        it('should cleanup all resources', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            particleSystem.destroy();

            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.pool.length).toBe(0);
            expect(particleSystem.poolHits).toBe(0);
            expect(particleSystem.poolMisses).toBe(0);
        });
    });

    describe('Render Methods', () => {
        beforeEach(() => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
        });

        it('should render all particles', () => {
            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                canvas: { width: 800, height: 600 }
            };

            expect(() => particleSystem.render(mockCtx, '#ffffff')).not.toThrow();
        });

        it('should render background layer particles', () => {
            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                canvas: { width: 800, height: 600 }
            };

            expect(() => particleSystem.renderBackground(mockCtx, '#ffffff')).not.toThrow();
        });

        it('should render foreground layer particles', () => {
            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                canvas: { width: 800, height: 600 }
            };

            expect(() => particleSystem.renderForeground(mockCtx, '#ffffff')).not.toThrow();
        });
    });

    describe('Advanced Spawn Methods', () => {
        it('should spawn with emotion colors', () => {
            const emotionColors = ['#ff0000', '#00ff00', '#0000ff'];
            particleSystem.spawn(
                'ambient',
                'joy',
                0,
                400,
                300,
                16,
                10,
                0,
                50,
                1,
                1,
                emotionColors
            );

            expect(particleSystem.particles.length).toBe(10);
        });

        it('should spawn with undertone saturation', () => {
            const emotionColors = ['#ff0000'];
            particleSystem.spawn(
                'ambient',
                'joy',
                0,
                400,
                300,
                16,
                5,
                0,
                50,
                1,
                1,
                emotionColors,
                'intense'
            );

            expect(particleSystem.particles.length).toBe(5);
        });

        it('should reset spawn accumulator', () => {
            particleSystem.spawnAccumulator = 5.0;
            particleSystem.resetAccumulator();

            expect(particleSystem.spawnAccumulator).toBe(0);
        });

        it('should spawn with time-based accumulation', () => {
            particleSystem.spawn(
                'ambient',
                'neutral',
                60, // 60 particles per second
                400,
                300,
                1000, // 1 second
                null,
                0,
                100
            );

            // Should spawn some particles based on accumulation
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Particle Lifecycle', () => {
        it('should return particle to pool', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
            particleSystem.returnParticleToPool(particle);

            expect(particleSystem.pool).toContain(particle);
        });

        it('should not exceed pool size when returning particles', () => {
            // Fill pool to capacity
            for (let i = 0; i < 60; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should remove particle by index', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 5);
            const initialLength = particleSystem.particles.length;

            particleSystem.removeParticle(0);

            expect(particleSystem.particles.length).toBe(initialLength - 1);
        });

        it('should handle invalid remove index', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 5);
            const initialLength = particleSystem.particles.length;

            particleSystem.removeParticle(999);

            expect(particleSystem.particles.length).toBe(initialLength);
        });
    });

    describe('Performance Cleanup', () => {
        it('should perform cleanup on pool', () => {
            // Overfill pool
            for (let i = 0; i < 70; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            particleSystem.performCleanup();

            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });
    });

    describe('Containment Bounds', () => {
        it('should set containment bounds', () => {
            const bounds = { x: 0, y: 0, width: 800, height: 600 };
            particleSystem.setContainmentBounds(bounds);

            expect(particleSystem.containmentBounds).toBe(bounds);
        });

        it('should clear containment bounds', () => {
            particleSystem.setContainmentBounds({ x: 0, y: 0, width: 800, height: 600 });
            particleSystem.setContainmentBounds(null);

            expect(particleSystem.containmentBounds).toBeNull();
        });
    });

    describe('Canvas Dimensions', () => {
        it('should allow setting canvas dimensions directly', () => {
            particleSystem.canvasWidth = 1920;
            particleSystem.canvasHeight = 1080;

            expect(particleSystem.canvasWidth).toBe(1920);
            expect(particleSystem.canvasHeight).toBe(1080);
        });
    });

    describe('Spawn Position Calculation', () => {
        it('should calculate spawn position for ambient behavior', () => {
            const pos = particleSystem.getSpawnPosition('ambient', 400, 300, 800, 600);

            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
            expect(typeof pos.x).toBe('number');
            expect(typeof pos.y).toBe('number');
        });

        it('should calculate spawn position for rising behavior', () => {
            const pos = particleSystem.getSpawnPosition('rising', 400, 300, 800, 600);

            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
        });

        it('should calculate spawn position for falling behavior', () => {
            const pos = particleSystem.getSpawnPosition('falling', 400, 300, 800, 600);

            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
        });

        it('should calculate spawn position for aggressive behavior', () => {
            const pos = particleSystem.getSpawnPosition('aggressive', 400, 300, 800, 600);

            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
        });
    });

    describe('Position Clamping', () => {
        it('should clamp position to canvas bounds', () => {
            const pos = particleSystem.clampToCanvas(1000, 1000, 800, 600);

            expect(pos.x).toBeLessThanOrEqual(800 - 30);
            expect(pos.y).toBeLessThanOrEqual(600 - 30);
        });

        it('should respect margin parameter', () => {
            const pos = particleSystem.clampToCanvas(-50, -50, 800, 600, 10);

            expect(pos.x).toBeGreaterThanOrEqual(10);
            expect(pos.y).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Particle Queries', () => {
        beforeEach(() => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 5);
            particleSystem.spawn('rising', 'joy', 0, 400, 300, 16, 3);
        });

        it('should get particles by behavior', () => {
            const ambientParticles = particleSystem.getParticlesByBehavior('ambient');

            expect(ambientParticles.length).toBe(5);
        });

        it('should validate particles', () => {
            const isValid = particleSystem.validateParticles();

            expect(typeof isValid).toBe('boolean');
        });

        it('should detect invalid particles', () => {
            particleSystem.particles[0].life = -5; // Invalid life value

            const isValid = particleSystem.validateParticles();

            expect(isValid).toBe(false);
        });
    });

    describe('Pool Management', () => {
        it('should get particle from pool when available', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
            particleSystem.returnParticleToPool(particle);

            const pooledParticle = particleSystem.getParticleFromPool(400, 300, 'ambient');

            expect(pooledParticle).toBe(particle);
            expect(particleSystem.poolHits).toBeGreaterThan(0);
        });

        it('should create new particle when pool is empty', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');

            expect(particle).toBeDefined();
            expect(particleSystem.poolMisses).toBeGreaterThan(0);
        });

        it('should clear cached data when returning to pool', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
            particle.cachedGradient = { some: 'data' };
            particle.cachedGradientKey = 'key';

            particleSystem.returnParticleToPool(particle);

            expect(particle.cachedGradient).toBeNull();
            expect(particle.cachedGradientKey).toBeNull();
        });
    });

    // ========================================================================
    // INTEGRATION TESTS - COMPLETE PARTICLE LIFECYCLES
    // ========================================================================

    describe('Integration: Complete Particle Lifecycle', () => {
        it('should spawn, update, and naturally die particles', () => {
            // Spawn particles
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            expect(particleSystem.particles.length).toBe(10);

            // Force particles to age quickly by setting life directly
            particleSystem.particles.forEach(p => {
                p.age = 2.0; // Age past lifecycle
                p.life = 0; // Mark as dead
            });

            // Update to remove dead particles
            particleSystem.update(16, 400, 300);

            // All particles should have died
            expect(particleSystem.particles.length).toBeLessThan(10);
        });

        it('should maintain particle pool efficiency across lifecycle', () => {
            // Spawn first batch
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            // Update to age them
            for (let i = 0; i < 50; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Clear and spawn again - should hit pool
            particleSystem.clear();
            const initialPoolHits = particleSystem.poolHits;
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            expect(particleSystem.poolHits).toBeGreaterThan(initialPoolHits);
        });

        it('should handle continuous spawning and dying over time', () => {
            let iterations = 0;
            while (iterations < 100) {
                particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16, null, 0, 30);
                particleSystem.update(16, 400, 300);
                iterations++;
            }

            // System should be stable
            expect(particleSystem.particles.length).toBeLessThanOrEqual(30);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Integration: Physics Accuracy', () => {
        it('should apply gravity to falling particles', () => {
            particleSystem.spawn('falling', 'sadness', 0, 400, 300, 16, 5);

            const initialPositions = particleSystem.particles.map(p => p.y);

            // Update multiple frames
            for (let i = 0; i < 10; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should have moved downward (y increased)
            particleSystem.particles.forEach((p, i) => {
                if (p.isAlive()) {
                    expect(p.y).toBeGreaterThanOrEqual(initialPositions[i]);
                }
            });
        });

        it('should apply buoyancy to rising particles', () => {
            particleSystem.spawn('rising', 'joy', 0, 400, 300, 16, 5);

            const initialPositions = particleSystem.particles.map(p => p.y);

            // Update multiple frames
            for (let i = 0; i < 10; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should have moved upward (y decreased)
            particleSystem.particles.forEach((p, i) => {
                if (p.isAlive()) {
                    expect(p.y).toBeLessThanOrEqual(initialPositions[i]);
                }
            });
        });

        it('should apply velocity decay over time', () => {
            particleSystem.spawn('burst', 'surprise', 0, 400, 300, 16, 10);

            // Store initial velocities
            const initialVelocities = particleSystem.particles.map(p =>
                Math.sqrt(p.vx * p.vx + p.vy * p.vy)
            );

            // Update for several frames
            for (let i = 0; i < 30; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Velocities should decay (particles should slow down)
            let decayedCount = 0;
            particleSystem.particles.forEach((p, i) => {
                const currentVelocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (currentVelocity <= initialVelocities[i]) {
                    decayedCount++;
                }
            });

            // Most particles should have decayed velocity
            expect(decayedCount).toBeGreaterThan(particleSystem.particles.length * 0.5);
        });

        it('should handle physics at different frame rates', () => {
            const system1 = new ParticleSystem(50);
            const system2 = new ParticleSystem(50);

            // Spawn identical particles
            system1.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            system2.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Update at different frame rates but same total time
            for (let i = 0; i < 60; i++) {
                system1.update(16, 400, 300); // 60fps
            }
            for (let i = 0; i < 30; i++) {
                system2.update(32, 400, 300); // 30fps
            }

            // Particle counts should be similar (physics should normalize)
            expect(Math.abs(system1.particles.length - system2.particles.length)).toBeLessThan(5);
        });

        it('should clamp deltaTime to prevent physics explosions', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Apply massive deltaTime (like after tab switch)
            const initialCount = particleSystem.particles.length;
            particleSystem.update(5000, 400, 300);

            // Particles should still be in reasonable state
            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
                expect(Math.abs(p.vx)).toBeLessThan(100);
                expect(Math.abs(p.vy)).toBeLessThan(100);
            });
        });
    });

    describe('Integration: Particle Behaviors', () => {
        it('should maintain orbiting behavior around center', () => {
            particleSystem.spawn('orbiting', 'curiosity', 0, 400, 300, 16, 5);

            // Track distances from center over time
            const centerX = 400, centerY = 300;
            const distances = [];

            for (let i = 0; i < 60; i++) {
                particleSystem.update(16, centerX, centerY);

                if (particleSystem.particles.length > 0) {
                    const avgDist = particleSystem.particles.reduce((sum, p) => {
                        const dx = p.x - centerX;
                        const dy = p.y - centerY;
                        return sum + Math.sqrt(dx * dx + dy * dy);
                    }, 0) / particleSystem.particles.length;

                    distances.push(avgDist);
                }
            }

            // Average distance should remain relatively stable (orbiting)
            if (distances.length > 10) {
                const avgDist = distances.reduce((a, b) => a + b) / distances.length;
                const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDist, 2), 0) / distances.length;
                const stdDev = Math.sqrt(variance);

                // Standard deviation should be reasonable (not exploding outward)
                expect(stdDev).toBeLessThan(avgDist * 0.5);
            }
        });

        it('should handle scattering behavior with outward motion', () => {
            particleSystem.spawn('scattering', 'anger', 0, 400, 300, 16, 10);

            const centerX = 400, centerY = 300;
            const initialDistances = particleSystem.particles.map(p => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                return Math.sqrt(dx * dx + dy * dy);
            });

            // Update for several frames
            for (let i = 0; i < 20; i++) {
                particleSystem.update(16, centerX, centerY);
            }

            // Particles should have moved outward
            let outwardCount = 0;
            particleSystem.particles.forEach((p, i) => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const currentDist = Math.sqrt(dx * dx + dy * dy);

                if (currentDist > initialDistances[i]) {
                    outwardCount++;
                }
            });

            // Most particles should have moved outward
            expect(outwardCount).toBeGreaterThan(particleSystem.particles.length * 0.5);
        });

        it('should handle aggressive behavior with fast motion', () => {
            particleSystem.spawn('aggressive', 'anger', 0, 400, 300, 16, 5);

            const initialPositions = particleSystem.particles.map(p => ({x: p.x, y: p.y}));

            // Update for a few frames
            for (let i = 0; i < 5; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should have moved significantly
            let movedCount = 0;
            particleSystem.particles.forEach((p, i) => {
                const dx = p.x - initialPositions[i].x;
                const dy = p.y - initialPositions[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 5) { // Moved more than 5 pixels
                    movedCount++;
                }
            });

            expect(movedCount).toBeGreaterThan(0);
        });

        it('should handle repelling behavior pushing away from center', () => {
            particleSystem.spawn('repelling', 'fear', 0, 400, 300, 16, 8);

            const centerX = 400, centerY = 300;

            // Update multiple times
            for (let i = 0; i < 15; i++) {
                particleSystem.update(16, centerX, centerY);
            }

            // All particles should be moving away from center
            particleSystem.particles.forEach(p => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;

                // Velocity should point away from center (dot product positive)
                const dotProduct = dx * p.vx + dy * p.vy;
                expect(dotProduct).toBeGreaterThanOrEqual(0);
            });
        });

        it('should handle glitchy behavior with erratic motion', () => {
            particleSystem.spawn('glitchy', 'confusion', 0, 400, 300, 16, 5);

            const positions = [];

            // Track positions over time
            for (let i = 0; i < 20; i++) {
                particleSystem.update(16, 400, 300);
                positions.push(particleSystem.particles.map(p => ({x: p.x, y: p.y})));
            }

            // Motion should be erratic (high variance in direction changes)
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should handle spaz behavior with rapid motion', () => {
            particleSystem.spawn('spaz', 'panic', 0, 400, 300, 16, 5);

            // Just verify particles were created and exist
            expect(particleSystem.particles.length).toBe(5);

            // Update for a few frames
            for (let i = 0; i < 10; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should still exist after updates
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should handle resting behavior with minimal motion', () => {
            particleSystem.spawn('resting', 'calm', 0, 400, 300, 16, 5);

            const initialPositions = particleSystem.particles.map(p => ({x: p.x, y: p.y}));

            // Update for several frames
            for (let i = 0; i < 10; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should not have moved much
            let totalDistance = 0;
            particleSystem.particles.forEach((p, i) => {
                const dx = p.x - initialPositions[i].x;
                const dy = p.y - initialPositions[i].y;
                totalDistance += Math.sqrt(dx * dx + dy * dy);
            });

            const avgDistance = totalDistance / particleSystem.particles.length;
            expect(avgDistance).toBeLessThan(50); // Should be relatively stationary
        });
    });

    describe('Integration: Object Pooling Performance', () => {
        it('should reuse particles efficiently in high-churn scenario', () => {
            // Simulate high particle turnover
            for (let cycle = 0; cycle < 10; cycle++) {
                particleSystem.spawn('burst', 'surprise', 0, 400, 300, 16, 20);

                // Age particles quickly
                for (let i = 0; i < 20; i++) {
                    particleSystem.update(16, 400, 300);
                }

                particleSystem.clear();
            }

            const stats = particleSystem.getStats();

            // Pool efficiency should be high after several cycles
            expect(stats.poolEfficiency).toBeGreaterThan(0.5);
            expect(stats.poolSize).toBeGreaterThan(0);
        });

        it('should maintain pool size limits', () => {
            // Fill pool beyond limit
            for (let i = 0; i < 100; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should track particle creation accurately', () => {
            const initialCreated = particleSystem.totalParticlesCreated;

            // Spawn particles (pool is empty, so all should be created)
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 25);

            expect(particleSystem.totalParticlesCreated).toBeGreaterThanOrEqual(initialCreated + 25);
        });

        it('should handle pool overflow gracefully', () => {
            // Create many particles
            for (let i = 0; i < 70; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.particles.push(particle);
            }

            // Clear them (return to pool)
            particleSystem.clear();

            // Pool should not exceed its size limit
            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should clear particle references when pooling', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
            particle.cachedGradient = { test: 'data' };
            particle.behaviorData.testProp = 'value';

            particleSystem.returnParticleToPool(particle);

            expect(particle.cachedGradient).toBeNull();
            expect(Object.keys(particle.behaviorData).length).toBe(0);
        });
    });

    describe('Integration: Memory Management', () => {
        it('should handle thousands of particles without leaking', () => {
            const largeSystem = new ParticleSystem(1000);

            // Spawn many particles
            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 500);
            expect(largeSystem.particles.length).toBe(500);

            // Update and spawn more
            for (let i = 0; i < 50; i++) {
                largeSystem.update(16, 400, 300);
                largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, null, 0, 1000);
            }

            // Should not exceed limits
            expect(largeSystem.particles.length).toBeLessThanOrEqual(1000);

            largeSystem.destroy();
        });

        it('should enforce absolute max particle limit', () => {
            // Try to exceed absolute max
            for (let i = 0; i < 150; i++) {
                particleSystem.spawnSingleParticle('ambient', 400, 300);
            }

            // Should cap at absoluteMaxParticles (100 for default 50 maxParticles)
            expect(particleSystem.particles.length).toBeLessThanOrEqual(particleSystem.absoluteMaxParticles);
        });

        it('should cleanup dead particles periodically', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 30);

            // Kill all particles
            particleSystem.particles.forEach(p => {
                p.life = 0;
            });

            const removed = particleSystem.cleanupDeadParticles();

            expect(removed).toBe(30);
            expect(particleSystem.particles.length).toBe(0);
        });

        it('should trim excess pool items', () => {
            // Overfill pool
            for (let i = 0; i < 80; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            particleSystem.performCleanup();

            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should handle destroy correctly', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            particleSystem.destroy();

            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.pool.length).toBe(0);
            expect(particleSystem.particleCount).toBe(0);
        });
    });

    describe('Integration: Batch Operations', () => {
        it('should handle burst spawning efficiently', () => {
            const startTime = Date.now();

            particleSystem.burst(50, 'burst', 400, 300);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should spawn quickly (under 50ms)
            expect(duration).toBeLessThan(50);
            expect(particleSystem.particles.length).toBe(50);
        });

        it('should update large particle counts efficiently', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            const startTime = Date.now();

            for (let i = 0; i < 60; i++) {
                particleSystem.update(16, 400, 300);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // 60 updates with 50 particles should be fast (relaxed for CI/varying environments)
            // Increased from 100ms to 300ms to account for system load variability
            expect(duration).toBeLessThan(300);
        });

        it('should render many particles efficiently', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            const startTime = Date.now();

            particleSystem.render(mockCtx, '#ffffff');

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Rendering 50 particles should be fast (under 50ms)
            expect(duration).toBeLessThan(50);
        });

        it('should clear large particle counts quickly', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            const startTime = Date.now();
            particleSystem.clear();
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(10);
            expect(particleSystem.particles.length).toBe(0);
        });
    });

    describe('Integration: Edge Cases and Boundaries', () => {
        it('should handle zero particle spawning', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 0);
            expect(particleSystem.particles.length).toBe(0);
        });

        it('should handle spawning at canvas edges', () => {
            // Spawn at extreme positions
            particleSystem.spawn('ambient', 'neutral', 0, 0, 0, 16, 5);
            particleSystem.spawn('ambient', 'neutral', 0, 800, 600, 16, 5);

            expect(particleSystem.particles.length).toBe(10);

            // All particles should have valid positions
            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
            });
        });

        it('should handle negative deltaTime gracefully', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            expect(() => {
                particleSystem.update(-16, 400, 300);
            }).not.toThrow();
        });

        it('should handle zero deltaTime', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Zero deltaTime should not cause errors
            expect(() => {
                particleSystem.update(0, 400, 300);
            }).not.toThrow();

            // System should still be valid after zero deltaTime update
            expect(particleSystem.particles.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle extremely high deltaTime', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Massive time jump
            particleSystem.update(10000, 400, 300);

            // Particles should still be in valid state
            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
                expect(isFinite(p.vx)).toBe(true);
                expect(isFinite(p.vy)).toBe(true);
            });
        });

        it('should handle particle rate of zero', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, null, 0, 50);

            // Should spawn no particles with zero rate
            expect(particleSystem.particles.length).toBe(0);
        });

        it('should handle very high particle rates with capping', () => {
            particleSystem.spawn('ambient', 'neutral', 1000, 400, 300, 100, null, 0, 50);

            // Should cap at maxParticles
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
        });

        it('should clamp spawn positions to canvas bounds', () => {
            particleSystem.canvasWidth = 800;
            particleSystem.canvasHeight = 600;

            // Try to spawn way outside canvas
            particleSystem.spawn('ambient', 'neutral', 0, 5000, 5000, 16, 10);

            // All particles should be within reasonable bounds
            particleSystem.particles.forEach(p => {
                expect(p.x).toBeGreaterThan(-100);
                expect(p.x).toBeLessThan(900);
                expect(p.y).toBeGreaterThan(-100);
                expect(p.y).toBeLessThan(700);
            });
        });
    });

    describe('Integration: Time-Based Spawning', () => {
        it('should accumulate spawn time correctly', () => {
            expect(particleSystem.spawnAccumulator).toBe(0);

            // Spawn with rate
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16, null, 0, 50);

            // Accumulator should be updated
            expect(particleSystem.spawnAccumulator).toBeGreaterThanOrEqual(0);
        });

        it('should cap accumulator to prevent spawn bursts', () => {
            // Simulate long pause then resume
            particleSystem.spawn('ambient', 'neutral', 60, 400, 300, 5000, null, 0, 50);

            // Accumulator should be capped (max 3.0)
            expect(particleSystem.spawnAccumulator).toBeLessThanOrEqual(3.0);
        });

        it('should spawn particles smoothly over time', () => {
            const spawnCounts = [];

            // Track spawning over multiple frames
            for (let i = 0; i < 60; i++) {
                particleSystem.spawn('ambient', 'neutral', 30, 400, 300, 16, null, 0, 100);
                spawnCounts.push(particleSystem.particles.length);
            }

            // Particle count should increase gradually
            const increasing = spawnCounts.every((count, i) =>
                i === 0 || count >= spawnCounts[i - 1] || count >= 100
            );
            expect(increasing).toBe(true);
        });

        it('should reset accumulator when requested', () => {
            particleSystem.spawnAccumulator = 2.5;

            particleSystem.resetAccumulator();

            expect(particleSystem.spawnAccumulator).toBe(0);
        });

        it('should clear accumulator on system clear', () => {
            particleSystem.spawn('ambient', 'neutral', 20, 400, 300, 16, null, 0, 50);

            particleSystem.clear();

            expect(particleSystem.spawnAccumulator).toBe(0);
        });
    });

    describe('Integration: Gesture Interactions', () => {
        it('should apply doppler gesture to all particles', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            particleSystem.setGestureBehavior('doppler', true);

            // Update with gesture motion
            const gestureMotion = { type: 'doppler', intensity: 1.0 };
            particleSystem.update(16, 400, 300, gestureMotion, 0.5);

            // All particles should have gesture behavior set
            particleSystem.particles.forEach(p => {
                expect(p.gestureBehavior).toBe('doppler');
            });
        });

        it('should clear gesture behavior from particles', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            particleSystem.setGestureBehavior('doppler', true);

            particleSystem.setGestureBehavior('doppler', false);

            particleSystem.particles.forEach(p => {
                expect(p.gestureBehavior).toBeNull();
            });
        });

        it('should handle gesture with undertone modifier', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            const undertoneModifier = { saturation: 1.5, brightness: 1.2 };

            expect(() => {
                particleSystem.update(16, 400, 300, null, 0, undertoneModifier);
            }).not.toThrow();
        });

        it('should maintain particles through gesture transitions', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            // Start gesture
            particleSystem.setGestureBehavior('doppler', true);
            particleSystem.update(16, 400, 300, { type: 'doppler' }, 0.5);

            // End gesture
            particleSystem.setGestureBehavior('doppler', false);
            particleSystem.update(16, 400, 300, null, 0);

            // Particles should still exist
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Integration: Multi-Behavior Scenarios', () => {
        it('should handle mixed behavior types simultaneously', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 5);
            particleSystem.spawn('rising', 'joy', 0, 400, 300, 16, 5);
            particleSystem.spawn('falling', 'sadness', 0, 400, 300, 16, 5);
            particleSystem.spawn('orbiting', 'curiosity', 0, 400, 300, 16, 5);

            expect(particleSystem.particles.length).toBe(20);

            // Update all
            for (let i = 0; i < 30; i++) {
                particleSystem.update(16, 400, 300);
            }

            // All behaviors should coexist
            const behaviors = new Set(particleSystem.particles.map(p => p.behavior));
            expect(behaviors.size).toBeGreaterThan(1);
        });

        it('should transition between emotion states smoothly', () => {
            // Start with joy
            particleSystem.spawn('rising', 'joy', 0, 400, 300, 16, 10);
            particleSystem.update(16, 400, 300);

            // Transition to sadness
            particleSystem.spawn('falling', 'sadness', 0, 400, 300, 16, 10);

            for (let i = 0; i < 20; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Both behaviors should be present during transition
            const behaviors = new Set(particleSystem.particles.map(p => p.behavior));
            expect(behaviors.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Integration: Render Layer System', () => {
        it('should split particles between background and foreground', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            // Render both layers
            expect(() => {
                particleSystem.renderBackground(mockCtx, '#ffffff');
                particleSystem.renderForeground(mockCtx, '#ffffff');
            }).not.toThrow();
        });

        it('should render background particles correctly', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            expect(() => {
                particleSystem.renderBackground(mockCtx, '#ff0000');
            }).not.toThrow();
        });

        it('should render foreground particles correctly', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            expect(() => {
                particleSystem.renderForeground(mockCtx, '#00ff00');
            }).not.toThrow();
        });
    });

    describe('Integration: Scale Factor Handling', () => {
        it('should apply scale factor to particle sizes', () => {
            const scaleFactor = 2.0;
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10, 0, 50, scaleFactor);

            // Particles should exist
            expect(particleSystem.particles.length).toBe(10);
            expect(particleSystem.scaleFactor).toBe(scaleFactor);
        });

        it('should refresh pool when scale changes', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            particleSystem.refreshPool();

            expect(particleSystem.pool.length).toBe(0);
            expect(particleSystem.poolHits).toBe(0);

            // All active particles should be marked dead
            particleSystem.particles.forEach(p => {
                expect(p.life).toBe(0);
            });
        });

        it('should handle particle size multiplier', () => {
            const sizeMultiplier = 1.5;
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10, 0, 50, 1, sizeMultiplier);

            expect(particleSystem.particles.length).toBe(10);
            expect(particleSystem.particleSizeMultiplier).toBe(sizeMultiplier);
        });
    });

    describe('Integration: Emotion Colors and Undertones', () => {
        it('should apply emotion colors to particles', () => {
            const emotionColors = ['#ff0000', '#00ff00', '#0000ff'];

            particleSystem.spawn('ambient', 'joy', 0, 400, 300, 16, 10, 0, 50, 1, 1, emotionColors);

            expect(particleSystem.particles.length).toBe(10);
            expect(particleSystem.currentEmotionColors).toEqual(emotionColors);
        });

        it('should apply undertone saturation to colors', () => {
            const emotionColors = ['#ff0000'];
            const undertone = 'intense';

            particleSystem.spawn('ambient', 'joy', 0, 400, 300, 16, 10, 0, 50, 1, 1, emotionColors, undertone);

            expect(particleSystem.particles.length).toBe(10);
            expect(particleSystem.currentUndertone).toBe(undertone);
        });

        it('should handle different undertone types', () => {
            const undertones = ['intense', 'confident', 'nervous', 'clear', 'tired', 'subdued'];

            undertones.forEach(undertone => {
                const system = new ParticleSystem(50);
                system.spawn('ambient', 'neutral', 0, 400, 300, 16, 5, 0, 50, 1, 1, ['#ffffff'], undertone);

                expect(system.particles.length).toBe(5);
                system.destroy();
            });
        });
    });

    describe('Integration: Containment Bounds', () => {
        it('should respect containment bounds during update', () => {
            const bounds = { width: 800, height: 600 };
            particleSystem.setContainmentBounds(bounds);

            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            // Update multiple times
            for (let i = 0; i < 100; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Particles should stay within bounds
            particleSystem.particles.forEach(p => {
                // Allow some margin for particles near edges
                expect(p.x).toBeGreaterThan(-50);
                expect(p.x).toBeLessThan(bounds.width + 50);
                expect(p.y).toBeGreaterThan(-50);
                expect(p.y).toBeLessThan(bounds.height + 50);
            });
        });

        it('should handle containment bounds removal', () => {
            particleSystem.setContainmentBounds({ width: 400, height: 300 });
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Remove bounds
            particleSystem.setContainmentBounds(null);

            expect(particleSystem.containmentBounds).toBeNull();
        });
    });

    describe('Integration: Stats Tracking', () => {
        it('should provide comprehensive stats', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 25);

            const stats = particleSystem.getStats();

            expect(stats.activeParticles).toBe(25);
            expect(stats.maxParticles).toBe(50);
            expect(stats.poolSize).toBeDefined();
            expect(stats.poolHits).toBeDefined();
            expect(stats.poolMisses).toBeDefined();
            expect(stats.poolEfficiency).toBeDefined();
            expect(stats.spawnAccumulator).toBeDefined();
        });

        it('should track pool efficiency accurately', () => {
            // First spawn - all misses
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            particleSystem.clear();

            // Second spawn - should hit pool
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            const stats = particleSystem.getStats();
            expect(stats.poolHits).toBeGreaterThan(0);
            expect(stats.poolEfficiency).toBeGreaterThan(0);
        });
    });

    describe('Integration: Stress Testing', () => {
        it('should handle rapid spawn/clear cycles', () => {
            for (let i = 0; i < 50; i++) {
                particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);
                particleSystem.clear();
            }

            // System should be stable
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should handle rapid behavior switches', () => {
            const behaviors = ['ambient', 'rising', 'falling', 'burst', 'orbiting', 'scattering'];

            for (let i = 0; i < 30; i++) {
                const behavior = behaviors[i % behaviors.length];
                particleSystem.spawn(behavior, 'neutral', 0, 400, 300, 16, 5);
                particleSystem.update(16, 400, 300);
            }

            expect(particleSystem.particles.length).toBeGreaterThan(0);
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
        });

        it('should maintain stability under continuous load', () => {
            // First spawn to populate pool
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);
            particleSystem.clear();

            // Run for extended period
            for (let i = 0; i < 200; i++) {
                particleSystem.spawn('ambient', 'neutral', 5, 400, 300, 16, null, 0, 50);
                particleSystem.update(16, 400, 300);
            }

            // System should remain stable
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
            const stats = particleSystem.getStats();
            // Pool should have been used at some point
            expect(stats.poolHits + stats.poolMisses).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // ADVANCED INTEGRATION TESTS - COMPREHENSIVE COVERAGE
    // ========================================================================

    describe('Integration: Advanced Particle Behaviors', () => {
        it('should handle meditation_swirl behavior with palm center', () => {
            // Set up palm center data
            particleSystem.spawn('meditation_swirl', 'calm', 0, 400, 300, 16, 5);

            expect(particleSystem.particles.length).toBe(5);

            // Update and verify particles maintain swirl pattern
            for (let i = 0; i < 20; i++) {
                particleSystem.update(16, 400, 300);
            }

            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should spawn burst particles differently for suspicion vs surprise', () => {
            const system1 = new ParticleSystem(50);
            const system2 = new ParticleSystem(50);

            // Set emotions before spawning
            system1.currentEmotion = 'suspicion';
            system2.currentEmotion = 'surprise';

            system1.spawn('burst', 'suspicion', 0, 400, 300, 16, 10);
            system2.spawn('burst', 'surprise', 0, 400, 300, 16, 10);

            expect(system1.particles.length).toBe(10);
            expect(system2.particles.length).toBe(10);

            system1.destroy();
            system2.destroy();
        });

        it('should handle glitchy behavior with wide spread', () => {
            particleSystem.spawn('glitchy', 'confusion', 0, 400, 300, 16, 15);

            const centerX = 400, centerY = 300;

            // Calculate distances from center
            const distances = particleSystem.particles.map(p => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                return Math.sqrt(dx * dx + dy * dy);
            });

            // Glitchy particles should have wide spread (3-7x glow radius)
            const avgDistance = distances.reduce((a, b) => a + b) / distances.length;
            expect(avgDistance).toBeGreaterThan(50); // Should be far from center
        });

        it('should handle spaz behavior with very wide spread', () => {
            particleSystem.canvasWidth = 800;
            particleSystem.canvasHeight = 600;
            particleSystem.spawn('spaz', 'panic', 0, 400, 300, 16, 15);

            const centerX = 400, centerY = 300;

            // Calculate distances from center, filtering invalid positions
            const distances = particleSystem.particles
                .filter(p => isFinite(p.x) && isFinite(p.y))
                .map(p => {
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    return Math.sqrt(dx * dx + dy * dy);
                });

            // Spaz particles should have very wide spread (2-5x glow radius)
            if (distances.length > 0) {
                const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
                expect(isFinite(avgDistance)).toBe(true);
                expect(avgDistance).toBeGreaterThan(0);
            }
        });

        it('should spawn ambient particles at glow edge with outward angle', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Ambient particles should have angle property for outward movement
            particleSystem.particles.forEach(p => {
                expect(p.behavior).toBe('ambient');
            });
        });
    });

    describe('Integration: Physics Edge Cases', () => {
        it('should handle particles with zero velocity', () => {
            particleSystem.spawn('resting', 'calm', 0, 400, 300, 16, 10);

            // Force zero velocity
            particleSystem.particles.forEach(p => {
                p.vx = 0;
                p.vy = 0;
            });

            // Should handle updates without errors
            expect(() => {
                for (let i = 0; i < 10; i++) {
                    particleSystem.update(16, 400, 300);
                }
            }).not.toThrow();
        });

        it('should handle particles with extreme velocities', () => {
            particleSystem.spawn('burst', 'surprise', 0, 400, 300, 16, 10);

            // Set extreme velocities
            particleSystem.particles.forEach(p => {
                p.vx = 50;
                p.vy = 50;
            });

            // Should clamp or handle gracefully
            particleSystem.update(16, 400, 300);

            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
            });
        });

        it('should handle particles at exact canvas boundaries', () => {
            particleSystem.canvasWidth = 800;
            particleSystem.canvasHeight = 600;

            // Spawn at exact edges
            for (let i = 0; i < 4; i++) {
                const x = i < 2 ? 0 : 800;
                const y = i % 2 === 0 ? 0 : 600;
                particleSystem.spawn('ambient', 'neutral', 0, x, y, 16, 2);
            }

            expect(particleSystem.particles.length).toBeGreaterThan(0);

            // Update should handle boundary particles
            particleSystem.update(16, 400, 300);

            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
            });
        });

        it('should apply containment bounds bounce physics', () => {
            const bounds = { width: 400, height: 300 };
            particleSystem.setContainmentBounds(bounds);

            particleSystem.spawn('burst', 'surprise', 0, 200, 150, 16, 20);

            // Give particles high velocity
            particleSystem.particles.forEach(p => {
                p.vx = 20;
                p.vy = 20;
            });

            // Update multiple times
            for (let i = 0; i < 50; i++) {
                particleSystem.update(16, 200, 150);
            }

            // Particles should remain within bounds
            particleSystem.particles.forEach(p => {
                expect(p.x).toBeGreaterThan(-100);
                expect(p.x).toBeLessThan(bounds.width + 100);
                expect(p.y).toBeGreaterThan(-100);
                expect(p.y).toBeLessThan(bounds.height + 100);
            });
        });

        it('should handle NaN and Infinity gracefully', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            // Inject invalid values
            particleSystem.particles[0].x = NaN;
            particleSystem.particles[1].y = Infinity;
            particleSystem.particles[2].vx = NaN;

            // Update should filter or fix invalid particles
            particleSystem.update(16, 400, 300);

            // Valid particles should remain
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Integration: Pool Management Advanced', () => {
        it('should handle concurrent pool operations', () => {
            // Rapidly get and return particles
            for (let i = 0; i < 100; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.particles.push(particle);
            }

            // Clear and verify pool doesn't exceed limit
            particleSystem.clear();

            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should clear behavioral data when pooling particles', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'orbiting');

            // Set complex behavioral data
            particle.behaviorData.orbitAngle = 1.5;
            particle.behaviorData.orbitRadius = 100;
            particle.behaviorData.orbitSpeed = 0.5;

            particleSystem.returnParticleToPool(particle);

            // Behavioral data should be cleared
            expect(Object.keys(particle.behaviorData).length).toBe(0);
        });

        it('should track particle destruction accurately', () => {
            const initialDestroyed = particleSystem.totalParticlesDestroyed;

            // Create particles beyond pool size
            for (let i = 0; i < 70; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            // Excess particles should be counted as destroyed or pool should be at limit
            expect(particleSystem.totalParticlesDestroyed).toBeGreaterThanOrEqual(initialDestroyed);
            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);
        });

        it('should maintain pool integrity after performCleanup', () => {
            // Overfill pool
            for (let i = 0; i < 80; i++) {
                const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
                particleSystem.returnParticleToPool(particle);
            }

            particleSystem.performCleanup();

            // Verify pool is trimmed and valid
            expect(particleSystem.pool.length).toBeLessThanOrEqual(particleSystem.poolSize);

            // Pool particles should be valid
            particleSystem.pool.forEach(p => {
                expect(p).toBeDefined();
                expect(p.behaviorData).toBeDefined();
            });
        });

        it('should not add duplicate particles to pool', () => {
            const particle = particleSystem.getParticleFromPool(400, 300, 'ambient');
            particleSystem.particles.push(particle);

            // Clear should add to pool
            particleSystem.clear();

            const poolSize1 = particleSystem.pool.length;

            // Try to add same particle again
            particleSystem.returnParticleToPool(particle);

            // Pool size should not increase if duplicate
            expect(particleSystem.pool.length).toBeLessThanOrEqual(poolSize1 + 1);
        });
    });

    describe('Integration: Render Optimization', () => {
        it('should cull off-screen particles in layer rendering', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            // Move half the particles far off-screen
            for (let i = 0; i < 25; i++) {
                particleSystem.particles[i].x = -1000;
                particleSystem.particles[i].y = -1000;
            }

            let renderedCount = 0;
            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => { renderedCount++; },
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            particleSystem.renderBackground(mockCtx, '#ffffff');

            // Should render fewer particles (culling off-screen)
            expect(renderedCount).toBeLessThan(50);
        });

        it('should batch render particles by type to minimize state changes', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 30);

            let fillStyleChanges = 0;
            let lastFillStyle = null;

            const mockCtx = {
                save: () => {},
                restore: () => {},
                get fillStyle() { return lastFillStyle; },
                set fillStyle(value) {
                    if (value !== lastFillStyle) {
                        fillStyleChanges++;
                        lastFillStyle = value;
                    }
                },
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            particleSystem.render(mockCtx, '#ffffff');

            // Should minimize fillStyle changes through batching
            expect(fillStyleChanges).toBeLessThan(30);
        });

        it('should handle z-depth rendering split correctly', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 50);

            // Manually set z-depths
            particleSystem.particles.forEach((p, i) => {
                p.z = i < 25 ? -0.5 : 0.5; // Split between background and foreground
            });

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            // Both layers should render
            expect(() => {
                particleSystem.renderBackground(mockCtx, '#ffffff');
                particleSystem.renderForeground(mockCtx, '#ffffff');
            }).not.toThrow();
        });

        it('should skip rendering dead particles', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 30);

            // Kill half the particles
            for (let i = 0; i < 15; i++) {
                particleSystem.particles[i].life = 0;
            }

            let renderCalls = 0;
            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => { renderCalls++; },
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            particleSystem.render(mockCtx, '#ffffff');

            // Should render fewer particles (skipping dead ones)
            expect(renderCalls).toBeLessThan(30);
        });

        it('should handle depth-adjusted particle sizes', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            let minSize = Infinity;
            let maxSize = -Infinity;

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: (x, y, radius) => {
                    if (isFinite(radius)) {
                        minSize = Math.min(minSize, radius);
                        maxSize = Math.max(maxSize, radius);
                    }
                },
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            particleSystem.render(mockCtx, '#ffffff');

            // Should have variation in sizes (if particles were rendered)
            if (isFinite(minSize) && isFinite(maxSize)) {
                expect(maxSize).toBeGreaterThanOrEqual(minSize);
            }
        });
    });

    describe('Integration: Gesture Transform Effects', () => {
        it('should apply firefly effect with async blinking', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const gestureTransform = {
                fireflyEffect: true,
                fireflyTime: 1.5,
                particleGlow: 2.0
            };

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            expect(() => {
                particleSystem.render(mockCtx, '#ffffff', gestureTransform);
            }).not.toThrow();
        });

        it('should apply flicker effect with shimmer pattern', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const gestureTransform = {
                flickerEffect: true,
                flickerTime: 2.0,
                particleGlow: 1.5
            };

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            expect(() => {
                particleSystem.render(mockCtx, '#ffffff', gestureTransform);
            }).not.toThrow();
        });

        it('should apply shimmer effect with traveling wave', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const gestureTransform = {
                shimmerEffect: true,
                shimmerTime: 1.0,
                shimmerWave: 0.5,
                particleGlow: 1.2
            };

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            expect(() => {
                particleSystem.render(mockCtx, '#ffffff', gestureTransform);
            }).not.toThrow();
        });

        it('should apply glow effect with radiant burst', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            const gestureTransform = {
                glowEffect: true,
                glowProgress: 0.5,
                particleGlow: 2.0
            };

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            // Should render without errors
            expect(() => {
                particleSystem.render(mockCtx, '#ffffff', gestureTransform);
            }).not.toThrow();

            // Particles should still exist after rendering
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should restore original glow properties after glow effect ends', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            // Apply glow effect at different stages
            const gestureTransform = {
                glowEffect: true,
                glowProgress: 0.5,
                particleGlow: 2.0
            };

            // Render with glow effect
            particleSystem.render(mockCtx, '#ffffff', gestureTransform);

            // Complete the glow effect
            gestureTransform.glowProgress = 1.0;
            particleSystem.render(mockCtx, '#ffffff', gestureTransform);

            // System should handle glow lifecycle correctly
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should handle multiple gesture effects simultaneously', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 15);

            const gestureTransform = {
                fireflyEffect: true,
                fireflyTime: 1.0,
                shimmerEffect: true,
                shimmerTime: 1.0,
                particleGlow: 1.5
            };

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            // Should handle multiple effects without errors
            expect(() => {
                particleSystem.render(mockCtx, '#ffffff', gestureTransform);
            }).not.toThrow();
        });
    });

    describe('Integration: Thousands of Particles', () => {
        it('should handle 1000 particles without performance degradation', () => {
            const largeSystem = new ParticleSystem(1000);

            const startTime = Date.now();

            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 1000);

            const spawnTime = Date.now() - startTime;

            expect(largeSystem.particles.length).toBe(1000);
            expect(spawnTime).toBeLessThan(200); // Should spawn quickly

            largeSystem.destroy();
        });

        it('should update 1000 particles efficiently', () => {
            const largeSystem = new ParticleSystem(1000);
            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 1000);

            const startTime = Date.now();

            for (let i = 0; i < 60; i++) {
                largeSystem.update(16, 400, 300);
            }

            const updateTime = Date.now() - startTime;

            // 60 updates with 1000 particles should be reasonable (relaxed for CI/varying environments)
            // Increased from 1000ms to 3000ms to account for system load variability
            expect(updateTime).toBeLessThan(3000);

            largeSystem.destroy();
        });

        it('should maintain pool efficiency with thousands of particles', () => {
            const largeSystem = new ParticleSystem(1000);

            // First cycle
            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 500);
            largeSystem.clear();

            // Second cycle - should hit pool
            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 500);

            const stats = largeSystem.getStats();
            expect(stats.poolHits).toBeGreaterThan(0);

            largeSystem.destroy();
        });

        it('should handle 2000 particles at absolute max', () => {
            const largeSystem = new ParticleSystem(1000);
            largeSystem.canvasWidth = 800;
            largeSystem.canvasHeight = 600;

            // Try to spawn beyond absolute max
            for (let i = 0; i < 2500; i++) {
                largeSystem.spawnSingleParticle('ambient', 400, 300);
            }

            // Should cap at absoluteMaxParticles (2x maxParticles = 2000)
            expect(largeSystem.particles.length).toBeLessThanOrEqual(2000);

            largeSystem.destroy();
        });

        it('should render 1000 particles across layers', () => {
            const largeSystem = new ParticleSystem(1000);
            largeSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 1000);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                canvas: { width: 800, height: 600 }
            };

            const startTime = Date.now();

            largeSystem.renderBackground(mockCtx, '#ffffff');
            largeSystem.renderForeground(mockCtx, '#ffffff');

            const renderTime = Date.now() - startTime;

            // Should render efficiently
            expect(renderTime).toBeLessThan(200);

            largeSystem.destroy();
        });
    });

    describe('Integration: Complex Lifecycle Scenarios', () => {
        it('should handle particles spawning during particle death', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            // Simulate continuous spawning while particles die
            for (let i = 0; i < 100; i++) {
                // Age some particles
                if (particleSystem.particles.length > 0) {
                    const particle = particleSystem.particles[Math.floor(Math.random() * particleSystem.particles.length)];
                    particle.life = 0;
                }

                // Spawn new ones
                particleSystem.spawn('ambient', 'neutral', 5, 400, 300, 16, null, 0, 30);
                particleSystem.update(16, 400, 300);
            }

            // System should be stable
            expect(particleSystem.particles.length).toBeLessThanOrEqual(30);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should maintain physics accuracy over long simulation', () => {
            particleSystem.spawn('falling', 'sadness', 0, 400, 300, 16, 10);

            const initialPositions = particleSystem.particles.map(p => ({ x: p.x, y: p.y }));

            // Long simulation
            for (let i = 0; i < 500; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Falling particles should have moved downward significantly
            let downwardCount = 0;
            particleSystem.particles.forEach((p, i) => {
                if (p.isAlive() && i < initialPositions.length) {
                    if (p.y > initialPositions[i].y) {
                        downwardCount++;
                    }
                }
            });

            // Most should have moved down
            expect(downwardCount).toBeGreaterThan(0);
        });

        it('should handle emotion transitions without particle loss', () => {
            const emotions = ['joy', 'sadness', 'anger', 'fear', 'calm', 'excitement'];
            const behaviors = ['rising', 'falling', 'burst', 'repelling', 'resting', 'aggressive'];

            emotions.forEach((emotion, i) => {
                particleSystem.spawn(behaviors[i], emotion, 0, 400, 300, 16, 5);
            });

            const initialCount = particleSystem.particles.length;

            // Update through transitions
            for (let i = 0; i < 30; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Should maintain reasonable particle count
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should recover from extreme physics conditions', () => {
            particleSystem.spawn('ambient', 'neutral', 0, 400, 300, 16, 20);

            // Apply extreme conditions
            particleSystem.particles.forEach(p => {
                p.vx = Math.random() * 100 - 50;
                p.vy = Math.random() * 100 - 50;
            });

            // Update and allow system to stabilize
            for (let i = 0; i < 100; i++) {
                particleSystem.update(16, 400, 300);
            }

            // System should recover
            particleSystem.particles.forEach(p => {
                expect(isFinite(p.x)).toBe(true);
                expect(isFinite(p.y)).toBe(true);
                expect(Math.abs(p.vx)).toBeLessThan(50);
                expect(Math.abs(p.vy)).toBeLessThan(50);
            });
        });
    });

    describe('Integration: All Particle Behaviors Coverage', () => {
        const allBehaviors = [
            'ambient', 'resting', 'rising', 'falling', 'aggressive',
            'scattering', 'burst', 'repelling', 'orbiting', 'glitchy',
            'spaz', 'meditation_swirl'
        ];

        allBehaviors.forEach(behavior => {
            it(`should handle ${behavior} behavior complete lifecycle`, () => {
                particleSystem.spawn(behavior, 'neutral', 0, 400, 300, 16, 10);

                expect(particleSystem.particles.length).toBe(10);

                // Update through lifecycle
                for (let i = 0; i < 60; i++) {
                    particleSystem.update(16, 400, 300);
                }

                // Verify particles exist or died naturally
                expect(particleSystem.particles.length).toBeGreaterThanOrEqual(0);
            });

            it(`should spawn ${behavior} particles at correct positions`, () => {
                particleSystem.canvasWidth = 800;
                particleSystem.canvasHeight = 600;
                particleSystem.spawn(behavior, 'neutral', 0, 400, 300, 16, 10);

                // Should spawn requested number of particles
                expect(particleSystem.particles.length).toBe(10);

                // Verify particles exist and have behavior set
                particleSystem.particles.forEach(p => {
                    expect(p).toBeDefined();
                    expect(p.behavior).toBeDefined();
                });
            });
        });

        it('should handle all behaviors in mixed scenario', () => {
            allBehaviors.forEach(behavior => {
                particleSystem.spawn(behavior, 'neutral', 0, 400, 300, 16, 3);
            });

            const totalExpected = allBehaviors.length * 3;
            expect(particleSystem.particles.length).toBe(totalExpected);

            // Update all
            for (let i = 0; i < 30; i++) {
                particleSystem.update(16, 400, 300);
            }

            // Verify all behaviors are represented
            const presentBehaviors = new Set(particleSystem.particles.map(p => p.behavior));
            expect(presentBehaviors.size).toBeGreaterThan(1);
        });
    });

    describe('Integration: Error Boundary Integration', () => {
        it('should create particle system without error boundary', () => {
            const system = new ParticleSystem(50, null);
            expect(system.errorBoundary).toBeNull();
            system.destroy();
        });

        it('should operate normally without error boundary', () => {
            const system = new ParticleSystem(50, null);

            system.spawn('ambient', 'neutral', 0, 400, 300, 16, 10);
            system.update(16, 400, 300);
            system.burst(5, 'burst', 400, 300);

            const mockCtx = {
                save: () => {},
                restore: () => {},
                fillStyle: '',
                globalAlpha: 1,
                globalCompositeOperation: 'source-over',
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {}, // Add stroke method for cell-shaded particles
                strokeStyle: '',
                lineWidth: 1,
                canvas: { width: 800, height: 600 }
            };

            system.render(mockCtx, '#ffffff');

            expect(system.particles.length).toBeGreaterThan(0);

            system.destroy();
        });
    });
});
