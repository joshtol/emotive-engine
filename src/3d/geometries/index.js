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
import { createIcosphere } from './Icosphere.js';
import { createTorusKnot } from './TorusKnot.js';
import { createRoundedCube } from './RoundedCube.js';
import { createBunny } from './Bunny.js';

/**
 * Core geometry registry
 * These are available immediately without loading
 */
export const CORE_GEOMETRIES = {
    // Basic shapes
    sphere: createSphere(32, 32),     // UV sphere (pole distortion)
    icosphere: createIcosphere(2),    // Subdivided icosahedron (uniform triangles)
    torus: createTorus(1.0, 0.4, 48, 24), // Donut/ring shape

    // Advanced shader testing geometries
    torusknot: createTorusKnot(3, 2, 64, 128, 0.4, 1.0),  // Knotted pretzel (AO + iridescence)
    roundedcube: createRoundedCube(1.0, 0.1, 8),           // Cube with rounded edges (AO testing)
    bunny: createBunny(),                                  // Organic bunny (SSS on ears)

    // Crystalline shapes
    crystal: createCrystal(6),         // Hexagonal crystal
    diamond: createDiamond()           // Brilliant cut diamond
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
export { createIcosphere } from './Icosphere.js';
export { createTorusKnot } from './TorusKnot.js';
export { createRoundedCube } from './RoundedCube.js';
export { createBunny } from './Bunny.js';
