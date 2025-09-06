/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fingerprint Effect
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Biometric fingerprint pattern effect
 * @author Emotive Engine Team
 * @module effects/fingerprint
 * 
 * Created from a happy accident in the resting state that produced
 * concentric circles resembling a fingerprint pattern!
 */

export default {
    name: 'fingerprint',
    emoji: '👆',
    description: 'Biometric fingerprint pattern for authentication UI',
    
    // Configuration
    config: {
        rings: 8,                  // Number of concentric rings
        ringSpacing: 15,           // Pixels between rings
        lineWidth: 1.5,           // Width of fingerprint lines
        rotationSpeed: 0.001,     // Slow rotation for scanning effect
        pulseSpeed: 0.02,         // Breathing/pulse speed
        waveAmplitude: 3,         // Waviness of lines (realistic fingerprint)
        waveFrequency: 8,         // How many waves per ring
        breakPoints: 5,           // Random breaks in lines (like real fingerprints)
        opacity: 0.4,             // Base opacity
        scanLineSpeed: 0.01,      // Speed of scanning line
        scanLineWidth: 3,         // Width of scanning beam
        color: '#00CED1',         // Cyan for tech/biometric feel
        glowColor: '#00FFFF',     // Bright cyan for scan
        successColor: '#00FF00',  // Green for successful scan
        failColor: '#FF0000'      // Red for failed scan
    },
    
    // State for animation
    state: {
        rotation: 0,
        pulsePhase: 0,
        scanPosition: 0,
        scanDirection: 1,
        isScanning: false,
        scanResult: null,  // 'success', 'fail', or null
        breaks: [],        // Random break positions in rings
        whorls: []         // Whorl patterns for realism
    },
    
    /**
     * Check if effect should be active
     * @param {Object} state - Renderer state
     * @returns {boolean}
     */
    shouldActivate: function(state) {
        return state.biometric === true || state.fingerprint === true || state.authenticating === true;
    },
    
    /**
     * Initialize fingerprint pattern
     */
    initialize: function() {
        // Generate random breaks for each ring
        this.state.breaks = [];
        for (let i = 0; i < this.config.rings; i++) {
            const ringBreaks = [];
            for (let j = 0; j < this.config.breakPoints; j++) {
                ringBreaks.push(Math.random() * Math.PI * 2);
            }
            this.state.breaks.push(ringBreaks);
        }
        
        // Generate whorl centers for realistic pattern
        this.state.whorls = [
            { x: 0.2, y: -0.1, strength: 0.3 },
            { x: -0.15, y: 0.2, strength: 0.25 },
            { x: 0, y: 0, strength: 0.5 }  // Central whorl
        ];
    },
    
    /**
     * Apply the fingerprint effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} params - Effect parameters
     */
    apply: function(ctx, params) {
        const { x, y, radius, deltaTime = 16.67, scanning = false, authResult = null } = params;
        
        // Initialize on first run
        if (this.state.breaks.length === 0) {
            this.initialize();
        }
        
        // Update animation state
        this.state.rotation += this.config.rotationSpeed * (deltaTime / 16.67);
        this.state.pulsePhase += this.config.pulseSpeed * (deltaTime / 16.67);
        
        // Update scan position
        if (scanning || this.state.isScanning) {
            this.state.isScanning = true;
            this.state.scanPosition += this.config.scanLineSpeed * this.state.scanDirection * (deltaTime / 16.67);
            
            // Reverse at bounds
            if (this.state.scanPosition > 1) {
                this.state.scanPosition = 1;
                this.state.scanDirection = -1;
            } else if (this.state.scanPosition < -1) {
                this.state.scanPosition = -1;
                this.state.scanDirection = 1;
            }
        }
        
        ctx.save();
        
        // Draw fingerprint rings
        this.drawFingerprintPattern(ctx, x, y, radius);
        
        // Draw scanning line if active
        if (this.state.isScanning) {
            this.drawScanLine(ctx, x, y, radius);
        }
        
        // Show auth result
        if (authResult) {
            this.showAuthResult(ctx, x, y, radius, authResult);
        }
        
        ctx.restore();
    },
    
    /**
     * Draw the fingerprint pattern
     */
    drawFingerprintPattern: function(ctx, centerX, centerY, baseRadius) {
        const pulse = Math.sin(this.state.pulsePhase) * 0.1 + 1;
        
        for (let ring = 0; ring < this.config.rings; ring++) {
            const ringRadius = (ring + 1) * this.config.ringSpacing * pulse;
            
            // Skip if ring is outside visible area
            if (ringRadius > baseRadius * 2) continue;
            
            ctx.beginPath();
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = this.config.lineWidth;
            ctx.globalAlpha = this.config.opacity * (1 - ring / this.config.rings * 0.5);
            
            // Draw ring with breaks and distortions
            for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
                // Check for breaks
                let shouldBreak = false;
                for (const breakAngle of this.state.breaks[ring] || []) {
                    if (Math.abs(angle - breakAngle) < 0.1) {
                        shouldBreak = true;
                        break;
                    }
                }
                
                if (shouldBreak) {
                    ctx.stroke();
                    ctx.beginPath();
                    continue;
                }
                
                // Apply whorl distortions
                let distortedRadius = ringRadius;
                let distortedAngle = angle + this.state.rotation;
                
                for (const whorl of this.state.whorls) {
                    const whorldX = centerX + whorl.x * baseRadius;
                    const whorldY = centerY + whorl.y * baseRadius;
                    const pointX = centerX + Math.cos(distortedAngle) * distortedRadius;
                    const pointY = centerY + Math.sin(distortedAngle) * distortedRadius;
                    
                    const distance = Math.sqrt(
                        Math.pow(pointX - whorldX, 2) + 
                        Math.pow(pointY - whorldY, 2)
                    );
                    
                    const influence = Math.exp(-distance / (baseRadius * 0.5)) * whorl.strength;
                    distortedAngle += influence * 0.5;
                }
                
                // Add wave pattern
                const wave = Math.sin(angle * this.config.waveFrequency) * this.config.waveAmplitude;
                distortedRadius += wave;
                
                // Draw point
                const px = centerX + Math.cos(distortedAngle) * distortedRadius;
                const py = centerY + Math.sin(distortedAngle) * distortedRadius;
                
                if (angle === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            
            ctx.stroke();
        }
    },
    
    /**
     * Draw scanning line
     */
    drawScanLine: function(ctx, x, y, radius) {
        const scanY = y + this.state.scanPosition * radius;
        
        // Create gradient for scan line
        const gradient = ctx.createLinearGradient(x - radius, scanY, x + radius, scanY);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.5, this.config.glowColor);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.config.scanLineWidth;
        ctx.globalAlpha = 0.8;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.config.glowColor;
        
        ctx.beginPath();
        ctx.moveTo(x - radius, scanY);
        ctx.lineTo(x + radius, scanY);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    },
    
    /**
     * Show authentication result
     */
    showAuthResult: function(ctx, x, y, radius, result) {
        const color = result === 'success' ? this.config.successColor : this.config.failColor;
        const text = result === 'success' ? '✓ AUTHENTICATED' : '✗ ACCESS DENIED';
        
        ctx.fillStyle = color;
        ctx.font = `bold ${radius * 0.15}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.9;
        
        ctx.fillText(text, x, y + radius * 1.3);
        
        // Draw result ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
        ctx.stroke();
    },
    
    /**
     * Start authentication scan
     */
    startScan: function() {
        this.state.isScanning = true;
        this.state.scanPosition = -1;
        this.state.scanDirection = 1;
        this.state.scanResult = null;
    },
    
    /**
     * Complete authentication scan
     */
    completeScan: function(success = true) {
        this.state.isScanning = false;
        this.state.scanResult = success ? 'success' : 'fail';
        
        // Clear result after 2 seconds
        setTimeout(() => {
            this.state.scanResult = null;
        }, 2000);
    },
    
    /**
     * Reset the effect state
     */
    reset: function() {
        this.state.rotation = 0;
        this.state.pulsePhase = 0;
        this.state.scanPosition = 0;
        this.state.scanDirection = 1;
        this.state.isScanning = false;
        this.state.scanResult = null;
    }
};