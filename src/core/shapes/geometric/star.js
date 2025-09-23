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
        sparkle: true  // Optional sparkle effect
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'beat',
        pulseOnBeat: true,
        rotateWithTempo: true
    },
    
    // Emotion associations
    emotions: ['achievement', 'excellence', 'magic', 'wonder'],
    
    // Star-specific configuration
    config: {
        points: 5,           // Number of star points
        innerRadius: 0.2,    // Inner radius ratio (smaller for sharper points)
        outerRadius: 0.5     // Outer radius ratio
    },
    
    /**
     * Generate star shape points matching star.svg geometry
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        
        // Star.svg path coordinates (normalized to 0-1 range)
        // Original: M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z
        const starVertices = [
            { x: 0.5, y: 0.72 },      // 12, 17.27 -> center bottom
            { x: 0.76, y: 0.875 },    // 18.18, 21 -> top right
            { x: 0.68, y: 0.21 },     // 16.36, 5.03 -> right middle
            { x: 0.92, y: 0.385 },    // 22, 9.24 -> top right
            { x: 0.2, y: 0.36 },      // 4.81, 8.63 -> left middle
            { x: 0.5, y: 0.083 },     // 12, 2 -> top center
            { x: 0.38, y: 0.36 },     // 9.19, 8.63 -> left middle
            { x: 0.083, y: 0.385 },   // 2, 9.24 -> top left
            { x: 0.23, y: 0.21 },     // 5.46, 5.03 -> left middle
            { x: 0.24, y: 0.875 }     // 5.82, 21 -> top left
        ];
        
        // Interpolate points along the star perimeter
        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            const vertexCount = starVertices.length;
            
            // Which edge are we on?
            const edgeFloat = t * vertexCount;
            const edgeIndex = Math.floor(edgeFloat) % vertexCount;
            const nextIndex = (edgeIndex + 1) % vertexCount;
            const edgeProgress = edgeFloat - Math.floor(edgeFloat);
            
            // Linear interpolation between vertices
            const v1 = starVertices[edgeIndex];
            const v2 = starVertices[nextIndex];
            
            points.push({
                x: v1.x + (v2.x - v1.x) * edgeProgress,
                y: v1.y + (v2.y - v1.y) * edgeProgress
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
    render(ctx, x, y, radius, progress, options = {}) {
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
    }
};