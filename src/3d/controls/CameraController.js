/**
 * CameraController - Interactive camera control for 3D scene
 *
 * Features:
 * - Mouse drag to rotate (orbiting)
 * - Mouse wheel to zoom
 * - Touch drag to rotate
 * - Pinch to zoom
 * - Double-tap to reset
 *
 * Uses spherical coordinates for smooth orbiting around target
 */
export class CameraController {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.enabled = options.enabled !== undefined ? options.enabled : true;

        // Camera state (spherical coordinates)
        this.distance = options.distance || 3.0;      // Distance from target
        this.minDistance = options.minDistance || 1.5;
        this.maxDistance = options.maxDistance || 8.0;
        this.theta = options.theta || 0;              // Horizontal angle (radians)
        this.phi = options.phi || Math.PI / 2;        // Vertical angle (radians)
        this.target = options.target || [0, 0, 0];   // Look-at point

        // Interaction settings
        this.rotateSpeed = options.rotateSpeed || 0.005;
        this.zoomSpeed = options.zoomSpeed || 0.1;
        this.dampingFactor = options.dampingFactor || 0.1;

        // Mouse state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Touch state
        this.touches = [];
        this.lastTouchDistance = 0;

        // Damping (smooth motion)
        this.thetaVelocity = 0;
        this.phiVelocity = 0;
        this.distanceVelocity = 0;

        // Bind event handlers
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach event listeners to canvas
     */
    attachEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
        this.canvas.addEventListener('contextmenu', this.onContextMenu);

        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd);
        this.canvas.addEventListener('touchcancel', this.onTouchEnd);
    }

    /**
     * Remove event listeners
     */
    detachEventListeners() {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('wheel', this.onWheel);
        this.canvas.removeEventListener('contextmenu', this.onContextMenu);

        this.canvas.removeEventListener('touchstart', this.onTouchStart);
        this.canvas.removeEventListener('touchmove', this.onTouchMove);
        this.canvas.removeEventListener('touchend', this.onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
    }

    // ========================================================================
    // MOUSE EVENTS
    // ========================================================================

    onMouseDown(event) {
        if (!this.enabled) return;

        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        // Stop damping when user starts dragging
        this.thetaVelocity = 0;
        this.phiVelocity = 0;
    }

    onMouseMove(event) {
        if (!this.enabled || !this.isDragging) return;

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        // Update angles with velocity
        this.thetaVelocity = deltaX * this.rotateSpeed;
        this.phiVelocity = deltaY * this.rotateSpeed;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onMouseUp(event) {
        this.isDragging = false;
    }

    onWheel(event) {
        if (!this.enabled) return;

        event.preventDefault();

        // Zoom based on wheel delta
        const delta = event.deltaY * 0.001;
        this.distanceVelocity = delta * this.zoomSpeed;
    }

    onContextMenu(event) {
        // Prevent context menu on right-click
        event.preventDefault();
    }

    // ========================================================================
    // TOUCH EVENTS
    // ========================================================================

    onTouchStart(event) {
        if (!this.enabled) return;

        event.preventDefault();
        this.touches = Array.from(event.touches);

        if (this.touches.length === 1) {
            // Single touch - rotation
            this.lastMouseX = this.touches[0].clientX;
            this.lastMouseY = this.touches[0].clientY;
            this.isDragging = true;
        } else if (this.touches.length === 2) {
            // Two touches - pinch zoom
            const dx = this.touches[0].clientX - this.touches[1].clientX;
            const dy = this.touches[0].clientY - this.touches[1].clientY;
            this.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }

        // Stop damping
        this.thetaVelocity = 0;
        this.phiVelocity = 0;
        this.distanceVelocity = 0;
    }

    onTouchMove(event) {
        if (!this.enabled) return;

        event.preventDefault();
        this.touches = Array.from(event.touches);

        if (this.touches.length === 1 && this.isDragging) {
            // Single touch - rotation
            const deltaX = this.touches[0].clientX - this.lastMouseX;
            const deltaY = this.touches[0].clientY - this.lastMouseY;

            this.thetaVelocity = deltaX * this.rotateSpeed;
            this.phiVelocity = deltaY * this.rotateSpeed;

            this.lastMouseX = this.touches[0].clientX;
            this.lastMouseY = this.touches[0].clientY;
        } else if (this.touches.length === 2) {
            // Two touches - pinch zoom
            const dx = this.touches[0].clientX - this.touches[1].clientX;
            const dy = this.touches[0].clientY - this.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.lastTouchDistance > 0) {
                const delta = (distance - this.lastTouchDistance) * 0.01;
                this.distanceVelocity = -delta * this.zoomSpeed;
            }

            this.lastTouchDistance = distance;
        }
    }

    onTouchEnd(event) {
        this.touches = Array.from(event.touches);

        if (this.touches.length === 0) {
            this.isDragging = false;
            this.lastTouchDistance = 0;
        } else if (this.touches.length === 1) {
            // Back to single touch
            this.lastMouseX = this.touches[0].clientX;
            this.lastMouseY = this.touches[0].clientY;
            this.lastTouchDistance = 0;
        }
    }

    // ========================================================================
    // UPDATE & CALCULATIONS
    // ========================================================================

    /**
     * Update camera state (call every frame)
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (!this.enabled) return;

        // Apply velocities to angles
        this.theta += this.thetaVelocity;
        this.phi += this.phiVelocity;

        // Clamp phi to prevent flipping
        const epsilon = 0.0001;
        this.phi = Math.max(epsilon, Math.min(Math.PI - epsilon, this.phi));

        // Apply zoom
        this.distance += this.distanceVelocity;
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));

        // Apply damping (smooth deceleration)
        this.thetaVelocity *= (1.0 - this.dampingFactor);
        this.phiVelocity *= (1.0 - this.dampingFactor);
        this.distanceVelocity *= (1.0 - this.dampingFactor);

        // Stop velocities when very small
        if (Math.abs(this.thetaVelocity) < 0.0001) this.thetaVelocity = 0;
        if (Math.abs(this.phiVelocity) < 0.0001) this.phiVelocity = 0;
        if (Math.abs(this.distanceVelocity) < 0.0001) this.distanceVelocity = 0;
    }

    /**
     * Get camera position from spherical coordinates
     * @returns {Array} [x, y, z] camera position
     */
    getCameraPosition() {
        // Spherical to Cartesian conversion
        const x = this.target[0] + this.distance * Math.sin(this.phi) * Math.sin(this.theta);
        const y = this.target[1] + this.distance * Math.cos(this.phi);
        const z = this.target[2] + this.distance * Math.sin(this.phi) * Math.cos(this.theta);

        return [x, y, z];
    }

    /**
     * Reset camera to default position
     */
    reset() {
        this.distance = 3.0;
        this.theta = 0;
        this.phi = Math.PI / 2;
        this.thetaVelocity = 0;
        this.phiVelocity = 0;
        this.distanceVelocity = 0;
    }

    /**
     * Enable/disable controls
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isDragging = false;
            this.thetaVelocity = 0;
            this.phiVelocity = 0;
            this.distanceVelocity = 0;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.detachEventListeners();
    }
}
