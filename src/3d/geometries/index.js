/**
 * Procedural 3D Geometries
 *
 * Built-in geometry library - no loading required!
 * Each geometry is generated procedurally from mathematical functions.
 */

import { createSphere } from './Sphere.js';
import { createCrystal } from './Crystal.js';
import { createDiamond } from './Diamond.js';

/**
 * Core geometry registry (LEGACY - NOT USED)
 *
 * This registry uses the old custom WebGL format with raw TypedArrays.
 * It has been superseded by THREE_GEOMETRIES in ThreeGeometries.js which uses Three.js BufferGeometry.
 *
 * MEMORY LEAK NOTE: This registry can be safely removed in a future cleanup as it is not referenced
 * anywhere in the codebase. The THREE_GEOMETRIES registry is used instead.
 *
 * These are available immediately without loading
 */
export const CORE_GEOMETRIES = {
    // Basic shapes
    sphere: createSphere(32, 32),     // Smooth sphere

    // Crystalline shapes
    crystal: createCrystal(6),         // Hexagonal crystal
    diamond: createDiamond(),          // Brilliant cut diamond

    // Platonic solids (TODO: Phase 2)
    // cube: createCube(),
    // octahedron: createOctahedron(),
    // icosahedron: createIcosahedron()
};

/**
 * Dispose of all core geometries
 * Call this when shutting down the 3D system to free GPU memory
 */
export function disposeCoreGeometries() {
    Object.values(CORE_GEOMETRIES).forEach(geometry => {
        if (geometry && geometry.vertices) {
            // Our custom geometry format doesn't need disposal (just TypedArrays)
            // But we null the references to help GC
            geometry.vertices = null;
            geometry.normals = null;
            geometry.indices = null;
        }
    });
}

/**
 * Geometry format:
 * {
 *   vertices: Float32Array,  // [x,y,z, x,y,z, ...]
 *   normals: Float32Array,   // [nx,ny,nz, nx,ny,nz, ...]
 *   indices: Uint16Array     // [i1,i2,i3, i1,i2,i3, ...] triangles
 * }
 */

export { createSphere } from './Sphere.js';
export { createCrystal } from './Crystal.js';
export { createDiamond } from './Diamond.js';
export { createMoon, createMoonMaterial, createMoonCrescentMaterial, createMoonFallbackMaterial, updateMoonGlow, updateCrescentShadow, disposeMoon } from './Moon.js';
export { createSunGeometry, createSunMaterial, updateSunMaterial, disposeSun } from './Sun.js';
