/**
 * RotationRenderManager
 *
 * Manages rotation application during rendering.
 * Handles:
 * - Rotation state updates
 * - Total rotation calculation
 * - Canvas rotation transform application
 */
export class RotationRenderManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Apply rotation transform to canvas if rotation is present
     * @param {number} coreX - Core X position
     * @param {number} coreY - Core Y position
     * @param {number} rotationAngle - Base rotation angle
     * @returns {number} Total rotation applied
     */
    applyRotationTransform(coreX, coreY, rotationAngle) {
        // Check if brake is active and update rotation accordingly
        const now = performance.now();

        // Update rotation state (handles brake and normal rotation)
        this.renderer.rotationManager.updateRotation(now);

        // Calculate total rotation (gestures + manual rotation)
        const totalRotation = this.renderer.rotationManager.calculateTotalRotation(rotationAngle);

        // Apply rotation if present
        if (totalRotation !== 0) {
            this.renderer.ctx.save();
            this.renderer.ctx.translate(coreX, coreY);
            this.renderer.rotationManager.applyRotation(this.renderer.ctx, totalRotation);
            this.renderer.ctx.translate(-coreX, -coreY);
        }

        return totalRotation;
    }
}
