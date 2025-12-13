/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Morph Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Morph gesture - form geometric patterns
 * @author Emotive Engine Team
 * @module gestures/transforms/morph
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Transforms the particle cloud into geometric shapes like circles, stars,          
 * ║ hearts, or other patterns. This is an OVERRIDE gesture that moves particles       
 * ║ to specific positions to form recognizable shapes.                                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Random Cloud      →      Star Pattern      →      Heart Pattern
 *      · · ·                    ★                         ♥♥
 *     · · · ·          →      ·   ·           →         ♥   ♥
 *      · · ·                ·   ★   ·                  ♥     ♥
 *                             ·   ·                      ♥   ♥
 *                               ★                          ♥
 * 
 * USED BY:
 * - Love emotions (heart shape)
 * - Magic/special effects (star patterns)
 * - Achievement celebrations (trophy/medal shapes)
 * - Transitions between states
 */

/**
 * Morph gesture configuration and implementation
 */
export default {
    name: 'morph',
    emoji: '✨',
    type: 'override', // Completely replaces motion
    description: 'Form geometric patterns and shapes',
    
    // Default configuration
    config: {
        // Musical duration - morph over 2 beats
        musicalDuration: {
            musical: true,
            beats: 2,          // Default to half a bar
            minBeats: 1,       // Minimum quarter note
            maxBeats: 8        // Maximum 2 bars
        },
        
        // Musical phases of the morph
        phases: [
            { name: 'gather', beats: 0.25 },    // Particles gather
            { name: 'form', beats: 0.75 },      // Form the shape
            { name: 'hold', beats: 0.5 },       // Hold the shape
            { name: 'dissolve', beats: 0.5 }    // Dissolve back
        ],
        
        morphType: 'fluid',     // Type of morph animation
        pattern: 'star',        // Shape to morph into
        points: 5,              // Number of points (for star/polygon)
        innerRadius: 0.4,       // Inner radius ratio (for star)
        size: 80,               // Base size of the pattern
        amplitude: 20,          // Motion amplitude
        rotation: 0,            // Rotation angle in degrees
        smooth: true,           // Smooth movement to positions
        randomizeOrder: false,  // Randomize which particles go where
        easing: 'sine',         // Animation curve type
        strength: 1.2,          // Formation strength
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'morph',
            pattern: 'star',
            strength: 1.2,
            smooth: true,
            points: 5
        }
    },
    
    // Rhythm configuration - morphs on musical phrases
    rhythm: {
        enabled: true,
        syncMode: 'phrase',  // Morph on musical phrases
        
        // Pattern changes with musical structure
        patternSync: {
            verse: 'circle',          // Simple shape for verse
            chorus: 'star',           // Complex shape for chorus
            bridge: 'heart',          // Special shape for bridge
            drop: 'explosion'         // Dramatic for drops
        },
        
        // Morph timing syncs to measures
        timingSync: {
            formationBeat: 1,         // Start forming on beat 1
            holdBeats: 2,             // Hold shape for 2 beats
            dissolveBeat: 4,          // Dissolve on beat 4
            curve: 'anticipatory'     // Ease into formation
        },
        
        // Size pulses with rhythm
        sizeSync: {
            onBeat: 1.2,              // Expand on beat
            offBeat: 0.95,            // Contract off beat
            subdivision: 'quarter',    // Pulse every quarter note
            curve: 'elastic'          // Bouncy expansion
        },
        
        // Rotation syncs to bars
        rotationSync: {
            mode: 'continuous',       // Continuous rotation
            degreesPerBar: 90,        // Rotate 90° per bar
            direction: 'clockwise'    // Rotation direction
        },
        
        // Musical dynamics affect complexity
        dynamics: {
            forte: { points: 8, size: 100 },    // Complex shapes when loud
            piano: { points: 3, size: 60 }      // Simple shapes when soft
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     * @param {EmotiveMascot} mascot - The mascot instance for core morphing
     */
    initialize(particle, motion, centerX, centerY, _mascot) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const config = { ...this.config, ...motion };
        
        // Store original position
        const startX = particle.x;
        const startY = particle.y;
        
        // Calculate angle from center for position assignment
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        
        // Random rotation direction for the pattern
        const rotationDirection = Math.random() < 0.5 ? 1 : -1;
        
        // Calculate target position based on pattern
        let targetX, targetY;
        const size = config.size * particle.scaleFactor;
        const rotation = ((config.rotation || 0) * Math.PI / 180) * rotationDirection;
        
        switch (config.pattern) {
        case 'star':
            targetX = centerX;
            targetY = centerY;
            this.calculateStarPosition(particle, angle, size, config.points, config.innerRadius, rotation, centerX, centerY);
            break;
                
        case 'heart':
            this.calculateHeartPosition(particle, angle, size, rotation, centerX, centerY);
            break;
                
        case 'square':
            this.calculateSquarePosition(particle, angle, size, rotation, centerX, centerY);
            break;
                
        case 'triangle':
            this.calculateTrianglePosition(particle, angle, size, rotation, centerX, centerY);
            break;
                
        case 'circle':
        default: {
            // Simple circle pattern
            const targetRadius = size;
            targetX = centerX + Math.cos(angle + rotation) * targetRadius;
            targetY = centerY + Math.sin(angle + rotation) * targetRadius;
            break;
        }
        }
        
        particle.gestureData.morph = {
            startX,
            startY,
            targetX: particle.gestureData.morphTargetX || targetX,
            targetY: particle.gestureData.morphTargetY || targetY,
            originalVx: particle.vx,
            originalVy: particle.vy,
            rotationDirection, // Store random rotation direction
            initialized: true
        };
    },
    
    /**
     * Calculate star pattern position - mathematically correct 5-pointed star
     */
    calculateStarPosition(particle, angle, size, points, innerRadius, rotation, centerX, centerY) {
        // Create a proper 5-pointed star using mathematical formula
        // A 5-pointed star has 5 outer points and 5 inner valleys
        
        // Normalize angle to 0-2π
        const normalizedAngle = ((angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        
        // For a 5-pointed star, we need to map to 10 positions
        // Positions 0,2,4,6,8 are outer points (tips)
        // Positions 1,3,5,7,9 are inner points (valleys)
        
        const totalPositions = 10; // Always 10 for a 5-pointed star
        const positionIndex = Math.floor((normalizedAngle / (Math.PI * 2)) * totalPositions);
        
        // Determine if this is an outer point (tip) or inner point (valley)
        const isOuterPoint = positionIndex % 2 === 0;
        const armIndex = Math.floor(positionIndex / 2);
        
        // Calculate the angle for this position
        // Outer points are at: 0°, 72°, 144°, 216°, 288°
        // Inner points are at: 36°, 108°, 180°, 252°, 324°
        let targetAngle;
        
        if (isOuterPoint) {
            // Outer point (tip of star)
            targetAngle = (armIndex * 72) * Math.PI / 180; // 72° = 360°/5
        } else {
            // Inner point (valley between arms)
            targetAngle = ((armIndex * 72) + 36) * Math.PI / 180; // 36° = 72°/2
        }
        
        // Apply rotation
        targetAngle += rotation;
        
        // Use appropriate radius
        const radius = isOuterPoint ? size : size * innerRadius;
        
        particle.gestureData.morphTargetX = centerX + Math.cos(targetAngle) * radius;
        particle.gestureData.morphTargetY = centerY + Math.sin(targetAngle) * radius;
    },
    
    /**
     * Calculate heart pattern position
     */
    calculateHeartPosition(particle, angle, size, rotation, centerX, centerY) {
        // Map angle to heart curve parameter
        const t = (angle + Math.PI) / (Math.PI * 2);
        
        // Heart parametric equations
        const scale = size * 0.05;
        const x = 16 * Math.pow(Math.sin(t * Math.PI * 2), 3);
        const y = -(13 * Math.cos(t * Math.PI * 2) - 5 * Math.cos(2 * t * Math.PI * 2) - 
                  2 * Math.cos(3 * t * Math.PI * 2) - Math.cos(4 * t * Math.PI * 2));
        
        // Scale and rotate
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const rotX = x * cosR - y * sinR;
        const rotY = x * sinR + y * cosR;
        
        particle.gestureData.morphTargetX = centerX + rotX * scale;
        particle.gestureData.morphTargetY = centerY + rotY * scale;
    },
    
    /**
     * Calculate square pattern position
     */
    calculateSquarePosition(particle, angle, size, rotation, centerX, centerY) {
        // Determine which edge the particle should go to
        const rotatedAngle = angle + rotation;
        const normalizedAngle = ((rotatedAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        
        let x, y;
        const halfSize = size;
        
        // Map to square edges
        if (normalizedAngle < Math.PI / 4 || normalizedAngle >= 7 * Math.PI / 4) {
            // Right edge
            x = halfSize;
            y = halfSize * Math.tan(normalizedAngle);
        } else if (normalizedAngle < 3 * Math.PI / 4) {
            // Top edge
            x = halfSize / Math.tan(normalizedAngle);
            y = halfSize;
        } else if (normalizedAngle < 5 * Math.PI / 4) {
            // Left edge
            x = -halfSize;
            y = -halfSize * Math.tan(normalizedAngle);
        } else {
            // Bottom edge
            x = -halfSize / Math.tan(normalizedAngle);
            y = -halfSize;
        }
        
        // Apply rotation
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const rotX = x * cosR - y * sinR;
        const rotY = x * sinR + y * cosR;
        
        particle.gestureData.morphTargetX = centerX + rotX;
        particle.gestureData.morphTargetY = centerY + rotY;
    },
    
    /**
     * Calculate triangle pattern position
     */
    calculateTrianglePosition(particle, angle, size, rotation, centerX, centerY) {
        // Three vertices of equilateral triangle
        const vertices = [
            { x: 0, y: -size },                    // Top
            { x: -size * 0.866, y: size * 0.5 },   // Bottom left
            { x: size * 0.866, y: size * 0.5 }     // Bottom right
        ];
        
        // Determine which edge the particle should go to
        const edgeIndex = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 3) % 3;
        const nextIndex = (edgeIndex + 1) % 3;
        
        // Position along the edge
        const edgeProgress = Math.random();
        const x = vertices[edgeIndex].x + (vertices[nextIndex].x - vertices[edgeIndex].x) * edgeProgress;
        const y = vertices[edgeIndex].y + (vertices[nextIndex].y - vertices[edgeIndex].y) * edgeProgress;
        
        // Apply rotation
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const rotX = x * cosR - y * sinR;
        const rotY = x * sinR + y * cosR;
        
        particle.gestureData.morphTargetX = centerX + rotX;
        particle.gestureData.morphTargetY = centerY + rotY;
    },
    
    /**
     * Apply morph motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.morph?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.morph;
        const config = { ...this.config, ...motion };
        
        // Calculate eased progress
        let morphProgress = progress;
        
        // Add hold time at the shape
        if (config.holdTime > 0) {
            const holdStart = 0.5 - config.holdTime / 2;
            const holdEnd = 0.5 + config.holdTime / 2;
            
            if (progress < holdStart) {
                morphProgress = progress / holdStart * 0.5;
            } else if (progress < holdEnd) {
                morphProgress = 0.5; // Hold at shape
            } else {
                morphProgress = 0.5 + (progress - holdEnd) / (1 - holdEnd) * 0.5;
            }
        }
        
        // Calculate interpolated position
        let targetX, targetY;
        
        if (morphProgress <= 0.5) {
            // Moving to shape
            const moveProgress = morphProgress * 2;
            targetX = data.startX + (data.targetX - data.startX) * this.easeOutQuad(moveProgress);
            targetY = data.startY + (data.targetY - data.startY) * this.easeOutQuad(moveProgress);
        } else {
            // Returning from shape
            const returnProgress = (morphProgress - 0.5) * 2;
            targetX = data.targetX + (data.startX - data.targetX) * this.easeInQuad(returnProgress);
            targetY = data.targetY + (data.startY - data.targetY) * this.easeInQuad(returnProgress);
        }
        
        // Apply position
        if (config.smooth) {
            // Smooth movement
            const moveSpeed = 0.2;
            particle.x += (targetX - particle.x) * moveSpeed;
            particle.y += (targetY - particle.y) * moveSpeed;
        } else {
            // Direct positioning
            particle.x = targetX;
            particle.y = targetY;
        }
        
        // Set velocity for trails
        particle.vx = (targetX - particle.x) * 0.5;
        particle.vy = (targetY - particle.y) * 0.5;
        
        // Restore original velocities at the end
        if (progress > 0.9) {
            const blendFactor = (1 - progress) * 10;
            particle.vx = particle.vx * blendFactor + data.originalVx * (1 - blendFactor);
            particle.vy = particle.vy * blendFactor + data.originalVy * (1 - blendFactor);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.morph) {
            const data = particle.gestureData.morph;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.morph;
            delete particle.gestureData.morphTargetX;
            delete particle.gestureData.morphTargetY;
        }
    },
    
    /**
     * Easing functions
     */
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    easeInQuad(t) {
        return t * t;
    },

    /**
     * 3D translation for WebGL rendering
     * Creates morphing visual effect through scale, rotation, and glow modulation
     * Works independently of particle system - pure time-based transforms
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} Transform with position, rotation, scale, glowIntensity, glowBoost
         */
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Morph has two phases: formation (0-0.5) and dissolution (0.5-1)
            // Use smooth envelope that peaks at 0.5
            const envelope = Math.sin(progress * Math.PI); // 0 → 1 → 0

            // Dramatic scale transformation - expand during formation, contract during return
            // Creates visual "morphing" effect without needing particle positions
            let scaleEffect;
            if (progress <= 0.5) {
                // Formation phase: scale up smoothly
                const formProgress = progress * 2;
                const eased = formProgress * (2 - formProgress); // easeOutQuad
                scaleEffect = 1.0 + eased * 0.25 * strength;
            } else {
                // Dissolution phase: scale back down
                const dissolveProgress = (progress - 0.5) * 2;
                const eased = dissolveProgress * dissolveProgress; // easeInQuad
                scaleEffect = 1.25 * strength + (1.0 - 1.25 * strength) * eased;
                // Normalize to prevent overshooting
                scaleEffect = Math.max(1.0, scaleEffect);
            }

            // Rotation creates sense of transformation/dimensionality
            // Y-axis rotation for 3D feel, peaks at formation
            const yRotation = envelope * Math.PI * 0.3 * strength;

            // Slight Z rotation for visual interest
            const zRotation = Math.sin(progress * Math.PI * 2) * 0.1 * strength;

            // Glow intensifies during morph peak
            const glowIntensity = 1.0 + envelope * 0.4 * strength;

            // Strong glow boost at formation peak for dramatic effect
            const glowBoost = envelope * 1.5 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, yRotation, zRotation],
                scale: scaleEffect,
                glowIntensity,
                glowBoost
            };
        }
    }
};