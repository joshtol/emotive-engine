import { describe, bench, beforeEach } from 'vitest';

// Mock canvas for benchmarks
const createMockCanvas = () => ({
    width: 800,
    height: 600,
    getContext: () => ({
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillStyle: '',
        globalAlpha: 1,
        clearRect: () => {},
        createRadialGradient: () => ({
            addColorStop: () => {}
        })
    })
});

describe('ParticleSystem Benchmarks', () => {
    let ParticleSystem;
    let particleSystem;

    beforeEach(async () => {
        // Dynamic import to avoid module loading issues
        ({ ParticleSystem } = await import('../src/core/ParticleSystem.js'));

        particleSystem = new ParticleSystem({
            maxParticles: 500,
            canvas: createMockCanvas()
        });
    });

    bench('spawn single particle', () => {
        particleSystem.spawn(400, 300);
    });

    bench('spawn 10 particles', () => {
        for (let i = 0; i < 10; i++) {
            particleSystem.spawn(
                Math.random() * 800,
                Math.random() * 600
            );
        }
    });

    bench('spawn 50 particles', () => {
        for (let i = 0; i < 50; i++) {
            particleSystem.spawn(
                Math.random() * 800,
                Math.random() * 600
            );
        }
    });

    bench('update 100 particles (16.67ms frame)', () => {
        // Pre-spawn particles
        const ps = new ParticleSystem({
            maxParticles: 100,
            canvas: createMockCanvas()
        });

        for (let i = 0; i < 100; i++) {
            ps.spawn(Math.random() * 800, Math.random() * 600);
        }

        // Benchmark update
        ps.update(16.67);
    });

    bench('update 300 particles (16.67ms frame)', () => {
        const ps = new ParticleSystem({
            maxParticles: 300,
            canvas: createMockCanvas()
        });

        for (let i = 0; i < 300; i++) {
            ps.spawn(Math.random() * 800, Math.random() * 600);
        }

        ps.update(16.67);
    });

    bench('update 500 particles (16.67ms frame)', () => {
        const ps = new ParticleSystem({
            maxParticles: 500,
            canvas: createMockCanvas()
        });

        for (let i = 0; i < 500; i++) {
            ps.spawn(Math.random() * 800, Math.random() * 600);
        }

        ps.update(16.67);
    });

    bench('clear all particles', () => {
        // Pre-fill
        for (let i = 0; i < 200; i++) {
            particleSystem.spawn(Math.random() * 800, Math.random() * 600);
        }

        particleSystem.clearParticles();
    });
});

describe('ParticlePool Benchmarks', () => {
    let ParticlePool;
    let pool;

    beforeEach(async () => {
        ({ ParticlePool } = await import('../src/core/particle/ParticlePool.js'));
        pool = new ParticlePool(500);
    });

    bench('acquire particle', () => {
        pool.acquire();
    });

    bench('acquire and release 100 particles', () => {
        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(pool.acquire());
        }
        for (const p of particles) {
            pool.release(p);
        }
    });

    bench('pool churn (acquire/release cycle)', () => {
        for (let i = 0; i < 50; i++) {
            const p = pool.acquire();
            pool.release(p);
        }
    });
});
