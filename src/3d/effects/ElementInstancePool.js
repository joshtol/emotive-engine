/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Instance Pool
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GPU-efficient element rendering using Three.js InstancedMesh
 * @module effects/ElementInstancePool
 *
 * Architecture:
 * - 1 InstancedMesh per element type (fire, ice, water, etc.)
 * - Merged geometry with all model variants baked in
 * - Per-instance attributes for animation (spawnTime, exitTime, modelIndex, etc.)
 * - Trail copies as additional instance slots (4 slots per element: 1 main + 3 trail)
 * - Time-offset animation calculated in shaders
 *
 * This replaces the old system that cloned materials per element, causing GPU memory leaks.
 */

import * as THREE from 'three';

// Constants
const POOL_SIZE = 64;           // Max instances per element type (16 elements × 4 slots each)
const TRAIL_COPIES = 1;         // Trail copies per main element (reduced from 3)
const SLOTS_PER_ELEMENT = 1 + TRAIL_COPIES;  // 2 slots total (was 4)

/**
 * Manages a pool of instanced elements for GPU-efficient rendering.
 * Uses InstancedMesh with per-instance attributes for animation.
 */
export class ElementInstancePool {
    /**
     * @param {THREE.BufferGeometry} mergedGeometry - Merged geometry with all model variants
     * @param {THREE.ShaderMaterial} material - Shared material with instancing support
     * @param {number} [maxElements=16] - Maximum number of logical elements (each uses 4 slots)
     */
    constructor(mergedGeometry, material, maxElements = 16) {
        this.maxElements = maxElements;
        this.maxInstances = maxElements * SLOTS_PER_ELEMENT;

        // Create the instanced mesh
        this.mesh = new THREE.InstancedMesh(
            mergedGeometry,
            material,
            this.maxInstances
        );
        this.mesh.frustumCulled = false;  // Elements may animate outside frustum
        this.mesh.count = 0;  // Start with no visible instances

        // Instance attribute buffers
        this._createInstanceAttributes();

        // Slot management
        this.freeSlots = [];      // Available slot indices
        this.activeElements = new Map();  // elementId -> { mainSlot, trailSlots[], spawnTime, exitTime }

        // Initialize free slots (in reverse so we pop from the front)
        for (let i = this.maxInstances - SLOTS_PER_ELEMENT; i >= 0; i -= SLOTS_PER_ELEMENT) {
            this.freeSlots.push(i);  // Push the main slot index (trails are consecutive)
        }

        // Scratch objects for matrix updates
        this._matrix = new THREE.Matrix4();
        this._position = new THREE.Vector3();
        this._quaternion = new THREE.Quaternion();
        this._scale = new THREE.Vector3(1, 1, 1);
        this._identityQuaternion = new THREE.Quaternion();  // Reusable identity
        this._unitScale = new THREE.Vector3(1, 1, 1);       // Reusable unit scale

        // Global time reference (set externally)
        this.globalTime = 0;

        // Track pending timeouts for cleanup
        this._pendingTimeouts = new Set();
    }

    /**
     * Creates per-instance attribute buffers for animation data.
     * @private
     */
    _createInstanceAttributes() {
        const count = this.maxInstances;

        // Spawn time - when this instance started animating
        this.spawnTimeArray = new Float32Array(count);
        this.spawnTimeAttr = new THREE.InstancedBufferAttribute(this.spawnTimeArray, 1);
        this.mesh.geometry.setAttribute('aSpawnTime', this.spawnTimeAttr);

        // Exit time - when this instance should start fading out (0 = not exiting)
        this.exitTimeArray = new Float32Array(count);
        this.exitTimeAttr = new THREE.InstancedBufferAttribute(this.exitTimeArray, 1);
        this.mesh.geometry.setAttribute('aExitTime', this.exitTimeAttr);

        // Selected model - which model variant to render (instance selects from merged geometry)
        // Note: This is DIFFERENT from aModelIndex (vertex attr) which marks which model each vertex belongs to
        this.selectedModelArray = new Float32Array(count);
        this.selectedModelAttr = new THREE.InstancedBufferAttribute(this.selectedModelArray, 1);
        this.mesh.geometry.setAttribute('aSelectedModel', this.selectedModelAttr);

        // Opacity - per-instance opacity for fade in/out
        this.opacityArray = new Float32Array(count).fill(1.0);
        this.opacityAttr = new THREE.InstancedBufferAttribute(this.opacityArray, 1);
        this.mesh.geometry.setAttribute('aInstanceOpacity', this.opacityAttr);

        // Trail parent slot - for trail instances, points to their parent's slot (-1 for main)
        this.trailParentArray = new Float32Array(count).fill(-1);
        this.trailParentAttr = new THREE.InstancedBufferAttribute(this.trailParentArray, 1);
        this.mesh.geometry.setAttribute('aTrailParent', this.trailParentAttr);

        // Trail index - which trail copy this is (0-2 for trails, -1 for main)
        this.trailIndexArray = new Float32Array(count).fill(-1);
        this.trailIndexAttr = new THREE.InstancedBufferAttribute(this.trailIndexArray, 1);
        this.mesh.geometry.setAttribute('aTrailIndex', this.trailIndexAttr);

        // Velocity - for motion blur (xyz = direction, w = speed)
        this.velocityArray = new Float32Array(count * 4);
        this.velocityAttr = new THREE.InstancedBufferAttribute(this.velocityArray, 4);
        this.mesh.geometry.setAttribute('aVelocity', this.velocityAttr);

        // Random seed - for shader-based variation
        // Also used as arc phase for vortex effects (when arcPhase > 0 is passed to spawn)
        this.randomSeedArray = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            this.randomSeedArray[i] = Math.random();
        }
        this.randomSeedAttr = new THREE.InstancedBufferAttribute(this.randomSeedArray, 1);
        this.mesh.geometry.setAttribute('aRandomSeed', this.randomSeedAttr);
    }

    /**
     * Spawns an element with its trail copies.
     * @param {string} elementId - Unique identifier for this element
     * @param {THREE.Vector3} position - World position
     * @param {THREE.Quaternion} [rotation] - Optional rotation
     * @param {THREE.Vector3} [scale] - Optional scale
     * @param {number} [modelIndex=0] - Which model variant to use
     * @param {number|null} [arcPhase=null] - Arc phase offset in radians (null = keep random seed)
     * @param {number|null} [relayIndex=null] - Relay ring index (0=top, 1=right, 2=left). Encodes as (100 + index*10 + phase)
     * @returns {boolean} True if spawn succeeded, false if pool is full
     */
    spawn(elementId, position, rotation, scale, modelIndex = 0, arcPhase = null, relayIndex = null) {
        // Check for available slots
        if (this.freeSlots.length === 0) {
            console.warn('[ElementInstancePool] Pool full, cannot spawn');
            return false;
        }

        // Get a slot group (main + 3 trails are consecutive)
        const mainSlot = this.freeSlots.pop();
        const trailSlots = [mainSlot + 1, mainSlot + 2, mainSlot + 3];

        const spawnTime = this.globalTime;

        // Store element tracking info
        this.activeElements.set(elementId, {
            mainSlot,
            trailSlots,
            spawnTime,
            exitTime: 0,
            position: position.clone(),
            modelIndex
        });

        // Set up main instance
        // Start with opacity 0 - AnimationState will control fade via updateInstanceOpacity
        this._setupInstance(mainSlot, position, rotation, scale, {
            spawnTime,
            exitTime: 0,
            modelIndex,
            opacity: 0.0,  // Start invisible - AnimationState controls smooth fade
            trailParent: -1,
            trailIndex: -1,
            arcPhase,
            relayIndex
        });

        // Set up trail instances (slightly behind in time/position)
        // Also start invisible
        for (let i = 0; i < TRAIL_COPIES; i++) {
            const trailSlot = trailSlots[i];
            this._setupInstance(trailSlot, position, rotation, scale, {
                spawnTime,
                exitTime: 0,
                modelIndex,
                opacity: 0.0,  // Start invisible - AnimationState controls fade
                trailParent: mainSlot,
                trailIndex: i,
                arcPhase,
                relayIndex
            });
        }

        // Update visible instance count
        this._updateVisibleCount();

        return true;
    }

    /**
     * Sets up a single instance slot.
     * @private
     */
    _setupInstance(slot, position, rotation, scale, attrs) {
        // Build transform matrix (use reusable fallbacks to avoid allocation)
        this._position.copy(position);
        this._quaternion.copy(rotation || this._identityQuaternion);
        this._scale.copy(scale || this._unitScale);
        this._matrix.compose(this._position, this._quaternion, this._scale);

        // Set instance matrix
        this.mesh.setMatrixAt(slot, this._matrix);

        // Set per-instance attributes
        this.spawnTimeArray[slot] = attrs.spawnTime;
        this.exitTimeArray[slot] = attrs.exitTime;
        this.selectedModelArray[slot] = attrs.modelIndex;
        this.opacityArray[slot] = attrs.opacity;
        this.trailParentArray[slot] = attrs.trailParent;
        this.trailIndexArray[slot] = attrs.trailIndex;
        // Per-instance relay encoding: aRandomSeed = 100 + relayIndex*10 + arcPhase
        // Ring 0 (top): 100-106, Ring 1 (right): 110-116, Ring 2 (left): 120-126
        // Shader checks aRandomSeed >= 100.0 to distinguish from default random seeds [0,1)
        if (typeof attrs.arcPhase === 'number') {
            const base = 100.0 + (attrs.relayIndex || 0) * 10.0;
            this.randomSeedArray[slot] = base + attrs.arcPhase;
        } else {
            // Clear any stale relay encoding from previous gesture's use of this slot
            this.randomSeedArray[slot] = Math.random();
        }
        this.randomSeedAttr.needsUpdate = true;

        // Mark attributes for update
        this.spawnTimeAttr.needsUpdate = true;
        this.exitTimeAttr.needsUpdate = true;
        this.selectedModelAttr.needsUpdate = true;
        this.opacityAttr.needsUpdate = true;
        this.trailParentAttr.needsUpdate = true;
        this.trailIndexAttr.needsUpdate = true;
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Updates an element's position and optionally velocity.
     * @param {string} elementId - Element identifier
     * @param {THREE.Vector3} position - New position
     * @param {THREE.Vector3} [velocity] - Optional velocity for motion blur
     */
    updatePosition(elementId, position, velocity) {
        const element = this.activeElements.get(elementId);
        if (!element) return;

        // Calculate velocity if not provided (using scratch object to avoid allocation)
        if (!velocity && element.position) {
            this._velocity = this._velocity || new THREE.Vector3();
            velocity = this._velocity.copy(position).sub(element.position);
        }
        element.position.copy(position);

        // Update main slot
        this.mesh.getMatrixAt(element.mainSlot, this._matrix);
        this._matrix.decompose(this._position, this._quaternion, this._scale);
        this._position.copy(position);
        this._matrix.compose(this._position, this._quaternion, this._scale);
        this.mesh.setMatrixAt(element.mainSlot, this._matrix);

        // Update velocity for motion blur
        if (velocity) {
            const speed = velocity.length();
            const idx = element.mainSlot * 4;
            this.velocityArray[idx] = velocity.x;
            this.velocityArray[idx + 1] = velocity.y;
            this.velocityArray[idx + 2] = velocity.z;
            this.velocityArray[idx + 3] = speed;
            this.velocityAttr.needsUpdate = true;
        }

        // Trail positions are handled by shader (they follow with delay)

        this.mesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Updates an element's full transform (position, rotation, scale).
     * Used by AnimationState to apply drift, pulse, and rotation animations.
     * @param {string} elementId - Element identifier
     * @param {THREE.Vector3} position - New position
     * @param {THREE.Quaternion} rotation - New rotation
     * @param {THREE.Vector3|number} scale - New scale (Vector3 or uniform scalar)
     * @param {THREE.Vector3} [velocity] - Optional velocity for motion blur
     */
    updateInstanceTransform(elementId, position, rotation, scale, velocity = null) {
        const element = this.activeElements.get(elementId);
        if (!element) return;

        // Calculate velocity if not provided (using scratch object to avoid allocation)
        if (element.position) {
            if (!velocity) {
                // Use _position as scratch for velocity calculation
                this._velocity = this._velocity || new THREE.Vector3();
                velocity = this._velocity.copy(position).sub(element.position);
            }
            element.position.copy(position);
        }

        // Build transform matrix
        this._position.copy(position);
        this._quaternion.copy(rotation);
        if (typeof scale === 'number') {
            this._scale.setScalar(scale);
        } else {
            this._scale.copy(scale);
        }
        this._matrix.compose(this._position, this._quaternion, this._scale);

        // Update main slot
        this.mesh.setMatrixAt(element.mainSlot, this._matrix);

        // Update trail slots with slightly delayed transforms
        // Trails use progressively smaller scales and inherit rotation
        // When stationary (no velocity), trails scale to 0 — they'd overlap the
        // main instance at different sizes creating visible concentric ring artifacts
        const origScaleX = this._scale.x;
        const origScaleY = this._scale.y;
        const origScaleZ = this._scale.z;
        const hasMotion = velocity && velocity.lengthSq() > 0.0001;

        for (let i = 0; i < TRAIL_COPIES; i++) {
            const trailSlot = element.trailSlots[i];
            const trailMultiplier = hasMotion ? (1 - (i + 1) * 0.15) : 0;

            if (typeof scale === 'number') {
                this._scale.setScalar(scale * trailMultiplier);
            } else {
                this._scale.set(
                    origScaleX * trailMultiplier,
                    origScaleY * trailMultiplier,
                    origScaleZ * trailMultiplier
                );
            }
            this._matrix.compose(this._position, this._quaternion, this._scale);
            this.mesh.setMatrixAt(trailSlot, this._matrix);
        }

        // Update velocity for motion blur
        if (velocity) {
            const speed = velocity.length();
            const idx = element.mainSlot * 4;
            this.velocityArray[idx] = velocity.x;
            this.velocityArray[idx + 1] = velocity.y;
            this.velocityArray[idx + 2] = velocity.z;
            this.velocityArray[idx + 3] = speed;
            this.velocityAttr.needsUpdate = true;
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Updates an element's opacity.
     * Used by AnimationState to apply fade in/out and flicker animations.
     * @param {string} elementId - Element identifier
     * @param {number} opacity - New opacity (0-1)
     */
    updateInstanceOpacity(elementId, opacity) {
        const element = this.activeElements.get(elementId);
        if (!element) return;

        // Update main slot opacity
        this.opacityArray[element.mainSlot] = opacity;

        // Update trail slots with progressively lower opacity
        for (let i = 0; i < TRAIL_COPIES; i++) {
            const trailSlot = element.trailSlots[i];
            this.opacityArray[trailSlot] = opacity * (1 - (i + 1) * 0.25);  // 75%, 50%, 25%
        }

        this.opacityAttr.needsUpdate = true;
    }

    /**
     * Begins the despawn animation for an element.
     * @param {string} elementId - Element identifier
     * @param {number} [fadeDuration=0.5] - Fade out duration in seconds
     */
    beginDespawn(elementId, fadeDuration = 0.5) {
        const element = this.activeElements.get(elementId);
        if (!element) return;

        const exitTime = this.globalTime;
        element.exitTime = exitTime;

        // Set exit time for main and all trails
        const allSlots = [element.mainSlot, ...element.trailSlots];
        for (const slot of allSlots) {
            this.exitTimeArray[slot] = exitTime;
        }
        this.exitTimeAttr.needsUpdate = true;

        // Schedule actual removal after fade completes
        // Track timeout for cleanup on dispose
        const timeoutId = setTimeout(() => {
            this._pendingTimeouts.delete(timeoutId);
            this._finalizeRemoval(elementId);
        }, fadeDuration * 1000);
        this._pendingTimeouts.add(timeoutId);
    }

    /**
     * Immediately removes an element without animation.
     * @param {string} elementId - Element identifier
     */
    removeImmediate(elementId) {
        this._finalizeRemoval(elementId);
    }

    /**
     * Finalizes removal, returning slots to the pool.
     * @private
     */
    _finalizeRemoval(elementId) {
        const element = this.activeElements.get(elementId);
        if (!element) return;

        // Clear all slots
        const allSlots = [element.mainSlot, ...element.trailSlots];
        for (const slot of allSlots) {
            // Reset instance to invisible (scale to 0)
            this._matrix.makeScale(0, 0, 0);
            this.mesh.setMatrixAt(slot, this._matrix);

            // Reset attributes
            this.spawnTimeArray[slot] = 0;
            this.exitTimeArray[slot] = 0;
            this.opacityArray[slot] = 0;
        }

        // Return main slot to pool (trails are consecutive)
        this.freeSlots.push(element.mainSlot);

        // Remove from active tracking
        this.activeElements.delete(elementId);

        // Update GPU
        this.mesh.instanceMatrix.needsUpdate = true;
        this.spawnTimeAttr.needsUpdate = true;
        this.exitTimeAttr.needsUpdate = true;
        this.opacityAttr.needsUpdate = true;

        this._updateVisibleCount();
    }

    /**
     * Removes all elements immediately.
     */
    clear() {
        for (const elementId of this.activeElements.keys()) {
            this._finalizeRemoval(elementId);
        }
    }

    /**
     * Updates the visible instance count based on active elements.
     * @private
     */
    _updateVisibleCount() {
        // Find highest active slot
        let maxSlot = 0;
        for (const element of this.activeElements.values()) {
            const highestTrail = element.trailSlots[TRAIL_COPIES - 1];
            if (highestTrail >= maxSlot) {
                maxSlot = highestTrail + 1;
            }
        }
        this.mesh.count = maxSlot;
    }

    /**
     * Updates the global time reference.
     * @param {number} time - Current time in seconds
     */
    setTime(time) {
        this.globalTime = time;
    }

    /**
     * Gets the number of active elements.
     * @returns {number}
     */
    get activeCount() {
        return this.activeElements.size;
    }

    /**
     * Gets the number of available element slots.
     * @returns {number}
     */
    get availableSlots() {
        return this.freeSlots.length;
    }

    /**
     * Gets stats for debugging.
     * @returns {Object}
     */
    getStats() {
        return {
            activeElements: this.activeElements.size,
            activeInstances: this.mesh.count,
            maxInstances: this.maxInstances,
            availableSlots: this.freeSlots.length,
            utilizationPercent: ((this.activeElements.size / this.maxElements) * 100).toFixed(1)
        };
    }

    /**
     * Disposes of all GPU resources.
     */
    dispose() {
        // Cancel all pending despawn timeouts
        for (const timeoutId of this._pendingTimeouts) {
            clearTimeout(timeoutId);
        }
        this._pendingTimeouts.clear();

        this.clear();
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
    }
}

export { POOL_SIZE, TRAIL_COPIES, SLOTS_PER_ELEMENT };
