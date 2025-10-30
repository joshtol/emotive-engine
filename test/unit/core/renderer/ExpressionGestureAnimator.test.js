/**
 * ExpressionGestureAnimator - Unit Tests
 * Tests for expression gesture animations (nod, tilt, slowBlink, look, settle)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExpressionGestureAnimator } from '../../../../src/core/renderer/ExpressionGestureAnimator.js';

describe('ExpressionGestureAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new ExpressionGestureAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });
    });

    describe('applyNod', () => {
        it('should create vertical oscillation', () => {
            const anim = {
                params: {
                    frequency: 2,
                    amplitude: 15
                }
            };

            const result = animator.applyNod(anim, 0.25);

            expect(result).toHaveProperty('offsetY');
            // sin(0.25 * π * 2) * 15 = sin(π/2) * 15 = 15
            expect(result.offsetY).toBeCloseTo(15, 5);
        });

        it('should return to baseline at progress 0 and 0.5', () => {
            const anim = {
                params: {
                    frequency: 2,
                    amplitude: 15
                }
            };

            const result1 = animator.applyNod(anim, 0);
            const result2 = animator.applyNod(anim, 0.5);

            expect(result1.offsetY).toBeCloseTo(0, 5);
            expect(result2.offsetY).toBeCloseTo(0, 5);
        });

        it('should scale with scaleFactor', () => {
            mockRenderer.scaleFactor = 2;
            animator = new ExpressionGestureAnimator(mockRenderer);

            const anim = {
                params: {
                    frequency: 2,
                    amplitude: 15
                }
            };

            const result = animator.applyNod(anim, 0.25);

            expect(result.offsetY).toBeCloseTo(30, 5);
        });
    });

    describe('applyTilt', () => {
        it('should initialize random tilt direction', () => {
            const anim = {
                params: {
                    frequency: 2,
                    angle: 15
                }
            };

            expect(anim.tiltDirection).toBeUndefined();
            animator.applyTilt(anim, 0.1);
            expect(anim.tiltDirection).toBeDefined();
            expect([-1, 1]).toContain(anim.tiltDirection);
        });

        it('should return all transform properties', () => {
            const anim = {
                params: {
                    frequency: 2,
                    angle: 15
                }
            };

            const result = animator.applyTilt(anim, 0.25);

            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scaleX');
            expect(result).toHaveProperty('scaleY');
            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
        });

        it('should use default values when not specified', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyTilt(anim, 0.5);

            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scaleX');
            expect(result).toHaveProperty('scaleY');
        });

        it('should maintain consistent tilt direction across calls', () => {
            const anim = {
                params: {
                    frequency: 2,
                    angle: 15
                }
            };

            const result1 = animator.applyTilt(anim, 0.1);
            const result2 = animator.applyTilt(anim, 0.5);

            // Direction should be set and maintained
            expect(anim.tiltDirection).toBeDefined();
            expect(result1.rotation * result2.rotation).toBeGreaterThanOrEqual(0); // Same sign or zero
        });
    });

    describe('applySlowBlink', () => {
        it('should close during first 30% of animation', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applySlowBlink(anim, 0);
            const result2 = animator.applySlowBlink(anim, 0.15);
            const result3 = animator.applySlowBlink(anim, 0.3);

            expect(result1.glow).toBeCloseTo(1.0, 5);
            expect(result2.glow).toBeGreaterThan(0);
            expect(result2.glow).toBeLessThan(1.0);
            expect(result3.glow).toBeCloseTo(0, 5);
        });

        it('should stay closed from 30% to 50%', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applySlowBlink(anim, 0.3);
            const result2 = animator.applySlowBlink(anim, 0.4);
            const result3 = animator.applySlowBlink(anim, 0.5);

            expect(result1.glow).toBeCloseTo(0, 5);
            expect(result2.glow).toBeCloseTo(0, 5);
            expect(result3.glow).toBeCloseTo(0, 5);
        });

        it('should open from 50% to 80%', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applySlowBlink(anim, 0.5);
            const result2 = animator.applySlowBlink(anim, 0.65);
            const result3 = animator.applySlowBlink(anim, 0.8);

            expect(result1.glow).toBeCloseTo(0, 5);
            expect(result2.glow).toBeGreaterThan(0);
            expect(result2.glow).toBeLessThan(1.0);
            expect(result3.glow).toBeCloseTo(1.0, 5);
        });

        it('should stay open from 80% to 100%', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applySlowBlink(anim, 0.8);
            const result2 = animator.applySlowBlink(anim, 0.9);
            const result3 = animator.applySlowBlink(anim, 1.0);

            expect(result1.glow).toBeCloseTo(1.0, 5);
            expect(result2.glow).toBeCloseTo(1.0, 5);
            expect(result3.glow).toBeCloseTo(1.0, 5);
        });
    });

    describe('applyLook', () => {
        it('should initialize target position for left direction', () => {
            const anim = {
                params: {
                    lookDirection: 'left',
                    lookDistance: 1
                }
            };

            animator.applyLook(anim, 0.1);

            expect(anim.targetX).toBeLessThan(0);
            expect(anim.targetY).toBe(0);
        });

        it('should initialize target position for right direction', () => {
            const anim = {
                params: {
                    lookDirection: 'right',
                    lookDistance: 1
                }
            };

            animator.applyLook(anim, 0.1);

            expect(anim.targetX).toBeGreaterThan(0);
            expect(anim.targetY).toBe(0);
        });

        it('should initialize target position for up direction', () => {
            const anim = {
                params: {
                    lookDirection: 'up',
                    lookDistance: 1
                }
            };

            animator.applyLook(anim, 0.1);

            expect(anim.targetX).toBe(0);
            expect(anim.targetY).toBeLessThan(0);
        });

        it('should initialize target position for down direction', () => {
            const anim = {
                params: {
                    lookDirection: 'down',
                    lookDistance: 1
                }
            };

            animator.applyLook(anim, 0.1);

            expect(anim.targetX).toBe(0);
            expect(anim.targetY).toBeGreaterThan(0);
        });

        it('should initialize random target position for random direction', () => {
            const anim = {
                params: {
                    lookDirection: 'random',
                    lookDistance: 1
                }
            };

            animator.applyLook(anim, 0.1);

            expect(anim.targetX).toBeDefined();
            expect(anim.targetY).toBeDefined();
            // Should be on a circle of radius lookDistance * 50
            const distance = Math.sqrt(anim.targetX ** 2 + anim.targetY ** 2);
            expect(distance).toBeCloseTo(50, 1);
        });

        it('should move to target in first 30%', () => {
            const anim = {
                params: {
                    lookDirection: 'right',
                    lookDistance: 1
                }
            };

            const result1 = animator.applyLook(anim, 0);
            const result2 = animator.applyLook(anim, 0.15);
            const result3 = animator.applyLook(anim, 0.3);

            expect(result1.offsetX).toBeCloseTo(0, 5);
            expect(result2.offsetX).toBeGreaterThan(0);
            expect(result2.offsetX).toBeLessThan(anim.targetX);
            expect(result3.offsetX).toBeCloseTo(anim.targetX, 5);
        });

        it('should hold at target from 30% to 70%', () => {
            const anim = {
                params: {
                    lookDirection: 'right',
                    lookDistance: 1
                }
            };

            const result1 = animator.applyLook(anim, 0.3);
            const result2 = animator.applyLook(anim, 0.5);
            const result3 = animator.applyLook(anim, 0.7);

            expect(result1.offsetX).toBeCloseTo(anim.targetX, 5);
            expect(result2.offsetX).toBeCloseTo(anim.targetX, 5);
            expect(result3.offsetX).toBeCloseTo(anim.targetX, 5);
        });

        it('should return to origin from 70% to 100%', () => {
            const anim = {
                params: {
                    lookDirection: 'right',
                    lookDistance: 1
                }
            };

            const result1 = animator.applyLook(anim, 0.7);
            const result2 = animator.applyLook(anim, 0.85);
            const result3 = animator.applyLook(anim, 1.0);

            expect(result1.offsetX).toBeCloseTo(anim.targetX, 5);
            expect(result2.offsetX).toBeGreaterThan(0);
            expect(result2.offsetX).toBeLessThan(anim.targetX);
            expect(result3.offsetX).toBeCloseTo(0, 5);
        });
    });

    describe('applySettle', () => {
        it('should create damped oscillation', () => {
            const anim = {
                params: {
                    wobbleFreq: 4
                }
            };

            const result = animator.applySettle(anim, 0.25);

            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scale');
        });

        it('should decay amplitude over time', () => {
            const anim = {
                params: {
                    wobbleFreq: 4
                }
            };

            // Use progress values that hit peaks of sine wave to avoid zero crossings
            // sin(progress * π * 4) peaks at progress = 0.125, 0.375, 0.625, 0.875
            const result1 = animator.applySettle(anim, 0.125);
            const result2 = animator.applySettle(anim, 0.375);
            const result3 = animator.applySettle(anim, 0.625);

            // Amplitude should decrease due to exponential decay
            const amp1 = Math.abs(result1.offsetY);
            const amp2 = Math.abs(result2.offsetY);
            const amp3 = Math.abs(result3.offsetY);

            expect(amp1).toBeGreaterThan(amp2);
            expect(amp2).toBeGreaterThan(amp3);
        });

        it('should scale with scaleFactor', () => {
            mockRenderer.scaleFactor = 2;
            animator = new ExpressionGestureAnimator(mockRenderer);

            const anim = {
                params: {
                    wobbleFreq: 4
                }
            };

            const result = animator.applySettle(anim, 0.25);

            expect(Math.abs(result.offsetY)).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    frequency: 2,
                    amplitude: 15,
                    angle: 15,
                    lookDirection: 'left',
                    lookDistance: 1,
                    wobbleFreq: 4
                }
            };

            expect(() => animator.applyNod(anim, 0)).not.toThrow();
            expect(() => animator.applyTilt(anim, 0)).not.toThrow();
            expect(() => animator.applySlowBlink(anim, 0)).not.toThrow();
            expect(() => animator.applyLook(anim, 0)).not.toThrow();
            expect(() => animator.applySettle(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    frequency: 2,
                    amplitude: 15,
                    angle: 15,
                    lookDirection: 'left',
                    lookDistance: 1,
                    wobbleFreq: 4
                }
            };

            expect(() => animator.applyNod(anim, 1)).not.toThrow();
            expect(() => animator.applyTilt(anim, 1)).not.toThrow();
            expect(() => animator.applySlowBlink(anim, 1)).not.toThrow();
            expect(() => animator.applyLook(anim, 1)).not.toThrow();
            expect(() => animator.applySettle(anim, 1)).not.toThrow();
        });

        it('should handle missing params with defaults', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyTilt(anim, 0.5)).not.toThrow();
            expect(() => animator.applySlowBlink(anim, 0.5)).not.toThrow();
        });
    });
});
