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
 * RhythmSyncVisualizer - Visual rhythm sync display with BPM subdivision
 * Modular component that integrates with existing BPM detection
 */

// Import constants if available
const CONSTANTS = window.APP_CONSTANTS || {};
const BPM_CONSTANTS = CONSTANTS.BPM || {
    MIN: 40,
    MAX: 300,
    SUBDIVISION_HALF: 0.5,
    SUBDIVISION_NORMAL: 1.0,
    SUBDIVISION_DOUBLE: 2.0
};
const TIMING_CONSTANTS = CONSTANTS.TIMING || {
    BEAT_PULSE_DURATION: 150,
    BEAT_PREVENTION_THRESHOLD: 50,
    RHYTHM_FADE_TRANSITION: 300
};

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
        this.mascot = options.mascot || null;
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
        // Clear previous indicators
        this.beatIndicators = [];

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
        console.log('RhythmSyncVisualizer: Starting...', {
            mascot: !!this.mascot,
            shapeMorpher: !!this.mascot?.shapeMorpher,
            musicDetector: !!this.mascot?.shapeMorpher?.musicDetector
        });
        if (!this.mascot?.shapeMorpher) {
            console.warn('RhythmSyncVisualizer: No mascot connected');
            return;
        }

        console.log('RhythmSyncVisualizer: Mascot and shapeMorpher found');
        this.state.active = true;

        // Show the visualizer when starting
        this.show();

        // Show groove selector if it exists
        const grooveSelector = document.getElementById('groove-selector-container');
        if (grooveSelector) {
            grooveSelector.style.display = 'block';
            this.setupGrooveSelector();
        }

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
        console.log('RhythmSyncVisualizer: Starting beat animation with BPM:', bpmToUse, 'Indicators:', this.beatIndicators.length);
        this.updateBPM(bpmToUse);

        // Start update loop
        this.update();
    }

    /**
     * Stop rhythm sync
     */
    stop() {
        this.state.active = false;

        // Clear beat animation intervals
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }
        if (this.subdivisionInterval) {
            clearInterval(this.subdivisionInterval);
            this.subdivisionInterval = null;
        }

        // Cancel animation frame
        if (this.animationTimer) {
            cancelAnimationFrame(this.animationTimer);
            this.animationTimer = null;
        }

        // Remove active states from all indicators immediately
        this.beatIndicators.forEach(ind => {
            ind.classList.remove('active', 'pulse');
        });

        // Exit manual mode when stopping
        if (this.state.isManualMode) {
            this.state.isManualMode = false;
            this.state.manualBPM = 0;
            console.log('Exiting manual BPM mode');
        }

        // Hide the visualizer when stopping
        this.hide();

        // Hide groove selector
        const grooveSelector = document.getElementById('groove-selector-container');
        if (grooveSelector) {
            grooveSelector.style.display = 'none';
        }

        // Stop the rhythm engine
        if (window.rhythmIntegration) {
            console.log('RhythmSyncVisualizer: Stopping rhythm engine');
            window.rhythmIntegration.stop();
        }

        // Reset gesture controller's beat tracking
        if (window.gestureController) {
            // Reset beat counters when rhythm stops
            if (window.gestureController.state) {
                window.gestureController.state.currentBeatNumber = 0;
                window.gestureController.state.lastBeatNumber = 0;
            }
            // Clear any queued gestures
            if (window.gestureController.clearGestureQueue) {
                window.gestureController.clearGestureQueue();
            }
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

        if (this.subdivisionInterval) {
            clearInterval(this.subdivisionInterval);
            this.subdivisionInterval = null;
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

            // Auto-stop only if music actually stops (not just because tempo isn't locked yet)
            if (this.state.active) {
                const hasFrequencyData = morpher.frequencyData && morpher.frequencyData.some(v => v > 0);

                // Only stop if there's no audio data at all
                // Don't stop just because tempo isn't locked - it needs time to detect
                if (!hasFrequencyData) {
                    // Add a grace period before stopping
                    if (!this._noDataCounter) this._noDataCounter = 0;
                    this._noDataCounter++;

                    // Only stop after 60 frames (~1 second) of no data
                    if (this._noDataCounter > 60) {
                        console.log('RhythmSyncVisualizer: No audio data detected, auto-stopping');
                        this.stop();
                        this._noDataCounter = 0;
                    }
                } else {
                    // Reset counter when we have data
                    this._noDataCounter = 0;
                }
            }

            // Only continue if active
            if (this.state.active) {
                // If in manual mode, don't update from detector
                if (!this.state.isManualMode) {
                    if (detector.tempoLocked && detector.detectedBPM > 0) {
                        // Update BPM if changed
                        if (Math.abs(detector.detectedBPM - this.state.lockedBPM) > 1) {
                            console.log('RhythmSyncVisualizer: Updating BPM to', detector.detectedBPM);
                            this.state.lockedBPM = detector.detectedBPM;
                            this.updateBPM(detector.detectedBPM);
                        }
                    } else {
                        // Track current BPM internally
                        this.state.currentBPM = detector.detectedBPM || 0;
                        // Log BPM detection status periodically
                        if (!this._bpmLogCounter) this._bpmLogCounter = 0;
                        this._bpmLogCounter++;
                        if (this._bpmLogCounter % 60 === 0) {
                            console.log('RhythmSyncVisualizer: BPM detection status - locked:', detector.tempoLocked, 'BPM:', detector.detectedBPM);
                        }
                    }
                } else {
                    // In manual mode, just track the detected BPM for reference
                    this.state.currentBPM = detector.detectedBPM || 0;
                }
            }
        }

        // Continue update loop only if still active
        if (this.state.active) {
            this.animationTimer = requestAnimationFrame(() => this.update());
        }
    }

    /**
     * Update BPM and restart beat animation
     */
    updateBPM(bpm) {
        // Clamp BPM to limits
        const clampedBPM = Math.max(this.config.minBPM, Math.min(this.config.maxBPM, bpm));

        // Clear existing intervals
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
        }
        if (this.subdivisionInterval) {
            clearInterval(this.subdivisionInterval);
        }

        // Update rhythm engine BPM if active
        if (window.rhythmIntegration && window.rhythmIntegration.isEnabled()) {
            window.rhythmIntegration.setBPM(clampedBPM);
        }

        // Notify gesture controller of BPM change for musical timing
        if (window.gestureController && window.gestureController.adaptToBPM) {
            window.gestureController.adaptToBPM(clampedBPM);
        }

        // Calculate intervals
        const baseInterval = 60000 / clampedBPM; // ms per beat
        const visualInterval = baseInterval / this.state.subdivision; // Visual beat interval
        const subdivisionInterval = baseInterval / 4; // Quarter note subdivisions

        console.log('RhythmSyncVisualizer: Setting beat interval:', visualInterval, 'ms (BPM:', clampedBPM, ', subdivision:', this.state.subdivision, ')');

        // Start visual beat animation
        this.beatInterval = setInterval(() => {
            this.triggerBeat();
        }, visualInterval);

        // Start subdivision callbacks for gesture timing
        if (window.gestureController && window.gestureController.onSubdivisionBeat) {
            let subdivisionCounter = 0;
            this.subdivisionInterval = setInterval(() => {
                subdivisionCounter = (subdivisionCounter + 1) % 4;
                const subdivision = subdivisionCounter * 0.25;

                // Skip the downbeat (0) as it's handled by onBeatActive
                if (subdivision > 0) {
                    window.gestureController.onSubdivisionBeat(subdivision);
                }
            }, subdivisionInterval);
        }

        // Trigger first beat immediately
        this.triggerBeat();
    }

    /**
     * Trigger beat animation
     */
    triggerBeat() {
        const now = performance.now();

        // Prevent double-triggering: if two beats occur within 50ms,
        // they're likely the same beat detected twice (bounce/echo effect)
        if (now - this.state.lastBeatTime < TIMING_CONSTANTS.BEAT_PREVENTION_THRESHOLD) return;
        this.state.lastBeatTime = now;

        // Check if indicators exist
        if (!this.beatIndicators || this.beatIndicators.length === 0) {
            console.warn('RhythmSyncVisualizer: No beat indicators found');
            return;
        }

        // Get current indicator
        const indicator = this.beatIndicators[this.state.beatIndex];
        if (!indicator) {
            console.warn('RhythmSyncVisualizer: No indicator at index', this.state.beatIndex);
            return;
        }

        // Remove active from all
        this.beatIndicators.forEach(ind => {
            ind.classList.remove('active', 'pulse');
        });

        // Activate current
        indicator.classList.add('active', 'pulse');

        // Notify gesture controller that a beat is active
        // Delay slightly to align with visual feedback
        if (window.gestureController && window.gestureController.onBeatActive) {
            // Execute gesture at the peak of the pulse animation
            // This creates better visual synchronization
            setTimeout(() => {
                window.gestureController.onBeatActive();
            }, 50); // Trigger gesture 50ms into the beat for visual alignment
        }

        // Remove pulse after animation
        setTimeout(() => {
            indicator.classList.remove('pulse');
            // Notify gesture controller that beat is inactive
            if (window.gestureController && window.gestureController.onBeatInactive) {
                window.gestureController.onBeatInactive();
            }
        }, TIMING_CONSTANTS.BEAT_PULSE_DURATION);

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
            // Wait for CSS transition to complete before hiding element
            setTimeout(() => {
                if (!this.state.active) {
                    this.container.style.display = 'none';
                }
            }, TIMING_CONSTANTS.RHYTHM_FADE_TRANSITION);
        }
    }

    /**
     * Set up groove selector UI
     */
    setupGrooveSelector() {
        const selector = document.getElementById('groove-select');
        if (!selector || this.grooveSelectorSetup) return;

        this.grooveSelectorSetup = true;

        // Set default groove on gesture controller
        if (window.gestureController?.setGroove) {
            window.gestureController.setGroove('straight', 'instant');
        }

        // Handle groove selection changes
        selector.addEventListener('change', (e) => {
            const groove = e.target.value;
            console.log('RhythmSyncVisualizer: Changing groove to', groove);

            if (window.gestureController?.setGroove) {
                window.gestureController.setGroove(groove);

                // Visual feedback
                selector.classList.add('groove-changing');
                setTimeout(() => {
                    selector.classList.remove('groove-changing');
                }, 300);
            }
        });
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        this.stop();
        this.container.innerHTML = '';
        this.beatIndicators = [];
        this.grooveSelectorSetup = false;
    }
}

// Export as ES6 module
// ES6 Module Export
export { RhythmSyncVisualizer };
export default RhythmSyncVisualizer;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.