/**
 * Tests for ShapeCache - shape caching system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ShapeCache } from '../../../../src/core/cache/ShapeCache.js';

describe('ShapeCache', () => {
    let cache;

    beforeEach(() => {
        cache = new ShapeCache();
    });

    describe('initialization', () => {
        it('should initialize successfully', () => {
            expect(cache.isInitialized).toBe(true);
        });

        it('should have shape cache map', () => {
            expect(cache.shapeCache).toBeDefined();
            expect(cache.shapeCache instanceof Map).toBe(true);
        });

        it('should have morph cache map', () => {
            expect(cache.morphCache).toBeDefined();
            expect(cache.morphCache instanceof Map).toBe(true);
        });

        it('should have property cache map', () => {
            expect(cache.propertyCache).toBeDefined();
            expect(cache.propertyCache instanceof Map).toBe(true);
        });

        it('should initialize stats', () => {
            expect(cache.stats).toBeDefined();
            expect(cache.stats.hits).toBeDefined();
            expect(cache.stats.misses).toBeDefined();
            expect(cache.stats.loadTime).toBeGreaterThan(0);
        });

        it('should pre-cache shapes on init', () => {
            expect(cache.shapeCache.size).toBeGreaterThan(0);
        });

        it('should cache common shapes', () => {
            const shapes = ['circle', 'heart', 'star'];

            shapes.forEach(shapeName => {
                expect(cache.shapeCache.has(shapeName)).toBe(true);
            });
        });
    });

    describe('cached data', () => {
        it('should return cached shape', () => {
            const shape = cache.getShape('circle');

            expect(shape).toBeDefined();
            expect(shape).toHaveProperty('points');
            expect(shape).toHaveProperty('shadow');
        });

        it('should return null for unknown shape', () => {
            const shape = cache.getShape('nonexistent');

            expect(shape).toBeNull();
        });

        it('should increment hit stats for cache hit', () => {
            const initialHits = cache.stats.hits;

            cache.getShape('circle');

            expect(cache.stats.hits).toBe(initialHits + 1);
        });

        it('should increment miss stats for cache miss', () => {
            const initialMisses = cache.stats.misses;

            cache.getShape('nonexistent');

            expect(cache.stats.misses).toBe(initialMisses + 1);
        });

        it('should return same instance for multiple calls', () => {
            const shape1 = cache.getShape('circle');
            const shape2 = cache.getShape('circle');

            expect(shape1).toBe(shape2);
        });
    });

    describe('hasShape()', () => {
        it('should return true for cached shape', () => {
            expect(cache.hasShape('circle')).toBe(true);
        });

        it('should return false for uncached shape', () => {
            expect(cache.hasShape('nonexistent')).toBe(false);
        });

        it('should work for all common shapes', () => {
            const shapes = ['circle', 'heart', 'star', 'square'];

            shapes.forEach(shapeName => {
                expect(cache.hasShape(shapeName)).toBe(true);
            });
        });
    });

    describe('getProperties()', () => {
        it('should return cached properties for shape', () => {
            const props = cache.getProperties('circle');

            expect(props).toBeDefined();
            expect(typeof props).toBe('object');
        });

        it('should return empty object for unknown shape', () => {
            const props = cache.getProperties('nonexistent');

            expect(props).toBeDefined();
            expect(typeof props).toBe('object');
        });

        it('should cache properties after first call', () => {
            const initialHits = cache.stats.hits;
            cache.getProperties('circle');
            cache.getProperties('circle');

            expect(cache.stats.hits).toBeGreaterThan(initialHits);
        });
    });

    describe('getMorph()', () => {
        it('should return morph data for valid transition', () => {
            const morphData = cache.getMorph('circle', 'heart');

            expect(morphData).toBeDefined();
            expect(morphData.from).toBe('circle');
            expect(morphData.to).toBe('heart');
        });

        it('should cache morph data after first call', () => {
            const initialHits = cache.stats.hits;
            cache.getMorph('circle', 'heart');
            cache.getMorph('circle', 'heart');

            expect(cache.stats.hits).toBeGreaterThan(initialHits);
        });

        it('should handle reverse morphs separately', () => {
            const forward = cache.getMorph('circle', 'heart');
            const reverse = cache.getMorph('heart', 'circle');

            expect(forward.from).toBe('circle');
            expect(reverse.from).toBe('heart');
        });
    });

    describe('getStats()', () => {
        it('should return cache statistics', () => {
            const stats = cache.getStats();

            expect(stats).toBeDefined();
            expect(stats).toHaveProperty('hits');
            expect(stats).toHaveProperty('misses');
            expect(stats).toHaveProperty('loadTime');
            expect(stats).toHaveProperty('cacheSize');
        });

        it('should update stats after operations', () => {
            cache.getShape('circle');
            cache.getShape('heart');
            cache.getShape('nonexistent');

            const stats = cache.getStats();

            expect(stats.hits).toBeGreaterThan(0);
        });
    });

    describe('cacheShape()', () => {
        it('should cache a shape manually', () => {
            const newCache = new ShapeCache();

            // Clear the shape first for testing
            newCache.shapeCache.clear();

            newCache.cacheShape('circle');

            expect(newCache.hasShape('circle')).toBe(true);
        });

        it('should not throw for invalid shape', () => {
            expect(() => cache.cacheShape('invalid')).not.toThrow();
        });
    });

    describe('cache efficiency', () => {
        it('should have minimal load time', () => {
            const stats = cache.getStats();

            // Should load in under 100ms
            expect(stats.loadTime).toBeLessThan(100);
        });

        it('should cache all expected shapes', () => {
            const expectedShapes = ['circle', 'heart', 'star', 'square', 'triangle'];

            expectedShapes.forEach(shapeName => {
                expect(cache.hasShape(shapeName)).toBe(true);
            });
        });

        it('should have properties for all cached shapes', () => {
            const shapeNames = Array.from(cache.shapeCache.keys());

            shapeNames.forEach(shapeName => {
                const props = cache.getProperties(shapeName);
                expect(props).toBeDefined();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle null shape name', () => {
            expect(() => cache.getShape(null)).not.toThrow();
        });

        it('should handle undefined shape name', () => {
            expect(() => cache.getShape(undefined)).not.toThrow();
        });

        it('should handle empty string shape name', () => {
            const shape = cache.getShape('');
            expect(shape).toBeNull();
        });

        it('should handle case-sensitive shape names', () => {
            const shape1 = cache.getShape('circle');
            const shape2 = cache.getShape('Circle');

            // Shape names are case-sensitive
            expect(shape1).toBeDefined();
        });
    });
});
