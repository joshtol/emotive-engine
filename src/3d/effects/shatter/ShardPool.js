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
            originalQuaternion: new THREE.Quaternion(),  // For slerp during reassembly
            originalScale: new THREE.Vector3(1, 1, 1),  // Original mesh scale
            // LOCAL-SPACE centroid - used to compute dynamic target during reassembly
            // This allows shards to track the mesh even if it moves during reassembly
            localCentroid: new THREE.Vector3(),
            // Impact glow state
            impactGlow: 1.0,          // Initial glow intensity (fades over time)
            baseEmissiveIntensity: 0.5, // Base emissive for shards
            // Reassembly state
            reassemblyStartPos: new THREE.Vector3(),
            reassemblyStartRot: new THREE.Euler(),
            reassemblyStartQuat: new THREE.Quaternion(),  // For slerp during reassembly
            reassemblyStartScale: new THREE.Vector3(1, 1, 1),
            // Depth-based timing for reassembly (front shards arrive first)
            depthFactor: 0,           // 0 = front, 1 = back (normalized z-depth)
            vortexPhase: 0,           // Random phase for spiral motion
            // Suspend mode state
            isSuspendMode: false,
            suspendProgress: 0,           // 0 = exploding, 1 = fully suspended
            floatPhase: Math.random() * Math.PI * 2,  // Random phase for gentle bobbing
            // Dual-mode state (implode, dissolve, ripple, gravity, orbit)
            dualMode: null,
            // Implode mode
            implodeStartPos: new THREE.Vector3(),
            // Dissolve mode
            dissolveVelocity: new THREE.Vector3(),
            dissolveOpacity: 1.0,
            // Ripple mode
            rippleDelay: 0,               // Delay before this shard peels off
            ripplePhase: 0,
            // Gravity mode
            gravityVelocity: new THREE.Vector3(),
            bounceCount: 0,
            onFloor: false,
            // Orbit mode
            orbitRadius: 0,
            orbitAngle: 0,
            orbitSpeed: 0,
            orbitHeight: 0,
            orbitTilt: 0
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
            meshQuaternion = new THREE.Quaternion(),
            meshScale = new THREE.Vector3(1, 1, 1),
            // Suspend mode: explode then freeze mid-air
            isSuspendMode = false
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

            // Transform centroid to world space (apply scale, rotation, then translation)
            const worldCentroid = localCentroid.clone();
            worldCentroid.multiply(meshScale);  // Scale first
            worldCentroid.applyQuaternion(meshQuaternion);
            worldCentroid.add(meshPosition);

            // Position shard at world centroid
            shard.position.copy(worldCentroid);
            shard.quaternion.copy(meshQuaternion);

            // Apply mesh scale to shard so geometry matches original mesh size
            shard.scale.copy(meshScale);

            // Store original transforms for reassembly
            shard.userData.state.originalPosition.copy(worldCentroid);
            shard.userData.state.originalRotation.copy(shard.rotation);
            shard.userData.state.originalQuaternion.copy(shard.quaternion);
            shard.userData.state.originalScale.copy(meshScale);
            // Store LOCAL-SPACE centroid for dynamic target computation during reassembly
            // This allows shards to track mesh movement (breathing, wobble, etc.)
            shard.userData.state.localCentroid.copy(localCentroid);

            // Store depth factor for staggered reassembly (higher z = front = arrives first)
            // We'll normalize this after all shards are processed
            shard.userData.state.depthFactor = localCentroid.z;

            // Random vortex phase for spiral motion during reassembly
            shard.userData.state.vortexPhase = Math.random() * Math.PI * 2;

            // ═══════════════════════════════════════════════════════════════
            // Calculate ejection velocity with directional bias
            // ═══════════════════════════════════════════════════════════════
            const ejectionDir = worldCentroid.clone().sub(impactPoint);
            const distFromImpact = ejectionDir.length();
            ejectionDir.normalize();

            // Force falls off with distance but has minimum
            const forceFalloff = Math.max(0.3, 1 / (1 + distFromImpact * 2));
            const force = explosionForce * forceFalloff;

            // DIRECTIONAL BIAS - Shards fly more in impact direction
            // Blend between radial explosion and directional (impact direction)
            // Shards closest to impact follow direction more, far shards are radial
            const directionalBias = Math.max(0.2, 1 - distFromImpact * 3);
            ejectionDir.lerp(impactDirection, directionalBias * 0.6);
            ejectionDir.normalize();

            // Add some randomness to ejection direction
            ejectionDir.x += (Math.random() - 0.5) * 0.3;
            ejectionDir.y += (Math.random() - 0.5) * 0.3 + 0.15; // Slight upward bias
            ejectionDir.z += (Math.random() - 0.5) * 0.3;
            ejectionDir.normalize();

            shard.userData.state.velocity
                .copy(ejectionDir)
                .multiplyScalar(force)
                .add(inheritVelocity);

            // Angular velocity with directional bias
            // Shards near impact spin around an axis perpendicular to impact direction
            const perpAxis = new THREE.Vector3()
                .crossVectors(impactDirection, new THREE.Vector3(0, 1, 0))
                .normalize();

            // Random spin plus directional tumble
            const spinBias = directionalBias * 0.5;
            shard.userData.state.angularVelocity.set(
                (Math.random() - 0.5) * rotationForce + perpAxis.x * spinBias * rotationForce,
                (Math.random() - 0.5) * rotationForce + perpAxis.y * spinBias * rotationForce,
                (Math.random() - 0.5) * rotationForce + perpAxis.z * spinBias * rotationForce
            );

            // Reset lifetime
            shard.userData.state.lifetime = 0;
            shard.userData.state.maxLifetime = lifetime + (Math.random() - 0.5) * lifetime * 0.3;
            shard.userData.state.opacity = 1;
            shard.userData.state.gravity = gravity;

            // Reset impact glow - bright flash at start
            shard.userData.state.impactGlow = 1.0;
            shard.userData.state.baseEmissiveIntensity = 0.5;

            // Suspend mode state
            shard.userData.state.isSuspendMode = isSuspendMode;
            shard.userData.state.suspendProgress = 0;
            shard.userData.state.floatPhase = Math.random() * Math.PI * 2;

            // Show shard with initial glow
            shard.visible = true;
            shard.material.opacity = 0.9;
            shard.material.emissiveIntensity = 1.5; // Bright flash on impact

            this.active.push(shard);
            activatedShards.push(shard);
        }

        // ═══════════════════════════════════════════════════════════════
        // Normalize depth factors for staggered reassembly timing
        // Front shards (high z) get depthFactor=0, back shards get depthFactor=1
        // ═══════════════════════════════════════════════════════════════
        if (activatedShards.length > 1) {
            let minDepth = Infinity, maxDepth = -Infinity;
            for (const shard of activatedShards) {
                const depth = shard.userData.state.depthFactor;
                minDepth = Math.min(minDepth, depth);
                maxDepth = Math.max(maxDepth, depth);
            }
            const depthRange = maxDepth - minDepth;
            if (depthRange > 0.001) {
                for (const shard of activatedShards) {
                    // Invert so high z (front) = 0, low z (back) = 1
                    shard.userData.state.depthFactor =
                        1 - (shard.userData.state.depthFactor - minDepth) / depthRange;
                }
            }
        }

        return activatedShards.length;
    }

    /**
     * Update all active shards
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        const time = performance.now() / 1000; // For float animation

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

            // ═══════════════════════════════════════════════════════════════
            // SUSPEND MODE - Decelerate, float, then reassemble
            // ═══════════════════════════════════════════════════════════════
            if (state.isSuspendMode) {
                // suspendProgress: 0 = normal physics, 1 = fully frozen/floating
                const sp = state.suspendProgress;

                // Blend gravity: full → zero as suspend progresses
                const effectiveGravity = state.gravity * (1 - sp);

                // Apply blended gravity
                state.velocity.y += effectiveGravity * dt;

                // Strong deceleration during suspend transition
                // At sp=0: normal air resistance (0.995)
                // At sp=1: heavy damping (0.85) to freeze quickly
                const dampingFactor = 0.995 - sp * 0.145; // 0.995 → 0.85
                state.velocity.multiplyScalar(dampingFactor);
                state.angularVelocity.multiplyScalar(dampingFactor);

                // Update position with velocity
                shard.position.addScaledVector(state.velocity, dt);

                // Add gentle floating motion when suspended
                if (sp > 0.5) {
                    const floatStrength = (sp - 0.5) * 2; // 0 → 1 in second half
                    const bobSpeed = 0.8;
                    const bobAmount = 0.003 * floatStrength;
                    const driftAmount = 0.001 * floatStrength;

                    // Gentle vertical bob
                    shard.position.y += Math.sin(time * bobSpeed + state.floatPhase) * bobAmount;
                    // Subtle horizontal drift
                    shard.position.x += Math.sin(time * bobSpeed * 0.7 + state.floatPhase * 1.3) * driftAmount;
                    shard.position.z += Math.cos(time * bobSpeed * 0.5 + state.floatPhase * 0.7) * driftAmount;
                }

                // Update rotation (slows down as suspended)
                shard.rotation.x += state.angularVelocity.x * dt;
                shard.rotation.y += state.angularVelocity.y * dt;
                shard.rotation.z += state.angularVelocity.z * dt;
            }
            // ═══════════════════════════════════════════════════════════════
            // STANDARD PHYSICS
            // ═══════════════════════════════════════════════════════════════
            else {
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
            }

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

            // Fade out opacity in last 30% (but NOT in suspend mode - shards stay visible for reassembly)
            if (progress > 0.7 && !state.isSuspendMode) {
                state.opacity = 1 - ((progress - 0.7) / 0.3);
                shard.material.opacity = state.opacity * 0.9; // Max 0.9 for glass effect
            }

            // Scale down slightly at end (but NOT in suspend mode - shards stay full size for reassembly)
            if (progress > 0.8 && !state.isSuspendMode) {
                const scale = 1 - ((progress - 0.8) / 0.2) * 0.5;
                // Preserve original mesh scale while applying shrink factor
                shard.scale.copy(state.originalScale).multiplyScalar(scale);
            }
        }
    }

    /**
     * Deactivate a single shard and return to pool
     * @private
     */
    _deactivateShard(shard, activeIndex) {
        shard.visible = false;
        shard.scale.set(1, 1, 1);
        this.active.splice(activeIndex, 1);
        this.pool.push(shard);
    }

    /**
     * Capture current shard positions for reassembly animation start
     */
    captureCurrentPositions() {
        for (const shard of this.active) {
            const { state } = shard.userData;
            state.reassemblyStartPos.copy(shard.position);
            state.reassemblyStartRot.copy(shard.rotation);
            state.reassemblyStartQuat.copy(shard.quaternion);
            state.reassemblyStartScale.copy(shard.scale);
        }
    }

    /**
     * Update shards during reassembly - lerp back to original positions
     * Enhanced with: depth-based timing, vortex motion, rotation acceleration, multi-stage glow
     * @param {number} progress - Eased progress (0-1)
     * @param {Object} meshTransform - Current mesh transform for dynamic target computation
     * @param {THREE.Vector3} meshTransform.position - Current mesh world position
     * @param {THREE.Quaternion} meshTransform.quaternion - Current mesh world rotation
     * @param {THREE.Vector3} meshTransform.scale - Current mesh scale
     */
    updateReassembly(progress, meshTransform = null) {
        const time = performance.now() / 1000;

        for (const shard of this.active) {
            const { state } = shard.userData;

            // ═══════════════════════════════════════════════════════════════
            // DYNAMIC TARGET POSITION - Track mesh movement during reassembly
            // If meshTransform is provided, compute target from local centroid
            // This prevents the "snap" when mesh has moved due to breathing/wobble
            // ═══════════════════════════════════════════════════════════════
            let targetPosition;
            let targetQuaternion;
            let targetScale;

            if (meshTransform && state.localCentroid) {
                // Compute dynamic world position from local centroid + current mesh transform
                // Use CURRENT position/rotation so shards track mesh movement (breathing, wobble)
                // But use ORIGINAL scale so shards don't snap when mesh scale fluctuates
                targetPosition = state.localCentroid.clone();
                targetPosition.multiply(meshTransform.scale);  // Use current scale for position calc
                targetPosition.applyQuaternion(meshTransform.quaternion);
                targetPosition.add(meshTransform.position);
                targetQuaternion = meshTransform.quaternion;
                // IMPORTANT: Use original scale, not current mesh scale
                // Mesh scale fluctuates with breathing/wobble, but shards should converge
                // to the base mesh scale to avoid a snap at completion
                targetScale = state.originalScale;
            } else {
                // Fallback to static original position (old behavior)
                targetPosition = state.originalPosition;
                targetQuaternion = state.originalQuaternion;
                targetScale = state.originalScale;
            }

            // ═══════════════════════════════════════════════════════════════
            // DEPTH-BASED TIMING - Front shards arrive first
            // depthFactor: 0 = front (arrives at progress=0.3), 1 = back (arrives at progress=1.0)
            // ═══════════════════════════════════════════════════════════════
            const depthDelay = state.depthFactor * 0.3; // Back shards delayed by up to 30%
            const adjustedProgress = Math.max(0, (progress - depthDelay) / (1 - depthDelay));
            const clampedProgress = Math.min(1, adjustedProgress);

            // ═══════════════════════════════════════════════════════════════
            // VORTEX/SPIRAL MOTION - Curved paths during approach
            // Shards spiral inward rather than moving in straight lines
            // ═══════════════════════════════════════════════════════════════
            // Base position lerp
            const basePos = new THREE.Vector3().lerpVectors(
                state.reassemblyStartPos,
                targetPosition,
                clampedProgress
            );

            // Add spiral offset that diminishes as shard approaches target
            // Spiral is strongest in the middle of the animation (0.3-0.7)
            const spiralStrength = Math.sin(clampedProgress * Math.PI) * 0.15;
            const spiralAngle = state.vortexPhase + clampedProgress * Math.PI * 2;
            const spiralRadius = spiralStrength * (1 - clampedProgress);

            // Calculate spiral offset perpendicular to movement direction
            const moveDir = new THREE.Vector3().subVectors(
                targetPosition,
                state.reassemblyStartPos
            ).normalize();

            // Create perpendicular vectors for spiral plane
            const up = new THREE.Vector3(0, 1, 0);
            const perpX = new THREE.Vector3().crossVectors(moveDir, up).normalize();
            const perpY = new THREE.Vector3().crossVectors(perpX, moveDir).normalize();

            // Apply spiral offset
            basePos.addScaledVector(perpX, Math.cos(spiralAngle) * spiralRadius);
            basePos.addScaledVector(perpY, Math.sin(spiralAngle) * spiralRadius);

            shard.position.copy(basePos);

            // ═══════════════════════════════════════════════════════════════
            // ROTATION - Smooth slerp back to original orientation
            // ═══════════════════════════════════════════════════════════════
            const currentQuat = new THREE.Quaternion();
            currentQuat.slerpQuaternions(state.reassemblyStartQuat, targetQuaternion, clampedProgress);
            shard.quaternion.copy(currentQuat);

            // Lerp scale back to original mesh scale
            shard.scale.lerpVectors(state.reassemblyStartScale, targetScale, clampedProgress);

            // ═══════════════════════════════════════════════════════════════
            // MULTI-STAGE GLOW CURVES
            // Phase 1 (0-30%): Shimmer - subtle pulsing glow
            // Phase 2 (30-70%): Crescendo - building intensity
            // Phase 3 (70-95%): Flash - bright convergence glow
            // Phase 4 (95-100%): Cooldown - brief flash then settle
            // ═══════════════════════════════════════════════════════════════
            let glowIntensity;

            if (clampedProgress < 0.3) {
                // Phase 1: Shimmer - subtle pulsing
                const shimmerPhase = time * 8 + state.vortexPhase;
                const shimmer = 0.5 + Math.sin(shimmerPhase) * 0.15;
                glowIntensity = 0.3 + shimmer * clampedProgress;
            } else if (clampedProgress < 0.7) {
                // Phase 2: Crescendo - building intensity with pulsing
                const buildProgress = (clampedProgress - 0.3) / 0.4;
                const pulse = Math.sin(time * 12 + state.vortexPhase) * 0.1 * (1 - buildProgress);
                glowIntensity = 0.5 + buildProgress * 0.8 + pulse;
            } else if (clampedProgress < 0.95) {
                // Phase 3: Flash - bright convergence glow
                const flashProgress = (clampedProgress - 0.7) / 0.25;
                const flashEased = flashProgress * flashProgress; // Ease-in
                glowIntensity = 1.3 + flashEased * 1.2;
            } else {
                // Phase 4: Cooldown - brief bright flash then rapid settle
                const coolProgress = (clampedProgress - 0.95) / 0.05;
                glowIntensity = 2.5 - coolProgress * 1.5; // 2.5 → 1.0
            }

            shard.material.emissiveIntensity = glowIntensity;

            // Fade opacity back to full with depth-based variation
            const opacityBase = 0.7 + clampedProgress * 0.2;
            shard.material.opacity = Math.min(0.9, opacityBase);
        }
    }

    /**
     * Update suspend progress for all active shards
     * @param {number} progress - Suspend progress (0 = exploding, 1 = fully suspended)
     */
    updateSuspendProgress(progress) {
        for (const shard of this.active) {
            shard.userData.state.suspendProgress = progress;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DUAL-MODE INITIALIZATION METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Initialize implode mode - shards will fly inward to center
     * @param {Object} config - { speed, spiral }
     */
    initImplodeMode(config = {}) {
        for (const shard of this.active) {
            const { state } = shard.userData;
            state.dualMode = 'implode';
            state.implodeStartPos.copy(shard.position);
            // Random spiral phase for varied approach
            state.vortexPhase = Math.random() * Math.PI * 2;
        }
    }

    /**
     * Initialize dissolve mode - shards will blow away like dust
     * @param {Object} config - { windDirection, windForce, turbulence }
     */
    initDissolveMode(config = {}) {
        const windDir = config.windDirection || [1, 0.2, 0];
        const windForce = config.windForce || 2.0;
        const turbulence = config.turbulence || 0.5;

        for (const shard of this.active) {
            const { state } = shard.userData;
            state.dualMode = 'dissolve';
            state.dissolveOpacity = 1.0;

            // Set wind velocity with turbulence variation
            state.dissolveVelocity.set(
                windDir[0] * windForce + (Math.random() - 0.5) * turbulence,
                windDir[1] * windForce + (Math.random() - 0.5) * turbulence,
                windDir[2] * windForce + (Math.random() - 0.5) * turbulence
            );

            // Random float phase for dusty bobbing
            state.floatPhase = Math.random() * Math.PI * 2;
        }
    }


    /**
     * Initialize gravity mode - shards will fall and bounce
     * @param {Object} config - { gravity, bounciness, floorY }
     */
    initGravityMode(config = {}) {
        const gravity = config.gravity || -15.0;

        for (const shard of this.active) {
            const { state } = shard.userData;
            state.dualMode = 'gravity';
            state.gravity = gravity;
            state.gravityVelocity.set(
                (Math.random() - 0.5) * 0.5, // Small horizontal scatter
                0,
                (Math.random() - 0.5) * 0.5
            );
            state.bounceCount = 0;
            state.onFloor = false;
        }
    }

    /**
     * Initialize orbit mode - shards will orbit around center
     * @param {Object} config - { orbitSpeed, radiusMultiplier }
     */
    initOrbitMode(config = {}) {
        const orbitSpeed = config.orbitSpeed || 1.0;
        const radiusMultiplier = config.radiusMultiplier || 1.0;

        // Calculate center (will be updated in updateOrbit)
        const center = new THREE.Vector3();

        for (const shard of this.active) {
            const { state } = shard.userData;
            state.dualMode = 'orbit';

            // Current distance from center becomes orbit radius
            const offset = shard.position.clone().sub(center);
            state.orbitRadius = offset.length() * radiusMultiplier;

            // Initial angle based on current position
            state.orbitAngle = Math.atan2(offset.x, offset.z);

            // Height relative to center
            state.orbitHeight = offset.y;

            // Speed with slight variation
            state.orbitSpeed = orbitSpeed * (0.8 + Math.random() * 0.4);

            // Random tilt for 3D orbits
            state.orbitTilt = (Math.random() - 0.5) * 0.3;
        }
    }

    /**
     * Apply impulse force to all active shards - used for punching frozen shards
     * @param {number[]} direction - Direction vector [x, y, z]
     * @param {number} force - Force multiplier
     * @param {number} spread - Random spread factor (0-1)
     */
    applyImpulse(direction, force = 3.0, spread = 0.4) {
        for (const shard of this.active) {
            const { state } = shard.userData;

            // Add impulse to existing velocity
            const impulse = new THREE.Vector3(
                direction[0] * force + (Math.random() - 0.5) * spread * force,
                direction[1] * force + (Math.random() - 0.5) * spread * force + 0.3, // Slight upward
                direction[2] * force + (Math.random() - 0.5) * spread * force
            );

            state.velocity.add(impulse);

            // Add some extra spin
            state.angularVelocity.x += (Math.random() - 0.5) * 6;
            state.angularVelocity.y += (Math.random() - 0.5) * 6;
            state.angularVelocity.z += (Math.random() - 0.5) * 6;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DUAL-MODE UPDATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Update implode mode - shards fly inward to center point
     * @param {number} deltaTime - Time since last frame in ms
     * @param {number} progress - Animation progress (0-1)
     * @param {THREE.Vector3} centerPoint - Target center for implosion
     */
    updateImplode(deltaTime, progress, centerPoint) {
        const dt = deltaTime / 1000;

        // Eased progress - slow start, fast end (opposite of explosion)
        const eased = progress * progress * progress; // Ease-in cubic

        for (const shard of this.active) {
            const { state } = shard.userData;
            if (state.dualMode !== 'implode') continue;

            // Lerp from start position to center with spiral
            const basePos = new THREE.Vector3().lerpVectors(
                state.implodeStartPos,
                centerPoint,
                eased
            );

            // Add spiral motion (diminishes as approaching center)
            const spiralRadius = (1 - eased) * 0.15;
            const spiralAngle = state.vortexPhase + progress * Math.PI * 4;
            basePos.x += Math.cos(spiralAngle) * spiralRadius;
            basePos.z += Math.sin(spiralAngle) * spiralRadius;

            shard.position.copy(basePos);

            // Spin faster as approaching center
            const spinMultiplier = 1 + eased * 5;
            shard.rotation.x += dt * spinMultiplier * 2;
            shard.rotation.y += dt * spinMultiplier * 3;

            // Shrink and glow as approaching center
            const scale = Math.max(0.1, 1 - eased * 0.8);
            shard.scale.copy(state.originalScale).multiplyScalar(scale);

            // Glow intensifies on approach
            shard.material.emissiveIntensity = 0.5 + eased * 2.0;
            shard.material.opacity = Math.max(0.3, 1 - eased * 0.5);
        }
    }

    /**
     * Update dissolve mode - shards blow away like dust in wind
     * @param {number} deltaTime - Time since last frame in ms
     * @param {number} progress - Animation progress (0-1)
     * @param {Object} config - { windDirection, turbulence }
     */
    updateDissolve(deltaTime, progress, config = {}) {
        const dt = deltaTime / 1000;
        const time = performance.now() / 1000;
        const turbulence = config.turbulence || 0.5;

        for (const shard of this.active) {
            const { state } = shard.userData;
            if (state.dualMode !== 'dissolve') continue;

            // Apply wind velocity
            shard.position.add(state.dissolveVelocity.clone().multiplyScalar(dt));

            // Add turbulent wobble (like dust in wind)
            const wobbleX = Math.sin(time * 3 + state.floatPhase) * turbulence * 0.02;
            const wobbleY = Math.sin(time * 2 + state.floatPhase * 1.5) * turbulence * 0.01;
            const wobbleZ = Math.cos(time * 2.5 + state.floatPhase * 0.8) * turbulence * 0.02;
            shard.position.x += wobbleX;
            shard.position.y += wobbleY;
            shard.position.z += wobbleZ;

            // Gentle tumble
            shard.rotation.x += dt * 0.5;
            shard.rotation.y += dt * 0.8;

            // Shrink and fade (like dust particles)
            const shrink = Math.max(0.05, 1 - progress * progress);
            shard.scale.copy(state.originalScale).multiplyScalar(shrink);

            // Fade opacity
            state.dissolveOpacity = Math.max(0, 1 - progress);
            shard.material.opacity = state.dissolveOpacity * 0.9;

            // Dim glow as fading
            shard.material.emissiveIntensity = 0.3 * (1 - progress);
        }
    }


    /**
     * Update gravity bounce mode - shards fall and bounce on floor
     * @param {number} deltaTime - Time since last frame in ms
     * @param {number} progress - Animation progress (0-1)
     * @param {number} floorY - Y position of floor
     */
    updateGravityBounce(deltaTime, progress, floorY = -1.0) {
        const dt = deltaTime / 1000;
        const bounciness = 0.5;
        const maxBounces = 3;

        for (const shard of this.active) {
            const { state } = shard.userData;
            if (state.dualMode !== 'gravity') continue;

            // Apply gravity to velocity
            state.gravityVelocity.y += state.gravity * dt;

            // Update position
            shard.position.add(state.gravityVelocity.clone().multiplyScalar(dt));

            // Floor collision
            if (shard.position.y <= floorY && state.bounceCount < maxBounces) {
                shard.position.y = floorY;
                state.gravityVelocity.y *= -bounciness;
                state.gravityVelocity.x *= 0.8; // Friction
                state.gravityVelocity.z *= 0.8;
                state.bounceCount++;

                // Flash on bounce
                shard.material.emissiveIntensity = 0.8;
            } else if (shard.position.y <= floorY) {
                // Settled on floor
                shard.position.y = floorY;
                state.gravityVelocity.set(0, 0, 0);
                state.onFloor = true;
            }

            // Tumble while falling
            if (!state.onFloor) {
                shard.rotation.x += dt * 3;
                shard.rotation.z += dt * 2;
            }

            // Fade glow over time
            shard.material.emissiveIntensity = Math.max(0.1, shard.material.emissiveIntensity - dt * 0.5);

            // Fade in final phase
            if (progress > 0.7) {
                const fadeProgress = (progress - 0.7) / 0.3;
                shard.material.opacity = Math.max(0.1, 0.9 - fadeProgress * 0.8);
            }
        }
    }

    /**
     * Update orbit mode - shards orbit around center point
     * @param {number} deltaTime - Time since last frame in ms
     * @param {number} progress - Animation progress (0-1)
     * @param {THREE.Vector3} centerPoint - Center of orbit
     * @param {Object} config - { pulseGlow }
     */
    updateOrbit(deltaTime, progress, centerPoint, config = {}) {
        const dt = deltaTime / 1000;
        const time = performance.now() / 1000;

        for (const shard of this.active) {
            const { state } = shard.userData;
            if (state.dualMode !== 'orbit') continue;

            // Update orbit angle
            state.orbitAngle += state.orbitSpeed * dt;

            // Calculate orbit position
            const x = centerPoint.x + Math.sin(state.orbitAngle) * state.orbitRadius;
            const z = centerPoint.z + Math.cos(state.orbitAngle) * state.orbitRadius;

            // Add vertical bob and tilt
            const heightBob = Math.sin(time * 2 + state.floatPhase) * 0.05;
            const y = centerPoint.y + state.orbitHeight + heightBob;

            // Apply tilt (orbit plane isn't flat)
            const tiltOffset = Math.sin(state.orbitAngle + state.orbitTilt) * state.orbitRadius * 0.1;

            shard.position.set(x, y + tiltOffset, z);

            // Face center (always looking inward)
            shard.lookAt(centerPoint);

            // Add gentle roll
            shard.rotation.z += dt * 0.5;

            // Pulsing glow
            const glowPulse = 0.3 + Math.sin(time * 3 + state.floatPhase) * 0.2;
            shard.material.emissiveIntensity = glowPulse;

            // Subtle scale pulse
            const scalePulse = 1 + Math.sin(time * 2 + state.floatPhase) * 0.05;
            shard.scale.copy(state.originalScale).multiplyScalar(scalePulse);
        }
    }

    /**
     * Clear all active shards immediately
     */
    clear() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const shard = this.active[i];
            shard.visible = false;
            shard.scale.set(1, 1, 1);
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
