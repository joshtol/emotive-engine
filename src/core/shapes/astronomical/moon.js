/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Moon Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Moon shape with crescent shadow effect
 * @author Emotive Engine Team
 * @module shapes/astronomical/moon
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Moon shape configuration
 */
export default {
    name: 'moon',
    category: SHAPE_CATEGORIES.ASTRONOMICAL,
    emoji: '🌙',
    description: 'Crescent moon with shadow',
    
    // Shadow configuration for crescent effect
    shadow: {
        type: 'crescent',
        coverage: 0.85,      // Strong shadow for sharp crescent
        angle: -30,          // Shadow from upper left
        softness: 0.05,      // Sharp dark edge for dramatic crescent
        offset: 0.7          // How far to offset the shadow circle
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'measure',
        swayFactor: 1.1,
        gentlePulse: true
    },
    
    // Emotion associations
    emotions: ['calm', 'mystery', 'contemplation', 'rest'],
    
    /**
     * Generate moon shape points (full circle, shadow creates crescent)
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        
        // Moon is a perfect circle - the crescent is created by shadow
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                x: 0.5 + Math.cos(angle) * 0.5,
                y: 0.5 + Math.sin(angle) * 0.5
            });
        }
        
        return points;
    },
    
    // Moon color configuration
    coreColor: '#e8e8e8'  // Light gray moon surface
    
    // NO CUSTOM RENDER FUNCTION - Let the main renderer handle everything
    // The shadow will be drawn in the legacy shadow renderer after the shape
};