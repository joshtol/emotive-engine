/**
 * Gesture Factories Tests
 * Tests for directional gesture factory functions
 */

import { describe, it, expect } from 'vitest';
import { createStepGesture, createSlideGesture } from '../../../../src/core/gestures/motions/danceSteps.js';
import { createLeanGesture } from '../../../../src/core/gestures/motions/leanFactory.js';
import { createKickGesture } from '../../../../src/core/gestures/motions/kickFactory.js';
import { createFloatGesture } from '../../../../src/core/gestures/motions/floatFactory.js';
import { createPointGesture } from '../../../../src/core/gestures/motions/pointFactory.js';
import { createSpinGesture } from '../../../../src/core/gestures/transforms/spinFactory.js';

describe('Gesture Factories', () => {
    describe('createStepGesture()', () => {
        it('should create step gestures for all cardinal directions', () => {
            const directions = ['left', 'right', 'up', 'down'];
            directions.forEach(dir => {
                const gesture = createStepGesture(dir);
                expect(gesture).toBeDefined();
                expect(gesture.name).toBe(`step${dir.charAt(0).toUpperCase() + dir.slice(1)}`);
            });
        });

        it('should have correct structure for stepLeft', () => {
            const gesture = createStepGesture('left');

            expect(gesture.name).toBe('stepLeft');
            expect(gesture.type).toBe('blending');
            expect(gesture.config.direction).toBe('left');
            expect(gesture.config.duration).toBe(400);
            expect(gesture.rhythm.durationSync.beats).toBe(1);
        });

        it('should have apply method', () => {
            const gesture = createStepGesture('left');
            expect(typeof gesture.apply).toBe('function');
        });

        it('should have 3d evaluate method', () => {
            const gesture = createStepGesture('left');
            expect(gesture['3d']).toBeDefined();
            expect(typeof gesture['3d'].evaluate).toBe('function');
        });

        it('should throw for invalid direction', () => {
            expect(() => createStepGesture('invalid')).toThrow('Invalid step direction');
        });

        it('should return different position for left vs right', () => {
            const leftGesture = createStepGesture('left');
            const rightGesture = createStepGesture('right');

            const leftResult = leftGesture['3d'].evaluate(0.5, {});
            const rightResult = rightGesture['3d'].evaluate(0.5, {});

            // Left should have negative X, right should have positive X (camera-relative)
            expect(leftResult.cameraRelativePosition[0]).toBeLessThan(0);
            expect(rightResult.cameraRelativePosition[0]).toBeGreaterThan(0);
        });
    });

    describe('createSlideGesture()', () => {
        it('should create slide gestures for left and right', () => {
            const leftSlide = createSlideGesture('left');
            const rightSlide = createSlideGesture('right');

            expect(leftSlide.name).toBe('slideLeft');
            expect(rightSlide.name).toBe('slideRight');
        });

        it('should have 2-beat duration sync', () => {
            const gesture = createSlideGesture('left');
            expect(gesture.rhythm.durationSync.beats).toBe(2);
        });

        it('should have larger amplitude than step', () => {
            const slide = createSlideGesture('left');
            const step = createStepGesture('left');

            expect(slide.config.amplitude).toBeGreaterThan(step.config.amplitude);
        });
    });

    describe('createLeanGesture()', () => {
        it('should create lean gestures for left and right', () => {
            const leftLean = createLeanGesture('left');
            const rightLean = createLeanGesture('right');

            expect(leftLean.name).toBe('leanLeft');
            expect(rightLean.name).toBe('leanRight');
            expect(leftLean.type).toBe('blending');
        });

        it('should have 2-beat duration', () => {
            const gesture = createLeanGesture('left');
            expect(gesture.rhythm.durationSync.beats).toBe(2);
        });

        it('should have camera-relative rotation in 3D evaluation', () => {
            const gesture = createLeanGesture('right');
            const result = gesture['3d'].evaluate(0.5, {});

            // Lean should have camera-relative Z-axis rotation (roll)
            expect(result.cameraRelativeRotation[2]).not.toBe(0);
        });

        it('should throw for invalid direction', () => {
            expect(() => createLeanGesture('up')).toThrow("Invalid lean direction: up. Only 'left' and 'right' are supported.");
        });
    });

    describe('createKickGesture()', () => {
        it('should create kick gestures for left and right', () => {
            const leftKick = createKickGesture('left');
            const rightKick = createKickGesture('right');

            expect(leftKick.name).toBe('kickLeft');
            expect(rightKick.name).toBe('kickRight');
        });

        it('should have 1-beat duration', () => {
            const gesture = createKickGesture('left');
            expect(gesture.rhythm.durationSync.beats).toBe(1);
        });

        it('should have scale expansion during kick', () => {
            const gesture = createKickGesture('left');
            const result = gesture['3d'].evaluate(0.3, {}); // During kick hold

            expect(result.scale).toBeGreaterThan(1.0);
        });

        it('should throw for invalid direction', () => {
            expect(() => createKickGesture('up')).toThrow("Invalid kick direction: up. Only 'left' and 'right' are supported.");
        });
    });

    describe('createFloatGesture()', () => {
        it('should create float gestures for all four directions', () => {
            const directions = ['up', 'down', 'left', 'right'];
            directions.forEach(dir => {
                const gesture = createFloatGesture(dir);
                expect(gesture.name).toBe(`float${dir.charAt(0).toUpperCase() + dir.slice(1)}`);
            });
        });

        it('should have long duration (~2000ms)', () => {
            const gesture = createFloatGesture('up');
            expect(gesture.config.duration).toBe(2000);
        });

        it('should have bar-based duration sync', () => {
            const gesture = createFloatGesture('up');
            expect(gesture.rhythm.durationSync.bars).toBe(2);
        });

        it('should move upward for floatUp', () => {
            const gesture = createFloatGesture('up');
            const result = gesture['3d'].evaluate(0.5, {});

            expect(result.cameraRelativePosition[1]).toBeGreaterThan(0);
        });

        it('should move downward for floatDown', () => {
            const gesture = createFloatGesture('down');
            const result = gesture['3d'].evaluate(0.5, {});

            expect(result.cameraRelativePosition[1]).toBeLessThan(0);
        });

        it('should have scale change during float', () => {
            const gesture = createFloatGesture('up');
            const result = gesture['3d'].evaluate(0.5, {});

            expect(result.scale).toBeGreaterThan(1.0);
        });
    });

    describe('createPointGesture()', () => {
        it('should create point gestures for all four directions', () => {
            const directions = ['up', 'down', 'left', 'right'];
            directions.forEach(dir => {
                const gesture = createPointGesture(dir);
                expect(gesture.name).toBe(`point${dir.charAt(0).toUpperCase() + dir.slice(1)}`);
            });
        });

        it('should have 1-beat duration sync', () => {
            const gesture = createPointGesture('up');
            expect(gesture.rhythm.durationSync.beats).toBe(1);
        });

        it('should have rotation for horizontal pointing', () => {
            const gesture = createPointGesture('right');
            const result = gesture['3d'].evaluate(0.5, {});

            // Should have Y-axis rotation for horizontal point
            expect(result.rotation[1]).not.toBe(0);
        });

        it('should have X rotation for vertical pointing', () => {
            const gesture = createPointGesture('up');
            const result = gesture['3d'].evaluate(0.5, {});

            // Should have X-axis rotation for vertical point
            expect(result.rotation[0]).not.toBe(0);
        });
    });

    describe('createSpinGesture()', () => {
        it('should create spin gestures for left and right', () => {
            const leftSpin = createSpinGesture('left');
            const rightSpin = createSpinGesture('right');

            expect(leftSpin.name).toBe('spinLeft');
            expect(rightSpin.name).toBe('spinRight');
        });

        it('should be override type', () => {
            const gesture = createSpinGesture('left');
            expect(gesture.type).toBe('override');
        });

        it('should have correct spin direction in config', () => {
            const leftSpin = createSpinGesture('left');
            const rightSpin = createSpinGesture('right');

            expect(leftSpin.config.direction).toBe('counter-clockwise');
            expect(rightSpin.config.direction).toBe('clockwise');
        });

        it('should throw for invalid direction', () => {
            expect(() => createSpinGesture('up')).toThrow('Invalid spin direction');
        });
    });

    describe('Factory Pattern Consistency', () => {
        it('all factories should use shared directions module', () => {
            // All gestures should have consistent direction handling
            const stepLeft = createStepGesture('left');
            const leanLeft = createLeanGesture('left');
            const floatLeft = createFloatGesture('left');
            const pointLeft = createPointGesture('left');

            // All should move in negative X direction (using cameraRelativePosition for screen-space)
            const stepResult = stepLeft['3d'].evaluate(0.5, {});
            const leanResult = leanLeft['3d'].evaluate(0.5, {});
            const floatResult = floatLeft['3d'].evaluate(0.5, {});
            const pointResult = pointLeft['3d'].evaluate(0.5, {});

            // Check cameraRelativePosition for tidally-locked gestures
            expect(stepResult.cameraRelativePosition[0]).toBeLessThan(0);
            expect(leanResult.cameraRelativePosition[0]).toBeLessThan(0);
            expect(floatResult.cameraRelativePosition[0]).toBeLessThan(0);
            expect(pointResult.cameraRelativePosition[0]).toBeLessThan(0);
        });

        it('all blending gestures should have rhythm config', () => {
            const gestures = [
                createStepGesture('left'),
                createSlideGesture('left'),
                createLeanGesture('left'),
                createKickGesture('left'),
                createFloatGesture('up'),
                createPointGesture('up')
            ];

            gestures.forEach(gesture => {
                expect(gesture.rhythm).toBeDefined();
                expect(gesture.rhythm.enabled).toBe(true);
                expect(gesture.rhythm.durationSync).toBeDefined();
            });
        });

        it('all gestures should have cleanup method or be safe without it', () => {
            const gestures = [
                createStepGesture('left'),
                createSlideGesture('left'),
                createLeanGesture('left'),
                createKickGesture('left'),
                createFloatGesture('up'),
                createPointGesture('up')
            ];

            gestures.forEach(gesture => {
                // Either has cleanup or doesn't throw without it
                if (gesture.cleanup) {
                    expect(typeof gesture.cleanup).toBe('function');
                }
            });
        });
    });
});

describe('Gesture File Imports', () => {
    it('should import directional gesture files correctly', async () => {
        // Test that the one-liner gesture files work
        const stepLeft = await import('../../../../src/core/gestures/motions/stepLeft.js');
        const leanRight = await import('../../../../src/core/gestures/motions/leanRight.js');
        const floatUp = await import('../../../../src/core/gestures/motions/floatUp.js');
        const pointDown = await import('../../../../src/core/gestures/motions/pointDown.js');
        const spinLeft = await import('../../../../src/core/gestures/transforms/spinLeft.js');

        expect(stepLeft.default.name).toBe('stepLeft');
        expect(leanRight.default.name).toBe('leanRight');
        expect(floatUp.default.name).toBe('floatUp');
        expect(pointDown.default.name).toBe('pointDown');
        expect(spinLeft.default.name).toBe('spinLeft');
    });
});
