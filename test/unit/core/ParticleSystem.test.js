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
});
