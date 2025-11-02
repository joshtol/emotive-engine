import { BasePass } from './BasePass.js';
import vertexShaderSource from '../shaders/core.vert';
import fragmentShaderSource from '../shaders/core.frag';

/**
 * MultiObjectPass - Render multiple SceneObjects in a single scene
 *
 * Similar to GeometryPass but supports rendering an array of SceneObjects,
 * each with its own geometry, material, and transform.
 *
 * This allows rendering complex scenes with multiple objects (e.g., 4 spheres + ground plane)
 * while using the same calibrated PBR shader.
 */
export class MultiObjectPass extends BasePass {
    constructor() {
        super('multi-object');
        this.program = null;
        this.locations = null;
        this.objectBuffers = new Map(); // VAOs per geometry
        this.dummyCubemap = null;
    }

    /**
     * Setup shader program and get attribute/uniform locations
     */
    setup() {
        const { gl } = this.renderer;

        // Compile shader program (same as GeometryPass)
        this.program = this.renderer.createProgram(vertexShaderSource, fragmentShaderSource);

        if (!this.program) {
            throw new Error('Failed to create shader program');
        }

        // Get attribute locations
        this.locations = {
            // Attributes
            position: gl.getAttribLocation(this.program, 'a_position'),
            normal: gl.getAttribLocation(this.program, 'a_normal'),

            // Uniforms
            modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
            viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
            projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            glowColor: gl.getUniformLocation(this.program, 'u_glowColor'),
            glowIntensity: gl.getUniformLocation(this.program, 'u_glowIntensity'),
            cameraPosition: gl.getUniformLocation(this.program, 'u_cameraPosition'),
            lightDirection: gl.getUniformLocation(this.program, 'u_lightDirection'),
            time: gl.getUniformLocation(this.program, 'u_time'),

            // Blended rendering
            pbrAmount: gl.getUniformLocation(this.program, 'u_pbrAmount'),
            toonAmount: gl.getUniformLocation(this.program, 'u_toonAmount'),
            flatAmount: gl.getUniformLocation(this.program, 'u_flatAmount'),
            normalsAmount: gl.getUniformLocation(this.program, 'u_normalsAmount'),
            edgesAmount: gl.getUniformLocation(this.program, 'u_edgesAmount'),
            rimAmount: gl.getUniformLocation(this.program, 'u_rimAmount'),
            wireframeAmount: gl.getUniformLocation(this.program, 'u_wireframeAmount'),

            // Material properties
            roughness: gl.getUniformLocation(this.program, 'u_roughness'),
            metallic: gl.getUniformLocation(this.program, 'u_metallic'),
            ao: gl.getUniformLocation(this.program, 'u_ao'),
            sssStrength: gl.getUniformLocation(this.program, 'u_sssStrength'),
            anisotropy: gl.getUniformLocation(this.program, 'u_anisotropy'),
            iridescence: gl.getUniformLocation(this.program, 'u_iridescence'),
            envMap: gl.getUniformLocation(this.program, 'u_envMap'),
            envIntensity: gl.getUniformLocation(this.program, 'u_envIntensity')
        };
    }

    /**
     * Execute rendering for multiple scene objects
     * @param {Object} scene - Scene data
     * @param {Array<SceneObject>} scene.objects - Array of SceneObjects to render
     * @param {WebGLTexture} scene.envMap - HDRI environment map
     * @param {number} scene.envIntensity - Environment map intensity
     * @param {Object} camera - Camera data with view/projection matrices
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        if (!scene.objects || scene.objects.length === 0) {
            return; // Nothing to render
        }

        // Set shader program
        this.renderer.setProgram(this.program);

        // Enable HDR framebuffer
        const hdrEnabled = scene.hdrEnabled !== undefined ? scene.hdrEnabled : true;
        if (hdrEnabled && this.fbManager) {
            const width = gl.canvas.width;
            const height = gl.canvas.height;
            const hdrFBO = this.fbManager.get('hdr', width, height, { hdr: true, depth: true });
            this.renderer.setFramebuffer(hdrFBO.fbo);
        } else {
            this.renderer.setFramebuffer(null);
        }

        // Clear framebuffer
        this.renderer.clear(true, true);

        // Set camera matrices (shared across all objects)
        gl.uniformMatrix4fv(this.locations.viewMatrix, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.locations.projectionMatrix, false, camera.projectionMatrix);
        gl.uniform3fv(this.locations.cameraPosition, camera.position);

        // Set environment map (shared across all objects)
        const envIntensity = scene.envIntensity !== undefined ? scene.envIntensity : 0.0;
        gl.uniform1f(this.locations.envIntensity, envIntensity);

        gl.activeTexture(gl.TEXTURE5);
        if (scene.envMap) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.envMap);
        } else {
            if (!this.dummyCubemap) {
                this.dummyCubemap = this.createDummyCubemap(gl);
            }
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.dummyCubemap);
        }
        gl.uniform1i(this.locations.envMap, 5);

        // Set global lighting (shared)
        const lightDir = scene.lightDirection || [1, 1, 1];
        gl.uniform3fv(this.locations.lightDirection, lightDir);
        gl.uniform1f(this.locations.time, scene.time || 0);

        // Set default rendering amounts (can be overridden per object if needed)
        gl.uniform1f(this.locations.pbrAmount, 1.0);
        gl.uniform1f(this.locations.toonAmount, 0.0);
        gl.uniform1f(this.locations.flatAmount, 0.0);
        gl.uniform1f(this.locations.normalsAmount, 0.0);
        gl.uniform1f(this.locations.edgesAmount, 0.0);
        gl.uniform1f(this.locations.rimAmount, 0.0);
        gl.uniform1f(this.locations.wireframeAmount, 0.0);

        // Render each object
        for (const obj of scene.objects) {
            this.renderObject(obj, gl);
        }
    }

    /**
     * Render a single SceneObject
     * @param {SceneObject} obj - Object to render
     * @param {WebGL2RenderingContext} gl - WebGL context
     * @private
     */
    renderObject(obj, gl) {
        if (!obj.geometry) return;

        // Get or create VAO for this geometry
        const vao = this.getOrCreateVAO(obj.geometry, gl);
        gl.bindVertexArray(vao);

        // Set model matrix (per-object transform)
        gl.uniformMatrix4fv(this.locations.modelMatrix, false, obj.getModelMatrix());

        // Set material properties (per-object)
        gl.uniform3fv(this.locations.glowColor, obj.material.glowColor);
        gl.uniform1f(this.locations.glowIntensity, 1.0); // Default
        gl.uniform1f(this.locations.roughness, obj.material.roughness);
        gl.uniform1f(this.locations.metallic, obj.material.metallic);
        gl.uniform1f(this.locations.ao, obj.material.ao);
        gl.uniform1f(this.locations.sssStrength, obj.material.sssStrength);
        gl.uniform1f(this.locations.anisotropy, obj.material.anisotropy);
        gl.uniform1f(this.locations.iridescence, obj.material.iridescence);

        // Draw
        const indexCount = obj.geometry.indices.length;
        const indexType = obj.geometry.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, indexCount, indexType, 0);
    }

    /**
     * Get or create VAO for geometry
     * @param {Object} geometry - Geometry data
     * @param {WebGL2RenderingContext} gl - WebGL context
     * @returns {WebGLVertexArrayObject} VAO
     * @private
     */
    getOrCreateVAO(geometry, gl) {
        // Use geometry object as key (assumes same geometry object = same data)
        if (this.objectBuffers.has(geometry)) {
            return this.objectBuffers.get(geometry);
        }

        // Create new VAO
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Position buffer
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.position);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

        // Normal buffer
        const normBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.normal);
        gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0);

        // Index buffer
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        // Cache VAO
        this.objectBuffers.set(geometry, vao);

        return vao;
    }

    /**
     * Create dummy black cubemap for when no HDRI loaded
     * @param {WebGL2RenderingContext} gl - WebGL context
     * @returns {WebGLTexture} Dummy cubemap
     * @private
     */
    createDummyCubemap(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        const blackPixel = new Uint8Array([0, 0, 0, 255]);
        const faces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        for (const face of faces) {
            gl.texImage2D(face, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blackPixel);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        return texture;
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        const { gl } = this.renderer;

        // Delete all cached VAOs
        for (const vao of this.objectBuffers.values()) {
            gl.deleteVertexArray(vao);
        }
        this.objectBuffers.clear();

        if (this.dummyCubemap) {
            gl.deleteTexture(this.dummyCubemap);
            this.dummyCubemap = null;
        }

        super.cleanup();
    }
}
