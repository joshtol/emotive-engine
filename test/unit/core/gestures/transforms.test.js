/**
 * Bulk tests for gesture transform files
 */
import { describe, it, expect } from 'vitest';

// Import transform gestures
import spin from '../../../../src/core/gestures/transforms/spin.js';
import jump from '../../../../src/core/gestures/transforms/jump.js';
import morph from '../../../../src/core/gestures/transforms/morph.js';
import stretch from '../../../../src/core/gestures/transforms/stretch.js';
import tilt from '../../../../src/core/gestures/transforms/tilt.js';
import orbital from '../../../../src/core/gestures/transforms/orbital.js';
import hula from '../../../../src/core/gestures/transforms/hula.js';
import twist from '../../../../src/core/gestures/transforms/twist.js';

describe('Gesture Transforms - Bulk Validation', () => {
    const gestures = [
        { gesture: spin, name: 'spin' },
        { gesture: jump, name: 'jump' },
        { gesture: morph, name: 'morph' },
        { gesture: stretch, name: 'stretch' },
        { gesture: tilt, name: 'tilt' },
        { gesture: orbital, name: 'orbital' },
        { gesture: hula, name: 'hula' },
        { gesture: twist, name: 'twist' }
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

            it(`${name} should have type override`, () => {
                if (gesture.type) {
                    expect(gesture.type).toBe('override');
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
