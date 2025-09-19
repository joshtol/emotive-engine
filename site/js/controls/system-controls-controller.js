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
 * SystemControlsController - Manages system control toggles
 * Handles FPS display, blinking, gaze tracking, and other system toggles
 */
class SystemControlsController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Toggle IDs
            fpsToggleId: options.fpsToggleId || 'fps-toggle',
            blinkingToggleId: options.blinkingToggleId || 'blinking-toggle',
            gazeToggleId: options.gazeToggleId || 'gaze-toggle',
            recordToggleId: options.recordToggleId || 'record-btn',

            // Display IDs
            fpsDisplayId: options.fpsDisplayId || 'fps-display',

            // Classes
            activeClass: options.activeClass || 'active',
            recordingClass: options.recordingClass || 'recording',

            // Default states
            defaultStates: {
                fps: false,
                blinking: true,
                gaze: false,
                recording: false,
                ...options.defaultStates
            },

            ...options
        };

        // State
        this.state = {
            showingFPS: this.config.defaultStates.fps,
            blinkingEnabled: this.config.defaultStates.blinking,
            gazeTrackingEnabled: this.config.defaultStates.gaze,
            isRecording: this.config.defaultStates.recording
        };

        // References
        this.mascot = null;
        this.app = null;
        this.displayManager = null;

        // Toggle elements
        this.toggles = {};
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;
        this.displayManager = app?.displayManager || window.app?.displayManager;

        // Get toggle elements
        this.toggles.fps = document.getElementById(this.config.fpsToggleId);
        this.toggles.blinking = document.getElementById(this.config.blinkingToggleId);
        this.toggles.gaze = document.getElementById(this.config.gazeToggleId);
        this.toggles.record = document.getElementById(this.config.recordToggleId);

        // PROTECT RECORD BUTTON from rhythm modifications
        if (this.toggles.record) {
            const originalContent = this.toggles.record.textContent;

            // Monitor and prevent changes
            const protectButton = () => {
                // Remove unwanted classes
                this.toggles.record.classList.remove('active', 'pending', 'pulsing');

                // Restore content if changed
                if (this.toggles.record.textContent !== originalContent &&
                    this.toggles.record.textContent !== '●') {
                    this.toggles.record.textContent = originalContent;
                }

                // Remove any child elements that shouldn't be there
                while (this.toggles.record.firstElementChild) {
                    this.toggles.record.removeChild(this.toggles.record.firstElementChild);
                }
            };

            // Check periodically
            setInterval(protectButton, 50);

            // Also protect on mutations
            const observer = new MutationObserver(protectButton);
            observer.observe(this.toggles.record, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }

        // Set up event listeners
        this.setupEventListeners();

        // Apply initial states
        this.applyInitialStates();

        return this;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // FPS toggle
        if (this.toggles.fps) {
            this.toggles.fps.addEventListener('click', () => this.toggleFPS());
        }

        // Blinking toggle
        if (this.toggles.blinking) {
            this.toggles.blinking.addEventListener('click', () => this.toggleBlinking());
        }

        // Gaze toggle
        if (this.toggles.gaze) {
            this.toggles.gaze.addEventListener('click', () => this.toggleGaze());
        }

        // Record toggle
        if (this.toggles.record) {
            this.toggles.record.addEventListener('click', () => this.toggleRecording());
        }
    }

    /**
     * Apply initial states to controls
     */
    applyInitialStates() {
        // Set initial blinking state
        if (this.mascot?.renderer) {
            this.mascot.renderer.setBlinkingEnabled(this.state.blinkingEnabled);
        }

        // Set initial button states
        this.updateToggleState(this.toggles.blinking, this.state.blinkingEnabled);
        this.updateToggleState(this.toggles.fps, this.state.showingFPS);
        this.updateToggleState(this.toggles.gaze, this.state.gazeTrackingEnabled);
    }

    /**
     * Toggle FPS display
     */
    toggleFPS() {
        // Use DisplayManager if available
        if (this.displayManager) {
            this.state.showingFPS = this.displayManager.toggleFPS();
        } else {
            // Fallback implementation
            this.state.showingFPS = !this.state.showingFPS;
            const fpsDisplay = document.getElementById(this.config.fpsDisplayId);
            if (fpsDisplay) {
                fpsDisplay.classList.toggle(this.config.activeClass, this.state.showingFPS);
            }
        }

        // Update button state
        this.updateToggleState(this.toggles.fps, this.state.showingFPS);

        // Show notification
        if (window.notifications) {
            window.notifications.info(
                this.state.showingFPS ? 'FPS display enabled' : 'FPS display disabled',
                { duration: 2000 }
            );
        }

        // Update global for backward compatibility
        window.showingFPS = this.state.showingFPS;

        return this.state.showingFPS;
    }

    /**
     * Toggle blinking
     */
    toggleBlinking() {
        this.state.blinkingEnabled = !this.state.blinkingEnabled;

        // Set blinking on the renderer
        if (this.mascot?.renderer) {
            this.mascot.renderer.setBlinkingEnabled(this.state.blinkingEnabled);
        }

        // Update button state
        this.updateToggleState(this.toggles.blinking, this.state.blinkingEnabled);

        // Show notification
        if (window.notifications) {
            window.notifications.info(
                this.state.blinkingEnabled ? 'Blinking enabled' : 'Blinking disabled',
                { duration: 2000 }
            );
        }

        return this.state.blinkingEnabled;
    }

    /**
     * Toggle gaze tracking
     */
    toggleGaze() {
        this.state.gazeTrackingEnabled = !this.state.gazeTrackingEnabled;

        // Set gaze tracking on the mascot
        if (this.mascot) {
            this.mascot.setGazeTracking(this.state.gazeTrackingEnabled);
        }

        // Update button state
        this.updateToggleState(this.toggles.gaze, this.state.gazeTrackingEnabled);

        // Show notification
        if (window.notifications) {
            window.notifications.info(
                this.state.gazeTrackingEnabled ? 'Gaze tracking enabled' : 'Gaze tracking disabled',
                { duration: 2000 }
            );
        }

        return this.state.gazeTrackingEnabled;
    }

    /**
     * Toggle recording
     */
    toggleRecording() {
        this.state.isRecording = !this.state.isRecording;

        // Handle recording
        if (this.mascot) {
            if (this.state.isRecording) {
                this.mascot.startRecording();
            } else {
                this.mascot.stopRecording();
            }
        }

        // Update button state
        if (this.toggles.record) {
            this.toggles.record.classList.toggle(this.config.recordingClass, this.state.isRecording);
            this.toggles.record.setAttribute('aria-pressed', this.state.isRecording ? 'true' : 'false');
        }

        // Update global for backward compatibility
        window.isRecording = this.state.isRecording;

        // Show notification
        if (window.notifications) {
            if (this.state.isRecording) {
                window.notifications.error('Recording started', { duration: 3000 });
            } else {
                window.notifications.success('Recording stopped', { duration: 2000 });
            }
        }

        return this.state.isRecording;
    }

    /**
     * Update toggle button state
     */
    updateToggleState(element, isActive) {
        if (!element) return;

        element.classList.toggle(this.config.activeClass, isActive);
        element.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }

    /**
     * Set a specific control state
     */
    setControlState(control, state) {
        switch (control) {
            case 'fps':
                if (state !== this.state.showingFPS) {
                    this.toggleFPS();
                }
                break;
            case 'blinking':
                if (state !== this.state.blinkingEnabled) {
                    this.toggleBlinking();
                }
                break;
            case 'gaze':
                if (state !== this.state.gazeTrackingEnabled) {
                    this.toggleGaze();
                }
                break;
            case 'recording':
                if (state !== this.state.isRecording) {
                    this.toggleRecording();
                }
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
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;

        // Apply current states to new mascot
        if (this.mascot?.renderer) {
            this.mascot.renderer.setBlinkingEnabled(this.state.blinkingEnabled);
        }
        if (this.mascot) {
            this.mascot.setGazeTracking(this.state.gazeTrackingEnabled);
        }
    }

    /**
     * Set display manager reference
     */
    setDisplayManager(displayManager) {
        this.displayManager = displayManager;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Clean up
     */
    destroy() {
        // Stop recording if active
        if (this.state.isRecording) {
            this.toggleRecording();
        }

        // Turn off FPS display
        if (this.state.showingFPS && this.displayManager) {
            this.displayManager.toggleFPS(false);
        }
    }
}

// Export for use as ES6 module
export { SystemControlsController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.