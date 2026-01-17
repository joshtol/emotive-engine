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
 * - Accumulation of multiple gesture channels (position, rotation, scale, glow, glowBoost)
 * - Channel-specific blending modes (additive vs multiplicative)
 * - Quaternion-based rotation composition
 * - Isolated glowBoost for screen-space glow layer (separate from material glow)
 * - ACCENT GESTURES: scaleBoost, positionBoost, rotationBoost for dance punctuation
 */

import * as THREE from 'three';

export class GestureBlender {
    constructor() {
        // Temp objects for quaternion calculations (reused to avoid allocations)
        this.tempEuler = new THREE.Euler();
        this.tempQuat = new THREE.Quaternion();
        this.accumulatedRotationQuat = new THREE.Quaternion();
        this.finalQuaternion = new THREE.Quaternion();

        // Rotation smoothing state (prevents sudden jumps)
        this.prevRotation = [0, 0, 0];
        this.hasValidPrevRotation = false;
    }

    /**
     * Blend multiple gesture animations into a single output
     *
     * Supports two types of gestures:
     * 1. ABSOLUTE gestures: position, rotation, scale - create their own motion
     * 2. ACCENT gestures: positionBoost, rotationBoost, scaleBoost - boost/multiply existing groove
     *
     * Accent gestures are designed to work as "punctuation" on top of groove, not compete with it.
     *
     * @param {Array} animations - Array of active animations from ProceduralAnimator
     * @param {number} currentTime - Current animator time in milliseconds
     * @param {Array<number>} baseEuler - Base rotation as Euler angles [X, Y, Z] in radians
     * @param {number} baseScale - Base scale value
     * @param {number} baseGlowIntensity - Base glow intensity
     * @returns {Object} Blended gesture output
     */
    blend(animations, currentTime, baseEuler, baseScale, baseGlowIntensity) {
        // Reset accumulated rotation quaternion to identity (reuse instead of allocate)
        this.accumulatedRotationQuat.identity();

        // Initialize accumulator with identity values
        const accumulated = {
            // ABSOLUTE channels (create motion)
            position: [0, 0, 0],                               // Additive channel (world-space)
            rotationQuat: this.accumulatedRotationQuat,        // Multiplicative channel (reused)
            scale: 1.0,                                        // Multiplicative channel
            glowIntensity: 1.0,                                // Multiplicative channel
            glowBoost: 0.0,                                    // Additive channel (for glow layer)

            // CAMERA-RELATIVE position (transformed in Core3DManager)
            // Z = toward camera, Y = up, X = right (in view space)
            cameraRelativePosition: [0, 0, 0],

            // ACCENT/BOOST channels (enhance groove without replacing it)
            positionBoost: [0, 0, 0],                          // Additive boost to groove position
            rotationBoost: [0, 0, 0],                          // Additive boost to groove rotation
            scaleBoost: 1.0,                                   // Multiplicative boost (1.0 = no change)

            // Track if we have any accent gestures (affects groove blending behavior)
            hasAccentGestures: false,
            hasAbsoluteGestures: false,
            hasCameraRelativeGestures: false
        };

        // Blend all active animations
        for (const animation of animations) {
            if (animation.evaluate) {
                const elapsed = currentTime - animation.startTime;
                const durationMs = animation.duration; // Duration in milliseconds
                const progress = Math.min(elapsed / durationMs, 1);
                const output = animation.evaluate(progress);

                if (output) {
                    // ═══════════════════════════════════════════════════════════════
                    // GESTURE FADE ENVELOPE - Smooth transition into/out of gestures
                    // ═══════════════════════════════════════════════════════════════
                    // Prevents jarring rotation jumps when gestures start/end
                    // Fade duration is 15% of gesture duration on each end
                    const fadeInEnd = 0.15;
                    const fadeOutStart = 0.85;
                    let fadeEnvelope = 1.0;

                    if (progress < fadeInEnd) {
                        // Ease-in: smooth start using cubic curve
                        const t = progress / fadeInEnd;
                        fadeEnvelope = t * t * (3 - 2 * t); // smoothstep
                    } else if (progress > fadeOutStart) {
                        // Ease-out: smooth end using cubic curve
                        const t = (progress - fadeOutStart) / (1 - fadeOutStart);
                        fadeEnvelope = 1 - t * t * (3 - 2 * t); // inverse smoothstep
                    }
                    // Track gesture type for groove blending decisions
                    const isAccent = animation.isAccent === true;
                    if (isAccent) {
                        accumulated.hasAccentGestures = true;
                    } else if (output.position || output.rotation || output.scale !== undefined) {
                        accumulated.hasAbsoluteGestures = true;
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // ABSOLUTE CHANNELS (create their own motion)
                    // Apply fadeEnvelope to smooth gesture transitions
                    // ═══════════════════════════════════════════════════════════════

                    // POSITION: Additive blending with fade envelope
                    if (output.position) {
                        accumulated.position[0] += output.position[0] * fadeEnvelope;
                        accumulated.position[1] += output.position[1] * fadeEnvelope;
                        accumulated.position[2] += output.position[2] * fadeEnvelope;
                    }

                    // ROTATION: Quaternion slerp with fade envelope
                    // Instead of direct multiply, scale the rotation by fadeEnvelope
                    if (output.rotation) {
                        this.tempEuler.set(
                            output.rotation[0] * fadeEnvelope,
                            output.rotation[1] * fadeEnvelope,
                            output.rotation[2] * fadeEnvelope,
                            'XYZ'
                        );
                        this.tempQuat.setFromEuler(this.tempEuler);
                        accumulated.rotationQuat.multiply(this.tempQuat);
                    }

                    // SCALE: Blend toward 1.0 based on fadeEnvelope
                    // At fadeEnvelope=0, scale contribution is 1.0 (no change)
                    // At fadeEnvelope=1, full gesture scale is applied
                    if (output.scale !== undefined) {
                        const scaledValue = 1.0 + (output.scale - 1.0) * fadeEnvelope;
                        accumulated.scale *= scaledValue;
                    }

                    // GLOW: Multiplicative blending (glow × pulse)
                    if (output.glowIntensity !== undefined) {
                        accumulated.glowIntensity *= output.glowIntensity;
                    }

                    // GLOW BOOST: Additive blending for isolated glow layer
                    if (output.glowBoost !== undefined) {
                        accumulated.glowBoost += output.glowBoost;
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // ACCENT/BOOST CHANNELS (enhance groove as punctuation)
                    // ═══════════════════════════════════════════════════════════════

                    // POSITION BOOST: Additive accent to groove position
                    if (output.positionBoost) {
                        accumulated.positionBoost[0] += output.positionBoost[0];
                        accumulated.positionBoost[1] += output.positionBoost[1];
                        accumulated.positionBoost[2] += output.positionBoost[2];
                    }

                    // ROTATION BOOST: Additive accent to groove rotation
                    if (output.rotationBoost) {
                        accumulated.rotationBoost[0] += output.rotationBoost[0];
                        accumulated.rotationBoost[1] += output.rotationBoost[1];
                        accumulated.rotationBoost[2] += output.rotationBoost[2];
                    }

                    // SCALE BOOST: Multiplicative accent (1.1 = 10% bigger, 0.9 = 10% smaller)
                    // Clamped to prevent extreme stacking when multiple gestures fire
                    if (output.scaleBoost !== undefined) {
                        accumulated.scaleBoost *= output.scaleBoost;
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // CAMERA-RELATIVE POSITION (tidally locked gestures)
                    // ═══════════════════════════════════════════════════════════════
                    // Position in view space: Z = toward camera, Y = up, X = right
                    // Transformed to world-space in Core3DManager using camera direction
                    // Apply fadeEnvelope for smooth transitions
                    if (output.cameraRelativePosition) {
                        accumulated.cameraRelativePosition[0] += output.cameraRelativePosition[0] * fadeEnvelope;
                        accumulated.cameraRelativePosition[1] += output.cameraRelativePosition[1] * fadeEnvelope;
                        accumulated.cameraRelativePosition[2] += output.cameraRelativePosition[2] * fadeEnvelope;
                        accumulated.hasCameraRelativeGestures = true;
                    }
                }
            }
        }

        // Clamp accumulated boost values to prevent extreme visual artifacts
        // scaleBoost: limit to ±15% (0.85 to 1.15)
        accumulated.scaleBoost = Math.max(0.85, Math.min(1.15, accumulated.scaleBoost));

        // glowBoost: limit to 0.5 (prevents blinding flashes)
        accumulated.glowBoost = Math.min(0.5, accumulated.glowBoost);

        // positionBoost: limit each axis to ±0.05 (prevents wild movements)
        for (let i = 0; i < 3; i++) {
            accumulated.positionBoost[i] = Math.max(-0.05, Math.min(0.05, accumulated.positionBoost[i]));
        }

        // rotationBoost: limit each axis to ±0.1 radians (~6 degrees)
        for (let i = 0; i < 3; i++) {
            accumulated.rotationBoost[i] = Math.max(-0.1, Math.min(0.1, accumulated.rotationBoost[i]));
        }

        // ═══════════════════════════════════════════════════════════════
        // GIMBAL-LOCK-FREE ROTATION COMPOSITION
        // ═══════════════════════════════════════════════════════════════
        // Solution: Use raw Euler angles from Core3DManager directly.
        // The baseEuler is passed in as [X, Y, Z] and never goes through
        // quaternion conversion, completely avoiding gimbal lock.
        //
        // Gesture rotations are small deltas accumulated in a quaternion
        // (to handle multiple simultaneous gestures), but since they're
        // small, converting them to Euler is safe.

        // Extract gesture rotation (small rotations, safe to convert)
        this.tempEuler.setFromQuaternion(accumulated.rotationQuat, 'XYZ');
        const gestureX = this.tempEuler.x;
        const gestureY = this.tempEuler.y;
        const gestureZ = this.tempEuler.z;

        // Combine as simple Euler addition
        // Base rotation comes directly as Euler - no quaternion conversion = no gimbal lock
        // X and Z from base are clamped to ±20° in Core3DManager
        // Y from base can be any value (showcase spin, freely rotates)
        // Gestures add small deltas to all axes
        const finalRotation = [
            baseEuler[0] + gestureX,
            baseEuler[1] + gestureY,
            baseEuler[2] + gestureZ
        ];

        // Apply base values to accumulated results
        const finalScale = baseScale * accumulated.scale;
        const finalGlowIntensity = baseGlowIntensity * accumulated.glowIntensity;

        return {
            // Absolute gesture outputs
            position: accumulated.position,
            rotation: finalRotation,
            scale: finalScale,
            glowIntensity: finalGlowIntensity,
            glowBoost: accumulated.glowBoost,

            // Camera-relative position (view-space, transformed in Core3DManager)
            cameraRelativePosition: accumulated.cameraRelativePosition,

            // Accent gesture outputs (for groove enhancement)
            positionBoost: accumulated.positionBoost,
            rotationBoost: accumulated.rotationBoost,
            scaleBoost: accumulated.scaleBoost,

            // Gesture type flags (for groove blending decisions)
            hasAccentGestures: accumulated.hasAccentGestures,
            hasAbsoluteGestures: accumulated.hasAbsoluteGestures,
            hasCameraRelativeGestures: accumulated.hasCameraRelativeGestures,

            gestureQuaternion: accumulated.rotationQuat // For debugging/inspection
        };
    }

    /**
     * Reset the rotation smoothing state (call when rotation tracking should restart)
     * Useful after teleporting the mascot or resetting to a new pose
     */
    resetSmoothing() {
        this.hasValidPrevRotation = false;
        if (this.prevRotation) {
            this.prevRotation[0] = 0;
            this.prevRotation[1] = 0;
            this.prevRotation[2] = 0;
        }
    }

    /**
     * Cleanup all resources
     */
    destroy() {
        this.tempEuler = null;
        this.tempQuat = null;
        this.accumulatedRotationQuat = null;
        this.finalQuaternion = null;
        this.prevRotation = null;
    }
}

export default GestureBlender;
