/**
 * Three.js Procedural Geometries
 *
 * Replaces custom WebGL geometries with Three.js BufferGeometry
 * Maintains same shape designs but uses Three.js infrastructure
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createMoon } from './Moon.js';
import { createSunGeometry } from './Sun.js';
import { createBlackHoleGroup } from './BlackHole.js';
import { loadHeartGeometry } from './Heart.js';

/**
 * Merge vertices at the same position to create smooth normals
 * This eliminates the faceted appearance by averaging normals at shared vertices
 * @param {THREE.BufferGeometry} geometry
 * @returns {THREE.BufferGeometry}
 */
function mergeVerticesForSmoothNormals(geometry) {
    // BufferGeometryUtils.mergeVertices merges vertices that share the same position
    // This allows computeVertexNormals to average normals across faces
    const merged = BufferGeometryUtils.mergeVertices(geometry, 0.0001);
    return merged;
}

// Default simplification ratio (0 = no simplification, 0.9 = remove 90% of vertices)
// DISABLED - SimplifyModifier may be causing issues
let crystalSimplificationRatio = 0;

// Whether to use smooth normals (eliminates faceted appearance)
// DISABLED - mergeVertices may be causing issues
let crystalUseSmoothNormals = false;

/**
 * Set crystal mesh simplification ratio
 * @param {number} ratio - 0 to 0.95 (higher = fewer triangles)
 */
export function setCrystalSimplification(ratio) {
    crystalSimplificationRatio = Math.max(0, Math.min(0.95, ratio));
}

/**
 * Set whether crystal should use smooth normals
 * @param {boolean} smooth - true for smooth, false for faceted
 */
export function setCrystalSmoothNormals(smooth) {
    crystalUseSmoothNormals = smooth;
}

/**
 * Load crystal OBJ model asynchronously
 * @returns {Promise<THREE.BufferGeometry>} Crystal geometry
 */
function loadCrystalGeometry() {
    console.log('[OBJ] Loading crystal geometry...');
    return new Promise((resolve, reject) => {
        const loader = new OBJLoader();
        loader.load(
            '/assets/models/Crystal/crystal.obj',
            obj => {
                console.log('[OBJ] Crystal OBJ loaded successfully');
                let geometry = null;
                obj.traverse(child => {
                    if (child.isMesh && child.geometry) {
                        ({ geometry } = child);
                    }
                });

                if (geometry) {
                    geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    geometry.boundingBox.getCenter(center);
                    geometry.translate(-center.x, -center.y, -center.z);

                    const size = new THREE.Vector3();
                    geometry.boundingBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.6 / maxDim;  // Scale to ~1.6 diameter to match sun/moon size
                    geometry.scale(scale, scale, scale);
                    // Preserve original OBJ normals if present, otherwise compute them
                    if (!geometry.attributes.normal) {
                        geometry.computeVertexNormals();
                    }
                    // else: keep original normals from OBJ file

                    // Recompute bounding box after transforms
                    geometry.computeBoundingBox();
                    const finalSize = new THREE.Vector3();
                    geometry.boundingBox.getSize(finalSize);


                    // Simplify geometry to reduce triangle count
                    let finalGeometry = geometry;
                    if (crystalSimplificationRatio > 0) {
                        const originalVertexCount = geometry.attributes.position.count;
                        const targetCount = Math.floor(originalVertexCount * (1 - crystalSimplificationRatio));

                        try {
                            const modifier = new SimplifyModifier();
                            finalGeometry = modifier.modify(geometry, targetCount);

                        } catch (err) {
                            console.warn('💎 [CRYSTAL] Simplification failed, using original:', err);
                            finalGeometry = geometry;
                        }
                    }

                    // Compute normals - smooth or faceted
                    if (crystalUseSmoothNormals) {
                        try {
                            // Merge vertices to create smooth normals across shared vertices
                            const merged = mergeVerticesForSmoothNormals(finalGeometry);
                            if (merged && merged.attributes.position && merged.attributes.position.count > 0) {
                                finalGeometry = merged;
                                finalGeometry.computeVertexNormals();
                            } else {
                                console.warn('💎 [CRYSTAL] Merge produced empty geometry, using original with recomputed normals');
                                finalGeometry.computeVertexNormals();
                            }
                        } catch (err) {
                            console.warn('💎 [CRYSTAL] Smooth normals failed:', err);
                            finalGeometry.computeVertexNormals();
                        }
                    } else {
                        // Faceted look - each triangle has its own normals
                        finalGeometry.computeVertexNormals();
                    }

                    resolve(finalGeometry);
                } else {
                    console.warn('💎 [CRYSTAL] No mesh in OBJ, using fallback');
                    const fallback = createProceduralCrystal();
                    resolve(fallback);
                }
            },
            progress => {
            },
            error => {
                console.warn('💎 [CRYSTAL] OBJ load FAILED:', error);
                const fallback = createProceduralCrystal();
                resolve(fallback);
            }
        );
    });
}

/**
 * Create procedural crystal geometry (fallback)
 * @returns {THREE.BufferGeometry}
 */
function createProceduralCrystal() {
    const segments = 6;
    const height = 3.0;      // Doubled from 1.5
    const radius = 1.0;      // Increased from 0.4
    const pointHeight = 0.8; // Doubled from 0.4

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    vertices.push(0, height / 2 + pointHeight, 0);

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
    }

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push(Math.cos(angle) * radius, -height / 2, Math.sin(angle) * radius);
    }

    vertices.push(0, -height / 2 - pointHeight, 0);

    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push(0, 1 + i, 1 + next);
    }

    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push(1 + i, 1 + segments + i, 1 + next);
        indices.push(1 + next, 1 + segments + i, 1 + segments + next);
    }

    const bottomIdx = 1 + segments * 2;
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push(bottomIdx, 1 + segments + next, 1 + segments + i);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Load rough OBJ model asynchronously
 * @returns {Promise<THREE.BufferGeometry>} Rough geometry
 */
function loadRoughGeometry() {
    return new Promise(resolve => {
        const loader = new OBJLoader();
        loader.load(
            '/assets/models/Crystal/rough.obj',
            obj => {
                let geometry = null;
                obj.traverse(child => {
                    if (child.isMesh && child.geometry) {
                        ({ geometry } = child);
                    }
                });

                if (geometry) {
                    // Center the geometry
                    geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    geometry.boundingBox.getCenter(center);
                    geometry.translate(-center.x, -center.y, -center.z);

                    // Scale to ~1.6 diameter to match other geometries
                    const size = new THREE.Vector3();
                    geometry.boundingBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.6 / maxDim;
                    geometry.scale(scale, scale, scale);

                    // Compute normals
                    geometry.computeVertexNormals();
                    geometry.computeBoundingBox();

                    resolve(geometry);
                } else {
                    console.warn('💎 [ROUGH] No mesh in OBJ, using fallback sphere');
                    resolve(new THREE.SphereGeometry(0.5, 32, 32));
                }
            },
            undefined,
            error => {
                console.warn('💎 [ROUGH] OBJ load failed:', error);
                resolve(new THREE.SphereGeometry(0.5, 32, 32));
            }
        );
    });
}

/**
 * Create smooth sphere geometry
 */
export function createSphere(widthSegments = 64, heightSegments = 64) {
    return new THREE.SphereGeometry(0.5, widthSegments, heightSegments);
}

/**
 * Create torus (donut) geometry
 */
export function createTorus(radius = 0.4, tube = 0.15, radialSegments = 32, tubularSegments = 64) {
    return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
}

/**
 * Create icosahedron geometry
 */
export function createIcosahedron(radius = 0.5, detail = 1) {
    return new THREE.IcosahedronGeometry(radius, detail);
}

/**
 * Create octahedron geometry
 */
export function createOctahedron(radius = 0.5, detail = 0) {
    return new THREE.OctahedronGeometry(radius, detail);
}

/**
 * Create tetrahedron geometry
 */
export function createTetrahedron(radius = 0.5, detail = 0) {
    return new THREE.TetrahedronGeometry(radius, detail);
}

/**
 * Create dodecahedron geometry
 */
export function createDodecahedron(radius = 0.5, detail = 0) {
    return new THREE.DodecahedronGeometry(radius, detail);
}

/**
 * Core geometry registry using Three.js
 */
export const THREE_GEOMETRIES = {
    sphere: {
        geometry: createSphere(64, 64),
        blink: {
            type: 'vertical-squish',
            duration: 150,
            scaleAxis: [1.0, 0.3, 1.0],
            curve: 'sine',
            playful: { anticipation: 0.03, overshoot: 0.05 }
        }
    },

    torus: {
        geometry: createTorus(),
        blink: {
            type: 'vertical-squish',
            duration: 150,
            scaleAxis: [1.0, 0.4, 1.0],
            rotation: [0, 0, Math.PI / 8],
            curve: 'sine'
        }
    },

    icosahedron: {
        geometry: createIcosahedron(0.5, 1),
        blink: { type: 'geometric-pulse', duration: 130, scaleAxis: [0.7, 0.7, 0.7], curve: 'sine' }
    },

    octahedron: {
        geometry: createOctahedron(0.5, 0),
        blink: { type: 'geometric-pulse', duration: 130, scaleAxis: [0.7, 0.7, 0.7], curve: 'sine' }
    },

    tetrahedron: {
        geometry: createTetrahedron(0.5, 0),
        blink: { type: 'geometric-pulse', duration: 110, scaleAxis: [0.75, 0.75, 0.75], rotation: [Math.PI / 6, 0, 0], curve: 'sine' }
    },

    dodecahedron: {
        geometry: createDodecahedron(0.5, 0),
        blink: { type: 'facet-flash', duration: 140, scaleAxis: [0.75, 0.75, 0.75], glowBoost: 0.4, curve: 'sine' }
    },

    'smooth-icosahedron': {
        geometry: createIcosahedron(0.5, 2),
        blink: { type: 'geometric-pulse', duration: 140, scaleAxis: [0.75, 0.75, 0.75], curve: 'sine' }
    },

    'faceted-icosahedron': {
        geometry: createIcosahedron(0.5, 0),
        blink: { type: 'facet-flash', duration: 120, scaleAxis: [0.7, 0.7, 0.7], glowBoost: 0.3, curve: 'sine' }
    },

    'ring': {
        geometry: createTorus(0.4, 0.1, 16, 64),
        blink: { type: 'vertical-squish', duration: 140, scaleAxis: [1.0, 0.5, 1.0], curve: 'sine' }
    },

    moon: {
        geometry: createMoon(64, 64),
        material: 'custom',
        blink: { type: 'gentle-pulse', duration: 180, scaleAxis: [0.95, 0.95, 0.95], glowBoost: 0.2, curve: 'sine' },
        particleRadiusMultiplier: 1.4  // Wider sphere needs particles further out
    },

    sun: {
        geometry: new THREE.SphereGeometry(0.5, 64, 64),
        material: 'emissive',
        blink: { type: 'radial-pulse', duration: 200, scaleAxis: [1.05, 1.05, 1.05], glowBoost: 0.5, curve: 'sine' },
        particleRadiusMultiplier: 1.5  // Sun with corona needs particles even further
    },

    blackHole: {
        geometry: createBlackHoleGroup(),
        material: 'emissive',
        blink: { type: 'accretion-flare', duration: 250, scaleAxis: [1.1, 1.1, 1.1], glowBoost: 0.7, rotation: [0, Math.PI / 8, 0], curve: 'sine' },
        particleRadiusMultiplier: 1.8  // Accretion disk effect needs wide particle field
    },

    // Crystal with inner soul glow
    crystal: {
        geometry: null,
        geometryLoader: loadCrystalGeometry,
        material: 'custom',
        blink: { type: 'facet-flash', duration: 160, scaleAxis: [0.95, 0.95, 0.95], glowBoost: 0.4, curve: 'sine' },
        particleRadiusMultiplier: 1.4  // Spread particles out from the crystal
    },

    // Rough (raw crystal formation)
    rough: {
        geometry: null,
        geometryLoader: loadRoughGeometry,
        material: 'custom',
        blink: { type: 'facet-flash', duration: 150, scaleAxis: [0.95, 0.95, 0.95], glowBoost: 0.5, curve: 'sine' },
        particleRadiusMultiplier: 1.3  // Spread particles out from the rough formation
    },

    // Heart-cut crystal
    heart: {
        geometry: null,
        geometryLoader: loadHeartGeometry,
        material: 'custom',
        blink: { type: 'gentle-pulse', duration: 180, scaleAxis: [0.92, 0.92, 0.92], glowBoost: 0.6, curve: 'sine' },
        particleRadiusMultiplier: 1.3  // Spread particles out from the heart
    }
};
