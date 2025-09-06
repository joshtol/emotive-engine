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
        duration: 1000,         // Animation duration (from gestureConfig)
        morphType: 'fluid',     // Type of morph animation (from gestureConfig)
        pattern: 'star',        // Shape to morph into (was circle, now star from config)
        points: 5,              // Number of points (for star/polygon)
        innerRadius: 0.4,       // Inner radius ratio (for star)
        size: 80,               // Base size of the pattern
        amplitude: 20,          // From gestureConfig
        rotation: 0,            // Rotation angle in degrees
        smooth: true,           // Smooth movement to positions
        randomizeOrder: false,  // Randomize which particles go where
        holdTime: 0.3,         // Time to hold the shape (0-1)
        easing: 'sine',
        strength: 1.2,          // Strong formation (from gestureConfig)
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'morph',
            pattern: 'star',
            strength: 1.2,
            smooth: true,
            points: 5
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const config = { ...this.config, ...motion };
        
        // Store original position
        const startX = particle.x;
        const startY = particle.y;
        
        // Calculate angle from center for position assignment
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        
        // Calculate target position based on pattern
        let targetX, targetY;
        const size = config.size * particle.scaleFactor;
        const rotation = (config.rotation || 0) * Math.PI / 180;
        
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
            default:
                // Simple circle pattern
                const targetRadius = size;
                targetX = centerX + Math.cos(angle + rotation) * targetRadius;
                targetY = centerY + Math.sin(angle + rotation) * targetRadius;
                break;
        }
        
        particle.gestureData.morph = {
            startX: startX,
            startY: startY,
            targetX: particle.gestureData.morphTargetX || targetX,
            targetY: particle.gestureData.morphTargetY || targetY,
            originalVx: particle.vx,
            originalVy: particle.vy,
            initialized: true
        };
    },
    
    /**
     * Calculate star pattern position
     */
    calculateStarPosition: function(particle, angle, size, points, innerRadius, rotation, centerX, centerY) {
        const armAngle = (Math.PI * 2) / points;
        const nearestArm = Math.round(angle / armAngle) * armAngle;
        const armIndex = Math.round(angle / armAngle) % points;
        const isOuter = Math.random() > 0.5; // Distribute between inner and outer points
        
        let radius;
        let targetAngle;
        
        if (isOuter) {
            // Outer point of star
            radius = size;
            targetAngle = armIndex * armAngle + rotation;
        } else {
            // Inner point of star (between arms)
            radius = size * innerRadius;
            targetAngle = armIndex * armAngle + armAngle * 0.5 + rotation;
        }
        
        particle.gestureData.morphTargetX = centerX + Math.cos(targetAngle) * radius;
        particle.gestureData.morphTargetY = centerY + Math.sin(targetAngle) * radius;
    },
    
    /**
     * Calculate heart pattern position
     */
    calculateHeartPosition: function(particle, angle, size, rotation, centerX, centerY) {
        // Map angle to heart curve parameter
        const t = (angle + Math.PI) / (Math.PI * 2);
        
        // Heart parametric equations
        const scale = size * 0.05;
        let x = 16 * Math.pow(Math.sin(t * Math.PI * 2), 3);
        let y = -(13 * Math.cos(t * Math.PI * 2) - 5 * Math.cos(2 * t * Math.PI * 2) - 
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
    calculateSquarePosition: function(particle, angle, size, rotation, centerX, centerY) {
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
    calculateTrianglePosition: function(particle, angle, size, rotation, centerX, centerY) {
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
    apply: function(particle, progress, motion, dt, centerX, centerY) {
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
        
        const easeProgress = this.easeInOutCubic(morphProgress);
        
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
    cleanup: function(particle) {
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
    easeInOutCubic: function(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutQuad: function(t) {
        return t * (2 - t);
    },
    
    easeInQuad: function(t) {
        return t * t;
    }
};