/**
 * Test suite for GradientCache
 * @module test/GradientCache.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GradientCache } from '../src/core/renderer/GradientCache.js';

describe('GradientCache', () => {
    let cache;
    let mockCtx;
    let mockGradient;

    beforeEach(() => {
        cache = new GradientCache();

        // Mock gradient object
        mockGradient = {
            addColorStop: vi.fn()
        };

        // Mock canvas context
        mockCtx = {
            createRadialGradient: vi.fn(() => mockGradient),
            createLinearGradient: vi.fn(() => mockGradient)
        };
    });

    afterEach(() => {
        cache.clear();
    });

    describe('Key Generation', () => {
        it('should generate unique keys for radial gradients', () => {
            const key1 = cache.generateKey('radial', {
                x0: 0, y0: 0, r0: 10,
                x1: 100, y1: 100, r1: 50,
                stops: [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' }
                ]
            });

            const key2 = cache.generateKey('radial', {
                x0: 0, y0: 0, r0: 10,
                x1: 100, y1: 100, r1: 51, // Different r1
                stops: [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' }
                ]
            });

            expect(key1).not.toBe(key2);
            expect(key1).toContain('radial:');
            expect(key1).toContain('0:red|1:blue');
        });

        it('should generate unique keys for linear gradients', () => {
            const key1 = cache.generateKey('linear', {
                x0: 0, y0: 0, x1: 100, y1: 100,
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 0.5, color: '#00ff00' },
                    { offset: 1, color: '#0000ff' }
                ]
            });

            const key2 = cache.generateKey('linear', {
                x0: 0, y0: 0, x1: 100, y1: 100,
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 0.5, color: '#00ff00' },
                    { offset: 1, color: '#0000fe' } // Slightly different blue
                ]
            });

            expect(key1).not.toBe(key2);
            expect(key1).toContain('linear:');
            expect(key1).toContain('0:#ff0000|0.5:#00ff00|1:#0000ff');
        });

        it('should generate same key for identical parameters', () => {
            const params = {
                x0: 50, y0: 50, r0: 0,
                x1: 50, y1: 50, r1: 100,
                stops: [
                    { offset: 0, color: 'rgba(255,0,0,1)' },
                    { offset: 1, color: 'rgba(0,0,255,0)' }
                ]
            };

            const key1 = cache.generateKey('radial', params);
            const key2 = cache.generateKey('radial', params);

            expect(key1).toBe(key2);
        });
    });

    describe('Radial Gradient Caching', () => {
        it('should create new gradient on first request', () => {
            const gradient = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 100, 100, 50,
                [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' }
                ]
            );

            expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(0, 0, 0, 100, 100, 50);
            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
            expect(gradient).toBe(mockGradient);
            expect(cache.stats.misses).toBe(1);
            expect(cache.stats.hits).toBe(0);
        });

        it('should return cached gradient on second request', () => {
            const stops = [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' }
            ];

            // First request - creates new
            const gradient1 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 100, 100, 50, stops
            );

            // Reset mock
            mockCtx.createRadialGradient.mockClear();
            mockGradient.addColorStop.mockClear();

            // Second request - should use cache
            const gradient2 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 100, 100, 50, stops
            );

            expect(mockCtx.createRadialGradient).not.toHaveBeenCalled();
            expect(mockGradient.addColorStop).not.toHaveBeenCalled();
            expect(gradient2).toBe(gradient1);
            expect(cache.stats.hits).toBe(1);
            expect(cache.stats.misses).toBe(1);
        });

        it('should handle complex color stops', () => {
            const stops = [
                { offset: 0, color: 'rgba(255, 0, 0, 1)' },
                { offset: 0.2, color: 'rgba(255, 128, 0, 0.8)' },
                { offset: 0.5, color: 'rgba(255, 255, 0, 0.5)' },
                { offset: 0.8, color: 'rgba(0, 255, 0, 0.2)' },
                { offset: 1, color: 'rgba(0, 0, 255, 0)' }
            ];

            cache.getRadialGradient(mockCtx, 50, 50, 10, 50, 50, 100, stops);

            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(5);
            stops.forEach(stop => {
                expect(mockGradient.addColorStop).toHaveBeenCalledWith(stop.offset, stop.color);
            });
        });
    });

    describe('Linear Gradient Caching', () => {
        it('should create new gradient on first request', () => {
            const gradient = cache.getLinearGradient(
                mockCtx, 0, 0, 100, 100,
                [
                    { offset: 0, color: 'white' },
                    { offset: 1, color: 'black' }
                ]
            );

            expect(mockCtx.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 100);
            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
            expect(gradient).toBe(mockGradient);
            expect(cache.stats.misses).toBe(1);
        });

        it('should return cached gradient on second request', () => {
            const stops = [
                { offset: 0, color: 'white' },
                { offset: 1, color: 'black' }
            ];

            // First request
            const gradient1 = cache.getLinearGradient(
                mockCtx, 0, 0, 100, 100, stops
            );

            // Reset mock
            mockCtx.createLinearGradient.mockClear();

            // Second request
            const gradient2 = cache.getLinearGradient(
                mockCtx, 0, 0, 100, 100, stops
            );

            expect(mockCtx.createLinearGradient).not.toHaveBeenCalled();
            expect(gradient2).toBe(gradient1);
            expect(cache.stats.hits).toBe(1);
        });
    });

    describe('LRU Eviction', () => {
        it('should evict least recently used gradient when cache is full', () => {
            cache.maxSize = 3;

            // Fill cache
            const gradient1 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            const gradient2 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 20, 20, 20,
                [{ offset: 0, color: 'green' }, { offset: 1, color: 'yellow' }]
            );

            const gradient3 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 30, 30, 30,
                [{ offset: 0, color: 'black' }, { offset: 1, color: 'white' }]
            );

            expect(cache.cache.size).toBe(3);

            // Access gradient1 to make it recently used
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            // Add new gradient - should evict gradient2 (least recently used)
            const gradient4 = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 40, 40, 40,
                [{ offset: 0, color: 'purple' }, { offset: 1, color: 'orange' }]
            );

            expect(cache.cache.size).toBe(3);
            expect(cache.stats.evictions).toBe(1);

            // Check that gradient2 was evicted
            mockCtx.createRadialGradient.mockClear();
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 20, 20, 20,
                [{ offset: 0, color: 'green' }, { offset: 1, color: 'yellow' }]
            );
            expect(mockCtx.createRadialGradient).toHaveBeenCalled(); // Had to recreate
        });

        it('should update access order on cache hit', () => {
            cache.maxSize = 2;

            // Add two gradients
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 20, 20, 20,
                [{ offset: 0, color: 'green' }, { offset: 1, color: 'yellow' }]
            );

            // Access first gradient again
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            // Access order should now be updated
            expect(cache.accessOrder[cache.accessOrder.length - 1]).toContain('10,10,10');
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should expire cached gradients after TTL', () => {
            cache.ttl = 100; // 100ms TTL for testing

            const stops = [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }];

            // Create gradient
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops);
            expect(cache.stats.misses).toBe(1);

            // Immediately access - should be cached
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops);
            expect(cache.stats.hits).toBe(1);

            // Mock time passing
            const key = cache.generateKey('radial', {
                x0: 0, y0: 0, r0: 0, x1: 10, y1: 10, r1: 10, stops
            });
            const cached = cache.cache.get(key);
            cached.timestamp = Date.now() - 200; // Expired

            // Access after expiry - should recreate
            mockCtx.createRadialGradient.mockClear();
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops);
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(cache.stats.misses).toBe(2);
        });

        it('should clear expired entries', () => {
            cache.ttl = 100;

            // Add some gradients
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 20, 20, 20,
                [{ offset: 0, color: 'green' }, { offset: 1, color: 'yellow' }]
            );

            expect(cache.cache.size).toBe(2);

            // Mark first as expired
            const firstKey = Array.from(cache.cache.keys())[0];
            cache.cache.get(firstKey).timestamp = Date.now() - 200;

            // Clear expired
            cache.clearExpired();

            expect(cache.cache.size).toBe(1);
        });
    });

    describe('Statistics', () => {
        it('should track cache statistics', () => {
            const stops = [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }];

            // Generate some activity
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops); // Miss
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops); // Hit
            cache.getRadialGradient(mockCtx, 0, 0, 0, 10, 10, 10, stops); // Hit
            cache.getRadialGradient(mockCtx, 0, 0, 0, 20, 20, 20, stops); // Miss

            const stats = cache.getStats();

            expect(stats.size).toBe(2);
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe('50.00%');
            expect(stats.evictions).toBe(0);
        });

        it('should handle zero operations in hit rate', () => {
            const stats = cache.getStats();
            expect(stats.hitRate).toBe('0%');
        });
    });

    describe('Clear Operations', () => {
        it('should clear all cached gradients', () => {
            // Add some gradients
            cache.getRadialGradient(
                mockCtx, 0, 0, 0, 10, 10, 10,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            cache.getLinearGradient(
                mockCtx, 0, 0, 100, 100,
                [{ offset: 0, color: 'white' }, { offset: 1, color: 'black' }]
            );

            expect(cache.cache.size).toBe(2);
            expect(cache.accessOrder.length).toBe(2);

            cache.clear();

            expect(cache.cache.size).toBe(0);
            expect(cache.accessOrder.length).toBe(0);
        });
    });

    describe('Helper Creation', () => {
        it('should create a helper with bound context', () => {
            const helper = cache.createHelper(mockCtx);

            expect(helper).toHaveProperty('radial');
            expect(helper).toHaveProperty('linear');

            // Use helper
            const gradient = helper.radial(
                0, 0, 0, 100, 100, 50,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(gradient).toBe(mockGradient);
        });

        it('should cache through helper', () => {
            const helper = cache.createHelper(mockCtx);
            const stops = [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }];

            // First call
            helper.radial(0, 0, 0, 100, 100, 50, stops);
            expect(cache.stats.misses).toBe(1);

            // Second call - should be cached
            helper.radial(0, 0, 0, 100, 100, 50, stops);
            expect(cache.stats.hits).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty color stops', () => {
            const gradient = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 100, 100, 50, []
            );

            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
            expect(mockGradient.addColorStop).not.toHaveBeenCalled();
        });

        it('should handle single color stop', () => {
            const gradient = cache.getRadialGradient(
                mockCtx, 0, 0, 0, 100, 100, 50,
                [{ offset: 0.5, color: 'red' }]
            );

            expect(mockGradient.addColorStop).toHaveBeenCalledWith(0.5, 'red');
            expect(mockGradient.addColorStop).toHaveBeenCalledTimes(1);
        });

        it('should handle identical start and end positions', () => {
            const gradient = cache.getRadialGradient(
                mockCtx, 50, 50, 0, 50, 50, 0,
                [{ offset: 0, color: 'red' }, { offset: 1, color: 'blue' }]
            );

            expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(50, 50, 0, 50, 50, 0);
        });
    });
});