/**
 * CanvasLayerManager - Manages dual canvas layer architecture for EmotiveMascot3D
 *
 * Creates and manages:
 * - WebGL canvas (back layer) for 3D core rendering
 * - Canvas2D (front layer) for particle effects overlay
 *
 * The layered approach allows:
 * - Hardware-accelerated 3D rendering via WebGL
 * - Soft particle effects via Canvas2D
 * - Proper z-ordering and transparency handling
 *
 * Extracted from src/3d/index.js to reduce god-class size.
 */

export class CanvasLayerManager {
    /**
     * Create a CanvasLayerManager instance
     * @param {Object} config - Configuration options
     * @param {string} config.canvasId - Base ID for canvas elements
     * @param {boolean} config.enableControls - Enable pointer events for orbit camera
     */
    constructor(config = {}) {
        this.config = config;
        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;
        this._canvasAppended = false;
    }

    /**
     * Setup dual canvas architecture
     * WebGL canvas (back) + Canvas2D (front) stacked
     * @param {HTMLElement} containerOrCanvas - Container element or canvas element
     * @returns {{ container: HTMLElement, webglCanvas: HTMLCanvasElement, canvas2D: HTMLCanvasElement }}
     */
    setup(containerOrCanvas) {
        // Create or use container
        if (containerOrCanvas.tagName === 'CANVAS') {
            // User provided single canvas, create container
            const parent = containerOrCanvas.parentElement;
            this.container = document.createElement('div');
            this.container.style.position = 'relative';
            // Use parent's size (styled by CSS) instead of canvas default size
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            parent.replaceChild(this.container, containerOrCanvas);
        } else {
            this.container = containerOrCanvas;
            // Only set position if not already set (don't override fixed/absolute)
            if (!this.container.style.position || this.container.style.position === 'static') {
                this.container.style.position = 'relative';
            }
        }

        // Create Canvas2D for particles (Layer 1 - back)
        this.canvas2D = document.createElement('canvas');
        this.canvas2D.id = `${this.config.canvasId}-particles`;
        this.canvas2D.width = this.container.offsetWidth || 400;
        this.canvas2D.height = this.container.offsetHeight || 400;
        this.canvas2D.style.position = 'absolute';
        this.canvas2D.style.top = '0';
        this.canvas2D.style.left = '0';
        this.canvas2D.style.width = '100%';
        this.canvas2D.style.height = '100%';
        this.canvas2D.style.background = 'transparent';
        this.canvas2D.style.zIndex = '1';
        // Disable pointer events - let WebGL canvas handle all interaction
        this.canvas2D.style.pointerEvents = 'none';
        this.container.appendChild(this.canvas2D);

        // Create WebGL canvas for 3D core (Layer 2 - front)
        // CRITICAL: Canvas is NOT appended to DOM here - it will be appended after first render
        // This prevents any garbage data from being visible during GPU initialization
        this.webglCanvas = document.createElement('canvas');
        this.webglCanvas.id = `${this.config.canvasId}-3d`;
        this.webglCanvas.width = this.canvas2D.width;
        this.webglCanvas.height = this.canvas2D.height;
        this.webglCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 2;
        `;
        // Only enable pointer events if controls are enabled (for orbit camera)
        // Otherwise, let events pass through to allow page scrolling
        if (this.config.enableControls) {
            this.webglCanvas.style.pointerEvents = 'auto';
            // Prevent browser touch gestures (scroll, zoom) on canvas when controls active
            this.webglCanvas.style.touchAction = 'none';
        } else {
            // Disable all pointer/touch events so scrolling works through the canvas
            this.webglCanvas.style.pointerEvents = 'none';
            this.webglCanvas.style.touchAction = 'auto';
        }
        // NOTE: Canvas is NOT appended here - call appendWebGLCanvas() after first render
        this._canvasAppended = false;

        return {
            container: this.container,
            webglCanvas: this.webglCanvas,
            canvas2D: this.canvas2D,
        };
    }

    /**
     * Append WebGL canvas to DOM after first render
     * Should be called after the first successful render to prevent garbage data flash
     */
    appendWebGLCanvas() {
        if (!this._canvasAppended && this.webglCanvas && this.container) {
            this.container.appendChild(this.webglCanvas);
            this._canvasAppended = true;
        }
    }

    /**
     * Check if the WebGL canvas has been appended
     * @returns {boolean}
     */
    isCanvasAppended() {
        return this._canvasAppended;
    }

    /**
     * Get current canvas dimensions
     * @returns {{ width: number, height: number }}
     */
    getDimensions() {
        return {
            width: this.canvas2D?.width || 0,
            height: this.canvas2D?.height || 0,
        };
    }

    /**
     * Update canvas dimensions (call when container resizes)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        if (this.canvas2D) {
            this.canvas2D.width = width;
            this.canvas2D.height = height;
        }
        // NOTE: Do NOT set webglCanvas.width/height here — Three.js owns the WebGL
        // canvas and manages its drawing buffer via renderer.setSize(). Directly
        // setting canvas.width behind Three.js's back resets the WebGL drawing buffer
        // and can desync Three.js's internal cached dimensions.
    }

    /**
     * Remove canvas elements from DOM and clean up references
     */
    destroy() {
        if (this.webglCanvas && this.webglCanvas.parentNode) {
            this.webglCanvas.parentNode.removeChild(this.webglCanvas);
        }
        if (this.canvas2D && this.canvas2D.parentNode) {
            this.canvas2D.parentNode.removeChild(this.canvas2D);
        }

        this.container = null;
        this.webglCanvas = null;
        this.canvas2D = null;
        this._canvasAppended = false;
    }
}

export default CanvasLayerManager;
