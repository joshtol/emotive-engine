/**
 * GestureAnimator - Handles all gesture animations for EmotiveRenderer
 * @module core/renderer/GestureAnimator
 */

import { getGesture } from '../gestures/index.js';
import musicalDuration from '../MusicalDuration.js';

export class GestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeGestures = new Map();
        this.gestureQueue = [];
        this.scaleFactor = renderer.scaleFactor || 1;
        
        // Gesture animations state
        this.gestureAnimations = {
            bounce: { active: false, progress: 0, params: {} },
            pulse: { active: false, progress: 0, params: {} },
            shake: { active: false, progress: 0, params: {} },
            spin: { active: false, progress: 0, params: {} },
            nod: { active: false, progress: 0, params: {} },
            tilt: { active: false, progress: 0, params: {} },
            expand: { active: false, progress: 0, params: {} },
            contract: { active: false, progress: 0, params: {} },
            flash: { active: false, progress: 0, params: {} },
            drift: { active: false, progress: 0, params: {} },
            stretch: { active: false, progress: 0, params: {} },
            glow: { active: false, progress: 0, params: {} },
            flicker: { active: false, progress: 0, params: {} },
            vibrate: { active: false, progress: 0, params: {} },
            orbital: { active: false, progress: 0, params: {} },  // ADDED
            hula: { active: false, progress: 0, params: {} },     // ADDED
            wave: { active: false, progress: 0, params: {} },
            breathe: { active: false, progress: 0, params: {} },
            morph: { active: false, progress: 0, params: {} },
            slowBlink: { active: false, progress: 0, params: {} },
            look: { active: false, progress: 0, params: {} },
            settle: { active: false, progress: 0, params: {} },
            breathIn: { active: false, progress: 0, params: {} },
            breathOut: { active: false, progress: 0, params: {} },
            breathHold: { active: false, progress: 0, params: {} },
            breathHoldEmpty: { active: false, progress: 0, params: {} },
            jump: { active: false, progress: 0, params: {} },
            sway: { active: false, progress: 0, params: {} },
            float: { active: false, progress: 0, params: {} },
            sparkle: { active: false, progress: 0, params: {} },
            shimmer: { active: false, progress: 0, params: {} },
            wiggle: { active: false, progress: 0, params: {} },
            groove: { active: false, progress: 0, params: {} },
            point: { active: false, progress: 0, params: {} },
            lean: { active: false, progress: 0, params: {} },
            reach: { active: false, progress: 0, params: {} },
            headBob: { active: false, progress: 0, params: {} },
            orbit: { active: false, progress: 0, params: {} },
            rain: { active: false, progress: 0, params: {} },
            runningman: { active: false, progress: 0, params: {} },
            charleston: { active: false, progress: 0, params: {} }
        };
    }

    /**
     * Start a gesture animation
     * @param {string} gestureName - Name of the gesture to start
     */
    startGesture(gestureName) {
        
        // Get the gesture configuration
        const gesture = getGesture(gestureName);
        
        // Trigger chromatic aberration for impact gestures
        const impactGestures = ['bounce', 'shake', 'pulse', 'flash', 'jump', 'slam', 'spin', 'flicker'];
        if (impactGestures.includes(gestureName) && this.renderer.specialEffects) {
            // Vary intensity based on gesture - all high for testing
            const intensities = {
                'flash': 1.0,
                'jump': 1.0,
                'shake': 0.9,
                'bounce': 0.8,
                'pulse': 0.7,
                'slam': 1.0,
                'spin': 0.8,
                'flicker': 1.0
            };
            const intensity = intensities[gestureName] || 0.8;
            this.renderer.specialEffects.triggerChromaticAberration(intensity);
            console.log(`[Chromatic Aberration] Triggered for ${gestureName} with intensity ${intensity}`);
        }
        
        // Get composed parameters based on current emotion and undertone
        // Use the renderer's gestureCompositor if available
        let params;
        if (this.renderer.gestureCompositor) {
            params = this.renderer.gestureCompositor.compose(
                gestureName,
                this.renderer.state.emotion,
                this.renderer.currentUndertone
            );
        } else {
            // Fallback to gesture's default config if no compositor
            params = gesture?.config || {
                amplitude: 20,
                frequency: 2,
                duration: 1000,
                scaleAmount: 0.2,
                glowAmount: 0.3,
                rotations: 1,
                distance: 50,
                angle: 15,
                scaleTarget: 1.5,
                glowPeak: 2.0,
                scalePeak: 1.1,
                scaleX: 1.2,
                scaleY: 0.8,
                maxOpacity: 1,
                minOpacity: 0.5,
                lookDirection: 'random',
                lookDistance: 1,
                wobbleFreq: 4,
                squashAmount: 0.8,
                stretchAmount: 1.2,
                jumpHeight: 100,
                decay: true,
                easing: 'sine',
                effects: []
            };
        }
        
        // Calculate duration from gesture config
        let duration = 1000; // Default fallback
        if (gesture && gesture.config) {
            if (gesture.config.musicalDuration) {
                // Use musical duration system
                duration = musicalDuration.toMilliseconds(gesture.config.musicalDuration);
            } else if (gesture.config.duration) {
                // Use fixed duration
                duration = gesture.config.duration;
            }
        }
        
        // Set up the animation
        const anim = this.gestureAnimations[gestureName];
        if (anim) {
            anim.active = true;
            anim.startTime = performance.now();
            anim.progress = 0;
            anim.params = params;
            anim.duration = duration; // Store calculated duration
            
            // Reset random values for gestures that use them
            if (gestureName === 'shake') {
                anim.randomAngle = undefined; // Will be regenerated
            } else if (gestureName === 'drift') {
                anim.startX = undefined;
                anim.startY = undefined;
                anim.currentDriftAngle = undefined; // Reset the angle for new random direction
            } else if (gestureName === 'tilt') {
                anim.tiltDirection = undefined; // Reset for new random direction
            } else if (gestureName === 'vibrate') {
                anim.vibrateAngles = undefined;
            }
            
        }
    }

    /**
     * Apply all active gesture animations
     * @returns {Object} Combined transformation values
     */
    applyGestureAnimations() {
        const now = performance.now();
        const transform = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            rotation: 0,
            glow: 1
        };
        
        // Process each gesture animation
        for (const [gestureName, anim] of Object.entries(this.gestureAnimations)) {
            if (!anim.active) continue;
            
            const elapsed = now - anim.startTime;
            // Use stored duration or fallback to params duration
            const duration = anim.duration || (anim.params ? anim.params.duration : 1000);
            anim.progress = Math.min(elapsed / duration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(anim.progress, anim.params.easing);
            
            // Apply gesture-specific transformations
            let gestureTransform = {};
            switch (gestureName) {
                case 'bounce':
                    gestureTransform = this.applyBounce(anim, easedProgress);
                    break;
                case 'pulse':
                    gestureTransform = this.applyPulse(anim, easedProgress);
                    break;
                case 'shake':
                    gestureTransform = this.applyShake(anim, easedProgress);
                    break;
                case 'spin':
                    gestureTransform = this.applySpin(anim, easedProgress);
                    break;
                case 'nod':
                    gestureTransform = this.applyNod(anim, easedProgress);
                    break;
                case 'tilt':
                    gestureTransform = this.applyTilt(anim, easedProgress);
                    break;
                case 'expand':
                    gestureTransform = this.applyExpand(anim, easedProgress);
                    break;
                case 'contract':
                    gestureTransform = this.applyContract(anim, easedProgress);
                    break;
                case 'flash':
                    gestureTransform = this.applyFlash(anim, easedProgress);
                    break;
                case 'drift':
                    gestureTransform = this.applyDrift(anim, easedProgress);
                    break;
                case 'stretch':
                    gestureTransform = this.applyStretch(anim, easedProgress);
                    break;
                case 'glow':
                    gestureTransform = this.applyGlow(anim, easedProgress);
                    break;
                case 'flicker':
                    gestureTransform = this.applyFlicker(anim, easedProgress);
                    break;
                case 'vibrate':
                    gestureTransform = this.applyVibrate(anim, easedProgress);
                    break;
                case 'orbital':
                    gestureTransform = this.applyOrbital(anim, easedProgress);
                    break;
                case 'hula':
                    gestureTransform = this.applyHula(anim, easedProgress);
                    break;
                case 'wave':
                    gestureTransform = this.applyWave(anim, easedProgress);
                    break;
                case 'breathe':
                    gestureTransform = this.applyBreathe(anim, easedProgress);
                    break;
                case 'morph':
                    gestureTransform = this.applyMorph(anim, easedProgress);
                    break;
                case 'slowBlink':
                    gestureTransform = this.applySlowBlink(anim, easedProgress);
                    break;
                case 'look':
                    gestureTransform = this.applyLook(anim, easedProgress);
                    break;
                case 'settle':
                    gestureTransform = this.applySettle(anim, easedProgress);
                    break;
                case 'breathIn':
                    gestureTransform = this.applyBreathIn(anim, easedProgress);
                    break;
                case 'breathOut':
                    gestureTransform = this.applyBreathOut(anim, easedProgress);
                    break;
                case 'breathHold':
                    gestureTransform = this.applyBreathHold(anim, easedProgress);
                    break;
                case 'breathHoldEmpty':
                    gestureTransform = this.applyBreathHoldEmpty(anim, easedProgress);
                    break;
                case 'jump':
                    gestureTransform = this.applyJump(anim, easedProgress);
                    break;
                case 'sway':
                    gestureTransform = this.applySway(anim, easedProgress);
                    break;
                case 'float':
                    gestureTransform = this.applyFloat(anim, easedProgress);
                    break;
                case 'rain':
                    gestureTransform = this.applyRain(anim, easedProgress);
                    break;
                case 'runningman':
                    gestureTransform = this.applyRunningMan(anim, easedProgress);
                    break;
                case 'charleston':
                    gestureTransform = this.applyCharleston(anim, easedProgress);
                    break;
                case 'sparkle':
                    gestureTransform = this.applySparkle(anim, easedProgress);
                    break;
                case 'shimmer':
                    gestureTransform = this.applyShimmer(anim, easedProgress);
                    break;
                case 'wiggle':
                    gestureTransform = this.applyWiggle(anim, easedProgress);
                    break;
                case 'groove':
                    gestureTransform = this.applyGroove(anim, easedProgress);
                    break;
                case 'point':
                    gestureTransform = this.applyPoint(anim, easedProgress);
                    break;
                case 'lean':
                    gestureTransform = this.applyLean(anim, easedProgress);
                    break;
                case 'reach':
                    gestureTransform = this.applyReach(anim, easedProgress);
                    break;
                case 'headBob':
                    gestureTransform = this.applyHeadBob(anim, easedProgress);
                    break;
                case 'orbit':
                    gestureTransform = this.applyOrbit(anim, easedProgress);
                    break;
            }
            
            // Combine transforms
            transform.offsetX += gestureTransform.offsetX || 0;
            transform.offsetY += gestureTransform.offsetY || 0;
            transform.scale *= gestureTransform.scale || 1;
            transform.rotation += gestureTransform.rotation || 0;
            // Use MAX for glow instead of multiplying to prevent accumulation
            transform.glow = Math.max(transform.glow, gestureTransform.glow || 1);
            
            // Pass flash wave data if present
            if (gestureTransform.flashWave) {
                transform.flashWave = gestureTransform.flashWave;
            }
            
            // Pass firefly effect data if present (for sparkle gesture)
            if (gestureTransform.fireflyEffect) {
                transform.fireflyEffect = gestureTransform.fireflyEffect;
                transform.particleGlow = gestureTransform.particleGlow;
                transform.fireflyTime = gestureTransform.fireflyTime;
            }
            
            // Pass flicker effect data if present (for flicker gesture - now does particle shimmer)
            if (gestureTransform.flickerEffect) {
                transform.flickerEffect = gestureTransform.flickerEffect;
                transform.particleGlow = gestureTransform.particleGlow;
                transform.flickerTime = gestureTransform.flickerTime;
            }
            
            // Pass shimmer effect data if present (for shimmer gesture - subtle glow)
            if (gestureTransform.shimmerEffect) {
                transform.shimmerEffect = gestureTransform.shimmerEffect;
                transform.particleGlow = gestureTransform.particleGlow;
                transform.shimmerTime = gestureTransform.shimmerTime;
                transform.shimmerWave = gestureTransform.shimmerWave;
            }
            
            // Pass glow effect data if present (for glow gesture)
            if (gestureTransform.glowEffect) {
                transform.glowEffect = gestureTransform.glowEffect;
                transform.particleGlow = gestureTransform.particleGlow;
                transform.glowTime = gestureTransform.glowTime;
                transform.glowProgress = gestureTransform.glowProgress;
                transform.glowEnvelope = gestureTransform.glowEnvelope;
            }
            
            // Check if animation is complete
            if (anim.progress >= 1) {
                anim.active = false;
                anim.progress = 0;
                anim.startTime = 0;
                // Clean up flash wave data
                if (gestureName === 'flash') {
                    anim.flashWave = null;
                    anim.flashWaveData = null;
                }
            }
        }
        
        return transform;
    }

    /**
     * Update active gestures
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update logic moved to applyGestureAnimations
        return this.applyGestureAnimations();
    }

    /**
     * Stop all active gestures
     */
    stopAllGestures() {
        // Reset all gesture animations
        Object.keys(this.gestureAnimations).forEach(key => {
            this.gestureAnimations[key].active = false;
            this.gestureAnimations[key].startTime = 0;
            this.gestureAnimations[key].progress = 0;
            this.gestureAnimations[key].params = null;
        });
        this.activeGestures.clear();
        this.gestureQueue = [];
    }
    
    /**
     * Get current active gesture information for particle system
     * @returns {Object|null} Current gesture with particleMotion and progress, or null
     */
    getCurrentGesture() {
        // Priority: Find override gestures first (like orbital, hula), then other gestures
        const overrideGestures = ['orbital', 'hula', 'wave', 'spin'];
        
        // Check override gestures first
        for (const gestureName of overrideGestures) {
            const anim = this.gestureAnimations[gestureName];
            if (anim && anim.active) {
                // Get the actual gesture configuration
                const gesture = getGesture(gestureName);
                
                // Use the gesture's config for particleMotion, or create one from gesture type
                const particleMotion = gesture?.config?.particleMotion || {
                    type: gestureName,  // This ensures the modular gesture system will find it
                    strength: anim.params?.strength || 1.0
                };
                
                const gestureInfo = {
                    name: gestureName,
                    particleMotion: particleMotion,
                    progress: anim.progress || 0,
                    params: anim.params
                };
                
                return gestureInfo;
            }
        }
        
        // Then check all other gestures
        for (const [gestureName, anim] of Object.entries(this.gestureAnimations)) {
            if (anim.active) {
                // Get the actual gesture configuration
                const gesture = getGesture(gestureName);
                
                // Use the gesture's config for particleMotion, or params if available
                const particleMotion = gesture?.config?.particleMotion || 
                                      anim.params?.particleMotion || 
                                      { type: gestureName, strength: anim.params?.strength || 1.0 };
                
                const gestureInfo = {
                    name: gestureName,
                    particleMotion: particleMotion,
                    progress: anim.progress || 0,
                    params: anim.params
                };
                
                // Include breathPhase for breathe gesture
                if (gestureName === 'breathe' && anim.breathPhase !== undefined) {
                    gestureInfo.breathPhase = anim.breathPhase;
                }
                
                return gestureInfo;
            }
        }
        return null;
    }
    
    /**
     * Apply easing function to progress
     */
    applyEasing(progress, easing) {
        switch (easing) {
            case 'linear':
                return progress;
            case 'quad':
                return progress * progress;
            case 'cubic':
                return progress * progress * progress;
            case 'sine':
                return Math.sin(progress * Math.PI / 2);
            case 'back':
                return progress * progress * (2.7 * progress - 1.7);
            default:
                return progress;
        }
    }
    
    // Individual gesture application methods
    applyBounce(anim, progress) {
        const bounce = Math.abs(Math.sin(progress * Math.PI * anim.params.frequency)) * anim.params.amplitude * this.scaleFactor;
        // Apply effects
        const multiplier = anim.params.effects && anim.params.effects.includes('gravity') ? 0.6 : 1;
        return { offsetY: -bounce * multiplier };
    }
    
    applyPulse(anim, progress) {
        const pulse = Math.sin(progress * Math.PI * anim.params.frequency);
        return {
            scale: 1 + pulse * anim.params.scaleAmount,
            glow: 1 + pulse * anim.params.glowAmount
        };
    }
    
    applyShake(anim, progress) {
        // Initialize random direction for this shake if not set
        if (!anim.randomAngle) {
            anim.randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
        }
        const decay = anim.params.decay ? (1 - progress) : 1;
        const shake = Math.sin(progress * Math.PI * anim.params.frequency) * anim.params.amplitude * decay * this.scaleFactor;
        return {
            offsetX: shake * Math.cos(anim.randomAngle),
            offsetY: shake * Math.sin(anim.randomAngle)
        };
    }
    
    applySpin(anim, progress) {
        // Ensure full rotation even if progress doesn't quite reach 1.0
        const actualProgress = Math.min(progress * 1.05, 1.0); // Slight overshoot to ensure completion
        return {
            rotation: actualProgress * anim.params.rotations * 360,
            scale: 1 + Math.sin(progress * Math.PI) * anim.params.scaleAmount
        };
    }
    
    applyNod(anim, progress) {
        const nod = Math.sin(progress * Math.PI * anim.params.frequency) * anim.params.amplitude * this.scaleFactor;
        return { offsetY: nod };
    }
    
    applyTilt(anim, progress) {
        if (!anim.tiltDirection) {
            // Randomly choose left (-1) or right (1) tilt
            anim.tiltDirection = Math.random() < 0.5 ? -1 : 1;
        }
        const frequency = anim.params.frequency || 2;
        const angle = (anim.params.angle || 15) * Math.PI / 180; // Convert to radians
        const tiltProgress = Math.sin(progress * Math.PI * frequency) * anim.tiltDirection;
        
        // Apply both rotation and skew to make tilt visible on circular orb
        return { 
            rotation: tiltProgress * angle,
            // Skew the orb slightly to show tilt motion
            scaleX: 1 + Math.abs(tiltProgress) * 0.1,  // Widen when tilted
            scaleY: 1 - Math.abs(tiltProgress) * 0.05, // Compress slightly
            // Move slightly with tilt
            offsetX: tiltProgress * 10,
            offsetY: Math.abs(tiltProgress) * -5  // Lift slightly when tilted
        };
    }
    
    applyExpand(anim, progress) {
        // Use scaleAmount or scaleTarget (handle both config formats)
        // Make sure we're expanding, not contracting
        const targetScale = Math.max(anim.params.scaleAmount || anim.params.scaleTarget || 1.5, 1.0);
        const easedProgress = Math.sin(progress * Math.PI / 2); // Smooth ease-out
        const scale = 1 + (targetScale - 1) * easedProgress;
        return {
            scale: scale,
            glow: 1 + Math.abs(anim.params.glowAmount || 0.2) * easedProgress
        };
    }
    
    applyContract(anim, progress) {
        // Use scaleAmount or scaleTarget (handle both config formats)
        const targetScale = anim.params.scaleAmount || anim.params.scaleTarget || 0.7;
        const easedProgress = Math.sin(progress * Math.PI / 2); // Smooth ease-out
        const scale = 1 + (targetScale - 1) * easedProgress;
        return {
            scale: scale,
            glow: 1 + (anim.params.glowAmount || -0.2) * easedProgress
        };
    }
    
    applyFlash(anim, progress) {
        const flash = Math.sin(progress * Math.PI); // Quick up and down
        const glowPeak = anim.params.glowPeak || 2.0;  // Default if not defined
        const scalePeak = anim.params.scalePeak || 1.1; // Default if not defined
        return {
            glow: 1 + (glowPeak - 1) * flash,
            scale: 1 + (scalePeak - 1) * flash
        };
    }
    
    applyDrift(anim, progress) {
        // Initialize drift angle when starting (progress near 0)
        if (progress <= 0.01 && !anim.currentDriftAngle) {
            // Always pick a random angle for drift
            anim.currentDriftAngle = Math.random() * Math.PI * 2; // Random direction in radians
        }
        
        const distance = anim.params.distance * Math.sin(progress * Math.PI) * this.scaleFactor;
        const angle = anim.currentDriftAngle || 0;
        
        // Clear the angle when animation completes
        if (progress >= 0.99) {
            anim.currentDriftAngle = null;
        }
        
        return {
            offsetX: Math.cos(angle) * distance,
            offsetY: Math.sin(angle) * distance
        };
    }
    
    applyStretch(anim, progress) {
        const stretch = Math.sin(progress * Math.PI * anim.params.frequency);
        // Note: We'd need to handle scaleX/scaleY separately for proper stretch
        // For now, average them
        const avgScale = (anim.params.scaleX + anim.params.scaleY) / 2;
        return { scale: 1 + (avgScale - 1) * stretch };
    }
    
    applyGlow(anim, progress) {
        // Glow effect - pure luminosity like pulse but without movement
        // Copy of pulse logic but focused only on glow

        const glowPulse = Math.sin(progress * Math.PI * anim.params.frequency);

        return {
            scale: 1 + glowPulse * (anim.params.scaleAmount || 0.1), // Very subtle scale like new glow config
            glow: 1 + glowPulse * (anim.params.glowAmount || 0.8)    // Strong glow like new glow config
        };
    }
    
    applyFlash(anim, progress) {
        // Wave-like flash that emanates outward
        // Store wave state in the animation object
        if (!anim.flashWave) {
            anim.flashWave = {
                innerRadius: 0,
                outerRadius: 0,
                maxRadius: 3.0 // How far the wave travels (relative to core)
            };
        }
        
        // Update wave radius based on progress
        anim.flashWave.outerRadius = progress * anim.flashWave.maxRadius;
        anim.flashWave.innerRadius = Math.max(0, (progress - 0.1) * anim.flashWave.maxRadius);
        
        // Fade intensity as wave travels outward
        const waveIntensity = Math.max(0, 1 - progress * 0.7);
        
        // Store wave data for renderer to use
        anim.flashWaveData = {
            innerRadius: anim.flashWave.innerRadius,
            outerRadius: anim.flashWave.outerRadius,
            intensity: waveIntensity
        };
        
        // Return a very subtle glow increase at the core
        return {
            glow: 1 + waveIntensity * 0.3, // Very subtle core glow
            flashWave: anim.flashWaveData // Pass wave data to renderer
        };
    }
    
    applyFlicker(anim, progress) {
        // Flicker effect - particles shimmer with wave-like pulsing
        const intensity = anim.params?.intensity || 2.0;
        const shimmerSpeed = anim.params?.speed || 3;
        
        // Smooth sine wave for shimmer
        const glow = 1 + Math.sin(progress * Math.PI * 2 * shimmerSpeed) * intensity * 0.3;
        
        // Slight horizontal wave motion
        const waveX = Math.sin(progress * Math.PI * 4) * 5 * this.scaleFactor;
        
        // Create time-based shimmer for particles
        const time = Date.now() * 0.001; // Convert to seconds
        
        // Main shimmer pulse
        const mainPulse = Math.sin(progress * Math.PI * shimmerSpeed * 2) * 0.5 + 0.5;
        
        return {
            offsetX: waveX,
            glow: glow,
            particleGlow: intensity * mainPulse, // Intensity for particles
            flickerTime: time, // Pass time for particle calculations
            flickerEffect: true // Flag to enable flicker effect on particles (shimmer-like)
        };
    }
    
    applyVibrate(anim, progress) {
        // Initialize random vibration pattern if not set
        if (!anim.vibrateAngles) {
            anim.vibrateAngles = {
                x: Math.random() * 2 - 1, // Random factor between -1 and 1
                y: Math.random() * 2 - 1
            };
            // Normalize to unit vector
            const mag = Math.sqrt(anim.vibrateAngles.x ** 2 + anim.vibrateAngles.y ** 2);
            anim.vibrateAngles.x /= mag;
            anim.vibrateAngles.y /= mag;
        }
        const vibration = Math.sin(progress * Math.PI * 2 * anim.params.frequency) * anim.params.amplitude * this.scaleFactor;
        return {
            offsetX: vibration * anim.vibrateAngles.x,
            offsetY: vibration * anim.vibrateAngles.y
        };
    }
    
    applyWave(anim, progress) {
        // Completely rewritten wave - a graceful, flowing infinity symbol motion
        const amp = (anim.params.amplitude || 40) * this.scaleFactor;
        
        // Create a smooth infinity symbol (∞) pattern
        // This feels more like a natural greeting wave
        const t = progress * Math.PI * 2;
        
        // Infinity symbol parametric equations
        // X: figure-8 horizontal motion
        const infinityX = Math.sin(t) * amp;
        
        // Y: gentle vertical bob that rises during the wave
        // Creates a "lifting" feeling like a real wave hello
        const liftAmount = -Math.sin(progress * Math.PI) * amp * 0.3; // Lift up during wave
        const infinityY = Math.sin(t * 2) * amp * 0.2 + liftAmount;
        
        // Add a subtle tilt that follows the wave direction
        // Makes the orb "lean into" the wave
        const tilt = Math.sin(t) * 5; // ±5 degrees of tilt
        
        // Gentle scale pulse for emphasis
        const scalePulse = 1 + Math.sin(progress * Math.PI * 2) * 0.05; // 5% scale variation
        
        // Glow brightens slightly during wave
        const glowPulse = 1 + Math.sin(progress * Math.PI) * 0.2; // 20% glow increase
        
        return {
            offsetX: infinityX,
            offsetY: infinityY,
            rotation: tilt,
            scale: scalePulse,
            glow: glowPulse
        };
    }
    
    applyBreathe(anim, progress) {
        // Deliberate, mindful breathing animation
        const params = anim.params;
        const holdPercent = params.particleMotion?.holdPercent || 0.1;
        
        // Create a breathing curve with holds at peaks
        let breathPhase;
        if (progress < 0.4) {
            // Inhale phase (0-40%)
            breathPhase = Math.sin((progress / 0.4) * Math.PI / 2);
        } else if (progress < 0.4 + holdPercent) {
            // Hold at full inhale
            breathPhase = 1.0;
        } else if (progress < 0.9) {
            // Exhale phase  
            const exhaleProgress = (progress - 0.4 - holdPercent) / (0.5 - holdPercent);
            breathPhase = Math.cos(exhaleProgress * Math.PI / 2);
        } else {
            // Hold at full exhale
            breathPhase = 0;
        }
        
        // Apply scale changes - expand on inhale
        const scaleAmount = params.scaleAmount || 0.25;
        const scale = 1 + breathPhase * scaleAmount;
        
        // Apply glow changes - brighten on inhale
        const glowAmount = params.glowAmount || 0.4;
        const glow = 1 + breathPhase * glowAmount;
        
        // Store breath phase for particle system
        anim.breathPhase = breathPhase;
        
        return {
            scale: scale,
            glow: glow,
            breathPhase: breathPhase // Pass to particles for synchronized motion
        };
    }
    
    applyMorph(anim, progress) {
        // Fluid morphing effect
        const morph = Math.sin(progress * Math.PI * 2);
        return {
            scale: 1 + morph * 0.1,
            rotation: morph * 10
        };
    }
    
    applySlowBlink(anim, progress) {
        // Simulate blinking by scaling vertically
        let scaleY = 1;
        if (progress < 0.3) {
            // Closing
            scaleY = 1 - (progress / 0.3);
        } else if (progress < 0.5) {
            // Closed
            scaleY = 0;
        } else if (progress < 0.8) {
            // Opening
            scaleY = (progress - 0.5) / 0.3;
        } else {
            // Open
            scaleY = 1;
        }
        
        // Since we can't do scaleY separately, dim the orb instead
        return {
            glow: scaleY
        };
    }
    
    applyLook(anim, progress) {
        // Initialize target position if not set
        if (!anim.targetX) {
            const direction = anim.params.lookDirection;
            const distance = anim.params.lookDistance * 50 * this.scaleFactor; // Convert to pixels and scale
            
            switch(direction) {
                case 'left':
                    anim.targetX = -distance;
                    anim.targetY = 0;
                    break;
                case 'right':
                    anim.targetX = distance;
                    anim.targetY = 0;
                    break;
                case 'up':
                    anim.targetX = 0;
                    anim.targetY = -distance;
                    break;
                case 'down':
                    anim.targetX = 0;
                    anim.targetY = distance;
                    break;
                default: // random
                    const angle = Math.random() * Math.PI * 2;
                    anim.targetX = Math.cos(angle) * distance;
                    anim.targetY = Math.sin(angle) * distance;
            }
        }
        
        // Smooth look with hold
        let lookProgress = progress;
        if (progress < 0.3) {
            // Move to target
            lookProgress = progress / 0.3;
        } else if (progress < 0.7) {
            // Hold
            lookProgress = 1;
        } else {
            // Return
            lookProgress = 1 - (progress - 0.7) / 0.3;
        }
        
        return {
            offsetX: anim.targetX * lookProgress,
            offsetY: anim.targetY * lookProgress
        };
    }
    
    applySettle(anim, progress) {
        // Damped oscillation
        const wobble = Math.sin(progress * Math.PI * anim.params.wobbleFreq) * 
                      Math.exp(-progress * 3) * 20 * this.scaleFactor;
        return {
            offsetY: wobble,
            scale: 1 + wobble * 0.01
        };
    }
    
    applyBreathIn(anim, progress) {
        const breathScale = 1 + (anim.params.scaleAmount - 1) * Math.sin(progress * Math.PI / 2);
        return {
            scale: breathScale
        };
    }
    
    applyBreathOut(anim, progress) {
        const breathScale = 1 - (1 - anim.params.scaleAmount) * Math.sin(progress * Math.PI / 2);
        return {
            scale: breathScale
        };
    }
    
    applyBreathHold(anim, progress) {
        // Hold at expanded state
        return {
            scale: anim.params.scaleAmount
        };
    }
    
    applyBreathHoldEmpty(anim, progress) {
        // Hold at contracted state
        return {
            scale: anim.params.scaleAmount
        };
    }
    
    applyJump(anim, progress) {
        let yOffset = 0;
        let scale = 1;
        
        if (progress < 0.2) {
            // Squash phase
            const squashProgress = progress / 0.2;
            scale = 1 - (1 - anim.params.squashAmount) * squashProgress;
        } else if (progress < 0.7) {
            // Jump phase
            const jumpProgress = (progress - 0.2) / 0.5;
            const jumpCurve = Math.sin(jumpProgress * Math.PI);
            yOffset = -anim.params.jumpHeight * jumpCurve * this.scaleFactor;
            scale = anim.params.squashAmount + 
                   (anim.params.stretchAmount - anim.params.squashAmount) * jumpCurve;
        } else {
            // Landing phase
            const landProgress = (progress - 0.7) / 0.3;
            scale = anim.params.stretchAmount - 
                   (anim.params.stretchAmount - 1) * landProgress;
        }
        
        return {
            offsetY: yOffset,
            scale: scale
        };
    }
    
    applySway(anim, progress) {
        // Gentle pendulum-like swaying motion for the core
        const swayAmplitude = (anim.params?.amplitude || 30) * this.scaleFactor;
        const swayFrequency = anim.params?.frequency || 1;
        
        // Sway side to side with a gentle ease
        const swayX = Math.sin(progress * Math.PI * 2 * swayFrequency) * swayAmplitude;
        
        // Slight vertical bob for realism
        const bobY = Math.sin(progress * Math.PI * 4 * swayFrequency) * swayAmplitude * 0.1;
        
        // Slight rotation to match the sway
        const rotation = Math.sin(progress * Math.PI * 2 * swayFrequency) * 5; // 5 degrees max
        
        return {
            offsetX: swayX,
            offsetY: bobY,
            rotation: rotation
        };
    }
    
    applyRain(anim, progress) {
        // Rain effect - triggers falling particle behavior
        // The actual particle motion is handled by the particle system
        // This just adds a subtle downward drift to the core
        
        const rainIntensity = anim.params?.intensity || 1.0;
        
        // Gentle downward drift
        const driftY = progress * 10 * this.scaleFactor * rainIntensity;
        
        // Slight sway as if affected by wind
        const swayX = Math.sin(progress * Math.PI * 4) * 5 * this.scaleFactor;
        
        // Trigger particle falling effect through the renderer
        if (this.renderer && this.renderer.particleSystem) {
            // Enable falling behavior for particles during rain
            this.renderer.particleSystem.setGestureBehavior('falling', progress > 0 && progress < 1);
        }
        
        return {
            offsetX: swayX,
            offsetY: driftY,
            particleEffect: 'falling'  // Signal to particle system
        };
    }
    
    applyFloat(anim, progress) {
        // Ethereal floating motion with both vertical and horizontal drift
        const floatAmplitude = (anim.params?.amplitude || 20) * this.scaleFactor;
        const floatSpeed = anim.params?.speed || 1;
        
        // Primary vertical float with sine wave
        const floatY = Math.sin(progress * Math.PI * 2 * floatSpeed) * floatAmplitude;
        
        // Secondary horizontal drift for natural movement
        const driftX = Math.sin(progress * Math.PI * 3 * floatSpeed) * floatAmplitude * 0.3;
        
        // Slight scale pulsation for breathing effect
        const scalePulse = 1 + Math.sin(progress * Math.PI * 4 * floatSpeed) * 0.02;
        
        return {
            offsetX: driftX,
            offsetY: floatY,
            scale: scalePulse
        };
    }
    
    applyOrbital(anim, progress) {
        // Orbital motion - particles orbit around core, core stays still
        // This gesture is for particle motion only, not core movement
        return {
            // No core movement - orbital is a particle-only effect
            offsetX: 0,
            offsetY: 0
        };
    }
    
    applyHula(anim, progress) {
        // Hula motion - horizontal figure-8 pattern
        const amplitude = (anim.params?.amplitude || 40) * this.scaleFactor;
        const t = progress * Math.PI * 2;
        
        // Figure-8 parametric equations
        const x = Math.sin(t) * amplitude;
        const y = Math.sin(t * 2) * amplitude * 0.5;
        
        return {
            offsetX: x,
            offsetY: y
        };
    }
    
    applySparkle(anim, progress) {
        // Sparkle effect - make particles glow like fireflies
        // Each particle gets its own random phase for async blinking
        const intensity = anim.params?.intensity || 2.0;
        const baseGlow = 0.8;
        
        // Create firefly-like glow pattern for particles
        // Using time-based phase shifting for each particle
        const time = Date.now() * 0.001; // Convert to seconds
        
        // Main glow pulse for the effect
        const mainPulse = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;
        
        // This will be used by particles to create firefly effect
        // Each particle will add its own random offset to this
        return {
            particleGlow: intensity, // Intensity for individual particles
            glow: mainPulse, // Gentle overall glow
            fireflyTime: time, // Pass time for particle calculations
            fireflyEffect: true // Flag to enable firefly effect on particles
        };
    }
    
    applyShimmer(anim, progress) {
        // Shimmer effect - subtle, ethereal glow that travels across surface
        // Like moonlight on calm water
        
        const time = Date.now() * 0.001; // Current time in seconds
        const intensity = anim.params?.intensity || 0.3; // Very subtle
        
        // Single slow wave for gentle shimmer
        const wave = Math.sin(time * 2 + progress * Math.PI * 2);
        
        // Very subtle glow variation
        const glowEffect = 1 + wave * intensity;
        
        // Tiny breathing effect
        const scaleEffect = 1 + wave * 0.01; // Just 1% variation
        
        return {
            offsetX: 0, // No movement
            offsetY: 0, // No movement
            glow: glowEffect,
            scale: scaleEffect,
            // Particle-specific data
            particleGlow: 1 + wave * 0.2, // Very subtle particle effect
            shimmerTime: time,
            shimmerWave: wave,
            shimmerEffect: true // Flag to enable shimmer effect on particles
        };
    }
    
    applyWiggle(anim, progress) {
        // Hip-hop wiggle - 4 phase: center -> side -> opposite -> side -> center
        const amplitude = (anim.params?.amplitude || 15) * this.scaleFactor;
        
        // Random starting direction (1 for right, -1 for left)
        if (anim.wiggleDirection === undefined) {
            anim.wiggleDirection = Math.random() < 0.5 ? 1 : -1;
        }
        const direction = anim.wiggleDirection;
        
        // 4-phase movement pattern
        let wiggleX = 0;
        let rotation = 0;
        
        if (progress < 0.25) {
            // Phase 1: Center to first side (0-25%)
            const phase = progress / 0.25;
            wiggleX = amplitude * direction * phase;
            rotation = 3 * direction * phase;
        } else if (progress < 0.5) {
            // Phase 2: First side to opposite side (25-50%)
            const phase = (progress - 0.25) / 0.25;
            wiggleX = amplitude * direction * (1 - 2 * phase);
            rotation = 3 * direction * (1 - 2 * phase);
        } else if (progress < 0.75) {
            // Phase 3: Opposite side back to first side (50-75%)
            const phase = (progress - 0.5) / 0.25;
            wiggleX = amplitude * -direction * (1 - 2 * phase);
            rotation = 3 * -direction * (1 - 2 * phase);
        } else {
            // Phase 4: First side back to center (75-100%)
            const phase = (progress - 0.75) / 0.25;
            wiggleX = amplitude * direction * (1 - phase);
            rotation = 3 * direction * (1 - phase);
        }
        
        // Subtle bounce synced with movement
        const bounceY = Math.abs(Math.sin(progress * Math.PI * 4)) * amplitude * 0.15;
        
        return {
            offsetX: wiggleX,
            offsetY: -bounceY,
            rotation: rotation
        };
    }
    
    applyGroove(anim, progress) {
        // Groove motion - smooth, flowing dance movement
        const amplitude = (anim.params?.amplitude || 25) * this.scaleFactor;
        
        // Smoother wave pattern with organic flow
        const wave1 = Math.sin(progress * Math.PI * 2) * amplitude;
        const wave2 = Math.sin(progress * Math.PI * 3 + 0.5) * amplitude * 0.4;
        const grooveX = wave1 + wave2;
        
        // Gentle vertical bob with offset timing
        const grooveY = Math.sin(progress * Math.PI * 4 + 0.3) * amplitude * 0.25;
        
        // Subtle pulse that breathes naturally
        const scale = 1 + Math.sin(progress * Math.PI * 3 + 0.7) * 0.03;
        
        // Slight rotation for more natural movement
        const rotation = Math.sin(progress * Math.PI * 2 + 0.2) * 8;
        
        return {
            offsetX: grooveX,
            offsetY: grooveY,
            scale: scale,
            rotation: rotation
        };
    }
    
    applyPoint(anim, progress) {
        // Point gesture - directional lean/stretch with return to center
        
        // Random direction if not specified - only left or right
        if (anim.pointDirection === undefined) {
            // Randomly choose left (1) or right (-1)
            anim.pointDirection = Math.random() < 0.5 ? -1 : 1;
        }
        
        const direction = anim.params?.direction !== undefined ? anim.params.direction : anim.pointDirection;
        const distance = (anim.params?.distance || 40) * this.scaleFactor;
        
        // Three-phase animation:
        // 0.0-0.4: Move to point position
        // 0.4-0.6: Hold at point
        // 0.6-1.0: Return to center
        let motionProgress;
        let scaleProgress;
        
        if (progress < 0.4) {
            // Phase 1: Move to point (ease out)
            motionProgress = 1 - Math.pow(1 - (progress / 0.4), 3);
            scaleProgress = motionProgress;
        } else if (progress < 0.6) {
            // Phase 2: Hold at point
            motionProgress = 1.0;
            scaleProgress = 1.0;
        } else {
            // Phase 3: Return to center (ease in)
            motionProgress = Math.pow(1 - ((progress - 0.6) / 0.4), 3);
            scaleProgress = motionProgress;
        }
        
        // Move in direction (direction is -1 for left, 1 for right)
        const offsetX = direction * distance * motionProgress;
        const offsetY = -Math.abs(distance * 0.15 * motionProgress); // Slight upward movement when pointing
        
        // Stretch effect in pointing direction
        const scale = 1 + 0.15 * scaleProgress; // 15% stretch
        
        // Add slight tilt when pointing
        const rotation = direction * 5 * scaleProgress; // Tilt 5 degrees in pointing direction
        
        return {
            offsetX: offsetX,
            offsetY: offsetY,
            scale: scale,
            rotation: rotation
        };
    }
    
    applyLean(anim, progress) {
        // Lean gesture - tilt to one side
        const angle = anim.params?.angle || 15; // Degrees
        const side = anim.params?.side || 1; // 1 for right, -1 for left
        
        // Smooth ease in-out
        const easedProgress = Math.sin(progress * Math.PI);
        
        // Apply rotation and slight offset
        const rotation = angle * side * easedProgress;
        const offsetX = side * 10 * this.scaleFactor * easedProgress;
        
        return {
            offsetX: offsetX,
            rotation: rotation
        };
    }
    
    applyReach(anim, progress) {
        // Reach gesture - stretch upward or outward
        const direction = anim.params?.direction || -Math.PI/2; // Default upward
        const distance = (anim.params?.distance || 40) * this.scaleFactor;
        
        // Two-phase motion: reach out, then return
        let motionProgress;
        if (progress < 0.4) {
            // Reaching phase
            motionProgress = progress / 0.4;
        } else if (progress < 0.6) {
            // Hold phase
            motionProgress = 1;
        } else {
            // Return phase
            motionProgress = 1 - (progress - 0.6) / 0.4;
        }
        
        // Apply easing
        motionProgress = motionProgress * motionProgress * (3 - 2 * motionProgress);
        
        const offsetX = Math.cos(direction) * distance * motionProgress;
        const offsetY = Math.sin(direction) * distance * motionProgress;
        
        // Stretch slightly when reaching
        const scale = 1 + motionProgress * 0.15;
        
        return {
            offsetX: offsetX,
            offsetY: offsetY,
            scale: scale
        };
    }
    
    applyHeadBob(anim, progress) {
        // Head bob motion - rhythmic vertical movement
        const amplitude = (anim.params?.amplitude || 20) * this.scaleFactor;
        const frequency = anim.params?.frequency || 2;
        
        // Vertical bob with sharp down, smooth up
        const bobPhase = (progress * frequency) % 1;
        let bobY;
        if (bobPhase < 0.3) {
            // Quick down
            bobY = -amplitude * (bobPhase / 0.3);
        } else {
            // Smooth up
            bobY = -amplitude * (1 - (bobPhase - 0.3) / 0.7);
        }
        
        // Slight forward tilt on the down beat
        const rotation = bobPhase < 0.3 ? -3 : 0;
        
        return {
            offsetY: bobY,
            rotation: rotation
        };
    }
    
    applyOrbit(anim, progress) {
        // Orbit motion - circular path around center
        const radius = (anim.params?.radius || 30) * this.scaleFactor;
        const speed = anim.params?.speed || 1;
        
        // Circular motion
        const angle = progress * Math.PI * 2 * speed;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        return {
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    // Individual gesture methods - these will be moved from EmotiveRenderer
    startBounce() { this.startGesture('bounce'); }
    startPulse() { this.startGesture('pulse'); }
    startShake() { this.startGesture('shake'); }
    startSpin() { this.startGesture('spin'); }
    startNod() { this.startGesture('nod'); }
    startTilt() { this.startGesture('tilt'); }
    startExpand() { this.startGesture('expand'); }
    startContract() { this.startGesture('contract'); }
    startFlash() { this.startGesture('flash'); }
    startDrift() { this.startGesture('drift'); }
    startStretch() { this.startGesture('stretch'); }
    startGlow() { this.startGesture('glow'); }
    startFlicker() { this.startGesture('flicker'); }
    startVibrate() { this.startGesture('vibrate'); }
    startOrbital() { this.startGesture('orbital'); }
    startHula() { this.startGesture('hula'); }
    startWave() { this.startGesture('wave'); }
    startBreathe() { this.startGesture('breathe'); }
    startMorph() { this.startGesture('morph'); }
    startSlowBlink() { this.startGesture('slowBlink'); }
    startLook() { this.startGesture('look'); }
    startSettle() { this.startGesture('settle'); }
    startBreathIn() { this.startGesture('breathIn'); }
    startBreathOut() { this.startGesture('breathOut'); }
    startBreathHold() { this.startGesture('breathHold'); }
    startBreathHoldEmpty() { this.startGesture('breathHoldEmpty'); }
    startJump() { this.startGesture('jump'); }
    startSway() { this.startGesture('sway'); }
    startFloat() { this.startGesture('float'); }
    startRain() { this.startGesture('rain'); }
    startRunningMan() { this.startGesture('runningman'); }
    startCharleston() { this.startGesture('charleston'); }
    startSparkle() { this.startGesture('sparkle'); }
    startShimmer() { this.startGesture('shimmer'); }
    startWiggle() { this.startGesture('wiggle'); }
    startGroove() { this.startGesture('groove'); }
    startPoint() { this.startGesture('point'); }
    startLean() { this.startGesture('lean'); }
    startReach() { this.startGesture('reach'); }
    startHeadBob() { this.startGesture('headBob'); }
    startOrbit() { this.startGesture('orbit'); }
    
    applyRunningMan(anim, progress) {
        // Simple running shuffle - quick slide and step
        const slide = Math.sin(progress * Math.PI * 4) * 20 * this.scaleFactor;
        const step = -Math.abs(Math.sin(progress * Math.PI * 8)) * 10 * this.scaleFactor;
        
        return {
            offsetX: slide,
            offsetY: step,
            rotation: slide * 0.3,
            scaleY: 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.05
        };
    }
    
    applyCharleston(anim, progress) {
        // Charleston - crisscross kicks
        const kick = Math.sin(progress * Math.PI * 8) * 25 * this.scaleFactor;
        const hop = -Math.abs(Math.sin(progress * Math.PI * 8)) * 10 * this.scaleFactor;
        
        return {
            offsetX: kick,
            offsetY: hop,
            rotation: kick * 0.6,
            scaleY: 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.06
        };
    }
    
    startRunningMan() { this.startGesture('runningman'); }
    startCharleston() { this.startGesture('charleston'); }
}

export default GestureAnimator;