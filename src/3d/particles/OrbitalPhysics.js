/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbital Physics for 3D Particles
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Simulates orbital mechanics for particles around rotating mascot
 * @author Emotive Engine Team
 * @module 3d/particles/OrbitalPhysics
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Makes particles behave like orbiting bodies when mascot rotates:
 * ║ • Inertia: Particles lag behind rotation changes (momentum)
 * ║ • Centrifugal force: Outward push when spinning
 * ║ • Drag: Particles gradually match mascot rotation speed
 * ║ • Local space transforms: Particles rotate with mascot
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * PHYSICS CONCEPTS:
 *
 * 1. REFERENCE FRAMES:
 *    - World Space: Fixed 3D coordinate system
 *    - Mascot Local Space: Rotates with mascot
 *    - Particles need to stay in mascot local space while following physics
 *
 * 2. ANGULAR VELOCITY INHERITANCE:
 *    - Mascot spins at angular velocity ω
 *    - Particles inherit ω with drag: particle_ω = lerp(particle_ω, mascot_ω, drag)
 *
 * 3. CENTRIFUGAL FORCE:
 *    - F_centrifugal = ω × (ω × r)
 *    - Pushes particles outward when spinning fast
 *
 * 4. MOMENTUM CONSERVATION:
 *    - Particles keep moving even when mascot stops
 *    - Gradually dampened by drag
 */

import * as THREE from 'three';

export class OrbitalPhysics {
    constructor(options = {}) {
        // Physics parameters (configurable per emotion)
        this.drag = options.drag !== undefined ? options.drag : 0.85;
        this.inertia = options.inertia !== undefined ? options.inertia : 0.9;
        this.centrifugalStrength = options.centrifugalStrength !== undefined ? options.centrifugalStrength : 1.0;
        this.momentumDamping = options.momentumDamping !== undefined ? options.momentumDamping : 0.97;

        // Temp vectors for calculations (reuse to avoid GC)
        this.tempVec3_1 = new THREE.Vector3();
        this.tempVec3_2 = new THREE.Vector3();
        this.tempVec3_3 = new THREE.Vector3();
        this.tempVec3_4 = new THREE.Vector3(); // For return values
        this.zeroVec = new THREE.Vector3(0, 0, 0); // Reusable zero vector
        this.tempQuaternion = new THREE.Quaternion();
        this.tempEuler = new THREE.Euler();

        // Previous frame state
        this.lastRotation = new THREE.Euler();
        this.lastQuaternion = new THREE.Quaternion();
        this.currentAngularVelocity = new THREE.Vector3();
    }

    /**
     * Update physics configuration (called when emotion changes)
     * @param {Object} config - Physics config {drag, inertia, centrifugalStrength, momentumDamping}
     */
    updateConfig(config = {}) {
        if (config.drag !== undefined) this.drag = config.drag;
        if (config.inertia !== undefined) this.inertia = config.inertia;
        if (config.centrifugalStrength !== undefined) this.centrifugalStrength = config.centrifugalStrength;
        if (config.momentumDamping !== undefined) this.momentumDamping = config.momentumDamping;
    }

    /**
     * Update angular velocity based on mascot rotation change
     * Call this once per frame before processing particles
     *
     * @param {THREE.Euler} currentRotation - Mascot's current rotation
     * @param {THREE.Quaternion} currentQuaternion - Mascot's current quaternion
     * @param {number} deltaTime - Time since last frame (ms)
     */
    updateMascotRotation(currentRotation, currentQuaternion, deltaTime) {
        if (deltaTime <= 0) return;

        // Calculate angular velocity from rotation change
        // ω = Δθ / Δt (in radians per second)
        const dt = deltaTime / 1000; // Convert to seconds

        // Calculate rotation delta (current - last)
        const deltaX = currentRotation.x - this.lastRotation.x;
        const deltaY = currentRotation.y - this.lastRotation.y;
        const deltaZ = currentRotation.z - this.lastRotation.z;

        // Angular velocity (radians per second) - reuse temp vector
        const rawAngularVelocity = this.tempVec3_3.set(
            deltaX / dt,
            deltaY / dt,
            deltaZ / dt
        );

        // Only apply orbital physics for significant rotation (gestures, not ambient spin)
        // Threshold: 0.5 rad/s (~28.6 degrees/sec) - ambient rotation is ~0.01 rad/s
        const angVelMag = rawAngularVelocity.length();
        if (angVelMag > 0.5) {
            // Significant rotation (gesture) - apply orbital physics
            this.currentAngularVelocity.copy(rawAngularVelocity);
        } else {
            // Ambient rotation - decay toward zero (reuse zero vector)
            this.currentAngularVelocity.lerp(this.zeroVec, 0.1);
        }

        // Debug log angular velocity
        if (angVelMag > 0.1) {
            console.log('⚡ Angular velocity:', rawAngularVelocity.toArray(), 'magnitude:', angVelMag.toFixed(3), 'applied:', this.currentAngularVelocity.length().toFixed(3));
        }

        // Store current rotation for next frame
        this.lastRotation.copy(currentRotation);
        this.lastQuaternion.copy(currentQuaternion);
    }

    /**
     * Apply orbital physics to a particle's position
     * Particles rotate with mascot while experiencing inertia and centrifugal forces
     *
     * @param {THREE.Vector3} particlePosition - Particle position in world space (from behavior translator)
     * @param {Object} particle - Particle object (for storing per-particle physics state)
     * @param {THREE.Vector3} corePosition - Mascot center position
     * @param {number} deltaTime - Time since last frame (ms)
     * @returns {THREE.Vector3} Updated particle position
     */
    applyOrbitalPhysics(particlePosition, particle, corePosition, deltaTime) {
        if (deltaTime <= 0) return particlePosition;

        const dt = deltaTime / 1000; // Convert to seconds
        const dtClamped = Math.min(dt, 0.1); // Clamp to prevent huge jumps

        // Initialize particle physics state if needed
        if (!particle.orbitalPhysics) {
            particle.orbitalPhysics = {
                angularVelocity: new THREE.Vector3(),
                localPosition: null,  // Store position in mascot's local space
                initialized: false
            };
        }

        const physicsState = particle.orbitalPhysics;

        // On first frame, initialize local position
        if (!physicsState.initialized) {
            physicsState.initialized = true;
            physicsState.angularVelocity.copy(this.currentAngularVelocity);
            // Store initial position in local space (relative to mascot)
            physicsState.localPosition = new THREE.Vector3().copy(particlePosition).sub(corePosition);
            return particlePosition;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // KEY INSIGHT: We maintain a LOCAL position that rotates with the mascot,
        // while the behavior translator provides VELOCITY information via position changes
        // ═══════════════════════════════════════════════════════════════════════════

        // Calculate how much the behavior wants to move the particle (in world space)
        const previousWorldPos = this.tempVec3_1.copy(physicsState.localPosition).add(corePosition);
        const behaviorDelta = this.tempVec3_2.copy(particlePosition).sub(previousWorldPos);

        // Convert behavior delta to local space (unrotate it)
        // This is the particle's movement in the rotating reference frame
        // Reuse tempQuaternion to avoid allocation
        const invQuaternion = this.tempQuaternion.copy(this.lastQuaternion).invert();
        behaviorDelta.applyQuaternion(invQuaternion);

        // Apply behavior movement to local position
        physicsState.localPosition.add(behaviorDelta);

        const distance = physicsState.localPosition.length();

        // Skip if particle is at center (avoid division by zero)
        if (distance < 0.001) return corePosition;

        // ═══════════════════════════════════════════════════════════════════════════
        // 1. ANGULAR VELOCITY INHERITANCE with drag
        // ═══════════════════════════════════════════════════════════════════════════
        // Particles gradually match mascot's rotation speed
        const dragAmount = Math.min(this.drag * dtClamped * 10.0, 1.0);
        physicsState.angularVelocity.lerp(this.currentAngularVelocity, dragAmount);

        // ═══════════════════════════════════════════════════════════════════════════
        // 2. APPLY ROTATION to local position
        // ═══════════════════════════════════════════════════════════════════════════
        const rotationMagnitude = physicsState.angularVelocity.length() * dtClamped;

        if (rotationMagnitude > 0.0001) {
            // Create rotation quaternion from angular velocity
            const rotationAxis = this.tempVec3_3.copy(physicsState.angularVelocity).normalize();
            this.tempQuaternion.setFromAxisAngle(rotationAxis, rotationMagnitude);

            // Apply rotation to local position
            physicsState.localPosition.applyQuaternion(this.tempQuaternion);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // 3. CENTRIFUGAL FORCE (subtle outward push)
        // ═══════════════════════════════════════════════════════════════════════════
        if (this.centrifugalStrength > 0 && rotationMagnitude > 0.01) {
            // Simple outward push proportional to rotation speed
            const centrifugalMag = rotationMagnitude * this.centrifugalStrength * 0.5;
            // Reuse temp vector to avoid allocation
            const outwardDir = this.tempVec3_1.copy(physicsState.localPosition).normalize();
            physicsState.localPosition.add(outwardDir.multiplyScalar(centrifugalMag));
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // 4. CONVERT TO WORLD SPACE and return reused vector
        // ═══════════════════════════════════════════════════════════════════════════
        return this.tempVec3_4.copy(physicsState.localPosition).add(corePosition);
    }

    /**
     * Reset physics state (e.g., when emotion changes)
     */
    reset() {
        this.currentAngularVelocity.set(0, 0, 0);
        this.lastRotation.set(0, 0, 0);
        this.lastQuaternion.identity();
    }

    /**
     * Dispose of resources and clear references
     */
    dispose() {
        this.lastRotation = null;
        this.lastQuaternion = null;
        this.currentAngularVelocity = null;
        this.tempVec3_1 = null;
        this.tempVec3_2 = null;
        this.tempVec3_3 = null;
        this.tempVec3_4 = null;
        this.zeroVec = null;
        this.tempQuaternion = null;
        this.tempEuler = null;
    }

    /**
     * Get default physics config for an emotion type
     * @param {string} emotion - Emotion name
     * @returns {Object} Physics config
     */
    static getDefaultConfig(emotion) {
        const configs = {
            // Calm emotions: smooth following
            'calm': { drag: 0.9, inertia: 0.8, centrifugalStrength: 0.3, momentumDamping: 0.98 },
            'resting': { drag: 0.95, inertia: 0.7, centrifugalStrength: 0.2, momentumDamping: 0.99 },
            'neutral': { drag: 0.88, inertia: 0.85, centrifugalStrength: 0.5, momentumDamping: 0.97 },

            // Excited emotions: loose, chaotic particles
            'excited': { drag: 0.6, inertia: 1.2, centrifugalStrength: 1.8, momentumDamping: 0.92 },
            'joy': { drag: 0.7, inertia: 1.1, centrifugalStrength: 1.5, momentumDamping: 0.94 },
            'surprise': { drag: 0.65, inertia: 1.15, centrifugalStrength: 1.6, momentumDamping: 0.93 },

            // Intense emotions: strong forces
            'anger': { drag: 0.5, inertia: 1.3, centrifugalStrength: 2.0, momentumDamping: 0.90 },
            'euphoria': { drag: 0.75, inertia: 1.0, centrifugalStrength: 1.2, momentumDamping: 0.95 },

            // Controlled emotions: moderate following
            'focused': { drag: 0.85, inertia: 0.9, centrifugalStrength: 0.6, momentumDamping: 0.96 },
            'love': { drag: 0.8, inertia: 0.95, centrifugalStrength: 0.8, momentumDamping: 0.96 },

            // Fearful emotions: erratic
            'fear': { drag: 0.55, inertia: 1.25, centrifugalStrength: 1.7, momentumDamping: 0.91 },
            'suspicion': { drag: 0.7, inertia: 1.05, centrifugalStrength: 1.0, momentumDamping: 0.94 },

            // Other emotions
            'sadness': { drag: 0.92, inertia: 0.75, centrifugalStrength: 0.4, momentumDamping: 0.98 },
            'disgust': { drag: 0.6, inertia: 1.2, centrifugalStrength: 1.4, momentumDamping: 0.93 },
            'glitch': { drag: 0.4, inertia: 1.5, centrifugalStrength: 2.2, momentumDamping: 0.88 }
        };

        return configs[emotion] || {
            drag: 0.85,
            inertia: 0.9,
            centrifugalStrength: 1.0,
            momentumDamping: 0.97
        };
    }
}
