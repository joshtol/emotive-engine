/**
 * BackdropRenderer - Renders backdrop effects behind the mascot
 * Provides better visibility against varying backgrounds
 *
 * The backdrop creates a vignette-style darkening effect that fades from
 * dark at the center to transparent at the edges. This helps improve
 * particle visibility and creates depth.
 *
 * Technical Implementation:
 * - Radial gradient: Dark center → Transparent edges (vignette style)
 * - Circle drawn at exact gradient radius (no extensions)
 * - Smooth easing curve for natural falloff
 * - Audio-reactive intensity boosting
 * - Canvas blend modes for different visual effects
 * - Double-buffered rendering for smooth transitions
 *
 * Render Order:
 * 1. Backdrop (this)
 * 2. Decay system (trails)
 * 3. Offscreen render (mascot + particles)
 * 4. Composite to main canvas
 *
 * Gradient Algorithm:
 * - Position 0.0: Dark center (full intensity)
 * - Position coreTransparency: Still dark
 * - Position coreTransparency → 1.0: Fade to transparent using easeInOutCubic
 * - Position 1.0: Fully transparent edge
 *
 * No hard edges because gradient naturally fades to transparent before
 * reaching the circle boundary.
 *
 * @module core/renderer/BackdropRenderer
 */

export class BackdropRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;

        // Backdrop configuration
        this.config = {
            enabled: false,

            // Size & Shape
            radius: 1.5, // Diameter multiplier (mascot size × radius)
            shape: 'circle', // 'circle', 'ellipse', 'fullscreen'

            // Color & Appearance
            color: 'rgba(0, 0, 0, 0.6)', // Base color
            intensity: 0.7, // Overall opacity (0-1)
            blendMode: 'normal', // Canvas blend mode: 'normal', 'multiply', 'overlay', 'screen'

            // Gradient Control
            falloff: 'smooth', // 'linear', 'smooth', 'exponential', 'custom'
            falloffCurve: null, // Array of {stop, alpha} for custom falloff
            edgeSoftness: 0.6, // How much of gradient is soft (0-1, default 0.6)
            coreTransparency: 0.2, // How far center stays transparent (0-1, default 0.2)

            // Effects
            blur: 0, // Backdrop blur radius (pixels)
            responsive: true, // React to audio/emotion
            pulse: false, // Subtle pulsing effect

            // Advanced
            offset: { x: 0, y: 0 }, // Position offset from mascot center

            // Legacy support
            type: 'radial-gradient' // 'radial-gradient', 'vignette', 'glow' (legacy)
        };

        // Dynamic state
        this.currentIntensity = 0;
        this.targetIntensity = 0;
        this.pulsePhase = 0;
    }

    /**
     * Update backdrop configuration
     * @param {Object} options - Backdrop options
     */
    setConfig(options = {}) {
        this.config = { ...this.config, ...options };

        // Set initial intensity
        if (options.enabled !== undefined) {
            this.targetIntensity = options.enabled ? this.config.intensity : 0;
        }
    }

    /**
     * Update backdrop state (called each frame)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.config.enabled) {
            // Fade out if disabled
            this.currentIntensity *= 0.95;
            return;
        }

        // Smooth transition to target intensity
        const lerpSpeed = 0.1;
        this.currentIntensity += (this.targetIntensity - this.currentIntensity) * lerpSpeed;

        // Pulse effect for responsive mode
        if (this.config.responsive) {
            this.pulsePhase += deltaTime * 0.001; // Slow pulse
        }
    }

    /**
     * Set intensity based on audio amplitude
     * @param {number} amplitude - Audio amplitude (0-1)
     */
    setAudioIntensity(amplitude) {
        if (!this.config.responsive) return;

        // Boost intensity slightly with audio
        const boost = amplitude * 0.2; // Max 20% boost
        this.targetIntensity = Math.min(1, this.config.intensity + boost);
    }

    /**
     * Render the backdrop
     * @param {number} centerX - Mascot center X position
     * @param {number} centerY - Mascot center Y position
     * @param {number} mascotRadius - Current mascot radius
     * @param {CanvasRenderingContext2D} targetCtx - Optional target context (defaults to this.ctx)
     */
    render(centerX, centerY, mascotRadius, targetCtx = null) {
        if (this.currentIntensity < 0.01) {
            return;
        }

        const ctx = targetCtx || this.ctx;
        ctx.save();

        switch (this.config.type) {
        case 'radial-gradient':
            this.renderRadialGradient(centerX, centerY, mascotRadius, ctx);
            break;

        case 'vignette':
            this.renderVignette(centerX, centerY, mascotRadius, ctx);
            break;

        case 'glow':
            this.renderGlow(centerX, centerY, mascotRadius, ctx);
            break;
        }

        ctx.restore();
    }

    /**
     * Render radial gradient backdrop
     */
    renderRadialGradient(centerX, centerY, mascotRadius, ctx) {
        ctx = ctx || this.ctx;
        const radius = mascotRadius * this.config.radius;

        // Apply position offset
        const offsetX = centerX + (this.config.offset.x || 0);
        const offsetY = centerY + (this.config.offset.y || 0);

        // Apply subtle pulse in responsive mode
        let effectiveRadius = radius;
        if (this.config.pulse || this.config.responsive) {
            const pulse = Math.sin(this.pulsePhase) * 0.05; // ±5% pulse
            effectiveRadius *= (1 + pulse);
        }

        // Apply blend mode
        const originalCompositeOp = ctx.globalCompositeOperation;
        if (this.config.blendMode && this.config.blendMode !== 'normal') {
            ctx.globalCompositeOperation = this.config.blendMode;
        }

        // Apply blur if specified
        if (this.config.blur > 0) {
            ctx.filter = `blur(${this.config.blur}px)`;
        }

        // Create radial gradient - NO extension, no fade-back-to-transparent
        const gradient = ctx.createRadialGradient(
            offsetX, offsetY, 0,
            offsetX, offsetY, effectiveRadius
        );

        // Parse base color and adjust alpha based on current intensity
        const baseColor = this.config.color;
        const intensityMultiplier = this.currentIntensity;

        // Generate gradient stops - simple ramp, no fadeout zone
        this.addGradientStopsSimple(gradient, baseColor, intensityMultiplier);

        // Fill the backdrop area - simple circle at exact gradient radius
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, effectiveRadius, 0, Math.PI * 2);
        ctx.fill();

        // Reset blur filter
        if (this.config.blur > 0) {
            ctx.filter = 'none';
        }

        // Reset blend mode
        if (this.config.blendMode && this.config.blendMode !== 'normal') {
            ctx.globalCompositeOperation = originalCompositeOp;
        }
    }

    /**
     * Render vignette effect (darkens edges, lightens center)
     */
    renderVignette(centerX, centerY, mascotRadius, ctx) {
        ctx = ctx || this.ctx;
        const {canvas} = ctx;
        const maxRadius = Math.max(canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
            centerX, centerY, mascotRadius * 0.5,
            centerX, centerY, maxRadius
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, this.adjustColorAlpha(this.config.color, this.currentIntensity));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Render soft glow effect
     */
    renderGlow(centerX, centerY, mascotRadius, ctx) {
        ctx = ctx || this.ctx;
        const radius = mascotRadius * this.config.radius;

        // Multiple layers for softer glow
        for (let i = 0; i < 3; i++) {
            const layerRadius = radius * (1 - i * 0.2);
            const layerAlpha = this.currentIntensity * (0.3 - i * 0.1);

            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, layerRadius
            );

            gradient.addColorStop(0, this.adjustColorAlpha(this.config.color, layerAlpha));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add gradient stops - vignette style (dark center → transparent edges)
     * @param {CanvasGradient} gradient - The gradient to add stops to
     * @param {string} baseColor - Base color
     * @param {number} intensityMultiplier - Intensity multiplier
     */
    addGradientStopsSimple(gradient, baseColor, intensityMultiplier) {
        const {coreTransparency} = this.config;

        // DARK CENTER → TRANSPARENT EDGES (vignette style)
        // Center is darkest
        gradient.addColorStop(0, this.adjustColorAlpha(baseColor, intensityMultiplier));

        // Stay dark up to coreTransparency
        gradient.addColorStop(coreTransparency, this.adjustColorAlpha(baseColor, intensityMultiplier));

        // Generate many stops for ultra-smooth fade to transparent at edges
        const numStops = 25;
        for (let i = 1; i <= numStops; i++) {
            const t = i / numStops; // 0.04, 0.08, 0.12, ... 1.0
            const stopPosition = coreTransparency + (1 - coreTransparency) * t;

            // Alpha decreases from 1.0 to 0.0 as we approach edge
            const fadeT = (stopPosition - coreTransparency) / (1 - coreTransparency);
            const alpha = 1 - this.easeInOutCubic(fadeT); // 1.0 → 0.0

            gradient.addColorStop(stopPosition, this.adjustColorAlpha(baseColor, intensityMultiplier * alpha));
        }

        // Final edge is fully transparent
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    /**
     * Add gradient stops based on falloff configuration
     * @param {CanvasGradient} gradient - The gradient to add stops to
     * @param {string} baseColor - Base color
     * @param {number} intensityMultiplier - Intensity multiplier
     * @param {number} scale - Scale factor for gradient (effectiveRadius / gradientRadius)
     */
    addGradientStops(gradient, baseColor, intensityMultiplier, scale = 1.0) {
        const {coreTransparency} = this.config;

        // Custom falloff curve takes precedence
        if (this.config.falloffCurve && Array.isArray(this.config.falloffCurve)) {
            this.config.falloffCurve.forEach(({stop, alpha}) => {
                gradient.addColorStop(stop, this.adjustColorAlpha(baseColor, intensityMultiplier * alpha));
            });
            return;
        }

        // Generate stops based on falloff type
        switch (this.config.falloff) {
        case 'linear': {
            // Linear falloff: simple transition
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(coreTransparency, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, this.adjustColorAlpha(baseColor, intensityMultiplier));
            break;
        }

        case 'exponential': {
            // Exponential falloff: rapid increase near edges
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(coreTransparency, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(coreTransparency + (1 - coreTransparency) * 0.3, this.adjustColorAlpha(baseColor, intensityMultiplier * 0.05));
            gradient.addColorStop(coreTransparency + (1 - coreTransparency) * 0.5, this.adjustColorAlpha(baseColor, intensityMultiplier * 0.15));
            gradient.addColorStop(coreTransparency + (1 - coreTransparency) * 0.7, this.adjustColorAlpha(baseColor, intensityMultiplier * 0.4));
            gradient.addColorStop(coreTransparency + (1 - coreTransparency) * 0.85, this.adjustColorAlpha(baseColor, intensityMultiplier * 0.7));
            gradient.addColorStop(1, this.adjustColorAlpha(baseColor, intensityMultiplier));
            break;
        }

        case 'smooth':
        default: {
            // Smooth falloff: gradual transition with multiple stops
            // Center stays transparent up to coreTransparency
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(coreTransparency * scale, 'rgba(0, 0, 0, 0)');

            // The backdrop reaches peak opacity at 'scale' position (e.g., 0.83 if scale=0.83)
            // Then fades back to transparent at position 1.0 for soft edges

            // edgeSoftness controls how gradually we reach peak opacity
            const {edgeSoftness} = this.config;
            const peakPosition = scale; // Where we reach maximum opacity
            const softRange = coreTransparency * scale + (peakPosition - coreTransparency * scale) * edgeSoftness;

            // Generate many stops for ultra-smooth transition
            const numStops = 25;
            for (let i = 1; i <= numStops; i++) {
                const t = i / numStops; // 0.04, 0.08, 0.12, ... 1.0
                const stopPosition = t;

                let alpha = 0;

                if (stopPosition <= coreTransparency * scale) {
                    // In transparent core region
                    alpha = 0;
                } else if (stopPosition <= peakPosition) {
                    // Ramping up to peak opacity
                    if (stopPosition <= softRange) {
                        // Within soft range: gradual increase using easing
                        const localT = (stopPosition - coreTransparency * scale) / (softRange - coreTransparency * scale);
                        alpha = this.easeInOutCubic(localT);
                    } else {
                        // Beyond soft range to peak: final ramp
                        const localT = (stopPosition - softRange) / (peakPosition - softRange);
                        alpha = 1 - (1 - this.easeInOutCubic(localT)) * 0.05; // 95-100% range
                    }
                } else {
                    // Beyond peak: fade back to transparent for soft edge
                    // This is the key to eliminating hard edges!
                    const fadeT = (stopPosition - peakPosition) / (1 - peakPosition);
                    alpha = 1 - this.easeInOutCubic(fadeT); // Ease from 1.0 to 0.0
                }

                gradient.addColorStop(stopPosition, this.adjustColorAlpha(baseColor, intensityMultiplier * alpha));
            }

            // Ensure final edge is fully transparent for soft fadeout
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            break;
        }
        }
    }

    /**
     * Easing function for smooth transitions (cubic)
     * @param {number} t - Input value (0-1)
     * @returns {number} Eased value (0-1)
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Adjust color alpha channel by intensity
     * @param {string} color - CSS color string
     * @param {number} intensity - Intensity multiplier (0-1)
     * @returns {string} Adjusted color
     */
    adjustColorAlpha(color, intensity) {
        // Parse rgba color
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

        if (match) {
            const [, r, g, b, a = 1] = match;
            const newAlpha = parseFloat(a) * intensity;
            return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
        }

        // Fallback: assume it's a hex or named color, use default alpha
        return `rgba(0, 0, 0, ${intensity * 0.6})`;
    }

    /**
     * Get current config
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Enable backdrop
     */
    enable() {
        this.config.enabled = true;
        this.targetIntensity = this.config.intensity;
    }

    /**
     * Disable backdrop
     */
    disable() {
        this.config.enabled = false;
        this.targetIntensity = 0;
    }

    /**
     * Toggle backdrop
     */
    toggle() {
        if (this.config.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
}

export default BackdropRenderer;
