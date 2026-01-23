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
import bob from './idle/swaying/bob.js';
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
// destruction/elemental/
import { createElementalGesture } from './destruction/elemental/elementalFactory.js';
// destruction/elemental/ - Electric effect gestures (no shatter, just electrocution effect)
import {
    shock as electricShock,
    overload as electricOverload,
    glitch as electricGlitch
} from './destruction/elemental/electricEffectFactory.js';
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
// │ CREATE DIRECTIONAL GESTURE VARIANTS
// └─────────────────────────────────────────────────────────────────────────────────────
// Directional lunge gestures
const lungeForward = createLungeGesture('forward');
const lungeBack = createLungeGesture('back');
const lungeLeft = createLungeGesture('left');
const lungeRight = createLungeGesture('right');
const lungeUp = createLungeGesture('up');
const lungeDown = createLungeGesture('down');
// Directional recoil gestures
const recoilBack = createRecoilGesture('back');
const recoilForward = createRecoilGesture('forward');
const recoilLeft = createRecoilGesture('left');
const recoilRight = createRecoilGesture('right');
const recoilUp = createRecoilGesture('up');
const recoilDown = createRecoilGesture('down');
// Directional bow gestures REMOVED - bow is always forward toward the audience
// Use tiltLeft/tiltRight for lateral leans, bow for forward bow
// Directional oof gestures
const oofLeft = createOofGesture('left');
const oofRight = createOofGesture('right');
const oofFront = createOofGesture('front');
const oofBack = createOofGesture('back');
const oofUp = createOofGesture('up');
const oofDown = createOofGesture('down');
// Geometry shatter gestures (actual mesh fragmentation, 3D only)
const shatterMesh = createShatterGesture('default');
const shatterExplosive = createShatterGesture('explosive');
const shatterCrumble = createShatterGesture('crumble');
const shatterReform = createShatterGesture('reform');
const shatterPunchLeft = createShatterGesture('punchLeft');
const shatterPunchRight = createShatterGesture('punchRight');
const shatterPunchFront = createShatterGesture('punchFront');
const shatterSuspend = createShatterGesture('suspend');
const shatterFreeze = createShatterGesture('freeze');
// Dual-mode shatter gestures (work on IDLE or FROZEN state)
const shatterImplode = createShatterGesture('implode');
const shatterGravity = createShatterGesture('gravity');
const shatterOrbit = createShatterGesture('orbit');
// Dissolve gestures (directional wind variants)
const dissolveUp = createDissolveGesture('up');
const dissolveDown = createDissolveGesture('down');
const dissolveLeft = createDissolveGesture('left');
const dissolveRight = createDissolveGesture('right');
const dissolveAway = createDissolveGesture('away');
const dissolveToward = createDissolveGesture('toward');
// Elemental gestures (use elemental material system)
// Water
const splash = createElementalGesture('splash');
const drip = createElementalGesture('drip');
const rippleWater = createElementalGesture('ripple');
// Smoke
const smokebomb = createElementalGesture('smokebomb');
const vanish = createElementalGesture('vanish');
const materialize = createElementalGesture('materialize');
// Fire
const ignite = createElementalGesture('ignite');
const phoenix = createElementalGesture('phoenix');
const ember = createElementalGesture('ember');
// Ice
const iceFreeze = createElementalGesture('freeze');
const shatterIce = createElementalGesture('shatterIce');
const thaw = createElementalGesture('thaw');
// Electric (uses electric effect gestures - no shatter, just electrocution visuals)
const shock = electricShock;
const overload = electricOverload;
const glitch = electricGlitch;
// Void
const consume = createElementalGesture('consume');
const corrupt = createElementalGesture('corrupt');
const singularity = createElementalGesture('singularity');
// Directional rush gestures
const rushForward = createRushGesture('forward');
const rushBack = createRushGesture('back');
const rushLeft = createRushGesture('left');
const rushRight = createRushGesture('right');
const rushUp = createRushGesture('up');
const rushDown = createRushGesture('down');
// Directional magnetic gestures
const magneticForward = createMagneticGesture('forward');
const magneticBack = createMagneticGesture('back');
const magneticLeft = createMagneticGesture('left');
const magneticRight = createMagneticGesture('right');
const magneticUp = createMagneticGesture('up');
const magneticDown = createMagneticGesture('down');
const magneticAttract = createMagneticGesture('attract');
const magneticRepel = createMagneticGesture('repel');

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
// │ GESTURE COLLECTIONS
// └─────────────────────────────────────────────────────────────────────────────────────
const MOTION_GESTURES = [
    bounce,
    pulse,
    shake,
    nod,
    vibrate,
    twitch,
    sway,
    float,
    jitter,
    // New gestures
    sparkle,
    shimmer,
    wiggle,
    groove,
    point,
    lean,
    reach,
    headBob,
    // Accent gestures (dance-friendly - boost groove, don't compete)
    pop,
    // bob removed - redundant with headBob
    swell,
    swagger,
    dip,
    flare,
    // Directional dance gestures
    stepLeft,
    stepRight,
    stepUp,
    stepDown,
    slideLeft,
    slideRight,
    // Directional lean gestures
    leanLeft,
    leanRight,
    // Directional kick gestures
    kickLeft,
    kickRight,
    // Directional float gestures (storytelling)
    floatUp,
    floatDown,
    floatLeft,
    floatRight,
    // Directional point gestures (storytelling)
    pointUp,
    pointDown,
    pointLeft,
    pointRight,
    // Blending gestures (moved from effects/)
    breathe,
    expand,
    contract,
    // Oscillating motions (continuous rhythmic behaviors)
    rock,
    pendulum,
    wobble,
    teeter,
    // Dance/rhythmic motions
    hula,
    orbit,
    orbitLeft,
    orbitRight,
    orbitUp,
    orbitDown,
    twist,
    // Dance moves (moved from effects/)
    runningman,
    charleston
];

const TRANSFORM_GESTURES = [
    spin,
    spinLeft,
    spinRight,
    jump,
    // Directional jump gestures (jumpUp removed - redundant with jump)
    jumpDown,
    jumpLeft,
    jumpRight,
    morph,
    stretch,
    tilt,
    // Directional tilt gestures
    tiltUp,
    tiltDown,
    tiltLeft,
    tiltRight,
    shatter,
    // New transform gestures - acrobatic
    flip,
    backflip,
    // New transform gestures - dramatic poses
    crouch,
    lunge,
    recoil,
    bow,
    // Directional lunge gestures
    lungeForward,
    lungeBack,
    lungeLeft,
    lungeRight,
    lungeUp,
    lungeDown,
    // Directional recoil gestures
    recoilBack,
    recoilForward,
    recoilLeft,
    recoilRight,
    recoilUp,
    recoilDown,
    // New transform gestures - size transformations
    inflate,
    deflate,
    squash,
    // New transform gestures - combat/impact
    knockout,
    knockdown,
    oofLeft,
    oofRight,
    oofFront,
    oofBack,
    oofUp,
    oofDown,
    // Crack gestures (post-processing surface cracks)
    crackFront,
    crackBack,
    crackLeft,
    crackRight,
    crackUp,
    crackDown,
    crackHeal,
    // New transform gestures - intense emotions
    rage,
    fury,
    battlecry,
    charge,
    // Directional rush gestures
    rushForward,
    rushBack,
    rushLeft,
    rushRight,
    rushUp,
    rushDown,
    // Extreme squash
    pancake,
    // Geometry shatter gestures (3D mesh fragmentation)
    shatterMesh,
    shatterExplosive,
    shatterCrumble,
    shatterReform,
    shatterPunchLeft,
    shatterPunchRight,
    shatterPunchFront,
    shatterSuspend,
    shatterFreeze,
    // Dual-mode shatter gestures (work on IDLE or FROZEN state)
    shatterImplode,
    shatterGravity,
    shatterOrbit,
    // Dissolve gestures (shards blow away like dust)
    dissolveUp,
    dissolveDown,
    dissolveLeft,
    dissolveRight,
    dissolveAway,
    dissolveToward,
    // Elemental gestures (use elemental material system)
    // Water
    splash,
    drip,
    rippleWater,
    // Smoke
    smokebomb,
    vanish,
    materialize,
    // Fire
    ignite,
    phoenix,
    ember,
    // Ice
    iceFreeze,
    shatterIce,
    thaw,
    // Electric
    shock,
    overload,
    glitch,
    // Void
    consume,
    corrupt,
    singularity
];

const EFFECT_GESTURES = [
    wave,
    drift,
    // Directional drift gestures
    driftUp,
    driftDown,
    driftLeft,
    driftRight,
    flicker,
    burst,
    directional,
    settle,
    fade,
    hold,
    flash,
    glow,
    peek,
    rain,
    // New effect gestures (Tier 1 - emotional)
    shiver,
    heartbeat,
    confetti,
    fizz,
    // Cascade gestures (directional waterfall)
    cascadeUp,
    cascadeDown,
    cascadeLeft,
    cascadeRight,
    // Directional burst gestures
    burstUp,
    burstDown,
    burstLeft,
    burstRight,
    // New effect gestures (Tier 2 - dynamics)
    ripple,
    elasticBounce,
    // Swarm gestures (directional flock)
    swarmUp,
    swarmDown,
    swarmLeft,
    swarmRight,
    // New effect gestures (Tier 3 - nice to have)
    bloom,
    snap,
    // Directional magnetic gestures
    magneticForward,
    magneticBack,
    magneticLeft,
    magneticRight,
    magneticUp,
    magneticDown,
    magneticAttract,
    magneticRepel,
    // Environmental particle effects
    vortex
];

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE REGISTRY - Fast lookup by name
// └─────────────────────────────────────────────────────────────────────────────────────
export const GESTURE_REGISTRY = {};

// Build the registry from all gesture arrays - SYNCHRONOUSLY
[...MOTION_GESTURES, ...TRANSFORM_GESTURES, ...EFFECT_GESTURES].forEach(gesture => {
    GESTURE_REGISTRY[gesture.name] = gesture;
});

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ GESTURE TYPE MAPPING - Quick type lookup
// └─────────────────────────────────────────────────────────────────────────────────────
export const GESTURE_TYPES = {
    blending: MOTION_GESTURES.map(g => g.name),
    override: TRANSFORM_GESTURES.map(g => g.name),
    effect: EFFECT_GESTURES.map(g => g.name)
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
        'shatterSuspend', 'shatterFreeze', 'shatterImplode', 'shatterGravity', 'shatterOrbit',
        // destruction/dissolve/
        'dissolveUp', 'dissolveDown', 'dissolveLeft', 'dissolveRight', 'dissolveAway', 'dissolveToward',
        // destruction/elemental/ - Water
        'splash', 'drip', 'ripple',
        // destruction/elemental/ - Smoke
        'smokebomb', 'vanish', 'materialize',
        // destruction/elemental/ - Fire
        'ignite', 'phoenix', 'ember',
        // destruction/elemental/ - Ice
        'iceFreeze', 'shatterIce', 'thaw',
        // destruction/elemental/ - Electric
        'shock', 'overload', 'glitch',
        // destruction/elemental/ - Void
        'consume', 'corrupt', 'singularity',
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
            source: 'core'
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

// Debug utilities can be imported directly if needed
// Export them instead of polluting global scope

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
