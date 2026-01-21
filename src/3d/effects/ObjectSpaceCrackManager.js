/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Object-Space Crack Manager
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Manages persistent crack impacts in object (mesh-local) space
 * @author Emotive Engine Team
 * @module 3d/effects/ObjectSpaceCrackManager
 *
 * Unlike screen-space CrackLayer, this manager:
 * 1. Stores impacts in MESH-LOCAL space (cracks rotate with mesh)
 * 2. Updates shader uniforms on the material directly
 * 3. Works with any material that includes the objectSpaceCracks GLSL
 *
 * ## Persistent Damage Model
 *
 * - Supports up to 3 simultaneous impacts
 * - Cracks persist until explicitly healed (crackHeal) or cleared (shatter)
 * - FIFO replacement when 4th impact arrives
 * - Healing fades all cracks simultaneously
 */

import * as THREE from 'three';
import { CRACK_DEFAULT_UNIFORMS, MAX_IMPACTS } from '../shaders/utils/objectSpaceCracks.js';

export class ObjectSpaceCrackManager {
    constructor() {
        // Persistent impact storage (up to MAX_IMPACTS)
        // Each impact: { position, direction, propagation, amount, seed }
        this.impacts = [];

        // Visual parameters
        this.crackColor = new THREE.Color(...CRACK_DEFAULT_UNIFORMS.crackColor);
        this.crackGlowColor = new THREE.Color(...CRACK_DEFAULT_UNIFORMS.crackGlowColor);
        this.glowStrength = CRACK_DEFAULT_UNIFORMS.crackGlowStrength;

        // Healing state
        this.isHealing = false;
        this.healDuration = 1500;
        this.healStartTime = 0;
        this.healProgress = 0;

        // Temp vectors for calculations
        this._tempVec3 = new THREE.Vector3();
        this._tempQuat = new THREE.Quaternion();
    }

    /**
     * Add a new crack impact
     * @param {Object} impact - Impact parameters
     * @param {THREE.Vector3|Array} impact.position - Impact position in MESH-LOCAL space
     * @param {THREE.Vector3|Array} impact.direction - Crack spread direction in MESH-LOCAL space
     * @param {number} impact.propagation - How far cracks spread (0-1)
     * @param {number} impact.amount - Crack intensity (0-1)
     */
    addImpact(impact) {
        // Generate unique seed for pattern variation
        const seed = Math.random() * 100;

        const position = Array.isArray(impact.position)
            ? new THREE.Vector3(...impact.position)
            : impact.position?.clone() ?? new THREE.Vector3();

        const direction = Array.isArray(impact.direction)
            ? new THREE.Vector3(...impact.direction)
            : impact.direction?.clone() ?? new THREE.Vector3();

        const newImpact = {
            position,
            direction,
            propagation: impact.propagation ?? 0.8,
            amount: impact.amount ?? 1.0,
            seed
        };

        // Enforce max impacts (FIFO)
        if (this.impacts.length >= MAX_IMPACTS) {
            this.impacts.shift();
        }
        this.impacts.push(newImpact);
    }

    /**
     * Transform camera-relative impact to mesh-local space
     * Same transformation used by deformation system for tidal locking
     *
     * @param {Object} cameraRelativeImpact - Impact in camera-relative coords
     * @param {THREE.Camera} camera - The camera
     * @param {THREE.Object3D} mesh - The mesh to crack
     * @returns {Object} Impact in mesh-local space
     */
    transformToMeshLocal(cameraRelativeImpact, camera, mesh) {
        // Get camera basis vectors
        const cameraRight = new THREE.Vector3();
        const cameraUp = new THREE.Vector3();
        const cameraForward = new THREE.Vector3();

        camera.getWorldDirection(cameraForward);
        cameraRight.crossVectors(cameraForward, camera.up).normalize();
        cameraUp.crossVectors(cameraRight, cameraForward).normalize();

        // Convert screen offset to world position on mesh surface
        const screenOffset = cameraRelativeImpact.screenOffset || [0, 0];
        const screenDirection = cameraRelativeImpact.screenDirection || [0, 0];

        // Impact position: project from camera through screen offset onto mesh surface
        // Scale by approximate mesh size
        const meshScale = 0.4;  // Approximate mesh radius
        const worldPos = new THREE.Vector3()
            .addScaledVector(cameraRight, screenOffset[0] * meshScale)
            .addScaledVector(cameraUp, screenOffset[1] * meshScale)
            .addScaledVector(cameraForward.clone().negate(), 0.3);  // Push slightly toward camera

        // Transform to mesh local space
        mesh.updateWorldMatrix(true, false);
        const invWorldMatrix = mesh.matrixWorld.clone().invert();
        worldPos.applyMatrix4(invWorldMatrix);

        // Convert screen direction to world space, then to mesh local
        const worldDir = new THREE.Vector3()
            .addScaledVector(cameraRight, screenDirection[0])
            .addScaledVector(cameraUp, screenDirection[1]);

        // Apply inverse rotation only (not translation) for direction
        const invQuat = new THREE.Quaternion();
        mesh.getWorldQuaternion(invQuat);
        invQuat.invert();
        worldDir.applyQuaternion(invQuat);

        return {
            position: worldPos,
            direction: worldDir,
            propagation: cameraRelativeImpact.propagation ?? 0.8,
            amount: cameraRelativeImpact.amount ?? 1.0
        };
    }

    /**
     * Start healing animation - fades all cracks
     * @param {number} duration - Heal duration in ms (default 1500)
     */
    startHealing(duration = 1500) {
        if (this.impacts.length === 0) return;

        this.isHealing = true;
        this.healDuration = duration;
        this.healStartTime = performance.now();
        this.healProgress = 0;

        // Store original values for interpolation
        for (const impact of this.impacts) {
            impact.originalAmount = impact.amount;
            impact.originalPropagation = impact.propagation;
        }
    }

    /**
     * Clear all cracks immediately (called by shatter)
     */
    clearAll() {
        this.impacts = [];
        this.isHealing = false;
        this.healProgress = 0;
    }

    /**
     * Check if there are any active cracks
     * @returns {boolean}
     */
    hasCracks() {
        return this.impacts.length > 0;
    }

    /**
     * Update healing animation
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!this.isHealing || this.impacts.length === 0) return;

        const elapsed = performance.now() - this.healStartTime;
        this.healProgress = Math.min(elapsed / this.healDuration, 1.0);

        // Smooth fade curve (ease-out)
        const t = this.healProgress;
        const fadeAmount = 1.0 - (t * t * (3 - 2 * t));  // smoothstep

        // Fade all impacts
        for (const impact of this.impacts) {
            if (impact.originalAmount !== undefined) {
                impact.amount = impact.originalAmount * fadeAmount;
                impact.propagation = impact.originalPropagation * (0.3 + 0.7 * fadeAmount);
            }
        }

        // Clear when done
        if (this.healProgress >= 1.0) {
            this.clearAll();
        }
    }

    /**
     * Apply crack uniforms to a material
     * @param {THREE.ShaderMaterial} material - Material with crack uniforms
     */
    applyToMaterial(material) {
        if (!material?.uniforms) return;

        const {uniforms} = material;

        // Set number of impacts
        if (uniforms.crackNumImpacts) {
            uniforms.crackNumImpacts.value = this.impacts.length;
        }

        // Set each impact slot
        for (let i = 0; i < MAX_IMPACTS; i++) {
            const impact = this.impacts[i];

            const impactUniform = uniforms[`crackImpact${i}`];
            const directionUniform = uniforms[`crackDirection${i}`];
            const paramsUniform = uniforms[`crackParams${i}`];

            if (impact) {
                if (impactUniform) {
                    impactUniform.value.copy(impact.position);
                }
                if (directionUniform) {
                    directionUniform.value.copy(impact.direction);
                }
                if (paramsUniform) {
                    paramsUniform.value.set(
                        impact.propagation,
                        impact.amount,
                        impact.seed
                    );
                }
            } else {
                // Clear unused slots
                if (impactUniform) impactUniform.value.set(0, 0, 0);
                if (directionUniform) directionUniform.value.set(0, 0, 0);
                if (paramsUniform) paramsUniform.value.set(0, 0, 0);
            }
        }

        // Set visual parameters
        if (uniforms.crackColor) {
            uniforms.crackColor.value.copy(this.crackColor);
        }
        if (uniforms.crackGlowColor) {
            uniforms.crackGlowColor.value.copy(this.crackGlowColor);
        }
        if (uniforms.crackGlowStrength) {
            uniforms.crackGlowStrength.value = this.glowStrength;
        }
    }

    /**
     * Set glow color
     * @param {THREE.Color|Array} color
     */
    setGlowColor(color) {
        if (Array.isArray(color)) {
            this.crackGlowColor.setRGB(color[0], color[1], color[2]);
        } else if (color) {
            this.crackGlowColor.copy(color);
        }
    }

    /**
     * Reset all state
     */
    reset() {
        this.clearAll();
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.impacts = [];
        this._tempVec3 = null;
        this._tempQuat = null;
    }
}

export { MAX_IMPACTS };
