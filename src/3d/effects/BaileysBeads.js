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
        this.beadCount = 20; // Number of potential bead positions around the limb
        this.beads = [];
        this.visible = false;

        // Create bead sprite instances
        this.createBeads();
    }

    /**
     * Create individual bead sprites
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

        // Create material for beads
        const material = new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0
        });

        // Create beads at fixed angular positions around the limb
        // These simulate lunar valleys at specific locations
        const valleys = this.generateLunarValleys();

        for (let i = 0; i < this.beadCount; i++) {
            const sprite = new THREE.Sprite(material.clone());
            sprite.scale.set(0.08, 0.08, 1); // Small, bright points

            // Store metadata for each bead
            sprite.userData = {
                angle: valleys[i].angle,
                depth: valleys[i].depth, // How "deep" the valley is (affects brightness)
                baseIntensity: valleys[i].baseIntensity,
                targetOpacity: 0,
                currentOpacity: 0
            };

            this.beads.push(sprite);
            this.scene.add(sprite);
        }
    }

    /**
     * Generate simulated lunar valley positions
     * Uses seeded randomness for consistent bead patterns
     * @private
     * @returns {Array} Array of valley data {angle, depth, baseIntensity}
     */
    generateLunarValleys() {
        const valleys = [];

        // Use a simple seeded random for consistency
        let seed = 12345;
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        for (let i = 0; i < this.beadCount; i++) {
            // Distribute around circle with slight clustering
            const baseAngle = (i / this.beadCount) * Math.PI * 2;
            const jitter = (seededRandom() - 0.5) * 0.3;

            valleys.push({
                angle: baseAngle + jitter,
                depth: 0.3 + seededRandom() * 0.7, // Varies valley depth
                baseIntensity: 0.5 + seededRandom() * 0.5 // Varies bead brightness
            });
        }

        return valleys;
    }

    /**
     * Update bead positions and visibility based on eclipse coverage
     * @param {THREE.Vector3} sunPosition - Current sun position in world space
     * @param {number} coverage - Eclipse coverage (0=no eclipse, 1=total)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} worldScale - Current world scale of the sun (for proper sizing)
     */
    update(sunPosition, coverage, deltaTime, worldScale = 1.0) {
        console.log('🔮 Bailey\'s Beads Update:');
        console.log(`   visible: ${this.visible}`);
        console.log(`   coverage: ${coverage.toFixed(4)}`);
        console.log(`   worldScale: ${worldScale.toFixed(4)}`);
        console.log('   sunPosition:', sunPosition);
        console.log(`   beads.length: ${this.beads.length}`);

        if (!this.visible) {
            // Fade out all beads
            for (const bead of this.beads) {
                bead.userData.targetOpacity = 0;
            }
            console.log('   ❌ Not visible - fading out all beads');
        } else {
            // Bailey's Beads are visible in the range 0.95 to 1.0 coverage
            // They fade in as coverage approaches 0.95 and fade out at exactly 1.0
            const beadStart = 0.90; // Start showing beads
            const beadFull = 0.97;  // Full intensity
            const beadEnd = 1.00;   // Completely hidden at totality

            console.log(`   ✅ Visible - coverage range check: ${beadStart} <= ${coverage.toFixed(4)} < ${beadEnd}`);

            let visibleBeadCount = 0;
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
                    targetOpacity *= 5.0;

                    if (targetOpacity > 0.05) {
                        visibleBeadCount++;
                    }
                }

                bead.userData.targetOpacity = targetOpacity;
            }

            console.log(`   💎 Beads with targetOpacity > 0.05: ${visibleBeadCount}`);

            // Update bead positions to circle around sun
            // Account for world scale to stay on the rim regardless of sun size/transforms
            const scaledRadius = this.sunRadius * worldScale * 1.0; // Exactly on the rim

            console.log('   📍 Positioning beads:');
            console.log(`      scaledRadius: ${scaledRadius.toFixed(4)}`);
            console.log(`      base sunRadius: ${this.sunRadius.toFixed(4)}`);

            for (const bead of this.beads) {
                const {angle} = bead.userData;

                bead.position.set(
                    sunPosition.x + Math.cos(angle) * scaledRadius,
                    sunPosition.y + Math.sin(angle) * scaledRadius,
                    sunPosition.z + 0.01 // Slightly in front of sun
                );

                // Scale beads with sun to maintain consistent visual size
                // Increased from 0.08 to 0.4 to make beads much more visible
                const beadScale = worldScale * 0.4;
                bead.scale.set(beadScale, beadScale, 1);
            }

            // Log first bead as sample
            if (this.beads.length > 0) {
                const firstBead = this.beads[0];
                console.log('   🔍 First bead sample:');
                console.log('      position:', firstBead.position);
                console.log('      scale:', firstBead.scale);
                console.log(`      targetOpacity: ${firstBead.userData.targetOpacity.toFixed(4)}`);
                console.log(`      currentOpacity: ${firstBead.userData.currentOpacity.toFixed(4)}`);
                console.log(`      material.opacity: ${firstBead.material.opacity.toFixed(4)}`);
            }
        }

        // Smooth opacity transitions
        const fadeSpeed = 3.0; // Beads fade in/out quickly
        for (const bead of this.beads) {
            const diff = bead.userData.targetOpacity - bead.userData.currentOpacity;
            bead.userData.currentOpacity += diff * fadeSpeed * deltaTime;
            bead.material.opacity = bead.userData.currentOpacity;
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
            if (bead.material.map) {
                bead.material.map.dispose();
            }
            bead.material.dispose();
            this.scene.remove(bead);
        }
        this.beads = [];
    }
}
