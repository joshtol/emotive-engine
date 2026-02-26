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
    applyEasing,
} from '../../../src/utils/easing.js';

// All easing functions to test shared properties
const easingFunctions = {
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
};

describe('Easing Functions', () => {
    describe('Boundary conditions (all functions)', () => {
        for (const [name, fn] of Object.entries(easingFunctions)) {
            it(`${name}(0) should equal 0`, () => {
                expect(fn(0)).toBeCloseTo(0, 10);
            });

            it(`${name}(1) should equal 1`, () => {
                expect(fn(1)).toBeCloseTo(1, 5);
            });
        }
    });

    describe('Midpoint sanity', () => {
        for (const [name, fn] of Object.entries(easingFunctions)) {
            it(`${name}(0.5) should return a finite number between -0.5 and 1.5`, () => {
                const mid = fn(0.5);
                expect(Number.isFinite(mid)).toBe(true);
                // Most easing functions stay in [0,1] at midpoint, but back/elastic can overshoot
                expect(mid).toBeGreaterThanOrEqual(-0.5);
                expect(mid).toBeLessThanOrEqual(1.5);
            });
        }
    });

    describe('linear', () => {
        it('should return identity values', () => {
            expect(linear(0.25)).toBe(0.25);
            expect(linear(0.5)).toBe(0.5);
            expect(linear(0.75)).toBe(0.75);
        });
    });

    describe('easeInQuad', () => {
        it('should accelerate (slow start)', () => {
            // At t=0.25, easeIn should be less than linear
            expect(easeInQuad(0.25)).toBeLessThan(0.25);
        });
    });

    describe('easeOutQuad', () => {
        it('should decelerate (fast start)', () => {
            // At t=0.25, easeOut should be more than linear
            expect(easeOutQuad(0.25)).toBeGreaterThan(0.25);
        });
    });

    describe('easeInOutQuad', () => {
        it('should be symmetric around midpoint', () => {
            const val25 = easeInOutQuad(0.25);
            const val75 = easeInOutQuad(0.75);
            expect(val25 + val75).toBeCloseTo(1.0, 5);
        });

        it('should be below linear before midpoint', () => {
            expect(easeInOutQuad(0.25)).toBeLessThan(0.25);
        });

        it('should be above linear after midpoint', () => {
            expect(easeInOutQuad(0.75)).toBeGreaterThan(0.75);
        });
    });

    describe('easeInOutCubic', () => {
        it('should be symmetric around midpoint', () => {
            const val25 = easeInOutCubic(0.25);
            const val75 = easeInOutCubic(0.75);
            expect(val25 + val75).toBeCloseTo(1.0, 5);
        });
    });

    describe('easeOutElastic', () => {
        it('should overshoot past 1.0 at some point', () => {
            // Elastic easing overshoots before settling
            let hasOvershoot = false;
            for (let t = 0.1; t < 1.0; t += 0.01) {
                if (easeOutElastic(t) > 1.0) {
                    hasOvershoot = true;
                    break;
                }
            }
            expect(hasOvershoot).toBe(true);
        });
    });

    describe('easeOutBounce', () => {
        it('should stay in [0, 1] range for inputs in [0, 1]', () => {
            for (let t = 0; t <= 1.0; t += 0.05) {
                const val = easeOutBounce(t);
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThanOrEqual(1.001);
            }
        });

        it('should be monotonically non-decreasing in the long run', () => {
            // The bounce function should end at 1
            expect(easeOutBounce(0.99)).toBeGreaterThan(0.9);
        });
    });

    describe('easeOutSine', () => {
        it('should follow sine curve', () => {
            expect(easeOutSine(0.5)).toBeCloseTo(Math.sin(Math.PI / 4), 5);
        });
    });

    describe('easeInOutSine', () => {
        it('should equal 0.5 at midpoint', () => {
            expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 5);
        });
    });
});

describe('getEasingFunction', () => {
    it('should return the correct function by name', () => {
        expect(getEasingFunction('linear')).toBe(linear);
        expect(getEasingFunction('easeOutQuad')).toBe(easeOutQuad);
        expect(getEasingFunction('easeOutElastic')).toBe(easeOutElastic);
        expect(getEasingFunction('easeOutBounce')).toBe(easeOutBounce);
        expect(getEasingFunction('easeInOutBack')).toBe(easeInOutBack);
    });

    it('should return all 12 easing functions', () => {
        for (const name of Object.keys(easingFunctions)) {
            const fn = getEasingFunction(name);
            expect(typeof fn).toBe('function');
            expect(fn).toBe(easingFunctions[name]);
        }
    });

    it('should fall back to linear for unknown names', () => {
        expect(getEasingFunction('nonexistent')).toBe(linear);
        expect(getEasingFunction('')).toBe(linear);
        expect(getEasingFunction(undefined)).toBe(linear);
    });
});

describe('applyEasing', () => {
    it('should interpolate between start and end', () => {
        expect(applyEasing(0, 0, 100)).toBe(0);
        expect(applyEasing(1, 0, 100)).toBe(100);
        expect(applyEasing(0.5, 0, 100, 'linear')).toBe(50);
    });

    it('should work with negative ranges', () => {
        expect(applyEasing(0.5, -50, 50, 'linear')).toBe(0);
    });

    it('should clamp progress to [0, 1]', () => {
        expect(applyEasing(-0.5, 0, 100, 'linear')).toBe(0);
        expect(applyEasing(1.5, 0, 100, 'linear')).toBe(100);
    });

    it('should accept a custom easing function', () => {
        const customEasing = t => t * t; // quadratic
        expect(applyEasing(0.5, 0, 100, customEasing)).toBe(25);
    });

    it('should default to linear easing', () => {
        expect(applyEasing(0.5, 0, 100)).toBe(50);
    });

    it('should accept string easing names', () => {
        const result = applyEasing(0.5, 0, 100, 'easeInQuad');
        expect(result).toBe(25); // easeInQuad(0.5) = 0.25
    });
});
