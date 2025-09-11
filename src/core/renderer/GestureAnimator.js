/**
 * GestureAnimator - Handles all gesture animations for EmotiveRenderer
 * @module core/renderer/GestureAnimator
 */

export class GestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeGestures = new Map();
        this.gestureQueue = [];
    }

    /**
     * Start a gesture animation
     * @param {string} gestureName - Name of the gesture to start
     */
    startGesture(gestureName) {
        // Delegate back to renderer's original startGesture method
        // This allows incremental refactoring
        if (this.renderer.startGesture) {
            return this.renderer.startGesture(gestureName);
        }
    }

    /**
     * Update active gestures
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update logic will be moved here
    }

    /**
     * Stop all active gestures
     */
    stopAllGestures() {
        this.activeGestures.clear();
        this.gestureQueue = [];
    }

    // Individual gesture methods - these will be moved from EmotiveRenderer
    startBounce() { this.startGesture('bounce'); }
    startPulse() { this.startGesture('pulse'); }
    startShake() { this.startGesture('shake'); }
    startSpin() { this.startGesture('spin'); }
    startNod() { this.startGesture('nod'); }
    startTilt() { this.startGesture('tilt'); }
    startExpand() { this.startGesture('expand'); }
    startContract() { this.startGesture('contract'); }
    startFlash() { this.startGesture('flash'); }
    startDrift() { this.startGesture('drift'); }
    startStretch() { this.startGesture('stretch'); }
    startGlow() { this.startGesture('glow'); }
    startFlicker() { this.startGesture('flicker'); }
    startVibrate() { this.startGesture('vibrate'); }
    startOrbital() { this.startGesture('orbital'); }
    startHula() { this.startGesture('hula'); }
    startWave() { this.startGesture('wave'); }
    startBreathe() { this.startGesture('breathe'); }
    startMorph() { this.startGesture('morph'); }
    startSlowBlink() { this.startGesture('slowBlink'); }
    startLook() { this.startGesture('look'); }
    startSettle() { this.startGesture('settle'); }
    startBreathIn() { this.startGesture('breathIn'); }
    startBreathOut() { this.startGesture('breathOut'); }
    startBreathHold() { this.startGesture('breathHold'); }
}

export default GestureAnimator;