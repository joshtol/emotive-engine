/**
 * OBJ File Loader
 * Parses Wavefront .obj files into geometry format
 *
 * Supports:
 * - Vertices (v x y z)
 * - Normals (vn nx ny nz)
 * - Faces (f v1 v2 v3 or f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3)
 */

export class OBJLoader {
    /**
     * Parse OBJ file content into geometry
     * @param {string} objText - Raw OBJ file content
     * @returns {Object} Geometry with vertices, normals, indices
     */
    static parse(objText) {
        const positions = [];
        const normals = [];
        const vertices = [];
        const normalsOut = [];
        const indices = [];

        const lines = objText.split('\n');
        const vertexMap = new Map(); // Deduplicate vertices

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) continue;

            const parts = trimmed.split(/\s+/);
            const type = parts[0];

            if (type === 'v') {
                // Vertex position
                positions.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (type === 'vn') {
                // Vertex normal
                normals.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (type === 'f') {
                // Face (triangle or quad)
                const faceVertices = [];

                for (let i = 1; i < parts.length; i++) {
                    const vertexData = parts[i].split('/');
                    const vIndex = parseInt(vertexData[0], 10) - 1; // OBJ is 1-indexed
                    const nIndex = vertexData[2] ? parseInt(vertexData[2], 10) - 1 : -1;

                    // Create unique vertex key
                    const key = `${vIndex}_${nIndex}`;

                    if (!vertexMap.has(key)) {
                        const index = vertices.length / 3;
                        vertexMap.set(key, index);

                        // Add position
                        const pos = positions[vIndex];
                        vertices.push(pos[0], pos[1], pos[2]);

                        // Add normal (or compute flat normal if missing)
                        if (nIndex >= 0 && normals[nIndex]) {
                            const norm = normals[nIndex];
                            normalsOut.push(norm[0], norm[1], norm[2]);
                        } else {
                            // Will compute flat normals later if needed
                            normalsOut.push(0, 0, 0);
                        }
                    }

                    faceVertices.push(vertexMap.get(key));
                }

                // Triangulate if quad
                if (faceVertices.length === 3) {
                    indices.push(faceVertices[0], faceVertices[1], faceVertices[2]);
                } else if (faceVertices.length === 4) {
                    // Split quad into two triangles
                    indices.push(faceVertices[0], faceVertices[1], faceVertices[2]);
                    indices.push(faceVertices[0], faceVertices[2], faceVertices[3]);
                } else if (faceVertices.length > 4) {
                    // Fan triangulation for n-gons
                    for (let i = 1; i < faceVertices.length - 1; i++) {
                        indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                    }
                }
            }
        }

        // Compute flat normals if any are missing (all zeros)
        let hasValidNormals = false;
        for (let i = 0; i < normalsOut.length; i += 3) {
            if (normalsOut[i] !== 0 || normalsOut[i + 1] !== 0 || normalsOut[i + 2] !== 0) {
                hasValidNormals = true;
                break;
            }
        }

        if (!hasValidNormals) {
            // Compute flat normals from face geometry
            const computedNormals = new Float32Array(normalsOut.length);

            for (let i = 0; i < indices.length; i += 3) {
                const i0 = indices[i] * 3;
                const i1 = indices[i + 1] * 3;
                const i2 = indices[i + 2] * 3;

                // Triangle vertices
                const v0x = vertices[i0], v0y = vertices[i0 + 1], v0z = vertices[i0 + 2];
                const v1x = vertices[i1], v1y = vertices[i1 + 1], v1z = vertices[i1 + 2];
                const v2x = vertices[i2], v2y = vertices[i2 + 1], v2z = vertices[i2 + 2];

                // Edge vectors
                const e1x = v1x - v0x, e1y = v1y - v0y, e1z = v1z - v0z;
                const e2x = v2x - v0x, e2y = v2y - v0y, e2z = v2z - v0z;

                // Cross product (face normal)
                const nx = e1y * e2z - e1z * e2y;
                const ny = e1z * e2x - e1x * e2z;
                const nz = e1x * e2y - e1y * e2x;

                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                const fnx = nx / len, fny = ny / len, fnz = nz / len;

                // Accumulate normals for all vertices of this face
                for (let j = 0; j < 3; j++) {
                    const idx = indices[i + j] * 3;
                    computedNormals[idx] += fnx;
                    computedNormals[idx + 1] += fny;
                    computedNormals[idx + 2] += fnz;
                }
            }

            // Normalize accumulated normals
            for (let i = 0; i < computedNormals.length; i += 3) {
                const nx = computedNormals[i];
                const ny = computedNormals[i + 1];
                const nz = computedNormals[i + 2];
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

                normalsOut[i] = nx / len;
                normalsOut[i + 1] = ny / len;
                normalsOut[i + 2] = nz / len;
            }
        }

        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normalsOut),
            indices: new Uint16Array(indices)
        };
    }

    /**
     * Load OBJ file from URL
     * @param {string} url - URL to OBJ file
     * @returns {Promise<Object>} Geometry object
     */
    static async load(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load OBJ: ${response.statusText}`);
        }

        const text = await response.text();
        return this.parse(text);
    }
}
