/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sleeping Effect
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'sleeping',
    emoji: '😴',
    description: 'Sleeping with closed eyes and Z particles',

    config: {
        eyeClosedScale: 0.1, // How closed the eyes are (0.1 = 90% closed)
        breathingDepth: 0.15, // Deeper breathing when sleeping
        breathingRate: 0.8, // Slower breathing
        zParticleInterval: 2000, // Spawn Z every 2 seconds
        zDriftSpeed: 1, // Speed of Z particles floating up
        zFadeSpeed: 0.01, // How fast Z's fade out
        orbDimming: 0.3, // Dim orb to 30% brightness when sleeping
        glowDimming: 0.2, // Dim glow even more (20% brightness)
    },

    state: {
        lastZSpawn: 0,
        zParticles: [],
    },

    shouldActivate(state) {
        return state.sleeping === true || state.emotion === 'resting';
    },

    apply(ctx, params) {
        const { x, y, radius, deltaTime = 16.67 } = params;
        const now = Date.now();

        // Spawn new Z particle
        if (now - this.state.lastZSpawn > this.config.zParticleInterval) {
            // Random Poppins font weights: 100-900
            const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
            const randomWeight = weights[Math.floor(Math.random() * weights.length)];

            this.state.zParticles.push({
                x: x + radius,
                y: y - radius,
                opacity: 1.0,
                size: 12 + Math.random() * 8, // Random size 12-20px
                drift: Math.random() * 0.5 - 0.25, // Slight random drift
                weight: randomWeight, // Random font weight
                rotation: Math.random() * 30 - 15, // Random rotation -15 to 15 degrees
            });
            this.state.lastZSpawn = now;
        }

        // Update and draw Z particles
        this.drawZParticles(ctx, deltaTime);
    },

    drawZParticles(ctx, deltaTime) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = this.state.zParticles.length - 1; i >= 0; i--) {
            const z = this.state.zParticles[i];

            // Update position
            z.y -= this.config.zDriftSpeed * (deltaTime / 16.67);
            z.x += z.drift * (deltaTime / 16.67);
            z.opacity -= this.config.zFadeSpeed * (deltaTime / 16.67);
            z.rotation += 0.5 * (deltaTime / 16.67); // Slow rotation

            // Remove if faded
            if (z.opacity <= 0) {
                this.state.zParticles.splice(i, 1);
                continue;
            }

            // Draw Z with random Poppins weight
            ctx.save();
            ctx.translate(z.x, z.y);
            ctx.rotate((z.rotation * Math.PI) / 180);
            ctx.globalAlpha = z.opacity * 0.7; // Slightly transparent
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `${z.weight} ${z.size}px 'Poppins', sans-serif`;
            ctx.fillText('Z', 0, 0);

            // Add a subtle shadow for depth
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(147, 112, 219, 0.5)'; // Purple shadow for dreamy effect
            ctx.fillText('Z', 0, 0);
            ctx.restore();
        }

        ctx.restore();
    },

    getEyeOpenness() {
        return this.config.eyeClosedScale;
    },

    getBreathingModifiers() {
        return {
            rate: this.config.breathingRate,
            depth: this.config.breathingDepth,
        };
    },

    getDimmingValues() {
        return {
            orbDimming: this.config.orbDimming,
            glowDimming: this.config.glowDimming,
        };
    },
};
