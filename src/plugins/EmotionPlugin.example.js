/**
 * Example Emotion Plugin - Demonstrates how to create custom emotions
 * This example adds "zen" and "energized" emotional states
 */

export const ZenEmotionPlugin = {
    name: 'zen-emotion',
    version: '1.0.0',
    type: 'emotion',
    description: 'Adds a zen/meditative emotional state',
    author: 'Example',
    
    emotion: {
        name: 'zen',
        color: '#9B59B6',
        particleColor: '#E8DAEF',
        animation: {
            breathingRate: 0.3,
            breathingDepth: 0.8,
            swayAmount: 0.1,
            particleEmission: 0.2
        },
        transitions: {
            from: {
                idle: 1000,
                calm: 500,
                neutral: 800
            },
            to: {
                idle: 1000,
                calm: 500,
                excited: 2000
            }
        }
    },
    
    init(api) {
        api.log('zen-emotion', 'Initializing Zen emotion plugin');
        
        // Register hooks
        api.registerHook('beforeUpdate', this.beforeUpdate.bind(this));
        api.registerHook('afterRender', this.afterRender.bind(this));
        
        // Set initial state
        api.setState('zen-emotion', 'particlePattern', 'spiral');
        api.setState('zen-emotion', 'glowIntensity', 0.5);
        
        return true;
    },
    
    updateEmotion(deltaTime, state) {
        // Update zen-specific properties
        const time = Date.now() / 1000;
        
        // Gentle pulsing effect
        state.pulsePhase = Math.sin(time * this.emotion.animation.breathingRate) * 0.5 + 0.5;
        
        // Slow rotation for meditative effect
        state.rotation = (state.rotation || 0) + deltaTime * 0.05;
        
        // Update particle emission for zen state
        state.particleEmissionRate = this.emotion.animation.particleEmission * state.pulsePhase;
        
        // Calm color shifting
        const hueShift = Math.sin(time * 0.1) * 10;
        state.currentColor = this.adjustHue(this.emotion.color, hueShift);
        
        return state;
    },
    
    renderEmotion(ctx, bounds, state) {
        // Add zen-specific rendering effects
        
        // Draw meditation aura
        ctx.save();
        
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width, bounds.height) / 2;
        
        // Multiple concentric circles for aura effect
        for (let i = 3; i > 0; i--) {
            const alpha = (0.1 * state.pulsePhase) / i;
            const auraRadius = radius * (1 + i * 0.2 * state.pulsePhase);
            
            const gradient = ctx.createRadialGradient(
                centerX, centerY, radius,
                centerX, centerY, auraRadius
            );
            
            gradient.addColorStop(0, `${state.currentColor}00`);
            gradient.addColorStop(0.5, `${state.currentColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${state.currentColor}00`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        
        // Draw mandala pattern
        this.drawMandala(ctx, centerX, centerY, radius * 0.8, state);
        
        ctx.restore();
    },
    
    drawMandala(ctx, x, y, radius, state) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(state.rotation || 0);
        
        const segments = 8;
        const angleStep = (Math.PI * 2) / segments;
        
        ctx.strokeStyle = state.currentColor + '40';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < segments; i++) {
            ctx.save();
            ctx.rotate(angleStep * i);
            
            // Draw petal shape
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                radius * 0.5, -radius * 0.2,
                radius, 0
            );
            ctx.quadraticCurveTo(
                radius * 0.5, radius * 0.2,
                0, 0
            );
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.restore();
    },
    
    beforeUpdate(data) {
        // Pre-update hook
        if (data.state === 'zen') {
            // Reduce particle velocity for zen state
            if (data.particles) {
                data.particles.forEach(p => {
                    p.velocity.x *= 0.95;
                    p.velocity.y *= 0.95;
                });
            }
        }
    },
    
    afterRender(data) {
        // Post-render hook
        // Could add additional effects here
    },
    
    adjustHue(color, degrees) {
        // Simple hue adjustment
        // This is a simplified version - real implementation would convert to HSL
        return color;
    },
    
    destroy() {
        // Cleanup
        console.log('Zen emotion plugin destroyed');
    }
};

export const EnergizedEmotionPlugin = {
    name: 'energized-emotion',
    version: '1.0.0',
    type: 'emotion',
    description: 'Adds an energized/hyperactive emotional state',
    author: 'Example',
    dependencies: ['particle-system'],
    
    emotion: {
        name: 'energized',
        color: '#FF6B35',
        particleColor: '#FFD93D',
        animation: {
            breathingRate: 2.0,
            breathingDepth: 0.3,
            swayAmount: 0.8,
            particleEmission: 0.9,
            jitterAmount: 0.1
        },
        transitions: {
            from: {
                excited: 300,
                happy: 500,
                neutral: 1000
            },
            to: {
                excited: 300,
                frustrated: 800,
                idle: 1500
            }
        }
    },
    
    init(api) {
        api.log('energized-emotion', 'Initializing Energized emotion plugin');
        
        // Set energized state properties
        api.setState('energized-emotion', 'sparkCount', 0);
        api.setState('energized-emotion', 'energyLevel', 1.0);
        api.setState('energized-emotion', 'lightningChance', 0.02);
        
        return true;
    },
    
    updateEmotion(deltaTime, state) {
        const time = Date.now() / 1000;
        
        // Rapid pulsing
        state.pulsePhase = Math.abs(Math.sin(time * this.emotion.animation.breathingRate));
        
        // Jittery movement
        state.jitterX = (Math.random() - 0.5) * this.emotion.animation.jitterAmount;
        state.jitterY = (Math.random() - 0.5) * this.emotion.animation.jitterAmount;
        
        // High particle emission
        state.particleEmissionRate = this.emotion.animation.particleEmission;
        
        // Energy sparks
        if (Math.random() < this.lightningChance) {
            state.sparkCount = (state.sparkCount || 0) + 1;
            this.createEnergySpark(state);
        }
        
        // Oscillating colors
        const colorPhase = Math.sin(time * 3) * 0.5 + 0.5;
        state.currentColor = this.interpolateColor(
            this.emotion.color,
            this.emotion.particleColor,
            colorPhase
        );
        
        return state;
    },
    
    renderEmotion(ctx, bounds, state) {
        ctx.save();
        
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width, bounds.height) / 2;
        
        // Apply jitter
        ctx.translate(state.jitterX || 0, state.jitterY || 0);
        
        // Electric field effect
        this.drawElectricField(ctx, centerX, centerY, radius, state);
        
        // Energy bolts
        if (state.sparkCount > 0) {
            this.drawEnergyBolts(ctx, centerX, centerY, radius, state);
        }
        
        ctx.restore();
    },
    
    drawElectricField(ctx, x, y, radius, state) {
        const time = Date.now() / 100;
        
        ctx.strokeStyle = state.currentColor + '60';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Draw electric field lines
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + time * 0.01;
            const startX = x + Math.cos(angle) * radius * 0.5;
            const startY = y + Math.sin(angle) * radius * 0.5;
            const endX = x + Math.cos(angle) * radius * 1.2;
            const endY = y + Math.sin(angle) * radius * 1.2;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            // Add lightning-like segments
            const segments = 4;
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const midX = startX + (endX - startX) * t;
                const midY = startY + (endY - startY) * t;
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 10;
                
                ctx.lineTo(midX + offsetX, midY + offsetY);
            }
            
            ctx.stroke();
        }
    },
    
    drawEnergyBolts(ctx, x, y, radius, state) {
        ctx.strokeStyle = this.emotion.particleColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.emotion.particleColor;
        ctx.shadowBlur = 10;
        
        // Draw random energy bolts
        for (let i = 0; i < Math.min(state.sparkCount, 3); i++) {
            const startAngle = Math.random() * Math.PI * 2;
            const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;
            
            const startX = x + Math.cos(startAngle) * radius * 0.8;
            const startY = y + Math.sin(startAngle) * radius * 0.8;
            const endX = x + Math.cos(endAngle) * radius * 0.8;
            const endY = y + Math.sin(endAngle) * radius * 0.8;
            
            this.drawLightning(ctx, startX, startY, endX, endY, 3);
        }
        
        // Decay spark count
        state.sparkCount = Math.max(0, state.sparkCount - 0.1);
    },
    
    drawLightning(ctx, x1, y1, x2, y2, segments) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        
        let currentX = x1;
        let currentY = y1;
        
        for (let i = 1; i < segments; i++) {
            currentX += dx + (Math.random() - 0.5) * 15;
            currentY += dy + (Math.random() - 0.5) * 15;
            ctx.lineTo(currentX, currentY);
        }
        
        ctx.lineTo(x2, y2);
        ctx.stroke();
    },
    
    createEnergySpark(state) {
        // Trigger particle burst
        state.particleBurst = {
            count: 10,
            speed: 5,
            spread: Math.PI * 2
        };
    },
    
    interpolateColor(color1, color2, t) {
        // Simple color interpolation
        // In real implementation, would convert to RGB and interpolate
        return t > 0.5 ? color2 : color1;
    },
    
    destroy() {
        console.log('Energized emotion plugin destroyed');
    }
};