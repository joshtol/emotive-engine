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
    FIRE_VARIANTS,
    ICE_VARIANTS,
    ELECTRIC_VARIANTS,
    VOID_VARIANTS,
    ALL_ELEMENTAL_VARIANTS
} from './elementalFactory.js';

// Ice effect gesture factory
export { buildIceEffectGesture } from './iceEffectFactory.js';

// Light effect gesture factory
export { buildLightEffectGesture } from './lightEffectFactory.js';


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
export { default as earthtwirl } from './earthtwirl.js';
export { default as earthshield } from './earthshield.js';

// Earth effect variants list for discovery
export const EARTH_EFFECT_VARIANTS = [
    'earthpetrify', 'earthburden',
    'earthrumble', 'earthquake', 'earthmeditation',
    'earthencase', 'earthcrumble', 'earthshatter', 'eartherode',
    'earthcrown', 'earthdance', 'earthhelix', 'earthpillar',
    'earthdrill', 'earthflourish', 'earthvortex', 'earthbarrage',
    'earthimpact', 'earthblast', 'earthsurge', 'earthtwirl',
    'earthshield'
];

// Nature effect gesture factories
export { buildNatureEffectGesture } from './natureEffectFactory.js';

// Nature effect gestures (self-contained gesture files - attribute gestures)
export { default as entangle } from './entangle.js';
export { default as root } from './root.js';
export { default as naturetwirl } from './naturetwirl.js';
export { default as bloom } from './bloom.js';
export { default as sprout } from './sprout.js';
export { default as wilt } from './wilt.js';
export { default as overgrow } from './overgrow.js';
export { default as natureconstrict } from './natureconstrict.js';

// Nature effect gestures (self-contained gesture files - character + ring/spectacle)
export { default as naturecrown } from './naturecrown.js';
export { default as naturemeditation } from './naturemeditation.js';
export { default as natureshield } from './natureshield.js';
export { default as naturevortex } from './naturevortex.js';
export { default as naturedance } from './naturedance.js';
export { default as naturehelix } from './naturehelix.js';
export { default as naturedrill } from './naturedrill.js';
export { default as natureflourish } from './natureflourish.js';
export { default as naturepillar } from './naturepillar.js';
export { default as naturebarrage } from './naturebarrage.js';
export { default as seedburst } from './seedburst.js';
export { default as seedpod } from './seedpod.js';
export { default as naturecleanse } from './naturecleanse.js';
export { default as naturesplinter } from './naturesplinter.js';

// Nature effect variants list for discovery
export const NATURE_GESTURE_VARIANTS = [
    'natureentangle', 'natureroot', 'naturetwirl',
    'naturebloom', 'natureconstrict', 'sprout',
    'wilt', 'overgrow',
    'naturecrown', 'naturemeditation', 'natureshield',
    'naturevortex', 'naturedance', 'naturehelix',
    'naturedrill', 'natureflourish', 'naturepillar',
    'naturebarrage', 'seedburst', 'seedpod',
    'naturecleanse', 'naturesplinter'
];

// Water effect gestures (self-contained gesture files)
export { default as watershield } from './watershield.js';

// Ice effect gestures (self-contained gesture files)
export { default as iceshield } from './iceshield.js';

// Electric effect gestures (self-contained gesture files)
export { default as electricshield } from './electricshield.js';

// Void effect gestures (self-contained gesture files)
export { default as voidshield } from './voidshield.js';

// Light effect gestures (self-contained gesture files)
export { default as lightshield } from './lightshield.js';

// Void effect gesture factory + individual gesture re-exports
export {
    buildVoidEffectGesture,
    drain,
    hollow,
    corrupt,
    consume,
    singularity,
    voidCrown,
    voidDance,
    voidHelix,
    voidPillar,
    voidDrill,
    voidFlourish,
    voidVortex,
    voidBarrage,
    voidImpact,
    voidSingularity
} from './voidEffectFactory.js';


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
export { default as firetwirl } from './firetwirl.js';
export { default as fireshield } from './fireshield.js';

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
    'firehelix',
    'firetwirl',
    'fireshield'
];
