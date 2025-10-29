/**
 * Bulk tests for gesture effect files
 */
import { describe, it, expect } from 'vitest';

// Import effect gestures
import wave from '../../../../src/core/gestures/effects/wave.js';
import drift from '../../../../src/core/gestures/effects/drift.js';
import flicker from '../../../../src/core/gestures/effects/flicker.js';
import burst from '../../../../src/core/gestures/effects/burst.js';
import directional from '../../../../src/core/gestures/effects/directional.js';
import settle from '../../../../src/core/gestures/effects/settle.js';
import fade from '../../../../src/core/gestures/effects/fade.js';
import hold from '../../../../src/core/gestures/effects/hold.js';
import breathe from '../../../../src/core/gestures/effects/breathe.js';
import expand from '../../../../src/core/gestures/effects/expand.js';
import contract from '../../../../src/core/gestures/effects/contract.js';
import flash from '../../../../src/core/gestures/effects/flash.js';
import glow from '../../../../src/core/gestures/effects/glow.js';
import peek from '../../../../src/core/gestures/effects/peek.js';
import runningman from '../../../../src/core/gestures/effects/runningman.js';
import charleston from '../../../../src/core/gestures/effects/charleston.js';

describe('Gesture Effects - Bulk Validation', () => {
    const gestures = [
        { gesture: wave, name: 'wave' },
        { gesture: drift, name: 'drift' },
        { gesture: flicker, name: 'flicker' },
        { gesture: burst, name: 'burst' },
        { gesture: directional, name: 'directional' },
        { gesture: settle, name: 'settle' },
        { gesture: fade, name: 'fade' },
        { gesture: hold, name: 'hold' },
        { gesture: breathe, name: 'breathe' },
        { gesture: expand, name: 'expand' },
        { gesture: contract, name: 'contract' },
        { gesture: flash, name: 'flash' },
        { gesture: glow, name: 'glow' },
        { gesture: peek, name: 'peek' },
        { gesture: runningman, name: 'runningman' },
        { gesture: charleston, name: 'charleston' }
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

            it(`${name} should have apply function`, () => {
                if (gesture.apply) {
                    expect(typeof gesture.apply).toBe('function');
                }
            });
        });
    });
});
