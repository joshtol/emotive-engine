/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fizzy Particle Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fizzy behavior - bubbly, effervescent particle movement
 * @author Emotive Engine Team
 * @module particles/behaviors/fizzy
 */

/**
 * FIZZY BEHAVIOR - BUBBLY EFFERVESCENCE
 * Used by: excited emotion
 *
 * Particles bubble upward with random pops and fizz, like carbonation in soda.
 * Creates an energetic, celebratory atmosphere.
 */
export default {
    name: 'fizzy',
    emoji: '🫧',
    description: 'Bubbly, effervescent movement like carbonation',

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ CONFIGURATION
    // └─────────────────────────────────────────────────────────────────────────────────
    config: {
        baseRiseSpeed: 2.5, // Base upward velocity
        wobbleAmplitude: 30, // Horizontal wobble range
        wobbleFrequency: 0.15, // Wobble oscillation speed
        popChance: 0.002, // Chance to "pop" per frame
        popForce: 8, // Force of pop burst
        fizziness: 0.3, // Random velocity variation
        gravity: -0.05, // Slight upward bias
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ INITIALIZATION
    // └─────────────────────────────────────────────────────────────────────────────────
    initialize(particle, _centerX, _centerY, _canvasWidth, _canvasHeight) {
        // Start with upward velocity
        particle.vx = (Math.random() - 0.5) * 2;
        particle.vy = -this.config.baseRiseSpeed - Math.random() * 2;

        // Fizzy properties
        particle.wobblePhase = Math.random() * Math.PI * 2;
        particle.wobbleSpeed = this.config.wobbleFrequency * (0.8 + Math.random() * 0.4);
        particle.bubbleSize = 0.5 + Math.random() * 0.5;
        particle.popTimer = 0;
        particle.isFizzing = true;
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ UPDATE LOOP
    // └─────────────────────────────────────────────────────────────────────────────────
    update(particle, dt, centerX, centerY, canvasWidth, canvasHeight) {
        // Update wobble phase
        particle.wobblePhase += particle.wobbleSpeed * dt;

        // Apply wobble to horizontal movement
        const wobble = Math.sin(particle.wobblePhase) * this.config.wobbleAmplitude;
        particle.vx = wobble * 0.05 + (Math.random() - 0.5) * this.config.fizziness;

        // Apply upward force with variation
        particle.vy += this.config.gravity * dt;
        particle.vy += (Math.random() - 0.5) * this.config.fizziness;

        // Random "pop" events
        if (Math.random() < this.config.popChance) {
            // Pop! Send particle in random direction
            const popAngle = Math.random() * Math.PI * 2;
            particle.vx = Math.cos(popAngle) * this.config.popForce;
            particle.vy = Math.sin(popAngle) * this.config.popForce * 0.7; // Slightly favor horizontal
            particle.popTimer = 1; // Visual feedback timer

            // Resize on pop
            particle.bubbleSize = 0.3 + Math.random() * 0.7;
        }

        // Decay pop effect
        if (particle.popTimer > 0) {
            particle.popTimer -= dt * 0.05;
            // Slow down after pop
            particle.vx *= 0.95;
            particle.vy *= 0.95;
        }

        // Apply velocity
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;

        // Wrap around vertically (bubbles rise and restart)
        if (particle.y < -50) {
            particle.y = canvasHeight + 50;
            particle.x = centerX + (Math.random() - 0.5) * 300;
            particle.vy = -this.config.baseRiseSpeed - Math.random() * 2;
            particle.bubbleSize = 0.5 + Math.random() * 0.5;
        }

        // Horizontal bounds with soft bounce
        if (particle.x <= 0 || particle.x >= canvasWidth) {
            particle.vx *= -0.5;
            particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
        }

        // Bottom boundary (bubbles can spawn from bottom)
        if (particle.y > canvasHeight + 50) {
            particle.y = canvasHeight;
            particle.vy = -this.config.baseRiseSpeed * 1.5;
        }

        // Update size based on bubble properties
        particle.size =
            particle.baseSize *
            particle.bubbleSize *
            (1 + Math.sin(particle.wobblePhase * 2) * 0.1);
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ VISUAL CHARACTERISTICS
    // └─────────────────────────────────────────────────────────────────────────────────
    visuals: {
        trailLength: 'short', // Short trails for bubbly feel
        opacity: 0.6, // Semi-transparent like bubbles
        sizeMultiplier: 1.2, // Slightly larger for bubble effect
        blurAmount: 0.5, // Soft, bubble-like appearance
        sparkle: true, // Occasional sparkle effect
    },
};
