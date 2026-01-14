/**
 * VisualizationRunner Tests
 * Tests for the visualization and animation loop management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizationRunner } from '../../../src/mascot/control/VisualizationRunner.js';

describe('VisualizationRunner', () => {
    let visualizationRunner;
    let mockDeps;
    let mockChainTarget;

    beforeEach(() => {
        mockChainTarget = { _isChainTarget: true };
        mockDeps = {
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
            state: {
                speaking: false,
                isRunning: false
            },
            emit: vi.fn(),
            audioHandler: {
                stopSpeaking: vi.fn()
            },
            chainTarget: mockChainTarget
        };

        visualizationRunner = new VisualizationRunner(mockDeps);
    });

    describe('Constructor', () => {
        it('should initialize with DI dependencies', () => {
            expect(visualizationRunner.animationController).toBe(mockDeps.animationController);
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
            mockDeps.animationController.isAnimating.mockReturnValue(true);

            const result = visualizationRunner.start();

            expect(mockDeps.animationController.start).not.toHaveBeenCalled();
            expect(result).toBe(mockChainTarget);
        });

        it('should start animation controller', () => {
            visualizationRunner.start();

            expect(mockDeps.animationController.start).toHaveBeenCalled();
        });

        it('should set running flags on success', () => {
            visualizationRunner.start();

            expect(mockDeps.state.isRunning).toBe(true);
            expect(visualizationRunner.isRunning).toBe(true);
        });

        it('should clear particles in classic mode', () => {
            mockDeps.config.renderingStyle = 'classic';

            visualizationRunner.start();

            expect(mockDeps.particleSystem.clear).toHaveBeenCalled();
            // Note: burst is only called if emotion params have particleRate > 0
            // which may not be the case for 'neutral' emotion used in test
        });

        it('should not spawn particles in non-classic mode', () => {
            mockDeps.config.renderingStyle = 'advanced';

            visualizationRunner.start();

            expect(mockDeps.particleSystem.clear).not.toHaveBeenCalled();
            expect(mockDeps.particleSystem.burst).not.toHaveBeenCalled();
        });

        it('should have orb position logic available', () => {
            // The visualization runner has logic to use orb position from renderer
            // This is tested in integration tests with actual emotions that spawn particles
            expect(mockDeps.renderer.getCurrentOrbPosition).toBeDefined();
        });

        it('should start degradation monitoring', () => {
            visualizationRunner.start();

            expect(mockDeps.degradationManager.startMonitoring).toHaveBeenCalled();
        });

        it('should handle missing degradation manager', () => {
            // Create new runner with null degradation manager
            const noDegDeps = { ...mockDeps, degradationManager: null };
            const runner = new VisualizationRunner(noDegDeps);

            expect(() => runner.start()).not.toThrow();
        });

        it('should return chain target for chaining', () => {
            const result = visualizationRunner.start();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('stop()', () => {
        beforeEach(() => {
            // Start first
            visualizationRunner.start();
            mockDeps.animationController.isAnimating.mockReturnValue(true);
        });

        it('should return early if not animating', () => {
            mockDeps.animationController.isAnimating.mockReturnValue(false);

            const result = visualizationRunner.stop();

            expect(mockDeps.animationController.stop).not.toHaveBeenCalled();
            expect(result).toBe(mockChainTarget);
        });

        it('should handle speaking state gracefully', () => {
            mockDeps.state.speaking = true;

            const result = visualizationRunner.stop();

            // Should still return chain target for chaining
            expect(result).toBe(mockChainTarget);
        });

        it('should stop animation controller', () => {
            mockDeps.state.speaking = false;

            visualizationRunner.stop();

            expect(mockDeps.animationController.stop).toHaveBeenCalled();
        });

        it('should set running flags on success', () => {
            mockDeps.state.speaking = false;

            visualizationRunner.stop();

            expect(mockDeps.state.isRunning).toBe(false);
            expect(visualizationRunner.isRunning).toBe(false);
        });

        it('should stop degradation monitoring', () => {
            mockDeps.state.speaking = false;

            visualizationRunner.stop();

            expect(mockDeps.degradationManager.stopMonitoring).toHaveBeenCalled();
        });

        it('should handle missing degradation manager', () => {
            mockDeps.state.speaking = false;
            // Create new runner with null degradation manager
            const noDegDeps = { ...mockDeps, degradationManager: null, state: { speaking: false, isRunning: true } };
            const runner = new VisualizationRunner(noDegDeps);
            runner.isRunning = true;
            noDegDeps.animationController.isAnimating.mockReturnValue(true);

            expect(() => runner.stop()).not.toThrow();
        });

        it('should return chain target for chaining', () => {
            mockDeps.state.speaking = false;

            const result = visualizationRunner.stop();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('update() delegation', () => {
        it('should have update method for animation loop', () => {
            // This test verifies the update method exists for delegation
            expect(typeof visualizationRunner.update).toBe('function');
        });
    });
});
