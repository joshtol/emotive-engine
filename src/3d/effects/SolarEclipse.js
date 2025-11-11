/**
 * Solar Eclipse Effect Manager
 *
 * Orchestrates solar eclipse shadow disk effect.
 * Supports annular and total eclipses.
 */

import * as THREE from 'three';
import { ECLIPSE_TYPES, getEclipseConfig } from './EclipseTypes.js';

export class SolarEclipse {
    /**
     * Create a solar eclipse effect manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of the sun geometry
     */
    constructor(scene, sunRadius) {
        this.scene = scene;
        this.sunRadius = sunRadius;
        this.eclipseType = ECLIPSE_TYPES.OFF;
        this.enabled = false;

        // Create shadow disk
        this.createShadowDisk();
    }

    /**
     * Create the shadow disk geometry
     * @private
     */
    createShadowDisk() {
        const initialShadowRadius = this.sunRadius * 0.5;
        const shadowGeometry = new THREE.CircleGeometry(initialShadowRadius, 64);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false,
            side: THREE.FrontSide,
            depthWrite: true,
            depthTest: true,
            fog: false
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.position.set(200, 0, 0); // Start off-screen
        this.shadowDisk.renderOrder = 999; // Render on top
        this.scene.add(this.shadowDisk);
    }

    /**
     * Set eclipse type (annular, total, or off)
     * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
     */
    setEclipseType(eclipseType) {
        this.eclipseType = eclipseType;
        this.enabled = (eclipseType !== ECLIPSE_TYPES.OFF);

        if (!this.enabled) {
            // Move shadow off-screen when disabled
            this.shadowDisk.position.set(200, 0, 0);
        }
    }

    /**
     * Update eclipse effects (call every frame)
     * @param {THREE.Camera} camera - Camera for position calculations
     * @param {THREE.Mesh} sunMesh - Sun mesh for position/scale
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(camera, sunMesh, deltaTime) {
        const cameraPosition = camera.position;
        const sunPosition = sunMesh.position;
        const sunScale = sunMesh.scale;

        // Update shadow disk if eclipse is active
        if (this.enabled) {
            const config = getEclipseConfig(this.eclipseType);
            const worldScale = sunScale.x;
            const scaledSunRadius = this.sunRadius * worldScale;

            // Calculate shadow size based on eclipse type
            const shadowRadius = scaledSunRadius * config.shadowCoverage;
            const shadowScale = shadowRadius / this.sunRadius / 0.5;
            this.shadowDisk.scale.setScalar(shadowScale);

            // CAMERA LOCKING: Position shadow between camera and sun
            const directionToCamera = new THREE.Vector3()
                .subVectors(cameraPosition, sunPosition)
                .normalize();

            // Place shadow very close to sun surface
            const shadowOffset = scaledSunRadius * 1.001;
            this.shadowDisk.position.copy(sunPosition).add(
                directionToCamera.multiplyScalar(shadowOffset)
            );

            // Make shadow face the camera (billboard effect)
            this.shadowDisk.lookAt(cameraPosition);
        } else {
            // Move shadow off-screen when disabled
            this.shadowDisk.position.set(200, 0, 0);
        }
    }

    /**
     * Dispose of all eclipse resources
     */
    dispose() {
        // Dispose shadow disk
        if (this.shadowDisk) {
            this.shadowDisk.geometry.dispose();
            this.shadowDisk.material.dispose();
            this.scene.remove(this.shadowDisk);
            this.shadowDisk = null;
        }
    }
}
