/**
 * EyeRenderer - Handles eye expressions and blinking for EmotiveRenderer
 * @module core/renderer/EyeRenderer
 */

export class EyeRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.canvas = renderer.canvas;

        // Eye state
        this.blinking = false;
        this.blinkingEnabled = true;
        this.blinkTimer = 0;
        this.nextBlinkTime = this.getRandomBlinkTime();

        // Eye parameters
        this.squintAmount = 0;
        this.eyeClose = null;
        this.eyeOpen = null;

        // Helper method references
        this.scaleValue = value => renderer.scaleValue(value);
        this.hexToRgba = (hex, alpha) => renderer.hexToRgba(hex, alpha);
    }

    /**
     * Update blinking and eye animations
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update blink timer
        if (this.blinking) {
            this.blinkTimer += deltaTime;
            if (this.blinkTimer >= 150) {
                this.blinking = false;
                this.blinkTimer = 0;
                this.nextBlinkTime = Date.now() + this.getRandomBlinkTime();
            }
        }

        // Check for natural blink
        if (this.blinkingEnabled && !this.blinking && Date.now() >= this.nextBlinkTime) {
            this.startBlink();
        }
    }

    /**
     * Start a blink animation
     */
    startBlink() {
        if (!this.blinkingEnabled) return;
        this.blinking = true;
        this.blinkTimer = 0;
    }

    /**
     * Get random time until next blink (3-7 seconds)
     * @returns {number} Time in milliseconds
     */
    getRandomBlinkTime() {
        return 3000 + Math.random() * 4000;
    }

    /**
     * Calculate blink scale for core
     * @returns {number} Scale factor for blinking
     */
    getBlinkScale() {
        if (!this.blinking) return 1;

        const blinkProgress = Math.min(this.blinkTimer / 150, 1);
        const blinkCurve = Math.sin(blinkProgress * Math.PI);
        return 1 - blinkCurve * 0.7; // Squish vertically by 70%
    }

    /**
     * Draw eye expression
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @param {string} emotion - Current emotion
     * @param {Object} params - Eye parameters
     */
    drawEyes(x, y, radius, emotion, params = {}) {
        const { ctx } = this;

        // Get eye parameters
        const eyeOpenness = params.eyeOpenness || 1;
        const eyeExpression = params.eyeExpression || 'neutral';

        // Don't draw eyes for certain states
        if (emotion === 'zen' || emotion === 'neutral' || eyeOpenness <= 0) {
            return;
        }

        ctx.save();

        // Eye color (slightly darker than core)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = this.scaleValue(2);
        ctx.lineCap = 'round';

        // Calculate eye positions
        const eyeSpacing = radius * 0.4;
        const eyeY = y - radius * 0.1;
        const eyeSize = radius * 0.25;

        // Draw based on expression
        switch (eyeExpression) {
            case 'happy':
                this.drawHappyEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'sad':
                this.drawSadEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'angry':
                this.drawAngryEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'surprised':
                this.drawSurprisedEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'focused':
                this.drawFocusedEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'sleepy':
                this.drawSleepyEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            case 'suspicious':
                this.drawSuspiciousEyes(ctx, x, eyeY, eyeSpacing, eyeSize, eyeOpenness);
                break;
            default:
                // No eyes for neutral
                break;
        }

        ctx.restore();
    }

    /**
     * Draw happy eyes (upward curves)
     */
    drawHappyEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye
        ctx.beginPath();
        ctx.arc(x - spacing, y, size, Math.PI * 0.2, Math.PI * 0.8, false);
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.arc(x + spacing, y, size, Math.PI * 0.2, Math.PI * 0.8, false);
        ctx.stroke();
    }

    /**
     * Draw sad eyes (downward curves)
     */
    drawSadEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye
        ctx.beginPath();
        ctx.arc(x - spacing, y + size * 0.5, size, Math.PI * 1.2, Math.PI * 1.8, false);
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.arc(x + spacing, y + size * 0.5, size, Math.PI * 1.2, Math.PI * 1.8, false);
        ctx.stroke();
    }

    /**
     * Draw angry eyes (angled lines)
     */
    drawAngryEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye
        ctx.beginPath();
        ctx.moveTo(x - spacing - size, y - size * 0.3);
        ctx.lineTo(x - spacing + size * 0.5, y + size * 0.3);
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.moveTo(x + spacing + size, y - size * 0.3);
        ctx.lineTo(x + spacing - size * 0.5, y + size * 0.3);
        ctx.stroke();
    }

    /**
     * Draw surprised eyes (wide circles)
     */
    drawSurprisedEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye
        ctx.beginPath();
        ctx.arc(x - spacing, y, size * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.arc(x + spacing, y, size * 1.2, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Draw focused eyes (dots)
     */
    drawFocusedEyes(ctx, x, y, spacing, size, _openness) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

        // Left eye
        ctx.beginPath();
        ctx.arc(x - spacing, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(x + spacing, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw sleepy eyes (half-closed)
     */
    drawSleepyEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye
        ctx.beginPath();
        ctx.moveTo(x - spacing - size, y);
        ctx.lineTo(x - spacing + size, y);
        ctx.stroke();

        // Right eye
        ctx.beginPath();
        ctx.moveTo(x + spacing - size, y);
        ctx.lineTo(x + spacing + size, y);
        ctx.stroke();
    }

    /**
     * Draw suspicious eyes (narrowed)
     */
    drawSuspiciousEyes(ctx, x, y, spacing, size, _openness) {
        // Left eye - narrowed
        ctx.beginPath();
        ctx.moveTo(x - spacing - size, y);
        ctx.lineTo(x - spacing + size * 0.7, y);
        ctx.stroke();

        // Right eye - more open
        ctx.beginPath();
        ctx.arc(x + spacing, y, size * 0.8, Math.PI * 0.1, Math.PI * 0.9, false);
        ctx.stroke();
    }

    /**
     * Enable or disable blinking
     * @param {boolean} enabled - Whether blinking is enabled
     */
    setBlinkingEnabled(enabled) {
        this.blinkingEnabled = enabled;
        if (!enabled) {
            this.blinking = false;
            this.blinkTimer = 0;
        }
    }

    /**
     * Set squint amount for eye narrowing
     * @param {number} amount - Squint amount (0-1)
     */
    setSquintAmount(amount) {
        this.squintAmount = Math.max(0, Math.min(1, amount));
    }

    /**
     * Force a blink
     */
    forceBlink() {
        this.startBlink();
    }
}

export default EyeRenderer;
