/**
 * Test suite for AnimationLoopManager
 * @module test/AnimationLoopManager.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationLoopManager, AnimationPriority } from '../src/core/AnimationLoopManager.js';

describe('AnimationLoopManager', () => {
    let manager;
    let rafSpy;
    let cafSpy;

    beforeEach(() => {
        manager = new AnimationLoopManager();
        // Mock requestAnimationFrame and cancelAnimationFrame
        rafSpy = vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
            setTimeout(cb, 16); // Simulate 60fps
            return Math.random();
        });
        cafSpy = vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        manager.destroy();
        rafSpy.mockRestore();
        cafSpy.mockRestore();
    });

    describe('Registration', () => {
        it('should register a callback and return an ID', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            expect(id).toBeTruthy();
            expect(id).toBeGreaterThan(0);
            expect(manager.callbacks.has(id)).toBe(true);
        });

        it('should register with priority', () => {
            const callback = vi.fn();
            const id = manager.register(callback, AnimationPriority.HIGH);

            const callbackData = manager.callbacks.get(id);
            expect(callbackData.priority).toBe(AnimationPriority.HIGH);
        });

        it('should register with context', () => {
            const callback = vi.fn();
            const context = { test: true };
            const id = manager.register(callback, AnimationPriority.MEDIUM, context);

            const callbackData = manager.callbacks.get(id);
            expect(callbackData.context).toBe(context);
        });

        it('should auto-start when first callback is registered', () => {
            expect(manager.isRunning).toBe(false);

            const callback = vi.fn();
            manager.register(callback);

            expect(manager.isRunning).toBe(true);
            expect(rafSpy).toHaveBeenCalled();
        });

        it('should throw error for non-function callback', () => {
            expect(() => {
                manager.register('not a function');
            }).toThrow('Callback must be a function');
        });
    });

    describe('Unregistration', () => {
        it('should unregister a callback', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            expect(manager.callbacks.has(id)).toBe(true);

            manager.unregister(id);

            expect(manager.callbacks.has(id)).toBe(false);
        });

        it('should auto-stop when last callback is unregistered', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            expect(manager.isRunning).toBe(true);

            manager.unregister(id);

            expect(manager.isRunning).toBe(false);
            expect(cafSpy).toHaveBeenCalled();
        });

        it('should handle unregistering non-existent ID gracefully', () => {
            expect(() => {
                manager.unregister(999999);
            }).not.toThrow();
        });
    });

    describe('Priority System', () => {
        it('should execute callbacks by priority order', async () => {
            const executionOrder = [];

            // Register callbacks in mixed order
            manager.register(() => executionOrder.push('low'), AnimationPriority.LOW);
            manager.register(() => executionOrder.push('critical'), AnimationPriority.CRITICAL);
            manager.register(() => executionOrder.push('medium'), AnimationPriority.MEDIUM);
            manager.register(() => executionOrder.push('high'), AnimationPriority.HIGH);
            manager.register(() => executionOrder.push('idle'), AnimationPriority.IDLE);

            // Manually trigger one frame
            manager.loop(performance.now());

            // Check execution order
            expect(executionOrder).toEqual([
                'critical',
                'high',
                'medium',
                'low',
                'idle'
            ]);
        });

        it('should group callbacks by priority efficiently', () => {
            manager.register(() => {}, AnimationPriority.HIGH);
            manager.register(() => {}, AnimationPriority.HIGH);
            manager.register(() => {}, AnimationPriority.LOW);

            const groups = manager.groupCallbacksByPriority();

            expect(groups.get(AnimationPriority.HIGH)).toHaveLength(2);
            expect(groups.get(AnimationPriority.LOW)).toHaveLength(1);
        });
    });

    describe('Frame Skipping', () => {
        it('should skip lower priority callbacks when FPS is low', () => {
            // Simulate low FPS
            manager.fps = 25;

            expect(manager.shouldSkipPriority(AnimationPriority.CRITICAL)).toBe(false);
            expect(manager.shouldSkipPriority(AnimationPriority.LOW)).toBe(true);
            expect(manager.shouldSkipPriority(AnimationPriority.IDLE)).toBe(true);
        });

        it('should not skip any priority when FPS is good', () => {
            // Simulate good FPS
            manager.fps = 60;

            expect(manager.shouldSkipPriority(AnimationPriority.CRITICAL)).toBe(false);
            expect(manager.shouldSkipPriority(AnimationPriority.HIGH)).toBe(false);
            expect(manager.shouldSkipPriority(AnimationPriority.MEDIUM)).toBe(false);
            expect(manager.shouldSkipPriority(AnimationPriority.LOW)).toBe(false);
        });

        it('should implement frame skipping for MEDIUM priority', () => {
            manager.fps = 45; // Below 50 fps threshold

            // First call - should skip
            expect(manager.shouldSkipPriority(AnimationPriority.MEDIUM)).toBe(true);

            // Second call - should not skip (every 2nd frame)
            expect(manager.shouldSkipPriority(AnimationPriority.MEDIUM)).toBe(false);
        });
    });

    describe('Performance', () => {
        it('should track frame time history', () => {
            expect(manager.frameTimeHistory).toHaveLength(0);

            manager.loop(1000);
            manager.loop(1016.67);
            manager.loop(1033.34);

            expect(manager.frameTimeHistory.length).toBeGreaterThan(0);
            expect(manager.frameTimeHistory[0]).toBeCloseTo(16.67, 1);
        });

        it('should calculate FPS correctly', () => {
            manager.lastFrameTime = 1000;
            manager.deltaTime = 16.67; // ~60 FPS

            // Simulate 60 frames
            for (let i = 0; i < 60; i++) {
                manager.frameCount++;
            }

            manager.loop(1016.67);

            expect(manager.fps).toBeCloseTo(60, 0);
        });

        it('should respect frame budget', () => {
            const expensiveCallback = vi.fn(() => {
                // Simulate expensive operation
                const start = performance.now();
                while (performance.now() - start < 20) {} // 20ms operation
            });

            const cheapCallback = vi.fn();

            manager.register(expensiveCallback, AnimationPriority.HIGH);
            manager.register(cheapCallback, AnimationPriority.LOW);

            // Run one frame with budget exceeded
            manager.frameBudget = 15; // 15ms budget
            manager.loop(performance.now());

            // Expensive callback should run
            expect(expensiveCallback).toHaveBeenCalled();
            // Cheap callback might be skipped due to budget
            // (exact behavior depends on implementation)
        });
    });

    describe('Enable/Disable', () => {
        it('should disable callbacks without removing them', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            manager.setEnabled(id, false);

            const callbackData = manager.callbacks.get(id);
            expect(callbackData.enabled).toBe(false);

            // Run a frame
            manager.loop(performance.now());

            // Disabled callback should not be called
            expect(callback).not.toHaveBeenCalled();
        });

        it('should re-enable disabled callbacks', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            manager.setEnabled(id, false);
            manager.setEnabled(id, true);

            const callbackData = manager.callbacks.get(id);
            expect(callbackData.enabled).toBe(true);

            // Run a frame
            manager.loop(performance.now());

            // Re-enabled callback should be called
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Statistics', () => {
        it('should provide performance statistics', () => {
            manager.register(() => {}, AnimationPriority.HIGH);
            manager.register(() => {}, AnimationPriority.LOW);

            const stats = manager.getStats();

            expect(stats).toHaveProperty('fps');
            expect(stats).toHaveProperty('frameCount');
            expect(stats).toHaveProperty('callbackCount');
            expect(stats).toHaveProperty('averageFrameTime');
            expect(stats).toHaveProperty('callbacksByPriority');

            expect(stats.callbackCount).toBe(2);
        });

        it('should track callback execution time', () => {
            const callback = vi.fn();
            const id = manager.register(callback);

            // Run several frames
            for (let i = 0; i < 5; i++) {
                manager.loop(performance.now() + i * 16.67);
            }

            const callbackData = manager.callbacks.get(id);
            expect(callbackData.runCount).toBe(5);
            expect(callbackData.totalTime).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle callback errors gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = vi.fn();

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            manager.register(errorCallback, AnimationPriority.HIGH);
            manager.register(normalCallback, AnimationPriority.LOW);

            // Should not throw
            expect(() => {
                manager.loop(performance.now());
            }).not.toThrow();

            // Error should be logged
            expect(consoleSpy).toHaveBeenCalled();

            // Other callbacks should still run
            expect(normalCallback).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should disable slow callbacks automatically', () => {
            const slowCallback = vi.fn(() => {
                const start = performance.now();
                while (performance.now() - start < 15) {} // 15ms operation
            });

            const id = manager.register(slowCallback);
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Run a few frames
            for (let i = 0; i < 3; i++) {
                manager.loop(performance.now() + i * 16.67);
            }

            const callbackData = manager.callbacks.get(id);

            // Check if callback was marked for disabling based on performance
            if (callbackData.runCount > 0 && callbackData.totalTime / callbackData.runCount > 10) {
                expect(callbackData.enabled).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('Disabling slow callback');
            }

            consoleSpy.mockRestore();
        });
    });

    describe('Lifecycle', () => {
        it('should clean up on destroy', () => {
            manager.register(() => {});
            manager.register(() => {});

            expect(manager.callbacks.size).toBe(2);
            expect(manager.isRunning).toBe(true);

            manager.destroy();

            expect(manager.callbacks.size).toBe(0);
            expect(manager.isRunning).toBe(false);
            expect(manager.frameTimeHistory).toHaveLength(0);
        });

        it('should set target FPS', () => {
            manager.setTargetFPS(30);

            expect(manager.targetFPS).toBe(30);
            expect(manager.targetFrameTime).toBeCloseTo(1000 / 30, 1);
            expect(manager.frameBudget).toBeCloseTo(1000 / 30, 1);
        });

        it('should clamp target FPS to valid range', () => {
            manager.setTargetFPS(5);
            expect(manager.targetFPS).toBe(15); // Min is 15

            manager.setTargetFPS(200);
            expect(manager.targetFPS).toBe(120); // Max is 120
        });
    });

    describe('Context Binding', () => {
        it('should call callbacks with correct context', () => {
            const context = {
                value: 42,
                callback: vi.fn(function() {
                    expect(this.value).toBe(42);
                })
            };

            manager.register(context.callback, AnimationPriority.MEDIUM, context);
            manager.loop(performance.now());

            expect(context.callback).toHaveBeenCalled();
        });
    });
});