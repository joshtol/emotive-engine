/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * DisplayManager - Manages status displays and information panels
 * Handles emotion display, undertone display, FPS counter, and other status indicators
 */
class DisplayManager {
    constructor(options = {}) {
        // Configuration
        this.config = {
            emotionDisplayId: options.emotionDisplayId || 'emotion-display',
            undertoneDisplayId: options.undertoneDisplayId || 'undertone-display',
            fpsDisplayId: options.fpsDisplayId || 'fps-display',
            fpsValueId: options.fpsValueId || 'fps-value',

            // Display formats
            emotionFormat: options.emotionFormat || 'emotion: {value}',
            undertoneFormat: options.undertoneFormat || '{value}',
            defaultUndertone: options.defaultUndertone || 'STABLE',
            prefixOpacity: options.prefixOpacity || 0.8,

            // FPS settings
            fpsUpdateInterval: options.fpsUpdateInterval || 100, // ms
            fpsSmoothing: options.fpsSmoothing || 0.9,

            ...options
        };

        // Display elements
        this.elements = {
            emotionDisplay: null,
            undertoneDisplay: null,
            fpsDisplay: null,
            fpsValue: null
        };

        // State
        this.state = {
            currentEmotion: 'neutral',
            currentUndertone: '',
            showingFPS: false,
            lastFPSValue: -1,
            fpsAnimationId: null
        };

        // Mascot reference
        this.mascot = null;
    }

    /**
     * Initialize the display manager
     */
    init(mascot = null) {
        // Get display elements
        this.elements.emotionDisplay = document.getElementById(this.config.emotionDisplayId);
        this.elements.undertoneDisplay = document.getElementById(this.config.undertoneDisplayId);
        this.elements.fpsDisplay = document.getElementById(this.config.fpsDisplayId);
        this.elements.fpsValue = document.getElementById(this.config.fpsValueId);

        // Store mascot reference
        this.mascot = mascot || window.mascot;

        // Set initial display values
        this.updateEmotionDisplay(this.state.currentEmotion);
        this.updateUndertoneDisplay(this.state.currentUndertone);

        return this;
    }

    /**
     * Update emotion display
     */
    updateEmotionDisplay(emotion) {
        if (!this.elements.emotionDisplay) return;

        // Handle if emotion is passed as an object (from mascot state)
        if (typeof emotion === 'object' && emotion !== null) {
            emotion = emotion.current || emotion.name || 'neutral';
        }

        this.state.currentEmotion = emotion;
        const displayText = this.config.emotionFormat.replace('{value}', emotion.toLowerCase());

        // Create span elements for styled display
        this.elements.emotionDisplay.innerHTML = '';

        // Split the format to separate prefix from value
        const parts = displayText.split(': ');
        if (parts.length > 1) {
            // Create prefix span with alpha
            const prefixSpan = document.createElement('span');
            prefixSpan.className = 'emotion-prefix';
            prefixSpan.style.opacity = this.config.prefixOpacity || '0.7';
            prefixSpan.textContent = parts[0] + ': ';

            // Create value span
            const valueSpan = document.createElement('span');
            valueSpan.className = 'emotion-value';
            valueSpan.textContent = parts[1];

            this.elements.emotionDisplay.appendChild(prefixSpan);
            this.elements.emotionDisplay.appendChild(valueSpan);
        } else {
            // Fallback to simple text
            this.elements.emotionDisplay.textContent = displayText;
        }
    }

    /**
     * Update undertone display
     */
    updateUndertoneDisplay(undertone) {
        if (!this.elements.undertoneDisplay) return;

        this.state.currentUndertone = undertone;
        const value = undertone ? undertone.toUpperCase() : this.config.defaultUndertone;
        const displayText = this.config.undertoneFormat.replace('{value}', value);
        this.elements.undertoneDisplay.textContent = displayText;
    }

    /**
     * Update all displays
     */
    update(emotion, undertone) {
        this.updateEmotionDisplay(emotion || this.state.currentEmotion);
        this.updateUndertoneDisplay(undertone !== undefined ? undertone : this.state.currentUndertone);
    }

    /**
     * Toggle FPS display
     */
    toggleFPS(show = null) {
        this.state.showingFPS = show !== null ? show : !this.state.showingFPS;

        if (this.elements.fpsDisplay) {
            this.elements.fpsDisplay.classList.toggle('active', this.state.showingFPS);
        }

        if (this.state.showingFPS) {
            this.startFPSUpdate();
        } else {
            this.stopFPSUpdate();
        }

        return this.state.showingFPS;
    }

    /**
     * Start FPS update loop
     */
    startFPSUpdate() {
        if (!this.mascot || !this.elements.fpsValue) return;

        const updateFPS = () => {
            if (!this.state.showingFPS) {
                this.state.fpsAnimationId = null;
                return;
            }

            const metrics = this.mascot.getPerformanceMetrics ?
                this.mascot.getPerformanceMetrics() : { fps: 0 };
            const fps = Math.round(metrics.fps || 0);

            // Only update DOM if value changed
            if (fps !== this.state.lastFPSValue) {
                this.elements.fpsValue.textContent = fps;
                this.state.lastFPSValue = fps;
            }

            this.state.fpsAnimationId = requestAnimationFrame(updateFPS);
        };

        updateFPS();
    }

    /**
     * Stop FPS update loop
     */
    stopFPSUpdate() {
        if (this.state.fpsAnimationId) {
            cancelAnimationFrame(this.state.fpsAnimationId);
            this.state.fpsAnimationId = null;
        }

        // Reset display
        if (this.elements.fpsValue) {
            this.elements.fpsValue.textContent = '0';
        }
        this.state.lastFPSValue = -1;
    }

    /**
     * Set custom format for displays
     */
    setFormat(display, format) {
        switch(display) {
            case 'emotion':
                this.config.emotionFormat = format;
                this.updateEmotionDisplay(this.state.currentEmotion);
                break;
            case 'undertone':
                this.config.undertoneFormat = format;
                this.updateUndertoneDisplay(this.state.currentUndertone);
                break;
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Show a temporary status message
     */
    showStatus(message, duration = 3000) {
        // Could be extended to show temporary status messages
        console.log('Status:', message);
    }

    /**
     * Update mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Clean up
     */
    destroy() {
        this.stopFPSUpdate();
    }
}

// ES6 Module Export
export { DisplayManager };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.