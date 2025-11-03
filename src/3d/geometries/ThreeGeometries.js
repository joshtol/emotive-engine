/**
 * Three.js Procedural Geometries
 *
 * Replaces custom WebGL geometries with Three.js BufferGeometry
 * Maintains same shape designs but uses Three.js infrastructure
 */

import * as THREE from 'three';

/**
 * Create smooth sphere geometry
 * @param {number} widthSegments - Horizontal segments (default: 64 for smooth look)
 * @param {number} heightSegments - Vertical segments (default: 64)
 * @returns {THREE.SphereGeometry}
 */
export function createSphere(widthSegments = 64, heightSegments = 64) {
    return new THREE.SphereGeometry(
        0.5, // radius (matches custom WebGL scale)
        widthSegments,
        heightSegments
    );
}

/**
 * Create hexagonal crystal geometry
 * Faceted look with pointed ends
 * @param {number} sides - Number of sides (default: 6 for hexagonal)
 * @returns {THREE.BufferGeometry}
 */
export function createCrystal(sides = 6) {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];
    const indices = [];

    const radius = 0.4;
    const height = 1.2;
    const pointHeight = 0.3; // Height of pyramid points

    // Top point
    vertices.push(0, height / 2 + pointHeight, 0);
    normals.push(0, 1, 0);

    // Top ring
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        vertices.push(x, height / 2, z);
        normals.push(x, 0, z); // Point outward
    }

    // Bottom ring
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        vertices.push(x, -height / 2, z);
        normals.push(x, 0, z); // Point outward
    }

    // Bottom point
    vertices.push(0, -height / 2 - pointHeight, 0);
    normals.push(0, -1, 0);

    // Build indices
    // Top pyramid faces
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(0, i + 1, next + 1);
    }

    // Side faces (quads as two triangles)
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        const topCurrent = i + 1;
        const topNext = next + 1;
        const bottomCurrent = i + 1 + sides;
        const bottomNext = next + 1 + sides;

        // Upper triangle
        indices.push(topCurrent, bottomCurrent, topNext);
        // Lower triangle
        indices.push(topNext, bottomCurrent, bottomNext);
    }

    // Bottom pyramid faces
    const bottomPointIndex = vertices.length / 3 - 1;
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(bottomPointIndex, next + 1 + sides, i + 1 + sides);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals(); // Recompute for smooth shading

    return geometry;
}

/**
 * Create brilliant-cut diamond geometry
 * Classic diamond shape with multiple facets
 * @returns {THREE.BufferGeometry}
 */
export function createDiamond() {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];
    const indices = [];

    const topHeight = 0.6;
    const middleHeight = 0.0;
    const bottomHeight = -0.8;
    const topRadius = 0.3;
    const middleRadius = 0.5;
    const sides = 8; // Octagonal diamond

    // Top point (crown apex)
    vertices.push(0, topHeight, 0);
    normals.push(0, 1, 0);

    // Top ring (crown)
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * topRadius;
        const z = Math.sin(angle) * topRadius;
        vertices.push(x, middleHeight + 0.2, z);
        normals.push(x, 0.5, z);
    }

    // Middle ring (girdle)
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * middleRadius;
        const z = Math.sin(angle) * middleRadius;
        vertices.push(x, middleHeight, z);
        normals.push(x, 0, z);
    }

    // Bottom point (pavilion culet)
    vertices.push(0, bottomHeight, 0);
    normals.push(0, -1, 0);

    // Build indices
    // Crown (top pyramid)
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(0, i + 1, next + 1);
    }

    // Upper girdle to middle (facets)
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        const topCurrent = i + 1;
        const topNext = next + 1;
        const middleCurrent = i + 1 + sides;
        const middleNext = next + 1 + sides;

        indices.push(topCurrent, middleCurrent, topNext);
        indices.push(topNext, middleCurrent, middleNext);
    }

    // Pavilion (bottom pyramid)
    const bottomPointIndex = vertices.length / 3 - 1;
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(bottomPointIndex, next + 1 + sides, i + 1 + sides);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

/**
 * Create torus (donut) geometry
 * @param {number} radius - Torus radius (default: 0.4)
 * @param {number} tube - Tube thickness (default: 0.15)
 * @param {number} radialSegments - Segments around tube (default: 32)
 * @param {number} tubularSegments - Segments around torus (default: 64)
 * @returns {THREE.TorusGeometry}
 */
export function createTorus(radius = 0.4, tube = 0.15, radialSegments = 32, tubularSegments = 64) {
    return new THREE.TorusGeometry(
        radius,
        tube,
        radialSegments,
        tubularSegments
    );
}

/**
 * Create icosahedron geometry (20-sided polyhedron)
 * @param {number} radius - Radius (default: 0.5)
 * @param {number} detail - Subdivision detail (default: 1 for smooth, 0 for faceted)
 * @returns {THREE.IcosahedronGeometry}
 */
export function createIcosahedron(radius = 0.5, detail = 1) {
    return new THREE.IcosahedronGeometry(radius, detail);
}

/**
 * Create octahedron geometry (8-sided polyhedron)
 * @param {number} radius - Radius (default: 0.5)
 * @param {number} detail - Subdivision detail (default: 0 for sharp facets)
 * @returns {THREE.OctahedronGeometry}
 */
export function createOctahedron(radius = 0.5, detail = 0) {
    return new THREE.OctahedronGeometry(radius, detail);
}

/**
 * Create tetrahedron geometry (4-sided polyhedron)
 * @param {number} radius - Radius (default: 0.5)
 * @param {number} detail - Subdivision detail (default: 0)
 * @returns {THREE.TetrahedronGeometry}
 */
export function createTetrahedron(radius = 0.5, detail = 0) {
    return new THREE.TetrahedronGeometry(radius, detail);
}

/**
 * Create dodecahedron geometry (12-sided polyhedron)
 * @param {number} radius - Radius (default: 0.5)
 * @param {number} detail - Subdivision detail (default: 0)
 * @returns {THREE.DodecahedronGeometry}
 */
export function createDodecahedron(radius = 0.5, detail = 0) {
    return new THREE.DodecahedronGeometry(radius, detail);
}

/**
 * Core geometry registry using Three.js
 * All geometries are BufferGeometry instances
 */
export const THREE_GEOMETRIES = {
    // Original geometries
    sphere: createSphere(64, 64),
    crystal: createCrystal(6),
    diamond: createDiamond(),

    // New Three.js primitive geometries
    torus: createTorus(),
    icosahedron: createIcosahedron(0.5, 1),
    octahedron: createOctahedron(0.5, 0),
    tetrahedron: createTetrahedron(0.5, 0),
    dodecahedron: createDodecahedron(0.5, 0),

    // Variations for different aesthetics
    'smooth-icosahedron': createIcosahedron(0.5, 2), // More subdivisions
    'faceted-icosahedron': createIcosahedron(0.5, 0), // Sharp facets
    'ring': createTorus(0.4, 0.1, 16, 64) // Thinner ring
};
