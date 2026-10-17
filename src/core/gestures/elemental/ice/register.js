/**
 * @fileoverview Registers the ice elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-ice` entry
 * imports only this one.
 * @module gestures/elemental/ice/register
 */

import iceCrown from './icecrown.js';
import iceDance from './icedance.js';
import icePillar from './icepillar.js';
import iceHelix from './icehelix.js';
import iceMeditation from './icemeditation.js';
import iceVortex from './icevortex.js';
import iceSplash from './icesplash.js';
import iceEncase from './iceencase.js';
import iceDrill from './icedrill.js';
import iceFlourish from './iceflourish.js';
import iceBarrage from './icebarrage.js';
import iceImpact from './iceimpact.js';
import iceMist from './icemist.js';
import iceShiver from './iceshiver.js';
import iceTwirl from './icetwirl.js';
import iceShield from './iceshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    iceCrown,
    iceDance,
    icePillar,
    iceHelix,
    iceMeditation,
    iceVortex,
    iceSplash,
    iceEncase,
    iceDrill,
    iceFlourish,
    iceBarrage,
    iceImpact,
    iceMist,
    iceShiver,
    iceTwirl,
    iceShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
