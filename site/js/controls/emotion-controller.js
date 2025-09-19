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
 * EmotionController - Manages emotion selection and state
 * Handles emotion buttons, active states, and mascot updates
 */
class EmotionController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Selectors
            emotionButtonSelector: options.emotionButtonSelector || '.emotion-btn',

            // Classes
            activeClass: options.activeClass || 'active',

            // Default emotion
            defaultEmotion: options.defaultEmotion || 'neutral',

            // ARIA attributes
            useAriaPressed: options.useAriaPressed !== false,

            ...options
        };

        // State
        this.state = {
            currentEmotion: this.config.defaultEmotion,
            previousEmotion: null,
            isTransitioning: false
        };

        // References
        this.mascot = null;
        this.app = null;

        // Callbacks
        this.onEmotionChange = options.onEmotionChange || null;
        this.onDisplayUpdate = options.onDisplayUpdate || null;

        // Element cache
        this.emotionButtons = [];
        this.activeButton = null;
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;

        // Get emotion buttons
        this.emotionButtons = Array.from(
            document.querySelectorAll(this.config.emotionButtonSelector)
        );

        // Set up event listeners
        this.setupEventListeners();

        // Set initial emotion
        this.setInitialEmotion();

        return this;
    }

    /**
     * Set up event listeners for emotion buttons
     */
    setupEventListeners() {
        this.emotionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emotion = btn.dataset.emotion;
                if (emotion) {
                    this.setEmotion(emotion, btn);
                }
            });
        });
    }

    /**
     * Set initial emotion based on active button or default
     */
    setInitialEmotion() {
        // Check for already active button
        const activeButton = this.emotionButtons.find(btn =>
            btn.classList.contains(this.config.activeClass)
        );

        if (activeButton) {
            const emotion = activeButton.dataset.emotion;
            this.state.currentEmotion = emotion;
            this.activeButton = activeButton;
            // Trigger callbacks for initial state
            if (this.onEmotionChange) {
                this.onEmotionChange(emotion, null);
            }
            if (this.onDisplayUpdate) {
                this.onDisplayUpdate();
            }
        } else {
            // Set default emotion
            this.setEmotion(this.config.defaultEmotion);
        }
    }

    /**
     * Set emotion
     */
    setEmotion(emotion, buttonElement = null) {
        // Check if emotion is changing
        if (emotion === this.state.currentEmotion && !buttonElement) {
            return;
        }

        // Update state
        this.state.previousEmotion = this.state.currentEmotion;
        this.state.currentEmotion = emotion;

        // Update button states
        this.updateButtonStates(buttonElement || this.findButtonByEmotion(emotion));

        // Update mascot
        this.updateMascot();

        // Trigger callbacks
        if (this.onEmotionChange) {
            this.onEmotionChange(emotion, this.state.previousEmotion);
        }

        if (this.onDisplayUpdate) {
            this.onDisplayUpdate();
        }

        // Update global for backward compatibility
        window.currentEmotion = emotion;
    }

    /**
     * Update button visual states
     */
    updateButtonStates(activeButton) {
        // Remove active state from all buttons
        this.emotionButtons.forEach(btn => {
            btn.classList.remove(this.config.activeClass);
            if (this.config.useAriaPressed) {
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Add active state to selected button
        if (activeButton) {
            activeButton.classList.add(this.config.activeClass);
            if (this.config.useAriaPressed) {
                activeButton.setAttribute('aria-pressed', 'true');
            }
            this.activeButton = activeButton;
        }
    }

    /**
     * Update mascot with current emotion
     */
    updateMascot() {
        if (!this.mascot) return;

        // Get current undertone from global or controller
        const undertone = window.currentUndertone ||
                         window.undertoneController?.getUndertone() ||
                         undefined;

        this.mascot.setEmotion(this.state.currentEmotion, undertone);
    }

    /**
     * Find button element by emotion
     */
    findButtonByEmotion(emotion) {
        return this.emotionButtons.find(btn =>
            btn.dataset.emotion === emotion
        );
    }

    /**
     * Get current emotion
     */
    getEmotion() {
        return this.state.currentEmotion;
    }

    /**
     * Get previous emotion
     */
    getPreviousEmotion() {
        return this.state.previousEmotion;
    }

    /**
     * Get all available emotions
     */
    getAvailableEmotions() {
        return this.emotionButtons.map(btn => btn.dataset.emotion);
    }

    /**
     * Cycle to next emotion
     */
    cycleEmotion(direction = 1) {
        const emotions = this.getAvailableEmotions();
        const currentIndex = emotions.indexOf(this.state.currentEmotion);

        let nextIndex = currentIndex + direction;
        if (nextIndex >= emotions.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = emotions.length - 1;

        this.setEmotion(emotions[nextIndex]);
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;

        // Update mascot with current emotion
        if (this.state.currentEmotion) {
            this.updateMascot();
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Reset to default emotion
     */
    reset() {
        this.setEmotion(this.config.defaultEmotion);
    }

    /**
     * Clean up
     */
    destroy() {
        // Remove event listeners if needed
        this.emotionButtons = [];
        this.activeButton = null;
    }
}

// Export class for ES6 modules
export { EmotionController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.