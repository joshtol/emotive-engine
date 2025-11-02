/**
 * Torus Knot Geometry
 * Parametric curve that loops around a torus in a knotted pattern
 * Perfect for testing AO, SSS, anisotropy, and iridescence
 *
 * @param {number} p - Number of times the knot winds around the torus longitudinally (default: 3)
 * @param {number} q - Number of times the knot winds around the torus meridionally (default: 2)
 * @param {number} tubeSegments - Number of segments around the tube (default: 64)
 * @param {number} pathSegments - Number of segments along the path (default: 128)
 * @param {number} tubeRadius - Radius of the tube (default: 0.4)
 * @param {number} torusRadius - Radius from center to tube center (default: 1.0)
 */
export function createTorusKnot(
    p = 3,
    q = 2,
    tubeSegments = 64,
    pathSegments = 128,
    tubeRadius = 0.4,
    torusRadius = 1.0
) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Standard parametric (p,q)-torus knot equations
    // x = cos(p*t) * (R + r*cos(q*t))
    // y = sin(p*t) * (R + r*cos(q*t))
    // z = r * sin(q*t)
    function calculatePositionOnCurve(t) {
        const pt = p * t;
        const qt = q * t;

        const cosPt = Math.cos(pt);
        const sinPt = Math.sin(pt);
        const cosQt = Math.cos(qt);
        const sinQt = Math.sin(qt);

        const R = torusRadius;
        const r = tubeRadius * 2;  // Scale tube influence

        const x = cosPt * (R + r * cosQt);
        const y = sinPt * (R + r * cosQt);
        const z = r * sinQt;

        return [x, y, z];
    }

    // Get tangent vector at position u (for Frenet frame)
    function calculateTangent(u) {
        const delta = 0.0001;
        const pos1 = calculatePositionOnCurve(u - delta);
        const pos2 = calculatePositionOnCurve(u + delta);

        const tx = pos2[0] - pos1[0];
        const ty = pos2[1] - pos1[1];
        const tz = pos2[2] - pos1[2];

        const len = Math.sqrt(tx * tx + ty * ty + tz * tz);
        return [tx / len, ty / len, tz / len];
    }

    // Get normal vector (perpendicular to tangent)
    function calculateNormal(u, v) {
        const tangent = calculateTangent(u);

        // Binormal (approximate, for stability)
        const bx = -Math.sin(u);
        const by = Math.cos(u);
        const bz = 0;

        // Normal from cross product
        const nx = tangent[1] * bz - tangent[2] * by;
        const ny = tangent[2] * bx - tangent[0] * bz;
        const nz = tangent[0] * by - tangent[1] * bx;

        // Rotate normal around tangent by angle v
        const cv = Math.cos(v);
        const sv = Math.sin(v);

        const finalNx = nx * cv + tangent[0] * sv;
        const finalNy = ny * cv + tangent[1] * sv;
        const finalNz = nz * cv + tangent[2] * sv;

        const len = Math.sqrt(finalNx * finalNx + finalNy * finalNy + finalNz * finalNz);
        return [finalNx / len, finalNy / len, finalNz / len];
    }

    // Generate vertices
    for (let i = 0; i <= pathSegments; i++) {
        const u = (i / pathSegments) * Math.PI * 2 * p;

        const pos = calculatePositionOnCurve(u);

        for (let j = 0; j <= tubeSegments; j++) {
            const v = (j / tubeSegments) * Math.PI * 2;

            const normal = calculateNormal(u, v);

            // Position: center + radius * normal
            const x = pos[0] + tubeRadius * normal[0];
            const y = pos[1] + tubeRadius * normal[1];
            const z = pos[2] + tubeRadius * normal[2];

            vertices.push(x, y, z);
            normals.push(normal[0], normal[1], normal[2]);
        }
    }

    // Generate indices
    for (let i = 0; i < pathSegments; i++) {
        for (let j = 0; j < tubeSegments; j++) {
            const a = (tubeSegments + 1) * i + j;
            const b = (tubeSegments + 1) * (i + 1) + j;
            const c = (tubeSegments + 1) * (i + 1) + (j + 1);
            const d = (tubeSegments + 1) * i + (j + 1);

            // Two triangles per quad
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}
