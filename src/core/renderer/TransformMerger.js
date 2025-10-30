/**
 * TransformMerger
 *
 * Handles merging of different transform sources (ambient dance, gestures).
 * Combines position, rotation, and scale transformations from multiple sources.
 */
export class TransformMerger {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Merge ambient dance transform with gesture transform
     * @param {Object|null} gestureTransform - Transform from gesture system
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {Object} Merged transform object
     */
    mergeTransforms(gestureTransform, deltaTime) {
        // Get ambient dance transform
        const ambientTransform = this.renderer.ambientDanceAnimator.getTransform(deltaTime);

        if (gestureTransform) {
            // Merge transforms by adding positions/rotations and multiplying scales
            gestureTransform.x = (gestureTransform.x || 0) + (ambientTransform.x || 0);
            gestureTransform.y = (gestureTransform.y || 0) + (ambientTransform.y || 0);
            gestureTransform.rotation = (gestureTransform.rotation || 0) + (ambientTransform.rotation || 0);
            gestureTransform.scale = (gestureTransform.scale || 1) * (ambientTransform.scale || 1);
            return gestureTransform;
        } else {
            // No gesture transform, use ambient only
            return ambientTransform;
        }
    }

    /**
     * Merge transforms and store result for later use
     * @param {Object|null} gestureTransform - Transform from gesture system
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {Object} Merged transform object
     */
    mergeAndStoreTransforms(gestureTransform, deltaTime) {
        const mergedTransform = this.mergeTransforms(gestureTransform, deltaTime);

        // Store gestureTransform for use in other methods
        this.renderer.gestureTransform = mergedTransform;

        return mergedTransform;
    }
}
