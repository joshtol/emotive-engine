/**
 * @fileoverview The page surface the transparent canvas composites onto.
 *
 * The canvas is alpha:true + premultipliedAlpha, so additive light (electric arcs,
 * the glow layer) reads as light on a dark page but washes out, or turns into a
 * grey disc, on a light one. 'light' tells materials that care to draw as ink
 * instead. A tiny pub/sub so the base renderer never imports element materials.
 * @module materials/surface
 */

let surface = 'dark';
const listeners = new Set();

/** @returns {'dark'|'light'} */
export function getSurface() {
    return surface;
}

/** @param {'dark'|'light'} mode */
export function setSurface(mode) {
    const next = mode === 'light' ? 'light' : 'dark';
    if (next === surface) return;
    surface = next;
    for (const fn of listeners) fn(surface);
}

/**
 * @param {(mode: 'dark'|'light') => void} fn
 * @returns {() => void} unsubscribe
 */
export function onSurfaceChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
