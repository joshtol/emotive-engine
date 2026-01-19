/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shard Pool
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pre-allocated mesh pool for shard animation without GC pauses
 * @author Emotive Engine Team
 * @module effects/shatter/ShardPool
 *
 * ## Design
 *
 * Pre-allocates mesh instances at init time to avoid GC during shatter animations.
 * Each shard has its own physics state (velocity, angular velocity, lifetime).
 * Shards are recycled when their lifetime expires.
 */

import * as THREE from 'three';

/**
 * @typedef {Object} ShardState
 * @property {THREE.Vector3} velocity - Linear velocity
 * @property {THREE.Vector3} angularVelocity - Rotational velocity
 * @property {number} lifetime - Current lifetime in ms
 * @property {number} maxLifetime - Maximum lifetime before recycle
 * @property {number} opacity - Current opacity (for fade out)
 * @property {number} gravity - Gravity acceleration
 * @property {THREE.Vector3} originalPosition - Position for reassembly
 * @property {THREE.Euler} originalRotation - Rotation for reassembly
 */

class ShardPool {
    /**
     * @param {Object} options
     * @param {number} [options.maxShards=50] - Maximum concurrent shards
     * @param {THREE.Scene} [options.scene] - Scene to add shards to
     */
    constructor(options = {}) {
        const {
            maxShards = 50,
            scene = null
        } = options;

        this.maxShards = maxShards;
        this.scene = scene;
        this.pool = [];
        this.active = [];
        this.shardMaterial = null;
        this._placeholderGeometry = null;

        this._initPool();
    }

    /**
     * Initialize the pool with placeholder meshes
     * @private
     */
    _initPool() {
        // Minimal placeholder geometry
        this._placeholderGeometry = new THREE.BufferGeometry();
        this._placeholderGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3)
        );

        // Shared base material for shards
        this.shardMaterial = this._createShardMaterial();

        for (let i = 0; i < this.maxShards; i++) {
            const material = this.shardMaterial.clone();
            const mesh = new THREE.Mesh(this._placeholderGeometry, material);
            mesh.visible = false;
            mesh.frustumCulled = true;
            mesh.userData.poolIndex = i;
            mesh.userData.state = this._createShardState();

            this.pool.push(mesh);

            if (this.scene) {
                this.scene.add(mesh);
            }
        }
    }

    /**
     * Create the shared shard material - crystal-like with glass properties
     * @private
     */
    _createShardMaterial() {
        // Use MeshPhysicalMaterial for glass-like shards with transmission
        return new THREE.MeshPhysicalMaterial({
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.15,
            // Glass-like properties
            transmission: 0.3,        // Slight transparency
            thickness: 0.2,           // Refraction thickness
            ior: 1.5,                 // Index of refraction (glass)
            // Emissive for glow
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0,
            // Slight iridescence for crystal effect
            iridescence: 0.2,
            iridescenceIOR: 1.3,
            // Clearcoat for shine
            clearcoat: 0.3,
            clearcoatRoughness: 0.2
        });
    }

    /**
     * Create initial shard state
     * @private
     */
    _createShardState() {
        return {
            velocity: new THREE.Vector3(),
            angularVelocity: new THREE.Vector3(),
            lifetime: 0,
            maxLifetime: 2000,
            opacity: 1,
            gravity: -9.8,
            originalPosition: new THREE.Vector3(),
            originalRotation: new THREE.Euler(),
            // Impact glow state
            impactGlow: 1.0,          // Initial glow intensity (fades over time)
            baseEmissiveIntensity: 0.5 // Base emissive for shards
        };
    }

    /**
     * Activate shards for a shatter event
     * @param {THREE.BufferGeometry[]} shardGeometries - Pre-generated shard geometries
     * @param {THREE.Vector3} impactPoint - World-space impact location
     * @param {THREE.Vector3} impactDirection - Direction of impact force
     * @param {Object} config - Animation configuration
     * @returns {number} Number of shards activated
     */
    activate(shardGeometries, impactPoint, impactDirection, config = {}) {
        const {
            explosionForce = 2.0,
            rotationForce = 5.0,
            lifetime = 2000,
            gravity = -9.8,
            inheritVelocity = new THREE.Vector3(),
            meshPosition = new THREE.Vector3(),
            meshQuaternion = new THREE.Quaternion()
        } = config;

        const shardsNeeded = Math.min(shardGeometries.length, this.pool.length);
        const activatedShards = [];

        for (let i = 0; i < shardsNeeded; i++) {
            if (this.pool.length === 0) break;

            const shard = this.pool.pop();
            const shardGeo = shardGeometries[i];

            // Dispose old geometry if different from placeholder
            if (shard.geometry !== this._placeholderGeometry) {
                shard.geometry.dispose();
            }

            // Clone geometry so we don't mutate the cached version
            shard.geometry = shardGeo.clone();

            // Get centroid in local space
            const localCentroid = shardGeo.userData.centroid
                ? shardGeo.userData.centroid.clone()
                : new THREE.Vector3();

            // Transform centroid to world space
            const worldCentroid = localCentroid.clone();
            worldCentroid.applyQuaternion(meshQuaternion);
            worldCentroid.add(meshPosition);

            // Position shard at world centroid
            shard.position.copy(worldCentroid);
            shard.quaternion.copy(meshQuaternion);

            // Store original position for reassembly
            shard.userData.state.originalPosition.copy(worldCentroid);
            shard.userData.state.originalRotation.copy(shard.rotation);

            // Calculate ejection velocity
            const ejectionDir = worldCentroid.clone().sub(impactPoint);
            const distFromImpact = ejectionDir.length();
            ejectionDir.normalize();

            // Force falls off with distance but has minimum
            const forceFalloff = Math.max(0.3, 1 / (1 + distFromImpact * 2));
            const force = explosionForce * forceFalloff;

            // Add some randomness to ejection direction
            ejectionDir.x += (Math.random() - 0.5) * 0.3;
            ejectionDir.y += (Math.random() - 0.5) * 0.3 + 0.2; // Slight upward bias
            ejectionDir.z += (Math.random() - 0.5) * 0.3;
            ejectionDir.normalize();

            shard.userData.state.velocity
                .copy(ejectionDir)
                .multiplyScalar(force)
                .add(inheritVelocity);

            // Random angular velocity
            shard.userData.state.angularVelocity.set(
                (Math.random() - 0.5) * rotationForce,
                (Math.random() - 0.5) * rotationForce,
                (Math.random() - 0.5) * rotationForce
            );

            // Reset lifetime
            shard.userData.state.lifetime = 0;
            shard.userData.state.maxLifetime = lifetime + (Math.random() - 0.5) * lifetime * 0.3;
            shard.userData.state.opacity = 1;
            shard.userData.state.gravity = gravity;

            // Reset impact glow - bright flash at start
            shard.userData.state.impactGlow = 1.0;
            shard.userData.state.baseEmissiveIntensity = 0.5;

            // Show shard with initial glow
            shard.visible = true;
            shard.material.opacity = 0.9;
            shard.material.emissiveIntensity = 1.5; // Bright flash on impact

            this.active.push(shard);
            activatedShards.push(shard);
        }

        return activatedShards.length;
    }

    /**
     * Update all active shards
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        for (let i = this.active.length - 1; i >= 0; i--) {
            const shard = this.active[i];
            const { state } = shard.userData;

            // Update lifetime
            state.lifetime += deltaTime;
            const progress = state.lifetime / state.maxLifetime;

            if (progress >= 1) {
                // Return to pool
                this._deactivateShard(shard, i);
                continue;
            }

            // Apply gravity
            state.velocity.y += state.gravity * dt;

            // Update position
            shard.position.addScaledVector(state.velocity, dt);

            // Update rotation
            shard.rotation.x += state.angularVelocity.x * dt;
            shard.rotation.y += state.angularVelocity.y * dt;
            shard.rotation.z += state.angularVelocity.z * dt;

            // Apply air resistance (subtle)
            state.velocity.multiplyScalar(0.995);
            state.angularVelocity.multiplyScalar(0.99);

            // ═══════════════════════════════════════════════════════════════
            // IMPACT GLOW - Bright flash fades quickly in first 20%
            // ═══════════════════════════════════════════════════════════════
            if (progress < 0.2) {
                // Fast exponential decay of impact glow
                const glowProgress = progress / 0.2;
                state.impactGlow = 1.0 - glowProgress * glowProgress; // Quadratic fade
                const totalEmissive = state.baseEmissiveIntensity + state.impactGlow * 1.0;
                shard.material.emissiveIntensity = totalEmissive;
            } else if (progress < 0.5) {
                // Subtle glow remains in middle
                shard.material.emissiveIntensity = state.baseEmissiveIntensity * 0.8;
            } else {
                // Fade emissive with opacity in final phase
                const fadeProgress = (progress - 0.5) / 0.5;
                shard.material.emissiveIntensity = state.baseEmissiveIntensity * (1 - fadeProgress);
            }

            // Fade out opacity in last 30%
            if (progress > 0.7) {
                state.opacity = 1 - ((progress - 0.7) / 0.3);
                shard.material.opacity = state.opacity * 0.9; // Max 0.9 for glass effect
            }

            // Scale down slightly at end
            if (progress > 0.8) {
                const scale = 1 - ((progress - 0.8) / 0.2) * 0.5;
                shard.scale.setScalar(scale);
            }
        }
    }

    /**
     * Deactivate a single shard and return to pool
     * @private
     */
    _deactivateShard(shard, activeIndex) {
        shard.visible = false;
        shard.scale.setScalar(1);
        this.active.splice(activeIndex, 1);
        this.pool.push(shard);
    }

    /**
     * Clear all active shards immediately
     */
    clear() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const shard = this.active[i];
            shard.visible = false;
            shard.scale.setScalar(1);
            this.pool.push(shard);
        }
        this.active = [];
    }

    /**
     * Update material properties for all shards (e.g., emotion color)
     * @param {Object} uniforms
     */
    updateMaterial(uniforms) {
        const allShards = [...this.pool, ...this.active];

        for (const shard of allShards) {
            if (uniforms.color) {
                shard.material.color.copy(uniforms.color);
            }
            if (uniforms.emissive) {
                shard.material.emissive.copy(uniforms.emissive);
                shard.material.emissiveIntensity = uniforms.emissiveIntensity || 0.3;
            }
        }
    }

    /**
     * Set the scene (if not provided in constructor)
     * @param {THREE.Scene} scene
     */
    setScene(scene) {
        if (this.scene === scene) return;

        // Remove from old scene
        if (this.scene) {
            for (const shard of [...this.pool, ...this.active]) {
                this.scene.remove(shard);
            }
        }

        this.scene = scene;

        // Add to new scene
        if (this.scene) {
            for (const shard of [...this.pool, ...this.active]) {
                this.scene.add(shard);
            }
        }
    }

    /**
     * Get count of active shards
     * @returns {number}
     */
    get activeCount() {
        return this.active.length;
    }

    /**
     * Get count of available shards in pool
     * @returns {number}
     */
    get availableCount() {
        return this.pool.length;
    }

    /**
     * Clean up all resources
     */
    dispose() {
        this.clear();

        for (const shard of this.pool) {
            if (this.scene) this.scene.remove(shard);
            if (shard.geometry !== this._placeholderGeometry) {
                shard.geometry.dispose();
            }
            shard.material.dispose();
        }

        this.pool = [];

        if (this._placeholderGeometry) {
            this._placeholderGeometry.dispose();
            this._placeholderGeometry = null;
        }

        if (this.shardMaterial) {
            this.shardMaterial.dispose();
            this.shardMaterial = null;
        }
    }
}

export { ShardPool };
export default ShardPool;
