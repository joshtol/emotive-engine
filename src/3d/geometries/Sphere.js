/**
 * Procedural Sphere Geometry
 *
 * Generates UV sphere using latitude/longitude parameterization
 */

export function createSphere(segments = 32, rings = 32) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Generate vertices
    for (let ring = 0; ring <= rings; ring++) {
        const v = ring / rings; // 0 to 1
        const phi = v * Math.PI; // 0 to π (latitude)

        for (let segment = 0; segment <= segments; segment++) {
            const u = segment / segments; // 0 to 1
            const theta = u * Math.PI * 2; // 0 to 2π (longitude)

            // Spherical to Cartesian coordinates
            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.cos(phi);
            const z = Math.sin(theta) * Math.sin(phi);

            vertices.push(x, y, z);

            // For sphere, normal = position (unit sphere)
            normals.push(x, y, z);
        }
    }

    // Generate indices (triangles)
    for (let ring = 0; ring < rings; ring++) {
        for (let segment = 0; segment < segments; segment++) {
            const a = ring * (segments + 1) + segment;
            const b = a + segments + 1;
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
        indices: new Uint16Array(indices),
    };
}
