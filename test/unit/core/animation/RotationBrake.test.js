/**
 * Comprehensive tests for RotationBrake
 * Tests rotation braking, deceleration physics, target calculations, and edge cases
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RotationBrake } from '../../../../src/core/animation/RotationBrake.js';

describe('RotationBrake', () => {
    let brake;
    let mockRenderer;
    let consoleWarnSpy;

    beforeEach(() => {
        // Mock renderer with state
        mockRenderer = {
            state: {
                manualRotation: 0,
                rotationSpeed: 0
            },
            setRotationSpeed: vi.fn()
        };

        brake = new RotationBrake(mockRenderer);

        // Spy on console.warn to suppress brake logging
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should create brake instance', () => {
            expect(brake).toBeDefined();
            expect(brake).toBeInstanceOf(RotationBrake);
        });

        it('should store renderer reference', () => {
            expect(brake.renderer).toBe(mockRenderer);
        });

        it('should initialize brake start time to null', () => {
            expect(brake.brakeStartTime).toBeNull();
        });

        it('should initialize brake duration to 2500ms', () => {
            expect(brake.brakeDuration).toBe(2500);
        });

        it('should initialize brake start rotation to 0', () => {
            expect(brake.brakeStartRotation).toBe(0);
        });

        it('should initialize brake target rotation to 0', () => {
            expect(brake.brakeTargetRotation).toBe(0);
        });

        it('should initialize brake start velocity to 0', () => {
            expect(brake.brakeStartVelocity).toBe(0);
        });

        it('should initialize onComplete callback to null', () => {
            expect(brake.onComplete).toBeNull();
        });

        it('should initialize onProgress callback to null', () => {
            expect(brake.onProgress).toBeNull();
        });

        it('should set DURATION_FACTOR constant to 14', () => {
            expect(brake.DURATION_FACTOR).toBe(14);
        });
    });

    describe('brakeToUpright Method', () => {
        it('should brake to 0 degrees target', async () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 180;

            const promise = brake.brakeToUpright();

            expect(brake.brakeStartTime).not.toBeNull();
            expect(brake.brakeTargetRotation).toBe(360); // Next full rotation
        });

        it('should accept options parameter', async () => {
            mockRenderer.state.rotationSpeed = 50;
            const onProgress = vi.fn();
            const onComplete = vi.fn();

            brake.brakeToUpright({ onProgress, onComplete });

            expect(brake.onProgress).toBe(onProgress);
            expect(brake.onComplete).toBe(onComplete);
        });

        it('should return a promise', () => {
            mockRenderer.state.rotationSpeed = 50;
            const result = brake.brakeToUpright();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve immediately if not moving', async () => {
            mockRenderer.state.rotationSpeed = 0;
            await expect(brake.brakeToUpright()).resolves.toBeUndefined();
            expect(brake.brakeStartTime).toBeNull();
        });

        it('should not start if already braking', async () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeStartTime = performance.now();

            await brake.brakeToUpright();

            expect(mockRenderer.setRotationSpeed).not.toHaveBeenCalled();
        });
    });

    describe('brakeToNearest Method', () => {
        it('should brake to nearest multiple of angle step', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 95;

            brake.brakeToNearest(90);

            // 95 / 90 = 1.055, rounds to 1, so target is 90
            // But since we're moving forward (positive velocity), and we're past 90,
            // it targets the next occurrence: 90 + 360 = 450
            expect(brake.brakeTargetRotation).toBe(450);
        });

        it('should round to nearest 45 degree mark', () => {
            mockRenderer.state.rotationSpeed = 30;
            mockRenderer.state.manualRotation = 67;

            brake.brakeToNearest(45);

            // 67 / 45 = 1.488... rounds to 1, so normalized target is 45
            // Since we're moving forward and past 45, next occurrence is 45 + 360 = 405
            expect(brake.brakeTargetRotation).toBe(405);
        });

        it('should handle 90 degree increments', () => {
            mockRenderer.state.rotationSpeed = 40;
            mockRenderer.state.manualRotation = 230;

            brake.brakeToNearest(90);

            // 230 / 90 = 2.555... rounds to 3, so 270
            expect(brake.brakeTargetRotation).toBeGreaterThanOrEqual(270);
        });

        it('should handle 180 degree increments', () => {
            mockRenderer.state.rotationSpeed = 40;
            mockRenderer.state.manualRotation = 100;

            brake.brakeToNearest(180);

            // 100 / 180 = 0.555... rounds to 1, so 180
            expect(brake.brakeTargetRotation).toBeGreaterThanOrEqual(180);
        });

        it('should work with negative rotation speeds', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = 275;

            brake.brakeToNearest(90);

            expect(brake.brakeTargetRotation).toBeLessThanOrEqual(275);
        });
    });

    describe('brakeToTarget Method - Clockwise Rotation', () => {
        it('should calculate correct target for clockwise rotation to upright', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 180;

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBe(360); // Next upright position
        });

        it('should handle clockwise rotation past 360 degrees', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 720;

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBe(1080); // Next upright at 1080°
        });

        it('should calculate target for clockwise to 90 degrees', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 45;

            brake.brakeToTarget(90);

            expect(brake.brakeTargetRotation).toBe(90);
        });

        it('should go to next cycle if target is behind current rotation', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 270;

            brake.brakeToTarget(90);

            // Should target 450° (360 + 90) not 90°
            expect(brake.brakeTargetRotation).toBe(450);
        });

        it('should store brake start rotation', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 123.45;

            brake.brakeToTarget(0);

            expect(brake.brakeStartRotation).toBe(123.45);
        });

        it('should store brake start velocity', () => {
            mockRenderer.state.rotationSpeed = 67.89;
            mockRenderer.state.manualRotation = 100;

            brake.brakeToTarget(0);

            expect(brake.brakeStartVelocity).toBe(67.89);
        });
    });

    describe('brakeToTarget Method - Counter-Clockwise Rotation', () => {
        it('should calculate correct target for counter-clockwise rotation', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = 180;

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBe(0); // Previous upright position
        });

        it('should handle counter-clockwise with negative angles', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = -90;

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBe(-360); // Previous upright
        });

        it('should calculate target for counter-clockwise to 270 degrees', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = 300;

            brake.brakeToTarget(270);

            expect(brake.brakeTargetRotation).toBe(270);
        });

        it('should go to previous cycle if target is ahead', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = 90;

            brake.brakeToTarget(270);

            // Should target -90° (which is 270° in previous cycle)
            expect(brake.brakeTargetRotation).toBe(-90);
        });
    });

    describe('brakeToTarget Method - Dynamic Duration', () => {
        it('should calculate dynamic duration based on distance and velocity', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;

            brake.brakeToTarget(0);

            // Distance = 360°, velocity = 50°/s
            // Duration = (360 / 50) * 14 * 5 = 504ms
            expect(brake.brakeDuration).toBeGreaterThan(500);
        });

        it('should enforce minimum duration of 500ms', () => {
            mockRenderer.state.rotationSpeed = 500; // Very fast
            mockRenderer.state.manualRotation = 10;

            brake.brakeToTarget(0);

            expect(brake.brakeDuration).toBeGreaterThanOrEqual(500);
        });

        it('should increase duration with greater distance', () => {
            mockRenderer.state.rotationSpeed = 50;

            // Short distance
            mockRenderer.state.manualRotation = 350;
            brake.brakeToTarget(0);
            const shortDuration = brake.brakeDuration;

            // Reset brake
            brake.brakeStartTime = null;

            // Long distance
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);
            const longDuration = brake.brakeDuration;

            expect(longDuration).toBeGreaterThan(shortDuration);
        });

        it('should increase duration with lower velocity', () => {
            mockRenderer.state.manualRotation = 0;

            // Fast velocity
            mockRenderer.state.rotationSpeed = 100;
            brake.brakeToTarget(0);
            const fastDuration = brake.brakeDuration;

            // Reset brake
            brake.brakeStartTime = null;

            // Slow velocity
            mockRenderer.state.rotationSpeed = 25;
            brake.brakeToTarget(0);
            const slowDuration = brake.brakeDuration;

            expect(slowDuration).toBeGreaterThan(fastDuration);
        });
    });

    describe('brakeToTarget Method - Callbacks and State', () => {
        it('should set onProgress callback from options', () => {
            const callback = vi.fn();
            mockRenderer.state.rotationSpeed = 50;

            brake.brakeToTarget(0, { onProgress: callback });

            expect(brake.onProgress).toBe(callback);
        });

        it('should set onComplete callback from options', () => {
            const callback = vi.fn();
            mockRenderer.state.rotationSpeed = 50;

            brake.brakeToTarget(0, { onComplete: callback });

            expect(brake.onComplete).toBe(callback);
        });

        it('should stop adding velocity immediately', () => {
            mockRenderer.state.rotationSpeed = 50;

            brake.brakeToTarget(0);

            expect(mockRenderer.setRotationSpeed).toHaveBeenCalledWith(0);
        });

        it('should set brake start time', () => {
            mockRenderer.state.rotationSpeed = 50;
            const beforeTime = performance.now();

            brake.brakeToTarget(0);

            expect(brake.brakeStartTime).toBeGreaterThanOrEqual(beforeTime);
        });

        it('should log brake information', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 100;

            brake.brakeToTarget(0);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Brake started:',
                expect.objectContaining({
                    from: expect.any(String),
                    to: expect.any(String),
                    velocity: 50,
                    duration: expect.any(String)
                })
            );
        });
    });

    describe('updateBrake Method - Progress Calculation', () => {
        beforeEach(() => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);
        });

        it('should return null when not braking', () => {
            brake.brakeStartTime = null;
            const result = brake.updateBrake(performance.now());
            expect(result).toBeNull();
        });

        it('should calculate progress based on elapsed time', () => {
            const startTime = brake.brakeStartTime;
            const halfwayTime = startTime + brake.brakeDuration / 2;

            const result = brake.updateBrake(halfwayTime);

            expect(result).not.toBeNull();
            expect(result.complete).toBe(false);
        });

        it('should use ease-out quartic easing', () => {
            const startTime = brake.brakeStartTime;
            const quarterTime = startTime + brake.brakeDuration / 4;

            const result = brake.updateBrake(quarterTime);

            // Ease-out quartic should make initial progress faster
            const linearProgress = 0.25;
            const easedProgress = 1 - Math.pow(1 - linearProgress, 4);

            expect(result.rotation).toBeGreaterThan(brake.brakeStartRotation +
                (brake.brakeTargetRotation - brake.brakeStartRotation) * linearProgress);
        });

        it('should interpolate rotation between start and target', () => {
            const startTime = brake.brakeStartTime;
            const middleTime = startTime + brake.brakeDuration / 2;

            const result = brake.updateBrake(middleTime);

            expect(result.rotation).toBeGreaterThan(brake.brakeStartRotation);
            expect(result.rotation).toBeLessThan(brake.brakeTargetRotation);
        });

        it('should calculate virtual speed that decreases over time', () => {
            const startTime = brake.brakeStartTime;
            const earlyResult = brake.updateBrake(startTime + 100);
            const lateResult = brake.updateBrake(startTime + brake.brakeDuration - 100);

            expect(earlyResult.speed).toBeGreaterThan(lateResult.speed);
        });

        it('should return complete false while braking', () => {
            const startTime = brake.brakeStartTime;
            const result = brake.updateBrake(startTime + 100);

            expect(result.complete).toBe(false);
        });

        it('should cap progress at 1.0', () => {
            const startTime = brake.brakeStartTime;
            const longTime = startTime + brake.brakeDuration * 2;

            const result = brake.updateBrake(longTime);

            expect(result.complete).toBe(true);
        });
    });

    describe('updateBrake Method - Completion', () => {
        beforeEach(() => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
        });

        it('should complete when duration is reached', () => {
            brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            const result = brake.updateBrake(completeTime);

            expect(result.complete).toBe(true);
        });

        it('should return exact target rotation on completion', () => {
            brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            const result = brake.updateBrake(completeTime);

            expect(result.rotation).toBe(brake.brakeTargetRotation);
        });

        it('should return zero speed on completion', () => {
            brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            const result = brake.updateBrake(completeTime);

            expect(result.speed).toBe(0);
        });

        it('should clear brake start time on completion', () => {
            brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            brake.updateBrake(completeTime);

            expect(brake.brakeStartTime).toBeNull();
        });

        it('should log completion message', () => {
            brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            brake.updateBrake(completeTime);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Brake complete:',
                expect.objectContaining({
                    target: expect.any(String),
                    duration: expect.any(String)
                })
            );
        });

        it('should call onComplete callback on completion', () => {
            const onComplete = vi.fn();
            brake.brakeToTarget(0, { onComplete });
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            brake.updateBrake(completeTime);

            expect(onComplete).toHaveBeenCalled();
        });

        it('should resolve promise on completion', async () => {
            const promise = brake.brakeToTarget(0);
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;

            brake.updateBrake(completeTime);

            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('updateBrake Method - Progress Callback', () => {
        it('should call onProgress callback each update', () => {
            const onProgress = vi.fn();
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0, { onProgress });

            const currentTime = brake.brakeStartTime + 100;
            brake.updateBrake(currentTime);

            expect(onProgress).toHaveBeenCalled();
        });

        it('should pass eased progress to callback', () => {
            const onProgress = vi.fn();
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0, { onProgress });

            const currentTime = brake.brakeStartTime + brake.brakeDuration / 4;
            brake.updateBrake(currentTime);

            const linearProgress = 0.25;
            const easedProgress = 1 - Math.pow(1 - linearProgress, 4);

            expect(onProgress).toHaveBeenCalledWith(
                expect.closeTo(easedProgress, 2),
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('should pass virtual speed to callback', () => {
            const onProgress = vi.fn();
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0, { onProgress });

            brake.updateBrake(brake.brakeStartTime + 100);

            expect(onProgress).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number), // virtual speed
                expect.any(Number)
            );
        });

        it('should pass current rotation to callback', () => {
            const onProgress = vi.fn();
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0, { onProgress });

            brake.updateBrake(brake.brakeStartTime + 100);

            expect(onProgress).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number) // rotation
            );

            const rotation = onProgress.mock.calls[0][2];
            expect(rotation).toBeGreaterThanOrEqual(brake.brakeStartRotation);
        });

        it('should not crash if onProgress is null', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0, { onProgress: null });

            expect(() => {
                brake.updateBrake(brake.brakeStartTime + 100);
            }).not.toThrow();
        });
    });

    describe('stop Method', () => {
        it('should clear brake start time', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            brake.stop();

            expect(brake.brakeStartTime).toBeNull();
        });

        it('should stop braking immediately', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            brake.stop();

            const result = brake.updateBrake(performance.now());
            expect(result).toBeNull();
        });

        it('should be safe to call when not braking', () => {
            expect(() => brake.stop()).not.toThrow();
        });
    });

    describe('isBraking Method', () => {
        it('should return false when not braking', () => {
            expect(brake.isBraking()).toBe(false);
        });

        it('should return true when braking', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            expect(brake.isBraking()).toBe(true);
        });

        it('should return false after stopping', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);
            brake.stop();

            expect(brake.isBraking()).toBe(false);
        });

        it('should return false after completion', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;
            brake.updateBrake(completeTime);

            expect(brake.isBraking()).toBe(false);
        });
    });

    describe('emergencyStop Method', () => {
        it('should stop braking immediately', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            brake.emergencyStop();

            expect(brake.brakeStartTime).toBeNull();
        });

        it('should set rotation speed to zero', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);
            mockRenderer.setRotationSpeed.mockClear();

            brake.emergencyStop();

            expect(mockRenderer.setRotationSpeed).toHaveBeenCalledWith(0);
        });

        it('should call onComplete callback', () => {
            const onComplete = vi.fn();
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0, { onComplete });

            brake.emergencyStop();

            expect(onComplete).toHaveBeenCalled();
        });

        it('should resolve brake promise', async () => {
            mockRenderer.state.rotationSpeed = 50;
            const promise = brake.brakeToTarget(0);

            brake.emergencyStop();

            await expect(promise).resolves.toBeUndefined();
        });

        it('should be safe to call when not braking', () => {
            expect(() => brake.emergencyStop()).not.toThrow();
        });
    });

    describe('getProgress Method', () => {
        it('should return 0 when not braking', () => {
            expect(brake.getProgress()).toBe(0);
        });

        it('should return progress between 0 and 1 while braking', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            const progress = brake.getProgress();

            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(1);
        });

        it('should increase over time', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            const progress1 = brake.getProgress();

            // Wait a bit
            const later = performance.now() + 100;
            vi.spyOn(performance, 'now').mockReturnValue(later);

            const progress2 = brake.getProgress();

            expect(progress2).toBeGreaterThan(progress1);
            vi.restoreAllMocks();
        });

        it('should cap at 1.0', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            const farFuture = brake.brakeStartTime + brake.brakeDuration * 2;
            vi.spyOn(performance, 'now').mockReturnValue(farFuture);

            const progress = brake.getProgress();

            expect(progress).toBe(1);
            vi.restoreAllMocks();
        });

        it('should match progress from updateBrake', () => {
            mockRenderer.state.rotationSpeed = 50;
            brake.brakeToTarget(0);

            const currentTime = brake.brakeStartTime + brake.brakeDuration / 2;
            const elapsed = currentTime - brake.brakeStartTime;
            const expectedProgress = Math.min(elapsed / brake.brakeDuration, 1);

            vi.spyOn(performance, 'now').mockReturnValue(currentTime);

            expect(brake.getProgress()).toBeCloseTo(expectedProgress, 2);
            vi.restoreAllMocks();
        });
    });

    describe('Physics and Deceleration', () => {
        it('should produce smooth deceleration curve', () => {
            mockRenderer.state.rotationSpeed = 100;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);

            const speeds = [];
            const sampleCount = 10;

            for (let i = 0; i < sampleCount; i++) {
                const time = brake.brakeStartTime + (brake.brakeDuration * i / sampleCount);
                const result = brake.updateBrake(time);
                if (result) {
                    speeds.push(result.speed);
                }
            }

            // Speeds should be decreasing
            for (let i = 1; i < speeds.length; i++) {
                expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1]);
            }
        });

        it('should reach target with zero velocity', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);

            const completeTime = brake.brakeStartTime + brake.brakeDuration;
            const result = brake.updateBrake(completeTime);

            expect(result.rotation).toBe(brake.brakeTargetRotation);
            expect(result.speed).toBe(0);
        });

        it('should maintain angular momentum direction', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);

            const earlyTime = brake.brakeStartTime + 100;
            const result = brake.updateBrake(earlyTime);

            // Should still be moving in positive direction
            expect(result.rotation).toBeGreaterThan(brake.brakeStartRotation);
            expect(result.speed).toBeGreaterThan(0);
        });

        it('should handle high velocity braking', () => {
            mockRenderer.state.rotationSpeed = 500; // Very fast
            mockRenderer.state.manualRotation = 0;

            brake.brakeToTarget(0);

            expect(brake.brakeDuration).toBeGreaterThanOrEqual(500);
            expect(brake.brakeTargetRotation).toBeGreaterThanOrEqual(360);
        });

        it('should handle low velocity braking', () => {
            mockRenderer.state.rotationSpeed = 5; // Very slow
            mockRenderer.state.manualRotation = 350;

            brake.brakeToTarget(0);

            expect(brake.brakeDuration).toBeGreaterThanOrEqual(500);
        });

        it('should maintain rotation continuity', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;
            brake.brakeToTarget(0);

            const rotations = [];
            const sampleCount = 20;

            for (let i = 0; i < sampleCount; i++) {
                const time = brake.brakeStartTime + (brake.brakeDuration * i / sampleCount);
                const result = brake.updateBrake(time);
                if (result) {
                    rotations.push(result.rotation);
                }
            }

            // Rotations should be strictly increasing
            for (let i = 1; i < rotations.length; i++) {
                expect(rotations[i]).toBeGreaterThan(rotations[i - 1]);
            }
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero velocity input', () => {
            mockRenderer.state.rotationSpeed = 0;
            mockRenderer.state.manualRotation = 45;

            const promise = brake.brakeToTarget(0);

            expect(brake.brakeStartTime).toBeNull();
            return expect(promise).resolves.toBeUndefined();
        });

        it('should handle exact target position', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;

            brake.brakeToTarget(0);

            // Should still brake to complete the current rotation
            expect(brake.brakeTargetRotation).toBeGreaterThan(0);
        });

        it('should handle very large rotation values', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 3600; // 10 full rotations

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBeGreaterThanOrEqual(3600);
        });

        it('should handle negative rotation values', () => {
            mockRenderer.state.rotationSpeed = -50;
            mockRenderer.state.manualRotation = -180;

            brake.brakeToTarget(0);

            expect(brake.brakeTargetRotation).toBeLessThanOrEqual(-180);
        });

        it('should handle fractional rotation values', () => {
            mockRenderer.state.rotationSpeed = 33.33;
            mockRenderer.state.manualRotation = 123.456;

            expect(() => brake.brakeToTarget(0)).not.toThrow();
            expect(brake.brakeStartRotation).toBe(123.456);
        });

        it('should handle manual rotation undefined', () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = undefined;

            expect(() => brake.brakeToTarget(0)).not.toThrow();
            expect(brake.brakeStartRotation).toBe(0); // Should default to 0
        });

        it('should handle rotation speed undefined', () => {
            mockRenderer.state.rotationSpeed = undefined;
            mockRenderer.state.manualRotation = 100;

            const promise = brake.brakeToTarget(0);

            expect(brake.brakeStartTime).toBeNull();
            return expect(promise).resolves.toBeUndefined();
        });

        it('should handle concurrent brake attempts', async () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;

            const promise1 = brake.brakeToTarget(0);
            const promise2 = brake.brakeToTarget(90); // Try to start another

            // Second brake should resolve immediately
            await expect(promise2).resolves.toBeUndefined();

            // First brake should still be active
            expect(brake.isBraking()).toBe(true);
        });

        it('should handle very short brake durations', () => {
            mockRenderer.state.rotationSpeed = 1000; // Extremely fast
            mockRenderer.state.manualRotation = 359;

            brake.brakeToTarget(0);

            // Should respect minimum duration
            expect(brake.brakeDuration).toBeGreaterThanOrEqual(500);
        });

        it('should handle missing options parameter', () => {
            mockRenderer.state.rotationSpeed = 50;

            expect(() => brake.brakeToTarget(0)).not.toThrow();
        });

        it('should handle empty options object', () => {
            mockRenderer.state.rotationSpeed = 50;

            expect(() => brake.brakeToTarget(0, {})).not.toThrow();
        });
    });

    describe('Integration - Complete Brake Cycle', () => {
        it('should complete full brake cycle from start to finish', async () => {
            mockRenderer.state.rotationSpeed = 50;
            mockRenderer.state.manualRotation = 0;

            const onProgress = vi.fn();
            const onComplete = vi.fn();
            const promise = brake.brakeToTarget(0, { onProgress, onComplete });

            // Simulate updates throughout brake cycle
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const time = brake.brakeStartTime + (brake.brakeDuration * i / steps);
                brake.updateBrake(time);
            }

            // Ensure we update past the brake duration to trigger completion
            const completeTime = brake.brakeStartTime + brake.brakeDuration + 1;
            brake.updateBrake(completeTime);

            await promise;

            expect(onProgress.mock.calls.length).toBeGreaterThan(0);
            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(brake.isBraking()).toBe(false);
        });

        it('should handle rapid start-stop-start cycles', () => {
            mockRenderer.state.rotationSpeed = 50;

            brake.brakeToTarget(0);
            expect(brake.isBraking()).toBe(true);

            brake.stop();
            expect(brake.isBraking()).toBe(false);

            brake.brakeToTarget(90);
            expect(brake.isBraking()).toBe(true);
        });

        it('should maintain accuracy across multiple braking operations', () => {
            const targets = [0, 90, 180, 270, 0];

            targets.forEach(target => {
                mockRenderer.state.rotationSpeed = 50;
                mockRenderer.state.manualRotation = 45;

                brake.brakeToTarget(target);

                const completeTime = brake.brakeStartTime + brake.brakeDuration;
                const result = brake.updateBrake(completeTime);

                expect(result.rotation % 360).toBeCloseTo(target % 360, 0);

                // Reset for next iteration
                brake.brakeStartTime = null;
            });
        });
    });
});
