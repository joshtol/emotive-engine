/**
 * ShapeCache Tests
 * Tests for the shape caching module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShapeCache } from '../../../../src/core/cache/ShapeCache.js';

describe('ShapeCache', () => {
    let shapeCache;

    beforeEach(() => {
        shapeCache = new ShapeCache();
    });

    afterEach(() => {
        shapeCache.clear();
    });

    describe('Constructor', () => {
        it('should initialize caches as Maps', () => {
            expect(shapeCache.shapeCache).toBeInstanceOf(Map);
            expect(shapeCache.morphCache).toBeInstanceOf(Map);
            expect(shapeCache.propertyCache).toBeInstanceOf(Map);
        });

        it('should initialize stats object', () => {
            expect(shapeCache.stats).toBeDefined();
            expect(shapeCache.stats.hits).toBe(0);
            expect(shapeCache.stats.misses).toBe(0);
        });

        it('should auto-initialize on construction', () => {
            expect(shapeCache.isInitialized).toBe(true);
        });
    });

    describe('initialize()', () => {
        it('should set isInitialized to true on success', () => {
            shapeCache.clear();
            shapeCache.initialize();

            expect(shapeCache.isInitialized).toBe(true);
        });

        it('should calculate loadTime', () => {
            shapeCache.clear();
            shapeCache.initialize();

            expect(shapeCache.stats.loadTime).toBeGreaterThanOrEqual(0);
        });

        it('should populate shape cache', () => {
            expect(shapeCache.shapeCache.size).toBeGreaterThan(0);
        });
    });

    describe('getShape()', () => {
        it('should return cached shape for valid name', () => {
            const shape = shapeCache.getShape('circle');

            expect(shape).toBeDefined();
            expect(shapeCache.stats.hits).toBeGreaterThan(0);
        });

        it('should increment misses for unknown shape', () => {
            const initialMisses = shapeCache.stats.misses;

            shapeCache.getShape('nonexistent-shape');

            expect(shapeCache.stats.misses).toBe(initialMisses + 1);
        });

        it('should return null for unknown shape', () => {
            const shape = shapeCache.getShape('nonexistent-shape');

            expect(shape).toBeNull();
        });

        it('should fall back to direct access if not initialized', () => {
            shapeCache.isInitialized = false;

            const shape = shapeCache.getShape('circle');

            // Should still work via fallback
            expect(shape).toBeDefined();
        });
    });

    describe('getProperties()', () => {
        it('should return cached properties for valid shape', () => {
            const props = shapeCache.getProperties('circle');

            expect(props).toBeDefined();
            expect(props.pointCount).toBeDefined();
            expect(typeof props.isRadial).toBe('boolean');
        });

        it('should return empty object for unknown shape', () => {
            const props = shapeCache.getProperties('nonexistent');

            expect(props).toEqual({});
        });

        it('should include bounds information', () => {
            const props = shapeCache.getProperties('circle');

            if (props.bounds) {
                expect(props.bounds.minX).toBeDefined();
                expect(props.bounds.maxX).toBeDefined();
                expect(props.bounds.width).toBeDefined();
            }
        });
    });

    describe('getMorph()', () => {
        it('should return morph data for common transitions', () => {
            const morph = shapeCache.getMorph('circle', 'heart');

            if (morph) {
                expect(morph.from).toBe('circle');
                expect(morph.to).toBe('heart');
                expect(morph.steps).toBeDefined();
            }
        });

        it('should calculate morph on-demand for uncached pairs', () => {
            // Clear the morph cache
            shapeCache.morphCache.clear();

            const morph = shapeCache.getMorph('circle', 'star');

            // Should still work by calculating
            expect(morph).toBeDefined();
        });
    });

    describe('hasShape()', () => {
        it('should return true for cached shapes', () => {
            expect(shapeCache.hasShape('circle')).toBe(true);
        });

        it('should return false for uncached shapes', () => {
            expect(shapeCache.hasShape('nonexistent')).toBe(false);
        });
    });

    describe('isRadialShape()', () => {
        it('should return true for radial shapes', () => {
            expect(shapeCache.isRadialShape('circle')).toBe(true);
            expect(shapeCache.isRadialShape('star')).toBe(true);
            expect(shapeCache.isRadialShape('square')).toBe(true);
        });

        it('should return false for non-radial shapes', () => {
            expect(shapeCache.isRadialShape('heart')).toBe(false);
            expect(shapeCache.isRadialShape('nonexistent')).toBe(false);
        });
    });

    describe('calculateBounds()', () => {
        it('should calculate bounds from points', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
                { x: 0, y: 1 }
            ];

            const bounds = shapeCache.calculateBounds(points);

            expect(bounds.minX).toBe(0);
            expect(bounds.minY).toBe(0);
            expect(bounds.maxX).toBe(1);
            expect(bounds.maxY).toBe(1);
            expect(bounds.width).toBe(1);
            expect(bounds.height).toBe(1);
        });

        it('should return default bounds for empty points', () => {
            const bounds = shapeCache.calculateBounds([]);

            expect(bounds.width).toBe(1);
            expect(bounds.height).toBe(1);
        });

        it('should return default bounds for null points', () => {
            const bounds = shapeCache.calculateBounds(null);

            expect(bounds).toBeDefined();
            expect(bounds.width).toBe(1);
        });
    });

    describe('interpolateShapePoints()', () => {
        it('should interpolate between two point arrays', () => {
            const from = [{ x: 0, y: 0 }];
            const to = [{ x: 1, y: 1 }];

            const result = shapeCache.interpolateShapePoints(from, to, 0.5);

            expect(result[0].x).toBeCloseTo(0.5);
            expect(result[0].y).toBeCloseTo(0.5);
        });

        it('should return from points at progress 0', () => {
            const from = [{ x: 0, y: 0 }];
            const to = [{ x: 1, y: 1 }];

            const result = shapeCache.interpolateShapePoints(from, to, 0);

            expect(result[0].x).toBe(0);
            expect(result[0].y).toBe(0);
        });

        it('should return to points at progress 1', () => {
            const from = [{ x: 0, y: 0 }];
            const to = [{ x: 1, y: 1 }];

            const result = shapeCache.interpolateShapePoints(from, to, 1);

            expect(result[0].x).toBe(1);
            expect(result[0].y).toBe(1);
        });

        it('should handle arrays of different lengths', () => {
            const from = [{ x: 0, y: 0 }];
            const to = [{ x: 1, y: 1 }, { x: 2, y: 2 }];

            const result = shapeCache.interpolateShapePoints(from, to, 0.5);

            expect(result.length).toBe(2);
        });

        it('should return empty array for null inputs', () => {
            const result = shapeCache.interpolateShapePoints(null, null, 0.5);

            expect(result).toEqual([]);
        });
    });

    describe('calculateMorphSteps()', () => {
        it('should calculate morph steps between shapes', () => {
            const morph = shapeCache.calculateMorphSteps('circle', 'heart');

            if (morph) {
                expect(morph.from).toBe('circle');
                expect(morph.to).toBe('heart');
                expect(morph.steps.length).toBe(5);
            }
        });

        it('should include progress values in steps', () => {
            const morph = shapeCache.calculateMorphSteps('circle', 'star');

            if (morph && morph.steps) {
                expect(morph.steps[0].progress).toBe(0);
                expect(morph.steps[morph.steps.length - 1].progress).toBe(1);
            }
        });

        it('should return null if shapes not found', () => {
            const morph = shapeCache.calculateMorphSteps('nonexistent1', 'nonexistent2');

            expect(morph).toBeNull();
        });
    });

    describe('getStats()', () => {
        it('should return statistics object', () => {
            const stats = shapeCache.getStats();

            expect(stats.hits).toBeDefined();
            expect(stats.misses).toBeDefined();
            expect(stats.hitRate).toBeDefined();
            expect(stats.shapes).toBeDefined();
        });

        it('should calculate hit rate', () => {
            // Generate some hits and misses
            shapeCache.getShape('circle');
            shapeCache.getShape('nonexistent');

            const stats = shapeCache.getStats();

            expect(stats.hitRate).toMatch(/\d+(\.\d+)?%/);
        });
    });

    describe('clear()', () => {
        it('should clear all caches', () => {
            shapeCache.getShape('circle'); // Populate

            shapeCache.clear();

            expect(shapeCache.shapeCache.size).toBe(0);
            expect(shapeCache.morphCache.size).toBe(0);
            expect(shapeCache.propertyCache.size).toBe(0);
        });

        it('should reset stats', () => {
            shapeCache.getShape('circle');
            shapeCache.clear();

            expect(shapeCache.stats.hits).toBe(0);
            expect(shapeCache.stats.misses).toBe(0);
        });

        it('should set isInitialized to false', () => {
            shapeCache.clear();

            expect(shapeCache.isInitialized).toBe(false);
        });
    });
});
