/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fizz Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fizz gesture - bubbles rising upward with wobble (opposite of rain)
 * @author Emotive Engine Team
 * @module gestures/effects/fizz
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *      ○ ○ ○        Bubbles rise up
 *     ↗ ↑ ↖        With wobble
 *      · · ·        From current positions
 *        ⭐         Mascot effervesces
 *
 * USED BY:
 * - Excitement/effervescence
 * - Lightness/joy
 * - Fizzy drinks/champagne
 * - Bubbly personality
 */

export default {
    name: 'fizz',
    emoji: '🫧',
    type: 'override',
    description: 'Bubbles rising upward with wobble',

    config: {
        duration: 2500,
        musicalDuration: { musical: true, bars: 1.5 },
        riseSpeed: 6.0,       // How fast bubbles rise
        riseDistance: 300,    // How far bubbles travel
        wobbleAmount: 2.0,    // Side-to-side wobble
        strength: 1.0,
        particleMotion: {
            type: 'fizz',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'ambient',
        durationSync: { mode: 'bars', bars: 1.5 },
        intensitySync: {
            quiet: 0.5,
            loud: 1.5
        }
    },

    initialize(particle, _motion) {
        if (!particle.gestureData) particle.gestureData = {};

        particle.gestureData.fizz = {
            originalX: particle.x,
            originalY: particle.y,
            originalOpacity: particle.opacity ?? particle.life ?? 1,
            // Random wobble properties
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.4 + Math.random() * 0.6,
            // Random rise speed variation
            riseMultiplier: 0.7 + Math.random() * 0.6,
            initialized: true
        };
    },

    apply(particle, progress, motion, dt) {
        if (!particle.gestureData?.fizz?.initialized) {
            this.initialize(particle, motion);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const data = particle.gestureData.fizz;

        const safeDt = (typeof dt === 'number') ? dt : 1;

        // Calculate rise based on progress
        const riseDistance = config.riseDistance || 300;
        const totalRise = riseDistance * progress * strength * data.riseMultiplier;

        // Wobble side to side (bubbles wobble as they rise)
        data.wobblePhase += data.wobbleSpeed * safeDt * 0.1;
        const wobble = Math.sin(data.wobblePhase) * (config.wobbleAmount || 2.0) * (1 + progress);

        // Set position - rise UP (negative Y in screen coords)
        particle.x = data.originalX + wobble;
        particle.y = data.originalY - totalRise;

        // Set velocity for visual effects
        particle.vx = wobble * 0.3;
        particle.vy = -(config.riseSpeed || 6.0) * 10;

        // Fade out as bubbles rise
        const fadeStart = 0.6;
        if (progress > fadeStart) {
            const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
            particle.opacity = data.originalOpacity * (1 - fadeProgress);
            if (particle.life !== undefined) {
                particle.life = data.originalOpacity * (1 - fadeProgress);
            }
        }
    },

    cleanup(particle) {
        if (particle.gestureData?.fizz) {
            const data = particle.gestureData.fizz;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.opacity = data.originalOpacity;
            if (particle.life !== undefined) {
                particle.life = data.originalOpacity;
            }
            delete particle.gestureData.fizz;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // FIZZ: Carbonation effect - bubbly effervescence
            // Toned down from "mentos in coke" to pleasant fizzy sensation

            // Three phases:
            // Phase 1 (0-0.15): Build up - subtle tremor
            // Phase 2 (0.15-0.7): Fizzing - moderate vibration
            // Phase 3 (0.7-1.0): Settle down

            let shakeIntensity = 0;
            let scaleEffect = 1.0;
            let glowIntensity = 1.0;

            if (progress < 0.15) {
                // Build up - very subtle tremor
                const buildT = progress / 0.15;
                shakeIntensity = buildT * 0.15;
                scaleEffect = 1.0 + buildT * 0.02;
                glowIntensity = 1.0 + buildT * 0.15;
            } else if (progress < 0.7) {
                // Fizzing - moderate bubbling
                const fizzT = (progress - 0.15) / 0.55;
                shakeIntensity = 0.5 - fizzT * 0.15; // More subtle
                scaleEffect = 1.02 + Math.sin(fizzT * Math.PI * 6) * 0.03; // Gentle pulsing
                glowIntensity = 1.2 + Math.sin(fizzT * Math.PI * 8) * 0.15;
            } else {
                // Settle down
                const settleT = (progress - 0.7) / 0.3;
                shakeIntensity = 0.35 * (1 - settleT);
                scaleEffect = 1.02 - settleT * 0.02;
                glowIntensity = 1.2 - settleT * 0.2;
            }

            // Medium-frequency vibration (carbonation bubbles)
            const time = progress * 35; // Slower vibration
            const shakeX = Math.sin(time * 1.7) * 0.008 * shakeIntensity * strength;
            const shakeY = Math.sin(time * 2.3) * 0.006 * shakeIntensity * strength;
            const shakeZ = Math.sin(time * 1.9) * 0.004 * shakeIntensity * strength;

            // Subtle rotation jitter
            const rotX = Math.sin(time * 1.3) * 0.03 * shakeIntensity * strength;
            const rotY = Math.sin(time * 1.1) * 0.02 * shakeIntensity * strength;
            const rotZ = Math.sin(time * 1.5) * 0.04 * shakeIntensity * strength;

            // Subtle non-uniform scale for bubbling effect
            const scaleX = scaleEffect + Math.sin(time * 2.1) * 0.015 * shakeIntensity;
            const scaleY = scaleEffect + Math.sin(time * 1.8) * 0.02 * shakeIntensity;
            const scaleZ = scaleEffect + Math.sin(time * 2.4) * 0.015 * shakeIntensity;

            return {
                position: [shakeX, shakeY, shakeZ],
                rotation: [rotX, rotY, rotZ],
                scale: [scaleX, scaleY, scaleZ],
                glowIntensity,
                glowBoost: shakeIntensity * 0.2
            };
        }
    }
};
