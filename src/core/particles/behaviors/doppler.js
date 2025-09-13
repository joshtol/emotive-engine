/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Doppler Particle Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Doppler effect particle behavior - creates wavelike patterns
 * @author Emotive Engine Team
 * @module particles/behaviors/doppler
 */

/**
 * DOPPLER BEHAVIOR
 * Creates a wave-like doppler effect with particles appearing to compress
 * and expand as they move, simulating sound or energy waves
 * 
 * Visual characteristics:
 * • Particles emit in waves from the center
 * • Wave compression/expansion based on velocity
 * • Color shift based on approach/retreat (blue/red shift)
 * • Size modulation for depth perception
 */

export default {
    name: 'doppler',
    
    /**
     * Initialize doppler-specific properties
     * @param {Particle} particle - The particle to initialize
     * @param {Object} emotionConfig - Emotion configuration
     */
    initialize(particle, emotionConfig) {
        // Wave properties - standard doppler wave effect
        particle.wavePhase = Math.random() * Math.PI * 2; // Random starting phase
        particle.waveFrequency = 0.5 + Math.random() * 1.5; // Wave frequency variation
        particle.waveAmplitude = 20 + Math.random() * 40; // Wave amplitude
        
        // Doppler properties
        particle.emitTime = performance.now(); // When particle was emitted
        particle.waveIndex = Math.floor(Math.random() * 3); // Which wave group (0-2)
        particle.compressionFactor = 1.0; // Wave compression/expansion
        
        // Movement properties - standard doppler speed
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = 30 + Math.random() * 50;
        particle.baseVx = Math.cos(angle) * baseSpeed;
        particle.baseVy = Math.sin(angle) * baseSpeed;
        
        // Set initial velocity with wave modulation
        particle.vx = particle.baseVx;
        particle.vy = particle.baseVy;
        
        // Visual properties
        particle.baseSize = particle.size;
        particle.baseOpacity = particle.opacity;
        
        // Use emotion colors if provided
        if (particle.emotionColors && particle.emotionColors.length > 0) {
            // Simple weighted color selection inline
            const totalWeight = particle.emotionColors.reduce((sum, c) => sum + (c.weight || 1), 0);
            let random = Math.random() * totalWeight;
            for (const colorOption of particle.emotionColors) {
                random -= (colorOption.weight || 1);
                if (random <= 0) {
                    particle.color = colorOption.color;
                    break;
                }
            }
        }
        
        // Store original color for shift calculations
        particle.baseColor = particle.color;
    },
    
    /**
     * Update doppler particle behavior
     * @param {Particle} particle - The particle to update
     * @param {number} dt - Delta time
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     */
    update(particle, dt, centerX, centerY) {
        // Calculate distance from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate radial velocity (positive = moving away, negative = approaching)
        const radialVelocity = (dx * particle.vx + dy * particle.vy) / (distance + 0.01);
        
        // Time since emission
        const elapsed = (performance.now() - particle.emitTime) / 1000;
        
        // Wave progression
        const waveProgress = elapsed * particle.waveFrequency;
        
        // Apply wave pattern to velocity
        const waveModulation = Math.sin(particle.wavePhase + waveProgress * Math.PI * 2);
        
        // Compress/expand waves based on velocity (doppler effect)
        particle.compressionFactor = 1.0 + (radialVelocity / 100) * 0.5;
        
        // Modulate velocity with wave pattern
        const speedMod = 1.0 + waveModulation * 0.3 * particle.compressionFactor;
        particle.vx = particle.baseVx * speedMod;
        particle.vy = particle.baseVy * speedMod;
        
        // Add perpendicular wave motion for spiral effect
        const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
        const perpMotion = Math.sin(waveProgress * Math.PI * 4) * particle.waveAmplitude * 0.5;
        particle.vx += Math.cos(perpAngle) * perpMotion * dt;
        particle.vy += Math.sin(perpAngle) * perpMotion * dt;
        
        // Apply doppler color shift (blue for approaching, red for receding)
        if (particle.baseColor) {
            const colorShift = radialVelocity / 50; // Normalize to -1 to 1 range
            // This would need proper color manipulation, simplified here
            // Blue shift for negative radial velocity (approaching)
            // Red shift for positive radial velocity (receding)
            particle.colorShift = colorShift;
        }
        
        // Size modulation based on wave compression
        particle.size = particle.baseSize * (1.0 + waveModulation * 0.2) * particle.compressionFactor;
        
        // Opacity modulation for wave effect
        const opacityWave = Math.sin(waveProgress * Math.PI * 6 + particle.wavePhase);
        particle.opacity = particle.baseOpacity * (0.7 + opacityWave * 0.3);
        
        // Create wave groups that travel together
        if (particle.waveIndex === 0) {
            // Lead wave - slightly faster
            particle.vx *= 1.1;
            particle.vy *= 1.1;
        } else if (particle.waveIndex === 2) {
            // Trail wave - slightly slower
            particle.vx *= 0.9;
            particle.vy *= 0.9;
        }
        
        // Gradual expansion as waves propagate
        const expansionRate = 1.0 + elapsed * 0.1;
        particle.vx *= expansionRate;
        particle.vy *= expansionRate;
        
        // Reduce life faster for outer particles (wave dissipation)
        // Commenting out as this might be killing particles too quickly
        // if (distance > 150) {
        //     particle.lifeDecay = 0.8 + (distance / 300) * 0.4;
        // }
    }
};