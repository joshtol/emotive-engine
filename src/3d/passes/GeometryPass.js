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
            renderMode: gl.getUniformLocation(this.program, 'u_renderMode')
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

        // Draw geometry
        const indexCount = scene.geometry.indices.length;
        gl.drawElements(
            gl.TRIANGLES,
            indexCount,
            gl.UNSIGNED_SHORT,
            0
        );
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
