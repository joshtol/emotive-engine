/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Shape Module
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Suspicion shape - the sly grin discovered by accident!
 * @author Emotive Engine Team
 * @module shapes/organic/suspicion
 * @complexity ⭐ Beginner-friendly
 * @audience Shape definitions for morphing. Copy these to create custom shapes.
 *
 * HAPPY ACCIDENT ORIGIN:
 * This shape was discovered when trying to create a moon shape. The broken
 * implementation created a perfect sly, mischievous grin that was too good
 * to fix. Sometimes the best features come from creative mistakes!
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Suspicion shape configuration
 */
export default {
    name: 'suspicion',
    category: SHAPE_CATEGORIES.ORGANIC,
    emoji: '😏',
    description: 'Sly grin for suspicious or mischievous moods',

    // Subtle shadow for depth
    shadow: {
        type: 'none',
        innerShadow: true,
        shadowDepth: 0.2,
    },

    // Musical rhythm preferences
    rhythm: {
        syncMode: 'off', // Suspicion doesn't follow rules
        randomTwitch: true, // Occasional random movements
        slowDrift: true, // Sneaky drifting
    },

    // Emotion associations
    emotions: ['suspicion', 'mischief', 'slyness', 'scheming', 'playful'],

    /**
     * Generate suspicion shape points (the famous sly grin)
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;

            // Create the sly grin shape - our happy accident!
            let x, y;

            if (t < Math.PI) {
                // Right side - outer arc of the grin
                x = Math.cos(t) * 0.45;
                y = Math.sin(t) * 0.45;
            } else {
                // Left side - inner arc for the mischievous smile
                const innerT = Math.PI * 2 - t;
                x = Math.cos(innerT) * 0.25 - 0.1;
                y = Math.sin(innerT) * 0.35;
            }

            points.push({
                x: 0.5 + x,
                y: 0.5 + y,
            });
        }

        return points;
    },

    /**
     * Custom render for suspicion effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, options = {}) {
        if (progress < 0.3) return;

        const time = Date.now() / 1000;

        ctx.save();
        ctx.translate(x, y);

        // Add inner shadow for depth (makes the grin more pronounced)
        if (this.shadow.innerShadow) {
            ctx.globalCompositeOperation = 'multiply';

            const shadowGradient = ctx.createRadialGradient(
                -radius * 0.1,
                -radius * 0.1,
                0,
                0,
                0,
                radius
            );
            shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${0.3 * progress})`);
            shadowGradient.addColorStop(0.5, `rgba(0, 0, 0, ${0.1 * progress})`);
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Optional: Add shifty eye glints
        if (options.eyeGlints && progress > 0.7) {
            ctx.globalCompositeOperation = 'screen';

            // Left eye glint
            const leftGlintX = -radius * 0.3 + Math.sin(time * 2) * radius * 0.05;
            const leftGlintY = -radius * 0.1;

            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * progress})`;
            ctx.beginPath();
            ctx.ellipse(leftGlintX, leftGlintY, radius * 0.08, radius * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();

            // Right eye glint
            const rightGlintX = radius * 0.3 + Math.sin(time * 2 + Math.PI) * radius * 0.05;
            const rightGlintY = -radius * 0.1;

            ctx.beginPath();
            ctx.ellipse(rightGlintX, rightGlintY, radius * 0.08, radius * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    /**
     * Special animation hints for suspicion
     */
    getAnimationHints() {
        return {
            occasionalTwitch: true,
            twitchInterval: { min: 3000, max: 8000 },
            slowDrift: true,
            driftSpeed: 0.1,
            narrowEyes: true, // Squint effect
        };
    },
};
