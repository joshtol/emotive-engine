/**
 * @fileoverview The eight elementals, one record each. Single source of truth for
 * the lean per-element builds: rollup.config.js generates one `./3d-<name>` entry per
 * record, package.json lists the registration modules in `sideEffects`, and the
 * smoke test checks that each entry registers its element and no other.
 *
 * - `name`: entry / export suffix (`./3d-electric`, `dist/emotive-mascot-3d-electric.js`)
 * - `type`: ElementTypeRegistry id (what `mascot.setElement(type)` takes)
 * - `gestureDir`: folder under src/core/gestures/elemental/
 * - `modelDir`: folder under models/Elements/ (the basePath the registration uses)
 *
 * @module EmotiveEngine3D/elements
 */

export const ELEMENTS = [
    { name: 'fire',     type: 'fire',        gestureDir: 'fire',     modelDir: 'Fire' },
    { name: 'water',    type: 'water',       gestureDir: 'water',    modelDir: 'Water' },
    { name: 'ice',      type: 'ice',         gestureDir: 'ice',      modelDir: 'Ice' },
    { name: 'electric', type: 'electricity', gestureDir: 'electric', modelDir: 'Electricity' },
    { name: 'earth',    type: 'earth',       gestureDir: 'earth',    modelDir: 'Earth' },
    { name: 'nature',   type: 'nature',      gestureDir: 'nature',   modelDir: 'Nature' },
    { name: 'light',    type: 'light',       gestureDir: 'light',    modelDir: 'Light' },
    { name: 'void',     type: 'void',        gestureDir: 'void',     modelDir: 'Void' },
];

/** Entry module (relative to the repo root) for one element's lean build. */
export const entryFor = e => `src/3d/index-${e.name}.js`;
/** Element-type registration module for one element. */
export const registrationFor = e => `src/3d/effects/elements/${e.type}.js`;
/** Gesture registration module for one element. */
export const gesturesFor = e => `src/core/gestures/elemental/${e.gestureDir}/register.js`;
