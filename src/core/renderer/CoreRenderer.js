/**
 * CoreRenderer - Handles core shape rendering for EmotiveRenderer
 * @module core/renderer/CoreRenderer
 */

import { gradientCache } from './GradientCache.js';

export class CoreRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;
        
        // Core appearance
        this.coreColor = '#FFFFFF';
        this.coreOpacity = 1.0;
        this.coreBorderWidth = 0;
        this.coreBorderColor = null;
        
        // Shape state
        this.shapePoints = null;
        this.isMorphing = false;
        
        // Helper method references
        this.scaleValue = value => renderer.scaleValue(value);
        this.hexToRgba = (hex, alpha) => renderer.hexToRgba(hex, alpha);
    }

    /**
     * Render the main core shape
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} radius - Core radius
     * @param {Object} params - Rendering parameters
     */
    renderCore(x, y, radius, params = {}) {
        const {ctx} = this;
        
        // Extract parameters
        const scaleX = params.scaleX || 1;
        const scaleY = params.scaleY || 1;
        const rotation = params.rotation || 0;
        const opacity = params.opacity !== undefined ? params.opacity : this.coreOpacity;
        const color = params.color || this.coreColor;
        const shapePoints = params.shapePoints || this.shapePoints;
        
        ctx.save();
        
        // Apply transformations
        ctx.translate(x, y);
        if (rotation !== 0) {
            ctx.rotate(rotation);
        }
        ctx.scale(scaleX, scaleY);
        
        // Set core style
        ctx.fillStyle = this.hexToRgba(color, opacity);
        
        // Draw shape based on points or default circle
        if (shapePoints && shapePoints.length > 0) {
            this.drawMorphedShape(ctx, shapePoints, radius);
        } else {
            this.drawCircle(ctx, radius);
        }
        
        // Draw border if needed
        if (this.coreBorderWidth > 0 && this.coreBorderColor) {
            ctx.strokeStyle = this.coreBorderColor;
            ctx.lineWidth = this.scaleValue(this.coreBorderWidth);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * Draw drop shadow for depth
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} radius - Shape radius
     * @param {Array} shapePoints - Shape points
     */
    drawDropShadow(ctx, radius, shapePoints) {
        ctx.save();
        
        const shadowOffset = this.scaleValue(2);
        ctx.translate(0, shadowOffset);
        
        // Use simpler shadow for complex deformed shapes
        if (shapePoints && shapePoints.length > 32) {
            // Simple dark circle shadow when shape is complex
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Shadow gradient - dark center fading to transparent
            const shadowGradient = gradientCache.getRadialGradient(
                ctx, 0, 0, radius * 0.7, 0, 0, radius * 1.2,
                [
                    { offset: 0, color: 'rgba(0, 0, 0, 0.2)' },
                    { offset: 0.8, color: 'rgba(0, 0, 0, 0.1)' },
                    { offset: 1, color: 'rgba(0, 0, 0, 0)' }
                ]
            );

            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            if (shapePoints) {
                // Scale points for shadow
                const scale = 1.1;
                const step = shapePoints.length > 20 ? 2 : 1;
                ctx.moveTo(shapePoints[0].x * scale, shapePoints[0].y * scale);
                for (let i = step; i < shapePoints.length; i += step) {
                    ctx.lineTo(shapePoints[i].x * scale, shapePoints[i].y * scale);
                }
                ctx.closePath();
            } else {
                ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
            }
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Draw a simple circle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} radius - Circle radius
     */
    drawCircle(ctx, radius) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw a morphed shape from points
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} points - Shape points
     * @param {number} baseRadius - Base radius for scaling
     */
    drawMorphedShape(ctx, points, baseRadius) {
        if (!points || points.length < 3) {
            // Fallback to circle if not enough points
            this.drawCircle(ctx, baseRadius);
            return;
        }
        
        ctx.beginPath();
        
        // Points from getCanvasPoints are already in canvas coordinates
        // relative to the center (0,0) after translation
        points.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render zen core effect
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {number} time - Current time for animation
     */
    renderZenCore(x, y, radius, time) {
        const {ctx} = this;
        
        // Zen breathing effect
        const breathPhase = Math.sin(time * 0.001) * 0.5 + 0.5;
        const zenRadius = radius * (0.95 + breathPhase * 0.05);
        
        // Draw zen core with subtle inner glow
        ctx.save();
        
        // Inner shadow for depth
        ctx.shadowBlur = this.scaleValue(10);
        ctx.shadowColor = 'rgba(147, 112, 219, 0.3)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Main core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, zenRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ring
        ctx.strokeStyle = 'rgba(147, 112, 219, 0.2)';
        ctx.lineWidth = this.scaleValue(1);
        ctx.beginPath();
        ctx.arc(x, y, zenRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Render sleepy core effect
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     */
    renderSleepyCore(x, y, radius) {
        const {ctx} = this;
        
        // Slightly squished for sleepy look
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.85);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Render glitched core effect
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {number} glitchIntensity - Glitch intensity (0-1)
     */
    renderGlitchedCore(x, y, radius, glitchIntensity) {
        const {ctx} = this;
        
        // Draw multiple offset cores for glitch effect
        const offsets = [
            { x: -2, y: 0, alpha: 0.3 },
            { x: 2, y: 0, alpha: 0.3 },
            { x: 0, y: -1, alpha: 0.2 }
        ];
        
        ctx.save();
        
        offsets.forEach(offset => {
            ctx.fillStyle = this.hexToRgba('#FFFFFF', offset.alpha * glitchIntensity);
            ctx.beginPath();
            ctx.arc(
                x + offset.x * glitchIntensity * this.scaleValue(5),
                y + offset.y * glitchIntensity * this.scaleValue(5),
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        // Main core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Set shape points for morphing
     * @param {Array} points - Array of normalized points
     */
    setShapePoints(points) {
        this.shapePoints = points;
        this.isMorphing = points && points.length > 0;
    }

    /**
     * Clear shape points (return to circle)
     */
    clearShapePoints() {
        this.shapePoints = null;
        this.isMorphing = false;
    }

    /**
     * Set core color
     * @param {string} color - Core color
     */
    setCoreColor(color) {
        this.coreColor = color;
    }

    /**
     * Set core opacity
     * @param {number} opacity - Core opacity (0-1)
     */
    setCoreOpacity(opacity) {
        this.coreOpacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Set core border
     * @param {number} width - Border width
     * @param {string} color - Border color
     */
    setCoreBorder(width, color) {
        this.coreBorderWidth = width;
        this.coreBorderColor = color;
    }

    /**
     * Get core rendering info
     * @returns {Object} Core state info
     */
    getCoreInfo() {
        return {
            color: this.coreColor,
            opacity: this.coreOpacity,
            hasBorder: this.coreBorderWidth > 0,
            isMorphing: this.isMorphing,
            shapePointCount: this.shapePoints ? this.shapePoints.length : 0
        };
    }
}

export default CoreRenderer;