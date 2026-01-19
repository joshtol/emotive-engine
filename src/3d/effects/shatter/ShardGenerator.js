/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shard Generator
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Generates shard geometries from any BufferGeometry using triangle clustering
 * @author Emotive Engine Team
 * @module effects/shatter/ShardGenerator
 *
 * ## Algorithm Overview
 *
 * Triangle-based clustering for V1:
 * 1. Extract faces from indexed BufferGeometry
 * 2. Build face adjacency graph (shared edges)
 * 3. Seeded flood-fill to cluster faces into shards
 * 4. Create individual BufferGeometry for each shard cluster
 *
 * This approach is fast and preserves mesh topology, making it suitable
 * for runtime generation at scale (hundreds of millions of models).
 */

import * as THREE from 'three';

/**
 * @typedef {Object} ShardData
 * @property {THREE.BufferGeometry} geometry - The shard's geometry
 * @property {THREE.Vector3} centroid - World-space center for physics origin
 * @property {number} volume - Approximate volume for mass calculation
 */

class ShardGenerator {
    /**
     * Generate shards from a BufferGeometry
     * @param {THREE.BufferGeometry} geometry - Source geometry
     * @param {Object} options - Generation options
     * @returns {THREE.BufferGeometry[]} Array of shard geometries
     */
    static generate(geometry, options = {}) {
        const {
            shardCount = 30,
            minShardSize = 0.05,
            seed = Date.now(),
            preserveUVs = true
        } = options;

        // Ensure geometry is indexed
        const indexedGeometry = geometry.index ? geometry : this._toIndexed(geometry);

        const positions = indexedGeometry.getAttribute('position');
        const indices = indexedGeometry.getIndex();
        const uvs = indexedGeometry.getAttribute('uv');
        const normals = indexedGeometry.getAttribute('normal');

        if (!indices || indices.count === 0) {
            console.warn('ShardGenerator: No valid indices found');
            return [];
        }

        const faceCount = indices.count / 3;
        if (faceCount === 0) {
            console.warn('ShardGenerator: No faces found');
            return [];
        }

        // Build face adjacency graph
        const adjacency = this._buildAdjacencyGraph(indices, faceCount);

        // Cluster faces into shards
        const actualShardCount = Math.min(shardCount, faceCount);
        const clusters = this._clusterFaces(adjacency, actualShardCount, faceCount, seed);

        // Generate BufferGeometry for each cluster
        const shards = clusters
            .filter(cluster => cluster.length > 0)
            .map(cluster => this._createShardGeometry(
                cluster,
                positions,
                indices,
                preserveUVs ? uvs : null,
                normals
            ));

        return shards;
    }

    /**
     * Convert non-indexed geometry to indexed
     * @private
     */
    static _toIndexed(geometry) {
        const positions = geometry.getAttribute('position');
        const indices = [];

        for (let i = 0; i < positions.count; i++) {
            indices.push(i);
        }

        const indexed = geometry.clone();
        indexed.setIndex(indices);
        return indexed;
    }

    /**
     * Build adjacency graph from indexed geometry
     * Two faces are adjacent if they share an edge
     * @private
     */
    static _buildAdjacencyGraph(indices, faceCount) {
        const adjacency = new Map();
        const edgeToFaces = new Map();

        for (let f = 0; f < faceCount; f++) {
            const i0 = indices.getX(f * 3);
            const i1 = indices.getX(f * 3 + 1);
            const i2 = indices.getX(f * 3 + 2);

            // Register edges (sorted to ensure consistent keys)
            const edges = [
                [Math.min(i0, i1), Math.max(i0, i1)],
                [Math.min(i1, i2), Math.max(i1, i2)],
                [Math.min(i2, i0), Math.max(i2, i0)]
            ];

            edges.forEach(([a, b]) => {
                const key = `${a},${b}`;
                if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
                edgeToFaces.get(key).push(f);
            });

            adjacency.set(f, new Set());
        }

        // Build adjacency from shared edges
        for (const faces of edgeToFaces.values()) {
            if (faces.length === 2) {
                adjacency.get(faces[0]).add(faces[1]);
                adjacency.get(faces[1]).add(faces[0]);
            }
        }

        return adjacency;
    }

    /**
     * Cluster faces into N groups using seeded flood-fill
     * @private
     */
    static _clusterFaces(adjacency, targetCount, faceCount, seed) {
        const rng = this._seededRandom(seed);
        const assigned = new Array(faceCount).fill(-1);
        const clusters = [];

        // Pick random seed faces evenly distributed
        const seedFaces = [];
        const available = [...Array(faceCount).keys()];

        for (let i = 0; i < targetCount; i++) {
            if (available.length === 0) break;
            const idx = Math.floor(rng() * available.length);
            seedFaces.push(available.splice(idx, 1)[0]);
        }

        // Initialize clusters with seed faces
        seedFaces.forEach((face, clusterIdx) => {
            clusters.push([face]);
            assigned[face] = clusterIdx;
        });

        // Grow clusters simultaneously (BFS from all seeds)
        let changed = true;
        let iterations = 0;
        const maxIterations = faceCount * 2; // Safety limit

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            for (let c = 0; c < clusters.length; c++) {
                const currentCluster = clusters[c];
                const newFaces = [];

                for (const f of currentCluster) {
                    const neighbors = adjacency.get(f);
                    if (!neighbors) continue;

                    for (const neighbor of neighbors) {
                        if (assigned[neighbor] === -1) {
                            assigned[neighbor] = c;
                            newFaces.push(neighbor);
                            changed = true;
                        }
                    }
                }

                clusters[c] = [...currentCluster, ...newFaces];
            }
        }

        // Assign any remaining unassigned faces to nearest cluster
        for (let f = 0; f < faceCount; f++) {
            if (assigned[f] === -1) {
                // Find smallest cluster to balance sizes
                let minSize = Infinity;
                let minIdx = 0;
                for (let c = 0; c < clusters.length; c++) {
                    if (clusters[c].length < minSize) {
                        minSize = clusters[c].length;
                        minIdx = c;
                    }
                }
                clusters[minIdx].push(f);
                assigned[f] = minIdx;
            }
        }

        return clusters;
    }

    /**
     * Create BufferGeometry for a single shard
     * @private
     */
    static _createShardGeometry(faceIndices, positions, indices, uvs, normals) {
        const vertices = [];
        const shardUvs = [];
        const shardNormals = [];
        const shardIndices = [];
        const vertexMap = new Map();

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const f of faceIndices) {
            const triIndices = [
                indices.getX(f * 3),
                indices.getX(f * 3 + 1),
                indices.getX(f * 3 + 2)
            ];

            const newTriIndices = triIndices.map(oldIdx => {
                if (!vertexMap.has(oldIdx)) {
                    const newIdx = vertices.length / 3;
                    vertexMap.set(oldIdx, newIdx);

                    const x = positions.getX(oldIdx);
                    const y = positions.getY(oldIdx);
                    const z = positions.getZ(oldIdx);

                    vertices.push(x, y, z);

                    // Track bounds for centroid
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    minZ = Math.min(minZ, z);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    maxZ = Math.max(maxZ, z);

                    // Copy UV if present
                    if (uvs) {
                        shardUvs.push(uvs.getX(oldIdx), uvs.getY(oldIdx));
                    }

                    // Copy normal if present
                    if (normals) {
                        shardNormals.push(
                            normals.getX(oldIdx),
                            normals.getY(oldIdx),
                            normals.getZ(oldIdx)
                        );
                    }
                }
                return vertexMap.get(oldIdx);
            });

            shardIndices.push(...newTriIndices);
        }

        // Build BufferGeometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        if (shardUvs.length > 0) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(shardUvs, 2));
        }

        if (shardNormals.length > 0) {
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(shardNormals, 3));
        } else {
            geometry.computeVertexNormals();
        }

        geometry.setIndex(shardIndices);

        // Compute centroid
        const centroid = new THREE.Vector3(
            (minX + maxX) / 2,
            (minY + maxY) / 2,
            (minZ + maxZ) / 2
        );
        geometry.userData.centroid = centroid;

        // Approximate volume for mass calculation
        const volume = (maxX - minX) * (maxY - minY) * (maxZ - minZ);
        geometry.userData.volume = Math.max(volume, 0.001);

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;
    }

    /**
     * Seeded random number generator (LCG)
     * @private
     */
    static _seededRandom(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;

        return () => {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    }

    /**
     * Generate a hash for geometry to enable caching
     * @param {THREE.BufferGeometry} geometry
     * @returns {string}
     */
    static hashGeometry(geometry) {
        const positions = geometry.getAttribute('position');
        if (!positions) return `empty_${Date.now()}`;

        let hash = 0;
        const sampleCount = Math.min(positions.count, 50);
        const step = Math.max(1, Math.floor(positions.count / sampleCount));

        for (let i = 0; i < positions.count; i += step) {
            hash ^= ((positions.getX(i) * 1000) | 0) << 0;
            hash ^= ((positions.getY(i) * 1000) | 0) << 8;
            hash ^= ((positions.getZ(i) * 1000) | 0) << 16;
            hash = (hash * 31) | 0;
        }

        return `geo_${positions.count}_${Math.abs(hash).toString(16)}`;
    }
}

export { ShardGenerator };
export default ShardGenerator;
