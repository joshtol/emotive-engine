/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ZenModeRenderer Test Suite
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tests for zen/meditation mode rendering effects:
 * - Lotus petal rendering with morphing
 * - Zen mode entry/exit animations
 * - Golden glow and radiance effects
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZenModeRenderer } from '../../../../src/core/renderer/ZenModeRenderer.js';

describe('ZenModeRenderer', () => {
    let renderer;
    let mockCtx;
    let mockCanvas;
    let mockState;
    let mockZenTransition;

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
            translate: vi.fn(),
            rotate: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            shadowBlur: 0,
            shadowColor: '',
            globalAlpha: 1.0,
            beginPath: vi.fn(),
            closePath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            createRadialGradient: vi.fn((x1, y1, r1, x2, y2, r2) => ({
                addColorStop: vi.fn()
            }))
        };

        // Mock state
        mockState = {
            shakeOffset: 0,
            driftY: 0
        };

        // Mock zen transition state
        mockZenTransition = {
            phase: 'in',
            lotusMorph: 1.0,
            petalSpread: 1.0,
            smileCurve: 1.0
        };

        renderer = new ZenModeRenderer();
    });

    describe('Constructor', () => {
        it('should initialize without errors', () => {
            expect(renderer).toBeDefined();
            expect(renderer).toBeInstanceOf(ZenModeRenderer);
        });
    });

    describe('renderZenCore', () => {
        it('should render without errors', () => {
            const scaleValue = v => v;

            expect(() => {
                renderer.renderZenCore(
                    mockCtx, 200, 200, 50, mockState, mockZenTransition,
                    null, scaleValue
                );
            }).not.toThrow();

            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        it('should apply shake offset when present', () => {
            const scaleValue = v => v;
            mockState.shakeOffset = 10;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should translate to adjusted position
            expect(mockCtx.translate).toHaveBeenCalled();
        });

        it('should apply drift Y when present', () => {
            const scaleValue = v => v;
            mockState.driftY = 15;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should translate to adjusted position
            expect(mockCtx.translate).toHaveBeenCalled();
        });

        it('should apply gesture rotation when present', () => {
            const scaleValue = v => v;
            const gestureTransform = { rotation: 45 };

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                gestureTransform, scaleValue
            );

            expect(mockCtx.rotate).toHaveBeenCalled();
        });

        it('should render lotus petals when morph > 0', () => {
            const scaleValue = v => v;
            mockZenTransition.lotusMorph = 0.8;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should draw bezier curves for petals
            expect(mockCtx.bezierCurveTo).toHaveBeenCalled();
        });

        it('should skip lotus rendering when morph is very small', () => {
            const scaleValue = v => v;
            mockZenTransition.lotusMorph = 0.05; // Below threshold

            const bezierCallsBefore = mockCtx.bezierCurveTo.mock.calls.length;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should have minimal or no bezier calls
            expect(mockCtx.bezierCurveTo.mock.calls.length - bezierCallsBefore).toBeLessThan(10);
        });

        it('should adjust glow intensity based on phase', () => {
            const scaleValue = v => v;

            // Test entering phase
            mockZenTransition.phase = 'entering';
            mockZenTransition.lotusMorph = 0.5;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should set shadow blur (dim during entering)
            expect(mockCtx.shadowBlur).toBeGreaterThan(0);
        });

        it('should use bright colors when fully in zen', () => {
            const scaleValue = v => v;
            mockZenTransition.phase = 'in';
            mockZenTransition.lotusMorph = 1.0;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should create radial gradient
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should use darker colors during transitions', () => {
            const scaleValue = v => v;
            mockZenTransition.phase = 'entering';
            mockZenTransition.lotusMorph = 0.5;

            renderer.renderZenCore(
                mockCtx, 200, 200, 50, mockState, mockZenTransition,
                null, scaleValue
            );

            // Should create gradient
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should handle different radius sizes', () => {
            const scaleValue = v => v;

            expect(() => {
                renderer.renderZenCore(
                    mockCtx, 200, 200, 25, mockState, mockZenTransition,
                    null, scaleValue
                );
            }).not.toThrow();

            expect(() => {
                renderer.renderZenCore(
                    mockCtx, 200, 200, 100, mockState, mockZenTransition,
                    null, scaleValue
                );
            }).not.toThrow();
        });
    });

    describe('Integration', () => {
        it('should render zen core with all features enabled', () => {
            const scaleValue = v => v;
            mockState.shakeOffset = 5;
            mockState.driftY = 3;
            mockZenTransition.phase = 'in';
            mockZenTransition.lotusMorph = 1.0;
            mockZenTransition.petalSpread = 1.0;
            mockZenTransition.smileCurve = 1.0;
            const gestureTransform = { rotation: 15 };

            expect(() => {
                renderer.renderZenCore(
                    mockCtx, 200, 200, 50, mockState, mockZenTransition,
                    gestureTransform, scaleValue
                );
            }).not.toThrow();
        });

        it('should handle rapid successive calls', () => {
            const scaleValue = v => v;

            for (let i = 0; i < 10; i++) {
                expect(() => {
                    renderer.renderZenCore(
                        mockCtx, 200, 200, 50, mockState, mockZenTransition,
                        null, scaleValue
                    );
                }).not.toThrow();
            }
        });
    });
});
