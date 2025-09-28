/**
 * SpecialEffects - Special visual effects for EmotiveRenderer
 * @module core/renderer/SpecialEffects
 */

export class SpecialEffects {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.canvas = renderer.canvasManager?.canvas || renderer.canvas;
        
        // Effect states
        this.recordingActive = false;
        this.sleepMode = false;
        this.speakingActive = false;
        this.zenModeActive = false;
        
        // Speaking rings
        this.speakingRings = [];
        this.ringSpawnTimer = 0;
        this.ringSpawnInterval = 300;
        this.maxRings = 3;
        
        // Sleep Z's
        this.sleepZ = [];
        
        // Sparkle particles
        this.sparkles = [];
        
        // Chromatic aberration effect
        this.chromaticAberration = {
            active: false,
            intensity: 0,
            targetIntensity: 0,
            fadeSpeed: 0.01, // Very slow fade for testing
            maxOffset: 30 // Much larger offset for testing
        };
        
        // Helper method references
        this.scaleValue = value => renderer.scaleValue(value);
        this.hexToRgba = (hex, alpha) => renderer.hexToRgba(hex, alpha);
    }

    /**
     * Render recording glow effect
     */
    renderRecordingGlow(x, y, radius, intensity) {
        const {ctx} = this;
        const glowSize = radius * 2.5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        
        gradient.addColorStop(0, `rgba(255, 0, 0, ${0.3 * intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 0, 0, ${0.15 * intensity})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);
        ctx.restore();
    }

    /**
     * Render recording indicator
     */
    renderRecordingIndicator(x, y) {
        const time = Date.now() / 1000;
        const pulse = 0.8 + Math.sin(time * 2) * 0.2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Outer glow for text
        this.ctx.shadowBlur = this.scaleValue(15);
        this.ctx.shadowColor = `rgba(255, 0, 0, ${pulse * 0.8})`;
        
        // Main REC text
        const recSize = this.scaleValue(80);
        this.ctx.font = `italic 900 ${recSize}px "Poppins", sans-serif`;
        this.ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('REC', 0, 0);
        
        // Inner highlight
        this.ctx.shadowBlur = 0;
        this.ctx.font = `italic 900 ${recSize - 1}px "Poppins", sans-serif`;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
        this.ctx.fillText('REC', -0.5, -0.5);
        
        this.ctx.restore();
    }

    /**
     * Render sleep indicator with Z's
     */
    renderSleepIndicator(x, y, deltaTime) {
        // Spawn new Z periodically
        this.ringSpawnTimer += deltaTime;
        if (this.ringSpawnTimer >= 2000 && this.sleepZ.length < 3) {
            const weights = ['300', '500', '700', '900'];
            const randomWeight = weights[Math.floor(Math.random() * weights.length)];
            const randomCase = Math.random() > 0.5 ? 'Z' : 'z';
            
            this.sleepZ.push({
                x: x + Math.random() * this.scaleValue(30) - this.scaleValue(15),
                y: y + this.scaleValue(80),
                size: this.scaleValue((24 + Math.random() * 8) * 3),
                opacity: 1.0,
                speed: -0.025,
                drift: Math.random() * this.scaleValue(20) - this.scaleValue(10),
                lifetime: 0,
                rotation: Math.random() * 30 - 15,
                text: randomCase,
                weight: randomWeight
            });
            this.ringSpawnTimer = 0;
        }
        
        // Update and render Z's
        this.sleepZ = this.sleepZ.filter(z => {
            z.lifetime += deltaTime;
            z.y += z.speed * deltaTime;
            z.x += Math.sin(z.lifetime * 0.0008) * z.drift * 0.008;
            z.rotation += deltaTime * 0.01;
            
            // Gradient fade out
            const fadeStart = 2000;
            const fadeEnd = 4000;
            if (z.lifetime < fadeStart) {
                z.opacity = 1.0;
            } else if (z.lifetime < fadeEnd) {
                z.opacity = 1.0 - ((z.lifetime - fadeStart) / (fadeEnd - fadeStart));
            } else {
                z.opacity = 0;
            }
            
            if (z.opacity > 0.01) {
                this.ctx.save();
                this.ctx.translate(z.x, z.y);
                this.ctx.rotate(z.rotation * Math.PI / 180);
                
                const baseColor = this.renderer.state.glowColor || '#4a90e2';
                
                // Outer glow
                this.ctx.shadowBlur = this.scaleValue(15);
                this.ctx.shadowColor = this.hexToRgba(baseColor, z.opacity * 0.5);
                
                // Main Z with gradient
                const gradient = this.ctx.createLinearGradient(-z.size/2, -z.size/2, z.size/2, z.size/2);
                gradient.addColorStop(0, this.hexToRgba(baseColor, z.opacity));
                gradient.addColorStop(0.5, this.hexToRgba('#ffffff', z.opacity * 0.9));
                gradient.addColorStop(1, this.hexToRgba(baseColor, z.opacity * 0.7));
                
                this.ctx.font = `italic ${z.weight || '900'} ${z.size}px 'Poppins', sans-serif`;
                this.ctx.fillStyle = gradient;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(z.text || 'Z', 0, 0);
                
                // Inner highlight
                this.ctx.shadowBlur = 0;
                this.ctx.font = `italic ${z.weight || '900'} ${z.size * 0.9}px 'Poppins', sans-serif`;
                this.ctx.fillStyle = this.hexToRgba('#ffffff', z.opacity * 0.3);
                this.ctx.fillText(z.text || 'Z', -1, -1);
                
                this.ctx.restore();
                return true;
            }
            return false;
        });
    }

    /**
     * Render speaking rings effect
     */
    renderSpeakingRings(centerX, centerY, coreRadius, deltaTime) {
        // Spawn new rings periodically
        this.ringSpawnTimer += deltaTime;
        if (this.ringSpawnTimer >= this.ringSpawnInterval && this.speakingRings.length < this.maxRings) {
            this.speakingRings.push({
                radius: coreRadius,
                opacity: 0.8,
                speed: 0.15
            });
            this.ringSpawnTimer = 0;
        }
        
        // Update and render existing rings
        this.speakingRings = this.speakingRings.filter(ring => {
            ring.radius += ring.speed * deltaTime;
            ring.opacity = Math.max(0, 0.8 * (1 - (ring.radius - coreRadius) / (coreRadius * 2)));
            
            if (ring.opacity > 0.01) {
                this.ctx.strokeStyle = this.hexToRgba(this.renderer.state.glowColor, ring.opacity);
                this.ctx.lineWidth = this.scaleValue(2);
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                return true;
            }
            return false;
        });
    }

    /**
     * Render zen core effect
     */
    renderZenCore(x, y, radius, time) {
        const {ctx} = this;
        const breathPhase = Math.sin(time * 0.001) * 0.5 + 0.5;
        const zenRadius = radius * (0.9 + breathPhase * 0.1);
        
        // Inner glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, zenRadius);
        gradient.addColorStop(0, 'rgba(147, 112, 219, 0.8)');
        gradient.addColorStop(0.7, 'rgba(147, 112, 219, 0.3)');
        gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, zenRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Start recording effect
     */
    startRecording() {
        this.recordingActive = true;
    }

    /**
     * Stop recording effect
     */
    stopRecording() {
        this.recordingActive = false;
    }

    /**
     * Enter sleep mode
     */
    enterSleepMode() {
        this.sleepMode = true;
    }

    /**
     * Wake up from sleep
     */
    wakeUp() {
        this.sleepMode = false;
    }

    /**
     * Start speaking effect
     */
    startSpeaking() {
        this.speakingActive = true;
    }

    /**
     * Stop speaking effect
     */
    stopSpeaking() {
        this.speakingActive = false;
    }

    /**
     * Create a sparkle particle
     */
    createSparkle(x, y, options = {}) {
        this.sparkles.push({
            x,
            y,
            vx: options.velocity?.x || 0,
            vy: options.velocity?.y || 0,
            size: options.size || 3,
            color: options.color || 'hsl(50, 100%, 70%)',
            lifetime: options.lifetime || 1000,
            maxLifetime: options.lifetime || 1000,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
    
    /**
     * Render all sparkles
     */
    renderSparkles() {
        const {ctx} = this;
        
        this.sparkles.forEach(sparkle => {
            const progress = 1 - (sparkle.lifetime / sparkle.maxLifetime);
            const opacity = 1 - progress; // Fade out over time
            
            ctx.save();
            ctx.translate(sparkle.x, sparkle.y);
            ctx.rotate(sparkle.rotation);
            
            // Draw sparkle as a star shape
            const size = this.scaleValue(sparkle.size * (1 - progress * 0.5));
            
            // Draw a 5-pointed star with smoother interior angles
            ctx.beginPath();
            const points = 5;
            const outerRadius = size;
            const innerRadius = size * 0.38; // Golden ratio-ish for smoother interior angles
            
            for (let i = 0; i < points * 2; i++) {
                const angle = (i * Math.PI / points) - Math.PI / 2; // Start from top
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                
                if (i === 0) {
                    ctx.moveTo(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius
                    );
                } else {
                    ctx.lineTo(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius
                    );
                }
            }
            ctx.closePath();
            
            // Add glow effect
            ctx.shadowBlur = this.scaleValue(10);
            ctx.shadowColor = sparkle.color;
            
            ctx.fillStyle = sparkle.color.replace('70%', `${70 + progress * 30}%`).replace(')', `, ${opacity})`).replace('hsl', 'hsla');
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * Trigger chromatic aberration effect
     * @param {number} intensity - Effect intensity (0-1)
     */
    triggerChromaticAberration(intensity = 0.8) {
        this.chromaticAberration.active = true;
        this.chromaticAberration.targetIntensity = Math.min(1, intensity);
        this.chromaticAberration.intensity = this.chromaticAberration.targetIntensity;
        
        // Get the actual visible canvas from the document
        const visibleCanvas = document.getElementById('emotive-canvas') || 
                            document.querySelector('canvas') || 
                            this.canvas;
        
        console.warn('[Chromatic] Visible canvas element:', visibleCanvas);
        console.warn('[Chromatic] Canvas ID:', visibleCanvas?.id);
        
        if (visibleCanvas) {
            // Remove any existing animation
            visibleCanvas.style.animation = 'none';
            
            // Force reflow to reset animation
            void visibleCanvas.offsetHeight;
            
            // Add CSS styles if not already present
            if (!document.getElementById('chromatic-styles')) {
                const style = document.createElement('style');
                style.id = 'chromatic-styles';
                style.textContent = `
                    @keyframes chromaticGlitch {
                        0% {
                            filter: none;
                            transform: translateX(0);
                        }
                        15% {
                            filter: drop-shadow(-2px 0 0 rgba(255,0,0,0.7)) drop-shadow(2px 0 0 rgba(0,255,255,0.7));
                            transform: translateX(-0.5px);
                        }
                        30% {
                            filter: drop-shadow(-3px 0 0 rgba(255,0,0,0.8)) drop-shadow(3px 0 0 rgba(0,255,255,0.8));
                            transform: translateX(0.5px);
                        }
                        45% {
                            filter: drop-shadow(-2px 0 0 rgba(255,0,0,0.6)) drop-shadow(2px 0 0 rgba(0,255,255,0.6));
                            transform: translateX(-0.3px);
                        }
                        60% {
                            filter: drop-shadow(-1px 0 0 rgba(255,0,0,0.4)) drop-shadow(1px 0 0 rgba(0,255,255,0.4));
                            transform: translateX(0.2px);
                        }
                        100% {
                            filter: none;
                            transform: translateX(0);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Apply animation - shorter duration (300-500ms based on intensity)
            visibleCanvas.style.animation = `chromaticGlitch ${300 + 200 * intensity}ms ease-out`;
        }
    }
    
    /**
     * Apply chromatic aberration effect to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} sourceCanvas - Source canvas to apply effect to
     */
    applyChromaticAberration(ctx, sourceCanvas) {
        if (!this.chromaticAberration.active || this.chromaticAberration.intensity <= 0) {
            return;
        }
        
        const {intensity} = this.chromaticAberration;
        const offset = this.scaleValue(this.chromaticAberration.maxOffset * intensity);
        
        // Store current composite operation
        const prevComposite = ctx.globalCompositeOperation;
        
        // Clear the canvas first
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw red channel (shifted left)
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'url(#red-channel)'; // Will use CSS filter fallback
        ctx.drawImage(sourceCanvas, -offset, 0);
        
        // Draw green channel (center)
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = 'url(#green-channel)';
        ctx.drawImage(sourceCanvas, 0, 0);
        
        // Draw blue channel (shifted right)
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = 'url(#blue-channel)';
        ctx.drawImage(sourceCanvas, offset, 0);
        
        // Reset
        ctx.filter = 'none';
        ctx.globalCompositeOperation = prevComposite;
        ctx.restore();
    }
    
    /**
     * Simple chromatic aberration using multiple draws
     * (Fallback method that doesn't require filters)
     */
    applyChromaticAberrationSimple(ctx, centerX, centerY, radius, drawFunction) {
        if (!this.chromaticAberration.active || this.chromaticAberration.intensity <= 0) {
            drawFunction();
            return;
        }
        
        const {intensity} = this.chromaticAberration;
        const offset = this.scaleValue(this.chromaticAberration.maxOffset * intensity);
        
        ctx.save();
        
        // Draw red channel (shifted left)
        ctx.globalCompositeOperation = 'source-over';
        ctx.translate(-offset, 0);
        ctx.globalAlpha = 0.33;
        ctx.fillStyle = '#ff0000';
        ctx.filter = 'brightness(3)';
        drawFunction();
        ctx.translate(offset, 0);
        
        // Draw green channel (center)
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.33;
        ctx.fillStyle = '#00ff00';
        drawFunction();
        
        // Draw blue channel (shifted right)
        ctx.translate(offset, 0);
        ctx.globalAlpha = 0.33;
        ctx.fillStyle = '#0000ff';
        drawFunction();
        
        ctx.restore();
    }
    
    /**
     * Update all active effects
     */
    update(deltaTime) {
        // Update sparkles
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.rotation += sparkle.rotationSpeed;
            sparkle.lifetime -= deltaTime;
            sparkle.vy += 0.1; // Gravity
            
            return sparkle.lifetime > 0;
        });
        
        // Update chromatic aberration fade
        if (this.chromaticAberration.active) {
            // Fade out the effect
            this.chromaticAberration.intensity -= this.chromaticAberration.fadeSpeed;
            
            if (this.chromaticAberration.intensity <= 0) {
                this.chromaticAberration.intensity = 0;
                this.chromaticAberration.active = false;
                this.chromaticAberration.targetIntensity = 0;
                console.log('[CSS Chromatic] Effect completed');
            }
        }
    }
}

export default SpecialEffects;