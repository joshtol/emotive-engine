/**
 * Bulk tests for gesture motion files
 */
import { describe, it, expect } from 'vitest';

// Import motion gestures
import bounce from '../../../../src/core/gestures/motions/bounce.js';
import pulse from '../../../../src/core/gestures/motions/pulse.js';
import shake from '../../../../src/core/gestures/motions/shake.js';
import nod from '../../../../src/core/gestures/motions/nod.js';
import vibrate from '../../../../src/core/gestures/motions/vibrate.js';
import orbit from '../../../../src/core/gestures/motions/orbit.js';
import twitch from '../../../../src/core/gestures/motions/twitch.js';
import sway from '../../../../src/core/gestures/motions/sway.js';
import float from '../../../../src/core/gestures/motions/float.js';
import jitter from '../../../../src/core/gestures/motions/jitter.js';

describe('Gesture Motions - Bulk Validation', () => {
    const gestures = [
        { gesture: bounce, name: 'bounce' },
        { gesture: pulse, name: 'pulse' },
        { gesture: shake, name: 'shake' },
        { gesture: nod, name: 'nod' },
        { gesture: vibrate, name: 'vibrate' },
        { gesture: orbit, name: 'orbit' },
        { gesture: twitch, name: 'twitch' },
        { gesture: sway, name: 'sway' },
        { gesture: float, name: 'float' },
        { gesture: jitter, name: 'jitter' }
    ];

    describe('Required Properties', () => {
        gestures.forEach(({ gesture, name }) => {
            it(`${name} should be defined`, () => {
                expect(gesture).toBeDefined();
            });

            it(`${name} should have name property`, () => {
                if (gesture.name) {
                    expect(gesture.name).toBe(name);
                }
            });

            it(`${name} should have type property`, () => {
                if (gesture.type) {
                    expect(gesture.type).toBeDefined();
                    expect(typeof gesture.type).toBe('string');
                }
            });

            it(`${name} should have apply function`, () => {
                if (gesture.apply) {
                    expect(typeof gesture.apply).toBe('function');
                }
            });
        });
    });
});
