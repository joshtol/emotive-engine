/**
 * SpecialEffects - Special visual effects for EmotiveRenderer
 * @module core/renderer/SpecialEffects
 */

export class SpecialEffects {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;
        
        // Effect states
        this.recordingActive = false;
        this.sleepMode = false;
        this.speakingActive = false;
        this.zenModeActive = false;
    }

    /**
     * Render recording glow effect
     */
    renderRecordingGlow(x, y, radius, intensity) {
        const ctx = this.ctx;
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
    renderRecordingIndicator(x, y, time) {
        const ctx = this.ctx;
        const pulsePhase = (time / 1000) % 1;
        const indicatorRadius = 8 + Math.sin(pulsePhase * Math.PI * 2) * 2;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y - 40, indicatorRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add "REC" text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('REC', x, y - 40);
        ctx.restore();
    }

    /**
     * Render sleep indicator with Z's
     */
    renderSleepIndicator(x, y, deltaTime) {
        if (!this.sleepZs) {
            this.sleepZs = [
                { x: 20, y: -10, size: 20, opacity: 0, phase: 0 },
                { x: -25, y: -5, size: 16, opacity: 0, phase: 0.33 },
                { x: 15, y: -20, size: 24, opacity: 0, phase: 0.66 }
            ];
        }
        
        const ctx = this.ctx;
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        this.sleepZs.forEach(z => {
            z.phase += deltaTime * 0.0003;
            if (z.phase > 1) z.phase -= 1;
            
            const cyclePos = z.phase;
            z.y = -10 - cyclePos * 30;
            z.opacity = cyclePos < 0.5 ? cyclePos * 2 : 2 - cyclePos * 2;
            
            ctx.font = `bold ${z.size}px Arial`;
            ctx.fillStyle = `rgba(200, 200, 255, ${z.opacity * 0.7})`;
            ctx.fillText('Z', x + z.x, y + z.y);
        });
        
        ctx.restore();
    }

    /**
     * Render speaking rings effect
     */
    renderSpeakingRings(centerX, centerY, coreRadius, deltaTime) {
        if (!this.speakingRings) {
            this.speakingRings = [
                { radius: 1, opacity: 1, speed: 0.15 },
                { radius: 1, opacity: 1, speed: 0.15 },
                { radius: 1, opacity: 1, speed: 0.15 }
            ];
            this.ringSpawnTimer = 0;
            this.nextRingIndex = 0;
        }
        
        const ctx = this.ctx;
        this.ringSpawnTimer += deltaTime;
        
        // Spawn new rings periodically
        if (this.ringSpawnTimer > 300) {
            this.speakingRings[this.nextRingIndex] = {
                radius: 1,
                opacity: 1,
                speed: 0.1 + Math.random() * 0.1
            };
            this.nextRingIndex = (this.nextRingIndex + 1) % this.speakingRings.length;
            this.ringSpawnTimer = 0;
        }
        
        // Update and render rings
        ctx.save();
        ctx.strokeStyle = this.renderer.state.glowColor;
        
        this.speakingRings.forEach(ring => {
            if (ring.opacity > 0) {
                ring.radius += ring.speed * deltaTime;
                ring.opacity = Math.max(0, 1 - (ring.radius - 1) / 2);
                
                ctx.globalAlpha = ring.opacity * 0.3;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, coreRadius * ring.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    /**
     * Render zen core effect
     */
    renderZenCore(x, y, radius, time) {
        const ctx = this.ctx;
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
     * Update all active effects
     */
    update(deltaTime) {
        // Update effect animations
    }
}

export default SpecialEffects;