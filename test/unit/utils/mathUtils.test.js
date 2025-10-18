/**
 * Math Utilities Tests
 * Tests for mathematical helper functions
 */

import { describe, it, expect } from 'vitest';

// Test clamp function
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Test lerp function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Test map function
function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

// Test distance function
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Test normalize function
function normalize(value, min, max) {
    return (value - min) / (max - min);
}

describe('Math Utilities', () => {
    describe('clamp()', () => {
        it('should clamp value to min', () => {
            expect(clamp(-10, 0, 100)).toBe(0);
        });

        it('should clamp value to max', () => {
            expect(clamp(150, 0, 100)).toBe(100);
        });

        it('should not clamp value within range', () => {
            expect(clamp(50, 0, 100)).toBe(50);
        });

        it('should handle negative ranges', () => {
            expect(clamp(-150, -100, -50)).toBe(-100);
            expect(clamp(-25, -100, -50)).toBe(-50);
        });

        it('should handle zero', () => {
            expect(clamp(0, -10, 10)).toBe(0);
        });
    });

    describe('lerp()', () => {
        it('should interpolate at 0%', () => {
            expect(lerp(0, 100, 0)).toBe(0);
        });

        it('should interpolate at 50%', () => {
            expect(lerp(0, 100, 0.5)).toBe(50);
        });

        it('should interpolate at 100%', () => {
            expect(lerp(0, 100, 1)).toBe(100);
        });

        it('should handle negative values', () => {
            expect(lerp(-100, 100, 0.5)).toBe(0);
        });

        it('should handle reversed range', () => {
            expect(lerp(100, 0, 0.5)).toBe(50);
        });

        it('should extrapolate beyond 1', () => {
            expect(lerp(0, 100, 1.5)).toBe(150);
        });
    });

    describe('map()', () => {
        it('should map value from one range to another', () => {
            expect(map(5, 0, 10, 0, 100)).toBe(50);
        });

        it('should handle negative ranges', () => {
            expect(map(0, -10, 10, 0, 100)).toBe(50);
        });

        it('should handle reversed output range', () => {
            expect(map(5, 0, 10, 100, 0)).toBe(50);
        });

        it('should handle min value', () => {
            expect(map(0, 0, 10, 0, 100)).toBe(0);
        });

        it('should handle max value', () => {
            expect(map(10, 0, 10, 0, 100)).toBe(100);
        });
    });

    describe('distance()', () => {
        it('should calculate distance between two points', () => {
            expect(distance(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
        });

        it('should handle same point', () => {
            expect(distance(5, 5, 5, 5)).toBe(0);
        });

        it('should handle horizontal distance', () => {
            expect(distance(0, 0, 10, 0)).toBe(10);
        });

        it('should handle vertical distance', () => {
            expect(distance(0, 0, 0, 10)).toBe(10);
        });

        it('should handle negative coordinates', () => {
            expect(distance(-3, -4, 0, 0)).toBe(5);
        });
    });

    describe('normalize()', () => {
        it('should normalize value to 0-1 range', () => {
            expect(normalize(50, 0, 100)).toBe(0.5);
        });

        it('should handle min value', () => {
            expect(normalize(0, 0, 100)).toBe(0);
        });

        it('should handle max value', () => {
            expect(normalize(100, 0, 100)).toBe(1);
        });

        it('should handle negative range', () => {
            expect(normalize(0, -100, 100)).toBe(0.5);
        });

        it('should allow values outside range', () => {
            expect(normalize(150, 0, 100)).toBe(1.5);
        });
    });
});
