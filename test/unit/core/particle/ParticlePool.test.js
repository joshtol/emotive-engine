/**
 * ParticlePool Tests
 * Tests for the particle object pooling system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ParticlePool from '../../../../src/core/particle/ParticlePool.js';
import Particle from '../../../../src/core/Particle.js';

describe('ParticlePool', () => {
    let pool;
    const maxParticles = 50;

    beforeEach(() => {
        pool = new ParticlePool(maxParticles);
    });

    describe('Constructor', () => {
        it('should initialize with correct pool size', () => {
            expect(pool.poolSize).toBe(50);
        });

        it('should initialize with empty pool array', () => {
            expect(pool.pool).toBeInstanceOf(Array);
            expect(pool.pool).toHaveLength(0);
        });

        it('should initialize memory leak detection counters', () => {
            expect(pool.totalParticlesCreated).toBe(0);
            expect(pool.totalParticlesDestroyed).toBe(0);
        });

        it('should initialize performance tracking counters', () => {
            expect(pool.poolHits).toBe(0);
            expect(pool.poolMisses).toBe(0);
        });
    });

    describe('getParticle', () => {
        it('should create new particle when pool is empty', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');

            expect(particle).toBeInstanceOf(Particle);
            expect(pool.poolMisses).toBe(1);
            expect(pool.poolHits).toBe(0);
            expect(pool.totalParticlesCreated).toBe(1);
        });

        it('should reuse particle from pool when available', () => {
            // Create and return a particle to pool
            const particle1 = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            pool.returnParticle(particle1);

            expect(pool.pool).toHaveLength(1);

            // Get particle again - should reuse from pool
            const particle2 = pool.getParticle(150, 250, 'rising', 1, 1, null, 'joy');

            expect(particle2).toBe(particle1);
            expect(pool.poolHits).toBe(1);
            expect(pool.pool).toHaveLength(0);
        });

        it('should reset particle properties when reusing from pool', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, ['#ff0000'], 'neutral');
            particle.age = 1000; // Simulate aging

            pool.returnParticle(particle);

            const reusedParticle = pool.getParticle(150, 250, 'rising', 1, 1, ['#00ff00'], 'joy');

            // Particle should be reset (Particle.reset() is called)
            // Note: Particle.reset() adds randomness to x/y, so just verify it's been reused
            expect(reusedParticle).toBe(particle); // Same particle object reused
            expect(reusedParticle.behavior).toBe('rising');
            expect(reusedParticle.emotion).toBe('joy');
        });

        it('should apply gesture behavior if provided', () => {
            const gestureBehavior = 'doppler';
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral', gestureBehavior);

            expect(particle.gestureBehavior).toBe('doppler');
        });

        it('should set emotion on particle', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'joy');

            expect(particle.emotion).toBe('joy');
        });
    });

    describe('returnParticle', () => {
        it('should add particle back to pool', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');

            pool.returnParticle(particle);

            expect(pool.pool).toHaveLength(1);
            expect(pool.pool[0]).toBe(particle);
        });

        it('should clear gradient cache when returning particle', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            particle.cachedGradient = {}; // Simulate cached gradient
            particle.cachedGradientKey = 'key';

            pool.returnParticle(particle);

            expect(particle.cachedGradient).toBeNull();
            expect(particle.cachedGradientKey).toBeNull();
        });

        it('should clear behaviorData when returning particle', () => {
            const particle = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            particle.behaviorData = { someKey: 'someValue' };

            pool.returnParticle(particle);

            expect(particle.behaviorData).toBeDefined();
            expect(Object.keys(particle.behaviorData)).toHaveLength(0);
        });

        it('should not add to pool if pool is at max size', () => {
            const tinyPool = new ParticlePool(2); // Pool size of 2

            const p1 = tinyPool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            const p2 = tinyPool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            const p3 = tinyPool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');

            tinyPool.returnParticle(p1);
            tinyPool.returnParticle(p2);
            expect(tinyPool.pool).toHaveLength(2);

            tinyPool.returnParticle(p3); // Should not add
            expect(tinyPool.pool).toHaveLength(2);
        });

        it('should increment totalParticlesDestroyed when pool is full', () => {
            const tinyPool = new ParticlePool(1);

            const p1 = tinyPool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            const p2 = tinyPool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');

            tinyPool.returnParticle(p1);
            expect(tinyPool.totalParticlesDestroyed).toBe(0);

            tinyPool.returnParticle(p2); // Pool full, should count as destroyed
            expect(tinyPool.totalParticlesDestroyed).toBe(1);
        });
    });

    describe('refreshPool', () => {
        it('should remove excess particles from pool', () => {
            // Create a pool with many particles
            for (let i = 0; i < 60; i++) {
                const p = pool.getParticle(i, i, 'ambient', 1, 1, null, 'neutral');
                pool.returnParticle(p);
            }

            const beforeRefresh = pool.pool.length;
            pool.refreshPool();

            expect(pool.pool.length).toBeLessThanOrEqual(pool.poolSize);
            expect(pool.totalParticlesDestroyed).toBe(beforeRefresh - pool.pool.length);
        });

        it('should not remove particles if pool is under size', () => {
            // Create a pool with smaller size to test
            const smallPool = new ParticlePool(10);

            // Add just a few particles
            for (let i = 0; i < 5; i++) {
                const p = smallPool.getParticle(i, i, 'ambient', 1, 1, null, 'neutral');
                smallPool.returnParticle(p);
            }

            const lengthBefore = smallPool.pool.length;
            smallPool.refreshPool();

            expect(smallPool.pool).toHaveLength(lengthBefore);
        });
    });

    describe('getStats', () => {
        it('should return pool statistics', () => {
            pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral'); // Miss
            const p = pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral'); // Miss
            pool.returnParticle(p);
            pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral'); // Hit

            const stats = pool.getStats();

            expect(stats).toEqual({
                poolSize: pool.pool.length,
                poolHits: 1,
                poolMisses: 2,
                totalCreated: 2,
                totalDestroyed: 0
            });
        });
    });

    describe('Memory Leak Detection', () => {
        it('should track particle creation and destruction', () => {
            // Create multiple particles
            const particles = [];
            for (let i = 0; i < 10; i++) {
                particles.push(pool.getParticle(i, i, 'ambient', 1, 1, null, 'neutral'));
            }

            expect(pool.totalParticlesCreated).toBe(10);
            expect(pool.totalParticlesDestroyed).toBe(0);

            // Return half to pool
            for (let i = 0; i < 5; i++) {
                pool.returnParticle(particles[i]);
            }

            expect(pool.totalParticlesDestroyed).toBe(0); // Not destroyed, just pooled

            // Fill pool and overflow - pool size is limited to poolSize
            const tinyPool = new ParticlePool(2);
            const tinyParticles = [];
            for (let i = 0; i < 5; i++) {
                tinyParticles.push(tinyPool.getParticle(i, i, 'ambient', 1, 1, null, 'neutral'));
            }

            expect(tinyPool.totalParticlesCreated).toBe(5);

            // Return all 5 particles, but only 2 can fit in pool
            for (let i = 0; i < 5; i++) {
                tinyPool.returnParticle(tinyParticles[i]);
            }

            expect(tinyPool.totalParticlesDestroyed).toBe(3); // 3 couldn't fit in pool
        });
    });

    describe('clear', () => {
        it('should clear the pool', () => {
            // Add particles to pool
            for (let i = 0; i < 5; i++) {
                const p = pool.getParticle(i, i, 'ambient', 1, 1, null, 'neutral');
                pool.returnParticle(p);
            }

            expect(pool.pool.length).toBeGreaterThan(0);

            pool.clear();

            expect(pool.pool).toHaveLength(0);
        });

        it('should reset statistics when cleared', () => {
            pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');
            pool.getParticle(100, 200, 'ambient', 1, 1, null, 'neutral');

            pool.clear();

            expect(pool.poolHits).toBe(0);
            expect(pool.poolMisses).toBe(0);
            expect(pool.totalParticlesCreated).toBe(0);
            expect(pool.totalParticlesDestroyed).toBe(0);
        });
    });
});
