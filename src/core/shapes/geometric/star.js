/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Star Shape Module
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Star shape with configurable points
 * @author Emotive Engine Team
 * @module shapes/geometric/star
 * @complexity ⭐ Beginner-friendly
 * @audience Shape definitions for morphing. Copy these to create custom shapes.
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Star shape configuration
 */
export default {
    name: 'star',
    category: SHAPE_CATEGORIES.GEOMETRIC,
    emoji: '⭐',
    description: 'Five-pointed star',

    // No shadow, but could add sparkle effects
    shadow: {
        type: 'none',
        sparkle: true, // Optional sparkle effect
    },

    // Musical rhythm preferences
    rhythm: {
        syncMode: 'beat',
        pulseOnBeat: true,
        rotateWithTempo: true,
    },

    // Emotion associations
    emotions: ['achievement', 'excellence', 'magic', 'wonder'],

    // Star-specific configuration
    config: {
        points: 5, // Number of star points
        innerRadius: 0.2, // Inner radius ratio (smaller for sharper points)
        outerRadius: 0.5, // Outer radius ratio
    },

    /**
     * Generate star shape points - mathematically correct 5-pointed star
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const { innerRadius, outerRadius } = this.config;

        // Create a proper 5-pointed star outline
        // A 5-pointed star has 10 vertices: 5 outer points + 5 inner valleys

        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;

            // Map to star vertices (10 total for a 5-pointed star)
            const vertexIndex = Math.floor(t * 10);
            const isOuterPoint = vertexIndex % 2 === 0;
            const armIndex = Math.floor(vertexIndex / 2);

            // Calculate angle for this vertex
            // Outer points: 0°, 72°, 144°, 216°, 288°
            // Inner points: 36°, 108°, 180°, 252°, 324°
            let angle;
            if (isOuterPoint) {
                angle = (armIndex * 72 * Math.PI) / 180; // 72° = 360°/5
            } else {
                angle = ((armIndex * 72 + 36) * Math.PI) / 180; // 36° = 72°/2
            }

            // Use appropriate radius
            const radius = isOuterPoint ? outerRadius : innerRadius;

            points.push({
                x: 0.5 + Math.cos(angle) * radius,
                y: 0.5 + Math.sin(angle) * radius,
            });
        }

        return points;
    },

    /**
     * Optional sparkle effect render
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, _options = {}) {
        if (!this.shadow.sparkle || progress < 0.5) return;

        const time = Date.now() / 100;

        ctx.save();
        ctx.translate(x, y);
        ctx.globalCompositeOperation = 'screen';

        // Add sparkles at star points
        const starPoints = this.config.points;
        for (let i = 0; i < starPoints; i++) {
            const angle = (i / starPoints) * Math.PI * 2 - Math.PI / 2;
            const sparkleRadius = radius * 0.5;
            const px = Math.cos(angle) * sparkleRadius;
            const py = Math.sin(angle) * sparkleRadius;

            // Pulsing sparkle
            const pulse = Math.sin(time * 0.3 + i) * 0.5 + 0.5;
            const sparkleSize = radius * 0.1 * pulse;

            const sparkleGradient = ctx.createRadialGradient(px, py, 0, px, py, sparkleSize);
            sparkleGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * progress * pulse})`);
            sparkleGradient.addColorStop(0.5, `rgba(255, 255, 200, ${0.4 * progress * pulse})`);
            sparkleGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');

            ctx.fillStyle = sparkleGradient;
            ctx.beginPath();
            ctx.arc(px, py, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },
};
