/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Excited Particle Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Excited emotion particle behavior - energetic but controlled
 * @author Emotive Engine Team
 * @module particles/behaviors/excited
 */

/**
 * EXCITED BEHAVIOR
 * Creates energetic particle movement that's enthusiastic but not chaotic
 * Based on doppler but with calmer parameters for the excited emotion
 * 
 * Visual characteristics:
 * • Moderate speed outward movement
 * • Gentle wave patterns
 * • Vibrant colors from emotion palette
 * • Moderate life span for good turnover
 */

export default {
    name: 'excited',
    
    /**
     * Initialize excited-specific properties
     * @param {Particle} particle - The particle to initialize
     * @param {Object} emotionConfig - Emotion configuration
     */
    initialize(particle, emotionConfig) {
        // Wave properties - calmer than standard doppler
        particle.wavePhase = Math.random() * Math.PI * 2;
        particle.waveFrequency = 0.2 + Math.random() * 0.3; // Slower waves: 0.2-0.5
        particle.waveAmplitude = 10 + Math.random() * 15; // Smaller amplitude: 10-25
        
        // Movement properties - energetic but controlled
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = 8 + Math.random() * 12; // Moderate speed: 8-20
        particle.vx = Math.cos(angle) * baseSpeed;
        particle.vy = Math.sin(angle) * baseSpeed;
        
        // Store base values
        particle.baseVx = particle.vx;
        particle.baseVy = particle.vy;
        particle.baseSize = particle.size;
        particle.baseOpacity = particle.opacity;
        
        // Use emotion colors if provided
        if (particle.emotionColors && particle.emotionColors.length > 0) {
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
        
        // Moderate life for good turnover
        particle.lifeDecay = 0.45; // Balanced decay rate
        
        // Excited-specific properties
        particle.excitementLevel = 0.7 + Math.random() * 0.3; // Variation in energy
        particle.emitTime = performance.now();
    },
    
    /**
     * Update excited particle behavior
     * @param {Particle} particle - The particle to update
     * @param {number} dt - Delta time
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     */
    update(particle, dt, centerX, centerY) {
        // Time since emission
        const elapsed = (performance.now() - particle.emitTime) / 1000;
        
        // Calculate distance from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Gentle wave pattern
        const waveProgress = elapsed * particle.waveFrequency;
        const waveModulation = Math.sin(particle.wavePhase + waveProgress * Math.PI * 2);
        
        // Moderate speed modulation
        const speedMod = 1.0 + waveModulation * 0.15 * particle.excitementLevel;
        particle.vx = particle.baseVx * speedMod;
        particle.vy = particle.baseVy * speedMod;
        
        // Subtle perpendicular motion for interest
        const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
        const perpMotion = Math.sin(waveProgress * Math.PI * 2) * particle.waveAmplitude * 0.1;
        particle.vx += Math.cos(perpAngle) * perpMotion * dt * 0.3;
        particle.vy += Math.sin(perpAngle) * perpMotion * dt * 0.3;
        
        // Very gentle expansion
        const expansionRate = 1.0 + elapsed * 0.02;
        particle.vx *= expansionRate;
        particle.vy *= expansionRate;
        
        // Size pulsation for excitement
        particle.size = particle.baseSize * (1.0 + Math.sin(elapsed * 3) * 0.1);
        
        // Gentle opacity wave
        const opacityWave = Math.sin(waveProgress * Math.PI * 4 + particle.wavePhase);
        particle.opacity = particle.baseOpacity * (0.8 + opacityWave * 0.2);
    }
};