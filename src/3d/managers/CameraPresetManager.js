/**
 * CameraPresetManager - Manages camera preset views and transitions
 *
 * Provides smooth camera transitions to predefined viewpoints:
 * - front, side, top, angle, back, bottom
 *
 * Extracted from ThreeRenderer to improve separation of concerns.
 *
 * @module 3d/managers/CameraPresetManager
 */

import * as THREE from 'three';

/**
 * Available camera preset positions
 * @param {number} d - Camera distance from origin
 */
const getPresets = d => ({
    front: { x: 0, y: 0, z: d },
    side: { x: d, y: 0, z: 0 },
    top: { x: 0, y: d, z: 0 },
    angle: { x: d * 0.67, y: d * 0.5, z: d * 0.67 },
    back: { x: 0, y: 0, z: -d },
    bottom: { x: 0, y: -d, z: 0 }
});

export class CameraPresetManager {
    /**
     * Create camera preset manager
     * @param {THREE.Camera} camera - The camera to control
     * @param {OrbitControls} controls - The orbit controls
     * @param {number} cameraDistance - Default distance from origin
     */
    constructor(camera, controls, cameraDistance = 3) {
        this.camera = camera;
        this.controls = controls;
        this.cameraDistance = cameraDistance;
        this.animationId = null;
    }

    /**
     * Get list of available presets
     * @returns {string[]}
     */
    getAvailablePresets() {
        return Object.keys(getPresets(this.cameraDistance));
    }

    /**
     * Set camera to a preset view with smooth transition
     * @param {string} preset - Preset name ('front', 'side', 'top', 'angle', 'back', 'bottom')
     * @param {number} duration - Transition duration in ms (default 1000)
     * @param {boolean} preserveTarget - If true, keep the current controls.target (default false)
     */
    setPreset(preset, duration = 1000, preserveTarget = false) {
        if (!this.controls) return;

        const presets = getPresets(this.cameraDistance);
        const targetPos = presets[preset];

        if (!targetPos) {
            console.warn(`Unknown camera preset: ${preset}`);
            return;
        }

        // Cancel any ongoing animation
        this.cancelAnimation();

        // Save current target if we need to preserve it
        const savedTarget = preserveTarget ? this.controls.target.clone() : null;

        // If instant (duration = 0), set position directly
        if (duration === 0) {
            this._setInstant(targetPos, savedTarget);
            return;
        }

        // Animated transition
        this._animateTo(targetPos, duration, savedTarget, preserveTarget);
    }

    /**
     * Set camera position instantly
     * @private
     */
    _setInstant(targetPos, savedTarget) {
        // Fully reset OrbitControls to initial state
        this.controls.reset();
        // Then set to target position
        this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
        // Preserve or reset the controls target
        if (savedTarget) {
            this.controls.target.copy(savedTarget);
            this.camera.lookAt(savedTarget);
        } else {
            this.controls.target.set(0, 0, 0);
            this.camera.lookAt(0, 0, 0);
        }
        this.controls.update();
    }

    /**
     * Animate camera to target position
     * @private
     */
    _animateTo(targetPos, duration, savedTarget, preserveTarget) {
        // Reset OrbitControls target to center (origin) for animated presets
        if (!preserveTarget) {
            this.controls.target.set(0, 0, 0);
        }

        // Smoothly animate camera to target position
        const startPos = this.camera.position.clone();
        const endPos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
        const startTime = performance.now();

        const animate = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Ease out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);

            this.camera.position.lerpVectors(startPos, endPos, eased);
            this.camera.lookAt(0, 0, 0);
            this.controls.update();

            if (progress < 1.0) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * Check if animation is in progress
     * @returns {boolean}
     */
    isAnimating() {
        return this.animationId !== null;
    }

    /**
     * Cancel any ongoing camera animation
     */
    cancelAnimation() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Reset camera to default front view
     * @param {number} duration - Transition duration in ms
     */
    reset(duration = 1000) {
        this.setPreset('front', duration);
    }

    /**
     * Update camera distance (affects preset positions)
     * @param {number} distance - New camera distance
     */
    setCameraDistance(distance) {
        this.cameraDistance = distance;
    }

    /**
     * Dispose manager and clean up
     */
    dispose() {
        this.cancelAnimation();
        this.camera = null;
        this.controls = null;
    }
}

export default CameraPresetManager;
