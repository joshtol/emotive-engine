/**
 * Debug Configuration
 * Provides debug settings and utilities for development builds
 */

/**
 * Debug configuration based on environment and URL parameters
 */
export function getDebugConfig() {
    const config = {
        enabled: false,
        level: 'INFO',
        enableProfiling: false,
        enableErrorTracking: true,
        enableMemoryTracking: false,
        showFPS: false,
        showDebug: false,
        enableAutoOptimization: true,
        enableGracefulDegradation: true
    };

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Check URL parameters for debug flags
    if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Enable debug mode
        if (urlParams.has('debug') || urlParams.get('debug') === 'true') {
            config.enabled = true;
            config.enableProfiling = true;
            config.enableMemoryTracking = true;
        }
        
        // Set debug level
        const debugLevel = urlParams.get('debugLevel');
        if (debugLevel) {
            config.level = debugLevel.toUpperCase();
        }
        
        // Show FPS counter
        if (urlParams.has('fps') || urlParams.get('fps') === 'true') {
            config.showFPS = true;
        }
        
        // Show debug overlay
        if (urlParams.has('debugOverlay') || urlParams.get('debugOverlay') === 'true') {
            config.showDebug = true;
        }
        
        // Disable optimizations for testing
        if (urlParams.has('noOptimization') || urlParams.get('noOptimization') === 'true') {
            config.enableAutoOptimization = false;
            config.enableGracefulDegradation = false;
        }
        
        // Enable memory tracking
        if (urlParams.has('memoryTracking') || urlParams.get('memoryTracking') === 'true') {
            config.enableMemoryTracking = true;
        }
    }
    
    // Enable debug features in development
    if (isDevelopment) {
        config.enabled = true;
        config.enableProfiling = true;
        config.showFPS = true;
    }
    
    return config;
}

/**
 * Debug utilities for development
 */
export class DebugUtils {
    /**
     * Create a debug panel in the DOM
     * @param {EmotiveMascot} mascot - Mascot instance
     * @returns {HTMLElement} Debug panel element
     */
    static createDebugPanel(mascot) {
        const panel = document.createElement('div');
        panel.id = 'emotive-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            overflow-y: auto;
            border: 1px solid #333;
        `;
        
        // Create sections
        const sections = {
            status: this.createSection('Status'),
            performance: this.createSection('Performance'),
            browser: this.createSection('Browser'),
            controls: this.createSection('Controls')
        };
        
        Object.values(sections).forEach(section => panel.appendChild(section));
        
        // Add controls
        const controls = sections.controls;
        
        // Debug level selector
        const levelSelect = document.createElement('select');
        levelSelect.style.cssText = 'margin: 2px; padding: 2px;';
        ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            levelSelect.appendChild(option);
        });
        levelSelect.addEventListener('change', (e) => {
            // Update debug level (would need debugger instance access)
            console.log('Debug level changed to:', e.target.value);
        });
        controls.appendChild(this.createControl('Debug Level:', levelSelect));
        
        // Memory snapshot button
        const memoryBtn = document.createElement('button');
        memoryBtn.textContent = 'Memory Snapshot';
        memoryBtn.style.cssText = 'margin: 2px; padding: 2px 5px;';
        memoryBtn.addEventListener('click', () => {
            mascot.takeMemorySnapshot('manual-snapshot');
        });
        controls.appendChild(memoryBtn);
        
        // Export debug data button
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export Debug Data';
        exportBtn.style.cssText = 'margin: 2px; padding: 2px 5px;';
        exportBtn.addEventListener('click', () => {
            const data = mascot.exportDebugData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emotive-debug-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
        controls.appendChild(exportBtn);
        
        // Clear debug data button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear Debug Data';
        clearBtn.style.cssText = 'margin: 2px; padding: 2px 5px;';
        clearBtn.addEventListener('click', () => {
            mascot.clearDebugData();
        });
        controls.appendChild(clearBtn);
        
        // Update panel periodically
        const updatePanel = () => {
            this.updateDebugPanel(panel, sections, mascot);
        };
        
        const updateInterval = setInterval(updatePanel, 1000);
        
        // Store cleanup function
        panel._cleanup = () => {
            clearInterval(updateInterval);
        };
        
        // Initial update
        updatePanel();
        
        return panel;
    }
    
    /**
     * Create a debug section
     * @param {string} title - Section title
     * @returns {HTMLElement} Section element
     */
    static createSection(title) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;';
        
        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = 'font-weight: bold; margin-bottom: 5px; color: #4CAF50;';
        
        const content = document.createElement('div');
        content.className = 'debug-content';
        
        section.appendChild(titleEl);
        section.appendChild(content);
        
        return section;
    }
    
    /**
     * Create a control element
     * @param {string} label - Control label
     * @param {HTMLElement} control - Control element
     * @returns {HTMLElement} Control container
     */
    static createControl(label, control) {
        const container = document.createElement('div');
        container.style.cssText = 'margin: 2px 0; display: flex; align-items: center;';
        
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'margin-right: 5px; min-width: 80px;';
        
        container.appendChild(labelEl);
        container.appendChild(control);
        
        return container;
    }
    
    /**
     * Update debug panel content
     * @param {HTMLElement} panel - Debug panel element
     * @param {Object} sections - Panel sections
     * @param {EmotiveMascot} mascot - Mascot instance
     */
    static updateDebugPanel(panel, sections, mascot) {
        try {
            // Update status
            const state = mascot.getCurrentState();
            const statusContent = sections.status.querySelector('.debug-content');
            statusContent.innerHTML = `
                <div>Running: ${mascot.isRunning ? 'Yes' : 'No'}</div>
                <div>Emotion: ${state.emotion}</div>
                <div>Speaking: ${mascot.speaking ? 'Yes' : 'No'}</div>
                <div>Audio Level: ${(mascot.getAudioLevel() * 100).toFixed(1)}%</div>
            `;
            
            // Update performance
            const metrics = mascot.getPerformanceMetrics();
            const performanceContent = sections.performance.querySelector('.debug-content');
            performanceContent.innerHTML = `
                <div>FPS: ${metrics.fps}</div>
                <div>Frame Time: ${metrics.frameTime.toFixed(2)}ms</div>
                <div>Particles: ${metrics.particleCount || 0}</div>
                <div>Memory: ${metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(1)}MB` : 'N/A'}</div>
            `;
            
            // Update browser info
            const browserInfo = mascot.getBrowserCompatibility();
            const browserContent = sections.browser.querySelector('.debug-content');
            browserContent.innerHTML = `
                <div>Browser: ${browserInfo.browser.name} ${browserInfo.browser.version}</div>
                <div>Capabilities: ${browserInfo.capabilities.level}</div>
                <div>Polyfills: ${browserInfo.appliedPolyfills.length}</div>
            `;
            
        } catch (error) {
            console.error('Error updating debug panel:', error);
        }
    }
    
    /**
     * Remove debug panel from DOM
     * @param {HTMLElement} panel - Debug panel element
     */
    static removeDebugPanel(panel) {
        if (panel && panel._cleanup) {
            panel._cleanup();
        }
        if (panel && panel.parentNode) {
            panel.parentNode.removeChild(panel);
        }
    }
    
    /**
     * Log performance warning if frame time is too high
     * @param {number} frameTime - Frame time in milliseconds
     * @param {Object} context - Additional context
     */
    static checkPerformance(frameTime, context = {}) {
        if (frameTime > 16.67) { // 60fps threshold
            console.warn('Performance warning: Frame time exceeded 16.67ms', {
                frameTime,
                fps: 1000 / frameTime,
                ...context
            });
        }
    }
    
    /**
     * Create a simple performance monitor
     * @returns {Object} Performance monitor
     */
    static createPerformanceMonitor() {
        const monitor = {
            frameCount: 0,
            startTime: performance.now(),
            lastFrameTime: performance.now(),
            frameTimes: [],
            
            tick() {
                const now = performance.now();
                const frameTime = now - this.lastFrameTime;
                
                this.frameCount++;
                this.frameTimes.push(frameTime);
                
                // Keep only last 60 frames
                if (this.frameTimes.length > 60) {
                    this.frameTimes.shift();
                }
                
                this.lastFrameTime = now;
                
                // Check performance every 60 frames
                if (this.frameCount % 60 === 0) {
                    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
                    DebugUtils.checkPerformance(avgFrameTime, {
                        frameCount: this.frameCount,
                        avgFPS: 1000 / avgFrameTime
                    });
                }
            },
            
            getStats() {
                const totalTime = performance.now() - this.startTime;
                const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
                
                return {
                    frameCount: this.frameCount,
                    totalTime,
                    avgFPS: this.frameCount / (totalTime / 1000),
                    avgFrameTime,
                    currentFPS: 1000 / (this.frameTimes[this.frameTimes.length - 1] || 16.67)
                };
            }
        };
        
        return monitor;
    }
}

// Export debug configuration
export const debugConfig = getDebugConfig();