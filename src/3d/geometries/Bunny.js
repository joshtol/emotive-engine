/**
 * Simplified Bunny Geometry
 * Hand-crafted low-poly bunny with organic curves
 * Perfect for testing SSS on thin ears and smooth body
 */
export function createBunny() {
    // Simplified bunny mesh created from basic shapes
    // Body: rounded capsule
    // Head: sphere
    // Ears: thin elongated ellipsoids
    // Tail: small sphere

    const vertices = [];
    const normals = [];
    const indices = [];

    let indexCounter = 0;

    // Helper to add a vertex
    function addVertex(x, y, z, nx, ny, nz) {
        vertices.push(x, y, z);
        normals.push(nx, ny, nz);
        return indexCounter++;
    }

    // Helper to create a sphere at position with scale
    function addSphere(cx, cy, cz, scaleX, scaleY, scaleZ, segments = 12, rings = 8) {
        const baseIndex = indexCounter;

        for (let ring = 0; ring <= rings; ring++) {
            const phi = (ring / rings) * Math.PI;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            for (let seg = 0; seg <= segments; seg++) {
                const theta = (seg / segments) * Math.PI * 2;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                const nx = sinPhi * cosTheta;
                const ny = cosPhi;
                const nz = sinPhi * sinTheta;

                const x = cx + nx * scaleX;
                const y = cy + ny * scaleY;
                const z = cz + nz * scaleZ;

                addVertex(x, y, z, nx, ny, nz);
            }
        }

        // Create triangles
        for (let ring = 0; ring < rings; ring++) {
            for (let seg = 0; seg < segments; seg++) {
                const a = baseIndex + ring * (segments + 1) + seg;
                const b = baseIndex + ring * (segments + 1) + (seg + 1);
                const c = baseIndex + (ring + 1) * (segments + 1) + (seg + 1);
                const d = baseIndex + (ring + 1) * (segments + 1) + seg;

                indices.push(a, b, c);
                indices.push(a, c, d);
            }
        }
    }

    // Helper to create a capsule (cylinder with rounded ends)
    function addCapsule(x1, y1, z1, x2, y2, z2, radius, segments = 12) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const nx = dx / length;
        const ny = dy / length;
        const nz = dz / length;

        // Create perpendicular vectors
        const upX = Math.abs(ny) < 0.9 ? 0 : 1;
        const upY = Math.abs(ny) < 0.9 ? 1 : 0;
        const upZ = 0;

        // Right vector (cross product of normal and up)
        const rightX = ny * upZ - nz * upY;
        const rightY = nz * upX - nx * upZ;
        const rightZ = nx * upY - ny * upX;
        const rightLen = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
        const rx = rightX / rightLen;
        const ry = rightY / rightLen;
        const rz = rightZ / rightLen;

        // Forward vector (cross product of normal and right)
        const fx = ny * rz - nz * ry;
        const fy = nz * rx - nx * rz;
        const fz = nx * ry - ny * rx;

        const baseIndex = indexCounter;

        // Create cylinder body
        for (let i = 0; i <= 1; i++) {
            const t = i;
            const cx = x1 + dx * t;
            const cy = y1 + dy * t;
            const cz = z1 + dz * t;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                const vx = rx * cos + fx * sin;
                const vy = ry * cos + fy * sin;
                const vz = rz * cos + fz * sin;

                const x = cx + vx * radius;
                const y = cy + vy * radius;
                const z = cz + vz * radius;

                addVertex(x, y, z, vx, vy, vz);
            }
        }

        // Create cylinder triangles
        for (let i = 0; i < 1; i++) {
            for (let j = 0; j < segments; j++) {
                const a = baseIndex + i * (segments + 1) + j;
                const b = baseIndex + i * (segments + 1) + (j + 1);
                const c = baseIndex + (i + 1) * (segments + 1) + (j + 1);
                const d = baseIndex + (i + 1) * (segments + 1) + j;

                indices.push(a, b, c);
                indices.push(a, c, d);
            }
        }

        // Add spherical caps
        addSphere(x1, y1, z1, radius, radius, radius, segments, 6);
        addSphere(x2, y2, z2, radius, radius, radius, segments, 6);
    }

    // Build bunny parts
    // Body (main torso)
    addSphere(0, -0.3, 0, 0.5, 0.6, 0.45, 16, 10);

    // Head
    addSphere(0, 0.5, 0.1, 0.35, 0.35, 0.3, 16, 10);

    // Left ear (tall, thin - perfect for SSS!)
    addCapsule(-0.15, 0.7, 0.05, -0.2, 1.3, 0, 0.08, 8);

    // Right ear
    addCapsule(0.15, 0.7, 0.05, 0.2, 1.3, 0, 0.08, 8);

    // Tail (small fluffy sphere)
    addSphere(0, -0.4, -0.45, 0.12, 0.12, 0.12, 10, 6);

    // Feet (four small spheres)
    addSphere(-0.25, -0.8, 0.2, 0.15, 0.15, 0.2, 10, 6);   // Front left
    addSphere(0.25, -0.8, 0.2, 0.15, 0.15, 0.2, 10, 6);    // Front right
    addSphere(-0.2, -0.8, -0.2, 0.12, 0.12, 0.15, 10, 6);  // Back left
    addSphere(0.2, -0.8, -0.2, 0.12, 0.12, 0.15, 10, 6);   // Back right

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}
