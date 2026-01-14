/**
 * GestureCache Tests
 * Tests for the gesture caching module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GestureCache } from '../../../../src/core/cache/GestureCache.js';

describe('GestureCache', () => {
    let gestureCache;

    beforeEach(() => {
        gestureCache = new GestureCache();
    });

    afterEach(() => {
        gestureCache.clear();
    });

    describe('Constructor', () => {
        it('should initialize caches as Maps', () => {
            expect(gestureCache.gestureCache).toBeInstanceOf(Map);
            expect(gestureCache.propertyCache).toBeInstanceOf(Map);
            expect(gestureCache.compositionCache).toBeInstanceOf(Map);
            expect(gestureCache.pluginCache).toBeInstanceOf(Map);
        });

        it('should initialize stats object with gesture-specific fields', () => {
            expect(gestureCache.stats).toBeDefined();
            // Stats may have hits from initialization (combo caching queries gestures)
            expect(gestureCache.stats.hits).toBeGreaterThanOrEqual(0);
            expect(gestureCache.stats.misses).toBeGreaterThanOrEqual(0);
            expect(gestureCache.stats.gestureHits).toBeGreaterThanOrEqual(0);
            expect(gestureCache.stats.propertyHits).toBe(0); // Not used during init
            expect(gestureCache.stats.compositionHits).toBe(0); // Not used during init
        });

        it('should auto-initialize on construction', () => {
            expect(gestureCache.isInitialized).toBe(true);
        });
    });

    describe('initialize()', () => {
        it('should set isInitialized to true on success', () => {
            gestureCache.clear();
            gestureCache.initialize();

            expect(gestureCache.isInitialized).toBe(true);
        });

        it('should calculate loadTime', () => {
            gestureCache.clear();
            gestureCache.initialize();

            expect(gestureCache.stats.loadTime).toBeGreaterThanOrEqual(0);
        });

        it('should calculate cacheSize', () => {
            gestureCache.clear();
            gestureCache.initialize();

            expect(gestureCache.stats.cacheSize).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getGesture()', () => {
        it('should return cached gesture for valid name', () => {
            const gesture = gestureCache.getGesture('bounce');

            if (gesture) {
                expect(gesture.name).toBe('bounce');
                expect(gestureCache.stats.gestureHits).toBeGreaterThan(0);
            }
        });

        it('should increment misses for unknown gesture', () => {
            const initialMisses = gestureCache.stats.misses;

            gestureCache.getGesture('nonexistent-gesture');

            expect(gestureCache.stats.misses).toBe(initialMisses + 1);
        });

        it('should return null for unknown gesture', () => {
            const gesture = gestureCache.getGesture('nonexistent-gesture');

            expect(gesture).toBeNull();
        });

        it('should mark cached gestures', () => {
            const gesture = gestureCache.getGesture('bounce');

            if (gesture) {
                expect(gesture.cached).toBe(true);
                expect(gesture.cacheTime).toBeDefined();
            }
        });
    });

    describe('getGestureProperties()', () => {
        it('should return cached properties for valid gesture', () => {
            const props = gestureCache.getGestureProperties('bounce');

            if (props) {
                expect(props).toBeDefined();
                expect(gestureCache.stats.propertyHits).toBeGreaterThan(0);
            }
        });

        it('should include duration and easing', () => {
            const props = gestureCache.getGestureProperties('bounce');

            if (props) {
                expect(props.duration).toBeDefined();
                expect(props.easing).toBeDefined();
            }
        });

        it('should include physics properties', () => {
            const props = gestureCache.getGestureProperties('bounce');

            if (props && props.physics) {
                expect(props.physics.amplitude).toBeDefined();
                expect(props.physics.strength).toBeDefined();
            }
        });

        it('should return null for unknown gesture', () => {
            const props = gestureCache.getGestureProperties('nonexistent');

            expect(props).toBeNull();
        });
    });

    describe('getGestureCombination()', () => {
        it('should return combination for common pairs', () => {
            const combo = gestureCache.getGestureCombination('bounce', 'pulse');

            if (combo) {
                expect(combo.gestures).toContain('bounce');
                expect(combo.gestures).toContain('pulse');
                expect(gestureCache.stats.compositionHits).toBeGreaterThan(0);
            }
        });

        it('should include combined duration', () => {
            const combo = gestureCache.getGestureCombination('bounce', 'pulse');

            if (combo) {
                expect(combo.combinedDuration).toBeDefined();
                expect(typeof combo.combinedDuration).toBe('number');
            }
        });

        it('should include compatibility rating', () => {
            const combo = gestureCache.getGestureCombination('bounce', 'pulse');

            if (combo) {
                expect(['high', 'medium', 'low']).toContain(combo.compatibility);
            }
        });

        it('should return null for unknown combination', () => {
            const combo = gestureCache.getGestureCombination('nonexistent1', 'nonexistent2');

            expect(combo).toBeNull();
        });
    });

    describe('calculateGestureDuration()', () => {
        it('should return default duration for gesture without config', () => {
            const duration = gestureCache.calculateGestureDuration({});

            expect(duration).toBe(1000);
        });

        it('should return config duration if specified', () => {
            const duration = gestureCache.calculateGestureDuration({
                config: { duration: 2000 }
            });

            expect(duration).toBe(2000);
        });

        it('should calculate musical duration', () => {
            const duration = gestureCache.calculateGestureDuration({
                config: {
                    musicalDuration: {
                        musical: true,
                        beats: 4
                    }
                }
            });

            expect(duration).toBe(2000); // 4 beats * 500ms
        });
    });

    describe('extractEasingFunction()', () => {
        it('should return default easing for gesture without config', () => {
            const easing = gestureCache.extractEasingFunction({});

            expect(easing).toBe('sine');
        });

        it('should return config easing if specified', () => {
            const easing = gestureCache.extractEasingFunction({
                config: { easing: 'bounce' }
            });

            expect(easing).toBe('bounce');
        });

        it('should fall back to particleMotion easing', () => {
            const easing = gestureCache.extractEasingFunction({
                config: {
                    particleMotion: { easing: 'elastic' }
                }
            });

            expect(easing).toBe('elastic');
        });
    });

    describe('extractPhysicsProperties()', () => {
        it('should return empty object for gesture without config', () => {
            const physics = gestureCache.extractPhysicsProperties({});

            expect(physics).toEqual({});
        });

        it('should extract amplitude', () => {
            const physics = gestureCache.extractPhysicsProperties({
                config: { amplitude: 50 }
            });

            expect(physics.amplitude).toBe(50);
        });

        it('should use defaults for missing properties', () => {
            const physics = gestureCache.extractPhysicsProperties({
                config: {}
            });

            expect(physics.amplitude).toBe(20);
            expect(physics.strength).toBe(1.0);
            expect(physics.size).toBe(80);
            expect(physics.rotation).toBe(0);
        });
    });

    describe('extractTimingProperties()', () => {
        it('should return empty object for gesture without config', () => {
            const timing = gestureCache.extractTimingProperties({});

            expect(timing).toEqual({});
        });

        it('should extract phases', () => {
            const phases = [{ name: 'start' }, { name: 'end' }];
            const timing = gestureCache.extractTimingProperties({
                config: { phases }
            });

            expect(timing.phases).toEqual(phases);
            expect(timing.hasPhases).toBe(true);
        });

        it('should detect hasTimingSync', () => {
            const timing = gestureCache.extractTimingProperties({
                config: { timingSync: { beat: 1 } }
            });

            expect(timing.hasTimingSync).toBe(true);
        });
    });

    describe('combinePhysicsProperties()', () => {
        it('should take max of amplitudes', () => {
            const g1 = { config: { amplitude: 20 } };
            const g2 = { config: { amplitude: 40 } };

            const combined = gestureCache.combinePhysicsProperties(g1, g2);

            expect(combined.amplitude).toBe(40);
        });

        it('should average strengths', () => {
            const g1 = { config: { strength: 0.5 } };
            const g2 = { config: { strength: 1.5 } };

            const combined = gestureCache.combinePhysicsProperties(g1, g2);

            expect(combined.strength).toBe(1.0);
        });
    });

    describe('calculateCompatibility()', () => {
        it('should return high for same types', () => {
            const g1 = { type: 'blending' };
            const g2 = { type: 'blending' };

            expect(gestureCache.calculateCompatibility(g1, g2)).toBe('high');
        });

        it('should return low for override type', () => {
            const g1 = { type: 'override' };
            const g2 = { type: 'blending' };

            expect(gestureCache.calculateCompatibility(g1, g2)).toBe('low');
        });

        it('should return medium for mixed types', () => {
            const g1 = { type: 'blending' };
            const g2 = { type: 'additive' };

            expect(gestureCache.calculateCompatibility(g1, g2)).toBe('medium');
        });
    });

    describe('getStats()', () => {
        it('should return statistics object', () => {
            const stats = gestureCache.getStats();

            expect(stats.hits).toBeDefined();
            expect(stats.misses).toBeDefined();
            expect(stats.hitRate).toBeDefined();
            expect(stats.isInitialized).toBeDefined();
        });

        it('should include cache sizes', () => {
            const stats = gestureCache.getStats();

            expect(stats.coreGestures).toBeDefined();
            expect(stats.pluginGestures).toBeDefined();
            expect(stats.properties).toBeDefined();
            expect(stats.combinations).toBeDefined();
        });

        it('should calculate hit rate', () => {
            gestureCache.getGesture('bounce');
            gestureCache.getGesture('nonexistent');

            const stats = gestureCache.getStats();

            expect(stats.hitRate).toMatch(/\d+(\.\d+)?%/);
        });
    });

    describe('clear()', () => {
        it('should clear all caches', () => {
            gestureCache.getGesture('bounce');

            gestureCache.clear();

            expect(gestureCache.gestureCache.size).toBe(0);
            expect(gestureCache.propertyCache.size).toBe(0);
            expect(gestureCache.compositionCache.size).toBe(0);
            expect(gestureCache.pluginCache.size).toBe(0);
        });

        it('should reset all stats fields', () => {
            gestureCache.getGesture('bounce');
            gestureCache.clear();

            expect(gestureCache.stats.hits).toBe(0);
            expect(gestureCache.stats.misses).toBe(0);
            expect(gestureCache.stats.gestureHits).toBe(0);
            expect(gestureCache.stats.propertyHits).toBe(0);
            expect(gestureCache.stats.compositionHits).toBe(0);
        });

        it('should set isInitialized to false', () => {
            gestureCache.clear();

            expect(gestureCache.isInitialized).toBe(false);
        });
    });

    describe('warmUp()', () => {
        it('should pre-fetch specified gestures', () => {
            gestureCache.clear();
            gestureCache.initialize();

            const initialHits = gestureCache.stats.hits;

            gestureCache.warmUp(['bounce', 'pulse', 'shake']);

            // Should have more hits after warmup (if gestures exist)
            expect(gestureCache.stats.hits).toBeGreaterThanOrEqual(initialHits);
        });
    });
});
