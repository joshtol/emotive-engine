/**
 * SceneObject - Represents a single renderable object in a 3D scene
 * Encapsulates geometry, material properties, and transform
 */
export class SceneObject {
    /**
     * Create a scene object
     * @param {Object} options - Configuration
     * @param {Object} options.geometry - Geometry data {vertices, normals, indices}
     * @param {Object} options.material - Material properties
     * @param {Array<number>} options.position - [x, y, z] position
     * @param {Array<number>} options.rotation - [x, y, z] rotation in radians
     * @param {Array<number>} options.scale - [x, y, z] scale
     */
    constructor(options = {}) {
        // Geometry
        this.geometry = options.geometry || null;

        // Material properties
        this.material = {
            glowColor: options.material?.glowColor || [1.0, 1.0, 1.0],
            roughness: options.material?.roughness ?? 0.5,
            metallic: options.material?.metallic ?? 0.0,
            ao: options.material?.ao ?? 1.0,
            sssStrength: options.material?.sssStrength ?? 0.0,
            anisotropy: options.material?.anisotropy ?? 0.0,
            iridescence: options.material?.iridescence ?? 0.0
        };

        // Transform
        this.position = options.position || [0, 0, 0];
        this.rotation = options.rotation || [0, 0, 0];
        this.scale = options.scale || [1, 1, 1];

        // Cached transform matrix
        this._modelMatrix = null;
        this._dirty = true;
    }

    /**
     * Get model matrix (cached, recomputed when dirty)
     * @returns {Float32Array} 4x4 model matrix
     */
    getModelMatrix() {
        if (this._dirty) {
            this._modelMatrix = this._computeModelMatrix();
            this._dirty = false;
        }
        return this._modelMatrix;
    }

    /**
     * Set position
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z) {
        this.position = [x, y, z];
        this._dirty = true;
    }

    /**
     * Set rotation
     * @param {number} x - Rotation around X axis (radians)
     * @param {number} y - Rotation around Y axis (radians)
     * @param {number} z - Rotation around Z axis (radians)
     */
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        this._dirty = true;
    }

    /**
     * Set scale
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setScale(x, y, z) {
        this.scale = [x, y, z];
        this._dirty = true;
    }

    /**
     * Update material property
     * @param {string} property - Property name
     * @param {*} value - New value
     */
    setMaterialProperty(property, value) {
        if (this.material.hasOwnProperty(property)) {
            this.material[property] = value;
        }
    }

    /**
     * Compute model matrix from position/rotation/scale
     * @returns {Float32Array} 4x4 model matrix
     * @private
     */
    _computeModelMatrix() {
        const matrix = new Float32Array(16);

        // Identity
        matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;

        // Scale
        matrix[0] = this.scale[0];
        matrix[5] = this.scale[1];
        matrix[10] = this.scale[2];

        // Rotation (simplified - just around Y axis for now)
        // TODO: Add full 3-axis rotation if needed
        const ry = this.rotation[1];
        if (ry !== 0) {
            const cos = Math.cos(ry);
            const sin = Math.sin(ry);
            const m0 = matrix[0], m2 = matrix[2];
            const m8 = matrix[8], m10 = matrix[10];

            matrix[0] = cos * m0 + sin * m8;
            matrix[2] = cos * m2 + sin * m10;
            matrix[8] = -sin * m0 + cos * m8;
            matrix[10] = -sin * m2 + cos * m10;
        }

        // Translation
        matrix[12] = this.position[0];
        matrix[13] = this.position[1];
        matrix[14] = this.position[2];

        return matrix;
    }
}
