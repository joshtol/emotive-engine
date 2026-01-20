/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shatter Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for shatter gestures that trigger mesh fragmentation
 * @author Emotive Engine Team
 * @module gestures/transforms/shatterFactory
 *
 * SHATTER: Mesh breaks into fragments that fly apart, optionally revealing
 * an inner mesh (soul). Used for dramatic storytelling moments.
 *
 * ## Variants
 *
 * - `shatter` (default): Standard outward explosion from impact point
 * - `shatterExplosive`: High-energy explosion from center
 * - `shatterCrumble`: Gravity-driven collapse (slower, more dramatic)
 *
 * ## Animation Phases
 *
 * 1. Build-up (0-10%): Glow intensifies, slight scale increase
 * 2. Trigger (10%): Shatter event fires, mesh hidden, shards activated
 * 3. Aftermath (10-100%): Shards animate, glow fades
 */

/**
 * Shatter variant configurations
 */
const SHATTER_VARIANTS = {
    default: {
        name: 'shatter',
        emoji: '💥',
        description: 'Dramatic shattering effect',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        impactPoint: [0, 0, 0.4],     // Front-center
        impactDirection: [0, 0, -1],   // Toward camera
        reassemble: false,
        revealSoul: false              // No soul reveal for standard shatter
    },
    explosive: {
        name: 'shatterExplosive',
        emoji: '🔥',
        description: 'Explosive outward shatter',
        duration: 2000,
        beats: 3,
        intensity: 1.5,
        impactPoint: [0, 0, 0],        // Center
        impactDirection: [0, 1, 0],    // Upward explosion
        reassemble: false,
        revealSoul: true               // Soul reveal for explosive
    },
    crumble: {
        name: 'shatterCrumble',
        emoji: '🪨',
        description: 'Slow crumbling collapse',
        duration: 8000,               // Long duration for dramatic effect
        beats: 16,                    // More beats for longer duration
        intensity: 0.15,              // Very low intensity
        impactPoint: [0, -0.4, 0],    // Bottom
        impactDirection: [0, -1, 0],  // Downward
        reassemble: false,
        revealSoul: true,             // Soul reveal for crumble
        // Crumble-specific physics - ultra slow motion
        gravity: -0.8,                // Extremely slow gravity (normal is -9.8)
        explosionForce: 0.1,          // Almost no explosion - gentle fall apart
        rotationForce: 0.5,           // Very slow tumble
        // Trigger shatter immediately (no build-up phase)
        shatterTriggerAt: 0.0         // Shatter at 0% instead of default 10%
    },
    // Shatter then reassemble (dramatic reveal then reform)
    reform: {
        name: 'shatterReform',
        emoji: '✨',
        description: 'Shatter then magically reassemble',
        duration: 4000,
        beats: 8,
        intensity: 1.0,
        impactPoint: [0, 0, 0.4],
        impactDirection: [0, 0, -1],
        reassemble: true,
        reassembleAt: 0.5,             // Start reassembly at 50%
        reassembleDuration: 1500,      // ms for reassembly
        revealSoul: true               // Soul reveal for reform
    },
    // Punch from a specific direction (uses oof deformation before shatter)
    punchLeft: {
        name: 'shatterPunchLeft',
        emoji: '👊',
        description: 'Shatter from left impact with deformation',
        duration: 1500,
        beats: 2,
        intensity: 1.2,
        impactPoint: [-0.4, 0, 0],     // Dent on left side (negative X) - hit from left
        impactDirection: [1, 0, 0],    // Shards fly right (positive X) - away from punch
        reassemble: false,
        useDeformation: true,
        direction: 'left',
        revealSoul: false              // No soul reveal for punch
    },
    punchRight: {
        name: 'shatterPunchRight',
        emoji: '👊',
        description: 'Shatter from right impact with deformation',
        duration: 1500,
        beats: 2,
        intensity: 1.2,
        impactPoint: [0.4, 0, 0],      // Dent on right side (positive X) - hit from right
        impactDirection: [-1, 0, 0],   // Shards fly left (negative X) - away from punch
        reassemble: false,
        useDeformation: true,
        direction: 'right',
        revealSoul: false              // No soul reveal for punch
    },
    punchFront: {
        name: 'shatterPunchFront',
        emoji: '👊',
        description: 'Shatter from front impact with deformation',
        duration: 1500,
        beats: 2,
        intensity: 1.2,
        impactPoint: [0, 0, 0.4],      // Front
        impactDirection: [0, 0, -1],   // Force goes back
        reassemble: false,
        useDeformation: true,
        direction: 'front',
        revealSoul: false              // No soul reveal for punch
    },
    // Suspend mode: explode, freeze mid-air, then reassemble
    suspend: {
        name: 'shatterSuspend',
        emoji: '🌌',
        description: 'Shatter, freeze mid-air, then reassemble',
        duration: 4000,
        beats: 8,
        intensity: 0.8,                // Slightly reduced intensity
        impactPoint: [0, 0, 0],        // Center explosion
        impactDirection: [0, 1, 0],    // Upward bias
        reassemble: true,
        reassembleAt: 0.70,            // Start reassembly at 70%
        reassembleDuration: 1200,      // ms for reassembly (slightly shorter)
        revealSoul: true,              // Soul reveal during suspend
        // Suspend-specific settings
        isSuspendMode: true,
        suspendAt: 0.12,               // Start decelerating IMMEDIATELY after shatter (shatter is at 10%)
        suspendDuration: 0.20,         // Quick deceleration (12-32%)
        // Lower initial forces so shards don't go too far before freezing
        gravity: -2.0,                 // Much lower gravity
        explosionForce: 1.2            // Reduced explosion force
    },
    // Freeze mode: explode, freeze mid-air indefinitely (manual reassembly via API)
    freeze: {
        name: 'shatterFreeze',
        emoji: '❄️',
        description: 'Shatter and freeze mid-air (call triggerReassembly to reform)',
        duration: 2000,                // Short duration - just enough for explosion + freeze
        beats: 4,
        intensity: 0.8,
        impactPoint: [0, 0, 0],        // Center explosion
        impactDirection: [0, 1, 0],    // Upward bias
        reassemble: false,             // NO auto-reassembly - must be triggered via API
        revealSoul: true,              // Soul reveal during freeze
        // Freeze-specific settings
        isFreezeMode: true,            // New flag for freeze behavior
        isSuspendMode: true,           // Use suspend physics to freeze shards
        suspendAt: 0.12,               // Start decelerating immediately
        suspendDuration: 0.20,         // Quick deceleration
        // Lower initial forces
        gravity: -2.0,
        explosionForce: 1.2
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // DUAL-MODE GESTURES - Work differently from IDLE vs FROZEN state
    // From IDLE: shatter first, then apply behavior
    // From FROZEN: apply behavior to existing frozen shards
    // ═══════════════════════════════════════════════════════════════════════════════

    // Implode: shards fly inward to center point (like reverse explosion)
    // From IDLE: Shatters then implodes shards to center
    // From FROZEN: Implodes existing frozen shards
    implode: {
        name: 'shatterImplode',
        emoji: '🌀',
        description: 'Shards implode inward to center (or implode existing frozen shards)',
        duration: 2500,
        beats: 4,
        intensity: 0.8,
        impactPoint: [0, 0, 0],
        impactDirection: [0, 1, 0],
        reassemble: false,
        revealSoul: true,
        // Dual-mode: behavior applied after shatter OR to frozen shards
        isDualMode: true,
        dualModeType: 'implode',
        dualModeDuration: 1800,
        // Normal shatter physics (no freeze)
        gravity: -3.0,
        explosionForce: 1.2
    },

    // Gravity: shards fall and bounce on invisible floor
    // From IDLE: Shatters then drops shards with gravity
    // From FROZEN: Drops existing frozen shards
    gravity: {
        name: 'shatterGravity',
        emoji: '⬇️',
        description: 'Shards fall with gravity and bounce on floor (or drop frozen shards)',
        duration: 4000,
        beats: 8,
        intensity: 0.6,
        impactPoint: [0, 0, 0],
        impactDirection: [0, -1, 0],
        reassemble: false,
        revealSoul: true,
        // Dual-mode settings
        isDualMode: true,
        dualModeType: 'gravity',
        dualModeDuration: 3000,
        floorY: -0.35,              // Floor just below mascot center
        // Minimal explosion - shards mostly just fall
        gravity: -2.0,
        explosionForce: 0.4
    },

    // Orbit: shards transition into orbiting paths around soul, then reassemble
    // From IDLE: Shatters, orbits shards around soul, then reassembles
    // From FROZEN: Makes existing frozen shards orbit, then reassembles
    orbit: {
        name: 'shatterOrbit',
        emoji: '🪐',
        description: 'Shards orbit around the soul then reassemble',
        duration: 5000,
        beats: 10,
        intensity: 0.6,
        impactPoint: [0, 0, 0],
        impactDirection: [0, 1, 0],
        reassemble: true,           // Reassemble after orbit
        reassembleAt: 0.75,         // Start reassembly at 75%
        reassembleDuration: 1200,   // 1.2s reassembly
        revealSoul: true,
        // Dual-mode settings
        isDualMode: true,
        dualModeType: 'orbit',
        dualModeDuration: 3500,     // Orbit duration before reassembly kicks in
        orbitSpeed: 1.5,
        radiusMultiplier: 1.2,
        // Normal shatter physics
        gravity: -3.0,
        explosionForce: 1.0
    },
};

/**
 * Create a shatter gesture
 * @param {string} [variant='default'] - 'default', 'explosive', or 'crumble'
 * @returns {Object} Gesture definition
 */
export function createShatterGesture(variant = 'default') {
    const config = SHATTER_VARIANTS[variant] || SHATTER_VARIANTS.default;

    return {
        name: config.name,
        emoji: config.emoji,
        type: 'override',
        description: config.description,

        config: {
            duration: config.duration,
            musicalDuration: { musical: true, beats: config.beats },
            intensity: config.intensity,
            variant
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: config.beats },
            timingSync: 'onBeat',
            accentResponse: {
                enabled: true,
                multiplier: 1.3
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = motion.config || this.config || {};
                const intensity = cfg.intensity || 1.0;
                const variantType = cfg.variant || 'default';
                const variantConfig = SHATTER_VARIANTS[variantType] || SHATTER_VARIANTS.default;

                // Check if this is a punch variant with deformation
                const useDeformation = variantConfig.useDeformation || false;
                const punchDir = variantConfig.direction || 'front';

                // Track triggers (only fire once per animation)
                let shatterTrigger = false;
                let reassembleTrigger = false;
                let glowIntensity = 1.0;
                let glowBoost = 0;
                let scale = 1.0;

                // Deformation output (for punch variants)
                let deformation = null;
                let cameraRelativePosition = null;
                let cameraRelativeRotation = null;

                // Reassembly timing
                const hasReassembly = variantConfig.reassemble;
                const reassembleAt = variantConfig.reassembleAt || 0.5;

                // ═══════════════════════════════════════════════════════════════
                // PUNCH VARIANTS - Deformation + Shatter
                // ═══════════════════════════════════════════════════════════════
                if (useDeformation) {
                    // Punch animation: 0-30% deform, 30% shatter, 30-100% aftermath

                    // Recoil curve for punch (peaks at 30%)
                    let recoil;
                    if (progress < 0.3) {
                        const t = progress / 0.3;
                        recoil = t * (2 - t);  // Fast out
                    } else {
                        recoil = 0;  // Shattered, no more recoil
                    }

                    // Dent strength (builds up, then mesh shatters)
                    let dentStrength = 0;
                    if (progress < 0.25) {
                        dentStrength = progress / 0.25;  // Ramp up
                    } else if (progress < 0.3) {
                        dentStrength = 1.0;  // Hold at max
                    }
                    // After 0.3, mesh is shattered - no deformation

                    const moveDist = 0.15 * intensity;
                    const tiltAngle = 0.25 * intensity;

                    let posX = 0, posZ = 0;
                    const posY = 0;
                    let rotX = 0, rotZ = 0;

                    switch (punchDir) {
                    case 'left':
                        // Punched from left = recoil to the RIGHT (positive X in camera space)
                        posX = recoil * moveDist;
                        rotZ = -recoil * tiltAngle;  // Tilt away from punch (top goes right)
                        break;
                    case 'right':
                        // Punched from right = recoil to the LEFT (negative X in camera space)
                        posX = -recoil * moveDist;
                        rotZ = recoil * tiltAngle;   // Tilt away from punch (top goes left)
                        break;
                    case 'front':
                        posZ = -recoil * moveDist;
                        rotX = recoil * tiltAngle * 0.7;
                        break;
                    }

                    if (recoil > 0) {
                        cameraRelativePosition = [posX, posY, posZ];
                        cameraRelativeRotation = [rotX, 0, rotZ];
                    }

                    // Deformation (only before shatter)
                    if (dentStrength > 0) {
                        deformation = {
                            enabled: true,
                            strength: dentStrength * intensity * 2.5,
                            impactPoint: variantConfig.impactPoint,
                            falloffRadius: 0.5
                        };
                    }

                    // Trigger shatter at 30%
                    if (progress >= 0.28 && progress < 0.32) {
                        shatterTrigger = true;
                    }

                    // Glow flash on impact
                    if (progress < 0.35) {
                        const t = progress / 0.35;
                        glowIntensity = 1.0 + (1 - t) * 0.8;
                        glowBoost = (1 - t) * 0.5;
                    }
                }
                // ═══════════════════════════════════════════════════════════════
                // STANDARD SHATTER VARIANTS
                // ═══════════════════════════════════════════════════════════════
                else {
                    // Custom trigger point (e.g., crumble triggers immediately at 0%)
                    const triggerAt = variantConfig.shatterTriggerAt !== undefined ? variantConfig.shatterTriggerAt : 0.1;
                    const triggerEnd = triggerAt + 0.02;

                    // PHASE 1: BUILD-UP (0 to triggerAt)
                    if (progress < triggerAt) {
                        if (triggerAt > 0) {
                            const t = progress / triggerAt;
                            // Ease in
                            const eased = t * t;

                            glowIntensity = 1.0 + eased * 0.6;
                            glowBoost = eased * 0.3;
                            scale = 1.0 + eased * 0.05;

                            // Subtle shake before shatter
                            if (variantType === 'explosive') {
                                const shake = Math.sin(progress * 200) * 0.01 * t;
                                scale += shake;
                            }
                        }
                    }
                    // ═══════════════════════════════════════════════════════════════
                    // PHASE 2: TRIGGER POINT (triggerAt to triggerEnd)
                    // ═══════════════════════════════════════════════════════════════
                    else if (progress < triggerEnd) {
                        // Trigger shatter at exactly triggerAt
                        shatterTrigger = progress >= triggerAt && progress < triggerAt + 0.005;

                        glowIntensity = 1.6;
                        glowBoost = 0.4;
                        scale = 1.05;
                    }
                    // ═══════════════════════════════════════════════════════════════
                    // PHASE 3: AFTERMATH / REASSEMBLY
                    // ═══════════════════════════════════════════════════════════════
                    else {
                        // Check for reassembly trigger
                        if (hasReassembly && progress >= reassembleAt && progress < reassembleAt + 0.02) {
                            reassembleTrigger = true;
                        }

                        // Glow behavior differs for reform variant
                        if (hasReassembly && progress >= reassembleAt) {
                            // Build up glow during reassembly
                            const reassemblyProgress = (progress - reassembleAt) / (1 - reassembleAt);
                            const eased = reassemblyProgress * reassemblyProgress;
                            glowIntensity = 1.0 + eased * 0.8;
                            glowBoost = eased * 0.5;

                            // Final flash at completion
                            if (progress > 0.95) {
                                glowIntensity = 2.0;
                                glowBoost = 0.8;
                            }
                        } else {
                            const t = (progress - triggerEnd) / (hasReassembly ? (reassembleAt - triggerEnd) : (1 - triggerEnd));
                            const clampedT = Math.min(1, t);
                            // Ease out
                            const eased = 1 - (1 - clampedT) * (1 - clampedT);

                            glowIntensity = 1.6 - eased * 0.6;
                            glowBoost = 0.4 - eased * 0.4;
                        }
                        scale = 1.0;
                    }
                }

                const result = {
                    scale,
                    glowIntensity,
                    glowBoost,

                    // Shatter channel - consumed by Core3DManager
                    shatter: {
                        enabled: shatterTrigger,
                        impactPoint: variantConfig.impactPoint,
                        impactDirection: variantConfig.impactDirection || [0, 0, -1],
                        intensity: intensity * variantConfig.intensity,
                        variant: variantType,
                        // Reassembly triggers
                        reassemble: reassembleTrigger,
                        reassembleDuration: variantConfig.reassembleDuration || 1000,
                        // Soul reveal control
                        revealSoul: variantConfig.revealSoul !== false, // Default true for backwards compat
                        // Crack mode: minimal scatter, no gravity, shards stay in place
                        isCrackMode: variantConfig.isCrackMode || false,
                        crackSeparation: variantConfig.crackSeparation || 0.02,
                        // Suspend mode: explode, freeze mid-air, then reassemble
                        isSuspendMode: variantConfig.isSuspendMode || false,
                        suspendAt: variantConfig.suspendAt || 0.25,
                        suspendDuration: variantConfig.suspendDuration || 0.35,
                        // Freeze mode: explode, freeze indefinitely (manual reassembly via API)
                        isFreezeMode: variantConfig.isFreezeMode || false,
                        // Physics overrides (for crumble, etc.)
                        gravity: variantConfig.gravity,           // undefined = use default
                        explosionForce: variantConfig.explosionForce,
                        rotationForce: variantConfig.rotationForce,
                        // Gesture duration for suspend timing calculation
                        gestureDuration: variantConfig.duration,
                        // Dual-mode settings - ShatterSystem decides behavior based on current state
                        isDualMode: variantConfig.isDualMode || false,
                        dualModeType: variantConfig.dualModeType,
                        dualModeConfig: {
                            duration: variantConfig.dualModeDuration || 2000,
                            impactPoint: variantConfig.impactPoint,
                            windDirection: variantConfig.windDirection,
                            windForce: variantConfig.windForce,
                            turbulence: variantConfig.turbulence,
                            waveSpeed: variantConfig.waveSpeed,
                            floorY: variantConfig.floorY,
                            orbitSpeed: variantConfig.orbitSpeed,
                            radiusMultiplier: variantConfig.radiusMultiplier,
                            // Reassembly settings for dual-mode gestures (like orbit)
                            reassemble: variantConfig.reassemble,
                            reassembleDuration: variantConfig.reassembleDuration
                        }
                    }
                };

                // Add deformation for punch variants
                if (deformation) {
                    result.deformation = deformation;
                }

                // Add camera-relative transforms for punch variants
                if (cameraRelativePosition) {
                    result.cameraRelativePosition = cameraRelativePosition;
                }
                if (cameraRelativeRotation) {
                    result.cameraRelativeRotation = cameraRelativeRotation;
                }

                return result;
            }
        }
    };
}

/**
 * Create all shatter gesture variants
 * @returns {Object[]} Array of gesture definitions
 */
export function createAllShatterGestures() {
    return Object.keys(SHATTER_VARIANTS).map(variant => createShatterGesture(variant));
}

/**
 * Get available shatter variant names
 * @returns {string[]}
 */
export function getShatterVariants() {
    return Object.keys(SHATTER_VARIANTS);
}

export default createShatterGesture;
