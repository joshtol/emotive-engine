/**
 * Camera - View and projection matrix management
 *
 * Handles:
 * - View matrix (camera position and orientation)
 * - Projection matrix (perspective/orthographic)
 * - Camera position tracking
 */

export class Camera {
    constructor() {
        // Camera position in world space
        this.position = [0, 0, 5];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];

        // Projection parameters
        this.fov = 45 * Math.PI / 180; // Field of view in radians
        this.aspect = 1.0;
        this.near = 0.1;
        this.far = 100.0;

        // Matrices
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);

        // Initialize matrices
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    /**
     * Update view matrix from position, target, and up vector
     */
    updateViewMatrix() {
        const eye = this.position;
        const center = this.target;
        const up = this.up;

        // Compute camera basis vectors
        const z = normalize([
            eye[0] - center[0],
            eye[1] - center[1],
            eye[2] - center[2]
        ]);

        const x = normalize(cross(up, z));
        const y = cross(z, x);

        // Build view matrix (inverse of camera transform)
        this.viewMatrix[0] = x[0];
        this.viewMatrix[1] = y[0];
        this.viewMatrix[2] = z[0];
        this.viewMatrix[3] = 0;

        this.viewMatrix[4] = x[1];
        this.viewMatrix[5] = y[1];
        this.viewMatrix[6] = z[1];
        this.viewMatrix[7] = 0;

        this.viewMatrix[8] = x[2];
        this.viewMatrix[9] = y[2];
        this.viewMatrix[10] = z[2];
        this.viewMatrix[11] = 0;

        this.viewMatrix[12] = -dot(x, eye);
        this.viewMatrix[13] = -dot(y, eye);
        this.viewMatrix[14] = -dot(z, eye);
        this.viewMatrix[15] = 1;
    }

    /**
     * Update projection matrix
     * @param {number} aspect - Aspect ratio (width / height)
     */
    updateProjectionMatrix(aspect = this.aspect) {
        this.aspect = aspect;

        const f = 1.0 / Math.tan(this.fov / 2);
        const rangeInv = 1.0 / (this.near - this.far);

        this.projectionMatrix[0] = f / aspect;
        this.projectionMatrix[1] = 0;
        this.projectionMatrix[2] = 0;
        this.projectionMatrix[3] = 0;

        this.projectionMatrix[4] = 0;
        this.projectionMatrix[5] = f;
        this.projectionMatrix[6] = 0;
        this.projectionMatrix[7] = 0;

        this.projectionMatrix[8] = 0;
        this.projectionMatrix[9] = 0;
        this.projectionMatrix[10] = (this.near + this.far) * rangeInv;
        this.projectionMatrix[11] = -1;

        this.projectionMatrix[12] = 0;
        this.projectionMatrix[13] = 0;
        this.projectionMatrix[14] = this.near * this.far * rangeInv * 2;
        this.projectionMatrix[15] = 0;
    }

    /**
     * Set camera position
     */
    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.updateViewMatrix();
    }

    /**
     * Set camera target (look at point)
     */
    setTarget(x, y, z) {
        this.target = [x, y, z];
        this.updateViewMatrix();
    }

    /**
     * Set field of view
     * @param {number} fovDegrees - Field of view in degrees
     */
    setFOV(fovDegrees) {
        this.fov = fovDegrees * Math.PI / 180;
        this.updateProjectionMatrix();
    }
}

// ============================================================
// MATH UTILITIES
// ============================================================

function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (len > 0.00001) {
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    return [0, 0, 0];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
