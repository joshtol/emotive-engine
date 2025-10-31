/**
 * Procedural Crystal Geometry
 *
 * Hexagonal crystal with pointed top and bottom
 * Perfect for magical/mystical aesthetic
 */

export function createCrystal(segments = 6) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const height = 1.5;
    const radius = 0.7;
    const midHeight = 0;

    // Vertices
    const vertexMap = new Map();
    let vertexIndex = 0;

    // Helper to add unique vertex
    function addVertex(x, y, z, nx, ny, nz) {
        const key = `${x},${y},${z}`;
        if (!vertexMap.has(key)) {
            vertices.push(x, y, z);
            normals.push(nx, ny, nz);
            vertexMap.set(key, vertexIndex++);
        }
        return vertexMap.get(key);
    }

    // Top point
    const topIndex = addVertex(0, height, 0, 0, 1, 0);

    // Middle ring (hexagon)
    const midIndices = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Calculate face normal (pointing outward)
        const nx = Math.cos(angle);
        const nz = Math.sin(angle);

        const idx = addVertex(x, midHeight, z, nx, 0, nz);
        midIndices.push(idx);
    }

    // Bottom point
    const bottomIndex = addVertex(0, -height, 0, 0, -1, 0);

    // Create triangles

    // Top pyramid (top point to mid ring)
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push(
            topIndex,
            midIndices[i],
            midIndices[next]
        );
    }

    // Bottom pyramid (mid ring to bottom point)
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push(
            midIndices[i],
            bottomIndex,
            midIndices[next]
        );
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}
