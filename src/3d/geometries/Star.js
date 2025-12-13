/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Star Geometry Loader
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Star crystal geometry loader for 3D rendering
 * @author Emotive Engine Team
 * @module 3d/geometries/Star
 *
 * Loads the star.obj model and prepares it for use with the crystal material system.
 * The star geometry uses the citrine SSS preset by default for a warm golden appearance.
 *
 * Assets required:
 * - /assets/models/Crystal/star.obj - Star 3D model
 * - /assets/textures/Crystal/star.png - Star texture for internal patterns
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
 * Load star OBJ model asynchronously
 * @returns {Promise<THREE.BufferGeometry>} Star geometry
 */
export function loadStarGeometry() {
    return new Promise(resolve => {
        const loader = new OBJLoader();
        loader.load(
            '/assets/models/Crystal/star.obj',
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

                    // Scale star to match other crystals (~1.4 diameter)
                    const size = new THREE.Vector3();
                    geometry.boundingBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.4 / maxDim;
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
                    console.warn('⭐ [STAR] No mesh in OBJ, using fallback');
                    resolve(createFallbackStar());
                }
            },
            undefined,
            error => {
                console.warn('⭐ [STAR] OBJ load failed:', error);
                resolve(createFallbackStar());
            }
        );
    });
}

/**
 * Fallback procedural star if OBJ fails to load
 * Creates a 5-pointed star shape
 */
function createFallbackStar() {
    // Use dodecahedron as fallback for star
    const geometry = new THREE.DodecahedronGeometry(0.5, 0);
    geometry.computeVertexNormals();
    return geometry;
}
