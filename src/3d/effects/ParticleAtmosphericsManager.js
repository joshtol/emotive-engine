/**
 * =================================================================================================
 *  emotive ENGINE - Particle Atmospherics Manager
 * =================================================================================================
 *
 * @fileoverview Per-gesture targeted particle system for smoke, mist, and fog effects.
 * @module effects/ParticleAtmosphericsManager
 *
 * Architecture:
 *   - ParticleAtmosphericsManager: owns per-gesture emitter sets, wired from ThreeRenderer
 *   - ParticleEmitter: per-layer particle pool with spawn/kill lifecycle
 *   - GPU-deterministic: attributes set once at spawn, vertex shader computes
 *     current state from uTime. No per-frame CPU position updates.
 *   - Particles render directly in the main scene (no separate RT or composite pass)
 *
 * Per-gesture lifecycle:
 *   startGesture(type, config[]) → creates emitters for each atmospheric layer
 *   syncSources(type, activeElements) → filters positions by targetModels per emitter
 *   setGestureProgress(type, progress) → drives progressCurve modulation
 *   stopGesture(type) → stops spawning, lets existing particles fade naturally
 *   update(dt) → advances all active emitters, cleans up dead ones
 *
 * Physics features:
 *   - velocityInheritance: particles inherit source element motion (axis-travel, orbit, drift)
 *   - centrifugal: outward radial velocity for spinning gestures (ring rotation)
 *
 * Integration:
 *   Gesture files define `atmospherics: [{ preset, targets, anchor, ... }]` in animation
 *   ElementInstancedSpawner wires start/stop/sync following cutout/grain/flash pattern
 *   ThreeRenderer calls update() each frame to advance uTime and run spawn/kill
 */

import * as THREE from 'three';
import { resolveLayerConfig, evaluateProgressCurve } from './AtmosphericPresets.js';

const MAX_SOURCE_POSITIONS = 64;
const _tempVec3 = new THREE.Vector3(); // Reusable for localToWorld transforms
const MAX_DT = 0.1; // Cap delta time to 100ms — prevents spawn burst on tab resume

// =================================================================================================
// PARTICLE EMITTER (per atmospheric layer)
// =================================================================================================

class ParticleEmitter {
    /**
     * @param {Object} config - Resolved layer config from AtmosphericPresets.resolveLayerConfig()
     */
    constructor(config) {
        this.config = config;
        this.activeCount = 0;
        this.spawnAccumulator = 0;
        this.sourceCount = 0;
        this.spawning = true; // Set to false on stopGesture to drain
        this._dirty = false;
        this._progress = 0;
        this._energy = null;  // null = not set (use curveMultiplier fallback)

        // Source element positions (filtered by targetModels each frame)
        this._sourcePositions = new Float32Array(MAX_SOURCE_POSITIONS * 3);

        // Velocity tracking: per-source velocity computed from frame-to-frame position delta
        this._prevSourcePositions = new Float32Array(MAX_SOURCE_POSITIONS * 3);
        this._sourceVelocities = new Float32Array(MAX_SOURCE_POSITIONS * 3);
        this._prevSourceCount = 0;
        this._hasVelocityData = false; // Need 2+ frames to compute velocity

        // GPU geometry + attribute buffers
        const max = config.maxParticles;
        this._spawnPosBuffer    = new Float32Array(max * 3);
        this._spawnVelBuffer    = new Float32Array(max * 3);
        this._spawnTimeBuffer   = new Float32Array(max);
        this._lifetimeBuffer    = new Float32Array(max);
        this._sizeBuffer        = new Float32Array(max);
        this._rotationBuffer    = new Float32Array(max);
        this._seedBuffer        = new Float32Array(max);

        this.geometry = this._createGeometry(max);
        this.mesh = new THREE.Mesh(this.geometry, config.material);
        this.mesh.frustumCulled = false;
        this.mesh.visible = false;
        this.mesh.renderOrder = 100; // Render after opaque scene objects
    }

    /**
     * Create InstancedBufferGeometry with a unit quad and per-instance attributes.
     */
    _createGeometry(maxParticles) {
        const geo = new THREE.InstancedBufferGeometry();

        // Base quad: 4 vertices, 6 indices (two triangles)
        const vertices = new Float32Array([
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5,  0.5, 0,
            -0.5,  0.5, 0,
        ]);
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.setIndex(new THREE.BufferAttribute(indices, 1));

        // Per-instance attributes (set once at spawn, GPU-deterministic)
        // DynamicDrawUsage: these buffers change every few frames as particles
        // spawn/die — StaticDrawUsage causes expensive driver-side buffer reallocation
        const attrDefs = [
            ['aSpawnPos',      this._spawnPosBuffer,  3],
            ['aSpawnVelocity', this._spawnVelBuffer,   3],
            ['aSpawnTime',     this._spawnTimeBuffer,  1],
            ['aLifetime',      this._lifetimeBuffer,   1],
            ['aSize',          this._sizeBuffer,       1],
            ['aRotation',      this._rotationBuffer,   1],
            ['aSeed',          this._seedBuffer,       1],
        ];
        for (const [name, buffer, size] of attrDefs) {
            const attr = new THREE.InstancedBufferAttribute(buffer, size);
            attr.setUsage(THREE.DynamicDrawUsage);
            geo.setAttribute(name, attr);
        }

        geo.instanceCount = 0;
        return geo;
    }

    /**
     * Set source positions from filtered activeElements.
     * Called each frame by the manager after filtering by targetModels.
     *
     * @param {Float32Array} positions - Flat array of [x,y,z, x,y,z, ...]
     * @param {number} count - Number of source positions
     */
    setSourcePositions(positions, count) {
        this.sourceCount = Math.min(count, MAX_SOURCE_POSITIONS);
        if (this.sourceCount === 0) return;

        // Copy filtered positions
        for (let i = 0; i < this.sourceCount * 3; i++) {
            this._sourcePositions[i] = positions[i];
        }
    }

    /**
     * Compute per-source velocities from frame-to-frame position delta.
     * Called at the start of update() after syncSources has set new positions.
     * Sources are matched by index (stable ordering from activeElements iteration).
     *
     * @param {number} dt - Frame delta time in seconds
     */
    _updateSourceVelocities(dt) {
        if (dt < 0.001 || this._prevSourceCount === 0 || this.sourceCount === 0) {
            // Store current for next frame, but no velocity yet
            for (let i = 0; i < this.sourceCount * 3; i++) {
                this._prevSourcePositions[i] = this._sourcePositions[i];
            }
            this._prevSourceCount = this.sourceCount;
            this._hasVelocityData = this._prevSourceCount > 0;
            return;
        }

        const invDt = 1.0 / dt;
        const minCount = Math.min(this.sourceCount, this._prevSourceCount);

        for (let i = 0; i < minCount; i++) {
            const idx = i * 3;
            this._sourceVelocities[idx]     = (this._sourcePositions[idx]     - this._prevSourcePositions[idx])     * invDt;
            this._sourceVelocities[idx + 1] = (this._sourcePositions[idx + 1] - this._prevSourcePositions[idx + 1]) * invDt;
            this._sourceVelocities[idx + 2] = (this._sourcePositions[idx + 2] - this._prevSourcePositions[idx + 2]) * invDt;
        }

        // New sources (count > prevCount) get zero velocity
        for (let i = minCount * 3; i < this.sourceCount * 3; i++) {
            this._sourceVelocities[i] = 0;
        }

        // Store current as previous for next frame
        for (let i = 0; i < this.sourceCount * 3; i++) {
            this._prevSourcePositions[i] = this._sourcePositions[i];
        }
        this._prevSourceCount = this.sourceCount;
        this._hasVelocityData = true;
    }

    /**
     * Advance the emitter: kill dead particles, spawn new ones, update GPU.
     * @param {number} dt - Delta time in seconds (capped by caller)
     * @param {number} globalTime - Total elapsed time in seconds (monotonic)
     */
    update(dt, globalTime) {
        // 0. Compute source velocities from position deltas (before spawning)
        this._updateSourceVelocities(dt);

        // 1. Kill dead particles
        for (let i = 0; i < this.activeCount; i++) {
            if (globalTime - this._spawnTimeBuffer[i] >= this._lifetimeBuffer[i]) {
                this._kill(i);
                i--;  // Re-check the swapped particle
            }
        }

        // 2. Spawn new particles (only if we have active sources AND spawning is enabled)
        if (this.spawning && this.sourceCount > 0) {
            // Apply progress curve to spawn rate
            const curveMultiplier = evaluateProgressCurve(
                this.config.progressCurve,
                this._progress
            );
            const effectiveRate = this.config.baseSpawnRate * curveMultiplier;

            // Energy drives particle speed/size at spawn time:
            // - If parameterAnimation is set (temperature/turbulence/charge), use it
            // - Otherwise fall back to progressCurve multiplier (backwards compatible)
            const energy = this._energy !== null ? this._energy : curveMultiplier;

            this.spawnAccumulator += effectiveRate * dt;
            while (this.spawnAccumulator >= 1.0 && this.activeCount < this.config.maxParticles) {
                this.spawnAccumulator -= 1.0;
                this._spawnOne(globalTime, energy);
            }
        } else if (!this.spawning) {
            // Draining — don't accumulate
            this.spawnAccumulator = 0;
        } else {
            // No sources — drain accumulator so we don't burst-spawn when sources return
            this.spawnAccumulator = 0;
        }

        // 3. Upload buffers only if particles were spawned or killed
        if (this._dirty) {
            this.geometry.instanceCount = this.activeCount;

            const attrs = this.geometry.attributes;
            const count = this.activeCount;
            this._markDirty(attrs.aSpawnPos, count);
            this._markDirty(attrs.aSpawnVelocity, count);
            this._markDirty(attrs.aSpawnTime, count);
            this._markDirty(attrs.aLifetime, count);
            this._markDirty(attrs.aSize, count);
            this._markDirty(attrs.aRotation, count);
            this._markDirty(attrs.aSeed, count);

            this.mesh.visible = count > 0;
            this._dirty = false;
        }

        // 4. Always update uTime (drives entire GPU simulation)
        this.mesh.material.uniforms.uTime.value = globalTime;
    }

    /**
     * Mark a buffer attribute dirty — full upload (no partial range).
     */
    _markDirty(attr, instanceCount) {
        if (!attr) return;
        attr.needsUpdate = true;
    }

    /**
     * Spawn burst particles instantly (for dramatic gesture onsets).
     * @param {number} count - Number of particles to spawn
     * @param {number} globalTime - Current time
     */
    burstSpawn(count, globalTime) {
        if (this.sourceCount === 0) return;
        for (let i = 0; i < count && this.activeCount < this.config.maxParticles; i++) {
            this._spawnOne(globalTime, 1.0);
        }
    }

    /**
     * Spawn one particle at a random active source element position.
     *
     * Physics pipeline:
     *   1. Base velocity from preset (directionY, spreadXZ, radial kick)
     *   2. + velocity inheritance (source element motion * inheritance factor)
     *   3. + centrifugal kick (outward from source center, for spinning gestures)
     *
     * @param {number} globalTime - Current monotonic time
     * @param {number} energy - Progress curve multiplier (0→1). Modulates speed
     *   and size at spawn time so particles born during high-energy gesture moments
     *   fly faster/further than those born during calm moments.
     *   Floor of 0.3 ensures particles always have some momentum.
     *   'sustain' curve = always 1.0 = no change (backwards compatible).
     */
    _spawnOne(globalTime, energy = 1.0) {
        const cfg = this.config;
        const idx = this.activeCount;

        // Energy modulation: progress curve scales speed and size at spawn time
        // Floor of 0.3 ensures particles always drift even at lowest energy
        const energyScale = 0.3 + 0.7 * energy;

        // Pick random source position
        const srcIdx = Math.floor(Math.random() * this.sourceCount);
        const sx = this._sourcePositions[srcIdx * 3];
        const sy = this._sourcePositions[srcIdx * 3 + 1];
        const sz = this._sourcePositions[srcIdx * 3 + 2];

        const baseSpeed = cfg.initialSpeedMin + Math.random() * (cfg.initialSpeedMax - cfg.initialSpeedMin);
        const speed = baseSpeed * energyScale;
        const radius = cfg.spawnRadius || 0;
        let offsetX = 0, offsetZ = 0;
        let radialVx = 0, radialVz = 0;

        if (radius > 0) {
            // Distribute on a random disk around the source (sqrt for uniform area)
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            offsetX = cosA * r;
            offsetZ = sinA * r;
            // Radial outward velocity kick — spray flings away from source
            radialVx = cosA * speed * 0.5;
            radialVz = sinA * speed * 0.5;
        }

        // Spawn position: source + radial offset + small jitter + configured Y offset
        this._spawnPosBuffer[idx * 3]     = sx + offsetX + (Math.random() - 0.5) * 0.05;
        this._spawnPosBuffer[idx * 3 + 1] = sy + (cfg.spawnOffsetY ?? 0);
        this._spawnPosBuffer[idx * 3 + 2] = sz + offsetZ + (Math.random() - 0.5) * 0.05;

        // Initial velocity: upward + radial outward + random lateral spread
        let vx = radialVx + (Math.random() - 0.5) * cfg.spreadXZ;
        let vy = speed * (cfg.directionY ?? 1.0);
        let vz = radialVz + (Math.random() - 0.5) * cfg.spreadXZ;

        // ── Velocity inheritance: particles inherit source element motion ──
        // Helps axis-travel (helix rising), orbit (barrage orbiting), drift gestures.
        // Source velocity computed from frame-to-frame position delta in _updateSourceVelocities().
        const inheritance = cfg.velocityInheritance || 0;
        if (inheritance > 0 && this._hasVelocityData) {
            vx += this._sourceVelocities[srcIdx * 3]     * inheritance;
            vy += this._sourceVelocities[srcIdx * 3 + 1] * inheritance;
            vz += this._sourceVelocities[srcIdx * 3 + 2] * inheritance;
        }

        // ── Centrifugal emission: outward radial kick for spinning gestures ──
        // For rings rotating around their center, the element origin is stationary
        // but particles should fling outward as if thrown from the spinning surface.
        // The offset from source center (from spawnRadius) gives the radial direction.
        const {centrifugal} = cfg;
        if (centrifugal && (offsetX !== 0 || offsetZ !== 0)) {
            const dist = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
            if (dist > 0.01) {
                const outSpeed = centrifugal.speed * energyScale;
                // Radial outward component
                const radialFrac = 1.0 - (centrifugal.tangentialBias || 0);
                vx += (offsetX / dist) * outSpeed * radialFrac;
                vz += (offsetZ / dist) * outSpeed * radialFrac;
                // Tangential component (perpendicular to radial in XZ plane)
                const tangFrac = centrifugal.tangentialBias || 0;
                if (tangFrac > 0) {
                    // Tangent = 90° rotation of radial direction
                    vx += (-offsetZ / dist) * outSpeed * tangFrac;
                    vz += (offsetX / dist) * outSpeed * tangFrac;
                }
            }
        }

        this._spawnVelBuffer[idx * 3]     = vx;
        this._spawnVelBuffer[idx * 3 + 1] = vy;
        this._spawnVelBuffer[idx * 3 + 2] = vz;

        // Timing
        this._spawnTimeBuffer[idx] = globalTime;
        this._lifetimeBuffer[idx]  = cfg.lifetimeMin + Math.random() * (cfg.lifetimeMax - cfg.lifetimeMin);

        // Visual randomization — size also scales with energy (subtler: 0.7 floor)
        const sizeScale = 0.7 + 0.3 * energy;
        this._sizeBuffer[idx]     = (cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)) * sizeScale;
        this._rotationBuffer[idx] = Math.random() * Math.PI * 2;
        this._seedBuffer[idx]     = Math.random();

        this.activeCount++;
        this._dirty = true;
    }

    /**
     * Kill particle at index by swap-removing with last active particle.
     * O(1) removal — copies last particle's data into the dead slot.
     */
    _kill(index) {
        const last = this.activeCount - 1;
        if (index !== last) {
            this._spawnPosBuffer[index * 3]     = this._spawnPosBuffer[last * 3];
            this._spawnPosBuffer[index * 3 + 1] = this._spawnPosBuffer[last * 3 + 1];
            this._spawnPosBuffer[index * 3 + 2] = this._spawnPosBuffer[last * 3 + 2];

            this._spawnVelBuffer[index * 3]     = this._spawnVelBuffer[last * 3];
            this._spawnVelBuffer[index * 3 + 1] = this._spawnVelBuffer[last * 3 + 1];
            this._spawnVelBuffer[index * 3 + 2] = this._spawnVelBuffer[last * 3 + 2];

            this._spawnTimeBuffer[index] = this._spawnTimeBuffer[last];
            this._lifetimeBuffer[index]  = this._lifetimeBuffer[last];
            this._sizeBuffer[index]      = this._sizeBuffer[last];
            this._rotationBuffer[index]  = this._rotationBuffer[last];
            this._seedBuffer[index]      = this._seedBuffer[last];
        }

        this.activeCount--;
        this._dirty = true;
    }

    /**
     * Check if emitter is fully drained (stopped spawning + no active particles).
     */
    isDead() {
        return !this.spawning && this.activeCount === 0;
    }

    dispose() {
        this.mesh.visible = false;
        this.geometry.instanceCount = 0;
        this.geometry.dispose();
        this.mesh.material.dispose();
        this.activeCount = 0;
        this.spawning = false;
    }
}

// =================================================================================================
// PARTICLE ATMOSPHERICS MANAGER
// =================================================================================================

export class ParticleAtmosphericsManager {
    /**
     * @param {THREE.Scene} scene - Main Three.js scene (particles added directly)
     * @param {THREE.Camera} camera - Used for billboard orientation (via viewMatrix)
     */
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this._elapsedTime = 0;

        // Per element type: array of active emitters (one per atmospheric layer)
        // elementType -> ParticleEmitter[]
        this._activeEmitters = new Map();

        // Temp buffer for filtered source positions
        this._filteredPositions = new Float32Array(MAX_SOURCE_POSITIONS * 3);
    }

    /**
     * Start atmospheric emitters for a gesture layer.
     * ADDITIVE: appends emitters to existing ones for this element type.
     * Call forceStopGesture() first to clear previous gesture's emitters on interruption.
     *
     * This design supports multi-layer gestures (e.g., icepillar with 3 layers),
     * where each layer's animation may define its own atmospherics array.
     *
     * @param {string} elementType - 'fire', 'ice', etc.
     * @param {Object[]} layerConfigs - Array of atmospheric layer configs from gesture animation
     */
    startGesture(elementType, layerConfigs) {
        if (!layerConfigs || !Array.isArray(layerConfigs) || layerConfigs.length === 0) return;

        // Get or create emitter array for this element type (additive)
        if (!this._activeEmitters.has(elementType)) {
            this._activeEmitters.set(elementType, []);
        }
        const emitters = this._activeEmitters.get(elementType);

        for (const layerConfig of layerConfigs) {
            const resolvedConfig = resolveLayerConfig(layerConfig);
            const emitter = new ParticleEmitter(resolvedConfig);
            this.scene.add(emitter.mesh);
            emitters.push(emitter);
        }
    }

    /**
     * Stop spawning for a gesture's emitters (graceful drain).
     * Existing particles continue their lifecycle and fade naturally.
     * Emitters are cleaned up once all particles are dead.
     * Use for triggerExit() — smooth visual transition.
     *
     * @param {string} elementType - Element type to stop
     */
    stopGesture(elementType) {
        const emitters = this._activeEmitters.get(elementType);
        if (!emitters) return;

        for (const emitter of emitters) {
            emitter.spawning = false;
        }
    }

    /**
     * Force-stop and immediately dispose all emitters for an element type.
     * Removes meshes from scene, disposes materials, frees all memory.
     * Use for gesture INTERRUPTION — old particles are irrelevant when
     * a completely new gesture is starting.
     *
     * @param {string} elementType - Element type to force-stop
     */
    forceStopGesture(elementType) {
        const emitters = this._activeEmitters.get(elementType);
        if (!emitters) return;

        for (const emitter of emitters) {
            this.scene.remove(emitter.mesh);
            emitter.dispose();
        }
        this._activeEmitters.delete(elementType);
    }

    /**
     * Feed active element positions to emitters, filtered by targetModels.
     * Called each frame from ElementInstancedSpawner sync loop.
     *
     * Positions in activeElements are in container-local space (unscaled geometry
     * coordinates). The container applies the mascot's position, rotation, and scale.
     * Since particle meshes live directly in the scene (world space), we must transform
     * each position through the container's world matrix.
     *
     * @param {string} elementType - Element type
     * @param {Map} activeElements - Full activeElements map from spawner
     * @param {THREE.Object3D} container - The spawner's container group (has mascot transform)
     */
    syncSources(elementType, activeElements, container) {
        const emitters = this._activeEmitters.get(elementType);
        if (!emitters) return;

        for (const emitter of emitters) {
            const {targetModels} = emitter.config;
            let count = 0;

            for (const [, data] of activeElements) {
                if (data.type !== elementType) continue;
                if (count >= MAX_SOURCE_POSITIONS) break;

                // Filter by target models if specified
                if (targetModels && !targetModels.includes(data.modelName)) continue;

                // Transform from container-local to world space via container's world matrix
                // This accounts for mascot position, rotation, AND scale
                _tempVec3.copy(data.position);
                if (container) {
                    container.localToWorld(_tempVec3);
                }
                this._filteredPositions[count * 3]     = _tempVec3.x;
                this._filteredPositions[count * 3 + 1] = _tempVec3.y;
                this._filteredPositions[count * 3 + 2] = _tempVec3.z;
                count++;
            }

            emitter.setSourcePositions(this._filteredPositions, count);
        }
    }

    /**
     * Update gesture progress for progress curve modulation.
     *
     * @param {string} elementType - Element type
     * @param {number|null} progress - Gesture progress 0→1
     */
    setGestureProgress(elementType, progress) {
        const emitters = this._activeEmitters.get(elementType);
        if (!emitters || progress === null) return;

        for (const emitter of emitters) {
            // Fire burst on first frame that has sources (burst hasn't fired yet)
            if (emitter.config.burstCount > 0 && emitter._progress === 0 && progress > 0) {
                emitter.burstSpawn(emitter.config.burstCount, this._elapsedTime);
                // Burst is a one-shot event — stop sustained spawning immediately.
                // Particles live their natural lifetime and arc/fade, but no trickle.
                emitter.spawning = false;
            }
            emitter._progress = progress;
        }
    }

    /**
     * Set the energy level for atmospheric particles of an element type.
     * Energy comes from the gesture's parameterAnimation (temperature, turbulence, charge)
     * evaluated at the current gestureProgress. Drives particle speed and size at spawn time.
     *
     * @param {string} elementType - Element type
     * @param {number} energy - Energy value (typically 0→1, from parameterAnimation)
     */
    setEnergy(elementType, energy) {
        const emitters = this._activeEmitters.get(elementType);
        if (!emitters) return;

        for (const emitter of emitters) {
            emitter._energy = energy;
        }
    }

    /**
     * Advance all emitters. Called each frame from ThreeRenderer.
     * @param {number} deltaTime - Seconds since last frame
     */
    update(deltaTime) {
        const dt = Math.min(deltaTime, MAX_DT);
        this._elapsedTime += dt;

        // Update all emitters across all element types
        for (const [elementType, emitters] of this._activeEmitters) {
            for (let i = emitters.length - 1; i >= 0; i--) {
                const emitter = emitters[i];
                emitter.update(dt, this._elapsedTime);

                // Clean up dead emitters (stopped + no active particles)
                if (emitter.isDead()) {
                    this.scene.remove(emitter.mesh);
                    emitter.dispose();
                    emitters.splice(i, 1);
                }
            }

            // Clean up empty emitter arrays
            if (emitters.length === 0) {
                this._activeEmitters.delete(elementType);
            }
        }
    }

    /**
     * Check if any emitter has active particles or is still spawning.
     */
    hasActiveSources() {
        for (const [, emitters] of this._activeEmitters) {
            for (const emitter of emitters) {
                if (emitter.activeCount > 0 || (emitter.spawning && emitter.sourceCount > 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    dispose() {
        for (const [, emitters] of this._activeEmitters) {
            for (const emitter of emitters) {
                this.scene.remove(emitter.mesh);
                emitter.dispose();
            }
        }
        this._activeEmitters.clear();
    }
}
