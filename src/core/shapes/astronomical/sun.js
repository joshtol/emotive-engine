/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sun Shape Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sun shape with corona, plasma texture, and solar flares
 * @author Emotive Engine Team
 * @module shapes/astronomical/sun
 */

import { SHAPE_CATEGORIES } from '../index.js';

/**
 * Sun shape configuration
 */
export default {
    name: 'sun',
    category: SHAPE_CATEGORIES.ASTRONOMICAL,
    emoji: '☀️',
    description: 'Radiant sun with corona and solar flares',
    
    // Shadow/effect configuration
    shadow: {
        type: 'sun',
        corona: true,         // Show bright corona rays
        intensity: 1.5,       // Extra bright
        flares: true,         // Add solar flares
        texture: true,        // Add surface texture
        turbulence: 0.3       // Surface animation intensity
    },
    
    // Musical rhythm preferences
    rhythm: {
        syncMode: 'beat',
        pulseFactor: 1.2,
        flareOnDownbeat: true
    },
    
    // Emotion associations
    emotions: ['joy', 'excitement', 'energy', 'power'],
    
    /**
     * Generate sun shape points
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of normalized points
     */
    generate(numPoints) {
        const points = [];
        const numRays = 12; // 12 sun rays
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
     * Custom render function for sun effects
     * This is called by EmotiveRenderer when sun is active
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Base radius
     * @param {number} progress - Morph progress (0-1)
     * @param {Object} options - Additional render options
     */
    render(ctx, x, y, radius, progress, options = {}) {
        // Safety check for invalid parameters
        if (!radius || !isFinite(radius) || radius <= 0) {
            return; // Don't render if radius is invalid
        }
        if (!isFinite(x) || !isFinite(y)) {
            return; // Don't render if position is invalid
        }
        
        const time = Date.now() / 50; // 2x faster time base for all animations
        const {shadow} = this;
        
        // Use progress as-is - renderer handles any delays
        const effectiveProgress = Math.max(0, Math.min(1, progress || 0));
        
        ctx.save();
        ctx.translate(x, y);
        
        // 1. Surface texture - turbulent plasma (IMMEDIATE)
        if (shadow.texture && effectiveProgress > 0.01) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            
            // Dynamic plasma texture with faster movement
            const offset = time * 0.15; // 3x faster rotation
            const textureGradient = ctx.createRadialGradient(
                Math.sin(offset) * radius * 0.3,      // Bigger movement
                Math.cos(offset * 1.4) * radius * 0.3, // Different speed for chaotic effect
                0,
                0, 0, radius
            );
            textureGradient.addColorStop(0, `rgba(255, 200, 100, ${0.25 * effectiveProgress})`);
            textureGradient.addColorStop(0.3, `rgba(255, 150, 50, ${0.15 * effectiveProgress})`);
            textureGradient.addColorStop(0.6, `rgba(255, 100, 30, ${0.1 * effectiveProgress})`);
            textureGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            
            ctx.fillStyle = textureGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 2. Bright corona layers - OPTIMIZED
        if (shadow.corona && effectiveProgress > 0.01) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            
            // Simplified corona - single layer instead of 4
            const coronaBloom = Math.pow(progress, 0.6);
            
            // Single combined corona gradient
            const coronaGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.5);
            coronaGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * coronaBloom})`);
            coronaGradient.addColorStop(0.3, `rgba(255, 250, 200, ${0.5 * coronaBloom})`);
            coronaGradient.addColorStop(0.5, `rgba(255, 200, 100, ${0.3 * coronaBloom})`);
            coronaGradient.addColorStop(0.8, `rgba(255, 150, 50, ${0.15 * coronaBloom})`);
            coronaGradient.addColorStop(1, 'rgba(255, 100, 20, 0)');
            
            ctx.fillStyle = coronaGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 3. Solar flares - BLOOM OUT during transition (IMMEDIATE)
        if (shadow.flares && effectiveProgress > 0.01) {
            // Pass enhanced progress for explosive bloom effect
            const bloomProgress = Math.pow(effectiveProgress, 0.5); // Faster initial bloom
            this.renderFlares(ctx, radius, bloomProgress, time);
        }
        
        // 4. Bright rim lighting (EARLY)
        if (progress > 0.2) {
            const rimGradient = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
            rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            rimGradient.addColorStop(0.7, `rgba(255, 255, 200, ${0.2 * progress})`);
            rimGradient.addColorStop(0.9, `rgba(255, 200, 100, ${0.5 * progress})`);
            rimGradient.addColorStop(1, `rgba(255, 150, 50, ${0.3 * progress})`);
            
            ctx.fillStyle = rimGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    /**
     * Render optimized solar flares
     */
    renderFlares(ctx, radius, progress, time) {
        ctx.save();
        
        // Simplified animation values - fewer calculations
        const flicker1 = Math.sin(time * 0.7);  // Simple wave
        const flicker2 = Math.cos(time * 1.1);  // Different phase
        const flicker3 = Math.sin(time * 0.9);  // Third variation
        const turbulence = Math.sin(time * 1.5) * 0.25; // Single wave
        const pulse = Math.abs(Math.sin(time * 1.2)) * 0.4 + 0.6; // Keep pulse
        
        // BLOOM EFFECT - rays shoot out during transition
        const bloomFactor = progress < 0.8 ? 
            Math.pow(progress / 0.8, 0.3) :  // Explosive growth
            1 + (progress - 0.8) * 0.5;      // Slight overshoot at end
        
        // Create fire-like gradient - hotter at base, cooler at tips
        const grad = ctx.createLinearGradient(0, -radius, 0, -radius * 3);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.6 * progress})`);    // White hot core
        grad.addColorStop(0.15, `rgba(255, 240, 200, ${0.5 * progress})`); // Bright yellow
        grad.addColorStop(0.2, `rgba(255, 220, 150, ${0.25 * progress})`);
        grad.addColorStop(0.5, `rgba(255, 180, 80, ${0.15 * progress})`);
        grad.addColorStop(0.8, `rgba(255, 120, 40, ${0.08 * progress})`);
        grad.addColorStop(1, 'rgba(255, 60, 20, 0)');
        
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        
        // Single path for ALL flames - massive performance boost
        ctx.beginPath();
        
        // Simplified flame shape - less calculations
        const addFlame = (angle, length, width, flicker, turb) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const baseX = cos * radius;
            const baseY = sin * radius;
            
            // Simpler tip calculation
            const tipLength = length * (1 + flicker * 0.2);
            const tipX = cos * (radius + tipLength);
            const tipY = sin * (radius + tipLength);
            
            const perpX = -sin * width * 0.5;
            const perpY = cos * width * 0.5;
            
            // Simple triangle instead of curves
            ctx.moveTo(baseX - perpX, baseY - perpY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(baseX + perpX, baseY + perpY);
        };
        
        // OPTIMIZED: Reduced to 20 rays total for better FPS
        
        // Layer 1: Long primary rays (6) - FIRE TONGUES
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + flicker1 * 0.15;
            const baseLength = 1.5 + flicker1 * 0.3;
            const length = radius * baseLength * pulse * bloomFactor;
            const width = radius * 0.2 * Math.min(1, progress * 2);
            addFlame(angle, length, width, flicker1, turbulence);
        }
        
        // Layer 2: Medium rays (8) - DANCING FLAMES
        for (let i = 0; i < 8; i++) {
            const angle = ((i + 0.5) / 8) * Math.PI * 2 + flicker2 * 0.12;
            const baseLength = 1.0 + turbulence;
            const length = radius * baseLength * pulse * bloomFactor;
            const width = radius * 0.15 * Math.min(1, progress * 1.5);
            addFlame(angle, length, width, flicker2, -turbulence * 0.7);
        }
        
        // Layer 3: Short rays (6) - FLICKERING EMBERS
        for (let i = 0; i < 6; i++) {
            const angle = (i / 15) * Math.PI * 2 + flicker3 * 0.08 + Math.sin(time * 0.7 + i * 1.1);
            const flickerIntense = Math.sin(time * 2.1 + i * 2.5) * Math.cos(time * 1.7 + i);
            const baseLength = 0.6 + Math.sin(time * 1.6 + i * 1.2) * 0.35 + Math.abs(flickerIntense) * 0.2;
            const length = radius * baseLength * bloomFactor;
            const width = radius * 0.09 * Math.min(1, progress * 1.2);
            addFlame(angle, length, width, flickerIntense, turbulence * 0.5);
        }
        
        // Layer 4: Tiny rays (15) - SPARKS AND EMBERS
        for (let i = 0; i < 15; i++) {
            const angle = ((i + 0.25) / 15) * Math.PI * 2 + Math.sin(time * 1.9 + i * 1.7) * 0.15;
            const spark = Math.random() > 0.3 ? 1 : 0.4; // Random spark effect
            const baseLength = 0.3 + Math.abs(Math.sin(time * 2.5 + i * 2)) * 0.4 * spark;
            const length = radius * baseLength * bloomFactor * 0.8;
            const width = radius * 0.07 * Math.min(1, progress) * spark;
            const rapidFlicker = Math.sin(time * 3 + i * 3);
            addFlame(angle, length, width, rapidFlicker, 0);
        }
        
        // Single fill operation for all rays!
        ctx.fill();
        ctx.restore();
    }
};