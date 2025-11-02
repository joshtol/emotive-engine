/**
 * Icosphere Geometry
 *
 * A sphere built by subdividing an icosahedron, resulting in:
 * - Nearly uniform triangle distribution (no pole distortion)
 * - Smooth surface curvature perfect for shader testing
 * - All normals point radially outward from center
 *
 * @param {number} subdivisions - Number of subdivision levels (0-4 recommended)
 * @returns {Object} Geometry with vertices, normals, indices
 */
export function createIcosphere(subdivisions = 2) {
    const vertices = [];
    const indices = [];
    const vertexCache = new Map();
    let indexCounter = 0;

    // Golden ratio for icosahedron
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    // Initial 12 vertices of icosahedron
    const icosahedronVertices = [
        [-1,  t,  0],
        [ 1,  t,  0],
        [-1, -t,  0],
        [ 1, -t,  0],
        [ 0, -1,  t],
        [ 0,  1,  t],
        [ 0, -1, -t],
        [ 0,  1, -t],
        [ t,  0, -1],
        [ t,  0,  1],
        [-t,  0, -1],
        [-t,  0,  1]
    ];

    // Initial 20 faces of icosahedron
    const icosahedronFaces = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1]
    ];

    // Helper: Add vertex and return its index
    function addVertex(x, y, z) {
        // Normalize to sphere
        const length = Math.sqrt(x * x + y * y + z * z);
        const nx = x / length;
        const ny = y / length;
        const nz = z / length;

        // Create unique key for vertex deduplication
        const key = `${nx.toFixed(6)},${ny.toFixed(6)},${nz.toFixed(6)}`;

        if (vertexCache.has(key)) {
            return vertexCache.get(key);
        }

        const index = indexCounter++;
        vertices.push(nx, ny, nz);
        vertexCache.set(key, index);
        return index;
    }

    // Helper: Get midpoint of two vertices (already normalized to sphere)
    function getMidpoint(v1, v2) {
        const x1 = vertices[v1 * 3];
        const y1 = vertices[v1 * 3 + 1];
        const z1 = vertices[v1 * 3 + 2];

        const x2 = vertices[v2 * 3];
        const y2 = vertices[v2 * 3 + 1];
        const z2 = vertices[v2 * 3 + 2];

        const mx = (x1 + x2) / 2.0;
        const my = (y1 + y2) / 2.0;
        const mz = (z1 + z2) / 2.0;

        return addVertex(mx, my, mz);
    }

    // Add initial icosahedron vertices
    for (const vertex of icosahedronVertices) {
        addVertex(vertex[0], vertex[1], vertex[2]);
    }

    // Start with initial faces
    let faces = icosahedronFaces.map(face => [...face]);

    // Subdivide faces
    for (let subdivision = 0; subdivision < subdivisions; subdivision++) {
        const newFaces = [];

        for (const face of faces) {
            const [v1, v2, v3] = face;

            // Get midpoints of each edge
            const a = getMidpoint(v1, v2);
            const b = getMidpoint(v2, v3);
            const c = getMidpoint(v3, v1);

            // Create 4 new triangles from subdivision
            newFaces.push([v1, a, c]);
            newFaces.push([v2, b, a]);
            newFaces.push([v3, c, b]);
            newFaces.push([a, b, c]);
        }

        faces = newFaces;
    }

    // Convert faces to indices array
    for (const face of faces) {
        indices.push(face[0], face[1], face[2]);
    }

    // Normals are same as vertices for a sphere (radial)
    const normals = new Float32Array(vertices);

    return {
        vertices: new Float32Array(vertices),
        normals: normals,
        indices: new Uint16Array(indices)
    };
}
