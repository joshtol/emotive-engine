/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shatter System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Main orchestrator for the shatter effect lifecycle
 * @author Emotive Engine Team
 * @module effects/shatter/ShatterSystem
 *
 * ## State Machine
 *
 * IDLE → (shatter triggered) → GENERATING → SHATTERING → (complete) → IDLE
 *                                              ↓
 *                                        REASSEMBLING → IDLE
 *
 * ## Usage
 *
 * ```javascript
 * const shatterSystem = new ShatterSystem({ scene, maxShards: 50 });
 * shatterSystem.setTargets(crystalMesh, soulMesh);
 *
 * // Trigger shatter
 * shatterSystem.shatter(crystalMesh, {
 *     impactPoint: new THREE.Vector3(0, 0, 0.4),
 *     intensity: 1.0
 * });
 *
 * // In render loop
 * shatterSystem.update(deltaTime);
 * ```
 */

import * as THREE from 'three';
import { ShardGenerator } from './ShardGenerator.js';
import { ShardPool } from './ShardPool.js';

/**
 * States for the shatter state machine
 */
const ShatterState = {
    IDLE: 'idle',
    GENERATING: 'generating',
    SHATTERING: 'shattering',
    REASSEMBLING: 'reassembling'
};

class ShatterSystem {
    /**
     * @param {Object} options
     * @param {THREE.Scene} [options.scene] - Scene to render shards in
     * @param {number} [options.maxShards=50] - Maximum shard count
     * @param {number} [options.shardLifetime=2000] - Shard lifetime in ms
     * @param {boolean} [options.enableReassembly=true] - Allow reassembly animation
     * @param {boolean} [options.autoRestore=true] - Auto-restore mesh after shatter completes
     */
    constructor(options = {}) {
        // Detect mobile for performance scaling
        const isMobile = typeof navigator !== 'undefined' &&
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        const {
            scene = null,
            maxShards = isMobile ? 25 : 50,
            shardLifetime = isMobile ? 1500 : 2000,
            enableReassembly = true,
            autoRestore = true
        } = options;

        this.scene = scene;
        this.maxShards = maxShards;
        this.shardLifetime = shardLifetime;
        this.enableReassembly = enableReassembly;
        this.autoRestore = autoRestore;

        // State machine
        this.state = ShatterState.IDLE;

        // Shard management
        this.shardPool = new ShardPool({ maxShards, scene });
        this.geometryCache = new Map();

        // Mesh references
        this.targetMesh = null;
        this.innerMesh = null;

        // Callbacks
        this.onShatterStart = null;
        this.onShatterComplete = null;
        this.onReassemblyComplete = null;

        // Internal state
        this._shatterStartTime = 0;
    }

    /**
     * Prepare shards for a geometry ahead of time
     * @param {THREE.BufferGeometry} geometry - Source geometry
     * @param {string} [geometryId] - Unique identifier for caching
     * @returns {THREE.BufferGeometry[]}
     */
    prepareGeometry(geometry, geometryId = null) {
        const id = geometryId || ShardGenerator.hashGeometry(geometry);

        if (this.geometryCache.has(id)) {
            return this.geometryCache.get(id);
        }

        // Generate shards (synchronous - could use Web Worker for heavy meshes in future)
        const shards = ShardGenerator.generate(geometry, {
            shardCount: this.maxShards,
            seed: this._hashString(id)
        });

        this.geometryCache.set(id, shards);
        return shards;
    }

    /**
     * Trigger a shatter effect
     * @param {THREE.Mesh} mesh - The mesh to shatter
     * @param {Object} config - Shatter configuration
     * @returns {boolean} True if shatter started
     */
    shatter(mesh, config = {}) {
        if (this.state !== ShatterState.IDLE) {
            console.warn('ShatterSystem: Cannot shatter - already in state:', this.state);
            return false;
        }

        const {
            impactPoint = new THREE.Vector3(0, 0, 0.4),
            impactDirection = new THREE.Vector3(0, 0, -1),
            intensity = 1.0,
            geometryId = null,
            revealInner = true,
            inheritMeshVelocity = null
        } = config;

        this.state = ShatterState.GENERATING;
        this.targetMesh = mesh;
        this._shatterStartTime = performance.now();

        // Get or generate shards
        const id = geometryId || ShardGenerator.hashGeometry(mesh.geometry);
        let shards = this.geometryCache.get(id);

        if (!shards) {
            shards = this.prepareGeometry(mesh.geometry, id);
        }

        if (!shards || shards.length === 0) {
            console.warn('ShatterSystem: No shards generated');
            this.state = ShatterState.IDLE;
            return false;
        }

        // Get mesh world transform
        const meshPosition = new THREE.Vector3();
        const meshQuaternion = new THREE.Quaternion();
        const meshScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(meshPosition, meshQuaternion, meshScale);

        // Transform impact point from local to world space
        const worldImpact = impactPoint.clone();
        worldImpact.applyQuaternion(meshQuaternion);
        worldImpact.add(meshPosition);

        // Transform impact direction
        const worldDirection = impactDirection.clone();
        worldDirection.applyQuaternion(meshQuaternion);
        worldDirection.normalize();

        // Hide original mesh
        mesh.visible = false;

        // Reveal inner mesh (soul) if present
        if (revealInner && this.innerMesh) {
            this.innerMesh.visible = true;
        }

        // Activate shards
        this.state = ShatterState.SHATTERING;

        const activatedCount = this.shardPool.activate(shards, worldImpact, worldDirection, {
            explosionForce: 2.0 * intensity,
            rotationForce: 5.0 * intensity,
            lifetime: this.shardLifetime,
            gravity: -9.8,
            inheritVelocity: inheritMeshVelocity || new THREE.Vector3(),
            meshPosition,
            meshQuaternion
        });

        // Copy material color to shards if available
        this._syncShardMaterial(mesh);

        // Fire callback
        if (this.onShatterStart) {
            this.onShatterStart(mesh, { shardCount: activatedCount });
        }

        return true;
    }

    /**
     * Sync shard material with source mesh
     * @private
     */
    _syncShardMaterial(mesh) {
        let color = new THREE.Color(0x88ccff);
        let emissive = new THREE.Color(0x000000);

        // Try to get color from uniforms (crystal shader)
        if (mesh.material?.uniforms?.emotionColor) {
            color = mesh.material.uniforms.emotionColor.value.clone();
            emissive = color.clone().multiplyScalar(0.3);
        }
        // Or from standard material
        else if (mesh.material?.color) {
            color = mesh.material.color.clone();
            emissive = mesh.material.emissive?.clone() || new THREE.Color(0x000000);
        }

        this.shardPool.updateMaterial({
            color,
            emissive,
            emissiveIntensity: 0.4
        });
    }

    /**
     * Trigger reassembly (reverse shatter) - TODO for Phase 3
     * @returns {boolean}
     */
    reassemble() {
        if (this.state !== ShatterState.SHATTERING || !this.enableReassembly) {
            return false;
        }

        this.state = ShatterState.REASSEMBLING;
        // TODO: Implement reverse animation in Phase 3
        // - Lerp shard positions back to original
        // - Lerp rotations to identity
        // - When complete, hide shards and show mesh

        return true;
    }

    /**
     * Update loop - call every frame
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (this.state === ShatterState.SHATTERING) {
            this.shardPool.update(deltaTime);

            // Check if all shards finished
            if (this.shardPool.activeCount === 0) {
                this._onShatterComplete();
            }
        }

        if (this.state === ShatterState.REASSEMBLING) {
            // TODO: Update reassembly animation in Phase 3
        }
    }

    /**
     * Handle shatter completion
     * @private
     */
    _onShatterComplete() {
        this.state = ShatterState.IDLE;

        // Fire callback
        if (this.onShatterComplete) {
            this.onShatterComplete(this.targetMesh);
        }

        // Optionally restore mesh visibility
        if (this.autoRestore && this.targetMesh) {
            this.targetMesh.visible = true;

            if (this.innerMesh) {
                this.innerMesh.visible = false;
            }
        }
    }

    /**
     * Set references to target meshes
     * @param {THREE.Mesh} coreMesh - The outer mesh that shatters
     * @param {THREE.Mesh} [innerMesh] - Inner mesh revealed on shatter
     */
    setTargets(coreMesh, innerMesh = null) {
        this.targetMesh = coreMesh;
        this.innerMesh = innerMesh;
    }

    /**
     * Set or update the scene
     * @param {THREE.Scene} scene
     */
    setScene(scene) {
        this.scene = scene;
        this.shardPool.setScene(scene);
    }

    /**
     * Force stop any active shatter
     */
    forceStop() {
        this.shardPool.clear();
        this.state = ShatterState.IDLE;

        if (this.targetMesh) {
            this.targetMesh.visible = true;
        }
        if (this.innerMesh) {
            this.innerMesh.visible = false;
        }
    }

    /**
     * Get current state
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * Check if system is currently shattering
     * @returns {boolean}
     */
    isShattering() {
        return this.state === ShatterState.SHATTERING;
    }

    /**
     * Check if system is idle
     * @returns {boolean}
     */
    isIdle() {
        return this.state === ShatterState.IDLE;
    }

    /**
     * Get shard statistics
     * @returns {Object}
     */
    getStats() {
        return {
            state: this.state,
            activeShards: this.shardPool.activeCount,
            availableShards: this.shardPool.availableCount,
            cachedGeometries: this.geometryCache.size
        };
    }

    /**
     * Clear geometry cache
     */
    clearCache() {
        // Dispose cached geometries
        for (const shards of this.geometryCache.values()) {
            for (const shard of shards) {
                shard.dispose();
            }
        }
        this.geometryCache.clear();
    }

    /**
     * Clean up all resources
     */
    dispose() {
        this.forceStop();
        this.shardPool.dispose();
        this.clearCache();
        this.targetMesh = null;
        this.innerMesh = null;
        this.onShatterStart = null;
        this.onShatterComplete = null;
        this.onReassemblyComplete = null;
    }

    /**
     * Simple string hash function
     * @private
     */
    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}

export { ShatterSystem, ShatterState };
export default ShatterSystem;
