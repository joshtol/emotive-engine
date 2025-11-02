import { BasePass } from './BasePass.js';
import vertexShaderSource from '../shaders/core.vert';
import fragmentShaderSource from '../shaders/core.frag';

/**
 * GeometryPass - Render main scene geometry
 *
 * Handles:
 * - Geometry rendering with current shaders
 * - Uniform updates (matrices, glow, camera position)
 * - Vertex buffer setup
 *
 * This pass renders the 3D mascot core geometry.
 */
export class GeometryPass extends BasePass {
    constructor() {
        super('geometry');
        this.program = null;
        this.locations = null;
        this.buffers = {};
        this.wireframeIndexCount = 0;
        this.currentGeometry = null; // Track current geometry to detect changes
    }

    /**
     * Setup shader program and get attribute/uniform locations
     */
    setup() {
        const { gl } = this.renderer;

        // Compile shader program
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
            renderMode: gl.getUniformLocation(this.program, 'u_renderMode'),
            lightDirection: gl.getUniformLocation(this.program, 'u_lightDirection'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            // New blended rendering uniforms
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
     * Execute geometry rendering
     * @param {Object} scene - Scene data with geometry, transforms, materials
     * @param {Object} camera - Camera data with view/projection matrices
     */
    execute(scene, camera) {
        const { gl } = this.renderer;

        // Set shader program
        this.renderer.setProgram(this.program);

        // Check if HDR is enabled
        const hdrEnabled = scene.hdrEnabled !== undefined ? scene.hdrEnabled : true;

        if (hdrEnabled) {
            // Render to HDR framebuffer
            const hdrFBO = this.fbManager.get('hdr');
            if (!hdrFBO) {
                // Create HDR framebuffer on first use
                const width = gl.canvas.width;
                const height = gl.canvas.height;
                this.fbManager.acquire('hdr', width, height, 'RGBA16F');
            }
            this.renderer.setFramebuffer(this.fbManager.get('hdr'));
        } else {
            // Render directly to screen (LDR fallback)
            this.renderer.setFramebuffer(null);
        }

        // Clear framebuffer
        this.renderer.clear(true, true);

        // Skip if no geometry
        if (!scene.geometry) {
            return;
        }

        // Setup geometry buffers
        this.setupGeometry(scene.geometry);

        // Set uniforms
        gl.uniformMatrix4fv(this.locations.modelMatrix, false, scene.modelMatrix);
        gl.uniformMatrix4fv(this.locations.viewMatrix, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.locations.projectionMatrix, false, camera.projectionMatrix);
        gl.uniform3fv(this.locations.glowColor, scene.glowColor || [0, 0, 0]);
        gl.uniform1f(this.locations.glowIntensity, scene.glowIntensity || 0.0);
        gl.uniform3fv(this.locations.cameraPosition, camera.position);
        gl.uniform1i(this.locations.renderMode, scene.renderMode || 0);
        gl.uniform3fv(this.locations.lightDirection, scene.lightDirection || [0.5, 1.0, 1.0]);
        gl.uniform1f(this.locations.time, scene.time || 0.0);

        // Blended rendering uniforms
        const blend = scene.renderBlend || {
            pbr: 1.0, toon: 0.0, flat: 0.0, normals: 0.0,
            edges: 0.0, rim: 0.0, wireframe: 0.0
        };

        gl.uniform1f(this.locations.pbrAmount, blend.pbr);
        gl.uniform1f(this.locations.toonAmount, blend.toon);
        gl.uniform1f(this.locations.flatAmount, blend.flat);
        gl.uniform1f(this.locations.normalsAmount, blend.normals);
        gl.uniform1f(this.locations.edgesAmount, blend.edges);
        gl.uniform1f(this.locations.rimAmount, blend.rim);
        gl.uniform1f(this.locations.wireframeAmount, blend.wireframe);

        // Set material properties (with sensible defaults)
        const roughness = scene.roughness !== undefined ? scene.roughness : 0.2;
        const metallic = scene.metallic !== undefined ? scene.metallic : 0.3;
        const ao = scene.ao !== undefined ? scene.ao : 1.0;  // Default: no occlusion
        const sssStrength = scene.sssStrength !== undefined ? scene.sssStrength : 0.0;  // Default: disabled
        const anisotropy = scene.anisotropy !== undefined ? scene.anisotropy : 0.0;  // Default: isotropic
        const iridescence = scene.iridescence !== undefined ? scene.iridescence : 0.0;  // Default: disabled

        gl.uniform1f(this.locations.roughness, roughness);
        gl.uniform1f(this.locations.metallic, metallic);
        gl.uniform1f(this.locations.ao, ao);
        gl.uniform1f(this.locations.sssStrength, sssStrength);
        gl.uniform1f(this.locations.anisotropy, anisotropy);
        gl.uniform1f(this.locations.iridescence, iridescence);

        // Environment map - MUST ALWAYS bind texture (WebGL requirement for samplerCube)
        const envIntensity = scene.envIntensity !== undefined ? scene.envIntensity : 0.0;
        gl.uniform1f(this.locations.envIntensity, envIntensity);

        // CRITICAL: Always bind texture to TEXTURE5, even if envMap is null or intensity is 0
        // WebGL requires samplerCube uniforms to ALWAYS have a texture bound
        gl.activeTexture(gl.TEXTURE5);
        if (scene.envMap) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.envMap);
        } else {
            // No HDRI loaded yet - bind dummy black cubemap (will create on first use)
            if (!this.dummyCubemap) {
                this.dummyCubemap = this.createDummyCubemap(gl);
            }
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.dummyCubemap);
        }
        gl.uniform1i(this.locations.envMap, 5);  // Tell shader: sampler is on unit 5

        // Debug: Log once with EXTENSIVE detail
        if (!this._envMapDebugLogged && scene.envMap) {
            console.log('[GeometryPass] ========== RENDER-TIME TEXTURE DEBUG ==========');
            console.log('[GeometryPass] Scene envMap:', scene.envMap);
            console.log('[GeometryPass] Scene envIntensity:', envIntensity);
            console.log('[GeometryPass] Uniform location:', this.locations.envMap);
            console.log('[GeometryPass] Uniform location valid:', this.locations.envMap !== null && this.locations.envMap !== -1);

            // Verify active texture unit
            const boundTexture = gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
            console.log('[GeometryPass] Texture bound to TEXTURE5:', boundTexture);
            console.log('[GeometryPass] Same texture?', boundTexture === scene.envMap);

            // Get current texture parameters
            if (boundTexture) {
                gl.activeTexture(gl.TEXTURE5);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.envMap);

                const minFilter = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER);
                const magFilter = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER);
                console.log('[GeometryPass] Min filter:', minFilter, '(expected LINEAR_MIPMAP_LINEAR=', gl.LINEAR_MIPMAP_LINEAR, ')');
                console.log('[GeometryPass] Mag filter:', magFilter, '(expected LINEAR=', gl.LINEAR, ')');
            }

            // Check for WebGL errors
            const error = gl.getError();
            if (error !== gl.NO_ERROR) {
                console.error('[GeometryPass] WebGL error:', error);
            } else {
                console.log('[GeometryPass] No WebGL errors');
            }

            console.log('[GeometryPass] ================================================');

            this._envMapDebugLogged = true;
        }

        // Draw geometry
        const indexCount = scene.geometry.indices.length;
        const indexType = scene.geometry.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

        // Enable OES_element_index_uint extension if using Uint32Array
        if (indexType === gl.UNSIGNED_INT && !this.uint32Extension) {
            this.uint32Extension = gl.getExtension('OES_element_index_uint');
            if (!this.uint32Extension) {
                console.warn('OES_element_index_uint extension not supported - 32-bit indices may not work');
            }
        }

        gl.drawElements(
            gl.TRIANGLES,
            indexCount,
            indexType,
            0
        );

        // Draw wireframe overlay if enabled
        if (scene.wireframeEnabled) {
            // Create wireframe indices if not already created or geometry changed
            if (!this.wireframeIndexCount || this.currentGeometry !== scene.geometry) {
                this.createWireframeIndices(scene.geometry);
            }

            // Save original uniforms
            const originalGlowColor = scene.glowColor;
            const originalGlowIntensity = scene.glowIntensity;

            // Set wireframe color to pure white with reduced glow for contrast
            gl.uniform3fv(this.locations.glowColor, [1.0, 1.0, 1.0]);
            gl.uniform1f(this.locations.glowIntensity, 0.5);

            // Disable depth writes to overlay on top
            gl.depthMask(false);

            // Set line width (note: many browsers ignore values > 1)
            gl.lineWidth(2.0);

            // Draw wireframe
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.wireframeIndices);
            gl.drawElements(
                gl.LINES,
                this.wireframeIndexCount,
                gl.UNSIGNED_SHORT,
                0
            );

            // Restore state
            gl.depthMask(true);
            gl.lineWidth(1.0);
            gl.uniform3fv(this.locations.glowColor, originalGlowColor);
            gl.uniform1f(this.locations.glowIntensity, originalGlowIntensity);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        }
    }

    /**
     * Create wireframe indices from triangle indices
     * Deduplicates edges so shared edges are only drawn once
     * @param {Object} geometry - Geometry data with indices
     */
    createWireframeIndices(geometry) {
        const { gl } = this.renderer;
        const triangleIndices = geometry.indices;
        const edges = new Set();
        const wireframeIndices = [];

        // Extract unique edges from triangles
        for (let i = 0; i < triangleIndices.length; i += 3) {
            const v0 = triangleIndices[i];
            const v1 = triangleIndices[i + 1];
            const v2 = triangleIndices[i + 2];

            // Add three edges of the triangle (sorted to avoid duplicates)
            const edge1 = v0 < v1 ? `${v0},${v1}` : `${v1},${v0}`;
            const edge2 = v1 < v2 ? `${v1},${v2}` : `${v2},${v1}`;
            const edge3 = v2 < v0 ? `${v2},${v0}` : `${v0},${v2}`;

            if (!edges.has(edge1)) {
                edges.add(edge1);
                wireframeIndices.push(v0, v1);
            }
            if (!edges.has(edge2)) {
                edges.add(edge2);
                wireframeIndices.push(v1, v2);
            }
            if (!edges.has(edge3)) {
                edges.add(edge3);
                wireframeIndices.push(v2, v0);
            }
        }

        // Create buffer
        this.buffers.wireframeIndices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.wireframeIndices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), gl.STATIC_DRAW);

        this.wireframeIndexCount = wireframeIndices.length;
        this.currentGeometry = geometry; // Track which geometry this wireframe belongs to
    }

    /**
     * Setup vertex buffers for geometry
     * @param {Object} geometry - Geometry data (vertices, normals, indices)
     */
    setupGeometry(geometry) {
        const { gl } = this.renderer;

        // Create or update vertex buffer
        if (!this.buffers.vertices) {
            this.buffers.vertices = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.locations.position);

        // Create or update normal buffer
        if (!this.buffers.normals) {
            this.buffers.normals = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.locations.normal);

        // Create or update index buffer
        if (!this.buffers.indices) {
            this.buffers.indices = gl.createBuffer();
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    }

    /**
     * Create a 1x1 black cubemap for use when no HDRI is loaded
     * WebGL requires samplerCube uniforms to ALWAYS have a texture bound
     */
    createDummyCubemap(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        // 1x1 black pixel for all 6 faces
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
}
