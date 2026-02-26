/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                   ◐ ◑ ◒ ◓  ZEN MODE RENDERER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Zen Mode Renderer - Meditation Mode Rendering
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module ZenModeRenderer
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Renders zen/meditation mode effects including:
 * ║ • Lotus petal silhouette with morphing animations
 * ║ • Golden radiance and energy pulsation
 * ║ • Smooth entry/exit transitions
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class ZenModeRenderer {
    /**
     * Render zen mode core with lotus petal cutout
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Core radius
     * @param {Object} state - Renderer state (shakeOffset, driftY)
     * @param {Object} zenTransition - Zen transition state
     * @param {Object} gestureTransform - Optional gesture transform
     * @param {Function} scaleValue - Scale value function
     */
    renderZenCore(ctx, x, y, radius, state, zenTransition, gestureTransform, scaleValue) {
        ctx.save();

        // Apply shake offset if in awakening phase
        if (state.shakeOffset) {
            x += state.shakeOffset;
        }

        // Apply drift Y if in awakening phase
        if (state.driftY) {
            y += state.driftY;
        }

        ctx.translate(x, y);

        // Apply gesture rotation if present (for spin gesture)
        if (gestureTransform && gestureTransform.rotation !== undefined) {
            ctx.rotate((gestureTransform.rotation * Math.PI) / 180);
        }

        // Calculate zen energy pulsation (slow breathing effect)
        const time = Date.now() / 1000; // Time in seconds
        const basePulse = Math.sin(time * 0.5) * 0.5 + 1.5; // Base pulsation

        // Scale glow intensity based on transition phase
        // Very dim during bloom/retract, bright when fully in zen
        let glowIntensity = 0.1; // Start very dim
        if (zenTransition.phase === 'in') {
            // Full brightness when fully in zen
            glowIntensity = 1.0;
        } else if (zenTransition.phase === 'entering') {
            // Gradually brighten only after lotus is mostly formed
            glowIntensity = Math.max(0.1, (zenTransition.lotusMorph - 0.7) * 3.3); // Stay dim until 70% bloomed
        } else if (zenTransition.phase === 'exiting') {
            // Quickly dim when exiting
            glowIntensity = Math.max(0.1, zenTransition.lotusMorph * 0.5);
        }
        const zenPulse = basePulse * glowIntensity; // Apply intensity scaling

        // Apply glow when lotus is morphing or fully formed
        if (zenTransition.lotusMorph > 0) {
            // Single smooth shadow glow
            ctx.shadowBlur = scaleValue(100) * zenPulse;
            ctx.shadowColor = `rgba(255, 223, 0, ${0.5 * zenPulse})`;

            // INNER RADIANCE GRADIENT - Much darker during transitions
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 4);

            // During transitions, use much darker colors to see lotus
            if (zenTransition.phase !== 'in') {
                // Dark golden during transition - lotus will show as even darker cutout
                gradient.addColorStop(0, `rgba(184, 134, 11, ${0.8})`); // Dark goldenrod core
                gradient.addColorStop(0.3, `rgba(153, 101, 21, ${0.6})`); // Darker gold
                gradient.addColorStop(0.6, `rgba(139, 69, 19, ${0.4})`); // Saddle brown
                gradient.addColorStop(1, 'rgba(101, 67, 33, 0)'); // Dark brown edge
            } else {
                // Full brightness only when fully in zen
                gradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`); // Pure white core
                gradient.addColorStop(0.1, `rgba(255, 255, 240, ${1.0 * zenPulse})`); // Bright cream
                gradient.addColorStop(0.2, `rgba(255, 250, 205, ${0.95 * zenPulse})`); // Warm light
                gradient.addColorStop(0.35, `rgba(255, 240, 150, ${0.85 * zenPulse})`); // Bright gold
                gradient.addColorStop(0.5, `rgba(255, 223, 0, ${0.7 * zenPulse})`); // Vibrant gold
                gradient.addColorStop(0.65, `rgba(255, 215, 0, ${0.5 * zenPulse})`); // Fading gold
                gradient.addColorStop(0.8, `rgba(255, 215, 0, ${0.3 * zenPulse})`); // Softer edge
                gradient.addColorStop(0.9, `rgba(255, 215, 0, ${0.15 * zenPulse})`); // Very soft
                gradient.addColorStop(0.95, `rgba(255, 215, 0, ${0.05 * zenPulse})`); // Almost gone
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Fully transparent edge
            }

            ctx.fillStyle = gradient;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3})`; // Dimmer edge during transition
            ctx.lineWidth = scaleValue(2);

            // STEP 1: Draw a circle with lotus cutout using evenodd fill rule
            ctx.beginPath();

            // Draw outer circle (clockwise)
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false);

            // MORPHING LOTUS PETALS - animated based on lotusMorph value
            const morph = zenTransition.lotusMorph;
            const spread = zenTransition.petalSpread;
            const smile = zenTransition.smileCurve;

            // Center/Top petal - morphs from small circle to full petal
            // Only draw lotus if morph is significant (avoid tiny artifacts)
            if (morph > 0.1) {
                const centerPetalBase = radius * (0.05 + 0.15 * morph);
                ctx.moveTo(0, centerPetalBase); // Start at base center
                ctx.bezierCurveTo(
                    -radius * (0.05 + 0.25 * morph * spread),
                    radius * 0.1, // Left control
                    -radius * (0.05 + 0.3 * morph * spread),
                    -radius * (0.1 + 0.4 * morph), // Left control up
                    0,
                    -radius * (0.2 + 0.65 * morph) // Top point
                );
                ctx.bezierCurveTo(
                    radius * (0.05 + 0.3 * morph * spread),
                    -radius * (0.1 + 0.4 * morph), // Right control up
                    radius * (0.05 + 0.25 * morph * spread),
                    radius * 0.1, // Right control
                    0,
                    centerPetalBase // Back to base
                );

                if (morph > 0.3) {
                    // Only show side petals after some morphing
                    const sidePetalAlpha = (morph - 0.3) / 0.7; // Fade in from 30% to 100%

                    // Left petal - fades in and spreads
                    ctx.moveTo(-radius * 0.1 * sidePetalAlpha, radius * 0.2);
                    ctx.bezierCurveTo(
                        -radius * (0.1 + 0.4 * sidePetalAlpha * spread),
                        radius * 0.1,
                        -radius * (0.2 + 0.5 * sidePetalAlpha * spread),
                        -radius * (0.1 + 0.2 * sidePetalAlpha),
                        -radius * (0.1 + 0.4 * sidePetalAlpha * spread),
                        -radius * (0.2 + 0.45 * sidePetalAlpha)
                    );
                    ctx.bezierCurveTo(
                        -radius * (0.05 + 0.15 * sidePetalAlpha),
                        -radius * (0.1 + 0.4 * sidePetalAlpha),
                        -radius * 0.05 * sidePetalAlpha,
                        radius * 0.1,
                        -radius * 0.1 * sidePetalAlpha,
                        radius * 0.2
                    );

                    // Right petal - fades in and spreads
                    ctx.moveTo(radius * 0.1 * sidePetalAlpha, radius * 0.2);
                    ctx.bezierCurveTo(
                        radius * (0.1 + 0.4 * sidePetalAlpha * spread),
                        radius * 0.1,
                        radius * (0.2 + 0.5 * sidePetalAlpha * spread),
                        -radius * (0.1 + 0.2 * sidePetalAlpha),
                        radius * (0.1 + 0.4 * sidePetalAlpha * spread),
                        -radius * (0.2 + 0.45 * sidePetalAlpha)
                    );
                    ctx.bezierCurveTo(
                        radius * (0.05 + 0.15 * sidePetalAlpha),
                        -radius * (0.1 + 0.4 * sidePetalAlpha),
                        radius * 0.05 * sidePetalAlpha,
                        radius * 0.1,
                        radius * 0.1 * sidePetalAlpha,
                        radius * 0.2
                    );
                }

                // Bottom smile - morphs from straight to curved smile
                if (smile > 0) {
                    ctx.moveTo(-radius * 0.6, radius * (0.5 - 0.1 * smile)); // Corners rise with smile
                    ctx.quadraticCurveTo(
                        0,
                        radius * (0.5 + 0.1 * smile), // Center dips for smile
                        radius * 0.6,
                        radius * (0.5 - 0.1 * smile) // Right corner rises
                    );
                }
            }

            ctx.closePath();

            // Fill with gradient using evenodd rule to create the lotus cutout
            ctx.fill('evenodd');
            // Don't stroke the lotus cutout, only the outer circle
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Only add additional glow layers when fully in zen, not during transitions
            if (zenTransition.phase === 'in') {
                // Additional EXPANSIVE glow layers for inner radiance
                // Layer 1: BRILLIANT lotus core intensifier - from lower quarter
                const lotusRadius = radius * 2.0; // Larger radius for more expansion
                const arcHeight = zenTransition.arcHeight * radius; // Get arc height from transition state
                const glowOriginY = radius * 0.5; // Lower quarter origin
                const lotusGlow = ctx.createRadialGradient(
                    0,
                    glowOriginY,
                    0,
                    0,
                    glowOriginY,
                    lotusRadius * 1.2
                );
                lotusGlow.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`);
                lotusGlow.addColorStop(0.25, `rgba(255, 252, 240, ${0.8 * zenPulse})`);
                lotusGlow.addColorStop(0.5, `rgba(255, 245, 200, ${0.6 * zenPulse})`);
                lotusGlow.addColorStop(0.75, `rgba(255, 235, 150, ${0.4 * zenPulse})`);
                lotusGlow.addColorStop(1, 'rgba(255, 223, 0, 0)');
                ctx.fillStyle = lotusGlow;
                ctx.fill();

                // Layer 2: GAUSSIAN outer halo for smooth falloff
                const outerHalo = ctx.createRadialGradient(
                    0,
                    -arcHeight / 2,
                    radius * 0.5,
                    0,
                    -arcHeight / 2,
                    radius * 5
                );
                outerHalo.addColorStop(0, 'rgba(255, 223, 0, 0)');
                outerHalo.addColorStop(0.1, `rgba(255, 223, 0, ${0.25 * zenPulse})`);
                outerHalo.addColorStop(0.2, `rgba(255, 220, 0, ${0.2 * zenPulse})`);
                outerHalo.addColorStop(0.35, `rgba(255, 215, 0, ${0.15 * zenPulse})`);
                outerHalo.addColorStop(0.5, `rgba(255, 215, 0, ${0.1 * zenPulse})`);
                outerHalo.addColorStop(0.65, `rgba(255, 215, 0, ${0.06 * zenPulse})`);
                outerHalo.addColorStop(0.8, `rgba(255, 215, 0, ${0.03 * zenPulse})`);
                outerHalo.addColorStop(0.9, `rgba(255, 215, 0, ${0.01 * zenPulse})`);
                outerHalo.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = outerHalo;
                ctx.fill();
            }
        } else {
            // Draw horizontal line or circle during transition
            // Start with very dim golden color that brightens with lotus

            // No glow during transition to prevent flash
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

            // Use very dim golden color during transition
            const dimIntensity = 0.3; // Keep consistently dim during transition
            ctx.fillStyle = `rgba(255, 215, 0, ${dimIntensity})`;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Very subtle gradient during transition to see lotus clearly
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            coreGradient.addColorStop(0.5, 'rgba(255, 250, 230, 0.1)');
            coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = coreGradient;
            ctx.fill();
        }

        ctx.restore();
    }
}
