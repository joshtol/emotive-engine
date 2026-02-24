/**
 * Animation Config Tests
 * Tests for the AnimationConfig parser and validator
 */

import { describe, it, expect, vi } from 'vitest';
import {
    AnimationConfig,
    parseAnimationConfig,
    ANIMATION_DEFAULTS,
    PULSE_DEFAULTS,
    FLICKER_DEFAULTS,
    DRIFT_DEFAULTS,
    ROTATE_DEFAULTS,
    EMISSIVE_DEFAULTS
} from '../../../../../src/3d/effects/animation/AnimationConfig.js';
import { linear, easeIn, easeOut, easeInOut } from '../../../../../src/3d/effects/animation/Easing.js';

describe('AnimationConfig', () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTION & DEFAULTS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('constructor', () => {
        it('should create with default values when no config provided', () => {
            const config = new AnimationConfig();

            expect(config.gestureDuration).toBe(1000);
            expect(config.timing.appearAt).toBe(ANIMATION_DEFAULTS.appearAt);
            expect(config.timing.disappearAt).toBe(ANIMATION_DEFAULTS.disappearAt);
            expect(config.enter.type).toBe(ANIMATION_DEFAULTS.enter.type);
            expect(config.exit.type).toBe(ANIMATION_DEFAULTS.exit.type);
        });

        it('should accept custom gesture duration', () => {
            const config = new AnimationConfig({}, 2000);

            expect(config.gestureDuration).toBe(2000);
        });

        it('should store raw config', () => {
            const raw = { enter: { type: 'flash' } };
            const config = new AnimationConfig(raw);

            expect(config.raw).toBe(raw);
        });

        it('should initialize intensity to 1.0', () => {
            const config = new AnimationConfig();

            expect(config.getIntensity()).toBe(1.0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // TIMING PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('timing parsing', () => {
        it('should parse progress-based timing', () => {
            const config = new AnimationConfig({
                appearAt: 0.2,
                disappearAt: 0.8
            });

            expect(config.timing.appearAt).toBe(0.2);
            expect(config.timing.disappearAt).toBe(0.8);
            expect(config.timing.mode).toBe('progress');
        });

        it('should parse ms-based timing', () => {
            const config = new AnimationConfig({
                delayMs: 100,
                lifetimeMs: 500
            });

            expect(config.timing.delayMs).toBe(100);
            expect(config.timing.lifetimeMs).toBe(500);
            expect(config.timing.mode).toBe('ms');
        });

        it('should prefer progress mode when both are specified', () => {
            const config = new AnimationConfig({
                appearAt: 0.2,
                delayMs: 100
            });

            expect(config.timing.mode).toBe('progress');
        });

        it('should parse stagger values', () => {
            const config = new AnimationConfig({
                stagger: 0.05,
                staggerMs: 50
            });

            expect(config.timing.stagger).toBe(0.05);
            expect(config.timing.staggerMs).toBe(50);
        });

        it('should parse appearOnBeat', () => {
            const config = new AnimationConfig({
                appearOnBeat: 4
            });

            expect(config.timing.appearOnBeat).toBe(4);
        });

        it('should default appearOnBeat to null', () => {
            const config = new AnimationConfig();

            expect(config.timing.appearOnBeat).toBe(null);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ENTER PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('enter parsing', () => {
        it('should parse enter type', () => {
            const config = new AnimationConfig({
                enter: { type: 'flash' }
            });

            expect(config.enter.type).toBe('flash');
        });

        it('should parse enter duration', () => {
            const config = new AnimationConfig({
                enter: { duration: 0.1, durationMs: 100 }
            });

            expect(config.enter.duration).toBe(0.1);
            expect(config.enter.durationMs).toBe(100);
        });

        it('should resolve easing function from string', () => {
            const config = new AnimationConfig({
                enter: { easing: 'easeIn' }
            });

            expect(config.enter.easing).toBe(easeIn);
            expect(config.enter.easingName).toBe('easeIn');
        });

        it('should use default easing when not specified', () => {
            const config = new AnimationConfig({
                enter: {}
            });

            expect(config.enter.easing).toBe(easeOut);
        });

        it('should parse scale range', () => {
            const config = new AnimationConfig({
                enter: { scale: [0.5, 1.5] }
            });

            expect(config.enter.scale).toEqual([0.5, 1.5]);
        });

        it('should parse overshoot', () => {
            const config = new AnimationConfig({
                enter: { overshoot: 1.5 }
            });

            expect(config.enter.overshoot).toBe(1.5);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // EXIT PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('exit parsing', () => {
        it('should parse exit type', () => {
            const config = new AnimationConfig({
                exit: { type: 'shrink' }
            });

            expect(config.exit.type).toBe('shrink');
        });

        it('should resolve exit easing function', () => {
            const config = new AnimationConfig({
                exit: { easing: 'easeInOut' }
            });

            expect(config.exit.easing).toBe(easeInOut);
        });

        it('should parse exit scale range', () => {
            const config = new AnimationConfig({
                exit: { scale: [1.0, 0.2] }
            });

            expect(config.exit.scale).toEqual([1.0, 0.2]);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // HOLD ANIMATIONS PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('hold animations parsing', () => {
        describe('pulse', () => {
            it('should parse pulse config', () => {
                const config = new AnimationConfig({
                    pulse: { amplitude: 0.3, frequency: 4 }
                });

                expect(config.hold.pulse).not.toBeNull();
                expect(config.hold.pulse.amplitude).toBe(0.3);
                expect(config.hold.pulse.frequency).toBe(4);
            });

            it('should use pulse defaults for missing values', () => {
                const config = new AnimationConfig({
                    pulse: { amplitude: 0.5 }
                });

                expect(config.hold.pulse.frequency).toBe(PULSE_DEFAULTS.frequency);
                expect(config.hold.pulse.sync).toBe(PULSE_DEFAULTS.sync);
            });

            it('should be null when not specified', () => {
                const config = new AnimationConfig({});

                expect(config.hold.pulse).toBeNull();
            });
        });

        describe('flicker', () => {
            it('should parse flicker config', () => {
                const config = new AnimationConfig({
                    flicker: { intensity: 0.4, rate: 15, pattern: 'sine' }
                });

                expect(config.hold.flicker.intensity).toBe(0.4);
                expect(config.hold.flicker.rate).toBe(15);
                expect(config.hold.flicker.pattern).toBe('sine');
            });

            it('should use flicker defaults for missing values', () => {
                const config = new AnimationConfig({
                    flicker: { intensity: 0.3 }
                });

                expect(config.hold.flicker.rate).toBe(FLICKER_DEFAULTS.rate);
                expect(config.hold.flicker.pattern).toBe(FLICKER_DEFAULTS.pattern);
            });
        });

        describe('drift', () => {
            it('should parse drift config', () => {
                const config = new AnimationConfig({
                    drift: { direction: 'up', distance: 0.05, maxDistance: 1.0 }
                });

                expect(config.hold.drift.direction).toBe('up');
                expect(config.hold.drift.distance).toBe(0.05);
                expect(config.hold.drift.maxDistance).toBe(1.0);
            });

            it('should parse bounce option', () => {
                const config = new AnimationConfig({
                    drift: { bounce: true }
                });

                expect(config.hold.drift.bounce).toBe(true);
            });

            it('should use drift defaults for missing values', () => {
                const config = new AnimationConfig({
                    drift: { direction: 'random' }
                });

                expect(config.hold.drift.speed).toBe(DRIFT_DEFAULTS.speed);
                expect(config.hold.drift.maxDistance).toBe(DRIFT_DEFAULTS.maxDistance);
            });
        });

        describe('rotate', () => {
            it('should parse rotate config with string axis', () => {
                const config = new AnimationConfig({
                    rotate: { axis: 'z', speed: 0.2 }
                });

                expect(config.hold.rotate.axis).toEqual([0, 0, 1]);
                expect(config.hold.rotate.speed).toBe(0.2);
            });

            it('should parse rotate config with array axis', () => {
                const config = new AnimationConfig({
                    rotate: { axis: [1, 1, 0] }
                });

                expect(config.hold.rotate.axis).toEqual([1, 1, 0]);
            });

            it('should parse oscillate option', () => {
                const config = new AnimationConfig({
                    rotate: { oscillate: true, range: Math.PI / 2 }
                });

                expect(config.hold.rotate.oscillate).toBe(true);
                expect(config.hold.rotate.range).toBe(Math.PI / 2);
            });

            it('should normalize string axis values', () => {
                expect(new AnimationConfig({ rotate: { axis: 'x' } }).hold.rotate.axis).toEqual([1, 0, 0]);
                expect(new AnimationConfig({ rotate: { axis: 'y' } }).hold.rotate.axis).toEqual([0, 1, 0]);
                expect(new AnimationConfig({ rotate: { axis: 'z' } }).hold.rotate.axis).toEqual([0, 0, 1]);
            });

            it('should default unknown axis to Y', () => {
                const config = new AnimationConfig({
                    rotate: { axis: 'unknown' }
                });

                expect(config.hold.rotate.axis).toEqual([0, 1, 0]);
            });
        });

        describe('emissive', () => {
            it('should parse emissive config', () => {
                const config = new AnimationConfig({
                    emissive: { min: 0.2, max: 2.0, frequency: 2, pattern: 'sawtooth' }
                });

                expect(config.hold.emissive.min).toBe(0.2);
                expect(config.hold.emissive.max).toBe(2.0);
                expect(config.hold.emissive.frequency).toBe(2);
                expect(config.hold.emissive.pattern).toBe('sawtooth');
            });

            it('should parse dutyCycle for pulse pattern', () => {
                const config = new AnimationConfig({
                    emissive: { pattern: 'pulse', dutyCycle: 0.3 }
                });

                expect(config.hold.emissive.dutyCycle).toBe(0.3);
            });

            it('should use emissive defaults for missing values', () => {
                const config = new AnimationConfig({
                    emissive: { min: 0.1 }
                });

                expect(config.hold.emissive.max).toBe(EMISSIVE_DEFAULTS.max);
                expect(config.hold.emissive.frequency).toBe(EMISSIVE_DEFAULTS.frequency);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // VARIANCE PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('variance parsing', () => {
        it('should parse variance values', () => {
            const config = new AnimationConfig({
                scaleVariance: 0.2,
                lifetimeVariance: 0.1,
                colorVariance: 0.05,
                delayVariance: 0.03
            });

            expect(config.variance.scale).toBe(0.2);
            expect(config.variance.lifetime).toBe(0.1);
            expect(config.variance.color).toBe(0.05);
            expect(config.variance.delay).toBe(0.03);
        });

        it('should default variance to 0', () => {
            const config = new AnimationConfig();

            expect(config.variance.scale).toBe(0);
            expect(config.variance.lifetime).toBe(0);
            expect(config.variance.color).toBe(0);
            expect(config.variance.delay).toBe(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // APPEARANCE PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('appearance parsing', () => {
        it('should parse color config', () => {
            const config = new AnimationConfig({
                color: { tint: '#ff0000', multiply: false, variance: 0.1 }
            });

            expect(config.appearance.color.tint).toBe('#ff0000');
            expect(config.appearance.color.multiply).toBe(false);
            expect(config.appearance.color.variance).toBe(0.1);
        });

        it('should parse opacity config', () => {
            const config = new AnimationConfig({
                opacity: { base: 0.8, variance: 0.1 }
            });

            expect(config.appearance.opacity.base).toBe(0.8);
            expect(config.appearance.opacity.variance).toBe(0.1);
        });

        it('should parse scale config', () => {
            const config = new AnimationConfig({
                scale: { base: 1.5, variance: 0.2 }
            });

            expect(config.appearance.scale.base).toBe(1.5);
            expect(config.appearance.scale.variance).toBe(0.2);
        });

        it('should use appearance defaults', () => {
            const config = new AnimationConfig();

            expect(config.appearance.color).toBeNull();
            expect(config.appearance.opacity.base).toBe(1.0);
            expect(config.appearance.scale.base).toBe(1.0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDERING PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('rendering parsing', () => {
        it('should parse render order', () => {
            const config = new AnimationConfig({
                renderOrder: 10
            });

            expect(config.rendering.renderOrder).toBe(10);
        });

        it('should parse depth test/write', () => {
            const config = new AnimationConfig({
                depthTest: false,
                depthWrite: true
            });

            expect(config.rendering.depthTest).toBe(false);
            expect(config.rendering.depthWrite).toBe(true);
        });

        it('should parse blending mode', () => {
            const config = new AnimationConfig({
                blending: 'additive'
            });

            expect(config.rendering.blending).toBe('additive');
        });

        it('should parse trail config', () => {
            const config = new AnimationConfig({
                trail: { count: 5, fadeRate: 0.5, spacing: 0.1 }
            });

            expect(config.rendering.trail.count).toBe(5);
            expect(config.rendering.trail.fadeRate).toBe(0.5);
            expect(config.rendering.trail.spacing).toBe(0.1);
        });

        it('should use trail defaults for missing values', () => {
            const config = new AnimationConfig({
                trail: { count: 4 }
            });

            expect(config.rendering.trail.fadeRate).toBe(0.3);
            expect(config.rendering.trail.spacing).toBe(0.05);
            expect(config.rendering.trail.inheritRotation).toBe(true);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('lifecycle parsing', () => {
        it('should parse respawn config', () => {
            const config = new AnimationConfig({
                respawn: true,
                respawnDelay: 0.5,
                respawnDelayMs: 500,
                maxRespawns: 3
            });

            expect(config.lifecycle.respawn).toBe(true);
            expect(config.lifecycle.respawnDelay).toBe(0.5);
            expect(config.lifecycle.respawnDelayMs).toBe(500);
            expect(config.lifecycle.maxRespawns).toBe(3);
        });

        it('should default maxRespawns to -1 (unlimited)', () => {
            const config = new AnimationConfig({
                respawn: true
            });

            expect(config.lifecycle.maxRespawns).toBe(-1);
        });

        it('should default respawn to false', () => {
            const config = new AnimationConfig();

            expect(config.lifecycle.respawn).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENTS PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('events parsing', () => {
        it('should parse event callbacks', () => {
            const onSpawn = vi.fn();
            const onEnterStart = vi.fn();
            const onEnterComplete = vi.fn();
            const onExitStart = vi.fn();
            const onExitComplete = vi.fn();
            const onRespawn = vi.fn();

            const config = new AnimationConfig({
                onSpawn,
                onEnterStart,
                onEnterComplete,
                onExitStart,
                onExitComplete,
                onRespawn
            });

            expect(config.events.onSpawn).toBe(onSpawn);
            expect(config.events.onEnterStart).toBe(onEnterStart);
            expect(config.events.onEnterComplete).toBe(onEnterComplete);
            expect(config.events.onExitStart).toBe(onExitStart);
            expect(config.events.onExitComplete).toBe(onExitComplete);
            expect(config.events.onRespawn).toBe(onRespawn);
        });

        it('should default events to null', () => {
            const config = new AnimationConfig();

            expect(config.events.onSpawn).toBeNull();
            expect(config.events.onEnterStart).toBeNull();
            expect(config.events.onEnterComplete).toBeNull();
            expect(config.events.onExitStart).toBeNull();
            expect(config.events.onExitComplete).toBeNull();
            expect(config.events.onRespawn).toBeNull();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // INTENSITY SCALING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('intensity scaling', () => {
        it('should parse intensity scaling config', () => {
            const config = new AnimationConfig({
                intensityScaling: {
                    scale: 2.0,
                    count: 1.5,
                    lifetime: 0.8
                }
            });

            expect(config.intensityScaling.scale).toBe(2.0);
            expect(config.intensityScaling.count).toBe(1.5);
            expect(config.intensityScaling.lifetime).toBe(0.8);
        });

        it('should default intensity scaling to 1.0', () => {
            const config = new AnimationConfig();

            expect(config.intensityScaling.scale).toBe(1.0);
            expect(config.intensityScaling.pulseAmplitude).toBe(1.0);
            expect(config.intensityScaling.flickerIntensity).toBe(1.0);
        });

        it('should set and get intensity', () => {
            const config = new AnimationConfig();

            config.setIntensity(0.5);
            expect(config.getIntensity()).toBe(0.5);

            config.setIntensity(0.75);
            expect(config.getIntensity()).toBe(0.75);
        });

        it('should clamp intensity to 0-1', () => {
            const config = new AnimationConfig();

            config.setIntensity(-0.5);
            expect(config.getIntensity()).toBe(0);

            config.setIntensity(1.5);
            expect(config.getIntensity()).toBe(1);
        });

        it('should calculate scaled values correctly', () => {
            const config = new AnimationConfig({
                intensityScaling: { scale: 2.0 }
            });

            // At intensity 0, no scaling
            config.setIntensity(0);
            expect(config.getScaledValue('scale', 1.0)).toBe(1.0);

            // At intensity 1, full scaling (2x)
            config.setIntensity(1);
            expect(config.getScaledValue('scale', 1.0)).toBe(2.0);

            // At intensity 0.5, halfway (1.5x)
            config.setIntensity(0.5);
            expect(config.getScaledValue('scale', 1.0)).toBe(1.5);
        });

        it('should return base value for unknown properties', () => {
            const config = new AnimationConfig();

            config.setIntensity(1);
            expect(config.getScaledValue('unknownProp', 5.0)).toBe(5.0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('utility methods', () => {
        describe('progressToMs', () => {
            it('should convert progress to milliseconds', () => {
                const config = new AnimationConfig({}, 2000);

                expect(config.progressToMs(0)).toBe(0);
                expect(config.progressToMs(0.5)).toBe(1000);
                expect(config.progressToMs(1)).toBe(2000);
            });
        });

        describe('msToProgress', () => {
            it('should convert milliseconds to progress', () => {
                const config = new AnimationConfig({}, 2000);

                expect(config.msToProgress(0)).toBe(0);
                expect(config.msToProgress(1000)).toBe(0.5);
                expect(config.msToProgress(2000)).toBe(1);
            });
        });

        describe('getAppearTime', () => {
            it('should return appearAt in progress mode', () => {
                const config = new AnimationConfig({
                    appearAt: 0.25
                });

                expect(config.getAppearTime()).toBe(0.25);
            });

            it('should return delayMs in ms mode', () => {
                const config = new AnimationConfig({
                    delayMs: 200
                });

                expect(config.getAppearTime()).toBe(200);
            });

            it('should force mode when specified', () => {
                const config = new AnimationConfig({
                    appearAt: 0.25
                }, 1000);

                expect(config.getAppearTime('ms')).toBe(250);
            });
        });

        describe('getDisappearTime', () => {
            it('should return disappearAt in progress mode', () => {
                const config = new AnimationConfig({
                    disappearAt: 0.75
                });

                expect(config.getDisappearTime()).toBe(0.75);
            });

            it('should calculate from lifetime in ms mode', () => {
                const config = new AnimationConfig({
                    delayMs: 100,
                    lifetimeMs: 500
                });

                expect(config.getDisappearTime()).toBe(600);
            });
        });

        describe('getStaggerOffset', () => {
            it('should return stagger offset for index', () => {
                const config = new AnimationConfig({
                    stagger: 0.1
                });

                expect(config.getStaggerOffset(0)).toBe(0);
                expect(config.getStaggerOffset(1)).toBe(0.1);
                expect(config.getStaggerOffset(5)).toBe(0.5);
            });

            it('should use staggerMs when in ms mode', () => {
                const config = new AnimationConfig({
                    delayMs: 0,
                    staggerMs: 50
                });

                expect(config.getStaggerOffset(3)).toBe(150);
            });
        });

        describe('applyVariance', () => {
            it('should return base when variance is 0', () => {
                const config = new AnimationConfig();

                expect(config.applyVariance(10, 0)).toBe(10);
            });

            it('should apply variance within range', () => {
                const config = new AnimationConfig();

                // Run multiple times to test randomness
                for (let i = 0; i < 100; i++) {
                    const result = config.applyVariance(10, 0.2);
                    expect(result).toBeGreaterThanOrEqual(8);
                    expect(result).toBeLessThanOrEqual(12);
                }
            });
        });

        describe('createElementConfig', () => {
            it('should create per-element config with variance', () => {
                const config = new AnimationConfig({
                    stagger: 0.1,
                    scaleVariance: 0.2,
                    opacity: { base: 0.8, variance: 0.1 }
                });

                const elemConfig = config.createElementConfig(2);

                expect(elemConfig.index).toBe(2);
                expect(elemConfig.appearOffset).toBe(0.2); // index * stagger

                // Scale should be within variance range
                expect(elemConfig.scale).toBeGreaterThanOrEqual(0.8);
                expect(elemConfig.scale).toBeLessThanOrEqual(1.2);

                // Opacity should be within variance range
                expect(elemConfig.opacity).toBeGreaterThanOrEqual(0.72);
                expect(elemConfig.opacity).toBeLessThanOrEqual(0.88);
            });

            it('should include lifetime multiplier', () => {
                const config = new AnimationConfig({
                    lifetimeVariance: 0.2
                });

                const elemConfig = config.createElementConfig(0);

                expect(elemConfig.lifetimeMultiplier).toBeGreaterThanOrEqual(0.8);
                expect(elemConfig.lifetimeMultiplier).toBeLessThanOrEqual(1.2);
            });
        });

        describe('mergeWithElement', () => {
            it('should return self when no element config', () => {
                const config = new AnimationConfig({ enter: { type: 'fade' } });

                expect(config.mergeWithElement(null)).toBe(config);
            });

            it('should create new config with merged values', () => {
                const config = new AnimationConfig({
                    enter: { type: 'fade', duration: 0.1 }
                });

                const merged = config.mergeWithElement({
                    enter: { type: 'flash' }
                });

                expect(merged).not.toBe(config);
                expect(merged.enter.type).toBe('flash');
                // Duration should be preserved from element override or default
            });

            it('should preserve gesture duration', () => {
                const config = new AnimationConfig({}, 2000);

                const merged = config.mergeWithElement({ enter: { type: 'pop' } });

                expect(merged.gestureDuration).toBe(2000);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // parseAnimationConfig FUNCTION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('parseAnimationConfig', () => {
        it('should create AnimationConfig instance', () => {
            const result = parseAnimationConfig({ enter: { type: 'flash' } }, 1500);

            expect(result).toBeInstanceOf(AnimationConfig);
            expect(result.enter.type).toBe('flash');
            expect(result.gestureDuration).toBe(1500);
        });

        it('should use default gesture duration', () => {
            const result = parseAnimationConfig({});

            expect(result.gestureDuration).toBe(1000);
        });
    });

});
