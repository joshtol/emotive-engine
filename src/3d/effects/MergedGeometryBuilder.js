/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Merged Geometry Builder
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Utility for merging multiple model geometries into a single BufferGeometry
 * @module effects/MergedGeometryBuilder
 *
 * Purpose:
 * - Merge all model variants for an element type into one geometry
 * - Add vertex attribute `aModelIndex` for per-vertex model identification
 * - Enable shader-based model selection using instanced `aSelectedModel` attribute
 *
 * The shader can then show/hide geometry based on:
 *   if (aModelIndex != aSelectedModel) discard; // or scale to 0
 */

import * as THREE from 'three';

/**
 * Merges multiple geometries into a single BufferGeometry with model selection support.
 */
export class MergedGeometryBuilder {
    constructor() {
        this.geometries = [];
        this.modelNames = [];
    }

    /**
     * Adds a geometry variant to be merged.
     * @param {THREE.BufferGeometry} geometry - The geometry to add
     * @param {string} [name] - Optional name for this model variant
     * @returns {number} The model index assigned to this geometry
     */
    addGeometry(geometry, name = null) {
        const index = this.geometries.length;
        this.geometries.push(geometry.clone());  // Clone to avoid mutation
        this.modelNames.push(name || `model_${index}`);
        return index;
    }

    /**
     * Adds a mesh's geometry, extracting it from the mesh.
     * @param {THREE.Mesh} mesh - The mesh containing the geometry
     * @param {string} [name] - Optional name for this model variant
     * @returns {number} The model index assigned to this geometry
     */
    addMesh(mesh, name = null) {
        return this.addGeometry(mesh.geometry, name || mesh.name);
    }

    /**
     * Builds the merged geometry with model selection attribute.
     * @returns {{ geometry: THREE.BufferGeometry, modelCount: number, modelMap: Map<string, number> }}
     */
    build() {
        if (this.geometries.length === 0) {
            throw new Error('[MergedGeometryBuilder] No geometries added');
        }

        // First pass: count total vertices and ensure all geometries are indexed
        let totalVertices = 0;
        let totalIndices = 0;
        const processedGeometries = [];

        for (const geometry of this.geometries) {
            // Ensure geometry has an index (convert non-indexed to indexed)
            const indexed = geometry.index
                ? geometry
                : this._convertToIndexed(geometry);

            processedGeometries.push(indexed);
            totalVertices += indexed.attributes.position.count;
            totalIndices += indexed.index.count;
        }

        // Create merged geometry
        const mergedGeometry = new THREE.BufferGeometry();

        // Allocate merged buffers
        const positions = new Float32Array(totalVertices * 3);
        const normals = new Float32Array(totalVertices * 3);
        const uvs = new Float32Array(totalVertices * 2);
        const modelIndices = new Float32Array(totalVertices);  // Our custom attribute
        const indices = new Uint32Array(totalIndices);

        // Second pass: copy data into merged buffers
        let vertexOffset = 0;
        let indexOffset = 0;
        let indexVertexOffset = 0;

        for (let modelIndex = 0; modelIndex < processedGeometries.length; modelIndex++) {
            const geometry = processedGeometries[modelIndex];
            const posAttr = geometry.attributes.position;
            const normAttr = geometry.attributes.normal;
            const uvAttr = geometry.attributes.uv;
            const indexAttr = geometry.index;

            const vertexCount = posAttr.count;
            const indexCount = indexAttr.count;

            // Copy positions
            for (let i = 0; i < vertexCount; i++) {
                const vi = vertexOffset + i;
                positions[vi * 3] = posAttr.getX(i);
                positions[vi * 3 + 1] = posAttr.getY(i);
                positions[vi * 3 + 2] = posAttr.getZ(i);

                // Set model index for each vertex
                modelIndices[vi] = modelIndex;
            }

            // Copy normals (if exists)
            if (normAttr) {
                for (let i = 0; i < vertexCount; i++) {
                    const vi = vertexOffset + i;
                    normals[vi * 3] = normAttr.getX(i);
                    normals[vi * 3 + 1] = normAttr.getY(i);
                    normals[vi * 3 + 2] = normAttr.getZ(i);
                }
            }

            // Copy UVs (if exists)
            if (uvAttr) {
                for (let i = 0; i < vertexCount; i++) {
                    const vi = vertexOffset + i;
                    uvs[vi * 2] = uvAttr.getX(i);
                    uvs[vi * 2 + 1] = uvAttr.getY(i);
                }
            }

            // Copy indices (offset by vertex count)
            for (let i = 0; i < indexCount; i++) {
                indices[indexOffset + i] = indexAttr.getX(i) + indexVertexOffset;
            }

            vertexOffset += vertexCount;
            indexOffset += indexCount;
            indexVertexOffset += vertexCount;
        }

        // Set attributes on merged geometry
        mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        mergedGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        mergedGeometry.setAttribute('aModelIndex', new THREE.BufferAttribute(modelIndices, 1));
        mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

        // Compute bounding sphere/box
        mergedGeometry.computeBoundingSphere();
        mergedGeometry.computeBoundingBox();

        // Create model name to index map
        const modelMap = new Map();
        for (let i = 0; i < this.modelNames.length; i++) {
            modelMap.set(this.modelNames[i], i);
        }

        return {
            geometry: mergedGeometry,
            modelCount: this.geometries.length,
            modelMap
        };
    }

    /**
     * Converts a non-indexed geometry to indexed.
     * @private
     * @param {THREE.BufferGeometry} geometry
     * @returns {THREE.BufferGeometry}
     */
    _convertToIndexed(geometry) {
        const posAttr = geometry.attributes.position;
        const vertexCount = posAttr.count;

        // Create sequential indices
        const indices = new Uint32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            indices[i] = i;
        }

        const indexed = geometry.clone();
        indexed.setIndex(new THREE.BufferAttribute(indices, 1));
        return indexed;
    }

    /**
     * Resets the builder for reuse.
     */
    reset() {
        this.geometries = [];
        this.modelNames = [];
    }

    /**
     * Disposes of cloned geometries.
     */
    dispose() {
        for (const geometry of this.geometries) {
            geometry.dispose();
        }
        this.reset();
    }
}

/**
 * Convenience function to merge geometries in one call.
 * @param {Array<{geometry: THREE.BufferGeometry, name?: string}>} geometryList - List of geometries to merge
 * @returns {{ geometry: THREE.BufferGeometry, modelCount: number, modelMap: Map<string, number> }}
 */
export function mergeGeometries(geometryList) {
    const builder = new MergedGeometryBuilder();
    for (const item of geometryList) {
        builder.addGeometry(item.geometry, item.name);
    }
    const result = builder.build();
    builder.dispose();  // Clean up clones
    return result;
}

/**
 * Convenience function to merge mesh geometries.
 * @param {THREE.Mesh[]} meshes - Array of meshes to merge
 * @returns {{ geometry: THREE.BufferGeometry, modelCount: number, modelMap: Map<string, number> }}
 */
export function mergeMeshGeometries(meshes) {
    const builder = new MergedGeometryBuilder();
    for (const mesh of meshes) {
        builder.addMesh(mesh);
    }
    const result = builder.build();
    builder.dispose();
    return result;
}
