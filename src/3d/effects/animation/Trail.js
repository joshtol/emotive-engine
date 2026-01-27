/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Trail/Afterimage Effect
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Trail effect that creates fading afterimages following animated elements
 * @module effects/animation/Trail
 *
 * The trail effect stores a history of element positions and renders copies at
 * those positions with progressively fading opacity.
 *
 * Configuration:
 * - count: Number of trail copies (default: 3)
 * - fadeRate: Opacity decay per copy (default: 0.3)
 * - spacing: Time offset between copies in seconds (default: 0.05)
 * - inheritRotation: Whether trail copies rotate with original (default: true)
 */

import * as THREE from 'three';

/**
 * TrailState - Manages trail effect for a single element
 */
export class TrailState {
    /**
     * @param {Object} config - Trail configuration
     * @param {number} [config.count=3] - Number of trail copies
     * @param {number} [config.fadeRate=0.3] - Opacity decay per copy
     * @param {number} [config.spacing=0.05] - Time offset between copies
     * @param {boolean} [config.inheritRotation=true] - Copy rotation from original
     */
    constructor(config = {}) {
        this.count = config.count ?? 3;
        this.fadeRate = config.fadeRate ?? 0.3;
        this.spacing = config.spacing ?? 0.05;
        this.inheritRotation = config.inheritRotation ?? true;

        // Position/rotation history
        // Each entry: { position: Vector3, rotation: Euler, time: number }
        this.history = [];

        // Trail meshes (created lazily)
        this.meshes = [];

        // Reference to original mesh
        this.originalMesh = null;

        // Time of last history record
        this.lastRecordTime = 0;
    }

    /**
     * Initialize trail with reference to original mesh
     * @param {THREE.Mesh} mesh - The original mesh to trail
     * @param {THREE.Object3D} parent - Parent to add trail meshes to
     */
    initialize(mesh, parent) {
        this.originalMesh = mesh;

        // Create trail meshes (clones of original)
        for (let i = 0; i < this.count; i++) {
            const trailMesh = mesh.clone();
            trailMesh.material = mesh.material.clone();
            trailMesh.material.transparent = true;
            trailMesh.visible = false;
            trailMesh.userData.isTrail = true;
            trailMesh.userData.trailIndex = i;
            parent.add(trailMesh);
            this.meshes.push(trailMesh);
        }
    }

    /**
     * Update trail state - records position history and updates trail meshes
     * @param {number} time - Current time
     * @param {number} opacity - Current opacity of original mesh
     */
    update(time, opacity) {
        if (!this.originalMesh || !this.originalMesh.visible) {
            // Hide all trail meshes if original is hidden
            for (const mesh of this.meshes) {
                mesh.visible = false;
            }
            return;
        }

        // Record position at spacing intervals
        if (time - this.lastRecordTime >= this.spacing) {
            this.history.unshift({
                position: this.originalMesh.position.clone(),
                rotation: this.originalMesh.rotation.clone(),
                scale: this.originalMesh.scale.clone(),
                time
            });
            this.lastRecordTime = time;

            // Limit history size
            while (this.history.length > this.count) {
                this.history.pop();
            }
        }

        // Update trail meshes from history
        for (let i = 0; i < this.count; i++) {
            const mesh = this.meshes[i];

            if (i < this.history.length) {
                const record = this.history[i];

                // Position
                mesh.position.copy(record.position);

                // Rotation (inherit or keep original orientation)
                if (this.inheritRotation) {
                    mesh.rotation.copy(record.rotation);
                }

                // Scale
                mesh.scale.copy(record.scale);

                // Opacity: fade based on position in trail
                const fadeMultiplier = Math.pow(1 - this.fadeRate, i + 1);
                mesh.material.opacity = opacity * fadeMultiplier;

                mesh.visible = mesh.material.opacity > 0.01;
            } else {
                mesh.visible = false;
            }
        }
    }

    /**
     * Clear trail history (on respawn, etc.)
     */
    clear() {
        this.history = [];
        for (const mesh of this.meshes) {
            mesh.visible = false;
        }
    }

    /**
     * Dispose of trail meshes and resources
     */
    dispose() {
        for (const mesh of this.meshes) {
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
            if (mesh.material) {
                mesh.material.dispose();
            }
        }
        this.meshes = [];
        this.history = [];
    }
}

/**
 * Create a trail state from animation config
 * @param {Object} trailConfig - Trail configuration from AnimationConfig
 * @returns {TrailState|null} Trail state or null if no trail config
 */
export function createTrailState(trailConfig) {
    if (!trailConfig) return null;
    return new TrailState(trailConfig);
}

export default TrailState;
