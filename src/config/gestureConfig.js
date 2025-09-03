/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                         ◐ ◑ ◒ ◓  GESTURE CONFIG  ◓ ◒ ◑ ◐                         
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Gesture Configuration - Animation and Motion Parameters
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module GestureConfig
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This file defines BASE GESTURE ANIMATIONS for the orb and particles.              
 * ║ These get modified by emotions and undertones via GestureCompositor.              
 * ║ Think of these as "movement templates" that express actions.                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 SAFE TO MODIFY (Animation Feel)                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • duration      : Time in milliseconds (500-5000 typical)                         
 * │ • amplitude     : Movement distance in pixels (10-100)                            
 * │ • frequency     : Number of oscillations/bounces (1-5)                            
 * │ • easing        : Animation curve (sine/quad/cubic/elastic/bounce)                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚠️  MODIFY WITH CAUTION (Core Animation)                                          
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • scaleAmount   : Size change multiplier (0.1-0.5, affects visibility)            
 * │ • glowAmount    : Glow intensity change (0.1-1.0, affects brightness)             
 * │ • particleMotion: How particles respond to gesture (complex object)               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🚫 CRITICAL PARTICLE MOTION TYPES (Must match Particle.js)                        
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • oscillate  : Back-and-forth motion (bounce, nod)                                
 * │ • radial     : In/out from center (pulse, expand, contract)                       
 * │ • orbital    : Circular motion (spin, wave)                                       
 * │ • jitter     : Random shaking (shake, vibrate)                                    
 * │ • directional: Movement in specific direction (tilt, drift)                       
 * │ • burst      : Explosive outward (flash, surprise)                                
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT ADD HERE (Belongs in Other Files)                                       
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Emotion-specific overrides  → use emotionModifiers.js                          
 * │ ✗ Undertone variations       → use undertoneModifiers.js                         
 * │ ✗ Sound triggers             → use SoundSystem config                            
 * │ ✗ Visual properties          → use emotionMap.js                                 
 * │ ✗ Gesture execution logic    → use AnimationController.js                        
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           ADDING NEW GESTURES                                     
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Add new gesture object with ALL base properties                                
 * ║ 2. Define particleMotion with valid type from Particle.js                         
 * ║ 3. Add emotion modifiers in emotionModifiers.js if needed                         
 * ║ 4. Test with different emotions to ensure compatibility                           
 * ║ 5. Document any special behavior or limitations                                   
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export const GESTURE_BASE_CONFIG = {
    bounce: {
        duration: 800,
        amplitude: 30,
        frequency: 2, // Number of bounces
        easing: 'sine', // sine, elastic, spring
        particleMotion: {
            type: 'oscillate',
            axis: 'vertical',
            strength: 0.6,  // Reduced for gentler bounce
            frequency: 2
        }
    },
    
    pulse: {
        duration: 600,
        scaleAmount: 0.2, // 20% scale change
        glowAmount: 0.3,  // 30% glow change
        frequency: 1,      // Number of pulses
        easing: 'sine',
        particleMotion: {
            type: 'radial',
            strength: 0.15,  // Reduced from 0.5 - much gentler particle effect
            direction: 'outward', // outward pulse
            frequency: 1
        }
    },
    
    shake: {
        duration: 400,
        amplitude: 8,
        frequency: 10,    // Vibration frequency
        decay: true,      // Whether amplitude decreases
        easing: 'linear',
        particleMotion: {
            type: 'jitter',
            strength: 0.4,  // Reduced for less violent shake
            frequency: 10,
            decay: true
        }
    },
    
    spin: {
        duration: 600,
        rotations: 1,     // Full rotations
        scaleAmount: 0.1, // Scale change during spin
        easing: 'linear', // Linear for complete full rotation
        particleMotion: {
            type: 'orbital',
            strength: 0.7,  // Reduced for smoother spin
            rotations: 1,
            radius: 1.0 // Orbital radius exactly on orb perimeter
        }
    },
    
    nod: {
        duration: 500,
        amplitude: 15,    // Vertical movement
        frequency: 2,     // Number of nods
        easing: 'sine',
        particleMotion: {
            type: 'oscillate',
            axis: 'vertical',
            strength: 0.4,
            frequency: 2,
            phase: 0 // In sync with orb
        }
    },
    
    tilt: {
        duration: 500,
        angle: 15,        // Degrees of tilt
        frequency: 2,     // Number of tilts
        easing: 'sine',
        particleMotion: {
            type: 'tilt',
            strength: 0.8,    // Reduced but still noticeable
            frequency: 2,
            swayAmount: 25,   // Less dramatic sway
            liftAmount: 15    // Gentler lift
        }
    },
    
    expand: {
        duration: 500,
        scaleTarget: 1.5, // Target scale
        glowAmount: 0.2,  // Glow increase
        easing: 'back',    // Overshoot effect
        particleMotion: {
            type: 'radial',
            strength: 0.7,
            direction: 'outward',
            persist: true // Keep expanded position
        }
    },
    
    contract: {
        duration: 400,
        scaleTarget: 0.7, // Target scale
        glowAmount: -0.2, // Glow decrease
        easing: 'cubic',
        particleMotion: {
            type: 'radial',
            strength: 0.7,
            direction: 'inward',
            persist: true
        }
    },
    
    flash: {
        duration: 200,
        glowPeak: 2.0,    // Peak glow intensity
        scalePeak: 1.1,   // Slight scale at peak
        easing: 'quad',
        particleMotion: {
            type: 'burst',
            strength: 0.8,
            decay: 0.5 // Quick decay after burst
        }
    },
    
    drift: {
        duration: 800,
        distance: 50,     // Pixels to drift
        angle: 45,        // Direction in degrees
        returnToCenter: true,
        easing: 'sine',
        particleMotion: {
            type: 'drift',     // Changed to new drift type for override behavior
            strength: 0.8,
            distance: 60,      // Particle drift distance
            returnToOrigin: true
        }
    },
    
    stretch: {
        duration: 2000,
        scaleX: 1.3,      // Horizontal stretch
        scaleY: 0.9,      // Vertical compression
        frequency: 1,
        easing: 'sine',
        particleMotion: {
            type: 'stretch',
            scaleX: 1.8,      // Exaggerated horizontal stretch for particles
            scaleY: 0.6,      // More compression vertically
            strength: 1.0     // Strong effect since orb stays round
        }
    },
    
    expand: {
        duration: 600,
        scaleAmount: 1.3,  // Scale up to 130%
        easing: 'quad',
        particleMotion: {
            type: 'radial',
            strength: 0.6,
            direction: 'outward'
        }
    },
    
    contract: {
        duration: 600,
        scaleAmount: 0.7,  // Scale down to 70%
        easing: 'quad',
        particleMotion: {
            type: 'radial',
            strength: 0.6,
            direction: 'inward'
        }
    },
    
    flash: {
        duration: 400,
        glowAmount: 2.5,   // Bright flash
        glowPeak: 3.0,     // Peak intensity
        easing: 'cubic',
        particleMotion: {
            type: 'burst',
            strength: 1.0,
            decay: 0.3
        }
    },
    
    glow: {
        duration: 1500,
        glowAmount: 1.5,   // Sustained glow
        glowPeak: 2.0,
        easing: 'sine',
        particleMotion: {
            type: 'radial',
            strength: 0.3,
            direction: 'outward',
            gentle: true
        }
    },
    
    flicker: {
        duration: 800,
        frequency: 6,      // Number of flickers
        minOpacity: 0.3,
        maxOpacity: 1.0,
        easing: 'linear',
        particleMotion: {
            type: 'flicker',
            strength: 0.7,
            frequency: 6
        }
    },
    
    vibrate: {
        duration: 500,
        frequency: 12,     // High frequency shake
        amplitude: 3,      // Small amplitude
        easing: 'linear',
        particleMotion: {
            type: 'jitter',
            strength: 0.4,
            frequency: 12,
            amplitude: 3
        }
    },
    
    wave: {
        duration: 2500,    // Graceful, deliberate wave
        amplitude: 40,     // Infinity symbol size
        frequency: 1,      // One complete infinity loop
        horizontal: true,  // Horizontal infinity pattern
        easing: 'sine',
        particleMotion: {
            type: 'wave',
            strength: 1.0,     // Full strength for magical effect
            amplitude: 50      // Larger particle motion for visibility
        }
    },
    
    breathe: {
        duration: 3500,    // Slow, deliberate breathing cycle
        scaleAmount: 0.25, // 25% expansion/contraction
        glowAmount: 0.4,   // Glow brightens on inhale
        frequency: 1,      // One full breath cycle
        easing: 'sine',    // Smooth, natural breathing curve
        particleMotion: {
            type: 'breathe',
            strength: 0.8,     // Strong but gentle particle drift
            inhaleRadius: 1.5, // Particles drift out to 1.5x orb radius
            exhaleRadius: 0.3, // Particles pull in close on exhale
            holdPercent: 0.1   // 10% breath hold at peaks
        }
    },
    
    morph: {
        duration: 1000,
        morphType: 'fluid', // Type of morph animation
        amplitude: 20,
        easing: 'sine',
        particleMotion: {
            type: 'morph',
            pattern: 'star',   // Form a star pattern (more dramatic than circle)
            strength: 1.2,     // Strong formation
            smooth: true,
            points: 5          // 5-pointed star
        }
    },
    
    slowBlink: {
        duration: 1200,
        blinkSpeed: 0.3,   // Slow closing/opening
        holdClosed: 200,   // Hold eyes closed for 200ms
        easing: 'quad',
        particleMotion: {
            type: 'fade',
            strength: 0.8,
            holdDuration: 200
        }
    },
    
    look: {
        duration: 1500,
        lookDirection: 'random', // or 'left', 'right', 'up', 'down'
        lookDistance: 0.3,        // How far to look (0-1)
        holdDuration: 500,        // Hold the look
        easing: 'cubic',
        particleMotion: {
            type: 'directional',
            strength: 0.3,
            followGaze: true,
            holdDuration: 500
        }
    },
    
    settle: {
        duration: 1000,
        wobbleDecay: 0.9,  // Decay rate of wobble
        wobbleFreq: 3,     // Initial wobble frequency
        easing: 'quad',
        particleMotion: {
            type: 'settle',
            strength: 0.5,
            decay: 0.9,
            wobbleFreq: 3
        }
    },
    
    breathIn: {
        duration: 2000,
        scaleAmount: 1.15, // Expand slightly
        easing: 'sine',
        particleMotion: {
            type: 'radial',
            strength: 0.2,
            direction: 'outward',
            smooth: true
        }
    },
    
    breathOut: {
        duration: 2000,
        scaleAmount: 0.9,  // Contract slightly
        easing: 'sine',
        particleMotion: {
            type: 'radial',
            strength: 0.2,
            direction: 'inward',
            smooth: true
        }
    },
    
    breathHold: {
        duration: 1500,
        scaleAmount: 1.1,  // Hold expanded
        easing: 'linear',
        particleMotion: {
            type: 'hold',
            strength: 0.1,
            slight: true // Slight movement while holding
        }
    },
    
    breathHoldEmpty: {
        duration: 1500,
        scaleAmount: 0.95, // Hold contracted
        easing: 'linear',
        particleMotion: {
            type: 'hold',
            strength: 0.05,
            tight: true // Very minimal movement
        }
    },
    
    jump: {
        duration: 800,
        jumpHeight: 60,    // Pixels to jump
        squashAmount: 0.8, // Squash before jump
        stretchAmount: 1.2, // Stretch during jump
        easing: 'quad',
        particleMotion: {
            type: 'jump',
            strength: 0.9,
            jumpHeight: 60,
            squash: 0.8,
            stretch: 1.2
        }
    },
    
    narrowEye: {
        duration: 500,
        squintAmount: 0.4,  // Narrow to 60% of original height
        easing: 'cubicOut',
        holdDuration: 2000, // Hold the squint for 2 seconds
        particleMotion: {
            type: 'converge',
            axis: 'vertical',
            strength: 0.5,
            targetY: 0.5      // Move particles toward center
        }
    },
    
    peerAround: {
        duration: 800,
        scanAngle: 45,      // Degrees to look left/right
        pauseDuration: 300, // Pause at each extreme
        easing: 'cubicInOut',
        particleMotion: {
            type: 'follow',
            strength: 0.3,
            lag: 100          // Particles lag behind core movement
        }
    }
};

/**
 * Get base configuration for a gesture
 * @param {string} gestureName - Name of the gesture
 * @returns {Object} Base configuration object
 */
export function getGestureBaseConfig(gestureName) {
    return GESTURE_BASE_CONFIG[gestureName] || {
        duration: 500,
        amplitude: 20,
        easing: 'sine'
    };
}