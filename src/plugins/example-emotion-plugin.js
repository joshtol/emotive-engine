/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE v4.0
 *  └─○═╝
 *              ◐ ◑ ◒ ◓  EXAMPLE: CUSTOM EMOTION PLUGIN  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Example Custom Emotion Plugin using v4.0 Plugin Adapter System
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module ExampleEmotionPlugin
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Shows how to add custom emotions to the Emotive Engine. This example adds
 * ║ "nostalgic" and "determined" emotions with their own colors, particles,
 * ║ and animation behaviors. Use this as a template for your own emotions!
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 CUSTOM EMOTIONS ADDED
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • nostalgic  : Soft purple glow with slow, dreamy particles
 * │ • determined : Bright orange with focused, directional particles
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 HOW TO USE
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ import EmotiveMascot from './src/EmotiveMascot.js';
 * │ import NostalgiaPlugin from './src/plugins/example-emotion-plugin.js';
 * │
 * │ const mascot = new EmotiveMascot(canvas);
 * │ mascot.registerPlugin(new NostalgiaPlugin());
 * │
 * │ // Now you can use the new emotions!
 * │ mascot.setEmotion('nostalgic');
 * │ mascot.setEmotion('determined');
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

class CustomEmotionPlugin {
    constructor() {
        this.type = 'emotion';
        this.name = 'CustomEmotionPlugin';
        this.version = '1.0.0';

        // Define our custom emotions
        this.emotions = {
            nostalgic: {
                // Visual properties
                primaryColor: '#9B7EDE', // Soft purple
                secondaryColor: '#C8B6E2', // Light lavender
                glowIntensity: 0.6, // Soft, dreamy glow
                coreSize: 0.95, // Slightly smaller core

                // Particle properties
                particleRate: 8, // Slow particle generation
                minParticles: 3,
                maxParticles: 12,
                particleBehavior: 'floating', // Gentle floating motion
                particleSpeed: 0.3, // Very slow movement
                particleSize: 1.2, // Slightly larger particles

                // Animation properties
                breathRate: 0.7, // Slower breathing
                breathDepth: 0.12, // Deeper breaths

                // Optional gesture trigger
                defaultGesture: 'sway', // Gentle swaying motion

                // Sound properties (if sound system enabled)
                soundFrequency: 196, // G3 note - melancholic
                soundWaveform: 'sine',
                soundVolume: 0.08,
            },

            determined: {
                // Visual properties
                primaryColor: '#FF6B35', // Bright orange
                secondaryColor: '#FFD93D', // Golden yellow
                glowIntensity: 1.2, // Strong, focused glow
                coreSize: 1.1, // Larger, more prominent

                // Particle properties
                particleRate: 25, // High energy particles
                minParticles: 10,
                maxParticles: 30,
                particleBehavior: 'directional', // Focused forward motion
                particleSpeed: 1.5, // Fast, purposeful movement
                particleSize: 0.8, // Smaller, concentrated particles
                particleDirection: 0, // Upward/forward direction

                // Animation properties
                breathRate: 1.3, // Faster, energetic breathing
                breathDepth: 0.15, // Strong, confident breaths

                // Optional gesture trigger
                defaultGesture: 'pulse', // Strong pulsing

                // Sound properties (if sound system enabled)
                soundFrequency: 523, // C5 note - triumphant
                soundWaveform: 'square', // More aggressive tone
                soundVolume: 0.15,
            },
        };

        // Track if we're initialized
        this.initialized = false;
    }

    /**
     * Initialize the plugin (called when registered)
     * @param {Object} api - Plugin API from PluginSystem
     */
    init(api) {
        this.mascot = api.mascot || api; // Support both PluginSystem API and direct mascot
        this.initialized = true;

        // Register emotions with the plugin adapter
        this.registerEmotions();
    }

    /**
     * Register custom emotions with the emotion plugin adapter
     * @private
     */
    registerEmotions() {
        // Import the emotion plugin adapter
        const emotionModule = this.mascot.Emotions || window.Emotions;
        if (!emotionModule || !emotionModule.pluginAdapter) {
            return;
        }

        const adapter = emotionModule.pluginAdapter;

        // Register each emotion properly
        Object.entries(this.emotions).forEach(([name, config]) => {
            const emotionDef = {
                name,
                emoji: this.getEmotionEmoji(name),
                color: config.primaryColor,
                energy: this.getEmotionEnergy(name),

                visual: {
                    primaryColor: config.primaryColor,
                    secondaryColor: config.secondaryColor,
                    particleCount: config.particleRate || 15,
                    particleSize: {
                        min: (config.particleSize || 1) * 2,
                        max: (config.particleSize || 1) * 6,
                    },
                    glowIntensity: config.glowIntensity || 0.5,
                    trailLength: 5,
                    pulseRate: config.breathRate || 1.0,
                },

                particles: {
                    behavior: config.particleBehavior || 'ambient',
                    density: this.getParticleDensity(config.particleRate),
                    speed: this.getParticleSpeed(config.particleSpeed),
                },

                modifiers: {
                    speed: config.particleSpeed || 1.0,
                    amplitude: 1.0,
                    intensity: config.glowIntensity || 1.0,
                    smoothness: 1.0,
                },

                gestures: config.defaultGesture ? [config.defaultGesture] : [],

                transitions: {
                    neutral: {
                        duration: 1000,
                        easing: 'ease-in-out',
                        gesture: config.defaultGesture || null,
                    },
                },
            };

            adapter.registerPluginEmotion(name, emotionDef);
        });
    }

    /**
     * Get emoji for emotion
     * @private
     */
    getEmotionEmoji(name) {
        const emojis = {
            nostalgic: '💭',
            determined: '💪',
        };
        return emojis[name] || '🔌';
    }

    /**
     * Get energy level for emotion
     * @private
     */
    getEmotionEnergy(name) {
        if (name === 'nostalgic') return 'low';
        if (name === 'determined') return 'high';
        return 'medium';
    }

    /**
     * Convert particle rate to density
     * @private
     */
    getParticleDensity(rate) {
        if (rate < 10) return 'low';
        if (rate > 20) return 'high';
        return 'medium';
    }

    /**
     * Convert particle speed to speed category
     * @private
     */
    getParticleSpeed(speed) {
        if (speed < 0.5) return 'slow';
        if (speed > 1.2) return 'fast';
        return 'normal';
    }

    /**
     * Update function called every frame
     * @param {number} deltaTime - Time since last frame
     * @param {Object} state - Current mascot state
     */
    update(deltaTime, state) {
        // Check if current emotion is one of ours
        if (this.emotions[state.emotion]) {
            // Apply any dynamic behaviors specific to our custom emotions
            if (state.emotion === 'nostalgic') {
                // Add subtle random drift for nostalgic feeling
                if (Math.random() < 0.01) {
                    // 1% chance per frame
                    this.mascot.express('drift');
                }
            } else if (state.emotion === 'determined') {
                // Add occasional strong pulses for determination
                if (Math.random() < 0.005) {
                    // 0.5% chance per frame
                    this.mascot.express('pulse');
                }
            }
        }
    }

    /**
     * Render function for custom rendering (optional)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} state - Current mascot state
     */
    render(ctx, state) {
        // Add custom rendering effects for our emotions
        if (this.emotions[state.emotion]) {
            if (state.emotion === 'nostalgic') {
                // Add a subtle vignette effect for nostalgic mood
                this.renderVignette(ctx, 'rgba(155, 126, 222, 0.1)');
            } else if (state.emotion === 'determined') {
                // Add speed lines for determination
                this.renderSpeedLines(ctx, state);
            }
        }
    }

    /**
     * Render a vignette effect
     * @private
     */
    renderVignette(ctx, color) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.max(ctx.canvas.width, ctx.canvas.height) * 0.7;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, color);

        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    /**
     * Render speed lines effect
     * @private
     */
    renderSpeedLines(ctx, _state) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = this.emotions.determined.primaryColor;
        ctx.lineWidth = 1;

        // Draw radial speed lines
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const startRadius = 50;
            const endRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;

            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * startRadius,
                centerY + Math.sin(angle) * startRadius
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * endRadius,
                centerY + Math.sin(angle) * endRadius
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Clean up when plugin is unregistered
     */
    destroy() {
        // Unregister emotions from the plugin adapter
        const emotionModule = this.mascot?.Emotions || window.Emotions;
        if (emotionModule && emotionModule.pluginAdapter) {
            const adapter = emotionModule.pluginAdapter;
            Object.keys(this.emotions).forEach(emotionName => {
                adapter.unregisterPluginEmotion(emotionName);
            });
        }

        this.initialized = false;
    }

    /**
     * Get plugin information
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            emotions: Object.keys(this.emotions),
            author: 'Emotive Engine Team',
            description: 'Adds nostalgic and determined emotions with custom visuals',
        };
    }
}

export default CustomEmotionPlugin;
