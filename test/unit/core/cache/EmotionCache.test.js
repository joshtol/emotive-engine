/**
 * EmotionCache Tests
 * Tests for the emotion caching module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmotionCache } from '../../../../src/core/cache/EmotionCache.js';

describe('EmotionCache', () => {
    let emotionCache;

    beforeEach(() => {
        emotionCache = new EmotionCache();
    });

    afterEach(() => {
        emotionCache.clear();
    });

    describe('Constructor', () => {
        it('should initialize caches as Maps', () => {
            expect(emotionCache.emotionCache).toBeInstanceOf(Map);
            expect(emotionCache.visualParamsCache).toBeInstanceOf(Map);
            expect(emotionCache.modifiersCache).toBeInstanceOf(Map);
            expect(emotionCache.transitionCache).toBeInstanceOf(Map);
        });

        it('should initialize stats object', () => {
            expect(emotionCache.stats).toBeDefined();
            expect(emotionCache.stats.hits).toBe(0);
            expect(emotionCache.stats.misses).toBe(0);
            expect(emotionCache.stats.loadTime).toBeGreaterThanOrEqual(0);
            expect(emotionCache.stats.cacheSize).toBeGreaterThanOrEqual(0);
        });

        it('should auto-initialize on construction', () => {
            expect(emotionCache.isInitialized).toBe(true);
        });
    });

    describe('initialize()', () => {
        it('should set isInitialized to true on success', () => {
            emotionCache.clear();
            emotionCache.initialize();

            expect(emotionCache.isInitialized).toBe(true);
        });

        it('should calculate loadTime', () => {
            emotionCache.clear();
            emotionCache.initialize();

            expect(emotionCache.stats.loadTime).toBeGreaterThanOrEqual(0);
        });

        it('should set cacheSize', () => {
            emotionCache.clear();
            emotionCache.initialize();

            expect(emotionCache.stats.cacheSize).toBe(emotionCache.emotionCache.size);
        });

        it('should populate emotion cache', () => {
            expect(emotionCache.emotionCache.size).toBeGreaterThan(0);
        });
    });

    describe('getEmotion()', () => {
        it('should return cached emotion for valid name', () => {
            const emotion = emotionCache.getEmotion('neutral');

            expect(emotion).toBeDefined();
        });

        it('should increment hits for cached emotion', () => {
            const initialHits = emotionCache.stats.hits;

            emotionCache.getEmotion('neutral');

            expect(emotionCache.stats.hits).toBe(initialHits + 1);
        });

        it('should increment misses for uncached emotion', () => {
            const initialMisses = emotionCache.stats.misses;

            emotionCache.getEmotion('nonexistent-emotion');

            expect(emotionCache.stats.misses).toBe(initialMisses + 1);
        });

        it('should fall back to direct access if not initialized', () => {
            emotionCache.isInitialized = false;

            const emotion = emotionCache.getEmotion('neutral');

            expect(emotion).toBeDefined();
        });
    });

    describe('getVisualParams()', () => {
        it('should return cached visual params for valid emotion', () => {
            const params = emotionCache.getVisualParams('neutral');

            expect(params).toBeDefined();
        });

        it('should increment hits for cached params', () => {
            const initialHits = emotionCache.stats.hits;

            emotionCache.getVisualParams('neutral');

            expect(emotionCache.stats.hits).toBe(initialHits + 1);
        });

        it('should fall back to direct access if not initialized', () => {
            emotionCache.isInitialized = false;

            const params = emotionCache.getVisualParams('neutral');

            expect(params).toBeDefined();
        });
    });

    describe('getModifiers()', () => {
        it('should return cached modifiers for valid emotion', () => {
            const modifiers = emotionCache.getModifiers('neutral');

            expect(modifiers).toBeDefined();
        });

        it('should increment hits for cached modifiers', () => {
            const initialHits = emotionCache.stats.hits;

            emotionCache.getModifiers('neutral');

            expect(emotionCache.stats.hits).toBe(initialHits + 1);
        });

        it('should fall back to direct access if not initialized', () => {
            emotionCache.isInitialized = false;

            const modifiers = emotionCache.getModifiers('neutral');

            expect(modifiers).toBeDefined();
        });
    });

    describe('getTransitionParams()', () => {
        it('should return cached transition for common pairs', () => {
            const transition = emotionCache.getTransitionParams('neutral', 'joy');

            expect(transition).toBeDefined();
        });

        it('should increment hits for cached transition', () => {
            const initialHits = emotionCache.stats.hits;

            emotionCache.getTransitionParams('neutral', 'joy');

            expect(emotionCache.stats.hits).toBe(initialHits + 1);
        });

        it('should fall back to direct access for uncached transition', () => {
            const transition = emotionCache.getTransitionParams('euphoria', 'calm');

            expect(transition).toBeDefined();
        });

        it('should fall back if not initialized', () => {
            emotionCache.isInitialized = false;

            const transition = emotionCache.getTransitionParams('neutral', 'joy');

            expect(transition).toBeDefined();
        });
    });

    describe('hasEmotion()', () => {
        it('should return true for cached emotions', () => {
            expect(emotionCache.hasEmotion('neutral')).toBe(true);
            expect(emotionCache.hasEmotion('joy')).toBe(true);
        });

        it('should return false for uncached emotions', () => {
            expect(emotionCache.hasEmotion('nonexistent')).toBe(false);
        });
    });

    describe('cacheEmotion()', () => {
        it('should cache a valid emotion', () => {
            emotionCache.emotionCache.clear();

            emotionCache.cacheEmotion('neutral');

            expect(emotionCache.emotionCache.has('neutral')).toBe(true);
        });

        it('should cache visual params alongside emotion', () => {
            emotionCache.visualParamsCache.clear();

            emotionCache.cacheEmotion('neutral');

            expect(emotionCache.visualParamsCache.has('neutral')).toBe(true);
        });

        it('should cache modifiers alongside emotion', () => {
            emotionCache.modifiersCache.clear();

            emotionCache.cacheEmotion('neutral');

            expect(emotionCache.modifiersCache.has('neutral')).toBe(true);
        });
    });

    describe('cacheCommonTransitions()', () => {
        it('should cache common emotion pairs', () => {
            emotionCache.transitionCache.clear();

            emotionCache.cacheCommonTransitions(['neutral', 'joy', 'sadness', 'anger', 'calm']);

            // Check for some expected transitions
            expect(emotionCache.transitionCache.has('neutral->joy')).toBe(true);
            expect(emotionCache.transitionCache.has('neutral->sadness')).toBe(true);
        });

        it('should skip pairs with missing emotions', () => {
            emotionCache.transitionCache.clear();

            emotionCache.cacheCommonTransitions(['neutral']);

            // Should not crash and should have no transitions
            expect(emotionCache.transitionCache.size).toBe(0);
        });
    });

    describe('getStats()', () => {
        it('should return statistics object', () => {
            const stats = emotionCache.getStats();

            expect(stats.isInitialized).toBeDefined();
            expect(stats.loadTime).toBeDefined();
            expect(stats.cacheSize).toBeDefined();
            expect(stats.hits).toBeDefined();
            expect(stats.misses).toBeDefined();
            expect(stats.hitRate).toBeDefined();
        });

        it('should include cache sizes', () => {
            const stats = emotionCache.getStats();

            expect(stats.emotions).toBeDefined();
            expect(stats.visualParams).toBeDefined();
            expect(stats.modifiers).toBeDefined();
            expect(stats.transitions).toBeDefined();
        });

        it('should calculate hit rate as percentage', () => {
            emotionCache.getEmotion('neutral'); // hit
            emotionCache.getEmotion('nonexistent'); // miss

            const stats = emotionCache.getStats();

            expect(stats.hitRate).toMatch(/\d+(\.\d+)?%/);
        });

        it('should return 0% for no requests', () => {
            emotionCache.clear();
            emotionCache.initialize();

            const stats = emotionCache.getStats();

            expect(stats.hitRate).toBe('0%');
        });
    });

    describe('clear()', () => {
        it('should clear all caches', () => {
            emotionCache.getEmotion('neutral');

            emotionCache.clear();

            expect(emotionCache.emotionCache.size).toBe(0);
            expect(emotionCache.visualParamsCache.size).toBe(0);
            expect(emotionCache.modifiersCache.size).toBe(0);
            expect(emotionCache.transitionCache.size).toBe(0);
        });

        it('should reset stats', () => {
            emotionCache.getEmotion('neutral');

            emotionCache.clear();

            expect(emotionCache.stats.hits).toBe(0);
            expect(emotionCache.stats.misses).toBe(0);
            expect(emotionCache.stats.loadTime).toBe(0);
            expect(emotionCache.stats.cacheSize).toBe(0);
        });

        it('should set isInitialized to false', () => {
            emotionCache.clear();

            expect(emotionCache.isInitialized).toBe(false);
        });
    });

    describe('reinitialize()', () => {
        it('should clear and reinitialize', () => {
            emotionCache.getEmotion('neutral');
            

            emotionCache.reinitialize();

            expect(emotionCache.stats.hits).toBe(0);
            expect(emotionCache.isInitialized).toBe(true);
        });

        it('should repopulate caches', () => {
            emotionCache.reinitialize();

            expect(emotionCache.emotionCache.size).toBeGreaterThan(0);
        });
    });

    describe('Cache Performance', () => {
        it('should have positive hit rate after usage', () => {
            // Access known emotions
            emotionCache.getEmotion('neutral');
            emotionCache.getEmotion('joy');
            emotionCache.getEmotion('sadness');

            const stats = emotionCache.getStats();
            const hitRate = parseFloat(stats.hitRate);

            expect(hitRate).toBeGreaterThan(0);
        });

        it('should load faster than threshold', () => {
            emotionCache.clear();
            const start = performance.now();
            emotionCache.initialize();
            const loadTime = performance.now() - start;

            // Should load in less than 100ms
            expect(loadTime).toBeLessThan(100);
        });
    });
});
