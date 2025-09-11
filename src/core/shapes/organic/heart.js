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
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Heart shape configuration
 */
export default {
    name: 'heart',
    category: SHAPE_CATEGORIES.ORGANIC,
    emoji: '❤️',
    description: 'Classic heart shape for love emotions',
    
    // Heart can have a warm glow
    shadow: {
        type: 'none',
        glow: true,
        glowColor: 'rgba(255, 100, 150, 0.3)'
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
    
    /**
     * Custom render for heart glow effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, options = {}) {
        if (!this.shadow.glow || progress < 0.3) return;
        
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2) * 0.1 + 1; // Heart beat pulse
        
        ctx.save();
        ctx.translate(x, y);
        ctx.globalCompositeOperation = 'screen';
        
        // Warm heart glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * pulse);
        glowGradient.addColorStop(0, `rgba(255, 100, 150, ${0.3 * progress})`);
        glowGradient.addColorStop(0.5, `rgba(255, 150, 180, ${0.2 * progress})`);
        glowGradient.addColorStop(0.8, `rgba(255, 200, 200, ${0.1 * progress})`);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkles for extra love effect
        if (options.sparkles && progress > 0.7) {
            for (let i = 0; i < 5; i++) {
                const angle = (time * 0.5 + i * 72) % 360 * Math.PI / 180;
                const dist = radius * (0.8 + Math.sin(time + i) * 0.2);
                const sparkleX = Math.cos(angle) * dist;
                const sparkleY = Math.sin(angle) * dist;
                const sparkleSize = radius * 0.05 * (Math.sin(time * 3 + i) * 0.5 + 0.5);
                
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * progress})`;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
};