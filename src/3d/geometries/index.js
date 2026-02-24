/**
 * Procedural 3D Geometries
 *
 * Built-in geometry library - no loading required!
 * Each geometry is generated procedurally from mathematical functions.
 */

export { createSphere } from './Sphere.js';
export { createCrystal } from './Crystal.js';
export { createDiamond } from './Diamond.js';
export { createMoon, createMoonMaterial, createMoonCrescentMaterial, createMoonFallbackMaterial, updateMoonGlow, updateCrescentShadow, disposeMoon } from './Moon.js';
export { createSunGeometry, createSunMaterial, updateSunMaterial, disposeSun } from './Sun.js';
