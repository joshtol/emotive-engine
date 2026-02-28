// Type definitions for @joshtol/emotive-engine/3d-elementals v3.4.0
// Project: https://github.com/joshtol/emotive-engine
// Definitions by: Emotive Engine Team

// Re-export everything from the base 3D module
export * from './3d';
export { default } from './3d';

// =============================================================================
// ELEMENT TYPES
// =============================================================================

export type ElementType =
    | 'fire'
    | 'water'
    | 'ice'
    | 'electricity'
    | 'void'
    | 'light'
    | 'earth'
    | 'nature';

// =============================================================================
// ELEMENTAL GESTURE NAMES
// =============================================================================

export type FireGestureName =
    | 'burn'
    | 'scorch'
    | 'combust'
    | 'radiate'
    | 'blaze'
    | 'flame-vortex'
    | 'firedance'
    | 'phoenix'
    | 'fireflourish'
    | 'firecrown'
    | 'firemeditation'
    | 'firedrill'
    | 'firepillar'
    | 'firehelix'
    | 'firebarrage'
    | 'fireimpact'
    | 'fireblast'
    | 'firetwirl'
    | 'fireshield';

export type WaterGestureName =
    | 'splash'
    | 'drench'
    | 'soak'
    | 'flow'
    | 'tide'
    | 'liquefy'
    | 'pool'
    | 'watervortex'
    | 'watercrown'
    | 'waterdance'
    | 'waterdrill'
    | 'waterhelix'
    | 'watermeditation'
    | 'waterpillar'
    | 'waterflourish'
    | 'waterbarrage'
    | 'waterimpact'
    | 'watercrush'
    | 'watertwirl'
    | 'watershield';

export type IceGestureName =
    | 'icecrown'
    | 'icedance'
    | 'icepillar'
    | 'icehelix'
    | 'icemeditation'
    | 'icevortex'
    | 'icesplash'
    | 'iceencase'
    | 'icedrill'
    | 'iceflourish'
    | 'icebarrage'
    | 'iceimpact'
    | 'icemist'
    | 'iceshiver'
    | 'icetwirl'
    | 'iceshield';

export type ElectricGestureName =
    | 'shock'
    | 'overload'
    | 'glitch'
    | 'crackle'
    | 'chargeUp'
    | 'electricAuraEffect'
    | 'staticDischarge'
    | 'electriccrown'
    | 'electricdance'
    | 'electrichelix'
    | 'electricpillar'
    | 'electricdrill'
    | 'electricflourish'
    | 'electricvortex'
    | 'electricbarrage'
    | 'electricimpact'
    | 'electricblast'
    | 'electricsurge'
    | 'zap'
    | 'electricmeditation'
    | 'electrictwirl'
    | 'electricshield';

export type VoidGestureName =
    | 'voiddrain'
    | 'voidhollow'
    | 'voidcorrupt'
    | 'voidconsume'
    | 'voidsingularity'
    | 'voidcrown'
    | 'voiddance'
    | 'voidhelix'
    | 'voidpillar'
    | 'voiddrill'
    | 'voidflourish'
    | 'voidvortex'
    | 'voidbarrage'
    | 'voidimpact'
    | 'voidmeditation'
    | 'voidtwirl'
    | 'voidshield';

export type LightGestureName =
    | 'lightblind'
    | 'lightpurify'
    | 'lightcleanse'
    | 'lightradiate'
    | 'lightglow'
    | 'lightbeacon'
    | 'lightascend'
    | 'lightilluminate'
    | 'lightdissolve'
    | 'lightmeditation'
    | 'lightcrown'
    | 'lightdance'
    | 'lighthelix'
    | 'lightpillar'
    | 'lightdrill'
    | 'lightflourish'
    | 'lightvortex'
    | 'lightbarrage'
    | 'lightimpact'
    | 'lightblast'
    | 'lightsurge'
    | 'lighttwirl'
    | 'lightshield';

export type EarthGestureName =
    | 'earthpetrify'
    | 'earthburden'
    | 'earthrumble'
    | 'earthquake'
    | 'earthencase'
    | 'earthcrumble'
    | 'earthshatter'
    | 'eartherode'
    | 'earthmeditation'
    | 'earthcrown'
    | 'earthdance'
    | 'earthhelix'
    | 'earthpillar'
    | 'earthdrill'
    | 'earthflourish'
    | 'earthvortex'
    | 'earthbarrage'
    | 'earthimpact'
    | 'earthblast'
    | 'earthsurge'
    | 'earthtwirl'
    | 'earthshield';

export type NatureGestureName =
    | 'natureentangle'
    | 'natureroot'
    | 'naturetwirl'
    | 'natureconstrict'
    | 'naturebloom'
    | 'naturecrown'
    | 'naturedance'
    | 'naturedrill'
    | 'natureflourish'
    | 'naturehelix'
    | 'naturemeditation'
    | 'naturepillar'
    | 'naturevortex'
    | 'naturebarrage'
    | 'natureshield'
    | 'seedburst'
    | 'seedpod'
    | 'naturecleanse'
    | 'naturesplinter'
    | 'naturesprout'
    | 'naturethrive';

/** Union of all elemental gesture names */
export type ElementalGestureName =
    | FireGestureName
    | WaterGestureName
    | IceGestureName
    | ElectricGestureName
    | VoidGestureName
    | LightGestureName
    | EarthGestureName
    | NatureGestureName;
