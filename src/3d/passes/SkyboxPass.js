import { BasePass } from './BasePass.js';

/**
 * SkyboxPass - Render HDRI environment as background skybox
 *
 * Renders a large cube with the HDRI cubemap texture,
 * positioned at infinity (depth = 1.0) to serve as the scene background.
 */
export class SkyboxPass extends BasePass {
    constructor() {
        super('skybox');
        this.program = null;
        this.vao = null;
        this.indexCount = 0;
    }

    /**
     * Setup shader program and skybox geometry
     */
    setup() {
        const { gl } = this.renderer;

        // Vertex shader - simple cube at infinity
        const vertexShader = `#version 300 es
            in vec3 a_position;

            uniform mat4 u_viewProj;

            out vec3 v_dir;

            void main() {
                v_dir = a_position;
                vec4 pos = u_viewProj * vec4(a_position, 1.0);
                gl_Position = pos.xyww; // Force depth = 1.0 (at far plane)
            }
        `;

        // Fragment shader - sample cubemap
        const fragmentShader = `#version 300 es
            precision highp float;

            in vec3 v_dir;

            uniform samplerCube u_envMap;
            uniform float u_envIntensity;

            out vec4 fragColor;

            void main() {
                vec3 color = texture(u_envMap, v_dir).rgb * u_envIntensity;
                fragColor = vec4(color, 1.0);
            }
        `;

        this.program = this.renderer.createProgram(vertexShader, fragmentShader);

        if (!this.program) {
            throw new Error('Failed to create skybox shader program');
        }

        // Get locations
        this.locations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            viewProj: gl.getUniformLocation(this.program, 'u_viewProj'),
            envMap: gl.getUniformLocation(this.program, 'u_envMap'),
            envIntensity: gl.getUniformLocation(this.program, 'u_envIntensity')
        };

        // Create skybox cube geometry
        this.createSkyboxGeometry(gl);
    }

    /**
     * Create large cube geometry for skybox
     * @param {WebGL2RenderingContext} gl
     * @private
     */
    createSkyboxGeometry(gl) {
        const size = 50; // Large cube

        // Cube vertices (positions only, normals not needed)
        const vertices = new Float32Array([
            // Front face
            -size, -size, -size,
             size, -size, -size,
             size,  size, -size,
            -size,  size, -size,
            // Back face
            -size, -size,  size,
             size, -size,  size,
             size,  size,  size,
            -size,  size,  size
        ]);

        // Cube indices (CCW winding)
        const indices = new Uint16Array([
            // Front
            0, 1, 2,  0, 2, 3,
            // Back
            4, 6, 5,  4, 7, 6,
            // Left
            4, 5, 1,  4, 1, 0,
            // Right
            3, 2, 6,  3, 6, 7,
            // Top
            1, 5, 6,  1, 6, 2,
            // Bottom
            4, 0, 3,  4, 3, 7
        ]);

        this.indexCount = indices.length;

        // Create VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Position buffer
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.position);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

        // Index buffer
        const ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
    }

    /**
     * Execute skybox rendering
     * @param {Object} scene - Scene data with envMap
     * @param {Object} camera - Camera matrices
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        if (!scene.envMap) {
            return; // No HDRI to render
        }

        // Use skybox shader
        this.renderer.setProgram(this.program);

        // Bind to same framebuffer as geometry (HDR or screen)
        const hdrEnabled = scene.hdrEnabled !== undefined ? scene.hdrEnabled : true;
        if (hdrEnabled && this.fbManager) {
            const width = gl.canvas.width;
            const height = gl.canvas.height;
            const hdrFBO = this.fbManager.get('hdr', width, height, { hdr: true, depth: true });
            this.renderer.setFramebuffer(hdrFBO.fbo);
        } else {
            this.renderer.setFramebuffer(null);
        }

        // Don't clear - we're rendering after geometry (or before, depending on use case)
        // For background, render first with depth test = LEQUAL

        // Compute view-projection matrix without translation (removes camera position)
        const viewProj = this.computeViewProjNoTranslation(camera);

        // Set uniforms
        gl.uniformMatrix4fv(this.locations.viewProj, false, viewProj);
        gl.uniform1f(this.locations.envIntensity, scene.envIntensity || 1.0);

        // Bind cubemap
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.envMap);
        gl.uniform1i(this.locations.envMap, 0);

        // Render with special depth settings
        gl.depthFunc(gl.LEQUAL); // Render at far plane
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.depthFunc(gl.LESS); // Restore default
    }

    /**
     * Compute view-projection matrix with camera rotation but no translation
     * This makes the skybox appear at infinity
     * @param {Object} camera
     * @returns {Float32Array} 4x4 matrix
     * @private
     */
    computeViewProjNoTranslation(camera) {
        // Remove translation from view matrix (set last column to 0,0,0,1)
        const view = new Float32Array(camera.viewMatrix);
        view[12] = 0;
        view[13] = 0;
        view[14] = 0;

        // Multiply with projection
        return this.multiplyMat4(camera.projectionMatrix, view);
    }

    /**
     * Multiply two 4x4 matrices
     * @param {Float32Array} a
     * @param {Float32Array} b
     * @returns {Float32Array}
     * @private
     */
    multiplyMat4(a, b) {
        const out = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] =
                    a[i * 4 + 0] * b[0 + j] +
                    a[i * 4 + 1] * b[4 + j] +
                    a[i * 4 + 2] * b[8 + j] +
                    a[i * 4 + 3] * b[12 + j];
            }
        }
        return out;
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        const { gl } = this.renderer;

        if (this.vao) {
            gl.deleteVertexArray(this.vao);
            this.vao = null;
        }

        super.cleanup();
    }
}
