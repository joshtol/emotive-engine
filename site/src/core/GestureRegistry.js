/**
 * Gesture Registry
 * Central registry for all gesture definitions and mappings
 * @module core/GestureRegistry
 */

import { Debug } from '../../js/utils/debug.js';

class GestureRegistry {
    constructor() {
        // Gesture definitions map
        this.gestures = new Map();

        // Renderer method mappings
        this.rendererMethods = new Map();

        // Gesture categories
        this.categories = new Map();

        // Gesture metadata
        this.metadata = new Map();

        // Validation rules
        this.validationRules = {
            requiredFields: ['name', 'type', 'category'],
            validTypes: ['gesture', 'ambient', 'composite', 'transition', 'effect'],
            validCategories: ['movement', 'expression', 'effects', 'ambient', 'groove', 'dance']
        };

        // Logger
        this.logger = Debug ? Debug.getLogger('GestureRegistry') : console;

        // Initialize with built-in gestures
        this.registerBuiltInGestures();
    }

    /**
     * Register a gesture definition
     * @param {string} name - Gesture name
     * @param {Object} definition - Gesture definition object
     * @returns {boolean} Success status
     */
    register(name, definition) {
        try {
            // Validate definition
            this.validate(definition);

            // Ensure name matches
            if (definition.name && definition.name !== name) {
                this.logger.warn(`Gesture name mismatch: ${name} vs ${definition.name}`);
                definition.name = name;
            }

            // Store gesture
            this.gestures.set(name, definition);

            // Store category
            if (definition.category) {
                if (!this.categories.has(definition.category)) {
                    this.categories.set(definition.category, new Set());
                }
                this.categories.get(definition.category).add(name);
            }

            // Map renderer method if provided
            if (definition.rendererMethod) {
                this.rendererMethods.set(name, definition.rendererMethod);
            }

            // Store metadata
            this.metadata.set(name, {
                type: definition.type || 'gesture',
                category: definition.category || 'general',
                duration: definition.duration || 1000,
                interruptible: definition.interruptible !== false,
                blendable: definition.blendable || false,
                registeredAt: Date.now()
            });

            this.logger.info(`Registered gesture: ${name}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to register gesture ${name}:`, error);
            return false;
        }
    }

    /**
     * Validate a gesture definition
     * @param {Object} definition - Gesture definition to validate
     * @throws {Error} If validation fails
     */
    validate(definition) {
        if (!definition || typeof definition !== 'object') {
            throw new Error('Gesture definition must be an object');
        }

        // Check required fields
        for (const field of this.validationRules.requiredFields) {
            if (!definition[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate type
        if (this.validationRules.validTypes.length > 0 &&
            !this.validationRules.validTypes.includes(definition.type)) {
            throw new Error(`Invalid gesture type: ${definition.type}`);
        }

        // Validate category
        if (this.validationRules.validCategories.length > 0 &&
            !this.validationRules.validCategories.includes(definition.category)) {
            throw new Error(`Invalid gesture category: ${definition.category}`);
        }

        // Validate animation if present
        if (definition.animation) {
            this.validateAnimation(definition.animation);
        }
    }

    /**
     * Validate animation definition
     * @param {Object} animation - Animation definition
     * @throws {Error} If animation is invalid
     */
    validateAnimation(animation) {
        if (typeof animation !== 'object') {
            throw new Error('Animation must be an object');
        }

        // Check for at least one animation property
        const animProps = ['x', 'y', 'rotation', 'scale', 'opacity'];
        const hasAnimProp = animProps.some(prop => animation[prop]);

        if (!hasAnimProp) {
            throw new Error('Animation must define at least one property');
        }
    }

    /**
     * Get a gesture definition
     * @param {string} name - Gesture name
     * @returns {Object|null} Gesture definition or null
     */
    get(name) {
        return this.gestures.get(name) || null;
    }

    /**
     * Check if a gesture exists
     * @param {string} name - Gesture name
     * @returns {boolean} Whether gesture exists
     */
    has(name) {
        return this.gestures.has(name);
    }

    /**
     * Get renderer method for a gesture
     * @param {string} name - Gesture name
     * @returns {string|null} Renderer method name or null
     */
    getRendererMethod(name) {
        // First check explicit mapping
        if (this.rendererMethods.has(name)) {
            return this.rendererMethods.get(name);
        }

        // Default pattern: gesture 'bounce' -> method 'startBounce'
        return `start${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    }

    /**
     * Get all gestures in a category
     * @param {string} category - Category name
     * @returns {Array<string>} Gesture names in category
     */
    getByCategory(category) {
        const categorySet = this.categories.get(category);
        return categorySet ? Array.from(categorySet) : [];
    }

    /**
     * Get all gesture names
     * @returns {Array<string>} All registered gesture names
     */
    getAllNames() {
        return Array.from(this.gestures.keys());
    }

    /**
     * Get all categories
     * @returns {Array<string>} All category names
     */
    getAllCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * Get gesture metadata
     * @param {string} name - Gesture name
     * @returns {Object|null} Gesture metadata or null
     */
    getMetadata(name) {
        return this.metadata.get(name) || null;
    }

    /**
     * Remove a gesture
     * @param {string} name - Gesture name to remove
     * @returns {boolean} Whether gesture was removed
     */
    unregister(name) {
        if (!this.gestures.has(name)) {
            return false;
        }

        const gesture = this.gestures.get(name);

        // Remove from category
        if (gesture.category && this.categories.has(gesture.category)) {
            this.categories.get(gesture.category).delete(name);
        }

        // Remove from all maps
        this.gestures.delete(name);
        this.rendererMethods.delete(name);
        this.metadata.delete(name);

        this.logger.info(`Unregistered gesture: ${name}`);
        return true;
    }

    /**
     * Register built-in gestures
     * @private
     */
    registerBuiltInGestures() {
        // Movement gestures
        const movements = [
            { name: 'bounce', type: 'gesture', category: 'movement', rendererMethod: 'startBounce' },
            { name: 'spin', type: 'gesture', category: 'movement', rendererMethod: 'startSpin' },
            { name: 'orbit', type: 'gesture', category: 'movement', rendererMethod: 'startOrbit' },
            { name: 'sway', type: 'gesture', category: 'movement', rendererMethod: 'startSway' },
            { name: 'jump', type: 'gesture', category: 'movement', rendererMethod: 'startJump' },
            { name: 'twist', type: 'gesture', category: 'movement', rendererMethod: 'startTwist' },
            { name: 'float', type: 'gesture', category: 'movement', rendererMethod: 'startFloat' },
            { name: 'wiggle', type: 'gesture', category: 'movement', rendererMethod: 'startWiggle' },
            { name: 'lean', type: 'gesture', category: 'movement', rendererMethod: 'startLean' }
        ];

        // Expression gestures
        const expressions = [
            { name: 'wave', type: 'gesture', category: 'expression', rendererMethod: 'startWave' },
            { name: 'nod', type: 'gesture', category: 'expression', rendererMethod: 'startNod' },
            { name: 'shake', type: 'gesture', category: 'expression', rendererMethod: 'startShake' },
            { name: 'point', type: 'gesture', category: 'expression', rendererMethod: 'startPoint' },
            { name: 'tilt', type: 'gesture', category: 'expression', rendererMethod: 'startTilt' },
            { name: 'reach', type: 'gesture', category: 'expression', rendererMethod: 'startReach' },
            { name: 'headBob', type: 'gesture', category: 'expression', rendererMethod: 'startHeadBob' }
        ];

        // Effect gestures
        const effects = [
            { name: 'pulse', type: 'gesture', category: 'effects', rendererMethod: 'startPulse' },
            { name: 'glow', type: 'gesture', category: 'effects', rendererMethod: 'startGlow' },
            { name: 'sparkle', type: 'gesture', category: 'effects', rendererMethod: 'startSparkle' },
            { name: 'shimmer', type: 'gesture', category: 'effects', rendererMethod: 'startShimmer' },
            { name: 'flash', type: 'gesture', category: 'effects', rendererMethod: 'startFlash' },
            { name: 'flicker', type: 'gesture', category: 'effects', rendererMethod: 'startFlicker' },
            { name: 'vibrate', type: 'gesture', category: 'effects', rendererMethod: 'startVibrate' }
        ];

        // Ambient gestures
        const ambient = [
            { name: 'breathe', type: 'ambient', category: 'ambient', rendererMethod: 'startBreathe', duration: -1 },
            { name: 'idle', type: 'ambient', category: 'ambient', rendererMethod: 'startIdle', duration: -1 },
            { name: 'drift', type: 'ambient', category: 'ambient', rendererMethod: 'startDrift', duration: -1 }
        ];

        // Groove gestures
        const grooves = [
            { name: 'grooveSway', type: 'ambient', category: 'groove', rendererMethod: 'startGrooveSway', duration: -1 },
            { name: 'grooveBob', type: 'ambient', category: 'groove', rendererMethod: 'startGrooveBob', duration: -1 },
            { name: 'grooveFlow', type: 'ambient', category: 'groove', rendererMethod: 'startGrooveFlow', duration: -1 },
            { name: 'groovePulse', type: 'ambient', category: 'groove', rendererMethod: 'startGroovePulse', duration: -1 },
            { name: 'grooveStep', type: 'ambient', category: 'groove', rendererMethod: 'startGrooveStep', duration: -1 }
        ];

        // Register all built-in gestures
        [...movements, ...expressions, ...effects, ...ambient, ...grooves].forEach(gesture => {
            this.register(gesture.name, gesture);
        });

        this.logger.info(`Registered ${this.gestures.size} built-in gestures`);
    }

    /**
     * Get gesture compatibility info
     * @param {string} gesture1 - First gesture name
     * @param {string} gesture2 - Second gesture name
     * @returns {boolean} Whether gestures can play simultaneously
     */
    areCompatible(gesture1, gesture2) {
        const meta1 = this.getMetadata(gesture1);
        const meta2 = this.getMetadata(gesture2);

        if (!meta1 || !meta2) {
            return false;
        }

        // Same gesture cannot play twice
        if (gesture1 === gesture2) {
            return false;
        }

        // Check category compatibility
        if (meta1.category === 'movement' && meta2.category === 'movement') {
            return false; // Only one movement at a time
        }

        // Effects can combine with anything
        if (meta1.category === 'effects' || meta2.category === 'effects') {
            return true;
        }

        // Ambient gestures don't mix well
        if (meta1.category === 'ambient' && meta2.category === 'ambient') {
            return false;
        }

        // Default to compatible
        return true;
    }

    /**
     * Export registry data for debugging
     * @returns {Object} Registry data
     */
    export() {
        return {
            gestures: Array.from(this.gestures.entries()),
            categories: Array.from(this.categories.entries()).map(([cat, set]) => [cat, Array.from(set)]),
            metadata: Array.from(this.metadata.entries()),
            rendererMethods: Array.from(this.rendererMethods.entries())
        };
    }

    /**
     * Import registry data
     * @param {Object} data - Registry data to import
     */
    import(data) {
        if (data.gestures) {
            data.gestures.forEach(([name, def]) => this.register(name, def));
        }
    }

    /**
     * Clear all registrations
     */
    clear() {
        this.gestures.clear();
        this.rendererMethods.clear();
        this.categories.clear();
        this.metadata.clear();
        this.logger.info('Registry cleared');
    }

    /**
     * Get statistics about registered gestures
     * @returns {Object} Registry statistics
     */
    getStats() {
        const stats = {
            total: this.gestures.size,
            byCategory: {},
            byType: {}
        };

        // Count by category
        this.categories.forEach((gestures, category) => {
            stats.byCategory[category] = gestures.size;
        });

        // Count by type
        this.metadata.forEach(meta => {
            stats.byType[meta.type] = (stats.byType[meta.type] || 0) + 1;
        });

        return stats;
    }
}

// Create singleton instance
const gestureRegistry = new GestureRegistry();

// Export as default
export default gestureRegistry;

// Also export class for testing
export { GestureRegistry };

// Make available globally if needed
if (typeof window !== 'undefined') {
    window.gestureRegistry = gestureRegistry;
}