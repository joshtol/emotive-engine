/**
 * EventManager Test Suite
 * Tests for centralized event management with proper cleanup and memory leak prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EventManager from '../src/core/EventManager.js';

describe('EventManager', () => {
    let eventManager;
    let mockCallback;
    let mockCallback2;

    beforeEach(() => {
        eventManager = new EventManager({
            maxListeners: 10,
            enableDebugging: false,
            enableMonitoring: true
        });
        mockCallback = vi.fn();
        mockCallback2 = vi.fn();
    });

    afterEach(() => {
        if (eventManager && !eventManager.isDestroyed) {
            eventManager.destroy();
        }
    });

    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            const manager = new EventManager();
            expect(manager.maxListeners).toBe(100);
            expect(manager.enableDebugging).toBe(false);
            expect(manager.enableMonitoring).toBe(false);
            expect(manager.totalListenerCount).toBe(0);
            expect(manager.isDestroyed).toBe(false);
            manager.destroy();
        });

        it('should initialize with custom configuration', () => {
            const config = {
                maxListeners: 50,
                enableDebugging: true,
                enableMonitoring: true,
                memoryWarningThreshold: 25
            };
            const manager = new EventManager(config);
            expect(manager.maxListeners).toBe(50);
            expect(manager.enableDebugging).toBe(true);
            expect(manager.enableMonitoring).toBe(true);
            expect(manager.memoryWarningThreshold).toBe(25);
            manager.destroy();
        });
    });

    describe('Event Listener Management', () => {
        describe('on() method', () => {
            it('should add event listeners successfully', () => {
                const success = eventManager.on('test', mockCallback);
                expect(success).toBe(true);
                expect(eventManager.listenerCount('test')).toBe(1);
                expect(eventManager.totalListenerCount).toBe(1);
            });

            it('should add multiple listeners for the same event', () => {
                eventManager.on('test', mockCallback);
                eventManager.on('test', mockCallback2);
                expect(eventManager.listenerCount('test')).toBe(2);
                expect(eventManager.totalListenerCount).toBe(2);
            });

            it('should add listeners for different events', () => {
                eventManager.on('event1', mockCallback);
                eventManager.on('event2', mockCallback2);
                expect(eventManager.listenerCount('event1')).toBe(1);
                expect(eventManager.listenerCount('event2')).toBe(1);
                expect(eventManager.totalListenerCount).toBe(2);
            });

            it('should validate event name', () => {
                expect(eventManager.on('', mockCallback)).toBe(false);
                expect(eventManager.on('   ', mockCallback)).toBe(false);
                expect(eventManager.on(null, mockCallback)).toBe(false);
                expect(eventManager.on(123, mockCallback)).toBe(false);
            });

            it('should validate callback function', () => {
                expect(eventManager.on('test', null)).toBe(false);
                expect(eventManager.on('test', 'not a function')).toBe(false);
                expect(eventManager.on('test', 123)).toBe(false);
            });

            it('should allow monitoring event names for external use', () => {
                const monitoringEvents = ['listenerAdded', 'listenerRemoved', 'listenersCleared', 'listenerError', 'memoryWarning'];
                for (const event of monitoringEvents) {
                    expect(eventManager.on(event, mockCallback)).toBe(true);
                }
            });

            it('should enforce maximum listener limit', () => {
                // Add listeners up to the limit
                for (let i = 0; i < 10; i++) {
                    expect(eventManager.on(`event${i}`, mockCallback)).toBe(true);
                }
                
                // Next listener should be rejected
                expect(eventManager.on('overflow', mockCallback)).toBe(false);
                expect(eventManager.totalListenerCount).toBe(10);
            });

            it('should not add listeners to destroyed EventManager', () => {
                eventManager.destroy();
                expect(eventManager.on('test', mockCallback)).toBe(false);
            });
        });

        describe('off() method', () => {
            beforeEach(() => {
                eventManager.on('test', mockCallback);
                eventManager.on('test', mockCallback2);
            });

            it('should remove specific listener', () => {
                const success = eventManager.off('test', mockCallback);
                expect(success).toBe(true);
                expect(eventManager.listenerCount('test')).toBe(1);
                expect(eventManager.totalListenerCount).toBe(1);
            });

            it('should return false for non-existent event', () => {
                expect(eventManager.off('nonexistent', mockCallback)).toBe(false);
            });

            it('should return false for non-existent callback', () => {
                const otherCallback = vi.fn();
                expect(eventManager.off('test', otherCallback)).toBe(false);
            });

            it('should clean up empty event arrays', () => {
                eventManager.off('test', mockCallback);
                eventManager.off('test', mockCallback2);
                expect(eventManager.getEventNames()).not.toContain('test');
                expect(eventManager.totalListenerCount).toBe(0);
            });

            it('should not remove listeners from destroyed EventManager', () => {
                eventManager.destroy();
                expect(eventManager.off('test', mockCallback)).toBe(false);
            });
        });

        describe('once() method', () => {
            it('should add one-time listener', () => {
                const success = eventManager.once('test', mockCallback);
                expect(success).toBe(true);
                expect(eventManager.listenerCount('test')).toBe(1);
            });

            it('should remove listener after first execution', () => {
                eventManager.once('test', mockCallback);
                
                // First emit should trigger callback and remove listener
                eventManager.emit('test', 'data');
                expect(mockCallback).toHaveBeenCalledWith('data');
                expect(eventManager.listenerCount('test')).toBe(0);
                
                // Second emit should not trigger callback
                mockCallback.mockClear();
                eventManager.emit('test', 'data2');
                expect(mockCallback).not.toHaveBeenCalled();
            });

            it('should remove listener even if callback throws error', () => {
                const errorCallback = vi.fn(() => {
                    throw new Error('Test error');
                });
                
                eventManager.once('test', errorCallback);
                expect(eventManager.listenerCount('test')).toBe(1);
                
                // Emit should remove listener despite error
                eventManager.emit('test');
                expect(eventManager.listenerCount('test')).toBe(0);
            });

            it('should not add once listener to destroyed EventManager', () => {
                eventManager.destroy();
                expect(eventManager.once('test', mockCallback)).toBe(false);
            });
        });

        describe('emit() method', () => {
            beforeEach(() => {
                eventManager.on('test', mockCallback);
                eventManager.on('test', mockCallback2);
            });

            it('should emit events to all listeners', () => {
                const count = eventManager.emit('test', 'testData');
                expect(count).toBe(2);
                expect(mockCallback).toHaveBeenCalledWith('testData');
                expect(mockCallback2).toHaveBeenCalledWith('testData');
            });

            it('should return 0 for non-existent events', () => {
                const count = eventManager.emit('nonexistent');
                expect(count).toBe(0);
            });

            it('should handle listener errors gracefully', () => {
                const errorCallback = vi.fn(() => {
                    throw new Error('Test error');
                });
                eventManager.on('test', errorCallback);
                
                // Should still call other listeners despite error
                const count = eventManager.emit('test');
                expect(count).toBe(2); // mockCallback and mockCallback2 succeed
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback2).toHaveBeenCalled();
            });

            it('should not emit from destroyed EventManager', () => {
                eventManager.destroy();
                const count = eventManager.emit('test');
                expect(count).toBe(0);
            });

            it('should update event statistics', () => {
                eventManager.emit('test');
                const stats = eventManager.getEventStats();
                expect(stats.events.test.emitCount).toBe(1);
                expect(stats.events.test.lastEmit).toBeTypeOf('number');
            });
        });

        describe('removeAllListeners() method', () => {
            beforeEach(() => {
                eventManager.on('event1', mockCallback);
                eventManager.on('event1', mockCallback2);
                eventManager.on('event2', mockCallback);
            });

            it('should remove all listeners for specific event', () => {
                const count = eventManager.removeAllListeners('event1');
                expect(count).toBe(2);
                expect(eventManager.listenerCount('event1')).toBe(0);
                expect(eventManager.listenerCount('event2')).toBe(1);
                expect(eventManager.totalListenerCount).toBe(1);
            });

            it('should remove all listeners for all events', () => {
                const count = eventManager.removeAllListeners();
                expect(count).toBe(3);
                expect(eventManager.totalListenerCount).toBe(0);
                expect(eventManager.getEventNames()).toHaveLength(0);
            });

            it('should return 0 for non-existent event', () => {
                const count = eventManager.removeAllListeners('nonexistent');
                expect(count).toBe(0);
            });

            it('should not remove listeners from destroyed EventManager', () => {
                eventManager.destroy();
                const count = eventManager.removeAllListeners();
                expect(count).toBe(0);
            });
        });
    });

    describe('Event Validation and Limits', () => {
        it('should validate event names correctly', () => {
            const validation1 = eventManager.validateEvent('validEvent', mockCallback);
            expect(validation1.isValid).toBe(true);

            const validation2 = eventManager.validateEvent('', mockCallback);
            expect(validation2.isValid).toBe(false);
            expect(validation2.error).toContain('non-empty string');

            const validation3 = eventManager.validateEvent('listenerAdded', mockCallback);
            expect(validation3.isValid).toBe(true); // Monitoring events are now allowed
        });

        it('should track listener counts accurately', () => {
            expect(eventManager.listenerCount('nonexistent')).toBe(0);
            
            eventManager.on('test', mockCallback);
            expect(eventManager.listenerCount('test')).toBe(1);
            
            eventManager.on('test', mockCallback2);
            expect(eventManager.listenerCount('test')).toBe(2);
            
            eventManager.off('test', mockCallback);
            expect(eventManager.listenerCount('test')).toBe(1);
        });

        it('should return correct event names', () => {
            eventManager.on('event1', mockCallback);
            eventManager.on('event2', mockCallback);
            
            const names = eventManager.getEventNames();
            expect(names).toContain('event1');
            expect(names).toContain('event2');
            expect(names).toHaveLength(2);
        });
    });

    describe('Memory Management and Monitoring', () => {
        it('should track memory usage', () => {
            // Add listeners to trigger memory monitoring
            for (let i = 0; i < 5; i++) {
                eventManager.on(`event${i}`, mockCallback);
            }
            
            const stats = eventManager.getEventStats();
            expect(stats.totalListeners).toBe(5);
            expect(stats.totalEvents).toBe(5);
        });

        it('should detect potential memory leaks', () => {
            // Simulate rapid listener growth (20 listeners in 1 second = 20/sec > 10/sec threshold)
            const now = Date.now();
            for (let i = 0; i < 20; i++) {
                eventManager.listenerHistory.push({
                    timestamp: now - (20 - i) * 50, // 50ms intervals = 1 second total
                    count: i
                });
            }
            
            const leakCheck = eventManager.detectMemoryLeaks();
            expect(leakCheck.hasLeak).toBe(true);
            expect(leakCheck.reason).toContain('growth');
        });

        it('should provide comprehensive statistics', () => {
            eventManager.on('test', mockCallback);
            eventManager.emit('test');
            
            const stats = eventManager.getEventStats();
            expect(stats).toHaveProperty('totalListeners');
            expect(stats).toHaveProperty('totalEvents');
            expect(stats).toHaveProperty('events');
            expect(stats.events.test).toHaveProperty('emitCount');
            expect(stats.events.test).toHaveProperty('listenerCount');
        });
    });

    describe('Cleanup and Destruction', () => {
        it('should cleanup all resources', () => {
            eventManager.on('event1', mockCallback);
            eventManager.on('event2', mockCallback2);
            
            eventManager.cleanup();
            
            expect(eventManager.totalListenerCount).toBe(0);
            expect(eventManager.getEventNames()).toHaveLength(0);
            expect(eventManager.listenerHistory).toHaveLength(0);
        });

        it('should destroy EventManager properly', () => {
            eventManager.on('test', mockCallback);
            
            eventManager.destroy();
            
            expect(eventManager.isDestroyed).toBe(true);
            expect(eventManager.totalListenerCount).toBe(0);
            
            // Should not accept new operations
            expect(eventManager.on('new', mockCallback)).toBe(false);
            expect(eventManager.emit('test')).toBe(0);
        });

        it('should handle multiple destroy calls gracefully', () => {
            eventManager.destroy();
            expect(() => eventManager.destroy()).not.toThrow();
            expect(eventManager.isDestroyed).toBe(true);
        });
    });

    describe('Debugging and Monitoring', () => {
        it('should provide debug information', () => {
            eventManager.on('test', mockCallback);
            
            const debugInfo = eventManager.getDebugInfo();
            expect(debugInfo).toHaveProperty('isDestroyed');
            expect(debugInfo).toHaveProperty('totalListeners');
            expect(debugInfo).toHaveProperty('eventCount');
            expect(debugInfo).toHaveProperty('events');
            expect(debugInfo).toHaveProperty('stats');
            expect(debugInfo).toHaveProperty('memoryLeakCheck');
        });

        it('should handle internal event emission safely', () => {
            // Test that the EventManager can handle internal monitoring events
            const testManager = new EventManager({ enableDebugging: false });
            
            let addedCount = 0;
            let removedCount = 0;
            
            // Listen to internal monitoring events (these are allowed for external use)
            testManager.on('listenerAdded', () => addedCount++);
            testManager.on('listenerRemoved', () => removedCount++);
            
            // Add and remove a listener to trigger internal events
            const testCallback = () => {};
            testManager.on('userEvent', testCallback);
            testManager.off('userEvent', testCallback);
            
            // Wait for async internal events to be processed
            return new Promise(resolve => {
                setTimeout(() => {
                    // Internal events should have been emitted
                    expect(addedCount).toBeGreaterThan(0);
                    expect(removedCount).toBeGreaterThan(0);
                    testManager.destroy();
                    resolve();
                }, 10);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle callback errors without breaking event system', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const normalCallback = vi.fn();
            
            eventManager.on('test', errorCallback);
            eventManager.on('test', normalCallback);
            
            // Should not throw and should call normal callback
            expect(() => eventManager.emit('test')).not.toThrow();
            expect(normalCallback).toHaveBeenCalled();
        });

        it('should prevent operations on destroyed EventManager', () => {
            eventManager.destroy();
            
            expect(eventManager.on('test', mockCallback)).toBe(false);
            expect(eventManager.off('test', mockCallback)).toBe(false);
            expect(eventManager.once('test', mockCallback)).toBe(false);
            expect(eventManager.emit('test')).toBe(0);
            expect(eventManager.removeAllListeners()).toBe(0);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complex listener lifecycle', () => {
            // Add regular listener
            eventManager.on('test', mockCallback);
            
            // Add once listener
            eventManager.once('test', mockCallback2);
            
            // Emit event
            eventManager.emit('test', 'data');
            
            expect(mockCallback).toHaveBeenCalledWith('data');
            expect(mockCallback2).toHaveBeenCalledWith('data');
            expect(eventManager.listenerCount('test')).toBe(1); // Only regular listener remains
            
            // Emit again
            mockCallback.mockClear();
            mockCallback2.mockClear();
            eventManager.emit('test', 'data2');
            
            expect(mockCallback).toHaveBeenCalledWith('data2');
            expect(mockCallback2).not.toHaveBeenCalled(); // Once listener was removed
        });

        it('should handle rapid add/remove operations', () => {
            const callbacks = [];
            
            // Add many listeners
            for (let i = 0; i < 5; i++) {
                const callback = vi.fn();
                callbacks.push(callback);
                eventManager.on('test', callback);
            }
            
            expect(eventManager.listenerCount('test')).toBe(5);
            
            // Remove some listeners
            eventManager.off('test', callbacks[1]);
            eventManager.off('test', callbacks[3]);
            
            expect(eventManager.listenerCount('test')).toBe(3);
            
            // Emit and verify correct callbacks are called
            eventManager.emit('test');
            
            expect(callbacks[0]).toHaveBeenCalled();
            expect(callbacks[1]).not.toHaveBeenCalled();
            expect(callbacks[2]).toHaveBeenCalled();
            expect(callbacks[3]).not.toHaveBeenCalled();
            expect(callbacks[4]).toHaveBeenCalled();
        });
    });
});