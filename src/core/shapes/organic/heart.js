/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Heart Shape Module
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Heart shape for love and affection emotions
 * @author Emotive Engine Team
 * @module shapes/organic/heart
 * @complexity ⭐ Beginner-friendly
 * @audience Shape definitions for morphing. Copy these to create custom shapes.
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Heart shape configuration
 */
export default {
    name: 'heart',
    category: SHAPE_CATEGORIES.ORGANIC,
    emoji: '❤️',
    description: 'Classic heart shape pointing downward',

    // No shadow effects
    shadow: {
        type: 'none'
    },

    // Musical rhythm preferences
    rhythm: {
        syncMode: 'beat',
        pulseWithBeat: true,      // Heart beats
        beatStrength: 1.2,
        doubleTimeOnExcitement: true
    },

    // Emotion associations
    emotions: ['love', 'affection', 'care', 'passion', 'warmth'],

    // Heart-specific configuration
    config: {
        pointDown: true       // Traditional heart orientation
    },

    /**
     * Generate heart shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;

            // Heart parametric equations
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) -
                      2 * Math.cos(3 * t) - Math.cos(4 * t));

            // Normalize and scale
            points.push({
                x: 0.5 + x / 32,  // Scale to fit 0-1 range
                y: 0.5 + y / 32
            });
        }

        return points;
    },
    // No custom render needed
    render: null
};