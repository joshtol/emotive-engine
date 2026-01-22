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
import { extractMaterialProperties, createShardBaseMaterial } from './MaterialAnalyzer.js';

/**
 * States for the shatter state machine
 */
const ShatterState = {
    IDLE: 'idle',
    GENERATING: 'generating',
    SHATTERING: 'shattering',
    FROZEN: 'frozen',           // Shards frozen mid-air awaiting manual reassembly
    REASSEMBLING: 'reassembling',
    // Dual-mode states: applied to frozen shards OR triggered fresh from IDLE
    IMPLODING: 'imploding',     // Shards fly inward to center
    DISSOLVING: 'dissolving',   // Shards blow away like dust in wind
    FALLING: 'falling',         // Shards fall with gravity and bounce
    ORBITING: 'orbiting'        // Shards orbit around soul
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

        // LRU geometry cache - evicts oldest entries when full
        // Map maintains insertion order; we delete+reinsert on access to update order
        this.geometryCache = new Map();
        this.geometryCacheMaxSize = 5;  // Max different geometries to cache
        this.geometryCacheRefs = new Map();  // Ref counts - don't evict while shards active
        this._activeGeometryId = null;  // Currently shattering geometry ID

        // ═══════════════════════════════════════════════════════════════════
        // DYNAMIC SHARD MATERIAL CACHE
        // Single geometry cached at a time - invalidated on morphTo()
        // Stores pre-computed shard geometries and extracted base material
        // ═══════════════════════════════════════════════════════════════════
        this.shardMaterialCache = null;  // { geometryType, baseMaterial, geometries }

        // Mesh references
        this.targetMesh = null;
        this.innerMesh = null;

        // Callbacks
        this.onShatterStart = null;
        this.onShatterComplete = null;
        this.onReassemblyComplete = null;

        // Internal state
        this._shatterStartTime = 0;

        // Soul reveal animation state
        this._soulRevealProgress = 0;
        this._soulOriginalScale = 1.0;
        this._soulOriginalEmissive = 0;
        this._soulOriginalGhostMode = 0.36; // CrystalSoul default ghostMode
        this._soulOriginalLayer = 2; // CrystalSoul default layer (bloom only)

        // Reassembly animation state
        this._reassemblyDuration = 1000; // ms
        this._reassemblyStartTime = 0;
        this._reassemblyProgress = 0;

        // Track whether soul was revealed for this shatter (to know if we need to reset it)
        this._soulWasRevealed = false;

        // Chained shatter queue
        this._shatterQueue = [];
        this._chainedDelay = 150; // ms between chain links
        this._lastChainTrigger = 0;

        // Suspend mode state
        this._isSuspendMode = false;
        this._suspendAt = 0.25;
        this._suspendDuration = 0.35;

        // Freeze mode state (shatter then freeze indefinitely)
        this._isFreezeMode = false;

        // Dual-mode behavior state (for gestures that work on frozen shards)
        this._dualModeType = null;          // 'implode', 'dissolve', 'ripple', 'gravity', 'orbit'
        this._dualModeConfig = {};          // Config for the dual-mode behavior
        this._dualModeStartTime = 0;        // When dual-mode animation started
        this._dualModeDuration = 2000;      // Duration of dual-mode animation
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
            // LRU: Move to end by deleting and re-inserting
            const cached = this.geometryCache.get(id);
            this.geometryCache.delete(id);
            this.geometryCache.set(id, cached);
            return cached;
        }

        // Generate shards (synchronous - could use Web Worker for heavy meshes in future)
        const shards = ShardGenerator.generate(geometry, {
            shardCount: this.maxShards,
            seed: this._hashString(id)
        });

        // LRU eviction: remove oldest entries if cache is full
        // Skip entries with active refs (shards currently animating)
        while (this.geometryCache.size >= this.geometryCacheMaxSize) {
            let evicted = false;
            for (const key of this.geometryCache.keys()) {
                const refCount = this.geometryCacheRefs.get(key) || 0;
                if (refCount === 0) {
                    const oldShards = this.geometryCache.get(key);
                    // Dispose evicted geometries to free GPU memory
                    oldShards.forEach(shard => shard.dispose());
                    this.geometryCache.delete(key);
                    this.geometryCacheRefs.delete(key);
                    evicted = true;
                    break;
                }
            }
            // If all entries have refs, allow cache to exceed max temporarily
            if (!evicted) break;
        }

        this.geometryCache.set(id, shards);
        return shards;
    }

    /**
     * Pre-compute shard geometries and material for a mesh
     * Call this on geometry load/morph to eliminate first-shatter lag
     *
     * @param {THREE.Mesh} mesh - Source mesh to analyze
     * @param {string} geometryType - Geometry type (crystal, sun, moon, etc.)
     */
    precomputeShards(mesh, geometryType) {
        if (!mesh?.geometry || !mesh?.material) {
            console.warn('ShatterSystem.precomputeShards: Invalid mesh');
            return;
        }

        // Invalidate previous cache (single geometry at a time)
        if (this.shardMaterialCache?.baseMaterial) {
            this.shardMaterialCache.baseMaterial.dispose();
        }
        this.shardMaterialCache = null;

        // Extract material properties using type-specific analyzer
        const materialProps = extractMaterialProperties(mesh.material, geometryType);

        // Create base material for shards (will be cloned per-shard with variation)
        const baseMaterial = createShardBaseMaterial(materialProps);

        // Pre-generate shard geometries
        const geometryId = ShardGenerator.hashGeometry(mesh.geometry);
        let shardGeometries = this.geometryCache.get(geometryId);

        if (!shardGeometries) {
            shardGeometries = ShardGenerator.generate(mesh.geometry, {
                shardCount: this.maxShards,
                seed: this._hashString(geometryId)
            });
            this.geometryCache.set(geometryId, shardGeometries);
        }

        // Cache everything
        this.shardMaterialCache = {
            geometryType,
            baseMaterial,
            geometries: shardGeometries,
            geometryId
        };
    }

    /**
     * Check if shards are pre-computed for current geometry
     * @returns {boolean}
     */
    hasCachedShards() {
        return this.shardMaterialCache !== null;
    }

    /**
     * Get cached shard material info (for debugging)
     * @returns {Object|null}
     */
    getCacheInfo() {
        if (!this.shardMaterialCache) return null;
        return {
            geometryType: this.shardMaterialCache.geometryType,
            shardCount: this.shardMaterialCache.geometries?.length || 0,
            hasMaterial: !!this.shardMaterialCache.baseMaterial
        };
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
            inheritMeshVelocity = null,
            // Suspend mode: explode then freeze mid-air
            isSuspendMode = false,
            suspendAt = 0.25,
            suspendDuration = 0.35,
            // Freeze mode: explode, freeze, and stay frozen until triggerReassembly() called
            isFreezeMode = false,
            // Dual-mode: auto-trigger behavior after freeze completes
            isDualMode = false,
            dualModeType = null,
            dualModeConfig = {},
            // Physics overrides (for crumble, etc.)
            gravity,           // undefined = use default
            explosionForce,    // undefined = use default
            rotationForce      // undefined = use default
        } = config;

        this.state = ShatterState.GENERATING;
        this.targetMesh = mesh;
        this._shatterStartTime = performance.now();

        // Store suspend mode settings for update loop
        this._isSuspendMode = isSuspendMode;
        this._suspendAt = suspendAt;
        this._suspendDuration = suspendDuration;
        // Store gesture duration for suspend progress calculation (default 6000ms for shatterSuspend)
        this._gestureDuration = config.gestureDuration || 6000;
        // Store freeze mode flag
        this._isFreezeMode = isFreezeMode;
        // Store dual-mode settings for auto-trigger after freeze
        this._pendingDualMode = isDualMode ? dualModeType : null;
        this._pendingDualModeConfig = isDualMode ? dualModeConfig : {};

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

        // Track active geometry ref to prevent eviction during animation
        this._activeGeometryId = id;
        const currentRefs = this.geometryCacheRefs.get(id) || 0;
        this.geometryCacheRefs.set(id, currentRefs + 1);

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

        // Reveal inner mesh (soul) if present with animation
        this._soulWasRevealed = revealInner && this.innerMesh;
        if (this._soulWasRevealed) {
            this.innerMesh.visible = true;
            this._soulRevealProgress = 0;

            // Store original values for animation
            this._soulOriginalScale = this.innerMesh.scale.x;

            // ═══════════════════════════════════════════════════════════════
            // LAYER SWITCH - Move soul from bloom-only layer to main layer
            // CrystalSoul is normally on layer 2 (bloom only), but during
            // shatter reveal we need it visible on layer 0 (main camera)
            // ═══════════════════════════════════════════════════════════════
            this._soulOriginalLayer = this.innerMesh.layers.mask;
            this.innerMesh.layers.set(0); // Move to main render layer

            // ═══════════════════════════════════════════════════════════════
            // DEPTH TEST DISABLE - Ensure soul is always visible through shards
            // Shards can occlude the soul during reassembly when they pass through
            // its position. Disabling depth test ensures soul renders on top.
            // ═══════════════════════════════════════════════════════════════
            this._soulOriginalDepthTest = this.innerMesh.material?.depthTest ?? true;
            this._soulOriginalRenderOrder = this.innerMesh.renderOrder ?? 0;
            if (this.innerMesh.material) {
                this.innerMesh.material.depthTest = false;
            }
            this.innerMesh.renderOrder = 100; // Render after shards

            // Check for shader uniforms (CrystalSoul) vs standard material
            const uniforms = this.innerMesh.material?.uniforms;
            if (uniforms) {
                // CrystalSoul shader - store original uniform values
                this._soulOriginalEmissive = uniforms.energyIntensity?.value ?? 0.8;
                this._soulOriginalGhostMode = uniforms.ghostMode?.value ?? 0.36;

                // Start with bright glow and more solid appearance
                if (uniforms.energyIntensity) uniforms.energyIntensity.value = 2.0;
                if (uniforms.ghostMode) uniforms.ghostMode.value = 0.0; // Fully solid
            } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
                // Standard material fallback
                this._soulOriginalEmissive = this.innerMesh.material.emissiveIntensity;
                this.innerMesh.material.emissiveIntensity = 2.0; // Bright flash
            }

            // Start with small scale (will animate to normal)
            this.innerMesh.scale.setScalar(this._soulOriginalScale * 0.5);
        }

        // Activate shards
        this.state = ShatterState.SHATTERING;

        // For suspend mode, shards need longer lifetime to cover full animation
        // Calculate based on reassembleAt timing - shards must live until reassembly completes
        // For dual-mode gestures, add 400ms transition time + dual-mode duration
        let shardLifetimeOverride = this.shardLifetime;
        if (isSuspendMode || isFreezeMode) {
            shardLifetimeOverride = 10000; // 10s for suspend/freeze modes
        } else if (isDualMode && dualModeConfig?.duration) {
            // Dual-mode: 400ms transition + dual-mode duration + buffer
            shardLifetimeOverride = 400 + dualModeConfig.duration + 1000;
        }
        const suspendLifetime = shardLifetimeOverride;

        // Calculate physics parameters with overrides
        // Defaults: explosionForce = 2.0 * intensity, rotationForce = 5.0 * intensity, gravity = -9.8
        // Suspend mode: reduced gravity (-3.0)
        // Custom overrides (e.g., crumble) can specify their own values
        const effectiveExplosionForce = (explosionForce !== undefined ? explosionForce : 2.0) * intensity;
        const effectiveRotationForce = (rotationForce !== undefined ? rotationForce : 5.0) * intensity;
        const effectiveGravity = gravity !== undefined ? gravity : (isSuspendMode ? -3.0 : -9.8);

        // ═══════════════════════════════════════════════════════════════════
        // USE CACHED MATERIAL if available (dynamic shard appearance)
        // If cache exists but has no texture, re-extract (texture may have loaded async)
        // Otherwise fall back to default crystal material + color sync
        // ═══════════════════════════════════════════════════════════════════
        let baseMaterial = this.shardMaterialCache?.baseMaterial || null;

        // Defensive re-extraction: if cache has no texture but mesh now does, re-extract
        if (this.shardMaterialCache && baseMaterial && !baseMaterial.map && mesh.material) {
            const materialProps = extractMaterialProperties(mesh.material, this.shardMaterialCache.geometryType);
            if (materialProps.map) {
                // Texture loaded since precompute - recreate base material
                baseMaterial.dispose();
                baseMaterial = createShardBaseMaterial(materialProps);
                this.shardMaterialCache.baseMaterial = baseMaterial;
            }
        }

        const activatedCount = this.shardPool.activate(shards, worldImpact, worldDirection, {
            explosionForce: effectiveExplosionForce,
            rotationForce: effectiveRotationForce,
            lifetime: suspendLifetime,
            gravity: effectiveGravity,
            inheritVelocity: inheritMeshVelocity || new THREE.Vector3(),
            meshPosition,
            meshQuaternion,
            meshScale,
            // Suspend mode: explode then freeze mid-air
            isSuspendMode,
            // Dynamic material from cache (if available)
            baseMaterial
        });

        // Only sync material colors if we didn't use cached material
        // (cached material already has correct colors from extraction)
        if (!baseMaterial) {
            this._syncShardMaterial(mesh);
        }

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
     * Queue multiple meshes for chained shatter effect
     * @param {Array<{mesh: THREE.Mesh, config?: Object}>} targets - Meshes to shatter in sequence
     * @param {Object} [chainConfig] - Chain configuration
     * @param {number} [chainConfig.delay=150] - Delay between shatters in ms
     * @param {THREE.Vector3} [chainConfig.propagationDir] - Direction wave propagates (for timing)
     * @returns {boolean} True if chain started
     */
    shatterChain(targets, chainConfig = {}) {
        if (!targets || targets.length === 0) {
            return false;
        }

        const {
            delay = 150,
            propagationDir = null
        } = chainConfig;

        this._chainedDelay = delay;

        // Sort targets by propagation direction if provided
        let sortedTargets = [...targets];
        if (propagationDir) {
            const dir = propagationDir.clone().normalize();
            const tempPos = new THREE.Vector3();
            // Pre-compute dot products to avoid allocations in sort comparator
            // Wrap each target with its dot product, sort, then unwrap
            sortedTargets = sortedTargets
                .map(t => {
                    t.mesh.getWorldPosition(tempPos);
                    return { target: t, dot: tempPos.dot(dir) };
                })
                .sort((a, b) => a.dot - b.dot)
                .map(item => item.target);
        }

        // Queue all targets
        this._shatterQueue = sortedTargets.map((target, index) => ({
            mesh: target.mesh,
            config: target.config || {},
            triggerTime: performance.now() + (index * delay)
        }));

        // Trigger first immediately if idle
        if (this.state === ShatterState.IDLE && this._shatterQueue.length > 0) {
            this._processNextInChain();
        }

        return true;
    }

    /**
     * Process next mesh in shatter chain
     * @private
     */
    _processNextInChain() {
        if (this._shatterQueue.length === 0) return;

        const next = this._shatterQueue[0];
        const now = performance.now();

        if (now >= next.triggerTime) {
            this._shatterQueue.shift();
            this._lastChainTrigger = now;

            // Trigger shatter on this mesh
            this.shatter(next.mesh, next.config);
        }
    }

    /**
     * Trigger reassembly (reverse shatter)
     * @param {Object} [config] - Reassembly configuration
     * @param {number} [config.duration=1000] - Animation duration in ms
     * @returns {boolean} True if reassembly started
     */
    reassemble(config = {}) {
        if (this.state !== ShatterState.SHATTERING || !this.enableReassembly) {
            return false;
        }

        const { duration = 1000 } = config;

        this.state = ShatterState.REASSEMBLING;
        this._reassemblyDuration = duration;
        this._reassemblyStartTime = performance.now();
        this._reassemblyProgress = 0;

        // Capture current shard positions as starting points for lerp
        this.shardPool.captureCurrentPositions();

        return true;
    }

    /**
     * Trigger reassembly from FROZEN state (for shatterFreeze gesture)
     * This is the public API method for external control of frozen shards.
     * @param {number} [duration=1500] - Animation duration in ms
     * @returns {boolean} True if reassembly started
     */
    triggerReassembly(duration = 1500) {
        if (this.state !== ShatterState.FROZEN) {
            console.warn('ShatterSystem.triggerReassembly: Can only trigger from FROZEN state, current state:', this.state);
            return false;
        }

        // Transition to REASSEMBLING state
        this.state = ShatterState.REASSEMBLING;
        this._reassemblyDuration = duration;
        this._reassemblyStartTime = performance.now();
        this._reassemblyProgress = 0;

        // Capture current shard positions as starting points for lerp
        this.shardPool.captureCurrentPositions();

        return true;
    }

    /**
     * Check if shatter is currently frozen (awaiting manual reassembly)
     * @returns {boolean}
     */
    isFrozen() {
        return this.state === ShatterState.FROZEN;
    }

    /**
     * Move frozen shards - applies impulse and resumes normal physics
     * Works with any gesture that should scatter frozen shards (punch, etc.)
     * @param {number[]} direction - Movement direction [x, y, z]
     * @param {number} force - Force multiplier (default 3.0)
     * @returns {boolean} True if moved
     */
    moveFrozenShards(direction, force = 3.0) {
        if (this.state !== ShatterState.FROZEN) {
            return false;
        }

        // Apply impulse to all shards
        this.shardPool.applyImpulse(direction, force, 0.4);

        // Resume normal shattering physics (shards will fall with gravity and fade)
        this.state = ShatterState.SHATTERING;
        this._isFreezeMode = false;
        this._isSuspendMode = false;

        // Reset lifetime on shards so they have time to animate out
        for (const shard of this.shardPool.active) {
            shard.userData.state.lifetime = 0;
            shard.userData.state.maxLifetime = 1500; // Give them 1.5s to fade out
        }

        return true;
    }

    /**
     * Trigger a dual-mode behavior on existing frozen shards
     * If not frozen, triggers a fresh shatter first then applies behavior
     * @param {string} mode - 'implode', 'dissolve', 'gravity', 'orbit'
     * @param {Object} config - Mode-specific configuration
     * @returns {boolean} True if mode started
     */
    triggerDualMode(mode, config = {}) {
        const validModes = ['implode', 'dissolve', 'gravity', 'orbit'];
        if (!validModes.includes(mode)) {
            console.warn('ShatterSystem.triggerDualMode: Invalid mode:', mode);
            return false;
        }

        // If already in a dual-mode state, ignore
        if ([ShatterState.IMPLODING, ShatterState.DISSOLVING,
            ShatterState.FALLING, ShatterState.ORBITING].includes(this.state)) {
            console.warn('ShatterSystem.triggerDualMode: Already in dual-mode state:', this.state);
            return false;
        }

        // Store dual-mode config
        this._dualModeType = mode;
        this._dualModeConfig = config;
        this._dualModeStartTime = performance.now();
        this._dualModeDuration = config.duration || 2000;

        // If FROZEN, apply behavior directly to existing shards
        if (this.state === ShatterState.FROZEN) {
            this._startDualModeFromFrozen(mode, config);
            return true;
        }

        // Otherwise, this is handled via shatter() with dualMode config
        // (called from the gesture factory)
        return false;
    }

    /**
     * Start dual-mode behavior from FROZEN state
     * @private
     */
    _startDualModeFromFrozen(mode, config) {
        // Capture current positions as starting points
        this.shardPool.captureCurrentPositions();

        // Initialize mode-specific shard physics
        switch (mode) {
        case 'implode':
            this.state = ShatterState.IMPLODING;
            this.shardPool.initImplodeMode(config);
            break;
        case 'dissolve':
            this.state = ShatterState.DISSOLVING;
            this.shardPool.initDissolveMode(config);
            break;
        case 'gravity':
            this.state = ShatterState.FALLING;
            this.shardPool.initGravityMode(config);
            break;
        case 'orbit':
            this.state = ShatterState.ORBITING;
            this.shardPool.initOrbitMode(config);
            break;
        }
    }

    /**
     * Update loop - call every frame
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        // Process chained shatters when idle
        if (this.state === ShatterState.IDLE && this._shatterQueue.length > 0) {
            this._processNextInChain();
        }

        if (this.state === ShatterState.SHATTERING) {
            // ═══════════════════════════════════════════════════════════════
            // SUSPEND MODE - Calculate and update suspend progress BEFORE shard update
            // CRITICAL: Must happen before shardPool.update() so shards use current value
            // ═══════════════════════════════════════════════════════════════
            if (this._isSuspendMode) {
                // Calculate animation progress based on elapsed time
                // Use gesture duration not shardLifetime
                const elapsed = performance.now() - this._shatterStartTime;
                const animProgress = Math.min(1, elapsed / this._gestureDuration);

                // suspendAt = when to start decelerating (e.g., 0.25 = 1250ms)
                // suspendDuration = how long to decelerate (e.g., 0.35 = 1750ms)
                // suspendProgress: 0 before suspendAt, 0→1 during suspend phase, 1 after
                let suspendProgress = 0;
                if (animProgress >= this._suspendAt) {
                    const suspendElapsed = animProgress - this._suspendAt;
                    suspendProgress = Math.min(1, suspendElapsed / this._suspendDuration);
                    // Ease-out for smooth deceleration
                    suspendProgress = 1 - Math.pow(1 - suspendProgress, 2);
                }

                this.shardPool.updateSuspendProgress(suspendProgress);
            }

            this.shardPool.update(deltaTime);

            // ═══════════════════════════════════════════════════════════════
            // SOUL REVEAL ANIMATION - Scale up over 500ms, stay fully visible
            // Keep soul at ghostMode=0 throughout entire shatter (not ghostly)
            // ═══════════════════════════════════════════════════════════════
            if (this._soulWasRevealed && this.innerMesh) {
                const uniforms = this.innerMesh.material?.uniforms;

                if (this._soulRevealProgress < 1) {
                    this._soulRevealProgress += deltaTime / 500; // 500ms animation
                    this._soulRevealProgress = Math.min(1, this._soulRevealProgress);

                    // Ease-out cubic for smooth deceleration
                    const t = this._soulRevealProgress;
                    const eased = 1 - Math.pow(1 - t, 3);

                    // Scale: 0.5 -> 1.0 (50% to full size)
                    const newScale = this._soulOriginalScale * (0.5 + eased * 0.5);
                    this.innerMesh.scale.setScalar(newScale);

                    // Animate glow: bright flash fades to normal energy
                    if (uniforms) {
                        if (uniforms.energyIntensity) {
                            uniforms.energyIntensity.value = 2.0 - eased * (2.0 - this._soulOriginalEmissive);
                        }
                        // KEEP ghostMode at 0 (fully visible) - don't animate to ghostly
                        if (uniforms.ghostMode) {
                            uniforms.ghostMode.value = 0;
                        }
                    } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
                        const emissive = 2.0 - eased * (2.0 - this._soulOriginalEmissive);
                        this.innerMesh.material.emissiveIntensity = emissive;
                    }

                } else {
                    // After reveal animation completes, MAINTAIN soul at fully visible state
                    // This prevents ghostMode from drifting during the gap before reassembly
                    this.innerMesh.scale.setScalar(this._soulOriginalScale);
                    if (uniforms) {
                        if (uniforms.energyIntensity) {
                            uniforms.energyIntensity.value = this._soulOriginalEmissive;
                        }
                        // CRITICAL: Keep ghostMode at 0 throughout entire shatter phase
                        if (uniforms.ghostMode) {
                            uniforms.ghostMode.value = 0;
                        }
                    } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
                        this.innerMesh.material.emissiveIntensity = this._soulOriginalEmissive;
                    }
                }
            }

            // Check if freeze mode animation is complete (shards fully frozen)
            if (this._isFreezeMode && this._isSuspendMode) {
                const elapsed = performance.now() - this._shatterStartTime;
                const animProgress = Math.min(1, elapsed / this._gestureDuration);
                const suspendComplete = animProgress >= (this._suspendAt + this._suspendDuration);

                if (suspendComplete) {
                    // Check if dual-mode is pending (e.g., shatterOrbit, shatterImplode)
                    if (this._pendingDualMode) {
                        // Set up dual-mode timing BEFORE starting
                        this._dualModeType = this._pendingDualMode;
                        this._dualModeConfig = this._pendingDualModeConfig;
                        this._dualModeStartTime = performance.now();
                        this._dualModeDuration = this._pendingDualModeConfig.duration || 2000;

                        // Auto-trigger dual-mode behavior instead of staying frozen
                        this._startDualModeFromFrozen(this._pendingDualMode, this._pendingDualModeConfig);
                        this._pendingDualMode = null;
                        this._pendingDualModeConfig = {};
                    } else {
                        // No dual-mode - transition to FROZEN state and wait for triggerReassembly()
                        this.state = ShatterState.FROZEN;
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // DUAL-MODE FROM NORMAL SHATTER - Transition after brief explosion
            // For dual-mode gestures (orbit, implode, etc.) without freeze mode,
            // transition to dual-mode behavior after shards have exploded outward
            // ═══════════════════════════════════════════════════════════════
            if (this._pendingDualMode && !this._isFreezeMode) {
                const elapsed = performance.now() - this._shatterStartTime;
                // Transition to dual-mode after 400ms of explosion
                const transitionTime = 400;

                if (elapsed >= transitionTime) {
                    // Set up dual-mode timing BEFORE starting
                    this._dualModeType = this._pendingDualMode;
                    this._dualModeConfig = this._pendingDualModeConfig;
                    this._dualModeStartTime = performance.now();
                    this._dualModeDuration = this._pendingDualModeConfig.duration || 2000;

                    // Capture current shard positions and start dual-mode
                    this.shardPool.captureCurrentPositions();
                    this._startDualModeFromFrozen(this._pendingDualMode, this._pendingDualModeConfig);
                    this._pendingDualMode = null;
                    this._pendingDualModeConfig = {};
                }
            }

            // Check if all shards finished (only for non-freeze and non-dual-mode)
            if (this.shardPool.activeCount === 0 && !this._isFreezeMode && !this._pendingDualMode) {
                this._onShatterComplete();
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // DUAL-MODE STATES - Update specialized shard behaviors
        // ═══════════════════════════════════════════════════════════════
        if (this.state === ShatterState.IMPLODING) {
            this._updateImplodeMode(deltaTime);
        }
        if (this.state === ShatterState.DISSOLVING) {
            this._updateDissolveMode(deltaTime);
        }
        if (this.state === ShatterState.FALLING) {
            this._updateGravityMode(deltaTime);
        }
        if (this.state === ShatterState.ORBITING) {
            this._updateOrbitMode(deltaTime);
        }

        if (this.state === ShatterState.REASSEMBLING) {
            // Update reassembly progress
            const elapsed = performance.now() - this._reassemblyStartTime;
            this._reassemblyProgress = Math.min(1, elapsed / this._reassemblyDuration);

            // Standard ease-in-out cubic for smooth reassembly
            const t = this._reassemblyProgress;
            const eased = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Update shards with reassembly lerp and target mesh for dynamic tracking
            // Passing mesh directly avoids per-frame clone allocations
            this.shardPool.updateReassembly(eased, this.targetMesh);

            // ═══════════════════════════════════════════════════════════════
            // SOUL MANAGEMENT DURING REASSEMBLY
            // First 60%: Keep soul fully visible (low ghostMode, high energy)
            // Last 40%: Fade out as shell reforms
            // ═══════════════════════════════════════════════════════════════
            if (this._soulWasRevealed && this.innerMesh) {
                const uniforms = this.innerMesh.material?.uniforms;

                if (this._reassemblyProgress <= 0.6) {
                    // MAINTAIN soul at full visible state during first 60%
                    // Keep ghostMode LOW (0) so soul stays visible, not at original ghostly value
                    this.innerMesh.scale.setScalar(this._soulOriginalScale);

                    if (uniforms) {
                        // Keep soul visible: high energy, low ghostMode
                        if (uniforms.energyIntensity) {
                            uniforms.energyIntensity.value = this._soulOriginalEmissive;
                        }
                        // CRITICAL: Keep ghostMode at 0 (fully visible) not at original ghostly value
                        if (uniforms.ghostMode) {
                            uniforms.ghostMode.value = 0;
                        }
                    } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
                        this.innerMesh.material.emissiveIntensity = this._soulOriginalEmissive;
                    }
                } else {
                    // FADE OUT soul in last 40% of reassembly
                    const fadeProgress = (this._reassemblyProgress - 0.6) / 0.4;
                    const fadeEased = fadeProgress * fadeProgress; // Ease-in for gentle start

                    // Scale down slightly
                    const scale = this._soulOriginalScale * (1 - fadeEased * 0.3);
                    this.innerMesh.scale.setScalar(scale);

                    // Fade glow
                    if (uniforms) {
                        // CrystalSoul shader - fade energy and increase ghostMode
                        if (uniforms.energyIntensity) {
                            uniforms.energyIntensity.value = this._soulOriginalEmissive * (1 - fadeEased);
                        }
                        if (uniforms.ghostMode && this._soulOriginalGhostMode !== undefined) {
                            // IMPORTANT: Fade ghostMode from 0 (where MAINTAIN left it) to original value
                            // NOT from originalGhostMode to 1.0 - that causes instant invisibility
                            // because the shader discards fragments when ghostMode > 0.01
                            uniforms.ghostMode.value = fadeEased * this._soulOriginalGhostMode;
                        }
                    } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
                        // Standard material fallback
                        this.innerMesh.material.emissiveIntensity =
                            this._soulOriginalEmissive * (1 - fadeEased);
                    }
                }
            }

            // Check if reassembly complete
            if (this._reassemblyProgress >= 1) {
                this._onReassemblyComplete();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DUAL-MODE UPDATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Update implode mode - shards fly inward to center
     * @private
     */
    _updateImplodeMode(deltaTime) {
        const elapsed = performance.now() - this._dualModeStartTime;
        const progress = Math.min(1, elapsed / this._dualModeDuration);

        // Get center point for implosion (soul position or origin)
        const centerPoint = this.innerMesh
            ? this.innerMesh.position.clone()
            : new THREE.Vector3();

        this.shardPool.updateImplode(deltaTime, progress, centerPoint);

        // Animate soul during implosion (grows brighter, pulses)
        if (this._soulWasRevealed && this.innerMesh) {
            const uniforms = this.innerMesh.material?.uniforms;
            if (uniforms) {
                // Build glow as shards converge
                const glowRamp = 1.0 + progress * 1.5;
                if (uniforms.energyIntensity) {
                    uniforms.energyIntensity.value = glowRamp;
                }
            }
        }

        // Check completion
        if (progress >= 1) {
            this._onDualModeComplete();
        }
    }

    /**
     * Update dissolve mode - shards blow away like dust
     * @private
     */
    _updateDissolveMode(deltaTime) {
        const elapsed = performance.now() - this._dualModeStartTime;
        const progress = Math.min(1, elapsed / this._dualModeDuration);

        this.shardPool.updateDissolve(deltaTime, progress, this._dualModeConfig);

        // Soul fades as shards dissolve (sad/loss emotion)
        if (this._soulWasRevealed && this.innerMesh) {
            const uniforms = this.innerMesh.material?.uniforms;
            if (uniforms) {
                // Fade energy as shards blow away
                if (uniforms.energyIntensity) {
                    uniforms.energyIntensity.value = this._soulOriginalEmissive * (1 - progress * 0.5);
                }
            }
        }

        // Check completion
        if (progress >= 1) {
            this._onDualModeComplete();
        }
    }

    /**
     * Update gravity mode - shards fall and bounce on floor
     * @private
     */
    _updateGravityMode(deltaTime) {
        const elapsed = performance.now() - this._dualModeStartTime;
        const progress = Math.min(1, elapsed / this._dualModeDuration);

        const floorY = this._dualModeConfig.floorY ?? -1.0;
        this.shardPool.updateGravityBounce(deltaTime, progress, floorY);

        // Check completion
        if (progress >= 1) {
            this._onDualModeComplete();
        }
    }

    /**
     * Update orbit mode - shards orbit around soul
     * @private
     */
    _updateOrbitMode(deltaTime) {
        const elapsed = performance.now() - this._dualModeStartTime;
        const progress = Math.min(1, elapsed / this._dualModeDuration);

        // Get center point for orbit (soul position)
        const centerPoint = this.innerMesh
            ? this.innerMesh.position.clone()
            : new THREE.Vector3();

        this.shardPool.updateOrbit(deltaTime, progress, centerPoint, this._dualModeConfig);

        // Soul pulses gently while shards orbit
        if (this._soulWasRevealed && this.innerMesh) {
            const uniforms = this.innerMesh.material?.uniforms;
            if (uniforms) {
                const pulse = 0.2 * Math.sin(elapsed / 200);
                if (uniforms.energyIntensity) {
                    uniforms.energyIntensity.value = this._soulOriginalEmissive + pulse;
                }
            }
        }

        // When orbit duration expires, check if we should reassemble
        if (progress >= 1 && this._dualModeConfig.autoComplete !== false) {
            // Check if reassemble was requested for this gesture
            if (this._dualModeConfig.reassemble) {
                // Transition to reassembly instead of just completing
                this.state = ShatterState.REASSEMBLING;
                this._reassemblyDuration = this._dualModeConfig.reassembleDuration || 1200;
                this._reassemblyStartTime = performance.now();
                this._reassemblyProgress = 0;
                this.shardPool.captureCurrentPositions();
            } else {
                this._onDualModeComplete();
            }
        }
    }

    /**
     * Handle dual-mode completion
     * @private
     */
    _onDualModeComplete() {
        // Clean up shards
        this.shardPool.clear();

        // Restore target mesh
        if (this.targetMesh) {
            this.targetMesh.visible = true;
        }

        // Reset soul
        if (this._soulWasRevealed && this.innerMesh) {
            this.innerMesh.scale.setScalar(this._soulOriginalScale);
            this._resetSoulUniforms();
        }

        // Reset dual-mode state
        this._dualModeType = null;
        this._dualModeConfig = {};
        this._releaseGeometryRef();
        this.state = ShatterState.IDLE;

        // Fire callback
        if (this.onShatterComplete) {
            this.onShatterComplete(this.targetMesh);
        }
    }

    /**
     * Handle shatter completion
     * @private
     */
    _onShatterComplete() {
        this.state = ShatterState.IDLE;
        this._releaseGeometryRef();

        // Optionally restore mesh visibility
        if (this.autoRestore && this.targetMesh) {
            this.targetMesh.visible = true;

            // Only reset inner mesh if it was revealed during this shatter
            // If revealInner was false, the soul was never modified, so don't touch it
            if (this._soulWasRevealed && this.innerMesh) {
                this.innerMesh.scale.setScalar(this._soulOriginalScale);
                this._resetSoulUniforms();
            }
        }

        // Fire callback - Core3DManager will restore soul visibility
        if (this.onShatterComplete) {
            this.onShatterComplete(this.targetMesh);
        }
    }

    /**
     * Handle reassembly completion
     * @private
     */
    _onReassemblyComplete() {
        // Clear all shards
        this.shardPool.clear();
        this._releaseGeometryRef();

        // Restore target mesh
        if (this.targetMesh) {
            this.targetMesh.visible = true;
        }

        // Only reset inner mesh if it was revealed during this shatter
        // If revealInner was false, the soul was never modified, so don't touch it
        if (this._soulWasRevealed && this.innerMesh) {
            this.innerMesh.scale.setScalar(this._soulOriginalScale);
            this._resetSoulUniforms();
        }

        this.state = ShatterState.IDLE;

        // Fire callback - Core3DManager will restore soul visibility
        if (this.onReassemblyComplete) {
            this.onReassemblyComplete(this.targetMesh);
        }
    }

    /**
     * Reset soul mesh uniforms and layer to original values
     * @private
     */
    _resetSoulUniforms() {
        if (!this.innerMesh) return;

        // Restore original render layer (layer 2 = bloom only for CrystalSoul)
        if (this._soulOriginalLayer !== undefined) {
            this.innerMesh.layers.mask = this._soulOriginalLayer;
        }

        // Restore original depth test and render order
        if (this.innerMesh.material && this._soulOriginalDepthTest !== undefined) {
            this.innerMesh.material.depthTest = this._soulOriginalDepthTest;
        }
        if (this._soulOriginalRenderOrder !== undefined) {
            this.innerMesh.renderOrder = this._soulOriginalRenderOrder;
        }

        const uniforms = this.innerMesh.material?.uniforms;
        if (uniforms) {
            // CrystalSoul shader - reset to original values
            if (uniforms.energyIntensity) {
                uniforms.energyIntensity.value = this._soulOriginalEmissive;
            }
            if (uniforms.ghostMode && this._soulOriginalGhostMode !== undefined) {
                uniforms.ghostMode.value = this._soulOriginalGhostMode;
            }
        } else if (this.innerMesh.material?.emissiveIntensity !== undefined) {
            // Standard material fallback
            this.innerMesh.material.emissiveIntensity = this._soulOriginalEmissive;
        }
    }

    /**
     * Release geometry cache ref when shatter/reassembly completes
     * @private
     */
    _releaseGeometryRef() {
        if (this._activeGeometryId) {
            const currentRefs = this.geometryCacheRefs.get(this._activeGeometryId) || 0;
            if (currentRefs > 0) {
                this.geometryCacheRefs.set(this._activeGeometryId, currentRefs - 1);
            }
            this._activeGeometryId = null;
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
     * Force stop any active shatter and clear queue
     */
    forceStop() {
        this.shardPool.clear();
        this.state = ShatterState.IDLE;
        this._shatterQueue = [];
        this._releaseGeometryRef();

        if (this.targetMesh) {
            this.targetMesh.visible = true;
        }
        if (this.innerMesh) {
            this.innerMesh.visible = false;
        }
    }

    /**
     * Clear the shatter chain queue (doesn't stop current shatter)
     */
    clearChainQueue() {
        this._shatterQueue = [];
    }

    /**
     * Get number of pending shatters in chain
     * @returns {number}
     */
    getChainQueueLength() {
        return this._shatterQueue.length;
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
     * Check if system is currently reassembling
     * @returns {boolean}
     */
    isReassembling() {
        return this.state === ShatterState.REASSEMBLING;
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
            cachedGeometries: this.geometryCache.size,
            chainQueueLength: this._shatterQueue.length,
            reassemblyProgress: this.state === ShatterState.REASSEMBLING
                ? this._reassemblyProgress
                : null
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
        this.geometryCacheRefs.clear();
    }

    /**
     * Clean up all resources
     */
    dispose() {
        this.forceStop();
        this.shardPool.dispose();
        this.clearCache();

        // Dispose cached shard material
        if (this.shardMaterialCache?.baseMaterial) {
            this.shardMaterialCache.baseMaterial.dispose();
        }
        this.shardMaterialCache = null;

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
