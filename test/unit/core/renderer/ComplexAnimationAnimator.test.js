/**
 * ComplexAnimationAnimator - Unit Tests
 * Tests for complex animation gestures (flashWave, rain, groove, headBob, runningMan, charleston)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplexAnimationAnimator } from '../../../../src/core/renderer/ComplexAnimationAnimator.js';

describe('ComplexAnimationAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1,
            particleSystem: {
                setGestureBehavior: vi.fn()
            }
        };
        animator = new ComplexAnimationAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });
    });

    describe('applyFlashWave', () => {
        it('should initialize flash wave state if not present', () => {
            const anim = {
                params: {}
            };

            expect(anim.flashWave).toBeUndefined();
            animator.applyFlashWave(anim, 0.1);
            expect(anim.flashWave).toBeDefined();
            expect(anim.flashWave.innerRadius).toBe(0);
            expect(anim.flashWave.outerRadius).toBeGreaterThan(0);
            expect(anim.flashWave.maxRadius).toBe(3.0);
        });

        it('should return glow and flashWave data', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyFlashWave(anim, 0.5);

            expect(result).toHaveProperty('glow');
            expect(result).toHaveProperty('flashWave');
            expect(result.flashWave).toHaveProperty('innerRadius');
            expect(result.flashWave).toHaveProperty('outerRadius');
            expect(result.flashWave).toHaveProperty('intensity');
        });

        it('should expand wave radius with progress', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applyFlashWave(anim, 0.2);
            const result2 = animator.applyFlashWave(anim, 0.5);
            const result3 = animator.applyFlashWave(anim, 0.8);

            expect(result1.flashWave.outerRadius).toBeLessThan(result2.flashWave.outerRadius);
            expect(result2.flashWave.outerRadius).toBeLessThan(result3.flashWave.outerRadius);
        });

        it('should fade intensity as wave travels', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applyFlashWave(anim, 0.2);
            const result2 = animator.applyFlashWave(anim, 0.5);
            const result3 = animator.applyFlashWave(anim, 0.8);

            expect(result1.flashWave.intensity).toBeGreaterThan(result2.flashWave.intensity);
            expect(result2.flashWave.intensity).toBeGreaterThan(result3.flashWave.intensity);
        });
    });

    describe('applyRain', () => {
        it('should return transform with offsetX and offsetY', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyRain(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('particleEffect');
            expect(result.particleEffect).toBe('falling');
        });

        it('should create downward drift with progress', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applyRain(anim, 0.2);
            const result2 = animator.applyRain(anim, 0.5);
            const result3 = animator.applyRain(anim, 0.8);

            expect(result1.offsetY).toBeLessThan(result2.offsetY);
            expect(result2.offsetY).toBeLessThan(result3.offsetY);
        });

        it('should create oscillating sway', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyRain(anim, 0.125);

            expect(result.offsetX).not.toBe(0);
        });

        it('should scale with intensity parameter', () => {
            const anim1 = {
                params: { intensity: 1.0 }
            };
            const anim2 = {
                params: { intensity: 2.0 }
            };

            const result1 = animator.applyRain(anim1, 0.5);
            const result2 = animator.applyRain(anim2, 0.5);

            expect(result2.offsetY).toBeGreaterThan(result1.offsetY);
        });

        it('should trigger particle falling behavior', () => {
            const anim = {
                params: {}
            };

            animator.applyRain(anim, 0.5);

            expect(mockRenderer.particleSystem.setGestureBehavior).toHaveBeenCalledWith('falling', true);
        });
    });

    describe('applyGroove', () => {
        it('should return all transform properties', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyGroove(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('rotation');
        });

        it('should create smooth flowing motion', () => {
            const anim = {
                params: {}
            };

            const result1 = animator.applyGroove(anim, 0.25);
            const result2 = animator.applyGroove(anim, 0.5);

            expect(result1.offsetX).not.toBe(result2.offsetX);
            expect(result1.offsetY).not.toBe(result2.offsetY);
        });

        it('should use default amplitude when not specified', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyGroove(anim, 0.5);

            expect(Math.abs(result.offsetX)).toBeGreaterThan(0);
        });

        it('should scale with amplitude parameter', () => {
            const anim1 = {
                params: { amplitude: 25 }
            };
            const anim2 = {
                params: { amplitude: 50 }
            };

            const result1 = animator.applyGroove(anim1, 0.25);
            const result2 = animator.applyGroove(anim2, 0.25);

            expect(Math.abs(result2.offsetX)).toBeGreaterThan(Math.abs(result1.offsetX));
        });
    });

    describe('applyHeadBob', () => {
        it('should return transform with offsetY and rotation', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyHeadBob(anim, 0.5);

            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('rotation');
        });

        it('should create quick down motion in first 30% of cycle', () => {
            const anim = {
                params: { frequency: 1 }
            };

            const result1 = animator.applyHeadBob(anim, 0);
            const result2 = animator.applyHeadBob(anim, 0.15);
            const result3 = animator.applyHeadBob(anim, 0.3);

            expect(result1.offsetY).toBeCloseTo(0, 5);
            expect(result2.offsetY).toBeLessThan(0);
            expect(result3.offsetY).toBeLessThan(result2.offsetY);
        });

        it('should apply forward tilt during down beat', () => {
            const anim = {
                params: { frequency: 1 }
            };

            const result1 = animator.applyHeadBob(anim, 0.15);
            const result2 = animator.applyHeadBob(anim, 0.5);

            expect(result1.rotation).toBe(-3);
            expect(result2.rotation).toBe(0);
        });

        it('should use default values when not specified', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyHeadBob(anim, 0.5);

            expect(result.offsetY).toBeDefined();
            expect(result.rotation).toBeDefined();
        });
    });

    describe('applyRunningMan', () => {
        it('should return all transform properties', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyRunningMan(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scaleY');
        });

        it('should create horizontal sliding motion', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyRunningMan(anim, 0.125);

            expect(result.offsetX).not.toBe(0);
        });

        it('should create stepping motion', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyRunningMan(anim, 0.125);

            expect(result.offsetY).toBeLessThan(0); // Negative Y is up
        });

        it('should compress vertically during steps', () => {
            const anim = {
                params: {}
            };

            // Use progress that hits peak: sin(0.0625 * π * 8) = sin(π/2) = 1
            const result = animator.applyRunningMan(anim, 0.0625);

            expect(result.scaleY).toBeLessThan(1.0);
        });
    });

    describe('applyCharleston', () => {
        it('should return all transform properties', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyCharleston(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scaleY');
        });

        it('should create crisscross kicking motion', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyCharleston(anim, 0.125);

            expect(result.offsetX).not.toBe(0);
        });

        it('should create hopping motion', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyCharleston(anim, 0.125);

            expect(result.offsetY).toBeLessThan(0); // Negative Y is up
        });

        it('should compress vertically during hops', () => {
            const anim = {
                params: {}
            };

            // Use progress that hits peak: sin(0.0625 * π * 8) = sin(π/2) = 1
            const result = animator.applyCharleston(anim, 0.0625);

            expect(result.scaleY).toBeLessThan(1.0);
        });

        it('should have larger rotation than runningMan', () => {
            const anim1 = {
                params: {}
            };
            const anim2 = {
                params: {}
            };

            // Use progress that hits peak: sin(0.0625 * π * 8) = sin(π/2) = 1
            const runningResult = animator.applyRunningMan(anim1, 0.0625);
            const charlestonResult = animator.applyCharleston(anim2, 0.0625);

            // Charleston has 0.6 multiplier vs 0.3 for runningMan
            expect(Math.abs(charlestonResult.rotation)).toBeGreaterThan(Math.abs(runningResult.rotation));
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyFlashWave(anim, 0)).not.toThrow();
            expect(() => animator.applyRain(anim, 0)).not.toThrow();
            expect(() => animator.applyGroove(anim, 0)).not.toThrow();
            expect(() => animator.applyHeadBob(anim, 0)).not.toThrow();
            expect(() => animator.applyRunningMan(anim, 0)).not.toThrow();
            expect(() => animator.applyCharleston(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyFlashWave(anim, 1)).not.toThrow();
            expect(() => animator.applyRain(anim, 1)).not.toThrow();
            expect(() => animator.applyGroove(anim, 1)).not.toThrow();
            expect(() => animator.applyHeadBob(anim, 1)).not.toThrow();
            expect(() => animator.applyRunningMan(anim, 1)).not.toThrow();
            expect(() => animator.applyCharleston(anim, 1)).not.toThrow();
        });

        it('should handle missing params with defaults', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyFlashWave(anim, 0.5)).not.toThrow();
            expect(() => animator.applyRain(anim, 0.5)).not.toThrow();
            expect(() => animator.applyGroove(anim, 0.5)).not.toThrow();
            expect(() => animator.applyHeadBob(anim, 0.5)).not.toThrow();
            expect(() => animator.applyRunningMan(anim, 0.5)).not.toThrow();
            expect(() => animator.applyCharleston(anim, 0.5)).not.toThrow();
        });

        it('should handle missing particle system gracefully', () => {
            const rendererWithoutPS = {
                scaleFactor: 1
            };
            const animatorWithoutPS = new ComplexAnimationAnimator(rendererWithoutPS);
            const anim = {
                params: {}
            };

            expect(() => animatorWithoutPS.applyRain(anim, 0.5)).not.toThrow();
        });
    });
});
