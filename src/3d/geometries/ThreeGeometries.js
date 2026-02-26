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
import { createSunGeometry as _createSunGeometry } from './Sun.js'; // Re-exported via index
import { loadHeartGeometry } from './Heart.js';
import { loadStarGeometry } from './Star.js';

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
 * @param {string} assetBasePath - Base path for assets (default: '/assets')
 * @returns {Promise<THREE.BufferGeometry>} Crystal geometry
 */
function loadCrystalGeometry(assetBasePath = '/assets') {
    return new Promise((resolve, _reject) => {
        const loader = new OBJLoader();
        loader.load(
            `${assetBasePath}/models/Crystal/crystal.obj`,
            obj => {
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
                    const scale = 1.6 / maxDim; // Scale to ~1.6 diameter to match sun/moon size
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
                        const targetCount = Math.floor(
                            originalVertexCount * (1 - crystalSimplificationRatio)
                        );

                        try {
                            const modifier = new SimplifyModifier();
                            finalGeometry = modifier.modify(geometry, targetCount);
                        } catch (err) {
                            console.warn(
                                '💎 [CRYSTAL] Simplification failed, using original:',
                                err
                            );
                            finalGeometry = geometry;
                        }
                    }

                    // Compute normals - smooth or faceted
                    if (crystalUseSmoothNormals) {
                        try {
                            // Merge vertices to create smooth normals across shared vertices
                            const merged = mergeVerticesForSmoothNormals(finalGeometry);
                            if (
                                merged &&
                                merged.attributes.position &&
                                merged.attributes.position.count > 0
                            ) {
                                finalGeometry = merged;
                                finalGeometry.computeVertexNormals();
                            } else {
                                console.warn(
                                    '💎 [CRYSTAL] Merge produced empty geometry, using original with recomputed normals'
                                );
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
            _progress => {
                // Progress callback - intentionally empty
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
 * Scaled to match OBJ-loaded crystal (~1.6 diameter)
 * @returns {THREE.BufferGeometry}
 */
function createProceduralCrystal() {
    const segments = 6;
    // Base dimensions (will be scaled down to match OBJ size)
    const height = 3.0;
    const radius = 1.0;
    const pointHeight = 0.8;

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

    // Scale to match OBJ-loaded crystal (~1.6 diameter)
    // Current max dimension is height + 2*pointHeight = 3.0 + 1.6 = 4.6
    const scale = 1.6 / 4.6;
    geometry.scale(scale, scale, scale);

    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Load rough OBJ model asynchronously
 * @param {string} assetBasePath - Base path for assets (default: '/assets')
 * @returns {Promise<THREE.BufferGeometry>} Rough geometry
 */
function loadRoughGeometry(assetBasePath = '/assets') {
    return new Promise(resolve => {
        const loader = new OBJLoader();
        loader.load(
            `${assetBasePath}/models/Crystal/rough.obj`,
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
 * Core geometry registry using Three.js
 *
 * Safe geometries only - all use compatible material systems:
 * - Crystal-type: crystal, rough, heart, star (CrystalSoul + SSS shader)
 * - Moon: Custom lunar shader with phases and eclipse
 * - Sun: Emissive shader with corona and eclipse effects
 */
export const THREE_GEOMETRIES = {
    moon: {
        geometry: createMoon(64, 64),
        material: 'custom',
        blink: {
            type: 'gentle-pulse',
            duration: 180,
            scaleAxis: [0.95, 0.95, 0.95],
            glowBoost: 0.2,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.4, // Wider sphere needs particles further out
    },

    sun: {
        geometry: new THREE.SphereGeometry(0.5, 64, 64),
        material: 'emissive',
        blink: {
            type: 'radial-pulse',
            duration: 200,
            scaleAxis: [1.05, 1.05, 1.05],
            glowBoost: 0.5,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.5, // Sun with corona needs particles even further
    },

    // Crystal with inner soul glow
    crystal: {
        geometry: null,
        geometryLoader: loadCrystalGeometry,
        material: 'custom',
        blink: {
            type: 'facet-flash',
            duration: 160,
            scaleAxis: [0.95, 0.95, 0.95],
            glowBoost: 0.4,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.4, // Spread particles out from the crystal
    },

    // Rough (raw crystal formation)
    rough: {
        geometry: null,
        geometryLoader: loadRoughGeometry,
        material: 'custom',
        blink: {
            type: 'facet-flash',
            duration: 150,
            scaleAxis: [0.95, 0.95, 0.95],
            glowBoost: 0.5,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.3, // Spread particles out from the rough formation
    },

    // Heart-cut crystal
    heart: {
        geometry: null,
        geometryLoader: loadHeartGeometry,
        material: 'custom',
        blink: {
            type: 'gentle-pulse',
            duration: 180,
            scaleAxis: [0.92, 0.92, 0.92],
            glowBoost: 0.6,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.3, // Spread particles out from the heart
    },

    // Star-cut crystal
    star: {
        geometry: null,
        geometryLoader: loadStarGeometry,
        material: 'custom',
        blink: {
            type: 'facet-flash',
            duration: 150,
            scaleAxis: [0.93, 0.93, 0.93],
            glowBoost: 0.5,
            curve: 'sine',
        },
        particleRadiusMultiplier: 1.4, // Spread particles out from the star
    },
};
