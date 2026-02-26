import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventManager } from '../../../../src/core/events/EventManager.js';

/**
 * Minimal EventTarget mock for Node.js testing
 */
function createMockTarget(name = 'MockTarget') {
    const listeners = new Map();
    return {
        addEventListener: vi.fn((type, handler) => {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(handler);
        }),
        removeEventListener: vi.fn((type, handler) => {
            if (listeners.has(type)) listeners.get(type).delete(handler);
        }),
        _emit(type, event) {
            if (listeners.has(type)) {
                for (const handler of listeners.get(type)) handler(event);
            }
        },
        constructor: { name },
    };
}

describe('EventManager', () => {
    let manager;
    let target;

    beforeEach(() => {
        manager = new EventManager();
        target = createMockTarget();
    });

    describe('addEventListener / removeEventListener', () => {
        it('should register a listener and return an ID', () => {
            const id = manager.addEventListener(target, 'click', () => {});
            expect(typeof id).toBe('string');
            expect(target.addEventListener).toHaveBeenCalledOnce();
        });

        it('should remove a listener by ID', () => {
            const id = manager.addEventListener(target, 'click', () => {});
            const removed = manager.removeEventListener(id);
            expect(removed).toBe(true);
            expect(target.removeEventListener).toHaveBeenCalledOnce();
        });

        it('should return false when removing non-existent ID', () => {
            expect(manager.removeEventListener('nonexistent')).toBe(false);
        });

        it('should track stats', () => {
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target, 'resize', () => {});
            const stats = manager.getStats();
            expect(stats.registered).toBe(2);
            expect(stats.active).toBe(2);
        });
    });

    describe('groups', () => {
        it('should assign listeners to default group', () => {
            manager.addEventListener(target, 'click', () => {});
            const stats = manager.getStats();
            expect(stats.groups).toBe(1);
        });

        it('should assign listeners to custom group', () => {
            manager.addEventListener(target, 'click', () => {}, {}, 'animations');
            manager.addEventListener(target, 'resize', () => {}, {}, 'resize');
            const stats = manager.getStats();
            expect(stats.groups).toBe(2);
        });

        it('should remove all listeners in a group', () => {
            manager.addEventListener(target, 'click', () => {}, {}, 'myGroup');
            manager.addEventListener(target, 'resize', () => {}, {}, 'myGroup');
            manager.addEventListener(target, 'scroll', () => {}, {}, 'other');

            const removed = manager.removeGroup('myGroup');
            expect(removed).toBe(2);
            expect(manager.getStats().active).toBe(1);
        });

        it('should return 0 for non-existent group', () => {
            expect(manager.removeGroup('nonexistent')).toBe(0);
        });
    });

    describe('removeAll', () => {
        it('should remove all listeners', () => {
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target, 'resize', () => {});
            manager.addEventListener(target, 'scroll', () => {});

            const removed = manager.removeAll();
            expect(removed).toBe(3);
            expect(manager.getStats().active).toBe(0);
        });
    });

    describe('removeAllForTarget', () => {
        it('should only remove listeners for specific target', () => {
            const target2 = createMockTarget('Target2');
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target2, 'click', () => {});

            const removed = manager.removeAllForTarget(target);
            expect(removed).toBe(1);
            expect(manager.getStats().active).toBe(1);
        });
    });

    describe('removeAllOfType', () => {
        it('should remove all listeners of a specific event type', () => {
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target, 'resize', () => {});

            const removed = manager.removeAllOfType('click');
            expect(removed).toBe(2);
            expect(manager.getStats().active).toBe(1);
        });
    });

    describe('once', () => {
        it('should fire handler only once then auto-remove', () => {
            const handler = vi.fn();
            manager.once(target, 'click', handler);

            // Simulate event
            target._emit('click', { type: 'click' });
            expect(handler).toHaveBeenCalledOnce();

            // Should have been auto-removed
            expect(manager.getStats().active).toBe(0);
        });
    });

    describe('createAutoRemove', () => {
        it('should return controller with remove method', () => {
            const controller = manager.createAutoRemove(target, 'click', () => {});
            expect(controller.id).toBeDefined();
            expect(typeof controller.remove).toBe('function');

            controller.remove();
            expect(manager.getStats().active).toBe(0);
        });
    });

    describe('destroy', () => {
        it('should remove all listeners and reset stats', () => {
            manager.addEventListener(target, 'click', () => {});
            manager.addEventListener(target, 'resize', () => {});

            manager.destroy();
            const stats = manager.getStats();
            expect(stats.active).toBe(0);
            expect(stats.registered).toBe(0);
            expect(stats.listeners).toBe(0);
        });
    });

    describe('analyzeLeaks', () => {
        it('should return leak analysis', () => {
            manager.addEventListener(target, 'click', () => {});
            const analysis = manager.analyzeLeaks();
            expect(analysis.totalListeners).toBe(1);
            expect(analysis.activeListeners).toBe(1);
            expect(analysis.potentialLeaks).toEqual([]);
        });
    });

    describe('getActiveListeners', () => {
        it('should return active listener info', () => {
            manager.addEventListener(target, 'click', () => {}, {}, 'myGroup');
            const active = manager.getActiveListeners();
            expect(active).toHaveLength(1);
            expect(active[0].eventType).toBe('click');
            expect(active[0].group).toBe('myGroup');
        });
    });
});
