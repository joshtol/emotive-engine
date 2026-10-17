/**
 * @fileoverview Registers the earth elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-earth` entry
 * imports only this one.
 * @module gestures/elemental/earth/register
 */

import earthPetrify from './earthpetrify.js';
import earthBurden from './earthburden.js';
import earthRumble from './earthrumble.js';
import earthQuake from './earthquake.js';
import earthEncase from './earthencase.js';
import earthCrumble from './earthcrumble.js';
import earthShatter from './earthshatter.js';
import earthErode from './eartherode.js';
import earthMeditation from './earthmeditation.js';
import earthCrown from './earthcrown.js';
import earthDance from './earthdance.js';
import earthHelix from './earthhelix.js';
import earthPillar from './earthpillar.js';
import earthDrill from './earthdrill.js';
import earthFlourish from './earthflourish.js';
import earthVortex from './earthvortex.js';
import earthBarrage from './earthbarrage.js';
import earthImpact from './earthimpact.js';
import earthBlast from './earthblast.js';
import earthSurge from './earthsurge.js';
import earthTwirl from './earthtwirl.js';
import earthShield from './earthshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    earthPetrify,
    earthBurden,
    earthRumble,
    earthQuake,
    earthEncase,
    earthCrumble,
    earthShatter,
    earthErode,
    earthMeditation,
    earthCrown,
    earthDance,
    earthHelix,
    earthPillar,
    earthDrill,
    earthFlourish,
    earthVortex,
    earthBarrage,
    earthImpact,
    earthBlast,
    earthSurge,
    earthTwirl,
    earthShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
