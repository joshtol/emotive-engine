/**
 * @fileoverview Registers the light elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-light` entry
 * imports only this one.
 * @module gestures/elemental/light/register
 */

import lightBlind from './lightblind.js';
import lightPurify from './lightpurify.js';
import lightCleanse from './lightcleanse.js';
import lightRadiate from './lightradiate.js';
import lightGlow from './lightglow.js';
import lightBeacon from './lightbeacon.js';
import lightAscend from './lightascend.js';
import lightIlluminate from './lightilluminate.js';
import lightDissolve from './lightdissolve.js';
import lightMeditation from './lightmeditation.js';
import lightCrown from './lightcrown.js';
import lightDance from './lightdance.js';
import lightHelix from './lighthelix.js';
import lightPillar from './lightpillar.js';
import lightDrill from './lightdrill.js';
import lightFlourish from './lightflourish.js';
import lightVortex from './lightvortex.js';
import lightBarrage from './lightbarrage.js';
import lightImpact from './lightimpact.js';
import lightBlast from './lightblast.js';
import lightSurge from './lightsurge.js';
import lightTwirl from './lighttwirl.js';
import lightShield from './lightshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    lightBlind,
    lightPurify,
    lightCleanse,
    lightRadiate,
    lightGlow,
    lightBeacon,
    lightAscend,
    lightIlluminate,
    lightDissolve,
    lightCrown,
    lightDance,
    lightHelix,
    lightPillar,
    lightDrill,
    lightFlourish,
    lightVortex,
    lightBarrage,
    lightImpact,
    lightBlast,
    lightSurge,
    lightMeditation,
    lightTwirl,
    lightShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
