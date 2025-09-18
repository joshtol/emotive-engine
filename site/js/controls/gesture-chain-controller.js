/**
 * GestureChainController - Manages gesture chains and their execution
 * Handles predefined chains, custom chains, and visual feedback
 */
class GestureChainController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Visual feedback
            buttonActiveClass: options.buttonActiveClass || 'active',
            buttonPulsingClass: options.buttonPulsingClass || 'pulsing',
            pulsingDuration: options.pulsingDuration || 300,
            highlightDuration: options.highlightDuration || 500,

            // Shape morph probability on chain execution
            shapeMorphChance: options.shapeMorphChance || 0.1,

            // Selectors
            chainButtonSelector: options.chainButtonSelector || '.chain-btn',
            gestureButtonSelector: options.gestureButtonSelector || '.gesture-btn',
            shapeButtonSelector: options.shapeButtonSelector || '.shape-btn',

            ...options
        };

        // Default chain definitions
        this.chains = {
            buildup: [
                { gesture: 'bounce', delay: 0 },
                { gesture: 'sway', delay: 100 },
                { gesture: 'glow', delay: 200 },
                { gesture: 'sparkle', delay: 500 }
            ],
            cascade: [
                { gesture: 'wave', delay: 0 },
                { gesture: 'pulse', delay: 100 },
                { gesture: 'shimmer', delay: 200 }
            ],
            celebrate: [
                { gesture: 'spin', delay: 0 },
                { gesture: 'bounce', delay: 100 },
                { gesture: 'sparkle', delay: 200 },
                { gesture: 'flash', delay: 400 }
            ],
            smooth: [
                { gesture: 'sway', delay: 0 },
                { gesture: 'wave', delay: 100 },
                { gesture: 'glow', delay: 200 },
                { gesture: 'point', delay: 400 }
            ],
            chaos: [
                { gesture: 'wiggle', delay: 0 },
                { gesture: 'shake', delay: 50 },
                { gesture: 'spin', delay: 100 },
                { gesture: 'flash', delay: 150 },
                { gesture: 'sparkle', delay: 200 }
            ],
            custom: [
                { gesture: 'lean', delay: 0 },
                { gesture: 'reach', delay: 150 },
                { gesture: 'groove', delay: 300 },
                { gesture: 'shimmer', delay: 450 },
                { gesture: 'orbit', delay: 600 }
            ],
            ...options.customChains
        };

        // References
        this.mascot = null;
        this.gestureScheduler = null;
        this.app = null;

        // State
        this.state = {
            isExecuting: false,
            currentChain: null,
            executionTimeouts: []
        };
    }

    /**
     * Initialize the controller
     */
    init(app = null, mascot = null, gestureScheduler = null) {
        this.app = app || window.app;
        this.mascot = mascot || window.mascot;
        this.gestureScheduler = gestureScheduler || window.gestureScheduler;

        this.setupEventListeners();
        return this;
    }

    /**
     * Set up event listeners for chain buttons
     */
    setupEventListeners() {
        const chainButtons = document.querySelectorAll(this.config.chainButtonSelector);

        chainButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chainType = btn.dataset.chain;
                this.executeChain(chainType, btn);
            });
        });
    }

    /**
     * Execute a gesture chain
     */
    executeChain(chainType, buttonElement = null) {
        const chain = this.chains[chainType];
        if (!chain || !this.mascot) {
            console.warn(`Chain "${chainType}" not found or mascot not initialized`);
            return;
        }

        // Clear any existing chain execution
        this.clearCurrentExecution();

        // Set state
        this.state.isExecuting = true;
        this.state.currentChain = chainType;

        // Visual feedback for the chain button
        if (buttonElement) {
            this.handleChainButtonFeedback(buttonElement);
        }

        // Check if we should trigger a random shape morph
        if (this.shouldTriggerShapeMorph()) {
            this.triggerRandomShapeMorph();
        }

        // Execute the chain with delays for layering effect
        this.executeChainSequence(chain);
    }

    /**
     * Handle visual feedback for chain button
     */
    handleChainButtonFeedback(buttonElement) {
        // Don't add persistent active state - chain buttons are just triggers
        const allChainButtons = document.querySelectorAll(this.config.chainButtonSelector);
        allChainButtons.forEach(b => b.classList.remove(this.config.buttonActiveClass));

        // Visual feedback - quick flash only
        buttonElement.classList.add(this.config.buttonPulsingClass);
        setTimeout(() => {
            buttonElement.classList.remove(this.config.buttonPulsingClass);
        }, this.config.pulsingDuration);
    }

    /**
     * Execute the chain sequence
     */
    executeChainSequence(chain) {
        let maxDelay = 0;

        chain.forEach((item, index) => {
            maxDelay = Math.max(maxDelay, item.delay);

            const timeout = setTimeout(() => {
                // Highlight gesture button as it activates with color variation
                this.highlightGestureButton(item.gesture, index);

                // Execute the gesture with chain layer for AnimationMixer
                // Chain gestures stack on top of base movement but below user gestures
                if (this.mascot && this.mascot.express) {
                    this.mascot.express(item.gesture, {
                        fromChain: true,
                        chainIndex: index,
                        chainLength: chain.length
                    });
                } else {
                    // Fallback to old method
                    this.executeGesture(item.gesture);
                }
            }, item.delay);

            this.state.executionTimeouts.push(timeout);
        });

        // Mark execution complete after all gestures are triggered
        const completeTimeout = setTimeout(() => {
            this.state.isExecuting = false;
            this.state.currentChain = null;
        }, maxDelay + this.config.highlightDuration);

        this.state.executionTimeouts.push(completeTimeout);
    }

    /**
     * Highlight a gesture button when it activates
     */
    highlightGestureButton(gesture, index = 0) {
        const gestureBtn = document.querySelector(
            `${this.config.gestureButtonSelector}[data-gesture="${gesture}"]`
        );

        if (gestureBtn) {
            // Add chain index for color variation
            gestureBtn.style.setProperty('--chain-index', index);
            gestureBtn.classList.add(this.config.buttonActiveClass);
            setTimeout(() => {
                gestureBtn.classList.remove(this.config.buttonActiveClass);
                gestureBtn.style.removeProperty('--chain-index');
            }, this.config.highlightDuration);
        }
    }

    /**
     * Execute a single gesture
     */
    executeGesture(gesture) {
        if (window.rhythmActive && this.gestureScheduler) {
            this.gestureScheduler.requestGesture(gesture);
        } else if (this.mascot) {
            this.mascot.express(gesture);
        }
    }

    /**
     * Check if we should trigger a shape morph
     */
    shouldTriggerShapeMorph() {
        return Math.random() < this.config.shapeMorphChance;
    }

    /**
     * Trigger a random shape morph
     */
    triggerRandomShapeMorph() {
        const shapeButtons = Array.from(
            document.querySelectorAll(this.config.shapeButtonSelector)
        );
        const shapes = shapeButtons.map(b => b.dataset.shape);
        const currentShape = document.querySelector(
            `${this.config.shapeButtonSelector}.${this.config.buttonActiveClass}`
        )?.dataset.shape;

        const availableShapes = shapes.filter(s => s !== currentShape);

        if (availableShapes.length > 0) {
            const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

            // Trigger the morph slightly before the chain starts for better effect
            setTimeout(() => {
                const shapeBtn = document.querySelector(
                    `${this.config.shapeButtonSelector}[data-shape="${randomShape}"]`
                );
                if (shapeBtn) {
                    shapeBtn.click();
                }
            }, 0);
        }
    }

    /**
     * Clear current chain execution
     */
    clearCurrentExecution() {
        // Clear all pending timeouts
        this.state.executionTimeouts.forEach(timeout => clearTimeout(timeout));
        this.state.executionTimeouts = [];

        // Reset state
        this.state.isExecuting = false;
        this.state.currentChain = null;
    }

    /**
     * Add or update a chain definition
     */
    defineChain(name, chain) {
        this.chains[name] = chain;
    }

    /**
     * Get chain definition
     */
    getChain(name) {
        return this.chains[name];
    }

    /**
     * Get all chain names
     */
    getChainNames() {
        return Object.keys(this.chains);
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set mascot reference
     */
    setMascot(mascot) {
        this.mascot = mascot;
    }

    /**
     * Set gesture scheduler reference
     */
    setGestureScheduler(scheduler) {
        this.gestureScheduler = scheduler;
    }

    /**
     * Clean up
     */
    destroy() {
        this.clearCurrentExecution();
    }
}

// Export as ES6 module
export default GestureChainController;

// Make available globally for app.js
if (typeof window !== 'undefined') {
    window.GestureChainController = GestureChainController;
}