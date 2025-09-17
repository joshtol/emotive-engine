/**
 * AudioVisualizer - Audio spectrum visualization for Emotive mascot
 * Creates and manages frequency spectrum bars that respond to audio
 */
class AudioVisualizer {
    constructor(containerId, mascot, options = {}) {
        this.container = document.getElementById(containerId);
        this.mascot = mascot;

        // Configuration
        this.config = {
            numBars: options.numBars || 16,
            minHeight: options.minHeight || 2,
            maxHeight: options.maxHeight || 100,
            transitionTime: options.transitionTime || 0.15,
            logarithmicScale: options.logarithmicScale || 0.7,
            ...options
        };

        // State
        this.active = false;
        this.animationId = null;
        this.bars = [];
        this.dataWarned = false;

        // Initialize
        this.init();
    }

    /**
     * Initialize the visualizer bars
     */
    init() {
        // Clear existing bars
        this.container.innerHTML = '';
        this.bars = [];

        // Create spectrum bars
        for (let i = 0; i < this.config.numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'spectrum-bar';

            // Apply CSS styles (should ideally be in CSS file)
            bar.style.cssText = `
                flex: 1;
                background: linear-gradient(180deg, var(--accent-glow), var(--accent-primary));
                border-radius: var(--radius-sm) var(--radius-sm) 0 0;
                transition: height ${this.config.transitionTime}s ease-out;
                opacity: var(--opacity-80);
                min-height: ${this.config.minHeight}px;
                height: ${this.config.minHeight}px;
            `;

            this.container.appendChild(bar);
            this.bars.push(bar);
        }
    }

    /**
     * Start the visualization
     */
    start() {
        if (!this.active) {
            this.active = true;
            this.update();
        }
    }

    /**
     * Stop the visualization
     */
    stop() {
        this.active = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Reset bars to minimum height
        this.bars.forEach(bar => {
            bar.style.height = `${this.config.minHeight}%`;
        });
    }

    /**
     * Update loop for visualization
     */
    update() {
        // Only update if active
        if (!this.active) {
            this.animationId = null;
            return;
        }

        if (this.mascot && this.mascot.shapeMorpher) {
            const morpher = this.mascot.shapeMorpher;

            // Update spectrum bars based on frequency data
            if (morpher.frequencyData && morpher.frequencyData.length > 0) {
                // Check if we have any non-zero data
                const hasData = morpher.frequencyData.some(v => v > 0);

                if (!hasData && !this.dataWarned) {
                    console.log('Warning: AudioVisualizer has no data. Check console for AudioAnalyzer messages.');
                    this.dataWarned = true;
                } else if (hasData && this.dataWarned) {
                    console.log('AudioVisualizer now receiving data!');
                    this.dataWarned = false;
                }

                this.updateBars(morpher.frequencyData);
            }
        }

        // Continue animation loop
        this.animationId = requestAnimationFrame(() => this.update());
    }

    /**
     * Update spectrum bars based on frequency data
     */
    updateBars(frequencyData) {
        const bandsPerBar = Math.floor(frequencyData.length / this.config.numBars);

        this.bars.forEach((bar, i) => {
            // Average the energy for bands that map to this bar
            let energy = 0;
            let count = 0;

            for (let j = 0; j < bandsPerBar; j++) {
                const bandIndex = i * bandsPerBar + j;
                if (bandIndex < frequencyData.length) {
                    energy += frequencyData[bandIndex] || 0;
                    count++;
                }
            }

            energy = count > 0 ? energy / count : 0;

            // Apply logarithmic scaling for better visual response
            const height = Math.pow(energy, this.config.logarithmicScale) * 100;
            bar.style.height = `${Math.max(this.config.minHeight, Math.min(this.config.maxHeight, height))}%`;

            // Apply frequency-based styling
            this.applyBarStyling(bar, i);
        });
    }

    /**
     * Apply color and opacity based on frequency range
     */
    applyBarStyling(bar, index) {
        if (index < 2) {
            // Bass frequencies - use primary accent
            bar.style.opacity = '1';
            bar.style.filter = 'hue-rotate(0deg)';
        } else if (index >= 6 && index <= 10) {
            // Mid frequencies (vocals) - use secondary accent
            bar.style.opacity = '0.9';
            bar.style.filter = 'hue-rotate(60deg)';
        } else {
            // High frequencies
            bar.style.opacity = '0.7';
            bar.style.filter = 'hue-rotate(120deg)';
        }
    }

    /**
     * Set the number of bars (recreates visualizer)
     */
    setBarCount(count) {
        this.config.numBars = count;
        this.init();
    }

    /**
     * Check if visualizer is active
     */
    isActive() {
        return this.active;
    }

    /**
     * Clean up
     */
    destroy() {
        this.stop();
        this.container.innerHTML = '';
        this.bars = [];
    }
}

// Export for use in demo
if (typeof window !== 'undefined') {
    window.AudioVisualizer = AudioVisualizer;
}