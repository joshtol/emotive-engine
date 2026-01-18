/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shiver Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shiver gesture - high-frequency micro-vibrations
 * @author Emotive Engine Team
 * @module gestures/effects/shiver
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *      ·~·~·~·      Rapid micro-vibrations
 *        ⭐         Mascot trembles
 *      ~·~·~·~      High-frequency shake
 *
 * USED BY:
 * - Cold/freezing states
 * - Fear/nervousness
 * - Anticipation/excitement
 * - Tension before action
 */

export default {
    name: 'shiver',
    emoji: '🥶',
    type: 'effect',
    description: 'High-frequency micro-vibrations for nervousness or cold',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, bars: 1 },
        frequency: 30,        // Vibrations per second
        amplitude: 0.02,      // Small amplitude for micro-vibrations
        decay: 0.3,           // How quickly shiver fades
        strength: 1.0,
        particleMotion: {
            type: 'shiver',
            strength: 0.8
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'ambient',
        durationSync: { mode: 'bars', bars: 1 },
        intensitySync: {
            quiet: 0.5,
            loud: 1.5,
            crescendo: 'increase',
            diminuendo: 'decrease'
        }
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const frequency = config.frequency || 30;
        const amplitude = (config.amplitude || 0.02) * 100; // Scale for 2D pixels

        // High-frequency noise using multiple sine waves
        const time = progress * frequency * Math.PI * 2;
        const noise1 = Math.sin(time) * 0.6;
        const noise2 = Math.sin(time * 1.7 + 1.3) * 0.3;
        const noise3 = Math.sin(time * 2.3 + 2.7) * 0.1;

        const shiver = (noise1 + noise2 + noise3) * amplitude * strength;

        // Envelope - builds up then fades
        const envelope = Math.sin(progress * Math.PI);

        particle.x += shiver * envelope * (Math.random() - 0.5) * 2;
        particle.y += shiver * envelope * (Math.random() - 0.5) * 2;
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const frequency = config.frequency || 30;
            const amplitude = config.amplitude || 0.02;

            // Envelope - builds up then fades
            const envelope = Math.sin(progress * Math.PI);

            // High-frequency noise
            const time = progress * frequency * Math.PI * 2;
            const noiseX = Math.sin(time) * 0.6 + Math.sin(time * 1.7) * 0.3 + Math.sin(time * 2.3) * 0.1;
            const noiseY = Math.cos(time * 1.1) * 0.5 + Math.cos(time * 1.9) * 0.3 + Math.cos(time * 2.7) * 0.2;
            const noiseZ = Math.sin(time * 0.9 + 1) * 0.4 + Math.sin(time * 1.5 + 2) * 0.4;

            const xOffset = noiseX * amplitude * strength * envelope;
            const yOffset = noiseY * amplitude * strength * envelope;
            const zOffset = noiseZ * amplitude * 0.5 * strength * envelope;

            // Tiny rotation jitter
            const rotX = noiseY * 0.02 * strength * envelope;
            const rotZ = noiseX * 0.02 * strength * envelope;

            // Scale micro-pulse
            const scale = 1.0 + Math.abs(noiseX) * 0.01 * strength * envelope;

            return {
                position: [xOffset, yOffset, zOffset],
                rotation: [rotX, 0, rotZ],
                scale,
                glowIntensity: 1.0 + Math.abs(noiseX) * 0.1 * envelope
            };
        }
    }
};
