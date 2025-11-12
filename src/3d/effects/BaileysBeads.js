/**
 * Bailey's Beads Effect for Solar Eclipses
 *
 * Creates brilliant points of light around the moon's limb during partial phases
 * of a total solar eclipse, caused by sunlight streaming through lunar valleys.
 *
 * This effect appears:
 * - Just before totality (last few beads visible)
 * - Just after totality (first beads reappearing)
 * - Creates the famous "diamond ring" effect when only one bead remains
 */

import * as THREE from 'three';

export class BaileysBeads {
    /**
     * Create Bailey's Beads effect
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} sunRadius - Radius of the sun
     */
    constructor(scene, sunRadius) {
        this.scene = scene;
        this.sunRadius = sunRadius;
        this.heroBeadCount = 3; // Rule of thirds: 3 hero beads
        this.supportBeadCount = 15; // Supporting beads clustered around heroes
        this.beadCount = this.heroBeadCount + this.supportBeadCount; // Total: 18 beads
        this.beads = [];
        this.visible = false;

        // Reusable temp vectors to avoid per-frame allocations (performance optimization)
        this._directionToCamera = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._right = new THREE.Vector3();
        this._upVector = new THREE.Vector3();
        this._beadOffset = new THREE.Vector3();
        this._tempColor = new THREE.Color(); // Temp color for reuse

        // Track shared texture for disposal
        this.sharedTexture = null;

        // Create bead sprite instances
        this.createBeads();
    }

    /**
     * Create individual bead sprites with chromatic aberration
     * @private
     */
    createBeads() {
        // Create a shared texture for all beads (bright point with glow)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw a radial gradient for the bead glow
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 240, 200, 0.6)');
        gradient.addColorStop(0.6, 'rgba(255, 220, 150, 0.2)');
        gradient.addColorStop(1.0, 'rgba(255, 200, 100, 0.0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Store texture for disposal
        this.sharedTexture = texture;

        // Create beads at fixed angular positions around the limb
        // These simulate lunar valleys at specific locations
        const valleys = this.generateLunarValleys();

        for (let i = 0; i < this.beadCount; i++) {
            // Create RGB channel group for chromatic aberration effect
            const beadGroup = new THREE.Group();

            // Red channel sprite (slight offset outward)
            const redMaterial = new THREE.SpriteMaterial({
                map: texture.clone(),
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                opacity: 0,
                color: this._tempColor.setRGB(1.0, 0.3, 0.3) // Red-tinted (reuse temp color)
            });
            const redSprite = new THREE.Sprite(redMaterial);
            redSprite.scale.set(0.08, 0.08, 1);
            beadGroup.add(redSprite);

            // Green channel sprite (center, brightest)
            const greenMaterial = new THREE.SpriteMaterial({
                map: texture.clone(),
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                opacity: 0,
                color: this._tempColor.setRGB(0.8, 1.0, 0.8) // Slight green tint (reuse temp color)
            });
            const greenSprite = new THREE.Sprite(greenMaterial);
            greenSprite.scale.set(0.08, 0.08, 1);
            beadGroup.add(greenSprite);

            // Blue channel sprite (slight offset inward)
            const blueMaterial = new THREE.SpriteMaterial({
                map: texture,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                opacity: 0,
                color: this._tempColor.setRGB(0.3, 0.5, 1.0) // Blue-tinted (reuse temp color)
            });
            const blueSprite = new THREE.Sprite(blueMaterial);
            blueSprite.scale.set(0.08, 0.08, 1);
            beadGroup.add(blueSprite);

            // Store metadata for bead group
            beadGroup.userData = {
                angle: valleys[i].angle,
                depth: valleys[i].depth,
                baseIntensity: valleys[i].baseIntensity,
                isHero: valleys[i].isHero, // Rule of thirds: hero beads are larger/brighter
                sizeMultiplier: valleys[i].isHero ? 1.5 : 1.0, // Hero beads 50% larger
                targetOpacity: 0,
                currentOpacity: 0,
                redSprite,
                greenSprite,
                blueSprite
            };

            this.beads.push(beadGroup);
            this.scene.add(beadGroup);
        }
    }

    /**
     * Generate simulated lunar valley positions using rule of thirds
     * 3 hero beads at 120° intervals + supporting beads clustered around them
     * @private
     * @returns {Array} Array of valley data {angle, depth, baseIntensity, isHero}
     */
    generateLunarValleys() {
        const valleys = [];

        // Use a simple seeded random for consistency
        let seed = 12345;
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        // RULE OF THIRDS: 3 hero beads positioned 120° apart
        const baseHeroAngle = seededRandom() * Math.PI * 2; // Random rotation
        for (let h = 0; h < this.heroBeadCount; h++) {
            const heroAngle = baseHeroAngle + (h * Math.PI * 2 / 3); // 120° spacing

            valleys.push({
                angle: heroAngle,
                depth: 0.8 + seededRandom() * 0.2, // Hero beads: deeper valleys (0.8-1.0)
                baseIntensity: 0.8 + seededRandom() * 0.2, // Hero beads: brighter (0.8-1.0)
                isHero: true
            });
        }

        // Supporting beads clustered around hero beads
        for (let i = 0; i < this.supportBeadCount; i++) {
            // Assign to nearest hero bead (thirds grouping)
            const heroTarget = Math.floor(i / (this.supportBeadCount / 3));
            const heroAngle = baseHeroAngle + (heroTarget * Math.PI * 2 / 3);

            // Cluster around hero with varied offset
            const clusterOffset = (seededRandom() - 0.5) * 1.2; // ±0.6 radians (~±34°)

            valleys.push({
                angle: heroAngle + clusterOffset,
                depth: 0.3 + seededRandom() * 0.5, // Supporting beads: shallower (0.3-0.8)
                baseIntensity: 0.4 + seededRandom() * 0.4, // Supporting beads: dimmer (0.4-0.8)
                isHero: false
            });
        }

        return valleys;
    }

    /**
     * Update bead positions and visibility based on eclipse coverage
     * @param {THREE.Camera} camera - Camera for billboard positioning
     * @param {THREE.Vector3} sunPosition - Current sun position in world space
     * @param {number} coverage - Eclipse coverage (0=no eclipse, 1=total)
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {number} worldScale - Current world scale of the sun (for proper sizing)
     */
    update(camera, sunPosition, coverage, deltaTime, worldScale = 1.0) {
        // ALWAYS update bead positions to follow the sun, regardless of visibility
        // Only opacity should be controlled by visibility state

        // Update bead positions to circle around sun
        // Account for world scale to stay on the rim regardless of sun size/transforms
        const scaledRadius = this.sunRadius * worldScale * 1.0; // Exactly on the rim

        // Calculate camera-relative vectors for proper positioning (like shadow disk)
        // REUSE temp vectors to avoid allocations
        const cameraPosition = camera.position;
        this._directionToCamera.subVectors(cameraPosition, sunPosition).normalize();
        this._right.crossVectors(this._directionToCamera, this._up).normalize();
        this._upVector.crossVectors(this._right, this._directionToCamera).normalize();

        for (const bead of this.beads) {
            const {angle, redSprite, greenSprite, blueSprite, sizeMultiplier} = bead.userData;

            // Position beads on a circle in screen space (perpendicular to camera view)
            // Calculate position on rim using right and up vectors (billboard-style)
            const rimX = Math.cos(angle) * scaledRadius;
            const rimY = Math.sin(angle) * scaledRadius;

            // Build world position using camera-relative vectors - REUSE temp vector
            this._beadOffset.set(0, 0, 0); // Reset
            this._beadOffset.addScaledVector(this._right, rimX);
            this._beadOffset.addScaledVector(this._upVector, rimY);
            this._beadOffset.addScaledVector(this._directionToCamera, scaledRadius * 0.01); // Slightly in front

            const baseX = sunPosition.x + this._beadOffset.x;
            const baseY = sunPosition.y + this._beadOffset.y;
            const baseZ = sunPosition.z + this._beadOffset.z;

            // Chromatic aberration offset amount (radial from center in screen space)
            const chromaticOffset = worldScale * 0.008;

            // Position RGB channels with radial chromatic aberration in screen space
            // Red channel: offset outward (away from center)
            const redOffsetX = Math.cos(angle) * chromaticOffset;
            const redOffsetY = Math.sin(angle) * chromaticOffset;
            redSprite.position.set(redOffsetX, redOffsetY, 0.001);

            // Green channel: center (no offset)
            greenSprite.position.set(0, 0, 0);

            // Blue channel: offset inward (toward center)
            blueSprite.position.set(-redOffsetX, -redOffsetY, -0.001);

            // Position the bead group at billboard location
            bead.position.set(baseX, baseY, baseZ);

            // Force matrix update to ensure position changes are applied immediately
            // Without this, sprites may lag behind during gesture animations
            bead.updateMatrixWorld(true);

            // Scale all sprites with sun to maintain consistent visual size
            // Hero beads are 50% larger (rule of thirds)
            const baseScale = worldScale * 0.15;
            const beadScale = baseScale * sizeMultiplier; // Apply hero multiplier
            redSprite.scale.set(beadScale, beadScale, 1);
            greenSprite.scale.set(beadScale, beadScale, 1);
            blueSprite.scale.set(beadScale, beadScale, 1);
        }

        // Now handle opacity based on visibility and coverage
        if (!this.visible) {
            // Fade out all beads
            for (const bead of this.beads) {
                bead.userData.targetOpacity = 0;
            }
        } else {
            // Bailey's Beads are visible in the range 0.90 to 1.0 coverage
            // They fade in as coverage approaches 0.95 and fade out at exactly 1.0
            const beadStart = 0.90; // Start showing beads
            const beadFull = 0.97;  // Full intensity
            const beadEnd = 1.00;   // Completely hidden at totality
            for (const bead of this.beads) {
                let targetOpacity = 0;

                if (coverage >= beadStart && coverage < beadEnd) {
                    // Calculate which beads are visible based on coverage
                    // As the moon moves across, different valleys are exposed

                    // Normalize coverage to 0-1 range within the bead visibility window
                    const normalizedCoverage = (coverage - beadStart) / (beadEnd - beadStart);

                    // Each bead becomes visible/invisible based on its angular position
                    // Simulate the moon's edge sweeping across the sun
                    const phaseAngle = normalizedCoverage * Math.PI * 2;
                    const angleToPhase = Math.abs(((bead.userData.angle - phaseAngle + Math.PI) % (Math.PI * 2)) - Math.PI);

                    // Beads near the current phase are visible
                    const angularProximity = Math.max(0, 1 - angleToPhase / 1.0);

                    // Intensity ramps up to full brightness near beadFull coverage
                    let intensityMultiplier = 1.0;
                    if (coverage < beadFull) {
                        intensityMultiplier = (coverage - beadStart) / (beadFull - beadStart);
                    }

                    targetOpacity = angularProximity * bead.userData.baseIntensity * intensityMultiplier * bead.userData.depth;

                    // Multiply by brightness multiplier to make beads much more visible
                    // Increased from 5.0 → 15.0 → 30.0 → 50.0 for maximum brilliance
                    targetOpacity *= 50.0;
                }

                bead.userData.targetOpacity = targetOpacity;
            }
        }

        // Smooth opacity transitions for all RGB channels
        // Use consistent fade speed for smooth animation
        const fadeSpeed = 3.0;
        for (const bead of this.beads) {
            const {redSprite, greenSprite, blueSprite} = bead.userData;
            const diff = bead.userData.targetOpacity - bead.userData.currentOpacity;
            bead.userData.currentOpacity += diff * fadeSpeed * (deltaTime / 1000); // Convert ms to seconds

            // Clamp to zero when very close (prevents floating point lingering)
            if (bead.userData.currentOpacity < 0.001) {
                bead.userData.currentOpacity = 0;
            }

            // Apply opacity to all RGB channels (green slightly brighter for white center)
            redSprite.material.opacity = bead.userData.currentOpacity * 0.7;
            greenSprite.material.opacity = bead.userData.currentOpacity * 1.0;
            blueSprite.material.opacity = bead.userData.currentOpacity * 0.7;
        }
    }

    /**
     * Set visibility of the beads effect
     * @param {boolean} visible - Whether beads should be visible
     */
    setVisible(visible) {
        this.visible = visible;
    }

    /**
     * Clean up resources
     */
    dispose() {
        for (const bead of this.beads) {
            const {redSprite, greenSprite, blueSprite} = bead.userData;

            // Dispose red sprite
            if (redSprite.material.map) {
                redSprite.material.map.dispose();
            }
            redSprite.material.dispose();

            // Dispose green sprite
            if (greenSprite.material.map) {
                greenSprite.material.map.dispose();
            }
            greenSprite.material.dispose();

            // Dispose blue sprite
            if (blueSprite.material.map) {
                blueSprite.material.map.dispose();
            }
            blueSprite.material.dispose();

            this.scene.remove(bead);
        }
        this.beads = [];

        // Dispose shared texture
        if (this.sharedTexture) {
            this.sharedTexture.dispose();
            this.sharedTexture = null;
        }

        // Clear temp objects
        this._directionToCamera = null;
        this._up = null;
        this._right = null;
        this._upVector = null;
        this._beadOffset = null;
        this._tempColor = null;

        // Clear scene reference
        this.scene = null;
    }
}
