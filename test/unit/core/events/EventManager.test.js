/**
 * EventManager Tests
 * Tests for the centralized event listener management module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager } from '../../../../src/core/events/EventManager.js';

describe('EventManager', () => {
    let eventManager;
    let mockTarget;
    let mockHandler;

    beforeEach(() => {
        eventManager = new EventManager();
        mockTarget = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            constructor: { name: 'MockTarget' }
        };
        mockHandler = vi.fn();
    });

    afterEach(() => {
        eventManager.destroy();
    });

    describe('Constructor', () => {
        it('should initialize with empty listeners map', () => {
            expect(eventManager.listeners.size).toBe(0);
        });

        it('should initialize with empty groups map', () => {
            expect(eventManager.groups.size).toBe(0);
        });

        it('should initialize stats to zero', () => {
            expect(eventManager.stats).toEqual({
                registered: 0,
                removed: 0,
                active: 0
            });
        });
    });

    describe('addEventListener()', () => {
        it('should register a listener and return an ID', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
            expect(id.startsWith('listener_')).toBe(true);
        });

        it('should call target.addEventListener', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);

            expect(mockTarget.addEventListener).toHaveBeenCalledWith(
                'click',
                mockHandler,
                {}
            );
        });

        it('should pass options to addEventListener', () => {
            const options = { passive: true, capture: true };

            eventManager.addEventListener(mockTarget, 'scroll', mockHandler, options);

            expect(mockTarget.addEventListener).toHaveBeenCalledWith(
                'scroll',
                mockHandler,
                options
            );
        });

        it('should store listener info in listeners map', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            const info = eventManager.listeners.get(id);
            expect(info).toBeDefined();
            expect(info.target).toBe(mockTarget);
            expect(info.eventType).toBe('click');
            expect(info.handler).toBe(mockHandler);
            expect(info.active).toBe(true);
        });

        it('should use default group if not specified', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            const info = eventManager.listeners.get(id);
            expect(info.group).toBe('default');
            expect(eventManager.groups.has('default')).toBe(true);
        });

        it('should add listener to specified group', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler, {}, 'my-group');

            expect(eventManager.groups.has('my-group')).toBe(true);
            expect(eventManager.groups.get('my-group').has(id)).toBe(true);
        });

        it('should update stats on registration', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);

            expect(eventManager.stats.registered).toBe(1);
            expect(eventManager.stats.active).toBe(1);
        });

        it('should handle multiple listeners', () => {
            const id1 = eventManager.addEventListener(mockTarget, 'click', mockHandler);
            const id2 = eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);

            expect(id1).not.toBe(id2);
            expect(eventManager.listeners.size).toBe(2);
            expect(eventManager.stats.active).toBe(2);
        });
    });

    describe('removeEventListener()', () => {
        it('should remove a registered listener', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            const result = eventManager.removeEventListener(id);

            expect(result).toBe(true);
            expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
                'click',
                mockHandler,
                {}
            );
        });

        it('should remove listener from listeners map', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            eventManager.removeEventListener(id);

            expect(eventManager.listeners.has(id)).toBe(false);
        });

        it('should remove listener from its group', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler, {}, 'test-group');

            eventManager.removeEventListener(id);

            // Group should be deleted when empty
            expect(eventManager.groups.has('test-group')).toBe(false);
        });

        it('should update stats on removal', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            eventManager.removeEventListener(id);

            expect(eventManager.stats.removed).toBe(1);
            expect(eventManager.stats.active).toBe(0);
        });

        it('should return false for non-existent ID', () => {
            const result = eventManager.removeEventListener('non-existent-id');

            expect(result).toBe(false);
        });

        it('should return false for already removed listener', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.removeEventListener(id);

            const result = eventManager.removeEventListener(id);

            expect(result).toBe(false);
        });
    });

    describe('removeGroup()', () => {
        it('should remove all listeners in a group', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler, {}, 'my-group');
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler, {}, 'my-group');
            eventManager.addEventListener(mockTarget, 'keydown', mockHandler, {}, 'other-group');

            const removed = eventManager.removeGroup('my-group');

            expect(removed).toBe(2);
            expect(eventManager.groups.has('my-group')).toBe(false);
            expect(eventManager.groups.has('other-group')).toBe(true);
        });

        it('should return 0 for non-existent group', () => {
            const removed = eventManager.removeGroup('non-existent');

            expect(removed).toBe(0);
        });
    });

    describe('removeAllForTarget()', () => {
        it('should remove all listeners for a specific target', () => {
            const target2 = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                constructor: { name: 'Target2' }
            };

            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);
            eventManager.addEventListener(target2, 'click', mockHandler);

            const removed = eventManager.removeAllForTarget(mockTarget);

            expect(removed).toBe(2);
            expect(eventManager.stats.active).toBe(1);
        });

        it('should return 0 if no listeners for target', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);

            const otherTarget = { constructor: { name: 'Other' } };
            const removed = eventManager.removeAllForTarget(otherTarget);

            expect(removed).toBe(0);
        });
    });

    describe('removeAllOfType()', () => {
        it('should remove all listeners of a specific event type', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'click', vi.fn());
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);

            const removed = eventManager.removeAllOfType('click');

            expect(removed).toBe(2);
            expect(eventManager.stats.active).toBe(1);
        });

        it('should return 0 if no listeners of that type', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);

            const removed = eventManager.removeAllOfType('keydown');

            expect(removed).toBe(0);
        });
    });

    describe('removeAll()', () => {
        it('should remove all listeners', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);
            eventManager.addEventListener(mockTarget, 'keydown', mockHandler);

            const removed = eventManager.removeAll();

            expect(removed).toBe(3);
            expect(eventManager.stats.active).toBe(0);
        });

        it('should return 0 if no listeners', () => {
            const removed = eventManager.removeAll();

            expect(removed).toBe(0);
        });
    });

    describe('createAutoRemove()', () => {
        it('should return controller with id and remove method', () => {
            const controller = eventManager.createAutoRemove(mockTarget, 'click', mockHandler);

            expect(controller.id).toBeDefined();
            expect(typeof controller.remove).toBe('function');
        });

        it('should allow removal via controller', () => {
            const controller = eventManager.createAutoRemove(mockTarget, 'click', mockHandler);

            controller.remove();

            expect(mockTarget.removeEventListener).toHaveBeenCalled();
            expect(eventManager.stats.active).toBe(0);
        });
    });

    describe('once()', () => {
        it('should register a one-time listener', () => {
            const id = eventManager.once(mockTarget, 'click', mockHandler);

            expect(id).toBeDefined();
            expect(eventManager.listeners.has(id)).toBe(true);
        });

        it('should auto-remove after handler is called', () => {
            const id = eventManager.once(mockTarget, 'click', mockHandler);

            // Get the wrapped handler that was registered
            const registeredHandler = mockTarget.addEventListener.mock.calls[0][1];

            // Simulate event firing
            registeredHandler({ type: 'click' });

            expect(mockHandler).toHaveBeenCalled();
            expect(eventManager.listeners.has(id)).toBe(false);
        });
    });

    describe('debounced()', () => {
        it('should register a debounced listener', () => {
            vi.useFakeTimers();

            const id = eventManager.debounced(mockTarget, 'scroll', mockHandler, 100);

            expect(id).toBeDefined();
            expect(eventManager.listeners.has(id)).toBe(true);

            vi.useRealTimers();
        });

        it('should debounce handler calls', () => {
            vi.useFakeTimers();

            eventManager.debounced(mockTarget, 'scroll', mockHandler, 100);

            const registeredHandler = mockTarget.addEventListener.mock.calls[0][1];

            // Fire multiple events rapidly
            registeredHandler({ type: 'scroll' });
            registeredHandler({ type: 'scroll' });
            registeredHandler({ type: 'scroll' });

            // Handler shouldn't be called yet
            expect(mockHandler).not.toHaveBeenCalled();

            // Fast forward past debounce delay
            vi.advanceTimersByTime(100);

            // Now handler should be called once
            expect(mockHandler).toHaveBeenCalledTimes(1);

            vi.useRealTimers();
        });
    });

    describe('throttled()', () => {
        it('should register a throttled listener', () => {
            const id = eventManager.throttled(mockTarget, 'mousemove', mockHandler, 100);

            expect(id).toBeDefined();
            expect(eventManager.listeners.has(id)).toBe(true);
        });

        it('should throttle handler calls', () => {
            vi.useFakeTimers();

            eventManager.throttled(mockTarget, 'mousemove', mockHandler, 100);

            const registeredHandler = mockTarget.addEventListener.mock.calls[0][1];

            // First call should go through immediately
            registeredHandler({ type: 'mousemove' });
            expect(mockHandler).toHaveBeenCalledTimes(1);

            // Subsequent calls within throttle window should be ignored
            registeredHandler({ type: 'mousemove' });
            registeredHandler({ type: 'mousemove' });
            expect(mockHandler).toHaveBeenCalledTimes(1);

            // After throttle period, next call should go through
            vi.advanceTimersByTime(100);
            registeredHandler({ type: 'mousemove' });
            expect(mockHandler).toHaveBeenCalledTimes(2);

            vi.useRealTimers();
        });
    });

    describe('getStats()', () => {
        it('should return current statistics', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler, {}, 'group2');

            const stats = eventManager.getStats();

            expect(stats.registered).toBe(2);
            expect(stats.active).toBe(2);
            expect(stats.removed).toBe(0);
            expect(stats.groups).toBe(2);
            expect(stats.listeners).toBe(2);
        });
    });

    describe('getActiveListeners()', () => {
        it('should return list of active listeners', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler, {}, 'group1');

            const active = eventManager.getActiveListeners();

            expect(active.length).toBe(1);
            expect(active[0].eventType).toBe('click');
            expect(active[0].group).toBe('group1');
            expect(active[0].target).toBe('MockTarget');
        });

        it('should not include removed listeners', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);
            eventManager.removeEventListener(id);

            const active = eventManager.getActiveListeners();

            expect(active.length).toBe(1);
            expect(active[0].eventType).toBe('mouseover');
        });
    });

    describe('analyzeLeaks()', () => {
        it('should return leak analysis', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'click', vi.fn());
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler);

            const analysis = eventManager.analyzeLeaks();

            expect(analysis.totalListeners).toBe(3);
            expect(analysis.activeListeners).toBe(3);
            expect(analysis.inactiveButNotRemoved).toBe(0);
            expect(analysis.byTarget.MockTarget).toBe(3);
            expect(analysis.byType.click).toBe(2);
            expect(analysis.byType.mouseover).toBe(1);
            expect(analysis.potentialLeaks).toEqual([]);
        });
    });

    describe('cleanup()', () => {
        it('should remove inactive listeners from map', () => {
            const id = eventManager.addEventListener(mockTarget, 'click', mockHandler);

            // Manually mark as inactive (simulating edge case)
            eventManager.listeners.get(id).active = false;

            const cleaned = eventManager.cleanup();

            expect(cleaned).toBe(1);
            expect(eventManager.listeners.has(id)).toBe(false);
        });
    });

    describe('destroy()', () => {
        it('should remove all listeners and reset state', () => {
            eventManager.addEventListener(mockTarget, 'click', mockHandler);
            eventManager.addEventListener(mockTarget, 'mouseover', mockHandler, {}, 'group2');

            const count = eventManager.destroy();

            expect(count).toBe(2);
            expect(eventManager.listeners.size).toBe(0);
            expect(eventManager.groups.size).toBe(0);
            expect(eventManager.stats).toEqual({
                registered: 0,
                removed: 0,
                active: 0
            });
        });
    });

    describe('generateId()', () => {
        it('should generate unique IDs', () => {
            const ids = new Set();

            for (let i = 0; i < 100; i++) {
                ids.add(eventManager.generateId());
            }

            expect(ids.size).toBe(100);
        });
    });
});
