/**
 * StateCoordinator Tests
 * Tests for the emotion state management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateCoordinator } from '../../../src/mascot/state/StateCoordinator.js';

describe('StateCoordinator', () => {
    let stateCoordinator;
    let mockMascot;

    beforeEach(() => {
        // Create mock mascot with required properties
        mockMascot = {
            stateMachine: {
                setEmotion: vi.fn().mockReturnValue(true),
                getCurrentEmotionalProperties: vi.fn().mockReturnValue({
                    particleRate: 12,
                    particleBehavior: 'ambient'
                })
            },
            particleSystem: {
                clear: vi.fn(),
                burst: vi.fn()
            },
            canvasManager: {
                width: 800,
                height: 600
            },
            renderer: {
                setEmotionalState: vi.fn(),
                getEffectiveCenter: vi.fn().mockReturnValue({ x: 400, y: 300 })
            },
            soundSystem: {
                isAvailable: vi.fn().mockReturnValue(true),
                setAmbientTone: vi.fn()
            },
            config: {
                renderingStyle: 'classic'
            },
            emit: vi.fn()
        };

        stateCoordinator = new StateCoordinator(mockMascot);
    });

    describe('Constructor', () => {
        it('should initialize in legacy mode when passed mascot', () => {
            expect(stateCoordinator._legacyMode).toBe(true);
        });

        it('should initialize currentEmotion as neutral', () => {
            expect(stateCoordinator.currentEmotion).toBe('neutral');
        });

        it('should initialize emotionIntensity as 1.0', () => {
            expect(stateCoordinator.emotionIntensity).toBe(1.0);
        });
    });

    describe('init()', () => {
        it('should exist as a method', () => {
            expect(typeof stateCoordinator.init).toBe('function');
        });

        it('should not throw when called', () => {
            expect(() => stateCoordinator.init()).not.toThrow();
        });
    });

    describe('setEmotion()', () => {
        it('should map emotion aliases to actual emotions', () => {
            stateCoordinator.setEmotion('happy');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'joy',
                null,
                500
            );
        });

        it('should map "curious" to "surprise"', () => {
            stateCoordinator.setEmotion('curious');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'surprise',
                null,
                500
            );
        });

        it('should map "frustrated" to "anger"', () => {
            stateCoordinator.setEmotion('frustrated');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'anger',
                null,
                500
            );
        });

        it('should map "sad" to "sadness"', () => {
            stateCoordinator.setEmotion('sad');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'sadness',
                null,
                500
            );
        });

        it('should accept direct emotion names', () => {
            stateCoordinator.setEmotion('joy');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'joy',
                null,
                500
            );
        });

        it('should handle string undertone for backward compatibility', () => {
            stateCoordinator.setEmotion('joy', 'intense');

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'joy',
                'intense',
                500
            );
        });

        it('should handle object options with undertone', () => {
            stateCoordinator.setEmotion('joy', { undertone: 'subdued' });

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'joy',
                'subdued',
                500
            );
        });

        it('should handle custom duration in options', () => {
            stateCoordinator.setEmotion('joy', { undertone: 'clear', duration: 1000 });

            expect(mockMascot.stateMachine.setEmotion).toHaveBeenCalledWith(
                'joy',
                'clear',
                1000
            );
        });

        it('should clear particle system on emotion change', () => {
            stateCoordinator.setEmotion('joy');

            expect(mockMascot.particleSystem.clear).toHaveBeenCalled();
        });

        it('should spawn initial particles for new emotion', () => {
            stateCoordinator.setEmotion('joy');

            expect(mockMascot.particleSystem.burst).toHaveBeenCalled();
        });

        it('should spawn only 1 particle for neutral emotion', () => {
            stateCoordinator.setEmotion('neutral');

            expect(mockMascot.particleSystem.burst).toHaveBeenCalledWith(
                1,
                'ambient',
                400,
                300
            );
        });

        it('should spawn 4 particles for resting emotion', () => {
            stateCoordinator.setEmotion('resting');

            expect(mockMascot.particleSystem.burst).toHaveBeenCalledWith(
                4,
                'ambient',
                400,
                300
            );
        });

        it('should use effective center from renderer', () => {
            mockMascot.renderer.getEffectiveCenter.mockReturnValue({ x: 500, y: 400 });

            stateCoordinator.setEmotion('joy');

            expect(mockMascot.particleSystem.burst).toHaveBeenCalledWith(
                expect.any(Number),
                'ambient',
                500,
                400
            );
        });

        it('should fallback to canvas center if renderer unavailable', () => {
            delete mockMascot.renderer.getEffectiveCenter;

            stateCoordinator.setEmotion('joy');

            expect(mockMascot.particleSystem.burst).toHaveBeenCalledWith(
                expect.any(Number),
                'ambient',
                400,
                300
            );
        });

        it('should update renderer in classic rendering mode', () => {
            mockMascot.config.renderingStyle = 'classic';

            stateCoordinator.setEmotion('joy', { undertone: 'intense' });

            expect(mockMascot.renderer.setEmotionalState).toHaveBeenCalledWith(
                'joy',
                expect.any(Object),
                'intense'
            );
        });

        it('should not update renderer in non-classic mode', () => {
            mockMascot.config.renderingStyle = 'advanced';

            stateCoordinator.setEmotion('joy');

            expect(mockMascot.renderer.setEmotionalState).not.toHaveBeenCalled();
        });

        it('should emit emotionChanged event', () => {
            stateCoordinator.setEmotion('joy', { undertone: 'confident', duration: 750 });

            expect(mockMascot.emit).toHaveBeenCalledWith('emotionChanged', {
                emotion: 'joy',
                undertone: 'confident',
                duration: 750
            });
        });

        it('should update currentEmotion property', () => {
            stateCoordinator.setEmotion('anger');

            expect(stateCoordinator.currentEmotion).toBe('anger');
        });

        it('should return mascot instance for chaining', () => {
            const result = stateCoordinator.setEmotion('joy');

            expect(result).toBe(mockMascot);
        });

        it('should handle stateMachine.setEmotion failure gracefully', () => {
            mockMascot.stateMachine.setEmotion.mockReturnValue(false);

            const result = stateCoordinator.setEmotion('joy');

            expect(mockMascot.particleSystem.clear).not.toHaveBeenCalled();
            expect(result).toBe(mockMascot);
        });

        it('should handle missing particle system gracefully', () => {
            mockMascot.particleSystem = null;

            expect(() => stateCoordinator.setEmotion('joy')).not.toThrow();
        });

        it('should throw when renderer is null in classic mode (known bug)', () => {
            // TODO: Fix this bug - should check if renderer exists before accessing setEmotionalState
            stateCoordinator.renderer = null;

            expect(() => stateCoordinator.setEmotion('joy')).toThrow();
        });

        it('should handle missing renderer in non-classic mode', () => {
            stateCoordinator.config.renderingStyle = 'advanced';
            stateCoordinator.renderer = null;

            expect(() => stateCoordinator.setEmotion('joy')).not.toThrow();
        });
    });

    describe('destroy()', () => {
        it('should reset currentEmotion to neutral', () => {
            stateCoordinator.currentEmotion = 'joy';

            stateCoordinator.destroy();

            expect(stateCoordinator.currentEmotion).toBe('neutral');
        });

        it('should not throw when called', () => {
            expect(() => stateCoordinator.destroy()).not.toThrow();
        });
    });
});
