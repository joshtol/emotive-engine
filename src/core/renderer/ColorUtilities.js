/**
 * ColorUtilities - Color manipulation and transition utilities for EmotiveRenderer
 * @module core/renderer/ColorUtilities
 */

export class ColorUtilities {
    constructor() {
        this.colorTransition = null;
    }

    /**
     * Apply undertone modifiers to current visual properties
     * Will be moved from EmotiveRenderer
     */
    applyUndertoneModifiers(undertone, visualProperties) {
        // Implementation will be moved here
        return visualProperties;
    }

    /**
     * Apply undertone to a color
     * @param {string} baseColor - Base hex color
     * @param {string|Object} undertone - Undertone modifier or weighted object
     * @returns {string} Modified hex color
     */
    applyUndertoneToColor(baseColor, undertone) {
        // Handle weighted modifier for smooth transitions
        if (undertone && typeof undertone === 'object' && undertone.weight !== undefined) {
            const {weight} = undertone;
            const undertoneType = undertone.type || 'clear';
            
            if (undertoneType === 'clear' || weight === 0) {
                return baseColor;
            }
            
            // Get full saturation adjustment for this undertone
            const fullySaturated = this.applyUndertoneSaturation(baseColor, undertoneType);
            
            // Interpolate between base and fully saturated based on weight
            const rgb1 = this.hexToRgb(baseColor);
            const rgb2 = this.hexToRgb(fullySaturated);
            
            const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * weight);
            const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * weight);
            const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * weight);
            
            return this.rgbToHex(r, g, b);
        }
        
        // Direct string-based undertone - use saturation system
        if (!undertone || undertone === 'clear') return baseColor;
        
        return this.applyUndertoneSaturation(baseColor, undertone);
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color string
     * @returns {Object} RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h, s;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 }; // Convert s and l to percentages
    }

    /**
     * Convert HSL to hex color
     */
    hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Apply undertone saturation adjustment
     */
    applyUndertoneSaturation(baseColor, undertone) {
        const rgb = this.hexToRgb(baseColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Saturation adjustments by undertone
        const saturationModifiers = {
            // Positive undertones (higher saturation)
            'intense': 1.5,      // +50% saturation (very vivid)
            'confident': 1.3,    // +30% saturation (bold)
            'energetic': 1.2,    // +20% saturation (vibrant)
            'upbeat': 1.2,       // +20% saturation
            // Neutral/slightly nervous
            'nervous': 1.15,     // +15% saturation (slightly heightened)
            // Negative undertones (lower saturation)
            'mellow': 0.8,       // -20% saturation  
            'tired': 0.8,        // -20% saturation (washed out)
            'subdued': 0.5       // -50% saturation (ghostly)
        };
        
        const modifier = saturationModifiers[undertone] || 1.0;
        hsl.s = Math.min(100, hsl.s * modifier);
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }
    
    /**
     * Convert RGB values to hex
     */
    rgbToHex(r, g, b) {
        const toHex = x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    /**
     * Start a color transition
     */
    startColorTransition(targetColor, targetIntensity, duration = 1500) {
        // Don't start a new transition if we're already at the target
        if (this.currentColor === targetColor && 
            this.currentIntensity === targetIntensity) {
            return;
        }
        
        this.colorTransition = {
            active: true,
            fromColor: this.currentColor || '#ffffff',
            toColor: targetColor,
            fromIntensity: this.currentIntensity || 1.0,
            toIntensity: targetIntensity,
            progress: 0,
            startTime: performance.now(),
            duration
        };
    }

    /**
     * Update color transition
     */
    updateColorTransition(deltaTime) {
        if (!this.colorTransition || !this.colorTransition.active) return null;
        
        const elapsed = performance.now() - this.colorTransition.startTime;
        const progress = Math.min(elapsed / this.colorTransition.duration, 1);
        
        // Use ease-out-quad for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 2);
        
        // Interpolate color
        const from = this.hexToRgb(this.colorTransition.fromColor);
        const to = this.hexToRgb(this.colorTransition.toColor);
        
        const r = Math.round(from.r + (to.r - from.r) * eased);
        const g = Math.round(from.g + (to.g - from.g) * eased);
        const b = Math.round(from.b + (to.b - from.b) * eased);
        
        const currentColor = this.rgbToHex(r, g, b);
        const currentIntensity = this.colorTransition.fromIntensity + 
            (this.colorTransition.toIntensity - this.colorTransition.fromIntensity) * eased;
        
        // Store current values
        this.currentColor = currentColor;
        this.currentIntensity = currentIntensity;
        
        // Complete transition if done
        if (progress >= 1) {
            this.colorTransition.active = false;
        }
        
        return {
            color: currentColor,
            intensity: currentIntensity
        };
    }
}

export default ColorUtilities;