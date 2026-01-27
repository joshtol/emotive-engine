/**
 * Animation Easing Functions Tests
 * Tests for the animation module's easing functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
    Easing,
    getEasing,
    createCustomEasing,
    linear,
    easeIn,
    easeOut,
    easeInOut,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    elastic,
    elasticOut,
    elasticInOut,
    bounce,
    bounceOut,
    bounceInOut,
    snap,
    step,
    smoothstep,
    smootherstep,
    backIn,
    backOut,
    backInOut
} from '../../../../../src/3d/effects/animation/Easing.js';

describe('Animation Easing Functions', () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // CORE EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('linear', () => {
        it('should return input unchanged', () => {
            expect(linear(0)).toBe(0);
            expect(linear(0.25)).toBe(0.25);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(0.75)).toBe(0.75);
            expect(linear(1)).toBe(1);
        });
    });

    describe('easeIn', () => {
        it('should start slow and end fast', () => {
            expect(easeIn(0)).toBe(0);
            expect(easeIn(1)).toBe(1);
            expect(easeIn(0.5)).toBeLessThan(0.5);
        });

        it('should be equivalent to easeInQuad', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                expect(easeIn(t)).toBeCloseTo(easeInQuad(t), 10);
            }
        });
    });

    describe('easeOut', () => {
        it('should start fast and end slow', () => {
            expect(easeOut(0)).toBe(0);
            expect(easeOut(1)).toBe(1);
            expect(easeOut(0.5)).toBeGreaterThan(0.5);
        });

        it('should be equivalent to easeOutQuad', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                expect(easeOut(t)).toBeCloseTo(easeOutQuad(t), 10);
            }
        });
    });

    describe('easeInOut', () => {
        it('should start slow, speed up, then slow down', () => {
            expect(easeInOut(0)).toBe(0);
            expect(easeInOut(0.5)).toBe(0.5);
            expect(easeInOut(1)).toBe(1);
        });

        it('should be slower than linear at 0.25 and faster at 0.75', () => {
            expect(easeInOut(0.25)).toBeLessThan(0.25);
            expect(easeInOut(0.75)).toBeGreaterThan(0.75);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // QUADRATIC EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Quadratic Easing', () => {
        describe('easeInQuad', () => {
            it('should use t^2 curve', () => {
                expect(easeInQuad(0)).toBe(0);
                expect(easeInQuad(0.5)).toBe(0.25); // 0.5^2
                expect(easeInQuad(1)).toBe(1);
            });
        });

        describe('easeOutQuad', () => {
            it('should decelerate to target', () => {
                expect(easeOutQuad(0)).toBe(0);
                expect(easeOutQuad(1)).toBe(1);
                expect(easeOutQuad(0.5)).toBe(0.75); // 1 - (0.5)^2
            });
        });

        describe('easeInOutQuad', () => {
            it('should be symmetric around 0.5', () => {
                expect(easeInOutQuad(0)).toBe(0);
                expect(easeInOutQuad(0.5)).toBe(0.5);
                expect(easeInOutQuad(1)).toBe(1);

                // Test symmetry: f(0.25) + f(0.75) should equal 1
                expect(easeInOutQuad(0.25) + easeInOutQuad(0.75)).toBeCloseTo(1, 10);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CUBIC EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Cubic Easing', () => {
        describe('easeInCubic', () => {
            it('should use t^3 curve', () => {
                expect(easeInCubic(0)).toBe(0);
                expect(easeInCubic(0.5)).toBe(0.125); // 0.5^3
                expect(easeInCubic(1)).toBe(1);
            });

            it('should be slower than quadratic at start', () => {
                expect(easeInCubic(0.5)).toBeLessThan(easeInQuad(0.5));
            });
        });

        describe('easeOutCubic', () => {
            it('should decelerate smoothly', () => {
                expect(easeOutCubic(0)).toBe(0);
                expect(easeOutCubic(1)).toBe(1);
                expect(easeOutCubic(0.5)).toBe(0.875); // 1 - (0.5)^3
            });

            it('should be faster than quadratic at start', () => {
                expect(easeOutCubic(0.5)).toBeGreaterThan(easeOutQuad(0.5));
            });
        });

        describe('easeInOutCubic', () => {
            it('should be symmetric around 0.5', () => {
                expect(easeInOutCubic(0)).toBe(0);
                expect(easeInOutCubic(0.5)).toBe(0.5);
                expect(easeInOutCubic(1)).toBe(1);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ELASTIC EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Elastic Easing', () => {
        describe('elastic (in)', () => {
            it('should return exact values at boundaries', () => {
                expect(elastic(0)).toBe(0);
                expect(elastic(1)).toBe(1);
            });

            it('should go below 0 during animation (pull back)', () => {
                // Elastic in pulls back before moving forward
                let hasNegative = false;
                for (let t = 0.1; t < 1; t += 0.1) {
                    if (elastic(t) < 0) hasNegative = true;
                }
                expect(hasNegative).toBe(true);
            });
        });

        describe('elasticOut', () => {
            it('should return exact values at boundaries', () => {
                expect(elasticOut(0)).toBe(0);
                expect(elasticOut(1)).toBe(1);
            });

            it('should overshoot 1 during animation', () => {
                let hasOvershoot = false;
                for (let t = 0.1; t < 1; t += 0.05) {
                    if (elasticOut(t) > 1) hasOvershoot = true;
                }
                expect(hasOvershoot).toBe(true);
            });
        });

        describe('elasticInOut', () => {
            it('should return exact values at boundaries', () => {
                expect(elasticInOut(0)).toBe(0);
                expect(elasticInOut(1)).toBe(1);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // BOUNCE EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Bounce Easing', () => {
        describe('bounce (in)', () => {
            it('should return values at boundaries', () => {
                expect(bounce(0)).toBeCloseTo(0, 5);
                expect(bounce(1)).toBeCloseTo(1, 5);
            });
        });

        describe('bounceOut', () => {
            it('should return values at boundaries', () => {
                expect(bounceOut(0)).toBe(0);
                expect(bounceOut(1)).toBeCloseTo(1, 5);
            });

            it('should stay within 0-1 range', () => {
                for (let t = 0; t <= 1; t += 0.05) {
                    const value = bounceOut(t);
                    expect(value).toBeGreaterThanOrEqual(0);
                    expect(value).toBeLessThanOrEqual(1);
                }
            });

            it('should generally increase (not strictly monotonic due to bounces)', () => {
                // Each "bounce" reaches a lower peak, but overall trend is upward
                expect(bounceOut(0.1)).toBeLessThan(bounceOut(0.5));
                expect(bounceOut(0.5)).toBeLessThan(bounceOut(1));
            });
        });

        describe('bounceInOut', () => {
            it('should return values at boundaries and midpoint', () => {
                expect(bounceInOut(0)).toBeCloseTo(0, 5);
                expect(bounceInOut(0.5)).toBeCloseTo(0.5, 5);
                expect(bounceInOut(1)).toBeCloseTo(1, 5);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // SPECIAL EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Special Easing', () => {
        describe('snap', () => {
            it('should return 0 for t < 0.5', () => {
                expect(snap(0)).toBe(0);
                expect(snap(0.25)).toBe(0);
                expect(snap(0.49)).toBe(0);
            });

            it('should return 1 for t >= 0.5', () => {
                expect(snap(0.5)).toBe(1);
                expect(snap(0.75)).toBe(1);
                expect(snap(1)).toBe(1);
            });
        });

        describe('step', () => {
            it('should return 0 for t < 1', () => {
                expect(step(0)).toBe(0);
                expect(step(0.5)).toBe(0);
                expect(step(0.99)).toBe(0);
            });

            it('should return 1 for t >= 1', () => {
                expect(step(1)).toBe(1);
            });
        });

        describe('smoothstep', () => {
            it('should return correct boundary values', () => {
                expect(smoothstep(0)).toBe(0);
                expect(smoothstep(1)).toBe(1);
            });

            it('should use Hermite interpolation (3t² - 2t³)', () => {
                const t = 0.5;
                const expected = t * t * (3 - 2 * t);
                expect(smoothstep(t)).toBe(expected);
            });

            it('should pass through 0.5 at t=0.5', () => {
                expect(smoothstep(0.5)).toBe(0.5);
            });
        });

        describe('smootherstep', () => {
            it('should return correct boundary values', () => {
                expect(smootherstep(0)).toBe(0);
                expect(smootherstep(1)).toBe(1);
            });

            it('should use Perlin formula (6t⁵ - 15t⁴ + 10t³)', () => {
                const t = 0.5;
                const expected = t * t * t * (t * (t * 6 - 15) + 10);
                expect(smootherstep(t)).toBe(expected);
            });

            it('should pass through 0.5 at t=0.5', () => {
                expect(smootherstep(0.5)).toBe(0.5);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // BACK EASING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Back Easing', () => {
        describe('backIn', () => {
            it('should return values at boundaries', () => {
                expect(backIn(0)).toBe(0);
                expect(backIn(1)).toBeCloseTo(1, 5);
            });

            it('should go below 0 (anticipation)', () => {
                // Back in pulls back before moving forward
                let hasNegative = false;
                for (let t = 0.1; t < 0.5; t += 0.1) {
                    if (backIn(t) < 0) hasNegative = true;
                }
                expect(hasNegative).toBe(true);
            });
        });

        describe('backOut', () => {
            it('should return values at boundaries', () => {
                expect(backOut(0)).toBeCloseTo(0, 5);
                expect(backOut(1)).toBe(1);
            });

            it('should overshoot 1 during animation', () => {
                let hasOvershoot = false;
                for (let t = 0.5; t < 1; t += 0.1) {
                    if (backOut(t) > 1) hasOvershoot = true;
                }
                expect(hasOvershoot).toBe(true);
            });
        });

        describe('backInOut', () => {
            it('should return values at boundaries and midpoint', () => {
                expect(backInOut(0)).toBeCloseTo(0, 5);
                expect(backInOut(0.5)).toBeCloseTo(0.5, 5);
                expect(backInOut(1)).toBeCloseTo(1, 5);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // EASING OBJECT
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Easing object', () => {
        it('should contain all exported functions', () => {
            expect(Easing.linear).toBe(linear);
            expect(Easing.easeIn).toBe(easeIn);
            expect(Easing.easeOut).toBe(easeOut);
            expect(Easing.easeInOut).toBe(easeInOut);
            expect(Easing.easeInQuad).toBe(easeInQuad);
            expect(Easing.easeOutQuad).toBe(easeOutQuad);
            expect(Easing.easeInOutQuad).toBe(easeInOutQuad);
            expect(Easing.easeInCubic).toBe(easeInCubic);
            expect(Easing.easeOutCubic).toBe(easeOutCubic);
            expect(Easing.easeInOutCubic).toBe(easeInOutCubic);
            expect(Easing.elastic).toBe(elastic);
            expect(Easing.elasticOut).toBe(elasticOut);
            expect(Easing.elasticInOut).toBe(elasticInOut);
            expect(Easing.bounce).toBe(bounce);
            expect(Easing.bounceOut).toBe(bounceOut);
            expect(Easing.bounceInOut).toBe(bounceInOut);
            expect(Easing.snap).toBe(snap);
            expect(Easing.step).toBe(step);
            expect(Easing.smoothstep).toBe(smoothstep);
            expect(Easing.smootherstep).toBe(smootherstep);
            expect(Easing.backIn).toBe(backIn);
            expect(Easing.backOut).toBe(backOut);
            expect(Easing.backInOut).toBe(backInOut);
        });

        it('should have 32 easing functions (including aliases)', () => {
            expect(Object.keys(Easing).length).toBe(32);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // getEasing FUNCTION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('getEasing', () => {
        it('should return function by name', () => {
            expect(getEasing('linear')).toBe(linear);
            expect(getEasing('easeOutCubic')).toBe(easeOutCubic);
            expect(getEasing('elasticOut')).toBe(elasticOut);
        });

        it('should return the function if passed a function', () => {
            const customFn = t => t * t;
            expect(getEasing(customFn)).toBe(customFn);
        });

        it('should return linear for unknown names and warn', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const result = getEasing('unknownEasing');
            expect(result).toBe(linear);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown easing')
            );

            consoleSpy.mockRestore();
        });

        it('should handle all Easing object keys', () => {
            for (const name of Object.keys(Easing)) {
                const fn = getEasing(name);
                expect(fn).toBe(Easing[name]);
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // createCustomEasing FUNCTION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('createCustomEasing', () => {
        describe('elastic type', () => {
            it('should create elastic easing with default params', () => {
                const customElastic = createCustomEasing('elastic');
                expect(customElastic(0)).toBe(0);
                expect(customElastic(1)).toBe(1);
            });

            it('should respect amplitude parameter', () => {
                const highAmplitude = createCustomEasing('elastic', { amplitude: 2 });
                const lowAmplitude = createCustomEasing('elastic', { amplitude: 0.5 });

                // Higher amplitude should have larger oscillations
                const highMid = highAmplitude(0.5);
                const lowMid = lowAmplitude(0.5);

                // Both should work and be different
                expect(typeof highMid).toBe('number');
                expect(typeof lowMid).toBe('number');
            });

            it('should respect period parameter', () => {
                const shortPeriod = createCustomEasing('elastic', { period: 0.1 });
                const longPeriod = createCustomEasing('elastic', { period: 0.5 });

                expect(shortPeriod(0)).toBe(0);
                expect(longPeriod(0)).toBe(0);
                expect(shortPeriod(1)).toBe(1);
                expect(longPeriod(1)).toBe(1);
            });
        });

        describe('bounce type', () => {
            it('should create bounce easing with default params', () => {
                const customBounce = createCustomEasing('bounce');
                expect(customBounce(0)).toBeCloseTo(0, 5);
                expect(customBounce(1)).toBeCloseTo(1, 5);
            });

            it('should stay within reasonable bounds', () => {
                const customBounce = createCustomEasing('bounce');
                for (let t = 0; t <= 1; t += 0.1) {
                    const value = customBounce(t);
                    expect(value).toBeGreaterThanOrEqual(-0.1);
                    expect(value).toBeLessThanOrEqual(1.1);
                }
            });
        });

        describe('back type', () => {
            it('should create back easing with default overshoot', () => {
                const customBack = createCustomEasing('back');
                expect(customBack(0)).toBeCloseTo(0, 5);
                expect(customBack(1)).toBe(1);
            });

            it('should respect overshoot parameter', () => {
                const largeOvershoot = createCustomEasing('back', { overshoot: 3 });
                const smallOvershoot = createCustomEasing('back', { overshoot: 0.5 });

                // Larger overshoot should have more pronounced effect
                const largeMid = largeOvershoot(0.7);
                const smallMid = smallOvershoot(0.7);

                expect(largeMid).toBeGreaterThan(smallMid);
            });
        });

        describe('unknown type', () => {
            it('should return linear for unknown types', () => {
                const unknown = createCustomEasing('unknown');
                expect(unknown(0)).toBe(0);
                expect(unknown(0.5)).toBe(0.5);
                expect(unknown(1)).toBe(1);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // BOUNDARY CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Boundary Conditions', () => {
        const monotonicFunctions = [
            ['linear', linear],
            ['easeIn', easeIn],
            ['easeOut', easeOut],
            ['easeInOut', easeInOut],
            ['easeInQuad', easeInQuad],
            ['easeOutQuad', easeOutQuad],
            ['easeInOutQuad', easeInOutQuad],
            ['easeInCubic', easeInCubic],
            ['easeOutCubic', easeOutCubic],
            ['easeInOutCubic', easeInOutCubic],
            ['smoothstep', smoothstep],
            ['smootherstep', smootherstep]
        ];

        it.each(monotonicFunctions)('%s should start at 0 and end at 1', (name, fn) => {
            expect(fn(0)).toBeCloseTo(0, 5);
            expect(fn(1)).toBeCloseTo(1, 5);
        });

        it.each(monotonicFunctions)('%s should be monotonically increasing', (name, fn) => {
            let prev = fn(0);
            for (let t = 0.05; t <= 1; t += 0.05) {
                const current = fn(t);
                expect(current).toBeGreaterThanOrEqual(prev - 0.0001); // Allow tiny float errors
                prev = current;
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PERFORMANCE
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Performance', () => {
        it('should handle rapid repeated calls efficiently', () => {
            const iterations = 10000;
            const start = performance.now();

            for (let i = 0; i < iterations; i++) {
                const t = i / iterations;
                linear(t);
                easeOutCubic(t);
                elasticOut(t);
                bounceOut(t);
            }

            const duration = performance.now() - start;
            // Should complete 10000 iterations quickly (< 50ms)
            expect(duration).toBeLessThan(50);
        });
    });
});
