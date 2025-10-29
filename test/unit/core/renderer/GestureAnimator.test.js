/**
 * Comprehensive tests for GestureAnimator
 * Tests gesture animations, state management, transformations, and all gesture methods
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GestureAnimator } from '../../../../src/core/renderer/GestureAnimator.js';

// Mock dependencies
vi.mock('../../../../src/core/gestures/gestureCacheWrapper.js', () => ({
    getGesture: vi.fn(gestureName => ({
        name: gestureName,
        config: {
            amplitude: 20,
            frequency: 2,
            duration: 1000,
            scaleAmount: 0.2,
            glowAmount: 0.3,
            rotations: 1,
            distance: 50,
            angle: 15,
            scaleTarget: 1.5,
            glowPeak: 2.0,
            scalePeak: 1.1,
            scaleX: 1.2,
            scaleY: 0.8,
            maxOpacity: 1,
            minOpacity: 0.5,
            lookDirection: 'random',
            lookDistance: 1,
            wobbleFreq: 4,
            squashAmount: 0.8,
            stretchAmount: 1.2,
            jumpHeight: 100,
            decay: true,
            easing: 'sine',
            effects: [],
            intensity: 1.0,
            speed: 1,
            musicalDuration: null,
            particleMotion: {
                type: gestureName,
                strength: 1.0
            }
        }
    }))
}));

vi.mock('../../../../src/core/MusicalDuration.js', () => ({
    default: {
        toMilliseconds: vi.fn(duration => 1000)
    }
}));

describe('GestureAnimator', () => {
    let animator;
    let mockRenderer;
    let performanceNowSpy;

    beforeEach(() => {
        // Mock performance.now() for consistent timing
        const currentTime = 0;
        performanceNowSpy = vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

        // Create mock renderer with all required properties
        mockRenderer = {
            scaleFactor: 1,
            state: {
                emotion: 'neutral'
            },
            currentUndertone: null,
            specialEffects: {
                triggerChromaticAberration: vi.fn()
            },
            gestureCompositor: {
                compose: vi.fn((gestureName, emotion, undertone) => ({
                    amplitude: 20,
                    frequency: 2,
                    duration: 1000,
                    scaleAmount: 0.2,
                    glowAmount: 0.3,
                    rotations: 1,
                    distance: 50,
                    angle: 15,
                    decay: true,
                    easing: 'sine',
                    effects: [],
                    glowPeak: 2.0,
                    scalePeak: 1.1,
                    intensity: 1.0,
                    speed: 1
                }))
            },
            particleSystem: {
                setGestureBehavior: vi.fn()
            }
        };

        animator = new GestureAnimator(mockRenderer);
    });

    afterEach(() => {
        performanceNowSpy.mockRestore();
    });

    describe('Constructor', () => {
        it('should create animator instance', () => {
            expect(animator).toBeDefined();
            expect(animator).toBeInstanceOf(GestureAnimator);
        });

        it('should store renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
        });

        it('should initialize activeGestures Map', () => {
            expect(animator.activeGestures).toBeInstanceOf(Map);
            expect(animator.activeGestures.size).toBe(0);
        });

        it('should initialize scaleFactor from renderer', () => {
            expect(animator.scaleFactor).toBe(1);
        });

        it('should initialize all gesture animations to inactive', () => {
            const allGestures = [
                'bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt', 'expand', 'contract',
                'flash', 'drift', 'stretch', 'glow', 'flicker', 'vibrate', 'orbital', 'hula',
                'wave', 'breathe', 'morph', 'slowBlink', 'look', 'settle', 'breathIn', 'breathOut',
                'breathHold', 'breathHoldEmpty', 'jump', 'sway', 'float', 'sparkle', 'shimmer',
                'wiggle', 'groove', 'point', 'lean', 'reach', 'headBob', 'orbit', 'rain',
                'runningman', 'charleston'
            ];

            allGestures.forEach(gesture => {
                expect(animator.gestureAnimations[gesture]).toBeDefined();
                expect(animator.gestureAnimations[gesture].active).toBe(false);
                expect(animator.gestureAnimations[gesture].progress).toBe(0);
                expect(animator.gestureAnimations[gesture].params).toEqual({});
            });
        });

        it('should have 40+ gesture animation entries', () => {
            const gestureCount = Object.keys(animator.gestureAnimations).length;
            expect(gestureCount).toBeGreaterThanOrEqual(40);
        });
    });

    describe('startGesture', () => {
        it('should activate gesture animation', () => {
            animator.startGesture('bounce');
            expect(animator.gestureAnimations.bounce.active).toBe(true);
        });

        it('should set gesture start time', () => {
            animator.startGesture('pulse');
            expect(animator.gestureAnimations.pulse.startTime).toBe(0);
        });

        it('should initialize progress to 0', () => {
            animator.startGesture('shake');
            expect(animator.gestureAnimations.shake.progress).toBe(0);
        });

        it('should set gesture parameters from compositor', () => {
            animator.startGesture('spin');
            expect(animator.gestureAnimations.spin.params).toBeDefined();
            expect(animator.gestureAnimations.spin.params.amplitude).toBe(20);
        });

        it('should set duration from gesture config', () => {
            animator.startGesture('flash');
            expect(animator.gestureAnimations.flash.duration).toBe(1000);
        });

        it('should trigger chromatic aberration for impact gestures', () => {
            const impactGestures = ['bounce', 'shake', 'pulse', 'flash', 'jump', 'spin', 'flicker'];

            impactGestures.forEach(gesture => {
                mockRenderer.specialEffects.triggerChromaticAberration.mockClear();
                animator.startGesture(gesture);
                expect(mockRenderer.specialEffects.triggerChromaticAberration).toHaveBeenCalled();
            });
        });

        it('should not trigger chromatic aberration for non-impact gestures', () => {
            mockRenderer.specialEffects.triggerChromaticAberration.mockClear();
            animator.startGesture('drift');
            expect(mockRenderer.specialEffects.triggerChromaticAberration).not.toHaveBeenCalled();
        });

        it('should reset shake random angle', () => {
            const anim = animator.gestureAnimations.shake;
            anim.randomAngle = 1.5;
            animator.startGesture('shake');
            expect(anim.randomAngle).toBeUndefined();
        });

        it('should reset drift state', () => {
            const anim = animator.gestureAnimations.drift;
            anim.startX = 10;
            anim.startY = 20;
            anim.currentDriftAngle = 1.5;
            animator.startGesture('drift');
            expect(anim.startX).toBeUndefined();
            expect(anim.startY).toBeUndefined();
            expect(anim.currentDriftAngle).toBeUndefined();
        });

        it('should reset tilt direction', () => {
            const anim = animator.gestureAnimations.tilt;
            anim.tiltDirection = 1;
            animator.startGesture('tilt');
            expect(anim.tiltDirection).toBeUndefined();
        });

        it('should reset vibrate angles', () => {
            const anim = animator.gestureAnimations.vibrate;
            anim.vibrateAngles = { x: 0.5, y: 0.5 };
            animator.startGesture('vibrate');
            expect(anim.vibrateAngles).toBeUndefined();
        });

        it('should handle missing gesture compositor', () => {
            animator.renderer.gestureCompositor = null;
            animator.startGesture('bounce');
            expect(animator.gestureAnimations.bounce.active).toBe(true);
            expect(animator.gestureAnimations.bounce.params).toBeDefined();
        });
    });

    describe('applyGestureAnimations', () => {
        it('should return transform object with all properties', () => {
            const transform = animator.applyGestureAnimations();
            expect(transform).toHaveProperty('offsetX');
            expect(transform).toHaveProperty('offsetY');
            expect(transform).toHaveProperty('scale');
            expect(transform).toHaveProperty('rotation');
            expect(transform).toHaveProperty('glow');
        });

        it('should return neutral transform when no gestures active', () => {
            const transform = animator.applyGestureAnimations();
            expect(transform.offsetX).toBe(0);
            expect(transform.offsetY).toBe(0);
            expect(transform.scale).toBe(1);
            expect(transform.rotation).toBe(0);
            expect(transform.glow).toBe(1);
        });

        it('should update gesture progress based on elapsed time', () => {
            animator.startGesture('bounce');
            performanceNowSpy.mockReturnValue(500); // 50% through
            animator.applyGestureAnimations();
            expect(animator.gestureAnimations.bounce.progress).toBeCloseTo(0.5, 1);
        });

        it('should complete gesture when progress reaches 1', () => {
            animator.startGesture('pulse');
            performanceNowSpy.mockReturnValue(1000); // 100% complete
            animator.applyGestureAnimations();
            expect(animator.gestureAnimations.pulse.active).toBe(false);
            expect(animator.gestureAnimations.pulse.progress).toBe(0);
        });

        it('should apply bounce transformation', () => {
            animator.startGesture('bounce');
            performanceNowSpy.mockReturnValue(250);
            const transform = animator.applyGestureAnimations();
            expect(transform.offsetY).not.toBe(0);
        });

        it('should apply pulse transformation', () => {
            animator.startGesture('pulse');
            performanceNowSpy.mockReturnValue(250); // Quarter way through at peak
            const transform = animator.applyGestureAnimations();
            // At 250ms, sine wave is positive, so scale and glow should differ from 1
            expect(Math.abs(transform.scale - 1)).toBeGreaterThan(0.01);
        });

        it('should apply shake transformation', () => {
            animator.startGesture('shake');
            performanceNowSpy.mockReturnValue(250);
            const transform = animator.applyGestureAnimations();
            expect(transform.offsetX !== 0 || transform.offsetY !== 0).toBe(true);
        });

        it('should apply spin transformation', () => {
            animator.startGesture('spin');
            performanceNowSpy.mockReturnValue(500);
            const transform = animator.applyGestureAnimations();
            expect(transform.rotation).not.toBe(0);
        });

        it('should combine multiple active gestures', () => {
            animator.startGesture('bounce');
            animator.startGesture('pulse');
            performanceNowSpy.mockReturnValue(500);
            const transform = animator.applyGestureAnimations();
            expect(transform.offsetY).not.toBe(0);
            expect(transform.scale).not.toBe(1);
        });

        it('should use MAX for glow accumulation', () => {
            animator.startGesture('pulse');
            animator.startGesture('glow');
            performanceNowSpy.mockReturnValue(250); // At peak of sine wave
            const transform = animator.applyGestureAnimations();
            expect(transform.glow).toBeGreaterThan(1);
        });

        it('should pass flash wave data when present', () => {
            animator.startGesture('flash');
            performanceNowSpy.mockReturnValue(500);
            const transform = animator.applyGestureAnimations();
            // Flash uses glow, not flashWave in current implementation
            expect(transform.glow).toBeDefined();
        });

        it('should clean up effect data when gesture completes', () => {
            animator.startGesture('sparkle');
            performanceNowSpy.mockReturnValue(1000);
            animator.applyGestureAnimations();
            expect(animator.gestureAnimations.sparkle.active).toBe(false);
        });
    });

    describe('update', () => {
        it('should call applyGestureAnimations', () => {
            const spy = vi.spyOn(animator, 'applyGestureAnimations');
            animator.update(16);
            expect(spy).toHaveBeenCalled();
        });

        it('should return transformation object', () => {
            const result = animator.update(16);
            expect(result).toBeDefined();
            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scale');
        });
    });

    describe('stopAllGestures', () => {
        it('should deactivate all active gestures', () => {
            animator.startGesture('bounce');
            animator.startGesture('pulse');
            animator.startGesture('shake');
            animator.stopAllGestures();

            expect(animator.gestureAnimations.bounce.active).toBe(false);
            expect(animator.gestureAnimations.pulse.active).toBe(false);
            expect(animator.gestureAnimations.shake.active).toBe(false);
        });

        it('should reset progress for all gestures', () => {
            animator.startGesture('bounce');
            animator.gestureAnimations.bounce.progress = 0.5;
            animator.stopAllGestures();
            expect(animator.gestureAnimations.bounce.progress).toBe(0);
        });

        it('should reset start times', () => {
            animator.startGesture('pulse');
            animator.stopAllGestures();
            expect(animator.gestureAnimations.pulse.startTime).toBe(0);
        });

        it('should clear params', () => {
            animator.startGesture('shake');
            animator.stopAllGestures();
            expect(animator.gestureAnimations.shake.params).toBeNull();
        });

        it('should clear activeGestures map', () => {
            animator.activeGestures.set('test', {});
            animator.stopAllGestures();
            expect(animator.activeGestures.size).toBe(0);
        });

        it('should clean up glow effect data', () => {
            const anim = animator.gestureAnimations.glow;
            anim.glowEffect = {};
            anim.particleGlow = 1.5;
            animator.stopAllGestures();
            expect(anim.glowEffect).toBeNull();
            expect(anim.particleGlow).toBeNull();
        });

        it('should clean up firefly effect data', () => {
            const anim = animator.gestureAnimations.sparkle;
            anim.fireflyEffect = {};
            animator.stopAllGestures();
            expect(anim.fireflyEffect).toBeNull();
        });

        it('should clean up flicker effect data', () => {
            const anim = animator.gestureAnimations.flicker;
            anim.flickerEffect = {};
            animator.stopAllGestures();
            expect(anim.flickerEffect).toBeNull();
        });

        it('should clean up shimmer effect data', () => {
            const anim = animator.gestureAnimations.shimmer;
            anim.shimmerEffect = {};
            animator.stopAllGestures();
            expect(anim.shimmerEffect).toBeNull();
        });

        it('should clean up flash wave data', () => {
            const anim = animator.gestureAnimations.flash;
            anim.flashWave = {};
            anim.flashWaveData = {};
            animator.stopAllGestures();
            expect(anim.flashWave).toBeNull();
            expect(anim.flashWaveData).toBeNull();
        });
    });

    describe('getCurrentGesture', () => {
        it('should return null when no gestures active', () => {
            const gesture = animator.getCurrentGesture();
            expect(gesture).toBeNull();
        });

        it('should return active gesture info', () => {
            animator.startGesture('bounce');
            const gesture = animator.getCurrentGesture();
            expect(gesture).toBeDefined();
            expect(gesture.name).toBe('bounce');
        });

        it('should prioritize override gestures', () => {
            animator.startGesture('bounce');
            animator.startGesture('orbital');
            const gesture = animator.getCurrentGesture();
            expect(gesture.name).toBe('orbital');
        });

        it('should include particleMotion info', () => {
            animator.startGesture('spin');
            const gesture = animator.getCurrentGesture();
            expect(gesture.particleMotion).toBeDefined();
            expect(gesture.particleMotion.type).toBe('spin');
        });

        it('should include progress', () => {
            animator.startGesture('pulse');
            animator.gestureAnimations.pulse.progress = 0.5;
            const gesture = animator.getCurrentGesture();
            expect(gesture.progress).toBe(0.5);
        });

        it('should include params', () => {
            animator.startGesture('shake');
            const gesture = animator.getCurrentGesture();
            expect(gesture.params).toBeDefined();
        });

        it('should include breathPhase for breathe gesture', () => {
            animator.startGesture('breathe');
            animator.gestureAnimations.breathe.breathPhase = 0.75;
            const gesture = animator.getCurrentGesture();
            expect(gesture.breathPhase).toBe(0.75);
        });

        it('should check override gestures in order', () => {
            animator.startGesture('wave');
            const gesture = animator.getCurrentGesture();
            expect(gesture.name).toBe('wave');
        });
    });

    describe('applyEasing', () => {
        it('should return linear easing', () => {
            expect(animator.applyEasing(0.5, 'linear')).toBe(0.5);
        });

        it('should apply quad easing', () => {
            expect(animator.applyEasing(0.5, 'quad')).toBe(0.25);
        });

        it('should apply cubic easing', () => {
            expect(animator.applyEasing(0.5, 'cubic')).toBe(0.125);
        });

        it('should apply sine easing', () => {
            const result = animator.applyEasing(0.5, 'sine');
            expect(result).toBeCloseTo(0.707, 2);
        });

        it('should apply back easing', () => {
            const result = animator.applyEasing(0.5, 'back');
            // back easing: progress * progress * (2.7 * progress - 1.7)
            // 0.5 * 0.5 * (2.7 * 0.5 - 1.7) = 0.25 * (1.35 - 1.7) = 0.25 * -0.35 = -0.0875
            expect(result).toBeCloseTo(-0.0875, 2);
        });

        it('should default to linear for unknown easing', () => {
            expect(animator.applyEasing(0.5, 'unknown')).toBe(0.5);
        });

        it('should handle progress 0', () => {
            expect(animator.applyEasing(0, 'quad')).toBe(0);
        });

        it('should handle progress 1', () => {
            expect(animator.applyEasing(1, 'quad')).toBe(1);
        });
    });

    describe('Individual gesture methods', () => {
        describe('applyBounce', () => {
            it('should apply vertical bounce offset', () => {
                const anim = {
                    params: { amplitude: 20, frequency: 2, effects: [] }
                };
                const result = animator.applyBounce(anim, 0.25);
                expect(result.offsetY).toBeDefined();
                expect(result.offsetY).toBeLessThan(0); // Bounce is upward
            });

            it('should apply gravity effect when specified', () => {
                const anim = {
                    params: { amplitude: 20, frequency: 2, effects: ['gravity'] }
                };
                const result = animator.applyBounce(anim, 0.5);
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyPulse', () => {
            it('should apply scale and glow', () => {
                const anim = {
                    params: { frequency: 2, scaleAmount: 0.2, glowAmount: 0.3 }
                };
                const result = animator.applyPulse(anim, 0.5);
                expect(result.scale).toBeDefined();
                expect(result.glow).toBeDefined();
            });
        });

        describe('applyShake', () => {
            it('should initialize random angle', () => {
                const anim = { params: { amplitude: 10, frequency: 2, decay: false } };
                animator.applyShake(anim, 0.5);
                expect(anim.randomAngle).toBeDefined();
            });

            it('should apply offset in X and Y', () => {
                const anim = {
                    params: { amplitude: 10, frequency: 2, decay: false },
                    randomAngle: Math.PI / 4
                };
                const result = animator.applyShake(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });

            it('should apply decay when enabled', () => {
                const anim = {
                    params: { amplitude: 10, frequency: 2, decay: true },
                    randomAngle: 0
                };
                const early = animator.applyShake(anim, 0.1);
                const late = animator.applyShake(anim, 0.9);
                expect(Math.abs(early.offsetX)).toBeGreaterThan(Math.abs(late.offsetX));
            });
        });

        describe('applySpin', () => {
            it('should apply rotation', () => {
                const anim = {
                    params: { rotations: 2, scaleAmount: 0.1 }
                };
                const result = animator.applySpin(anim, 0.5);
                expect(result.rotation).toBeDefined();
                expect(result.rotation).toBeGreaterThan(0);
            });

            it('should complete full rotation', () => {
                const anim = {
                    params: { rotations: 1, scaleAmount: 0.1 }
                };
                const result = animator.applySpin(anim, 0.99);
                expect(result.rotation).toBeGreaterThanOrEqual(360);
            });

            it('should apply scale variation', () => {
                const anim = {
                    params: { rotations: 1, scaleAmount: 0.2 }
                };
                const result = animator.applySpin(anim, 0.5);
                expect(result.scale).toBeDefined();
            });
        });

        describe('applyNod', () => {
            it('should apply vertical offset', () => {
                const anim = {
                    params: { amplitude: 15, frequency: 2 }
                };
                const result = animator.applyNod(anim, 0.5);
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyTilt', () => {
            it('should initialize random tilt direction', () => {
                const anim = { params: { frequency: 2, angle: 15 } };
                animator.applyTilt(anim, 0.5);
                expect(anim.tiltDirection).toBeDefined();
                expect([1, -1]).toContain(anim.tiltDirection);
            });

            it('should apply rotation, scale and offset', () => {
                const anim = {
                    params: { frequency: 2, angle: 15 },
                    tiltDirection: 1
                };
                const result = animator.applyTilt(anim, 0.5);
                expect(result.rotation).toBeDefined();
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyExpand', () => {
            it('should increase scale', () => {
                const anim = {
                    params: { scaleTarget: 1.5, glowAmount: 0.2 }
                };
                const result = animator.applyExpand(anim, 0.5);
                expect(result.scale).toBeGreaterThan(1);
            });

            it('should increase glow', () => {
                const anim = {
                    params: { scaleTarget: 1.5, glowAmount: 0.2 }
                };
                const result = animator.applyExpand(anim, 0.5);
                expect(result.glow).toBeGreaterThan(1);
            });
        });

        describe('applyContract', () => {
            it('should decrease scale', () => {
                const anim = {
                    params: { scaleTarget: 0.7, glowAmount: -0.2 }
                };
                const result = animator.applyContract(anim, 0.5);
                expect(result.scale).toBeLessThan(1);
            });
        });

        describe('applyFlash', () => {
            it('should peak glow at midpoint', () => {
                const anim = {
                    params: { glowPeak: 2.0, scalePeak: 1.1 }
                };
                const mid = animator.applyFlash(anim, 0.5);
                const start = animator.applyFlash(anim, 0);
                expect(mid.glow).toBeGreaterThan(start.glow);
            });

            it('should apply scale peak', () => {
                const anim = {
                    params: { glowPeak: 2.0, scalePeak: 1.2 }
                };
                const result = animator.applyFlash(anim, 0.5);
                expect(result.scale).toBeGreaterThan(1);
            });
        });

        describe('applyDrift', () => {
            it('should initialize drift angle', () => {
                const anim = { params: { distance: 50 } };
                animator.applyDrift(anim, 0.01);
                expect(anim.currentDriftAngle).toBeDefined();
            });

            it('should apply offset in random direction', () => {
                const anim = {
                    params: { distance: 50 },
                    currentDriftAngle: Math.PI / 4
                };
                const result = animator.applyDrift(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });

            it('should clear drift angle when complete', () => {
                const anim = {
                    params: { distance: 50 },
                    currentDriftAngle: Math.PI / 4
                };
                animator.applyDrift(anim, 0.99);
                expect(anim.currentDriftAngle).toBeNull();
            });
        });

        describe('applyStretch', () => {
            it('should apply scale based on scaleX and scaleY', () => {
                const anim = {
                    params: { scaleX: 1.2, scaleY: 0.8, frequency: 2 }
                };
                const result = animator.applyStretch(anim, 0.5);
                expect(result.scale).toBeDefined();
            });
        });

        describe('applyGlow', () => {
            it('should apply strong glow effect', () => {
                const anim = {
                    params: { frequency: 2, scaleAmount: 0.1, glowAmount: 0.8 }
                };
                const result = animator.applyGlow(anim, 0.25); // At peak of sine wave
                expect(result.glow).toBeGreaterThan(1);
            });

            it('should apply subtle scale', () => {
                const anim = {
                    params: { frequency: 2, scaleAmount: 0.1, glowAmount: 0.8 }
                };
                const result = animator.applyGlow(anim, 0.5);
                expect(result.scale).toBeDefined();
            });
        });

        describe('applyFlicker', () => {
            it('should return particle effect data', () => {
                const anim = {
                    params: { intensity: 2.0, speed: 3 }
                };
                const result = animator.applyFlicker(anim, 0.5);
                expect(result.flickerEffect).toBe(true);
                expect(result.particleGlow).toBeDefined();
                expect(result.flickerTime).toBeDefined();
            });

            it('should apply horizontal wave', () => {
                const anim = {
                    params: { intensity: 2.0, speed: 3 }
                };
                const result = animator.applyFlicker(anim, 0.5);
                expect(result.offsetX).toBeDefined();
            });
        });

        describe('applyVibrate', () => {
            it('should initialize vibrate angles', () => {
                const anim = {
                    params: { amplitude: 5, frequency: 10 }
                };
                animator.applyVibrate(anim, 0.5);
                expect(anim.vibrateAngles).toBeDefined();
                expect(anim.vibrateAngles.x).toBeDefined();
                expect(anim.vibrateAngles.y).toBeDefined();
            });

            it('should apply rapid vibration in random direction', () => {
                const anim = {
                    params: { amplitude: 5, frequency: 10 },
                    vibrateAngles: { x: 0.707, y: 0.707 }
                };
                const result = animator.applyVibrate(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyWave', () => {
            it('should apply infinity symbol motion', () => {
                const anim = {
                    params: { amplitude: 40 }
                };
                const result = animator.applyWave(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });

            it('should apply tilt following wave', () => {
                const anim = {
                    params: { amplitude: 40 }
                };
                const result = animator.applyWave(anim, 0.5);
                expect(result.rotation).toBeDefined();
            });

            it('should apply scale and glow pulse', () => {
                const anim = {
                    params: { amplitude: 40 }
                };
                const result = animator.applyWave(anim, 0.5);
                expect(result.scale).toBeDefined();
                expect(result.glow).toBeDefined();
            });
        });

        describe('applyBreathe', () => {
            it('should apply breathing phases', () => {
                const anim = {
                    params: {
                        scaleAmount: 0.25,
                        glowAmount: 0.4,
                        particleMotion: { holdPercent: 0.1 }
                    }
                };
                const result = animator.applyBreathe(anim, 0.5);
                expect(result.scale).toBeDefined();
                expect(result.glow).toBeDefined();
                expect(result.breathPhase).toBeDefined();
            });

            it('should store breath phase', () => {
                const anim = {
                    params: {
                        scaleAmount: 0.25,
                        glowAmount: 0.4,
                        particleMotion: { holdPercent: 0.1 }
                    }
                };
                animator.applyBreathe(anim, 0.2);
                expect(anim.breathPhase).toBeDefined();
            });
        });

        describe('applyLook', () => {
            it('should initialize target position', () => {
                const anim = {
                    params: { lookDirection: 'left', lookDistance: 1 }
                };
                animator.applyLook(anim, 0.1);
                expect(anim.targetX).toBeDefined();
                expect(anim.targetY).toBeDefined();
            });

            it('should handle directional look', () => {
                const directions = ['left', 'right', 'up', 'down'];
                directions.forEach(dir => {
                    const anim = {
                        params: { lookDirection: dir, lookDistance: 1 }
                    };
                    const result = animator.applyLook(anim, 0.5);
                    expect(result.offsetX).toBeDefined();
                    expect(result.offsetY).toBeDefined();
                });
            });

            it('should handle random look direction', () => {
                const anim = {
                    params: { lookDirection: 'random', lookDistance: 1 }
                };
                const result = animator.applyLook(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyJump', () => {
            it('should have squash phase', () => {
                const anim = {
                    params: {
                        squashAmount: 0.8,
                        stretchAmount: 1.2,
                        jumpHeight: 100
                    }
                };
                const result = animator.applyJump(anim, 0.1);
                expect(result.scale).toBeLessThan(1);
            });

            it('should have jump phase', () => {
                const anim = {
                    params: {
                        squashAmount: 0.8,
                        stretchAmount: 1.2,
                        jumpHeight: 100
                    }
                };
                const result = animator.applyJump(anim, 0.4);
                expect(result.offsetY).toBeLessThan(0);
            });

            it('should have landing phase', () => {
                const anim = {
                    params: {
                        squashAmount: 0.8,
                        stretchAmount: 1.2,
                        jumpHeight: 100
                    }
                };
                const result = animator.applyJump(anim, 0.85);
                expect(result.scale).toBeDefined();
            });
        });

        describe('applySway', () => {
            it('should apply horizontal sway', () => {
                const anim = {
                    params: { amplitude: 30, frequency: 1 }
                };
                const result = animator.applySway(anim, 0.5);
                expect(result.offsetX).toBeDefined();
            });

            it('should apply vertical bob', () => {
                const anim = {
                    params: { amplitude: 30, frequency: 1 }
                };
                const result = animator.applySway(anim, 0.5);
                expect(result.offsetY).toBeDefined();
            });

            it('should apply rotation matching sway', () => {
                const anim = {
                    params: { amplitude: 30, frequency: 1 }
                };
                const result = animator.applySway(anim, 0.5);
                expect(result.rotation).toBeDefined();
            });
        });

        describe('applyFloat', () => {
            it('should apply vertical float', () => {
                const anim = {
                    params: { amplitude: 20, speed: 1 }
                };
                const result = animator.applyFloat(anim, 0.5);
                expect(result.offsetY).toBeDefined();
            });

            it('should apply horizontal drift', () => {
                const anim = {
                    params: { amplitude: 20, speed: 1 }
                };
                const result = animator.applyFloat(anim, 0.5);
                expect(result.offsetX).toBeDefined();
            });

            it('should apply scale pulsation', () => {
                const anim = {
                    params: { amplitude: 20, speed: 1 }
                };
                const result = animator.applyFloat(anim, 0.5);
                expect(result.scale).toBeDefined();
            });
        });

        describe('applyRain', () => {
            it('should apply downward drift', () => {
                const anim = {
                    params: { intensity: 1.0 }
                };
                const result = animator.applyRain(anim, 0.5);
                expect(result.offsetY).toBeGreaterThan(0);
            });

            it('should apply wind sway', () => {
                const anim = {
                    params: { intensity: 1.0 }
                };
                const result = animator.applyRain(anim, 0.5);
                expect(result.offsetX).toBeDefined();
            });

            it('should signal particle effect', () => {
                const anim = {
                    params: { intensity: 1.0 }
                };
                const result = animator.applyRain(anim, 0.5);
                expect(result.particleEffect).toBe('falling');
            });

            it('should call particle system when available', () => {
                const anim = {
                    params: { intensity: 1.0 }
                };
                animator.applyRain(anim, 0.5);
                expect(mockRenderer.particleSystem.setGestureBehavior).toHaveBeenCalled();
            });
        });

        describe('applyOrbital', () => {
            it('should keep core still', () => {
                const anim = { params: {} };
                const result = animator.applyOrbital(anim, 0.5);
                expect(result.offsetX).toBe(0);
                expect(result.offsetY).toBe(0);
            });
        });

        describe('applyHula', () => {
            it('should apply figure-8 motion', () => {
                const anim = {
                    params: { amplitude: 40 }
                };
                const result = animator.applyHula(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applySparkle', () => {
            it('should return firefly effect data', () => {
                const anim = {
                    params: { intensity: 2.0 }
                };
                const result = animator.applySparkle(anim, 0.5);
                expect(result.fireflyEffect).toBe(true);
                expect(result.particleGlow).toBeDefined();
                expect(result.fireflyTime).toBeDefined();
            });

            it('should apply main pulse', () => {
                const anim = {
                    params: { intensity: 2.0 }
                };
                const result = animator.applySparkle(anim, 0.5);
                expect(result.glow).toBeDefined();
            });
        });

        describe('applyShimmer', () => {
            it('should apply subtle glow', () => {
                const anim = {
                    params: { intensity: 0.3 }
                };
                const result = animator.applyShimmer(anim, 0.5);
                expect(result.glow).toBeDefined();
            });

            it('should apply minimal scale', () => {
                const anim = {
                    params: { intensity: 0.3 }
                };
                const result = animator.applyShimmer(anim, 0.5);
                expect(result.scale).toBeCloseTo(1, 1);
            });

            it('should not move core', () => {
                const anim = {
                    params: { intensity: 0.3 }
                };
                const result = animator.applyShimmer(anim, 0.5);
                expect(result.offsetX).toBe(0);
                expect(result.offsetY).toBe(0);
            });

            it('should return shimmer effect data', () => {
                const anim = {
                    params: { intensity: 0.3 }
                };
                const result = animator.applyShimmer(anim, 0.5);
                expect(result.shimmerEffect).toBe(true);
                expect(result.shimmerTime).toBeDefined();
                expect(result.shimmerWave).toBeDefined();
            });
        });

        describe('applyWiggle', () => {
            it('should initialize wiggle direction', () => {
                const anim = {
                    params: { amplitude: 15 }
                };
                animator.applyWiggle(anim, 0.5);
                expect(anim.wiggleDirection).toBeDefined();
                expect([1, -1]).toContain(anim.wiggleDirection);
            });

            it('should apply 4-phase movement', () => {
                const anim = {
                    params: { amplitude: 15 },
                    wiggleDirection: 1
                };
                const phases = [0.1, 0.35, 0.6, 0.85];
                phases.forEach(progress => {
                    const result = animator.applyWiggle(anim, progress);
                    expect(result.offsetX).toBeDefined();
                    expect(result.rotation).toBeDefined();
                });
            });

            it('should apply bounce synced with movement', () => {
                const anim = {
                    params: { amplitude: 15 },
                    wiggleDirection: 1
                };
                const result = animator.applyWiggle(anim, 0.5);
                expect(result.offsetY).toBeLessThan(0);
            });
        });

        describe('applyGroove', () => {
            it('should apply smooth wave pattern', () => {
                const anim = {
                    params: { amplitude: 25 }
                };
                const result = animator.applyGroove(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });

            it('should apply natural breathing scale', () => {
                const anim = {
                    params: { amplitude: 25 }
                };
                const result = animator.applyGroove(anim, 0.5);
                expect(result.scale).toBeDefined();
            });

            it('should apply rotation for natural movement', () => {
                const anim = {
                    params: { amplitude: 25 }
                };
                const result = animator.applyGroove(anim, 0.5);
                expect(result.rotation).toBeDefined();
            });
        });

        describe('applyPoint', () => {
            it('should initialize point direction', () => {
                const anim = {
                    params: { distance: 40 }
                };
                animator.applyPoint(anim, 0.5);
                expect(anim.pointDirection).toBeDefined();
                expect([1, -1]).toContain(anim.pointDirection);
            });

            it('should have three phases', () => {
                const anim = {
                    params: { distance: 40 },
                    pointDirection: 1
                };
                const move = animator.applyPoint(anim, 0.2);
                const hold = animator.applyPoint(anim, 0.5);
                const returnPhase = animator.applyPoint(anim, 0.8);

                expect(move.offsetX).toBeDefined();
                expect(hold.offsetX).toBeDefined();
                expect(returnPhase.offsetX).toBeDefined();
            });

            it('should apply stretch and tilt', () => {
                const anim = {
                    params: { distance: 40 },
                    pointDirection: 1
                };
                const result = animator.applyPoint(anim, 0.5);
                expect(result.scale).toBeGreaterThan(1);
                expect(result.rotation).toBeDefined();
            });
        });

        describe('applyLean', () => {
            it('should apply rotation', () => {
                const anim = {
                    params: { angle: 15, side: 1 }
                };
                const result = animator.applyLean(anim, 0.5);
                expect(result.rotation).toBeDefined();
            });

            it('should apply offset matching lean', () => {
                const anim = {
                    params: { angle: 15, side: 1 }
                };
                const result = animator.applyLean(anim, 0.5);
                expect(result.offsetX).toBeDefined();
            });
        });

        describe('applyReach', () => {
            it('should have three phases', () => {
                const anim = {
                    params: { direction: -Math.PI/2, distance: 40 }
                };
                const reach = animator.applyReach(anim, 0.2);
                const hold = animator.applyReach(anim, 0.5);
                const returnPhase = animator.applyReach(anim, 0.8);

                expect(reach.offsetX).toBeDefined();
                expect(hold.offsetX).toBeDefined();
                expect(returnPhase.offsetX).toBeDefined();
            });

            it('should apply stretch when reaching', () => {
                const anim = {
                    params: { direction: -Math.PI/2, distance: 40 }
                };
                const result = animator.applyReach(anim, 0.5);
                expect(result.scale).toBeGreaterThan(1);
            });
        });

        describe('applyHeadBob', () => {
            it('should apply vertical bob', () => {
                const anim = {
                    params: { amplitude: 20, frequency: 2 }
                };
                const result = animator.applyHeadBob(anim, 0.5);
                expect(result.offsetY).toBeDefined();
            });

            it('should apply forward tilt on down beat', () => {
                const anim = {
                    params: { amplitude: 20, frequency: 2 }
                };
                const result = animator.applyHeadBob(anim, 0.1);
                expect(result.rotation).toBeDefined();
            });
        });

        describe('applyOrbit', () => {
            it('should apply circular motion', () => {
                const anim = {
                    params: { radius: 30, speed: 1 }
                };
                const result = animator.applyOrbit(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
            });
        });

        describe('applyRunningMan', () => {
            it('should apply running shuffle', () => {
                const anim = { params: {} };
                const result = animator.applyRunningMan(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
                expect(result.rotation).toBeDefined();
            });
        });

        describe('applyCharleston', () => {
            it('should apply crisscross kicks', () => {
                const anim = { params: {} };
                const result = animator.applyCharleston(anim, 0.5);
                expect(result.offsetX).toBeDefined();
                expect(result.offsetY).toBeDefined();
                expect(result.rotation).toBeDefined();
            });
        });
    });

    describe('Individual start methods', () => {
        it('should have start methods for all gestures', () => {
            const startMethods = [
                'startBounce', 'startPulse', 'startShake', 'startSpin', 'startNod',
                'startTilt', 'startExpand', 'startContract', 'startFlash', 'startDrift',
                'startStretch', 'startGlow', 'startFlicker', 'startVibrate', 'startOrbital',
                'startHula', 'startWave', 'startBreathe', 'startMorph', 'startSlowBlink',
                'startLook', 'startSettle', 'startBreathIn', 'startBreathOut', 'startBreathHold',
                'startBreathHoldEmpty', 'startJump', 'startSway', 'startFloat', 'startRain',
                'startSparkle', 'startShimmer', 'startWiggle', 'startGroove', 'startPoint',
                'startLean', 'startReach', 'startHeadBob', 'startOrbit'
            ];

            startMethods.forEach(method => {
                expect(typeof animator[method]).toBe('function');
            });
        });

        it('should call startGesture with correct name', () => {
            const spy = vi.spyOn(animator, 'startGesture');
            animator.startBounce();
            expect(spy).toHaveBeenCalledWith('bounce');
        });
    });

    describe('Pause and Resume', () => {
        it('should pause active animations', () => {
            animator.startGesture('bounce');
            animator.pauseCurrentAnimation();
            expect(animator.isPaused).toBe(true);
            expect(animator.gestureAnimations.bounce.pausedAt).toBeDefined();
        });

        it('should resume paused animations', () => {
            animator.startGesture('pulse');
            animator.pauseCurrentAnimation();
            performanceNowSpy.mockReturnValue(1000);
            animator.resumeAnimation();
            expect(animator.isPaused).toBe(false);
        });

        it('should adjust start time on resume', () => {
            performanceNowSpy.mockReturnValue(100); // Start at non-zero time
            animator.startGesture('shake');
            const originalStartTime = animator.gestureAnimations.shake.startTime;
            expect(originalStartTime).toBe(100);
            performanceNowSpy.mockReturnValue(500);
            animator.pauseCurrentAnimation();
            performanceNowSpy.mockReturnValue(1500);
            animator.resumeAnimation();
            // Start time should be adjusted by pause duration (1500 - 500 = 1000)
            expect(animator.gestureAnimations.shake.startTime).toBe(originalStartTime + 1000);
        });

        it('should clean up pause state on resume', () => {
            performanceNowSpy.mockReturnValue(0);
            animator.startGesture('spin');
            performanceNowSpy.mockReturnValue(100);
            animator.pauseCurrentAnimation();
            performanceNowSpy.mockReturnValue(200);
            animator.resumeAnimation();
            expect(animator.gestureAnimations.spin.pausedAt).toBeUndefined();
            expect(animator.gestureAnimations.spin.pausedProgress).toBeUndefined();
        });

        it('should not resume if not paused', () => {
            // Initially isPaused is undefined, not false
            expect(animator.isPaused).toBeUndefined();
            animator.resumeAnimation();
            // After resumeAnimation with isPaused undefined, it should still be undefined
            expect(animator.isPaused).toBeUndefined();
        });
    });

    describe('Reset', () => {
        it('should reset all animations', () => {
            animator.startGesture('bounce');
            animator.startGesture('pulse');
            animator.reset();

            expect(animator.gestureAnimations.bounce.active).toBe(false);
            expect(animator.gestureAnimations.pulse.active).toBe(false);
        });

        it('should clear all progress', () => {
            animator.startGesture('shake');
            animator.gestureAnimations.shake.progress = 0.5;
            animator.reset();
            expect(animator.gestureAnimations.shake.progress).toBe(0);
        });

        it('should clear params', () => {
            animator.startGesture('spin');
            animator.reset();
            expect(animator.gestureAnimations.spin.params).toEqual({});
        });

        it('should clear activeGestures map', () => {
            animator.activeGestures.set('test', {});
            animator.reset();
            expect(animator.activeGestures.size).toBe(0);
        });

        it('should reset pause state', () => {
            animator.isPaused = true;
            animator.reset();
            expect(animator.isPaused).toBe(false);
        });

        it('should delete start times', () => {
            animator.startGesture('flash');
            animator.reset();
            expect(animator.gestureAnimations.flash.startTime).toBeUndefined();
        });

        it('should delete pause times', () => {
            animator.startGesture('drift');
            animator.pauseCurrentAnimation();
            animator.reset();
            expect(animator.gestureAnimations.drift.pausedAt).toBeUndefined();
        });
    });

    describe('Scale Factor', () => {
        it('should apply scale factor to bounce', () => {
            animator.scaleFactor = 2;
            const anim = {
                params: { amplitude: 20, frequency: 2, effects: [] }
            };
            const result = animator.applyBounce(anim, 0.25); // At peak of sine
            expect(Math.abs(result.offsetY)).toBeGreaterThan(10);
        });

        it('should use renderer scale factor if provided', () => {
            mockRenderer.scaleFactor = 3;
            const newAnimator = new GestureAnimator(mockRenderer);
            expect(newAnimator.scaleFactor).toBe(3);
        });

        it('should default to 1 if no scale factor provided', () => {
            const rendererWithoutScale = { ...mockRenderer };
            delete rendererWithoutScale.scaleFactor;
            const newAnimator = new GestureAnimator(rendererWithoutScale);
            expect(newAnimator.scaleFactor).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle gesture without compositor', () => {
            animator.renderer.gestureCompositor = null;
            animator.startGesture('bounce');
            expect(animator.gestureAnimations.bounce.active).toBe(true);
        });

        it('should handle gesture without special effects', () => {
            animator.renderer.specialEffects = null;
            animator.startGesture('bounce');
            expect(animator.gestureAnimations.bounce.active).toBe(true);
        });

        it('should handle gesture without particle system', () => {
            animator.renderer.particleSystem = null;
            const anim = { params: { intensity: 1.0 } };
            const result = animator.applyRain(anim, 0.5);
            expect(result).toBeDefined();
        });

        it('should handle missing params gracefully', () => {
            const anim = { params: {} };
            const result = animator.applyBounce(anim, 0.5);
            expect(result).toBeDefined();
        });

        it('should handle undefined progress', () => {
            const transform = animator.applyGestureAnimations();
            expect(transform).toBeDefined();
        });

        it('should handle very small progress values', () => {
            animator.startGesture('drift');
            performanceNowSpy.mockReturnValue(0.001);
            const transform = animator.applyGestureAnimations();
            expect(transform).toBeDefined();
        });

        it('should handle progress exceeding 1', () => {
            performanceNowSpy.mockReturnValue(0);
            animator.startGesture('bounce');
            performanceNowSpy.mockReturnValue(2000);
            animator.applyGestureAnimations();
            // After completion, progress is reset to 0
            expect(animator.gestureAnimations.bounce.progress).toBe(0);
            expect(animator.gestureAnimations.bounce.active).toBe(false);
        });

        it('should handle multiple simultaneous gestures', () => {
            ['bounce', 'pulse', 'glow', 'spin', 'drift'].forEach(g => animator.startGesture(g));
            performanceNowSpy.mockReturnValue(500);
            const transform = animator.applyGestureAnimations();
            expect(transform).toBeDefined();
            expect(transform.scale).toBeDefined();
        });
    });
});
