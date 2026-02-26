import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AnimationLoopManager,
    AnimationPriority,
} from '../../../src/core/AnimationLoopManager.js';

describe('AnimationLoopManager', () => {
    let manager;

    // Mock browser APIs
    beforeEach(() => {
        manager = new AnimationLoopManager();

        // Mock requestAnimationFrame/cancelAnimationFrame
        vi.stubGlobal('requestAnimationFrame', vi.fn(cb => {
            return setTimeout(cb, 0);
        }));
        vi.stubGlobal('cancelAnimationFrame', vi.fn(id => {
            clearTimeout(id);
        }));
        vi.stubGlobal('performance', {
            now: vi.fn(() => Date.now()),
        });
    });

    afterEach(() => {
        manager.destroy();
        vi.unstubAllGlobals();
    });

    describe('register / unregister', () => {
        it('should register a callback and return an ID', () => {
            const id = manager.register(() => {});
            expect(typeof id).toBe('number');
            expect(id).toBeGreaterThan(0);
        });

        it('should throw for non-function callbacks', () => {
            expect(() => manager.register('not a function')).toThrow('Callback must be a function');
        });

        it('should unregister a callback by ID', () => {
            const id = manager.register(() => {});
            expect(manager.callbacks.size).toBe(1);
            manager.unregister(id);
            expect(manager.callbacks.size).toBe(0);
        });

        it('should accept priority parameter', () => {
            const id = manager.register(() => {}, AnimationPriority.CRITICAL);
            const cb = manager.callbacks.get(id);
            expect(cb.priority).toBe(AnimationPriority.CRITICAL);
        });

        it('should default to MEDIUM priority', () => {
            const id = manager.register(() => {});
            const cb = manager.callbacks.get(id);
            expect(cb.priority).toBe(AnimationPriority.MEDIUM);
        });

        it('should auto-start when first callback registers', () => {
            manager.register(() => {});
            expect(manager.isRunning).toBe(true);
        });

        it('should auto-stop when last callback unregisters', () => {
            const id = manager.register(() => {});
            manager.unregister(id);
            expect(manager.isRunning).toBe(false);
        });
    });

    describe('setEnabled', () => {
        it('should disable a callback', () => {
            const id = manager.register(() => {});
            manager.setEnabled(id, false);
            expect(manager.callbacks.get(id).enabled).toBe(false);
        });

        it('should re-enable a callback', () => {
            const id = manager.register(() => {});
            manager.setEnabled(id, false);
            manager.setEnabled(id, true);
            expect(manager.callbacks.get(id).enabled).toBe(true);
        });
    });

    describe('start / stop', () => {
        it('should start the loop', () => {
            manager.start();
            expect(manager.isRunning).toBe(true);
            expect(requestAnimationFrame).toHaveBeenCalled();
        });

        it('should not start twice', () => {
            manager.start();
            manager.start();
            // requestAnimationFrame called once on first start, possibly again from loop
            expect(manager.isRunning).toBe(true);
        });

        it('should stop the loop', () => {
            manager.start();
            manager.stop();
            expect(manager.isRunning).toBe(false);
        });
    });

    describe('setTargetFPS', () => {
        it('should clamp FPS between 15 and 120', () => {
            manager.setTargetFPS(5);
            expect(manager.targetFPS).toBe(15);

            manager.setTargetFPS(200);
            expect(manager.targetFPS).toBe(120);

            manager.setTargetFPS(60);
            expect(manager.targetFPS).toBe(60);
        });

        it('should update frame budget accordingly', () => {
            manager.setTargetFPS(30);
            expect(manager.frameBudget).toBeCloseTo(1000 / 30);
        });
    });

    describe('destroy', () => {
        it('should stop loop and clear callbacks', () => {
            manager.register(() => {});
            manager.register(() => {});
            manager.destroy();
            expect(manager.isRunning).toBe(false);
            expect(manager.callbacks.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return stats object', () => {
            manager.register(() => {}, AnimationPriority.CRITICAL);
            manager.register(() => {}, AnimationPriority.LOW);
            const stats = manager.getStats();
            expect(stats.callbackCount).toBe(2);
            expect(stats.fps).toBeDefined();
            expect(stats.frameCount).toBeDefined();
        });
    });

    describe('groupCallbacksByPriority', () => {
        it('should group callbacks correctly', () => {
            manager.register(() => {}, AnimationPriority.CRITICAL);
            manager.register(() => {}, AnimationPriority.CRITICAL);
            manager.register(() => {}, AnimationPriority.LOW);

            const groups = manager.groupCallbacksByPriority();
            expect(groups.get(AnimationPriority.CRITICAL)).toHaveLength(2);
            expect(groups.get(AnimationPriority.LOW)).toHaveLength(1);
        });
    });

    describe('shouldSkipPriority', () => {
        it('should never skip CRITICAL', () => {
            manager.fps = 10; // Very low FPS
            expect(manager.shouldSkipPriority(AnimationPriority.CRITICAL)).toBe(false);
        });

        it('should skip LOW priority when FPS < 30', () => {
            manager.fps = 20;
            expect(manager.shouldSkipPriority(AnimationPriority.LOW)).toBe(true);
        });

        it('should skip IDLE when FPS < 45', () => {
            manager.fps = 40;
            expect(manager.shouldSkipPriority(AnimationPriority.IDLE)).toBe(true);
        });
    });
});

describe('AnimationPriority', () => {
    it('should have priority levels in ascending order', () => {
        expect(AnimationPriority.CRITICAL).toBeLessThan(AnimationPriority.HIGH);
        expect(AnimationPriority.HIGH).toBeLessThan(AnimationPriority.MEDIUM);
        expect(AnimationPriority.MEDIUM).toBeLessThan(AnimationPriority.LOW);
        expect(AnimationPriority.LOW).toBeLessThan(AnimationPriority.IDLE);
    });
});
