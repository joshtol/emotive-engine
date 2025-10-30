/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Particle Renderer
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Particle Renderer - Manages particle rendering logic
 * @author Emotive Engine Team
 * @module core/particle/ParticleRenderer
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages RENDERING LOGIC for particles. Handles layer-based rendering (foreground/
 * ║ background), culling, batching, and gesture effects like firefly, flicker, shimmer.
 * ║
 * ║ Extracted from ParticleSystem to follow Single Responsibility Principle.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 RENDERING STRATEGY
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Layer-based rendering (z < 0 background, z >= 0 foreground)
 * │ • Off-screen culling with 50px margin
 * │ • Batch optimization (minimize state changes)
 * │ • Sort by render properties (cell-shaded, glow)
 * │ • Gesture effects (firefly, flicker, shimmer, glow)
 * │ • Depth-adjusted sizing
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class ParticleRenderer {
    /**
     * Renders all particles (legacy method - renders all layers)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} particles - Array of particles to render
     * @param {string} emotionColor - Fallback color
     * @param {Object} gestureTransform - Optional gesture effects
     */
    render(ctx, particles, emotionColor = '#ffffff', gestureTransform = null) {
        const visibleParticles = [];

        // Skip dead particles only
        for (const particle of particles) {
            if (particle.life <= 0) continue;
            visibleParticles.push(particle);
        }

        // Render the particles
        this._renderParticles(ctx, visibleParticles, emotionColor, gestureTransform);
    }

    /**
     * Renders a specific layer (foreground or background)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} particles - Array of all particles
     * @param {string} emotionColor - Fallback color
     * @param {boolean} isForeground - true for foreground (z >= 0), false for background (z < 0)
     * @param {Object} gestureTransform - Optional gesture effects
     * @returns {Array} Visible particles that were rendered
     */
    renderLayer(ctx, particles, emotionColor = '#ffffff', isForeground = false, gestureTransform = null) {
        const visibleParticles = [];

        // First pass: cull off-screen, dead, and wrong-layer particles
        const margin = 50;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        for (const particle of particles) {
            // Filter by z-layer
            const particleInForeground = particle.z >= 0;
            if (particleInForeground !== isForeground) {
                continue; // Skip particles in wrong layer
            }

            // Skip off-screen particles (culling)
            if (particle.x < -margin || particle.x > canvasWidth + margin ||
                particle.y < -margin || particle.y > canvasHeight + margin) {
                continue;
            }

            // Skip dead particles
            if (particle.life <= 0) continue;

            visibleParticles.push(particle);
        }

        // Sort by render type to minimize state changes
        visibleParticles.sort((a, b) => {
            if (a.isCellShaded !== b.isCellShaded) {
                return a.isCellShaded ? -1 : 1;
            }
            if (a.hasGlow !== b.hasGlow) {
                return a.hasGlow ? -1 : 1;
            }
            return 0;
        });

        // Actually render the particles
        this._renderParticles(ctx, visibleParticles, emotionColor, gestureTransform);

        return visibleParticles;
    }

    /**
     * Internal render implementation - batch optimized rendering
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} visibleParticles - Pre-filtered visible particles
     * @param {string} emotionColor - Fallback color
     * @param {Object} gestureTransform - Optional gesture effects
     */
    _renderParticles(ctx, visibleParticles, emotionColor, gestureTransform = null) {
        // Batch render with minimized state changes
        ctx.save();
        let lastFillStyle = null;

        for (const particle of visibleParticles) {
            // For cell-shaded, use original render (they need complex stroke/fill combos)
            if (particle.isCellShaded) {
                particle.render(ctx, emotionColor);
                // Reset cached values since particle.render may have changed them
                lastFillStyle = null;
            } else {
                // Batch-optimized rendering for regular particles
                const particleColor = particle.color || emotionColor;

                // Only set fillStyle if it changed
                if (particleColor !== lastFillStyle) {
                    ctx.fillStyle = particleColor;
                    lastFillStyle = particleColor;
                }

                // Validate position once
                if (!isFinite(particle.x) || !isFinite(particle.y)) continue;

                // Use depth-adjusted size if particle has the method
                const depthSize = particle.getDepthAdjustedSize ? particle.getDepthAdjustedSize() : particle.size;
                let safeSize = Math.max(0.1, depthSize);

                // Calculate firefly glow (used by multiple effects)
                let fireflyGlow = 1.0;

                // Apply firefly effect if sparkle gesture is active
                if (gestureTransform && gestureTransform.fireflyEffect) {
                    const particlePhase = (particle.x * 0.01 + particle.y * 0.01 + particle.size * 0.1) % (Math.PI * 2);
                    const time = gestureTransform.fireflyTime || (Date.now() * 0.001);
                    const intensity = gestureTransform.particleGlow || 2.0;

                    fireflyGlow = 0.3 + Math.max(0, Math.sin(time * 3 + particlePhase)) * intensity;
                }

                // Apply flicker effect if flicker gesture is active (now does particle shimmer)
                if (gestureTransform && gestureTransform.flickerEffect) {
                    const particlePhase = (particle.x * 0.02 + particle.y * 0.02) % (Math.PI * 2);
                    const time = gestureTransform.flickerTime || (Date.now() * 0.001);
                    const intensity = gestureTransform.particleGlow || 2.0;

                    fireflyGlow = 0.5 + Math.sin(time * 12 + particlePhase) * intensity * 0.5;
                }

                // Apply shimmer effect if shimmer gesture is active (subtle glow)
                if (gestureTransform && gestureTransform.shimmerEffect) {
                    const dx = particle.x - (ctx.canvas.width / 2);
                    const dy = particle.y - (ctx.canvas.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDistance = distance / 200;

                    const time = gestureTransform.shimmerTime || (Date.now() * 0.001);
                    const wave = gestureTransform.shimmerWave || 0;
                    const intensity = gestureTransform.particleGlow || 1.2;

                    const travelingWave = Math.sin(time * 3 - normalizedDistance + wave);
                    fireflyGlow = 1 + travelingWave * 0.15 * intensity;
                }

                // Apply glow effect if glow gesture is active (radiant burst)
                if (gestureTransform && gestureTransform.glowEffect) {
                    const progress = gestureTransform.glowProgress || 0;
                    const intensity = gestureTransform.particleGlow || 2.0;

                    const dx = particle.x - (ctx.canvas.width / 2);
                    const dy = particle.y - (ctx.canvas.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDistance = distance / 300;

                    const radiateDelay = Math.min(normalizedDistance * 0.3, 0.5);
                    const localProgress = Math.max(0, (progress - radiateDelay) / (1 - radiateDelay));
                    const localEnvelope = Math.sin(localProgress * Math.PI);

                    // Store original glow properties
                    if (!particle._originalGlow) {
                        particle._originalGlow = {
                            hasGlow: particle.hasGlow,
                            glowSizeMultiplier: particle.glowSizeMultiplier || 0
                        };
                    }

                    // Enable glow temporarily
                    particle.hasGlow = true;
                    particle.glowSizeMultiplier = Math.max(3.0, particle._originalGlow.glowSizeMultiplier) + localEnvelope * intensity * 3;

                    // Boost particle size
                    const glowSizeBoost = 1 + localEnvelope * 0.3;
                    safeSize = safeSize * glowSizeBoost;

                    // Cleanup when effect ends
                    if (progress >= 0.99 && particle._originalGlow) {
                        particle.hasGlow = particle._originalGlow.hasGlow;
                        particle.glowSizeMultiplier = particle._originalGlow.glowSizeMultiplier;
                        delete particle._originalGlow;
                    }
                }

                // Draw glow layers if needed
                if (particle.hasGlow || fireflyGlow > 1.0) {
                    const glowRadius = Math.max(0.1, safeSize * (particle.glowSizeMultiplier || 1.5) * fireflyGlow);

                    const originalCompositeOp = ctx.globalCompositeOperation;
                    ctx.globalCompositeOperation = 'screen';

                    // Outer glow
                    ctx.globalAlpha = particle.opacity * 0.15 * fireflyGlow;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
                    ctx.fill();

                    // Inner glow
                    ctx.globalAlpha = particle.opacity * 0.25 * fireflyGlow;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, glowRadius * 0.6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.globalCompositeOperation = originalCompositeOp;
                }

                // Draw core
                ctx.globalAlpha = particle.opacity * (particle.baseOpacity || 0.5) * 0.6 * Math.min(2.0, fireflyGlow);
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, safeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

export default ParticleRenderer;
