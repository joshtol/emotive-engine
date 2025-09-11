/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Circle Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Basic circle shape - the default orb form
 * @author Emotive Engine Team
 * @module shapes/geometric/circle
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Circle shape configuration
 */
export default {
    name: 'circle',
    category: SHAPE_CATEGORIES.GEOMETRIC,
    emoji: '⭕',
    description: 'Perfect circle - the orb\'s natural form',
    
    // No shadow effects for basic circle
    shadow: {
        type: 'none'
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'off',    // Circle is neutral
        returnToNeutral: true
    },
    
    // Emotion associations - circle is emotionally neutral
    emotions: ['neutral', 'balanced', 'centered'],
    
    /**
     * Generate circle shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                x: 0.5 + Math.cos(angle) * 0.5,
                y: 0.5 + Math.sin(angle) * 0.5
            });
        }
        
        return points;
    },
    
    // No custom render needed - circle is the base form
    render: null
};