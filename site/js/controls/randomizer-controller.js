/**
 * RandomizerController - Centralized randomization system for UI elements
 * Handles random selection of emotions, undertones, shapes, and gestures
 */
class RandomizerController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Timing configuration
            cascadeDelay: options.cascadeDelay || 100,
            undertoneDelay: options.undertoneDelay || 100,

            // Randomization settings
            shapeChanceOnChain: options.shapeChanceOnChain || 0.1, // 10% chance
            excludeCurrentSelection: options.excludeCurrentSelection !== false,

            ...options
        };

        // References to other controllers
        this.diceRoller = null;
        this.mascot = null;
        this.app = null;

        // Cached selectors
        this.selectors = {
            emotionButtons: '.emotion-btn',
            undertoneSlider: '#undertone-slider',
            shapeButtons: '.shape-btn',
            gestureButtons: '.gesture-btn',
            chainButtons: '.chain-btn',
            diceButtons: '.dice-btn',
            randomizeButton: '#randomize-btn',
            randomizeAllButton: '#randomize-all-btn'
        };
    }

    /**
     * Initialize the randomizer
     */
    init(app = null, diceRoller = null, mascot = null) {
        this.app = app || window.app;
        this.diceRoller = diceRoller || window.diceRoller;
        this.mascot = mascot || window.mascot;

        this.setupEventListeners();
        return this;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Randomize emotion button (if exists)
        const randomizeBtn = document.getElementById('randomize-btn');
        if (randomizeBtn) {
            randomizeBtn.addEventListener('click', () => this.randomizeEmotion());
        }

        // Master randomize button
        const randomizeAllBtn = document.getElementById('randomize-all-btn');
        if (randomizeAllBtn) {
            randomizeAllBtn.addEventListener('click', () => this.randomizeAll());
        }
    }

    /**
     * Get available options excluding current selection
     */
    getAvailableOptions(selector, currentValue = null) {
        const elements = Array.from(document.querySelectorAll(selector));
        let options = elements.map(el => {
            return el.dataset.emotion ||
                   el.dataset.shape ||
                   el.dataset.gesture ||
                   el.dataset.chain ||
                   el.value;
        });

        // Get current active value if not provided
        if (!currentValue) {
            const activeElement = document.querySelector(`${selector}.active`);
            currentValue = activeElement ? (
                activeElement.dataset.emotion ||
                activeElement.dataset.shape ||
                activeElement.dataset.gesture ||
                activeElement.dataset.chain ||
                activeElement.value
            ) : null;
        }

        // Filter out current if configured
        if (this.config.excludeCurrentSelection && currentValue) {
            options = options.filter(opt => opt !== currentValue);
        }

        return options;
    }

    /**
     * Randomize emotion
     */
    randomizeEmotion() {
        const availableEmotions = this.getAvailableOptions(this.selectors.emotionButtons);

        if (availableEmotions.length === 0) {
            console.log('No available emotions to randomize');
            return null;
        }

        const randomEmotion = this.selectRandom(availableEmotions);
        const button = document.querySelector(`.emotion-btn[data-emotion="${randomEmotion}"]`);

        if (button) {
            button.click();
        }

        return randomEmotion;
    }

    /**
     * Randomize undertone
     */
    randomizeUndertone() {
        const slider = document.querySelector(this.selectors.undertoneSlider);
        if (!slider) return null;

        // Generate random value between min and max
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;

        slider.value = randomValue;

        // Trigger input event to update the display
        slider.dispatchEvent(new Event('input'));

        // Also trigger the slider background update if function exists
        if (typeof updateSliderBackground === 'function') {
            updateSliderBackground(slider);
        }

        return randomValue;
    }

    /**
     * Randomize shape (with optional chance trigger)
     */
    randomizeShape(forceTrigger = false) {
        // Check if we should trigger based on chance
        if (!forceTrigger && Math.random() > this.config.shapeChanceOnChain) {
            return null;
        }

        if (this.diceRoller) {
            this.diceRoller.roll('shape');
        } else {
            // Fallback to direct randomization
            const availableShapes = this.getAvailableOptions(this.selectors.shapeButtons);
            if (availableShapes.length > 0) {
                const randomShape = this.selectRandom(availableShapes);
                const button = document.querySelector(`.shape-btn[data-shape="${randomShape}"]`);
                if (button) {
                    button.click();
                }
                return randomShape;
            }
        }
        return null;
    }

    /**
     * Randomize for morph gesture
     */
    randomizeForMorph() {
        const shapes = ['heart', 'star', 'sun', 'moon', 'lunar', 'solar', 'square', 'triangle'];
        const randomShape = this.selectRandom(shapes);

        if (this.mascot) {
            this.mascot.morphTo(randomShape, {
                duration: window.rhythmActive ? 'bar' : 1000,
                mode: 'core-only',
                onBeat: window.rhythmActive
            });

            // Update visual feedback
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            const shapeBtn = document.querySelector(`.shape-btn[data-shape="${randomShape}"]`);
            if (shapeBtn) {
                shapeBtn.classList.add('active');
            }
        }

        return randomShape;
    }

    /**
     * Randomize all elements
     */
    randomizeAll() {
        // Roll emotion and undertone first
        this.randomizeEmotion();

        setTimeout(() => {
            this.randomizeUndertone();
        }, this.config.undertoneDelay);

        // Find and trigger all dice buttons
        const allDiceButtons = Array.from(document.querySelectorAll(this.selectors.diceButtons));

        // Trigger each dice with a cascade delay for visual effect
        allDiceButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.click();
            }, (index + 2) * this.config.cascadeDelay); // +2 to start after emotion/undertone
        });
    }

    /**
     * Select random element from array
     */
    selectRandom(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Get random number in range
     */
    getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check probability (returns true if random < probability)
     */
    checkProbability(probability) {
        return Math.random() < probability;
    }

    /**
     * Set dice roller reference
     */
    setDiceRoller(diceRoller) {
        this.diceRoller = diceRoller;
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
}

// Export for use
if (typeof window !== 'undefined') {
    window.RandomizerController = RandomizerController;
}