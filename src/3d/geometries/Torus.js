/**
 * Procedural Torus Geometry (Donut Shape)
 *
 * Generates a torus (ring/donut) by revolving a circle around an axis.
 * Perfect for testing HDR, bloom, and subsurface scattering because:
 * - Has both thick and thin sections
 * - Light can pass through the thin ring
 * - Curved surfaces show off rim lighting beautifully
 * - Inner/outer surfaces demonstrate lighting variety
 *
 * @param {number} majorRadius - Distance from center to tube center (default 1.0)
 * @param {number} minorRadius - Radius of the tube itself (default 0.4)
 * @param {number} majorSegments - Segments around the major circle (default 48)
 * @param {number} minorSegments - Segments around the tube (default 24)
 */
export function createTorus(
    majorRadius = 1.0,
    minorRadius = 0.4,
    majorSegments = 48,
    minorSegments = 24
) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Generate vertices and normals
    for (let i = 0; i <= majorSegments; i++) {
        const u = i / majorSegments; // 0 to 1 around major circle
        const theta = u * Math.PI * 2; // 0 to 2π

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let j = 0; j <= minorSegments; j++) {
            const v = j / minorSegments; // 0 to 1 around minor circle
            const phi = v * Math.PI * 2; // 0 to 2π

            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            // Torus parametric equations
            const x = (majorRadius + minorRadius * cosPhi) * cosTheta;
            const y = minorRadius * sinPhi;
            const z = (majorRadius + minorRadius * cosPhi) * sinTheta;

            vertices.push(x, y, z);

            // Calculate normal (pointing outward from tube center)
            // Center of current tube circle
            const cx = majorRadius * cosTheta;
            const cz = majorRadius * sinTheta;

            // Normal points from tube center to vertex
            const nx = (x - cx);
            const ny = y;
            const nz = (z - cz);

            // Normalize
            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals.push(nx / length, ny / length, nz / length);
        }
    }

    // Generate indices (triangles)
    for (let i = 0; i < majorSegments; i++) {
        for (let j = 0; j < minorSegments; j++) {
            const a = i * (minorSegments + 1) + j;
            const b = a + minorSegments + 1;
            const c = a + 1;
            const d = b + 1;

            // Two triangles per quad
            indices.push(a, b, c);
            indices.push(c, b, d);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}
