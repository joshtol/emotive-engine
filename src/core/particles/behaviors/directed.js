/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Directed Particle Behavior
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Directed behavior - particles move in focused, straight paths
 * @author Emotive Engine Team
 * @module particles/behaviors/directed
 */

/**
 * DIRECTED BEHAVIOR - FOCUSED STRAIGHT PATHS
 * Used by: focused emotion
 *
 * Particles move in deliberate, straight lines toward a target or direction,
 * representing intense concentration and focus.
 */
export default {
    name: 'directed',
    emoji: '🎯',
    description: 'Focused, straight-line movement toward target',

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ CONFIGURATION
    // └─────────────────────────────────────────────────────────────────────────────────
    config: {
        speed: 3.0, // Fast movement
        acceleration: 0.15, // Quick acceleration
        focusStrength: 0.8, // Strong pull toward target
        randomness: 0.1, // Minimal deviation
        edgeBuffer: 50, // Buffer from canvas edges
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ INITIALIZATION
    // └─────────────────────────────────────────────────────────────────────────────────
    initialize(particle, centerX, centerY, _canvasWidth, _canvasHeight) {
        // Set initial direction toward center
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            particle.vx = (dx / distance) * this.config.speed;
            particle.vy = (dy / distance) * this.config.speed;
        } else {
            // Random initial direction if at center
            const angle = Math.random() * Math.PI * 2;
            particle.vx = Math.cos(angle) * this.config.speed;
            particle.vy = Math.sin(angle) * this.config.speed;
        }

        // Store target position
        particle.targetX = centerX;
        particle.targetY = centerY;
        particle.directedPhase = 0;
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ UPDATE LOOP
    // └─────────────────────────────────────────────────────────────────────────────────
    update(particle, dt, centerX, centerY, canvasWidth, canvasHeight) {
        // Update phase for variation
        particle.directedPhase += dt * 0.05;

        // Calculate direction to target
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            // Move toward target with focus strength
            const targetVx = (dx / distance) * this.config.speed;
            const targetVy = (dy / distance) * this.config.speed;

            // Apply acceleration toward target velocity
            particle.vx += (targetVx - particle.vx) * this.config.acceleration * dt;
            particle.vy += (targetVy - particle.vy) * this.config.acceleration * dt;

            // Add minimal randomness for organic feel
            particle.vx += (Math.random() - 0.5) * this.config.randomness;
            particle.vy += (Math.random() - 0.5) * this.config.randomness;
        } else {
            // Near target, pick new target
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * 200;
            particle.targetX = centerX + Math.cos(angle) * radius;
            particle.targetY = centerY + Math.sin(angle) * radius;

            // Keep within canvas bounds
            particle.targetX = Math.max(
                this.config.edgeBuffer,
                Math.min(canvasWidth - this.config.edgeBuffer, particle.targetX)
            );
            particle.targetY = Math.max(
                this.config.edgeBuffer,
                Math.min(canvasHeight - this.config.edgeBuffer, particle.targetY)
            );
        }

        // Apply velocity
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;

        // Edge bouncing with dampening
        if (particle.x <= 0 || particle.x >= canvasWidth) {
            particle.vx *= -0.8;
            particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
            // Pick new target after bounce
            particle.targetX = centerX + (Math.random() - 0.5) * 300;
        }
        if (particle.y <= 0 || particle.y >= canvasHeight) {
            particle.vy *= -0.8;
            particle.y = Math.max(0, Math.min(canvasHeight, particle.y));
            // Pick new target after bounce
            particle.targetY = centerY + (Math.random() - 0.5) * 300;
        }
    },

    // ┌─────────────────────────────────────────────────────────────────────────────────
    // │ VISUAL CHARACTERISTICS
    // └─────────────────────────────────────────────────────────────────────────────────
    visuals: {
        trailLength: 'medium', // Medium trail for motion clarity
        opacity: 0.9, // High opacity for focus
        sizeMultiplier: 1.0, // Standard size
        blurAmount: 0.2, // Sharp, focused appearance
    },
};
