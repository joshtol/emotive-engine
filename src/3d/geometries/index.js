/**
 * Procedural 3D Geometries
 *
 * Built-in geometry library - no loading required!
 * Each geometry is generated procedurally from mathematical functions.
 */

import { createSphere } from './Sphere.js';
import { createCrystal } from './Crystal.js';
import { createDiamond } from './Diamond.js';
import { createTorus } from './Torus.js';

/**
 * Core geometry registry
 * These are available immediately without loading
 */
export const CORE_GEOMETRIES = {
    // Basic shapes
    sphere: createSphere(32, 32),     // Smooth sphere
    torus: createTorus(1.0, 0.4, 48, 24), // Donut/ring shape

    // Crystalline shapes
    crystal: createCrystal(6),         // Hexagonal crystal
    diamond: createDiamond(),          // Brilliant cut diamond

    // Platonic solids (TODO: Phase 2)
    // cube: createCube(),
    // octahedron: createOctahedron(),
    // icosahedron: createIcosahedron()
};

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
export { createTorus } from './Torus.js';
