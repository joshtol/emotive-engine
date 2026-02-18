/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elemental Gestures Index
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Barrel export for elemental gestures
 * @module gestures/destruction/elemental
 */

export {
    createElementalGesture,
    createElementGestures,
    createAllElementalGestures,
    getElementalVariants,
    getVariantsByElement,
    WATER_VARIANTS,
    SMOKE_VARIANTS,
    FIRE_VARIANTS,
    ICE_VARIANTS,
    ELECTRIC_VARIANTS,
    VOID_VARIANTS,
    ALL_ELEMENTAL_VARIANTS
} from './elementalFactory.js';

// Ice effect gestures
export {
    createIceEffectGesture,
    freeze,
    chill,
    frostbite,
    thaw,
    frost,
    crystallize,
    glacial,
    shatter as iceShatter,
    encase as iceEncase,
    ICE_EFFECT_VARIANTS
} from './iceEffectFactory.js';

// Light effect gesture factory
export { buildLightEffectGesture } from './lightEffectFactory.js';

// Poison effect gestures
export {
    createPoisonEffectGesture,
    infect,
    sicken,
    ooze,
    seep,
    toxic,
    corrode,
    melt,
    decay,
    dissolve as poisonDissolve,
    POISON_EFFECT_VARIANTS
} from './poisonEffectFactory.js';

// Earth effect gesture factory
export { buildEarthEffectGesture } from './earthEffectFactory.js';

// Earth effect gestures (self-contained gesture files)
export { default as earthPetrify } from './earthpetrify.js';
export { default as earthBurden } from './earthburden.js';
export { default as earthRumble } from './earthrumble.js';
export { default as earthQuake } from './earthquake.js';
export { default as earthMeditation } from './earthmeditation.js';
export { default as earthEncase } from './earthencase.js';
export { default as earthCrumble } from './earthcrumble.js';
export { default as earthShatter } from './earthshatter.js';
export { default as earthErode } from './eartherode.js';
export { default as earthcrown } from './earthcrown.js';
export { default as earthdance } from './earthdance.js';
export { default as earthhelix } from './earthhelix.js';
export { default as earthpillar } from './earthpillar.js';
export { default as earthdrill } from './earthdrill.js';
export { default as earthflourish } from './earthflourish.js';
export { default as earthvortex } from './earthvortex.js';
export { default as earthbarrage } from './earthbarrage.js';
export { default as earthimpact } from './earthimpact.js';
export { default as earthblast } from './earthblast.js';
export { default as earthsurge } from './earthsurge.js';

// Earth effect variants list for discovery
export const EARTH_EFFECT_VARIANTS = [
    'earthpetrify', 'earthburden',
    'earthrumble', 'earthquake', 'earthmeditation',
    'earthencase', 'earthcrumble', 'earthshatter', 'eartherode',
    'earthcrown', 'earthdance', 'earthhelix', 'earthpillar',
    'earthdrill', 'earthflourish', 'earthvortex', 'earthbarrage',
    'earthimpact', 'earthblast', 'earthsurge'
];

// Nature effect gestures
export {
    createNatureEffectGesture,
    entangle,
    root,
    constrict,
    bloom,
    sprout,
    flourish,
    wilt,
    overgrow,
    blossom,
    NATURE_EFFECT_VARIANTS
} from './natureEffectFactory.js';

// Void effect gestures
export {
    createVoidEffectGesture,
    drain,
    siphon,
    hollow,
    corrupt,
    taint,
    wither,
    consume,
    erase,
    singularity,
    VOID_EFFECT_VARIANTS
} from './voidEffectFactory.js';

// Smoke effect gestures (derived element - uses void models)
export {
    createSmokeEffectGesture,
    puff,
    billow,
    fume,
    shroud,
    haze,
    choke,
    smokebomb,
    vanish,
    materialize,
    SMOKE_EFFECT_VARIANTS
} from './smokeEffectFactory.js';

// Fire effect factory (buildFireEffectGesture helper only)
export { buildFireEffectGesture } from './fireEffectFactory.js';

// Fire effect gestures (self-contained gesture files)
export { default as burn } from './burn.js';
export { default as scorch } from './scorch.js';
export { default as combust } from './combust.js';
export { default as flameVortex } from './flameVortex.js';
export { default as firedance } from './firedance.js';
export { default as firedanceGesture } from './firedance.js';
export { default as phoenix } from './phoenix.js';
export { default as phoenixGesture } from './phoenix.js';
export { default as radiate } from './radiate.js';
export { default as fireRadiate } from './radiate.js';
export { default as blaze } from './blaze.js';
export { default as fireflourish } from './fireflourish.js';
export { default as fireflourishGesture } from './fireflourish.js';
export { default as firecrown } from './firecrown.js';
export { default as firecrownGesture } from './firecrown.js';
export { default as firemeditation } from './firemeditation.js';
export { default as firemeditationGesture } from './firemeditation.js';
export { default as firedrill } from './firedrill.js';
export { default as firedrillGesture } from './firedrill.js';
export { default as firepillar } from './firepillar.js';
export { default as firepillarGesture } from './firepillar.js';
export { default as firehelix } from './firehelix.js';
export { default as firehelixGesture } from './firehelix.js';

// Fire effect variants list for discovery
export const FIRE_EFFECT_VARIANTS = [
    'burn',
    'scorch',
    'combust',
    'flame-vortex',
    'firedance',
    'phoenix',
    'radiate',
    'blaze',
    'fireflourish',
    'firecrown',
    'firemeditation',
    'firedrill',
    'firepillar',
    'firehelix'
];
