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
            r: 0.85,  // Very high red for deep blood moon
            g: 0.18,  // Low green for reddish-orange
            b: 0.08   // Very minimal blue for saturation
        };

        // Eclipse timing (smooth, slow animation like real eclipse)
        this.animationDuration = 3000; // 3 seconds for full transition
        this.startTime = 0;

        // Initialize shader uniforms if not present
        if (!this.material.uniforms.eclipseProgress) {
            this.material.uniforms.eclipseProgress = { value: 0.0 };
            this.material.uniforms.eclipseIntensity = { value: 0.0 };
            this.material.uniforms.bloodMoonColor = {
                value: [this.bloodMoonColor.r, this.bloodMoonColor.g, this.bloodMoonColor.b]
            };
        }
    }

    /**
     * Set eclipse type and trigger animation
     * @param {string} type - 'off', 'penumbral', 'partial', 'total'
     */
    setEclipseType(type) {
        if (this.eclipseType === type) return;

        this.eclipseType = type;

        // Set target progress based on type
        switch (type) {
        case 'off':
            this.targetProgress = 0.0;
            break;
        case 'penumbral':
            this.targetProgress = 0.3; // 30% coverage (subtle darkening)
            break;
        case 'partial':
            this.targetProgress = 0.65; // 65% coverage (edge of umbra)
            break;
        case 'total':
            this.targetProgress = 1.0; // 100% coverage (full blood moon)
            break;
        default:
            console.warn(`Unknown lunar eclipse type: ${type}`);
            return;
        }

        // Start animation
        this.animating = true;
        this.startTime = performance.now();

        console.log(`🌕🌑 Lunar Eclipse: ${type} (progress: ${this.progress.toFixed(2)} → ${this.targetProgress.toFixed(2)})`);
    }

    /**
     * Update eclipse animation
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (!this.animating) return;

        // Calculate animation progress
        const elapsed = performance.now() - this.startTime;
        const animProgress = Math.min(elapsed / this.animationDuration, 1.0);

        // Ease in-out for smooth, natural eclipse movement
        const eased = this.easeInOutCubic(animProgress);

        // Interpolate eclipse progress
        this.progress = this.progress + (this.targetProgress - this.progress) * eased;

        // Update shader uniforms
        this.material.uniforms.eclipseProgress.value = this.progress;

        // Eclipse intensity affects darkening (separate from color shift)
        // Total eclipse: strong darkening + red color
        // Partial: moderate darkening
        // Penumbral: subtle darkening only
        let intensity = 0.0;
        if (this.eclipseType === 'total') {
            intensity = this.progress;  // Full darkening at totality
        } else if (this.eclipseType === 'partial') {
            intensity = this.progress * 0.6;  // Moderate darkening
        } else if (this.eclipseType === 'penumbral') {
            intensity = this.progress * 0.25; // Subtle darkening
        }
        this.material.uniforms.eclipseIntensity.value = intensity;

        // Stop animation when complete
        if (animProgress >= 1.0) {
            this.animating = false;
            console.log(`🌕 Eclipse animation complete: ${this.eclipseType}`);
        }
    }

    /**
     * Ease in-out cubic for smooth animation
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Reset eclipse to off state instantly
     */
    reset() {
        this.progress = 0.0;
        this.targetProgress = 0.0;
        this.animating = false;
        this.eclipseType = 'off';

        if (this.material.uniforms.eclipseProgress) {
            this.material.uniforms.eclipseProgress.value = 0.0;
            this.material.uniforms.eclipseIntensity.value = 0.0;
        }
    }

    /**
     * Dispose resources
     */
    dispose() {
        // Shader uniforms are disposed with material, nothing to clean up
    }
}
