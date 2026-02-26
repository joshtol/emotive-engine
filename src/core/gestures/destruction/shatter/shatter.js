/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shatter Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shatter gesture - particles explode outward then freeze
 * @author Emotive Engine Team
 * @module gestures/transforms/shatter
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐         Intact
 *      💥💥💥       Explosion
 *    ·   ·   ·     Frozen fragments
 *
 * USED BY:
 * - Shock/surprise
 * - Dramatic moments
 * - Breaking/destruction
 * - Mind-blown effect
 */

export default {
    name: 'shatter',
    emoji: '💥',
    type: 'override',
    description: 'Particles explode outward then freeze like shattered glass',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, bars: 1 },
        explosionPhase: 0.3, // Portion of animation for explosion
        freezePhase: 0.7, // When to start freezing (0-1)
        distance: 100, // How far shards fly
        tumble: 1.0, // Rotation amount
        strength: 1.0,
        particleMotion: {
            type: 'shatter',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.5,
        },
    },

    initialize(particle, _motion, _centerX, _centerY) {
        if (!particle.gestureData) particle.gestureData = {};

        // Random explosion direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.5;

        particle.gestureData.shatter = {
            originalX: particle.x,
            originalY: particle.y,
            originalOpacity: particle.opacity ?? 1,
            // Explosion vector
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            // Tumble rotation
            tumbleAngle: 0,
            tumbleSpeed: (Math.random() - 0.5) * 4,
            // Frozen position (will be set during freeze)
            frozenX: null,
            frozenY: null,
            initialized: true,
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.shatter?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const distance = config.distance || 100;
        const data = particle.gestureData.shatter;

        const explosionPhase = config.explosionPhase || 0.3;
        const freezePhase = config.freezePhase || 0.7;

        if (progress < explosionPhase) {
            // Explosion phase - fast outward movement
            const explosionProgress = progress / explosionPhase;
            const eased = 1 - Math.pow(1 - explosionProgress, 3); // Fast ease-out

            const moveX = data.velocityX * distance * eased * strength;
            const moveY = data.velocityY * distance * eased * strength;

            particle.x = data.originalX + moveX;
            particle.y = data.originalY + moveY;

            // Tumble during explosion
            data.tumbleAngle += data.tumbleSpeed * (1 - explosionProgress);
        } else if (progress < freezePhase) {
            // Drift phase - slow movement
            const driftProgress = (progress - explosionPhase) / (freezePhase - explosionPhase);

            const baseX = data.originalX + data.velocityX * distance * strength;
            const baseY = data.originalY + data.velocityY * distance * strength;

            // Slight continued drift
            const driftX = data.velocityX * distance * 0.2 * driftProgress * strength;
            const driftY = data.velocityY * distance * 0.2 * driftProgress * strength;

            particle.x = baseX + driftX;
            particle.y = baseY + driftY;

            // Slow tumble
            data.tumbleAngle += data.tumbleSpeed * 0.3 * (1 - driftProgress);

            // Save frozen position at end of drift
            if (driftProgress > 0.95 && data.frozenX === null) {
                data.frozenX = particle.x;
                data.frozenY = particle.y;
            }
        } else {
            // Frozen phase - particles stay in place
            if (data.frozenX !== null) {
                particle.x = data.frozenX;
                particle.y = data.frozenY;
            }

            // Fade out slightly at very end
            if (progress > 0.9) {
                const fadeProgress = (progress - 0.9) / 0.1;
                particle.opacity = data.originalOpacity * (1 - fadeProgress * 0.5);
            }
        }
    },

    cleanup(particle) {
        if (particle.gestureData?.shatter) {
            const data = particle.gestureData.shatter;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.opacity = data.originalOpacity;
            delete particle.gestureData.shatter;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // SHATTER EFFECT: Impact -> Explosive shake -> Collapse -> Reform
            // Phase 1 (0-0.1): Initial impact - instant compression
            // Phase 2 (0.1-0.4): Violent explosion - rapid chaotic shake with expansion
            // Phase 3 (0.4-0.7): Fragments settle - slowing shake, collapse inward
            // Phase 4 (0.7-1.0): Reform - pieces come back together

            let scaleX = 1.0,
                scaleY = 1.0,
                scaleZ = 1.0;
            let rotX = 0,
                rotY = 0,
                rotZ = 0;
            let posX = 0,
                posY = 0,
                posZ = 0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.1) {
                // Phase 1: Impact - sudden compression
                const impactT = progress / 0.1;
                const impactEase = 1 - Math.pow(1 - impactT, 2);

                // Squash on impact
                scaleY = 1.0 - impactEase * 0.4 * strength;
                scaleX = 1.0 + impactEase * 0.2 * strength;
                scaleZ = 1.0 + impactEase * 0.2 * strength;

                posY = -impactEase * 0.1 * strength;

                // Flash on impact
                glowIntensity = 1.0 + impactEase * 1.0;
                glowBoost = impactEase * 0.8;
            } else if (progress < 0.4) {
                // Phase 2: Explosive shake - violent chaotic movement
                const explodeT = (progress - 0.1) / 0.3;
                const decay = 1 - explodeT * 0.6; // Gradual decay

                // High-frequency chaotic shake
                const shakeFreq = 40; // Very fast shake
                const shake = Math.sin(progress * shakeFreq * Math.PI) * decay;
                const shake2 = Math.cos(progress * shakeFreq * 1.3 * Math.PI) * decay;
                const shake3 = Math.sin(progress * shakeFreq * 0.7 * Math.PI) * decay;

                // Expand outward
                const expand = 1.0 + (1 - Math.pow(1 - explodeT, 2)) * 0.3 * strength;
                scaleX = expand + shake * 0.15 * strength;
                scaleY = expand + shake2 * 0.15 * strength;
                scaleZ = expand + shake3 * 0.15 * strength;

                // Chaotic rotation
                rotX = shake * 0.4 * strength;
                rotY = shake2 * 0.5 * strength;
                rotZ = shake3 * 0.3 * strength;

                // Chaotic position
                posX = shake * 0.15 * strength;
                posY = shake2 * 0.12 * strength + explodeT * 0.1;
                posZ = shake3 * 0.1 * strength;

                // Pulsing glow
                glowIntensity = 1.5 + Math.abs(shake) * 0.5;
                glowBoost = 0.5 * decay;
            } else if (progress < 0.7) {
                // Phase 3: Fragments settle - slowing shake, collapse inward
                const settleT = (progress - 0.4) / 0.3;
                const settleEase = settleT * settleT; // Slow start
                const decay = 1 - settleEase;

                // Slowing shake
                const shakeFreq = 20 * decay; // Decreasing frequency
                const shake = Math.sin(progress * shakeFreq * Math.PI) * decay;

                // Contract inward
                const contract = 1.3 - settleEase * 0.4;
                scaleX = contract + shake * 0.05 * strength;
                scaleY = contract + shake * 0.05 * strength;
                scaleZ = contract + shake * 0.05 * strength;

                // Settling rotation
                rotZ = shake * 0.15 * strength;

                // Drop down
                posY = 0.1 * decay;

                glowIntensity = 1.5 - settleEase * 0.3;
                glowBoost = 0.3 * decay;
            } else {
                // Phase 4: Reform - smooth return to normal
                const reformT = (progress - 0.7) / 0.3;
                const reformEase =
                    reformT < 0.5
                        ? 4 * reformT * reformT * reformT
                        : 1 - Math.pow(-2 * reformT + 2, 3) / 2;

                // Slight overshoot bounce on reform
                const bounce = Math.sin(reformT * Math.PI * 2) * (1 - reformT) * 0.05;

                scaleX = 0.9 + reformEase * 0.1 + bounce;
                scaleY = 0.9 + reformEase * 0.1 + bounce;
                scaleZ = 0.9 + reformEase * 0.1 + bounce;

                // Gentle final pulse
                glowIntensity = 1.2 - reformEase * 0.2;

                // Final flash at completion
                if (progress > 0.95) {
                    const finalFlash = (progress - 0.95) / 0.05;
                    glowBoost = Math.sin(finalFlash * Math.PI) * 0.3;
                }
            }

            return {
                position: [posX, posY, posZ],
                rotation: [rotX, rotY, rotZ],
                scale: [scaleX, scaleY, scaleZ], // Non-uniform for squash effect
                glowIntensity,
                glowBoost,
            };
        },
    },
};
