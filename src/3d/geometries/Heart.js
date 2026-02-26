/**
 * Heart Geometry Loader
 *
 * Loads the heart.obj model, similar to how crystal.obj is loaded.
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

/**
 * Generate simple planar UV coordinates for a geometry
 * Uses XY position mapped to 0-1 range (no seams/streaks)
 * @param {THREE.BufferGeometry} geometry
 */
function generatePlanarUVs(geometry) {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const positions = geometry.attributes.position;
    const uvs = new Float32Array(positions.count * 2);

    const sizeX = bbox.max.x - bbox.min.x;
    const sizeY = bbox.max.y - bbox.min.y;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        // Simple planar projection from front
        uvs[i * 2] = (x - bbox.min.x) / sizeX;
        uvs[i * 2 + 1] = (y - bbox.min.y) / sizeY;
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

/**
 * Load heart OBJ model asynchronously
 * @param {string} assetBasePath - Base path for assets (default: '/assets')
 * @returns {Promise<THREE.BufferGeometry>} Heart geometry
 */
export function loadHeartGeometry(assetBasePath = '/assets') {
    return new Promise(resolve => {
        const loader = new OBJLoader();
        loader.load(
            `${assetBasePath}/models/Crystal/heart.obj`,
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

                    // Scale heart smaller than crystal (~1.2 diameter vs 1.6)
                    const size = new THREE.Vector3();
                    geometry.boundingBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.2 / maxDim;
                    geometry.scale(scale, scale, scale);

                    // Compute normals
                    geometry.computeVertexNormals();
                    geometry.computeBoundingBox();

                    // Only generate UVs if OBJ doesn't have them
                    if (!geometry.attributes.uv) {
                        generatePlanarUVs(geometry);
                    }

                    resolve(geometry);
                } else {
                    console.warn('💗 [HEART] No mesh in OBJ, using fallback');
                    resolve(createFallbackHeart());
                }
            },
            undefined,
            error => {
                console.warn('💗 [HEART] OBJ load failed:', error);
                resolve(createFallbackHeart());
            }
        );
    });
}

/**
 * Fallback procedural heart if OBJ fails to load
 */
function createFallbackHeart() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    // Deform sphere into rough heart shape
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        const y = positions.getY(i);
        let z = positions.getZ(i);

        // Heart deformation
        const heartScale = 1 + 0.3 * Math.max(0, y);
        x *= heartScale;
        z *= heartScale * 0.8;

        // Bottom point
        if (y < -0.3) {
            const factor = (-y - 0.3) / 0.2;
            x *= 1 - factor * 0.8;
            z *= 1 - factor * 0.8;
        }

        positions.setXYZ(i, x, y, z);
    }
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Legacy createHeart function for backwards compatibility
 * Returns raw vertex data for procedural fallback
 */
export function createHeart() {
    const geometry = createFallbackHeart();
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    const index = geometry.index ? geometry.index.array : null;

    return {
        vertices: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: index ? new Uint16Array(index) : null,
    };
}
