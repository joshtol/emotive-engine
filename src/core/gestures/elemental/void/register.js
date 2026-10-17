/**
 * @fileoverview Registers the void elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-void` entry
 * imports only this one.
 * @module gestures/elemental/void/register
 */

import voidDrain from './voiddrain.js';
import voidHollow from './voidhollow.js';
import voidCorrupt from './voidcorrupt.js';
import voidConsume from './voidconsume.js';
import voidSingularity from './voidsingularity.js';
import voidCrown from './voidcrown.js';
import voidDance from './voiddance.js';
import voidHelix from './voidhelix.js';
import voidPillar from './voidpillar.js';
import voidDrill from './voiddrill.js';
import voidFlourish from './voidflourish.js';
import voidVortex from './voidvortex.js';
import voidBarrage from './voidbarrage.js';
import voidImpact from './voidimpact.js';
import voidMeditation from './voidmeditation.js';
import voidTwirl from './voidtwirl.js';
import voidShield from './voidshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    voidDrain,
    voidHollow,
    voidCorrupt,
    voidConsume,
    voidSingularity,
    voidCrown,
    voidDance,
    voidHelix,
    voidPillar,
    voidDrill,
    voidFlourish,
    voidVortex,
    voidBarrage,
    voidImpact,
    voidMeditation,
    voidTwirl,
    voidShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
