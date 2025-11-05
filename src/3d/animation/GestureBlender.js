/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - 3D Gesture Blender
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Handles blending of multiple simultaneous 3D gestures
 * @author Emotive Engine Team
 * @module 3d/animation/GestureBlender
 *
 * Manages:
 * - Accumulation of multiple gesture channels (position, rotation, scale, glow)
 * - Channel-specific blending modes (additive vs multiplicative)
 * - Quaternion-based rotation composition
 */

import * as THREE from 'three';

export class GestureBlender {
    constructor() {
        // Temp objects for quaternion calculations (reused to avoid allocations)
        this.tempEuler = new THREE.Euler();
        this.tempQuat = new THREE.Quaternion();
    }

    /**
     * Blend multiple gesture animations into a single output
     * @param {Array} animations - Array of active animations from ProceduralAnimator
     * @param {number} currentTime - Current animator time in milliseconds
     * @param {THREE.Quaternion} baseQuaternion - Base rotation quaternion
     * @param {number} baseScale - Base scale value
     * @param {number} baseGlowIntensity - Base glow intensity
     * @returns {Object} Blended gesture output
     */
    blend(animations, currentTime, baseQuaternion, baseScale, baseGlowIntensity) {
        // Initialize accumulator with identity values
        const accumulated = {
            position: [0, 0, 0],                               // Additive channel
            rotationQuat: new THREE.Quaternion().identity(),   // Multiplicative channel
            scale: 1.0,                                        // Multiplicative channel
            glowIntensity: 1.0                                 // Multiplicative channel
        };

        // Blend all active animations
        for (const animation of animations) {
            if (animation.evaluate) {
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                const output = animation.evaluate(progress);

                if (output) {
                    // POSITION: Additive blending (bounce + sway)
                    if (output.position) {
                        accumulated.position[0] += output.position[0];
                        accumulated.position[1] += output.position[1];
                        accumulated.position[2] += output.position[2];
                    }

                    // ROTATION: Quaternion multiplication (orbital * twist)
                    if (output.rotation) {
                        this.tempEuler.set(
                            output.rotation[0],
                            output.rotation[1],
                            output.rotation[2],
                            'XYZ'
                        );
                        this.tempQuat.setFromEuler(this.tempEuler);
                        accumulated.rotationQuat.multiply(this.tempQuat);
                    }

                    // SCALE: Multiplicative blending (expand × shrink)
                    if (output.scale !== undefined) {
                        accumulated.scale *= output.scale;
                    }

                    // GLOW: Multiplicative blending (glow × pulse)
                    if (output.glowIntensity !== undefined) {
                        accumulated.glowIntensity *= output.glowIntensity;
                    }
                }
            }
        }

        // Combine base quaternion with accumulated gesture rotation
        // finalQuaternion = baseQuaternion * gestureQuaternion
        // This applies gesture rotation in the local space of the base rotation
        const finalQuaternion = new THREE.Quaternion()
            .copy(baseQuaternion)
            .multiply(accumulated.rotationQuat);

        // Convert final quaternion back to Euler angles
        this.tempEuler.setFromQuaternion(finalQuaternion, 'XYZ');
        const finalRotation = [
            this.tempEuler.x,
            this.tempEuler.y,
            this.tempEuler.z
        ];

        // Apply base values to accumulated results
        const finalScale = baseScale * accumulated.scale;
        const finalGlowIntensity = baseGlowIntensity * accumulated.glowIntensity;

        return {
            position: accumulated.position,
            rotation: finalRotation,
            scale: finalScale,
            glowIntensity: finalGlowIntensity,
            gestureQuaternion: accumulated.rotationQuat // For debugging/inspection
        };
    }
}

export default GestureBlender;
