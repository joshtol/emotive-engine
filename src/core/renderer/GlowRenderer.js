/**
 * GlowRenderer - Handles glow effects rendering for EmotiveRenderer
 * @module core/renderer/GlowRenderer
 */

import { gradientCache } from './GradientCache.js';

export class GlowRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;
        
        // Glow state
        this.glowIntensity = 1.0;
        this.glowColor = '#4a90e2';
        this.targetGlowColor = '#4a90e2';
        this.glowColorTransition = 0;
        this.glowColorTransitionSpeed = 0.05;
        
        // Offscreen canvas for caching glow gradients
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.cachedGlowColor = null;
        this.cachedGlowRadius = 0;
        
        // Helper method references
        this.scaleValue = value => renderer.scaleValue(value);
        this.hexToRgba = (hex, alpha) => renderer.hexToRgba(hex, alpha);
        
        this.initOffscreenCanvas();
    }

    /**
     * Initialize offscreen canvas for gradient caching
     */
    initOffscreenCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    /**
     * Update offscreen canvas size
     * @param {number} size - Size for the offscreen canvas
     */
    updateOffscreenSize(size) {
        if (this.offscreenCanvas.width !== size || this.offscreenCanvas.height !== size) {
            this.offscreenCanvas.width = size;
            this.offscreenCanvas.height = size;
            this.cachedGlowColor = null; // Invalidate cache
        }
    }

    /**
     * Render main glow effect
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} radius - Core radius
     * @param {Object} params - Additional parameters
     */
    renderGlow(x, y, radius, params = {}) {
        const {ctx} = this;
        const color = params.color || this.glowColor;
        const intensity = params.intensity !== undefined ? params.intensity : this.glowIntensity;
        
        // Skip if intensity is too low
        if (intensity < 0.01) return;
        
        // Outer glow size
        const glowSize = this.scaleValue(200);
        
        // Always use direct rendering for consistent brightness
        this.renderGlowDirect(ctx, x, y, radius, color, intensity);
        return;
        
        // Check if we need to update the cached gradient
        if (this.cachedGlowColor !== color || this.cachedGlowRadius !== glowSize) {
            this.cacheGlowGradient(color, glowSize);
        }
        
        // Draw cached gradient for normal intensity
        if (this.offscreenCanvas && this.cachedGlowColor === color) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, intensity);
            ctx.globalCompositeOperation = 'screen';
            
            // Draw from offscreen canvas
            const drawX = x - glowSize;
            const drawY = y - glowSize;
            ctx.drawImage(this.offscreenCanvas, drawX, drawY);
            
            ctx.restore();
        } else {
            // Fallback to direct rendering if cache fails
            this.renderGlowDirect(ctx, x, y, radius, color, intensity);
        }
    }

    /**
     * Cache glow gradient to offscreen canvas
     * @param {string} color - Glow color
     * @param {number} size - Glow size
     */
    cacheGlowGradient(color, size) {
        const offCtx = this.offscreenCtx;
        const center = size;
        
        // Update offscreen canvas size
        this.updateOffscreenSize(size * 2);
        
        // Clear offscreen canvas
        offCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        
        // Use cached gradient - higher opacity to match original brightness
        const gradient = gradientCache.getRadialGradient(
            offCtx, center, center, 0, center, center, size,
            [
                { offset: 0, color: this.hexToRgba(color, 0.4) },
                { offset: 0.3, color: this.hexToRgba(color, 0.2) },
                { offset: 0.6, color: this.hexToRgba(color, 0.1) },
                { offset: 1, color: this.hexToRgba(color, 0) }
            ]
        );

        // Draw gradient to offscreen canvas
        offCtx.fillStyle = gradient;
        offCtx.fillRect(0, 0, size * 2, size * 2);
        
        // Update cache info
        this.cachedGlowColor = color;
        this.cachedGlowRadius = size;
    }

    /**
     * Direct glow rendering (fallback)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {string} color - Glow color
     * @param {number} intensity - Glow intensity
     */
    renderGlowDirect(ctx, x, y, radius, color, intensity) {
        // Use the EXACT original formula for consistent brightness
        ctx.save();
        
        // Build gradient stops array
        const stops = 20;
        const gradientStops = [];
        for (let i = 0; i <= stops; i++) {
            const position = i / stops;
            const baseOpacity = 0.6 * Math.pow(1 - position, 2.2);
            const opacity = baseOpacity * intensity;
            gradientStops.push({ offset: position, color: this.hexToRgba(color, opacity) });
        }

        // Use cached gradient
        const gradient = gradientCache.getRadialGradient(
            ctx, x, y, 0, x, y, radius, gradientStops
        );
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Render recording glow effect
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {number} intensity - Glow intensity
     */
    renderRecordingGlow(x, y, radius, intensity) {
        const {ctx} = this;
        const glowSize = radius * 2.5;
        const gradient = gradientCache.getRadialGradient(
            ctx, x, y, 0, x, y, glowSize,
            [
                { offset: 0, color: `rgba(255, 0, 0, ${0.3 * intensity})` },
                { offset: 0.5, color: `rgba(255, 0, 0, ${0.15 * intensity})` },
                { offset: 1, color: 'rgba(255, 0, 0, 0)' }
            ]
        );
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);
        ctx.restore();
    }

    /**
     * Render zen glow effect
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {number} time - Current time for animation
     */
    renderZenGlow(x, y, radius, time) {
        const {ctx} = this;
        const breathPhase = Math.sin(time * 0.001) * 0.5 + 0.5;
        const zenRadius = radius * (0.9 + breathPhase * 0.1);
        
        // Inner glow
        const gradient = gradientCache.getRadialGradient(
            ctx, x, y, 0, x, y, zenRadius,
            [
                { offset: 0, color: 'rgba(147, 112, 219, 0.8)' },
                { offset: 0.7, color: 'rgba(147, 112, 219, 0.3)' },
                { offset: 1, color: 'rgba(147, 112, 219, 0)' }
            ]
        );
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, zenRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Update glow color with transition
     * @param {string} targetColor - Target glow color
     * @param {number} deltaTime - Time since last frame
     */
    updateGlowColor(targetColor, deltaTime) {
        if (this.targetGlowColor !== targetColor) {
            this.targetGlowColor = targetColor;
            this.glowColorTransition = 0;
        }
        
        // Animate color transition
        if (this.glowColorTransition < 1) {
            this.glowColorTransition = Math.min(1, this.glowColorTransition + this.glowColorTransitionSpeed);
            this.glowColor = this.lerpColor(this.glowColor, this.targetGlowColor, this.glowColorTransition);
        }
    }

    /**
     * Lerp between two colors
     * @param {string} color1 - Start color
     * @param {string} color2 - End color
     * @param {number} t - Interpolation value (0-1)
     * @returns {string} Interpolated color
     */
    lerpColor(color1, color2, t) {
        // Convert hex to RGB
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        // Interpolate
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        
        // Convert back to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Set glow intensity
     * @param {number} intensity - Glow intensity (0-1)
     */
    setGlowIntensity(intensity) {
        this.glowIntensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Set glow color instantly
     * @param {string} color - Glow color
     */
    setGlowColor(color) {
        this.glowColor = color;
        this.targetGlowColor = color;
        this.glowColorTransition = 1;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.cachedGlowColor = null;
    }
}

export default GlowRenderer;