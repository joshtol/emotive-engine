/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Triangle Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Triangle shape - equilateral by default
 * @author Emotive Engine Team
 * @module shapes/geometric/triangle
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Triangle shape configuration
 */
export default {
    name: 'triangle',
    category: SHAPE_CATEGORIES.GEOMETRIC,
    emoji: '🔺',
    description: 'Equilateral triangle pointing upward',
    
    // No shadow effects
    shadow: {
        type: 'none'
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'beat',
        sharpTransitions: true,
        pointUpOnBeat: true   // Point aligns with beat
    },
    
    // Emotion associations
    emotions: ['direction', 'progress', 'ambition', 'focus'],
    
    // Triangle-specific configuration
    config: {
        pointUp: true,        // Point direction
        equilateral: true     // Equal sides
    },
    
    /**
     * Generate triangle shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const pointsPerSide = Math.floor(numPoints / 3);
        
        // Define triangle vertices (equilateral)
        const vertices = this.config.pointUp ? [
            { x: 0, y: -0.5 },           // Top
            { x: -0.433, y: 0.25 },      // Bottom left
            { x: 0.433, y: 0.25 }        // Bottom right
        ] : [
            { x: 0, y: 0.5 },            // Bottom
            { x: -0.433, y: -0.25 },     // Top left
            { x: 0.433, y: -0.25 }       // Top right
        ];
        
        // Generate points along each edge
        for (let side = 0; side < 3; side++) {
            const v1 = vertices[side];
            const v2 = vertices[(side + 1) % 3];
            
            for (let i = 0; i < pointsPerSide; i++) {
                const t = i / pointsPerSide;
                
                // Interpolate between vertices
                const x = v1.x + (v2.x - v1.x) * t;
                const y = v1.y + (v2.y - v1.y) * t;
                
                points.push({
                    x: 0.5 + x * 0.9,  // Scale and center
                    y: 0.5 + y * 0.9
                });
            }
        }
        
        // Fill remaining points if needed
        while (points.length < numPoints) {
            const t = points.length / numPoints;
            const side = Math.floor(t * 3);
            const v1 = vertices[side % 3];
            const v2 = vertices[(side + 1) % 3];
            const localT = (t * 3) % 1;
            
            const x = v1.x + (v2.x - v1.x) * localT;
            const y = v1.y + (v2.y - v1.y) * localT;
            
            points.push({
                x: 0.5 + x * 0.9,
                y: 0.5 + y * 0.9
            });
        }
        
        return points;
    },
    
    // No custom render needed
    render: null
};