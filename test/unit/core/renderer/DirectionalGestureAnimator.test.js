/**
 * DirectionalGestureAnimator - Unit Tests
 * Tests for directional gesture animations (point, lean, reach)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DirectionalGestureAnimator } from '../../../../src/core/renderer/DirectionalGestureAnimator.js';

describe('DirectionalGestureAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        mockRenderer = {
            scaleFactor: 1
        };
        animator = new DirectionalGestureAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should initialize with renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
            expect(animator.scaleFactor).toBe(1);
        });
    });

    describe('applyPoint', () => {
        it('should initialize random point direction', () => {
            const anim = {
                params: {
                    distance: 40
                }
            };

            expect(anim.pointDirection).toBeUndefined();
            animator.applyPoint(anim, 0.1);
            expect(anim.pointDirection).toBeDefined();
            expect([-1, 1]).toContain(anim.pointDirection);
        });

        it('should return all transform properties', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result = animator.applyPoint(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scale');
            expect(result).toHaveProperty('rotation');
        });

        it('should move to point position in first 40%', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result1 = animator.applyPoint(anim, 0);
            const result2 = animator.applyPoint(anim, 0.2);
            const result3 = animator.applyPoint(anim, 0.4);

            expect(result1.offsetX).toBeCloseTo(0, 5);
            expect(result2.offsetX).toBeGreaterThan(0);
            expect(result3.offsetX).toBeCloseTo(40, 2);
        });

        it('should hold at point from 40% to 60%', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result1 = animator.applyPoint(anim, 0.4);
            const result2 = animator.applyPoint(anim, 0.5);
            const result3 = animator.applyPoint(anim, 0.6);

            expect(result1.offsetX).toBeCloseTo(40, 2);
            expect(result2.offsetX).toBeCloseTo(40, 2);
            expect(result3.offsetX).toBeCloseTo(40, 2);
        });

        it('should return to center from 60% to 100%', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result1 = animator.applyPoint(anim, 0.6);
            const result2 = animator.applyPoint(anim, 0.8);
            const result3 = animator.applyPoint(anim, 1.0);

            expect(result1.offsetX).toBeCloseTo(40, 2);
            expect(result2.offsetX).toBeGreaterThan(0);
            expect(result2.offsetX).toBeLessThan(40);
            expect(result3.offsetX).toBeCloseTo(0, 2);
        });

        it('should point left when direction is -1', () => {
            const anim = {
                params: {
                    direction: -1,
                    distance: 40
                }
            };

            const result = animator.applyPoint(anim, 0.5);

            expect(result.offsetX).toBeLessThan(0);
            expect(result.rotation).toBeLessThan(0);
        });

        it('should point right when direction is 1', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result = animator.applyPoint(anim, 0.5);

            expect(result.offsetX).toBeGreaterThan(0);
            expect(result.rotation).toBeGreaterThan(0);
        });

        it('should lift slightly when pointing', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40
                }
            };

            const result = animator.applyPoint(anim, 0.5);

            expect(result.offsetY).toBeLessThan(0); // Negative Y is up
        });

        it('should use default distance when not specified', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyPoint(anim, 0.5);

            expect(result.offsetX).not.toBe(0);
        });
    });

    describe('applyLean', () => {
        it('should create rotational tilt with offset', () => {
            const anim = {
                params: {
                    angle: 15,
                    side: 1
                }
            };

            const result = animator.applyLean(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('rotation');
            expect(result.offsetX).toBeGreaterThan(0);
            expect(result.rotation).toBeGreaterThan(0);
        });

        it('should lean left when side is -1', () => {
            const anim = {
                params: {
                    angle: 15,
                    side: -1
                }
            };

            const result = animator.applyLean(anim, 0.5);

            expect(result.offsetX).toBeLessThan(0);
            expect(result.rotation).toBeLessThan(0);
        });

        it('should lean right when side is 1', () => {
            const anim = {
                params: {
                    angle: 15,
                    side: 1
                }
            };

            const result = animator.applyLean(anim, 0.5);

            expect(result.offsetX).toBeGreaterThan(0);
            expect(result.rotation).toBeGreaterThan(0);
        });

        it('should return to center at progress 0 and 1', () => {
            const anim = {
                params: {
                    angle: 15,
                    side: 1
                }
            };

            const result1 = animator.applyLean(anim, 0);
            const result2 = animator.applyLean(anim, 1);

            expect(result1.offsetX).toBeCloseTo(0, 5);
            expect(result1.rotation).toBeCloseTo(0, 5);
            expect(result2.offsetX).toBeCloseTo(0, 3);
            expect(result2.rotation).toBeCloseTo(0, 3);
        });

        it('should use default values when not specified', () => {
            const anim = {
                params: {}
            };

            const result = animator.applyLean(anim, 0.5);

            expect(result.offsetX).not.toBe(0);
            expect(result.rotation).not.toBe(0);
        });
    });

    describe('applyReach', () => {
        it('should return all transform properties', () => {
            const anim = {
                params: {
                    direction: -Math.PI / 2,
                    distance: 40
                }
            };

            const result = animator.applyReach(anim, 0.5);

            expect(result).toHaveProperty('offsetX');
            expect(result).toHaveProperty('offsetY');
            expect(result).toHaveProperty('scale');
        });

        it('should reach in specified direction', () => {
            const anim = {
                params: {
                    direction: 0, // Right (0 radians)
                    distance: 40
                }
            };

            const result = animator.applyReach(anim, 0.5); // At hold phase

            // cos(0) = 1, sin(0) = 0, so should move right with no Y movement
            expect(result.offsetX).toBeGreaterThan(30); // Should be at full distance
            expect(Math.abs(result.offsetY)).toBeLessThan(1); // Should be near 0 (floating point tolerance)
        });

        it('should reach upward by default', () => {
            const anim = {
                params: {
                    distance: 40
                }
            };

            const result = animator.applyReach(anim, 0.3);

            expect(Math.abs(result.offsetX)).toBeLessThan(5); // Should be near 0
            expect(result.offsetY).toBeLessThan(0); // Negative Y is up
        });

        it('should move to reach position in first 40%', () => {
            const anim = {
                params: {
                    direction: -Math.PI / 2,
                    distance: 40
                }
            };

            const result1 = animator.applyReach(anim, 0);
            const result2 = animator.applyReach(anim, 0.2);
            const result3 = animator.applyReach(anim, 0.4);

            const dist1 = Math.sqrt(result1.offsetX ** 2 + result1.offsetY ** 2);
            const dist2 = Math.sqrt(result2.offsetX ** 2 + result2.offsetY ** 2);
            const dist3 = Math.sqrt(result3.offsetX ** 2 + result3.offsetY ** 2);

            expect(dist1).toBeCloseTo(0, 5);
            expect(dist2).toBeGreaterThan(0);
            expect(dist2).toBeLessThan(40);
            expect(dist3).toBeCloseTo(40, 2);
        });

        it('should hold at reach position from 40% to 60%', () => {
            const anim = {
                params: {
                    direction: -Math.PI / 2,
                    distance: 40
                }
            };

            const result1 = animator.applyReach(anim, 0.4);
            const result2 = animator.applyReach(anim, 0.5);
            const result3 = animator.applyReach(anim, 0.6);

            const dist1 = Math.sqrt(result1.offsetX ** 2 + result1.offsetY ** 2);
            const dist2 = Math.sqrt(result2.offsetX ** 2 + result2.offsetY ** 2);
            const dist3 = Math.sqrt(result3.offsetX ** 2 + result3.offsetY ** 2);

            expect(dist1).toBeCloseTo(40, 2);
            expect(dist2).toBeCloseTo(40, 2);
            expect(dist3).toBeCloseTo(40, 2);
        });

        it('should return to origin from 60% to 100%', () => {
            const anim = {
                params: {
                    direction: -Math.PI / 2,
                    distance: 40
                }
            };

            const result1 = animator.applyReach(anim, 0.6);
            const result2 = animator.applyReach(anim, 0.8);
            const result3 = animator.applyReach(anim, 1.0);

            const dist1 = Math.sqrt(result1.offsetX ** 2 + result1.offsetY ** 2);
            const dist2 = Math.sqrt(result2.offsetX ** 2 + result2.offsetY ** 2);
            const dist3 = Math.sqrt(result3.offsetX ** 2 + result3.offsetY ** 2);

            expect(dist1).toBeCloseTo(40, 2);
            expect(dist2).toBeGreaterThan(0);
            expect(dist2).toBeLessThan(40);
            expect(dist3).toBeCloseTo(0, 2);
        });

        it('should stretch slightly when reaching', () => {
            const anim = {
                params: {
                    direction: -Math.PI / 2,
                    distance: 40
                }
            };

            const result = animator.applyReach(anim, 0.5);

            expect(result.scale).toBeGreaterThan(1.0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle progress = 0', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40,
                    angle: 15,
                    side: 1
                }
            };

            expect(() => animator.applyPoint(anim, 0)).not.toThrow();
            expect(() => animator.applyLean(anim, 0)).not.toThrow();
            expect(() => animator.applyReach(anim, 0)).not.toThrow();
        });

        it('should handle progress = 1', () => {
            const anim = {
                params: {
                    direction: 1,
                    distance: 40,
                    angle: 15,
                    side: 1
                }
            };

            expect(() => animator.applyPoint(anim, 1)).not.toThrow();
            expect(() => animator.applyLean(anim, 1)).not.toThrow();
            expect(() => animator.applyReach(anim, 1)).not.toThrow();
        });

        it('should handle missing params with defaults', () => {
            const anim = {
                params: {}
            };

            expect(() => animator.applyPoint(anim, 0.5)).not.toThrow();
            expect(() => animator.applyLean(anim, 0.5)).not.toThrow();
            expect(() => animator.applyReach(anim, 0.5)).not.toThrow();
        });
    });
});
