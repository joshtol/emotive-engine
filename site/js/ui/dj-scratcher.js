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
 * DJScratcher - Interactive DJ turntable scratch effect for the canvas
 * Handles mouse and touch input to create scratching motions with momentum
 */
class DJScratcher {
    constructor(canvas, mascot) {
        this.canvas = canvas;
        this.mascot = mascot;

        // Scratch state
        this.scratching = false;
        this.lastAngle = 0;
        this.currentAngle = 0;
        this.angularVelocity = 0;
        this.momentum = 0;
        this.animationFrame = null;
        // Configuration
        this.config = {
            rotationRadius: null, // Will be set based on canvas size
            momentumDamping: 0.95,
            momentumThreshold: 0.01,
            velocityScale: 20,
            scratchIntensityScale: 0.01
        };

        // Bind methods
        this.startScratch = this.startScratch.bind(this);
        this.updateScratch = this.updateScratch.bind(this);
        this.endScratch = this.endScratch.bind(this);
        this.applyMomentum = this.applyMomentum.bind(this);
        this.updateCursor = this.updateCursor.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize event listeners and setup
     */
    init() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startScratch);
        document.addEventListener('mousemove', this.updateScratch);
        document.addEventListener('mouseup', this.endScratch);

        // Touch events
        this.canvas.addEventListener('touchstart', this.startScratch);
        document.addEventListener('touchmove', this.updateScratch);
        document.addEventListener('touchend', this.endScratch);

        // Cursor updates
        this.canvas.addEventListener('mousemove', this.updateCursor);
        this.canvas.addEventListener('mouseleave', () => {
            this.canvas.style.cursor = 'default';
        });
    }

    /**
     * Get angle from center to mouse/touch position
     */
    getAngleFromCenter(e, rect) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = (e.clientX || e.touches[0].clientX) - rect.left - centerX;
        const y = (e.clientY || e.touches[0].clientY) - rect.top - centerY;
        return Math.atan2(y, x);
    }

    /**
     * Check if position is within scratch zone
     */
    isInScratchZone(e, rect) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        const distance = Math.sqrt(
            Math.pow(x - centerX, 2) +
            Math.pow(y - centerY, 2)
        );

        // Update rotation radius based on canvas size
        this.config.rotationRadius = rect.width / 6;

        return distance <= this.config.rotationRadius;
    }

    /**
     * Start scratching
     */
    startScratch(e) {
        const rect = this.canvas.getBoundingClientRect();

        if (!this.isInScratchZone(e, rect)) return;

        // Prevent text selection
        e.preventDefault();

        this.scratching = true;
        this.lastAngle = this.getAngleFromCenter(e, rect);
        this.currentAngle = this.lastAngle;
        this.momentum = 0; // Reset momentum when starting new scratch

        // Update cursor
        this.canvas.style.cursor = 'grabbing';
    }

    /**
     * Update scratch motion
     */
    updateScratch(e) {
        if (!this.scratching) return;

        const rect = this.canvas.getBoundingClientRect();
        this.currentAngle = this.getAngleFromCenter(e, rect);

        // Calculate angular change
        let deltaAngle = this.currentAngle - this.lastAngle;

        // Handle wrap-around
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        // Update angular velocity
        this.angularVelocity = deltaAngle;

        // Apply scratch effect to mascot
        if (this.mascot && this.mascot.renderer) {
            const currentRotation = this.mascot.renderer.state.manualRotation || 0;
            this.mascot.renderer.state.manualRotation = currentRotation + deltaAngle;
        }

        this.lastAngle = this.currentAngle;
    }

    /**
     * End scratching
     */
    endScratch(e) {
        if (!this.scratching) return;
        this.scratching = false;

        // Reset cursor based on current mouse position
        const rect = this.canvas.getBoundingClientRect();
        if (e && e.type.startsWith('touch')) {
            this.canvas.style.cursor = 'default';
        } else if (e) {
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(mouseX - centerX, 2) +
                Math.pow(mouseY - centerY, 2)
            );
            const rotationRadius = rect.width / 6;
            this.canvas.style.cursor = distance <= rotationRadius ? 'grab' : 'default';
        } else {
            this.canvas.style.cursor = 'default';
        }

        // Transfer angular velocity to momentum
        this.momentum = this.angularVelocity * this.config.velocityScale;

        // Start momentum animation if needed
        if (Math.abs(this.momentum) > this.config.momentumThreshold) {
            this.applyMomentum();
        }
    }

    /**
     * Apply momentum after scratch release
     */
    applyMomentum() {
        if (Math.abs(this.momentum) < this.config.momentumThreshold) {
            // Stop momentum
            this.momentum = 0;
            return;
        }

        // Apply momentum to rotation
        if (this.mascot && this.mascot.renderer) {
            const currentRotation = this.mascot.renderer.state.manualRotation || 0;
            this.mascot.renderer.state.manualRotation = currentRotation + (this.momentum * 0.001);
        }

        // Reduce momentum
        this.momentum *= this.config.momentumDamping;

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.applyMomentum());
    }

    /**
     * Update cursor based on position
     */
    updateCursor(e) {
        if (this.scratching) return; // Don't update while scratching

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) +
            Math.pow(mouseY - centerY, 2)
        );

        const rotationRadius = rect.width / 6;

        if (distance <= rotationRadius) {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        // Cancel any running animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.startScratch);
        document.removeEventListener('mousemove', this.updateScratch);
        document.removeEventListener('mouseup', this.endScratch);

        this.canvas.removeEventListener('touchstart', this.startScratch);
        document.removeEventListener('touchmove', this.updateScratch);
        document.removeEventListener('touchend', this.endScratch);

        this.canvas.removeEventListener('mousemove', this.updateCursor);
    }
}

// ES6 Module Export
export { DJScratcher };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.