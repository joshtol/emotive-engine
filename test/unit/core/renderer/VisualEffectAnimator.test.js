/**
 * VisualEffectAnimator - Unit Tests
 * Tests for visual effect gesture animations (flash, glow, flicker, shimmer, sparkle)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualEffectAnimator } from '../../../../src/core/renderer/VisualEffectAnimator.js';

describe('VisualEffectAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new VisualEffectAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });

        it('should use renderer scaleFactor if available', () => {
            mockRenderer.scaleFactor = 2;
            const newAnimator = new VisualEffectAnimator(mockRenderer);
            expect(newAnimator.scaleFactor).toBe(2);
        });
    });

    describe('applyFlash', () => {
        it('should return glow and scale pulse', () => {
            const anim = {
                params: {
                    glowPeak: 2.0,
                    scalePeak: 1.1
                }
            };
            const progress = 0.5; // Peak of sine wave

            const result = animator.applyFlash(anim, progress);

            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('scale');
            expect(result.glow).toBeGreaterThan(1);
            expect(result.scale).toBeGreaterThan(1);
        });

        it('should use default values when params not provided', () => {
            const anim = {
                params: {}
            };
            const progress = 0.5;

            const result = animator.applyFlash(anim, progress);

            expect(result.glow).toBeGreaterThan(1);
            expect(result.scale).toBeGreaterThan(1);
        });

        it('should follow sine wave pattern', () => {
            const anim = {
                params: {
                    glowPeak: 2.0,
                    scalePeak: 1.1
                }
            };

            const resultStart = animator.applyFlash(anim, 0);
            const resultPeak = animator.applyFlash(anim, 0.5);
            const resultEnd = animator.applyFlash(anim, 1);

            // Start and end should be at baseline
            expect(resultStart.glow).toBeCloseTo(1, 1);
            expect(resultEnd.glow).toBeCloseTo(1, 1);

            // Peak should be highest
            expect(resultPeak.glow).toBeGreaterThan(resultStart.glow);
            expect(resultPeak.glow).toBeGreaterThan(resultEnd.glow);
        });
    });

    describe('applyGlow', () => {
        it('should return glow and subtle scale', () => {
            const anim = {
                params: {
                    frequency: 2,
                    glowAmount: 0.8,
                    scaleAmount: 0.1
                }
            };
            const progress = 0.25;

            const result = animator.applyGlow(anim, progress);

            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('scale');
            expect(result.glow).toBeGreaterThan(1);
        });

        it('should use default values', () => {
            const anim = {
                params: {
                    frequency: 2
                }
            };
            const progress = 0.25; // At this progress, sin(0.25 * π * 2) = sin(π/2) = 1

            const result = animator.applyGlow(anim, progress);

            expect(result.glow).toBeGreaterThan(1);
            expect(result.scale).toBeDefined();
        });

        it('should oscillate with frequency', () => {
            const anim = {
                params: {
                    frequency: 2,
                    glowAmount: 0.8
                }
            };

            const result1 = animator.applyGlow(anim, 0.125); // Peak of first cycle
            const result2 = animator.applyGlow(anim, 0.375); // Peak of second cycle

            expect(result1.glow).toBeGreaterThan(1);
            expect(result2.glow).toBeGreaterThan(1);
        });
    });

    describe('applyFlicker', () => {
        it('should return shimmer effect data', () => {
            const anim = {
                params: {
                    intensity: 2.0,
                    speed: 3
                }
            };
            const progress = 0.5;

            const result = animator.applyFlicker(anim, progress);

            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('particleGlow');
            expect(result).toHaveProperty('flickerTime');
            expect(result).toHaveProperty('flickerEffect');
            expect(result.flickerEffect).toBe(true);
        });

        it('should include wave motion', () => {
            const anim = {
                params: {
                    intensity: 2.0,
                    speed: 3
                }
            };
            const progress = 0.5;

            const result = animator.applyFlicker(anim, progress);

            expect(result.offsetX).toBeDefined();
        });

        it('should use default parameters', () => {
            const anim = {
                params: {}
            };
            const progress = 0.5;

            const result = animator.applyFlicker(anim, progress);

            expect(result.glow).toBeDefined();
            expect(result.flickerEffect).toBe(true);
        });
    });

    describe('applySparkle', () => {
        it('should return firefly effect data', () => {
            const anim = {
                params: {
                    intensity: 2.0
                }
            };
            const progress = 0.5;

            const result = animator.applySparkle(anim, progress);

            expect(result).toHaveProperty('particleGlow');
            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('fireflyTime');
            expect(result).toHaveProperty('fireflyEffect');
            expect(result.fireflyEffect).toBe(true);
        });

        it('should pulse glow', () => {
            const anim = {
                params: {
                    intensity: 2.0
                }
            };

            const result1 = animator.applySparkle(anim, 0);
            const result2 = animator.applySparkle(anim, 0.5);

            expect(result1.glow).toBeDefined();
            expect(result2.glow).toBeDefined();
        });

        it('should use default intensity', () => {
            const anim = {
                params: {}
            };
            const progress = 0.5;

            const result = animator.applySparkle(anim, progress);

            expect(result.particleGlow).toBe(2.0); // Default intensity
        });
    });

    describe('applyShimmer', () => {
        it('should return shimmer effect data', () => {
            const anim = {
                params: {
                    intensity: 0.3
                }
            };
            const progress = 0.5;

            const result = animator.applyShimmer(anim, progress);

            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('particleGlow');
            expect(result).toHaveProperty('shimmerTime');
            expect(result).toHaveProperty('shimmerWave');
            expect(result).toHaveProperty('shimmerEffect');
            expect(result.shimmerEffect).toBe(true);
        });

        it('should have no movement', () => {
            const anim = {
                params: {
                    intensity: 0.3
                }
            };
            const progress = 0.5;

            const result = animator.applyShimmer(anim, progress);

            expect(result.offsetX).toBe(0);
            expect(result.offsetY).toBe(0);
        });

        it('should have subtle scale variation', () => {
            const anim = {
                params: {
                    intensity: 0.3
                }
            };
            const progress = 0.5;

            const result = animator.applyShimmer(anim, progress);

            // Scale should be very close to 1 (just 1% variation)
            expect(result.scale).toBeGreaterThan(0.99);
            expect(result.scale).toBeLessThan(1.01);
        });

        it('should use default intensity', () => {
            const anim = {
                params: {}
            };
            const progress = 0.5;

            const result = animator.applyShimmer(anim, progress);

            expect(result.glow).toBeDefined();
            expect(result.shimmerEffect).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    glowPeak: 2.0,
                    intensity: 2.0
                }
            };

            expect(() => animator.applyFlash(anim, 0)).not.toThrow();
            expect(() => animator.applyGlow(anim, 0)).not.toThrow();
            expect(() => animator.applyFlicker(anim, 0)).not.toThrow();
            expect(() => animator.applySparkle(anim, 0)).not.toThrow();
            expect(() => animator.applyShimmer(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    glowPeak: 2.0,
                    intensity: 2.0
                }
            };

            expect(() => animator.applyFlash(anim, 1)).not.toThrow();
            expect(() => animator.applyGlow(anim, 1)).not.toThrow();
            expect(() => animator.applyFlicker(anim, 1)).not.toThrow();
            expect(() => animator.applySparkle(anim, 1)).not.toThrow();
            expect(() => animator.applyShimmer(anim, 1)).not.toThrow();
        });

        it('should handle missing params', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyFlash(anim, 0.5)).not.toThrow();
            expect(() => animator.applyGlow(anim, 0.5)).not.toThrow();
            expect(() => animator.applyFlicker(anim, 0.5)).not.toThrow();
            expect(() => animator.applySparkle(anim, 0.5)).not.toThrow();
            expect(() => animator.applyShimmer(anim, 0.5)).not.toThrow();
        });
    });
});
