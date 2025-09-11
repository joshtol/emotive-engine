/**
 * TransitionManager - Manages shape transitions and morphing queue
 * @module core/morpher/TransitionManager
 */

export class TransitionManager {
    constructor(morpher) {
        this.morpher = morpher;
        
        // Transition state
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 800;
        this.transitionProgress = 0;
        this.easingFunction = 'easeInOutQuad';
        
        // Shape state
        this.currentShape = 'circle';
        this.targetShape = null;
        this.previousShape = null;
        
        // Morph queue
        this.morphQueue = [];
        this.maxQueueSize = 3;
        
        // Shadow effects
        this.shadowConfig = null;
        this.shadowProgress = 0;
    }

    /**
     * Start a shape transition
     * @param {string} targetShape - Target shape name
     * @param {Object} options - Transition options
     */
    startTransition(targetShape, options = {}) {
        // If already transitioning, queue it
        if (this.isTransitioning && this.morphQueue.length < this.maxQueueSize) {
            this.morphQueue.push({ shape: targetShape, options });
            return;
        }
        
        this.previousShape = this.currentShape;
        this.targetShape = targetShape;
        this.isTransitioning = true;
        this.transitionStartTime = performance.now();
        this.transitionDuration = options.duration || 800;
        this.easingFunction = options.easing || 'easeInOutQuad';
        this.transitionProgress = 0;
        
        // Get transition config for special effects
        this.shadowConfig = this.getTransitionConfig(this.currentShape, targetShape);
    }

    /**
     * Update transition progress
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.isTransitioning) return;
        
        const now = performance.now();
        const elapsed = now - this.transitionStartTime;
        const rawProgress = Math.min(1, elapsed / this.transitionDuration);
        
        // Apply easing
        this.transitionProgress = this.applyEasing(rawProgress);
        
        // Update shadow progress if configured
        if (this.shadowConfig) {
            this.shadowProgress = this.calculateShadowProgress(rawProgress);
        }
        
        // Complete transition if done
        if (rawProgress >= 1) {
            this.completeTransition();
        }
    }

    /**
     * Complete current transition
     */
    completeTransition() {
        this.currentShape = this.targetShape;
        this.targetShape = null;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.shadowConfig = null;
        
        // Process queue if there are pending morphs
        if (this.morphQueue.length > 0) {
            const next = this.morphQueue.shift();
            this.startTransition(next.shape, next.options);
        }
    }

    /**
     * Get transition configuration for special effects
     * @param {string} from - Source shape
     * @param {string} to - Target shape
     * @returns {Object} Transition configuration
     */
    getTransitionConfig(from, to) {
        // Special transition effects for certain shape combinations
        const transitions = {
            'circle-heart': {
                type: 'bloom',
                shadowColor: '#ff69b4',
                shadowIntensity: 0.3
            },
            'heart-circle': {
                type: 'contract',
                shadowColor: '#ff69b4',
                shadowIntensity: 0.2
            },
            'circle-star': {
                type: 'burst',
                shadowColor: '#ffd700',
                shadowIntensity: 0.4
            },
            'star-circle': {
                type: 'collapse',
                shadowColor: '#ffd700',
                shadowIntensity: 0.3
            }
        };
        
        const key = `${from}-${to}`;
        return transitions[key] || null;
    }

    /**
     * Calculate shadow progress for special effects
     * @param {number} progress - Raw transition progress
     * @returns {number} Shadow effect progress
     */
    calculateShadowProgress(progress) {
        if (!this.shadowConfig) return 0;
        
        switch (this.shadowConfig.type) {
            case 'bloom':
                // Expand then fade
                return progress < 0.5 
                    ? progress * 2 
                    : 2 - (progress * 2);
            
            case 'burst':
                // Quick expand and fade
                return Math.pow(1 - progress, 2);
            
            case 'contract':
            case 'collapse':
                // Fade in then shrink
                return Math.sin(progress * Math.PI);
            
            default:
                return 0;
        }
    }

    /**
     * Apply easing function to progress
     * @param {number} t - Linear progress (0-1)
     * @returns {number} Eased progress
     */
    applyEasing(t) {
        switch (this.easingFunction) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return t * (2 - t);
            case 'easeInOutQuad':
                return t < 0.5 
                    ? 2 * t * t 
                    : -1 + (4 - 2 * t) * t;
            case 'easeInCubic':
                return t * t * t;
            case 'easeOutCubic':
                return (--t) * t * t + 1;
            case 'easeInOutCubic':
                return t < 0.5 
                    ? 4 * t * t * t 
                    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            default:
                return t;
        }
    }

    /**
     * Clear morph queue
     */
    clearQueue() {
        this.morphQueue = [];
    }

    /**
     * Check if has queued morphs
     */
    hasQueuedMorphs() {
        return this.morphQueue.length > 0;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isTransitioning: this.isTransitioning,
            currentShape: this.currentShape,
            targetShape: this.targetShape,
            progress: this.transitionProgress,
            queueLength: this.morphQueue.length
        };
    }

    /**
     * Reset to default state
     */
    reset() {
        this.isTransitioning = false;
        this.currentShape = 'circle';
        this.targetShape = null;
        this.transitionProgress = 0;
        this.morphQueue = [];
        this.shadowConfig = null;
    }
}

export default TransitionManager;