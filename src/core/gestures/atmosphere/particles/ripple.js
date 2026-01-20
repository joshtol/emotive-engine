/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ripple Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Ripple gesture - concentric waves emanating from center
 * @author Emotive Engine Team
 * @module gestures/effects/ripple
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *       ○          Wave 1
 *      ○ ○         Wave 2
 *     ○ ⭐ ○       Center + Wave 3
 *      ○ ○         Expanding outward
 *       ○
 *
 * USED BY:
 * - Impact moments
 * - Realization/"aha" moment
 * - Spreading influence
 * - Water/liquid effects
 */

export default {
    name: 'ripple',
    emoji: '🌊',
    type: 'effect',
    description: 'Concentric waves emanating from center',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, bars: 1 },
        waveCount: 3,         // Number of ripple waves
        waveSpeed: 1.0,       // How fast waves expand
        amplitude: 15,        // Wave height
        damping: 0.7,         // How quickly waves fade
        strength: 1.0,
        particleMotion: {
            type: 'ripple',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat',

        amplitudeSync: {
            onBeat: 1.5,
            offBeat: 0.8
        }
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const waveCount = config.waveCount || 3;
        const amplitude = config.amplitude || 15;
        const damping = config.damping || 0.7;

        // Calculate distance from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Wave phase based on distance and time
        const wavePhase = (distance / 50 - progress * waveCount * 2) * Math.PI;

        // Damping based on progress
        const dampingFactor = Math.pow(1 - progress, damping);

        // Vertical displacement (bob up and down)
        const wave = Math.sin(wavePhase) * amplitude * strength * dampingFactor;

        // Apply perpendicular to radial direction (outward push on wave crest)
        if (distance > 1) {
            const pushFactor = Math.cos(wavePhase) * 0.5 * strength * dampingFactor;
            particle.x += (dx / distance) * pushFactor;
            particle.y += (dy / distance) * pushFactor;
        }

        // Simulate vertical with opacity/scale change
        particle.opacity = Math.max(0.3, 1 - Math.abs(wave / amplitude) * 0.3);
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const waveCount = config.waveCount || 3;
            const damping = config.damping || 0.7;

            // Damping based on progress - wave diminishes over time
            const dampingFactor = Math.pow(1 - progress, damping);

            // RIPPLE: Wave that travels vertically through the mascot
            // Creates a squash/stretch effect that moves up and down
            //
            // Phase 1 (0-0.3): Wave travels UP through the mascot
            // Phase 2 (0.3-0.7): Wave bounces/oscillates
            // Phase 3 (0.7-1.0): Wave settles down

            // Multiple overlapping waves for organic feel
            const time = progress * Math.PI * waveCount * 2;
            const wave1 = Math.sin(time);
            const wave2 = Math.sin(time + Math.PI / 3) * 0.7;
            const wave3 = Math.sin(time + Math.PI * 2 / 3) * 0.4;
            const combinedWave = (wave1 + wave2 + wave3) / 2.1;

            // NON-UNIFORM SCALE: Wave ripples through the mascot vertically
            // When wave is at "top", stretch Y and compress X/Z
            // When wave is at "bottom", compress Y and stretch X/Z
            // This creates the visual of a ripple traveling through the mesh

            // Primary wave for scale - travels up/down
            const wavePhase = progress * Math.PI * 4; // Two complete up-down cycles
            const scaleWave = Math.sin(wavePhase) * strength * dampingFactor;

            // Secondary wave for horizontal distortion (offset phase)
            const horizWave = Math.sin(wavePhase + Math.PI / 2) * 0.5 * strength * dampingFactor;

            // Non-uniform scale: [X, Y, Z]
            // When scaleWave > 0: stretch Y, compress X/Z (tall and thin)
            // When scaleWave < 0: compress Y, stretch X/Z (short and wide)
            const baseScale = 1.0;
            const scaleAmplitude = 0.12; // Max 12% stretch/compress

            const scaleX = baseScale - scaleWave * scaleAmplitude + horizWave * scaleAmplitude * 0.3;
            const scaleY = baseScale + scaleWave * scaleAmplitude;
            const scaleZ = baseScale - scaleWave * scaleAmplitude - horizWave * scaleAmplitude * 0.3;

            // Y position compensates for scale changes (keep bottom grounded)
            // When Y-scale increases, move up; when decreases, move down
            const yOffset = (scaleY - 1.0) * 0.08;

            // Add a slight X wobble as the wave passes through
            const xWobble = Math.sin(wavePhase * 1.5) * 0.01 * dampingFactor;

            // Slight rotation wobble synced to wave
            const rotX = wave1 * 0.04 * strength * dampingFactor;
            const rotZ = horizWave * 0.03 * strength * dampingFactor;

            // Glow pulses with wave peaks
            const glowIntensity = 1.0 + Math.abs(scaleWave) * 0.3;
            const glowBoost = Math.max(0, scaleWave) * 0.25 * dampingFactor;

            return {
                position: [xWobble, yOffset, 0],
                rotation: [rotX, 0, rotZ],
                scale: [scaleX, scaleY, scaleZ],  // Non-uniform scale for ripple effect
                glowIntensity,
                glowBoost
            };
        }
    }
};
