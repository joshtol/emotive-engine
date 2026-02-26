/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Gesture Registration (Side-effect module)
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Registers all elemental gestures into the gesture registry.
 * Importing this module is a SIDE EFFECT — it adds 151+ elemental gestures
 * to GESTURE_REGISTRY. The base 3D bundle omits this import so it stays lean;
 * the "3d-with-elementals" bundle includes it.
 *
 * @module gestures/elemental-gestures
 */

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ ELEMENTAL GESTURE IMPORTS
// └─────────────────────────────────────────────────────────────────────────────────────

// Electric
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

// Water
import waterSplash from './elemental/water/watersplash.js';
import waterDrench from './elemental/water/waterdrench.js';
import waterSoak from './elemental/water/watersoak.js';
import waterFlow from './elemental/water/waterflow.js';
import waterTide from './elemental/water/watertide.js';
import waterLiquefy from './elemental/water/waterliquefy.js';
import waterPool from './elemental/water/waterpool.js';
import waterVortex from './elemental/water/watervortex.js';
import waterCrown from './elemental/water/watercrown.js';
import waterDance from './elemental/water/waterdance.js';
import waterDrill from './elemental/water/waterdrill.js';
import waterHelix from './elemental/water/waterhelix.js';
import waterMeditation from './elemental/water/watermeditation.js';
import waterPillar from './elemental/water/waterpillar.js';
import waterFlourish from './elemental/water/waterflourish.js';
import waterBarrage from './elemental/water/waterbarrage.js';
import waterImpact from './elemental/water/waterimpact.js';
import waterCrush from './elemental/water/watercrush.js';
import waterTwirl from './elemental/water/watertwirl.js';
import waterShield from './elemental/water/watershield.js';

// Fire
import fireBurn from './elemental/fire/burn.js';
import fireScorch from './elemental/fire/scorch.js';
import fireCombust from './elemental/fire/combust.js';
import fireRadiate from './elemental/fire/radiate.js';
import fireBlaze from './elemental/fire/blaze.js';
import flameVortexGesture from './elemental/fire/flameVortex.js';
import firedanceGesture from './elemental/fire/firedance.js';
import phoenixGesture from './elemental/fire/phoenix.js';
import fireflourishGesture from './elemental/fire/fireflourish.js';
import firecrownGesture from './elemental/fire/firecrown.js';
import firemeditationGesture from './elemental/fire/firemeditation.js';
import firedrillGesture from './elemental/fire/firedrill.js';
import firepillarGesture from './elemental/fire/firepillar.js';
import firehelixGesture from './elemental/fire/firehelix.js';
import firebarrageGesture from './elemental/fire/firebarrage.js';
import fireimpactGesture from './elemental/fire/fireimpact.js';
import fireblastGesture from './elemental/fire/fireblast.js';
import fireTwirl from './elemental/fire/firetwirl.js';
import fireShield from './elemental/fire/fireshield.js';

// Void
import voidDrain from './elemental/void/voiddrain.js';
import voidHollow from './elemental/void/voidhollow.js';
import voidCorrupt from './elemental/void/voidcorrupt.js';
import voidConsume from './elemental/void/voidconsume.js';
import voidSingularity from './elemental/void/voidsingularity.js';
import voidCrown from './elemental/void/voidcrown.js';
import voidDance from './elemental/void/voiddance.js';
import voidHelix from './elemental/void/voidhelix.js';
import voidPillar from './elemental/void/voidpillar.js';
import voidDrill from './elemental/void/voiddrill.js';
import voidFlourish from './elemental/void/voidflourish.js';
import voidVortex from './elemental/void/voidvortex.js';
import voidBarrage from './elemental/void/voidbarrage.js';
import voidImpact from './elemental/void/voidimpact.js';
import voidMeditation from './elemental/void/voidmeditation.js';
import voidTwirl from './elemental/void/voidtwirl.js';
import voidShield from './elemental/void/voidshield.js';

// Ice
import iceCrown from './elemental/ice/icecrown.js';
import iceDance from './elemental/ice/icedance.js';
import icePillar from './elemental/ice/icepillar.js';
import iceHelix from './elemental/ice/icehelix.js';
import iceMeditation from './elemental/ice/icemeditation.js';
import iceVortex from './elemental/ice/icevortex.js';
import iceSplash from './elemental/ice/icesplash.js';
import iceEncase from './elemental/ice/iceencase.js';
import iceDrill from './elemental/ice/icedrill.js';
import iceFlourish from './elemental/ice/iceflourish.js';
import iceBarrage from './elemental/ice/icebarrage.js';
import iceImpact from './elemental/ice/iceimpact.js';
import iceMist from './elemental/ice/icemist.js';
import iceShiver from './elemental/ice/iceshiver.js';
import iceTwirl from './elemental/ice/icetwirl.js';
import iceShield from './elemental/ice/iceshield.js';

// Light
import lightBlind from './elemental/light/lightblind.js';
import lightPurify from './elemental/light/lightpurify.js';
import lightCleanse from './elemental/light/lightcleanse.js';
import lightRadiate from './elemental/light/lightradiate.js';
import lightGlow from './elemental/light/lightglow.js';
import lightBeacon from './elemental/light/lightbeacon.js';
import lightAscend from './elemental/light/lightascend.js';
import lightIlluminate from './elemental/light/lightilluminate.js';
import lightDissolve from './elemental/light/lightdissolve.js';
import lightMeditation from './elemental/light/lightmeditation.js';
import lightCrown from './elemental/light/lightcrown.js';
import lightDance from './elemental/light/lightdance.js';
import lightHelix from './elemental/light/lighthelix.js';
import lightPillar from './elemental/light/lightpillar.js';
import lightDrill from './elemental/light/lightdrill.js';
import lightFlourish from './elemental/light/lightflourish.js';
import lightVortex from './elemental/light/lightvortex.js';
import lightBarrage from './elemental/light/lightbarrage.js';
import lightImpact from './elemental/light/lightimpact.js';
import lightBlast from './elemental/light/lightblast.js';
import lightSurge from './elemental/light/lightsurge.js';
import lightTwirl from './elemental/light/lighttwirl.js';
import lightShield from './elemental/light/lightshield.js';

// Earth
import earthPetrify from './elemental/earth/earthpetrify.js';
import earthBurden from './elemental/earth/earthburden.js';
import earthRumble from './elemental/earth/earthrumble.js';
import earthQuake from './elemental/earth/earthquake.js';
import earthEncase from './elemental/earth/earthencase.js';
import earthCrumble from './elemental/earth/earthcrumble.js';
import earthShatter from './elemental/earth/earthshatter.js';
import earthErode from './elemental/earth/eartherode.js';
import earthMeditation from './elemental/earth/earthmeditation.js';
import earthCrown from './elemental/earth/earthcrown.js';
import earthDance from './elemental/earth/earthdance.js';
import earthHelix from './elemental/earth/earthhelix.js';
import earthPillar from './elemental/earth/earthpillar.js';
import earthDrill from './elemental/earth/earthdrill.js';
import earthFlourish from './elemental/earth/earthflourish.js';
import earthVortex from './elemental/earth/earthvortex.js';
import earthBarrage from './elemental/earth/earthbarrage.js';
import earthImpact from './elemental/earth/earthimpact.js';
import earthBlast from './elemental/earth/earthblast.js';
import earthSurge from './elemental/earth/earthsurge.js';
import earthTwirl from './elemental/earth/earthtwirl.js';
import earthShield from './elemental/earth/earthshield.js';

// Nature
import natureEntangle from './elemental/nature/entangle.js';
import natureRoot from './elemental/nature/root.js';
import natureTwirl from './elemental/nature/naturetwirl.js';
import natureConstrict from './elemental/nature/natureconstrict.js';
import natureBloom from './elemental/nature/bloom.js';
import natureCrown from './elemental/nature/naturecrown.js';
import natureDance from './elemental/nature/naturedance.js';
import natureDrill from './elemental/nature/naturedrill.js';
import natureRingFlourish from './elemental/nature/natureflourish.js';
import natureHelix from './elemental/nature/naturehelix.js';
import natureMeditation from './elemental/nature/naturemeditation.js';
import naturePillar from './elemental/nature/naturepillar.js';
import natureVortex from './elemental/nature/naturevortex.js';
import natureBarrage from './elemental/nature/naturebarrage.js';
import natureShield from './elemental/nature/natureshield.js';
import seedBurst from './elemental/nature/seedburst.js';
import seedPod from './elemental/nature/seedpod.js';
import natureCleanse from './elemental/nature/naturecleanse.js';
import natureSplinter from './elemental/nature/naturesplinter.js';
import natureSprout from './elemental/nature/sprout.js';
import natureFlourish from './elemental/nature/flourish.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ REGISTER INTO GESTURE REGISTRY
// └─────────────────────────────────────────────────────────────────────────────────────
// GESTURE_TYPES.override is the _transformNames array by reference.
// Adding to it here extends the base registry at runtime.

import { GESTURE_REGISTRY, GESTURE_TYPES } from './index.js';

const zapGesture = electricZap;

function reg(gesture) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    GESTURE_TYPES.override.push(gesture.name);
}

[
    // Water
    waterSplash, waterDrench, waterSoak, waterFlow, waterTide,
    waterLiquefy, waterPool, waterVortex,
    waterCrown, waterDance, waterDrill, waterHelix, waterMeditation,
    waterPillar, waterFlourish, waterBarrage, waterImpact, waterCrush, waterTwirl, waterShield,
    // Fire
    fireBurn, fireScorch, fireCombust,
    flameVortexGesture, firedanceGesture, phoenixGesture,
    fireflourishGesture, firecrownGesture, firemeditationGesture,
    firedrillGesture, firepillarGesture, firehelixGesture,
    firebarrageGesture, fireimpactGesture, fireblastGesture,
    fireRadiate, fireBlaze, fireTwirl, fireShield,
    // Electric
    electricShock, electricOverload, electricGlitch,
    electricCrackle, electricCharge, electricAura, electricStatic,
    electricCrown, electricDance, electricHelix, electricPillar,
    electricDrill, electricFlourish, electricVortex, electricBarrage,
    electricImpact, electricBlast, electricSurge, electricZap,
    electricMeditation, zapGesture, electricTwirl, electricShield,
    // Void
    voidDrain, voidHollow,
    voidCorrupt,
    voidConsume, voidSingularity,
    voidCrown, voidDance, voidHelix, voidPillar, voidDrill,
    voidFlourish, voidVortex, voidBarrage, voidImpact,
    voidMeditation, voidTwirl, voidShield,
    // Ice
    iceCrown, iceDance, icePillar, iceHelix, iceMeditation,
    iceVortex, iceSplash, iceEncase, iceDrill, iceFlourish,
    iceBarrage, iceImpact,
    iceMist, iceShiver, iceTwirl, iceShield,
    // Light
    lightBlind, lightPurify, lightCleanse, lightRadiate, lightGlow, lightBeacon,
    lightAscend, lightIlluminate, lightDissolve,
    lightCrown, lightDance, lightHelix, lightPillar, lightDrill,
    lightFlourish, lightVortex, lightBarrage, lightImpact, lightBlast, lightSurge,
    lightMeditation, lightTwirl, lightShield,
    // Earth
    earthPetrify, earthBurden, earthRumble, earthQuake,
    earthEncase, earthCrumble, earthShatter, earthErode,
    earthMeditation, earthCrown, earthDance, earthHelix, earthPillar,
    earthDrill, earthFlourish, earthVortex, earthBarrage, earthImpact,
    earthBlast, earthSurge, earthTwirl, earthShield,
    // Nature
    natureEntangle, natureRoot, natureTwirl, natureConstrict,
    natureBloom, natureCrown, natureDance, natureDrill, natureRingFlourish,
    natureHelix, natureMeditation, naturePillar, natureVortex,
    natureBarrage, natureShield, seedBurst, seedPod,
    natureCleanse, natureSplinter,
    natureSprout, natureFlourish
].forEach(reg);
