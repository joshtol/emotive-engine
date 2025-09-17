/**
 * RhythmSyncVisualizer - Visual rhythm sync display with BPM subdivision
 * Modular component that integrates with existing BPM detection
 */
class RhythmSyncVisualizer {
    constructor(containerId, options = {}) {
        // Configuration
        this.config = {
            numBeats: options.numBeats || 8,
            defaultSubdivision: options.defaultSubdivision || 1,
            pulseIntensity: options.pulseIntensity || 1.2,
            autoStart: options.autoStart !== false,
            showLabels: options.showLabels !== false,
            minBPM: 40,
            maxBPM: 300,
            ...options
        };

        // State
        this.state = {
            active: false,
            currentBPM: 0,
            lockedBPM: 0,
            manualBPM: 0,  // User override BPM
            isManualMode: false,  // True when user has manually adjusted
            subdivision: this.config.defaultSubdivision,
            beatIndex: 0,
            lastBeatTime: 0
        };

        // References
        this.container = document.getElementById(containerId);
        this.mascot = null;
        this.beatIndicators = [];
        this.animationTimer = null;
        this.beatInterval = null;

        // Subdivision presets in display order
        this.subdivisionOrder = [0.5, 1, 2];
        this.subdivisions = {
            0.5: { label: '½×', multiplier: 0.5 },
            1: { label: '1×', multiplier: 1 },
            2: { label: '2×', multiplier: 2 }
        };

        // Initialize if container exists
        if (this.container) {
            console.log('RhythmSyncVisualizer: Container found, initializing');
            this.init();
        } else {
            console.error('RhythmSyncVisualizer: Container not found:', containerId);
        }
    }

    /**
     * Initialize the visualizer
     */
    init() {
        // Create visualizer structure
        this.createDOM();

        // Set up event listeners
        this.setupEventListeners();

        // Load saved subdivision
        const saved = localStorage.getItem('rhythmSubdivision');
        if (saved) {
            this.setSubdivision(parseFloat(saved));
        }

        // Initially hide the visualizer
        this.hide();
    }

    /**
     * Create DOM structure
     */
    createDOM() {
        this.container.innerHTML = '';
        this.container.className = 'rhythm-sync-visualizer';

        // Create main wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'rhythm-sync-wrapper';

        // Create left double speed button (slow down subdivision)
        const leftDoubleButton = document.createElement('button');
        leftDoubleButton.className = 'rhythm-speed-btn rhythm-speed-double rhythm-speed-left';
        leftDoubleButton.title = 'Slow Down (Subdivision)';
        leftDoubleButton.innerHTML = '<img src="assets/double-chevron.svg" alt="Slow Down" />';

        // Create beat indicators section
        const beatsContainer = document.createElement('div');
        beatsContainer.className = 'rhythm-beats-container';

        // Create beat indicators
        for (let i = 0; i < this.config.numBeats; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'rhythm-beat-indicator';
            indicator.dataset.beatIndex = i;

            // Add subdivision markers
            if (i < this.config.numBeats - 1) {
                const subdiv = document.createElement('div');
                subdiv.className = 'rhythm-subdiv-indicator';
                indicator.appendChild(subdiv);
            }

            beatsContainer.appendChild(indicator);
            this.beatIndicators.push(indicator);
        }

        // Create right double speed button (speed up subdivision)
        const rightDoubleButton = document.createElement('button');
        rightDoubleButton.className = 'rhythm-speed-btn rhythm-speed-double rhythm-speed-right';
        rightDoubleButton.title = 'Speed Up (Subdivision)';
        rightDoubleButton.innerHTML = '<img src="assets/double-chevron.svg" alt="Speed Up" />';

        // Assemble structure with only double buttons
        wrapper.appendChild(leftDoubleButton);
        wrapper.appendChild(beatsContainer);
        wrapper.appendChild(rightDoubleButton);
        this.container.appendChild(wrapper);

        // Store references
        this.beatsContainer = beatsContainer;
        this.leftDoubleButton = leftDoubleButton;
        this.rightDoubleButton = rightDoubleButton;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Double buttons - subdivision control
        this.leftDoubleButton.addEventListener('click', () => {
            this.cycleSubdivision('down');
        });

        this.rightDoubleButton.addEventListener('click', () => {
            this.cycleSubdivision('up');
        });
    }

    /**
     * Connect to mascot for BPM data
     */
    connect(mascot) {
        console.log('RhythmSyncVisualizer: Connecting to mascot', mascot);
        this.mascot = mascot;

        // Always start the update loop for monitoring
        if (!this.animationTimer) {
            console.log('RhythmSyncVisualizer: Starting update loop for monitoring');
            this.update();
        }
    }


    /**
     * Start rhythm sync
     */
    start() {
        console.log('RhythmSyncVisualizer: Starting...');
        if (!this.mascot?.shapeMorpher) {
            console.warn('RhythmSyncVisualizer: No mascot connected');
            return;
        }

        console.log('RhythmSyncVisualizer: Mascot and shapeMorpher found');
        this.state.active = true;

        // Show the visualizer when starting
        this.show();

        // Determine which BPM to use
        let bpmToUse = 120; // Default

        if (this.state.isManualMode && this.state.manualBPM > 0) {
            // Use manual BPM if set
            bpmToUse = this.state.manualBPM;
            console.log('Using manual BPM:', bpmToUse);
        } else if (this.mascot.shapeMorpher.musicDetector?.detectedBPM > 0) {
            // Use detected BPM
            bpmToUse = this.mascot.shapeMorpher.musicDetector.detectedBPM;
            this.state.lockedBPM = bpmToUse;
            console.log('Using detected BPM:', bpmToUse);
        }

        // Only start rhythm engine if not already running
        if (window.rhythmIntegration && !window.rhythmIntegration.isEnabled()) {
            console.log('RhythmSyncVisualizer: Starting rhythm engine with BPM:', bpmToUse);
            window.rhythmIntegration.start(bpmToUse, 'straight');
        } else if (window.rhythmIntegration) {
            console.log('RhythmSyncVisualizer: Rhythm engine already running');
        }

        // Start beat animation
        this.updateBPM(bpmToUse);

        // Start update loop
        this.update();
    }

    /**
     * Stop rhythm sync
     */
    stop() {
        this.state.active = false;

        // Exit manual mode when stopping
        if (this.state.isManualMode) {
            this.state.isManualMode = false;
            this.state.manualBPM = 0;
            console.log('Exiting manual BPM mode');
        }

        // Hide the visualizer when stopping
        this.hide();

        // Stop the rhythm engine
        if (window.rhythmIntegration) {
            console.log('RhythmSyncVisualizer: Stopping rhythm engine');
            window.rhythmIntegration.stop();
        }

        // Clear timers
        if (this.animationTimer) {
            cancelAnimationFrame(this.animationTimer);
            this.animationTimer = null;
        }

        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }

        // Reset indicators
        this.beatIndicators.forEach(indicator => {
            indicator.classList.remove('active', 'pulse');
        });
    }


    /**
     * Update loop
     */
    update() {
        // Get BPM from mascot
        if (this.mascot?.shapeMorpher?.musicDetector) {
            const detector = this.mascot.shapeMorpher.musicDetector;
            const morpher = this.mascot.shapeMorpher;

            // Check if we should auto-start (even when not active yet)
            if (!this.state.active) {
                const hasFrequencyData = morpher.frequencyData && morpher.frequencyData.some(v => v > 0);
                const hasBPM = detector.detectedBPM > 0;
                const tempoLocked = detector.tempoLocked;

                // Only auto-start if tempo is locked and we have valid BPM
                if (tempoLocked && hasFrequencyData && hasBPM) {
                    console.log('RhythmSyncVisualizer: Tempo locked with music activity, auto-starting');

                    // Auto-set subdivision based on BPM
                    if (detector.getRecommendedSubdivision) {
                        const recommendedSub = detector.getRecommendedSubdivision();
                        if (recommendedSub !== this.state.subdivision) {
                            console.log(`Auto-setting subdivision to ${recommendedSub}× based on BPM ${detector.detectedBPM}`);
                            this.setSubdivision(recommendedSub);
                        }
                    }

                    this.start();
                    // Don't return here, let the update loop continue
                }
            }

            // Auto-stop if music stops or tempo is lost
            if (this.state.active) {
                const hasFrequencyData = morpher.frequencyData && morpher.frequencyData.some(v => v > 0);
                const tempoLocked = detector.tempoLocked;

                if (!hasFrequencyData || !tempoLocked) {
                    console.log('RhythmSyncVisualizer: Music stopped or tempo lost, auto-stopping');
                    this.stop();
                    // Don't return here either, let the update loop continue
                }
            }

            // Only continue if active
            if (this.state.active) {
                // If in manual mode, don't update from detector
                if (!this.state.isManualMode) {
                    if (detector.tempoLocked && detector.detectedBPM > 0) {
                        // Update BPM if changed
                        if (Math.abs(detector.detectedBPM - this.state.lockedBPM) > 1) {
                            this.state.lockedBPM = detector.detectedBPM;
                            this.updateBPM(detector.detectedBPM);
                        }
                    } else {
                        // Track current BPM internally
                        this.state.currentBPM = detector.detectedBPM || 0;
                    }
                } else {
                    // In manual mode, just track the detected BPM for reference
                    this.state.currentBPM = detector.detectedBPM || 0;
                }
            }
        }

        // Continue update loop
        this.animationTimer = requestAnimationFrame(() => this.update());
    }

    /**
     * Update BPM and restart beat animation
     */
    updateBPM(bpm) {
        // Clamp BPM to limits
        const clampedBPM = Math.max(this.config.minBPM, Math.min(this.config.maxBPM, bpm));

        // Clear existing interval
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
        }

        // Update rhythm engine BPM if active
        if (window.rhythmIntegration && window.rhythmIntegration.isEnabled()) {
            window.rhythmIntegration.setBPM(clampedBPM);
        }

        // Calculate interval with subdivision
        const baseInterval = 60000 / clampedBPM; // ms per beat
        const interval = baseInterval / this.state.subdivision;

        // Start beat animation
        this.beatInterval = setInterval(() => {
            this.triggerBeat();
        }, interval);

        // Trigger first beat immediately
        this.triggerBeat();
    }

    /**
     * Trigger beat animation
     */
    triggerBeat() {
        const now = performance.now();

        // Prevent double-triggering
        if (now - this.state.lastBeatTime < 50) return;
        this.state.lastBeatTime = now;

        // Get current indicator
        const indicator = this.beatIndicators[this.state.beatIndex];

        // Remove active from all
        this.beatIndicators.forEach(ind => {
            ind.classList.remove('active', 'pulse');
        });

        // Activate current
        indicator.classList.add('active', 'pulse');

        // Notify gesture controller that a beat is active
        if (window.gestureController && window.gestureController.onBeatActive) {
            window.gestureController.onBeatActive();
        }

        // Remove pulse after animation
        setTimeout(() => {
            indicator.classList.remove('pulse');
            // Notify gesture controller that beat is inactive
            if (window.gestureController && window.gestureController.onBeatInactive) {
                window.gestureController.onBeatInactive();
            }
        }, 150);

        // Move to next beat
        this.state.beatIndex = (this.state.beatIndex + 1) % this.config.numBeats;
    }

    /**
     * Cycle through subdivisions
     */
    cycleSubdivision(direction) {
        const currentIndex = this.subdivisionOrder.indexOf(this.state.subdivision);
        let newIndex;

        if (direction === 'up') {
            // Speed up - move to higher subdivision
            newIndex = Math.min(currentIndex + 1, this.subdivisionOrder.length - 1);
        } else {
            // Slow down - move to lower subdivision
            newIndex = Math.max(currentIndex - 1, 0);
        }

        const newSubdivision = this.subdivisionOrder[newIndex];

        // Check if the effective BPM would be within limits
        const effectiveBPM = this.state.lockedBPM * newSubdivision;
        const minEffectiveBPM = this.config.minBPM * 0.5; // Allow going below min with subdivision
        const maxEffectiveBPM = this.config.maxBPM * 2; // Allow going above max with subdivision

        if (effectiveBPM >= minEffectiveBPM && effectiveBPM <= maxEffectiveBPM) {
            this.setSubdivision(newSubdivision);
        } else {
            console.log(`RhythmSyncVisualizer: Cannot change to ${newSubdivision}x - would result in ${effectiveBPM} BPM (limits: ${minEffectiveBPM}-${maxEffectiveBPM})`);
        }
    }

    /**
     * Set subdivision
     */
    setSubdivision(value) {
        if (!this.subdivisions[value]) return;

        this.state.subdivision = value;

        // Save preference
        localStorage.setItem('rhythmSubdivision', value);

        // Update beat interval if active
        if (this.state.active && this.state.lockedBPM > 0) {
            this.updateBPM(this.state.lockedBPM);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Show the visualizer
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            // Trigger reflow to ensure animation plays
            this.container.offsetHeight;
            this.container.classList.add('visible');
        }
    }

    /**
     * Hide the visualizer
     */
    hide() {
        if (this.container) {
            this.container.classList.remove('visible');
            // Hide completely after animation
            setTimeout(() => {
                if (!this.state.active) {
                    this.container.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        this.stop();
        this.container.innerHTML = '';
        this.beatIndicators = [];
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.RhythmSyncVisualizer = RhythmSyncVisualizer;
}