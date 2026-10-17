/**
 * @fileoverview Registers the fire elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-fire` entry
 * imports only this one.
 * @module gestures/elemental/fire/register
 */

import fireBurn from './burn.js';
import fireScorch from './scorch.js';
import fireCombust from './combust.js';
import fireRadiate from './radiate.js';
import fireBlaze from './blaze.js';
import flameVortexGesture from './flameVortex.js';
import firedanceGesture from './firedance.js';
import phoenixGesture from './phoenix.js';
import fireflourishGesture from './fireflourish.js';
import firecrownGesture from './firecrown.js';
import firemeditationGesture from './firemeditation.js';
import firedrillGesture from './firedrill.js';
import firepillarGesture from './firepillar.js';
import firehelixGesture from './firehelix.js';
import firebarrageGesture from './firebarrage.js';
import fireimpactGesture from './fireimpact.js';
import fireblastGesture from './fireblast.js';
import fireTwirl from './firetwirl.js';
import fireShield from './fireshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    fireBurn,
    fireScorch,
    fireCombust,
    flameVortexGesture,
    firedanceGesture,
    phoenixGesture,
    fireflourishGesture,
    firecrownGesture,
    firemeditationGesture,
    firedrillGesture,
    firepillarGesture,
    firehelixGesture,
    firebarrageGesture,
    fireimpactGesture,
    fireblastGesture,
    fireRadiate,
    fireBlaze,
    fireTwirl,
    fireShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
