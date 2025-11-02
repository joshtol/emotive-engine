/**
 * FramebufferManager - Manages WebGL framebuffers for HDR rendering
 *
 * Handles:
 * - Creating and managing framebuffer objects (FBOs)
 * - HDR render targets (RGB16F textures)
 * - Depth buffers
 * - Resizing framebuffers on canvas resize
 */

export class FramebufferManager {
    constructor(gl) {
        this.gl = gl;
        this.framebuffers = new Map();

        // Check HDR support
        this.hdrSupported = this.checkHDRSupport(gl);
        if (!this.hdrSupported) {
            console.warn('[FramebufferManager] HDR rendering not supported - falling back to LDR (RGBA8)');
        }
    }

    /**
     * Check if HDR framebuffers are supported
     * @param {WebGL2RenderingContext} gl
     * @returns {boolean}
     */
    checkHDRSupport(gl) {
        // WebGL2 requires EXT_color_buffer_float for rendering to float textures
        const ext = gl.getExtension('EXT_color_buffer_float');
        if (!ext) {
            return false;
        }

        // Test if we can actually create an RGB16F framebuffer
        const testFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, testFBO);

        const testTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, testTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB16F, 1, 1, 0, gl.RGB, gl.FLOAT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, testTexture, 0);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        const supported = status === gl.FRAMEBUFFER_COMPLETE;

        // Cleanup
        gl.deleteTexture(testTexture);
        gl.deleteFramebuffer(testFBO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return supported;
    }

    /**
     * Create or get a framebuffer
     * @param {string} name - Framebuffer name
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     * @param {Object} options - Configuration options
     * @returns {Object} FBO object with { fbo, colorTexture, depthBuffer }
     */
    get(name, width, height, options = {}) {
        const key = name;

        // Return existing if same size
        if (this.framebuffers.has(key)) {
            const existing = this.framebuffers.get(key);
            if (existing.width === width && existing.height === height) {
                return existing;
            }
            // Size changed - delete old one
            this.delete(name);
        }

        // Create new framebuffer
        const fbo = this.create(width, height, options);
        fbo.name = name;
        fbo.width = width;
        fbo.height = height;

        this.framebuffers.set(key, fbo);
        return fbo;
    }

    /**
     * Create a new framebuffer
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     * @param {Object} options - Configuration options
     * @returns {Object} FBO object
     */
    create(width, height, options = {}) {
        const { gl } = this;
        const requestHDR = options.hdr !== false; // Default to HDR
        const useHDR = requestHDR && this.hdrSupported; // Only use HDR if supported
        const useDepth = options.depth !== false; // Default to depth buffer

        // Create framebuffer
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Create color texture
        const colorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);

        // Use HDR format if enabled and supported
        const internalFormat = useHDR ? gl.RGB16F : gl.RGBA8;
        const format = useHDR ? gl.RGB : gl.RGBA;
        const type = useHDR ? gl.FLOAT : gl.UNSIGNED_BYTE;

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            internalFormat,
            width,
            height,
            0,
            format,
            type,
            null
        );

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Attach color texture
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            colorTexture,
            0
        );

        // Create depth buffer if requested
        let depthBuffer = null;
        if (useDepth) {
            depthBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(
                gl.RENDERBUFFER,
                gl.DEPTH_COMPONENT24,
                width,
                height
            );
            gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.RENDERBUFFER,
                depthBuffer
            );
        }

        // Check framebuffer completeness
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('[FramebufferManager] Framebuffer incomplete:', status);
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        // Unbind
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return {
            fbo,
            colorTexture,
            depthBuffer,
            width,
            height,
            hdr: useHDR
        };
    }

    /**
     * Delete a framebuffer
     * @param {string} name - Framebuffer name
     */
    delete(name) {
        if (this.framebuffers.has(name)) {
            const fboObj = this.framebuffers.get(name);
            const { gl } = this;

            if (fboObj.fbo) gl.deleteFramebuffer(fboObj.fbo);
            if (fboObj.colorTexture) gl.deleteTexture(fboObj.colorTexture);
            if (fboObj.depthBuffer) gl.deleteRenderbuffer(fboObj.depthBuffer);

            this.framebuffers.delete(name);
        }
    }

    /**
     * Delete all framebuffers
     */
    deleteAll() {
        for (const name of this.framebuffers.keys()) {
            this.delete(name);
        }
    }

    /**
     * Resize all framebuffers
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        const names = Array.from(this.framebuffers.keys());
        for (const name of names) {
            const fboObj = this.framebuffers.get(name);
            const options = {
                hdr: fboObj.hdr,
                depth: fboObj.depthBuffer !== null
            };

            // Recreate with new size
            this.delete(name);
            this.get(name, width, height, options);
        }
    }
}
