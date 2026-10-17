/**
 * @fileoverview Registers the electric elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-electric` entry
 * imports only this one.
 * @module gestures/elemental/electric/register
 */

import electricShock from './electricshock.js';
import electricOverload from './electricoverload.js';
import electricGlitch from './electricglitch.js';
import electricCrackle from './electriccrackle.js';
import electricCharge from './electriccharge.js';
import electricAura from './electricaura.js';
import electricStatic from './electricstatic.js';
import electricCrown from './electriccrown.js';
import electricDance from './electricdance.js';
import electricHelix from './electrichelix.js';
import electricPillar from './electricpillar.js';
import electricDrill from './electricdrill.js';
import electricFlourish from './electricflourish.js';
import electricVortex from './electricvortex.js';
import electricBarrage from './electricbarrage.js';
import electricImpact from './electricimpact.js';
import electricBlast from './electricblast.js';
import electricSurge from './electricsurge.js';
import electricZap from './electriczap.js';
import electricMeditation from './electricmeditation.js';
import electricTwirl from './electrictwirl.js';
import electricShield from './electricshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    electricShock,
    electricOverload,
    electricGlitch,
    electricCrackle,
    electricCharge,
    electricAura,
    electricStatic,
    electricCrown,
    electricDance,
    electricHelix,
    electricPillar,
    electricDrill,
    electricFlourish,
    electricVortex,
    electricBarrage,
    electricImpact,
    electricBlast,
    electricSurge,
    electricZap,
    electricMeditation,
    electricTwirl,
    electricShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
