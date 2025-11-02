/**
 * QuadGeometry - Fullscreen quad for post-processing effects
 *
 * Provides geometry and utilities for rendering fullscreen passes.
 * Used by tone mapping, bloom, and other post-processing effects.
 */

/**
 * Create a fullscreen quad geometry
 * @returns {Object} Quad geometry with positions and UVs
 */
export function createQuadGeometry() {
    // Fullscreen quad in NDC space (-1 to 1)
    // Two triangles forming a quad
    const positions = new Float32Array([
        -1.0, -1.0,  // Bottom-left
         1.0, -1.0,  // Bottom-right
        -1.0,  1.0,  // Top-left
         1.0,  1.0   // Top-right
    ]);

    // Texture coordinates (0 to 1)
    const uvs = new Float32Array([
        0.0, 0.0,  // Bottom-left
        1.0, 0.0,  // Bottom-right
        0.0, 1.0,  // Top-left
        1.0, 1.0   // Top-right
    ]);

    // Indices for two triangles
    const indices = new Uint16Array([
        0, 1, 2,  // First triangle
        2, 1, 3   // Second triangle
    ]);

    return {
        positions,
        uvs,
        indices
    };
}

/**
 * Setup quad geometry buffers for WebGL
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {Object} program - Shader program with attribute locations
 * @returns {Object} Buffer objects
 */
export function setupQuadBuffers(gl, program) {
    const quad = createQuadGeometry();

    // Get attribute locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const uvLocation = gl.getAttribLocation(program, 'a_uv');

    // Create position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad.positions, gl.STATIC_DRAW);

    // Create UV buffer
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad.uvs, gl.STATIC_DRAW);

    // Create index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quad.indices, gl.STATIC_DRAW);

    return {
        positionBuffer,
        uvBuffer,
        indexBuffer,
        positionLocation,
        uvLocation,
        indexCount: quad.indices.length
    };
}

/**
 * Render a fullscreen quad
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {Object} buffers - Buffer objects from setupQuadBuffers
 */
export function renderQuad(gl, buffers) {
    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
    gl.vertexAttribPointer(buffers.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(buffers.positionLocation);

    // Bind UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvBuffer);
    gl.vertexAttribPointer(buffers.uvLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(buffers.uvLocation);

    // Bind index buffer and draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
    gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
}
