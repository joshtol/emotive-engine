/**
 * Rounded Cube Geometry
 * Cube with chamfered/rounded edges - perfect for testing AO in corners
 *
 * @param {number} size - Size of the cube (default: 1.0)
 * @param {number} radius - Radius of the edge rounding (default: 0.1)
 * @param {number} segments - Number of segments per rounded edge (default: 8)
 */
export function createRoundedCube(size = 1.0, radius = 0.1, segments = 8) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const halfSize = size / 2;
    const innerSize = halfSize - radius;

    // Helper to add a vertex and normal
    function addVertex(x, y, z, nx, ny, nz) {
        vertices.push(x, y, z);
        normals.push(nx, ny, nz);
        return (vertices.length / 3) - 1;
    }

    // Helper to add a quad as two triangles
    function addQuad(a, b, c, d) {
        indices.push(a, b, c);
        indices.push(a, c, d);
    }

    // Generate flat faces (6 faces)
    const faceConfigs = [
        // +X face (right)
        { normal: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
        // -X face (left)
        { normal: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, -1] },
        // +Y face (top)
        { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
        // -Y face (bottom)
        { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] },
        // +Z face (front)
        { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        // -Z face (back)
        { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }
    ];

    for (const config of faceConfigs) {
        const [nx, ny, nz] = config.normal;
        const [ux, uy, uz] = config.u;
        const [vx, vy, vz] = config.v;

        // Center of face
        const cx = innerSize * nx;
        const cy = innerSize * ny;
        const cz = innerSize * nz;

        // Four corners of flat face
        const v0 = addVertex(
            cx - innerSize * ux - innerSize * vx,
            cy - innerSize * uy - innerSize * vy,
            cz - innerSize * uz - innerSize * vz,
            nx, ny, nz
        );
        const v1 = addVertex(
            cx + innerSize * ux - innerSize * vx,
            cy + innerSize * uy - innerSize * vy,
            cz + innerSize * uz - innerSize * vz,
            nx, ny, nz
        );
        const v2 = addVertex(
            cx + innerSize * ux + innerSize * vx,
            cy + innerSize * uy + innerSize * vy,
            cz + innerSize * uz + innerSize * vz,
            nx, ny, nz
        );
        const v3 = addVertex(
            cx - innerSize * ux + innerSize * vx,
            cy - innerSize * uy + innerSize * vy,
            cz - innerSize * uz + innerSize * vz,
            nx, ny, nz
        );

        addQuad(v0, v1, v2, v3);
    }

    // Generate rounded edges (12 edges, each is a cylindrical segment)
    const edgeConfigs = [
        // 4 edges parallel to X axis
        { dir: [1, 0, 0], center: [0, innerSize, innerSize], rot: [0, 1, 0, 0, 0, 1] },
        { dir: [1, 0, 0], center: [0, innerSize, -innerSize], rot: [0, 1, 0, 0, 0, -1] },
        { dir: [1, 0, 0], center: [0, -innerSize, innerSize], rot: [0, -1, 0, 0, 0, 1] },
        { dir: [1, 0, 0], center: [0, -innerSize, -innerSize], rot: [0, -1, 0, 0, 0, -1] },

        // 4 edges parallel to Y axis
        { dir: [0, 1, 0], center: [innerSize, 0, innerSize], rot: [1, 0, 0, 0, 0, 1] },
        { dir: [0, 1, 0], center: [innerSize, 0, -innerSize], rot: [1, 0, 0, 0, 0, -1] },
        { dir: [0, 1, 0], center: [-innerSize, 0, innerSize], rot: [-1, 0, 0, 0, 0, 1] },
        { dir: [0, 1, 0], center: [-innerSize, 0, -innerSize], rot: [-1, 0, 0, 0, 0, -1] },

        // 4 edges parallel to Z axis
        { dir: [0, 0, 1], center: [innerSize, innerSize, 0], rot: [1, 0, 0, 0, 1, 0] },
        { dir: [0, 0, 1], center: [innerSize, -innerSize, 0], rot: [1, 0, 0, 0, -1, 0] },
        { dir: [0, 0, 1], center: [-innerSize, innerSize, 0], rot: [-1, 0, 0, 0, 1, 0] },
        { dir: [0, 0, 1], center: [-innerSize, -innerSize, 0], rot: [-1, 0, 0, 0, -1, 0] }
    ];

    for (const edge of edgeConfigs) {
        const [cx, cy, cz] = edge.center;
        const [dx, dy, dz] = edge.dir;
        const [rx, ry, rz, sx, sy, sz] = edge.rot;

        const vertRow = [];

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * (Math.PI / 2);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const nx = rx * cos + sx * sin;
            const ny = ry * cos + sy * sin;
            const nz = rz * cos + sz * sin;

            const x = cx + radius * nx - innerSize * dx;
            const y = cy + radius * ny - innerSize * dy;
            const z = cz + radius * nz - innerSize * dz;

            vertRow.push(addVertex(x, y, z, nx, ny, nz));
        }

        const vertRow2 = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * (Math.PI / 2);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const nx = rx * cos + sx * sin;
            const ny = ry * cos + sy * sin;
            const nz = rz * cos + sz * sin;

            const x = cx + radius * nx + innerSize * dx;
            const y = cy + radius * ny + innerSize * dy;
            const z = cz + radius * nz + innerSize * dz;

            vertRow2.push(addVertex(x, y, z, nx, ny, nz));
        }

        for (let i = 0; i < segments; i++) {
            addQuad(vertRow[i], vertRow2[i], vertRow2[i + 1], vertRow[i + 1]);
        }
    }

    // Generate rounded corners (8 corners, each is a sphere octant)
    const cornerConfigs = [
        [innerSize, innerSize, innerSize],
        [innerSize, innerSize, -innerSize],
        [innerSize, -innerSize, innerSize],
        [innerSize, -innerSize, -innerSize],
        [-innerSize, innerSize, innerSize],
        [-innerSize, innerSize, -innerSize],
        [-innerSize, -innerSize, innerSize],
        [-innerSize, -innerSize, -innerSize]
    ];

    for (const [cx, cy, cz] of cornerConfigs) {
        const signX = Math.sign(cx);
        const signY = Math.sign(cy);
        const signZ = Math.sign(cz);

        const cornerVerts = [];

        for (let i = 0; i <= segments; i++) {
            const row = [];
            const phi = (i / segments) * (Math.PI / 2);
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * (Math.PI / 2);
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                const nx = signX * sinPhi * cosTheta;
                const ny = signY * cosPhi;
                const nz = signZ * sinPhi * sinTheta;

                const x = cx + radius * nx;
                const y = cy + radius * ny;
                const z = cz + radius * nz;

                row.push(addVertex(x, y, z, nx, ny, nz));
            }
            cornerVerts.push(row);
        }

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                addQuad(
                    cornerVerts[i][j],
                    cornerVerts[i + 1][j],
                    cornerVerts[i + 1][j + 1],
                    cornerVerts[i][j + 1]
                );
            }
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}
