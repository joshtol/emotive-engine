/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Square Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Square shape with optional rounded corners
 * @author Emotive Engine Team
 * @module shapes/geometric/square
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Square shape configuration
 */
export default {
    name: 'square',
    category: SHAPE_CATEGORIES.GEOMETRIC,
    emoji: '⬜',
    description: 'Square with optional rounded corners',
    
    // No shadow effects
    shadow: {
        type: 'none'
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'measure',
        snapToGrid: true,     // Align with beat grid
        rigidTransform: true  // Sharp transitions
    },
    
    // Emotion associations
    emotions: ['stability', 'structure', 'logic', 'order'],
    
    // Square-specific configuration
    config: {
        cornerRadius: 0.1,    // Slight rounding for softer look
        rotation: 45          // Optional rotation in degrees
    },
    
    /**
     * Generate square shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const cornerRadius = this.config.cornerRadius;
        const rotation = (this.config.rotation || 0) * Math.PI / 180;
        
        // Points per side
        const pointsPerSide = Math.floor(numPoints / 4);
        
        // Generate points for each side
        for (let side = 0; side < 4; side++) {
            for (let i = 0; i < pointsPerSide; i++) {
                const t = i / pointsPerSide;
                let x, y;
                
                switch (side) {
                    case 0: // Top
                        x = -0.5 + t;
                        y = -0.5;
                        break;
                    case 1: // Right
                        x = 0.5;
                        y = -0.5 + t;
                        break;
                    case 2: // Bottom
                        x = 0.5 - t;
                        y = 0.5;
                        break;
                    case 3: // Left
                        x = -0.5;
                        y = 0.5 - t;
                        break;
                }
                
                // Apply corner rounding
                if (cornerRadius > 0) {
                    const distToCorner = Math.min(
                        Math.min(Math.abs(x + 0.5), Math.abs(x - 0.5)),
                        Math.min(Math.abs(y + 0.5), Math.abs(y - 0.5))
                    );
                    
                    if (distToCorner < cornerRadius) {
                        const factor = distToCorner / cornerRadius;
                        const smoothing = this.easeInOutQuad(factor);
                        x *= 0.9 + 0.1 * smoothing;
                        y *= 0.9 + 0.1 * smoothing;
                    }
                }
                
                // Apply rotation
                if (rotation !== 0) {
                    const cos = Math.cos(rotation);
                    const sin = Math.sin(rotation);
                    const rotX = x * cos - y * sin;
                    const rotY = x * sin + y * cos;
                    x = rotX;
                    y = rotY;
                }
                
                // Scale and center
                points.push({
                    x: 0.5 + x * 0.8,
                    y: 0.5 + y * 0.8
                });
            }
        }
        
        return points;
    },
    
    /**
     * Easing function for corner rounding
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    // No custom render needed
    render: null
};