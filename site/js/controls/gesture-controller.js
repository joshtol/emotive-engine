/**
 * GestureController - Manages gesture button interactions
 * Handles gesture triggering with rhythm integration
 */
class GestureController {
    constructor(options = {}) {
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
            gestureQueue: [],
            isProcessingQueue: false,
            currentBeatActive: false
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

        // Check if rhythm sync is active and we need beat sync
        if (this.isRhythmSyncActive() && this.config.requireBeatSync) {
            // Queue the gesture instead of immediate execution
            this.queueGesture(gestureName, buttonElement);
        } else if (window.rhythmActive && this.gestureScheduler) {
            // Legacy rhythm scheduler
            this.gestureScheduler.requestGesture(gestureName);
        } else {
            // Direct gesture execution
            if (this.mascot) {
                this.mascot.express(gestureName);
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
     * Queue a gesture for beat-synced execution
     */
    queueGesture(gestureName, buttonElement) {
        // Check queue size
        if (this.state.gestureQueue.length >= this.config.maxQueueSize) {
            console.log(`Gesture queue full (max ${this.config.maxQueueSize})`);
            return;
        }

        // Check if gesture is already queued
        const existingIndex = this.state.gestureQueue.findIndex(item => item.gestureName === gestureName);
        if (existingIndex !== -1) {
            console.log(`Gesture ${gestureName} already queued`);
            return;
        }

        // Add to queue
        const queueItem = {
            gestureName,
            buttonElement,
            timestamp: Date.now()
        };

        this.state.gestureQueue.push(queueItem);

        // Add visual feedback
        if (buttonElement) {
            buttonElement.classList.add(this.config.queuedClass);
            // Add queue position indicator
            const queuePosition = this.state.gestureQueue.length;
            buttonElement.dataset.queuePosition = queuePosition;
        }

        console.log(`Queued gesture: ${gestureName} (position ${this.state.gestureQueue.length})`);
    }

    /**
     * Process queued gestures on beat
     */
    processGestureQueue() {
        if (this.state.gestureQueue.length === 0 || this.state.isProcessingQueue) {
            return;
        }

        this.state.isProcessingQueue = true;

        // Get next gesture from queue
        const queueItem = this.state.gestureQueue.shift();
        const { gestureName, buttonElement } = queueItem;

        // Remove queued visual state
        if (buttonElement) {
            buttonElement.classList.remove(this.config.queuedClass);
            delete buttonElement.dataset.queuePosition;

            // Add triggered animation
            buttonElement.classList.add(this.config.triggeredClass);
            setTimeout(() => {
                buttonElement.classList.remove(this.config.triggeredClass);
            }, this.config.triggeredDuration);
        }

        // Update queue positions for remaining items
        this.updateQueuePositions();

        // Execute the gesture
        if (this.mascot) {
            this.mascot.express(gestureName);
        }

        this.state.isProcessingQueue = false;
    }

    /**
     * Update visual queue positions after dequeue
     */
    updateQueuePositions() {
        this.state.gestureQueue.forEach((item, index) => {
            if (item.buttonElement) {
                item.buttonElement.dataset.queuePosition = index + 1;
            }
        });
    }

    /**
     * Check if rhythm sync is active
     */
    isRhythmSyncActive() {
        return this.rhythmSyncVisualizer?.state?.active || false;
    }

    /**
     * Handle beat event from rhythm sync
     */
    onBeatActive() {
        this.state.currentBeatActive = true;
        this.processGestureQueue();
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
     * Handle gesture queued visual feedback
     */
    handleGestureQueued(item) {
        const btn = this.findButtonByGesture(item.gestureName);
        if (btn) {
            btn.classList.add(this.config.pendingClass);
            this.state.pendingGestures.add(item.gestureName);
        }

        // Trigger callback
        if (this.onGestureQueued) {
            this.onGestureQueued(item);
        }
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
     * Clear gesture queue
     */
    clearGestureQueue() {
        this.state.gestureQueue.forEach(item => {
            if (item.buttonElement) {
                item.buttonElement.classList.remove(this.config.queuedClass);
                delete item.buttonElement.dataset.queuePosition;
            }
        });
        this.state.gestureQueue = [];
    }

    /**
     * Clean up
     */
    destroy() {
        this.clearPendingGestures();
        this.clearGestureQueue();
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.GestureController = GestureController;
}