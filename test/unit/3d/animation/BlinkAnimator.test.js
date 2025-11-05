/**
 * BlinkAnimator Tests
 * Tests for the 3D blink animation system with emotion-aware timing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlinkAnimator } from '../../../../src/3d/animation/BlinkAnimator.js';

// Mock emotion loader
vi.mock('../../../../src/core/emotions/index.js', () => ({
    getEmotion: name => {
        const emotions = {
            neutral: {
                visual: {
                    blinkRate: 1.0,
                    blinkSpeed: 1.0
                }
            },
            excited: {
                visual: {
                    blinkRate: 1.5,
                    blinkSpeed: 1.2
                }
            },
            resting: {
                visual: {
                    blinkRate: 0.4,
                    blinkSpeed: 0.7
                }
            }
        };
        return emotions[name];
    }
}));

describe('BlinkAnimator', () => {
    let geometryConfig;
    let blinkAnimator;

    beforeEach(() => {
        // Create a mock geometry config with blink settings
        geometryConfig = {
            blink: {
                type: 'vertical-squish',
                duration: 150,
                scaleAxis: [1.0, 0.3, 1.0],
                curve: 'sine'
            }
        };

        blinkAnimator = new BlinkAnimator(geometryConfig);
    });

    describe('Initialization', () => {
        it('should initialize with geometry blink config', () => {
            expect(blinkAnimator.blinkConfig).toEqual(geometryConfig.blink);
            expect(blinkAnimator.baseDuration).toBe(150);
        });

        it('should start enabled by default', () => {
            expect(blinkAnimator.enabled).toBe(true);
        });

        it('should initialize emotion modifiers to 1.0', () => {
            expect(blinkAnimator.emotionBlinkRate).toBe(1.0);
            expect(blinkAnimator.emotionBlinkSpeed).toBe(1.0);
        });

        it('should schedule first blink', () => {
            expect(blinkAnimator.nextBlinkTime).toBeGreaterThan(0);
        });

        it('should use default config if no blink config provided', () => {
            const animator = new BlinkAnimator({});
            expect(animator.blinkConfig).toBeDefined();
            expect(animator.blinkConfig.type).toBe('vertical-squish');
        });
    });

    describe('Emotion Modulation', () => {
        it('should update blink rate and speed for excited emotion', () => {
            blinkAnimator.setEmotion('excited');
            expect(blinkAnimator.emotionBlinkRate).toBe(1.5);
            expect(blinkAnimator.emotionBlinkSpeed).toBe(1.2);
        });

        it('should update blink rate and speed for resting emotion', () => {
            blinkAnimator.setEmotion('resting');
            expect(blinkAnimator.emotionBlinkRate).toBe(0.4);
            expect(blinkAnimator.emotionBlinkSpeed).toBe(0.7);
        });

        it('should use 1.0 for unknown emotion', () => {
            blinkAnimator.setEmotion('unknown');
            expect(blinkAnimator.emotionBlinkRate).toBe(1.0);
            expect(blinkAnimator.emotionBlinkSpeed).toBe(1.0);
        });
    });

    describe('Blink Animation', () => {
        it('should not blink when disabled', () => {
            blinkAnimator.pause();
            const state = blinkAnimator.update(1000);
            expect(state.isBlinking).toBe(false);
        });

        it('should return idle state when paused', () => {
            blinkAnimator.pause();
            const state = blinkAnimator.update(100);
            expect(state.isBlinking).toBe(false);
            expect(state.scale).toEqual([1.0, 1.0, 1.0]);
        });

        it('should resume blinking when enabled', () => {
            blinkAnimator.pause();
            blinkAnimator.resume();
            expect(blinkAnimator.enabled).toBe(true);
        });

        it('should trigger blink after interval', () => {
            // Force immediate blink
            blinkAnimator.nextBlinkTime = 0;
            const state = blinkAnimator.update(1);
            expect(state.isBlinking).toBe(true);
        });

        it('should apply scale during blink', () => {
            // Trigger blink
            blinkAnimator.nextBlinkTime = 0;
            const state = blinkAnimator.update(1);
            expect(state.isBlinking).toBe(true);
            // Update partway through blink (at ~50% progress)
            const midState = blinkAnimator.update(75);
            expect(midState.isBlinking).toBe(true);
            // Scale should be between baseline and target at mid-blink
            expect(midState.scale[1]).toBeLessThan(1.0);
            expect(midState.scale[1]).toBeGreaterThan(0.3);
        });

        it('should complete blink and return to idle', () => {
            // Start blink
            blinkAnimator.nextBlinkTime = 0;
            blinkAnimator.update(1);

            // Update past blink duration (150ms default)
            const state = blinkAnimator.update(200);
            expect(state.isBlinking).toBe(false);
            expect(state.scale).toEqual([1.0, 1.0, 1.0]);
        });

        it('should schedule next blink after completing', () => {
            // Start and complete a blink
            blinkAnimator.nextBlinkTime = 0;
            blinkAnimator.update(1);
            blinkAnimator.update(200);

            // Next blink should be scheduled
            expect(blinkAnimator.nextBlinkTime).toBeGreaterThan(200);
        });
    });

    describe('Duration Calculation', () => {
        it('should calculate faster duration for excited emotion', () => {
            blinkAnimator.setEmotion('excited');
            // Base duration: 150ms, Speed: 1.2x
            // Expected: 150 / 1.2 = 125ms

            blinkAnimator.nextBlinkTime = 0;
            blinkAnimator.update(1);

            // Should complete around 125ms
            const stateAt100 = blinkAnimator.update(100);
            const stateAt150 = blinkAnimator.update(50);

            expect(stateAt100.isBlinking).toBe(true);
            expect(stateAt150.isBlinking).toBe(false);
        });

        it('should calculate slower duration for resting emotion', () => {
            blinkAnimator.setEmotion('resting');
            // Base duration: 150ms, Speed: 0.7x
            // Expected: 150 / 0.7 ≈ 214ms

            blinkAnimator.nextBlinkTime = 0;
            blinkAnimator.update(1);

            // Should still be blinking at 150ms
            const stateAt150 = blinkAnimator.update(150);
            expect(stateAt150.isBlinking).toBe(true);

            // Should complete around 214ms
            const stateAt220 = blinkAnimator.update(70);
            expect(stateAt220.isBlinking).toBe(false);
        });
    });

    describe('Geometry Changes', () => {
        it('should update blink config when geometry changes', () => {
            const newConfig = {
                blink: {
                    type: 'facet-flash',
                    duration: 120,
                    scaleAxis: [0.8, 0.8, 0.8]
                }
            };

            blinkAnimator.setGeometry(newConfig);
            expect(blinkAnimator.blinkConfig).toEqual(newConfig.blink);
            expect(blinkAnimator.baseDuration).toBe(120);
        });
    });

    describe('State Reporting', () => {
        it('should report correct idle state', () => {
            const state = blinkAnimator.getState();
            expect(state).toHaveProperty('isBlinking');
            expect(state).toHaveProperty('nextBlinkTime');
            expect(state).toHaveProperty('enabled');
            expect(state).toHaveProperty('emotionBlinkRate');
            expect(state).toHaveProperty('emotionBlinkSpeed');
        });

        it('should report enabled state correctly', () => {
            let state = blinkAnimator.getState();
            expect(state.enabled).toBe(true);

            blinkAnimator.pause();
            state = blinkAnimator.getState();
            expect(state.enabled).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very short delta time', () => {
            blinkAnimator.nextBlinkTime = 0;
            const state = blinkAnimator.update(0.001);
            expect(state).toBeDefined();
        });

        it('should handle very long delta time', () => {
            // Long delta should complete blink but may start another
            blinkAnimator.nextBlinkTime = 0;
            blinkAnimator.update(1); // Start blink
            const state = blinkAnimator.update(10000); // Complete and wait
            expect(state).toBeDefined();
            // Blink should have completed (may or may not be blinking again)
            expect(state.scale).toBeDefined();
        });

        it('should handle missing emotion visual config', () => {
            blinkAnimator.setEmotion(null);
            expect(blinkAnimator.emotionBlinkRate).toBe(1.0);
            expect(blinkAnimator.emotionBlinkSpeed).toBe(1.0);
        });
    });
});
