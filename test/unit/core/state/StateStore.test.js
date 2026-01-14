/**
 * StateStore Tests
 * Tests for the centralized state management system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateStore } from '../../../../src/core/state/StateStore.js';

describe('StateStore', () => {
    let store;

    beforeEach(() => {
        store = new StateStore({ count: 0, nested: { value: 'initial' } });
    });

    describe('Constructor', () => {
        it('should initialize with given state', () => {
            expect(store.getState('count')).toBe(0);
            expect(store.getState('nested.value')).toBe('initial');
        });

        it('should initialize with empty state if none provided', () => {
            const emptyStore = new StateStore();
            expect(emptyStore.getState()).toEqual({});
        });

        it('should deep clone initial state', () => {
            const initial = { obj: { a: 1 } };
            const newStore = new StateStore(initial);
            initial.obj.a = 999;

            expect(newStore.getState('obj.a')).toBe(1);
        });
    });

    describe('getState()', () => {
        it('should return full state when no path provided', () => {
            const state = store.getState();

            expect(state.count).toBe(0);
            expect(state.nested.value).toBe('initial');
        });

        it('should return nested value by path', () => {
            expect(store.getState('nested.value')).toBe('initial');
        });

        it('should return undefined for non-existent path', () => {
            expect(store.getState('nonexistent.path')).toBeUndefined();
        });

        it('should return cloned state (immutable)', () => {
            const state = store.getState();
            state.count = 999;

            expect(store.getState('count')).toBe(0);
        });
    });

    describe('setState()', () => {
        it('should update state with path and value', () => {
            store.setState('count', 5);

            expect(store.getState('count')).toBe(5);
        });

        it('should update state with object', () => {
            store.setState({ count: 10, newKey: 'value' });

            expect(store.getState('count')).toBe(10);
            expect(store.getState('newKey')).toBe('value');
        });

        it('should update nested values', () => {
            store.setState('nested.value', 'updated');

            expect(store.getState('nested.value')).toBe('updated');
        });

        it('should create nested path if not exists', () => {
            store.setState('deep.nested.path', 42);

            expect(store.getState('deep.nested.path')).toBe(42);
        });

        it('should return true on success', () => {
            expect(store.setState('count', 1)).toBe(true);
        });

        it('should track update stats', () => {
            store.setState('count', 1);
            store.setState('count', 2);

            expect(store.getStats().updates).toBe(2);
        });
    });

    describe('subscribe()', () => {
        it('should call subscriber on state change', () => {
            const callback = vi.fn();
            store.subscribe(callback);

            store.setState('count', 1);

            expect(callback).toHaveBeenCalled();
        });

        it('should pass state and updates to subscriber', () => {
            const callback = vi.fn();
            store.subscribe(callback);

            store.setState('count', 5);

            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ count: 5 }),
                { count: 5 }
            );
        });

        it('should filter by path when provided', () => {
            const callback = vi.fn();
            store.subscribe('nested', callback);

            store.setState('count', 1);
            expect(callback).not.toHaveBeenCalled();

            store.setState('nested.value', 'changed');
            expect(callback).toHaveBeenCalled();
        });

        it('should return unsubscribe function', () => {
            const callback = vi.fn();
            const unsubscribe = store.subscribe(callback);

            unsubscribe();
            store.setState('count', 1);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('addValidator()', () => {
        it('should validate updates', () => {
            store.addValidator('count', val => typeof val === 'number' && val >= 0);

            expect(store.setState('count', 5)).toBe(true);
            expect(store.setState('count', -1)).toBe(false);
            expect(store.getState('count')).toBe(5);
        });
    });

    describe('addMiddleware()', () => {
        it('should transform updates', () => {
            store.addMiddleware(updates => {
                if (updates.count !== undefined) {
                    updates.count = Math.abs(updates.count);
                }
                return updates;
            });

            store.setState('count', -10);

            expect(store.getState('count')).toBe(10);
        });

        it('should cancel update when returning null', () => {
            store.addMiddleware(() => null);

            expect(store.setState('count', 5)).toBe(false);
            expect(store.getState('count')).toBe(0);
        });
    });

    describe('reset()', () => {
        it('should reset to new initial state', () => {
            store.setState('count', 100);

            store.reset({ count: 0 });

            expect(store.getState('count')).toBe(0);
        });

        it('should clear history', () => {
            store.setState('count', 1);
            store.setState('count', 2);

            store.reset({});

            expect(store._history.length).toBe(0);
        });

        it('should notify subscribers of reset', () => {
            const callback = vi.fn();
            store.subscribe(callback);

            store.reset({});

            expect(callback).toHaveBeenCalledWith(
                expect.anything(),
                { '*': 'reset' }
            );
        });
    });

    describe('getDiff()', () => {
        it('should return changes between previous and current state', () => {
            store.setState('count', 5);

            const diff = store.getDiff();

            expect(diff.count.type).toBe('changed');
            expect(diff.count.oldValue).toBe(0);
            expect(diff.count.newValue).toBe(5);
        });

        it('should detect added keys', () => {
            store.setState('newKey', 'value');

            const diff = store.getDiff();

            expect(diff.newKey.type).toBe('added');
        });
    });

    describe('undo()', () => {
        it('should revert to previous state', () => {
            store.setState('count', 1);
            store.setState('count', 2);

            store.undo();

            expect(store.getState('count')).toBe(1);
        });

        it('should return false when no history', () => {
            expect(store.undo()).toBe(false);
        });

        it('should undo multiple steps', () => {
            store.setState('count', 1);
            store.setState('count', 2);
            store.setState('count', 3);

            store.undo(2);

            expect(store.getState('count')).toBe(1);
        });
    });

    describe('batch()', () => {
        it('should batch multiple updates', () => {
            const callback = vi.fn();
            store.subscribe(callback);

            store.batch(() => {
                store.setState('count', 1);
                store.setState('nested.value', 'batched');
            });

            // Should only notify once for all updates
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should apply all updates atomically', () => {
            store.batch(() => {
                store.setState('count', 10);
                store.setState('newKey', 'value');
            });

            expect(store.getState('count')).toBe(10);
            expect(store.getState('newKey')).toBe('value');
        });
    });

    describe('computed()', () => {
        it('should create computed property', () => {
            store.computed('doubled', ['count'], count => count * 2);

            expect(store.doubled).toBe(0);

            store.setState('count', 5);
            expect(store.doubled).toBe(10);
        });

        it('should cache computed value', () => {
            const computeFn = vi.fn(count => count * 2);
            store.computed('doubled', ['count'], computeFn);

            store.doubled;
            store.doubled;
            store.doubled;

            // Should only compute once (cached)
            expect(computeFn).toHaveBeenCalledTimes(1);
        });

        it('should invalidate cache on dependency change', () => {
            const computeFn = vi.fn(count => count * 2);
            store.computed('doubled', ['count'], computeFn);

            store.doubled; // First compute
            store.setState('count', 5);
            store.doubled; // Should recompute

            expect(computeFn).toHaveBeenCalledTimes(2);
        });
    });

    describe('createSelector()', () => {
        it('should memoize selector result', () => {
            const selector = vi.fn(state => state.count * 2);
            const memoizedSelector = store.createSelector(selector);

            memoizedSelector();
            memoizedSelector();

            expect(selector).toHaveBeenCalledTimes(1);
        });

        it('should recompute when state changes', () => {
            const selector = vi.fn(state => state.count * 2);
            const memoizedSelector = store.createSelector(selector);

            expect(memoizedSelector()).toBe(0);

            store.setState('count', 5);
            expect(memoizedSelector()).toBe(10);
            expect(selector).toHaveBeenCalledTimes(2);
        });
    });

    describe('getStats()', () => {
        it('should return statistics', () => {
            store.setState('count', 1);
            store.subscribe(() => {});
            store.addValidator('x', () => true);

            const stats = store.getStats();

            expect(stats.updates).toBe(1);
            expect(stats.subscribers).toBe(1);
            expect(stats.validators).toBe(1);
            expect(stats.historySize).toBeGreaterThan(0);
        });
    });

    describe('deepClone()', () => {
        it('should clone primitives', () => {
            expect(store.deepClone(42)).toBe(42);
            expect(store.deepClone('test')).toBe('test');
            expect(store.deepClone(null)).toBeNull();
        });

        it('should clone dates', () => {
            const date = new Date('2024-01-01');
            const cloned = store.deepClone(date);

            expect(cloned.getTime()).toBe(date.getTime());
            expect(cloned).not.toBe(date);
        });

        it('should clone arrays', () => {
            const arr = [1, { a: 2 }];
            const cloned = store.deepClone(arr);

            expect(cloned).toEqual(arr);
            expect(cloned).not.toBe(arr);
            expect(cloned[1]).not.toBe(arr[1]);
        });

        it('should clone nested objects', () => {
            const obj = { a: { b: { c: 1 } } };
            const cloned = store.deepClone(obj);

            expect(cloned).toEqual(obj);
            expect(cloned.a.b).not.toBe(obj.a.b);
        });
    });
});
