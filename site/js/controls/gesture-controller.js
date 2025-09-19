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
 * GestureController - Manages gesture button interactions
 * Handles gesture triggering with rhythm integration
 */
class GestureController {
    constructor(options = {}) {
        // Logger
        this.logger = window.loggerFactory ?
            window.loggerFactory.getLogger('GestureController') :
            console;

        // Configuration
        this.config = {
            // Selectors
            gestureButtonSelector: options.gestureButtonSelector || '.gesture-btn',

            // Classes
            pendingClass: options.pendingClass || 'gesture-pending',
            triggeredClass: options.triggeredClass || 'gesture-triggered',
            queuedClass: options.queuedClass || 'gesture-queued',

            // Animation timing
            triggeredDuration: options.triggeredDuration || 200,

            // Queue settings
            maxQueueSize: options.maxQueueSize || 4,
            requireBeatSync: options.requireBeatSync !== false,

            // Special gestures that need custom handling
            specialGestures: {
                morph: 'shapeMorph',
                ...options.specialGestures
            },

            ...options
        };

        // References
        this.mascot = null;
        this.app = null;
        this.gestureScheduler = null;
        this.shapeMorphController = null;
        this.rhythmSyncVisualizer = null;

        // State
        this.state = {
            pendingGestures: new Set(),
            lastGesture: null,
            lastBeatNumber: 0,  // Track which beat we last executed on
            currentBeatActive: false,
            currentBeatNumber: 0,
            currentSubdivision: 0,  // 0, 0.25, 0.5, 0.75 for quarter notes
            beatSyncEnabled: false,
            currentBPM: 120,
            fillsEnabled: true,
            intensity: 'moderate',  // sparse, moderate, dense, chaos
            baseMovementActive: false,  // Track if base movement is running
            currentBaseMovement: null  // Current base movement gesture
        };

        // Button elements
        this.gestureButtons = [];

        // Callbacks
        this.onGestureTriggered = options.onGestureTriggered || null;
        this.onGestureQueued = options.onGestureQueued || null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;
        this.gestureScheduler = window.gestureScheduler;
        this.shapeMorphController = window.shapeMorphController || app?.shapeMorphController;

        // Get groove templates if available
        this.grooveTemplates = this.mascot?.grooveTemplates || window.grooveTemplates;

        // Get gesture buttons
        this.gestureButtons = Array.from(
            document.querySelectorAll(this.config.gestureButtonSelector)
        );

        // Set up event listeners
        this.setupEventListeners();

        // Set up gesture scheduler callbacks if available
        this.setupSchedulerCallbacks();

        return this;
    }

    /**
     * Set up event listeners for gesture buttons
     */
    setupEventListeners() {
        this.gestureButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gestureName = btn.dataset.gesture;
                if (gestureName) {
                    this.triggerGesture(gestureName, btn);
                }
            });
        });
    }

    /**
     * Set up gesture scheduler callbacks
     */
    setupSchedulerCallbacks() {
        // Try to get gesture scheduler if not already set
        if (!this.gestureScheduler) {
            this.gestureScheduler = window.gestureScheduler;
        }

        if (!this.gestureScheduler) return;

        // Store original callbacks if they exist
        const originalQueued = this.gestureScheduler.onGestureQueued;
        const originalTriggered = this.gestureScheduler.onGestureTriggered;

        // Set up our callbacks
        this.gestureScheduler.onGestureQueued = (item) => {
            this.handleGestureQueued(item);
            // Call original if it exists
            if (originalQueued) {
                originalQueued(item);
            }
        };

        this.gestureScheduler.onGestureTriggered = (item) => {
            this.handleGestureTriggered(item);
            // Call original if it exists
            if (originalTriggered) {
                originalTriggered(item);
            }
        };
    }

    /**
     * Trigger a gesture
     */
    triggerGesture(gestureName, buttonElement = null) {
        // Check for special gesture handling
        if (this.handleSpecialGesture(gestureName)) {
            return;
        }

        // Check if rhythm sync is active
        const rhythmActive = this.isRhythmSyncActive();

        this.logger.debug('Gesture triggered', {
            gesture: gestureName,
            rhythmActive,
            requireBeatSync: this.config.requireBeatSync,
            currentBeat: this.state.currentBeatNumber,
            lastBeat: this.state.lastBeatNumber
        });

        // In rhythm game mode, gestures fire immediately on player input
        // No queuing - direct response for better gameplay feel
        if (this.mascot) {
            this.logger.debug(`Executing gesture: ${gestureName} (rhythm: ${rhythmActive})`);
            this.mascot.express(gestureName);

            // Add visual feedback for rhythm mode
            if (rhythmActive && buttonElement) {
                buttonElement.classList.add(this.config.triggeredClass);
                setTimeout(() => {
                    buttonElement.classList.remove(this.config.triggeredClass);
                }, this.config.triggerDuration);
            } else {
                this.logger.error('Mascot not available for gesture:', gestureName);
            }
        }

        // Update state
        this.state.lastGesture = gestureName;

        // Trigger callback
        if (this.onGestureTriggered) {
            this.onGestureTriggered(gestureName);
        }
    }


    /**
     * REMOVED - No queue processing in rhythm game mode
     */
    processGestureQueue() {
        // No-op - no queue processing in rhythm game mode
    }

    /**
     * Check if rhythm sync is active
     */
    isRhythmSyncActive() {
        // Check if rhythm sync visualizer exists and is active
        if (window.rhythmSyncVisualizer) {
            const state = window.rhythmSyncVisualizer.getState?.();
            const isActive = state?.active && state?.lockedBPM > 0;

            this.logger.debug('Rhythm sync check', {
                hasVisualizer: true,
                state: state,
                isActive: isActive
            });

            return isActive;
        }

        this.logger.debug('Rhythm sync check - no visualizer');
        return false;
    }

    /**
     * Handle beat event from rhythm sync
     */
    onBeatActive() {
        this.state.currentBeatActive = true;
        this.state.currentBeatNumber++;
        this.state.currentSubdivision = 0; // Reset to downbeat

        // Start base movement on first beat or when groove changes
        if (this.grooveTemplates?.currentGroove && !this.state.baseMovementActive) {
            this.updateBaseMovement();
        }

        // Process main beat gestures
        this.processSubdivisionBeat(0);

        // Skip fill patterns when base movement is active - it's already providing continuous motion
        if (this.state.fillsEnabled && this.mascot?.gestureCompatibility && !this.state.baseMovementActive) {
            this.scheduleFillPatterns();
        }
    }

    /**
     * Update the base movement layer for current groove
     */
    updateBaseMovement() {
        const baseMovement = this.grooveTemplates.getBaseMovement();

        // Only start if it's a different movement or not active
        if (baseMovement && baseMovement !== this.state.currentBaseMovement) {
            const intensity = this.state.intensity === 'sparse' ? 0.5 :
                            this.state.intensity === 'moderate' ? 0.7 :
                            this.state.intensity === 'dense' ? 0.9 : 1.0;

            // Actually start the ambient animation through the mascot
            if (this.mascot && this.mascot.express) {
                this.logger.info(`Starting base movement: ${baseMovement} with intensity ${intensity}`);
                this.mascot.express(baseMovement, { intensity, fromGroove: true });

                // Update state
                this.state.baseMovementActive = true;
                this.state.currentBaseMovement = baseMovement;
            }

            // Also set it in the blender if available
            if (this.mascot?.gestureBlender) {
                this.mascot.gestureBlender.setBaseLayer(baseMovement, { intensity });
            }
        }
    }

    /**
     * Handle subdivision beat (called for quarter notes)
     * @param {number} subdivision - 0, 0.25, 0.5, 0.75
     */
    onSubdivisionBeat(subdivision) {
        this.state.currentSubdivision = subdivision;
        this.processSubdivisionBeat(subdivision);
    }

    /**
     * Process gestures for a specific subdivision
     */
    processSubdivisionBeat(subdivision) {
        // When base movement is active, we still want to process accent gestures
        if (this.state.baseMovementActive && this.grooveTemplates?.currentGroove) {
            const layeredConfig = this.grooveTemplates.getLayeredGestures(
                this.state.currentBeatNumber,
                subdivision
            );

            if (layeredConfig) {
                // Handle composite move
                if (layeredConfig.composite && subdivision === 0) {
                    this.logger.info(`Triggering composite move: ${layeredConfig.composite}`);
                    // For now, skip composites since they're not implemented yet
                    // this.executeComposite(layeredConfig.composite);
                }

                // Handle accent gesture - but be VERY selective
                // Only fire automatic accents occasionally for variety
                if (layeredConfig.accent && layeredConfig.velocity > 0.7) {
                    const emphasis = this.grooveTemplates.getEmphasis(
                        this.grooveTemplates.currentGroove,
                        this.state.currentBeatNumber,
                        subdivision
                    );

                    // Only fire accents very rarely - like every 16 beats on strong emphasis
                    // This adds occasional punctuation without being too busy
                    const shouldFireAccent = emphasis > 0.9 &&
                                            subdivision === 0 &&
                                            this.state.currentBeatNumber % 16 === 0 &&
                                            Math.random() > 0.5; // 50% chance even then

                    if (shouldFireAccent) {
                        this.logger.debug(`Firing rare accent: ${layeredConfig.accent} on beat ${this.state.currentBeatNumber}`);

                        // Use a subtle effect gesture instead of big movements
                        const subtleAccents = ['pulse', 'glow', 'sparkle', 'shimmer'];
                        const accentGesture = subtleAccents.includes(layeredConfig.accent) ?
                                            layeredConfig.accent : 'pulse';

                        // Schedule the accent gesture
                        if (!this.state.scheduledGestures[subdivision]) {
                            this.state.scheduledGestures[subdivision] = [];
                        }
                        this.state.scheduledGestures[subdivision].push({
                            gesture: accentGesture,
                            velocity: layeredConfig.velocity * 0.5 // Reduce intensity
                        });
                    }
                }
            }
        }

        // Check for scheduled gestures at this subdivision
        const scheduledGestures = this.state.scheduledGestures[subdivision] || [];

        if (scheduledGestures.length > 0) {
            // Execute scheduled gestures as a chord if multiple
            const gestures = scheduledGestures.map(g =>
                typeof g === 'object' ? g.gesture : g
            );

            if (gestures.length === 1) {
                this.executeGesture(gestures[0], scheduledGestures[0].velocity);
            } else {
                this.executeChord(gestures);
            }

            // Clear executed gestures
            this.state.scheduledGestures[subdivision] = [];
        }

        // Process main queue on downbeat (0) or based on intensity
        // This handles user-triggered gestures from the UI
        if (subdivision === 0) {
            this.processMainQueue();
        } else if (this.shouldProcessOnSubdivision(subdivision)) {
            this.processMainQueue();
        }
    }

    /**
     * Determine if we should process queue on this subdivision based on intensity
     */
    shouldProcessOnSubdivision(subdivision) {
        switch (this.state.intensity) {
            case 'sparse':
                return false; // Only downbeats
            case 'moderate':
                return subdivision === 0.5; // Downbeats and offbeats
            case 'dense':
                return subdivision === 0.5 || subdivision === 0.25 || subdivision === 0.75; // All subdivisions
            case 'chaos':
                return true; // Every subdivision
            default:
                return subdivision === 0.5;
        }
    }

    /**
     * Process the main gesture queue
     */
    processMainQueue() {
        // Calculate if we should process a gesture this beat
        const beatsSinceLastGesture = this.state.currentBeatNumber - this.state.lastBeatNumber;
        const shouldProcessThisBeat = beatsSinceLastGesture >= this.state.beatsPerGesture;

        this.logger.debug('Processing main queue', {
            beatNumber: this.state.currentBeatNumber,
            subdivision: this.state.currentSubdivision,
            lastBeatNumber: this.state.lastBeatNumber,
            beatsSinceLastGesture,
            shouldProcessThisBeat,
            queueLength: this.state.gestureQueue.length
        });

        // Only process if enough beats have passed and we have gestures waiting
        if (shouldProcessThisBeat &&
            this.state.gestureQueue.length > 0 &&
            !this.state.isProcessingQueue) {

            this.logger.debug('Processing gesture from queue', {
                beat: this.state.currentBeatNumber,
                subdivision: this.state.currentSubdivision
            });

            this.processGestureQueue();
            this.state.lastBeatNumber = this.state.currentBeatNumber;
        }
    }

    /**
     * Handle beat inactive event
     */
    onBeatInactive() {
        this.state.currentBeatActive = false;
    }

    /**
     * Handle special gestures that need custom logic
     */
    handleSpecialGesture(gestureName) {
        const specialHandler = this.config.specialGestures[gestureName];

        if (!specialHandler) {
            return false;
        }

        switch (specialHandler) {
            case 'shapeMorph':
                // Delegate to shape morph controller
                if (this.shapeMorphController) {
                    this.shapeMorphController.morphCoreToRandomShape();
                }
                return true;

            default:
                // Check if it's a custom handler function
                if (typeof specialHandler === 'function') {
                    specialHandler(gestureName, this.mascot);
                    return true;
                }
                return false;
        }
    }

    /**
     * REMOVED - No queue visual feedback in rhythm game mode
     */
    handleGestureQueued(item) {
        // No-op - no queuing in rhythm game mode
    }

    /**
     * Handle gesture triggered visual feedback
     */
    handleGestureTriggered(item) {
        const btn = this.findButtonByGesture(item.gestureName);
        if (btn) {
            // Remove pending state
            btn.classList.remove(this.config.pendingClass);
            this.state.pendingGestures.delete(item.gestureName);

            // Add triggered animation
            btn.classList.add(this.config.triggeredClass);

            // Remove triggered class after animation
            setTimeout(() => {
                btn.classList.remove(this.config.triggeredClass);
            }, this.config.triggeredDuration);
        }
    }

    /**
     * Find button element by gesture name
     */
    findButtonByGesture(gestureName) {
        return this.gestureButtons.find(btn =>
            btn.dataset.gesture === gestureName
        );
    }

    /**
     * Get all available gestures
     */
    getAvailableGestures() {
        return this.gestureButtons.map(btn => btn.dataset.gesture).filter(Boolean);
    }

    /**
     * Check if a gesture is pending
     */
    isGesturePending(gestureName) {
        return this.state.pendingGestures.has(gestureName);
    }

    /**
     * Clear all pending gestures
     */
    clearPendingGestures() {
        this.state.pendingGestures.forEach(gestureName => {
            const btn = this.findButtonByGesture(gestureName);
            if (btn) {
                btn.classList.remove(this.config.pendingClass);
            }
        });
        this.state.pendingGestures.clear();
    }

    /**
     * Add a special gesture handler
     */
    addSpecialGesture(gestureName, handler) {
        this.config.specialGestures[gestureName] = handler;
    }

    /**
     * Set gesture scheduler reference
     */
    setGestureScheduler(scheduler) {
        this.gestureScheduler = scheduler;
        this.setupSchedulerCallbacks();
    }

    /**
     * Set shape morph controller reference
     */
    setShapeMorphController(controller) {
        this.shapeMorphController = controller;
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set rhythm sync visualizer reference
     */
    setRhythmSyncVisualizer(visualizer) {
        this.rhythmSyncVisualizer = visualizer;
    }

    /**
     * Set beats per gesture (musical subdivision)
     * @param {number} beats - Number of beats between gestures (1 = every beat, 2 = every other beat, etc.)
     */
    setBeatsPerGesture(beats) {
        this.state.beatsPerGesture = Math.max(1, Math.floor(beats));
        this.logger.debug(`Beats per gesture set to ${this.state.beatsPerGesture}`);
    }

    /**
     * Adapt to BPM - automatically adjust gesture frequency based on tempo
     * @param {number} bpm - Current BPM
     */
    adaptToBPM(bpm) {
        this.state.currentBPM = bpm;

        // Adjust gesture frequency
        if (bpm < 60) {
            // Very slow - gesture every beat
            this.setBeatsPerGesture(1);
            this.setIntensity('dense'); // More activity to fill the space
        } else if (bpm < 90) {
            // Slow to medium - gesture every beat
            this.setBeatsPerGesture(1);
            this.setIntensity('moderate');
        } else if (bpm < 140) {
            // Medium to fast - gesture every other beat
            this.setBeatsPerGesture(2);
            this.setIntensity('moderate');
        } else {
            // Very fast - gesture every 4 beats
            this.setBeatsPerGesture(4);
            this.setIntensity('sparse'); // Less activity to avoid chaos
        }
    }

    /**
     * Schedule fill patterns based on current context
     */
    scheduleFillPatterns() {
        if (!this.mascot?.gestureCompatibility) return;

        const compatibility = this.mascot.gestureCompatibility;
        const fillPattern = compatibility.getFillPattern(
            this.state.currentBPM,
            this.state.intensity
        );

        if (!fillPattern) return;

        // Schedule fills at appropriate subdivisions
        fillPattern.forEach(fillGesture => {
            const timing = compatibility.getGestureTiming(fillGesture);
            if (timing && timing !== 0) {
                // Add to scheduled gestures for this subdivision
                if (!this.state.scheduledGestures[timing]) {
                    this.state.scheduledGestures[timing] = [];
                }
                this.state.scheduledGestures[timing].push(fillGesture);
            }
        });
    }

    /**
     * Execute a single gesture
     * @param {string} gestureName - Name of the gesture
     * @param {number} velocity - Velocity/intensity (0-1)
     */
    executeGesture(gestureName, velocity = 1.0) {
        if (this.mascot) {
            this.logger.debug(`Executing gesture: ${gestureName} at subdivision ${this.state.currentSubdivision} with velocity ${velocity}`);

            // Pass velocity as options if the mascot supports it
            if (velocity !== 1.0) {
                this.mascot.express(gestureName, { velocity, intensity: velocity });
            } else {
                this.mascot.express(gestureName);
            }
        }
    }

    /**
     * Execute multiple gestures as a chord
     */
    executeChord(gestures) {
        if (this.mascot && this.mascot.expressChord) {
            this.logger.debug(`Executing chord: ${gestures.join('+')} at subdivision ${this.state.currentSubdivision}`);
            this.mascot.expressChord(gestures);
        } else if (this.mascot) {
            // Fallback to sequential if chord not supported
            gestures.forEach(g => this.executeGesture(g));
        }
    }

    /**
     * Set the gesture intensity level
     */
    setIntensity(level) {
        const validLevels = ['sparse', 'moderate', 'dense', 'chaos'];
        if (validLevels.includes(level)) {
            this.state.intensity = level;
            this.logger.debug(`Intensity set to ${level}`);
        }
    }

    /**
     * Schedule a gesture for a specific subdivision
     */
    scheduleGesture(gestureName, subdivision) {
        if (!this.state.scheduledGestures[subdivision]) {
            this.state.scheduledGestures[subdivision] = [];
        }
        this.state.scheduledGestures[subdivision].push(gestureName);
        this.logger.debug(`Scheduled ${gestureName} for subdivision ${subdivision}`);
    }

    /**
     * Set the active groove template
     * @param {string} grooveName - Name of the groove (straight, swing, latin, etc.)
     * @param {string} transitionMode - How to transition (instant, nextBar, nextPhrase)
     */
    setGroove(grooveName, transitionMode = 'nextBar') {
        if (!this.grooveTemplates) {
            this.logger.warn('Groove templates not available');
            return false;
        }

        const success = this.grooveTemplates.setGroove(grooveName, transitionMode);
        if (success) {
            this.logger.info(`Groove set to ${grooveName} with ${transitionMode} transition`);

            // Reset base movement state so it starts fresh
            this.state.baseMovementActive = false;
            this.state.currentBaseMovement = null;

            // Update intensity based on groove
            const groove = this.grooveTemplates.getTemplate(grooveName);
            if (groove && groove.intensity) {
                this.setIntensity(groove.intensity);
            }

            // If rhythm is active, start the base movement immediately
            if (this.isRhythmSyncActive()) {
                this.updateBaseMovement();
            }
        }
        return success;
    }

    /**
     * Get available groove names
     */
    getAvailableGrooves() {
        return this.grooveTemplates ? this.grooveTemplates.getGrooveNames() : [];
    }

    /**
     * REMOVED - No queue to clear in rhythm game mode
     */
    clearGestureQueue() {
        // No-op - no queue in rhythm game mode
    }

    /**
     * Clean up
     */
    destroy() {
        this.clearPendingGestures();
        this.clearGestureQueue();
    }
}

// Export class for ES6 modules
export { GestureController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.