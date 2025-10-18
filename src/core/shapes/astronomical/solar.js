/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Solar Eclipse Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Solar eclipse - sun with black shadow overlay
 * @author Emotive Engine Team
 * @module shapes/astronomical/solar
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Solar eclipse shape configuration - Exactly like sun but with eclipse shadow
 */
export default {
    name: 'solar',
    category: SHAPE_CATEGORIES.ASTRONOMICAL,
    emoji: '🌑',
    description: 'Sun with total eclipse shadow overlay',
    
    // Shadow/effect configuration - Same as sun but with eclipse overlay
    shadow: {
        type: 'sun',             // Use sun rendering
        corona: true,            // Show bright corona rays
        intensity: 1.5,          // Extra bright
        flares: true,            // Add solar flares
        texture: true,           // Add surface texture
        turbulence: 0.3,         // Surface animation intensity
        eclipseOverlay: true     // Add black eclipse shadow on top
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'phrase',
        transitionBeats: 8,
        buildTension: true,
        peakDrama: true
    },
    
    // Emotion associations
    emotions: ['awe', 'anticipation', 'drama', 'revelation'],
    
    /**
     * Generate solar eclipse shape points (sun with rays)
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const numRays = 12; // 12 sun rays like the sun shape
        const innerRadius = 0.35;
        const outerRadius = 0.5;
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            const rayIndex = Math.floor((i / numPoints) * numRays * 2);
            const isOuter = rayIndex % 2 === 0;
            
            let radius;
            if (isOuter) {
                // Tip of ray
                radius = outerRadius;
            } else {
                // Valley between rays
                radius = innerRadius;
            }
            
            points.push({
                x: 0.5 + Math.cos(t) * radius,
                y: 0.5 + Math.sin(t) * radius
            });
        }
        
        return points;
    },
    
    /**
     * Custom render function for solar eclipse
     * Simply adds a black shadow overlay - sun effects are handled by renderer
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, options = {}) {
        // The renderer will handle all sun effects (corona, flares, etc)
        // We just add the eclipse shadow overlay on top
        
        if (progress < 0.1) return;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw sharp black eclipse shadow circle
        ctx.fillStyle = '#000000'; // Pure black for sharp contrast
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2); // 85% coverage to show corona edge
        ctx.fill();
        
        ctx.restore();
    },
    
    /**
     * Get eclipse progression shadow position
     * @param {number} progress - Eclipse progress (0-1)
     * @param {string} direction - 'enter' or 'exit'
     * @returns {number} Shadow X position
     */
    getEclipseProgression(progress, direction = 'enter') {
        if (direction === 'enter') {
            // Shadow moves from right side to center (opposite of lunar)
            return 1.5 - (progress * 1.5);
        } else {
            // Shadow moves from center to left side
            return -progress * 1.5;
        }
    }
};