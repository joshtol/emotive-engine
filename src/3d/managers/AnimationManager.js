/**
 * AnimationManager - Gesture animation orchestration for 3D mascot
 *
 * Manages gesture playback, virtual particle pools, and animation lifecycle.
 * Extracted from Core3DManager to improve separation of concerns.
 *
 * @module 3d/managers/AnimationManager
 */

import { getGesture } from '../../core/gestures/index.js';

/**
 * Maximum number of concurrent animations to prevent memory issues
 */
const MAX_ACTIVE_ANIMATIONS = 10;

/**
 * Default pool size for virtual particles
 */
const DEFAULT_POOL_SIZE = 5;

export class AnimationManager {
    /**
     * Create animation manager
     * @param {ProceduralAnimator} animator - The procedural animator instance
     * @param {GestureBlender} gestureBlender - The gesture blender for combining animations
     */
    constructor(animator, gestureBlender) {
        this.animator = animator;
        this.gestureBlender = gestureBlender;

        // Virtual particle pool for gesture animations (prevents closure memory leaks)
        this.virtualParticlePool = this._createVirtualParticlePool(DEFAULT_POOL_SIZE);
        this.nextPoolIndex = 0;
    }

    /**
     * Create reusable virtual particle object pool
     * @param {number} size - Pool size
     * @returns {Array} Array of reusable particle objects
     * @private
     */
    _createVirtualParticlePool(size) {
        const pool = [];
        for (let i = 0; i < size; i++) {
            pool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 1,
                baseSize: 1,
                opacity: 1,
                scaleFactor: 1,
                gestureData: null
            });
        }
        return pool;
    }

    /**
     * Get next virtual particle from pool (round-robin)
     * @returns {Object} Reusable virtual particle object
     */
    getVirtualParticleFromPool() {
        const particle = this.virtualParticlePool[this.nextPoolIndex];
        this.nextPoolIndex = (this.nextPoolIndex + 1) % this.virtualParticlePool.length;
        // Reset particle state
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.size = 1;
        particle.baseSize = 1;
        particle.opacity = 1;
        particle.scaleFactor = 1;
        particle.gestureData = null;
        return particle;
    }

    /**
     * Play gesture animation using 2D gesture data translated to 3D
     * @param {string} gestureName - Name of the gesture to play
     * @param {Object} callbacks - Callback functions
     * @param {Function} callbacks.onUpdate - Called with (props, progress) during animation
     * @param {Function} callbacks.onComplete - Called when animation completes
     * @returns {boolean} True if gesture was started successfully
     */
    playGesture(gestureName, callbacks = {}) {
        // Get the 2D gesture definition
        const gesture2D = getGesture(gestureName);

        if (!gesture2D) {
            console.warn(`Unknown gesture: ${gestureName}`);
            return false;
        }

        // Get reusable virtual particle from pool (prevent closure memory leaks)
        const virtualParticle = this.getVirtualParticleFromPool();

        // Get gesture config for duration
        const config = gesture2D.config || {};
        const duration = config.musicalDuration?.musical
            ? (config.musicalDuration.beats || 2) * 500  // Assume 120 BPM (500ms per beat)
            : (config.duration || 800);

        // Start time-based animation
        const startTime = this.animator.time;

        // Enforce animation array size limit (prevent unbounded growth memory leak)
        if (this.animator.animations.length >= MAX_ACTIVE_ANIMATIONS) {
            // Remove oldest animation (FIFO cleanup)
            const removed = this.animator.animations.shift();
            console.warn(`Animation limit reached (${MAX_ACTIVE_ANIMATIONS}), removed oldest: ${removed.gestureName || 'unknown'}`);
        }

        // Create persistent gesture data object for this gesture instance
        const gestureData = { initialized: false };

        // Add to animator's active animations
        this.animator.animations.push({
            gestureName, // Store gesture name for particle system
            duration,
            startTime,
            config, // Store config for particle system
            evaluate: t => {
                // Reset virtual particle to center each frame
                virtualParticle.x = 0;
                virtualParticle.y = 0;
                virtualParticle.vx = 0;
                virtualParticle.vy = 0;
                virtualParticle.size = 1;
                virtualParticle.opacity = 1;

                // All gestures now have native 3D implementations
                // Apply gesture to virtual particle if needed
                if (gesture2D.apply) {
                    gesture2D.apply(virtualParticle, gestureData, config, t, 1.0, 0, 0);
                }

                // Call gesture's 3D evaluate function with particle data
                const motion = {
                    ...config,
                    particle: virtualParticle,
                    config,
                    strength: config.strength || 1.0
                };

                // Safety check: if gesture doesn't have 3D implementation, return neutral transform
                if (!gesture2D['3d'] || !gesture2D['3d'].evaluate) {
                    return {
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        scale: 1.0
                    };
                }

                // Call with gesture2D as context so 'this.config' works
                return gesture2D['3d'].evaluate.call(gesture2D, t, motion);
            },
            callbacks: {
                onUpdate: callbacks.onUpdate || null,
                onComplete: () => {
                    // Clean up gesture
                    if (gesture2D.cleanup) {
                        gesture2D.cleanup(virtualParticle);
                    }
                    // Call user callback
                    if (callbacks.onComplete) {
                        callbacks.onComplete();
                    }
                }
            }
        });

        return true;
    }

    /**
     * Update animations for current frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        this.animator.update(deltaTime);
    }

    /**
     * Blend all active animations
     * @param {THREE.Quaternion} baseQuaternion - Base rotation quaternion
     * @param {number} baseScale - Base scale value
     * @param {number} baseGlowIntensity - Base glow intensity
     * @returns {Object} Blended animation state
     */
    blend(baseQuaternion, baseScale, baseGlowIntensity) {
        return this.gestureBlender.blend(
            this.animator.animations,
            this.animator.time,
            baseQuaternion,
            baseScale,
            baseGlowIntensity
        );
    }

    /**
     * Check if any animations are active
     * @returns {boolean} True if animations are playing
     */
    hasActiveAnimations() {
        return this.animator.animations.length > 0;
    }

    /**
     * Get count of active animations
     * @returns {number} Number of active animations
     */
    getActiveAnimationCount() {
        return this.animator.animations.length;
    }

    /**
     * Get current animator time
     * @returns {number} Current animation time
     */
    getTime() {
        return this.animator.time;
    }

    /**
     * Get active animations array (for external systems like particle translator)
     * @returns {Array} Active animations
     */
    getActiveAnimations() {
        return this.animator.animations;
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.animator.stopAll();
    }

    /**
     * Play emotion animation
     * @param {string} emotion - Emotion name
     */
    playEmotion(emotion) {
        this.animator.playEmotion(emotion);
    }

    /**
     * Clean up and dispose resources
     */
    dispose() {
        this.stopAll();

        if (this.virtualParticlePool) {
            this.virtualParticlePool.length = 0;
            this.virtualParticlePool = null;
        }

        this.animator = null;
        this.gestureBlender = null;
        this.tempEuler = null;
        this.gestureQuaternion = null;
    }
}

export default AnimationManager;
