/**
 * ParticleSpawner Tests
 * Tests for the particle spawning system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ParticleSpawner from '../../../../src/core/particle/ParticleSpawner.js';

describe('ParticleSpawner', () => {
    let spawner;
    const canvasWidth = 400;
    const canvasHeight = 400;
    const centerX = 200;
    const centerY = 200;

    beforeEach(() => {
        spawner = new ParticleSpawner();
    });

    describe('Constructor', () => {
        it('should initialize spawn accumulator to 0', () => {
            expect(spawner.spawnAccumulator).toBe(0);
        });
    });

    describe('getSpawnPosition', () => {
        it('should spawn ambient particles at glow edge', () => {
            const pos = spawner.getSpawnPosition('ambient', centerX, centerY, canvasWidth, canvasHeight);

            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
            expect(pos).toHaveProperty('angle');

            // Calculate expected radius (glow edge)
            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const expectedRadius = glowRadius * 0.9;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeCloseTo(expectedRadius, 0);
        });

        it('should spawn resting particles at glow edge', () => {
            const pos = spawner.getSpawnPosition('resting', centerX, centerY, canvasWidth, canvasHeight);

            expect(pos).toHaveProperty('angle');

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const expectedRadius = glowRadius * 0.9;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeCloseTo(expectedRadius, 0);
        });

        it('should spawn rising particles outside glow radius', () => {
            const pos = spawner.getSpawnPosition('rising', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const minSpawnRadius = glowRadius * 1.1;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeGreaterThanOrEqual(minSpawnRadius * 0.99); // Allow small rounding
        });

        it('should spawn falling particles at glow edge like ambient', () => {
            const pos = spawner.getSpawnPosition('falling', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            // Falling spawns at glowRadius * 0.9 (same as ambient - at glow edge)
            const expectedRadius = glowRadius * 0.9;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            // Allow small tolerance for floating point
            expect(distance).toBeCloseTo(expectedRadius, 1);
        });

        it('should spawn aggressive particles just outside glow', () => {
            const pos = spawner.getSpawnPosition('aggressive', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeGreaterThanOrEqual(glowRadius);
            expect(distance).toBeLessThanOrEqual(glowRadius + orbRadius);
        });

        it('should spawn scattering particles at center', () => {
            const pos = spawner.getSpawnPosition('scattering', centerX, centerY, canvasWidth, canvasHeight);

            expect(pos.x).toBe(centerX);
            expect(pos.y).toBe(centerY);
        });

        it('should spawn burst particles based on emotion', () => {
            // Default burst (at center)
            const pos = spawner.getSpawnPosition('burst', centerX, centerY, canvasWidth, canvasHeight, 'neutral');

            expect(pos.x).toBe(centerX);
            expect(pos.y).toBe(centerY);
        });

        it('should spawn suspicion burst particles further out', () => {
            const pos = spawner.getSpawnPosition('burst', centerX, centerY, canvasWidth, canvasHeight, 'suspicion');

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const expectedRadius = orbRadius * 1.5;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeCloseTo(expectedRadius, 0);
        });

        it('should spawn surprise burst particles just outside orb', () => {
            const pos = spawner.getSpawnPosition('burst', centerX, centerY, canvasWidth, canvasHeight, 'surprise');

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const expectedRadius = orbRadius * 1.2;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeCloseTo(expectedRadius, 0);
        });

        it('should spawn repelling particles at glow edge', () => {
            const pos = spawner.getSpawnPosition('repelling', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const expectedRadius = glowRadius * 0.9;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeCloseTo(expectedRadius, 0);
        });

        it('should spawn orbiting particles at orbital distance', () => {
            const pos = spawner.getSpawnPosition('orbiting', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const minOrbitRadius = glowRadius * 1.2;
            const maxOrbitRadius = glowRadius * 1.7;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeGreaterThanOrEqual(minOrbitRadius);
            expect(distance).toBeLessThanOrEqual(maxOrbitRadius);
        });

        it('should spawn glitchy particles at wide spread', () => {
            const pos = spawner.getSpawnPosition('glitchy', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const minGlitchRadius = glowRadius * 3;
            const maxGlitchRadius = glowRadius * 7;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeGreaterThanOrEqual(minGlitchRadius);
            expect(distance).toBeLessThanOrEqual(maxGlitchRadius);
        });

        it('should spawn spaz particles at very wide spread', () => {
            const pos = spawner.getSpawnPosition('spaz', centerX, centerY, canvasWidth, canvasHeight);

            const canvasSize = Math.min(canvasWidth, canvasHeight);
            const orbRadius = canvasSize / 12;
            const glowRadius = orbRadius * 2.5;
            const minSpazRadius = glowRadius * 2;
            const maxSpazRadius = glowRadius * 5;

            const distance = Math.sqrt(
                Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
            );

            expect(distance).toBeGreaterThanOrEqual(minSpazRadius);
            expect(distance).toBeLessThanOrEqual(maxSpazRadius);
        });

        it('should default to center for unknown behaviors', () => {
            const pos = spawner.getSpawnPosition('unknown_behavior', centerX, centerY, canvasWidth, canvasHeight);

            expect(pos.x).toBe(centerX);
            expect(pos.y).toBe(centerY);
        });
    });

    describe('clampToCanvas', () => {
        it('should clamp position within canvas boundaries', () => {
            const pos = spawner.clampToCanvas(500, 500, canvasWidth, canvasHeight);

            expect(pos.x).toBe(canvasWidth - 30); // Default margin is 30
            expect(pos.y).toBe(canvasHeight - 30);
        });

        it('should clamp negative positions to margin', () => {
            const pos = spawner.clampToCanvas(-10, -10, canvasWidth, canvasHeight);

            expect(pos.x).toBe(30);
            expect(pos.y).toBe(30);
        });

        it('should not modify positions already within bounds', () => {
            const pos = spawner.clampToCanvas(200, 200, canvasWidth, canvasHeight);

            expect(pos.x).toBe(200);
            expect(pos.y).toBe(200);
        });

        it('should respect custom margin', () => {
            const customMargin = 50;
            const pos = spawner.clampToCanvas(500, 500, canvasWidth, canvasHeight, customMargin);

            expect(pos.x).toBe(canvasWidth - customMargin);
            expect(pos.y).toBe(canvasHeight - customMargin);
        });
    });

    describe('calculateSpawnRate', () => {
        it('should calculate particles to spawn based on deltaTime', () => {
            const particleRate = 60; // 60 particles per second
            const deltaTime = 16.67; // ~60fps frame

            const count = spawner.calculateSpawnRate(particleRate, deltaTime);

            // At 60 particles/second and 16.67ms frame, spawns ~1 particle
            // Accumulator should be near 0 after spawning that particle
            expect(spawner.spawnAccumulator).toBeCloseTo(0, 0);
            expect(count).toBe(1);
        });

        it('should accumulate fractional particles across frames', () => {
            const particleRate = 30; // 30 particles per second
            const deltaTime = 16.67; // ~60fps

            // First frame - accumulates 0.5 particles
            let count = spawner.calculateSpawnRate(particleRate, deltaTime);
            expect(count).toBe(0);
            expect(spawner.spawnAccumulator).toBeCloseTo(0.5, 1);

            // Second frame - accumulates another 0.5, total 1.0
            count = spawner.calculateSpawnRate(particleRate, deltaTime);
            expect(count).toBe(1);
            expect(spawner.spawnAccumulator).toBeCloseTo(0, 1);
        });

        it('should cap accumulator to prevent spawn spikes', () => {
            const particleRate = 60;
            const hugeDeltaTime = 5000; // 5 seconds

            const count = spawner.calculateSpawnRate(particleRate, hugeDeltaTime);

            // Accumulator should be capped at 3.0
            expect(spawner.spawnAccumulator).toBe(0); // All spawned
            expect(count).toBe(3); // Max 3 particles in one frame
        });

        it('should cap deltaTime to prevent huge accumulation', () => {
            const particleRate = 60;
            const hugeDeltaTime = 1000; // 1 second

            spawner.calculateSpawnRate(particleRate, hugeDeltaTime);

            // Should cap deltaTime to 50ms max
            // 60 particles/sec * 0.05sec = 3 particles
            expect(spawner.spawnAccumulator).toBeLessThanOrEqual(3.0);
        });

        it('should handle zero particle rate', () => {
            const count = spawner.calculateSpawnRate(0, 16.67);

            expect(count).toBe(0);
            expect(spawner.spawnAccumulator).toBe(0);
        });

        it('should handle multiple particles in one frame with high rate', () => {
            const particleRate = 600; // Very high rate
            const deltaTime = 16.67;

            const count = spawner.calculateSpawnRate(particleRate, deltaTime);

            expect(count).toBeGreaterThan(1);
        });
    });

    describe('resetAccumulator', () => {
        it('should reset spawn accumulator to 0', () => {
            spawner.spawnAccumulator = 2.5;

            spawner.resetAccumulator();

            expect(spawner.spawnAccumulator).toBe(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very small canvas sizes', () => {
            const pos = spawner.getSpawnPosition('ambient', 50, 50, 100, 100);

            expect(pos.x).toBeGreaterThanOrEqual(0);
            expect(pos.y).toBeGreaterThanOrEqual(0);
            expect(pos.x).toBeLessThanOrEqual(100);
            expect(pos.y).toBeLessThanOrEqual(100);
        });

        it('should handle non-square canvases', () => {
            const pos = spawner.getSpawnPosition('ambient', 200, 100, 400, 200);

            expect(pos.x).toBeGreaterThanOrEqual(0);
            expect(pos.y).toBeGreaterThanOrEqual(0);
            expect(pos.x).toBeLessThanOrEqual(400);
            expect(pos.y).toBeLessThanOrEqual(200);
        });

        it('should handle offset mascot positions', () => {
            // Mascot offset from center
            const offsetX = 100;
            const offsetY = 300;

            const pos = spawner.getSpawnPosition('ambient', offsetX, offsetY, canvasWidth, canvasHeight);

            // Position should be relative to offset center
            expect(pos).toBeDefined();
        });
    });
});
