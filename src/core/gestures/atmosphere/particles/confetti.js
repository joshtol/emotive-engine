/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Confetti Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Confetti gesture - celebratory flutter with chaotic rotation
 * @author Emotive Engine Team
 * @module gestures/effects/confetti
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     🎊 🎊 🎊      Confetti burst
 *      ↘ ↓ ↙       Flutter down
 *    ~  ~  ~  ~    Chaotic tumble
 *
 * USED BY:
 * - Celebration
 * - Achievement unlocked
 * - Victory/success
 * - Party/joy
 */

export default {
    name: 'confetti',
    emoji: '🎊',
    type: 'effect',
    description: 'Celebratory confetti flutter with chaotic rotation',

    config: {
        duration: 2500,
        musicalDuration: { musical: true, bars: 1.5 },
        burstHeight: 0.3,     // Initial upward burst (0-1)
        fallSpeed: 1.0,       // How fast confetti falls
        tumbleSpeed: 2.0,     // Rotation speed
        spread: 1.0,          // Horizontal spread
        strength: 1.0,
        particleMotion: {
            type: 'confetti',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1.5 },
        timingSync: 'onBeat'
    },

    initialize(particle, motion) {
        if (!particle.gestureData) particle.gestureData = {};

        // Each particle gets random confetti properties
        particle.gestureData.confetti = {
            originalX: particle.x,
            originalY: particle.y,
            // Random horizontal drift
            driftX: (Math.random() - 0.5) * 2,
            // Random tumble phase
            tumblePhase: Math.random() * Math.PI * 2,
            tumbleSpeed: 0.5 + Math.random() * 1.5,
            // Random flutter amplitude
            flutterAmp: 0.3 + Math.random() * 0.7,
            initialized: true
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.confetti?.initialized) {
            this.initialize(particle, motion);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const data = particle.gestureData.confetti;

        // Phase 1: Initial burst up (0-0.2)
        // Phase 2: Flutter down (0.2-1.0)
        const burstPhase = Math.min(progress / 0.2, 1);
        const fallPhase = Math.max(0, (progress - 0.2) / 0.8);

        // Upward burst then gravity
        const burstY = Math.sin(burstPhase * Math.PI) * -50 * (config.burstHeight || 0.3);
        const fallY = fallPhase * fallPhase * 200 * (config.fallSpeed || 1.0);

        // Horizontal flutter
        const flutter = Math.sin(progress * Math.PI * 8 * data.tumbleSpeed) * 20 * data.flutterAmp;

        // Horizontal drift
        const driftX = data.driftX * progress * 100 * (config.spread || 1.0);

        particle.x = data.originalX + driftX + flutter * strength;
        particle.y = data.originalY + burstY + fallY * strength;

        // Fade out at end
        if (progress > 0.7) {
            particle.opacity = 1 - ((progress - 0.7) / 0.3);
        }
    },

    cleanup(particle) {
        if (particle.gestureData?.confetti) {
            delete particle.gestureData.confetti;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // Burst up then fall
            const burstPhase = Math.min(progress / 0.2, 1);
            const fallPhase = Math.max(0, (progress - 0.2) / 0.8);

            const yOffset = Math.sin(burstPhase * Math.PI) * 0.15 - fallPhase * fallPhase * 0.3;

            // Chaotic rotation on all axes
            const tumble = progress * Math.PI * 4;
            const rotX = Math.sin(tumble * 1.3) * 0.3 * strength;
            const rotY = Math.sin(tumble * 0.7) * 0.4 * strength;
            const rotZ = Math.sin(tumble * 1.1) * 0.5 * strength;

            // Flutter side to side
            const xOffset = Math.sin(progress * Math.PI * 6) * 0.08 * strength;

            // Scale varies with tumble
            const scale = 1.0 + Math.sin(tumble * 2) * 0.1 * strength;

            // Fade envelope
            const fadeEnvelope = progress > 0.85 ? (1 - progress) / 0.15 : 1.0;

            // Glow on burst
            const glowIntensity = 1.0 + (1 - fallPhase) * 0.3;

            return {
                position: [xOffset * fadeEnvelope, yOffset * strength * fadeEnvelope, 0],
                rotation: [rotX * fadeEnvelope, rotY * fadeEnvelope, rotZ * fadeEnvelope],
                scale,
                glowIntensity
            };
        }
    }
};
