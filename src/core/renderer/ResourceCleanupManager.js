/**
 * ResourceCleanupManager
 *
 * Manages cleanup and destruction of renderer resources.
 * Handles:
 * - Animation frame cancellation
 * - Animation loop callback unregistration
 * - Sleep manager cleanup
 * - Gaze tracking cleanup
 * - Timeout clearing
 * - Animation state cleanup
 * - Resource deallocation
 */
import { animationLoopManager } from '../AnimationLoopManager.js';

export class ResourceCleanupManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Clean up all resources
     */
    destroy() {
        this.cancelAnimationFrames();
        this.unregisterLoopCallbacks();
        this.cleanupManagers();
        this.clearTimeouts();
        this.clearAnimationStates();
        this.clearOtherResources();
    }

    /**
     * Cancel all animation frames to prevent memory leaks
     */
    cancelAnimationFrames() {
        for (const key in this.renderer.animationFrameIds) {
            if (this.renderer.animationFrameIds[key]) {
                cancelAnimationFrame(this.renderer.animationFrameIds[key]);
                this.renderer.animationFrameIds[key] = null;
            }
        }
    }

    /**
     * Unregister all animation loop callbacks to prevent accumulation
     */
    unregisterLoopCallbacks() {
        for (const key in this.renderer.loopCallbackIds) {
            if (this.renderer.loopCallbackIds[key]) {
                animationLoopManager.unregister(this.renderer.loopCallbackIds[key]);
                this.renderer.loopCallbackIds[key] = null;
            }
        }
    }

    /**
     * Clean up manager instances
     */
    cleanupManagers() {
        // Clean up sleep manager (handles eyeClose/eyeOpen callbacks and wakeJitterTimeout)
        if (this.renderer.sleepManager) {
            this.renderer.sleepManager.cleanup();
        }

        // Clean up gaze tracking
        if (this.renderer.gazeTracker) {
            this.renderer.gazeTracker.cleanup();
        }
    }

    /**
     * Clear any pending timeouts
     */
    clearTimeouts() {
        if (this.renderer.wakeJitterTimeout) {
            clearTimeout(this.renderer.wakeJitterTimeout);
            this.renderer.wakeJitterTimeout = null;
        }
    }

    /**
     * Clear animation states
     */
    clearAnimationStates() {
        this.renderer.colorTransition.active = false;
    }

    /**
     * Clear other resources
     */
    clearOtherResources() {
        // Clean up gaze tracking listeners
        this.renderer.cleanupGazeTracking();

        // Clear speaking rings
        this.renderer.speakingRings = [];

        // Clear gesture compositor cache
        if (this.renderer.gestureCompositor) {
            this.renderer.gestureCompositor.clearCache();
        }

        // Destroy modular components
        if (this.renderer.specialEffects) {
            this.renderer.specialEffects.destroy();
        }

        // Clean up offscreen canvas resources
        if (this.renderer.cleanupOffscreenCanvas) {
            this.renderer.cleanupOffscreenCanvas();
        }
    }
}
