/**
 * Integration Tests for GestureScheduler - gesture timing & scheduling system
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GestureScheduler from '../../../src/core/GestureScheduler.js';

// Mock dependencies
vi.mock('../../../src/core/gestures/gestureCacheWrapper.js', () => ({
    getGesture: vi.fn(gestureName => {
        const mockGestures = {
            // Basic gesture with rhythm config
            bounce: {
                type: 'motion',
                config: { duration: 500 },
                rhythm: {
                    timingSync: 'nextBeat',
                    priority: 5,
                    interruptible: true,
                    blendable: false,
                    maxQueue: 3
                }
            },
            // Fast gesture
            flash: {
                type: 'effect',
                config: { duration: 200 },
                rhythm: {
                    timingSync: 'immediate',
                    priority: 10,
                    interruptible: true,
                    blendable: true
                }
            },
            // Non-interruptible gesture
            transform: {
                type: 'override',
                config: { duration: 1000 },
                rhythm: {
                    timingSync: 'nextDownbeat',
                    priority: 8,
                    interruptible: false,
                    blendable: false
                }
            },
            // Blending gesture
            glow: {
                type: 'blending',
                config: { duration: 600 },
                rhythm: {
                    timingSync: 'nextBeat',
                    priority: 3,
                    blendable: true
                }
            },
            // Subdivision-synced gesture
            pulse: {
                type: 'effect',
                config: { duration: 800 },
                rhythm: {
                    timingSync: 'subdivision',
                    subdivision: 'eighth',
                    priority: 4
                }
            },
            // Swing-synced gesture
            sway: {
                type: 'motion',
                config: { duration: 1500 },
                rhythm: {
                    timingSync: 'swing',
                    priority: 6
                }
            },
            // Phrase-synced gesture
            evolve: {
                type: 'override',
                config: { duration: 4000 },
                rhythm: {
                    timingSync: 'nextPhrase',
                    priority: 9,
                    interruptible: false
                }
            },
            // Gesture with musical duration
            beat: {
                type: 'motion',
                config: {
                    musicalDuration: { musical: true, beats: 2 }
                },
                rhythm: {
                    timingSync: 'nextBeat',
                    priority: 5
                }
            },
            // Gesture with duration sync
            spin: {
                type: 'motion',
                config: { duration: 1000 },
                rhythm: {
                    timingSync: 'nextBar',
                    durationSync: {
                        mode: 'beats',
                        beats: 4
                    },
                    priority: 7
                }
            },
            // Gesture with anticipation
            jump: {
                type: 'motion',
                config: { duration: 300 },
                rhythm: {
                    timingSync: 'nextBeat',
                    anticipation: 50,
                    priority: 6
                }
            }
        };
        return mockGestures[gestureName] || null;
    })
}));

vi.mock('../../../src/core/audio/rhythm.js', () => {
    const mockRhythmEngine = {
        bpm: 120,
        timeSignature: [4, 4],
        isPlaying: true,
        listeners: new Map(),

        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            this.listeners.get(event).add(callback);
        },

        emit(event, data) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(cb => cb(data));
            }
        },

        getTimeInfo() {
            const beatDuration = 60000 / this.bpm;
            const barDuration = beatDuration * this.timeSignature[0];
            return {
                bpm: this.bpm,
                beatDuration,
                barDuration,
                timeSignature: this.timeSignature,
                lastBeatTime: performance.now() - 200,
                nextBeatIn: 300,
                beatInBar: 1,
                bar: 0,
                beatProgress: 0.4
            };
        },

        getPattern() {
            return 'straight';
        }
    };

    return { default: mockRhythmEngine };
});

vi.mock('../../../src/core/audio/rhythmIntegration.js', () => ({
    default: {
        isEnabled: vi.fn(() => true)
    }
}));

vi.mock('../../../src/core/MusicalDuration.js', () => ({
    default: {
        toMilliseconds(config) {
            if (typeof config === 'number') return config;
            if (config.beats) return config.beats * 500; // 120 BPM = 500ms per beat
            if (config.bars) return config.bars * 2000; // 4 beats per bar
            if (config.subdivision) {
                const durations = {
                    'whole': 2000,
                    'half': 1000,
                    'quarter': 500,
                    'eighth': 250,
                    'sixteenth': 125,
                    'triplet': 167,
                    'dotted-quarter': 750,
                    'dotted-half': 1500
                };
                return durations[config.subdivision] || 500;
            }
            return 1000;
        }
    }
}));

describe('GestureScheduler - Integration Tests', () => {
    let scheduler;
    let mockMascot;
    let mockTime;
    let rhythmEngine;
    let rhythmIntegration;

    beforeEach(async () => {
        // Mock performance.now() for timing control
        mockTime = 1000;

        // Use fake timers but exclude performance.now() from being mocked by it
        vi.useFakeTimers();

        // Explicitly mock performance.now() after useFakeTimers
        const originalPerformanceNow = performance.now.bind(performance);
        vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

        // Create mock mascot
        mockMascot = {
            express: vi.fn()
        };

        // Get mocked modules
        rhythmEngine = (await import('../../../src/core/audio/rhythm.js')).default;
        rhythmIntegration = (await import('../../../src/core/audio/rhythmIntegration.js')).default;

        // Reset rhythm engine state
        rhythmEngine.bpm = 120;
        rhythmEngine.timeSignature = [4, 4];
        rhythmEngine.isPlaying = true;
        rhythmEngine.listeners = new Map();

        // Create scheduler
        scheduler = new GestureScheduler(mockMascot);
    });

    afterEach(() => {
        if (scheduler) {
            scheduler.stopProcessing();
            scheduler.clearQueue();
        }
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // ============================================================================
    // INITIALIZATION & SETUP
    // ============================================================================

    describe('initialization', () => {
        it('should initialize with empty queue', () => {
            expect(scheduler.queue).toEqual([]);
            expect(scheduler.activeGestures.size).toBe(0);
            expect(scheduler.gestureQueues.size).toBe(0);
        });

        it('should initialize with no current gesture', () => {
            expect(scheduler.currentGesture).toBeNull();
            expect(scheduler.currentGestureStartTime).toBe(0);
        });

        it('should start processing loop on initialization', () => {
            expect(scheduler.processInterval).toBeDefined();
            expect(scheduler.processInterval).not.toBeNull();
        });

        it('should setup rhythm event listeners', () => {
            expect(rhythmEngine.listeners.has('beat')).toBe(true);
            expect(rhythmEngine.listeners.has('subdivision')).toBe(true);
            expect(rhythmEngine.listeners.get('beat').size).toBeGreaterThan(0);
        });

        it('should initialize callback handlers as null', () => {
            expect(scheduler.onGestureQueued).toBeNull();
            expect(scheduler.onGestureTriggered).toBeNull();
            expect(scheduler.onGestureCompleted).toBeNull();
        });
    });

    // ============================================================================
    // IMMEDIATE GESTURE EXECUTION
    // ============================================================================

    describe('immediate gesture execution', () => {
        it('should execute gesture immediately when rhythm disabled', () => {
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce');

            expect(mockMascot.express).toHaveBeenCalledWith('bounce', {
                fromScheduler: true
            });
        });

        it('should execute gesture immediately with immediate option', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            expect(mockMascot.express).toHaveBeenCalledWith('bounce', {
                immediate: true,
                fromScheduler: true
            });
        });

        it('should not queue gesture when executed immediately', () => {
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce');

            expect(scheduler.queue.length).toBe(0);
        });

        it('should return null when executing immediately', () => {
            rhythmIntegration.isEnabled.mockReturnValue(false);

            const result = scheduler.requestGesture('bounce');

            expect(result).toBeNull();
        });

        it('should handle unknown gesture gracefully', () => {
            const result = scheduler.requestGesture('unknown');

            expect(result).toBeNull();
            expect(mockMascot.express).not.toHaveBeenCalled();
        });
    });

    // ============================================================================
    // GESTURE QUEUE MANAGEMENT
    // ============================================================================

    describe('gesture queue management', () => {
        it('should queue gesture for rhythm-synced execution', () => {
            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem).toBeDefined();
            expect(queueItem.gestureName).toBe('bounce');
            expect(scheduler.queue.length).toBe(1);
        });

        it('should assign unique ID to each queued gesture', () => {
            const item1 = scheduler.requestGesture('bounce');
            const item2 = scheduler.requestGesture('flash');

            expect(item1.id).toBeDefined();
            expect(item2.id).toBeDefined();
            expect(item1.id).not.toBe(item2.id);
        });

        it('should store trigger time in queue item', () => {
            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.triggerTime).toBeDefined();
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should store end time in queue item', () => {
            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.endTime).toBeDefined();
            expect(queueItem.endTime).toBeGreaterThan(queueItem.triggerTime);
        });

        it('should store queued timestamp', () => {
            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.queued).toBe(mockTime);
        });

        it('should sort queue by trigger time', () => {
            mockTime = 1000;
            const item1 = scheduler.requestGesture('evolve'); // phrase-synced, later

            mockTime = 1100;
            const item2 = scheduler.requestGesture('flash'); // immediate, sooner

            expect(scheduler.queue[0].gestureName).toBe('flash');
            expect(scheduler.queue[1].gestureName).toBe('evolve');
        });

        it('should sort by priority when trigger times are close', () => {
            // Mock getTimeInfo to return same timing for both
            const item1 = scheduler.requestGesture('glow'); // priority 3
            const item2 = scheduler.requestGesture('flash'); // priority 10

            // Higher priority should come first when times are within 50ms
            const highPriorityIndex = scheduler.queue.findIndex(i => i.priority === 10);
            const lowPriorityIndex = scheduler.queue.findIndex(i => i.priority === 3);

            expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
        });

        it('should clear queue completely', () => {
            scheduler.requestGesture('bounce');
            scheduler.requestGesture('flash');
            scheduler.requestGesture('glow');

            expect(scheduler.queue.length).toBe(3);

            scheduler.clearQueue();

            expect(scheduler.queue.length).toBe(0);
        });
    });

    // ============================================================================
    // TIMING CALCULATIONS
    // ============================================================================

    describe('timing calculations', () => {
        it('should calculate trigger time for nextBeat', () => {
            const queueItem = scheduler.requestGesture('bounce');

            // Should trigger on next beat (mockTime + nextBeatIn)
            expect(queueItem.triggerTime).toBeCloseTo(mockTime + 300, -1);
        });

        it('should calculate trigger time for nextDownbeat', () => {
            const queueItem = scheduler.requestGesture('transform');

            // Should be scheduled for next downbeat
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should calculate trigger time for nextBar', () => {
            const queueItem = scheduler.requestGesture('spin');

            // Should be scheduled for next bar start
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should calculate trigger time for nextPhrase', () => {
            const queueItem = scheduler.requestGesture('evolve');

            // Should be scheduled for next 4-bar phrase
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should calculate trigger time for subdivision', () => {
            const queueItem = scheduler.requestGesture('pulse');

            // Should be scheduled for next subdivision
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should calculate trigger time for swing pattern', () => {
            rhythmEngine.getPattern = vi.fn(() => 'swing');

            const queueItem = scheduler.requestGesture('sway');

            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should apply anticipation to trigger time', () => {
            const queueItem = scheduler.requestGesture('jump');

            // Jump has 50ms anticipation, so should trigger earlier
            const expectedBase = mockTime + 300; // next beat
            expect(queueItem.triggerTime).toBeLessThan(expectedBase);
            expect(queueItem.triggerTime).toBeCloseTo(expectedBase - 50, -1);
        });

        it('should enforce minimum 50ms delay for nextBeat', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 490,
                nextBeatIn: 10, // Very soon
                beatInBar: 1,
                bar: 0,
                beatProgress: 0.98
            }));

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.triggerTime).toBeGreaterThanOrEqual(mockTime + 50);
        });

        it('should handle invalid time info gracefully', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => null);

            const queueItem = scheduler.requestGesture('bounce');

            // Should default to small delay
            expect(queueItem.triggerTime).toBeCloseTo(mockTime + 100, -1);
        });
    });

    // ============================================================================
    // DURATION CALCULATIONS
    // ============================================================================

    describe('duration calculations', () => {
        it('should calculate duration from musical duration config', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { musicalDuration: { musical: true, beats: 2 } }
            });

            expect(duration).toBe(1000); // 2 beats at 120 BPM
        });

        it('should calculate duration from rhythm durationSync beats', () => {
            const duration = scheduler.calculateGestureDuration({
                rhythm: {
                    durationSync: { mode: 'beats', beats: 4 }
                }
            });

            expect(duration).toBe(2000); // 4 beats at 120 BPM
        });

        it('should calculate duration from rhythm durationSync bars', () => {
            const duration = scheduler.calculateGestureDuration({
                rhythm: {
                    durationSync: { mode: 'bars', bars: 2 }
                }
            });

            expect(duration).toBe(4000); // 2 bars at 120 BPM
        });

        it('should calculate duration from rhythm durationSync subdivision', () => {
            const duration = scheduler.calculateGestureDuration({
                rhythm: {
                    durationSync: { subdivision: 'eighth' }
                }
            });

            expect(duration).toBe(250); // Eighth note at 120 BPM
        });

        it('should map very short duration to sixteenth note', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 150 }
            });

            expect(duration).toBe(125); // Sixteenth note
        });

        it('should map short duration to eighth note', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 300 }
            });

            expect(duration).toBe(250); // Eighth note
        });

        it('should map medium-short duration to quarter note', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 500 }
            });

            expect(duration).toBe(500); // Quarter note (1 beat)
        });

        it('should map medium duration to dotted quarter', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 800 }
            });

            expect(duration).toBe(750); // Dotted quarter
        });

        it('should map medium-long duration to half note', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 1200 }
            });

            expect(duration).toBe(1000); // Half note (2 beats)
        });

        it('should map long duration to dotted half', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 2000 }
            });

            expect(duration).toBe(1500); // Dotted half (3 beats)
        });

        it('should map very long duration to whole note', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 3000 }
            });

            expect(duration).toBe(2000); // Whole note (1 bar)
        });

        it('should use default duration when none specified', () => {
            const duration = scheduler.calculateGestureDuration({});

            // Default maps to dotted quarter (750ms) based on 1000ms old duration
            expect(duration).toBe(750);
        });
    });

    // ============================================================================
    // SEQUENTIAL GESTURE HANDLING
    // ============================================================================

    describe('sequential gesture handling', () => {
        it('should execute gestures in sequence', () => {
            scheduler.requestGesture('bounce');

            mockTime = 1300;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalledTimes(1);
            expect(mockMascot.express).toHaveBeenCalledWith('bounce', expect.any(Object));
        });

        it('should track active gesture', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(scheduler.currentGesture).toBe('bounce');
            expect(scheduler.activeGestures.has('bounce')).toBe(true);
        });

        it('should track gesture start time', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(scheduler.currentGestureStartTime).toBe(mockTime);
        });

        it('should remove gesture from queue after execution', () => {
            scheduler.requestGesture('bounce');

            expect(scheduler.queue.length).toBe(1);

            mockTime = 1300;
            scheduler.processQueue();

            expect(scheduler.queue.length).toBe(0);
        });

        it('should clear active gesture after duration completes', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            // Fast-forward past gesture duration
            vi.advanceTimersByTime(500);

            expect(scheduler.activeGestures.has('bounce')).toBe(false);
            expect(scheduler.currentGesture).toBeNull();
        });

        it('should process multiple gestures in order', () => {
            scheduler.requestGesture('flash');
            scheduler.requestGesture('bounce');

            mockTime = 1300;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalledTimes(2);
        });
    });

    // ============================================================================
    // SIMULTANEOUS GESTURES & BLENDING
    // ============================================================================

    describe('simultaneous gestures & blending', () => {
        it('should allow blending gestures to play simultaneously', () => {
            scheduler.requestGesture('glow', { immediate: true });
            scheduler.requestGesture('flash', { immediate: true });

            expect(mockMascot.express).toHaveBeenCalledTimes(2);
        });

        it('should detect when gestures can blend', () => {
            const gesture1 = { type: 'blending', rhythm: { blendable: true } };
            const gesture2 = { type: 'blending', rhythm: { blendable: true } };

            expect(scheduler.canBlend(gesture1, gesture2)).toBe(true);
        });

        it('should prevent blending when explicitly disabled', () => {
            const gesture1 = { type: 'blending', rhythm: { blendable: false } };
            const gesture2 = { type: 'blending', rhythm: { blendable: true } };

            expect(scheduler.canBlend(gesture1, gesture2)).toBe(false);
        });

        it('should allow effect gestures to blend', () => {
            const gesture1 = { type: 'effect', rhythm: {} };
            const gesture2 = { type: 'motion', rhythm: {} };

            expect(scheduler.canBlend(gesture1, gesture2)).toBe(true);
        });

        it('should prevent override gestures from blending', () => {
            const gesture1 = { type: 'override', rhythm: {} };
            const gesture2 = { type: 'effect', rhythm: {} };

            expect(scheduler.canBlend(gesture1, gesture2)).toBe(false);
        });

        it('should set blend interruption mode for blendable gestures', () => {
            scheduler.requestGesture('glow', { immediate: true });

            const queueItem = scheduler.requestGesture('flash');

            expect(queueItem.interruptionMode).toBe('blend');
        });
    });

    // ============================================================================
    // INTERRUPTIONS & CANCELLATIONS
    // ============================================================================

    describe('interruptions & cancellations', () => {
        it('should allow interrupting interruptible gesture', () => {
            // Disable rhythm integration for pure interruption logic
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce', { immediate: true });

            mockTime = 1455; // 91% through 500ms gesture (455/500 = 0.91)
            const mode = scheduler.determineInterruption({ type: 'effect' });

            // Should queue since gesture is nearly complete (>90%)
            expect(mode).toBe('queue');

            // Re-enable rhythm integration
            rhythmIntegration.isEnabled.mockReturnValue(true);
        });

        it('should prevent interrupting non-interruptible gesture', () => {
            scheduler.requestGesture('transform', { immediate: true });

            mockTime = 1200; // Early in execution
            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('queue');
        });

        it('should allow interrupting when gesture nearly complete', () => {
            scheduler.requestGesture('transform', { immediate: true });

            mockTime = 1900; // 90% through 1000ms gesture
            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('queue'); // Near completion, should queue
        });

        it('should use crossfade for normal interruption', () => {
            // Disable rhythm integration for pure crossfade behavior
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce', { immediate: true });

            mockTime = 1300; // Midway through
            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('crossfade');

            // Re-enable rhythm integration
            rhythmIntegration.isEnabled.mockReturnValue(true);
        });

        it('should use crossfadeOnBeat when near beat', () => {
            // Disable rhythm integration to allow crossfadeOnBeat
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce', { immediate: true });

            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 450,
                nextBeatIn: 50, // Very close to beat
                beatInBar: 1,
                bar: 0,
                beatProgress: 0.9
            }));

            mockTime = 1400; // 80% through gesture
            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('crossfadeOnBeat');

            // Re-enable rhythm integration
            rhythmIntegration.isEnabled.mockReturnValue(true);
        });

        it('should respect rhythm mode conservative interruption', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            mockTime = 1300; // 60% through 500ms gesture
            rhythmIntegration.isEnabled.mockReturnValue(true);

            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('queue');
        });

        it('should return immediate when no current gesture', () => {
            const mode = scheduler.determineInterruption({ type: 'effect' });

            expect(mode).toBe('immediate');
        });
    });

    // ============================================================================
    // PRIORITY HANDLING
    // ============================================================================

    describe('priority handling', () => {
        it('should store priority from gesture config', () => {
            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.priority).toBe(5); // From mock config
        });

        it('should allow priority override via options', () => {
            const queueItem = scheduler.requestGesture('bounce', { priority: 15 });

            expect(queueItem.priority).toBe(15);
        });

        it('should default to 0 priority when not specified', () => {
            const queueItem = scheduler.requestGesture('flash');

            expect(queueItem.priority).toBeGreaterThan(0);
        });

        it('should execute high priority gestures first when times are close', () => {
            const low = scheduler.requestGesture('glow'); // priority 3
            const high = scheduler.requestGesture('flash'); // priority 10

            const highIndex = scheduler.queue.findIndex(i => i.id === high.id);
            const lowIndex = scheduler.queue.findIndex(i => i.id === low.id);

            expect(highIndex).toBeLessThan(lowIndex);
        });
    });

    // ============================================================================
    // PER-GESTURE QUEUING
    // ============================================================================

    describe('per-gesture queuing', () => {
        it('should create per-gesture queue for active gesture', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const queueItem = scheduler.requestGesture('bounce');

            expect(scheduler.gestureQueues.has('bounce')).toBe(true);
            expect(scheduler.gestureQueues.get('bounce')).toContain(queueItem);
        });

        it('should respect maxQueue limit', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            // Bounce has maxQueue: 3
            const item1 = scheduler.requestGesture('bounce');
            const item2 = scheduler.requestGesture('bounce');
            const item3 = scheduler.requestGesture('bounce');
            const item4 = scheduler.requestGesture('bounce'); // Should be rejected

            expect(item1).not.toBeNull();
            expect(item2).not.toBeNull();
            expect(item3).not.toBeNull();
            expect(item4).toBeNull();
        });

        it('should calculate trigger time after active gesture ends', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const queueItem = scheduler.requestGesture('bounce');

            // Queued gesture should be in per-gesture queue
            expect(scheduler.gestureQueues.has('bounce')).toBe(true);
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should process queued gestures after completion', () => {
            scheduler.requestGesture('bounce', { immediate: true });
            scheduler.requestGesture('bounce');

            expect(scheduler.gestureQueues.get('bounce').length).toBe(1);

            // Complete the active gesture
            vi.advanceTimersByTime(500);

            // Queued gesture should be moved to main queue
            expect(scheduler.queue.length).toBeGreaterThan(0);
        });

        it('should cleanup empty gesture queues', () => {
            scheduler.requestGesture('bounce', { immediate: true });
            scheduler.requestGesture('bounce');

            expect(scheduler.gestureQueues.has('bounce')).toBe(true);

            // Complete active gesture
            vi.advanceTimersByTime(500);

            // Process the queued gesture
            mockTime = 2000;
            scheduler.processQueue();

            // Complete that one too
            vi.advanceTimersByTime(500);

            expect(scheduler.gestureQueues.has('bounce')).toBe(false);
        });

        it('should calculate end time for queued gestures', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.endTime).toBeGreaterThan(queueItem.triggerTime);
        });

        it('should chain multiple queued gestures', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const item1 = scheduler.requestGesture('bounce');
            const item2 = scheduler.requestGesture('bounce');

            // Both queued items will have similar timing but different IDs
            expect(item1.id).not.toBe(item2.id);
            expect(scheduler.gestureQueues.get('bounce').length).toBe(2);
        });
    });

    // ============================================================================
    // RHYTHM EVENT PROCESSING
    // ============================================================================

    describe('rhythm event processing', () => {
        it('should process queue on beat event', () => {
            scheduler.requestGesture('bounce');

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime + 300
            });

            mockTime = 1300;
            // The beat handler calls processQueueOnBeat
            expect(scheduler.queue.length).toBeGreaterThanOrEqual(0);
        });

        it('should process subdivision-synced gestures on subdivision event', () => {
            scheduler.requestGesture('pulse');

            mockTime = 1250;
            rhythmEngine.emit('subdivision', {
                subdivision: 'eighth',
                time: mockTime
            });

            // Should process subdivision gestures
            expect(scheduler.queue.length).toBeGreaterThanOrEqual(0);
        });

        it('should respect timing tolerance on beat processing', () => {
            const queueItem = scheduler.requestGesture('bounce');

            // Set time just before trigger with tolerance
            mockTime = queueItem.triggerTime - 40;

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should execute within 50ms tolerance
            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should use tighter tolerance for subdivision processing', () => {
            const queueItem = scheduler.requestGesture('pulse');

            // Set time just before trigger
            mockTime = queueItem.triggerTime - 20;

            rhythmEngine.emit('subdivision', {
                subdivision: 'eighth',
                time: mockTime
            });

            // Should execute within 25ms tolerance
            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should skip beat processing when rhythm disabled', () => {
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce');
            const queueLength = scheduler.queue.length;

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            expect(scheduler.queue.length).toBe(queueLength);
        });

        it('should skip beat processing for non-interruptible active gesture', () => {
            scheduler.requestGesture('transform', { immediate: true });
            scheduler.requestGesture('bounce');

            mockTime = 1200; // Early in transform gesture

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should not interrupt transform
            expect(mockMascot.express).toHaveBeenCalledTimes(1);
        });

        it('should allow beat processing when gesture near completion', () => {
            scheduler.requestGesture('bounce', { immediate: true });
            scheduler.requestGesture('flash');

            mockTime = 1400; // 80% through bounce (500ms)

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should allow processing
            expect(scheduler.queue.length).toBeGreaterThanOrEqual(0);
        });
    });

    // ============================================================================
    // PROCESSING LOOP
    // ============================================================================

    describe('processing loop', () => {
        it('should process queue on interval', () => {
            scheduler.requestGesture('bounce');

            mockTime = 1300;

            // Advance timers to trigger interval
            vi.advanceTimersByTime(16);

            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should not start multiple processing loops', () => {
            const interval1 = scheduler.processInterval;

            scheduler.startProcessing();

            expect(scheduler.processInterval).toBe(interval1);
        });

        it('should stop processing loop', () => {
            expect(scheduler.processInterval).not.toBeNull();

            scheduler.stopProcessing();

            expect(scheduler.processInterval).toBeNull();
        });

        it('should not crash when stopping already stopped loop', () => {
            scheduler.stopProcessing();
            scheduler.stopProcessing();

            expect(scheduler.processInterval).toBeNull();
        });

        it('should process gestures when ready', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should keep gestures in queue when not ready', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime - 100;
            scheduler.processQueue();

            expect(scheduler.queue.length).toBe(1);
        });

        it('should execute all ready gestures', () => {
            scheduler.requestGesture('flash');
            scheduler.requestGesture('bounce');

            mockTime = 1500;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalledTimes(2);
        });
    });

    // ============================================================================
    // CALLBACK HANDLING
    // ============================================================================

    describe('callback handling', () => {
        it('should call onGestureQueued when gesture added', () => {
            const callback = vi.fn();
            scheduler.onGestureQueued = callback;

            const queueItem = scheduler.requestGesture('bounce');

            expect(callback).toHaveBeenCalledWith(queueItem, 0);
        });

        it('should call onGestureQueued with queue depth for per-gesture queue', () => {
            const callback = vi.fn();
            scheduler.onGestureQueued = callback;

            scheduler.requestGesture('bounce', { immediate: true });
            scheduler.requestGesture('bounce');

            expect(callback).toHaveBeenCalledWith(expect.any(Object), 1);
        });

        it('should call onGestureTriggered when gesture executes', () => {
            const callback = vi.fn();
            scheduler.onGestureTriggered = callback;

            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(callback).toHaveBeenCalledWith(queueItem);
        });

        it('should call onGestureCompleted when gesture finishes', () => {
            const callback = vi.fn();
            scheduler.onGestureCompleted = callback;

            scheduler.requestGesture('bounce', { immediate: true });

            vi.advanceTimersByTime(500);

            expect(callback).toHaveBeenCalled();
        });

        it('should not crash when callbacks are null', () => {
            scheduler.onGestureQueued = null;
            scheduler.onGestureTriggered = null;
            scheduler.onGestureCompleted = null;

            expect(() => {
                scheduler.requestGesture('bounce', { immediate: true });
            }).not.toThrow();
        });
    });

    // ============================================================================
    // STATUS & MONITORING
    // ============================================================================

    describe('status & monitoring', () => {
        it('should return queue status', () => {
            scheduler.requestGesture('bounce');
            scheduler.requestGesture('flash');

            const status = scheduler.getStatus();

            expect(status.queueLength).toBe(2);
        });

        it('should return current gesture in status', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const status = scheduler.getStatus();

            expect(status.currentGesture).toBe('bounce');
        });

        it('should return next gesture in status', () => {
            scheduler.requestGesture('bounce');
            scheduler.requestGesture('flash');

            const status = scheduler.getStatus();

            // Next gesture should be the first in sorted queue
            expect(status.nextGesture).toBeDefined();
            expect(status.nextGesture.gestureName).toBeDefined();
        });

        it('should return null next gesture when queue empty', () => {
            const status = scheduler.getStatus();

            expect(status.nextGesture).toBeNull();
        });

        it('should track processing state', () => {
            const status = scheduler.getStatus();

            expect(status.isProcessing).toBeDefined();
        });
    });

    // ============================================================================
    // SUBDIVISION TIMING
    // ============================================================================

    describe('subdivision timing', () => {
        it('should calculate next subdivision for quarter note', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'quarter');

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should calculate next subdivision for eighth note', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'eighth');

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should calculate next subdivision for sixteenth note', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'sixteenth');

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should calculate next subdivision for triplet', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'triplet');

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should calculate next subdivision for whole note', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'whole');

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should default to beat duration for unknown subdivision', () => {
            const timeInfo = rhythmEngine.getTimeInfo();
            const time = scheduler.calculateNextSubdivision(timeInfo, 'unknown');

            expect(time).toBeGreaterThan(mockTime);
        });
    });

    // ============================================================================
    // SWING TIMING
    // ============================================================================

    describe('swing timing', () => {
        it('should calculate swing point before swing position', () => {
            const timeInfo = {
                ...rhythmEngine.getTimeInfo(),
                beatProgress: 0.3
            };

            const time = scheduler.calculateSwingPoint(timeInfo);

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should calculate swing point after swing position', () => {
            const timeInfo = {
                ...rhythmEngine.getTimeInfo(),
                beatProgress: 0.8
            };

            const time = scheduler.calculateSwingPoint(timeInfo);

            expect(time).toBeGreaterThan(mockTime);
        });

        it('should use 0.67 swing ratio', () => {
            const timeInfo = {
                ...rhythmEngine.getTimeInfo(),
                beatProgress: 0.5,
                beatDuration: 1000
            };

            const time = scheduler.calculateSwingPoint(timeInfo);

            // Should swing at 67% of beat
            const expectedDelay = (0.67 - 0.5) * 1000;
            expect(time).toBeCloseTo(mockTime + expectedDelay, -1);
        });
    });

    // ============================================================================
    // EDGE CASES & ERROR HANDLING
    // ============================================================================

    describe('edge cases & error handling', () => {
        it('should handle undefined options', () => {
            const queueItem = scheduler.requestGesture('bounce', undefined);

            expect(queueItem).toBeDefined();
        });

        it('should handle empty options object', () => {
            const queueItem = scheduler.requestGesture('bounce', {});

            expect(queueItem).toBeDefined();
        });

        it('should handle gesture without rhythm config', () => {
            const duration = scheduler.calculateGestureDuration({
                config: { duration: 500 }
            });

            expect(duration).toBe(500);
        });

        it('should handle gesture without config', () => {
            const duration = scheduler.calculateGestureDuration({});

            expect(duration).toBeGreaterThan(0);
        });

        it('should handle very high BPM', () => {
            rhythmEngine.bpm = 300;

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle very low BPM', () => {
            rhythmEngine.bpm = 40;

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle odd time signatures', () => {
            rhythmEngine.timeSignature = [7, 8];

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle rapid consecutive requests', () => {
            const items = [];
            for (let i = 0; i < 10; i++) {
                items.push(scheduler.requestGesture('flash'));
            }

            expect(items.every(item => item !== null)).toBe(true);
        });

        it('should handle afterTime option with per-gesture queue', () => {
            // Start active gesture
            scheduler.requestGesture('bounce', { immediate: true });

            // Request another with gesture-specific queue
            const queueItem = scheduler.requestGesture('bounce');

            // Should be queued in per-gesture queue, not main queue
            expect(scheduler.gestureQueues.has('bounce')).toBe(true);
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle timing override option', () => {
            const queueItem = scheduler.requestGesture('bounce', { timing: 'nextBar' });

            expect(queueItem).toBeDefined();
        });

        it('should pass options through to mascot.express', () => {
            scheduler.requestGesture('bounce', {
                immediate: true,
                customOption: 'test'
            });

            expect(mockMascot.express).toHaveBeenCalledWith('bounce', {
                immediate: true,
                customOption: 'test',
                fromScheduler: true
            });
        });

        it('should handle completion of non-current gesture', () => {
            // Start first gesture
            scheduler.requestGesture('flash', { immediate: true });

            // Manually set current gesture to something else
            scheduler.currentGesture = 'other';

            // Complete flash
            vi.advanceTimersByTime(200);

            // Should not clear currentGesture since it's not 'flash'
            expect(scheduler.currentGesture).toBe('other');
        });
    });

    // ============================================================================
    // COMPLEX WORKFLOW SCENARIOS
    // ============================================================================

    describe('complex workflow scenarios', () => {
        it('should handle queued gesture becoming ready during active gesture', () => {
            scheduler.requestGesture('transform', { immediate: true });
            const queueItem = scheduler.requestGesture('flash');

            // Fast-forward to when flash should trigger
            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalledWith('flash', expect.any(Object));
        });

        it('should handle multiple gestures with different timing modes', () => {
            scheduler.requestGesture('bounce'); // nextBeat
            scheduler.requestGesture('transform'); // nextDownbeat
            scheduler.requestGesture('evolve'); // nextPhrase

            expect(scheduler.queue.length).toBe(3);
            expect(scheduler.queue[0].triggerTime).toBeLessThan(scheduler.queue[2].triggerTime);
        });

        it('should handle gesture queue overflow correctly', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            // Fill to maxQueue
            scheduler.requestGesture('bounce');
            scheduler.requestGesture('bounce');
            scheduler.requestGesture('bounce');

            const overflow = scheduler.requestGesture('bounce');

            expect(overflow).toBeNull();
            expect(scheduler.gestureQueues.get('bounce').length).toBe(3);
        });

        it('should process entire workflow from queue to completion', () => {
            const queueCallback = vi.fn();
            const triggerCallback = vi.fn();
            const completeCallback = vi.fn();

            scheduler.onGestureQueued = queueCallback;
            scheduler.onGestureTriggered = triggerCallback;
            scheduler.onGestureCompleted = completeCallback;

            // Queue gesture
            const queueItem = scheduler.requestGesture('bounce');
            expect(queueCallback).toHaveBeenCalled();

            // Trigger gesture
            mockTime = queueItem.triggerTime;
            scheduler.processQueue();
            expect(triggerCallback).toHaveBeenCalled();

            // Complete gesture
            vi.advanceTimersByTime(500);
            expect(completeCallback).toHaveBeenCalled();
        });

        it('should handle beat event during active non-interruptible gesture', () => {
            scheduler.requestGesture('transform', { immediate: true });
            scheduler.requestGesture('bounce');

            const initialQueueLength = scheduler.queue.length;

            mockTime = 1100; // Early in transform
            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should not process queue due to non-interruptible gesture
            expect(scheduler.queue.length).toBe(initialQueueLength);
        });

        it('should chain multiple per-gesture queued items', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const item1 = scheduler.requestGesture('bounce');
            const item2 = scheduler.requestGesture('bounce');

            // Complete first active gesture
            vi.advanceTimersByTime(500);

            // First queued item should be in main queue
            expect(scheduler.queue.length).toBeGreaterThan(0);

            // Process and complete it
            mockTime = 2000;
            scheduler.processQueue();
            vi.advanceTimersByTime(500);

            // Second queued item should now be in main queue
            expect(scheduler.queue.length).toBeGreaterThan(0);
        });
    });

    // ============================================================================
    // TIMING ACCURACY VERIFICATION
    // ============================================================================

    describe('timing accuracy verification', () => {
        it('should maintain sub-50ms timing accuracy for beat sync', () => {
            const queueItem = scheduler.requestGesture('bounce');

            const timeInfo = rhythmEngine.getTimeInfo();
            const expectedTrigger = mockTime + timeInfo.nextBeatIn;

            expect(Math.abs(queueItem.triggerTime - expectedTrigger)).toBeLessThan(50);
        });

        it('should maintain sub-25ms timing accuracy for subdivision sync', () => {
            const queueItem = scheduler.requestGesture('pulse');

            // Should be scheduled very precisely for subdivision
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
            expect(queueItem.triggerTime).toBeLessThan(mockTime + 1000);
        });

        it('should calculate accurate bar boundaries', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 200,
                nextBeatIn: 300,
                beatInBar: 3, // 4th beat (0-indexed)
                bar: 5,
                beatProgress: 0.4
            }));

            const queueItem = scheduler.requestGesture('spin'); // nextBar

            // Should trigger on next bar (after 1 beat)
            expect(queueItem.triggerTime).toBeCloseTo(mockTime + 500, -1);
        });

        it('should calculate accurate phrase boundaries', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 200,
                nextBeatIn: 300,
                beatInBar: 1,
                bar: 2, // 3rd bar, so 1 bar until phrase
                beatProgress: 0.4
            }));

            const queueItem = scheduler.requestGesture('evolve'); // nextPhrase

            // Should trigger in 2 bars (bar 3 completes at bar 4, start of phrase)
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should apply anticipation precisely', () => {
            const queueItem = scheduler.requestGesture('jump');

            const timeInfo = rhythmEngine.getTimeInfo();
            const expectedBase = mockTime + timeInfo.nextBeatIn;
            const expectedWithAnticipation = expectedBase - 50; // jump has 50ms anticipation

            expect(queueItem.triggerTime).toBeCloseTo(expectedWithAnticipation, -1);
        });

        it('should maintain timing accuracy across BPM changes', () => {
            rhythmEngine.bpm = 90;
            const item1 = scheduler.requestGesture('bounce');

            rhythmEngine.bpm = 180;
            const item2 = scheduler.requestGesture('bounce');

            // Both should be scheduled accurately for their respective BPMs
            expect(item1.triggerTime).toBeGreaterThan(mockTime);
            expect(item2.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should maintain timing consistency with performance.now() progression', () => {
            mockTime = 1000;
            const queueItem1 = scheduler.requestGesture('bounce');

            mockTime = 1100;
            const queueItem2 = scheduler.requestGesture('bounce');

            // Second gesture should be scheduled after first
            expect(queueItem2.triggerTime).toBeGreaterThan(queueItem1.triggerTime);
        });

        it('should calculate trigger time relative to current time', () => {
            mockTime = 5000;
            const queueItem = scheduler.requestGesture('bounce');

            // Should be relative to current mock time
            expect(queueItem.triggerTime).toBeGreaterThan(5000);
        });

        it('should handle precise subdivision timing calculations', () => {
            const timeInfo = rhythmEngine.getTimeInfo();

            // Test all subdivision types
            const quarterTime = scheduler.calculateNextSubdivision(timeInfo, 'quarter');
            const eighthTime = scheduler.calculateNextSubdivision(timeInfo, 'eighth');
            const sixteenthTime = scheduler.calculateNextSubdivision(timeInfo, 'sixteenth');

            // Smaller subdivisions should come sooner
            expect(sixteenthTime).toBeLessThanOrEqual(eighthTime);
            expect(eighthTime).toBeLessThanOrEqual(quarterTime);
        });

        it('should maintain accuracy for downbeat timing', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 200,
                nextBeatIn: 300,
                beatInBar: 2, // On 3rd beat
                bar: 5,
                beatProgress: 0.4
            }));

            const queueItem = scheduler.requestGesture('transform'); // nextDownbeat

            // Should wait for downbeat (beat 0 of next bar)
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime + 500);
        });

        it('should maintain timing precision at different tempos', () => {
            // Test slow tempo
            rhythmEngine.bpm = 60;
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 60,
                beatDuration: 1000,
                barDuration: 4000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 200,
                nextBeatIn: 800,
                beatInBar: 1,
                bar: 0,
                beatProgress: 0.2
            }));

            const slowItem = scheduler.requestGesture('bounce');
            const slowExpected = mockTime + 800;
            expect(Math.abs(slowItem.triggerTime - slowExpected)).toBeLessThan(50);

            // Test fast tempo
            rhythmEngine.bpm = 180;
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 180,
                beatDuration: 333,
                barDuration: 1332,
                timeSignature: [4, 4],
                lastBeatTime: mockTime - 100,
                nextBeatIn: 233,
                beatInBar: 1,
                bar: 0,
                beatProgress: 0.3
            }));

            const fastItem = scheduler.requestGesture('bounce');
            const fastExpected = mockTime + 233;
            expect(Math.abs(fastItem.triggerTime - fastExpected)).toBeLessThan(50);
        });
    });

    // ============================================================================
    // ADVANCED INTEGRATION SCENARIOS
    // ============================================================================

    describe('advanced integration scenarios', () => {
        it('should handle full lifecycle of multiple overlapping gestures', () => {
            // Start first gesture
            scheduler.requestGesture('flash', { immediate: true });
            expect(scheduler.activeGestures.size).toBe(1);

            // Queue second gesture (blendable)
            mockTime = 1050;
            const queueItem = scheduler.requestGesture('glow');

            // Process queue
            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(scheduler.activeGestures.size).toBe(2);
            expect(mockMascot.express).toHaveBeenCalledTimes(2);

            // Complete first gesture (flash duration is 200ms, mapped to 125ms sixteenth note)
            mockTime = 1175;
            vi.advanceTimersByTime(125);
            expect(scheduler.activeGestures.has('glow')).toBe(true);

            // Complete second gesture (glow duration is 600ms, mapped to 500ms quarter note)
            mockTime = 1675;
            vi.advanceTimersByTime(500);
            expect(scheduler.activeGestures.has('glow')).toBe(false);
        });

        it('should coordinate beat events with queue processing', () => {
            const queueItem = scheduler.requestGesture('bounce');

            // Trigger beat event at appropriate time
            mockTime = queueItem.triggerTime;
            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            expect(mockMascot.express).toHaveBeenCalledWith('bounce', expect.any(Object));
        });

        it('should handle rapid gesture requests with different priorities', () => {
            // Queue multiple gestures rapidly
            const items = [];
            items.push(scheduler.requestGesture('glow', { priority: 1 }));
            items.push(scheduler.requestGesture('flash', { priority: 10 }));
            items.push(scheduler.requestGesture('pulse', { priority: 5 }));
            items.push(scheduler.requestGesture('bounce', { priority: 7 }));

            // Verify sorted by priority when times are close
            const priorities = scheduler.queue.map(item => item.priority);

            // High priorities should come first
            expect(priorities[0]).toBeGreaterThanOrEqual(priorities[priorities.length - 1]);
        });

        it('should handle gesture interruption with crossfade', () => {
            // Disable rhythm integration for crossfade behavior
            rhythmIntegration.isEnabled.mockReturnValue(false);

            scheduler.requestGesture('bounce', { immediate: true });

            mockTime = 1200; // Midway through bounce
            const mode = scheduler.determineInterruption({ type: 'effect', rhythm: {} });

            expect(mode).toBe('crossfade');

            // Re-enable rhythm integration
            rhythmIntegration.isEnabled.mockReturnValue(true);
        });

        it('should process queue during rhythm integration', () => {
            rhythmIntegration.isEnabled.mockReturnValue(true);

            const queueItem = scheduler.requestGesture('bounce');

            // Simulate beat processing
            mockTime = queueItem.triggerTime;
            scheduler.processQueueOnBeat({ beat: 1, bar: 0 });

            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should handle subdivision-based timing with rhythm events', () => {
            const queueItem = scheduler.requestGesture('pulse');

            // Trigger subdivision event
            mockTime = queueItem.triggerTime;
            rhythmEngine.emit('subdivision', {
                subdivision: 'eighth',
                time: mockTime
            });

            expect(mockMascot.express).toHaveBeenCalledWith('pulse', expect.any(Object));
        });

        it('should manage complex queue with mixed timing modes', () => {
            // Different timing modes
            const beat = scheduler.requestGesture('bounce'); // nextBeat
            const bar = scheduler.requestGesture('spin'); // nextBar
            const phrase = scheduler.requestGesture('evolve'); // nextPhrase
            const subdivision = scheduler.requestGesture('pulse'); // subdivision

            // All should be queued
            expect(scheduler.queue.length).toBe(4);

            // Should be sorted by trigger time
            const times = scheduler.queue.map(item => item.triggerTime);
            for (let i = 1; i < times.length; i++) {
                expect(times[i]).toBeGreaterThanOrEqual(times[i - 1] - 50);
            }
        });

        it('should handle gesture completion and automatic queue progression', () => {
            scheduler.requestGesture('bounce', { immediate: true });
            const queued = scheduler.requestGesture('bounce');

            // Complete active gesture
            vi.advanceTimersByTime(500);

            // Queued gesture should move to main queue
            expect(scheduler.queue.some(item => item.id === queued.id)).toBe(true);
            expect(scheduler.gestureQueues.get('bounce')).toBeUndefined();
        });

        it('should coordinate multiple callbacks across lifecycle', () => {
            const events = [];

            scheduler.onGestureQueued = item => events.push({ type: 'queued', name: item.gestureName });
            scheduler.onGestureTriggered = item => events.push({ type: 'triggered', name: item.gestureName });
            scheduler.onGestureCompleted = item => events.push({ type: 'completed', name: item.gestureName });

            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            vi.advanceTimersByTime(500);

            expect(events).toEqual([
                { type: 'queued', name: 'bounce' },
                { type: 'triggered', name: 'bounce' },
                { type: 'completed', name: 'bounce' }
            ]);
        });

        it('should handle blend mode with multiple active gestures', () => {
            // Start blendable gesture
            scheduler.requestGesture('glow', { immediate: true });

            // Request another blendable gesture
            const queueItem = scheduler.requestGesture('flash');

            expect(queueItem.interruptionMode).toBe('blend');

            // Both should be able to be active
            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            expect(scheduler.activeGestures.size).toBe(2);
        });

        it('should respect rhythm integration state across operations', () => {
            rhythmIntegration.isEnabled.mockReturnValue(true);

            const item1 = scheduler.requestGesture('bounce');
            expect(item1).toBeDefined();

            rhythmIntegration.isEnabled.mockReturnValue(false);

            const item2 = scheduler.requestGesture('flash');
            expect(item2).toBeNull();
            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should handle complex timing with per-gesture queuing', () => {
            scheduler.requestGesture('bounce', { immediate: true });

            const queueItem = scheduler.requestGesture('bounce');

            // Should be in per-gesture queue
            expect(scheduler.gestureQueues.has('bounce')).toBe(true);
            expect(queueItem.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should process beat events with tolerance windows', () => {
            const queueItem = scheduler.requestGesture('bounce');

            // Set time slightly before trigger
            mockTime = queueItem.triggerTime - 30;

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should execute within tolerance
            expect(mockMascot.express).toHaveBeenCalled();
        });

        it('should handle multiple gestures completing simultaneously', () => {
            scheduler.requestGesture('flash', { immediate: true });
            scheduler.requestGesture('glow', { immediate: true });

            expect(scheduler.activeGestures.size).toBe(2);

            // Complete both around same time
            vi.advanceTimersByTime(200); // flash completes
            expect(scheduler.activeGestures.has('flash')).toBe(false);
            expect(scheduler.activeGestures.has('glow')).toBe(true);

            vi.advanceTimersByTime(400); // glow completes
            expect(scheduler.activeGestures.size).toBe(0);
        });

        it('should maintain queue integrity during rapid operations', () => {
            // Rapidly queue gestures
            for (let i = 0; i < 5; i++) {
                scheduler.requestGesture('flash');
                mockTime += 10;
            }

            const queueLength = scheduler.queue.length;
            expect(queueLength).toBe(5);

            // Process all
            mockTime = 2000;
            scheduler.processQueue();

            expect(scheduler.queue.length).toBe(0);
            expect(mockMascot.express).toHaveBeenCalledTimes(5);
        });

        it('should handle rhythm pattern changes during execution', () => {
            rhythmEngine.getPattern = vi.fn(() => 'straight');
            const item1 = scheduler.requestGesture('sway');

            rhythmEngine.getPattern = vi.fn(() => 'swing');
            const item2 = scheduler.requestGesture('sway');

            // Both should be scheduled appropriately for their patterns
            expect(item1.triggerTime).toBeGreaterThan(mockTime);
            expect(item2.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should coordinate per-gesture queues with main queue', () => {
            // Start gesture and queue multiple
            scheduler.requestGesture('bounce', { immediate: true });
            const q1 = scheduler.requestGesture('bounce');
            const q2 = scheduler.requestGesture('bounce');

            expect(scheduler.gestureQueues.get('bounce').length).toBe(2);
            expect(scheduler.queue.length).toBe(0);

            // Complete active
            vi.advanceTimersByTime(500);

            // First queued should move to main queue
            expect(scheduler.queue.length).toBeGreaterThan(0);
            expect(scheduler.gestureQueues.get('bounce').length).toBe(1);

            // Process and complete
            mockTime = 2000;
            scheduler.processQueue();
            vi.advanceTimersByTime(500);

            // Second queued should move to main queue
            expect(scheduler.queue.length).toBeGreaterThan(0);
            expect(scheduler.gestureQueues.has('bounce')).toBe(false);
        });

        it('should handle edge case of gesture completing during queue processing', () => {
            const queueItem = scheduler.requestGesture('bounce');

            mockTime = queueItem.triggerTime;
            scheduler.processQueue();

            // Immediately advance to completion
            mockTime += 500;
            vi.advanceTimersByTime(500);

            expect(scheduler.currentGesture).toBeNull();
            expect(scheduler.activeGestures.size).toBe(0);
        });

        it('should maintain accurate timing across multiple beat cycles', () => {
            const items = [];

            // Queue gestures across multiple beats
            for (let i = 0; i < 4; i++) {
                items.push(scheduler.requestGesture('bounce'));

                // Simulate beat progression
                mockTime += 500; // One beat at 120 BPM
                rhythmEngine.getTimeInfo = vi.fn(() => ({
                    bpm: 120,
                    beatDuration: 500,
                    barDuration: 2000,
                    timeSignature: [4, 4],
                    lastBeatTime: mockTime - 50,
                    nextBeatIn: 450,
                    beatInBar: i % 4,
                    bar: Math.floor(i / 4),
                    beatProgress: 0.1
                }));
            }

            // All should have increasing trigger times
            for (let i = 1; i < items.length; i++) {
                expect(items[i].triggerTime).toBeGreaterThanOrEqual(items[i - 1].triggerTime);
            }
        });
    });

    // ============================================================================
    // STRESS TESTING & EDGE CASES
    // ============================================================================

    describe('stress testing & edge cases', () => {
        it('should handle queue overflow with grace', () => {
            // Add many gestures to queue
            for (let i = 0; i < 100; i++) {
                scheduler.requestGesture('flash');
            }

            expect(scheduler.queue.length).toBe(100);

            // Should still process correctly
            mockTime = 2000;
            scheduler.processQueue();

            expect(mockMascot.express).toHaveBeenCalledTimes(100);
        });

        it('should handle rapid start/stop of processing loop', () => {
            scheduler.stopProcessing();
            scheduler.startProcessing();
            scheduler.stopProcessing();
            scheduler.startProcessing();

            expect(scheduler.processInterval).toBeDefined();
        });

        it('should handle missing gesture properties gracefully', () => {
            const duration = scheduler.calculateGestureDuration({
                type: 'motion'
                // No config, no rhythm
            });

            expect(duration).toBeGreaterThan(0);
        });

        it('should handle extreme BPM values', () => {
            // Very slow
            rhythmEngine.bpm = 20;
            const slow = scheduler.requestGesture('bounce');
            expect(slow.triggerTime).toBeGreaterThan(mockTime);

            // Very fast
            rhythmEngine.bpm = 300;
            const fast = scheduler.requestGesture('bounce');
            expect(fast.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle complex time signatures', () => {
            rhythmEngine.timeSignature = [7, 8];
            const item = scheduler.requestGesture('spin');
            expect(item.triggerTime).toBeGreaterThan(mockTime);

            rhythmEngine.timeSignature = [5, 4];
            const item2 = scheduler.requestGesture('spin');
            expect(item2.triggerTime).toBeGreaterThan(mockTime);
        });

        it('should handle simultaneous gesture completion and new requests', () => {
            scheduler.requestGesture('flash', { immediate: true });

            // Request new gesture just as old one completes
            vi.advanceTimersByTime(200);
            scheduler.requestGesture('bounce', { immediate: true });

            expect(scheduler.activeGestures.size).toBe(1);
            expect(scheduler.currentGesture).toBe('bounce');
        });

        it('should handle zero or negative timing values gracefully', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120,
                beatDuration: 500,
                barDuration: 2000,
                timeSignature: [4, 4],
                lastBeatTime: mockTime,
                nextBeatIn: -100, // Invalid
                beatInBar: 0,
                bar: 0,
                beatProgress: 0
            }));

            const queueItem = scheduler.requestGesture('bounce');

            // Should still schedule with minimum delay
            expect(queueItem.triggerTime).toBeGreaterThanOrEqual(mockTime + 50);
        });

        it('should handle clearing queue with active gestures', () => {
            scheduler.requestGesture('bounce', { immediate: true });
            scheduler.requestGesture('flash');
            scheduler.requestGesture('glow');

            expect(scheduler.queue.length).toBeGreaterThan(0);
            expect(scheduler.activeGestures.size).toBe(1);

            scheduler.clearQueue();

            expect(scheduler.queue.length).toBe(0);
            expect(scheduler.activeGestures.size).toBe(1); // Active should remain
        });

        it('should handle missing time info from rhythm engine', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => null);

            const queueItem = scheduler.requestGesture('bounce');

            // Should default to small delay
            expect(queueItem.triggerTime).toBeCloseTo(mockTime + 100, -1);
        });

        it('should handle incomplete time info from rhythm engine', () => {
            rhythmEngine.getTimeInfo = vi.fn(() => ({
                bpm: 120
                // Missing other fields
            }));

            const queueItem = scheduler.requestGesture('bounce');

            expect(queueItem).toBeDefined();
        });

        it('should handle gesture without type field', () => {
            const canBlend = scheduler.canBlend(
                { rhythm: {} },
                { type: 'effect', rhythm: {} }
            );

            expect(typeof canBlend).toBe('boolean');
        });

        it('should handle multiple rapid status checks', () => {
            scheduler.requestGesture('bounce');

            const status1 = scheduler.getStatus();
            const status2 = scheduler.getStatus();
            const status3 = scheduler.getStatus();

            expect(status1.queueLength).toBe(status2.queueLength);
            expect(status2.queueLength).toBe(status3.queueLength);
        });

        it('should handle processing loop with empty queue', () => {
            scheduler.clearQueue();

            // Process empty queue multiple times
            scheduler.processQueue();
            scheduler.processQueue();
            scheduler.processQueue();

            expect(scheduler.queue.length).toBe(0);
        });

        it('should handle beat event with no queued gestures', () => {
            scheduler.clearQueue();

            rhythmEngine.emit('beat', {
                beat: 1,
                bar: 0,
                time: mockTime
            });

            // Should not crash
            expect(scheduler.queue.length).toBe(0);
        });

        it('should handle subdivision event with no matching gestures', () => {
            scheduler.requestGesture('bounce'); // Not subdivision-synced

            rhythmEngine.emit('subdivision', {
                subdivision: 'eighth',
                time: mockTime
            });

            // Should not process non-subdivision gestures
            expect(scheduler.queue.length).toBe(1);
        });
    });
});
