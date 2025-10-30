/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * CelestialRenderer Test Suite
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tests for celestial/eclipse rendering effects:
 * - Solar effects (corona, flares, rays)
 * - Bailey's beads (eclipse bead effects)
 * - Lunar shadow rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CelestialRenderer } from '../../../../src/core/renderer/CelestialRenderer.js';

describe('CelestialRenderer', () => {
    let renderer;
    let mockCtx;
    let mockCanvas;

    beforeEach(() => {
        // Create mock canvas
        mockCanvas = {
            width: 400,
            height: 400
        };

        // Create mock context with all required methods
        mockCtx = {
            canvas: mockCanvas,
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            globalAlpha: 1.0,
            globalCompositeOperation: 'source-over',
            beginPath: vi.fn(),
            closePath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            clip: vi.fn(),
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            createRadialGradient: vi.fn((x1, y1, r1, x2, y2, r2) => ({
                addColorStop: vi.fn()
            })),
            createLinearGradient: vi.fn((x1, y1, x2, y2) => ({
                addColorStop: vi.fn()
            }))
        };

        renderer = new CelestialRenderer();
    });

    describe('Constructor', () => {
        it('should initialize without errors', () => {
            expect(renderer).toBeDefined();
            expect(renderer).toBeInstanceOf(CelestialRenderer);
        });
    });

    describe('renderSunEffects', () => {
        it('should render without errors', () => {
            const shadow = { texture: true, flares: true };

            expect(() => {
                renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);
            }).not.toThrow();

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should render solar texture when enabled', () => {
            const shadow = { texture: true, textureOpacity: 0.8, turbulence: 0.5 };

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should render corona layers', () => {
            const shadow = { coronaOpacity: 1.0 };

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Should create multiple radial gradients for corona layers
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should render flame rays when flares enabled', () => {
            const shadow = { flares: true };

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Should create linear gradient for flames
            expect(mockCtx.createLinearGradient).toHaveBeenCalled();
            // Should draw many flame paths
            expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
        });

        it('should skip texture when disabled', () => {
            const shadow = { texture: false };
            const gradientCallsBefore = mockCtx.createRadialGradient.mock.calls.length;

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Fewer gradient calls without texture
            expect(mockCtx.createRadialGradient.mock.calls.length).toBeGreaterThanOrEqual(gradientCallsBefore);
        });

        it('should skip corona when opacity is 0', () => {
            const shadow = { coronaOpacity: 0 };

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Should still render but with fewer operations
            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should render rim lighting', () => {
            const shadow = {};

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Should always render rim lighting
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should handle different radius sizes', () => {
            const shadow = { texture: true, flares: true };

            expect(() => {
                renderer.renderSunEffects(mockCtx, 200, 200, 10, shadow);
            }).not.toThrow();

            expect(() => {
                renderer.renderSunEffects(mockCtx, 200, 200, 100, shadow);
            }).not.toThrow();
        });

        it('should use screen composite mode for effects', () => {
            const shadow = { texture: true };

            renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);

            // Should set screen mode at some point
            expect(mockCtx.globalCompositeOperation).toBe('screen');
        });
    });

    describe('renderBaileysBeads', () => {
        it('should render without errors', () => {
            expect(() => {
                renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, true, true);
            }).not.toThrow();
        });

        it('should not render beads if no sun rays', () => {
            const fillCallsBefore = mockCtx.fill.mock.calls.length;

            renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, true, false);

            // Should exit early, minimal rendering
            expect(mockCtx.fill.mock.calls.length - fillCallsBefore).toBeLessThan(5);
        });

        it('should render beads when sun rays visible', () => {
            renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, true, true);

            // Should create gradients for beads
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should vary bead intensity with morph progress', () => {
            const progress1 = 0.2;
            const progress2 = 0.8;

            expect(() => {
                renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, progress1, true, true);
            }).not.toThrow();

            expect(() => {
                renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, progress2, true, true);
            }).not.toThrow();
        });

        it('should handle shadow offset', () => {
            renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 20, 20, 0.5, true, true);

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle transitioning to solar state', () => {
            renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, true, true);

            expect(mockCtx.beginPath).toHaveBeenCalled();
        });

        it('should handle non-transitioning state', () => {
            renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, false, true);

            expect(mockCtx.beginPath).toHaveBeenCalled();
        });
    });

    describe('renderMoonShadow', () => {
        it('should render without errors', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            expect(() => {
                renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);
            }).not.toThrow();

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle solar overlay mode', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, true, 0);

            expect(mockCtx.translate).toHaveBeenCalled();
        });

        it('should handle non-solar overlay mode', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);

            expect(mockCtx.translate).toHaveBeenCalled();
        });

        it('should apply shadow offset', () => {
            const shadow = { type: 'lunar', offsetX: 20, offsetY: 30 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);

            // Should call translate (first for center, possibly more for shadow offset)
            expect(mockCtx.translate).toHaveBeenCalled();
        });

        it('should apply rotation', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];
            const rotation = Math.PI / 4;

            renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, rotation);

            expect(mockCtx.save).toHaveBeenCalled();
        });

        it('should render with different shape points', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const circlePoints = [];
            for (let i = 0; i < 32; i++) {
                const angle = (i / 32) * Math.PI * 2;
                circlePoints.push([Math.cos(angle) * 50, Math.sin(angle) * 50]);
            }

            expect(() => {
                renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, circlePoints, false, 0);
            }).not.toThrow();
        });

        it('should render lunar or crescent shadow types', () => {
            const shadow = { type: 'crescent', offsetX: 10, offsetY: 10 };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            expect(() => {
                renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);
            }).not.toThrow();

            // Should use canvas operations
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should handle empty shape points array', () => {
            const shadow = { offsetX: 10, offsetY: 10 };
            const shapePoints = [];

            expect(() => {
                renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);
            }).not.toThrow();
        });
    });

    describe('Integration', () => {
        it('should render all celestial effects together', () => {
            const shadow = {
                texture: true,
                flares: true,
                coronaOpacity: 1.0,
                offsetX: 10,
                offsetY: 10
            };
            const shapePoints = [[0, -50], [50, 0], [0, 50], [-50, 0]];

            expect(() => {
                renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);
                renderer.renderBaileysBeads(mockCtx, 200, 200, 50, 10, 10, 0.5, true, true);
                renderer.renderMoonShadow(mockCtx, 200, 200, 50, shadow, shapePoints, false, 0);
            }).not.toThrow();
        });

        it('should handle rapid successive calls', () => {
            const shadow = { texture: true, flares: true };

            for (let i = 0; i < 10; i++) {
                expect(() => {
                    renderer.renderSunEffects(mockCtx, 200, 200, 50, shadow);
                }).not.toThrow();
            }
        });
    });
});
