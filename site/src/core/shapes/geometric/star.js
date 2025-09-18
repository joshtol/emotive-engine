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
     * Generate star shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const starPoints = 5; // 5-pointed star
        const outerRadius = 0.5;
        const innerRadius = outerRadius * 0.382; // Golden ratio for perfect star
        
        // Generate the 10 vertices (5 outer, 5 inner)
        const vertices = [];
        const angleStep = (Math.PI * 2) / starPoints; // 72 degrees between star points
        const halfAngleStep = angleStep / 2; // 36 degrees offset for inner points
        
        for (let i = 0; i < starPoints; i++) {
            // Outer point (star tip)
            const outerAngle = (i * angleStep) - Math.PI / 2; // Start from top
            vertices.push({
                x: 0.5 + Math.cos(outerAngle) * outerRadius,
                y: 0.5 + Math.sin(outerAngle) * outerRadius
            });
            
            // Inner point (valley) - offset by half the angle
            const innerAngle = outerAngle + halfAngleStep;
            vertices.push({
                x: 0.5 + Math.cos(innerAngle) * innerRadius,
                y: 0.5 + Math.sin(innerAngle) * innerRadius
            });
        }
        
        // Now interpolate points along the star perimeter
        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            const vertexCount = vertices.length;
            
            // Which edge are we on?
            const edgeFloat = t * vertexCount;
            const edgeIndex = Math.floor(edgeFloat) % vertexCount;
            const nextIndex = (edgeIndex + 1) % vertexCount;
            const edgeProgress = edgeFloat - Math.floor(edgeFloat);
            
            // Linear interpolation between vertices
            const v1 = vertices[edgeIndex];
            const v2 = vertices[nextIndex];
            
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