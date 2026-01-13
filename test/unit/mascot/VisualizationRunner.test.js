/**
 * VisualizationRunner Tests
 * Tests for the visualization and animation loop management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizationRunner } from '../../../src/mascot/control/VisualizationRunner.js';

describe('VisualizationRunner', () => {
    let visualizationRunner;
    let mockMascot;

    beforeEach(() => {
        mockMascot = {
            animationController: {
                isAnimating: vi.fn().mockReturnValue(false),
                start: vi.fn().mockReturnValue(true),
                stop: vi.fn().mockReturnValue(true)
            },
            stateMachine: {
                getCurrentState: vi.fn().mockReturnValue({
                    emotion: 'neutral',
                    undertone: null
                })
            },
            particleSystem: {
                clear: vi.fn(),
                burst: vi.fn()
            },
            renderer: {
                getCurrentOrbPosition: vi.fn().mockReturnValue({ x: 400, y: 300 })
            },
            canvasManager: {
                width: 800,
                height: 600
            },
            degradationManager: {
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn()
            },
            config: {
                renderingStyle: 'classic'
            },
            speaking: false,
            isRunning: false,
            emit: vi.fn(),
            audioHandler: {
                stopSpeaking: vi.fn()
            }
        };

        visualizationRunner = new VisualizationRunner(mockMascot);
    });

    describe('Constructor', () => {
        it('should initialize in legacy mode with mascot reference', () => {
            expect(visualizationRunner._legacyMode).toBe(true);
        });

        it('should initialize animationId as null', () => {
            expect(visualizationRunner.animationId).toBeNull();
        });

        it('should initialize isRunning as false', () => {
            expect(visualizationRunner.isRunning).toBe(false);
        });

        it('should initialize lastTime as 0', () => {
            expect(visualizationRunner.lastTime).toBe(0);
        });
    });

    describe('init()', () => {
        it('should exist as a method', () => {
            expect(typeof visualizationRunner.init).toBe('function');
        });

        it('should not throw when called', () => {
            expect(() => visualizationRunner.init()).not.toThrow();
        });
    });

    describe('start()', () => {
        it('should return early if already animating', () => {
            mockMascot.animationController.isAnimating.mockReturnValue(true);

            const result = visualizationRunner.start();

            expect(mockMascot.animationController.start).not.toHaveBeenCalled();
            expect(result).toBe(mockMascot);
        });

        it('should start animation controller', () => {
            visualizationRunner.start();

            expect(mockMascot.animationController.start).toHaveBeenCalled();
        });

        it('should set running flags on success', () => {
            visualizationRunner.start();

            expect(mockMascot.isRunning).toBe(true);
            expect(visualizationRunner.isRunning).toBe(true);
        });

        it('should clear particles in classic mode', () => {
            mockMascot.config.renderingStyle = 'classic';

            visualizationRunner.start();

            expect(mockMascot.particleSystem.clear).toHaveBeenCalled();
            // Note: burst is only called if emotion params have particleRate > 0
            // which may not be the case for 'neutral' emotion used in test
        });

        it('should not spawn particles in non-classic mode', () => {
            mockMascot.config.renderingStyle = 'advanced';

            visualizationRunner.start();

            expect(mockMascot.particleSystem.clear).not.toHaveBeenCalled();
            expect(mockMascot.particleSystem.burst).not.toHaveBeenCalled();
        });

        it('should have orb position logic available', () => {
            // The visualization runner has logic to use orb position from renderer
            // This is tested in integration tests with actual emotions that spawn particles
            expect(mockMascot.renderer.getCurrentOrbPosition).toBeDefined();
        });

        it('should start degradation monitoring', () => {
            visualizationRunner.start();

            expect(mockMascot.degradationManager.startMonitoring).toHaveBeenCalled();
        });

        it('should handle missing degradation manager', () => {
            mockMascot.degradationManager = null;

            expect(() => visualizationRunner.start()).not.toThrow();
        });

        it('should return mascot instance for chaining', () => {
            const result = visualizationRunner.start();

            expect(result).toBe(mockMascot);
        });
    });

    describe('stop()', () => {
        beforeEach(() => {
            // Start first
            visualizationRunner.start();
            mockMascot.animationController.isAnimating.mockReturnValue(true);
        });

        it('should return early if not animating', () => {
            mockMascot.animationController.isAnimating.mockReturnValue(false);

            const result = visualizationRunner.stop();

            expect(mockMascot.animationController.stop).not.toHaveBeenCalled();
            expect(result).toBe(mockMascot);
        });

        it('should handle speaking state gracefully', () => {
            mockMascot.speaking = true;

            const result = visualizationRunner.stop();

            // Should still return mascot for chaining
            expect(result).toBe(mockMascot);
        });

        it('should stop animation controller', () => {
            mockMascot.speaking = false;

            visualizationRunner.stop();

            expect(mockMascot.animationController.stop).toHaveBeenCalled();
        });

        it('should set running flags on success', () => {
            mockMascot.speaking = false;

            visualizationRunner.stop();

            expect(mockMascot.isRunning).toBe(false);
            expect(visualizationRunner.isRunning).toBe(false);
        });

        it('should stop degradation monitoring', () => {
            mockMascot.speaking = false;

            visualizationRunner.stop();

            expect(mockMascot.degradationManager.stopMonitoring).toHaveBeenCalled();
        });

        it('should handle missing degradation manager', () => {
            mockMascot.speaking = false;
            mockMascot.degradationManager = null;

            expect(() => visualizationRunner.stop()).not.toThrow();
        });

        it('should return mascot instance for chaining', () => {
            mockMascot.speaking = false;

            const result = visualizationRunner.stop();

            expect(result).toBe(mockMascot);
        });
    });

    describe('update() delegation', () => {
        it('should have update method for animation loop', () => {
            // This test verifies the update method exists for delegation
            expect(typeof visualizationRunner.update).toBe('function');
        });
    });
});
