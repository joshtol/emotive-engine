/**
 * Procedural Diamond Geometry
 *
 * Brilliant-cut diamond shape (stretched octahedron)
 * Classic faceted gem appearance
 */

export function createDiamond() {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Diamond proportions (brilliant cut inspired)
    const topHeight = 1.2; // Crown height
    const bottomHeight = -0.8; // Pavilion depth
    // const tableSize = 0.4;     // Top facet size
    const girdleSize = 0.8; // Widest point

    // Key vertices
    const topPoint = [0, topHeight, 0];
    const bottomPoint = [0, bottomHeight, 0];

    // Girdle (widest part - 8 points for more facets)
    const girdlePoints = [];
    const segments = 8;

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        girdlePoints.push([Math.cos(angle) * girdleSize, 0, Math.sin(angle) * girdleSize]);
    }

    // Helper to add triangle
    function addTriangle(p1, p2, p3) {
        // Calculate normal
        const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

        // Cross product
        const nx = v1[1] * v2[2] - v1[2] * v2[1];
        const ny = v1[2] * v2[0] - v1[0] * v2[2];
        const nz = v1[0] * v2[1] - v1[1] * v2[0];

        // Normalize
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const normal = [nx / len, ny / len, nz / len];

        // Add vertices with normal
        const baseIdx = vertices.length / 3;

        vertices.push(...p1);
        normals.push(...normal);

        vertices.push(...p2);
        normals.push(...normal);

        vertices.push(...p3);
        normals.push(...normal);

        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    }

    // Crown facets (top pyramid)
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        addTriangle(topPoint, girdlePoints[i], girdlePoints[next]);
    }

    // Pavilion facets (bottom pyramid)
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        addTriangle(girdlePoints[i], bottomPoint, girdlePoints[next]);
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices),
    };
}
