/**
 * MovementGestureAnimator - Unit Tests
 * Tests for movement gesture animations (spin, drift, wave, sway, float, orbital, hula, orbit)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MovementGestureAnimator } from '../../../../src/core/renderer/MovementGestureAnimator.js';

describe('MovementGestureAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new MovementGestureAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });
    });

    describe('applySpin', () => {
        it('should rotate with full completion', () => {
            const anim = {
                params: {
                    rotations: 2,
                    scaleAmount: 0.1
                }
            };

            const result = animator.applySpin(anim, 0.5);

            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scale');
            expect(Math.abs(result.rotation)).toBeGreaterThan(0);
        });

        it('should ensure full rotation at progress 1', () => {
            const anim = {
                params: {
                    rotations: 1,
                    scaleAmount: 0.1
                }
            };

            const result = animator.applySpin(anim, 1);

            expect(result.rotation).toBe(360); // Full rotation
        });
    });

    describe('applyDrift', () => {
        it('should initialize random drift angle', () => {
            const anim = {
                params: {
                    distance: 50
                }
            };

            expect(anim.currentDriftAngle).toBeUndefined();
            animator.applyDrift(anim, 0.01);
            expect(anim.currentDriftAngle).toBeDefined();
        });

        it('should clear angle at end', () => {
            const anim = {
                params: {
                    distance: 50
                },
                currentDriftAngle: Math.PI
            };

            animator.applyDrift(anim, 0.99);

            expect(anim.currentDriftAngle).toBeNull();
        });

        it('should follow sine curve', () => {
            const anim = {
                params: {
                    distance: 50
                }
            };

            // Initialize angle by calling with progress 0.01
            animator.applyDrift(anim, 0.01);
            // Set angle to 0 for deterministic test
            anim.currentDriftAngle = 0;

            const result1 = animator.applyDrift(anim, 0.1);
            const result2 = animator.applyDrift(anim, 0.5);
            const result3 = animator.applyDrift(anim, 0.9);

            expect(result1.offsetX).toBeGreaterThan(0);
            expect(result2.offsetX).toBeGreaterThan(result1.offsetX); // Peak
            expect(result3.offsetX).toBeLessThan(result2.offsetX); // Descending
        });
    });

    describe('applyWave', () => {
        it('should create infinity symbol motion', () => {
            const anim = {
                params: {
                    amplitude: 40
                }
            };

            const result = animator.applyWave(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('rotation');
            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('glow');
        });

        it('should use default amplitude', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyWave(anim, 0.5);

            expect(result.offsetX).toBeDefined();
        });
    });

    describe('applySway', () => {
        it('should apply horizontal sway with vertical bob', () => {
            const anim = {
                params: {
                    amplitude: 30,
                    frequency: 1
                }
            };

            const result = animator.applySway(anim, 0.25);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('rotation');
        });

        it('should use default values', () => {
            const anim = {
                params: {}
            };

            const result = animator.applySway(anim, 0.5);

            expect(result.offsetX).toBeDefined();
            expect(result.offsetY).toBeDefined();
            expect(result.rotation).toBeDefined();
        });
    });

    describe('applyFloat', () => {
        it('should create gentle vertical float', () => {
            const anim = {
                params: {
                    amplitude: 20,
                    frequency: 1
                }
            };

            const result = animator.applyFloat(anim, 0.5);

            expect(result).toHaveProperty('offsetY');
        });

        it('should use default values', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyFloat(anim, 0.5);

            expect(result.offsetY).toBeDefined();
        });
    });

    describe('applyOrbital', () => {
        it('should return no core movement', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyOrbital(anim, 0.5);

            expect(result.offsetX).toBe(0);
            expect(result.offsetY).toBe(0);
        });
    });

    describe('applyHula', () => {
        it('should create figure-8 pattern', () => {
            const anim = {
                params: {
                    amplitude: 40
                }
            };

            const result = animator.applyHula(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
        });

        it('should use default amplitude', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyHula(anim, 0.5);

            expect(result.offsetX).toBeDefined();
            expect(result.offsetY).toBeDefined();
        });
    });

    describe('applyOrbit', () => {
        it('should create circular path', () => {
            const anim = {
                params: {
                    radius: 30,
                    speed: 1
                }
            };

            const result = animator.applyOrbit(anim, 0.25);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
        });

        it('should complete full circle', () => {
            const anim = {
                params: {
                    radius: 30,
                    speed: 1
                }
            };

            const result1 = animator.applyOrbit(anim, 0);
            const result2 = animator.applyOrbit(anim, 1);

            // At progress 0 and 1, should be at same position
            expect(result1.offsetX).toBeCloseTo(result2.offsetX, 1);
            expect(result1.offsetY).toBeCloseTo(result2.offsetY, 1);
        });

        it('should use default values', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyOrbit(anim, 0.5);

            expect(result.offsetX).toBeDefined();
            expect(result.offsetY).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    rotations: 1,
                    distance: 50,
                    amplitude: 40
                }
            };

            expect(() => animator.applySpin(anim, 0)).not.toThrow();
            expect(() => animator.applyDrift(anim, 0)).not.toThrow();
            expect(() => animator.applyWave(anim, 0)).not.toThrow();
            expect(() => animator.applySway(anim, 0)).not.toThrow();
            expect(() => animator.applyFloat(anim, 0)).not.toThrow();
            expect(() => animator.applyOrbital(anim, 0)).not.toThrow();
            expect(() => animator.applyHula(anim, 0)).not.toThrow();
            expect(() => animator.applyOrbit(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    rotations: 1,
                    distance: 50,
                    amplitude: 40
                }
            };

            expect(() => animator.applySpin(anim, 1)).not.toThrow();
            expect(() => animator.applyDrift(anim, 1)).not.toThrow();
            expect(() => animator.applyWave(anim, 1)).not.toThrow();
            expect(() => animator.applySway(anim, 1)).not.toThrow();
            expect(() => animator.applyFloat(anim, 1)).not.toThrow();
            expect(() => animator.applyOrbital(anim, 1)).not.toThrow();
            expect(() => animator.applyHula(anim, 1)).not.toThrow();
            expect(() => animator.applyOrbit(anim, 1)).not.toThrow();
        });

        it('should handle missing params', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyWave(anim, 0.5)).not.toThrow();
            expect(() => animator.applySway(anim, 0.5)).not.toThrow();
            expect(() => animator.applyFloat(anim, 0.5)).not.toThrow();
            expect(() => animator.applyHula(anim, 0.5)).not.toThrow();
            expect(() => animator.applyOrbit(anim, 0.5)).not.toThrow();
        });
    });
});
