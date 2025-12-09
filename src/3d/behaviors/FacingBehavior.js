/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Facing Behavior System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Tidal-lock mechanism for 3D models (keeps one face always toward camera)
 * @author Emotive Engine Team
 * @module 3d/behaviors/FacingBehavior
 */

import * as THREE from 'three';

/**
 * Facing behavior - automatically keeps one face oriented toward camera
 *
 * Like the Moon's tidal lock with Earth, or billboard sprites. The object
 * maintains a fixed orientation relative to the camera, canceling out any
 * rotation from other behaviors.
 *
 * Physics simulation:
 * - Calculates camera-to-object direction vector
 * - Applies counter-rotation to maintain fixed face orientation
 * - Can specify which face should point toward camera
 * - Strength parameter allows partial tidal lock (wobble)
 */
export default class FacingBehavior {
    /**
     * Create facing behavior
     * @param {object} config - Facing configuration
     * @param {THREE.Camera} camera - Camera reference for orientation tracking
     */
    constructor(config = {}, camera = null) {
        this.config = config;
        this.camera = camera;

        // Strength of facing force (0.0 = disabled, 1.0 = full tidal lock)
        this.strength = config.strength !== undefined ? config.strength : 1.0;

        // Locked face direction in local space [x, y, z]
        // Default: +Z faces camera (standard Three.js forward)
        this.lockedFace = config.lockedFace || [0, 0, 1];

        // Fixed calibration rotation applied AFTER facing calculation
        // This allows "Man in the Moon" style orientation offset
        // [pitch, yaw, roll] in radians
        this.calibrationRotation = config.calibrationRotation || [0, 0, 0];

        // Interpolation speed (1.0 = instant, <1.0 = smooth transition)
        this.lerpSpeed = config.lerpSpeed !== undefined ? config.lerpSpeed : 1.0;

        // Temp objects for calculations (reused to avoid GC)
        this.tempVector = new THREE.Vector3();
        this.tempQuaternion = new THREE.Quaternion();
        this.targetQuaternion = new THREE.Quaternion();
        this.calibrationQuaternion = new THREE.Quaternion();
        this.currentQuaternion = new THREE.Quaternion();

        // Additional temp objects (reused in update() hot path)
        this._lockedFaceVec = new THREE.Vector3();
        this._targetMatrix = new THREE.Matrix4();
        this._lookAtOrigin = new THREE.Vector3(0, 0, 0);
        this._upVector = new THREE.Vector3(0, 1, 0);
        this._tempEuler = new THREE.Euler(0, 0, 0, 'XYZ');
        this._defaultPosition = new THREE.Vector3(0, 0, 0);
    }

    /**
     * Apply facing orientation to Euler angles
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {Array} euler - Current Euler angles [pitch, yaw, roll] to modify
     * @param {THREE.Vector3} objectPosition - Object's world position (optional)
     * @returns {Array} Updated Euler angles
     */
    update(deltaTime, euler, objectPosition) {
        if (this.strength === 0 || !this.camera) return euler; // Disabled

        // Use default position if not provided (avoids allocation)
        const objPos = objectPosition || this._defaultPosition;

        const dt = deltaTime * 0.001; // Convert ms to seconds

        // Calculate direction from object to camera
        this.tempVector.copy(this.camera.position).sub(objPos);

        // If camera is at same position as object, use default forward
        if (this.tempVector.lengthSq() < 0.0001) {
            this.tempVector.set(0, 0, 1);
        }
        this.tempVector.normalize();

        // Calculate target quaternion that orients lockedFace toward camera
        // Reuse cached vector instead of creating new one
        this._lockedFaceVec.set(
            this.lockedFace[0],
            this.lockedFace[1],
            this.lockedFace[2]
        ).normalize();

        // Use lookAt-style rotation (object's Z-axis points toward camera)
        // Reuse cached matrix and vectors
        this._targetMatrix.lookAt(this.tempVector, this._lookAtOrigin, this._upVector);
        this.targetQuaternion.setFromRotationMatrix(this._targetMatrix);

        // Apply calibration rotation (fixed offset, e.g., "Man in the Moon" orientation)
        if (this.calibrationRotation[0] !== 0 ||
            this.calibrationRotation[1] !== 0 ||
            this.calibrationRotation[2] !== 0) {
            this._tempEuler.set(
                this.calibrationRotation[0],
                this.calibrationRotation[1],
                this.calibrationRotation[2],
                'XYZ'
            );
            this.calibrationQuaternion.setFromEuler(this._tempEuler);
            this.targetQuaternion.multiply(this.calibrationQuaternion);
        }

        // Get current rotation as quaternion (reuse temp euler)
        this._tempEuler.set(euler[0], euler[1], euler[2], 'XYZ');
        this.currentQuaternion.setFromEuler(this._tempEuler);

        // Interpolate toward target based on strength and lerpSpeed
        const alpha = Math.min(1.0, this.strength * this.lerpSpeed * dt * 60); // 60fps normalized
        this.currentQuaternion.slerp(this.targetQuaternion, alpha);

        // Convert back to Euler angles
        this._tempEuler.setFromQuaternion(this.currentQuaternion, 'XYZ');
        euler[0] = this._tempEuler.x; // Pitch
        euler[1] = this._tempEuler.y; // Yaw
        euler[2] = this._tempEuler.z; // Roll

        return euler;
    }

    /**
     * Set camera reference (useful when camera changes)
     * @param {THREE.Camera} camera - New camera reference
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Update calibration rotation (e.g., when morphing geometries)
     * @param {Array} rotation - [pitch, yaw, roll] in radians
     */
    setCalibrationRotation(rotation) {
        this.calibrationRotation = rotation;
    }

    /**
     * Update configuration
     * @param {object} config - New facing config
     */
    updateConfig(config) {
        this.config = config;
        this.strength = config.strength !== undefined ? config.strength : this.strength;
        this.lockedFace = config.lockedFace || this.lockedFace;
        this.calibrationRotation = config.calibrationRotation || this.calibrationRotation;
        this.lerpSpeed = config.lerpSpeed !== undefined ? config.lerpSpeed : this.lerpSpeed;
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.camera = null;
        this.tempVector = null;
        this.tempQuaternion = null;
        this.targetQuaternion = null;
        this.calibrationQuaternion = null;
        this.currentQuaternion = null;
    }
}
