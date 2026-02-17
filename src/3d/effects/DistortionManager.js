/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Distortion Manager
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Creates, syncs, and renders parallel distortion InstancedMeshes.
 * @module effects/DistortionManager
 *
 * Each element type gets a dedicated distortion InstancedMesh with purpose-built
 * geometry (planes/spheres). These meshes render ONLY into a distortion map render
 * target, never into the main scene. The spawner syncs instance matrices from the
 * element pools each frame.
 *
 * Architecture:
 *   ElementRegistrations → registerElement() once per type with config
 *   ElementInstancedSpawner → syncInstances() each frame with pool data
 *   ThreeRenderer → render() each frame to distortionTarget
 */

import * as THREE from 'three';

const MAX_DISTORTION_INSTANCES = 64;

export class DistortionManager {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.distortionScene = new THREE.Scene();
        this.elementMeshes = new Map();  // elementType → InstancedMesh
        this.configs = new Map();        // elementType → config

        // Cached temporaries for syncInstances (avoid per-frame allocation)
        this._tmpMatrix = new THREE.Matrix4();
        this._tmpPos = new THREE.Vector3();
        this._tmpQuat = new THREE.Quaternion();
        this._tmpScl = new THREE.Vector3();
        this._savedClearColor = new THREE.Color();
        this._savedClearAlpha = 1;
    }

    /**
     * Register a distortion config for an element type.
     * Called once during setup from ElementRegistrations via ElementInstancedSpawner.
     *
     * @param {string} elementType - 'fire', 'ice', 'water', 'electricity'
     * @param {Object} config
     * @param {THREE.BufferGeometry} config.geometry - Distortion footprint shape
     * @param {THREE.ShaderMaterial} config.material - Writes UV offsets to distortion map
     * @param {Object} config.transform - How to derive distortion transform from element transform
     * @param {THREE.Vector3} config.transform.padding - Extra world-unit padding beyond bounding box
     * @param {THREE.Vector3} [config.transform.centerOffset] - Shift plane center (e.g. downward for ice mist)
     * @param {boolean} config.billboard - Whether to face camera (ignore element rotation)
     * @param {number} config.strength - Default uStrength value
     */
    /**
     * Check if an element type is already registered.
     * Used by spawner to avoid creating geometry/material that would be discarded.
     */
    hasElement(elementType) {
        return this.elementMeshes.has(elementType);
    }

    registerElement(elementType, config) {
        if (this.elementMeshes.has(elementType)) return;

        // Set default strength on material
        if (config.material.uniforms.uStrength) {
            config.material.uniforms.uStrength.value = config.strength;
        }

        const mesh = new THREE.InstancedMesh(
            config.geometry,
            config.material,
            MAX_DISTORTION_INSTANCES
        );
        mesh.count = 0;
        mesh.visible = false;  // Don't render (or compile shader) until instances are active
        mesh.frustumCulled = false;

        this.distortionScene.add(mesh);
        this.elementMeshes.set(elementType, mesh);
        this.configs.set(elementType, config);
    }

    /**
     * Sync distortion plane to fit the bounding box of all active element instances.
     * Called each frame by ElementInstancedSpawner after updating element positions.
     *
     * Computes a tight AABB from all instance positions, adds padding, and places
     * a SINGLE distortion plane covering that region. The plane billboards to camera
     * so the distortion footprint always faces the viewer.
     *
     * @param {string} elementType
     * @param {THREE.InstancedMesh} elementMesh - Source element InstancedMesh
     * @param {number} activeCount - Number of active instances
     */
    syncInstances(elementType, elementMesh, activeCount) {
        const distMesh = this.elementMeshes.get(elementType);
        if (!distMesh) return;

        const count = Math.min(activeCount, MAX_DISTORTION_INSTANCES);

        if (count === 0) {
            if (distMesh.count !== 0) {
                distMesh.count = 0;
                distMesh.visible = false;
            }
            // Reset stored AABB — next gesture starts fresh
            if (this._peakAABB) this._peakAABB.delete(elementType);
            return;
        }

        const config = this.configs.get(elementType);
        const mat = this._tmpMatrix;
        const pos = this._tmpPos;
        const quat = this._tmpQuat;
        const scl = this._tmpScl;

        // Track peak instance count per element type.
        // When elements start dying (count decreasing), freeze the AABB at its peak
        // to prevent the distortion center from jumping as elements exit staggered.
        if (!this._peakAABB) this._peakAABB = new Map();
        const stored = this._peakAABB.get(elementType);

        if (stored && count < stored.count) {
            // Elements dying — use frozen AABB so distortion center doesn't jump
            pos.copy(stored.center);
            scl.copy(stored.size);
        } else {
            // Growing or stable — compute fresh AABB
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
            for (let i = 0; i < count; i++) {
                elementMesh.getMatrixAt(i, mat);
                const x = mat.elements[12];
                const y = mat.elements[13];
                const z = mat.elements[14];
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                if (z < minZ) minZ = z;
                if (z > maxZ) maxZ = z;
            }

            // Center of bounding box (shifted by optional centerOffset for asymmetric effects)
            pos.set(
                (minX + maxX) * 0.5,
                (minY + maxY) * 0.5,
                (minZ + maxZ) * 0.5
            );
            const {centerOffset} = config.transform;
            if (centerOffset) {
                pos.x += centerOffset.x;
                pos.y += centerOffset.y;
                pos.z += centerOffset.z;
            }

            // Size of bounding box + padding
            const {padding} = config.transform;
            const sizeX = (maxX - minX) + padding.x * 2;
            const sizeY = (maxY - minY) + padding.y * 2;

            // Plane scale = bounding box size (geometry is 1×1 unit plane)
            // Minimum size prevents zero-area when all instances are at same position
            scl.set(
                Math.max(sizeX, padding.x),
                Math.max(sizeY, padding.y),
                1.0
            );

            // Store peak AABB for freeze during exit
            this._peakAABB.set(elementType, {
                center: pos.clone(),
                size: scl.clone(),
                count,
            });
        }

        // Billboard: face camera
        if (config.billboard) {
            quat.copy(this.camera.quaternion);
        } else {
            quat.identity();
        }

        mat.compose(pos, quat, scl);
        distMesh.setMatrixAt(0, mat);

        // Always exactly 1 instance — no additive accumulation
        distMesh.count = 1;
        distMesh.visible = true;
        distMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Check if any element type has active distortion sources.
     * Called by ThreeRenderer to decide whether to enable the pass.
     */
    hasActiveSources() {
        for (const [, mesh] of this.elementMeshes) {
            if (mesh.count > 0) return true;
        }
        return false;
    }

    /**
     * Render distortion map. Called each frame from ThreeRenderer.
     * Renders all active distortion meshes into the distortion render target.
     *
     * @param {THREE.WebGLRenderTarget} target - Distortion map render target
     */
    render(target) {
        if (!this.hasActiveSources()) return;

        // Save and restore clear color so we don't contaminate other render passes
        this.renderer.getClearColor(this._savedClearColor);
        this._savedClearAlpha = this.renderer.getClearAlpha();

        this.renderer.setRenderTarget(target);
        this.renderer.setClearColor(0x000000, 0); // Zero = no distortion
        this.renderer.clear();
        this.renderer.render(this.distortionScene, this.camera);
        this.renderer.setRenderTarget(null);

        this.renderer.setClearColor(this._savedClearColor, this._savedClearAlpha);
    }

    /**
     * Update time uniforms on all distortion materials.
     * @param {number} deltaTime - Seconds
     */
    update(deltaTime) {
        for (const [, mesh] of this.elementMeshes) {
            if (mesh.material.uniforms.uTime) {
                mesh.material.uniforms.uTime.value += deltaTime;
            }
        }
    }

    /**
     * Sync electric flash intensity to the electric distortion material.
     * @param {number} flashIntensity
     */
    setElectricFlash(flashIntensity) {
        const mesh = this.elementMeshes.get('electricity');
        if (mesh?.material?.uniforms?.uFlashIntensity) {
            mesh.material.uniforms.uFlashIntensity.value = flashIntensity;
        }
    }

    /**
     * Set distortion strength for an element type (per-gesture override).
     * Pass null to reset to the default registered strength.
     * @param {string} elementType
     * @param {number|null} strength - Override strength, or null to reset
     */
    setDistortionStrength(elementType, strength) {
        const mesh = this.elementMeshes.get(elementType);
        if (!mesh?.material?.uniforms?.uStrength) return;
        const config = this.configs.get(elementType);
        mesh.material.uniforms.uStrength.value = (strength !== null && strength !== undefined)
            ? strength
            : (config?.strength ?? 0.018);
    }

    /**
     * Set void distortion fade progress for lifecycle easing.
     * @param {number} fadeProgress - 0.0 (invisible) to 1.0 (full strength)
     */
    setVoidFade(fadeProgress) {
        const mesh = this.elementMeshes.get('void');
        if (mesh?.material?.uniforms?.uFadeProgress) {
            mesh.material.uniforms.uFadeProgress.value = fadeProgress;
        }
    }

    dispose() {
        for (const [, mesh] of this.elementMeshes) {
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.distortionScene.remove(mesh);
        }
        this.elementMeshes.clear();
        this.configs.clear();
    }
}
