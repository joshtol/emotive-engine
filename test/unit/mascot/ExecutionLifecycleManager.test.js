/**
 * ExecutionLifecycleManager Tests
 * Tests for the execution lifecycle management module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionLifecycleManager } from '../../../src/mascot/control/ExecutionLifecycleManager.js';

describe('ExecutionLifecycleManager', () => {
    let lifecycleManager;
    let mockErrorBoundary;
    let mockAnimationController;
    let mockVisualizationRunner;
    let mockSoundSystem;
    let mockState;
    let mockEmit;
    let mockChainTarget;

    beforeEach(() => {
        mockErrorBoundary = {
            wrap: vi.fn((fn, _name, returnVal) => {
                return () => {
                    fn();
                    return returnVal;
                };
            })
        };

        mockAnimationController = {
            isAnimating: vi.fn().mockReturnValue(false),
            start: vi.fn(),
            stop: vi.fn()
        };

        mockVisualizationRunner = {
            start: vi.fn(),
            stop: vi.fn()
        };

        mockSoundSystem = {
            isAvailable: vi.fn().mockReturnValue(true),
            stopAmbientTone: vi.fn()
        };

        mockState = {
            isRunning: false
        };

        mockEmit = vi.fn();
        mockChainTarget = { name: 'chainTarget' };
    });

    function createManager(overrides = {}) {
        return new ExecutionLifecycleManager({
            errorBoundary: mockErrorBoundary,
            animationController: mockAnimationController,
            visualizationRunner: mockVisualizationRunner,
            soundSystem: mockSoundSystem,
            state: mockState,
            emit: mockEmit,
            chainTarget: mockChainTarget,
            ...overrides
        });
    }

    describe('Constructor', () => {
        it('should initialize with all dependencies', () => {
            lifecycleManager = createManager();

            expect(lifecycleManager.errorBoundary).toBe(mockErrorBoundary);
            expect(lifecycleManager.animationController).toBe(mockAnimationController);
            expect(lifecycleManager.visualizationRunner).toBe(mockVisualizationRunner);
            expect(lifecycleManager.soundSystem).toBe(mockSoundSystem);
        });

        it('should throw if errorBoundary is missing', () => {
            expect(() => {
                new ExecutionLifecycleManager({
                    animationController: mockAnimationController,
                    visualizationRunner: mockVisualizationRunner,
                    state: mockState,
                    emit: mockEmit
                });
            }).toThrow('ExecutionLifecycleManager: errorBoundary required');
        });

        it('should throw if animationController is missing', () => {
            expect(() => {
                new ExecutionLifecycleManager({
                    errorBoundary: mockErrorBoundary,
                    visualizationRunner: mockVisualizationRunner,
                    state: mockState,
                    emit: mockEmit
                });
            }).toThrow('ExecutionLifecycleManager: animationController required');
        });

        it('should throw if visualizationRunner is missing', () => {
            expect(() => {
                new ExecutionLifecycleManager({
                    errorBoundary: mockErrorBoundary,
                    animationController: mockAnimationController,
                    state: mockState,
                    emit: mockEmit
                });
            }).toThrow('ExecutionLifecycleManager: visualizationRunner required');
        });

        it('should throw if state is missing', () => {
            expect(() => {
                new ExecutionLifecycleManager({
                    errorBoundary: mockErrorBoundary,
                    animationController: mockAnimationController,
                    visualizationRunner: mockVisualizationRunner,
                    emit: mockEmit
                });
            }).toThrow('ExecutionLifecycleManager: state required');
        });

        it('should throw if emit is missing', () => {
            expect(() => {
                new ExecutionLifecycleManager({
                    errorBoundary: mockErrorBoundary,
                    animationController: mockAnimationController,
                    visualizationRunner: mockVisualizationRunner,
                    state: mockState
                });
            }).toThrow('ExecutionLifecycleManager: emit required');
        });

        it('should allow optional soundSystem', () => {
            lifecycleManager = new ExecutionLifecycleManager({
                errorBoundary: mockErrorBoundary,
                animationController: mockAnimationController,
                visualizationRunner: mockVisualizationRunner,
                state: mockState,
                emit: mockEmit
            });

            expect(lifecycleManager.soundSystem).toBe(null);
        });

        it('should use self as chainTarget if not provided', () => {
            lifecycleManager = new ExecutionLifecycleManager({
                errorBoundary: mockErrorBoundary,
                animationController: mockAnimationController,
                visualizationRunner: mockVisualizationRunner,
                state: mockState,
                emit: mockEmit
            });

            expect(lifecycleManager._chainTarget).toBe(lifecycleManager);
        });

        it('should use provided chainTarget', () => {
            lifecycleManager = createManager();

            expect(lifecycleManager._chainTarget).toBe(mockChainTarget);
        });
    });

    describe('start()', () => {
        it('should delegate to visualizationRunner.start()', () => {
            lifecycleManager = createManager();

            lifecycleManager.start();

            expect(mockVisualizationRunner.start).toHaveBeenCalled();
        });

        it('should wrap call with errorBoundary', () => {
            lifecycleManager = createManager();

            lifecycleManager.start();

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'start',
                mockChainTarget
            );
        });

        it('should return chainTarget for method chaining', () => {
            lifecycleManager = createManager();

            const result = lifecycleManager.start();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('stop()', () => {
        it('should delegate to visualizationRunner.stop()', () => {
            lifecycleManager = createManager();

            lifecycleManager.stop();

            expect(mockVisualizationRunner.stop).toHaveBeenCalled();
        });

        it('should wrap call with errorBoundary', () => {
            lifecycleManager = createManager();

            lifecycleManager.stop();

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'stop',
                mockChainTarget
            );
        });

        it('should return chainTarget for method chaining', () => {
            lifecycleManager = createManager();

            const result = lifecycleManager.stop();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('pause()', () => {
        it('should return early if not animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(false);
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockAnimationController.stop).not.toHaveBeenCalled();
            expect(mockEmit).not.toHaveBeenCalled();
        });

        it('should stop animation controller when animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockAnimationController.stop).toHaveBeenCalled();
        });

        it('should set state.isRunning to false', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            mockState.isRunning = true;
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockState.isRunning).toBe(false);
        });

        it('should stop ambient audio with quick fade', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockSoundSystem.stopAmbientTone).toHaveBeenCalledWith(200);
        });

        it('should skip audio if soundSystem not available', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            mockSoundSystem.isAvailable.mockReturnValue(false);
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockSoundSystem.stopAmbientTone).not.toHaveBeenCalled();
        });

        it('should skip audio if no soundSystem', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = new ExecutionLifecycleManager({
                errorBoundary: mockErrorBoundary,
                animationController: mockAnimationController,
                visualizationRunner: mockVisualizationRunner,
                state: mockState,
                emit: mockEmit
            });

            expect(() => lifecycleManager.pause()).not.toThrow();
        });

        it('should emit paused event', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockEmit).toHaveBeenCalledWith('paused');
        });

        it('should wrap call with errorBoundary', () => {
            lifecycleManager = createManager();

            lifecycleManager.pause();

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'pause',
                mockChainTarget
            );
        });

        it('should return chainTarget for method chaining', () => {
            lifecycleManager = createManager();

            const result = lifecycleManager.pause();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('resume()', () => {
        it('should return early if already animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = createManager();

            lifecycleManager.resume();

            expect(mockAnimationController.start).not.toHaveBeenCalled();
            expect(mockEmit).not.toHaveBeenCalled();
        });

        it('should start animation controller when not animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(false);
            lifecycleManager = createManager();

            lifecycleManager.resume();

            expect(mockAnimationController.start).toHaveBeenCalled();
        });

        it('should set state.isRunning to true', () => {
            mockAnimationController.isAnimating.mockReturnValue(false);
            mockState.isRunning = false;
            lifecycleManager = createManager();

            lifecycleManager.resume();

            expect(mockState.isRunning).toBe(true);
        });

        it('should emit resumed event', () => {
            mockAnimationController.isAnimating.mockReturnValue(false);
            lifecycleManager = createManager();

            lifecycleManager.resume();

            expect(mockEmit).toHaveBeenCalledWith('resumed');
        });

        it('should wrap call with errorBoundary', () => {
            lifecycleManager = createManager();

            lifecycleManager.resume();

            expect(mockErrorBoundary.wrap).toHaveBeenCalledWith(
                expect.any(Function),
                'resume',
                mockChainTarget
            );
        });

        it('should return chainTarget for method chaining', () => {
            lifecycleManager = createManager();

            const result = lifecycleManager.resume();

            expect(result).toBe(mockChainTarget);
        });
    });

    describe('isActive()', () => {
        it('should return true when animation controller is animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager = createManager();

            expect(lifecycleManager.isActive()).toBe(true);
        });

        it('should return false when animation controller is not animating', () => {
            mockAnimationController.isAnimating.mockReturnValue(false);
            lifecycleManager = createManager();

            expect(lifecycleManager.isActive()).toBe(false);
        });

        it('should delegate to animationController.isAnimating()', () => {
            lifecycleManager = createManager();

            lifecycleManager.isActive();

            expect(mockAnimationController.isAnimating).toHaveBeenCalled();
        });
    });

    describe('Lifecycle Flow', () => {
        it('should support pause → resume cycle', () => {
            lifecycleManager = createManager();

            // Start as running
            mockAnimationController.isAnimating.mockReturnValue(true);
            lifecycleManager.pause();
            expect(mockState.isRunning).toBe(false);
            expect(mockEmit).toHaveBeenCalledWith('paused');

            mockEmit.mockClear();

            // Now not running
            mockAnimationController.isAnimating.mockReturnValue(false);
            lifecycleManager.resume();
            expect(mockState.isRunning).toBe(true);
            expect(mockEmit).toHaveBeenCalledWith('resumed');
        });
    });
});
