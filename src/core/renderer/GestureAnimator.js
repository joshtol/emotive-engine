/**
 * GestureAnimator - Handles all gesture animations for EmotiveRenderer
 * @module core/renderer/GestureAnimator
 */

import { getGesture } from '../gestures/gestureCacheWrapper.js';
// import { getGestureProperties } from '../gestures/gestureCacheWrapper.js'; // Unused
import musicalDuration from '../audio/MusicalDuration.js';
import { PhysicalGestureAnimator } from './PhysicalGestureAnimator.js';
import { VisualEffectAnimator } from './VisualEffectAnimator.js';
import { BreathGestureAnimator } from './BreathGestureAnimator.js';
import { MovementGestureAnimator } from './MovementGestureAnimator.js';
import { ShapeTransformAnimator } from './ShapeTransformAnimator.js';
import { ExpressionGestureAnimator } from './ExpressionGestureAnimator.js';
import { DirectionalGestureAnimator } from './DirectionalGestureAnimator.js';
import { ComplexAnimationAnimator } from './ComplexAnimationAnimator.js';

export class GestureAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeGestures = new Map();
        this.scaleFactor = renderer.scaleFactor || 1;

        // Initialize modular gesture animators
        this.physicalGestureAnimator = new PhysicalGestureAnimator(renderer);
        this.visualEffectAnimator = new VisualEffectAnimator(renderer);
        this.breathGestureAnimator = new BreathGestureAnimator(renderer);
        this.movementGestureAnimator = new MovementGestureAnimator(renderer);
        this.shapeTransformAnimator = new ShapeTransformAnimator(renderer);
        this.expressionGestureAnimator = new ExpressionGestureAnimator(renderer);
        this.directionalGestureAnimator = new DirectionalGestureAnimator(renderer);
        this.complexAnimationAnimator = new ComplexAnimationAnimator(renderer);

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

        // Get the gesture configuration (uses cache if available)
        const gesture = getGesture(gestureName);
        
        // Use cached properties for better performance
        // const cachedProperties = getGestureProperties(gestureName);
        
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
            // Chromatic aberration logging removed for production
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
                const { duration: configDuration } = gesture.config;
                duration = configDuration;
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
                // Clean up glow effect data to prevent accumulation
                if (gestureTransform.glowEffect) {
                    gestureTransform.glowEffect = null;
                    gestureTransform.particleGlow = null;
                    gestureTransform.glowTime = null;
                    gestureTransform.glowProgress = null;
                    gestureTransform.glowEnvelope = null;
                }
                // Clean up other effect data
                if (gestureTransform.fireflyEffect) {
                    gestureTransform.fireflyEffect = null;
                    gestureTransform.particleGlow = null;
                    gestureTransform.fireflyTime = null;
                }
                if (gestureTransform.flickerEffect) {
                    gestureTransform.flickerEffect = null;
                    gestureTransform.particleGlow = null;
                    gestureTransform.flickerTime = null;
                }
                if (gestureTransform.shimmerEffect) {
                    gestureTransform.shimmerEffect = null;
                    gestureTransform.particleGlow = null;
                    gestureTransform.shimmerTime = null;
                    gestureTransform.shimmerWave = null;
                }
            }
        }
        
        return transform;
    }

    /**
     * Update active gestures
     * @param {number} deltaTime - Time since last frame
     */
    update(_deltaTime) {
        // Update logic moved to applyGestureAnimations
        return this.applyGestureAnimations();
    }

    /**
     * Stop all active gestures
     */
    stopAllGestures() {
        // Reset all gesture animations
        Object.keys(this.gestureAnimations).forEach(key => {
            const anim = this.gestureAnimations[key];
            anim.active = false;
            anim.startTime = 0;
            anim.progress = 0;
            anim.params = null;
            
            // Clean up all glow effect data to prevent accumulation
            if (anim.glowEffect) {
                anim.glowEffect = null;
                anim.particleGlow = null;
                anim.glowTime = null;
                anim.glowProgress = null;
                anim.glowEnvelope = null;
            }
            // Clean up other effect data
            if (anim.fireflyEffect) {
                anim.fireflyEffect = null;
                anim.particleGlow = null;
                anim.fireflyTime = null;
            }
            if (anim.flickerEffect) {
                anim.flickerEffect = null;
                anim.particleGlow = null;
                anim.flickerTime = null;
            }
            if (anim.shimmerEffect) {
                anim.shimmerEffect = null;
                anim.particleGlow = null;
                anim.shimmerTime = null;
                anim.shimmerWave = null;
            }
            // Clean up flash wave data
            if (anim.flashWave) {
                anim.flashWave = null;
                anim.flashWaveData = null;
            }
        });
        this.activeGestures.clear();
    }
    
    /**
     * Get current active gesture information for particle system
     * Calculates progress in real-time to ensure accurate values during update phase
     * @returns {Object|null} Current gesture with particleMotion and progress, or null
     */
    getCurrentGesture() {
        const now = performance.now();

        // Priority: Find override gestures first (like orbital, hula), then other gestures
        const overrideGestures = ['orbital', 'hula', 'wave', 'spin'];

        // Check override gestures first
        for (const gestureName of overrideGestures) {
            const anim = this.gestureAnimations[gestureName];
            if (anim && anim.active) {
                // Get the actual gesture configuration (uses cache if available)
                const gesture = getGesture(gestureName);

                // Calculate progress in real-time (same logic as applyGestureAnimations)
                const elapsed = now - anim.startTime;
                const duration = anim.duration || (anim.params ? anim.params.duration : 1000);
                const progress = Math.min(elapsed / duration, 1);

                // Use the gesture's config for particleMotion, or create one from gesture type
                const particleMotion = gesture?.config?.particleMotion || {
                    type: gestureName,  // This ensures the modular gesture system will find it
                    strength: anim.params?.strength || 1.0
                };

                const gestureInfo = {
                    name: gestureName,
                    particleMotion,
                    progress,
                    params: anim.params
                };

                return gestureInfo;
            }
        }

        // Then check all other gestures
        for (const [gestureName, anim] of Object.entries(this.gestureAnimations)) {
            if (anim.active) {
                // Get the actual gesture configuration (uses cache if available)
                const gesture = getGesture(gestureName);

                // Calculate progress in real-time (same logic as applyGestureAnimations)
                const elapsed = now - anim.startTime;
                const duration = anim.duration || (anim.params ? anim.params.duration : 1000);
                const progress = Math.min(elapsed / duration, 1);

                // Use the gesture's config for particleMotion, or params if available
                const particleMotion = gesture?.config?.particleMotion ||
                                      anim.params?.particleMotion ||
                                      { type: gestureName, strength: anim.params?.strength || 1.0 };

                const gestureInfo = {
                    name: gestureName,
                    particleMotion,
                    progress,
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
        return this.physicalGestureAnimator.applyBounce(anim, progress);
    }
    
    applyPulse(anim, progress) {
        return this.shapeTransformAnimator.applyPulse(anim, progress);
    }
    
    applyShake(anim, progress) {
        return this.physicalGestureAnimator.applyShake(anim, progress);
    }
    
    applySpin(anim, progress) {
        return this.movementGestureAnimator.applySpin(anim, progress);
    }
    
    applyNod(anim, progress) {
        return this.expressionGestureAnimator.applyNod(anim, progress);
    }
    
    applyTilt(anim, progress) {
        return this.expressionGestureAnimator.applyTilt(anim, progress);
    }
    
    applyExpand(anim, progress) {
        return this.shapeTransformAnimator.applyExpand(anim, progress);
    }
    
    applyContract(anim, progress) {
        return this.shapeTransformAnimator.applyContract(anim, progress);
    }
    
    applyFlash(anim, progress) {
        return this.visualEffectAnimator.applyFlash(anim, progress);
    }
    
    applyDrift(anim, progress) {
        return this.movementGestureAnimator.applyDrift(anim, progress);
    }
    
    applyStretch(anim, progress) {
        return this.shapeTransformAnimator.applyStretch(anim, progress);
    }
    
    applyGlow(anim, progress) {
        return this.visualEffectAnimator.applyGlow(anim, progress);
    }
    
    applyFlashWave(anim, progress) {
        return this.complexAnimationAnimator.applyFlashWave(anim, progress);
    }
    
    applyFlicker(anim, progress) {
        return this.visualEffectAnimator.applyFlicker(anim, progress);
    }
    
    applyVibrate(anim, progress) {
        return this.physicalGestureAnimator.applyVibrate(anim, progress);
    }
    
    applyWave(anim, progress) {
        return this.movementGestureAnimator.applyWave(anim, progress);
    }
    
    applyBreathe(anim, progress) {
        return this.breathGestureAnimator.applyBreathe(anim, progress);
    }
    
    applyMorph(anim, progress) {
        return this.shapeTransformAnimator.applyMorph(anim, progress);
    }
    
    applySlowBlink(anim, progress) {
        return this.expressionGestureAnimator.applySlowBlink(anim, progress);
    }
    
    applyLook(anim, progress) {
        return this.expressionGestureAnimator.applyLook(anim, progress);
    }
    
    applySettle(anim, progress) {
        return this.expressionGestureAnimator.applySettle(anim, progress);
    }
    
    applyBreathIn(anim, progress) {
        return this.breathGestureAnimator.applyBreathIn(anim, progress);
    }

    applyBreathOut(anim, progress) {
        return this.breathGestureAnimator.applyBreathOut(anim, progress);
    }

    applyBreathHold(anim, _progress) {
        return this.breathGestureAnimator.applyBreathHold(anim, _progress);
    }

    applyBreathHoldEmpty(anim, _progress) {
        return this.breathGestureAnimator.applyBreathHoldEmpty(anim, _progress);
    }
    
    applyJump(anim, progress) {
        return this.physicalGestureAnimator.applyJump(anim, progress);
    }
    
    applySway(anim, progress) {
        return this.movementGestureAnimator.applySway(anim, progress);
    }
    
    applyRain(anim, progress) {
        return this.complexAnimationAnimator.applyRain(anim, progress);
    }
    
    applyFloat(anim, progress) {
        return this.movementGestureAnimator.applyFloat(anim, progress);
    }
    
    applyOrbital(anim, progress) {
        return this.movementGestureAnimator.applyOrbital(anim, progress);
    }
    
    applyHula(anim, progress) {
        return this.movementGestureAnimator.applyHula(anim, progress);
    }
    
    applySparkle(anim, progress) {
        return this.visualEffectAnimator.applySparkle(anim, progress);
    }
    
    applyShimmer(anim, progress) {
        return this.visualEffectAnimator.applyShimmer(anim, progress);
    }
    
    applyWiggle(anim, progress) {
        return this.physicalGestureAnimator.applyWiggle(anim, progress);
    }
    
    applyGroove(anim, progress) {
        return this.complexAnimationAnimator.applyGroove(anim, progress);
    }
    
    applyPoint(anim, progress) {
        return this.directionalGestureAnimator.applyPoint(anim, progress);
    }
    
    applyLean(anim, progress) {
        return this.directionalGestureAnimator.applyLean(anim, progress);
    }
    
    applyReach(anim, progress) {
        return this.directionalGestureAnimator.applyReach(anim, progress);
    }
    
    applyHeadBob(anim, progress) {
        return this.complexAnimationAnimator.applyHeadBob(anim, progress);
    }
    
    applyOrbit(anim, progress) {
        return this.movementGestureAnimator.applyOrbit(anim, progress);
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
        return this.complexAnimationAnimator.applyRunningMan(anim, progress);
    }
    
    applyCharleston(anim, progress) {
        return this.complexAnimationAnimator.applyCharleston(anim, progress);
    }
    
    startRunningManGesture() { this.startGesture('runningman'); }
    startCharlestonGesture() { this.startGesture('charleston'); }

    /**
     * Pause current animation (called on tab switch)
     */
    pauseCurrentAnimation() {
        // Store pause time for all active animations
        const now = performance.now();
        for (const [, anim] of Object.entries(this.gestureAnimations)) {
            if (anim.active) {
                anim.pausedAt = now;
                anim.pausedProgress = anim.progress;
            }
        }
        this.isPaused = true;
    }

    /**
     * Resume animations after pause
     */
    resumeAnimation() {
        if (!this.isPaused) return;

        const now = performance.now();
        for (const [, anim] of Object.entries(this.gestureAnimations)) {
            if (anim.active && anim.pausedAt) {
                // Adjust start time to account for pause
                const pauseDuration = now - anim.pausedAt;
                if (anim.startTime) {
                    anim.startTime += pauseDuration;
                }
                // Clear pause state
                delete anim.pausedAt;
                delete anim.pausedProgress;
            }
        }
        this.isPaused = false;
    }

    /**
     * Reset all gesture animations
     */
    reset() {
        // Clear all active animations
        for (const [, anim] of Object.entries(this.gestureAnimations)) {
            anim.active = false;
            anim.progress = 0;
            anim.params = {};
            delete anim.startTime;
            delete anim.pausedAt;
            delete anim.pausedProgress;
        }
        this.activeGestures.clear();
        this.isPaused = false;
    }

    /**
     * Destroy the gesture animator and release all resources
     * Prevents memory leaks by clearing references and cleaning up state
     */
    destroy() {
        // Stop all active gestures first
        this.stopAllGestures();

        // Destroy all modular animators
        if (this.physicalGestureAnimator && typeof this.physicalGestureAnimator.destroy === 'function') {
            this.physicalGestureAnimator.destroy();
        }
        if (this.visualEffectAnimator && typeof this.visualEffectAnimator.destroy === 'function') {
            this.visualEffectAnimator.destroy();
        }
        if (this.breathGestureAnimator && typeof this.breathGestureAnimator.destroy === 'function') {
            this.breathGestureAnimator.destroy();
        }
        if (this.movementGestureAnimator && typeof this.movementGestureAnimator.destroy === 'function') {
            this.movementGestureAnimator.destroy();
        }
        if (this.shapeTransformAnimator && typeof this.shapeTransformAnimator.destroy === 'function') {
            this.shapeTransformAnimator.destroy();
        }
        if (this.expressionGestureAnimator && typeof this.expressionGestureAnimator.destroy === 'function') {
            this.expressionGestureAnimator.destroy();
        }
        if (this.directionalGestureAnimator && typeof this.directionalGestureAnimator.destroy === 'function') {
            this.directionalGestureAnimator.destroy();
        }
        if (this.complexAnimationAnimator && typeof this.complexAnimationAnimator.destroy === 'function') {
            this.complexAnimationAnimator.destroy();
        }

        // Clear modular animator references
        this.physicalGestureAnimator = null;
        this.visualEffectAnimator = null;
        this.breathGestureAnimator = null;
        this.movementGestureAnimator = null;
        this.shapeTransformAnimator = null;
        this.expressionGestureAnimator = null;
        this.directionalGestureAnimator = null;
        this.complexAnimationAnimator = null;

        // Clear gesture animations state
        this.gestureAnimations = null;

        // Clear active gestures map
        this.activeGestures.clear();
        this.activeGestures = null;

        // Clear renderer reference
        this.renderer = null;

        // Reset other properties
        this.scaleFactor = null;
        this.isPaused = false;
    }
}

export default GestureAnimator;