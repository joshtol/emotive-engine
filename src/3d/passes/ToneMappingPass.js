import { BasePass } from './BasePass.js';
import vertexShaderSource from '../shaders/tonemapping.vert';
import fragmentShaderSource from '../shaders/tonemapping.frag';
import { setupQuadBuffers, renderQuad } from '../utils/QuadGeometry.js';

/**
 * ToneMappingPass - Convert HDR to LDR for display
 *
 * Handles:
 * - Reading HDR framebuffer
 * - Applying tone mapping algorithm
 * - Exposure control
 * - Gamma correction
 * - Outputting to screen (LDR)
 *
 * Tone mapping modes:
 * 0 = Reinhard (simple, good default)
 * 1 = ACES Filmic (cinematic, industry standard)
 * 2 = Uncharted 2 (popular in games)
 */
export class ToneMappingPass extends BasePass {
    constructor(options = {}) {
        super('tonemapping');

        // Configuration
        this.exposure = options.exposure || 1.0;
        this.toneMappingMode = options.toneMappingMode || 0;  // 0=Reinhard, 1=ACES, 2=Uncharted2
        this.gamma = options.gamma || 2.2;

        this.program = null;
        this.locations = null;
        this.quadBuffers = null;
    }

    /**
     * Setup shader program and quad geometry
     */
    setup() {
        const { gl } = this.renderer;

        // Compile shader program
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        if (!this.program) {
            throw new Error('Failed to create tone mapping shader program');
        }

        // Get uniform locations
        this.locations = {
            hdrTexture: gl.getUniformLocation(this.program, 'u_hdrTexture'),
            exposure: gl.getUniformLocation(this.program, 'u_exposure'),
            toneMappingMode: gl.getUniformLocation(this.program, 'u_toneMappingMode'),
            gamma: gl.getUniformLocation(this.program, 'u_gamma')
        };

        // Setup fullscreen quad geometry
        this.quadBuffers = setupQuadBuffers(gl, this.program);
    }

    /**
     * Execute tone mapping pass
     * Reads from HDR framebuffer, outputs to screen
     *
     * @param {Object} scene - Scene data (contains hdrEnabled flag)
     * @param {Object} camera - Camera data
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        // Get HDR framebuffer
        const hdrFBO = this.fbManager.get('hdr');
        if (!hdrFBO) {
            console.error('ToneMappingPass: HDR framebuffer not found');
            return;
        }

        // Set shader program
        this.renderer.setProgram(this.program);

        // Bind to screen (null framebuffer)
        this.renderer.setFramebuffer(null);

        // Clear screen
        this.renderer.clear(true, false);

        // Disable depth test for fullscreen quad
        this.renderer.enableDepthTest(false);

        // Bind HDR texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, hdrFBO.colorTexture);
        gl.uniform1i(this.locations.hdrTexture, 0);

        // Set uniforms
        gl.uniform1f(this.locations.exposure, this.exposure);
        gl.uniform1i(this.locations.toneMappingMode, this.toneMappingMode);
        gl.uniform1f(this.locations.gamma, this.gamma);

        // Render fullscreen quad
        renderQuad(gl, this.quadBuffers);

        // Re-enable depth test
        this.renderer.enableDepthTest(true);

        // Unbind texture
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Set exposure value
     * @param {number} exposure - Exposure multiplier (default 1.0)
     */
    setExposure(exposure) {
        this.exposure = exposure;
    }

    /**
     * Set tone mapping algorithm
     * @param {number} mode - 0=Reinhard, 1=ACES, 2=Uncharted2
     */
    setToneMappingMode(mode) {
        this.toneMappingMode = mode;
    }

    /**
     * Set gamma correction value
     * @param {number} gamma - Gamma value (default 2.2)
     */
    setGamma(gamma) {
        this.gamma = gamma;
    }
}
