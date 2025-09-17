/**
 * DiceRoller - Centralized dice rolling system for UI
 * Handles all randomization logic, visual feedback, and selection rules
 */
class DiceRoller {
    constructor() {
        // Track recent selections to avoid repetition
        this.recentSelections = new Map(); // Map of type -> array of recent selections
        this.maxHistory = 3; // How many recent selections to track

        // Track concurrent animations for color variations
        this.activeAnimations = new Set();
        this.animationCounter = 0;

        // Configuration for different dice types
        this.config = {
            chain: {
                selector: '.chain-btn',
                attribute: 'data-chain',
                excludeActive: false, // Chains can be re-triggered
                animationType: 'trigger', // 'trigger' or 'toggle'
                cooldown: 0,
                weights: null // Can add weighted probabilities later
            },
            gesture: {
                selector: '.gesture-btn',
                attribute: 'data-gesture',
                excludeActive: true, // Don't select already active gestures
                animationType: 'toggle',
                cooldown: 500,
                weights: null
            },
            shape: {
                selector: '.shape-btn',
                attribute: 'data-shape',
                excludeActive: true,
                animationType: 'toggle',
                cooldown: 1000,
                weights: null
            }
        };

        // Pools for different dice types
        this.pools = {
            dance: ['bounce', 'sway', 'headBob', 'wiggle', 'spin', 'hula', 'orbit', 'groove', 'jump', 'twist'],
            glow: ['sparkle', 'pulse', 'glow', 'flash', 'shimmer', 'flicker'],
            overlayable: ['wave', 'point', 'nod', 'shake', 'lean', 'tilt', 'reach', 'breathe', 'float', 'rain', 'runningman', 'charleston'],
            chain: ['buildup', 'cascade', 'celebrate', 'smooth', 'chaos', 'custom']
        };

        // Track cooldowns
        this.cooldowns = new Map();
    }

    /**
     * Roll a dice for a specific type
     * @param {string} type - Type of dice to roll (dance, glow, chain, etc)
     * @param {Object} options - Additional options for the roll
     * @returns {Element|null} The selected element
     */
    roll(type, options = {}) {
        const config = this.config[type] || this.config.gesture;
        const pool = options.pool || this.pools[type] || this.getAvailableFromDOM(config);

        // Get available options
        const available = this.getAvailableOptions(type, pool, config, options);

        if (available.length === 0) {
            console.log(`No available options for ${type} dice roll`);
            return null;
        }

        // Select one (with optional weighting)
        const selected = this.selectOption(available, options.weights || config.weights);

        // Find the button element
        const element = this.findElement(selected, config, type);

        if (element) {
            // Add to history
            this.addToHistory(type, selected);

            // Apply visual feedback
            this.applyVisualFeedback(element);

            // Trigger the action
            if (options.skipClick !== true) {
                element.click();
            }

            // Set cooldown if configured
            if (config.cooldown > 0) {
                this.setCooldown(`${type}-${selected}`, config.cooldown);
            }
        }

        return element;
    }

    /**
     * Roll multiple dice at once
     * @param {Array} types - Array of types to roll
     * @param {Object} options - Options for the roll
     */
    rollMultiple(types, options = {}) {
        const results = [];

        // Add slight delays for visual effect
        types.forEach((type, index) => {
            setTimeout(() => {
                const element = this.roll(type, options);
                results.push({ type, element });
            }, index * 100);
        });

        return results;
    }

    /**
     * Get available options for a dice roll
     */
    getAvailableOptions(type, pool, config, options) {
        let available = [...pool];

        // Exclude active if configured
        if (config.excludeActive) {
            const active = this.getActiveElements(config);
            available = available.filter(item => !active.includes(item));
        }

        // Exclude recent selections if configured
        if (options.excludeRecent !== false) {
            const recent = this.recentSelections.get(type) || [];
            available = available.filter(item => !recent.includes(item));
        }

        // Check cooldowns
        available = available.filter(item => !this.isOnCooldown(`${type}-${item}`));

        // Apply custom filter if provided
        if (options.filter) {
            available = available.filter(options.filter);
        }

        return available;
    }

    /**
     * Get currently active elements
     */
    getActiveElements(config) {
        const active = [];
        const elements = document.querySelectorAll(`${config.selector}.active`);

        elements.forEach(el => {
            const value = el.getAttribute(config.attribute) || el.textContent;
            active.push(value);
        });

        return active;
    }

    /**
     * Get available options from DOM
     */
    getAvailableFromDOM(config) {
        const available = [];
        const elements = document.querySelectorAll(config.selector);

        elements.forEach(el => {
            const value = el.getAttribute(config.attribute) || el.textContent;
            if (value) available.push(value);
        });

        return available;
    }

    /**
     * Select an option (with optional weighting)
     */
    selectOption(available, weights) {
        if (!weights) {
            // Simple random selection
            return available[Math.floor(Math.random() * available.length)];
        }

        // Weighted selection
        const totalWeight = available.reduce((sum, item) => {
            return sum + (weights[item] || 1);
        }, 0);

        let random = Math.random() * totalWeight;

        for (const item of available) {
            random -= (weights[item] || 1);
            if (random <= 0) {
                return item;
            }
        }

        return available[0]; // Fallback
    }

    /**
     * Find element by value
     */
    findElement(value, config, type) {
        // Special handling for different types
        if (config.selector === '.gesture-btn') {
            return document.querySelector(`.gesture-btn[data-gesture="${value}"]`);
        } else if (config.selector === '.chain-btn') {
            return document.querySelector(`.chain-btn[data-chain="${value}"]`);
        } else if (config.selector === '.shape-btn') {
            return document.querySelector(`.shape-btn[data-shape="${value}"]`);
        }

        // Generic selector
        return document.querySelector(`${config.selector}[${config.attribute}="${value}"]`);
    }

    /**
     * Add to selection history
     */
    addToHistory(type, value) {
        if (!this.recentSelections.has(type)) {
            this.recentSelections.set(type, []);
        }

        const history = this.recentSelections.get(type);
        history.push(value);

        // Keep only recent selections
        if (history.length > this.maxHistory) {
            history.shift();
        }
    }

    /**
     * Apply visual feedback to selected element
     */
    applyVisualFeedback(element) {
        const animId = ++this.animationCounter;
        this.activeAnimations.add(animId);

        // Determine which animation class to use based on concurrent animations
        const className = this.getDiceSelectionClass();
        element.classList.add(className);

        // Remove after animation completes
        setTimeout(() => {
            element.classList.remove(className);
            element.classList.remove('dice-selected', 'dice-selected-alt1', 'dice-selected-alt2');
            this.activeAnimations.delete(animId);
        }, 1000);
    }

    /**
     * Get appropriate dice selection class based on concurrent animations
     */
    getDiceSelectionClass() {
        const activeCount = this.activeAnimations.size;

        if (activeCount === 0) {
            return 'dice-selected';
        } else if (activeCount === 1) {
            return 'dice-selected-alt1';
        } else {
            return 'dice-selected-alt2';
        }
    }

    /**
     * Set cooldown for an item
     */
    setCooldown(key, duration) {
        this.cooldowns.set(key, Date.now() + duration);

        // Auto-cleanup expired cooldowns
        setTimeout(() => {
            this.cooldowns.delete(key);
        }, duration);
    }

    /**
     * Check if item is on cooldown
     */
    isOnCooldown(key) {
        const cooldownEnd = this.cooldowns.get(key);
        return cooldownEnd && Date.now() < cooldownEnd;
    }

    /**
     * Clear history for a type
     */
    clearHistory(type) {
        if (type) {
            this.recentSelections.delete(type);
        } else {
            this.recentSelections.clear();
        }
    }

    /**
     * Get current history for debugging
     */
    getHistory(type) {
        if (type) {
            return this.recentSelections.get(type) || [];
        }
        return Object.fromEntries(this.recentSelections);
    }

    /**
     * Advanced: Roll with complex rules
     */
    rollWithRules(type, rules = {}) {
        const options = { ...rules };

        // Example: Avoid combinations
        if (rules.avoidWith) {
            const activeGestures = this.getActiveElements(this.config.gesture);
            options.filter = (item) => {
                // Check if this item conflicts with active gestures
                const conflicts = rules.avoidWith[item] || [];
                return !conflicts.some(conflict => activeGestures.includes(conflict));
            };
        }

        // Example: Prefer certain options based on context
        if (rules.prefer && Math.random() < 0.7) { // 70% chance to use preferred
            options.pool = rules.prefer;
        }

        // Example: Exclusive groups (if one is active, exclude others in group)
        if (rules.exclusiveGroups) {
            const active = this.getActiveElements(this.config.gesture);
            options.filter = (item) => {
                for (const group of rules.exclusiveGroups) {
                    if (group.includes(item)) {
                        // Check if any other member of this group is active
                        const othersActive = group.filter(g => g !== item && active.includes(g));
                        if (othersActive.length > 0) {
                            return false; // Exclude this item
                        }
                    }
                }
                return true;
            };
        }

        return this.roll(type, options);
    }
}

// Export for use in demo
if (typeof window !== 'undefined') {
    window.DiceRoller = DiceRoller;
}