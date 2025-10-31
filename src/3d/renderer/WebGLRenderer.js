/**
 * WebGLRenderer - Minimal WebGL 2.0 rendering engine
 *
 * Handles:
 * - WebGL context initialization
 * - Shader compilation and linking
 * - Geometry buffer creation
 * - Matrix transformations
 * - Frame rendering
 */

import vertexShaderSource from '../shaders/core.vert';
import fragmentShaderSource from '../shaders/core.frag';

export class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;

        // Initialize WebGL 2.0 context
        this.gl = canvas.getContext('webgl2', {
            alpha: true,
            antialias: true,
            depth: true,
            premultipliedAlpha: false
        });

        if (!this.gl) {
            throw new Error('WebGL 2.0 not supported');
        }

        // Setup WebGL state
        this.setupGL();

        // Compile shaders
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);

        // Get uniform/attribute locations
        this.locations = {
            // Attributes
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            normal: this.gl.getAttribLocation(this.program, 'a_normal'),

            // Uniforms
            modelMatrix: this.gl.getUniformLocation(this.program, 'u_modelMatrix'),
            viewMatrix: this.gl.getUniformLocation(this.program, 'u_viewMatrix'),
            projectionMatrix: this.gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            glowColor: this.gl.getUniformLocation(this.program, 'u_glowColor'),
            glowIntensity: this.gl.getUniformLocation(this.program, 'u_glowIntensity'),
            cameraPosition: this.gl.getUniformLocation(this.program, 'u_cameraPosition')
        };

        // Camera setup (closer and looking straight at origin)
        this.cameraPosition = [0, 0, 3];
        this.cameraTarget = [0, 0, 0];

        // Matrices
        this.projectionMatrix = this.createPerspectiveMatrix();
        this.viewMatrix = this.createViewMatrix();

        // Current geometry buffers
        this.currentGeometry = null;
        this.buffers = {};
    }

    /**
     * Setup WebGL state
     */
    setupGL() {
        const {gl} = this;

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Set clear color (transparent so particles show through)
        gl.clearColor(0, 0, 0, 0);

        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Create shader program
     */
    createProgram(vertSource, fragSource) {
        const {gl} = this;

        // Compile vertex shader
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertSource);
        gl.compileShader(vertShader);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertShader));
            throw new Error('Vertex shader compilation failed');
        }

        // Compile fragment shader
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragSource);
        gl.compileShader(fragShader);

        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragShader));
            throw new Error('Fragment shader compilation failed');
        }

        // Link program
        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            throw new Error('Shader program linking failed');
        }

        return program;
    }

    /**
     * Upload geometry to GPU
     */
    uploadGeometry(geometry) {
        const {gl} = this;

        // Create buffers if needed
        if (!this.buffers.position) {
            this.buffers.position = gl.createBuffer();
            this.buffers.normal = gl.createBuffer();
            this.buffers.indices = gl.createBuffer();
        }

        // Upload vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        // Upload normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

        // Upload indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        this.currentGeometry = geometry;
    }

    /**
     * Render frame
     */
    render(params) {
        const {gl} = this;
        const { geometry, position = [0,0,0], rotation = [0,0,0], scale = 1.0, glowColor = [1,1,1], glowIntensity = 1.0 } = params;

        // Upload geometry if changed
        if (geometry !== this.currentGeometry) {
            this.uploadGeometry(geometry);
        }

        // Clear frame
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use program
        gl.useProgram(this.program);

        // Create model matrix
        const modelMatrix = this.createModelMatrix(position, rotation, scale);

        // Set uniforms
        gl.uniformMatrix4fv(this.locations.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this.locations.viewMatrix, false, this.viewMatrix);
        gl.uniformMatrix4fv(this.locations.projectionMatrix, false, this.projectionMatrix);
        gl.uniform3fv(this.locations.glowColor, glowColor);
        gl.uniform1f(this.locations.glowIntensity, glowIntensity);
        gl.uniform3fv(this.locations.cameraPosition, this.cameraPosition);

        // Bind vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.enableVertexAttribArray(this.locations.position);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.enableVertexAttribArray(this.locations.normal);
        gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0);

        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.drawElements(gl.TRIANGLES, this.currentGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Create model matrix (TRS: Translate, Rotate, Scale)
     */
    createModelMatrix(position, rotation, scale) {
        const mat = this.identity();

        // Translate
        this.translate(mat, position);

        // Rotate (X, Y, Z order)
        this.rotateX(mat, rotation[0]);
        this.rotateY(mat, rotation[1]);
        this.rotateZ(mat, rotation[2]);

        // Scale
        this.scale(mat, [scale, scale, scale]);

        return mat;
    }

    /**
     * Create perspective projection matrix
     */
    createPerspectiveMatrix() {
        const fov = 45 * Math.PI / 180;
        const aspect = this.canvas.width / this.canvas.height;
        const near = 0.1;
        const far = 100.0;

        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);

        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }

    /**
     * Create view matrix (lookAt)
     */
    createViewMatrix() {
        // Simple lookAt implementation
        const eye = this.cameraPosition;
        const center = this.cameraTarget;
        const up = [0, 1, 0];

        // Forward
        const fx = center[0] - eye[0];
        const fy = center[1] - eye[1];
        const fz = center[2] - eye[2];
        const fLen = Math.sqrt(fx*fx + fy*fy + fz*fz);
        const f = [fx/fLen, fy/fLen, fz/fLen];

        // Right = forward × up
        const rx = f[1]*up[2] - f[2]*up[1];
        const ry = f[2]*up[0] - f[0]*up[2];
        const rz = f[0]*up[1] - f[1]*up[0];
        const rLen = Math.sqrt(rx*rx + ry*ry + rz*rz);
        const r = [rx/rLen, ry/rLen, rz/rLen];

        // Up = right × forward
        const u = [
            r[1]*f[2] - r[2]*f[1],
            r[2]*f[0] - r[0]*f[2],
            r[0]*f[1] - r[1]*f[0]
        ];

        return new Float32Array([
            r[0], u[0], -f[0], 0,
            r[1], u[1], -f[1], 0,
            r[2], u[2], -f[2], 0,
            -(r[0]*eye[0] + r[1]*eye[1] + r[2]*eye[2]),
            -(u[0]*eye[0] + u[1]*eye[1] + u[2]*eye[2]),
            f[0]*eye[0] + f[1]*eye[1] + f[2]*eye[2],
            1
        ]);
    }

    // Matrix helpers
    identity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    translate(mat, [x, y, z]) {
        mat[12] += x;
        mat[13] += y;
        mat[14] += z;
    }

    rotateX(mat, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m1 = mat[4], m2 = mat[5], m3 = mat[6], m4 = mat[7];
        const m5 = mat[8], m6 = mat[9], m7 = mat[10], m8 = mat[11];
        mat[4] = m1 * c + m5 * s;
        mat[5] = m2 * c + m6 * s;
        mat[6] = m3 * c + m7 * s;
        mat[7] = m4 * c + m8 * s;
        mat[8] = m5 * c - m1 * s;
        mat[9] = m6 * c - m2 * s;
        mat[10] = m7 * c - m3 * s;
        mat[11] = m8 * c - m4 * s;
    }

    rotateY(mat, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m0 = mat[0], m1 = mat[1], m2 = mat[2], m3 = mat[3];
        const m8 = mat[8], m9 = mat[9], m10 = mat[10], m11 = mat[11];
        mat[0] = m0 * c - m8 * s;
        mat[1] = m1 * c - m9 * s;
        mat[2] = m2 * c - m10 * s;
        mat[3] = m3 * c - m11 * s;
        mat[8] = m0 * s + m8 * c;
        mat[9] = m1 * s + m9 * c;
        mat[10] = m2 * s + m10 * c;
        mat[11] = m3 * s + m11 * c;
    }

    rotateZ(mat, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m0 = mat[0], m1 = mat[1], m2 = mat[2], m3 = mat[3];
        const m4 = mat[4], m5 = mat[5], m6 = mat[6], m7 = mat[7];
        mat[0] = m0 * c + m4 * s;
        mat[1] = m1 * c + m5 * s;
        mat[2] = m2 * c + m6 * s;
        mat[3] = m3 * c + m7 * s;
        mat[4] = m4 * c - m0 * s;
        mat[5] = m5 * c - m1 * s;
        mat[6] = m6 * c - m2 * s;
        mat[7] = m7 * c - m3 * s;
    }

    scale(mat, [x, y, z]) {
        mat[0] *= x;
        mat[1] *= x;
        mat[2] *= x;
        mat[3] *= x;
        mat[4] *= y;
        mat[5] *= y;
        mat[6] *= y;
        mat[7] *= y;
        mat[8] *= z;
        mat[9] *= z;
        mat[10] *= z;
        mat[11] *= z;
    }

    /**
     * Cleanup
     */
    destroy() {
        const {gl} = this;
        if (this.buffers.position) gl.deleteBuffer(this.buffers.position);
        if (this.buffers.normal) gl.deleteBuffer(this.buffers.normal);
        if (this.buffers.indices) gl.deleteBuffer(this.buffers.indices);
        if (this.program) gl.deleteProgram(this.program);
    }
}
