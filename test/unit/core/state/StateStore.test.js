import { describe, it, expect, vi } from 'vitest';
import { StateStore } from '../../../../src/core/state/StateStore.js';

describe('StateStore', () => {
    describe('constructor', () => {
        it('should initialize with default empty state', () => {
            const store = new StateStore();
            expect(store.getState()).toEqual({});
        });

        it('should initialize with provided state', () => {
            const store = new StateStore({ count: 0, name: 'test' });
            expect(store.getState()).toEqual({ count: 0, name: 'test' });
        });

        it('should deep clone initial state', () => {
            const initial = { nested: { value: 1 } };
            const store = new StateStore(initial);
            initial.nested.value = 999;
            expect(store.getState().nested.value).toBe(1);
        });
    });

    describe('getState', () => {
        it('should return full state when no path given', () => {
            const store = new StateStore({ a: 1, b: 2 });
            expect(store.getState()).toEqual({ a: 1, b: 2 });
        });

        it('should return deep clone (mutations do not affect store)', () => {
            const store = new StateStore({ obj: { val: 1 } });
            const state = store.getState();
            state.obj.val = 999;
            expect(store.getState().obj.val).toBe(1);
        });

        it('should return nested value by dot path', () => {
            const store = new StateStore({ a: { b: { c: 42 } } });
            expect(store.getState('a.b.c')).toBe(42);
        });

        it('should return undefined for non-existent path', () => {
            const store = new StateStore({ a: 1 });
            expect(store.getState('b.c.d')).toBeUndefined();
        });
    });

    describe('setState', () => {
        it('should update state by path', () => {
            const store = new StateStore({ count: 0 });
            store.setState('count', 5);
            expect(store.getState('count')).toBe(5);
        });

        it('should update state with object', () => {
            const store = new StateStore({ a: 1, b: 2 });
            store.setState({ a: 10, b: 20 });
            expect(store.getState()).toEqual({ a: 10, b: 20 });
        });

        it('should update nested paths', () => {
            const store = new StateStore({ a: { b: 1 } });
            store.setState('a.b', 99);
            expect(store.getState('a.b')).toBe(99);
        });

        it('should return true on success', () => {
            const store = new StateStore({ x: 1 });
            expect(store.setState('x', 2)).toBe(true);
        });

        it('should track update count in stats', () => {
            const store = new StateStore({ x: 0 });
            store.setState('x', 1);
            store.setState('x', 2);
            expect(store.getStats().updates).toBe(2);
        });
    });

    describe('subscribe', () => {
        it('should notify on state change', () => {
            const store = new StateStore({ x: 0 });
            const callback = vi.fn();
            store.subscribe(callback);
            store.setState('x', 1);
            expect(callback).toHaveBeenCalledOnce();
        });

        it('should return unsubscribe function', () => {
            const store = new StateStore({ x: 0 });
            const callback = vi.fn();
            const unsub = store.subscribe(callback);
            unsub();
            store.setState('x', 1);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should notify path-specific subscribers', () => {
            const store = new StateStore({ a: 1, b: 2 });
            const callbackA = vi.fn();
            const callbackB = vi.fn();
            store.subscribe('a', callbackA);
            store.subscribe('b', callbackB);
            store.setState('a', 10);
            expect(callbackA).toHaveBeenCalledOnce();
            expect(callbackB).not.toHaveBeenCalled();
        });

        it('should pass state and updates to callback', () => {
            const store = new StateStore({ x: 0 });
            const callback = vi.fn();
            store.subscribe(callback);
            store.setState('x', 5);
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ x: 5 }),
                expect.objectContaining({ x: 5 })
            );
        });
    });

    describe('middleware', () => {
        it('should pass updates through middleware', () => {
            const store = new StateStore({ x: 0 });
            store.addMiddleware((updates) => {
                // Double all numeric values
                const modified = {};
                for (const [k, v] of Object.entries(updates)) {
                    modified[k] = typeof v === 'number' ? v * 2 : v;
                }
                return modified;
            });
            store.setState('x', 5);
            expect(store.getState('x')).toBe(10);
        });

        it('should allow middleware to cancel updates', () => {
            const store = new StateStore({ x: 0 });
            store.addMiddleware(() => null);
            const result = store.setState('x', 5);
            expect(result).toBe(false);
            expect(store.getState('x')).toBe(0);
        });
    });

    describe('validators', () => {
        it('should validate state updates', () => {
            const store = new StateStore({ count: 0 });
            store.addValidator('count', (v) => typeof v === 'number' && v >= 0);

            expect(store.setState('count', 5)).toBe(true);
            expect(store.getState('count')).toBe(5);

            expect(store.setState('count', -1)).toBe(false);
            expect(store.getState('count')).toBe(5); // unchanged
        });
    });

    describe('history and undo', () => {
        it('should record history', () => {
            const store = new StateStore({ x: 0 });
            store.setState('x', 1);
            store.setState('x', 2);
            expect(store.getStats().historySize).toBe(2);
        });

        it('should undo state changes', () => {
            const store = new StateStore({ x: 0 });
            store.setState('x', 1);
            store.setState('x', 2);
            store.setState('x', 3);
            store.undo(1);
            expect(store.getState('x')).toBe(2);
        });

        it('should return false when history is insufficient', () => {
            const store = new StateStore({ x: 0 });
            expect(store.undo(10)).toBe(false);
        });
    });

    describe('batch', () => {
        it('should apply all updates at once', () => {
            const store = new StateStore({ a: 0, b: 0 });
            const callback = vi.fn();
            store.subscribe(callback);

            store.batch(() => {
                store.setState('a', 1);
                store.setState('b', 2);
            });

            // Only one notification (the batched apply)
            expect(callback).toHaveBeenCalledOnce();
            expect(store.getState('a')).toBe(1);
            expect(store.getState('b')).toBe(2);
        });
    });

    describe('getDiff', () => {
        it('should detect changes', () => {
            const store = new StateStore({ x: 1, y: 2 });
            store.setState('x', 10);
            const diff = store.getDiff();
            expect(diff.x).toBeDefined();
            expect(diff.x.type).toBe('changed');
        });
    });

    describe('reset', () => {
        it('should reset to new initial state', () => {
            const store = new StateStore({ x: 1 });
            store.setState('x', 99);
            store.reset({ x: 0 });
            expect(store.getState('x')).toBe(0);
        });

        it('should clear history', () => {
            const store = new StateStore({ x: 0 });
            store.setState('x', 1);
            store.reset({});
            expect(store.getStats().historySize).toBe(0);
        });

        it('should notify subscribers', () => {
            const store = new StateStore({ x: 0 });
            const callback = vi.fn();
            store.subscribe(callback);
            store.reset({ x: 1 });
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('getStats', () => {
        it('should return stats object', () => {
            const store = new StateStore({});
            const stats = store.getStats();
            expect(stats).toHaveProperty('updates');
            expect(stats).toHaveProperty('notifications');
            expect(stats).toHaveProperty('subscribers');
            expect(stats).toHaveProperty('historySize');
        });
    });
});
