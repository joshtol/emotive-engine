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
            // New blended rendering uniforms
            pbrAmount: gl.getUniformLocation(this.program, 'u_pbrAmount'),
            toonAmount: gl.getUniformLocation(this.program, 'u_toonAmount'),
            flatAmount: gl.getUniformLocation(this.program, 'u_flatAmount'),
            normalsAmount: gl.getUniformLocation(this.program, 'u_normalsAmount'),
            edgesAmount: gl.getUniformLocation(this.program, 'u_edgesAmount'),
            rimAmount: gl.getUniformLocation(this.program, 'u_rimAmount'),
            wireframeAmount: gl.getUniformLocation(this.program, 'u_wireframeAmount')
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

        // Clear framebuffer (render to screen)
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

        // Draw geometry
        const indexCount = scene.geometry.indices.length;
        gl.drawElements(
            gl.TRIANGLES,
            indexCount,
            gl.UNSIGNED_SHORT,
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
}
