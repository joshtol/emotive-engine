/**
 * BasePass - Abstract base class for render passes
 *
 * Provides interface contract for all render passes in the pipeline.
 * Each pass should extend this and implement setup() and execute().
 */
export class BasePass {
    /**
     * @param {string} name - Pass identifier
     */
    constructor(name) {
        this.name = name;
        this.enabled = true;
        this.renderer = null;
        this.fbManager = null;
    }

    /**
     * Initialize pass with renderer and framebuffer manager
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     * @param {FramebufferManager} fbManager - Framebuffer manager instance
     */
    init(renderer, fbManager) {
        this.renderer = renderer;
        this.fbManager = fbManager;
        this.setup();
    }

    /**
     * Setup pass resources (shaders, uniforms, etc.)
     * Must be implemented by subclasses
     */
    setup() {
        throw new Error('BasePass.setup() must be implemented');
    }

    /**
     * Execute the render pass
     * @param {Object} scene - Scene data (geometry, materials, etc.)
     * @param {Object} camera - Camera data (view, projection matrices)
     */
    execute(scene, camera) {
        throw new Error('BasePass.execute() must be implemented');
    }

    /**
     * Handle viewport resize (optional)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        // Optional - override if needed
    }
}
