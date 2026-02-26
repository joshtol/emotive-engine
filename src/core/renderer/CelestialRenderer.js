/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                   ◐ ◑ ◒ ◓  CELESTIAL RENDERER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Celestial Renderer - Solar and Lunar Eclipse Effects
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module CelestialRenderer
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Renders celestial and eclipse effects including:
 * ║ • Solar corona, flames, and rays
 * ║ • Bailey's beads (eclipse bead effects)
 * ║ • Lunar shadow rendering
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class CelestialRenderer {
    /**
     * Render solar eclipse effects (corona, flares, rays)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Solar radius
     * @param {Object} shadow - Shadow configuration object
     */
    renderSunEffects(ctx, x, y, radius, shadow) {
        const time = Date.now() / 100;

        ctx.save();
        ctx.translate(x, y);

        // 1. Surface texture - turbulent plasma
        if (shadow.texture && (shadow.textureOpacity === undefined || shadow.textureOpacity > 0)) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = shadow.textureOpacity !== undefined ? shadow.textureOpacity : 1;

            const offset = (time * 0.05 * (shadow.turbulence || 0.3)) / 0.3;
            const textureGradient = ctx.createRadialGradient(
                Math.sin(offset) * radius * 0.15,
                Math.cos(offset * 0.7) * radius * 0.15,
                radius * 0.2,
                0,
                0,
                radius
            );
            textureGradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
            textureGradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.1)');
            textureGradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.08)');
            textureGradient.addColorStop(1, 'rgba(255, 100, 30, 0.05)');

            ctx.fillStyle = textureGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // 2. Bright corona layers
        const coronaOpacity = shadow.coronaOpacity !== undefined ? shadow.coronaOpacity : 1;
        if (coronaOpacity > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // Inner bright glow
            const innerGlow = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.1);
            innerGlow.addColorStop(0, `rgba(255, 255, 255, ${0.8 * coronaOpacity})`);
            innerGlow.addColorStop(0.3, `rgba(255, 250, 200, ${0.6 * coronaOpacity})`);
            innerGlow.addColorStop(0.5, `rgba(255, 200, 100, ${0.4 * coronaOpacity})`);
            innerGlow.addColorStop(0.7, `rgba(255, 150, 50, ${0.2 * coronaOpacity})`);
            innerGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');

            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();

            // Outer corona with animation
            for (let i = 0; i < 2; i++) {
                const scale = 1.3 + i * 0.4;
                const opacity = (0.35 - i * 0.15) * coronaOpacity;
                const wobble = Math.sin(time * 0.1 + i) * 0.05;

                const coronaGradient = ctx.createRadialGradient(
                    0,
                    0,
                    radius * (0.9 + wobble),
                    0,
                    0,
                    radius * (scale + wobble)
                );
                coronaGradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
                coronaGradient.addColorStop(0.4, `rgba(255, 200, 100, ${opacity * 0.5})`);
                coronaGradient.addColorStop(0.7, `rgba(255, 150, 50, ${opacity})`);
                coronaGradient.addColorStop(0.9, `rgba(255, 100, 30, ${opacity * 0.5})`);
                coronaGradient.addColorStop(1, 'rgba(255, 50, 10, 0)');

                ctx.fillStyle = coronaGradient;
                ctx.beginPath();
                ctx.arc(0, 0, radius * (scale + wobble), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // 3. Optimized ethereal flame pennants - TONS of rays
        if (shadow.flares) {
            ctx.save();

            // Pre-calculate common values
            const wave1 = Math.sin(time * 0.08);
            const wave2 = Math.sin(time * 0.12);
            const wave3 = Math.sin(time * 0.16);

            // Create single gradient for all flames
            const grad = ctx.createLinearGradient(0, -radius, 0, -radius * 3);
            grad.addColorStop(0, 'rgba(255, 255, 230, 0.4)');
            grad.addColorStop(0.2, 'rgba(255, 220, 150, 0.25)');
            grad.addColorStop(0.5, 'rgba(255, 180, 80, 0.15)');
            grad.addColorStop(0.8, 'rgba(255, 120, 40, 0.08)');
            grad.addColorStop(1, 'rgba(255, 60, 20, 0)');

            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'screen';

            // Single path for ALL flames
            ctx.beginPath();

            // Helper function for flame shape
            const addFlame = (angle, length, width, wave) => {
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const baseX = cos * radius;
                const baseY = sin * radius;
                const tipX = cos * (radius + length);
                const tipY = sin * (radius + length);
                const perpX = -sin * width * 0.5;
                const perpY = cos * width * 0.5;
                const waveOffset = wave * width * 0.3;

                // Simple triangle with slight curve
                ctx.moveTo(baseX - perpX, baseY - perpY);
                ctx.quadraticCurveTo(
                    (baseX + tipX) * 0.5 + perpX * waveOffset,
                    (baseY + tipY) * 0.5 + perpY * waveOffset,
                    tipX,
                    tipY
                );
                ctx.quadraticCurveTo(
                    (baseX + tipX) * 0.5 - perpX * waveOffset,
                    (baseY + tipY) * 0.5 - perpY * waveOffset,
                    baseX + perpX,
                    baseY + perpY
                );
            };

            // Layer 1: Long primary rays (8)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + wave1 * 0.1;
                const length = radius * (1.8 + Math.sin(time * 0.1 + i * 0.5) * 0.4);
                const width = radius * 0.18;
                const wave = Math.sin(time * 0.15 + i);
                addFlame(angle, length, width, wave);
            }

            // Layer 2: Medium rays between primaries (12)
            for (let i = 0; i < 12; i++) {
                const angle = ((i + 0.5) / 12) * Math.PI * 2 + wave2 * 0.08;
                const length = radius * (1.2 + Math.sin(time * 0.13 + i * 0.7) * 0.3);
                const width = radius * 0.12;
                const wave = Math.sin(time * 0.18 + i * 1.2);
                addFlame(angle, length, width, wave);
            }

            // Layer 3: Short rays filling gaps (15)
            for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2 + wave3 * 0.05;
                const length = radius * (0.7 + Math.sin(time * 0.17 + i * 0.9) * 0.25);
                const width = radius * 0.08;
                const wave = Math.sin(time * 0.2 + i * 1.5);
                addFlame(angle, length, width, wave);
            }

            // Layer 4: Tiny rays for density (15)
            for (let i = 0; i < 15; i++) {
                const angle = ((i + 0.25) / 15) * Math.PI * 2;
                const length = radius * (0.4 + Math.sin(time * 0.22 + i) * 0.2);
                const width = radius * 0.06;
                // Simple triangles for tiny rays
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const baseX = cos * radius;
                const baseY = sin * radius;
                const tipX = cos * (radius + length);
                const tipY = sin * (radius + length);
                const perpX = -sin * width * 0.5;
                const perpY = cos * width * 0.5;

                ctx.moveTo(baseX - perpX, baseY - perpY);
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(baseX + perpX, baseY + perpY);
            }

            // Single fill operation for all rays!
            ctx.fill();
            ctx.restore();
        }

        // 4. Bright rim lighting
        const rimGradient = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
        rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        rimGradient.addColorStop(0.7, 'rgba(255, 255, 200, 0.2)');
        rimGradient.addColorStop(0.9, 'rgba(255, 200, 100, 0.5)');
        rimGradient.addColorStop(1, 'rgba(255, 150, 50, 0.3)');

        ctx.fillStyle = rimGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Render Bailey's Beads for solar eclipse
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Solar radius
     * @param {number} shadowOffsetX - Shadow X offset
     * @param {number} shadowOffsetY - Shadow Y offset
     * @param {number} morphProgress - Morph progress (0-1)
     * @param {boolean} isTransitioningToSolar - Whether transitioning to solar state
     * @param {boolean} hasSunRays - Whether sun rays are visible
     * @param {Function} scaleValue - Scale value function
     */
    renderBaileysBeads(
        ctx,
        x,
        y,
        radius,
        shadowOffsetX,
        shadowOffsetY,
        morphProgress,
        isTransitioningToSolar,
        hasSunRays,
        scaleValue = v => v
    ) {
        // NEVER show beads if there are no sun rays visible
        if (!hasSunRays) {
            this._beadStartTime = null;
            return;
        }

        // Check if this is a lunar-solar transition (shadow stays centered)
        const isLunarSolarTransition = Math.abs(shadowOffsetX) < 1 && Math.abs(shadowOffsetY) < 1;

        // Show beads when shadow is approaching center OR for lunar-solar transitions
        // Different thresholds for entering vs leaving
        const threshold = isTransitioningToSolar ? 30 : 15; // Disappear faster when leaving
        const shadowNearCenter =
            Math.abs(shadowOffsetX) < threshold && Math.abs(shadowOffsetY) < threshold;

        if (!shadowNearCenter && !isLunarSolarTransition) {
            // Reset when not near center (unless it's lunar-solar)
            this._beadStartTime = null;
            return;
        }

        // Check if we need to generate new beads (first time shadow centers for this transition)
        if (!this._beadStartTime) {
            const beadCount = Math.floor(Math.random() * 4) + 1; // 1-4 beads

            this._currentBeads = [];

            // Create beads with random order
            const angles = [];
            for (let i = 0; i < beadCount; i++) {
                angles.push(Math.random() * Math.PI * 2);
            }

            // Shuffle the order they'll appear
            const order = Array.from({ length: beadCount }, (_, i) => i);
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }

            for (let i = 0; i < beadCount; i++) {
                this._currentBeads.push({
                    angle: angles[i],
                    size: 3 + Math.random() * 5, // Random size 3-8
                    order: order[i], // Order in sequence
                    delay: order[i] * 200, // 200ms between each bead
                });
            }

            this._beadStartTime = Date.now();
        }

        const elapsedTime = Date.now() - this._beadStartTime;

        // Render the beads as chromatic lens flares (one at a time)
        const beads = this._currentBeads || [];

        beads.forEach(bead => {
            // Check if this bead should be visible yet
            if (elapsedTime < bead.delay) return;

            // Calculate fade in (300ms fade)
            const beadAge = elapsedTime - bead.delay;
            const fadeInDuration = 300;
            const opacity = Math.min(1, beadAge / fadeInDuration);

            // Calculate bead position on the edge of the sun (not shadow)
            const beadX = x + Math.cos(bead.angle) * radius;
            const beadY = y + Math.sin(bead.angle) * radius;

            ctx.save();
            ctx.translate(beadX, beadY);
            ctx.globalAlpha = opacity;

            // Draw chromatic aberration lens flare
            const size = scaleValue(bead.size);

            // Chromatic layers - RGB separated for aberration effect
            const colors = [
                { color: `rgba(255, 100, 100, ${0.6 * opacity})`, offset: -2 }, // Red
                { color: `rgba(100, 255, 100, ${0.6 * opacity})`, offset: 0 }, // Green
                { color: `rgba(100, 100, 255, ${0.6 * opacity})`, offset: 2 }, // Blue
            ];

            ctx.globalCompositeOperation = 'screen';

            colors.forEach(({ color, offset }) => {
                // Create radial gradient for each color channel
                const gradient = ctx.createRadialGradient(
                    offset,
                    offset,
                    0,
                    offset,
                    offset,
                    size * 2
                );

                gradient.addColorStop(0, color);
                gradient.addColorStop(0.2, color.replace(`${0.6 * opacity}`, `${0.4 * opacity}`));
                gradient.addColorStop(0.5, color.replace(`${0.6 * opacity}`, `${0.2 * opacity}`));
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(offset, offset, size * 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Add bright white core
            ctx.globalCompositeOperation = 'lighter';
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            coreGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.5 * opacity})`);
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Render moon/lunar shadow overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Lunar radius
     * @param {Object} shadow - Shadow configuration object
     * @param {Array} shapePoints - Array of shape points for clipping
     * @param {boolean} isSolarOverlay - True if this is being called for solar eclipse effect
     * @param {number} _rotation - Rotation angle to apply (unused but kept for API consistency)
     * @param {Object} shapeMorpher - Optional shape morpher reference
     */
    renderMoonShadow(
        ctx,
        x,
        y,
        radius,
        shadow,
        shapePoints,
        isSolarOverlay = false,
        _rotation = 0,
        shapeMorpher = null
    ) {
        ctx.save();
        ctx.globalAlpha = 1; // Always render shadow at full opacity, even in resting state
        ctx.translate(x, y);

        if (shadow.type === 'crescent') {
            // Crescent moon - smooth shadow without pixelation

            // Get morph progress to animate the shadow sliding in
            let shadowProgress = 1.0; // Default to fully visible
            let animatedOffset = shadow.offset || 0.7; // Default to the shadow's offset

            if (shapeMorpher) {
                const morphProgress = shapeMorpher.getProgress();
                const { targetShape } = shapeMorpher;

                // Animate shadow sliding in when morphing TO moon (and shadow.offset is not being controlled)
                if (
                    targetShape === 'moon' &&
                    morphProgress !== undefined &&
                    morphProgress < 1 &&
                    !shadow.shadowX
                ) {
                    // Shadow slides in from the left
                    shadowProgress = morphProgress;
                    const baseOffset = 0.7;
                    // Animate the offset - starts far left (-2) and slides to final position
                    animatedOffset = -2 + (baseOffset + 2) * shadowProgress;
                }
            }
            // Calculate shadow offset - shadow rotates with the moon
            const angleRad = ((shadow.angle || -30) * Math.PI) / 180;
            const offsetX = Math.cos(angleRad) * radius * animatedOffset;
            const offsetY = Math.sin(angleRad) * radius * animatedOffset;

            // Enable high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Clip to the moon shape
            ctx.beginPath();
            if (shapePoints && shapePoints.length > 0) {
                ctx.moveTo(shapePoints[0].x, shapePoints[0].y);
                for (let i = 1; i < shapePoints.length; i++) {
                    ctx.lineTo(shapePoints[i].x, shapePoints[i].y);
                }
                ctx.closePath();
            } else {
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
            }
            ctx.clip();

            // Use a single smooth gradient for the entire shadow
            const shadowGradient = ctx.createRadialGradient(
                offsetX,
                offsetY,
                radius * 0.9,
                offsetX,
                offsetY,
                radius * 1.1
            );

            // More gradient stops for smoother transition
            const baseCoverage = shadow.coverage !== undefined ? shadow.coverage : 0.85;
            const shadowOpacity = Math.min(1, shadowProgress * 1.2) * (baseCoverage / 0.85);
            shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${1 * shadowOpacity})`);
            shadowGradient.addColorStop(0.8, `rgba(0, 0, 0, ${1 * shadowOpacity})`);
            shadowGradient.addColorStop(0.88, `rgba(0, 0, 0, ${0.98 * shadowOpacity})`);
            shadowGradient.addColorStop(0.91, `rgba(0, 0, 0, ${0.95 * shadowOpacity})`);
            shadowGradient.addColorStop(0.93, `rgba(0, 0, 0, ${0.9 * shadowOpacity})`);
            shadowGradient.addColorStop(0.95, `rgba(0, 0, 0, ${0.8 * shadowOpacity})`);
            shadowGradient.addColorStop(0.96, `rgba(0, 0, 0, ${0.65 * shadowOpacity})`);
            shadowGradient.addColorStop(0.97, `rgba(0, 0, 0, ${0.45 * shadowOpacity})`);
            shadowGradient.addColorStop(0.98, `rgba(0, 0, 0, ${0.25 * shadowOpacity})`);
            shadowGradient.addColorStop(0.99, `rgba(0, 0, 0, ${0.1 * shadowOpacity})`);
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            // Always use a circular shadow - crescent effect only works with circles
            ctx.arc(offsetX, offsetY, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
        } else if (shadow.type === 'lunar') {
            // Lunar eclipse - diffuse reddish shadow
            const diffusion = shadow.diffusion !== undefined ? shadow.diffusion : 1;
            const sharpness = 1 - diffusion;

            // Get morph progress to animate the shadow sliding in for solar
            let shadowOffsetX = 0;
            let shadowOffsetY = 0;

            if (shapeMorpher) {
                const morphProgress = shapeMorpher.getProgress();
                const { currentShape, targetShape } = shapeMorpher;

                // Animate shadow sliding in when morphing TO solar (for solar overlay)
                if (
                    isSolarOverlay &&
                    targetShape === 'solar' &&
                    morphProgress !== undefined &&
                    morphProgress < 1
                ) {
                    // Shadow slides in from bottom-left
                    const slideDistance = radius * 2.5;
                    // Start from bottom-left, move to center
                    shadowOffsetX = -slideDistance * (1 - morphProgress);
                    shadowOffsetY = slideDistance * (1 - morphProgress);
                }
                // Animate shadow sliding out when morphing FROM solar
                else if (
                    isSolarOverlay &&
                    currentShape === 'solar' &&
                    targetShape !== 'solar' &&
                    targetShape !== null &&
                    morphProgress !== undefined &&
                    morphProgress < 1
                ) {
                    // Shadow slides out to top-right
                    const slideDistance = radius * 2.5;
                    // Move from center to top-right
                    shadowOffsetX = slideDistance * morphProgress;
                    shadowOffsetY = -slideDistance * morphProgress;
                }
            }

            // Apply translation for shadow animation
            ctx.translate(shadowOffsetX, shadowOffsetY);

            // For solar overlay, clip to the sun's core area only (not the corona)
            if (isSolarOverlay) {
                // Clip to a circle at the shadow's position that only covers the core
                ctx.save();
                ctx.beginPath();
                // Create a clipping region that's the intersection of the sun and the shadow
                ctx.arc(-shadowOffsetX, -shadowOffsetY, radius, 0, Math.PI * 2); // Sun position (inverse of shadow offset)
                ctx.clip();
            } else {
                // Regular lunar clipping
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
            }

            // Penumbra (diffuse outer shadow) - MUCH DARKER
            const penumbraRadius = radius * (1.8 - sharpness * 0.5);
            const penumbraGradient = ctx.createRadialGradient(
                0,
                0,
                radius * 0.2,
                0,
                0,
                penumbraRadius
            );

            const baseOpacity = shadow.coverage || 0.9;

            // Use custom color if specified (for solar eclipse), otherwise use default lunar red
            if (shadow.color && shadow.color.includes('0, 0, 0')) {
                // Black shadow for solar eclipse
                penumbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                penumbraGradient.addColorStop(
                    0.3 + sharpness * 0.2,
                    `rgba(0, 0, 0, ${baseOpacity * 0.95})`
                );
                penumbraGradient.addColorStop(
                    0.6 + sharpness * 0.2,
                    `rgba(0, 0, 0, ${baseOpacity * 0.8})`
                );
                penumbraGradient.addColorStop(0.85, `rgba(0, 0, 0, ${baseOpacity * 0.4})`);
                penumbraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                // Default reddish lunar eclipse colors
                penumbraGradient.addColorStop(0, `rgba(10, 2, 0, ${baseOpacity})`);
                penumbraGradient.addColorStop(
                    0.3 + sharpness * 0.2,
                    `rgba(20, 5, 0, ${baseOpacity * 0.95})`
                );
                penumbraGradient.addColorStop(
                    0.6 + sharpness * 0.2,
                    `rgba(40, 10, 5, ${baseOpacity * 0.8})`
                );
                penumbraGradient.addColorStop(0.85, `rgba(60, 15, 10, ${baseOpacity * 0.4})`);
                penumbraGradient.addColorStop(1, 'rgba(80, 20, 15, 0)');
            }

            ctx.fillStyle = penumbraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, penumbraRadius, 0, Math.PI * 2);
            ctx.fill();

            // Umbra (sharp inner shadow) - only when sharp
            if (sharpness > 0.3) {
                const umbraRadius = radius * (0.8 + sharpness * 0.3);
                const umbraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, umbraRadius);

                // Use black for solar eclipse, reddish for lunar
                if (shadow.color && shadow.color.includes('0, 0, 0')) {
                    umbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                    umbraGradient.addColorStop(0.5, `rgba(0, 0, 0, ${baseOpacity * 0.9})`);
                    umbraGradient.addColorStop(0.8, `rgba(0, 0, 0, ${baseOpacity * 0.5})`);
                    umbraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    umbraGradient.addColorStop(0, `rgba(0, 0, 0, ${baseOpacity})`);
                    umbraGradient.addColorStop(0.5, `rgba(10, 2, 0, ${baseOpacity * 0.9})`);
                    umbraGradient.addColorStop(0.8, `rgba(20, 5, 0, ${baseOpacity * 0.5})`);
                    umbraGradient.addColorStop(1, 'rgba(30, 8, 5, 0)');
                }

                ctx.fillStyle = umbraGradient;
                ctx.beginPath();
                ctx.arc(0, 0, umbraRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Restore extra save for solar overlay clipping
        if (isSolarOverlay) {
            ctx.restore();
        }

        ctx.restore();
    }
}
