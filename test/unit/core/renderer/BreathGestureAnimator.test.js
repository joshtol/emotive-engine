/**
 * BreathGestureAnimator - Unit Tests
 * Tests for breathing gesture animations (breathe, breathIn, breathOut, breathHold, breathHoldEmpty)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BreathGestureAnimator } from '../../../../src/core/renderer/BreathGestureAnimator.js';

describe('BreathGestureAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new BreathGestureAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
        });
    });

    describe('applyBreathe', () => {
        it('should return scale, glow, and breathPhase', () => {
            const anim = {
                params: {
                    scaleAmount: 0.25,
                    glowAmount: 0.4,
                    particleMotion: {
                        holdPercent: 0.1
                    }
                }
            };
            const progress = 0.2; // Inhale phase

            const result = animator.applyBreathe(anim, progress);

            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('breathPhase');
            expect(anim.breathPhase).toBeDefined();
        });

        it('should handle inhale phase (0-40%)', () => {
            const anim = {
                params: {
                    scaleAmount: 0.25,
                    glowAmount: 0.4
                }
            };
            const progress = 0.2;

            const result = animator.applyBreathe(anim, progress);

            expect(result.scale).toBeGreaterThan(1);
            expect(result.glow).toBeGreaterThan(1);
            expect(result.breathPhase).toBeGreaterThan(0);
            expect(result.breathPhase).toBeLessThan(1);
        });

        it('should handle hold at full inhale', () => {
            const anim = {
                params: {
                    scaleAmount: 0.25,
                    glowAmount: 0.4,
                    particleMotion: {
                        holdPercent: 0.1
                    }
                }
            };
            const progress = 0.42; // During hold phase

            const result = animator.applyBreathe(anim, progress);

            expect(result.breathPhase).toBe(1.0);
        });

        it('should handle exhale phase', () => {
            const anim = {
                params: {
                    scaleAmount: 0.25,
                    glowAmount: 0.4
                }
            };
            const progress = 0.65;

            const result = animator.applyBreathe(anim, progress);

            expect(result.breathPhase).toBeGreaterThan(0);
            expect(result.breathPhase).toBeLessThan(1);
        });

        it('should handle hold at full exhale', () => {
            const anim = {
                params: {
                    scaleAmount: 0.25,
                    glowAmount: 0.4
                }
            };
            const progress = 0.95;

            const result = animator.applyBreathe(anim, progress);

            expect(result.breathPhase).toBe(0);
        });

        it('should use default values', () => {
            const anim = {
                params: {}
            };
            const progress = 0.2;

            const result = animator.applyBreathe(anim, progress);

            expect(result.scale).toBeGreaterThan(1);
            expect(result.glow).toBeGreaterThan(1);
        });
    });

    describe('applyBreathIn', () => {
        it('should expand gradually', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };

            const result1 = animator.applyBreathIn(anim, 0);
            const result2 = animator.applyBreathIn(anim, 0.5);
            const result3 = animator.applyBreathIn(anim, 1);

            expect(result1.scale).toBe(1);
            expect(result2.scale).toBeGreaterThan(1);
            expect(result3.scale).toBe(1.3);
        });

        it('should follow sine curve', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };
            const progress = 0.5;

            const result = animator.applyBreathIn(anim, progress);

            // At progress 0.5, sin(π/4) ≈ 0.707
            expect(result.scale).toBeGreaterThan(1);
            expect(result.scale).toBeLessThan(1.3);
        });
    });

    describe('applyBreathOut', () => {
        it('should contract gradually', () => {
            const anim = {
                params: {
                    scaleAmount: 0.9
                }
            };

            const result1 = animator.applyBreathOut(anim, 0);
            const result2 = animator.applyBreathOut(anim, 0.5);
            const result3 = animator.applyBreathOut(anim, 1);

            expect(result1.scale).toBe(1);
            expect(result2.scale).toBeLessThan(1);
            expect(result3.scale).toBe(0.9);
        });

        it('should follow sine curve', () => {
            const anim = {
                params: {
                    scaleAmount: 0.9
                }
            };
            const progress = 0.5;

            const result = animator.applyBreathOut(anim, progress);

            expect(result.scale).toBeLessThan(1);
            expect(result.scale).toBeGreaterThan(0.9);
        });
    });

    describe('applyBreathHold', () => {
        it('should maintain expanded state', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };

            const result = animator.applyBreathHold(anim, 0.5);

            expect(result.scale).toBe(1.3);
        });

        it('should not change over time', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };

            const result1 = animator.applyBreathHold(anim, 0);
            const result2 = animator.applyBreathHold(anim, 0.5);
            const result3 = animator.applyBreathHold(anim, 1);

            expect(result1.scale).toBe(1.3);
            expect(result2.scale).toBe(1.3);
            expect(result3.scale).toBe(1.3);
        });
    });

    describe('applyBreathHoldEmpty', () => {
        it('should maintain contracted state', () => {
            const anim = {
                params: {
                    scaleAmount: 0.9
                }
            };

            const result = animator.applyBreathHoldEmpty(anim, 0.5);

            expect(result.scale).toBe(0.9);
        });

        it('should not change over time', () => {
            const anim = {
                params: {
                    scaleAmount: 0.9
                }
            };

            const result1 = animator.applyBreathHoldEmpty(anim, 0);
            const result2 = animator.applyBreathHoldEmpty(anim, 0.5);
            const result3 = animator.applyBreathHoldEmpty(anim, 1);

            expect(result1.scale).toBe(0.9);
            expect(result2.scale).toBe(0.9);
            expect(result3.scale).toBe(0.9);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };

            expect(() => animator.applyBreathe(anim, 0)).not.toThrow();
            expect(() => animator.applyBreathIn(anim, 0)).not.toThrow();
            expect(() => animator.applyBreathOut(anim, 0)).not.toThrow();
            expect(() => animator.applyBreathHold(anim, 0)).not.toThrow();
            expect(() => animator.applyBreathHoldEmpty(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    scaleAmount: 1.3
                }
            };

            expect(() => animator.applyBreathe(anim, 1)).not.toThrow();
            expect(() => animator.applyBreathIn(anim, 1)).not.toThrow();
            expect(() => animator.applyBreathOut(anim, 1)).not.toThrow();
            expect(() => animator.applyBreathHold(anim, 1)).not.toThrow();
            expect(() => animator.applyBreathHoldEmpty(anim, 1)).not.toThrow();
        });

        it('should handle missing params', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyBreathe(anim, 0.5)).not.toThrow();
        });
    });
});
