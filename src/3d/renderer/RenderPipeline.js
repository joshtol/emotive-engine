import { FramebufferManager } from './FramebufferManager.js';

/**
 * RenderPipeline - Orchestrate ordered execution of render passes
 *
 * Manages the render pass sequence and coordinates rendering flow.
 * Passes are executed in order, with disabled passes skipped.
 */
export class RenderPipeline {
    /**
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     * @param {FramebufferManager} fbManager - Optional framebuffer manager
     */
    constructor(renderer, fbManager = null) {
        this.renderer = renderer;
        this.fbManager = fbManager || new FramebufferManager(renderer);
        this.passes = [];
    }

    /**
     * Add a render pass to the pipeline
     * @param {BasePass} pass - Render pass instance
     */
    addPass(pass) {
        pass.init(this.renderer, this.fbManager);
        this.passes.push(pass);
    }

    /**
     * Remove a render pass from the pipeline
     * @param {BasePass} pass - Render pass instance
     */
    removePass(pass) {
        const index = this.passes.indexOf(pass);
        if (index !== -1) {
            this.passes.splice(index, 1);
        }
    }

    /**
     * Execute all enabled passes in order
     * @param {Object} scene - Scene data (geometry, materials, etc.)
     * @param {Object} camera - Camera data (view, projection matrices)
     */
    render(scene, camera) {
        for (const pass of this.passes) {
            if (pass.enabled) {
                pass.execute(scene, camera);
            }
        }
    }

    /**
     * Handle viewport resize
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.fbManager.resize(width, height);

        for (const pass of this.passes) {
            if (pass.resize) {
                pass.resize(width, height);
            }
        }
    }
}
