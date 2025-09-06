/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Zen Vortex Effect
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Zen meditation vortex visual effect
 * @author Emotive Engine Team
 * @module effects/zen-vortex
 */

export default {
    name: 'zen-vortex',
    emoji: '🌀',
    description: 'Swirling meditation vortex effect',
    
    // Configuration
    config: {
        vortexSpeed: 0.02,
        spiralTightness: 0.15,
        maxRadius: 1.5,
        lineWidth: 2,
        segments: 50,
        arms: 3,
        fadeStart: 0.7,
        baseOpacity: 0.3,
        pulseSpeed: 0.01
    },
    
    // State for animation
    state: {
        rotation: 0,
        pulsePhase: 0,
        intensity: 0
    },
    
    /**
     * Check if effect should be active
     * @param {Object} state - Renderer state
     * @returns {boolean}
     */
    shouldActivate: function(state) {
        return state.emotion === 'zen' || state.zenTransition?.active;
    },
    
    /**
     * Apply the zen vortex effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} params - Effect parameters
     */
    apply: function(ctx, params) {
        const { x, y, radius, intensity = 1.0, deltaTime = 16.67 } = params;
        
        // Update animation state
        this.state.rotation += this.config.vortexSpeed * (deltaTime / 16.67);
        this.state.pulsePhase += this.config.pulseSpeed * (deltaTime / 16.67);
        this.state.intensity = intensity;
        
        ctx.save();
        
        // Draw multiple spiral arms
        for (let arm = 0; arm < this.config.arms; arm++) {
            const armOffset = (Math.PI * 2 / this.config.arms) * arm;
            this.drawSpiralArm(ctx, x, y, radius, armOffset);
        }
        
        // Draw meditation circle (∩∩ shape)
        this.drawMeditationEyes(ctx, x, y, radius * 0.6, intensity);
        
        ctx.restore();
    },
    
    /**
     * Draw a single spiral arm
     */
    drawSpiralArm: function(ctx, centerX, centerY, baseRadius, offset) {
        ctx.beginPath();
        
        const pulseMod = 1 + Math.sin(this.state.pulsePhase) * 0.1;
        
        for (let i = 0; i <= this.config.segments; i++) {
            const t = i / this.config.segments;
            const angle = this.state.rotation + offset + t * Math.PI * 4;
            const spiralRadius = t * baseRadius * this.config.maxRadius * pulseMod;
            
            // Spiral equation
            const x = centerX + Math.cos(angle) * spiralRadius;
            const y = centerY + Math.sin(angle) * spiralRadius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        // Create gradient for fade effect
        const gradient = ctx.createLinearGradient(
            centerX - baseRadius, centerY,
            centerX + baseRadius, centerY
        );
        
        const opacity = this.config.baseOpacity * this.state.intensity;
        gradient.addColorStop(0, `rgba(147, 112, 219, 0)`);
        gradient.addColorStop(0.3, `rgba(147, 112, 219, ${opacity * 0.5})`);
        gradient.addColorStop(this.config.fadeStart, `rgba(147, 112, 219, ${opacity})`);
        gradient.addColorStop(1, `rgba(147, 112, 219, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.config.lineWidth;
        ctx.stroke();
    },
    
    /**
     * Draw meditation eyes (∩∩)
     */
    drawMeditationEyes: function(ctx, x, y, radius, intensity) {
        ctx.save();
        
        const eyeWidth = radius * 0.4;
        const eyeHeight = radius * 0.3;
        const eyeSpacing = radius * 0.3;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
        ctx.lineWidth = 2;
        
        // Left eye (∩)
        ctx.beginPath();
        ctx.arc(x - eyeSpacing, y, eyeWidth, Math.PI, 0, true);
        ctx.stroke();
        
        // Right eye (∩)
        ctx.beginPath();
        ctx.arc(x + eyeSpacing, y, eyeWidth, Math.PI, 0, true);
        ctx.stroke();
        
        ctx.restore();
    },
    
    /**
     * Reset the effect state
     */
    reset: function() {
        this.state.rotation = 0;
        this.state.pulsePhase = 0;
        this.state.intensity = 0;
    }
};