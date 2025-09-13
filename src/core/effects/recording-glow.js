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
        pulseSpeed: 0.08,
        minIntensity: 0.6,
        maxIntensity: 1.0,
        radiusMultiplier: 2.0,
        gradientStops: [
            { position: 0, opacity: 1.0 },
            { position: 0.3, opacity: 0.7 },
            { position: 0.6, opacity: 0.4 },
            { position: 0.85, opacity: 0.2 },
            { position: 1, opacity: 0 }
        ]
    },
    
    // State for animation
    state: {
        pulsePhase: 0,
        intensity: 0.8  // Start with visible intensity
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
        const { deltaTime = 16.67 } = params;
        
        // Update pulse animation for the indicator only
        this.state.pulsePhase += this.config.pulseSpeed * (deltaTime / 16.67);
        
        // Calculate pulsating intensity
        const pulse = (Math.sin(this.state.pulsePhase) + 1) / 2;
        this.state.intensity = this.config.minIntensity + 
            (this.config.maxIntensity - this.config.minIntensity) * pulse;
        
        // Don't draw any glow on the mascot - only update the animation state
        // The REC indicator will be drawn separately in drawRecordingIndicator
        return true; // Return true to indicate effect was applied
    },
    
    /**
     * Draw recording indicator text only
     */
    drawRecordingIndicator: function(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        // Dynamic text size
        const baseSize = Math.min(canvasWidth, canvasHeight);
        const textSize = Math.floor(baseSize * 0.08);  // 8% of smallest dimension (bigger)
        
        // Position in upper-left corner with padding
        const x = textSize * 1.5;
        const y = textSize * 1.5;
        
        // Draw red recording dot
        const dotRadius = textSize * 0.3;
        ctx.fillStyle = this.hexToRgba('#FF0000', this.state.intensity);
        ctx.beginPath();
        ctx.arc(x - textSize, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add white outline for visibility
        ctx.strokeStyle = this.hexToRgba('#FFFFFF', this.state.intensity * 0.8);
        ctx.lineWidth = 3;
        ctx.font = `bold ${textSize}px 'Arial', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.strokeText('REC', x, y);
        
        // Draw "REC" text on top
        ctx.fillStyle = this.hexToRgba('#FF0000', this.state.intensity);
        ctx.fillText('REC', x, y);
        
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