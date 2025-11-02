import { BasePass } from './BasePass.js';
import vertexShaderSource from '../shaders/tonemapping.vert';  // Reuse for all post-processing
import brightpassShaderSource from '../shaders/brightpass.frag';
import blurShaderSource from '../shaders/blur.frag';
import bloomcombineShaderSource from '../shaders/bloomcombine.frag';
import { setupQuadBuffers, renderQuad } from '../utils/QuadGeometry.js';

/**
 * BloomPass - Add bloom/glow effect to bright areas
 *
 * Process:
 * 1. Extract bright areas (bright-pass)
 * 2. Blur horizontally (Gaussian)
 * 3. Blur vertically (Gaussian)
 * 4. Combine with original HDR image
 *
 * Uses ping-pong rendering with two temporary buffers for efficiency.
 */
export class BloomPass extends BasePass {
    constructor(options = {}) {
        super('bloom');

        // Configuration
        this.threshold = options.threshold || 1.0;       // Brightness threshold
        this.bloomStrength = options.bloomStrength || 0.5; // Bloom intensity
        this.blurPasses = options.blurPasses || 2;       // Number of blur iterations

        this.brightpassProgram = null;
        this.blurProgram = null;
        this.combineProgram = null;
        this.quadBuffers = null;

        this.brightpassLocations = null;
        this.blurLocations = null;
        this.combineLocations = null;
    }

    /**
     * Setup shader programs
     */
    setup() {
        const { gl } = this.renderer;

        // Compile bright-pass program
        this.brightpassProgram = this.renderer.createProgram(vertexShaderSource, brightpassShaderSource);
        if (!this.brightpassProgram) {
            throw new Error('Failed to create bright-pass shader program');
        }

        // Compile blur program
        this.blurProgram = this.renderer.createProgram(vertexShaderSource, blurShaderSource);
        if (!this.blurProgram) {
            throw new Error('Failed to create blur shader program');
        }

        // Compile combine program
        this.combineProgram = this.renderer.createProgram(vertexShaderSource, bloomcombineShaderSource);
        if (!this.combineProgram) {
            throw new Error('Failed to create bloom combine shader program');
        }

        // Get uniform locations for bright-pass
        this.brightpassLocations = {
            sourceTexture: gl.getUniformLocation(this.brightpassProgram, 'u_sourceTexture'),
            threshold: gl.getUniformLocation(this.brightpassProgram, 'u_threshold')
        };

        // Get uniform locations for blur
        this.blurLocations = {
            sourceTexture: gl.getUniformLocation(this.blurProgram, 'u_sourceTexture'),
            direction: gl.getUniformLocation(this.blurProgram, 'u_direction'),
            resolution: gl.getUniformLocation(this.blurProgram, 'u_resolution')
        };

        // Get uniform locations for combine
        this.combineLocations = {
            hdrTexture: gl.getUniformLocation(this.combineProgram, 'u_hdrTexture'),
            bloomTexture: gl.getUniformLocation(this.combineProgram, 'u_bloomTexture'),
            bloomStrength: gl.getUniformLocation(this.combineProgram, 'u_bloomStrength')
        };

        // Setup quad geometry (shared across all passes)
        this.quadBuffers = setupQuadBuffers(gl, this.brightpassProgram);
    }

    /**
     * Execute bloom pass
     * Reads from HDR framebuffer, writes back to HDR framebuffer
     *
     * @param {Object} scene - Scene data
     * @param {Object} camera - Camera data
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        // Get HDR framebuffer
        const hdrFBO = this.fbManager.get('hdr');
        if (!hdrFBO) {
            console.error('BloomPass: HDR framebuffer not found');
            return;
        }

        const width = hdrFBO.width;
        const height = hdrFBO.height;

        // Acquire temporary buffers for bloom processing
        const brightFBO = this.fbManager.acquire('bloom_bright', width, height, 'RGBA16F');
        const pingFBO = this.fbManager.acquire('bloom_ping', width, height, 'RGBA16F');
        const pongFBO = this.fbManager.acquire('bloom_pong', width, height, 'RGBA16F');

        // Disable depth test for all post-processing
        this.renderer.enableDepthTest(false);

        // ===== STEP 1: Bright-pass extraction =====
        this.renderer.setProgram(this.brightpassProgram);
        this.renderer.setFramebuffer(brightFBO);
        this.renderer.clear(true, false);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, hdrFBO.colorTexture);
        gl.uniform1i(this.brightpassLocations.sourceTexture, 0);
        gl.uniform1f(this.brightpassLocations.threshold, this.threshold);

        renderQuad(gl, this.quadBuffers);

        // ===== STEP 2: Blur passes (ping-pong) =====
        this.renderer.setProgram(this.blurProgram);
        gl.uniform2f(this.blurLocations.resolution, width, height);

        let currentSource = brightFBO;
        let currentTarget = pingFBO;

        for (let i = 0; i < this.blurPasses; i++) {
            // Horizontal blur
            this.renderer.setFramebuffer(currentTarget);
            this.renderer.clear(true, false);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, currentSource.colorTexture);
            gl.uniform1i(this.blurLocations.sourceTexture, 0);
            gl.uniform2f(this.blurLocations.direction, 1.0, 0.0);  // Horizontal

            renderQuad(gl, this.quadBuffers);

            // Vertical blur
            currentSource = currentTarget;
            currentTarget = (currentTarget === pingFBO) ? pongFBO : pingFBO;

            this.renderer.setFramebuffer(currentTarget);
            this.renderer.clear(true, false);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, currentSource.colorTexture);
            gl.uniform1i(this.blurLocations.sourceTexture, 0);
            gl.uniform2f(this.blurLocations.direction, 0.0, 1.0);  // Vertical

            renderQuad(gl, this.quadBuffers);

            // Swap for next iteration
            currentSource = currentTarget;
            currentTarget = (currentTarget === pingFBO) ? pongFBO : pingFBO;
        }

        // ===== STEP 3: Combine bloom with original HDR =====
        // Use a temporary buffer to avoid feedback loop (can't read and write same texture)
        const combineFBO = this.fbManager.acquire('bloom_combine', width, height, 'RGBA16F');

        this.renderer.setProgram(this.combineProgram);
        this.renderer.setFramebuffer(combineFBO);
        this.renderer.clear(true, false);

        // Bind original HDR texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, hdrFBO.colorTexture);
        gl.uniform1i(this.combineLocations.hdrTexture, 0);

        // Bind blurred bloom texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, currentSource.colorTexture);
        gl.uniform1i(this.combineLocations.bloomTexture, 1);

        gl.uniform1f(this.combineLocations.bloomStrength, this.bloomStrength);

        renderQuad(gl, this.quadBuffers);

        // Copy result back to HDR buffer
        this.renderer.setFramebuffer(hdrFBO);
        this.renderer.clear(true, false);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, combineFBO.colorTexture);
        gl.uniform1i(this.combineLocations.hdrTexture, 0);
        gl.uniform1i(this.combineLocations.bloomTexture, 1);  // Use same texture (no additional bloom)
        gl.uniform1f(this.combineLocations.bloomStrength, 0.0);  // No additional bloom in copy

        renderQuad(gl, this.quadBuffers);

        // Re-enable depth test
        this.renderer.enableDepthTest(true);

        // Release temporary buffers back to pool
        this.fbManager.release('bloom_bright');
        this.fbManager.release('bloom_ping');
        this.fbManager.release('bloom_pong');
        this.fbManager.release('bloom_combine');

        // Unbind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Set bloom threshold
     * @param {number} threshold - Brightness threshold (default 1.0)
     */
    setThreshold(threshold) {
        this.threshold = threshold;
    }

    /**
     * Set bloom strength
     * @param {number} strength - Bloom intensity (default 0.5)
     */
    setBloomStrength(strength) {
        this.bloomStrength = strength;
    }

    /**
     * Set number of blur passes
     * @param {number} passes - Blur iterations (default 2)
     */
    setBlurPasses(passes) {
        this.blurPasses = passes;
    }
}
