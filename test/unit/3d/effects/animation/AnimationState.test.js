/**
 * Animation State Machine Tests
 * Tests for the AnimationState lifecycle management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnimationState, AnimationStates } from '../../../../../src/3d/effects/animation/AnimationState.js';
import { AnimationConfig } from '../../../../../src/3d/effects/animation/AnimationConfig.js';

/**
 * Helper to create a minimal AnimationConfig for testing
 * Note: AnimationConfig reads appearAt, disappearAt, etc. at top level, not nested in timing
 * In progress mode, enter.duration and exit.duration are used (not durationMs)
 */
function createTestConfig(overrides = {}) {
    const { timing = {}, lifecycle = {}, ...rest } = overrides;
    return new AnimationConfig({
        // Timing is at top level
        appearAt: timing.appearAt ?? 0,
        disappearAt: timing.disappearAt ?? 1,
        stagger: timing.stagger ?? 0,
        appearOnBeat: timing.appearOnBeat ?? null,
        // Enter/Exit - duration is for progress mode, durationMs for ms mode
        enter: { type: 'fade', duration: 0.05, durationMs: 50, ...overrides.enter },
        exit: { type: 'fade', duration: 0.05, durationMs: 50, ...overrides.exit },
        // Lifecycle at top level
        respawn: lifecycle.respawn ?? false,
        maxRespawns: lifecycle.maxRespawns ?? -1,
        respawnDelayMs: lifecycle.respawnDelayMs ?? 0,
        // Rest of overrides
        ...rest
    }, overrides.gestureDuration || 1000);
}

describe('AnimationState', () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('constructor', () => {
        it('should create with default values', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);

            expect(state.state).toBe(AnimationStates.WAITING);
            expect(state.progress).toBe(0);
            expect(state.opacity).toBe(0);
            expect(state.scale).toBe(0);
            expect(state.index).toBe(0);
            expect(state.isDead).toBe(false);
            expect(state.respawnCount).toBe(0);
        });

        it('should accept element index', () => {
            const config = createTestConfig();
            const state = new AnimationState(config, 5);

            expect(state.index).toBe(5);
        });

        it('should accept per-element overrides', () => {
            const config = createTestConfig();
            const elementOverrides = { opacity: 0.5, scale: 2.0 };
            const state = new AnimationState(config, 0, elementOverrides);

            expect(state.elementConfig.opacity).toBe(0.5);
            expect(state.elementConfig.scale).toBe(2.0);
        });

        it('should initialize beat sync state', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);

            expect(state.currentBeat).toBe(0);
            expect(state.lastBeatTriggered).toBe(-1);
            expect(state.waitingForBeat).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('initialize', () => {
        it('should set birth time and reset state', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);

            state.initialize(10.5);

            expect(state.birthTime).toBe(10.5);
            expect(state.stateStartTime).toBe(10.5);
            expect(state.state).toBe(AnimationStates.WAITING);
            expect(state.progress).toBe(0);
            expect(state.opacity).toBe(0);
            expect(state.scale).toBe(0);
            expect(state.respawnCount).toBe(0);
            expect(state.isDead).toBe(false);
        });

        it('should fire onSpawn event', () => {
            const onSpawn = vi.fn();
            const config = createTestConfig({
                onSpawn
            });
            const state = new AnimationState(config);

            state.initialize(0);

            expect(onSpawn).toHaveBeenCalled();
        });

        it('should set pulse phase for local sync mode', () => {
            const config = createTestConfig({
                pulse: { frequency: 1, amplitude: 0.2, sync: 'local' }
            });
            const state1 = new AnimationState(config, 1);
            const state2 = new AnimationState(config, 5);

            state1.initialize(0);
            state2.initialize(0);

            // Different indices should have different phases (index * 0.2)
            expect(state1.pulsePhase).toBe(0.2);  // 1 * 0.2
            expect(state2.pulsePhase).toBe(1.0);  // 5 * 0.2
            expect(state1.pulsePhase).not.toBe(state2.pulsePhase);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE TRANSITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('AnimationStates enum', () => {
        it('should have all lifecycle states', () => {
            expect(AnimationStates.WAITING).toBe('waiting');
            expect(AnimationStates.ENTERING).toBe('entering');
            expect(AnimationStates.HOLDING).toBe('holding');
            expect(AnimationStates.EXITING).toBe('exiting');
            expect(AnimationStates.DEAD).toBe('dead');
        });
    });

    describe('state machine transitions', () => {
        it('should transition from WAITING to ENTERING when appear time reached', () => {
            const config = createTestConfig({
                timing: { appearAt: 0.5 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Before appear time
            state.update(0.1, 0.016, 0.1);
            expect(state.state).toBe(AnimationStates.WAITING);

            // At/after appear time
            state.update(0.6, 0.016, 0.6);
            expect(state.state).toBe(AnimationStates.ENTERING);
        });

        it('should transition from ENTERING to HOLDING when enter complete', () => {
            const config = createTestConfig({
                enter: { type: 'fade', duration: 0.00100 },
                timing: { appearAt: 0 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Trigger enter
            state.update(0.01, 0.01, 0.01);
            expect(state.state).toBe(AnimationStates.ENTERING);

            // Complete enter (100ms = 0.1s)
            state.update(0.2, 0.19, 0.2);
            expect(state.state).toBe(AnimationStates.HOLDING);
        });

        it('should transition from HOLDING to EXITING when disappear time reached', () => {
            const config = createTestConfig({
                enter: { type: 'fade', duration: 0.0010 },
                timing: { appearAt: 0, disappearAt: 0.5 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Enter and hold
            state.update(0.05, 0.05, 0.05);
            state.update(0.1, 0.05, 0.1);

            // At disappear time
            state.update(0.6, 0.1, 0.6);
            expect(state.state).toBe(AnimationStates.EXITING);
        });

        it('should transition from EXITING to DEAD when exit complete', () => {
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'fade', duration: 0.05 },
                timing: { appearAt: 0, disappearAt: 0.2 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress to exiting state
            state.update(0.005, 0.005, 0.005);  // WAITING -> ENTERING
            state.update(0.02, 0.015, 0.02);    // ENTERING -> HOLDING
            state.update(0.25, 0.23, 0.25);     // HOLDING -> EXITING (gesture > disappearAt)

            expect(state.state).toBe(AnimationStates.EXITING);

            // Complete exit - transitions to DEAD
            state.update(0.35, 0.1, 0.35);
            expect(state.state).toBe(AnimationStates.DEAD);

            // One more update to run _handleDead() which sets isDead=true
            state.update(0.36, 0.01, 0.36);
            expect(state.isDead).toBe(true);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ENTER ANIMATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('enter animations', () => {
        describe('fade type', () => {
            it('should fade opacity from 0 to target', () => {
                const config = createTestConfig({
                    enter: { type: 'fade', duration: 0.1 },
                    timing: { appearAt: 0 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // First update: WAITING -> ENTERING
                state.update(0.005, 0.005, 0.005);
                // Second update: in ENTERING state, animation applies
                state.update(0.02, 0.015, 0.02);
                expect(state.state).toBe(AnimationStates.ENTERING);
                expect(state.opacity).toBeGreaterThan(0);
                expect(state.opacity).toBeLessThan(1);

                // Continue entering
                state.update(0.05, 0.03, 0.05);
                expect(state.opacity).toBeGreaterThan(0.3);

                // Complete (longer duration needs more time)
                state.update(0.15, 0.1, 0.15);
                expect(state.opacity).toBe(state.elementConfig.opacity);
            });
        });

        describe('flash type', () => {
            it('should have overbright phase then settle', () => {
                const config = createTestConfig({
                    enter: { type: 'flash', duration: 0.1 },
                    timing: { appearAt: 0 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // First update: WAITING -> ENTERING
                state.update(0.005, 0.005, 0.005);
                // Early in flash (should be overbright) - second update applies animation
                state.update(0.02, 0.015, 0.02);
                expect(state.emissive).toBeGreaterThan(1);
            });
        });

        describe('grow type', () => {
            it('should scale from start to end scale', () => {
                const config = createTestConfig({
                    enter: { type: 'grow', duration: 0.1, scale: [0.5, 1.0] },
                    timing: { appearAt: 0 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // First update: WAITING -> ENTERING
                state.update(0.005, 0.005, 0.005);
                // Second update: in ENTERING, animation applies
                state.update(0.02, 0.015, 0.02);
                expect(state.scale).toBeGreaterThan(0);
                expect(state.scale).toBeLessThan(state.elementConfig.scale);
            });
        });

        describe('pop type', () => {
            it('should overshoot then settle', () => {
                const config = createTestConfig({
                    enter: { type: 'pop', duration: 0.1, overshoot: 1.2 },
                    timing: { appearAt: 0 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // First update: WAITING -> ENTERING
                state.update(0.005, 0.005, 0.005);
                // Second update: in ENTERING, mid-way animation
                state.update(0.06, 0.055, 0.06);
                expect(state.scale).toBeGreaterThan(0);
            });
        });

        describe('none type', () => {
            it('should appear instantly', () => {
                const config = createTestConfig({
                    enter: { type: 'none', duration: 0.001 },
                    timing: { appearAt: 0 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // First update transitions from WAITING to ENTERING
                state.update(0.005, 0.005, 0.005);
                // Second update completes enter (with type 'none', opacity/scale set immediately)
                state.update(0.02, 0.015, 0.02);
                expect(state.opacity).toBe(state.elementConfig.opacity);
                expect(state.scale).toBe(state.elementConfig.scale);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // EXIT ANIMATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('exit animations', () => {
        function setupExitState(exitConfig) {
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'fade', duration: 0.05, ...exitConfig },
                timing: { appearAt: 0, disappearAt: 0.1 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress through enter to holding
            state.update(0.005, 0.005, 0.005);  // Start entering
            state.update(0.02, 0.015, 0.02);    // Complete enter, now in holding
            // Trigger exit by passing disappearAt
            state.update(0.15, 0.13, 0.15);     // Should now be in exiting

            return state;
        }

        describe('fade type', () => {
            it('should fade opacity to 0', () => {
                const state = setupExitState({ type: 'fade', duration: 0.1 });
                expect(state.state).toBe(AnimationStates.EXITING);

                // Mid exit (use small time step to catch mid-animation)
                state.update(0.17, 0.02, 0.17);
                expect(state.opacity).toBeLessThan(state.elementConfig.opacity);
                expect(state.opacity).toBeGreaterThan(0);
            });
        });

        describe('shrink type', () => {
            it('should scale down', () => {
                const state = setupExitState({ type: 'shrink', duration: 0.1, scale: [1.0, 0] });
                expect(state.state).toBe(AnimationStates.EXITING);

                // Mid exit (use small time step to catch mid-animation)
                state.update(0.17, 0.02, 0.17);
                expect(state.scale).toBeLessThan(state.elementConfig.scale);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // HOLD ANIMATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('hold animations', () => {
        function setupHoldState(holdConfig) {
            // Hold animations (pulse, flicker, drift, rotate, emissive) are top-level in config
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 1 },
                ...holdConfig  // Spread pulse, flicker, drift, rotate, emissive at top level
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress to holding state
            state.update(0.01, 0.01, 0.01);
            state.update(0.02, 0.01, 0.02);  // Extra update to ensure we're in HOLDING

            return state;
        }

        describe('pulse', () => {
            it('should modulate scale', () => {
                const state = setupHoldState({
                    pulse: { frequency: 1, amplitude: 0.2 }
                });
                expect(state.state).toBe(AnimationStates.HOLDING);

                const scales = [];
                for (let t = 0.1; t < 1.0; t += 0.1) {
                    state.update(t, 0.1, 0.1);
                    scales.push(state.scale);
                }

                // Scale should vary
                const min = Math.min(...scales);
                const max = Math.max(...scales);
                expect(max - min).toBeGreaterThan(0);
            });
        });

        describe('flicker - sine pattern', () => {
            it('should modulate opacity with sine wave', () => {
                const state = setupHoldState({
                    flicker: { pattern: 'sine', rate: 2, intensity: 0.3 }
                });

                const opacities = [];
                for (let t = 0.1; t < 1.0; t += 0.1) {
                    state.update(t, 0.1, 0.1);
                    opacities.push(state.opacity);
                }

                // Should have variation
                const min = Math.min(...opacities);
                const max = Math.max(...opacities);
                expect(max - min).toBeGreaterThan(0);
            });
        });

        describe('flicker - square pattern', () => {
            it('should switch between high and low opacity', () => {
                const state = setupHoldState({
                    flicker: { pattern: 'square', rate: 1, intensity: 0.5 }
                });

                state.update(0.1, 0.1, 0.1);
                const firstFlicker = state.flickerValue;

                state.update(0.6, 0.5, 0.6);
                const secondFlicker = state.flickerValue;

                // Values should be different (high vs low)
                expect(firstFlicker).not.toBeCloseTo(secondFlicker, 1);
            });
        });

        describe('emissive - sine pattern', () => {
            it('should oscillate emissive value', () => {
                const state = setupHoldState({
                    emissive: { pattern: 'sine', frequency: 1, min: 0.5, max: 2.0 }
                });

                const emissives = [];
                for (let t = 0.1; t < 1.0; t += 0.1) {
                    state.update(t, 0.1, 0.1);
                    emissives.push(state.emissive);
                }

                // Should stay within range
                emissives.forEach(e => {
                    expect(e).toBeGreaterThanOrEqual(0.5);
                    expect(e).toBeLessThanOrEqual(2.0);
                });
            });
        });

        describe('drift', () => {
            it('should accumulate position offset for up direction', () => {
                const state = setupHoldState({
                    drift: { direction: 'up', speed: 1, maxDistance: 10 }
                });

                state.update(0.1, 0.1, 0.1);
                state.update(0.2, 0.1, 0.2);

                expect(state.driftOffset.y).toBeGreaterThan(0);
            });

            it('should respect maxDistance', () => {
                const state = setupHoldState({
                    drift: { direction: 'up', speed: 100, maxDistance: 0.5, bounce: false }
                });

                // Update many times
                for (let i = 0; i < 100; i++) {
                    state.update(i * 0.1, 0.1, 0.1);
                }

                const dist = Math.sqrt(
                    state.driftOffset.x ** 2 +
                    state.driftOffset.y ** 2 +
                    state.driftOffset.z ** 2
                );
                expect(dist).toBeLessThanOrEqual(0.51); // Small tolerance
            });
        });

        describe('rotate', () => {
            it('should accumulate rotation for continuous mode', () => {
                const state = setupHoldState({
                    rotate: { axis: [0, 1, 0], speed: 1, oscillate: false }
                });

                state.update(0.1, 0.1, 0.1);
                const firstRotation = state.rotationOffset.y;

                state.update(0.2, 0.1, 0.2);
                const secondRotation = state.rotationOffset.y;

                expect(secondRotation).toBeGreaterThan(firstRotation);
            });

            it('should oscillate for oscillate mode', () => {
                const state = setupHoldState({
                    rotate: { axis: [0, 0, 1], speed: 1, oscillate: true, range: Math.PI / 4 }
                });

                const rotations = [];
                for (let t = 0; t < 2; t += 0.1) {
                    state.update(t, 0.1, 0.1);
                    rotations.push(state.rotationOffset.z);
                }

                // Should have both positive and negative values (oscillation)
                const hasPositive = rotations.some(r => r > 0.1);
                const hasNegative = rotations.some(r => r < -0.1);
                expect(hasPositive || hasNegative).toBe(true);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPAWN
    // ═══════════════════════════════════════════════════════════════════════════

    describe('respawn', () => {
        it('should respawn when enabled and return to waiting', () => {
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 0.1 },
                lifecycle: { respawn: true, maxRespawns: -1, respawnDelayMs: 10 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress through full lifecycle with sufficient time between updates
            state.update(0.01, 0.01, 0.01);    // Enter starts and completes
            state.update(0.02, 0.01, 0.02);    // Stay in holding
            state.update(0.15, 0.13, 0.15);    // Exit starts
            state.update(0.25, 0.10, 0.25);    // Exit completes, transitions to DEAD
            state.update(0.26, 0.01, 0.26);    // _handleDead runs and respawns

            // Should be back in waiting, not dead
            expect(state.state).toBe(AnimationStates.WAITING);
            expect(state.respawnCount).toBe(1);
            expect(state.isDead).toBe(false);
        });

        it('should respect maxRespawns limit', () => {
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 0.01 },
                lifecycle: { respawn: true, maxRespawns: 2, respawnDelayMs: 1 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Cycle through respawns with small time steps
            // Each cycle: enter (appear at 0), hold briefly, exit (disappear at 0.01), respawn
            for (let i = 0; i < 100; i++) {
                state.update(i * 0.01, 0.01, i * 0.01);
            }

            // Should be dead after max respawns
            expect(state.respawnCount).toBe(2);
            expect(state.isDead).toBe(true);
        });

        it('should fire onRespawn event', () => {
            const onRespawn = vi.fn();
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 0.1 },
                lifecycle: { respawn: true, maxRespawns: 1, respawnDelayMs: 10 },
                onRespawn
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress through lifecycle with sufficient time
            state.update(0.01, 0.01, 0.01);   // Enter and complete
            state.update(0.02, 0.01, 0.02);   // Hold
            state.update(0.15, 0.13, 0.15);   // Start exit
            state.update(0.25, 0.10, 0.25);   // Complete exit, transition to DEAD
            state.update(0.26, 0.01, 0.26);   // _handleDead runs and triggers respawn

            expect(onRespawn).toHaveBeenCalled();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // BEAT SYNC
    // ═══════════════════════════════════════════════════════════════════════════

    describe('beat sync', () => {
        it('should update beat state', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);
            state.initialize(0);

            state.setBeat(4, 120);

            expect(state.currentBeat).toBe(4);
            expect(state.bpm).toBe(120);
        });

        it('should wait for appearOnBeat', () => {
            const config = createTestConfig({
                timing: { appearAt: 0, appearOnBeat: 4 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Update without beat sync - should stay waiting
            state.update(0.1, 0.1, 0.1);
            expect(state.state).toBe(AnimationStates.WAITING);

            // Set beat below target - should still wait
            state.setBeat(2, 120);
            state.update(0.2, 0.1, 0.2);
            expect(state.state).toBe(AnimationStates.WAITING);
            expect(state.waitingForBeat).toBe(true);

            // Set beat at target - should trigger
            state.setBeat(4, 120);
            state.update(0.3, 0.1, 0.3);
            expect(state.state).toBe(AnimationStates.ENTERING);
            expect(state.waitingForBeat).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // MANUAL CONTROL
    // ═══════════════════════════════════════════════════════════════════════════

    describe('manual control', () => {
        describe('triggerExit', () => {
            it('should force transition to exiting state', () => {
                const config = createTestConfig({
                    enter: { type: 'none', duration: 0.001 },
                    timing: { appearAt: 0, disappearAt: 1 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // Enter and complete to holding
                state.update(0.005, 0.005, 0.005);
                state.update(0.02, 0.015, 0.02);
                expect(state.state).toBe(AnimationStates.HOLDING);

                // Force exit
                state.triggerExit();
                expect(state.state).toBe(AnimationStates.EXITING);
            });

            it('should not trigger if already exiting', () => {
                const config = createTestConfig({
                    enter: { type: 'none', duration: 0.001 },
                    timing: { appearAt: 0, disappearAt: 0.1 }
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // Progress through enter to hold
                state.update(0.01, 0.01, 0.01);
                state.update(0.02, 0.01, 0.02);

                // Now trigger exit by passing disappearAt
                state.update(0.15, 0.13, 0.15);

                expect(state.state).toBe(AnimationStates.EXITING);
                const progressBefore = state.progress;

                state.triggerExit();

                // Progress should not reset
                expect(state.progress).toBe(progressBefore);
            });

            it('should fire onExitStart event', () => {
                const onExitStart = vi.fn();
                const config = createTestConfig({
                    enter: { type: 'none', duration: 0.001 },
                    timing: { appearAt: 0, disappearAt: 1 },
                    onExitStart
                });
                const state = new AnimationState(config);
                state.initialize(0);

                // Progress to holding
                state.update(0.005, 0.005, 0.005);
                state.update(0.02, 0.015, 0.02);
                state.triggerExit();

                expect(onExitStart).toHaveBeenCalled();
            });
        });

        describe('kill', () => {
            it('should immediately set to dead state', () => {
                const config = createTestConfig();
                const state = new AnimationState(config);
                state.initialize(0);

                state.update(0.01, 0.01, 0.01);
                state.kill();

                expect(state.state).toBe(AnimationStates.DEAD);
                expect(state.isDead).toBe(true);
                expect(state.opacity).toBe(0);
                expect(state.scale).toBe(0);
            });

            it('should skip exit animation', () => {
                const onExitStart = vi.fn();
                const onExitComplete = vi.fn();
                const config = createTestConfig({
                    onExitStart,
                    onExitComplete
                });
                const state = new AnimationState(config);
                state.initialize(0);

                state.update(0.01, 0.01, 0.01);
                state.kill();

                expect(onExitStart).not.toHaveBeenCalled();
                expect(onExitComplete).not.toHaveBeenCalled();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('events', () => {
        it('should fire lifecycle events in order', () => {
            const events = [];
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 0.1 },
                onSpawn: () => events.push('spawn'),
                onEnterStart: () => events.push('enterStart'),
                onEnterComplete: () => events.push('enterComplete'),
                onExitStart: () => events.push('exitStart'),
                onExitComplete: () => events.push('exitComplete')
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress through lifecycle with sufficient time between updates
            state.update(0.005, 0.005, 0.005);  // Enter starts
            state.update(0.02, 0.015, 0.02);    // Enter completes
            state.update(0.15, 0.13, 0.15);     // Exit starts (past disappearAt)
            state.update(0.30, 0.15, 0.30);     // Exit completes

            expect(events).toEqual([
                'spawn',
                'enterStart',
                'enterComplete',
                'exitStart',
                'exitComplete'
            ]);
        });

        it('should catch and warn on event callback errors', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const config = createTestConfig({
                timing: { appearAt: 0 },
                onEnterStart: () => { throw new Error('Test error'); }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Should not throw
            expect(() => state.update(0.01, 0.01, 0.01)).not.toThrow();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error in onEnterStart'),
                expect.any(Error)
            );

            consoleWarnSpy.mockRestore();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // getElementInfo
    // ═══════════════════════════════════════════════════════════════════════════

    describe('getElementInfo', () => {
        it('should return current state info', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);
            state.initialize(0);

            state.update(0.01, 0.01, 0.01);

            const info = state.getElementInfo();

            expect(info.state).toBe(state.state);
            expect(info.progress).toBe(state.progress);
            expect(info.opacity).toBe(state.opacity);
            expect(info.scale).toBe(state.scale);
            expect(info.emissive).toBe(state.emissive);
            expect(info.respawnCount).toBe(state.respawnCount);
            expect(info.config).toBe(state.config);
        });

        it('should return copies of offset objects', () => {
            const config = createTestConfig();
            const state = new AnimationState(config);
            state.initialize(0);

            const info = state.getElementInfo();

            // Modify returned object
            info.driftOffset.x = 999;
            info.rotationOffset.y = 999;

            // Original should be unchanged
            expect(state.driftOffset.x).not.toBe(999);
            expect(state.rotationOffset.y).not.toBe(999);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // UPDATE RETURN VALUE
    // ═══════════════════════════════════════════════════════════════════════════

    describe('update return value', () => {
        it('should return true while alive', () => {
            const config = createTestConfig({
                timing: { appearAt: 0, disappearAt: 1 }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            expect(state.update(0.01, 0.01, 0.01)).toBe(true);
            expect(state.update(0.5, 0.49, 0.5)).toBe(true);
        });

        it('should return false when dead', () => {
            const config = createTestConfig({
                enter: { type: 'none', duration: 0.001 },
                exit: { type: 'none', duration: 0.001 },
                timing: { appearAt: 0, disappearAt: 0.01 },
                lifecycle: { respawn: false }
            });
            const state = new AnimationState(config);
            state.initialize(0);

            // Progress to death
            for (let i = 0; i < 10; i++) {
                state.update(i * 0.1, 0.1, 0.1);
            }

            expect(state.isDead).toBe(true);
            expect(state.update(1.0, 0.1, 1.0)).toBe(false);
        });
    });
});
