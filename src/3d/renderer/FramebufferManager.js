/**
 * FramebufferManager - Pool and manage framebuffer objects (FBOs)
 *
 * Handles creation, pooling, and lifecycle of WebGL framebuffers.
 * Reduces allocation overhead by recycling FBOs.
 * Supports HDR (float) textures for high dynamic range rendering.
 */
export class FramebufferManager {
    /**
     * @param {WebGLRenderer} renderer - WebGL renderer instance
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.fbos = new Map();  // name -> FBO
        this.pool = [];  // Recycled FBOs

        // Check for float texture support (needed for HDR)
        const { gl } = this.renderer;
        const ext = gl.getExtension('EXT_color_buffer_float');
        this.supportsFloatTextures = !!ext;

        if (!this.supportsFloatTextures) {
            console.warn('HDR not supported: EXT_color_buffer_float extension unavailable');
        }
    }

    /**
     * Create a new framebuffer with color and depth attachments
     * @param {number} width - Framebuffer width
     * @param {number} height - Framebuffer height
     * @param {string} format - Color format ('RGBA', 'RGBA16F', 'RGBA32F', etc.)
     * @returns {Object} FBO object with framebuffer, texture, and depth buffer
     */
    create(width, height, format = 'RGBA') {
        const { gl } = this.renderer;

        // Determine internal format and data type
        let internalFormat, dataFormat, dataType;

        if (format === 'RGBA16F' && this.supportsFloatTextures) {
            // HDR half-float (16-bit per channel)
            internalFormat = gl.RGBA16F;
            dataFormat = gl.RGBA;
            dataType = gl.HALF_FLOAT;
        } else if (format === 'RGBA32F' && this.supportsFloatTextures) {
            // HDR full-float (32-bit per channel)
            internalFormat = gl.RGBA32F;
            dataFormat = gl.RGBA;
            dataType = gl.FLOAT;
        } else {
            // LDR fallback (8-bit per channel)
            internalFormat = gl[format] || gl.RGBA;
            dataFormat = gl.RGBA;
            dataType = gl.UNSIGNED_BYTE;
            if (format.includes('F') && !this.supportsFloatTextures) {
                console.warn(`${format} not supported, falling back to RGBA`);
            }
        }

        // Create framebuffer
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Create color texture
        const colorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            internalFormat,
            width,
            height,
            0,
            dataFormat,
            dataType,
            null
        );
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

        // Create depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        // Attach depth buffer
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depthBuffer
        );

        // Verify framebuffer is complete
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        // Unbind
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return {
            framebuffer,
            colorTexture,
            depthBuffer,
            width,
            height,
            format
        };
    }

    /**
     * Acquire an FBO (from pool or create new)
     * @param {string} name - FBO identifier
     * @param {number} width - Framebuffer width
     * @param {number} height - Framebuffer height
     * @param {string} format - Color format
     * @returns {Object} FBO object
     */
    acquire(name, width, height, format = 'RGBA') {
        // Try to find matching FBO from pool
        let fbo = null;
        const poolIndex = this.pool.findIndex(f =>
            f.width === width &&
            f.height === height &&
            f.format === format
        );

        if (poolIndex !== -1) {
            // Remove matching FBO from pool
            fbo = this.pool.splice(poolIndex, 1)[0];
        } else {
            // Create new if no match
            fbo = this.create(width, height, format);
        }

        this.fbos.set(name, fbo);
        return fbo;
    }

    /**
     * Release an FBO back to the pool
     * @param {string} name - FBO identifier
     */
    release(name) {
        const fbo = this.fbos.get(name);
        if (fbo) {
            this.pool.push(fbo);
            this.fbos.delete(name);
        }
    }

    /**
     * Get an FBO by name
     * @param {string} name - FBO identifier
     * @returns {Object|undefined} FBO object or undefined
     */
    get(name) {
        return this.fbos.get(name);
    }

    /**
     * Resize all active FBOs
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        const { gl } = this.renderer;

        for (const [name, fbo] of this.fbos.entries()) {
            // Determine format and type for resize
            let internalFormat, dataFormat, dataType;

            if (fbo.format === 'RGBA16F' && this.supportsFloatTextures) {
                internalFormat = gl.RGBA16F;
                dataFormat = gl.RGBA;
                dataType = gl.HALF_FLOAT;
            } else if (fbo.format === 'RGBA32F' && this.supportsFloatTextures) {
                internalFormat = gl.RGBA32F;
                dataFormat = gl.RGBA;
                dataType = gl.FLOAT;
            } else {
                internalFormat = gl[fbo.format] || gl.RGBA;
                dataFormat = gl.RGBA;
                dataType = gl.UNSIGNED_BYTE;
            }

            // Resize color texture
            gl.bindTexture(gl.TEXTURE_2D, fbo.colorTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                internalFormat,
                width,
                height,
                0,
                dataFormat,
                dataType,
                null
            );

            // Resize depth buffer
            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

            // Update FBO dimensions
            fbo.width = width;
            fbo.height = height;
        }

        // Unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}
