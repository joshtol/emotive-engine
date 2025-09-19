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
 * DiceController - Manages dice button configurations and pools
 * Centralizes dice roll configurations and gesture pools
 */
class DiceController {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Dice button selectors
            shapeButtonId: options.shapeButtonId || 'randomize-shape-btn',
            overlayableButtonId: options.overlayableButtonId || 'randomize-overlayable-btn',
            danceButtonId: options.danceButtonId || 'randomize-dance-btn',
            chainButtonId: options.chainButtonId || 'randomize-chain-btn',
            glowButtonId: options.glowButtonId || 'randomize-glow-btn',

            // Gesture pools
            overlayablePool: options.overlayablePool || [
                'wave', 'point', 'nod', 'shake',
                'lean', 'tilt', 'reach', 'breathe',
                'float', 'rain', 'runningman', 'charleston'
            ],

            dancePool: options.dancePool || [
                'runningman', 'charleston', 'twist',
                'robot', 'disco', 'moonwalk'
            ],

            // Custom dice configurations
            customDice: options.customDice || {},

            ...options
        };

        // References
        this.diceRoller = null;
        this.app = null;

        // State
        this.state = {
            lastRoll: {},
            isRolling: {}
        };

        // Button elements
        this.buttons = {};
    }

    /**
     * Initialize the controller
     */
    init(app = null, diceRoller = null) {
        this.app = app || window.app;
        this.diceRoller = diceRoller || window.diceRoller;

        if (!this.diceRoller) {
            console.warn('DiceController: DiceRoller not found');
            return this;
        }

        // Set up dice configurations
        this.setupDiceConfigurations();

        // Get button elements
        this.getButtonElements();

        // Set up event listeners
        this.setupEventListeners();

        return this;
    }

    /**
     * Set up dice configurations in DiceRoller
     */
    setupDiceConfigurations() {
        if (!this.diceRoller) return;

        // Configure overlayable pool if not already configured
        if (!this.diceRoller.config.overlayablePool) {
            this.diceRoller.config.overlayablePool = this.config.overlayablePool;
        }

        // Configure dance pool if not already configured
        if (!this.diceRoller.config.dancePool) {
            this.diceRoller.config.dancePool = this.config.dancePool;
        }

        // Add any custom dice configurations
        for (const [diceName, config] of Object.entries(this.config.customDice)) {
            if (!this.diceRoller.config[diceName]) {
                this.diceRoller.config[diceName] = config;
            }
        }
    }

    /**
     * Get button elements
     */
    getButtonElements() {
        this.buttons.shape = document.getElementById(this.config.shapeButtonId);
        this.buttons.overlayable = document.getElementById(this.config.overlayableButtonId);
        this.buttons.dance = document.getElementById(this.config.danceButtonId);
        this.buttons.chain = document.getElementById(this.config.chainButtonId);
        this.buttons.glow = document.getElementById(this.config.glowButtonId);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Shape dice
        if (this.buttons.shape) {
            this.buttons.shape.addEventListener('click', () => {
                this.rollDice('shape');
            });
        }

        // Overlayable gesture dice
        if (this.buttons.overlayable) {
            this.buttons.overlayable.addEventListener('click', () => {
                this.rollDice('overlayable', {
                    pool: this.config.overlayablePool
                });
            });
        }

        // Dance dice
        if (this.buttons.dance) {
            this.buttons.dance.addEventListener('click', () => {
                this.rollDice('dance', {
                    pool: this.config.dancePool
                });
            });
        }

        // Chain dice
        if (this.buttons.chain) {
            this.buttons.chain.addEventListener('click', () => {
                this.rollDice('chain');
            });
        }

        // Glow dice
        if (this.buttons.glow) {
            this.buttons.glow.addEventListener('click', () => {
                this.rollDice('glow');
            });
        }

        // Set up listeners for any custom dice
        for (const [diceName, config] of Object.entries(this.config.customDice)) {
            if (config.buttonId) {
                const button = document.getElementById(config.buttonId);
                if (button) {
                    button.addEventListener('click', () => {
                        this.rollDice(diceName, config.rollOptions);
                    });
                }
            }
        }
    }

    /**
     * Roll a dice
     */
    rollDice(diceType, options = {}) {
        if (!this.diceRoller) {
            console.warn('DiceController: Cannot roll - DiceRoller not available');
            return;
        }

        // Mark as rolling
        this.state.isRolling[diceType] = true;

        // Perform the roll
        const result = this.diceRoller.roll(diceType, options);

        // Store result
        this.state.lastRoll[diceType] = {
            result: result,
            timestamp: Date.now()
        };

        // Mark as done rolling
        setTimeout(() => {
            this.state.isRolling[diceType] = false;
        }, 300); // Match animation duration

        return result;
    }

    /**
     * Add a new dice type
     */
    addDiceType(name, config) {
        this.config.customDice[name] = config;

        // Configure in DiceRoller if available
        if (this.diceRoller && config.pool) {
            this.diceRoller.config[name + 'Pool'] = config.pool;
        }

        // Set up button listener if specified
        if (config.buttonId) {
            const button = document.getElementById(config.buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.rollDice(name, config.rollOptions);
                });
            }
        }
    }

    /**
     * Update a pool
     */
    updatePool(poolName, newPool) {
        if (poolName === 'overlayable') {
            this.config.overlayablePool = newPool;
            if (this.diceRoller) {
                this.diceRoller.config.overlayablePool = newPool;
            }
        } else if (poolName === 'dance') {
            this.config.dancePool = newPool;
            if (this.diceRoller) {
                this.diceRoller.config.dancePool = newPool;
            }
        } else if (this.config.customDice[poolName]) {
            this.config.customDice[poolName].pool = newPool;
            if (this.diceRoller) {
                this.diceRoller.config[poolName + 'Pool'] = newPool;
            }
        }
    }

    /**
     * Get last roll result
     */
    getLastRoll(diceType) {
        return this.state.lastRoll[diceType];
    }

    /**
     * Check if currently rolling
     */
    isRolling(diceType) {
        return this.state.isRolling[diceType] || false;
    }

    /**
     * Get all configured pools
     */
    getPools() {
        const pools = {
            overlayable: this.config.overlayablePool,
            dance: this.config.dancePool
        };

        // Add custom pools
        for (const [name, config] of Object.entries(this.config.customDice)) {
            if (config.pool) {
                pools[name] = config.pool;
            }
        }

        return pools;
    }

    /**
     * Set dice roller reference
     */
    setDiceRoller(diceRoller) {
        this.diceRoller = diceRoller;
        this.setupDiceConfigurations();
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.setupDiceConfigurations();
    }

    /**
     * Clean up
     */
    destroy() {
        // Clear state
        this.state.lastRoll = {};
        this.state.isRolling = {};
    }
}

// Export class for ES6 modules
export { DiceController };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.