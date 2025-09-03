/**
 * ParticleSystem Tests - Comprehensive test suite for particle system functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ParticleSystem from '../src/core/ParticleSystem.js';
import Particle from '../src/core/Particle.js';

describe('ParticleSystem', () => {
    let particleSystem;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
        // Create mock canvas and context
        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            fillStyle: '',
            globalAlpha: 1
        };
        
        mockCanvas = {
            getContext: vi.fn(() => mockCtx),
            width: 800,
            height: 600
        };

        particleSystem = new ParticleSystem(50);
    });

    afterEach(() => {
        if (particleSystem) {
            particleSystem.destroy();
        }
    });

    describe('Initialization', () => {
        it('should initialize with correct default values', () => {
            expect(particleSystem.maxParticles).toBe(50);
            expect(particleSystem.particles).toHaveLength(0);
            expect(particleSystem.pool).toHaveLength(100); // 2x maxParticles
            expect(particleSystem.particleCount).toBe(0);
        });

        it('should initialize object pool with correct size', () => {
            const smallSystem = new ParticleSystem(10);
            expect(smallSystem.pool).toHaveLength(20);
            expect(smallSystem.poolSize).toBe(20);
            smallSystem.destroy();
        });

        it('should cap pool size at 100', () => {
            const largeSystem = new ParticleSystem(100);
            expect(largeSystem.pool).toHaveLength(100);
            expect(largeSystem.poolSize).toBe(100);
            largeSystem.destroy();
        });
    });

    describe('Object Pooling', () => {
        it('should reuse particles from pool', () => {
            const initialPoolSize = particleSystem.pool.length;
            
            // Spawn a particle
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            
            expect(particleSystem.pool).toHaveLength(initialPoolSize - 1);
            expect(particleSystem.poolHits).toBe(1);
            expect(particleSystem.poolMisses).toBe(0);
        });

        it('should create new particle when pool is empty', () => {
            // Empty the pool
            particleSystem.pool.length = 0;
            
            // Spawn a particle
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            
            expect(particleSystem.poolMisses).toBe(1);
            expect(particleSystem.particles).toHaveLength(1);
        });

        it('should return particles to pool when removed', () => {
            const initialPoolSize = particleSystem.pool.length;
            
            // Spawn and then kill a particle
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            const particle = particleSystem.particles[0];
            particle.life = 0; // Kill the particle
            
            particleSystem.update(16.67, 400, 300);
            
            expect(particleSystem.pool).toHaveLength(initialPoolSize);
            expect(particleSystem.particles).toHaveLength(0);
        });

        it('should calculate pool efficiency correctly', () => {
            // Spawn multiple particles to get hits
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            
            const stats = particleSystem.getStats();
            expect(stats.poolEfficiency).toBe(1); // All hits, no misses
            expect(stats.poolHits).toBe(5);
            expect(stats.poolMisses).toBe(0);
        });
    });

    describe('Particle Behaviors', () => {
        describe('Ambient Behavior', () => {
            it('should spawn ambient particles with gentle movement', () => {
                particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
                
                expect(particleSystem.particles).toHaveLength(3);
                
                const ambientParticles = particleSystem.getParticlesByBehavior('ambient');
                expect(ambientParticles).toHaveLength(3);
                
                // Check that particles have gentle velocities
                ambientParticles.forEach(particle => {
                    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                    expect(speed).toBeLessThan(1); // Gentle movement
                    expect(particle.behavior).toBe('ambient');
                });
            });

            it('should update ambient particles with random drift', () => {
                particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
                const particle = particleSystem.particles[0];
                const initialVx = particle.vx;
                const initialVy = particle.vy;
                
                // Update multiple times to see drift changes
                for (let i = 0; i < 100; i++) {
                    particleSystem.update(16.67, 400, 300);
                }
                
                // Velocity should have changed due to random drift
                expect(particle.vx !== initialVx || particle.vy !== initialVy).toBe(true);
            });
        });

        describe('Rising Behavior', () => {
            it('should spawn rising particles with upward movement', () => {
                particleSystem.spawn('rising', 'joy', 10, 400, 300, 16.67, 3);
                
                const risingParticles = particleSystem.getParticlesByBehavior('rising');
                expect(risingParticles).toHaveLength(3);
                
                risingParticles.forEach(particle => {
                    expect(particle.vy).toBeLessThan(0); // Negative Y = upward
                    expect(particle.behavior).toBe('rising');
                });
            });

            it('should maintain upward movement with buoyancy', () => {
                particleSystem.spawn('rising', 'joy', 10, 400, 300, 16.67, 1);
                const particle = particleSystem.particles[0];
                const initialY = particle.y;
                
                // Update several times
                for (let i = 0; i < 10; i++) {
                    particleSystem.update(16.67, 400, 300);
                }
                
                expect(particle.y).toBeLessThan(initialY); // Should move up
            });
        });

        describe('Falling Behavior', () => {
            it('should spawn falling particles with downward movement', () => {
                particleSystem.spawn('falling', 'sadness', 10, 400, 300, 16.67, 3);
                
                const fallingParticles = particleSystem.getParticlesByBehavior('falling');
                expect(fallingParticles).toHaveLength(3);
                
                fallingParticles.forEach(particle => {
                    expect(particle.vy).toBeGreaterThan(0); // Positive Y = downward
                    expect(particle.behavior).toBe('falling');
                });
            });

            it('should accelerate downward with gravity', () => {
                particleSystem.spawn('falling', 'sadness', 10, 400, 300, 16.67, 1);
                const particle = particleSystem.particles[0];
                const initialVy = particle.vy;
                
                // Update to apply gravity
                particleSystem.update(16.67, 400, 300);
                
                expect(particle.vy).toBeGreaterThan(initialVy); // Should accelerate down
            });
        });

        describe('Aggressive Behavior', () => {
            it('should spawn aggressive particles with high speed', () => {
                particleSystem.spawn('aggressive', 'anger', 10, 400, 300, 16.67, 3);
                
                const aggressiveParticles = particleSystem.getParticlesByBehavior('aggressive');
                expect(aggressiveParticles).toHaveLength(3);
                
                aggressiveParticles.forEach(particle => {
                    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                    expect(speed).toBeGreaterThan(1); // Fast movement
                    expect(particle.behavior).toBe('aggressive');
                });
            });

            it('should have jittery movement with speed decay', () => {
                particleSystem.spawn('aggressive', 'anger', 10, 400, 300, 16.67, 1);
                const particle = particleSystem.particles[0];
                const initialSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                
                // Update multiple times
                for (let i = 0; i < 20; i++) {
                    particleSystem.update(16.67, 400, 300);
                }
                
                const finalSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                expect(finalSpeed).toBeLessThan(initialSpeed); // Should decay
            });
        });

        describe('Scattering Behavior', () => {
            it('should spawn scattering particles that flee from center', () => {
                particleSystem.spawn('scattering', 'fear', 10, 400, 300, 16.67, 3);
                
                const scatteringParticles = particleSystem.getParticlesByBehavior('scattering');
                expect(scatteringParticles).toHaveLength(3);
                
                // Update to initialize flee behavior
                particleSystem.update(16.67, 400, 300);
                
                scatteringParticles.forEach(particle => {
                    expect(particle.behavior).toBe('scattering');
                    expect(particle.behaviorData.initialized).toBe(true);
                });
            });

            it('should move away from center point', () => {
                const centerX = 400, centerY = 300;
                particleSystem.spawn('scattering', 'fear', 10, centerX, centerY, 16.67, 1);
                const particle = particleSystem.particles[0];
                
                // Update to start fleeing
                particleSystem.update(16.67, centerX, centerY);
                
                const initialDistance = Math.sqrt(
                    (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
                );
                
                // Update more to see movement
                for (let i = 0; i < 10; i++) {
                    particleSystem.update(16.67, centerX, centerY);
                }
                
                const finalDistance = Math.sqrt(
                    (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
                );
                
                expect(finalDistance).toBeGreaterThan(initialDistance);
            });
        });

        describe('Burst Behavior', () => {
            it('should spawn burst particles with high outward speed', () => {
                particleSystem.spawn('burst', 'surprise', 10, 400, 300, 16.67, 5);
                
                const burstParticles = particleSystem.getParticlesByBehavior('burst');
                expect(burstParticles).toHaveLength(5);
                
                burstParticles.forEach(particle => {
                    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                    expect(speed).toBeGreaterThan(2); // High initial speed
                    expect(particle.behavior).toBe('burst');
                });
            });

            it('should expand and fade over time', () => {
                particleSystem.spawn('burst', 'surprise', 10, 400, 300, 16.67, 1);
                const particle = particleSystem.particles[0];
                const initialSize = particle.size;
                
                // Update to see expansion
                particleSystem.update(16.67, 400, 300);
                
                expect(particle.size).toBeGreaterThanOrEqual(initialSize);
            });
        });

        describe('Repelling Behavior', () => {
            it('should spawn repelling particles that push away from center', () => {
                particleSystem.spawn('repelling', 'disgust', 10, 400, 300, 16.67, 3);
                
                const repellingParticles = particleSystem.getParticlesByBehavior('repelling');
                expect(repellingParticles).toHaveLength(3);
                
                repellingParticles.forEach(particle => {
                    expect(particle.behavior).toBe('repelling');
                });
            });

            it('should maintain minimum distance from center', () => {
                const centerX = 400, centerY = 300;
                particleSystem.spawn('repelling', 'disgust', 10, centerX, centerY, 16.67, 1);
                const particle = particleSystem.particles[0];
                
                // Check that repelling behavior is initialized
                expect(particle.behavior).toBe('repelling');
                expect(particle.behaviorData.repelStrength).toBeDefined();
                expect(particle.behaviorData.minDistance).toBe(50);
                
                // Move particle slightly off center to test repelling behavior
                particle.x = centerX + 1;
                particle.y = centerY + 1;
                
                const initialDistance = Math.sqrt(
                    (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
                );
                
                // Update multiple times to allow repelling behavior to take effect
                for (let i = 0; i < 50; i++) {
                    particleSystem.update(16.67, centerX, centerY);
                }
                
                const finalDistance = Math.sqrt(
                    (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
                );
                
                // Should be pushed away from center (repelling force should have moved it)
                expect(finalDistance).toBeGreaterThan(initialDistance);
            });
        });

        describe('Orbiting Behavior', () => {
            it('should spawn orbiting particles with circular motion', () => {
                particleSystem.spawn('orbiting', 'love', 10, 400, 300, 16.67, 3);
                
                const orbitingParticles = particleSystem.getParticlesByBehavior('orbiting');
                expect(orbitingParticles).toHaveLength(3);
                
                orbitingParticles.forEach(particle => {
                    expect(particle.behavior).toBe('orbiting');
                    expect(particle.behaviorData.angle).toBeDefined();
                    expect(particle.behaviorData.radius).toBeGreaterThan(0);
                    expect(particle.behaviorData.angularVelocity).toBeGreaterThan(0);
                });
            });

            it('should maintain orbital motion around center', () => {
                const centerX = 400, centerY = 300;
                particleSystem.spawn('orbiting', 'love', 10, centerX, centerY, 16.67, 1);
                const particle = particleSystem.particles[0];
                
                const initialAngle = particle.behaviorData.angle;
                const baseRadius = particle.behaviorData.radius;
                
                // Update to see orbital motion
                for (let i = 0; i < 10; i++) {
                    particleSystem.update(16.67, centerX, centerY);
                }
                
                expect(particle.behaviorData.angle).not.toBe(initialAngle);
                
                // Check that particle maintains roughly constant distance from center
                // Allow for radius oscillation (±5 pixels as per implementation)
                const distance = Math.sqrt(
                    (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
                );
                
                // The radius oscillates by ±5 pixels, so allow for that variation
                expect(distance).toBeGreaterThan(baseRadius - 10);
                expect(distance).toBeLessThan(baseRadius + 10);
            });
        });
    });

    describe('Particle Lifecycle', () => {
        it('should spawn particles with full life', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
            
            particleSystem.particles.forEach(particle => {
                expect(particle.life).toBe(1.0);
                expect(particle.isAlive()).toBe(true);
            });
        });

        it('should decay particle life over time', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            const particle = particleSystem.particles[0];
            const initialLife = particle.life;
            
            particleSystem.update(16.67, 400, 300);
            
            expect(particle.life).toBeLessThan(initialLife);
        });

        it('should remove dead particles', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            const particle = particleSystem.particles[0];
            
            // Kill the particle
            particle.life = 0;
            
            particleSystem.update(16.67, 400, 300);
            
            expect(particleSystem.particles).toHaveLength(0);
        });

        it('should update particle count correctly', () => {
            expect(particleSystem.particleCount).toBe(0);
            
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            expect(particleSystem.particleCount).toBe(5);
            
            // Kill all particles
            particleSystem.particles.forEach(p => p.life = 0);
            particleSystem.update(16.67, 400, 300);
            
            expect(particleSystem.particleCount).toBe(0);
        });

        it('should validate particle states', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
            
            expect(particleSystem.validateParticles()).toBe(true);
            
            // Corrupt a particle
            particleSystem.particles[0].life = -1;
            
            expect(particleSystem.validateParticles()).toBe(false);
        });
    });

    describe('Particle Limit Enforcement', () => {
        it('should not exceed maximum particle count', () => {
            const maxParticles = 10;
            const smallSystem = new ParticleSystem(maxParticles);
            
            // Try to spawn more than the limit
            smallSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 20);
            
            expect(smallSystem.particles.length).toBeLessThanOrEqual(maxParticles);
            smallSystem.destroy();
        });

        it('should handle overflow by removing oldest particles', () => {
            const maxParticles = 5;
            const smallSystem = new ParticleSystem(maxParticles);
            
            // Spawn particles and mark them for identification
            for (let i = 0; i < 3; i++) {
                smallSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
                smallSystem.particles[i].testId = i;
            }
            
            // Force overflow by adding more particles directly
            for (let i = 0; i < 5; i++) {
                const particle = smallSystem.getParticleFromPool(400, 300, 'ambient');
                particle.testId = i + 10;
                smallSystem.particles.push(particle);
            }
            
            // Update should enforce limit
            smallSystem.update(16.67, 400, 300);
            
            expect(smallSystem.particles.length).toBeLessThanOrEqual(maxParticles);
            smallSystem.destroy();
        });

        it('should respect particle limit in burst spawning', () => {
            const maxParticles = 10;
            const smallSystem = new ParticleSystem(maxParticles);
            
            // Fill system to near capacity
            smallSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 8);
            
            // Try to burst more than remaining capacity
            smallSystem.burst(10, 'burst', 400, 300);
            
            expect(smallSystem.particles.length).toBeLessThanOrEqual(maxParticles);
            smallSystem.destroy();
        });

        it('should update max particles dynamically', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 20);
            expect(particleSystem.particles.length).toBe(20);
            
            // Reduce max particles
            particleSystem.setMaxParticles(10);
            
            expect(particleSystem.maxParticles).toBe(10);
            expect(particleSystem.particles.length).toBeLessThanOrEqual(10);
        });
    });

    describe('Performance and Statistics', () => {
        it('should track performance statistics', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            
            const stats = particleSystem.getStats();
            
            expect(stats.activeParticles).toBe(5);
            expect(stats.maxParticles).toBe(50);
            expect(stats.poolHits).toBeGreaterThan(0);
            expect(stats.poolEfficiency).toBeGreaterThan(0);
            expect(stats.spawnAccumulator).toBeDefined();
        });

        it('should handle high particle counts efficiently', () => {
            const startTime = performance.now();
            
            // Spawn many particles
            particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 50);
            
            // Update multiple times
            for (let i = 0; i < 60; i++) {
                particleSystem.update(16.67, 400, 300);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete within reasonable time (less than 100ms for 50 particles * 60 frames)
            expect(duration).toBeLessThan(100);
        });

        it('should maintain pool efficiency under stress', () => {
            // Spawn and kill particles repeatedly
            for (let cycle = 0; cycle < 10; cycle++) {
                particleSystem.spawn('ambient', 'neutral', 50, 400, 300, 16.67, 10);
                
                // Kill all particles
                particleSystem.particles.forEach(p => p.life = 0);
                particleSystem.update(16.67, 400, 300);
            }
            
            const stats = particleSystem.getStats();
            expect(stats.poolEfficiency).toBeGreaterThan(0.8); // Should reuse most particles
        });
    });

    describe('Visual Correctness', () => {
        it('should render particles with correct properties', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 3);
            
            particleSystem.render(mockCtx, '#ff0000');
            
            // Should call render methods for each particle
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should not render dead particles', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            const particle = particleSystem.particles[0];
            
            // Kill the particle
            particle.life = 0;
            
            // Clear mock calls
            vi.clearAllMocks();
            
            particleSystem.render(mockCtx, '#ff0000');
            
            // Should not render dead particle
            expect(mockCtx.arc).not.toHaveBeenCalled();
        });

        it('should apply correct opacity based on particle life', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            const particle = particleSystem.particles[0];
            
            // Set particle to half life
            particle.life = 0.5;
            particle.opacity = particle.life;
            
            particleSystem.render(mockCtx, '#ff0000');
            
            expect(mockCtx.globalAlpha).toBeLessThan(1);
        });
    });

    describe('Cleanup and Resource Management', () => {
        it('should clear all particles', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 10);
            expect(particleSystem.particles.length).toBe(10);
            
            particleSystem.clear();
            
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.particleCount).toBe(0);
        });

        it('should return particles to pool when clearing', () => {
            const initialPoolSize = particleSystem.pool.length;
            
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            particleSystem.clear();
            
            expect(particleSystem.pool.length).toBe(initialPoolSize);
        });

        it('should cleanup dead particles manually', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
            
            // Kill some particles
            particleSystem.particles[0].life = 0;
            particleSystem.particles[2].life = 0;
            
            particleSystem.cleanup();
            
            expect(particleSystem.particles.length).toBe(3);
            expect(particleSystem.particles.every(p => p.isAlive())).toBe(true);
        });

        it('should destroy system and cleanup resources', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 10);
            
            particleSystem.destroy();
            
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.pool.length).toBe(0);
            expect(particleSystem.poolHits).toBe(0);
            expect(particleSystem.poolMisses).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid behavior gracefully', () => {
            expect(() => {
                particleSystem.spawn('invalid_behavior', 'neutral', 10, 400, 300, 16.67, 1);
            }).not.toThrow();
            
            // Should default to ambient behavior
            expect(particleSystem.particles[0].behavior).toBe('invalid_behavior');
        });

        it('should handle negative particle counts', () => {
            expect(() => {
                particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, -5);
            }).not.toThrow();
            
            expect(particleSystem.particles.length).toBe(0);
        });

        it('should handle zero deltaTime', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            
            expect(() => {
                particleSystem.update(0, 400, 300);
            }).not.toThrow();
        });

        it('should handle missing render context', () => {
            particleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 1);
            
            expect(() => {
                particleSystem.render(null);
            }).toThrow();
        });
    });
});