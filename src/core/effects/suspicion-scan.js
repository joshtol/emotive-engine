/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Scan Effect
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'suspicion-scan',
    emoji: '🔍',
    description: 'Suspicious scanning and squinting',

    config: {
        squintAmount: 0.4, // 40% eye narrowing
        scanInterval: 5000, // Scan every 5 seconds
        scanDuration: 800, // Each scan takes 800ms
        scanAngle: 45, // Degrees to look left/right
        squintSpeed: 0.02, // Animation speed for squinting
        pupilShift: 0.3, // How much the pupil shifts when scanning
    },

    state: {
        currentSquint: 0,
        targetSquint: 0,
        lastScanTime: 0,
        scanPhase: 0, // 0 = center, -1 = left, 1 = right
        scanning: false,
    },

    shouldActivate(state) {
        return state.emotion === 'suspicion' || state.suspicious === true;
    },

    apply(ctx, params) {
        const { deltaTime = 16.67 } = params;
        const now = Date.now();

        // Update squint amount
        this.updateSquint(deltaTime);

        // Handle scanning motion
        if (now - this.state.lastScanTime > this.config.scanInterval) {
            this.startScan();
            this.state.lastScanTime = now;
        }

        if (this.state.scanning) {
            this.updateScan(now, deltaTime);
        }
    },

    updateSquint(deltaTime) {
        // Set target squint when suspicious
        this.state.targetSquint = this.config.squintAmount;

        // Animate toward target
        const diff = this.state.targetSquint - this.state.currentSquint;
        if (Math.abs(diff) > 0.01) {
            this.state.currentSquint += diff * this.config.squintSpeed * (deltaTime / 16.67);
        } else {
            this.state.currentSquint = this.state.targetSquint;
        }
    },

    startScan() {
        this.state.scanning = true;
        this.state.scanStartTime = Date.now();
        this.state.scanPhase = -1; // Start by looking left
    },

    updateScan(now, _deltaTime) {
        const elapsed = now - this.state.scanStartTime;
        const progress = elapsed / this.config.scanDuration;

        if (progress < 0.33) {
            // Look left
            this.state.scanPhase = -1;
        } else if (progress < 0.66) {
            // Look right
            this.state.scanPhase = 1;
        } else if (progress < 1) {
            // Return to center
            this.state.scanPhase = 0;
        } else {
            // Scan complete
            this.state.scanning = false;
            this.state.scanPhase = 0;
        }
    },

    getEyeModifiers() {
        return {
            scaleY: 1 - this.state.currentSquint, // Narrow vertically
            scaleX: 1 + this.state.currentSquint * 0.3, // Widen horizontally slightly
            offsetX: this.state.scanPhase * this.config.pupilShift,
        };
    },

    drawScanLines(ctx, x, y, radius) {
        if (!this.state.scanning) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)'; // Orange scan lines
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Draw scanning beam
        const angle = this.state.scanPhase * ((this.config.scanAngle * Math.PI) / 180);
        const endX = x + Math.cos(angle) * radius * 2;
        const endY = y + Math.sin(angle) * radius * 0.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.restore();
    },
};
