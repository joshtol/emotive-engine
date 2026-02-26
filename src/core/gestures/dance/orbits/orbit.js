/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbit Gesture with 3D Depth
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview 3D orbital gesture - particles orbit with dynamic z-depth changes
 * @author Emotive Engine Team
 * @module gestures/transforms/orbit
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 *
 * GESTURE TYPE:
 * type: 'override' - Takes complete control of particle motion
 *
 * VISUAL EFFECT:
 * Particles orbit around the center while transitioning between foreground and
 * background layers, creating a true 3D effect where particles pass behind and
 * in front of the orb.
 */

export default {
    name: 'orbit',
    emoji: '🪐',
    type: 'override',
    description: 'Orbital motion around center',

    // Default configuration
    config: {
        speed: 0.02, // Orbital rotation speed
        maintainRadius: true, // Keep constant orbit radius
        elliptical: false, // Use circular orbit
        use3D: true, // Enable z-coordinate animation
        zPhaseOffset: 0, // Phase offset for z-oscillation
        verticalOscillation: 0, // Vertical movement for hula-hoop effect
        duration: 3000, // Legacy fallback
        musicalDuration: { musical: true, bars: 2 }, // 2 bars (8 beats)
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'orbit',
            strength: 1.0,
        },
    },

    // Rhythm configuration - orbital paths sync to harmony
    rhythm: {
        enabled: true,
        syncMode: 'harmonic', // Orbit follows harmonic intervals
        durationSync: { mode: 'bars', bars: 2 }, // 2 bars duration

        // Speed based on harmonic ratios
        speedSync: {
            tonic: 0.02, // Base orbit speed
            fifth: 0.03, // 3:2 ratio (perfect fifth)
            octave: 0.04, // 2:1 ratio (octave)
            third: 0.025, // 5:4 ratio (major third)
            curve: 'smooth', // Smooth transitions
        },

        // Orbital layers by pitch
        radiusSync: {
            bass: 150, // Outer orbit for low notes
            mid: 100, // Middle orbit for mids
            treble: 50, // Inner orbit for highs
            scaling: 'logarithmic', // Natural pitch scaling
        },

        // 3D depth syncs to chord progression
        depthSync: {
            major: { z: 1.0, phase: 0 }, // Front-facing for major
            minor: { z: -1.0, phase: Math.PI }, // Back-facing for minor
            diminished: { z: 0.5, phase: Math.PI / 2 }, // Side angle
            augmented: { z: 0.8, phase: -Math.PI / 2 }, // Other side
        },

        // Phase relationships
        phaseSync: {
            mode: 'harmonic', // Particles phase-lock harmonically
            intervals: [1, 1.5, 2], // Unison, fifth, octave
            drift: 0.05, // Slight phase drift for organic feel
        },

        // Musical dynamics
        dynamics: {
            forte: { speed: 0.04, maintainRadius: false }, // Chaotic orbits
            piano: { speed: 0.01, maintainRadius: true }, // Stable orbits
        },
    },

    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const calculatedRadius = Math.sqrt(dx * dx + dy * dy);

        // Random direction for orbit
        const direction = Math.random() < 0.5 ? 1 : -1;

        // Set minimum radius to prevent center clustering
        const MIN_RADIUS = 100;
        const radius = Math.max(calculatedRadius, MIN_RADIUS + Math.random() * 180);

        const initialAngle =
            calculatedRadius < 5 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
        particle.gestureData.orbit = {
            radius,
            targetRadius: radius,
            angle: initialAngle,
            initialAngle,
            originalVx: particle.vx,
            originalVy: particle.vy,
            originalZ: particle.z || 0,
            zPhase: Math.random() * Math.PI * 2,
            direction,
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.orbit) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.orbit;
        const speed = (motion.speed || this.config.speed) * (motion.strength || 1);

        // Update angle with direction (dt is already normalized to 60fps)
        data.angle += speed * dt * data.direction;

        // Use the stored radius (which has minimum enforced)
        let { radius } = data;

        if (!motion.maintainRadius) {
            // Allow radius to vary slightly for organic motion
            radius = data.radius * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
        }

        particle.x = centerX + Math.cos(data.angle) * radius;
        particle.y = centerY + Math.sin(data.angle) * radius;

        // 3D DEPTH: Animate z-coordinate for particles passing behind/in front
        if (motion.use3D !== false) {
            const zAngle = data.angle + data.zPhase + (motion.zPhaseOffset || 0);
            particle.z = Math.sin(zAngle) * 0.8;

            // Add vertical oscillation for hula-hoop effect
            if (motion.verticalOscillation) {
                const verticalOffset = Math.cos(zAngle) * motion.verticalOscillation * radius * 0.1;
                particle.y += verticalOffset;
            }
        }

        // Set velocity to match motion
        particle.vx = -Math.sin(data.angle) * radius * speed;
        particle.vy = Math.cos(data.angle) * radius * speed;

        // Restore original velocity at end
        if (progress > 0.9) {
            const blendFactor = (1 - progress) * 10;
            particle.vx = particle.vx * blendFactor + data.originalVx * (1 - blendFactor);
            particle.vy = particle.vy * blendFactor + data.originalVy * (1 - blendFactor);
        }
    },

    cleanup(particle) {
        if (particle.gestureData?.orbit) {
            const data = particle.gestureData.orbit;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.z = data.originalZ;
            delete particle.gestureData.orbit;
        }
    },

    /**
     * 3D translation for WebGL rendering
     * Circular XY motion with Z-depth oscillation
     */
    '3d': {
        evaluate(progress, motion) {
            const particle = motion?.particle;
            if (!particle || !particle.gestureData?.orbit) {
                return {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: 1.0,
                };
            }

            const data = particle.gestureData.orbit;

            // Smooth entry/exit envelope
            let envelope = 1.0;
            if (progress < 0.15) {
                envelope = Math.sin((progress / 0.15) * Math.PI * 0.5);
            } else if (progress > 0.85) {
                envelope = Math.sin(((1 - progress) / 0.15) * Math.PI * 0.5);
            }

            // Orbital motion in XZ plane
            const orbitRadius = 0.3;
            const angle = data.initialAngle + progress * Math.PI * 2 * data.direction;

            const xOffset = Math.cos(angle) * orbitRadius * envelope;
            const zOffset = Math.sin(angle) * orbitRadius * envelope;

            // Rotation to face direction of motion
            const tangentAngle = angle + Math.PI / 2;
            const yRotation = (tangentAngle - (data.initialAngle + Math.PI / 2)) * envelope;

            // Depth variation from particle.z
            const depthZ = particle.z || 0;
            const finalZ = zOffset + depthZ * 0.1 * envelope;

            // Scale based on depth
            const depthScale = 1.0 + depthZ * 0.15 * envelope;

            return {
                position: [xOffset, 0, finalZ],
                rotation: [0, yRotation, 0],
                scale: depthScale,
            };
        },
    },
};
