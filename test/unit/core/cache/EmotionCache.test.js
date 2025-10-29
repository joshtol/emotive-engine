/**
 * Tests for EmotionCache - emotion caching system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EmotionCache } from '../../../../src/core/cache/EmotionCache.js';

describe('EmotionCache', () => {
    let cache;

    beforeEach(() => {
        cache = new EmotionCache();
    });

    describe('initialization', () => {
        it('should initialize successfully', () => {
            expect(cache.isInitialized).toBe(true);
        });

        it('should have emotion cache map', () => {
            expect(cache.emotionCache).toBeDefined();
            expect(cache.emotionCache instanceof Map).toBe(true);
        });

        it('should have visual params cache map', () => {
            expect(cache.visualParamsCache).toBeDefined();
            expect(cache.visualParamsCache instanceof Map).toBe(true);
        });

        it('should have modifiers cache map', () => {
            expect(cache.modifiersCache).toBeDefined();
            expect(cache.modifiersCache instanceof Map).toBe(true);
        });

        it('should have transition cache map', () => {
            expect(cache.transitionCache).toBeDefined();
            expect(cache.transitionCache instanceof Map).toBe(true);
        });

        it('should initialize stats', () => {
            expect(cache.stats).toBeDefined();
            expect(cache.stats.hits).toBeDefined();
            expect(cache.stats.misses).toBeDefined();
            expect(cache.stats.loadTime).toBeGreaterThan(0);
        });

        it('should pre-cache emotions on init', () => {
            expect(cache.emotionCache.size).toBeGreaterThan(0);
        });

        it('should cache common emotions', () => {
            const emotions = ['neutral', 'joy', 'sadness'];

            emotions.forEach(emotionName => {
                expect(cache.emotionCache.has(emotionName)).toBe(true);
            });
        });
    });

    describe('getEmotion()', () => {
        it('should return cached emotion', () => {
            const emotion = cache.getEmotion('joy');

            expect(emotion).toBeDefined();
        });

        it('should return emotion for unknown emotion name', () => {
            const emotion = cache.getEmotion('nonexistent');

            // Should handle gracefully
            expect(emotion !== undefined).toBe(true);
        });

        it('should increment hit stats for cache hit', () => {
            const initialHits = cache.stats.hits;

            cache.getEmotion('joy');

            expect(cache.stats.hits).toBe(initialHits + 1);
        });

        it('should increment miss stats for cache miss', () => {
            const initialMisses = cache.stats.misses;

            cache.getEmotion('nonexistent');

            expect(cache.stats.misses).toBe(initialMisses + 1);
        });

        it('should return same instance for multiple calls', () => {
            const emotion1 = cache.getEmotion('joy');
            const emotion2 = cache.getEmotion('joy');

            expect(emotion1).toBe(emotion2);
        });
    });

    describe('getVisualParams()', () => {
        it('should return cached visual params', () => {
            const params = cache.getVisualParams('joy');

            expect(params).toBeDefined();
            expect(typeof params).toBe('object');
        });

        it('should return visual params for unknown emotion', () => {
            const params = cache.getVisualParams('nonexistent');

            expect(params).toBeDefined();
        });

        it('should increment hit stats for cache hit', () => {
            const initialHits = cache.stats.hits;

            cache.getVisualParams('joy');

            expect(cache.stats.hits).toBe(initialHits + 1);
        });

        it('should return same instance for multiple calls', () => {
            const params1 = cache.getVisualParams('joy');
            const params2 = cache.getVisualParams('joy');

            expect(params1).toBe(params2);
        });
    });

    describe('getModifiers()', () => {
        it('should return cached modifiers', () => {
            const modifiers = cache.getModifiers('joy');

            expect(modifiers).toBeDefined();
            expect(typeof modifiers).toBe('object');
        });

        it('should return modifiers for unknown emotion', () => {
            const modifiers = cache.getModifiers('nonexistent');

            expect(modifiers).toBeDefined();
        });

        it('should increment hit stats for cache hit', () => {
            const initialHits = cache.stats.hits;

            cache.getModifiers('joy');

            expect(cache.stats.hits).toBe(initialHits + 1);
        });

        it('should return same instance for multiple calls', () => {
            const modifiers1 = cache.getModifiers('joy');
            const modifiers2 = cache.getModifiers('joy');

            expect(modifiers1).toBe(modifiers2);
        });
    });

    describe('getTransitionParams()', () => {
        it('should return transition params for valid transition', () => {
            const params = cache.getTransitionParams('neutral', 'joy');

            expect(params).toBeDefined();
            expect(typeof params).toBe('object');
        });

        it('should cache transition params after first call', () => {
            const initialHits = cache.stats.hits;

            cache.getTransitionParams('neutral', 'joy');
            cache.getTransitionParams('neutral', 'joy');

            expect(cache.stats.hits).toBeGreaterThan(initialHits);
        });

        it('should handle reverse transitions separately', () => {
            const forward = cache.getTransitionParams('neutral', 'joy');
            const reverse = cache.getTransitionParams('joy', 'neutral');

            expect(forward).toBeDefined();
            expect(reverse).toBeDefined();
        });

        it('should handle same source and target', () => {
            const params = cache.getTransitionParams('joy', 'joy');

            expect(params).toBeDefined();
        });
    });

    describe('hasEmotion()', () => {
        it('should return true for cached emotion', () => {
            expect(cache.hasEmotion('joy')).toBe(true);
        });

        it('should return false for uncached emotion', () => {
            expect(cache.hasEmotion('nonexistent')).toBe(false);
        });

        it('should work for all common emotions', () => {
            const emotions = ['neutral', 'joy', 'sadness', 'anger'];

            emotions.forEach(emotionName => {
                expect(cache.hasEmotion(emotionName)).toBe(true);
            });
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
            expect(stats).toHaveProperty('emotions');
            expect(stats).toHaveProperty('visualParams');
            expect(stats).toHaveProperty('modifiers');
            expect(stats).toHaveProperty('transitions');
        });

        it('should update stats after operations', () => {
            cache.getEmotion('joy');
            cache.getVisualParams('sadness');
            cache.getModifiers('anger');

            const stats = cache.getStats();

            expect(stats.hits).toBeGreaterThan(0);
        });

        it('should calculate hit rate', () => {
            cache.getEmotion('joy');
            cache.getEmotion('nonexistent');

            const stats = cache.getStats();

            expect(stats.hitRate).toBeDefined();
            expect(typeof stats.hitRate).toBe('string');
            expect(stats.hitRate).toContain('%');
        });
    });

    describe('cacheEmotion()', () => {
        it('should cache an emotion manually', () => {
            const newCache = new EmotionCache();

            // Clear the emotion first for testing
            newCache.emotionCache.clear();

            newCache.cacheEmotion('joy');

            expect(newCache.hasEmotion('joy')).toBe(true);
        });

        it('should not throw for invalid emotion', () => {
            expect(() => cache.cacheEmotion('invalid')).not.toThrow();
        });
    });

    describe('cache efficiency', () => {
        it('should have minimal load time', () => {
            const stats = cache.getStats();

            // Should load in under 100ms
            expect(stats.loadTime).toBeLessThan(100);
        });

        it('should cache all expected emotions', () => {
            const expectedEmotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise'];

            expectedEmotions.forEach(emotionName => {
                expect(cache.hasEmotion(emotionName)).toBe(true);
            });
        });

        it('should have visual params for all cached emotions', () => {
            const emotionNames = Array.from(cache.emotionCache.keys());

            emotionNames.forEach(emotionName => {
                const params = cache.getVisualParams(emotionName);
                expect(params).toBeDefined();
            });
        });

        it('should have modifiers for all cached emotions', () => {
            const emotionNames = Array.from(cache.emotionCache.keys());

            emotionNames.forEach(emotionName => {
                const modifiers = cache.getModifiers(emotionName);
                expect(modifiers).toBeDefined();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle null emotion name', () => {
            expect(() => cache.getEmotion(null)).not.toThrow();
        });

        it('should handle undefined emotion name', () => {
            expect(() => cache.getEmotion(undefined)).not.toThrow();
        });

        it('should handle empty string emotion name', () => {
            const emotion = cache.getEmotion('');
            expect(emotion !== undefined).toBe(true);
        });

        it('should handle case-sensitive emotion names', () => {
            const emotion1 = cache.getEmotion('joy');
            const emotion2 = cache.getEmotion('Joy');

            // Emotion names are case-sensitive
            expect(emotion1).toBeDefined();
        });
    });
});
