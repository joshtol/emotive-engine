/**
 * PerformanceHUD - Lightweight performance monitoring overlay
 * Displays FPS and particle count with minimal performance impact
 */

class PerformanceHUD {
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.ctx = canvasManager.getContext();
        
        // Configuration
        this.config = {
            enabled: options.enabled !== false,
            position: options.position || 'top-right',
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'monospace',
            backgroundColor: options.backgroundColor || 'rgba(0, 100, 200, 0.3)',
            textColor: options.textColor || '#00ff88',
            borderColor: options.borderColor || 'rgba(0, 150, 255, 0.5)',
            padding: options.padding || 10,
            margin: options.margin || 10,
            updateInterval: options.updateInterval || 500, // Update every 500ms
            showParticles: options.showParticles !== false,
            showMemory: options.showMemory !== false && performance.memory
        };
        
        // Performance data
        this.fps = 0;
        this.avgFps = 0;
        this.minFps = Infinity;
        this.maxFps = 0;
        this.particleCount = 0;
        this.memoryMB = 0;
        
        // Frame timing
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.frameTimes = [];
        this.maxFrameSamples = 60; // Keep last 60 frames for averaging
        
        // Update timing (throttled)
        this.lastUpdateTime = 0;
        this.displayFPS = 0;
        this.displayAvgFPS = 0;
        this.displayMinFPS = 0;
        this.displayMaxFPS = 0;
        
        // Pre-calculate text metrics to avoid repeated calculations
        this.textMetrics = null;
        this.hudWidth = 0;
        this.hudHeight = 0;
        
        // Toggle state
        this.visible = this.config.enabled;
        
        // Keyboard shortcut (F3 to toggle)
        this.setupKeyboardShortcut();
    }
    
    /**
     * Setup keyboard shortcut for toggling HUD
     */
    setupKeyboardShortcut() {
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F3') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    }
    
    /**
     * Toggle HUD visibility
     */
    toggle() {
        this.visible = !this.visible;
        return this.visible;
    }
    
    /**
     * Show HUD
     */
    show() {
        this.visible = true;
    }
    
    /**
     * Hide HUD
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * Update frame timing (call once per frame)
     */
    updateFrame() {
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        
        // Skip if called too soon (< 1ms)
        if (deltaTime < 1) return;
        
        // Calculate instant FPS
        const instantFPS = 1000 / deltaTime;
        
        // Store frame time
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > this.maxFrameSamples) {
            this.frameTimes.shift();
        }
        
        // Update min/max
        if (instantFPS < this.minFps && instantFPS > 1) {
            this.minFps = instantFPS;
        }
        if (instantFPS > this.maxFps && instantFPS < 1000) {
            this.maxFps = instantFPS;
        }
        
        this.fps = instantFPS;
        this.lastFrameTime = now;
        this.frameCount++;
        
        // Throttled display update
        if (now - this.lastUpdateTime > this.config.updateInterval) {
            this.updateDisplay();
            this.lastUpdateTime = now;
        }
    }
    
    /**
     * Update display values (throttled)
     */
    updateDisplay() {
        // Calculate average FPS from frame times
        if (this.frameTimes.length > 0) {
            const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.displayAvgFPS = 1000 / avgFrameTime;
        }
        
        this.displayFPS = this.fps;
        this.displayMinFPS = this.minFps === Infinity ? 0 : this.minFps;
        this.displayMaxFPS = this.maxFps;
        
        // Update memory if available
        if (this.config.showMemory && performance.memory) {
            this.memoryMB = performance.memory.usedJSHeapSize / 1048576;
        }
    }
    
    /**
     * Set particle count
     */
    setParticleCount(count) {
        this.particleCount = count;
    }
    
    /**
     * Render the HUD overlay
     */
    render(ctx = null) {
        if (!this.visible) return;
        
        const context = ctx || this.ctx;
        if (!context) return;
        
        // Save context state
        context.save();
        
        // Prepare text
        const lines = [];
        lines.push(`FPS: ${this.displayFPS.toFixed(1)}`);
        lines.push(`AVG: ${this.displayAvgFPS.toFixed(1)}`);
        lines.push(`MIN: ${this.displayMinFPS.toFixed(1)}`);
        
        if (this.config.showParticles) {
            lines.push(`PRT: ${this.particleCount}`);
        }
        
        if (this.config.showMemory && this.memoryMB > 0) {
            lines.push(`MEM: ${this.memoryMB.toFixed(1)}MB`);
        }
        
        // Calculate position
        const fontSize = this.config.fontSize;
        const lineHeight = fontSize * 1.4;
        const padding = this.config.padding;
        const margin = this.config.margin;
        
        // Measure text width if not cached
        if (!this.textMetrics) {
            context.font = `${fontSize}px ${this.config.fontFamily}`;
            let maxWidth = 0;
            for (const line of lines) {
                const metrics = context.measureText(line);
                maxWidth = Math.max(maxWidth, metrics.width);
            }
            this.hudWidth = maxWidth + padding * 2;
            this.hudHeight = lines.length * lineHeight + padding * 2;
            this.textMetrics = true;
        }
        
        // Calculate position based on config
        let x, y;
        const canvasWidth = this.canvasManager.width || context.canvas.width;
        const canvasHeight = this.canvasManager.height || context.canvas.height;
        
        switch (this.config.position) {
            case 'top-right':
                x = canvasWidth - this.hudWidth - margin;
                y = margin;
                break;
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'bottom-right':
                x = canvasWidth - this.hudWidth - margin;
                y = canvasHeight - this.hudHeight - margin;
                break;
            case 'bottom-left':
                x = margin;
                y = canvasHeight - this.hudHeight - margin;
                break;
            default:
                x = canvasWidth - this.hudWidth - margin;
                y = margin;
        }
        
        // Draw background
        context.fillStyle = this.config.backgroundColor;
        context.fillRect(x, y, this.hudWidth, this.hudHeight);
        
        // Draw border
        context.strokeStyle = this.config.borderColor;
        context.lineWidth = 1;
        context.strokeRect(x, y, this.hudWidth, this.hudHeight);
        
        // Draw text
        context.fillStyle = this.config.textColor;
        context.font = `${fontSize}px ${this.config.fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        for (let i = 0; i < lines.length; i++) {
            const textX = x + padding;
            const textY = y + padding + i * lineHeight;
            
            // Add shadow for better readability
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 2;
            context.shadowOffsetX = 1;
            context.shadowOffsetY = 1;
            
            context.fillText(lines[i], textX, textY);
        }
        
        // Clear shadow
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        // Restore context state
        context.restore();
    }
    
    /**
     * Reset performance metrics
     */
    reset() {
        this.fps = 0;
        this.avgFps = 0;
        this.minFps = Infinity;
        this.maxFps = 0;
        this.frameCount = 0;
        this.frameTimes = [];
        this.displayFPS = 0;
        this.displayAvgFPS = 0;
        this.displayMinFPS = 0;
        this.displayMaxFPS = 0;
    }
    
    /**
     * Get current FPS
     */
    getFPS() {
        return this.displayFPS;
    }
    
    /**
     * Get average FPS
     */
    getAverageFPS() {
        return this.displayAvgFPS;
    }
    
    /**
     * Check if HUD is visible
     */
    isVisible() {
        return this.visible;
    }
}

export default PerformanceHUD;