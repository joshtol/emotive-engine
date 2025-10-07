/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lunar Eclipse Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lunar eclipse shape with blood moon effect
 * @author Emotive Engine Team
 * @module shapes/astronomical/lunar
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Lunar eclipse shape configuration
 */
export default {
    name: 'lunar',
    category: SHAPE_CATEGORIES.ASTRONOMICAL,
    emoji: '🌑',
    description: 'Lunar eclipse with blood moon coloring',
    
    // Shadow configuration for lunar eclipse
    shadow: {
        type: 'lunar',
        coverage: 0.7,
        color: 'rgba(80, 20, 0, 0.8)', // Blood moon red
        progression: 'center'            // Shadow progresses to center
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'phrase',
        transitionBeats: 4,
        dramaticPause: true
    },
    
    // Emotion associations
    emotions: ['tension', 'transformation', 'mystery', 'power'],
    
    /**
     * Generate lunar eclipse shape points (full circle)
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        
        // Lunar eclipse is a perfect circle
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                x: 0.5 + Math.cos(angle) * 0.5,
                y: 0.5 + Math.sin(angle) * 0.5
            });
        }
        
        return points;
    },
    
    /**
     * Custom render function for lunar eclipse shadow
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, options = {}) {
        // Safety checks
        if (!radius || !isFinite(radius) || radius <= 0) return;
        if (!isFinite(x) || !isFinite(y)) return;
        if (progress < 0.1) return;
        
        const {shadow} = this;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Lunar eclipse with progression
        if (options.shadowX !== undefined) {
            // Eclipse in progress - shadow moving across
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            
            // Draw moving shadow circle
            const shadowRadius = radius * 1.5;
            const shadowGradient = ctx.createRadialGradient(
                options.shadowX * radius, 0, 0,
                options.shadowX * radius, 0, shadowRadius
            );
            const color = shadow.color || 'rgba(80, 20, 0, 0.8)';
            const baseOpacity = shadow.coverage * progress;
            
            shadowGradient.addColorStop(0, color.replace(/[\d.]+\)/, `${baseOpacity})`));
            shadowGradient.addColorStop(0.5, color.replace(/[\d.]+\)/, `${baseOpacity * 0.7})`));
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(options.shadowX * radius, 0, shadowRadius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Full eclipse - centered shadow
            const shadowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            const color = shadow.color || 'rgba(80, 20, 0, 0.8)';
            const baseOpacity = shadow.coverage * progress;
            
            shadowGradient.addColorStop(0, color.replace(/[\d.]+\)/, `${baseOpacity})`));
            shadowGradient.addColorStop(0.7, color.replace(/[\d.]+\)/, `${baseOpacity * 0.7})`));
            shadowGradient.addColorStop(1, color.replace(/[\d.]+\)/, `${baseOpacity * 0.3})`));
            
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add subtle red glow around edges during eclipse
        if (progress > 0.5) {
            ctx.globalCompositeOperation = 'screen';
            const glowGradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.1);
            glowGradient.addColorStop(0, 'rgba(80, 20, 0, 0)');
            glowGradient.addColorStop(0.7, `rgba(150, 30, 0, ${0.2 * progress})`);
            glowGradient.addColorStop(0.9, `rgba(200, 50, 0, ${0.3 * progress})`);
            glowGradient.addColorStop(1, `rgba(255, 100, 0, ${0.1 * progress})`);
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
        }
        
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
            // Shadow moves from left side to center
            return -1.5 + (progress * 1.5);
        } else {
            // Shadow moves from center to right side
            return progress * 1.5;
        }
    }
};