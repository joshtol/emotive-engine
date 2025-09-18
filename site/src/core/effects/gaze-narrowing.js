/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Gaze Narrowing Effect
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'gaze-narrowing',
    emoji: '👁️',
    description: 'Eye narrowing based on gaze proximity',
    
    config: {
        maxHorizontalScale: 1.3,  // Max horizontal widening (30%)
        maxVerticalScale: 0.5,    // Max vertical narrowing (50%)
        smoothing: 0.1,           // Smoothing factor for transitions
        focusThreshold: 0.3       // Intensity threshold to start narrowing
    },
    
    state: {
        currentScaleX: 1,
        currentScaleY: 1,
        targetScaleX: 1,
        targetScaleY: 1
    },
    
    shouldActivate: function(state) {
        return state.gazeIntensity > 0 || state.gazeLocked;
    },
    
    apply: function(ctx, params) {
        const { gazeIntensity = 0, deltaTime = 16.67 } = params;
        
        // Calculate target scales based on gaze intensity
        if (gazeIntensity > this.config.focusThreshold) {
            const narrowFactor = (gazeIntensity - this.config.focusThreshold) / 
                                (1 - this.config.focusThreshold);
            
            this.state.targetScaleX = 1 + (this.config.maxHorizontalScale - 1) * narrowFactor;
            this.state.targetScaleY = 1 - (1 - this.config.maxVerticalScale) * narrowFactor;
        } else {
            this.state.targetScaleX = 1;
            this.state.targetScaleY = 1;
        }
        
        // Smooth transitions
        this.animateScales(deltaTime);
    },
    
    animateScales: function(deltaTime) {
        const speed = this.config.smoothing * (deltaTime / 16.67);
        
        // Animate X scale
        const diffX = this.state.targetScaleX - this.state.currentScaleX;
        if (Math.abs(diffX) > 0.001) {
            this.state.currentScaleX += diffX * speed;
        }
        
        // Animate Y scale
        const diffY = this.state.targetScaleY - this.state.currentScaleY;
        if (Math.abs(diffY) > 0.001) {
            this.state.currentScaleY += diffY * speed;
        }
    },
    
    getEyeScales: function() {
        return {
            scaleX: this.state.currentScaleX,
            scaleY: this.state.currentScaleY
        };
    },
    
    drawFocusIndicator: function(ctx, x, y, radius, intensity) {
        if (intensity < this.config.focusThreshold) return;
        
        ctx.save();
        
        // Draw focus lines converging on target
        const alpha = (intensity - this.config.focusThreshold) * 0.5;
        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        
        // Draw converging lines
        const angles = [0, 60, 120, 180, 240, 300];
        for (const angle of angles) {
            const rad = angle * Math.PI / 180;
            const startDist = radius * 2;
            const endDist = radius * 1.2;
            
            ctx.beginPath();
            ctx.moveTo(
                x + Math.cos(rad) * startDist,
                y + Math.sin(rad) * startDist
            );
            ctx.lineTo(
                x + Math.cos(rad) * endDist,
                y + Math.sin(rad) * endDist
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
};