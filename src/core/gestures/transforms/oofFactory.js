/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Oof Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional "oof" blow gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/oofFactory
 *
 * Creates oof gestures for directional blow impacts.
 * Simulates taking a hit from a direction - bends away from impact.
 *
 * OOF: Impact reaction (~700ms)
 *
 * Use cases:
 * - oofLeft: Hit from left, bends right
 * - oofRight: Hit from right, bends left
 * - oofFront: Gut punch from front, doubles over
 * - oofBack: Hit from behind, arches back
 * - oofUp: Uppercut, head snaps back
 * - oofDown: Stomp, crumples down
 */

import { capitalize } from '../motions/directions.js';

/**
 * Create an oof gesture - directional blow impact
 * @param {string} direction - 'left', 'right', 'front', 'back', 'up', 'down'
 * @returns {Object} Gesture definition
 */
export function createOofGesture(direction) {
    const validDirections = ['left', 'right', 'front', 'back', 'up', 'down'];
    if (!validDirections.includes(direction)) {
        throw new Error(`Invalid oof direction: ${direction}`);
    }

    const emojis = {
        left: '😵',
        right: '😵',
        front: '🤢',
        back: '😫',
        up: '🤕',
        down: '😖'
    };

    const descriptions = {
        left: 'Hit from left - bends right',
        right: 'Hit from right - bends left',
        front: 'Gut punch - doubles over forward',
        back: 'Hit from behind - arches back',
        up: 'Uppercut - head snaps back',
        down: 'Stomp - crumples down'
    };

    return {
        name: `oof${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 700,
            musicalDuration: { musical: true, beats: 1.5 },
            intensity: 1.0,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'oof',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 1.5 },
            timingSync: 'onBeat',

            accentResponse: {
                enabled: true,
                multiplier: 1.5
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const intensity = config.intensity || 1.0;
                const dir = config.direction || 'front';

                // OOF PHASES - Strike FIRST, then movement:
                // Phase 1 (0-0.1): IMPACT - instant compression, NO movement yet
                // Phase 2 (0.1-0.35): PAIN REACTION - vibrate/shake while doubling over, still in place
                // Phase 3 (0.35-0.65): PUSHED - NOW body moves from the accumulated force
                // Phase 4 (0.65-1.0): RECOVERY - slow return to normal

                let impactCompress = 0;  // Initial hit compression
                let painBend = 0;        // Doubling over from pain
                let pushAmount = 0;      // Being pushed by the hit (DELAYED)
                let shakeAmount = 0;

                if (progress < 0.1) {
                    // Phase 1: IMPACT - instant compression, mascot stays in place
                    const hitT = progress / 0.1;
                    impactCompress = 1 - Math.pow(1 - hitT, 3); // Very fast compression
                    // NO push yet - the blow just landed
                } else if (progress < 0.35) {
                    // Phase 2: PAIN REACTION - shake while doubling over, still no translation
                    const painT = (progress - 0.1) / 0.25;
                    impactCompress = 1.0 - painT * 0.5; // Slowly decompress
                    painBend = painT; // Build up the bend/doubling over
                    // Intense shake during pain reaction
                    shakeAmount = Math.sin(painT * Math.PI * 10) * (1 - painT * 0.5) * 0.06;
                    // Still no push - absorbing the blow
                } else if (progress < 0.65) {
                    // Phase 3: PUSHED - NOW the force sends them flying
                    const pushT = (progress - 0.35) / 0.3;
                    const pushEase = 1 - Math.pow(1 - pushT, 2); // Fast start, slow end
                    impactCompress = 0.5 - pushT * 0.4;
                    painBend = 1.0 - pushT * 0.2; // Mostly maintain the bend
                    pushAmount = pushEase; // Full push happens NOW
                    shakeAmount = Math.sin(pushT * Math.PI * 5) * (1 - pushT) * 0.03;
                } else {
                    // Phase 4: RECOVERY - slow return
                    const recoverT = (progress - 0.65) / 0.35;
                    const easeOut = recoverT < 0.5
                        ? 2 * recoverT * recoverT
                        : 1 - Math.pow(-2 * recoverT + 2, 2) / 2;
                    pushAmount = 1.0 - easeOut;
                    painBend = (1 - easeOut) * 0.8;
                    shakeAmount = Math.sin(recoverT * Math.PI * 3) * (1 - easeOut) * 0.02;
                }

                let posX = 0, posY = 0, posZ = 0;
                let rotX = 0;
                const rotY = 0;
                let rotZ = 0;

                // Camera-relative coordinate system for consistent directions:
                // X: positive = right, negative = left (from camera's view)
                // Z: positive = toward camera, negative = away
                // rotZ: positive = tilt top-left (CCW), negative = tilt top-right (CW)

                switch (dir) {
                case 'left':
                    // Hit from LEFT - compress in place, bend right, THEN pushed right
                    posX = pushAmount * 0.25 * strength; // Pushed right (only in phase 3+)
                    rotZ = -painBend * 0.55 * strength * intensity; // Bend right (top goes right)
                    posY = -impactCompress * 0.1 * strength; // Drop from impact
                    rotX = painBend * 0.2 * strength; // Forward hunch from pain
                    break;

                case 'right':
                    // Hit from RIGHT - compress in place, bend left, THEN pushed left
                    posX = -pushAmount * 0.25 * strength; // Pushed left (only in phase 3+)
                    rotZ = painBend * 0.55 * strength * intensity; // Bend left (top goes left)
                    posY = -impactCompress * 0.1 * strength;
                    rotX = painBend * 0.2 * strength;
                    break;

                case 'front':
                    // GUT PUNCH - compress, double over hard, THEN pushed back
                    posZ = -pushAmount * 0.2 * strength; // Pushed away (only in phase 3+)
                    rotX = painBend * 0.85 * strength * intensity; // Doubles over HARD
                    posY = -impactCompress * 0.15 * strength - painBend * 0.12 * strength;
                    break;

                case 'back':
                    // Hit from BEHIND - compress, arch back, THEN pushed forward
                    posZ = pushAmount * 0.25 * strength; // Pushed toward camera (only in phase 3+)
                    rotX = -painBend * 0.6 * strength * intensity; // Arch back
                    posY = impactCompress * 0.06 * strength;
                    break;

                case 'up':
                    // UPPERCUT - compress, head snaps back, THEN lifted up
                    posY = pushAmount * 0.28 * strength; // Lifted (only in phase 3+)
                    rotX = -painBend * 0.7 * strength * intensity; // Head snaps back
                    posZ = -pushAmount * 0.12 * strength; // Slight back
                    break;

                case 'down':
                    // STOMP/SLAM - crushed DOWN, distinct from front
                    posY = -pushAmount * 0.35 * strength * intensity; // Crushed (only in phase 3+)
                    rotX = painBend * 0.12 * strength; // Minimal forward hunch
                    // Heavy squash handled below
                    break;
                }

                // Add shake to rotation (happens during pain phase, not movement)
                rotZ += shakeAmount * strength;
                posX += shakeAmount * 0.3 * strength;

                // ═══════════════════════════════════════════════════════════════════
                // COMPREHENSIVE DEFORMATION SYSTEM
                // Combines 6 techniques for realistic gut-punch physics:
                // 1. Shockwave ripple - wave travels from impact outward
                // 2. Directional squish with bounce - overshoot then settle
                // 3. Asymmetric deformation - hit side compresses more
                // 4. Volume-preserving squash - scaleX × scaleY × scaleZ ≈ 1.0
                // 5. Delayed elastic recovery - jello-like wobble back
                // 6. Impact point offset + scale - position shift with compression
                // ═══════════════════════════════════════════════════════════════════

                let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;

                // Direction vectors for impact calculations
                const impactVec = {
                    left:  { primary: 'x', sign: -1, secondary: ['y', 'z'] },
                    right: { primary: 'x', sign: 1, secondary: ['y', 'z'] },
                    front: { primary: 'z', sign: 1, secondary: ['x', 'y'] },
                    back:  { primary: 'z', sign: -1, secondary: ['x', 'y'] },
                    up:    { primary: 'y', sign: 1, secondary: ['x', 'z'] },
                    down:  { primary: 'y', sign: -1, secondary: ['x', 'z'] }
                };
                // impactVec lookup validates direction but isn't used directly
                void (impactVec[dir] || impactVec.front);

                // ─────────────────────────────────────────────────────────────────
                // 1. SHOCKWAVE RIPPLE - Wave travels through mesh from impact point
                // ─────────────────────────────────────────────────────────────────
                // The wave starts at impact, travels outward, creating sequential
                // compression/expansion as it passes through
                const waveSpeed = 4.0; // How fast wave traverses the mesh
                const wavePhase = progress * Math.PI * waveSpeed;
                const waveDamping = Math.exp(-progress * 2.5); // Exponential decay
                const rippleWave = Math.sin(wavePhase) * waveDamping * 0.08;

                // ─────────────────────────────────────────────────────────────────
                // 2. DIRECTIONAL SQUISH WITH BOUNCE - Overshoot then wobble-settle
                // ─────────────────────────────────────────────────────────────────
                // Like a stress ball: compresses past equilibrium, bounces back,
                // overshoots the other way, settles with decreasing amplitude
                let squishAmount = 0;
                if (progress < 0.15) {
                    // Initial compression - fast squish with slight overshoot
                    const t = progress / 0.15;
                    const overshoot = 1.2; // 20% overshoot
                    squishAmount = t * overshoot * (1 - Math.pow(t - 1, 2) * 0.2);
                } else if (progress < 0.65) {
                    // Bounce phase - damped oscillation
                    const t = (progress - 0.15) / 0.5;
                    const bounceFreq = 3.5; // Number of bounces
                    const bounceDamp = Math.exp(-t * 3); // Damping factor
                    // Start from overshoot (1.2), oscillate toward 0
                    squishAmount = 1.0 + Math.cos(t * Math.PI * bounceFreq) * 0.4 * bounceDamp;
                } else {
                    // Final settle - ease to rest
                    const t = (progress - 0.65) / 0.35;
                    const easeOut = 1 - Math.pow(1 - t, 3);
                    squishAmount = (1 - easeOut) * 0.3;
                }

                // ─────────────────────────────────────────────────────────────────
                // 3. ASYMMETRIC DEFORMATION - Hit side compresses MORE
                // ─────────────────────────────────────────────────────────────────
                // The side being hit compresses harder than the opposite side
                // This creates a more realistic "dented" look
                const asymmetry = 0.3; // 30% more compression on hit side
                const hitSideExtra = squishAmount * asymmetry * intensity;

                // ─────────────────────────────────────────────────────────────────
                // 5. DELAYED ELASTIC RECOVERY - Jello wobble back to normal
                // ─────────────────────────────────────────────────────────────────
                // During recovery phase, add secondary wobble like jello settling
                let elasticWobble = 0;
                if (progress > 0.4) {
                    const recoveryT = (progress - 0.4) / 0.6;
                    const wobbleFreq = 5.0;
                    const wobbleDamp = Math.exp(-recoveryT * 4);
                    elasticWobble = Math.sin(recoveryT * Math.PI * wobbleFreq) * wobbleDamp * 0.06;
                }

                // ─────────────────────────────────────────────────────────────────
                // 6. IMPACT POINT OFFSET - Position shift toward impact
                // ─────────────────────────────────────────────────────────────────
                // Already handled by posX/Y/Z above, but we add micro-offset
                // that correlates with scale for cohesive deformation
                const impactOffset = squishAmount * 0.02 * strength;

                // Apply direction-specific deformation with all effects combined
                const baseDeform = squishAmount * intensity * strength;

                switch (dir) {
                case 'left':
                case 'right':
                    // Punched from side - X compresses, Y/Z bulge
                    scaleX = 1.0 - baseDeform * 0.28 - hitSideExtra;
                    scaleY = 1.0 + baseDeform * 0.12 + rippleWave + elasticWobble;
                    scaleZ = 1.0 + baseDeform * 0.14 - rippleWave * 0.5;
                    // Add asymmetric offset
                    posX += (dir === 'left' ? -1 : 1) * impactOffset;
                    break;

                case 'front':
                    // GUT PUNCH - Z compresses HARD, X bulges, Y slight compress
                    scaleZ = 1.0 - baseDeform * 0.38 - hitSideExtra;
                    scaleX = 1.0 + baseDeform * 0.22 + rippleWave;
                    scaleY = 1.0 - baseDeform * 0.08 + elasticWobble;
                    posZ += impactOffset;
                    break;

                case 'back':
                    // Hit from behind - Z compresses, X/Y bulge
                    scaleZ = 1.0 - baseDeform * 0.32 - hitSideExtra;
                    scaleX = 1.0 + baseDeform * 0.18 + rippleWave;
                    scaleY = 1.0 + baseDeform * 0.12 + elasticWobble;
                    posZ -= impactOffset;
                    break;

                case 'up':
                    // UPPERCUT - Y compresses from below, X/Z bulge
                    scaleY = 1.0 - baseDeform * 0.22 - hitSideExtra;
                    scaleX = 1.0 + baseDeform * 0.15 + rippleWave;
                    scaleZ = 1.0 + baseDeform * 0.15 - rippleWave * 0.5 + elasticWobble;
                    posY += impactOffset;
                    break;

                case 'down':
                    // STOMP - Y compresses HARD (pancake), X/Z bulge wide
                    scaleY = 1.0 - baseDeform * 0.48 - hitSideExtra;
                    scaleX = 1.0 + baseDeform * 0.32 + rippleWave;
                    scaleZ = 1.0 + baseDeform * 0.32 - rippleWave * 0.5 + elasticWobble;
                    posY -= impactOffset;
                    break;
                }

                // ─────────────────────────────────────────────────────────────────
                // 4. VOLUME-PRESERVING SQUASH - Enforce scaleX × scaleY × scaleZ ≈ 1.0
                // ─────────────────────────────────────────────────────────────────
                // Real objects conserve volume when deformed. If you compress one
                // axis, the others must expand proportionally.
                const currentVolume = scaleX * scaleY * scaleZ;
                const volumeCorrection = Math.pow(1.0 / currentVolume, 1/3);
                // Apply gentle correction (80% toward volume preservation)
                const correctionStrength = 0.8;
                const correction = 1 + (volumeCorrection - 1) * correctionStrength;
                scaleX *= correction;
                scaleY *= correction;
                scaleZ *= correction;

                const scale = [scaleX, scaleY, scaleZ];

                // Impact flash - bright at hit, sustained through pain
                let glowIntensity = 1.0;
                let glowBoost = 0;
                if (progress < 0.15) {
                    const flashT = progress / 0.15;
                    glowIntensity = 1.0 + (1 - flashT) * 1.5;
                    glowBoost = (1 - flashT) * 0.8;
                } else if (progress < 0.4) {
                    glowIntensity = 1.4;
                    glowBoost = 0.25;
                }

                // Use camera-relative so directions work regardless of model rotation
                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost
                };
            }
        }
    };
}

// Export factory
export default createOofGesture;
