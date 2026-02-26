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

        // Pre-allocated accumulator object (reset each frame instead of recreating)
        // This eliminates per-frame object allocation for ~30+ properties
        this._accumulated = {
            position: [0, 0, 0],
            rotationQuat: this.accumulatedRotationQuat,
            scale: 1.0,
            nonUniformScale: [1.0, 1.0, 1.0],
            glowIntensity: 1.0,
            glowBoost: 0.0,
            glowColorOverride: null,
            electricOverlay: null,
            waterOverlay: null,
            fireOverlay: null,
            smokeOverlay: null,
            voidOverlay: null,
            iceOverlay: null,
            lightOverlay: null,
            poisonOverlay: null,
            earthOverlay: null,
            natureOverlay: null,
            meshOpacity: 1.0,
            cameraRelativePosition: [0, 0, 0],
            cameraRelativeRotation: [0, 0, 0],
            positionBoost: [0, 0, 0],
            rotationBoost: [0, 0, 0],
            scaleBoost: 1.0,
            hasAccentGestures: false,
            hasAbsoluteGestures: false,
            hasCameraRelativeGestures: false,
            freezeRotation: 0,
            freezeWobble: 0,
            freezeGroove: 0,
            freezeParticles: 0,
            deformation: null,
            shatter: null,
            crack: null,
            crackTriggers: null,
            crackHealTrigger: false,
            crackHealDuration: 1500,
        };

        // Pre-allocated result object (avoids allocation on return)
        this._result = {
            position: null,
            rotation: [0, 0, 0],
            scale: 1.0,
            nonUniformScale: null,
            glowIntensity: 1.0,
            glowBoost: 0.0,
            glowColorOverride: null,
            electricOverlay: null,
            waterOverlay: null,
            fireOverlay: null,
            smokeOverlay: null,
            voidOverlay: null,
            iceOverlay: null,
            lightOverlay: null,
            poisonOverlay: null,
            earthOverlay: null,
            natureOverlay: null,
            meshOpacity: 1.0,
            cameraRelativePosition: null,
            cameraRelativeRotation: null,
            positionBoost: null,
            rotationBoost: null,
            scaleBoost: 1.0,
            hasAccentGestures: false,
            hasAbsoluteGestures: false,
            hasCameraRelativeGestures: false,
            freezeRotation: 0,
            freezeWobble: 0,
            freezeGroove: 0,
            freezeParticles: 0,
            deformation: null,
            shatter: null,
            crack: null,
            crackTriggers: null,
            crackHealTrigger: false,
            crackHealDuration: 1500,
            gestureQuaternion: null,
        };

        // Pre-allocated arrays for non-uniform scale result
        this._finalNonUniformScale = [1.0, 1.0, 1.0];
    }

    /**
     * Reset accumulated values to defaults (called at start of blend)
     * @private
     */
    _resetAccumulated() {
        const a = this._accumulated;
        a.position[0] = 0;
        a.position[1] = 0;
        a.position[2] = 0;
        a.scale = 1.0;
        a.nonUniformScale[0] = 1.0;
        a.nonUniformScale[1] = 1.0;
        a.nonUniformScale[2] = 1.0;
        a.glowIntensity = 1.0;
        a.glowBoost = 0.0;
        a.glowColorOverride = null;
        a.electricOverlay = null;
        a.waterOverlay = null;
        a.fireOverlay = null;
        a.smokeOverlay = null;
        a.voidOverlay = null;
        a.iceOverlay = null;
        a.lightOverlay = null;
        a.poisonOverlay = null;
        a.earthOverlay = null;
        a.natureOverlay = null;
        a.meshOpacity = 1.0;
        a.cameraRelativePosition[0] = 0;
        a.cameraRelativePosition[1] = 0;
        a.cameraRelativePosition[2] = 0;
        a.cameraRelativeRotation[0] = 0;
        a.cameraRelativeRotation[1] = 0;
        a.cameraRelativeRotation[2] = 0;
        a.positionBoost[0] = 0;
        a.positionBoost[1] = 0;
        a.positionBoost[2] = 0;
        a.rotationBoost[0] = 0;
        a.rotationBoost[1] = 0;
        a.rotationBoost[2] = 0;
        a.scaleBoost = 1.0;
        a.hasAccentGestures = false;
        a.hasAbsoluteGestures = false;
        a.hasCameraRelativeGestures = false;
        a.freezeRotation = 0;
        a.freezeWobble = 0;
        a.freezeGroove = 0;
        a.freezeParticles = 0;
        a.deformation = null;
        a.shatter = null;
        a.crack = null;
        a.crackTriggers = null;
        a.crackHealTrigger = false;
        a.crackHealDuration = 1500;
        this.accumulatedRotationQuat.identity();
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
        // Reset pre-allocated accumulator to defaults (avoids per-frame object allocation)
        this._resetAccumulated();
        const accumulated = this._accumulated;

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
                    // Apply fadeEnvelope to prevent snap when gesture is removed
                    // At fadeEnvelope=0, contribution is 1.0 (neutral); at 1.0, full gesture value
                    if (output.glowIntensity !== undefined) {
                        const fadedGlow = 1.0 + (output.glowIntensity - 1.0) * fadeEnvelope;
                        accumulated.glowIntensity *= fadedGlow;
                    }

                    // GLOW BOOST: Additive blending for isolated glow layer
                    // Apply fadeEnvelope (neutral = 0)
                    if (output.glowBoost !== undefined) {
                        accumulated.glowBoost += output.glowBoost * fadeEnvelope;
                    }

                    // GLOW COLOR OVERRIDE: Last-wins (for electric/elemental effects)
                    // Temporary color override that doesn't affect emotion glow
                    if (output.glowColorOverride) {
                        accumulated.glowColorOverride = output.glowColorOverride;
                    }

                    // ELECTRIC OVERLAY: Shader overlay for electrocution effect
                    // Last-wins blending (strongest charge takes precedence)
                    if (output.electricOverlay && output.electricOverlay.enabled) {
                        if (
                            !accumulated.electricOverlay ||
                            output.electricOverlay.charge > accumulated.electricOverlay.charge
                        ) {
                            accumulated.electricOverlay = { ...output.electricOverlay };
                        }
                    }

                    // WATER OVERLAY: Shader overlay for fluid/wet effect
                    // Last-wins blending (strongest wetness takes precedence)
                    if (output.waterOverlay && output.waterOverlay.enabled) {
                        if (
                            !accumulated.waterOverlay ||
                            output.waterOverlay.wetness > accumulated.waterOverlay.wetness
                        ) {
                            accumulated.waterOverlay = { ...output.waterOverlay };
                        }
                    }

                    // FIRE OVERLAY: Shader overlay for fire/heat effect
                    // Last-wins blending (strongest heat takes precedence)
                    if (output.fireOverlay && output.fireOverlay.enabled) {
                        if (
                            !accumulated.fireOverlay ||
                            output.fireOverlay.heat > accumulated.fireOverlay.heat
                        ) {
                            accumulated.fireOverlay = { ...output.fireOverlay };
                        }
                    }

                    // SMOKE OVERLAY: Shader overlay for smoke/fog effect
                    // Last-wins blending (strongest thickness takes precedence)
                    if (output.smokeOverlay && output.smokeOverlay.enabled) {
                        if (
                            !accumulated.smokeOverlay ||
                            output.smokeOverlay.thickness > accumulated.smokeOverlay.thickness
                        ) {
                            accumulated.smokeOverlay = { ...output.smokeOverlay };
                        }
                    }

                    // VOID OVERLAY: Shader overlay for void/darkness absorption effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.voidOverlay && output.voidOverlay.enabled) {
                        if (
                            !accumulated.voidOverlay ||
                            output.voidOverlay.strength > accumulated.voidOverlay.strength
                        ) {
                            accumulated.voidOverlay = { ...output.voidOverlay };
                        }
                    }

                    // ICE OVERLAY: Shader overlay for frost/freezing effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.iceOverlay && output.iceOverlay.enabled) {
                        if (
                            !accumulated.iceOverlay ||
                            output.iceOverlay.strength > accumulated.iceOverlay.strength
                        ) {
                            accumulated.iceOverlay = { ...output.iceOverlay };
                        }
                    }

                    // LIGHT OVERLAY: Shader overlay for radiance/holy effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.lightOverlay && output.lightOverlay.enabled) {
                        if (
                            !accumulated.lightOverlay ||
                            output.lightOverlay.strength > accumulated.lightOverlay.strength
                        ) {
                            accumulated.lightOverlay = { ...output.lightOverlay };
                        }
                    }

                    // POISON OVERLAY: Shader overlay for toxic/acid effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.poisonOverlay && output.poisonOverlay.enabled) {
                        if (
                            !accumulated.poisonOverlay ||
                            output.poisonOverlay.strength > accumulated.poisonOverlay.strength
                        ) {
                            accumulated.poisonOverlay = { ...output.poisonOverlay };
                        }
                    }

                    // EARTH OVERLAY: Shader overlay for stone/petrification effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.earthOverlay && output.earthOverlay.enabled) {
                        if (
                            !accumulated.earthOverlay ||
                            output.earthOverlay.strength > accumulated.earthOverlay.strength
                        ) {
                            accumulated.earthOverlay = { ...output.earthOverlay };
                        }
                    }

                    // NATURE OVERLAY: Shader overlay for plant/growth effect
                    // Last-wins blending (strongest strength takes precedence)
                    if (output.natureOverlay && output.natureOverlay.enabled) {
                        if (
                            !accumulated.natureOverlay ||
                            output.natureOverlay.strength > accumulated.natureOverlay.strength
                        ) {
                            accumulated.natureOverlay = { ...output.natureOverlay };
                        }
                    }

                    // MESH OPACITY: Fade mascot visibility (for smokebomb/vanish/materialize)
                    // Takes minimum - most faded wins when multiple effects active
                    if (output.meshOpacity !== undefined) {
                        accumulated.meshOpacity = Math.min(
                            accumulated.meshOpacity,
                            output.meshOpacity
                        );
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
                        accumulated.cameraRelativePosition[0] +=
                            output.cameraRelativePosition[0] * fadeEnvelope;
                        accumulated.cameraRelativePosition[1] +=
                            output.cameraRelativePosition[1] * fadeEnvelope;
                        accumulated.cameraRelativePosition[2] +=
                            output.cameraRelativePosition[2] * fadeEnvelope;
                        accumulated.hasCameraRelativeGestures = true;
                    }

                    // Rotation in view space: Z = roll (tilt left/right as seen by camera)
                    // Transformed to world-space rotation in Core3DManager
                    if (output.cameraRelativeRotation) {
                        accumulated.cameraRelativeRotation[0] +=
                            output.cameraRelativeRotation[0] * fadeEnvelope;
                        accumulated.cameraRelativeRotation[1] +=
                            output.cameraRelativeRotation[1] * fadeEnvelope;
                        accumulated.cameraRelativeRotation[2] +=
                            output.cameraRelativeRotation[2] * fadeEnvelope;
                        accumulated.hasCameraRelativeGestures = true;
                    }

                    // ═══════════════════════════════════════════════════════════════
                    // FREEZE CHANNELS (for hold gesture "pause button" effect)
                    // ═══════════════════════════════════════════════════════════════
                    // Use MAX blending - strongest freeze wins
                    if (output.freezeRotation !== undefined) {
                        accumulated.freezeRotation = Math.max(
                            accumulated.freezeRotation,
                            output.freezeRotation * fadeEnvelope
                        );
                    }
                    if (output.freezeWobble !== undefined) {
                        accumulated.freezeWobble = Math.max(
                            accumulated.freezeWobble,
                            output.freezeWobble * fadeEnvelope
                        );
                    }
                    if (output.freezeGroove !== undefined) {
                        accumulated.freezeGroove = Math.max(
                            accumulated.freezeGroove,
                            output.freezeGroove * fadeEnvelope
                        );
                    }
                    if (output.freezeParticles !== undefined) {
                        accumulated.freezeParticles = Math.max(
                            accumulated.freezeParticles,
                            output.freezeParticles * fadeEnvelope
                        );
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

                        if (
                            !accumulated.deformation ||
                            d.strength > accumulated.deformation.strength
                        ) {
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
                            accumulated.shatter.reassembleDuration =
                                output.shatter.reassembleDuration || 1000;
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
                                    glowStrength: c.glowStrength,
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
            accumulated.positionBoost[i] = Math.max(
                -0.05,
                Math.min(0.05, accumulated.positionBoost[i])
            );
        }

        // rotationBoost: limit each axis to ±0.1 radians (~6 degrees)
        for (let i = 0; i < 3; i++) {
            accumulated.rotationBoost[i] = Math.max(
                -0.1,
                Math.min(0.1, accumulated.rotationBoost[i])
            );
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
            baseEuler[2] + gestureZ,
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
        const hasNonUniformScale =
            accumulated.nonUniformScale[0] !== 1.0 ||
            accumulated.nonUniformScale[1] !== 1.0 ||
            accumulated.nonUniformScale[2] !== 1.0;

        // Use pre-allocated non-uniform scale array when needed
        let finalNonUniformScale = null;
        if (hasNonUniformScale) {
            this._finalNonUniformScale[0] = finalScale * accumulated.nonUniformScale[0];
            this._finalNonUniformScale[1] = finalScale * accumulated.nonUniformScale[1];
            this._finalNonUniformScale[2] = finalScale * accumulated.nonUniformScale[2];
            finalNonUniformScale = this._finalNonUniformScale;
        }

        // Populate pre-allocated result object (avoids per-frame object allocation)
        const r = this._result;

        // Absolute gesture outputs
        r.position = accumulated.position;
        r.rotation[0] = finalRotation[0];
        r.rotation[1] = finalRotation[1];
        r.rotation[2] = finalRotation[2];
        r.scale = finalScale;
        r.nonUniformScale = finalNonUniformScale;
        r.glowIntensity = finalGlowIntensity;
        r.glowBoost = accumulated.glowBoost;
        r.glowColorOverride = accumulated.glowColorOverride;
        r.electricOverlay = accumulated.electricOverlay;
        r.waterOverlay = accumulated.waterOverlay;
        r.fireOverlay = accumulated.fireOverlay;
        r.smokeOverlay = accumulated.smokeOverlay;
        r.voidOverlay = accumulated.voidOverlay;
        r.iceOverlay = accumulated.iceOverlay;
        r.lightOverlay = accumulated.lightOverlay;
        r.poisonOverlay = accumulated.poisonOverlay;
        r.earthOverlay = accumulated.earthOverlay;
        r.natureOverlay = accumulated.natureOverlay;
        r.meshOpacity = accumulated.meshOpacity;

        // Camera-relative channels
        r.cameraRelativePosition = accumulated.cameraRelativePosition;
        r.cameraRelativeRotation = accumulated.cameraRelativeRotation;

        // Accent gesture outputs
        r.positionBoost = accumulated.positionBoost;
        r.rotationBoost = accumulated.rotationBoost;
        r.scaleBoost = accumulated.scaleBoost;

        // Gesture type flags
        r.hasAccentGestures = accumulated.hasAccentGestures;
        r.hasAbsoluteGestures = accumulated.hasAbsoluteGestures;
        r.hasCameraRelativeGestures = accumulated.hasCameraRelativeGestures;

        // Freeze channels
        r.freezeRotation = accumulated.freezeRotation;
        r.freezeWobble = accumulated.freezeWobble;
        r.freezeGroove = accumulated.freezeGroove;
        r.freezeParticles = accumulated.freezeParticles;

        // Deformation channel
        r.deformation = accumulated.deformation;

        // Shatter channel
        r.shatter = accumulated.shatter;

        // Crack channel
        r.crack = accumulated.crack;
        r.crackTriggers = accumulated.crackTriggers;
        r.crackHealTrigger = accumulated.crackHealTrigger;
        r.crackHealDuration = accumulated.crackHealDuration;

        // Debug
        r.gestureQuaternion = accumulated.rotationQuat;

        return r;
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
