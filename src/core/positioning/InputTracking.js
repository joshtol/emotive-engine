/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Input Tracking System
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Input-based positioning methods for mascot tracking
 * @author Emotive Engine Team
 * @module positioning/InputTracking
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides methods to position the mascot based on user input like mouse movement,
 * ║ touch gestures, and audio levels. Creates interactive and responsive positioning.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

class InputTracking {
    constructor(positionController) {
        this.positionController = positionController;
        this.isTracking = false;
        this.trackingCallbacks = new Map();
        this.audioContext = null;
        this.audioAnalyser = null;
        this.audioData = null;
    }

    /**
     * Move mascot to follow mouse cursor
     * @param {Object} offset - {x, y} offset from cursor
     * @param {Object} options - Tracking options
     */
    moveToMouse(offset = { x: 20, y: 20 }, options = {}) {
        const callbackId = 'mouse-tracking';

        const handleMouseMove = event => {
            const targetX = event.clientX + offset.x;
            const targetY = event.clientY + offset.y;

            // Convert to mascot coordinate system
            const mascotX = targetX - window.innerWidth / 2;
            const mascotY = targetY - window.innerHeight / 2;

            if (options.smooth !== false) {
                this.positionController.animateOffset(
                    mascotX,
                    mascotY,
                    0,
                    options.duration || 200,
                    'easeOutQuad'
                );
            } else {
                this.positionController.setOffset(mascotX, mascotY, 0);
            }
        };

        this.trackingCallbacks.set(callbackId, handleMouseMove);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            this.trackingCallbacks.delete(callbackId);
        };
    }

    /**
     * Move mascot to follow touch position
     * @param {Object} offset - {x, y} offset from touch
     * @param {Object} options - Tracking options
     */
    moveToTouch(offset = { x: 20, y: 20 }, options = {}) {
        const callbackId = 'touch-tracking';

        const handleTouchMove = event => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const targetX = touch.clientX + offset.x;
                const targetY = touch.clientY + offset.y;

                // Convert to mascot coordinate system
                const mascotX = targetX - window.innerWidth / 2;
                const mascotY = targetY - window.innerHeight / 2;

                if (options.smooth !== false) {
                    this.positionController.animateOffset(
                        mascotX,
                        mascotY,
                        0,
                        options.duration || 200,
                        'easeOutQuad'
                    );
                } else {
                    this.positionController.setOffset(mascotX, mascotY, 0);
                }
            }
        };

        this.trackingCallbacks.set(callbackId, handleTouchMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            this.trackingCallbacks.delete(callbackId);
        };
    }

    /**
     * Move mascot based on audio levels
     * @param {number} level - Audio level (0-1)
     * @param {number} sensitivity - Sensitivity multiplier
     * @param {Object} options - Audio tracking options
     */
    moveToAudio(_level = 0, sensitivity = 50, options = {}) {
        if (!this.audioContext) {
            this.initAudioContext();
        }

        if (!this.audioContext || !this.audioAnalyser) {
            console.warn('Audio context not available');
            return;
        }

        const callbackId = 'audio-tracking';

        const updateAudioPosition = () => {
            if (!this.isTracking) return;

            this.audioAnalyser.getByteFrequencyData(this.audioData);

            // Calculate average audio level
            let sum = 0;
            for (let i = 0; i < this.audioData.length; i++) {
                sum += this.audioData[i];
            }
            const averageLevel = sum / this.audioData.length / 255;

            // Apply sensitivity and offset
            const audioOffset = averageLevel * sensitivity;
            const targetX = (options.centerX || 0) + audioOffset;
            const targetY = (options.centerY || 0) + audioOffset * 0.5;

            // Convert to mascot coordinate system
            const mascotX = targetX - window.innerWidth / 2;
            const mascotY = targetY - window.innerHeight / 2;

            this.positionController.setOffset(mascotX, mascotY, 0);

            if (this.isTracking) {
                requestAnimationFrame(updateAudioPosition);
            }
        };

        this.trackingCallbacks.set(callbackId, updateAudioPosition);
        this.isTracking = true;
        updateAudioPosition();

        return () => {
            this.isTracking = false;
            this.trackingCallbacks.delete(callbackId);
        };
    }

    /**
     * Initialize audio context for audio tracking
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;
            this.audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }

    /**
     * Connect audio source to analyser
     * @param {MediaStream} stream - Audio stream
     */
    connectAudioSource(stream) {
        if (!this.audioContext || !this.audioAnalyser) {
            this.initAudioContext();
        }

        if (this.audioContext && this.audioAnalyser) {
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.audioAnalyser);
        }
    }

    /**
     * Move mascot to viewport edges
     * @param {string} position - 'top', 'bottom', 'left', 'right', 'top-left', etc.
     * @param {Object} offset - Pixel offset from edge
     */
    moveToViewport(position = 'right', offset = { x: 20, y: 20 }) {
        let targetX, targetY;

        switch (position) {
            case 'top':
                targetX = window.innerWidth / 2;
                targetY = offset.y;
                break;
            case 'bottom':
                targetX = window.innerWidth / 2;
                targetY = window.innerHeight - offset.y;
                break;
            case 'left':
                targetX = offset.x;
                targetY = window.innerHeight / 2;
                break;
            case 'right':
                targetX = window.innerWidth - offset.x;
                targetY = window.innerHeight / 2;
                break;
            case 'top-left':
                targetX = offset.x;
                targetY = offset.y;
                break;
            case 'top-right':
                targetX = window.innerWidth - offset.x;
                targetY = offset.y;
                break;
            case 'bottom-left':
                targetX = offset.x;
                targetY = window.innerHeight - offset.y;
                break;
            case 'bottom-right':
                targetX = window.innerWidth - offset.x;
                targetY = window.innerHeight - offset.y;
                break;
            default:
                targetX = window.innerWidth - offset.x;
                targetY = window.innerHeight / 2;
        }

        // Convert to mascot coordinate system
        const mascotX = targetX - window.innerWidth / 2;
        const mascotY = targetY - window.innerHeight / 2;

        this.positionController.setOffset(mascotX, mascotY, 0);
    }

    /**
     * Stop all input tracking
     */
    stopAllTracking() {
        this.trackingCallbacks.forEach((callback, id) => {
            if (id === 'mouse-tracking') {
                window.removeEventListener('mousemove', callback);
            } else if (id === 'touch-tracking') {
                window.removeEventListener('touchmove', callback);
            }
        });
        this.trackingCallbacks.clear();
        this.isTracking = false;
    }

    /**
     * Destroy the input tracking system
     */
    destroy() {
        this.stopAllTracking();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.positionController = null;
    }
}

export default InputTracking;
