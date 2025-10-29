/**
 * Tests for GestureCompositor - emotion-modified animation synthesis
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GestureCompositor from '../../../src/core/GestureCompositor.js';

// Mock dependencies
vi.mock('../../../src/core/gestures/gestureCacheWrapper.js', () => ({
    getGesture: vi.fn(gestureName => {
        const mockGestures = {
            bounce: {
                config: {
                    duration: 500,
                    amplitude: 20,
                    frequency: 2,
                    easing: 'sine'
                }
            },
            pulse: {
                config: {
                    duration: 800,
                    scaleAmount: 1.2,
                    glowAmount: 0.5,
                    glowPeak: 1.5,
                    frequency: 1,
                    easing: 'quad'
                }
            },
            shake: {
                config: {
                    duration: 300,
                    amplitude: 10,
                    frequency: 4,
                    decay: true,
                    easing: 'linear'
                }
            },
            spin: {
                config: {
                    duration: 1000,
                    rotations: 1,
                    easing: 'cubic'
                }
            },
            drift: {
                config: {
                    duration: 2000,
                    distance: 50,
                    angle: 45,
                    easing: 'sine'
                }
            },
            glow: {
                config: {
                    duration: 600,
                    glowAmount: 0.8,
                    glowPeak: 2.0,
                    easing: 'quad'
                }
            },
            expand: {
                config: {
                    duration: 400,
                    scaleTarget: 1.5,
                    easing: 'ease-out'
                }
            },
            vibrate: {
                config: {
                    duration: 200,
                    amplitude: 5,
                    particleMotion: {
                        strength: 0.5,
                        frequency: 10,
                        amplitude: 3
                    },
                    easing: 'linear'
                }
            }
        };
        return mockGestures[gestureName] || null;
    })
}));

vi.mock('../../../src/core/emotions/index.js', () => ({
    getEmotionModifiers: vi.fn(emotion => {
        const mockEmotions = {
            joy: {
                speed: 1.8,
                amplitude: 1.9,
                intensity: 1.1,
                smoothness: 1.0,
                regularity: 0.9,
                addBounce: true
            },
            sadness: {
                speed: 0.5,
                amplitude: 0.6,
                intensity: 0.7,
                smoothness: 1.2,
                regularity: 1.0,
                addGravity: true
            },
            anger: {
                speed: 1.5,
                amplitude: 1.8,
                intensity: 1.6,
                smoothness: 0.3,
                regularity: 0.7,
                addShake: true,
                addJitter: true
            },
            fear: {
                speed: 1.3,
                amplitude: 0.8,
                intensity: 1.2,
                smoothness: 0.5,
                regularity: 0.4,
                addJitter: true
            },
            love: {
                speed: 0.8,
                amplitude: 1.2,
                intensity: 1.4,
                smoothness: 1.5,
                regularity: 1.1,
                addWarmth: true
            },
            surprise: {
                speed: 2.0,
                amplitude: 1.5,
                intensity: 1.3,
                smoothness: 0.8,
                regularity: 0.6,
                addPop: true
            },
            neutral: {
                speed: 1.0,
                amplitude: 1.0,
                intensity: 1.0,
                smoothness: 1.0,
                regularity: 1.0
            }
        };
        return mockEmotions[emotion] || mockEmotions.neutral;
    })
}));

vi.mock('../../../src/core/cache/EmotionCache.js', () => ({
    emotionCache: {
        isInitialized: false,
        getModifiers: vi.fn()
    }
}));

vi.mock('../../../src/config/undertoneModifiers.js', () => ({
    getUndertoneModifier: vi.fn(undertone => {
        const mockUndertones = {
            null: {
                speed: 1.0,
                amplitude: 1.0,
                intensity: 1.0,
                smoothness: 1.0,
                regularity: 1.0
            },
            none: {
                speed: 1.0,
                amplitude: 1.0,
                intensity: 1.0,
                smoothness: 1.0,
                regularity: 1.0
            },
            nervous: {
                speed: 1.2,
                amplitude: 0.9,
                intensity: 1.1,
                smoothness: 0.7,
                regularity: 0.6,
                addFlutter: true,
                addMicroShake: true
            },
            confident: {
                speed: 0.9,
                amplitude: 1.3,
                intensity: 1.2,
                smoothness: 1.1,
                regularity: 1.0,
                addPower: true
            },
            tired: {
                speed: 0.7,
                amplitude: 0.8,
                intensity: 0.6,
                smoothness: 0.9,
                regularity: 1.0,
                addDrag: true,
                addMicroShake: true
            },
            playful: {
                speed: 1.3,
                amplitude: 1.1,
                intensity: 1.0,
                smoothness: 0.9,
                regularity: 0.8,
                addSoftness: true
            }
        };
        return mockUndertones[undertone] || mockUndertones.none;
    })
}));

describe('GestureCompositor', () => {
    let compositor;

    beforeEach(() => {
        compositor = new GestureCompositor();
    });

    afterEach(() => {
        if (compositor && compositor.clearCache) {
            compositor.clearCache();
        }
    });

    describe('initialization', () => {
        it('should initialize with empty cache', () => {
            expect(compositor.cache).toBeDefined();
            expect(compositor.cache.size).toBe(0);
        });

        it('should initialize easing cache', () => {
            expect(compositor.easingCache).toBeDefined();
            expect(compositor.easingCache.size).toBeGreaterThan(0);
        });

        it('should pre-calculate common easing curves', () => {
            expect(compositor.easingCache.has('linear')).toBe(true);
            expect(compositor.easingCache.has('ease-in')).toBe(true);
            expect(compositor.easingCache.has('ease-out')).toBe(true);
            expect(compositor.easingCache.has('ease-in-out')).toBe(true);
            expect(compositor.easingCache.has('bounce')).toBe(true);
        });

        it('should have 101 steps for each easing curve', () => {
            const linearCurve = compositor.easingCache.get('linear');
            expect(linearCurve.length).toBe(101);
        });
    });

    describe('calculateEasing()', () => {
        it('should calculate linear easing', () => {
            expect(compositor.calculateEasing(0, 'linear')).toBe(0);
            expect(compositor.calculateEasing(0.5, 'linear')).toBe(0.5);
            expect(compositor.calculateEasing(1, 'linear')).toBe(1);
        });

        it('should calculate ease-in', () => {
            const result = compositor.calculateEasing(0.5, 'ease-in');
            expect(result).toBeCloseTo(0.25, 2);
        });

        it('should calculate ease-out', () => {
            const result = compositor.calculateEasing(0.5, 'ease-out');
            expect(result).toBeCloseTo(0.75, 2);
        });

        it('should calculate ease-in-out', () => {
            const result = compositor.calculateEasing(0.5, 'ease-in-out');
            expect(result).toBeCloseTo(0.5, 2);
        });

        it('should calculate bounce easing', () => {
            const result = compositor.calculateEasing(1, 'bounce');
            expect(result).toBeGreaterThan(0.95);
        });

        it('should default to linear for unknown easing', () => {
            const result = compositor.calculateEasing(0.5, 'unknown');
            expect(result).toBe(0.5);
        });
    });

    describe('getEasingValue()', () => {
        it('should retrieve easing value from cache', () => {
            const value = compositor.getEasingValue(0.5, 'linear');
            expect(value).toBeCloseTo(0.5, 2);
        });

        it('should handle progress at boundaries', () => {
            expect(compositor.getEasingValue(0, 'linear')).toBe(0);
            expect(compositor.getEasingValue(1, 'linear')).toBe(1);
        });

        it('should fallback to linear for unknown easing type', () => {
            const value = compositor.getEasingValue(0.5, 'unknown');
            expect(value).toBeCloseTo(0.5, 2);
        });

        it('should interpolate between cached values', () => {
            const value = compositor.getEasingValue(0.25, 'ease-in');
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
        });
    });

    describe('compose() - basic composition', () => {
        it('should compose gesture with emotion and no undertone', () => {
            const result = compositor.compose('bounce', 'joy');

            expect(result).toBeDefined();
            expect(result.duration).toBeDefined();
            expect(result.amplitude).toBeDefined();
            expect(result.easing).toBeDefined();
        });

        it('should compose gesture with emotion and undertone', () => {
            const result = compositor.compose('bounce', 'joy', 'confident');

            expect(result).toBeDefined();
            expect(result.duration).toBeDefined();
            expect(result.amplitude).toBeDefined();
        });

        it('should return base config when gesture not found', () => {
            const result = compositor.compose('unknown', 'joy');

            expect(result).toBeDefined();
            // Duration is modified by emotion speed (500 / 1.8)
            expect(result.duration).toBe(Math.round(500 / 1.8));
            // Amplitude is modified by emotion amplitude (20 * 1.9)
            expect(result.amplitude).toBeCloseTo(20 * 1.9, 1);
        });

        it('should cache composed results', () => {
            const result1 = compositor.compose('bounce', 'joy');
            const result2 = compositor.compose('bounce', 'joy');

            expect(result1).toBe(result2);
            expect(compositor.cache.size).toBe(1);
        });

        it('should create different cache entries for different combinations', () => {
            compositor.compose('bounce', 'joy');
            compositor.compose('bounce', 'sadness');
            compositor.compose('pulse', 'joy');

            expect(compositor.cache.size).toBe(3);
        });
    });

    describe('compose() - speed modifiers', () => {
        it('should apply speed multiplier to duration', () => {
            const result = compositor.compose('bounce', 'joy'); // joy speed: 1.8

            // Duration should be inversely proportional to speed
            expect(result.duration).toBeLessThan(500);
            expect(result.duration).toBeCloseTo(Math.round(500 / 1.8), 0);
        });

        it('should slow down animation for sadness', () => {
            const result = compositor.compose('bounce', 'sadness'); // sadness speed: 0.5

            expect(result.duration).toBeGreaterThan(500);
            expect(result.duration).toBeCloseTo(Math.round(500 / 0.5), 0);
        });

        it('should combine emotion and undertone speed modifiers', () => {
            const result = compositor.compose('bounce', 'joy', 'nervous');
            // joy: 1.8, nervous: 1.2, combined: 2.16

            expect(result.duration).toBeCloseTo(Math.round(500 / (1.8 * 1.2)), 0);
        });
    });

    describe('compose() - amplitude modifiers', () => {
        it('should apply amplitude multiplier', () => {
            const result = compositor.compose('bounce', 'joy'); // joy amplitude: 1.9

            expect(result.amplitude).toBeCloseTo(20 * 1.9, 1);
        });

        it('should reduce amplitude for sadness', () => {
            const result = compositor.compose('bounce', 'sadness'); // sadness amplitude: 0.6

            // Sadness also has addGravity, which reduces amplitude further in bounce
            // applyGestureSpecificMods applies *= 0.6 for sad bounce
            expect(result.amplitude).toBeCloseTo(20 * 0.6 * 0.6, 1);
        });

        it('should combine emotion and undertone amplitude modifiers', () => {
            const result = compositor.compose('bounce', 'joy', 'confident');
            // joy: 1.9, confident: 1.3

            expect(result.amplitude).toBeCloseTo(20 * 1.9 * 1.3, 1);
        });
    });

    describe('compose() - scale modifiers', () => {
        it('should apply scale amount modifiers', () => {
            const result = compositor.compose('pulse', 'joy');
            // joy intensity: 1.1

            expect(result.scaleAmount).toBeCloseTo(1.2 * 1.1, 2);
        });

        it('should apply scale target modifiers', () => {
            const result = compositor.compose('expand', 'joy');
            // joy amplitude: 1.9, scaleTarget: 1.5
            // formula: 1 + (1.5 - 1) * 1.9

            expect(result.scaleTarget).toBeCloseTo(1 + (1.5 - 1) * 1.9, 2);
        });

        it('should reduce scale for low intensity emotions', () => {
            const result = compositor.compose('pulse', 'sadness');
            // sadness intensity: 0.7

            expect(result.scaleAmount).toBeLessThan(1.2);
        });
    });

    describe('compose() - glow modifiers', () => {
        it('should apply glow amount modifiers', () => {
            const result = compositor.compose('glow', 'joy');
            // joy intensity: 1.1

            expect(result.glowAmount).toBeCloseTo(0.8 * 1.1, 2);
        });

        it('should apply glow peak modifiers', () => {
            const result = compositor.compose('glow', 'joy');
            // joy intensity: 1.1, glowPeak: 2.0
            // formula: 1 + (2.0 - 1) * 1.1

            expect(result.glowPeak).toBeCloseTo(1 + (2.0 - 1) * 1.1, 2);
        });

        it('should reduce glow for low intensity', () => {
            const result = compositor.compose('pulse', 'sadness');

            expect(result.glowAmount).toBeLessThan(0.5);
        });
    });

    describe('compose() - rotation modifiers', () => {
        it('should apply rotation modifiers', () => {
            const result = compositor.compose('spin', 'joy');
            // joy amplitude: 1.9, addBounce: true
            // applyGestureSpecificMods adds extra rotations for joy (*1.5)

            expect(result.rotations).toBeCloseTo(1 * 1.9 * 1.5, 2);
        });

        it('should apply angle modifiers for drift', () => {
            const result = compositor.compose('drift', 'joy');

            expect(result.angle).toBeCloseTo(45 * 1.9, 1);
        });

        it('should reduce rotations for calm emotions', () => {
            const result = compositor.compose('spin', 'sadness');

            expect(result.rotations).toBeLessThan(1);
        });
    });

    describe('compose() - distance modifiers', () => {
        it('should apply distance modifiers', () => {
            const result = compositor.compose('drift', 'joy');
            // joy amplitude: 1.9

            expect(result.distance).toBeCloseTo(50 * 1.9, 1);
        });

        it('should reduce distance for low amplitude', () => {
            const result = compositor.compose('drift', 'sadness');

            expect(result.distance).toBeLessThan(50);
        });
    });

    describe('compose() - smoothness and easing', () => {
        it('should apply smoothness modifier', () => {
            const result = compositor.compose('bounce', 'joy');

            expect(result.smoothness).toBeDefined();
            expect(result.smoothness).toBeCloseTo(1.0, 2);
        });

        it('should select easing based on smoothness', () => {
            const result = compositor.compose('bounce', 'joy');

            expect(result.easing).toBeDefined();
            expect(typeof result.easing).toBe('string');
        });

        it('should use linear easing for very sharp movements', () => {
            const result = compositor.compose('bounce', 'anger');
            // anger smoothness: 0.3

            expect(result.easing).toBe('linear');
        });

        it('should use smooth easing for calm movements', () => {
            const result = compositor.compose('bounce', 'love');
            // love smoothness: 1.5

            expect(result.easing).toBe('sine');
        });
    });

    describe('compose() - regularity', () => {
        it('should apply regularity modifier', () => {
            const result = compositor.compose('bounce', 'joy');

            expect(result.regularity).toBeDefined();
            expect(result.regularity).toBeCloseTo(0.9, 2);
        });

        it('should combine emotion and undertone regularity', () => {
            const result = compositor.compose('bounce', 'joy', 'nervous');
            // joy: 0.9, nervous: 0.6

            expect(result.regularity).toBeCloseTo(0.9 * 0.6, 2);
        });
    });

    describe('compose() - emotion effects', () => {
        it('should add bounce effect for joy', () => {
            const result = compositor.compose('pulse', 'joy');

            expect(result.effects).toContain('bounce');
        });

        it('should add gravity effect for sadness', () => {
            const result = compositor.compose('pulse', 'sadness');

            expect(result.effects).toContain('gravity');
        });

        it('should add shake effect for anger', () => {
            const result = compositor.compose('pulse', 'anger');

            expect(result.effects).toContain('shake');
        });

        it('should add warmth effect for love', () => {
            const result = compositor.compose('pulse', 'love');

            expect(result.effects).toContain('warmth');
        });

        it('should add pop effect for surprise', () => {
            const result = compositor.compose('pulse', 'surprise');

            expect(result.effects).toContain('pop');
        });

        it('should have no effects for neutral emotion', () => {
            const result = compositor.compose('pulse', 'neutral');

            expect(result.effects).toHaveLength(0);
        });
    });

    describe('compose() - undertone effects', () => {
        it('should add flutter effect for nervous undertone', () => {
            const result = compositor.compose('pulse', 'joy', 'nervous');

            expect(result.effects).toContain('flutter');
        });

        it('should add microShake effect for nervous undertone', () => {
            const result = compositor.compose('pulse', 'joy', 'nervous');

            expect(result.effects).toContain('microShake');
        });

        it('should add power effect for confident undertone', () => {
            const result = compositor.compose('pulse', 'joy', 'confident');

            expect(result.effects).toContain('power');
        });

        it('should add microShake effect for tired undertone', () => {
            const result = compositor.compose('pulse', 'joy', 'tired');

            // Note: addDrag is in the mock but compositor only checks undertoneMod for specific effects
            // The tired modifier has addMicroShake which is checked
            expect(result.effects).toContain('microShake');
        });

        it('should combine emotion and undertone effects', () => {
            const result = compositor.compose('pulse', 'joy', 'nervous');

            expect(result.effects).toContain('bounce'); // from joy
            expect(result.effects).toContain('flutter'); // from nervous
            expect(result.effects).toContain('microShake'); // from nervous
        });
    });

    describe('compose() - particle motion modifiers', () => {
        it('should apply modifiers to particle motion strength', () => {
            const result = compositor.compose('vibrate', 'joy');
            // joy intensity: 1.1

            expect(result.particleMotion).toBeDefined();
            expect(result.particleMotion.strength).toBeCloseTo(0.5 * 1.1, 2);
        });

        it('should apply speed modifiers to particle frequency', () => {
            const result = compositor.compose('vibrate', 'joy');
            // joy speed: 1.8

            expect(result.particleMotion.frequency).toBeCloseTo(10 * 1.8, 1);
        });

        it('should apply amplitude modifiers to particle amplitude', () => {
            const result = compositor.compose('vibrate', 'joy');
            // joy amplitude: 1.9

            expect(result.particleMotion.amplitude).toBeCloseTo(3 * 1.9, 1);
        });

        it('should handle gestures without particle motion', () => {
            const result = compositor.compose('bounce', 'joy');

            expect(result.particleMotion).toBeUndefined();
        });
    });

    describe('applyGestureSpecificMods() - bounce', () => {
        it('should make angry bounce more violent', () => {
            const result = compositor.compose('bounce', 'anger');

            expect(result.frequency).toBeGreaterThan(2);
        });

        it('should make sad bounce barely leave ground', () => {
            const result = compositor.compose('bounce', 'sadness');

            expect(result.amplitude).toBeLessThan(20 * 0.6);
            expect(result.frequency).toBe(1);
        });
    });

    describe('applyGestureSpecificMods() - pulse', () => {
        it('should make love pulse like a heartbeat', () => {
            const result = compositor.compose('pulse', 'love');

            expect(result.frequency).toBe(2);
            expect(result.glowAmount).toBeGreaterThan(0.5);
        });

        it('should make nervous pulse irregular', () => {
            const result = compositor.compose('pulse', 'joy', 'nervous');

            expect(result.irregular).toBe(true);
        });
    });

    describe('applyGestureSpecificMods() - shake', () => {
        it('should make fear shake more intense', () => {
            const result = compositor.compose('shake', 'fear');

            expect(result.frequency).toBeGreaterThan(4);
            // Fear has amplitude 0.8, so 10 * 0.8 * 1.2 = 9.6
            expect(result.amplitude).toBeGreaterThan(9);
        });

        it('should make anger shake violent and sustained', () => {
            const result = compositor.compose('shake', 'anger');

            expect(result.amplitude).toBeGreaterThan(10);
            expect(result.decay).toBe(false);
        });
    });

    describe('applyGestureSpecificMods() - spin', () => {
        it('should add extra rotations for joyful spin', () => {
            const result = compositor.compose('spin', 'joy');

            expect(result.rotations).toBeGreaterThan(1);
        });

        it('should add wobble for confused spin', () => {
            const customCompositor = new GestureCompositor();
            vi.doMock('../../../src/core/emotions/index.js', () => ({
                getEmotionModifiers: vi.fn(() => ({
                    speed: 1.0,
                    amplitude: 1.0,
                    intensity: 1.0,
                    smoothness: 1.0,
                    regularity: 0.5,
                    addWobble: true
                }))
            }));

            const result = customCompositor.compose('spin', 'neutral');
            // Manual application since mock isn't hot-reloaded
            const gestureResult = {
                rotations: 1,
                wobble: undefined
            };
            customCompositor.applyGestureSpecificMods(
                gestureResult,
                'spin',
                { addWobble: true },
                { speed: 1.0, amplitude: 1.0, intensity: 1.0 }
            );

            expect(gestureResult.wobble).toBe(true);
        });
    });

    describe('selectEasing()', () => {
        it('should select linear for very sharp (smoothness < 0.5)', () => {
            const easing = compositor.selectEasing('sine', 0.3);
            expect(easing).toBe('linear');
        });

        it('should select quad for somewhat sharp (0.5 <= smoothness < 0.8)', () => {
            const easing = compositor.selectEasing('sine', 0.6);
            expect(easing).toBe('quad');
        });

        it('should keep base easing for normal (0.8 <= smoothness < 1.2)', () => {
            const easing = compositor.selectEasing('sine', 1.0);
            expect(easing).toBe('sine');
        });

        it('should select cubic for smooth (1.2 <= smoothness < 1.5)', () => {
            const easing = compositor.selectEasing('sine', 1.3);
            expect(easing).toBe('cubic');
        });

        it('should select sine for very smooth (smoothness >= 1.5)', () => {
            const easing = compositor.selectEasing('quad', 1.6);
            expect(easing).toBe('sine');
        });
    });

    describe('cache management', () => {
        it('should clear cache when limit exceeded', () => {
            // Fill cache beyond limit
            for (let i = 0; i < 105; i++) {
                compositor.compose('bounce', `emotion${i}`);
            }

            // Cache should have been cleared and restarted
            expect(compositor.cache.size).toBeLessThanOrEqual(101);
        });

        it('should manually clear cache', () => {
            compositor.compose('bounce', 'joy');
            compositor.compose('pulse', 'sadness');

            expect(compositor.cache.size).toBe(2);

            compositor.clearCache();

            expect(compositor.cache.size).toBe(0);
        });

        it('should regenerate after cache clear', () => {
            const result1 = compositor.compose('bounce', 'joy');
            compositor.clearCache();
            const result2 = compositor.compose('bounce', 'joy');

            expect(result1).not.toBe(result2);
            expect(result1.duration).toBe(result2.duration);
            expect(result1.amplitude).toBeCloseTo(result2.amplitude, 1);
        });
    });

    describe('edge cases', () => {
        it('should handle null undertone', () => {
            const result = compositor.compose('bounce', 'joy', null);

            expect(result).toBeDefined();
            expect(result.duration).toBeDefined();
        });

        it('should handle undefined undertone', () => {
            const result = compositor.compose('bounce', 'joy', undefined);

            expect(result).toBeDefined();
            expect(result.duration).toBeDefined();
        });

        it('should handle unknown gesture gracefully', () => {
            const result = compositor.compose('nonexistent', 'joy');

            expect(result).toBeDefined();
            // Even unknown gestures get emotion modifiers applied
            expect(result.duration).toBe(Math.round(500 / 1.8));
        });

        it('should handle multiple rapid compositions', () => {
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(compositor.compose('bounce', 'joy'));
            }

            // All should return the same cached result
            expect(new Set(results).size).toBe(1);
        });

        it('should handle zero amplitude gracefully', () => {
            const customCompositor = new GestureCompositor();
            const base = { amplitude: 0 };
            const emotion = { amplitude: 1.5 };
            const undertone = { amplitude: 1.2 };

            const result = customCompositor.applyModifiers(base, emotion, undertone, 'test');

            expect(result.amplitude).toBe(0);
        });

        it('should handle extreme speed multipliers', () => {
            const customCompositor = new GestureCompositor();
            const base = { duration: 1000 };
            const emotion = { speed: 10.0 };
            const undertone = { speed: 2.0 };

            const result = customCompositor.applyModifiers(base, emotion, undertone, 'test');

            expect(result.duration).toBe(Math.round(1000 / 20));
        });
    });

    describe('complex combinations', () => {
        it('should compose joyful nervous bounce', () => {
            const result = compositor.compose('bounce', 'joy', 'nervous');

            expect(result.duration).toBeLessThan(500);
            expect(result.amplitude).toBeDefined();
            expect(result.effects).toContain('bounce');
            expect(result.effects).toContain('flutter');
        });

        it('should compose sad tired pulse', () => {
            const result = compositor.compose('pulse', 'sadness', 'tired');

            expect(result.duration).toBeGreaterThan(800);
            expect(result.effects).toContain('gravity'); // from sadness emotion
            expect(result.effects).toContain('microShake'); // from tired undertone
            // Note: drag is not added because it's only checked on emotionMod, not undertoneMod
        });

        it('should compose angry confident shake', () => {
            const result = compositor.compose('shake', 'anger', 'confident');

            expect(result.amplitude).toBeGreaterThan(10);
            expect(result.decay).toBe(false);
            expect(result.effects).toContain('shake');
            expect(result.effects).toContain('power');
        });

        it('should handle all modifier types together', () => {
            const result = compositor.compose('vibrate', 'joy', 'confident');

            expect(result.duration).toBeDefined();
            expect(result.amplitude).toBeDefined();
            expect(result.smoothness).toBeDefined();
            expect(result.regularity).toBeDefined();
            expect(result.easing).toBeDefined();
            expect(result.effects).toBeDefined();
            expect(result.particleMotion).toBeDefined();
        });
    });
});
