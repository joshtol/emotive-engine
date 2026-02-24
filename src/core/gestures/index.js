/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0 - Gesture Registry
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Central registry for all gesture animations with plugin support
 * @author Emotive Engine Team
 * @version 4.0.0
 * @module gestures
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Control center for all gestures with full plugin adapter integration.
 * ║ • Three gesture categories: motions, transforms, effects
 * ║ • Core gestures loaded synchronously at startup
 * ║ • Plugin gestures registered dynamically via adapter
 * ║ • Value-agnostic configurations for easy tuning
 * ║
 * ║ TO ADD A PLUGIN GESTURE:
 * ║ Use pluginAdapter.registerPluginGesture() from your plugin
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           GESTURE CATEGORIZATION
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Categories are organized by USAGE INTENT, not technical implementation:
 * ║
 * ║ MOTION_GESTURES - Continuous idle behaviors & dance moves
 * ║   Examples: bob, breathe, sway, bounce, step, kick
 * ║   Intent: Ongoing rhythmic movement, can layer with music
 * ║   Technical: type='blending', has '3d'.evaluate()
 * ║
 * ║ TRANSFORM_GESTURES - Dramatic one-shot animations
 * ║   Examples: jump, spin, flip, shatter, rage, lunge
 * ║   Intent: Punctuated actions that demand attention
 * ║   Technical: type='override', has '3d'.evaluate()
 * ║
 * ║ EFFECT_GESTURES - Environmental/particle overlays
 * ║   Examples: wave, drift, rain, cascade, scatter
 * ║   Intent: Atmospheric effects, weather, particle behaviors
 * ║   Technical: type='override' (but categorized by visual purpose)
 * ║
 * ║ NOTE: The 'type' property (override/blending) controls animation blending,
 * ║ while the category (motion/transform/effect) is for semantic organization.
 * ║ Some effects have type='override' but are categorized as effects because
 * ║ an LLM asking "make it drift" expects drift in effects, not transforms.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           INTENTIONAL REDUNDANCY
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Some gestures appear similar but are kept separate for LLM semantic mapping:
 * ║
 * ║ VIBRATION GROUP: vibrate, shake, jitter, twitch
 * ║   - vibrate: mechanical, robotic tremor
 * ║   - shake: forceful, angry shaking
 * ║   - jitter: nervous energy, anxiety
 * ║   - twitch: paranoid, startled micro-movements
 * ║   An LLM saying "trembling with fear" vs "shaking with rage" should map
 * ║   to different gestures even if the underlying math is similar.
 * ║
 * ║ EXPANSION GROUP: expand, contract, breathe, inflate, deflate
 * ║   - expand/contract: raw physics (push out / pull in)
 * ║   - breathe: organic, living rhythm
 * ║   - inflate/deflate: cartoon balloon physics
 * ║   Different emotional contexts warrant distinct gesture names.
 * ║
 * ║ OSCILLATION GROUP: rock, teeter, pendulum, wobble
 * ║   - rock: gentle, soothing
 * ║   - teeter: unstable, about to fall
 * ║   - pendulum: hypnotic, measured
 * ║   - wobble: drunk, dizzy, unsteady
 * ║   Each carries different emotional connotation for storytelling.
 * ║
 * ║ INTENSITY GROUP: rage, fury
 * ║   - rage: slow build, dramatic explosion (2000ms)
 * ║   - fury: quick burst of anger (800ms)
 * ║   Both express anger but with different dramatic timing.
 * ║
 * ║ This redundancy enables richer LLM-driven expression and choreography.
 * ║ The cost (code size) is minimal since factories share implementation.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           FOLDER STRUCTURE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Gestures are organized by semantic purpose for new developer intuition:
 * ║
 * ║ idle/           - Subtle continuous behaviors
 * ║   breathing/    - breathe, expand, contract, pulse
 * ║   swaying/      - sway, float, bob, lean (+ directionals)
 * ║   fidgeting/    - jitter, twitch, vibrate, shake, wiggle
 * ║
 * ║ dance/          - Music-synchronized movements
 * ║   steps/        - stepLeft/Right/Up/Down, slideLeft/Right
 * ║   moves/        - runningman, charleston, hula, twist
 * ║   accents/      - pop, flare, swell, swagger, dip, bounce
 * ║   orbits/       - orbit (+ directionals)
 * ║
 * ║ actions/        - Deliberate character movements
 * ║   locomotion/   - jump (+ directionals), rush, lunge
 * ║   acrobatics/   - spin, flip, backflip
 * ║   gesturing/    - point, kick, bow, nod, reach, headBob
 * ║   poses/        - crouch, tilt (+ directionals)
 * ║
 * ║ reactions/      - Responses to events
 * ║   impacts/      - oof, recoil, knockdown, knockout, squash, stretch, etc.
 * ║   emotions/     - rage, fury, battlecry, charge
 * ║   oscillations/ - wobble, teeter, rock, pendulum
 * ║
 * ║ destruction/    - Breaking apart effects
 * ║   shatter/      - shatter, shatterFactory variants
 * ║   dissolve/     - dissolve directionals
 * ║   reform/       - morph
 * ║
 * ║ atmosphere/     - Environmental effects
 * ║   weather/      - rain, drift, vortex, cascade
 * ║   particles/    - confetti, fizz, scatter, swarm, burst, ripple, wave
 * ║   glow/         - flash, glow, bloom, flicker, shiver, heartbeat, snap, elasticBounce
 * ║   control/      - hold, fade, settle, peek, directional, magnetic
 * ║
 * ║ _shared/        - Common utilities (directions.js)
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import pluginAdapter from './plugin-adapter.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT IDLE GESTURES (Subtle continuous behaviors)
// └─────────────────────────────────────────────────────────────────────────────────────
// idle/breathing/
import breathe from './idle/breathing/breathe.js';
import expand from './idle/breathing/expand.js';
import contract from './idle/breathing/contract.js';
import pulse from './idle/breathing/pulse.js';
// idle/swaying/
import sway from './idle/swaying/sway.js';
import float from './idle/swaying/float.js';
import floatUp from './idle/swaying/floatUp.js';
import floatDown from './idle/swaying/floatDown.js';
import floatLeft from './idle/swaying/floatLeft.js';
import floatRight from './idle/swaying/floatRight.js';
// bob import removed - redundant with headBob
import lean from './idle/swaying/lean.js';
import leanLeft from './idle/swaying/leanLeft.js';
import leanRight from './idle/swaying/leanRight.js';
// idle/fidgeting/
import jitter from './idle/fidgeting/jitter.js';
import twitch from './idle/fidgeting/twitch.js';
import vibrate from './idle/fidgeting/vibrate.js';
import shake from './idle/fidgeting/shake.js';
import wiggle from './idle/fidgeting/wiggle.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT DANCE GESTURES (Music-synchronized movements)
// └─────────────────────────────────────────────────────────────────────────────────────
// dance/steps/
import stepLeft from './dance/steps/stepLeft.js';
import stepRight from './dance/steps/stepRight.js';
import stepUp from './dance/steps/stepUp.js';
import stepDown from './dance/steps/stepDown.js';
import slideLeft from './dance/steps/slideLeft.js';
import slideRight from './dance/steps/slideRight.js';
// dance/moves/
import runningman from './dance/moves/runningman.js';
import charleston from './dance/moves/charleston.js';
import hula from './dance/moves/hula.js';
import twist from './dance/moves/twist.js';
// dance/accents/
import pop from './dance/accents/pop.js';
import flare from './dance/accents/flare.js';
import swell from './dance/accents/swell.js';
import swagger from './dance/accents/swagger.js';
import dip from './dance/accents/dip.js';
import bounce from './dance/accents/bounce.js';
// dance/orbits/
import orbit from './dance/orbits/orbit.js';
import orbitLeft from './dance/orbits/orbitLeft.js';
import orbitRight from './dance/orbits/orbitRight.js';
import orbitUp from './dance/orbits/orbitUp.js';
import orbitDown from './dance/orbits/orbitDown.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT ACTION GESTURES (Deliberate character movements)
// └─────────────────────────────────────────────────────────────────────────────────────
// actions/locomotion/
import jump from './actions/locomotion/jump.js';
// jumpUp removed - redundant with jump (which already goes up)
import jumpDown from './actions/locomotion/jumpDown.js';
import jumpLeft from './actions/locomotion/jumpLeft.js';
import jumpRight from './actions/locomotion/jumpRight.js';
import { createRushGesture } from './actions/locomotion/rushFactory.js';
import lunge from './actions/locomotion/lunge.js';
import { createLungeGesture } from './actions/locomotion/lungeFactory.js';
// actions/acrobatics/
import spin from './actions/acrobatics/spin.js';
import spinLeft from './actions/acrobatics/spinLeft.js';
import spinRight from './actions/acrobatics/spinRight.js';
import flip from './actions/acrobatics/flip.js';
import backflip from './actions/acrobatics/backflip.js';
// actions/gesturing/
import point from './actions/gesturing/point.js';
import pointUp from './actions/gesturing/pointUp.js';
import pointDown from './actions/gesturing/pointDown.js';
import pointLeft from './actions/gesturing/pointLeft.js';
import pointRight from './actions/gesturing/pointRight.js';
import kickLeft from './actions/gesturing/kickLeft.js';
import kickRight from './actions/gesturing/kickRight.js';
import bow from './actions/gesturing/bow.js';
// bowFactory removed - directional bow gestures (bowForward, bowBack, bowLeft, bowRight) were
// semantically incorrect. A bow is always forward toward the audience. Use tilt for lateral leans.
import nod from './actions/gesturing/nod.js';
import reach from './actions/gesturing/reach.js';
import headBob from './actions/gesturing/headBob.js';
// actions/poses/
import crouch from './actions/poses/crouch.js';
import tilt from './actions/poses/tilt.js';
import tiltUp from './actions/poses/tiltUp.js';
import tiltDown from './actions/poses/tiltDown.js';
import tiltLeft from './actions/poses/tiltLeft.js';
import tiltRight from './actions/poses/tiltRight.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT REACTION GESTURES (Responses to events)
// └─────────────────────────────────────────────────────────────────────────────────────
// reactions/impacts/
import { createOofGesture } from './reactions/impacts/oofFactory.js';
import recoil from './reactions/impacts/recoil.js';
import { createRecoilGesture } from './reactions/impacts/recoilFactory.js';
import knockdown from './reactions/impacts/knockdown.js';
import knockout from './reactions/impacts/knockout.js';
import inflate from './reactions/impacts/inflate.js';
import deflate from './reactions/impacts/deflate.js';
import squash from './reactions/impacts/squash.js';
import stretch from './reactions/impacts/stretch.js';
import pancake from './reactions/impacts/pancake.js';
// reactions/emotions/
import rage from './reactions/emotions/rage.js';
import fury from './reactions/emotions/fury.js';
import battlecry from './reactions/emotions/battlecry.js';
import charge from './reactions/emotions/charge.js';
// reactions/oscillations/
import wobble from './reactions/oscillations/wobble.js';
import teeter from './reactions/oscillations/teeter.js';
import rock from './reactions/oscillations/rock.js';
import pendulum from './reactions/oscillations/pendulum.js';
// reactions/cracks/
import {
    crackFront, crackBack, crackLeft, crackRight, crackUp, crackDown, crackHeal
} from './reactions/cracks/crackFactory.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT DESTRUCTION GESTURES (Breaking apart effects)
// └─────────────────────────────────────────────────────────────────────────────────────
// destruction/shatter/
import shatter from './destruction/shatter/shatter.js';
import { createShatterGesture } from './destruction/shatter/shatterFactory.js';
// destruction/dissolve/
import { createDissolveGesture } from './destruction/dissolve/dissolveFactory.js';
// destruction/elemental/ - Electric effect gestures (no shatter, just visual effects)
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
const zapGesture = electricZap;
import electricMeditation from './elemental/electric/electricmeditation.js';
import electricTwirl from './elemental/electric/electrictwirl.js';
import electricShield from './elemental/electric/electricshield.js';
// destruction/elemental/ - Water effect gestures (self-contained gesture files)
import waterSplash from './elemental/water/watersplash.js';
import waterDrench from './elemental/water/waterdrench.js';
import waterSoak from './elemental/water/watersoak.js';
import waterFlow from './elemental/water/waterflow.js';
import waterTide from './elemental/water/watertide.js';
import waterLiquefy from './elemental/water/waterliquefy.js';
import waterPool from './elemental/water/waterpool.js';
import waterVortex from './elemental/water/watervortex.js';
// destruction/elemental/ - Water effect gestures (new GPU-instanced gestures)
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
// destruction/elemental/ - Fire effect gestures (self-contained gesture files)
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
// destruction/elemental/ - Void effect gestures (no shatter, absorption/corruption visuals)
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
// destruction/elemental/ - Ice effect gestures (frost/freezing visuals)
// Matches fire/water pattern: axis-travel, anchor, radial-burst spawn modes
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
// destruction/elemental/ - Light effect gestures (all modern instanced pattern)
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
// destruction/elemental/ - Earth effect gestures (stone/petrification visuals)
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
// destruction/elemental/ - Nature instanced ring/spectacle gestures (modern pattern)
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
// destruction/reform/
import morph from './destruction/reform/morph.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT ATMOSPHERE GESTURES (Environmental effects)
// └─────────────────────────────────────────────────────────────────────────────────────
// atmosphere/weather/
import rain from './atmosphere/weather/rain.js';
import drift from './atmosphere/weather/drift.js';
import driftUp from './atmosphere/weather/driftUp.js';
import driftDown from './atmosphere/weather/driftDown.js';
import driftLeft from './atmosphere/weather/driftLeft.js';
import driftRight from './atmosphere/weather/driftRight.js';
import vortex from './atmosphere/weather/vortex.js';
import cascadeUp from './atmosphere/weather/cascadeUp.js';
import cascadeDown from './atmosphere/weather/cascadeDown.js';
import cascadeLeft from './atmosphere/weather/cascadeLeft.js';
import cascadeRight from './atmosphere/weather/cascadeRight.js';
// atmosphere/particles/
import confetti from './atmosphere/particles/confetti.js';
import fizz from './atmosphere/particles/fizz.js';
import swarmUp from './atmosphere/particles/swarmUp.js';
import swarmDown from './atmosphere/particles/swarmDown.js';
import swarmLeft from './atmosphere/particles/swarmLeft.js';
import swarmRight from './atmosphere/particles/swarmRight.js';
import burst from './atmosphere/particles/burst.js';
import burstUp from './atmosphere/particles/burstUp.js';
import burstDown from './atmosphere/particles/burstDown.js';
import burstLeft from './atmosphere/particles/burstLeft.js';
import burstRight from './atmosphere/particles/burstRight.js';
import ripple from './atmosphere/particles/ripple.js';
import wave from './atmosphere/particles/wave.js';
// atmosphere/glow/
import flash from './atmosphere/glow/flash.js';
import glow from './atmosphere/glow/glow.js';
import bloom from './atmosphere/glow/bloom.js';
import flicker from './atmosphere/glow/flicker.js';
import shiver from './atmosphere/glow/shiver.js';
import heartbeat from './atmosphere/glow/heartbeat.js';
import snap from './atmosphere/glow/snap.js';
import elasticBounce from './atmosphere/glow/elasticBounce.js';
// atmosphere/control/
import hold from './atmosphere/control/hold.js';
import fade from './atmosphere/control/fade.js';
import settle from './atmosphere/control/settle.js';
import peek from './atmosphere/control/peek.js';
import directional from './atmosphere/control/directional.js';
import { createMagneticGesture } from './atmosphere/control/magneticFactory.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ (Factory calls moved to lazy registration below — see GESTURE REGISTRY section)
// └─────────────────────────────────────────────────────────────────────────────────────

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ PLACEHOLDER GESTURES FOR NEW ANIMATIONS
// └─────────────────────────────────────────────────────────────────────────────────────
// These are handled by GestureAnimator but need registry entries for rhythm system
const createPlaceholderGesture = (name, emoji = '✨') => ({
    name,
    emoji,
    type: 'blending', // Use blending type so they don't interfere
    description: `${name} animation`,
    config: {
        duration: 1000, // Legacy fallback only
        musicalDuration: { musical: true, beats: 2 } // Default: 2 beats
    },
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 }, // Musical duration
        interruptible: true,
        priority: 3,
        blendable: true,
        crossfadePoint: 'anyBeat',
        maxQueue: 3
    },
    apply: (_particle, _progress, _params) => {
        // No-op - handled by GestureAnimator
        return false;
    },
    blend: (_particle, _progress, _params) => {
        // No-op - handled by GestureAnimator
        return false;
    }
});

// Sparkle gesture - bright twinkling bursts of light
const sparkle = {
    name: 'sparkle',
    emoji: '✨',
    type: 'blending',
    description: 'Bright twinkling sparkle bursts',
    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 }
    },
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 5,
        blendable: true
    },
    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,
    '3d': {
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Create rapid sparkle bursts - multiple quick flashes
            // Use high-frequency sine waves with sharp peaks
            const sparkle1 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 6)), 3);
            const sparkle2 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 8 + 1)), 3);
            const sparkle3 = Math.pow(Math.max(0, Math.sin(progress * Math.PI * 10 + 2)), 3);

            // Combine for twinkling effect - peaks are sharp and bright
            const sparkleValue = Math.max(sparkle1, sparkle2, sparkle3);

            // Envelope to fade in/out
            const envelope = Math.sin(progress * Math.PI);

            // Final sparkle intensity
            const finalSparkle = sparkleValue * envelope;

            // Strong glow pulse
            const glowIntensity = 1.0 + finalSparkle * 0.5 * strength;

            // Very strong glow boost for dramatic sparkle halo
            const glowBoost = finalSparkle * 2.0 * strength;

            // Tiny scale pulse on sparkle peaks
            const scale = 1.0 + finalSparkle * 0.08 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};

// Shimmer gesture - makes particles shimmer with wave effect
const shimmer = {
    name: 'shimmer',
    emoji: '🌟',
    type: 'particle',  // Particle type to affect particle behavior
    description: 'Shimmer effect with sparkling particles',
    config: {
        duration: 2000,  // Legacy fallback
        musicalDuration: { musical: true, bars: 1 }, // 1 bar (4 beats)
        particleMotion: 'radiant'  // Use radiant behavior for shimmering effect
    },
    rhythm: {
        enabled: true,
        syncType: 'beat',
        durationSync: { mode: 'bars', bars: 1 }, // Musical: 1 bar
        intensity: 0.8
    },
    override: (particle, progress, _params) => {
        // Shimmer makes particles sparkle with wave effect
        particle.shimmerEffect = true;
        particle.shimmerProgress = progress;
        return true;
    },
    blend: (_particle, _progress, _params) => {
        // Blend with other gestures
        return false;
    },
    '3d': {
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Create shimmering wave effect - multiple overlapping sine waves
            const wave1 = Math.sin(progress * Math.PI * 4);
            const wave2 = Math.sin(progress * Math.PI * 6 + 0.5);
            const wave3 = Math.sin(progress * Math.PI * 10 + 1.0);

            // Combine waves for sparkling effect
            const shimmerValue = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25 + 1) / 2; // 0 to 1

            // Glow pulses with shimmer
            const glowIntensity = 1.0 + shimmerValue * 0.3 * strength;

            // Glow boost for screen-space halo - sparkles!
            const glowBoost = shimmerValue * 1.0 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0 + shimmerValue * 0.05 * strength,
                glowIntensity,
                glowBoost
            };
        }
    }
};
const groove = createPlaceholderGesture('groove', '🎵');

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE REGISTRY — Lazy construction for fast page load
// └─────────────────────────────────────────────────────────────────────────────────────
// Gestures are registered in two ways:
// 1. EAGER: Already-imported gestures (constructed at import time) — just property assignment
// 2. LAZY: Factory-generated gestures — factory call deferred until first access via getter
//
// This eliminates ~60 factory calls at module evaluation time, dramatically reducing
// the blocking work that happens before the page can render.

export const GESTURE_REGISTRY = {};

// Name arrays for GESTURE_TYPES (built during registration)
const _motionNames = [];
const _transformNames = [];
const _effectNames = [];

/**
 * Register an already-constructed gesture eagerly (just property assignment)
 */
function _regEager(gesture, group) {
    GESTURE_REGISTRY[gesture.name] = gesture;
    group.push(gesture.name);
}

/**
 * Register a factory-generated gesture lazily (factory call deferred)
 */
function _regLazy(name, loader, group) {
    Object.defineProperty(GESTURE_REGISTRY, name, {
        configurable: true,
        enumerable: true,
        get() {
            const gesture = loader();
            Object.defineProperty(GESTURE_REGISTRY, name, {
                configurable: true, enumerable: true, writable: true,
                value: gesture
            });
            return gesture;
        }
    });
    group.push(name);
}

// ── MOTION gestures (all imported — no factory calls) ────────────────────────────────
[
    bounce, pulse, shake, nod, vibrate, twitch, sway, float, jitter,
    sparkle, shimmer, wiggle, groove, point, lean, reach, headBob,
    pop, swell, swagger, dip, flare,
    stepLeft, stepRight, stepUp, stepDown, slideLeft, slideRight,
    leanLeft, leanRight, kickLeft, kickRight,
    floatUp, floatDown, floatLeft, floatRight,
    pointUp, pointDown, pointLeft, pointRight,
    breathe, expand, contract,
    rock, pendulum, wobble, teeter,
    hula, orbit, orbitLeft, orbitRight, orbitUp, orbitDown,
    twist, runningman, charleston
].forEach(g => _regEager(g, _motionNames));

// ── TRANSFORM gestures — imported ────────────────────────────────────────────────────
[
    spin, spinLeft, spinRight, jump, jumpDown, jumpLeft, jumpRight,
    morph, stretch, tilt, tiltUp, tiltDown, tiltLeft, tiltRight,
    shatter, flip, backflip, crouch, lunge, recoil, bow,
    inflate, deflate, squash, knockout, knockdown,
    crackFront, crackBack, crackLeft, crackRight, crackUp, crackDown, crackHeal,
    rage, fury, battlecry, charge, pancake,
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
    // Nature (instanced ring/spectacle)
    natureEntangle, natureRoot, natureTwirl, natureConstrict,
    natureBloom, natureCrown, natureDance, natureDrill, natureRingFlourish,
    natureHelix, natureMeditation, naturePillar, natureVortex,
    natureBarrage, natureShield, seedBurst, seedPod,
    natureCleanse, natureSplinter
].forEach(g => _regEager(g, _transformNames));

// ── TRANSFORM gestures — factory-generated (LAZY) ────────────────────────────────────
// Lunge variants
_regLazy('lungeForward', () => createLungeGesture('forward'), _transformNames);
_regLazy('lungeBack', () => createLungeGesture('back'), _transformNames);
_regLazy('lungeLeft', () => createLungeGesture('left'), _transformNames);
_regLazy('lungeRight', () => createLungeGesture('right'), _transformNames);
_regLazy('lungeUp', () => createLungeGesture('up'), _transformNames);
_regLazy('lungeDown', () => createLungeGesture('down'), _transformNames);
// Recoil variants
_regLazy('recoilBack', () => createRecoilGesture('back'), _transformNames);
_regLazy('recoilForward', () => createRecoilGesture('forward'), _transformNames);
_regLazy('recoilLeft', () => createRecoilGesture('left'), _transformNames);
_regLazy('recoilRight', () => createRecoilGesture('right'), _transformNames);
_regLazy('recoilUp', () => createRecoilGesture('up'), _transformNames);
_regLazy('recoilDown', () => createRecoilGesture('down'), _transformNames);
// Oof variants
_regLazy('oofLeft', () => createOofGesture('left'), _transformNames);
_regLazy('oofRight', () => createOofGesture('right'), _transformNames);
_regLazy('oofFront', () => createOofGesture('front'), _transformNames);
_regLazy('oofBack', () => createOofGesture('back'), _transformNames);
_regLazy('oofUp', () => createOofGesture('up'), _transformNames);
_regLazy('oofDown', () => createOofGesture('down'), _transformNames);
// Shatter variants (factory 'default' overwrites imported shatter — matches previous behavior)
_regLazy('shatter', () => createShatterGesture('default'), _transformNames);
_regLazy('shatterExplosive', () => createShatterGesture('explosive'), _transformNames);
_regLazy('shatterCrumble', () => createShatterGesture('crumble'), _transformNames);
_regLazy('shatterReform', () => createShatterGesture('reform'), _transformNames);
_regLazy('shatterPunchLeft', () => createShatterGesture('punchLeft'), _transformNames);
_regLazy('shatterPunchRight', () => createShatterGesture('punchRight'), _transformNames);
_regLazy('shatterPunchFront', () => createShatterGesture('punchFront'), _transformNames);
_regLazy('shatterSuspend', () => createShatterGesture('suspend'), _transformNames);
_regLazy('shatterImplode', () => createShatterGesture('implode'), _transformNames);
_regLazy('shatterGravity', () => createShatterGesture('gravity'), _transformNames);
_regLazy('shatterOrbit', () => createShatterGesture('orbit'), _transformNames);
// Dissolve variants
_regLazy('dissolveUp', () => createDissolveGesture('up'), _transformNames);
_regLazy('dissolveDown', () => createDissolveGesture('down'), _transformNames);
_regLazy('dissolveLeft', () => createDissolveGesture('left'), _transformNames);
_regLazy('dissolveRight', () => createDissolveGesture('right'), _transformNames);
_regLazy('dissolveAway', () => createDissolveGesture('away'), _transformNames);
_regLazy('dissolveToward', () => createDissolveGesture('toward'), _transformNames);
// Rush variants
_regLazy('rushForward', () => createRushGesture('forward'), _transformNames);
_regLazy('rushBack', () => createRushGesture('back'), _transformNames);
_regLazy('rushLeft', () => createRushGesture('left'), _transformNames);
_regLazy('rushRight', () => createRushGesture('right'), _transformNames);
_regLazy('rushUp', () => createRushGesture('up'), _transformNames);
_regLazy('rushDown', () => createRushGesture('down'), _transformNames);

// ── EFFECT gestures — imported ───────────────────────────────────────────────────────
[
    wave, drift, driftUp, driftDown, driftLeft, driftRight,
    flicker, burst, directional, settle, fade, hold, flash, glow, peek, rain,
    shiver, heartbeat, confetti, fizz,
    cascadeUp, cascadeDown, cascadeLeft, cascadeRight,
    burstUp, burstDown, burstLeft, burstRight,
    ripple, elasticBounce,
    swarmUp, swarmDown, swarmLeft, swarmRight,
    bloom, snap, vortex
].forEach(g => _regEager(g, _effectNames));

// ── EFFECT gestures — factory-generated (LAZY) ──────────────────────────────────────
_regLazy('magneticForward', () => createMagneticGesture('forward'), _effectNames);
_regLazy('magneticBack', () => createMagneticGesture('back'), _effectNames);
_regLazy('magneticLeft', () => createMagneticGesture('left'), _effectNames);
_regLazy('magneticRight', () => createMagneticGesture('right'), _effectNames);
_regLazy('magneticUp', () => createMagneticGesture('up'), _effectNames);
_regLazy('magneticDown', () => createMagneticGesture('down'), _effectNames);
_regLazy('magneticAttract', () => createMagneticGesture('attract'), _effectNames);
_regLazy('magneticRepel', () => createMagneticGesture('repel'), _effectNames);

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE TYPE MAPPING - Quick type lookup
// └─────────────────────────────────────────────────────────────────────────────────────
export const GESTURE_TYPES = {
    blending: _motionNames,
    override: _transformNames,
    effect: _effectNames
};

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ SEMANTIC CATEGORIES - UI-friendly groupings based on folder structure
// └─────────────────────────────────────────────────────────────────────────────────────
// These categories match the folder organization and provide meaningful groupings
// for demo UIs and documentation. This is the SINGLE SOURCE OF TRUTH for categories.
export const GESTURE_CATEGORIES = {
    idle: [
        // idle/breathing/
        'breathe', 'expand', 'contract', 'pulse',
        // idle/swaying/
        'sway', 'float', 'floatUp', 'floatDown', 'floatLeft', 'floatRight',
        'bob', 'lean', 'leanLeft', 'leanRight',
        // idle/fidgeting/
        'jitter', 'twitch', 'vibrate', 'shake', 'wiggle'
    ],
    dance: [
        // dance/steps/
        'stepLeft', 'stepRight', 'stepUp', 'stepDown', 'slideLeft', 'slideRight',
        // dance/moves/
        'runningman', 'charleston', 'hula', 'twist',
        // dance/accents/
        'pop', 'flare', 'swell', 'swagger', 'dip', 'bounce',
        // dance/orbits/
        'orbit', 'orbitLeft', 'orbitRight', 'orbitUp', 'orbitDown',
        // extras
        'sparkle', 'shimmer', 'groove'
    ],
    actions: [
        // actions/locomotion/
        'jump', 'jumpDown', 'jumpLeft', 'jumpRight',
        'rushForward', 'rushBack', 'rushLeft', 'rushRight', 'rushUp', 'rushDown',
        'lunge', 'lungeForward', 'lungeBack', 'lungeLeft', 'lungeRight', 'lungeUp', 'lungeDown',
        // actions/acrobatics/
        'spin', 'spinLeft', 'spinRight', 'flip', 'backflip',
        // actions/gesturing/
        'point', 'pointUp', 'pointDown', 'pointLeft', 'pointRight',
        'kickLeft', 'kickRight', 'bow', 'nod', 'reach', 'headBob',
        // actions/poses/
        'crouch', 'tilt', 'tiltUp', 'tiltDown', 'tiltLeft', 'tiltRight'
    ],
    reactions: [
        // reactions/impacts/
        'oofLeft', 'oofRight', 'oofFront', 'oofBack', 'oofUp', 'oofDown',
        'recoil', 'recoilBack', 'recoilForward', 'recoilLeft', 'recoilRight', 'recoilUp', 'recoilDown',
        'knockdown', 'knockout', 'inflate', 'deflate', 'squash', 'stretch', 'pancake',
        // reactions/cracks/
        'crackFront', 'crackBack', 'crackLeft', 'crackRight', 'crackUp', 'crackDown', 'crackHeal',
        // reactions/emotions/
        'rage', 'fury', 'battlecry', 'charge',
        // reactions/oscillations/
        'wobble', 'teeter', 'rock', 'pendulum'
    ],
    destruction: [
        // destruction/shatter/
        'shatter', 'shatterMesh', 'shatterExplosive', 'shatterCrumble', 'shatterReform',
        'shatterPunchLeft', 'shatterPunchRight', 'shatterPunchFront',
        'shatterSuspend', 'shatterImplode', 'shatterGravity', 'shatterOrbit',
        // destruction/dissolve/
        'dissolveUp', 'dissolveDown', 'dissolveLeft', 'dissolveRight', 'dissolveAway', 'dissolveToward',
        // destruction/elemental/ - Water (impact)
        'splash', 'drench', 'soak',
        // destruction/elemental/ - Water (ambient)
        'flow', 'tide',
        // destruction/elemental/ - Water (transform)
        'liquefy', 'poolWater', 'vortexWater',
        // destruction/elemental/ - Water (axis-travel effects)
        'watercrown', 'waterdance', 'waterdrill', 'waterhelix',
        'watermeditation', 'waterpillar', 'waterflourish',
        'waterbarrage', 'waterimpact',
        // destruction/elemental/ - Water (crush)
        'watercrush', 'watertwirl', 'watershield',
        // destruction/elemental/ - Smoke
        'smokebomb', 'vanish', 'materialize',
        // destruction/elemental/ - Fire
        'phoenix',
        // destruction/elemental/ - Fire (burning - victim of fire)
        'burn', 'scorch', 'combust',
        // destruction/elemental/ - Fire (vortex - spiraling fire tornado)
        'flameVortex',
        // destruction/elemental/ - Fire (firedance - vertical dancing rings)
        'firedance',
        // destruction/elemental/ - Fire (fireflourish - theatrical flame sword flourish)
        'fireflourish',
        // destruction/elemental/ - Fire (firecrown - majestic flame crown at head)
        'firecrown',
        // destruction/elemental/ - Fire (firemeditation - static rings with breathing pulse)
        'firemeditation',
        // destruction/elemental/ - Fire (firedrill - fast tight ascending helix)
        'firedrill',
        // destruction/elemental/ - Fire (firepillar - stacked rings rising as pillar)
        'firepillar',
        // destruction/elemental/ - Fire (firehelix - DNA-style double helix)
        'firehelix',
        // destruction/elemental/ - Fire (firebarrage - orbiting flames launching upward)
        'firebarrage',
        // destruction/elemental/ - Fire (fireimpact - fire orbits then crashes inward)
        'fireimpact',
        // destruction/elemental/ - Fire (fireblast - explosive fire burst)
        'fireblast',
        // destruction/elemental/ - Fire (radiating - source of fire)
        'radiate', 'blaze', 'firetwirl', 'fireshield',
        // destruction/elemental/ - Smoke (emanating - source of smoke)
        'puff', 'billow', 'fume',
        // destruction/elemental/ - Smoke (afflicted - victim of smoke)
        'shroud', 'hazeSmoke', 'chokeSmoke',
        // destruction/elemental/ - Ice
        'iceFreeze', 'shatterIce',
        // destruction/elemental/ - Electric (electrocution)
        'shock', 'overload', 'glitch',
        // destruction/elemental/ - Electric (powered)
        'crackle', 'chargeUp', 'electricAuraEffect', 'staticDischarge',
        // destruction/elemental/ - Electric (ring/spectacle gestures)
        'electriccrown', 'electricdance', 'electrichelix', 'electricpillar',
        'electricdrill', 'electricflourish', 'electricvortex', 'electricbarrage',
        'electricimpact', 'electricblast', 'electricsurge', 'electriczap', 'electricmeditation', 'electrictwirl', 'electricshield', 'zap',
        // destruction/elemental/ - Void (absorption, corruption, annihilation)
        'drain', 'hollow', 'corrupt', 'consume', 'singularity',
        // destruction/elemental/ - Void (ring/spectacle gestures)
        'voidcrown', 'voiddance', 'voidhelix', 'voidpillar',
        'voiddrill', 'voidflourish', 'voidvortex', 'voidbarrage', 'voidimpact', 'voidmeditation', 'voidtwirl', 'voidshield',
        // destruction/elemental/ - Ice Effect (matching fire/water pattern)
        'iceCrown', 'iceDance', 'icePillar', 'iceHelix', 'iceMeditation',
        'iceVortex', 'iceSplash', 'iceEncase', 'iceDrill', 'iceFlourish',
        'iceBarrage', 'iceImpact',
        'icemist', 'iceshiver', 'icetwirl', 'iceshield',
        // destruction/elemental/ - Light Effect (afflicted, emanating, transform)
        'lightBlind', 'lightPurify', 'lightCleanse', 'lightRadiate', 'lightGlow', 'lightBeacon',
        'lightAscend', 'lightIlluminate', 'lightDissolve', 'lightMeditation',
        // destruction/elemental/ - Light (ring/spectacle gestures)
        'lightcrown', 'lightdance', 'lighthelix', 'lightpillar',
        'lightdrill', 'lightflourish', 'lightvortex', 'lightbarrage',
        'lightimpact', 'lightblast', 'lightsurge', 'lightmeditation', 'lighttwirl', 'lightshield',
        // destruction/elemental/ - Poison Effect (afflicted, emanating, transform)
        'poisonInfect', 'poisonSicken', 'poisonOoze', 'poisonSeep', 'poisonToxic',
        'poisonCorrode', 'poisonMelt', 'poisonDecay', 'poisonDissolve',
        // destruction/elemental/ - Earth Effect (afflicted, emanating, transform)
        'earthPetrify', 'earthBurden', 'earthRumble', 'earthQuake', 'earthMeditation',
        'earthEncase', 'earthCrumble', 'earthShatter', 'earthErode',
        // destruction/elemental/ - Earth (ring/spectacle gestures)
        'earthcrown', 'earthdance', 'earthhelix', 'earthpillar',
        'earthdrill', 'earthflourish', 'earthvortex', 'earthbarrage',
        'earthimpact', 'earthblast', 'earthsurge', 'earthmeditation', 'earthtwirl', 'earthshield',
        // destruction/reform/
        'morph'
    ],
    atmosphere: [
        // atmosphere/weather/
        'rain', 'drift', 'driftUp', 'driftDown', 'driftLeft', 'driftRight',
        'vortex', 'cascadeUp', 'cascadeDown', 'cascadeLeft', 'cascadeRight',
        // atmosphere/particles/
        'confetti', 'fizz',
        'swarmUp', 'swarmDown', 'swarmLeft', 'swarmRight',
        'burst', 'burstUp', 'burstDown', 'burstLeft', 'burstRight',
        'ripple', 'wave',
        // atmosphere/glow/
        'flash', 'glow', 'bloom', 'flicker', 'shiver', 'heartbeat', 'snap', 'elasticBounce',
        // atmosphere/control/
        'hold', 'fade', 'settle', 'peek', 'directional',
        'magneticForward', 'magneticBack', 'magneticLeft', 'magneticRight',
        'magneticUp', 'magneticDown', 'magneticAttract', 'magneticRepel'
    ]
};

// Build reverse lookup: gesture name → category
export const GESTURE_TO_CATEGORY = {};
Object.entries(GESTURE_CATEGORIES).forEach(([category, gestures]) => {
    gestures.forEach(name => {
        GESTURE_TO_CATEGORY[name] = category;
    });
});

/**
 * Get the semantic category for a gesture
 * @param {string} name - Gesture name
 * @returns {string} Category name ('idle', 'dance', 'actions', 'reactions', 'destruction', 'atmosphere')
 */
export function getGestureCategory(name) {
    return GESTURE_TO_CATEGORY[name] || 'atmosphere'; // Default fallback
}

/**
 * Get a gesture by name (checks both core and plugin gestures)
 * @param {string} name - Gesture name (e.g., 'bounce', 'spin')
 * @returns {Object|null} Gesture object or null if not found
 */
export function getGesture(name) {
    // Check core gestures first
    if (GESTURE_REGISTRY[name]) {
        return GESTURE_REGISTRY[name];
    }

    // Check plugin gestures
    const pluginGesture = pluginAdapter.getPluginGesture(name);
    if (pluginGesture) {
        return pluginGesture;
    }

    return null;
}

/**
 * Check if a gesture is a blending type
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture blends with existing motion
 */
export function isBlendingGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'blending' : false;
}

/**
 * Check if a gesture is an override type
 * @param {string} name - Gesture name
 * @returns {boolean} True if gesture overrides existing motion
 */
export function isOverrideGesture(name) {
    const gesture = getGesture(name);
    return gesture ? gesture.type === 'override' : false;
}

/**
 * Apply a gesture to a particle
 * @param {Particle} particle - The particle to animate
 * @param {string} gestureName - Name of the gesture
 * @param {number} progress - Animation progress (0-1)
 * @param {Object} motion - Motion configuration
 * @param {number} dt - Delta time
 * @param {number} centerX - Orb center X
 * @param {number} centerY - Orb center Y
 * @returns {boolean} True if gesture was applied
 */
export function applyGesture(particle, gestureName, progress, motion, dt, centerX, centerY) {
    const gesture = getGesture(gestureName);

    if (!gesture) {
        return false;
    }

    // Apply the gesture
    if (gesture.apply) {
        gesture.apply(particle, progress, motion, dt, centerX, centerY);
    }

    // Clean up if complete
    if (progress >= 1 && gesture.cleanup) {
        gesture.cleanup(particle);
    }

    return true;
}

/**
 * Get list of all available gestures (core and plugin)
 * @returns {Array} Array of gesture info objects with semantic categories
 */
export function listGestures() {
    const allGestures = [];

    // Add core gestures with semantic categories from GESTURE_TO_CATEGORY
    Object.values(GESTURE_REGISTRY).forEach(gesture => {
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🎭',
            type: gesture.type,
            // Use semantic category (idle/dance/actions/reactions/destruction/atmosphere)
            category: GESTURE_TO_CATEGORY[gesture.name] || 'atmosphere',
            description: gesture.description || 'No description',
            source: 'core',
            // Include usesShatter flag for filtering shatter-based gestures
            usesShatter: gesture.usesShatter || false
        });
    });

    // Add plugin gestures
    const pluginGestureNames = pluginAdapter.getAllPluginGestures();
    pluginGestureNames.forEach(name => {
        const gesture = pluginAdapter.getPluginGesture(name);
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🔌',
            type: gesture.type,
            category: gesture.category || 'effect',
            description: gesture.description || 'Plugin gesture',
            source: 'plugin'
        });
    });

    return allGestures;
}

/**
 * Progressively resolve lazy gesture getters in idle-time batches.
 * Avoids blocking the main thread during page load.
 * @param {Object} options
 * @param {Function} [options.onBatch] - Called with each batch of resolved gesture info objects
 * @param {Function} [options.onComplete] - Called when all gestures are resolved
 */
export function warmUpGestures({ onBatch, onComplete } = {}) {
    // Object.keys enumerates lazy getter property names WITHOUT triggering them.
    // We yield name + category only — no factory resolution, no module evaluation.
    const names = Object.keys(GESTURE_REGISTRY);

    if (onBatch) {
        onBatch(names.map(name => ({
            name,
            category: GESTURE_TO_CATEGORY[name] || 'atmosphere',
            source: 'core'
        })));
    }

    // Plugin gestures (typically few)
    try {
        const pluginBatch = [];
        const pluginNames = pluginAdapter.getAllPluginGestures();
        pluginNames.forEach(pn => {
            const g = pluginAdapter.getPluginGesture(pn);
            pluginBatch.push({
                name: g.name, emoji: g.emoji || '🔌', type: g.type,
                category: g.category || 'effect',
                description: g.description || 'Plugin gesture',
                source: 'plugin'
            });
        });
        if (pluginBatch.length && onBatch) onBatch(pluginBatch);
    } catch (_e) { /* no plugins */ }

    if (onComplete) onComplete();

    // Return factory work thunks for FrameBudgetScheduler to execute across frames
    return getLazyGestureNames().map(name => () => resolveGesture(name));
}

/**
 * Explicitly resolve a lazy gesture getter, forcing factory evaluation.
 * If already resolved, this is a no-op (reads cached value property).
 * @param {string} name - Gesture name
 * @returns {Object|null} Resolved gesture object
 */
export function resolveGesture(name) {
    return GESTURE_REGISTRY[name] || null;
}

/**
 * Get names of gestures that still have unresolved factory getters.
 * @returns {string[]}
 */
export function getLazyGestureNames() {
    return Object.keys(GESTURE_REGISTRY).filter(name => {
        const desc = Object.getOwnPropertyDescriptor(GESTURE_REGISTRY, name);
        return desc && typeof desc.get === 'function';
    });
}

// Export plugin adapter for external use
export { pluginAdapter };

// Export everything
export default {
    GESTURE_REGISTRY,
    GESTURE_TYPES,
    GESTURE_CATEGORIES,
    GESTURE_TO_CATEGORY,
    getGesture,
    getGestureCategory,
    isBlendingGesture,
    isOverrideGesture,
    applyGesture,
    listGestures,
    pluginAdapter
};
