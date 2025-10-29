/**
 * Comprehensive tests for AmbientDanceAnimator
 * Tests ambient dance animations, gesture movements, timing, and transformations
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AmbientDanceAnimator } from '../../../../src/core/renderer/AmbientDanceAnimator.js';

describe('AmbientDanceAnimator', () => {
    let animator;
    let mockRenderer;
    let originalDateNow;

    beforeEach(() => {
        // Create mock renderer
        mockRenderer = {
            render: vi.fn(),
            update: vi.fn()
        };

        animator = new AmbientDanceAnimator(mockRenderer);

        // Mock Date.now for consistent timing tests
        originalDateNow = Date.now;
        Date.now = vi.fn(() => 1000);
    });

    afterEach(() => {
        // Restore Date.now
        Date.now = originalDateNow;
    });

    describe('Constructor', () => {
        it('should create animator instance', () => {
            expect(animator).toBeDefined();
            expect(animator).toBeInstanceOf(AmbientDanceAnimator);
        });

        it('should store renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
        });

        it('should initialize animations object with all gesture types', () => {
            expect(animator.animations).toBeDefined();
            expect(animator.animations).toHaveProperty('grooveSway');
            expect(animator.animations).toHaveProperty('grooveBob');
            expect(animator.animations).toHaveProperty('grooveFlow');
            expect(animator.animations).toHaveProperty('groovePulse');
            expect(animator.animations).toHaveProperty('grooveStep');
        });

        it('should initialize all animations to null', () => {
            expect(animator.animations.grooveSway).toBeNull();
            expect(animator.animations.grooveBob).toBeNull();
            expect(animator.animations.grooveFlow).toBeNull();
            expect(animator.animations.groovePulse).toBeNull();
            expect(animator.animations.grooveStep).toBeNull();
        });

        it('should initialize active animation to null', () => {
            expect(animator.activeAnimation).toBeNull();
        });

        it('should initialize blend state with default values', () => {
            expect(animator.blendState).toBeDefined();
            expect(animator.blendState.x).toBe(0);
            expect(animator.blendState.y).toBe(0);
            expect(animator.blendState.rotation).toBe(0);
            expect(animator.blendState.scale).toBe(1);
            expect(animator.blendState.opacity).toBe(1);
        });
    });

    describe('startAmbientAnimation', () => {
        it('should start grooveSway animation', () => {
            animator.startAmbientAnimation('grooveSway');

            expect(animator.activeAnimation).toBe('grooveSway');
            expect(animator.animations.grooveSway).toBeDefined();
            expect(animator.animations.grooveSway).not.toBeNull();
        });

        it('should start grooveBob animation', () => {
            animator.startAmbientAnimation('grooveBob');

            expect(animator.activeAnimation).toBe('grooveBob');
            expect(animator.animations.grooveBob).toBeDefined();
        });

        it('should start grooveFlow animation', () => {
            animator.startAmbientAnimation('grooveFlow');

            expect(animator.activeAnimation).toBe('grooveFlow');
            expect(animator.animations.grooveFlow).toBeDefined();
        });

        it('should start groovePulse animation', () => {
            animator.startAmbientAnimation('groovePulse');

            expect(animator.activeAnimation).toBe('groovePulse');
            expect(animator.animations.groovePulse).toBeDefined();
        });

        it('should start grooveStep animation', () => {
            animator.startAmbientAnimation('grooveStep');

            expect(animator.activeAnimation).toBe('grooveStep');
            expect(animator.animations.grooveStep).toBeDefined();
        });

        it('should record start time when animation starts', () => {
            Date.now = vi.fn(() => 5000);
            animator.startAmbientAnimation('grooveSway');

            expect(animator.animations.grooveSway.startTime).toBe(5000);
        });

        it('should use default intensity of 1.0 when not specified', () => {
            animator.startAmbientAnimation('grooveSway');

            expect(animator.animations.grooveSway.intensity).toBe(1.0);
        });

        it('should use default frequency of 1.0 when not specified', () => {
            animator.startAmbientAnimation('grooveBob');

            expect(animator.animations.grooveBob.frequency).toBe(1.0);
        });

        it('should accept custom intensity option', () => {
            animator.startAmbientAnimation('grooveSway', { intensity: 0.5 });

            expect(animator.animations.grooveSway.intensity).toBe(0.5);
        });

        it('should accept custom frequency option', () => {
            animator.startAmbientAnimation('grooveBob', { frequency: 2.0 });

            expect(animator.animations.grooveBob.frequency).toBe(2.0);
        });

        it('should accept both intensity and frequency options', () => {
            animator.startAmbientAnimation('grooveFlow', {
                intensity: 0.75,
                frequency: 1.5
            });

            expect(animator.animations.grooveFlow.intensity).toBe(0.75);
            expect(animator.animations.grooveFlow.frequency).toBe(1.5);
        });

        it('should store all options in animation state', () => {
            const options = { intensity: 0.8, frequency: 1.2, custom: 'value' };
            animator.startAmbientAnimation('groovePulse', options);

            expect(animator.animations.groovePulse.options).toEqual(options);
        });

        it('should stop previous animation when starting new one', () => {
            animator.startAmbientAnimation('grooveSway');
            expect(animator.animations.grooveSway).not.toBeNull();

            animator.startAmbientAnimation('grooveBob');
            expect(animator.animations.grooveSway).toBeNull();
            expect(animator.animations.grooveBob).not.toBeNull();
        });

        it('should update active animation when switching', () => {
            animator.startAmbientAnimation('grooveFlow');
            expect(animator.activeAnimation).toBe('grooveFlow');

            animator.startAmbientAnimation('grooveStep');
            expect(animator.activeAnimation).toBe('grooveStep');
        });

        it('should not stop same animation when restarting', () => {
            animator.startAmbientAnimation('grooveSway', { intensity: 0.5 });
            const firstStartTime = animator.animations.grooveSway.startTime;

            Date.now = vi.fn(() => 2000);
            animator.startAmbientAnimation('grooveSway', { intensity: 0.8 });

            // Animation should be reinitialized with new start time and intensity
            expect(animator.animations.grooveSway.startTime).toBe(2000);
            expect(animator.animations.grooveSway.intensity).toBe(0.8);
        });
    });

    describe('stopAmbientAnimation', () => {
        it('should stop grooveSway animation', () => {
            animator.startAmbientAnimation('grooveSway');
            animator.stopAmbientAnimation('grooveSway');

            expect(animator.animations.grooveSway).toBeNull();
        });

        it('should stop grooveBob animation', () => {
            animator.startAmbientAnimation('grooveBob');
            animator.stopAmbientAnimation('grooveBob');

            expect(animator.animations.grooveBob).toBeNull();
        });

        it('should clear active animation when stopping it', () => {
            animator.startAmbientAnimation('grooveFlow');
            animator.stopAmbientAnimation('grooveFlow');

            expect(animator.activeAnimation).toBeNull();
        });

        it('should not clear active animation if stopping different animation', () => {
            animator.startAmbientAnimation('grooveSway');
            animator.stopAmbientAnimation('grooveBob');

            expect(animator.activeAnimation).toBe('grooveSway');
        });

        it('should handle stopping non-existent animation gracefully', () => {
            expect(() => {
                animator.stopAmbientAnimation('nonexistent');
            }).not.toThrow();
        });

        it('should handle stopping already stopped animation', () => {
            animator.stopAmbientAnimation('groovePulse');
            expect(animator.animations.groovePulse).toBeNull();
        });
    });

    describe('updateBlendState', () => {
        it('should update x position with interpolation', () => {
            animator.updateBlendState({ x: 100 });

            // With lerp factor 0.2, should move 20% of the way
            expect(animator.blendState.x).toBe(20);
        });

        it('should update y position with interpolation', () => {
            animator.updateBlendState({ y: 50 });

            expect(animator.blendState.y).toBe(10);
        });

        it('should update rotation with interpolation', () => {
            animator.updateBlendState({ rotation: 90 });

            expect(animator.blendState.rotation).toBe(18);
        });

        it('should update scale with interpolation', () => {
            animator.blendState.scale = 1.0;
            animator.updateBlendState({ scale: 1.5 });

            // 1.0 + (1.5 - 1.0) * 0.2 = 1.1
            expect(animator.blendState.scale).toBe(1.1);
        });

        it('should update opacity with interpolation', () => {
            animator.blendState.opacity = 1.0;
            animator.updateBlendState({ opacity: 0.5 });

            // 1.0 + (0.5 - 1.0) * 0.2 = 0.9
            expect(animator.blendState.opacity).toBe(0.9);
        });

        it('should update all properties simultaneously', () => {
            animator.updateBlendState({
                x: 100,
                y: 50,
                rotation: 45,
                scale: 2.0,
                opacity: 0.8
            });

            expect(animator.blendState.x).toBe(20);
            expect(animator.blendState.y).toBe(10);
            expect(animator.blendState.rotation).toBe(9);
            expect(animator.blendState.scale).toBe(1.2);
            expect(animator.blendState.opacity).toBeCloseTo(0.96, 5);
        });

        it('should use 0 for missing x value', () => {
            animator.blendState.x = 100;
            animator.updateBlendState({ y: 50 });

            // Should interpolate from 100 towards 0
            expect(animator.blendState.x).toBe(80);
        });

        it('should use 0 for missing y value', () => {
            animator.blendState.y = 100;
            animator.updateBlendState({ x: 50 });

            expect(animator.blendState.y).toBe(80);
        });

        it('should use 0 for missing rotation value', () => {
            animator.blendState.rotation = 90;
            animator.updateBlendState({ x: 10 });

            expect(animator.blendState.rotation).toBe(72);
        });

        it('should use 1 for missing scale value', () => {
            animator.blendState.scale = 2.0;
            animator.updateBlendState({ x: 10 });

            // 2.0 + (1.0 - 2.0) * 0.2 = 1.8
            expect(animator.blendState.scale).toBe(1.8);
        });

        it('should use 1 for missing opacity value', () => {
            animator.blendState.opacity = 0.5;
            animator.updateBlendState({ x: 10 });

            // 0.5 + (1.0 - 0.5) * 0.2 = 0.6
            expect(animator.blendState.opacity).toBe(0.6);
        });

        it('should handle null blend state gracefully', () => {
            const originalState = { ...animator.blendState };
            animator.updateBlendState(null);

            expect(animator.blendState).toEqual(originalState);
        });

        it('should handle undefined blend state gracefully', () => {
            const originalState = { ...animator.blendState };
            animator.updateBlendState(undefined);

            expect(animator.blendState).toEqual(originalState);
        });

        it('should smoothly interpolate over multiple updates', () => {
            // Simulate multiple frames moving towards target
            for (let i = 0; i < 5; i++) {
                animator.updateBlendState({ x: 100 });
            }

            // Should be getting closer to 100 but not there yet
            expect(animator.blendState.x).toBeGreaterThan(50);
            expect(animator.blendState.x).toBeLessThan(100);
        });
    });

    describe('getTransform', () => {
        it('should return blend state when no animation active', () => {
            animator.blendState = { x: 10, y: 20, rotation: 5, scale: 1.2, opacity: 0.9 };

            const transform = animator.getTransform(16);

            expect(transform.x).toBe(10);
            expect(transform.y).toBe(20);
            expect(transform.rotation).toBe(5);
            expect(transform.scale).toBe(1.2);
            expect(transform.opacity).toBe(0.9);
        });

        it('should include grooveSway animation effects', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway');

            Date.now = vi.fn(() => 1500); // 500ms elapsed
            const transform = animator.getTransform(16);

            // grooveSway should affect x and rotation
            expect(transform.x).not.toBe(0);
            expect(transform.rotation).not.toBe(0);
        });

        it('should include grooveBob animation effects', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveBob');

            Date.now = vi.fn(() => 1400); // 400ms elapsed
            const transform = animator.getTransform(16);

            // grooveBob should affect y and scale
            expect(transform.y).not.toBe(0);
            expect(transform.scale).not.toBe(1);
        });

        it('should include grooveFlow animation effects', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveFlow');

            Date.now = vi.fn(() => 2000); // 1000ms elapsed
            const transform = animator.getTransform(16);

            // grooveFlow should affect x, y, and rotation
            expect(transform.x).not.toBe(0);
            expect(transform.y).not.toBe(0);
            expect(transform.rotation).not.toBe(0);
        });

        it('should include groovePulse animation effects', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('groovePulse');

            Date.now = vi.fn(() => 1250); // 250ms elapsed
            const transform = animator.getTransform(16);

            // groovePulse should affect scale and opacity
            expect(transform.scale).not.toBe(1);
            expect(transform.opacity).not.toBe(1);
        });

        it('should include grooveStep animation effects', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveStep');

            Date.now = vi.fn(() => 1500); // 500ms elapsed
            const transform = animator.getTransform(16);

            // grooveStep should affect x and y
            expect(transform.y).not.toBe(0);
        });

        it('should scale grooveSway by intensity', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway', { intensity: 0.5 });

            Date.now = vi.fn(() => 1500);
            const transform1 = animator.getTransform(16);

            animator.stopAmbientAnimation('grooveSway');
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway', { intensity: 1.0 });

            Date.now = vi.fn(() => 1500);
            const transform2 = animator.getTransform(16);

            // Higher intensity should produce larger movements
            expect(Math.abs(transform2.x)).toBeGreaterThan(Math.abs(transform1.x));
        });

        it('should scale grooveBob by intensity', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveBob', { intensity: 0.5 });

            Date.now = vi.fn(() => 1400);
            const transform1 = animator.getTransform(16);

            animator.stopAmbientAnimation('grooveBob');
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveBob', { intensity: 1.0 });

            Date.now = vi.fn(() => 1400);
            const transform2 = animator.getTransform(16);

            expect(Math.abs(transform2.y)).toBeGreaterThan(Math.abs(transform1.y));
        });

        it('should modify grooveSway frequency', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway', { frequency: 2.0 });

            Date.now = vi.fn(() => 1250); // 250ms at 2x frequency
            const transform1 = animator.getTransform(16);

            animator.stopAmbientAnimation('grooveSway');
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway', { frequency: 1.0 });

            Date.now = vi.fn(() => 1500); // 500ms at 1x frequency (same phase)
            const transform2 = animator.getTransform(16);

            // Same elapsed time * frequency should produce similar results
            expect(Math.abs(transform1.x - transform2.x)).toBeLessThan(1);
        });

        it('should combine blend state with animation', () => {
            animator.blendState.x = 50;
            animator.blendState.y = 30;

            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway');

            Date.now = vi.fn(() => 1500);
            const transform = animator.getTransform(16);

            // Should have blend state base + animation offset
            expect(Math.abs(transform.x - 50)).toBeGreaterThan(0);
            expect(transform.y).toBe(30);
        });

        it('should handle very low intensity values', () => {
            // Create fresh animator to avoid test pollution
            const freshAnimator = new AmbientDanceAnimator(mockRenderer);

            // Mock Date.now consistently
            Date.now = vi.fn(() => 10000);
            freshAnimator.startAmbientAnimation('grooveSway', { intensity: 0.01 });

            // Verify animation was started with correct intensity
            expect(freshAnimator.animations.grooveSway.intensity).toBe(0.01);

            // Advance time slightly
            Date.now = vi.fn(() => 10500);
            const transform = freshAnimator.getTransform(16);

            // Very low intensity should produce small movements
            expect(Math.abs(transform.x)).toBeLessThan(1);
            expect(Math.abs(transform.rotation)).toBeLessThan(1);
        });

        it('should handle grooveStep phase transitions', () => {
            // Reset blend state to ensure clean test
            animator.blendState = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveStep');

            // Sample at different step phases
            // Phase 0: elapsed=250ms (mid-phase 0, should add positive x)
            // Phase 2: elapsed=1250ms (mid-phase 2, should subtract x)
            Date.now = vi.fn(() => 1250); // Mid-way through phase 0
            const t0 = animator.getTransform(16);

            Date.now = vi.fn(() => 2250); // Mid-way through phase 2
            const t1 = animator.getTransform(16);

            // Phase 0 adds positive x, phase 2 subtracts x, so they should be different
            expect(t0.x).not.toBe(t1.x);
        });

        it('should use smoothStep for grooveStep animation', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveStep');

            Date.now = vi.fn(() => 1250); // Mid-step
            const transform = animator.getTransform(16);

            // Should produce smooth interpolation
            expect(transform).toBeDefined();
        });
    });

    describe('lerp', () => {
        it('should interpolate between two values', () => {
            expect(animator.lerp(0, 100, 0.5)).toBe(50);
        });

        it('should return start value when t is 0', () => {
            expect(animator.lerp(10, 90, 0)).toBe(10);
        });

        it('should return end value when t is 1', () => {
            expect(animator.lerp(10, 90, 1)).toBe(90);
        });

        it('should handle negative values', () => {
            expect(animator.lerp(-50, 50, 0.5)).toBe(0);
        });

        it('should handle t values between 0 and 1', () => {
            expect(animator.lerp(0, 100, 0.2)).toBe(20);
            expect(animator.lerp(0, 100, 0.8)).toBe(80);
        });

        it('should work with decimal start and end values', () => {
            expect(animator.lerp(1.5, 2.5, 0.5)).toBe(2.0);
        });
    });

    describe('smoothStep', () => {
        it('should return 0 when t is 0', () => {
            expect(animator.smoothStep(0)).toBe(0);
        });

        it('should return 1 when t is 1', () => {
            expect(animator.smoothStep(1)).toBe(1);
        });

        it('should return 0.5 when t is 0.5', () => {
            expect(animator.smoothStep(0.5)).toBe(0.5);
        });

        it('should produce smooth interpolation curve', () => {
            const result = animator.smoothStep(0.25);
            // smoothStep(0.25) = 0.25^2 * (3 - 2*0.25) = 0.0625 * 2.5 = 0.15625
            expect(result).toBeCloseTo(0.15625, 5);
        });

        it('should have zero derivative at endpoints', () => {
            // Test values near 0 and 1 to verify smooth acceleration/deceleration
            const near0 = animator.smoothStep(0.01);
            const near1 = animator.smoothStep(0.99);

            expect(near0).toBeLessThan(0.01); // Should be less than linear
            expect(near1).toBeGreaterThan(0.99); // Should be close to 1
        });
    });

    describe('Animation timing precision', () => {
        it('should calculate grooveSway at specific time points', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveSway', { intensity: 1.0, frequency: 1.0 });

            Date.now = vi.fn(() => 1000); // t=0
            const t0 = animator.getTransform(16);
            expect(t0.x).toBeCloseTo(0, 1);
            expect(t0.rotation).toBeCloseTo(Math.sin(Math.PI/4) * 5, 1);
        });

        it('should calculate grooveBob at 400ms cycle', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveBob', { intensity: 1.0, frequency: 1.0 });

            Date.now = vi.fn(() => 1400); // One full cycle
            const transform = animator.getTransform(16);

            // At 400ms elapsed, should have animation effect
            expect(typeof transform.y).toBe('number');
            expect(Math.abs(transform.y)).toBeLessThan(15); // Within expected range
        });

        it('should maintain consistent animation over time', () => {
            Date.now = vi.fn(() => 1000);
            animator.startAmbientAnimation('grooveFlow', { intensity: 1.0, frequency: 1.0 });

            const transforms = [];
            for (let i = 0; i <= 1000; i += 100) {
                Date.now = vi.fn(() => 1000 + i);
                transforms.push(animator.getTransform(16));
            }

            // Verify all transforms are valid
            transforms.forEach(t => {
                expect(t.x).toBeDefined();
                expect(t.y).toBeDefined();
                expect(t.rotation).toBeDefined();
                expect(t.scale).toBeDefined();
                expect(t.opacity).toBeDefined();
            });
        });
    });

    describe('Edge cases and robustness', () => {
        it('should handle very high intensity values', () => {
            animator.startAmbientAnimation('groovePulse', { intensity: 10.0 });

            expect(() => {
                animator.getTransform(16);
            }).not.toThrow();
        });

        it('should handle very high frequency values', () => {
            animator.startAmbientAnimation('grooveFlow', { frequency: 100.0 });

            expect(() => {
                animator.getTransform(16);
            }).not.toThrow();
        });

        it('should handle negative intensity gracefully', () => {
            animator.startAmbientAnimation('grooveSway', { intensity: -1.0 });

            const transform = animator.getTransform(16);
            expect(transform).toBeDefined();
        });

        it('should handle empty options object', () => {
            animator.startAmbientAnimation('grooveBob', {});

            expect(animator.animations.grooveBob.intensity).toBe(1.0);
            expect(animator.animations.grooveBob.frequency).toBe(1.0);
        });

        it('should handle rapid animation switching', () => {
            const animations = ['grooveSway', 'grooveBob', 'grooveFlow', 'groovePulse', 'grooveStep'];

            animations.forEach(anim => {
                animator.startAmbientAnimation(anim);
                expect(animator.activeAnimation).toBe(anim);
            });
        });

        it('should maintain blend state through animation changes', () => {
            animator.updateBlendState({ x: 100, y: 50 });

            animator.startAmbientAnimation('grooveSway');
            expect(animator.blendState.x).toBe(20); // After interpolation

            animator.startAmbientAnimation('grooveBob');
            expect(animator.blendState.x).toBe(20); // Should not reset
        });
    });
});
