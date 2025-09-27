/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Speaking Pulse Effect
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'speaking-pulse',
    emoji: '🗣️',
    description: 'Audio-reactive pulse when speaking',
    
    config: {
        scaleMultiplier: 0.15,  // Max scale increase when speaking
        smoothing: 0.1,         // Smoothing factor for audio levels
        minPulse: 0.02,         // Minimum pulse even when quiet
        colorShift: true,       // Shift glow color when speaking
        ringEffect: true        // Show expanding rings
    },
    
    state: {
        audioLevel: 0,
        smoothedLevel: 0,
        rings: []  // Array of expanding rings
    },
    
    shouldActivate(state) {
        return state.speaking === true;
    },
    
    apply(ctx, params) {
        const { x, y, radius, audioLevel = 0, deltaTime = 16.67 } = params;
        
        // Smooth audio level
        this.state.smoothedLevel += (audioLevel - this.state.smoothedLevel) * this.config.smoothing;
        
        // Create expanding rings on audio peaks
        if (audioLevel > 0.5 && this.state.audioLevel <= 0.5) {
            this.state.rings.push({
                radius,
                opacity: 0.5,
                speed: 2
            });
        }
        
        // Update and draw rings
        if (this.config.ringEffect) {
            this.drawRings(ctx, x, y, deltaTime);
        }
        
        // Store for next frame
        this.state.audioLevel = audioLevel;
    },
    
    drawRings(ctx, x, y, deltaTime) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Update and draw each ring
        for (let i = this.state.rings.length - 1; i >= 0; i--) {
            const ring = this.state.rings[i];
            
            // Update ring
            ring.radius += ring.speed * (deltaTime / 16.67);
            ring.opacity -= 0.02 * (deltaTime / 16.67);
            
            // Remove if faded
            if (ring.opacity <= 0) {
                this.state.rings.splice(i, 1);
                continue;
            }
            
            // Draw ring
            ctx.globalAlpha = ring.opacity;
            ctx.beginPath();
            ctx.arc(x, y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    },
    
    getScaleModifier() {
        return 1 + (this.state.smoothedLevel * this.config.scaleMultiplier);
    }
};