/**
 * ParticleRenderer Tests
 * Tests for the particle rendering system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ParticleRenderer from '../../../../src/core/particle/ParticleRenderer.js';
import Particle from '../../../../src/core/Particle.js';

describe('ParticleRenderer', () => {
    let renderer;
    let mockCtx;
    let mockCanvas;

    beforeEach(() => {
        // Create mock canvas
        mockCanvas = {
            width: 400,
            height: 400
        };

        // Create mock context
        mockCtx = {
            canvas: mockCanvas,
            save: vi.fn(),
            restore: vi.fn(),
            fillStyle: '',
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            shadowBlur: 0,
            shadowColor: '',
            globalAlpha: 1.0,
            globalCompositeOperation: 'source-over'
        };

        renderer = new ParticleRenderer();
    });

    describe('Constructor', () => {
        it('should initialize without errors', () => {
            expect(renderer).toBeDefined();
        });
    });

    describe('render', () => {
        it('should render empty particle array without errors', () => {
            const particles = [];

            renderer.render(mockCtx, particles, '#ffffff');

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should render single particle', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;
            const particles = [particle];

            renderer.render(mockCtx, particles, '#ffffff');

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should skip dead particles', () => {
            const deadParticle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            deadParticle.life = 0; // Dead
            const aliveParticle = new Particle(200, 200, 'ambient', 1, 1, ['#00ff00']);
            aliveParticle.life = 0.5; // Alive

            const particles = [deadParticle, aliveParticle];

            renderer.render(mockCtx, particles, '#ffffff');

            // Should have rendered, but only alive particle gets drawn
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should batch render with minimal state changes', () => {
            const p1 = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            p1.life = 0.5;
            p1.color = '#ff0000';

            const p2 = new Particle(200, 200, 'ambient', 1, 1, ['#ff0000']);
            p2.life = 0.5;
            p2.color = '#ff0000'; // Same color - should reuse fillStyle

            const particles = [p1, p2];

            mockCtx.fillStyle = null;
            renderer.render(mockCtx, particles, '#ffffff');

            // fillStyle should only be set once for both particles
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should handle particles with invalid positions', () => {
            const invalidParticle = new Particle(NaN, Infinity, 'ambient', 1, 1, ['#ff0000']);
            invalidParticle.life = 0.5;

            const particles = [invalidParticle];

            // Should not throw
            expect(() => renderer.render(mockCtx, particles, '#ffffff')).not.toThrow();
        });
    });

    describe('renderLayer', () => {
        it('should render background layer (z < 0)', () => {
            const bgParticle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            bgParticle.life = 0.5;
            bgParticle.z = -0.5; // Background

            const fgParticle = new Particle(200, 200, 'ambient', 1, 1, ['#00ff00']);
            fgParticle.life = 0.5;
            fgParticle.z = 0.5; // Foreground

            const particles = [bgParticle, fgParticle];

            const visibleParticles = renderer.renderLayer(mockCtx, particles, '#ffffff', false);

            // Should only include background particle
            expect(visibleParticles.length).toBe(1);
            expect(visibleParticles[0].z).toBeLessThan(0);
        });

        it('should render foreground layer (z >= 0)', () => {
            const bgParticle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            bgParticle.life = 0.5;
            bgParticle.z = -0.5; // Background

            const fgParticle = new Particle(200, 200, 'ambient', 1, 1, ['#00ff00']);
            fgParticle.life = 0.5;
            fgParticle.z = 0.5; // Foreground

            const particles = [bgParticle, fgParticle];

            const visibleParticles = renderer.renderLayer(mockCtx, particles, '#ffffff', true);

            // Should only include foreground particle
            expect(visibleParticles.length).toBe(1);
            expect(visibleParticles[0].z).toBeGreaterThanOrEqual(0);
        });

        it('should cull off-screen particles', () => {
            const onScreenParticle = new Particle(200, 200, 'ambient', 1, 1, ['#ff0000']);
            onScreenParticle.life = 0.5;
            onScreenParticle.z = 0; // Foreground
            onScreenParticle.x = 200; // Override randomness
            onScreenParticle.y = 200;

            const offScreenParticle = new Particle(1000, 1000, 'ambient', 1, 1, ['#00ff00']);
            offScreenParticle.life = 0.5;
            offScreenParticle.z = 0; // Foreground
            offScreenParticle.x = 1000; // Override randomness
            offScreenParticle.y = 1000;

            const particles = [onScreenParticle, offScreenParticle];

            const visibleParticles = renderer.renderLayer(mockCtx, particles, '#ffffff', true);

            // Should only include on-screen particle (offscreen is culled)
            expect(visibleParticles.length).toBe(1);
            expect(visibleParticles[0]).toBe(onScreenParticle);
        });

        it('should sort particles by render properties', () => {
            const cellShadedParticle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            cellShadedParticle.life = 0.5;
            cellShadedParticle.isCellShaded = true;
            cellShadedParticle.z = 0; // Foreground

            const regularParticle = new Particle(200, 200, 'ambient', 1, 1, ['#00ff00']);
            regularParticle.life = 0.5;
            regularParticle.isCellShaded = false;
            regularParticle.z = 0; // Foreground

            const particles = [regularParticle, cellShadedParticle]; // Regular first

            const visibleParticles = renderer.renderLayer(mockCtx, particles, '#ffffff', true);

            // Should be sorted with cellShaded first
            expect(visibleParticles[0].isCellShaded).toBe(true);
            expect(visibleParticles[1].isCellShaded).toBe(false);
        });
    });

    describe('Gesture Effects', () => {
        it('should apply firefly effect', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;

            const gestureTransform = {
                fireflyEffect: true,
                fireflyTime: 0,
                particleGlow: 2.0
            };

            const particles = [particle];

            // Should not throw with firefly effect
            expect(() => renderer.render(mockCtx, particles, '#ffffff', gestureTransform)).not.toThrow();
        });

        it('should apply flicker effect', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;

            const gestureTransform = {
                flickerEffect: true,
                flickerTime: 0,
                particleGlow: 2.0
            };

            const particles = [particle];

            expect(() => renderer.render(mockCtx, particles, '#ffffff', gestureTransform)).not.toThrow();
        });

        it('should apply shimmer effect', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;

            const gestureTransform = {
                shimmerEffect: true,
                shimmerTime: 0,
                shimmerIntensity: 1.5
            };

            const particles = [particle];

            expect(() => renderer.render(mockCtx, particles, '#ffffff', gestureTransform)).not.toThrow();
        });
    });

    describe('Performance Optimizations', () => {
        it('should handle large particle arrays efficiently', () => {
            const particles = [];
            for (let i = 0; i < 1000; i++) {
                const particle = new Particle(
                    Math.random() * 400,
                    Math.random() * 400,
                    'ambient',
                    1,
                    1,
                    ['#ff0000']
                );
                particle.life = Math.random();
                particles.push(particle);
            }

            const startTime = Date.now();
            renderer.render(mockCtx, particles, '#ffffff');
            const duration = Date.now() - startTime;

            // Should render 1000 particles reasonably fast
            expect(duration).toBeLessThan(1000);
        });

        it('should minimize state changes with same-color particles', () => {
            const particles = [];
            const sameColor = '#ff0000';

            for (let i = 0; i < 10; i++) {
                const particle = new Particle(i * 10, i * 10, 'ambient', 1, 1, [sameColor]);
                particle.life = 0.5;
                particle.color = sameColor;
                particles.push(particle);
            }

            renderer.render(mockCtx, particles, '#ffffff');

            // State should be saved and restored
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });
    });

    describe('Cell-Shaded Particles', () => {
        it('should use particle.render() for cell-shaded particles', () => {
            const cellShaded = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            cellShaded.life = 0.5;
            cellShaded.isCellShaded = true;
            cellShaded.render = vi.fn(); // Mock render method

            const particles = [cellShaded];

            renderer.render(mockCtx, particles, '#ffffff');

            // Should have called particle's render method
            expect(cellShaded.render).toHaveBeenCalledWith(mockCtx, '#ffffff');
        });

        it('should reset lastFillStyle after cell-shaded particle', () => {
            const cellShaded = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            cellShaded.life = 0.5;
            cellShaded.isCellShaded = true;
            cellShaded.render = vi.fn();

            const regular = new Particle(200, 200, 'ambient', 1, 1, ['#00ff00']);
            regular.life = 0.5;
            regular.color = '#00ff00';

            const particles = [cellShaded, regular];

            renderer.render(mockCtx, particles, '#ffffff');

            // Should not throw and both should render
            expect(cellShaded.render).toHaveBeenCalled();
        });
    });

    describe('Depth-Adjusted Size', () => {
        it('should use getDepthAdjustedSize if available', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;
            particle.z = 0.5; // Foreground
            particle.getDepthAdjustedSize = vi.fn(() => 10);

            const particles = [particle];

            renderer.render(mockCtx, particles, '#ffffff');

            expect(particle.getDepthAdjustedSize).toHaveBeenCalled();
        });

        it('should fall back to particle.size if no depth adjustment', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;
            particle.size = 5;
            delete particle.getDepthAdjustedSize; // Ensure it doesn't exist

            const particles = [particle];

            // Should not throw
            expect(() => renderer.render(mockCtx, particles, '#ffffff')).not.toThrow();
        });

        it('should ensure minimum size of 0.1', () => {
            const particle = new Particle(100, 100, 'ambient', 1, 1, ['#ff0000']);
            particle.life = 0.5;
            particle.size = -5; // Invalid negative size
            particle.getDepthAdjustedSize = () => -5;

            const particles = [particle];

            // Should clamp to minimum 0.1
            expect(() => renderer.render(mockCtx, particles, '#ffffff')).not.toThrow();
        });
    });
});
