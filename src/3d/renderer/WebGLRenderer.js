/**
 * WebGLRenderer - Core WebGL state management and operations
 *
 * Handles:
 * - WebGL context initialization
 * - State tracking and optimization (avoid redundant calls)
 * - Primitive operations (program, framebuffer, viewport, clear)
 * - Shader compilation
 *
 * Does NOT handle:
 * - Scene rendering logic (moved to passes)
 * - Geometry management (moved to GeometryManager)
 * - Matrix calculations (moved to Camera)
 */
export class WebGLRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} config - Configuration options
     */
    constructor(canvas, config = {}) {
        this.canvas = canvas;

        // Initialize WebGL 2.0 context
        this.gl = canvas.getContext('webgl2', {
            alpha: config.alpha !== undefined ? config.alpha : true,
            antialias: config.antialias !== undefined ? config.antialias : true,
            depth: config.depth !== undefined ? config.depth : true,
            premultipliedAlpha: false
        });

        if (!this.gl) {
            throw new Error('WebGL 2.0 not supported');
        }

        // State tracking
        this.currentProgram = null;
        this.currentFramebuffer = null;

        // Setup WebGL state
        this.setupGL();
    }

    /**
     * Setup default WebGL state
     */
    setupGL() {
        const { gl } = this;

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Set clear color (transparent)
        gl.clearColor(0, 0, 0, 0);

        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Set active shader program (with state tracking)
     * @param {WebGLProgram} program - Compiled shader program
     */
    setProgram(program) {
        if (this.currentProgram !== program) {
            this.gl.useProgram(program);
            this.currentProgram = program;
        }
    }

    /**
     * Set active framebuffer (with state tracking)
     * @param {Object|null} fbo - FBO object or null for screen
     */
    setFramebuffer(fbo) {
        if (this.currentFramebuffer !== fbo) {
            const framebuffer = fbo ? fbo.framebuffer : null;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            this.currentFramebuffer = fbo;
        }
    }

    /**
     * Set viewport dimensions
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    setViewport(x, y, width, height) {
        this.gl.viewport(x, y, width, height);
    }

    /**
     * Clear buffers
     * @param {boolean} color - Clear color buffer
     * @param {boolean} depth - Clear depth buffer
     */
    clear(color = true, depth = true) {
        const { gl } = this;
        let mask = 0;

        if (color) mask |= gl.COLOR_BUFFER_BIT;
        if (depth) mask |= gl.DEPTH_BUFFER_BIT;

        if (mask) {
            gl.clear(mask);
        }
    }

    /**
     * Enable/disable depth testing
     * @param {boolean} enable - Enable depth test
     */
    enableDepthTest(enable) {
        const { gl } = this;

        if (enable) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    /**
     * Set blending mode
     * @param {string} mode - Blending mode ('alpha', 'additive', 'multiply', 'none')
     */
    setBlending(mode) {
        const { gl } = this;

        switch (mode) {
        case 'alpha':
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            break;
        case 'additive':
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            break;
        case 'multiply':
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.DST_COLOR, gl.ZERO);
            break;
        case 'none':
            gl.disable(gl.BLEND);
            break;
        default:
            console.warn(`Unknown blend mode: ${mode}`);
        }
    }

    /**
     * Set face culling
     * @param {string} mode - Culling mode ('back', 'front', 'none')
     */
    setCullFace(mode) {
        const { gl } = this;

        if (mode === 'none') {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            const cullMode = mode === 'front' ? gl.FRONT : gl.BACK;
            gl.cullFace(cullMode);
        }
    }

    /**
     * Compile shader from source
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} source - Shader source code
     * @returns {WebGLShader} Compiled shader
     */
    compileShader(type, source) {
        const { gl } = this;

        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation failed: ${log}`);
        }

        return shader;
    }

    /**
     * Create shader program from vertex and fragment shaders
     * @param {string} vertSource - Vertex shader source
     * @param {string} fragSource - Fragment shader source
     * @returns {WebGLProgram} Linked shader program
     */
    createProgram(vertSource, fragSource) {
        const { gl } = this;

        const vertShader = this.compileShader(gl.VERTEX_SHADER, vertSource);
        const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program linking failed: ${log}`);
        }

        // Clean up shaders (no longer needed after linking)
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        return program;
    }
}
