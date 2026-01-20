/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Tilt Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional tilt gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/tiltFactory
 *
 * Creates tilting gestures for all four directions.
 * Head-tilt style animation with gather and unified sway.
 *
 * TILT: Gather, tilt, hold (~500ms) - curious, questioning
 *
 * Use cases:
 * - tiltUp: Looking up, pondering, dreaming
 * - tiltDown: Shame, sadness, contemplation
 * - tiltLeft/Right: Curiosity, confusion, "hmm?"
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a tilt gesture - directional head-tilt motion
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createTiltGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid tilt direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `tilt${capitalize(direction)}`,
        emoji: direction === 'up' ? '🔭' : direction === 'down' ? '😔' : direction === 'left' ? '🤔' : '🧐',
        type: 'override',
        description: `Tilt ${direction} with curious expression`,

        config: {
            duration: 500,  // Legacy fallback
            musicalDuration: { musical: true, beats: 1 }, // 1 beat
            gatherPhase: 0.2,
            tiltAngle: 45,
            tiltAmount: 40,
            holdPhase: 0.4,
            homeRadius: 20,
            easing: 'sine',
            strength: 1.0,
            direction,
            smoothness: 0.25,
            particleMotion: {
                type: 'tilt',
                strength: 1.0,
                tiltAmount: 40
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'swing',
            durationSync: { mode: 'beats', beats: 1 }, // 1 beat duration

            angleSync: {
                onBeat: 45,
                offBeat: 30,
                subdivision: 'triplet',
                curve: 'ease-in-out'
            },

            gatherSync: {
                beatsBefore: 0.5,
                releaseAfter: 0.25,
                intensity: 'dynamic'
            },

            dynamics: {
                forte: { tiltAngle: 60, tiltAmount: 60 },
                piano: { tiltAngle: 25, tiltAmount: 25 }
            }
        },

        initialize(particle, motion, centerX, centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }

            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            const config = { ...this.config, ...motion };
            const homeRadius = (config.homeRadius + Math.random() * 20) * particle.scaleFactor;

            particle.gestureData.tilt = {
                startX: particle.x,
                startY: particle.y,
                originalVx: particle.vx,
                originalVy: particle.vy,
                angle,
                distance,
                homeRadius,
                homeX: centerX + Math.cos(angle) * homeRadius,
                homeY: centerY + Math.sin(angle) * homeRadius,
                role: Math.random(),
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.tilt?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const data = particle.gestureData.tilt;
            const config = { ...this.config, ...motion };
            const strength = motion.strength || 1.0;

            let targetX, targetY;

            if (progress < config.gatherPhase) {
                // PHASE 1: Gather toward center
                const gatherProgress = progress / config.gatherPhase;
                const easedGather = this.easeInOutCubic(gatherProgress);

                targetX = data.startX + (data.homeX - data.startX) * easedGather;
                targetY = data.startY + (data.homeY - data.startY) * easedGather;

                const speed = 0.6;
                particle.x += (targetX - particle.x) * speed;
                particle.y += (targetY - particle.y) * speed;

            } else if (progress < config.gatherPhase + config.holdPhase) {
                // PHASE 2: Tilt and hold in direction
                const tiltPhase = (progress - config.gatherPhase) / config.holdPhase;

                // Ease into the tilt
                const tiltEase = this.easeOutCubic(Math.min(tiltPhase * 2, 1));
                const tiltDistance = config.tiltAmount * strength * particle.scaleFactor * tiltEase;

                // Apply tilt in the specified direction
                if (isVertical) {
                    targetX = data.homeX;
                    targetY = data.homeY + dir.y * tiltDistance;
                } else {
                    targetX = data.homeX + dir.x * tiltDistance;
                    targetY = data.homeY - Math.abs(dir.x) * tiltDistance * 0.2; // Slight lift
                }

                const smoothness = config.smoothness + data.role * 0.1;
                particle.x += (targetX - particle.x) * smoothness;
                particle.y += (targetY - particle.y) * smoothness;

                // Velocity for trails
                particle.vx = (targetX - particle.x) * 0.5;
                particle.vy = (targetY - particle.y) * 0.5;

            } else {
                // PHASE 3: Return to origin
                const returnPhase = (progress - config.gatherPhase - config.holdPhase) / (1 - config.gatherPhase - config.holdPhase);
                const easedReturn = this.easeInOutCubic(returnPhase);

                targetX = particle.x + (data.startX - particle.x) * easedReturn;
                targetY = particle.y + (data.startY - particle.y) * easedReturn;

                particle.x = targetX;
                particle.y = targetY;

                particle.vx = data.originalVx * easedReturn;
                particle.vy = data.originalVy * easedReturn;
            }

            // Store current velocity for trails during gather/tilt
            if (progress < config.gatherPhase) {
                particle.vx = (targetX - particle.x) * 0.25;
                particle.vy = (targetY - particle.y) * 0.25;
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.tilt) {
                const data = particle.gestureData.tilt;
                particle.vx = data.originalVx;
                particle.vy = data.originalVy;
                delete particle.gestureData.tilt;
            }
        },

        easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || motion || {};
                const strength = motion.strength || 1.0;
                const gatherPhase = config.gatherPhase || 0.2;
                const holdPhase = config.holdPhase || 0.4;
                const tiltAngle = config.tiltAngle || 45;
                const tiltAmount = config.tiltAmount || 40;

                const PIXEL_TO_3D = 0.004;

                let posX = 0, posY = 0;
                let rotX = 0, rotY = 0, rotZ = 0;

                if (progress < gatherPhase) {
                    // Gathering - no significant 3D change
                    // Just subtle anticipation

                } else if (progress < gatherPhase + holdPhase) {
                    // PHASE 2: Tilt in direction
                    const tiltPhase = (progress - gatherPhase) / holdPhase;
                    const tiltEase = 1 - Math.pow(1 - Math.min(tiltPhase * 2, 1), 3);

                    const tiltRad = (tiltAngle * Math.PI / 180) * strength * 0.4 * tiltEase;
                    const tiltDist = tiltAmount * PIXEL_TO_3D * strength * tiltEase;

                    if (isVertical) {
                        // Vertical tilt: X rotation (nod up/down)
                        rotX = dir.y * tiltRad;
                        posY = dir.y * tiltDist;
                    } else {
                        // Horizontal tilt: Z rotation (head tilt left/right)
                        rotZ = -dir.x * tiltRad; // Negative because lean left = positive Z rotation
                        posX = dir.x * tiltDist * 0.5;
                        // Slight Y rotation to look in direction
                        rotY = dir.x * tiltRad * 0.3;
                    }

                } else {
                    // PHASE 3: Return
                    const returnPhase = (progress - gatherPhase - holdPhase) / (1 - gatherPhase - holdPhase);
                    const returnEase = returnPhase < 0.5
                        ? 4 * returnPhase * returnPhase * returnPhase
                        : 1 - Math.pow(-2 * returnPhase + 2, 3) / 2;

                    const tiltRad = (tiltAngle * Math.PI / 180) * strength * 0.4 * (1 - returnEase);
                    const tiltDist = tiltAmount * PIXEL_TO_3D * strength * (1 - returnEase);

                    if (isVertical) {
                        rotX = dir.y * tiltRad;
                        posY = dir.y * tiltDist;
                    } else {
                        rotZ = -dir.x * tiltRad;
                        posX = dir.x * tiltDist * 0.5;
                        rotY = dir.x * tiltRad * 0.3;
                    }
                }

                return {
                    cameraRelativePosition: [posX, posY, 0],
                    rotation: [rotX, rotY, rotZ],
                    scale: 1.0
                };
            }
        }
    };
}
