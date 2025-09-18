/**
 * GestureBlender - Manages layered gesture execution and smooth blending
 * Allows multiple gestures to run simultaneously with proper mixing
 */

class GestureBlender {
    constructor() {
        // Active gesture layers
        this.layers = {
            base: null,      // Continuous ambient movement
            accent: null,    // Beat-synced accent gestures
            transition: null, // Smooth transitions between states
            composite: null,  // Complex multi-gesture sequences
            overlay: []      // Additional effects that can stack
        };

        // Layer priorities (lower = higher priority)
        this.priorities = {
            composite: 1,    // Highest priority when active
            accent: 2,
            transition: 3,
            base: 4,         // Lowest priority
            overlay: 5       // Can coexist with others
        };

        // Blend modes for combining layers
        this.blendModes = {
            replace: 'replace',     // Completely replace lower layers
            additive: 'additive',   // Add to existing movement
            multiply: 'multiply',   // Multiply amplitudes
            average: 'average',     // Average between layers
            max: 'max'             // Take maximum of each parameter
        };

        // Active state
        this.state = {
            isBlending: false,
            currentBlend: {},
            transitionProgress: 0,
            baseIntensity: 1.0
        };
    }

    /**
     * Set the base ambient movement layer
     * @param {string} gestureName - Name of the ambient gesture
     * @param {Object} options - Options for the base layer
     */
    setBaseLayer(gestureName, options = {}) {
        if (this.layers.base === gestureName) return;

        const previousBase = this.layers.base;
        this.layers.base = {
            gesture: gestureName,
            intensity: options.intensity || 1.0,
            startTime: Date.now(),
            options: options
        };

        // Smooth transition from previous base
        if (previousBase) {
            this.startTransition(previousBase, gestureName, 1000);
        }
    }

    /**
     * Trigger an accent gesture on top of base
     * @param {string} gestureName - Name of the accent gesture
     * @param {number} velocity - Velocity/intensity (0-1)
     * @param {Object} options - Additional options
     */
    triggerAccent(gestureName, velocity = 1.0, options = {}) {
        this.layers.accent = {
            gesture: gestureName,
            velocity: velocity,
            startTime: Date.now(),
            duration: options.duration || 500,
            blendMode: options.blendMode || 'additive',
            options: options
        };
    }

    /**
     * Start a transition between positions
     * @param {string} from - Starting state
     * @param {string} to - Ending state
     * @param {number} duration - Transition duration in ms
     */
    startTransition(from, to, duration = 500) {
        this.layers.transition = {
            from: from,
            to: to,
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            easing: 'cubicInOut'
        };
        this.state.isBlending = true;
    }

    /**
     * Execute a composite dance move
     * @param {string} compositeName - Name of the composite gesture
     * @param {Object} options - Options for the composite
     */
    executeComposite(compositeName, options = {}) {
        this.layers.composite = {
            gesture: compositeName,
            startTime: Date.now(),
            currentStep: 0,
            options: options
        };
    }

    /**
     * Add an overlay effect
     * @param {string} effectName - Name of the overlay effect
     * @param {Object} options - Effect options
     */
    addOverlay(effectName, options = {}) {
        this.layers.overlay.push({
            gesture: effectName,
            startTime: Date.now(),
            duration: options.duration || -1,
            intensity: options.intensity || 0.5,
            options: options
        });

        // Limit overlay count
        if (this.layers.overlay.length > 5) {
            this.layers.overlay.shift();
        }
    }

    /**
     * Update the blender state and calculate current blend
     * @param {number} deltaTime - Time since last update
     * @returns {Object} Current blended gesture state
     */
    update(deltaTime) {
        const now = Date.now();
        const blendedState = {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            gestures: []
        };

        // Process base layer
        if (this.layers.base) {
            const baseGesture = this.processBaseLayer(now);
            this.applyGestureToState(blendedState, baseGesture, 'replace');
            blendedState.gestures.push(this.layers.base.gesture);
        }

        // Process transition layer
        if (this.layers.transition) {
            const transitionState = this.processTransition(now);
            if (transitionState) {
                this.applyGestureToState(blendedState, transitionState, 'average');
            } else {
                this.layers.transition = null;
            }
        }

        // Process accent layer
        if (this.layers.accent) {
            const accentState = this.processAccent(now);
            if (accentState) {
                this.applyGestureToState(blendedState, accentState, this.layers.accent.blendMode);
                blendedState.gestures.push(this.layers.accent.gesture);
            } else {
                this.layers.accent = null;
            }
        }

        // Process composite layer
        if (this.layers.composite) {
            const compositeState = this.processComposite(now);
            if (compositeState) {
                this.applyGestureToState(blendedState, compositeState, 'replace');
                blendedState.gestures = [this.layers.composite.gesture];
            } else {
                this.layers.composite = null;
            }
        }

        // Process overlay effects
        this.layers.overlay = this.layers.overlay.filter(overlay => {
            const overlayState = this.processOverlay(overlay, now);
            if (overlayState) {
                this.applyGestureToState(blendedState, overlayState, 'additive');
                return true;
            }
            return false;
        });

        this.state.currentBlend = blendedState;
        return blendedState;
    }

    /**
     * Process base layer animation
     */
    processBaseLayer(now) {
        const elapsed = now - this.layers.base.startTime;
        const phase = (elapsed / 1000) % 1; // Loop every second

        return {
            x: Math.sin(phase * Math.PI * 2) * 10 * this.layers.base.intensity,
            y: Math.cos(phase * Math.PI * 2) * 5 * this.layers.base.intensity,
            rotation: Math.sin(phase * Math.PI * 4) * 3,
            scale: 1 + Math.sin(phase * Math.PI * 2) * 0.02
        };
    }

    /**
     * Process accent gesture
     */
    processAccent(now) {
        const elapsed = now - this.layers.accent.startTime;
        if (elapsed > this.layers.accent.duration) {
            return null;
        }

        const progress = elapsed / this.layers.accent.duration;
        const velocity = this.layers.accent.velocity;

        return {
            y: Math.sin(progress * Math.PI) * -20 * velocity,
            scale: 1 + Math.sin(progress * Math.PI) * 0.1 * velocity,
            rotation: Math.sin(progress * Math.PI * 2) * 10 * velocity
        };
    }

    /**
     * Process transition
     */
    processTransition(now) {
        const elapsed = now - this.layers.transition.startTime;
        if (elapsed > this.layers.transition.duration) {
            return null;
        }

        const progress = this.easeInOutCubic(elapsed / this.layers.transition.duration);

        return {
            x: progress * 20,
            rotation: progress * 180,
            opacity: 0.8 + progress * 0.2
        };
    }

    /**
     * Process composite gesture sequence
     */
    processComposite(now) {
        // This would process the composite gesture steps
        // For now, return a placeholder
        const elapsed = now - this.layers.composite.startTime;
        if (elapsed > 3000) { // 3 second composite
            return null;
        }

        return {
            x: Math.sin(elapsed / 200) * 30,
            y: Math.cos(elapsed / 200) * 20,
            rotation: elapsed / 10,
            scale: 1 + Math.sin(elapsed / 500) * 0.2
        };
    }

    /**
     * Process overlay effect
     */
    processOverlay(overlay, now) {
        const elapsed = now - overlay.startTime;
        if (overlay.duration > 0 && elapsed > overlay.duration) {
            return null;
        }

        return {
            opacity: 0.9 + Math.sin(elapsed / 100) * 0.1 * overlay.intensity
        };
    }

    /**
     * Apply gesture state to blended state based on blend mode
     */
    applyGestureToState(blendedState, gestureState, blendMode) {
        if (!gestureState) return;

        switch (blendMode) {
            case 'replace':
                Object.assign(blendedState, gestureState);
                break;

            case 'additive':
                blendedState.x = (blendedState.x || 0) + (gestureState.x || 0);
                blendedState.y = (blendedState.y || 0) + (gestureState.y || 0);
                blendedState.rotation = (blendedState.rotation || 0) + (gestureState.rotation || 0);
                blendedState.scale = (blendedState.scale || 1) * (gestureState.scale || 1);
                break;

            case 'average':
                blendedState.x = ((blendedState.x || 0) + (gestureState.x || 0)) / 2;
                blendedState.y = ((blendedState.y || 0) + (gestureState.y || 0)) / 2;
                blendedState.rotation = ((blendedState.rotation || 0) + (gestureState.rotation || 0)) / 2;
                break;

            case 'multiply':
                blendedState.x = (blendedState.x || 0) * (gestureState.x || 1);
                blendedState.y = (blendedState.y || 0) * (gestureState.y || 1);
                blendedState.scale = (blendedState.scale || 1) * (gestureState.scale || 1);
                break;

            case 'max':
                blendedState.x = Math.max(blendedState.x || 0, gestureState.x || 0);
                blendedState.y = Math.max(blendedState.y || 0, gestureState.y || 0);
                blendedState.rotation = Math.max(blendedState.rotation || 0, gestureState.rotation || 0);
                break;
        }

        // Preserve opacity
        if (gestureState.opacity !== undefined) {
            blendedState.opacity = Math.min(blendedState.opacity, gestureState.opacity);
        }
    }

    /**
     * Clear a specific layer
     */
    clearLayer(layerName) {
        if (layerName === 'overlay') {
            this.layers.overlay = [];
        } else {
            this.layers[layerName] = null;
        }
    }

    /**
     * Clear all layers
     */
    clearAll() {
        this.layers.base = null;
        this.layers.accent = null;
        this.layers.transition = null;
        this.layers.composite = null;
        this.layers.overlay = [];
        this.state.currentBlend = {};
    }

    /**
     * Get current active gestures
     */
    getActiveGestures() {
        const active = [];
        if (this.layers.base) active.push(this.layers.base.gesture);
        if (this.layers.accent) active.push(this.layers.accent.gesture);
        if (this.layers.composite) active.push(this.layers.composite.gesture);
        this.layers.overlay.forEach(o => active.push(o.gesture));
        return active;
    }

    /**
     * Set base layer intensity
     */
    setBaseIntensity(intensity) {
        this.state.baseIntensity = Math.max(0, Math.min(1, intensity));
        if (this.layers.base) {
            this.layers.base.intensity = this.state.baseIntensity;
        }
    }

    /**
     * Easing function for smooth transitions
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// Export as ES6 module
export default GestureBlender;

// Make available globally
if (typeof window !== 'undefined') {
    window.GestureBlender = GestureBlender;
}