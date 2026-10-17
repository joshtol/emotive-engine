/**
 * @fileoverview Registers the nature elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-nature` entry
 * imports only this one.
 * @module gestures/elemental/nature/register
 */

import natureEntangle from './entangle.js';
import natureRoot from './root.js';
import natureTwirl from './naturetwirl.js';
import natureConstrict from './natureconstrict.js';
import natureBloom from './bloom.js';
import natureCrown from './naturecrown.js';
import natureDance from './naturedance.js';
import natureDrill from './naturedrill.js';
import natureRingFlourish from './natureflourish.js';
import natureHelix from './naturehelix.js';
import natureMeditation from './naturemeditation.js';
import naturePillar from './naturepillar.js';
import natureVortex from './naturevortex.js';
import natureBarrage from './naturebarrage.js';
import natureShield from './natureshield.js';
import seedBurst from './seedburst.js';
import seedPod from './seedpod.js';
import natureCleanse from './naturecleanse.js';
import natureSplinter from './naturesplinter.js';
import natureSprout from './sprout.js';
import natureFlourish from './flourish.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    natureEntangle,
    natureRoot,
    natureTwirl,
    natureConstrict,
    natureBloom,
    natureCrown,
    natureDance,
    natureDrill,
    natureRingFlourish,
    natureHelix,
    natureMeditation,
    naturePillar,
    natureVortex,
    natureBarrage,
    natureShield,
    seedBurst,
    seedPod,
    natureCleanse,
    natureSplinter,
    natureSprout,
    natureFlourish,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
