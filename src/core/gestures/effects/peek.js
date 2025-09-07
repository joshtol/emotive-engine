/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Peek Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Quick peek/hide motion for suspicious checking behavior
 * @author Emotive Engine Team
 * @module gestures/effects/peek
 * 
 * GESTURE TYPE:
 * type: 'effect' - Visual effect without changing core position
 * 
 * VISUAL EFFECT:
 * Particles quickly expand outward (peeking) then contract back (hiding),
 * like peeking around a corner or quickly checking surroundings.
 */

export default {
    name: 'peek',
    emoji: '👀',
    type: 'effect',
    description: 'Quick peek and hide motion',
    
    // Default configuration
    config: {
        peekDistance: 40,       // How far to peek out
        peekSpeed: 0.15,        // Speed of peek motion
        holdDuration: 200,      // How long to hold peek position (ms)
        hideSpeed: 0.25,        // Speed of hiding (faster than peeking)
        stagger: true,          // Stagger particle peeks
        duration: 1500          // Total animation duration
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize peek data if needed
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        if (!particle.gestureData.peek) {
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            particle.gestureData.peek = {
                originalX: particle.x,
                originalY: particle.y,
                peekAngle: angle,
                originalDistance: distance,
                staggerDelay: this.config.stagger ? Math.random() * 0.3 : 0,
                phase: 'waiting',  // 'waiting', 'peeking', 'holding', 'hiding'
                phaseTimer: 0,
                peekOffset: { x: 0, y: 0 }
            };
        }
        
        const data = particle.gestureData.peek;
        const config = this.config;
        
        // Adjust progress for stagger
        const adjustedProgress = Math.max(0, Math.min(1, (progress - data.staggerDelay) / (1 - data.staggerDelay)));
        
        // Determine phase based on progress
        if (adjustedProgress === 0) {
            data.phase = 'waiting';
        } else if (adjustedProgress < 0.3) {
            data.phase = 'peeking';
        } else if (adjustedProgress < 0.6) {
            data.phase = 'holding';
        } else if (adjustedProgress < 1) {
            data.phase = 'hiding';
        }
        
        // Calculate peek offset based on phase
        let targetOffset = 0;
        
        switch (data.phase) {
            case 'peeking':
                // Smooth peek out
                const peekProgress = adjustedProgress / 0.3;
                targetOffset = this.easeOutCubic(peekProgress) * config.peekDistance;
                break;
                
            case 'holding':
                // Hold at peek position
                targetOffset = config.peekDistance;
                // Add slight tremor while holding
                if (Math.random() < 0.1) {
                    data.peekOffset.x += (Math.random() - 0.5) * 2;
                    data.peekOffset.y += (Math.random() - 0.5) * 2;
                }
                break;
                
            case 'hiding':
                // Quick hide back
                const hideProgress = (adjustedProgress - 0.6) / 0.4;
                targetOffset = (1 - this.easeInCubic(hideProgress)) * config.peekDistance;
                break;
        }
        
        // Apply the peek offset
        if (data.phase !== 'waiting') {
            const peekX = Math.cos(data.peekAngle) * targetOffset;
            const peekY = Math.sin(data.peekAngle) * targetOffset;
            
            // Smooth transition to target position
            data.peekOffset.x += (peekX - data.peekOffset.x) * config.peekSpeed;
            data.peekOffset.y += (peekY - data.peekOffset.y) * config.peekSpeed;
            
            // Apply offset to particle
            particle.x = data.originalX + data.peekOffset.x;
            particle.y = data.originalY + data.peekOffset.y;
        }
        
        // Add opacity effect - slightly fade during peek
        if (particle.alpha !== undefined) {
            if (data.phase === 'peeking' || data.phase === 'holding') {
                particle.alpha = 0.7 + Math.random() * 0.3;  // Flickering visibility
            } else {
                particle.alpha = 1.0;
            }
        }
    },
    
    // Easing functions
    easeOutCubic: function(t) {
        return 1 - Math.pow(1 - t, 3);
    },
    
    easeInCubic: function(t) {
        return t * t * t;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.peek) {
            // Restore original position
            particle.x = particle.gestureData.peek.originalX;
            particle.y = particle.gestureData.peek.originalY;
            if (particle.alpha !== undefined) {
                particle.alpha = 1.0;
            }
            delete particle.gestureData.peek;
        }
    }
};