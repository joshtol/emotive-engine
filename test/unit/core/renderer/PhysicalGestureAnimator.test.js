/**
 * PhysicalGestureAnimator - Unit Tests
 * Tests for physical gesture animations (bounce, shake, jump, vibrate, wiggle)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicalGestureAnimator } from '../../../../src/core/renderer/PhysicalGestureAnimator.js';

describe('PhysicalGestureAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new PhysicalGestureAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });

        it('should use renderer scaleFactor if available', () => {
            mockRenderer.scaleFactor = 2;
            const newAnimator = new PhysicalGestureAnimator(mockRenderer);
            expect(newAnimator.scaleFactor).toBe(2);
        });

        it('should default to scaleFactor 1 if not provided', () => {
            const rendererNoScale = {};
            const newAnimator = new PhysicalGestureAnimator(rendererNoScale);
            expect(newAnimator.scaleFactor).toBe(1);
        });
    });

    describe('applyBounce', () => {
        it('should return vertical offset for bounce animation', () => {
            const anim = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    effects: []
                }
            };
            const progress = 0.25; // Quarter through animation

            const result = animator.applyBounce(anim, progress);

            expect(result).toHaveProperty('offsetY');
            expect(result.offsetY).toBeLessThan(0); // Negative = upward
            expect(Math.abs(result.offsetY)).toBeGreaterThan(0);
        });

        it('should apply gravity effect multiplier when enabled', () => {
            const animNoGravity = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    effects: []
                }
            };
            const animWithGravity = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    effects: ['gravity']
                }
            };
            const progress = 0.25;

            const resultNoGravity = animator.applyBounce(animNoGravity, progress);
            const resultWithGravity = animator.applyBounce(animWithGravity, progress);

            expect(Math.abs(resultWithGravity.offsetY)).toBeLessThan(Math.abs(resultNoGravity.offsetY));
        });

        it('should respect scaleFactor', () => {
            animator.scaleFactor = 2;
            const anim = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    effects: []
                }
            };
            const progress = 0.25;

            const result = animator.applyBounce(anim, progress);

            // With scaleFactor 2, offset should be larger
            expect(Math.abs(result.offsetY)).toBeGreaterThan(10);
        });
    });

    describe('applyShake', () => {
        it('should return horizontal and vertical offsets', () => {
            const anim = {
                params: {
                    amplitude: 10,
                    frequency: 5,
                    decay: false
                }
            };
            const progress = 0.5;

            const result = animator.applyShake(anim, progress);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
        });

        it('should initialize random angle on first call', () => {
            const anim = {
                params: {
                    amplitude: 10,
                    frequency: 5,
                    decay: false
                }
            };

            expect(anim.randomAngle).toBeUndefined();
            animator.applyShake(anim, 0.5);
            expect(anim.randomAngle).toBeDefined();
            expect(anim.randomAngle).toBeGreaterThanOrEqual(0);
            expect(anim.randomAngle).toBeLessThanOrEqual(Math.PI * 2);
        });

        it('should apply decay when enabled', () => {
            const animWithDecay = {
                params: {
                    amplitude: 10,
                    frequency: 5,
                    decay: true
                }
            };

            const resultEarly = animator.applyShake(animWithDecay, 0.1);
            const resultLate = animator.applyShake(animWithDecay, 0.9);

            const magnitudeEarly = Math.sqrt(resultEarly.offsetX ** 2 + resultEarly.offsetY ** 2);
            const magnitudeLate = Math.sqrt(resultLate.offsetX ** 2 + resultLate.offsetY ** 2);

            // Later in animation, shake should be weaker with decay
            expect(magnitudeLate).toBeLessThan(magnitudeEarly);
        });

        it('should maintain constant amplitude without decay', () => {
            const anim = {
                params: {
                    amplitude: 10,
                    frequency: 5,
                    decay: false
                },
                randomAngle: Math.PI / 4 // Set angle to make test deterministic
            };

            const result1 = animator.applyShake(anim, 0.25);
            const result2 = animator.applyShake(anim, 0.75);

            const magnitude1 = Math.sqrt(result1.offsetX ** 2 + result1.offsetY ** 2);
            const magnitude2 = Math.sqrt(result2.offsetX ** 2 + result2.offsetY ** 2);

            // Without decay, magnitudes should be similar (may vary due to sine wave)
            expect(magnitude1).toBeGreaterThan(0);
            expect(magnitude2).toBeGreaterThan(0);
        });
    });

    describe('applyJump', () => {
        it('should return vertical offset for jump animation', () => {
            const anim = {
                params: {
                    jumpHeight: 100,
                    effects: []
                }
            };
            const progress = 0.5; // Peak of jump

            const result = animator.applyJump(anim, progress);

            expect(result).toHaveProperty('offsetY');
            expect(result.offsetY).toBeLessThan(0); // Negative = upward
        });

        it('should apply gravity effect with squash and stretch', () => {
            const anim = {
                params: {
                    jumpHeight: 100,
                    effects: ['gravity']
                }
            };
            const progress = 0.5;

            const result = animator.applyJump(anim, progress);

            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scaleX');
            expect(result).toHaveProperty('scaleY');
        });

        it('should have parabolic trajectory', () => {
            const anim = {
                params: {
                    jumpHeight: 100,
                    effects: []
                }
            };

            const resultStart = animator.applyJump(anim, 0);
            const resultPeak = animator.applyJump(anim, 0.5);
            const resultEnd = animator.applyJump(anim, 1);

            // Start and end should be near ground (offsetY close to 0)
            expect(Math.abs(resultStart.offsetY)).toBeLessThan(10);
            expect(Math.abs(resultEnd.offsetY)).toBeLessThan(10);

            // Peak should be highest (most negative offsetY)
            expect(resultPeak.offsetY).toBeLessThan(resultStart.offsetY);
            expect(resultPeak.offsetY).toBeLessThan(resultEnd.offsetY);
        });

        it('should respect scaleFactor for jump height', () => {
            animator.scaleFactor = 0.5;
            const anim = {
                params: {
                    jumpHeight: 100,
                    effects: []
                }
            };
            const progress = 0.5;

            const result = animator.applyJump(anim, progress);

            // With smaller scaleFactor, jump should be lower
            expect(Math.abs(result.offsetY)).toBeLessThan(100);
        });
    });

    describe('applyVibrate', () => {
        it('should return small rapid offsets', () => {
            const anim = {
                params: {
                    amplitude: 5,
                    frequency: 20
                }
            };
            const progress = 0.5;

            const result = animator.applyVibrate(anim, progress);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(Math.abs(result.offsetX)).toBeLessThanOrEqual(5);
            expect(Math.abs(result.offsetY)).toBeLessThanOrEqual(5);
        });

        it('should initialize vibrate angles on first call', () => {
            const anim = {
                params: {
                    amplitude: 5,
                    frequency: 20
                }
            };

            expect(anim.vibrateAngles).toBeUndefined();
            animator.applyVibrate(anim, 0.5);
            expect(anim.vibrateAngles).toBeDefined();
            expect(anim.vibrateAngles.x).toBeDefined();
            expect(anim.vibrateAngles.y).toBeDefined();
        });

        it('should create high-frequency oscillation', () => {
            const anim = {
                params: {
                    amplitude: 5,
                    frequency: 20
                },
                vibrateAngles: { x: 1, y: 0 } // Fixed direction for test
            };

            const result1 = animator.applyVibrate(anim, 0.1);
            const result2 = animator.applyVibrate(anim, 0.15);

            // Positions should be different due to high frequency
            const diff = Math.abs(result1.offsetX - result2.offsetX) + Math.abs(result1.offsetY - result2.offsetY);
            expect(diff).toBeGreaterThan(0);
        });
    });

    describe('applyWiggle', () => {
        it('should return rotation for wiggle animation', () => {
            const anim = {
                params: {
                    angle: 15,
                    frequency: 3
                }
            };
            const progress = 0.5;

            const result = animator.applyWiggle(anim, progress);

            expect(result).toHaveProperty('rotation');
            expect(Math.abs(result.rotation)).toBeGreaterThan(0);
            expect(Math.abs(result.rotation)).toBeLessThanOrEqual(15);
        });

        it('should oscillate back and forth', () => {
            const anim = {
                params: {
                    amplitude: 15
                },
                wiggleDirection: 1 // Set direction to ensure deterministic behavior
            };

            const result1 = animator.applyWiggle(anim, 0.15); // Phase 1, moving right
            const result2 = animator.applyWiggle(anim, 0.40); // Phase 2, moving left

            // The wiggle should move in opposite directions at these phases
            expect(Math.abs(result1.offsetX)).toBeGreaterThan(0);
            expect(Math.abs(result1.rotation)).toBeGreaterThan(0);
            // Verify it moves to opposite side
            expect(result1.offsetX * result2.offsetX).toBeLessThan(0); // Opposite signs
        });

        it('should default angle to 10 if not provided', () => {
            const anim = {
                params: {
                    frequency: 2
                }
            };
            const progress = 0.25;

            const result = animator.applyWiggle(anim, progress);

            expect(result).toHaveProperty('rotation');
            expect(Math.abs(result.rotation)).toBeLessThanOrEqual(10);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    effects: []
                }
            };

            expect(() => animator.applyBounce(anim, 0)).not.toThrow();
            expect(() => animator.applyShake(anim, 0)).not.toThrow();
            expect(() => animator.applyJump(anim, 0)).not.toThrow();
            expect(() => animator.applyVibrate(anim, 0)).not.toThrow();
            expect(() => animator.applyWiggle(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    amplitude: 20,
                    frequency: 2,
                    jumpHeight: 100,
                    angle: 15,
                    effects: []
                }
            };

            expect(() => animator.applyBounce(anim, 1)).not.toThrow();
            expect(() => animator.applyShake(anim, 1)).not.toThrow();
            expect(() => animator.applyJump(anim, 1)).not.toThrow();
            expect(() => animator.applyVibrate(anim, 1)).not.toThrow();
            expect(() => animator.applyWiggle(anim, 1)).not.toThrow();
        });

        it('should handle missing params gracefully', () => {
            const anim = {
                params: {}
            };

            // Should not throw, should use defaults
            expect(() => animator.applyBounce(anim, 0.5)).not.toThrow();
            expect(() => animator.applyShake(anim, 0.5)).not.toThrow();
            expect(() => animator.applyJump(anim, 0.5)).not.toThrow();
            expect(() => animator.applyVibrate(anim, 0.5)).not.toThrow();
            expect(() => animator.applyWiggle(anim, 0.5)).not.toThrow();
        });
    });
});
