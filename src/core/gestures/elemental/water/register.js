/**
 * @fileoverview Registers the water elemental gestures into the gesture
 * registry. Side-effect module: importing it adds the gestures to GESTURE_REGISTRY.
 * elemental-gestures.js imports all eight element sets; the lean `./3d-water` entry
 * imports only this one.
 * @module gestures/elemental/water/register
 */

import waterSplash from './watersplash.js';
import waterDrench from './waterdrench.js';
import waterSoak from './watersoak.js';
import waterFlow from './waterflow.js';
import waterTide from './watertide.js';
import waterLiquefy from './waterliquefy.js';
import waterPool from './waterpool.js';
import waterVortex from './watervortex.js';
import waterCrown from './watercrown.js';
import waterDance from './waterdance.js';
import waterDrill from './waterdrill.js';
import waterHelix from './waterhelix.js';
import waterMeditation from './watermeditation.js';
import waterPillar from './waterpillar.js';
import waterFlourish from './waterflourish.js';
import waterBarrage from './waterbarrage.js';
import waterImpact from './waterimpact.js';
import waterCrush from './watercrush.js';
import waterTwirl from './watertwirl.js';
import waterShield from './watershield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from '../../index.js';

export const GESTURES = [
    waterSplash,
    waterDrench,
    waterSoak,
    waterFlow,
    waterTide,
    waterLiquefy,
    waterPool,
    waterVortex,
    waterCrown,
    waterDance,
    waterDrill,
    waterHelix,
    waterMeditation,
    waterPillar,
    waterFlourish,
    waterBarrage,
    waterImpact,
    waterCrush,
    waterTwirl,
    waterShield,
];

for (const gesture of GESTURES) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}
