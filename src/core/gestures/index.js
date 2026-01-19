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
 * ║ • Three gesture types: blending (motions), override (transforms), effects        
 * ║ • Core gestures loaded synchronously at startup                                   
 * ║ • Plugin gestures registered dynamically via adapter                              
 * ║ • Value-agnostic configurations for easy tuning                                   
 * ║                                                                                    
 * ║ TO ADD A PLUGIN GESTURE:                                                          
 * ║ Use pluginAdapter.registerPluginGesture() from your plugin                        
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import pluginAdapter from './plugin-adapter.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT MOTION GESTURES (Blending - add to existing motion)
// └─────────────────────────────────────────────────────────────────────────────────────
import bounce from './motions/bounce.js';
import pulse from './motions/pulse.js';
import shake from './motions/shake.js';
import nod from './motions/nod.js';
import vibrate from './motions/vibrate.js';
import twitch from './motions/twitch.js';
import sway from './motions/sway.js';
import float from './motions/float.js';
import jitter from './motions/jitter.js';
import wiggle from './motions/wiggle.js';
import headBob from './motions/headBob.js';
import lean from './motions/lean.js';
import point from './motions/point.js';
import reach from './motions/reach.js';
// Accent gestures (dance-friendly - boost groove, don't compete)
import pop from './motions/pop.js';
// bob removed - redundant with headBob
import swell from './motions/swell.js';
import swagger from './motions/swagger.js';
import dip from './motions/dip.js';
import flare from './motions/flare.js';
// Directional dance gestures (beat-synced steps and slides)
import stepLeft from './motions/stepLeft.js';
import stepRight from './motions/stepRight.js';
import stepUp from './motions/stepUp.js';
import stepDown from './motions/stepDown.js';
import slideLeft from './motions/slideLeft.js';
import slideRight from './motions/slideRight.js';
// Directional lean gestures
import leanLeft from './motions/leanLeft.js';
import leanRight from './motions/leanRight.js';
// Directional kick gestures (new)
import kickLeft from './motions/kickLeft.js';
import kickRight from './motions/kickRight.js';
// Directional float gestures (storytelling)
import floatUp from './motions/floatUp.js';
import floatDown from './motions/floatDown.js';
import floatLeft from './motions/floatLeft.js';
import floatRight from './motions/floatRight.js';
// Directional point gestures (storytelling)
import pointUp from './motions/pointUp.js';
import pointDown from './motions/pointDown.js';
import pointLeft from './motions/pointLeft.js';
import pointRight from './motions/pointRight.js';
// Blending gestures moved from effects/
import breathe from './motions/breathe.js';
import expand from './motions/expand.js';
import contract from './motions/contract.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT TRANSFORM GESTURES (Override - replace motion completely)
// └─────────────────────────────────────────────────────────────────────────────────────
import spin from './transforms/spin.js';
// Directional spin gestures
import spinLeft from './transforms/spinLeft.js';
import spinRight from './transforms/spinRight.js';
import jump from './transforms/jump.js';
// Directional jump gestures
import jumpUp from './transforms/jumpUp.js';
import jumpDown from './transforms/jumpDown.js';
import jumpLeft from './transforms/jumpLeft.js';
import jumpRight from './transforms/jumpRight.js';
import morph from './transforms/morph.js';
import stretch from './transforms/stretch.js';
import tilt from './transforms/tilt.js';
// Directional tilt gestures
import tiltUp from './transforms/tiltUp.js';
import tiltDown from './transforms/tiltDown.js';
import tiltLeft from './transforms/tiltLeft.js';
import tiltRight from './transforms/tiltRight.js';
// Directional orbit gestures (simple orbiting motion)
import orbitLeft from './transforms/orbitLeft.js';
import orbitRight from './transforms/orbitRight.js';
import orbitUp from './transforms/orbitUp.js';
import orbitDown from './transforms/orbitDown.js';
import hula from './transforms/hula.js';
import twist from './transforms/twist.js';
// Override gestures moved from effects/ and motions/
import orbit from './transforms/orbit.js';
import vortex from './transforms/vortex.js';
import shatter from './transforms/shatter.js';
// New transform gestures - acrobatic
import flip from './transforms/flip.js';
import backflip from './transforms/backflip.js';
// New transform gestures - dramatic poses
import crouch from './transforms/crouch.js';
import lunge from './transforms/lunge.js';
import recoil from './transforms/recoil.js';
import bow from './transforms/bow.js';
// Directional lunge gestures
import { createLungeGesture } from './transforms/lungeFactory.js';
const lungeForward = createLungeGesture('forward');
const lungeBack = createLungeGesture('back');
const lungeLeft = createLungeGesture('left');
const lungeRight = createLungeGesture('right');
const lungeUp = createLungeGesture('up');
const lungeDown = createLungeGesture('down');
// Directional recoil gestures
import { createRecoilGesture } from './transforms/recoilFactory.js';
const recoilBack = createRecoilGesture('back');
const recoilForward = createRecoilGesture('forward');
const recoilLeft = createRecoilGesture('left');
const recoilRight = createRecoilGesture('right');
const recoilUp = createRecoilGesture('up');
const recoilDown = createRecoilGesture('down');
// Directional bow gestures
import { createBowGesture } from './transforms/bowFactory.js';
const bowForward = createBowGesture('forward');
const bowBack = createBowGesture('back');
const bowLeft = createBowGesture('left');
const bowRight = createBowGesture('right');
// New transform gestures - size transformations
import inflate from './transforms/inflate.js';
import deflate from './transforms/deflate.js';
import squash from './transforms/squash.js';
// New transform gestures - oscillating
import pendulum from './transforms/pendulum.js';
import teeter from './transforms/teeter.js';
import wobble from './transforms/wobble.js';
import rock from './transforms/rock.js';
// New transform gestures - combat/impact
import knockout from './transforms/knockout.js';
import knockdown from './transforms/knockdown.js';
import { createOofGesture } from './transforms/oofFactory.js';
const oofLeft = createOofGesture('left');
const oofRight = createOofGesture('right');
const oofFront = createOofGesture('front');
const oofBack = createOofGesture('back');
const oofUp = createOofGesture('up');
const oofDown = createOofGesture('down');
// Geometry shatter gestures (actual mesh fragmentation, 3D only)
import { createShatterGesture } from './transforms/shatterFactory.js';
const shatterMesh = createShatterGesture('default');
const shatterExplosive = createShatterGesture('explosive');
const shatterCrumble = createShatterGesture('crumble');
// New transform gestures - intense emotions
import rage from './transforms/rage.js';
import fury from './transforms/fury.js';
import battlecry from './transforms/battlecry.js';
import charge from './transforms/charge.js';
// Directional rush gestures
import { createRushGesture } from './transforms/rushFactory.js';
const rushForward = createRushGesture('forward');
const rushBack = createRushGesture('back');
const rushLeft = createRushGesture('left');
const rushRight = createRushGesture('right');
const rushUp = createRushGesture('up');
const rushDown = createRushGesture('down');
// Pancake gesture (extreme squash)
import pancake from './transforms/pancake.js';

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ IMPORT EFFECT GESTURES (Visual effects)
// └─────────────────────────────────────────────────────────────────────────────────────
import wave from './effects/wave.js';
import drift from './effects/drift.js';
// Directional drift gestures
import driftUp from './effects/driftUp.js';
import driftDown from './effects/driftDown.js';
import driftLeft from './effects/driftLeft.js';
import driftRight from './effects/driftRight.js';
import flicker from './effects/flicker.js';
import burst from './effects/burst.js';
import directional from './effects/directional.js';
import settle from './effects/settle.js';
import fade from './effects/fade.js';
import hold from './effects/hold.js';
import flash from './effects/flash.js';
import glow from './effects/glow.js';
import peek from './effects/peek.js';
import runningman from './effects/runningman.js';
import charleston from './effects/charleston.js';
import rain from './effects/rain.js';
// New effect gestures (Tier 1 - emotional)
import shiver from './effects/shiver.js';
import heartbeat from './effects/heartbeat.js';
import confetti from './effects/confetti.js';
import fizz from './effects/fizz.js';
// Cascade gestures (directional waterfall)
import cascadeUp from './effects/cascadeUp.js';
import cascadeDown from './effects/cascadeDown.js';
import cascadeLeft from './effects/cascadeLeft.js';
import cascadeRight from './effects/cascadeRight.js';
// Directional burst gestures
import burstUp from './effects/burstUp.js';
import burstDown from './effects/burstDown.js';
import burstLeft from './effects/burstLeft.js';
import burstRight from './effects/burstRight.js';
// New effect gestures (Tier 2 - dynamics)
import ripple from './effects/ripple.js';
import elasticBounce from './effects/elasticBounce.js';
// Scatter gestures (directional chaos)
import scatterUp from './effects/scatterUp.js';
import scatterDown from './effects/scatterDown.js';
import scatterLeft from './effects/scatterLeft.js';
import scatterRight from './effects/scatterRight.js';
// Swarm gestures (directional flock)
import swarmUp from './effects/swarmUp.js';
import swarmDown from './effects/swarmDown.js';
import swarmLeft from './effects/swarmLeft.js';
import swarmRight from './effects/swarmRight.js';
// New effect gestures (Tier 3 - nice to have)
import bloom from './effects/bloom.js';
import snap from './effects/snap.js';
// Directional magnetic gestures
import { createMagneticGesture } from './effects/magneticFactory.js';
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
    contract
];

const TRANSFORM_GESTURES = [
    spin,
    spinLeft,
    spinRight,
    jump,
    // Directional jump gestures
    jumpUp,
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
    // Directional orbit gestures
    orbitLeft,
    orbitRight,
    orbitUp,
    orbitDown,
    hula,
    twist,
    // Override gestures (moved from effects/ and motions/)
    orbit,
    vortex,
    shatter,
    // New transform gestures - acrobatic
    flip,
    backflip,
    // New transform gestures - dramatic poses
    crouch,
    lunge,
    recoil,
    bow,
    // Directional bow gestures
    bowForward,
    bowBack,
    bowLeft,
    bowRight,
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
    // New transform gestures - oscillating
    pendulum,
    teeter,
    wobble,
    rock,
    // New transform gestures - combat/impact
    knockout,
    knockdown,
    oofLeft,
    oofRight,
    oofFront,
    oofBack,
    oofUp,
    oofDown,
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
    shatterCrumble
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
    runningman,
    charleston,
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
    // Scatter gestures (directional chaos)
    scatterUp,
    scatterDown,
    scatterLeft,
    scatterRight,
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
    magneticRepel
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
 * @returns {Array} Array of gesture info objects
 */
export function listGestures() {
    const allGestures = [];

    // Helper to determine category from array membership
    const getCategory = gestureName => {
        if (GESTURE_TYPES.blending.includes(gestureName)) return 'motion';
        if (GESTURE_TYPES.override.includes(gestureName)) return 'transform';
        if (GESTURE_TYPES.effect.includes(gestureName)) return 'effect';
        return 'effect'; // Default fallback
    };

    // Add core gestures
    Object.values(GESTURE_REGISTRY).forEach(gesture => {
        allGestures.push({
            name: gesture.name,
            emoji: gesture.emoji || '🎭',
            type: gesture.type,
            category: getCategory(gesture.name),
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
    getGesture,
    isBlendingGesture,
    isOverrideGesture,
    applyGesture,
    listGestures,
    pluginAdapter
};