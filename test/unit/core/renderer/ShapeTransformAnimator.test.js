/**
 * ShapeTransformAnimator - Unit Tests
 * Tests for shape transformation gesture animations (pulse, expand, contract, stretch, morph)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShapeTransformAnimator } from '../../../../src/core/renderer/ShapeTransformAnimator.js';

describe('ShapeTransformAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new ShapeTransformAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });
    });

    describe('applyPulse', () => {
        it('should create sine wave pulse with scale and glow', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleAmount: 0.2,
                    glowAmount: 0.5
                }
            };

            const result = animator.applyPulse(anim, 0.25);

            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('glow');
            expect(result.scale).toBeGreaterThan(1);
            expect(result.glow).toBeGreaterThan(1);
        });

        it('should reach peak at progress 0.25 with frequency 2', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleAmount: 0.2,
                    glowAmount: 0.5
                }
            };

            const result = animator.applyPulse(anim, 0.25);

            // sin(0.25 * π * 2) = sin(π/2) = 1
            expect(result.scale).toBeCloseTo(1.2, 5);
            expect(result.glow).toBeCloseTo(1.5, 5);
        });

        it('should return to baseline at progress 0 and 0.5', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleAmount: 0.2,
                    glowAmount: 0.5
                }
            };

            const result1 = animator.applyPulse(anim, 0);
            const result2 = animator.applyPulse(anim, 0.5);

            // sin(0) = 0, sin(π*2) = 0
            expect(result1.scale).toBeCloseTo(1.0, 5);
            expect(result1.glow).toBeCloseTo(1.0, 5);
            expect(result2.scale).toBeCloseTo(1.0, 5);
            expect(result2.glow).toBeCloseTo(1.0, 5);
        });
    });

    describe('applyExpand', () => {
        it('should expand smoothly from 1 to target scale', () => {
            const anim = {
                params: {
                    scaleAmount: 1.8,
                    glowAmount: 0.3
                }
            };

            const result1 = animator.applyExpand(anim, 0);
            const result2 = animator.applyExpand(anim, 0.5);
            const result3 = animator.applyExpand(anim, 1);

            expect(result1.scale).toBeCloseTo(1.0, 5);
            expect(result2.scale).toBeGreaterThan(1.0);
            expect(result2.scale).toBeLessThan(1.8);
            expect(result3.scale).toBeCloseTo(1.8, 5);
        });

        it('should use scaleTarget if scaleAmount not provided', () => {
            const anim = {
                params: {
                    scaleTarget: 2.0,
                    glowAmount: 0.3
                }
            };

            const result = animator.applyExpand(anim, 1);

            expect(result.scale).toBeCloseTo(2.0, 5);
        });

        it('should ensure expansion not contraction', () => {
            const anim = {
                params: {
                    scaleAmount: 0.5, // Trying to contract
                    glowAmount: 0.3
                }
            };

            const result = animator.applyExpand(anim, 1);

            // Should clamp to at least 1.0
            expect(result.scale).toBeGreaterThanOrEqual(1.0);
        });

        it('should increase glow during expansion', () => {
            const anim = {
                params: {
                    scaleAmount: 1.5,
                    glowAmount: 0.3
                }
            };

            const result1 = animator.applyExpand(anim, 0);
            const result2 = animator.applyExpand(anim, 1);

            expect(result1.glow).toBeCloseTo(1.0, 5);
            expect(result2.glow).toBeCloseTo(1.3, 5);
        });

        it('should use default glow if not specified', () => {
            const anim = {
                params: {
                    scaleAmount: 1.5
                }
            };

            const result = animator.applyExpand(anim, 1);

            expect(result.glow).toBeGreaterThan(1.0);
        });
    });

    describe('applyContract', () => {
        it('should contract smoothly from 1 to target scale', () => {
            const anim = {
                params: {
                    scaleAmount: 0.6,
                    glowAmount: -0.3
                }
            };

            const result1 = animator.applyContract(anim, 0);
            const result2 = animator.applyContract(anim, 0.5);
            const result3 = animator.applyContract(anim, 1);

            expect(result1.scale).toBeCloseTo(1.0, 5);
            expect(result2.scale).toBeGreaterThan(0.6);
            expect(result2.scale).toBeLessThan(1.0);
            expect(result3.scale).toBeCloseTo(0.6, 5);
        });

        it('should use scaleTarget if scaleAmount not provided', () => {
            const anim = {
                params: {
                    scaleTarget: 0.5,
                    glowAmount: -0.3
                }
            };

            const result = animator.applyContract(anim, 1);

            expect(result.scale).toBeCloseTo(0.5, 5);
        });

        it('should decrease glow during contraction', () => {
            const anim = {
                params: {
                    scaleAmount: 0.7,
                    glowAmount: -0.3
                }
            };

            const result1 = animator.applyContract(anim, 0);
            const result2 = animator.applyContract(anim, 1);

            expect(result1.glow).toBeCloseTo(1.0, 5);
            expect(result2.glow).toBeCloseTo(0.7, 5);
        });

        it('should use default glow if not specified', () => {
            const anim = {
                params: {
                    scaleAmount: 0.7
                }
            };

            const result = animator.applyContract(anim, 1);

            expect(result.glow).toBeLessThan(1.0);
        });
    });

    describe('applyStretch', () => {
        it('should oscillate scale based on frequency', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleX: 1.3,
                    scaleY: 0.8
                }
            };

            const result = animator.applyStretch(anim, 0.25);

            expect(result).toHaveProperty('scale');
            // At progress 0.25, sin(0.25 * π * 2) = sin(π/2) = 1
            // avgScale = (1.3 + 0.8) / 2 = 1.05
            // scale = 1 + (1.05 - 1) * 1 = 1.05
            expect(result.scale).toBeCloseTo(1.05, 5);
        });

        it('should return baseline at progress 0 and 0.5', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleX: 1.3,
                    scaleY: 0.8
                }
            };

            const result1 = animator.applyStretch(anim, 0);
            const result2 = animator.applyStretch(anim, 0.5);

            expect(result1.scale).toBeCloseTo(1.0, 5);
            expect(result2.scale).toBeCloseTo(1.0, 5);
        });
    });

    describe('applyMorph', () => {
        it('should create fluid morphing with scale and rotation', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyMorph(anim, 0.5);

            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('rotation');
        });

        it('should return to baseline at progress 0 and 1', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applyMorph(anim, 0);
            const result2 = animator.applyMorph(anim, 1);

            // sin(0) = 0, sin(2π) ≈ 0
            expect(result1.scale).toBeCloseTo(1.0, 5);
            expect(result1.rotation).toBeCloseTo(0, 5);
            expect(result2.scale).toBeCloseTo(1.0, 3);
            expect(result2.rotation).toBeCloseTo(0, 3);
        });

        it('should reach peak at progress 0.25', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyMorph(anim, 0.25);

            // sin(0.25 * 2π) = sin(π/2) = 1
            expect(result.scale).toBeCloseTo(1.1, 5);
            expect(result.rotation).toBeCloseTo(10, 5);
        });

        it('should reach trough at progress 0.75', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyMorph(anim, 0.75);

            // sin(0.75 * 2π) = sin(3π/2) = -1
            expect(result.scale).toBeCloseTo(0.9, 5);
            expect(result.rotation).toBeCloseTo(-10, 5);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleAmount: 0.2,
                    glowAmount: 0.5,
                    scaleX: 1.2,
                    scaleY: 0.8
                }
            };

            expect(() => animator.applyPulse(anim, 0)).not.toThrow();
            expect(() => animator.applyExpand(anim, 0)).not.toThrow();
            expect(() => animator.applyContract(anim, 0)).not.toThrow();
            expect(() => animator.applyStretch(anim, 0)).not.toThrow();
            expect(() => animator.applyMorph(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    frequency: 2,
                    scaleAmount: 0.2,
                    glowAmount: 0.5,
                    scaleX: 1.2,
                    scaleY: 0.8
                }
            };

            expect(() => animator.applyPulse(anim, 1)).not.toThrow();
            expect(() => animator.applyExpand(anim, 1)).not.toThrow();
            expect(() => animator.applyContract(anim, 1)).not.toThrow();
            expect(() => animator.applyStretch(anim, 1)).not.toThrow();
            expect(() => animator.applyMorph(anim, 1)).not.toThrow();
        });

        it('should handle missing params with defaults', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyExpand(anim, 0.5)).not.toThrow();
            expect(() => animator.applyContract(anim, 0.5)).not.toThrow();
            expect(() => animator.applyMorph(anim, 0.5)).not.toThrow();
        });
    });
});
