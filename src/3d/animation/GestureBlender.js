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

        // Track which animations have already triggered crack impacts
        // Key: animation id, Value: true if already triggered
        this._crackTriggeredAnimations = new Set();
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
            scale: 1.0,                                        // Multiplicative channel (uniform)
            nonUniformScale: [1.0, 1.0, 1.0],                  // Multiplicative channel [x, y, z] for squash/stretch
            glowIntensity: 1.0,                                // Multiplicative channel
            glowBoost: 0.0,                                    // Additive channel (for glow layer)
            glowColorOverride: null,                           // Temporary glow color override [r,g,b]
            electricOverlay: null,                             // Electric shader overlay {enabled, charge, time}
            waterOverlay: null,                                // Water shader overlay {enabled, wetness, time}
            fireOverlay: null,                                 // Fire shader overlay {enabled, heat, temperature, time}

            // CAMERA-RELATIVE channels (transformed in Core3DManager)
            // Position: Z = toward camera, Y = up, X = right (in view space)
            cameraRelativePosition: [0, 0, 0],
            // Rotation: Roll around view axis (Z = roll left/right as seen by camera)
            cameraRelativeRotation: [0, 0, 0],

            // ACCENT/BOOST channels (enhance groove without replacing it)
            positionBoost: [0, 0, 0],                          // Additive boost to groove position
            rotationBoost: [0, 0, 0],                          // Additive boost to groove rotation
            scaleBoost: 1.0,                                   // Multiplicative boost (1.0 = no change)

            // Track if we have any accent gestures (affects groove blending behavior)
            hasAccentGestures: false,
            hasAbsoluteGestures: false,
            hasCameraRelativeGestures: false,

            // FREEZE channels (0 = normal, 1 = frozen) - for hold gesture "pause button"
            freezeRotation: 0,                                     // Stops rotation behavior
            freezeWobble: 0,                                       // Stops episodic wobble
            freezeGroove: 0,                                       // Stops rhythm groove
            freezeParticles: 0,                                    // Stops particle motion

            // DEFORMATION channel - localized vertex displacement for impacts
            deformation: null,                                     // {enabled, type, strength, phase, direction, impactPoint, falloffRadius}

            // SHATTER channel - geometry fragmentation
            shatter: null,                                         // {enabled, impactPoint, intensity, variant}

            // CRACK channel - post-processing crack overlay (PERSISTENT MODEL)
            crack: null,                                           // Latest crack params for glow updates
            crackTriggers: null,                                   // Array of new impacts to add this frame
            crackHealTrigger: false,                               // True when heal gesture starts
            crackHealDuration: 1500                                // Duration for heal animation
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
                    // Supports both uniform scale (number) and non-uniform scale (array [x, y, z])
                    if (output.scale !== undefined) {
                        if (Array.isArray(output.scale)) {
                            // Non-uniform scale (squash/stretch effects)
                            const scaledX = 1.0 + (output.scale[0] - 1.0) * fadeEnvelope;
                            const scaledY = 1.0 + (output.scale[1] - 1.0) * fadeEnvelope;
                            const scaledZ = 1.0 + (output.scale[2] - 1.0) * fadeEnvelope;
                            accumulated.nonUniformScale[0] *= scaledX;
                            accumulated.nonUniformScale[1] *= scaledY;
                            accumulated.nonUniformScale[2] *= scaledZ;
                        } else {
                            // Uniform scale
                            const scaledValue = 1.0 + (output.scale - 1.0) * fadeEnvelope;
                            accumulated.scale *= scaledValue;
                        }
                    }

                    // GLOW: Multiplicative blending (glow × pulse)
                    if (output.glowIntensity !== undefined) {
                        accumulated.glowIntensity *= output.glowIntensity;
                    }

                    // GLOW BOOST: Additive blending for isolated glow layer
                    if (output.glowBoost !== undefined) {
                        accumulated.glowBoost += output.glowBoost;
                    }

                    // GLOW COLOR OVERRIDE: Last-wins (for electric/elemental effects)
                    // Temporary color override that doesn't affect emotion glow
                    if (output.glowColorOverride) {
                        accumulated.glowColorOverride = output.glowColorOverride;
                    }

                    // ELECTRIC OVERLAY: Shader overlay for electrocution effect
                    // Last-wins blending (strongest charge takes precedence)
                    if (output.electricOverlay && output.electricOverlay.enabled) {
                        if (!accumulated.electricOverlay ||
                            output.electricOverlay.charge > accumulated.electricOverlay.charge) {
                            accumulated.electricOverlay = { ...output.electricOverlay };
                        }
                    }

                    // WATER OVERLAY: Shader overlay for fluid/wet effect
                    // Last-wins blending (strongest wetness takes precedence)
                    if (output.waterOverlay && output.waterOverlay.enabled) {
                        if (!accumulated.waterOverlay ||
                            output.waterOverlay.wetness > accumulated.waterOverlay.wetness) {
                            accumulated.waterOverlay = { ...output.waterOverlay };
                        }
                    }

                    // FIRE OVERLAY: Shader overlay for fire/heat effect
                    // Last-wins blending (strongest heat takes precedence)
                    if (output.fireOverlay && output.fireOverlay.enabled) {
                        if (!accumulated.fireOverlay ||
                            output.fireOverlay.heat > accumulated.fireOverlay.heat) {
                            accumulated.fireOverlay = { ...output.fireOverlay };
                        }
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
                    // CAMERA-RELATIVE CHANNELS (tidally locked gestures)
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

                    // Rotation in view space: Z = roll (tilt left/right as seen by camera)
                    // Transformed to world-space rotation in Core3DManager
                    if (output.cameraRelativeRotation) {
                        accumulated.cameraRelativeRotation[0] += output.cameraRelativeRotation[0] * fadeEnvelope;
                        accumulated.cameraRelativeRotation[1] += output.cameraRelativeRotation[1] * fadeEnvelope;
                        accumulated.cameraRelativeRotation[2] += output.cameraRelativeRotation[2] * fadeEnvelope;
                        accumulated.hasCameraRelativeGestures = true;
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // FREEZE CHANNELS (for hold gesture "pause button" effect)
                    // ═══════════════════════════════════════════════════════════════
                    // Use MAX blending - strongest freeze wins
                    if (output.freezeRotation !== undefined) {
                        accumulated.freezeRotation = Math.max(accumulated.freezeRotation, output.freezeRotation * fadeEnvelope);
                    }
                    if (output.freezeWobble !== undefined) {
                        accumulated.freezeWobble = Math.max(accumulated.freezeWobble, output.freezeWobble * fadeEnvelope);
                    }
                    if (output.freezeGroove !== undefined) {
                        accumulated.freezeGroove = Math.max(accumulated.freezeGroove, output.freezeGroove * fadeEnvelope);
                    }
                    if (output.freezeParticles !== undefined) {
                        accumulated.freezeParticles = Math.max(accumulated.freezeParticles, output.freezeParticles * fadeEnvelope);
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // DEFORMATION CHANNEL (for localized vertex displacement)
                    // ═══════════════════════════════════════════════════════════════
                    // Use strongest deformation (don't blend - pick highest strength)
                    //
                    // NOTE: Do NOT apply fadeEnvelope here - deformation gestures
                    // have their own strength curves (e.g., oofFactory's dentStrength).
                    // The gesture's evaluate() returns time-varying strength that creates
                    // the dent animation (quick ramp up, hold, fade out).
                    //
                    // impactPoint is in CAMERA-RELATIVE space here; Core3DManager
                    // transforms it to mesh-local space for tidal locking.
                    // See: deformation.js, oofFactory.js, Core3DManager.js
                    if (output.deformation && output.deformation.enabled) {
                        const d = output.deformation;

                        if (!accumulated.deformation || d.strength > accumulated.deformation.strength) {
                            accumulated.deformation = { ...d };
                        }
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // SHATTER CHANNEL (for geometry fragmentation)
                    // ═══════════════════════════════════════════════════════════════
                    // Shatter is a one-shot trigger, don't blend - first trigger wins.
                    // impactPoint is in CAMERA-RELATIVE space (like deformation).
                    // Transformed to mesh-local space in Core3DManager.
                    // Also pass through reassemble triggers separately.
                    if (output.shatter) {
                        if (output.shatter.enabled && !accumulated.shatter) {
                            accumulated.shatter = { ...output.shatter };
                        }
                        // Pass through reassembly trigger even when shatter.enabled is false
                        if (output.shatter.reassemble) {
                            if (!accumulated.shatter) {
                                accumulated.shatter = { enabled: false };
                            }
                            accumulated.shatter.reassemble = true;
                            accumulated.shatter.reassembleDuration = output.shatter.reassembleDuration || 1000;
                        }
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // CRACK CHANNEL - Post-processing crack overlay
                    // ═══════════════════════════════════════════════════════════════
                    // PERSISTENT DAMAGE MODEL:
                    // - crack.trigger: adds a NEW persistent impact (max 3 accumulate)
                    // - crack.heal: starts healing animation that clears ALL impacts
                    // - Multiple triggers in same frame all get added to CrackLayer
                    if (output.crack) {
                        const c = output.crack;

                        // Handle crack triggers (add new impacts)
                        // Only trigger ONCE per animation - track by animation startTime as ID
                        if (c.enabled && c.trigger) {
                            const animId = animation.startTime;
                            if (!this._crackTriggeredAnimations.has(animId)) {
                                this._crackTriggeredAnimations.add(animId);
                                // Accumulate triggers - each one becomes a separate impact
                                if (!accumulated.crackTriggers) {
                                    accumulated.crackTriggers = [];
                                }
                                accumulated.crackTriggers.push({
                                    screenOffset: c.screenOffset,
                                    screenDirection: c.screenDirection,
                                    propagation: c.propagation,
                                    amount: c.amount,
                                    glowStrength: c.glowStrength
                                });
                            }
                        }

                        // Handle heal trigger - also deduplicate by animation ID
                        if (c.heal && c.healTrigger) {
                            const animId = animation.startTime;
                            if (!this._crackTriggeredAnimations.has(animId)) {
                                this._crackTriggeredAnimations.add(animId);
                                accumulated.crackHealTrigger = true;
                                accumulated.crackHealDuration = c.healDuration || 1500;
                            }
                        }

                        // Store latest crack params for glow updates
                        if (c.enabled) {
                            accumulated.crack = { ...c };
                        }
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

        // Clean up old crack trigger tracking (remove animations that are no longer active)
        const activeAnimIds = new Set(animations.map(a => a.startTime));
        for (const animId of this._crackTriggeredAnimations) {
            if (!activeAnimIds.has(animId)) {
                this._crackTriggeredAnimations.delete(animId);
            }
        }

        // Apply base values to accumulated results
        const finalScale = baseScale * accumulated.scale;
        const finalGlowIntensity = baseGlowIntensity * accumulated.glowIntensity;

        // Combine uniform and non-uniform scale
        // If non-uniform scale is used, apply it on top of uniform scale
        const hasNonUniformScale = accumulated.nonUniformScale[0] !== 1.0 ||
                                   accumulated.nonUniformScale[1] !== 1.0 ||
                                   accumulated.nonUniformScale[2] !== 1.0;
        const finalNonUniformScale = hasNonUniformScale ? [
            finalScale * accumulated.nonUniformScale[0],
            finalScale * accumulated.nonUniformScale[1],
            finalScale * accumulated.nonUniformScale[2]
        ] : null;

        return {
            // Absolute gesture outputs
            position: accumulated.position,
            rotation: finalRotation,
            scale: finalScale,
            nonUniformScale: finalNonUniformScale,  // [x, y, z] or null for uniform
            glowIntensity: finalGlowIntensity,
            glowBoost: accumulated.glowBoost,
            glowColorOverride: accumulated.glowColorOverride,
            electricOverlay: accumulated.electricOverlay,
            waterOverlay: accumulated.waterOverlay,
            fireOverlay: accumulated.fireOverlay,

            // Camera-relative channels (view-space, transformed in Core3DManager)
            cameraRelativePosition: accumulated.cameraRelativePosition,
            cameraRelativeRotation: accumulated.cameraRelativeRotation,

            // Accent gesture outputs (for groove enhancement)
            positionBoost: accumulated.positionBoost,
            rotationBoost: accumulated.rotationBoost,
            scaleBoost: accumulated.scaleBoost,

            // Gesture type flags (for groove blending decisions)
            hasAccentGestures: accumulated.hasAccentGestures,
            hasAbsoluteGestures: accumulated.hasAbsoluteGestures,
            hasCameraRelativeGestures: accumulated.hasCameraRelativeGestures,

            // Freeze channels (0 = normal, 1 = frozen) - for hold gesture
            freezeRotation: accumulated.freezeRotation,
            freezeWobble: accumulated.freezeWobble,
            freezeGroove: accumulated.freezeGroove,
            freezeParticles: accumulated.freezeParticles,

            // Deformation channel for localized vertex displacement
            deformation: accumulated.deformation,

            // Shatter channel for geometry fragmentation
            shatter: accumulated.shatter,

            // Crack channel for post-processing crack overlay (PERSISTENT MODEL)
            crack: accumulated.crack,
            crackTriggers: accumulated.crackTriggers,       // New impacts to add
            crackHealTrigger: accumulated.crackHealTrigger, // Start healing animation
            crackHealDuration: accumulated.crackHealDuration,

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
