/**
 * @fileoverview Side-effect module: registers ONLY the electric elemental gestures
 * (lean electric build). Mirror of the Electric section of elemental-gestures.js.
 * @module gestures/elemental-gestures-electric
 */

import electricShock from './elemental/electric/electricshock.js';
import electricOverload from './elemental/electric/electricoverload.js';
import electricGlitch from './elemental/electric/electricglitch.js';
import electricCrackle from './elemental/electric/electriccrackle.js';
import electricCharge from './elemental/electric/electriccharge.js';
import electricAura from './elemental/electric/electricaura.js';
import electricStatic from './elemental/electric/electricstatic.js';
import electricCrown from './elemental/electric/electriccrown.js';
import electricDance from './elemental/electric/electricdance.js';
import electricHelix from './elemental/electric/electrichelix.js';
import electricPillar from './elemental/electric/electricpillar.js';
import electricDrill from './elemental/electric/electricdrill.js';
import electricFlourish from './elemental/electric/electricflourish.js';
import electricVortex from './elemental/electric/electricvortex.js';
import electricBarrage from './elemental/electric/electricbarrage.js';
import electricImpact from './elemental/electric/electricimpact.js';
import electricBlast from './elemental/electric/electricblast.js';
import electricSurge from './elemental/electric/electricsurge.js';
import electricZap from './elemental/electric/electriczap.js';
import electricMeditation from './elemental/electric/electricmeditation.js';
import electricTwirl from './elemental/electric/electrictwirl.js';
import electricShield from './elemental/electric/electricshield.js';

import { GESTURE_REGISTRY, GESTURE_TYPES } from './index.js';

function reg(gesture) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}

[
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
].forEach(reg);
