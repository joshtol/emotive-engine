/**
 * AnimationMixer - Unified animation stack manager
 * Manages all active animations with proper blending, priorities, and lifecycle
 */

class AnimationMixer {
    constructor() {
        // Active animation stack
        this.animations = new Map();

        // Animation layers with priorities (lower = higher priority)
        this.layers = {
            base: { priority: 100, weight: 1.0 },      // Continuous background
            chain: { priority: 50, weight: 0.8 },      // Chain sequences
            user: { priority: 10, weight: 1.0 },       // User-triggered
            accent: { priority: 30, weight: 0.7 },     // Automatic accents
            effect: { priority: 200, weight: 0.5 }     // Visual effects
        };

        // Blend configuration
        this.config = {
            fadeInTime: 200,      // ms to fade in new animation
            fadeOutTime: 300,     // ms to fade out ending animation
            baseReduction: 0.3,   // Reduce base to 30% when user gesture active
            maxStackSize: 10,     // Maximum simultaneous animations
            smoothingFactor: 0.15 // Lerp factor for smooth transitions
        };

        // Current composite state
        this.compositeState = {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            glow: 0,
            effects: []
        };

        // Track active user gestures for base reduction
        this.activeUserGestures = new Set();

        // Animation ID counter
        this.nextId = 1;
    }

    /**
     * Add an animation to the stack
     * @param {string} name - Animation name
     * @param {string} layer - Layer type (base, user, accent, etc.)
     * @param {Object} config - Animation configuration
     * @returns {number} Animation ID
     */
    addAnimation(name, layer = 'user', config = {}) {
        const id = this.nextId++;
        const now = performance.now();

        // Create animation entry
        const animation = {
            id,
            name,
            layer,
            startTime: now,
            duration: config.duration || -1, // -1 = infinite
            fadeInTime: config.fadeInTime || this.config.fadeInTime,
            fadeOutTime: config.fadeOutTime || this.config.fadeOutTime,

            // Animation properties
            amplitude: config.amplitude || 1.0,
            frequency: config.frequency || 1.0,
            phase: config.phase || 0,

            // Transform functions
            transform: config.transform || this.getDefaultTransform(name),

            // State
            weight: 0, // Will fade in
            targetWeight: config.weight || 1.0,
            isEnding: false,
            endTime: null,

            // Blending
            blendMode: config.blendMode || 'additive',
            affectsBase: config.affectsBase !== false,

            // Additional data
            data: config.data || {}
        };

        // Add to stack
        this.animations.set(id, animation);

        // Track user gestures
        if (layer === 'user') {
            this.activeUserGestures.add(id);
        }

        // Limit stack size
        this.pruneAnimations();

        return id;
    }

    /**
     * Remove an animation with fade out
     * @param {number|string} idOrName - Animation ID or name to remove
     */
    removeAnimation(idOrName) {
        let animation;

        if (typeof idOrName === 'number') {
            animation = this.animations.get(idOrName);
        } else {
            // Find by name
            for (const [id, anim] of this.animations) {
                if (anim.name === idOrName) {
                    animation = anim;
                    break;
                }
            }
        }

        if (animation && !animation.isEnding) {
            animation.isEnding = true;
            animation.endTime = performance.now();
        }
    }

    /**
     * Update all animations and compute composite state
     * @param {number} deltaTime - Time since last update
     * @returns {Object} Composite animation state
     */
    update(deltaTime) {
        const now = performance.now();

        // Reset composite state
        const newState = {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            glow: 0,
            effects: []
        };

        // Calculate base weight reduction if user gestures active
        const baseWeightMultiplier = this.activeUserGestures.size > 0 ?
            this.config.baseReduction : 1.0;

        // Group animations by layer for priority processing
        const layeredAnimations = this.groupByLayer();

        // Process each layer in priority order
        for (const [layerName, animations] of layeredAnimations) {
            const layerConfig = this.layers[layerName] || { priority: 100, weight: 1.0 };

            for (const animation of animations) {
                // Update animation lifecycle
                this.updateAnimationLifecycle(animation, now);

                // Skip if weight is too low
                if (animation.weight < 0.01) continue;

                // Calculate animation state
                const animState = this.calculateAnimationState(animation, now);

                // Apply layer weight and base reduction
                let finalWeight = animation.weight * layerConfig.weight;
                if (layerName === 'base') {
                    finalWeight *= baseWeightMultiplier;
                }

                // Blend into composite based on blend mode
                this.blendState(newState, animState, animation.blendMode, finalWeight);
            }
        }

        // Smooth transition to new state
        this.smoothTransition(newState);

        // Clean up ended animations
        this.cleanupAnimations(now);

        return this.compositeState;
    }

    /**
     * Update animation lifecycle (fade in/out, weight)
     */
    updateAnimationLifecycle(animation, now) {
        const elapsed = now - animation.startTime;

        if (animation.isEnding) {
            // Fade out
            const fadeProgress = (now - animation.endTime) / animation.fadeOutTime;
            animation.weight = Math.max(0, animation.targetWeight * (1 - fadeProgress));
        } else if (elapsed < animation.fadeInTime) {
            // Fade in
            const fadeProgress = elapsed / animation.fadeInTime;
            animation.weight = animation.targetWeight * this.easeInOut(fadeProgress);
        } else {
            // Full weight
            animation.weight = animation.targetWeight;
        }

        // Check duration
        if (animation.duration > 0 && elapsed > animation.duration && !animation.isEnding) {
            this.removeAnimation(animation.id);
        }
    }

    /**
     * Calculate animation state at current time
     */
    calculateAnimationState(animation, now) {
        const elapsed = now - animation.startTime;
        const state = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

        // Apply transform function
        if (animation.transform) {
            animation.transform(state, elapsed, animation);
        }

        // Apply amplitude
        state.x *= animation.amplitude;
        state.y *= animation.amplitude;
        state.rotation *= animation.amplitude;

        return state;
    }

    /**
     * Blend animation state into composite
     */
    blendState(composite, animState, blendMode, weight) {
        switch (blendMode) {
            case 'additive':
                composite.x += animState.x * weight;
                composite.y += animState.y * weight;
                composite.rotation += animState.rotation * weight;
                composite.scale *= 1 + (animState.scale - 1) * weight;
                break;

            case 'multiply':
                composite.x *= 1 + animState.x * weight * 0.01;
                composite.y *= 1 + animState.y * weight * 0.01;
                composite.rotation *= 1 + animState.rotation * weight * 0.01;
                composite.scale *= animState.scale;
                break;

            case 'override':
                composite.x = animState.x * weight + composite.x * (1 - weight);
                composite.y = animState.y * weight + composite.y * (1 - weight);
                composite.rotation = animState.rotation * weight + composite.rotation * (1 - weight);
                composite.scale = animState.scale * weight + composite.scale * (1 - weight);
                break;

            case 'max':
                composite.x = Math.max(composite.x, animState.x * weight);
                composite.y = Math.max(composite.y, animState.y * weight);
                composite.rotation = Math.max(composite.rotation, animState.rotation * weight);
                break;
        }

        // Always blend opacity multiplicatively
        composite.opacity *= animState.opacity;
    }

    /**
     * Smooth transition to new state
     */
    smoothTransition(newState) {
        const factor = this.config.smoothingFactor;

        this.compositeState.x = this.lerp(this.compositeState.x, newState.x, factor);
        this.compositeState.y = this.lerp(this.compositeState.y, newState.y, factor);
        this.compositeState.rotation = this.lerp(this.compositeState.rotation, newState.rotation, factor);
        this.compositeState.scale = this.lerp(this.compositeState.scale, newState.scale, factor);
        this.compositeState.opacity = this.lerp(this.compositeState.opacity, newState.opacity, factor);
    }

    /**
     * Get default transform for known gestures
     */
    getDefaultTransform(name) {
        const transforms = {
            // Base movements
            grooveSway: (state, elapsed, anim) => {
                state.x = Math.sin(elapsed * 0.002 * anim.frequency) * 15;
                state.rotation = Math.sin(elapsed * 0.002 * anim.frequency + Math.PI/4) * 5;
            },
            grooveBob: (state, elapsed, anim) => {
                state.y = Math.sin(elapsed * 0.0025 * anim.frequency) * 10;
                state.scale = 1 + Math.sin(elapsed * 0.0025 * anim.frequency) * 0.03;
            },
            grooveFlow: (state, elapsed, anim) => {
                const t = elapsed * 0.001 * anim.frequency;
                state.x = Math.sin(t) * Math.cos(t * 2) * 20;
                state.y = Math.cos(t) * Math.sin(t * 2) * 10;
                state.rotation = Math.sin(t * 2) * 8;
            },

            // User gestures
            bounce: (state, elapsed, anim) => {
                const t = elapsed * 0.004 * anim.frequency;
                state.y = -Math.abs(Math.sin(t)) * 30;
                state.scale = 1 + Math.abs(Math.sin(t)) * 0.1;
            },
            spin: (state, elapsed, anim) => {
                state.rotation = (elapsed * 0.3 * anim.frequency) % 360;
            },
            wave: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.x = Math.sin(t) * 20;
                state.rotation = Math.sin(t) * 15;
            },
            pulse: (state, elapsed, anim) => {
                const t = elapsed * 0.005 * anim.frequency;
                state.scale = 1 + Math.sin(t) * 0.2;
            },
            shake: (state, elapsed, anim) => {
                state.x = Math.sin(elapsed * 0.05) * 5;
                state.rotation = Math.sin(elapsed * 0.05) * 3;
            },
            wiggle: (state, elapsed, anim) => {
                state.x = Math.sin(elapsed * 0.01) * 10;
                state.rotation = Math.sin(elapsed * 0.01 + Math.PI/2) * 5;
            },

            // Additional gestures
            sway: (state, elapsed, anim) => {
                const t = elapsed * 0.002 * anim.frequency;
                state.x = Math.sin(t) * 25;
                state.rotation = Math.sin(t + Math.PI/4) * 8;
            },
            jump: (state, elapsed, anim) => {
                const t = elapsed * 0.005 * anim.frequency;
                const jumpHeight = Math.max(0, Math.sin(t));
                state.y = -jumpHeight * 40;
                state.scale = 1 - jumpHeight * 0.05;
            },
            glow: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.glow = 1 + Math.sin(t) * 0.5;
                state.scale = 1 + Math.sin(t) * 0.02;
            },
            sparkle: (state, elapsed, anim) => {
                const t = elapsed * 0.01 * anim.frequency;
                state.glow = 1 + Math.random() * 0.3;
                state.scale = 1 + Math.sin(t * 10) * 0.02;
            },
            shimmer: (state, elapsed, anim) => {
                const t = elapsed * 0.008 * anim.frequency;
                state.x = Math.sin(t * 5) * 2;
                state.glow = 1 + Math.sin(t) * 0.3;
            },
            nod: (state, elapsed, anim) => {
                const t = elapsed * 0.004 * anim.frequency;
                state.y = Math.sin(t) * 8;
                state.rotation = Math.sin(t) * 3;
            },
            tilt: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.rotation = Math.sin(t) * 20;
            },
            flash: (state, elapsed, anim) => {
                const t = elapsed * 0.01 * anim.frequency;
                state.opacity = 0.7 + Math.sin(t * 10) * 0.3;
                state.glow = 2;
            },
            lean: (state, elapsed, anim) => {
                const t = elapsed * 0.002 * anim.frequency;
                state.x = Math.sin(t) * 15;
                state.rotation = Math.sin(t) * 10;
            },
            reach: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.x = Math.sin(t) * 30;
                state.scale = 1 + Math.sin(t) * 0.05;
            },
            point: (state, elapsed, anim) => {
                const t = elapsed * 0.004 * anim.frequency;
                state.x = Math.sin(t) * 20;
                state.rotation = -Math.sin(t) * 5;
            },
            orbit: (state, elapsed, anim) => {
                const t = elapsed * 0.002 * anim.frequency;
                state.x = Math.cos(t) * 30;
                state.y = Math.sin(t) * 30;
                state.rotation = t * 57.3; // Convert radians to degrees
            },
            headBob: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.y = Math.sin(t) * 5;
                state.scale = 1 + Math.sin(t * 2) * 0.02;
            },
            flicker: (state, elapsed, anim) => {
                state.opacity = 0.8 + Math.random() * 0.2;
                state.glow = 0.8 + Math.random() * 0.4;
            },
            breathe: (state, elapsed, anim) => {
                const t = elapsed * 0.001 * anim.frequency;
                state.scale = 1 + Math.sin(t) * 0.08;
                state.y = Math.sin(t) * 3;
            },
            float: (state, elapsed, anim) => {
                const t = elapsed * 0.001 * anim.frequency;
                state.y = Math.sin(t) * 15;
                state.x = Math.sin(t * 0.7) * 5;
            },
            rain: (state, elapsed, anim) => {
                const t = elapsed * 0.005 * anim.frequency;
                state.y = (t * 50) % 100 - 50;
                state.opacity = 1 - Math.abs(state.y) / 50;
            },
            hula: (state, elapsed, anim) => {
                const t = elapsed * 0.003 * anim.frequency;
                state.x = Math.sin(t) * 20;
                state.rotation = Math.cos(t) * 10;
            },
            twist: (state, elapsed, anim) => {
                const t = elapsed * 0.004 * anim.frequency;
                state.rotation = Math.sin(t) * 30;
                state.scale = 1 + Math.sin(t * 2) * 0.05;
            },
            groove: (state, elapsed, anim) => {
                const t = elapsed * 0.002 * anim.frequency;
                state.x = Math.sin(t) * 15;
                state.y = Math.sin(t * 2) * 5;
                state.rotation = Math.sin(t + Math.PI/3) * 5;
            }
        };

        return transforms[name] || null;
    }

    /**
     * Group animations by layer
     */
    groupByLayer() {
        const grouped = new Map();

        // Sort layers by priority
        const sortedLayers = Object.entries(this.layers)
            .sort((a, b) => a[1].priority - b[1].priority)
            .map(([name]) => name);

        // Initialize groups
        for (const layer of sortedLayers) {
            grouped.set(layer, []);
        }

        // Group animations
        for (const animation of this.animations.values()) {
            const group = grouped.get(animation.layer) || grouped.get('user');
            group.push(animation);
        }

        return grouped;
    }

    /**
     * Clean up ended animations
     */
    cleanupAnimations(now) {
        for (const [id, animation] of this.animations) {
            if (animation.isEnding && animation.weight <= 0) {
                this.animations.delete(id);
                this.activeUserGestures.delete(id);
            }
        }
    }

    /**
     * Prune oldest animations if stack too large
     */
    pruneAnimations() {
        if (this.animations.size > this.config.maxStackSize) {
            // Find oldest non-base animations
            const sortedAnims = Array.from(this.animations.values())
                .filter(a => a.layer !== 'base' && !a.isEnding)
                .sort((a, b) => a.startTime - b.startTime);

            // Remove oldest
            const toRemove = this.animations.size - this.config.maxStackSize;
            for (let i = 0; i < toRemove && i < sortedAnims.length; i++) {
                this.removeAnimation(sortedAnims[i].id);
            }
        }
    }

    /**
     * Check if animation is active
     */
    isActive(nameOrId) {
        if (typeof nameOrId === 'number') {
            return this.animations.has(nameOrId);
        }

        for (const animation of this.animations.values()) {
            if (animation.name === nameOrId && !animation.isEnding) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all active animation names
     */
    getActiveAnimations() {
        return Array.from(this.animations.values())
            .filter(a => !a.isEnding)
            .map(a => a.name);
    }

    /**
     * Clear all animations except base
     */
    clearNonBase() {
        for (const [id, animation] of this.animations) {
            if (animation.layer !== 'base') {
                this.removeAnimation(id);
            }
        }
    }

    /**
     * Utility functions
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : -1 + (4 - 2 * t) * t;
    }
}

// Export as ES6 module
export default AnimationMixer;

// Make available globally
if (typeof window !== 'undefined') {
    window.AnimationMixer = AnimationMixer;
}