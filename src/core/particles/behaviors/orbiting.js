/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbiting Behavior
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Romantic orbiting behavior for love emotional state
 * @author Emotive Engine Team
 * @module particles/behaviors/orbiting
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a romantic atmosphere with particles orbiting the orb like fireflies      
 * ║ dancing at a valentine's day party. Features individual blinking and sparkles.    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ✨     ✨
 *      💕  ╭───╮  💕    ← particles orbit & sparkle
 *    ✨   │  ⭐  │   ✨   ← orb center
 *      💕  ╰───╯  💕
 *        ✨     ✨
 * 
 * USED BY EMOTIONS:
 * - love (romantic valentine vibes)
 * 
 * RECIPE TO MODIFY:
 * - Increase angularVelocity for faster spinning
 * - Increase floatAmount for more vertical movement
 * - Adjust blinkSpeed for different firefly effects
 * - Increase baseRadius for wider orbits
 */

import { selectWeightedColor } from '../utils/colorUtils.js';
import { PHYSICS } from '../config/physics.js';

/**
 * Initialize orbiting behavior for a particle
 * Creates valentine fireflies with individual timing
 * 
 * @param {Particle} particle - The particle to initialize
 */
export function initializeOrbiting(particle) {
    // Individual fade timing - each particle has its own lifespan
    particle.lifeDecay = 0.001 + Math.random() * 0.002;  // Variable decay (0.001-0.003)
    
    // Use emotion colors if provided - glittery valentine palette
    if (particle.emotionColors && particle.emotionColors.length > 0) {
        particle.color = selectWeightedColor(particle.emotionColors);
    }
    
    // Check if this is a lighter/sparkle color (light pinks)
    particle.isSparkle = particle.color === '#FFE4E1' || 
                        particle.color === '#FFCCCB' || 
                        particle.color === '#FFC0CB';
    
    // Particles orbit at various distances for depth
    const orbRadius = (particle.scaleFactor || 1) * 40; // Approximate orb size
    const depthLayer = Math.random();
    const baseRadius = orbRadius * (1.3 + depthLayer * 0.9); // 1.3x to 2.2x orb radius
    
    // Glitter firefly properties - each with unique timing
    particle.blinkPhase = Math.random() * PHYSICS.TWO_PI; // Random starting phase
    particle.blinkSpeed = 0.3 + Math.random() * 1.2; // Varied blink speeds (0.3-1.5)
    particle.blinkIntensity = 0.6 + Math.random() * 0.4; // How bright the blink gets
    
    // Individual fade properties
    particle.fadePhase = Math.random() * PHYSICS.TWO_PI; // Random fade starting phase
    particle.fadeSpeed = 0.1 + Math.random() * 0.3; // Different fade speeds
    particle.minOpacity = 0.2 + Math.random() * 0.2; // Min brightness varies (0.2-0.4)
    particle.maxOpacity = 0.8 + Math.random() * 0.2; // Max brightness varies (0.8-1.0)
    
    // Sparkles have different properties
    if (particle.isSparkle) {
        particle.blinkSpeed *= 2; // Sparkles blink faster
        particle.blinkIntensity = 1.0; // Full intensity sparkles
        particle.minOpacity = 0; // Can fade to nothing
        particle.maxOpacity = 1.0; // Can be fully bright
    }
    
    particle.behaviorData = {
        angle: Math.random() * PHYSICS.TWO_PI,
        radius: baseRadius,
        baseRadius: baseRadius,
        angularVelocity: 0.0008 + Math.random() * 0.0017,  // Varied rotation speeds
        swayAmount: 3 + Math.random() * 7,  // Gentle floating sway
        swaySpeed: 0.2 + Math.random() * 0.5,  // Varied sway rhythm
        floatOffset: Math.random() * PHYSICS.TWO_PI,  // Random vertical float phase
        floatSpeed: 0.3 + Math.random() * 0.7,  // Varied vertical floating speed
        floatAmount: 2 + Math.random() * 6,  // How much they float up/down
        twinklePhase: Math.random() * PHYSICS.TWO_PI,  // Individual twinkle timing
        twinkleSpeed: 2 + Math.random() * 3  // Fast twinkle for glitter effect
    };
}

/**
 * Update orbiting behavior each frame
 * Creates romantic firefly dance with sparkles
 * 
 * @param {Particle} particle - The particle to update
 * @param {number} dt - Delta time (frame time)
 * @param {number} centerX - Orb center X position
 * @param {number} centerY - Orb center Y position
 */
export function updateOrbiting(particle, dt, centerX, centerY) {
    const data = particle.behaviorData;
    
    // Slow romantic rotation around the orb
    data.angle += data.angularVelocity * dt;
    
    // Gentle swaying motion
    const swayOffset = Math.sin(data.angle * data.swaySpeed) * data.swayAmount;
    
    // Radius changes for breathing effect
    const radiusPulse = Math.sin(data.angle * 1.5) * 6;
    const currentRadius = data.baseRadius + radiusPulse + swayOffset * 0.2;
    
    // Calculate orbital position
    particle.x = centerX + Math.cos(data.angle) * currentRadius;
    particle.y = centerY + Math.sin(data.angle) * currentRadius;
    
    // Add gentle vertical floating (like fireflies)
    data.floatOffset += data.floatSpeed * dt * 0.001;
    const verticalFloat = Math.sin(data.floatOffset) * data.floatAmount;
    particle.y += verticalFloat;
    
    // Update individual fade phase
    particle.fadePhase += particle.fadeSpeed * dt * 0.001;
    
    // Calculate individual particle fade (independent timing)
    const fadeValue = Math.sin(particle.fadePhase) * 0.5 + 0.5; // 0 to 1
    const fadeOpacity = particle.minOpacity + (particle.maxOpacity - particle.minOpacity) * fadeValue;
    
    // Firefly blinking effect
    particle.blinkPhase += particle.blinkSpeed * dt * 0.002;
    
    // Create a complex glitter blink with multiple harmonics
    let blinkValue;
    if (particle.isSparkle) {
        // Sparkles have sharp, dramatic twinkles
        data.twinklePhase += data.twinkleSpeed * dt * 0.001;
        const twinkle = Math.pow(Math.sin(data.twinklePhase), 16); // Sharp peaks
        const shimmer = Math.sin(particle.blinkPhase * 5) * 0.2;
        blinkValue = twinkle * 0.7 + shimmer + 0.1;
    } else {
        // Regular particles have smoother, firefly-like pulses
        blinkValue = Math.sin(particle.blinkPhase) * 0.4 + 
                    Math.sin(particle.blinkPhase * 3) * 0.3 +
                    Math.sin(particle.blinkPhase * 7) * 0.2 +
                    Math.sin(particle.blinkPhase * 11) * 0.1; // Added harmonic
    }
    
    // Map to 0-1 range with intensity control
    const normalizedBlink = (blinkValue + 1) * 0.5; // Convert from -1,1 to 0,1
    const blink = 0.2 + normalizedBlink * particle.blinkIntensity * 0.8;
    
    // Combine individual fade with blink effect
    particle.opacity = particle.baseOpacity * fadeOpacity * blink;
    
    // Sparkles pulse size more dramatically
    if (particle.isSparkle) {
        particle.size = particle.baseSize * (0.5 + normalizedBlink * 1.0); // 50-150% size
    } else {
        particle.size = particle.baseSize * (0.8 + normalizedBlink * 0.3); // 80-110% size
    }
    
    // Add subtle color shift for sparkles (shimmer effect)
    if (particle.isSparkle) {
        // Light pink sparkles can shift to white at peak brightness
        if (normalizedBlink > 0.85) {
            particle.tempColor = '#FFFFFF'; // Flash white at peak for extra sparkle
        } else {
            particle.tempColor = particle.color;
        }
    }
}

// Export behavior definition for registry
export default {
    name: 'orbiting',
    emoji: '💕',
    description: 'Romantic firefly dance around the orb',
    initialize: initializeOrbiting,
    update: updateOrbiting
};