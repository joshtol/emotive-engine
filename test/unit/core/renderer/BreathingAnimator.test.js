/**
 * Comprehensive tests for BreathingAnimator
 * Tests breathing animation calculations, timing, scale factors, and edge cases
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BreathingAnimator } from '../../../../src/core/renderer/BreathingAnimator.js';

describe('BreathingAnimator', () => {
    let animator;
    let mockRenderer;

    beforeEach(() => {
        // Create mock renderer
        mockRenderer = {
            config: {
                breathingSpeed: 0.42,
                breathingDepth: 0.08
            }
        };

        animator = new BreathingAnimator(mockRenderer);
    });

    describe('Constructor', () => {
        it('should create animator instance', () => {
            expect(animator).toBeDefined();
            expect(animator).toBeInstanceOf(BreathingAnimator);
        });

        it('should store renderer reference', () => {
            expect(animator.renderer).toBe(mockRenderer);
        });

        it('should initialize breathing speed to 0.42 rad/s', () => {
            expect(animator.breathingSpeed).toBe(0.42);
        });

        it('should initialize breathing depth to 0.08 (8%)', () => {
            expect(animator.breathingDepth).toBe(0.08);
        });

        it('should initialize breathing phase to 0', () => {
            expect(animator.breathingPhase).toBe(0);
        });

        it('should initialize breath rate to 1.0', () => {
            expect(animator.breathRate).toBe(1.0);
        });

        it('should initialize breath depth to breathing depth value', () => {
            expect(animator.breathDepth).toBe(animator.breathingDepth);
        });

        it('should initialize breath rate multiplier to 1.0', () => {
            expect(animator.breathRateMult).toBe(1.0);
        });

        it('should initialize breath depth multiplier to 1.0', () => {
            expect(animator.breathDepthMult).toBe(1.0);
        });

        it('should initialize irregular breathing to false', () => {
            expect(animator.breathIrregular).toBe(false);
        });

        it('should initialize custom scale to null', () => {
            expect(animator.customScale).toBeNull();
        });

        it('should define emotion breath patterns object', () => {
            expect(animator.emotionBreathPatterns).toBeDefined();
            expect(typeof animator.emotionBreathPatterns).toBe('object');
        });

        it('should have patterns for all standard emotions', () => {
            const requiredEmotions = [
                'happy', 'sad', 'angry', 'calm', 'excited', 'focused',
                'neutral', 'love', 'surprised', 'confused'
            ];

            requiredEmotions.forEach(emotion => {
                expect(animator.emotionBreathPatterns[emotion]).toBeDefined();
                expect(animator.emotionBreathPatterns[emotion]).toHaveProperty('rate');
                expect(animator.emotionBreathPatterns[emotion]).toHaveProperty('depth');
            });
        });

        it('should have patterns for extended emotions', () => {
            const extendedEmotions = [
                'amused', 'bored', 'tired', 'anxious', 'determined',
                'proud', 'content', 'hopeful', 'zen', 'intrigued'
            ];

            extendedEmotions.forEach(emotion => {
                expect(animator.emotionBreathPatterns[emotion]).toBeDefined();
            });
        });

        it('should have extreme emotion patterns (zen, sleepy)', () => {
            expect(animator.emotionBreathPatterns.zen).toEqual({ rate: 0.4, depth: 1.5 });
            expect(animator.emotionBreathPatterns.sleepy).toEqual({ rate: 0.3, depth: 1.4 });
        });
    });

    describe('update Method - Basic Functionality', () => {
        it('should update breathing phase based on deltaTime', () => {
            const initialPhase = animator.breathingPhase;
            animator.update(16, 'neutral');
            expect(animator.breathingPhase).toBeGreaterThan(initialPhase);
        });

        it('should apply emotion-specific breathing pattern', () => {
            animator.update(16, 'happy');
            // Happy has rate: 1.1, depth: 1.2
            expect(animator.breathRate).toBeCloseTo(1.1, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.2, 4);
        });

        it('should handle neutral emotion', () => {
            animator.update(16, 'neutral');
            expect(animator.breathRate).toBeCloseTo(1.0, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08, 4);
        });

        it('should handle sad emotion (slower breathing)', () => {
            animator.update(16, 'sad');
            // Sad has rate: 0.8, depth: 0.7
            expect(animator.breathRate).toBeCloseTo(0.8, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08 * 0.7, 4);
        });

        it('should handle angry emotion (faster breathing)', () => {
            animator.update(16, 'angry');
            // Angry has rate: 1.4, depth: 1.3
            expect(animator.breathRate).toBeCloseTo(1.4, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.3, 4);
        });

        it('should handle zen emotion (very slow)', () => {
            animator.update(16, 'zen');
            // Zen has rate: 0.4, depth: 1.5
            expect(animator.breathRate).toBeCloseTo(0.4, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.5, 4);
        });

        it('should handle anxious emotion (very fast)', () => {
            animator.update(16, 'anxious');
            // Anxious has rate: 1.6, depth: 0.9
            expect(animator.breathRate).toBeCloseTo(1.6, 2);
        });

        it('should use default pattern for unknown emotion', () => {
            animator.update(16, 'unknownEmotion');
            expect(animator.breathRate).toBeCloseTo(1.0, 2);
            expect(animator.breathDepth).toBeCloseTo(0.08, 4);
        });

        it('should handle null undertone parameter', () => {
            expect(() => animator.update(16, 'neutral', null)).not.toThrow();
        });

        it('should handle undefined undertone parameter', () => {
            expect(() => animator.update(16, 'neutral', undefined)).not.toThrow();
        });

        it('should handle empty undertone object', () => {
            animator.update(16, 'neutral', {});
            expect(animator.breathRate).toBeCloseTo(1.0, 2);
        });
    });

    describe('update Method - Undertone Modifiers', () => {
        it('should apply undertone breath rate multiplier', () => {
            const undertone = { breathRateMult: 1.5 };
            animator.update(16, 'neutral', undertone);
            expect(animator.breathRate).toBeCloseTo(1.0 * 1.5, 2);
        });

        it('should apply undertone breath depth multiplier', () => {
            const undertone = { breathDepthMult: 2.0 };
            animator.update(16, 'neutral', undertone);
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.0 * 2.0, 4);
        });

        it('should combine emotion and undertone rate modifiers', () => {
            const undertone = { breathRateMult: 1.5 };
            animator.update(16, 'happy', undertone);
            // Happy rate: 1.1, undertone: 1.5
            expect(animator.breathRate).toBeCloseTo(1.1 * 1.5, 2);
        });

        it('should combine emotion and undertone depth modifiers', () => {
            const undertone = { breathDepthMult: 2.0 };
            animator.update(16, 'happy', undertone);
            // Happy depth: 1.2, undertone: 2.0
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.2 * 2.0, 4);
        });

        it('should combine all multipliers correctly', () => {
            animator.breathRateMult = 1.2;
            animator.breathDepthMult = 1.3;
            const undertone = { breathRateMult: 1.5, breathDepthMult: 1.4 };
            animator.update(16, 'happy', undertone);
            // Happy: rate 1.1, depth 1.2
            // Total rate: 1.1 * 1.2 * 1.5
            expect(animator.breathRate).toBeCloseTo(1.1 * 1.2 * 1.5, 2);
            // Total depth: 0.08 * 1.2 * 1.3 * 1.4
            expect(animator.breathDepth).toBeCloseTo(0.08 * 1.2 * 1.3 * 1.4, 4);
        });

        it('should handle missing breathRateMult in undertone', () => {
            const undertone = { breathDepthMult: 1.5 };
            animator.update(16, 'neutral', undertone);
            expect(animator.breathRate).toBeCloseTo(1.0, 2);
        });

        it('should handle missing breathDepthMult in undertone', () => {
            const undertone = { breathRateMult: 1.5 };
            animator.update(16, 'neutral', undertone);
            expect(animator.breathDepth).toBeCloseTo(0.08, 4);
        });
    });

    describe('update Method - Phase Calculation', () => {
        it('should advance phase proportional to deltaTime', () => {
            const initialPhase = animator.breathingPhase;
            animator.update(16, 'neutral'); // 16ms
            const phase16 = animator.breathingPhase;

            animator.breathingPhase = initialPhase;
            animator.update(32, 'neutral'); // 32ms
            const phase32 = animator.breathingPhase;

            expect(phase32).toBeCloseTo(phase16 * 2, 2);
        });

        it('should wrap phase at 2π', () => {
            animator.breathingPhase = Math.PI * 2 - 0.1;
            animator.update(100, 'neutral');
            expect(animator.breathingPhase).toBeLessThan(Math.PI * 2);
            expect(animator.breathingPhase).toBeGreaterThanOrEqual(0);
        });

        it('should calculate phase increment correctly', () => {
            animator.breathingPhase = 0;
            animator.update(1000, 'neutral'); // 1 second
            // Phase increment = breathingSpeed * breathRate * (deltaTime / 1000)
            // = 0.42 * 1.0 * 1.0 = 0.42 radians
            expect(animator.breathingPhase).toBeCloseTo(0.42, 2);
        });

        it('should apply breath rate to phase calculation', () => {
            animator.breathingPhase = 0;
            animator.update(1000, 'happy'); // Happy has rate 1.1
            expect(animator.breathingPhase).toBeCloseTo(0.42 * 1.1, 2);
        });

        it('should handle zero deltaTime', () => {
            const initialPhase = animator.breathingPhase;
            animator.update(0, 'neutral');
            expect(animator.breathingPhase).toBe(initialPhase);
        });

        it('should handle very large deltaTime', () => {
            animator.breathingPhase = 0;
            animator.update(10000, 'neutral'); // 10 seconds
            expect(animator.breathingPhase).toBeGreaterThan(0);
            expect(animator.breathingPhase).toBeLessThan(Math.PI * 2);
        });
    });

    describe('update Method - Irregular Breathing', () => {
        it('should apply irregularity when both flags are true', () => {
            animator.breathIrregular = true;
            const undertone = { breathIrregular: true };

            // Mock Date.now() for consistent testing
            const mockNow = 1000000;
            vi.spyOn(Date, 'now').mockReturnValue(mockNow);

            animator.breathingPhase = 0;
            animator.update(1000, 'neutral', undertone);

            const expectedBase = 0.42; // base phase increment for 1 second
            const irregularityFactor = 0.8 + Math.sin(mockNow * 0.0003) * 0.4;
            const expectedPhase = expectedBase * irregularityFactor;

            expect(animator.breathingPhase).toBeCloseTo(expectedPhase, 2);

            vi.restoreAllMocks();
        });

        it('should not apply irregularity if breathIrregular is false', () => {
            animator.breathIrregular = false;
            const undertone = { breathIrregular: true };

            animator.breathingPhase = 0;
            animator.update(1000, 'neutral', undertone);

            expect(animator.breathingPhase).toBeCloseTo(0.42, 2);
        });

        it('should not apply irregularity if undertone flag is false', () => {
            animator.breathIrregular = true;
            const undertone = { breathIrregular: false };

            animator.breathingPhase = 0;
            animator.update(1000, 'neutral', undertone);

            expect(animator.breathingPhase).toBeCloseTo(0.42, 2);
        });

        it('should not apply irregularity if undertone is missing flag', () => {
            animator.breathIrregular = true;

            animator.breathingPhase = 0;
            animator.update(1000, 'neutral', {});

            expect(animator.breathingPhase).toBeCloseTo(0.42, 2);
        });
    });

    describe('getBreathingScale Method', () => {
        it('should return custom scale when set', () => {
            animator.customScale = 1.5;
            expect(animator.getBreathingScale()).toBe(1.5);
        });

        it('should calculate scale from breathing phase when custom scale is null', () => {
            animator.customScale = null;
            animator.breathingPhase = 0;
            animator.breathDepth = 0.08;

            const scale = animator.getBreathingScale();
            // At phase 0, sin(0) = 0, so scale = 1 + 0 * 0.08 = 1.0
            expect(scale).toBeCloseTo(1.0, 4);
        });

        it('should calculate maximum scale at π/2 phase', () => {
            animator.customScale = null;
            animator.breathingPhase = Math.PI / 2;
            animator.breathDepth = 0.08;

            const scale = animator.getBreathingScale();
            // At phase π/2, sin(π/2) = 1, so scale = 1 + 1 * 0.08 = 1.08
            expect(scale).toBeCloseTo(1.08, 4);
        });

        it('should calculate minimum scale at 3π/2 phase', () => {
            animator.customScale = null;
            animator.breathingPhase = (3 * Math.PI) / 2;
            animator.breathDepth = 0.08;

            const scale = animator.getBreathingScale();
            // At phase 3π/2, sin(3π/2) = -1, so scale = 1 + (-1) * 0.08 = 0.92
            expect(scale).toBeCloseTo(0.92, 4);
        });

        it('should vary scale with breath depth', () => {
            animator.customScale = null;
            animator.breathingPhase = Math.PI / 2; // sin = 1
            animator.breathDepth = 0.16;

            const scale = animator.getBreathingScale();
            // scale = 1 + 1 * 0.16 = 1.16
            expect(scale).toBeCloseTo(1.16, 4);
        });

        it('should return 1.0 when breath depth is zero', () => {
            animator.customScale = null;
            animator.breathingPhase = Math.PI / 2;
            animator.breathDepth = 0;

            const scale = animator.getBreathingScale();
            expect(scale).toBe(1.0);
        });

        it('should calculate scale correctly through full breath cycle', () => {
            animator.customScale = null;
            animator.breathDepth = 0.08;

            const phases = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI];
            const scales = phases.map(phase => {
                animator.breathingPhase = phase;
                return animator.getBreathingScale();
            });

            // Verify scales follow sine wave pattern
            expect(scales[0]).toBeCloseTo(1.0, 4); // sin(0) = 0
            expect(scales[1]).toBeGreaterThan(1.0); // sin(π/4) > 0
            expect(scales[2]).toBeCloseTo(1.08, 4); // sin(π/2) = 1
            expect(scales[3]).toBeGreaterThan(1.0); // sin(3π/4) > 0
            expect(scales[4]).toBeCloseTo(1.0, 4); // sin(π) ≈ 0
        });
    });

    describe('setCustomScale Method', () => {
        it('should set custom scale value', () => {
            animator.setCustomScale(1.5);
            expect(animator.customScale).toBe(1.5);
        });

        it('should accept null to clear custom scale', () => {
            animator.setCustomScale(1.5);
            animator.setCustomScale(null);
            expect(animator.customScale).toBeNull();
        });

        it('should accept zero as custom scale', () => {
            animator.setCustomScale(0);
            expect(animator.customScale).toBe(0);
        });

        it('should accept negative custom scale', () => {
            animator.setCustomScale(-0.5);
            expect(animator.customScale).toBe(-0.5);
        });

        it('should override breathing calculation when set', () => {
            animator.setCustomScale(2.0);
            animator.breathingPhase = Math.PI / 2;
            animator.breathDepth = 0.08;

            expect(animator.getBreathingScale()).toBe(2.0);
        });
    });

    describe('setBreathingSpeed Method', () => {
        it('should update breathing speed', () => {
            animator.setBreathingSpeed(0.5);
            expect(animator.breathingSpeed).toBe(0.5);
        });

        it('should accept zero speed', () => {
            animator.setBreathingSpeed(0);
            expect(animator.breathingSpeed).toBe(0);
        });

        it('should accept very high speed', () => {
            animator.setBreathingSpeed(5.0);
            expect(animator.breathingSpeed).toBe(5.0);
        });

        it('should affect phase calculation in update', () => {
            animator.breathingPhase = 0;
            animator.setBreathingSpeed(1.0);
            animator.update(1000, 'neutral');

            const phaseWithSpeed1 = animator.breathingPhase;

            animator.breathingPhase = 0;
            animator.setBreathingSpeed(2.0);
            animator.update(1000, 'neutral');

            const phaseWithSpeed2 = animator.breathingPhase;

            expect(phaseWithSpeed2).toBeCloseTo(phaseWithSpeed1 * 2, 2);
        });
    });

    describe('setBreathingDepth Method', () => {
        it('should update breathing depth', () => {
            animator.setBreathingDepth(0.15);
            expect(animator.breathingDepth).toBe(0.15);
        });

        it('should clamp depth to minimum 0', () => {
            animator.setBreathingDepth(-0.5);
            expect(animator.breathingDepth).toBe(0);
        });

        it('should clamp depth to maximum 1', () => {
            animator.setBreathingDepth(1.5);
            expect(animator.breathingDepth).toBe(1);
        });

        it('should accept zero depth', () => {
            animator.setBreathingDepth(0);
            expect(animator.breathingDepth).toBe(0);
        });

        it('should accept depth of 1', () => {
            animator.setBreathingDepth(1);
            expect(animator.breathingDepth).toBe(1);
        });

        it('should accept depth between 0 and 1', () => {
            animator.setBreathingDepth(0.5);
            expect(animator.breathingDepth).toBe(0.5);
        });

        it('should affect scale calculation', () => {
            animator.customScale = null;
            animator.breathingPhase = Math.PI / 2;

            animator.setBreathingDepth(0.1);
            animator.update(0, 'neutral');
            const scale1 = animator.getBreathingScale();

            animator.setBreathingDepth(0.2);
            animator.update(0, 'neutral');
            const scale2 = animator.getBreathingScale();

            expect(scale2).toBeGreaterThan(scale1);
        });
    });

    describe('setBreathRateMultiplier Method', () => {
        it('should update breath rate multiplier', () => {
            animator.setBreathRateMultiplier(1.5);
            expect(animator.breathRateMult).toBe(1.5);
        });

        it('should accept zero multiplier', () => {
            animator.setBreathRateMultiplier(0);
            expect(animator.breathRateMult).toBe(0);
        });

        it('should accept negative multiplier', () => {
            animator.setBreathRateMultiplier(-1.0);
            expect(animator.breathRateMult).toBe(-1.0);
        });

        it('should affect breath rate calculation', () => {
            animator.setBreathRateMultiplier(2.0);
            animator.update(16, 'neutral');
            expect(animator.breathRate).toBeCloseTo(2.0, 2);
        });
    });

    describe('setBreathDepthMultiplier Method', () => {
        it('should update breath depth multiplier', () => {
            animator.setBreathDepthMultiplier(1.5);
            expect(animator.breathDepthMult).toBe(1.5);
        });

        it('should accept zero multiplier', () => {
            animator.setBreathDepthMultiplier(0);
            expect(animator.breathDepthMult).toBe(0);
        });

        it('should accept very large multiplier', () => {
            animator.setBreathDepthMultiplier(10.0);
            expect(animator.breathDepthMult).toBe(10.0);
        });

        it('should affect breath depth calculation', () => {
            animator.setBreathDepthMultiplier(2.0);
            animator.update(16, 'neutral');
            expect(animator.breathDepth).toBeCloseTo(0.08 * 2.0, 4);
        });
    });

    describe('setIrregularBreathing Method', () => {
        it('should enable irregular breathing', () => {
            animator.setIrregularBreathing(true);
            expect(animator.breathIrregular).toBe(true);
        });

        it('should disable irregular breathing', () => {
            animator.breathIrregular = true;
            animator.setIrregularBreathing(false);
            expect(animator.breathIrregular).toBe(false);
        });

        it('should accept boolean parameter', () => {
            animator.setIrregularBreathing(true);
            expect(animator.breathIrregular).toBe(true);
            animator.setIrregularBreathing(false);
            expect(animator.breathIrregular).toBe(false);
        });
    });

    describe('reset Method', () => {
        it('should reset breathing phase to 0', () => {
            animator.breathingPhase = Math.PI;
            animator.reset();
            expect(animator.breathingPhase).toBe(0);
        });

        it('should reset breath rate to 1.0', () => {
            animator.breathRate = 2.0;
            animator.reset();
            expect(animator.breathRate).toBe(1.0);
        });

        it('should reset breath depth to breathing depth', () => {
            animator.breathDepth = 0.2;
            animator.reset();
            expect(animator.breathDepth).toBe(animator.breathingDepth);
        });

        it('should reset breath rate multiplier to 1.0', () => {
            animator.breathRateMult = 2.0;
            animator.reset();
            expect(animator.breathRateMult).toBe(1.0);
        });

        it('should reset breath depth multiplier to 1.0', () => {
            animator.breathDepthMult = 2.0;
            animator.reset();
            expect(animator.breathDepthMult).toBe(1.0);
        });

        it('should reset irregular breathing to false', () => {
            animator.breathIrregular = true;
            animator.reset();
            expect(animator.breathIrregular).toBe(false);
        });

        it('should reset custom scale to null', () => {
            animator.customScale = 1.5;
            animator.reset();
            expect(animator.customScale).toBeNull();
        });

        it('should reset all state at once', () => {
            animator.breathingPhase = Math.PI;
            animator.breathRate = 2.0;
            animator.breathRateMult = 1.5;
            animator.breathDepthMult = 1.3;
            animator.breathIrregular = true;
            animator.customScale = 2.0;

            animator.reset();

            expect(animator.breathingPhase).toBe(0);
            expect(animator.breathRate).toBe(1.0);
            expect(animator.breathRateMult).toBe(1.0);
            expect(animator.breathDepthMult).toBe(1.0);
            expect(animator.breathIrregular).toBe(false);
            expect(animator.customScale).toBeNull();
        });
    });

    describe('holdBreath Method', () => {
        it('should set custom scale when holding breath', () => {
            animator.holdBreath(false);
            expect(animator.customScale).toBeDefined();
            expect(animator.customScale).not.toBeNull();
        });

        it('should set scale to 0.92 for empty lungs', () => {
            animator.holdBreath(true);
            expect(animator.customScale).toBe(0.92);
        });

        it('should set scale to 1.08 for full lungs', () => {
            animator.holdBreath(false);
            expect(animator.customScale).toBe(1.08);
        });

        it('should default to full lungs when no parameter', () => {
            animator.holdBreath();
            expect(animator.customScale).toBe(1.08);
        });

        it('should override breathing scale calculation', () => {
            animator.breathingPhase = Math.PI / 2;
            animator.holdBreath(false);
            expect(animator.getBreathingScale()).toBe(1.08);
        });
    });

    describe('releaseBreath Method', () => {
        it('should clear custom scale', () => {
            animator.customScale = 1.5;
            animator.releaseBreath();
            expect(animator.customScale).toBeNull();
        });

        it('should restore normal breathing calculation', () => {
            animator.holdBreath(true);
            animator.breathingPhase = 0;
            animator.breathDepth = 0.08;

            animator.releaseBreath();

            const scale = animator.getBreathingScale();
            expect(scale).toBeCloseTo(1.0, 4);
        });

        it('should work after empty breath hold', () => {
            animator.holdBreath(true);
            expect(animator.customScale).toBe(0.92);
            animator.releaseBreath();
            expect(animator.customScale).toBeNull();
        });

        it('should work after full breath hold', () => {
            animator.holdBreath(false);
            expect(animator.customScale).toBe(1.08);
            animator.releaseBreath();
            expect(animator.customScale).toBeNull();
        });
    });

    describe('getBreathingInfo Method', () => {
        it('should return breathing info object', () => {
            const info = animator.getBreathingInfo();
            expect(info).toBeDefined();
            expect(typeof info).toBe('object');
        });

        it('should include phase in info', () => {
            animator.breathingPhase = Math.PI;
            const info = animator.getBreathingInfo();
            expect(info.phase).toBe(Math.PI);
        });

        it('should include rate in info', () => {
            animator.breathRate = 1.5;
            const info = animator.getBreathingInfo();
            expect(info.rate).toBe(1.5);
        });

        it('should include depth in info', () => {
            animator.breathDepth = 0.12;
            const info = animator.getBreathingInfo();
            expect(info.depth).toBe(0.12);
        });

        it('should include current scale in info', () => {
            animator.breathingPhase = Math.PI / 2;
            animator.breathDepth = 0.08;
            const info = animator.getBreathingInfo();
            expect(info.scale).toBeCloseTo(1.08, 4);
        });

        it('should indicate custom scale usage', () => {
            animator.customScale = null;
            let info = animator.getBreathingInfo();
            expect(info.isCustom).toBe(false);

            animator.customScale = 1.5;
            info = animator.getBreathingInfo();
            expect(info.isCustom).toBe(true);
        });

        it('should indicate irregular breathing status', () => {
            animator.breathIrregular = false;
            let info = animator.getBreathingInfo();
            expect(info.isIrregular).toBe(false);

            animator.breathIrregular = true;
            info = animator.getBreathingInfo();
            expect(info.isIrregular).toBe(true);
        });

        it('should return all required properties', () => {
            const info = animator.getBreathingInfo();
            expect(info).toHaveProperty('phase');
            expect(info).toHaveProperty('rate');
            expect(info).toHaveProperty('depth');
            expect(info).toHaveProperty('scale');
            expect(info).toHaveProperty('isCustom');
            expect(info).toHaveProperty('isIrregular');
        });
    });

    describe('Edge Cases - Speed and Depth Combinations', () => {
        it('should handle zero speed', () => {
            animator.setBreathingSpeed(0);
            const initialPhase = animator.breathingPhase;
            animator.update(1000, 'neutral');
            expect(animator.breathingPhase).toBe(initialPhase);
        });

        it('should handle zero depth', () => {
            animator.setBreathingDepth(0);
            animator.update(16, 'neutral');
            animator.breathingPhase = Math.PI / 2;
            expect(animator.getBreathingScale()).toBe(1.0);
        });

        it('should handle maximum depth (1.0)', () => {
            animator.setBreathingDepth(1.0);
            animator.update(16, 'neutral');
            animator.breathingPhase = Math.PI / 2;
            expect(animator.getBreathingScale()).toBeCloseTo(2.0, 4);
        });

        it('should handle very high speed', () => {
            animator.setBreathingSpeed(10.0);
            animator.breathingPhase = 0;
            animator.update(100, 'neutral');
            expect(animator.breathingPhase).toBeGreaterThan(0);
        });

        it('should handle combined extreme multipliers', () => {
            animator.setBreathRateMultiplier(10.0);
            animator.setBreathDepthMultiplier(10.0);
            const undertone = { breathRateMult: 2.0, breathDepthMult: 2.0 };
            animator.update(16, 'excited', undertone);

            // Should calculate without error
            expect(animator.breathRate).toBeGreaterThan(0);
            expect(animator.breathDepth).toBeGreaterThan(0);
        });

        it('should handle negative deltaTime', () => {
            const initialPhase = animator.breathingPhase;
            animator.update(-16, 'neutral');
            // Phase should not increase
            expect(animator.breathingPhase).toBeLessThanOrEqual(initialPhase);
        });

        it('should handle very small positive deltaTime', () => {
            const initialPhase = animator.breathingPhase;
            animator.update(0.001, 'neutral');
            expect(animator.breathingPhase).toBeGreaterThanOrEqual(initialPhase);
        });

        it('should maintain breathing through multiple emotion changes', () => {
            const emotions = ['neutral', 'happy', 'sad', 'angry', 'calm', 'excited'];

            emotions.forEach(emotion => {
                animator.update(16, emotion);
                expect(animator.breathingPhase).toBeGreaterThanOrEqual(0);
                expect(animator.breathingPhase).toBeLessThan(Math.PI * 2);
            });
        });

        it('should handle rapid succession of updates', () => {
            for (let i = 0; i < 100; i++) {
                animator.update(1, 'neutral');
            }

            expect(animator.breathingPhase).toBeGreaterThan(0);
            expect(animator.breathingPhase).toBeLessThan(Math.PI * 2);
        });

        it('should maintain scale bounds throughout full cycle', () => {
            animator.breathingDepth = 0.5;
            const scales = [];

            for (let phase = 0; phase < Math.PI * 2; phase += 0.1) {
                animator.breathingPhase = phase;
                animator.breathDepth = 0.5;
                scales.push(animator.getBreathingScale());
            }

            const maxScale = Math.max(...scales);
            const minScale = Math.min(...scales);

            expect(maxScale).toBeCloseTo(1.5, 2); // 1 + 1 * 0.5
            expect(minScale).toBeCloseTo(0.5, 2); // 1 + (-1) * 0.5
        });
    });

    describe('Integration - Full Breathing Cycles', () => {
        it('should complete full breathing cycle smoothly', () => {
            const scales = [];
            animator.breathingPhase = 0;
            animator.breathDepth = 0.08;

            // Simulate 4-second breathing cycle at 60fps
            for (let i = 0; i < 240; i++) {
                animator.update(16.67, 'neutral');
                scales.push(animator.getBreathingScale());
            }

            // Should have variation in scales - check the range
            const maxScale = Math.max(...scales);
            const minScale = Math.min(...scales);
            const scaleRange = maxScale - minScale;

            expect(maxScale).toBeGreaterThan(1.0);
            expect(scaleRange).toBeGreaterThan(0.05); // Meaningful variation (2x breath depth)
        });

        it('should transition smoothly between emotions', () => {
            animator.update(16, 'calm');
            const calmRate = animator.breathRate;

            animator.update(16, 'excited');
            const excitedRate = animator.breathRate;

            expect(excitedRate).toBeGreaterThan(calmRate);
        });

        it('should maintain consistency with custom scale', () => {
            animator.setCustomScale(1.25);

            for (let i = 0; i < 100; i++) {
                animator.update(16, 'neutral');
                expect(animator.getBreathingScale()).toBe(1.25);
            }
        });

        it('should resume normal breathing after breath hold release', () => {
            animator.holdBreath(true);
            expect(animator.getBreathingScale()).toBe(0.92);

            animator.releaseBreath();
            animator.breathingPhase = Math.PI / 2;
            animator.breathDepth = 0.08;

            expect(animator.getBreathingScale()).toBeCloseTo(1.08, 4);
        });
    });
});
