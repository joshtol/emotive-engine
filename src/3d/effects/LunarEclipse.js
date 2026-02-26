/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lunar Eclipse Effect
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lunar eclipse "Blood Moon" effect for moon geometry
 * @author Emotive Engine Team
 * @module 3d/effects/LunarEclipse
 *
 * Simulates Earth's shadow passing over the moon with realistic color shift:
 * - Penumbral: Subtle darkening (Earth's partial shadow)
 * - Partial: Edge of Earth's umbra covers part of moon
 * - Total: Full umbral coverage with reddish "blood moon" glow (Rayleigh scattering)
 *
 * Based on real lunar eclipse physics:
 * - Earth's atmosphere scatters blue light, red light refracts through
 * - Creates deep orange-red glow on fully eclipsed moon
 * - Shadow moves across surface from one side to the other
 */

import { easeInOutCubic } from './animation/Easing.js';

/**
 * LunarEclipse Effect Manager
 * Animates Earth's shadow across the moon with color shift
 */
export class LunarEclipse {
    constructor(moonMaterial) {
        this.material = moonMaterial;
        this.eclipseType = 'off'; // 'off', 'penumbral', 'partial', 'total'

        // Animation state
        this.progress = 0.0; // 0 = no eclipse, 1 = maximum eclipse
        this.targetProgress = 0.0;
        this.animating = false;

        // Blood Moon colors (based on real lunar eclipse photography)
        this.bloodMoonColor = {
            r: 0.85, // Very high red for deep blood moon
            g: 0.18, // Low green for reddish-orange
            b: 0.08, // Very minimal blue for saturation
        };

        // Eclipse timing (smooth, slow animation like real eclipse)
        this.animationDuration = 3000; // 3 seconds for full transition
        this.startTime = 0;

        // Shadow animation state
        this.shadowX = -2.0; // Start off-screen left
        this.shadowY = 0.0; // Centered vertically
        this.shadowRadius = 0.7; // Shadow size (Earth's umbra)
        this.targetShadowX = -2.0;
        this.shadowSpeed = 1.0; // Shadow movement speed multiplier

        // Visual parameters for eclipse appearance
        this.emissiveStrength = 0.0; // Blood moon glow intensity
        this.targetEmissive = 0.0;
        this.shadowDarkness = 1.0; // How dark the shadowed area is (1.0 = full dark)
        this.targetDarkness = 1.0;

        // Initialize shader uniforms if not present
        if (!this.material.uniforms.eclipseProgress) {
            this.material.uniforms.eclipseProgress = { value: 0.0 };
            this.material.uniforms.eclipseIntensity = { value: 0.0 };
            this.material.uniforms.bloodMoonColor = {
                value: [this.bloodMoonColor.r, this.bloodMoonColor.g, this.bloodMoonColor.b],
            };
            this.material.uniforms.eclipseShadowPos = { value: [this.shadowX, this.shadowY] };
            this.material.uniforms.eclipseShadowRadius = { value: this.shadowRadius };
        }
    }

    /**
     * Set eclipse type and trigger animation
     * @param {string} type - 'off', 'penumbral', 'partial', 'total'
     */
    setEclipseType(type) {
        if (this.eclipseType === type) return;

        const wasOff = this.eclipseType === 'off';
        this.eclipseType = type;

        // If starting a new eclipse (was off), reset shadow to west first
        // Shadow ALWAYS enters from the west (negative X)
        if (wasOff && type !== 'off') {
            this.shadowX = -2.0; // Reset to west
            this.material.uniforms.eclipseShadowPos.value = [this.shadowX, this.shadowY];
        }

        // Set target progress, shadow position, and visual parameters based on type
        // Each eclipse type has specific emissive (glow) and darkness settings
        switch (type) {
            case 'off':
                this.targetProgress = 0.0;
                this.targetShadowX = 2.0; // Move shadow off-screen right (continue east, realistic exit)
                this.targetEmissive = 0.0;
                this.targetDarkness = 1.0;
                break;
            case 'penumbral':
                this.targetProgress = 0.3; // 30% coverage (subtle darkening)
                this.targetShadowX = -1.0; // Shadow edge just touching moon
                this.targetEmissive = 0.05; // Very subtle glow
                this.targetDarkness = 0.85; // Mild darkening
                break;
            case 'partial':
                this.targetProgress = 0.65; // 65% coverage (edge of umbra)
                this.targetShadowX = -0.4; // Shadow covering ~half of moon
                this.targetEmissive = 0.2; // Moderate glow on shadowed portion
                this.targetDarkness = 0.7; // Moderate darkening
                break;
            case 'total':
                this.targetProgress = 1.0; // 100% coverage (full blood moon)
                this.targetShadowX = 0.0; // Shadow centered on moon
                this.targetEmissive = 0.39; // Strong blood moon glow
                this.targetDarkness = 0.53; // Less darkening so glow is visible
                break;
            default:
                console.warn(`Unknown lunar eclipse type: ${type}`);
                return;
        }

        // Start animation
        this.animating = true;
        this.startTime = performance.now();
    }

    /**
     * Update eclipse animation
     * @param {number} _deltaTime - Time since last frame (ms) - unused, uses performance.now()
     */
    update(_deltaTime) {
        if (!this.animating) return;

        // Calculate animation progress
        const elapsed = performance.now() - this.startTime;
        const animProgress = Math.min(elapsed / this.animationDuration, 1.0);

        // Ease in-out for smooth, natural eclipse movement
        const eased = easeInOutCubic(animProgress);

        // Interpolate eclipse progress
        this.progress = this.progress + (this.targetProgress - this.progress) * eased;

        // Interpolate shadow position (animate shadow sweep)
        this.shadowX =
            this.shadowX + (this.targetShadowX - this.shadowX) * eased * this.shadowSpeed;

        // Interpolate visual parameters
        this.emissiveStrength =
            this.emissiveStrength + (this.targetEmissive - this.emissiveStrength) * eased;
        this.shadowDarkness =
            this.shadowDarkness + (this.targetDarkness - this.shadowDarkness) * eased;

        // Update shader uniforms
        this.material.uniforms.eclipseProgress.value = this.progress;
        this.material.uniforms.eclipseShadowPos.value = [this.shadowX, this.shadowY];

        // Update emissive and darkness uniforms (critical for visual appearance)
        if (this.material.uniforms.emissiveStrength) {
            this.material.uniforms.emissiveStrength.value = this.emissiveStrength;
        }
        if (this.material.uniforms.shadowDarkness) {
            this.material.uniforms.shadowDarkness.value = this.shadowDarkness;
        }

        // Eclipse intensity affects darkening (separate from color shift)
        // Total eclipse: strong darkening + red color
        // Partial: moderate darkening
        // Penumbral: subtle darkening only
        let intensity = 0.0;
        if (this.eclipseType === 'total') {
            intensity = this.progress; // Full darkening at totality
        } else if (this.eclipseType === 'partial') {
            intensity = this.progress * 0.6; // Moderate darkening
        } else if (this.eclipseType === 'penumbral') {
            intensity = this.progress * 0.25; // Subtle darkening
        }
        this.material.uniforms.eclipseIntensity.value = intensity;

        // Stop animation when complete
        if (animProgress >= 1.0) {
            this.animating = false;
        }
    }

    /**
     * Reset eclipse to off state instantly
     */
    reset() {
        this.progress = 0.0;
        this.targetProgress = 0.0;
        this.shadowX = -2.0;
        this.targetShadowX = -2.0;
        this.emissiveStrength = 0.0;
        this.targetEmissive = 0.0;
        this.shadowDarkness = 1.0;
        this.targetDarkness = 1.0;
        this.animating = false;
        this.eclipseType = 'off';

        if (this.material.uniforms.eclipseProgress) {
            this.material.uniforms.eclipseProgress.value = 0.0;
            this.material.uniforms.eclipseIntensity.value = 0.0;
            this.material.uniforms.eclipseShadowPos.value = [this.shadowX, this.shadowY];
        }
        if (this.material.uniforms.emissiveStrength) {
            this.material.uniforms.emissiveStrength.value = 0.0;
        }
        if (this.material.uniforms.shadowDarkness) {
            this.material.uniforms.shadowDarkness.value = 1.0;
        }
    }

    /**
     * Dispose resources
     */
    dispose() {
        // Shader uniforms are disposed with material, nothing to clean up
    }
}
