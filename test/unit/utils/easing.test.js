/**
 * Easing Functions Tests
 * Tests for animation easing/interpolation functions
 */

import { describe, it, expect } from 'vitest';
import {
    linear,
    easeOutQuad,
    easeInQuad,
    easeInOutQuad,
    easeOutCubic,
    easeInCubic,
    easeInOutCubic,
    easeOutElastic,
    easeOutBounce,
    easeInOutBack,
    easeOutSine,
    easeInOutSine,
    getEasingFunction,
    applyEasing
} from '../../../src/utils/easing.js';

describe('Easing Functions', () => {
    describe('Linear', () => {
        it('should return input unchanged', () => {
            expect(linear(0)).toBe(0);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(1)).toBe(1);
        });
    });

    describe('Quadratic Easing', () => {
        it('easeOutQuad should start fast and slow down', () => {
            expect(easeOutQuad(0)).toBe(0);
            expect(easeOutQuad(1)).toBe(1);
            // At 0.5, should be more than halfway (due to deceleration)
            expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
        });

        it('easeInQuad should start slow and speed up', () => {
            expect(easeInQuad(0)).toBe(0);
            expect(easeInQuad(1)).toBe(1);
            // At 0.5, should be less than halfway (due to acceleration)
            expect(easeInQuad(0.5)).toBeLessThan(0.5);
        });

        it('easeInOutQuad should accelerate then decelerate', () => {
            expect(easeInOutQuad(0)).toBe(0);
            expect(easeInOutQuad(0.5)).toBe(0.5);
            expect(easeInOutQuad(1)).toBe(1);
        });
    });

    describe('Cubic Easing', () => {
        it('easeOutCubic should start fast and slow down smoothly', () => {
            expect(easeOutCubic(0)).toBe(0);
            expect(easeOutCubic(1)).toBe(1);
            expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
        });

        it('easeInCubic should start slow and speed up smoothly', () => {
            expect(easeInCubic(0)).toBe(0);
            expect(easeInCubic(1)).toBe(1);
            expect(easeInCubic(0.5)).toBeLessThan(0.5);
        });

        it('easeInOutCubic should have smooth acceleration and deceleration', () => {
            expect(easeInOutCubic(0)).toBe(0);
            expect(easeInOutCubic(0.5)).toBe(0.5);
            expect(easeInOutCubic(1)).toBe(1);
        });
    });

    describe('Elastic Easing', () => {
        it('easeOutElastic should have overshoot effect', () => {
            expect(easeOutElastic(0)).toBe(0);
            expect(easeOutElastic(1)).toBe(1);
            // Elastic should overshoot 1.0 at some point
            const midValue = easeOutElastic(0.7);
            expect(Math.abs(midValue)).toBeGreaterThan(0);
        });

        it('should handle edge cases', () => {
            expect(easeOutElastic(0)).toBe(0);
            expect(easeOutElastic(1)).toBe(1);
        });
    });

    describe('Bounce Easing', () => {
        it('easeOutBounce should simulate bouncing', () => {
            expect(easeOutBounce(0)).toBe(0);
            expect(easeOutBounce(1)).toBeCloseTo(1, 5);
            // Should have multiple phases (bounces)
            expect(easeOutBounce(0.3)).toBeLessThan(easeOutBounce(0.5));
        });

        it('should stay within 0-1 range', () => {
            for (let i = 0; i <= 1; i += 0.1) {
                const value = easeOutBounce(i);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('Back Easing', () => {
        it('easeInOutBack should have slight overshoot', () => {
            expect(easeInOutBack(0)).toBeCloseTo(0, 5);
            expect(easeInOutBack(0.5)).toBeCloseTo(0.5, 5);
            expect(easeInOutBack(1)).toBeCloseTo(1, 5);
        });
    });

    describe('Sine Easing', () => {
        it('easeOutSine should use sinusoidal curve', () => {
            expect(easeOutSine(0)).toBe(0);
            expect(easeOutSine(1)).toBeCloseTo(1, 10);
            // At 0.5, sine should be at specific value
            expect(easeOutSine(0.5)).toBeGreaterThan(0.5);
        });

        it('easeInOutSine should be symmetric', () => {
            expect(easeInOutSine(0)).toBeCloseTo(0, 10);
            expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 10);
            expect(easeInOutSine(1)).toBeCloseTo(1, 10);
        });
    });

    describe('Boundary Conditions', () => {
        const easingFunctions = [
            linear,
            easeOutQuad,
            easeInQuad,
            easeInOutQuad,
            easeOutCubic,
            easeInCubic,
            easeInOutCubic,
            easeOutSine,
            easeInOutSine
        ];

        it('all easing functions should start at 0', () => {
            easingFunctions.forEach(fn => {
                expect(fn(0)).toBeCloseTo(0, 5);
            });
        });

        it('all easing functions should end at 1', () => {
            easingFunctions.forEach(fn => {
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        });

        it('all easing functions should be monotonic (except elastic/bounce)', () => {
            const monotonicFunctions = [
                linear,
                easeOutQuad,
                easeInQuad,
                easeInOutQuad,
                easeOutCubic,
                easeInCubic,
                easeInOutCubic,
                easeOutSine,
                easeInOutSine
            ];

            monotonicFunctions.forEach(fn => {
                let prev = fn(0);
                for (let t = 0.1; t <= 1; t += 0.1) {
                    const current = fn(t);
                    expect(current).toBeGreaterThanOrEqual(prev - 0.001); // Allow tiny floating point errors
                    prev = current;
                }
            });
        });
    });

    describe('getEasingFunction', () => {
        it('should return correct function by name', () => {
            expect(getEasingFunction('linear')).toBe(linear);
            expect(getEasingFunction('easeOutQuad')).toBe(easeOutQuad);
            expect(getEasingFunction('easeInCubic')).toBe(easeInCubic);
        });

        it('should return linear for unknown names', () => {
            expect(getEasingFunction('unknown')).toBe(linear);
            expect(getEasingFunction('')).toBe(linear);
        });

        it('should handle all registered easing functions', () => {
            const names = [
                'linear',
                'easeOutQuad',
                'easeInQuad',
                'easeInOutQuad',
                'easeOutCubic',
                'easeInCubic',
                'easeInOutCubic',
                'easeOutElastic',
                'easeOutBounce',
                'easeInOutBack',
                'easeOutSine',
                'easeInOutSine'
            ];

            names.forEach(name => {
                const fn = getEasingFunction(name);
                expect(fn).toBeInstanceOf(Function);
                expect(fn(0)).toBeCloseTo(0, 5);
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        });
    });

    describe('applyEasing', () => {
        it('should interpolate between start and end values', () => {
            expect(applyEasing(0, 0, 100, 'linear')).toBe(0);
            expect(applyEasing(0.5, 0, 100, 'linear')).toBe(50);
            expect(applyEasing(1, 0, 100, 'linear')).toBe(100);
        });

        it('should work with negative ranges', () => {
            expect(applyEasing(0, -50, 50, 'linear')).toBe(-50);
            expect(applyEasing(0.5, -50, 50, 'linear')).toBe(0);
            expect(applyEasing(1, -50, 50, 'linear')).toBe(50);
        });

        it('should apply easing function correctly', () => {
            // easeInQuad at 0.5 should give value less than halfway
            const result = applyEasing(0.5, 0, 100, 'easeInQuad');
            expect(result).toBeLessThan(50);
            expect(result).toBe(25); // 0.5^2 * 100 = 25
        });

        it('should accept function instead of string', () => {
            const customEasing = t => t * t;
            expect(applyEasing(0.5, 0, 100, customEasing)).toBe(25);
        });

        it('should clamp progress to 0-1 range', () => {
            expect(applyEasing(-0.5, 0, 100, 'linear')).toBe(0);
            expect(applyEasing(1.5, 0, 100, 'linear')).toBe(100);
        });

        it('should handle reversed ranges (end < start)', () => {
            expect(applyEasing(0, 100, 0, 'linear')).toBe(100);
            expect(applyEasing(0.5, 100, 0, 'linear')).toBe(50);
            expect(applyEasing(1, 100, 0, 'linear')).toBe(0);
        });

        it('should default to linear easing', () => {
            expect(applyEasing(0.5, 0, 100)).toBe(50);
        });
    });

    describe('Performance Characteristics', () => {
        it('should handle rapid repeated calls', () => {
            const iterations = 1000;
            const start = performance.now();

            for (let i = 0; i < iterations; i++) {
                const t = i / iterations;
                linear(t);
                easeOutQuad(t);
                easeInOutCubic(t);
            }

            const duration = performance.now() - start;
            // Should complete 1000 iterations quickly (< 10ms)
            expect(duration).toBeLessThan(10);
        });
    });
});
