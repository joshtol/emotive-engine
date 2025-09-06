/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Recording Glow Effect
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pulsating red glow for recording state
 * @author Emotive Engine Team
 * @module effects/recording-glow
 */

export default {
    name: 'recording-glow',
    emoji: '🔴',
    description: 'Pulsating red recording indicator',
    
    // Configuration
    config: {
        color: '#FF0000',
        pulseSpeed: 0.05,
        minIntensity: 0.3,
        maxIntensity: 0.7,
        radiusMultiplier: 1.5,
        gradientStops: [
            { position: 0, opacity: 0.7 },
            { position: 0.3, opacity: 0.5 },
            { position: 0.6, opacity: 0.3 },
            { position: 0.85, opacity: 0.1 },
            { position: 1, opacity: 0 }
        ]
    },
    
    // State for animation
    state: {
        pulsePhase: 0,
        intensity: 0
    },
    
    /**
     * Check if effect should be active
     * @param {Object} state - Renderer state
     * @returns {boolean}
     */
    shouldActivate: function(state) {
        return state.recording === true;
    },
    
    /**
     * Apply the recording glow effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} params - Effect parameters
     */
    apply: function(ctx, params) {
        const { x, y, radius, deltaTime = 16.67 } = params;
        
        // Update pulse animation
        this.state.pulsePhase += this.config.pulseSpeed * (deltaTime / 16.67);
        
        // Calculate pulsating intensity
        const pulse = (Math.sin(this.state.pulsePhase) + 1) / 2;
        this.state.intensity = this.config.minIntensity + 
            (this.config.maxIntensity - this.config.minIntensity) * pulse;
        
        // Calculate glow radius
        const glowRadius = radius * this.config.radiusMultiplier;
        
        // Ensure radius doesn't exceed canvas bounds
        const canvas = ctx.canvas;
        const maxRadius = Math.min(
            glowRadius,
            x - 10,
            y - 10,
            canvas.width - x - 10,
            canvas.height - y - 10
        );
        const safeRadius = Math.max(50, maxRadius);
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, safeRadius);
        
        // Add gradient stops with pulsating intensity
        for (const stop of this.config.gradientStops) {
            gradient.addColorStop(
                stop.position,
                this.hexToRgba(this.config.color, stop.opacity * this.state.intensity)
            );
        }
        
        // Draw the recording glow
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Don't draw indicator here - it will be covered by the orb
        // The indicator should be drawn AFTER the core in a separate call
    },
    
    /**
     * Draw recording indicator text only
     */
    drawRecordingIndicator: function(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        // Dynamic text size
        const baseSize = Math.min(canvasWidth, canvasHeight);
        const textSize = Math.floor(baseSize * 0.05);  // 5% of smallest dimension
        
        // Position near the orb (upper-left of center)
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const offsetDistance = baseSize * 0.15;  // 15% away from center
        
        const x = centerX - offsetDistance;
        const y = centerY - offsetDistance;
        
        // Draw "REC" text
        ctx.fillStyle = this.hexToRgba('#FF0000', this.state.intensity);
        ctx.font = `bold ${textSize}px 'Arial', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText('REC', x, y);
        
        // Add white outline for visibility
        ctx.strokeStyle = this.hexToRgba('#FFFFFF', this.state.intensity * 0.5);
        ctx.lineWidth = 2;
        ctx.strokeText('REC', x, y);
        
        ctx.restore();
    },
    
    /**
     * Convert hex to rgba
     */
    hexToRgba: function(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    /**
     * Reset the effect state
     */
    reset: function() {
        this.state.pulsePhase = 0;
        this.state.intensity = 0;
    }
};