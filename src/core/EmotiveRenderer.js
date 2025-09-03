/**
 * EmotiveRenderer - Classic Emotive-style rendering with single orb and white core
 * Provides the original minimalist aesthetic with emotional variations
 */

import { interpolateHsl } from '../utils/colorUtils.js';
import GestureCompositor from './GestureCompositor.js';

class EmotiveRenderer {
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.ctx = canvasManager.getContext();
        
        // Gesture compositor for emotion/undertone modulation
        this.gestureCompositor = new GestureCompositor();
        
        // Configuration - matching original Emotive proportions
        this.config = {
            coreColor: options.coreColor || '#FFFFFF',
            coreSizeDivisor: options.coreSizeDivisor || 12,  // Core radius = min(width,height) / 12
            glowMultiplier: options.glowMultiplier || 2.5,   // Glow radius = core radius * 2.5
            defaultGlowColor: options.defaultGlowColor || '#14B8A6',  // Teal
            breathingSpeed: options.breathingSpeed || 0.42,  // 16 breaths/min (0.42 rad/s = 4 sec/cycle = 15-16 bpm)
            breathingDepth: options.breathingDepth || 0.08,  // 8% size variation for visible breathing
            renderingStyle: options.renderingStyle || 'classic',
            baseScale: options.baseScale || 1.0,  // Global scale multiplier for entire system
            referenceSize: 400  // Reference canvas size for scale calculations
        };
        
        // State
        this.state = {
            emotion: 'neutral',
            glowColor: this.config.defaultGlowColor,
            glowIntensity: 1.0,
            breathRate: 1.0,
            breathDepth: this.config.breathingDepth,
            coreJitter: false,
            speaking: false,
            recording: false,
            sleeping: false,
            blinking: false,
            gazeOffset: { x: 0, y: 0 },
            gazeIntensity: 0,
            gazeLocked: false,
            zenVortexIntensity: 1.0,  // Adjustable whirlpool intensity for zen
            // Suspicion state
            squintAmount: 0,         // 0-1, how much the eye is narrowed
            targetSquintAmount: 0,   // Target squint amount to animate to
            scanPhase: 0,            // Current phase of scanning animation
            lastScanTime: 0,         // Last time we did a scan
            isSuspicious: false,     // Track if we're in suspicion mode
            // Custom scale for breathing
            customScale: null        // When set, overrides normal breathing scale
        };
        
        // Animation state
        this.breathingPhase = 0;
        this.blinkTimer = 0;
        
        // Track animation frame IDs to prevent memory leaks
        this.animationFrameIds = {
            colorTransition: null,
            eyeClose: null,
            eyeOpen: null,
            zenEnter: null,
            zenExit: null
        };
        
        // Offscreen canvas for double buffering
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.initOffscreenCanvas();
        this.nextBlinkTime = this.getRandomBlinkTime();
        
        // Gesture animations
        this.gestureAnimations = {
            bounce: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            pulse: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            shake: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            spin: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            nod: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            tilt: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            expand: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            contract: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            flash: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            drift: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null,
                startX: 0,
                startY: 0
            },
            stretch: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            glow: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            flicker: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            vibrate: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            wave: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathe: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            morph: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            slowBlink: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            look: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null,
                targetX: 0,
                targetY: 0
            },
            settle: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathIn: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathOut: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathHold: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            breathHoldEmpty: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            },
            jump: {
                active: false,
                startTime: 0,
                progress: 0,
                params: null
            }
        };
        
        // Episodic effects for undertones
        this.episodicEffects = {
            nervous: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 2000 // 3-5 seconds
            },
            confident: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 2000 // 4-6 seconds
            },
            tired: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 5000 + Math.random() * 2000 // 5-7 seconds
            },
            intense: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 3000 // 3-6 seconds
            },
            subdued: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 3000 // 4-7 seconds
            }
        };
        
        // Speaking animation
        this.speakingRings = [];
        this.maxRings = 5;
        this.ringSpawnTimer = 0;
        this.ringSpawnInterval = 200; // ms between rings
        
        // Recording animation (rings move inward)
        this.recordingRings = [];
        this.recordingPulse = 0;
        
        // Sleep state - consolidated here for visualization
        this.sleepZ = [];
        
        // Zen state animation
        this.zenTransition = {
            active: false,
            phase: null, // 'entering', 'in', 'exiting'
            startTime: 0,
            previousEmotion: null,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0, // 0 = circle, 1 = full lotus
            petalSpread: 0, // 0 = closed, 1 = fully open
            smileCurve: 0  // 0 = straight, 1 = full smile
        };
        
        // Standardized color transition system
        this.colorTransition = {
            active: false,
            fromColor: this.state.glowColor,
            toColor: this.state.glowColor,
            fromIntensity: this.state.glowIntensity,
            toIntensity: this.state.glowIntensity,
            progress: 0,
            startTime: 0,
            duration: 1500  // Default 1.5s
        };
        
        // Comprehensive undertone modifiers
        this.undertoneModifiers = {
            nervous: {
                // Color - subtle shimmer, no major shift
                hueShift: 0,          // No hue change
                saturationMult: 1.05, // Tiny bit more vivid
                brightnessMult: 1.0,  // Normal brightness
                brightnessFlicker: 0.05, // 5% brightness variation
                // Visual
                sizeMultiplier: 1.0,  // Normal size
                jitterAmount: 0,      // No constant jitter - handled by episodic flutter
                episodicFlutter: true, // Occasional butterfly moments
                glowRadiusMult: 1.0,  // Normal glow
                glowPulse: 0.05,      // 5% subtle heartbeat pulse
                // Breathing
                breathRateMult: 1.1,  // Slightly faster
                breathDepthMult: 0.9, // Slightly shallower
                breathIrregular: true, // Occasional catch in rhythm
                // Particles - keep emotion behavior, add flutter
                particleRateMult: 1.1, // 10% more particles
                particleBehavior: null, // Don't override emotion behavior
                particleSpeedMult: 1.1, // 10% faster
                particleWobble: true    // Add subtle wobble to paths
            },
            confident: {
                // Color - warmer, vibrant
                hueShift: 15,         // Warmer but not overwhelming
                saturationMult: 1.2,  // More vibrant
                brightnessMult: 1.1,  // Slightly brighter
                // Visual
                sizeMultiplier: 1.0,  // Normal size until episodes
                jitterAmount: 0,      // Rock solid
                episodicPowerPose: true, // Occasional chest puffs
                glowRadiusMult: 1.15, // Slightly expanded glow
                // Breathing
                breathRateMult: 0.95, // Slightly slower, controlled
                breathDepthMult: 1.1, // Fuller breaths
                breathIrregular: false,
                // Particles
                particleRateMult: 1.1,
                particleBehavior: null, // Keep emotion behavior
                particleSpeedMult: 1.0,
                particleBurst: true   // Occasional triumphant spurts
            },
            tired: {
                // Color - slightly cooler, less saturated
                hueShift: -5,         // Slightly cooler
                saturationMult: 0.7,  // Less vibrant
                brightnessMult: 0.85, // Slightly darker
                // Visual
                sizeMultiplier: 0.95, // Slightly smaller
                jitterAmount: 0,
                episodicMicroSleep: true, // Occasional drowsy sags
                glowRadiusMult: 0.9,  // Slightly reduced glow
                // Breathing
                breathRateMult: 0.8,  // Slower
                breathDepthMult: 1.2, // Deeper breaths
                breathIrregular: false,
                // Particles
                particleRateMult: 0.7, // Fewer particles
                particleBehavior: null, // Keep emotion behavior
                particleSpeedMult: 0.8,
                particleSlowdown: true // Occasional near-stops
            },
            intense: {
                // Color - high contrast, saturated
                hueShift: 5,          // Very slightly warmer
                saturationMult: 1.3,  // More saturated
                brightnessMult: 1.15, // Brighter
                // Visual
                sizeMultiplier: 1.0,  // Normal until focus moments
                jitterAmount: 0,      // Still, focused
                episodicLaserFocus: true, // Brief concentration moments
                glowRadiusMult: 1.2,  // Expanded glow
                // Breathing
                breathRateMult: 1.2,  // Faster but controlled
                breathDepthMult: 0.9, // Shallower, focused breaths
                breathIrregular: false,
                // Particles
                particleRateMult: 1.5, // More particles
                particleBehavior: null, // Keep emotion behavior
                particleSpeedMult: 1.2,
                particleSpiral: true   // Brief tight spirals
            },
            subdued: {
                // Color - slightly muted
                hueShift: -10,        // Slightly cooler
                saturationMult: 0.75, // Somewhat muted
                brightnessMult: 0.9,  // Slightly dimmed
                // Visual
                sizeMultiplier: 0.95, // Slightly smaller
                jitterAmount: 0,
                episodicWithdrawal: true, // Brief inward pulls
                glowRadiusMult: 0.85, // Slightly reduced glow
                // Breathing
                breathRateMult: 0.9,  // Slightly slower
                breathDepthMult: 0.9, // Slightly shallow
                breathIrregular: false,
                // Particles
                particleRateMult: 0.8, // Fewer particles
                particleBehavior: null, // Keep emotion behavior
                particleSpeedMult: 0.9,
                particlePullInward: true // Brief inward pulls
            }
        };
        
        // Performance
        this.lastFrameTime = 0;
        
        console.log('EmotiveRenderer initialized with classic style');
    }
    
    /**
     * Initialize offscreen canvas for double buffering
     */
    initOffscreenCanvas() {
        // Create offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
            alpha: true,
            desynchronized: true,  // Reduces latency
            willReadFrequently: false
        });
        
        // Match dimensions
        this.updateOffscreenSize();
    }
    
    /**
     * Update offscreen canvas size to match main canvas
     */
    updateOffscreenSize() {
        if (this.offscreenCanvas && this.canvasManager) {
            const width = this.canvasManager.canvas.width;
            const height = this.canvasManager.canvas.height;
            
            if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
                this.offscreenCanvas.width = width;
                this.offscreenCanvas.height = height;
            }
        }
    }
    
    /**
     * Main render method
     */
    render(state, deltaTime, gestureTransform = null) {
        // Store gestureTransform for use in other methods
        this.gestureTransform = gestureTransform;
        
        // Update offscreen canvas size if needed
        this.updateOffscreenSize();
        
        // Get logical dimensions from canvasManager (not scaled by DPR)
        const logicalWidth = this.canvasManager.width || this.canvas.width || 400;
        const logicalHeight = this.canvasManager.height || this.canvas.height || 400;
        
        // Store original context and switch to offscreen for double buffering
        const originalCtx = this.ctx;
        this.ctx = this.offscreenCtx;
        
        // Clear offscreen canvas for fresh render
        this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Update animation timers
        this.updateTimers(deltaTime);
        
        // Calculate dimensions - using logical size for proper scaling
        const canvasSize = Math.min(logicalWidth, logicalHeight);
        let centerX = logicalWidth / 2;
        let centerY = logicalHeight / 2;
        
        // Calculate global scale factor based on canvas size and baseScale config
        this.scaleFactor = (canvasSize / this.config.referenceSize) * this.config.baseScale;
        
        // Apply gesture transform if present
        let scaleMultiplier = 1;
        let rotationAngle = 0;
        let glowMultiplier = 1;
        
        if (gestureTransform) {
            centerX += gestureTransform.x || 0;
            centerY += gestureTransform.y || 0;
            scaleMultiplier = gestureTransform.scale || 1;
            rotationAngle = (gestureTransform.rotation || 0) * Math.PI / 180;
            glowMultiplier = gestureTransform.glowIntensity || 1;
        }
        
        // Apply gesture animations (these modify the values directly)
        const gestureTransforms = this.applyGestureAnimations();
        if (gestureTransforms) {
            centerX += gestureTransforms.offsetX || 0;
            centerY += gestureTransforms.offsetY || 0;
            scaleMultiplier *= gestureTransforms.scale || 1;
            rotationAngle += (gestureTransforms.rotation || 0) * Math.PI / 180;
            glowMultiplier *= gestureTransforms.glow || 1;
        }
        
        // Apply zen levitation - lazy floating when in zen state
        if (this.state.emotion === 'zen' && this.zenTransition.phase === 'in') {
            const time = Date.now() / 1000;
            // Lazy vertical float - slow sine wave
            const floatY = Math.sin(time * 0.3) * 15 * this.scaleFactor; // Very slow, 15px amplitude
            // Gentle horizontal sway - even slower
            const swayX = Math.sin(time * 0.2) * 8 * this.scaleFactor; // Subtle 8px sway
            // Small rotation for ethereal effect
            const floatRotation = Math.sin(time * 0.25) * 0.05; // ±3 degrees
            
            centerY += floatY;
            centerX += swayX;
            rotationAngle += floatRotation;
        }
        
        // Apply sleep state modifications (with animated dimming)
        let sleepOpacityMod = 1;
        let sleepScaleMod = 1;
        if (this.state.sleeping) {
            // Use animated values if available, otherwise defaults
            sleepOpacityMod = this.state.sleepDimness !== undefined ? this.state.sleepDimness : 0.6;
            sleepScaleMod = this.state.sleepScale !== undefined ? this.state.sleepScale : 0.9;
            this.state.breathRate = 0.5;  // Slower breathing
            this.state.breathDepth = 0.15; // Deeper breaths
        }
        
        // Calculate breathing factors - INVERSE for core and glow
        // Use custom scale if set (for breathing exercises), otherwise use normal breathing
        let coreBreathFactor, glowBreathFactor;
        
        if (this.state.customScale !== null) {
            // Use custom scale directly for breathing exercises
            coreBreathFactor = this.state.customScale;
            glowBreathFactor = 1 + (this.state.customScale - 1) * 0.5; // Glow follows at half intensity
        } else {
            // Normal breathing behavior
            // Zen uses full breath depth regardless of breathRate
            const effectiveBreathDepth = this.state.emotion === 'zen' ? this.state.breathDepth : 
                                         this.state.breathDepth * this.state.breathRate;
            coreBreathFactor = 1 + Math.sin(this.breathingPhase) * effectiveBreathDepth;
            glowBreathFactor = 1 - Math.sin(this.breathingPhase) * effectiveBreathDepth * 0.5; // Glow breathes opposite, less pronounced
        }
        
        // Add nervous glow pulse if needed
        if (this.state.undertone === 'nervous' && this.undertoneModifiers.nervous.glowPulse) {
            const nervousPulse = Math.sin(Date.now() / 200) * this.undertoneModifiers.nervous.glowPulse; // Fast subtle pulse
            glowBreathFactor *= (1 + nervousPulse);
        }
        
        // Calculate core dimensions - using unified scale factor
        const baseRadius = (this.config.referenceSize / this.config.coreSizeDivisor) * this.scaleFactor;
        
        // Apply undertone size multiplier
        const undertoneSizeMult = this.state.sizeMultiplier || 1.0;
        
        let coreRadius = baseRadius * coreBreathFactor * scaleMultiplier * sleepScaleMod * undertoneSizeMult;
        const glowRadius = baseRadius * this.config.glowMultiplier * glowBreathFactor * this.state.glowIntensity * glowMultiplier * scaleMultiplier * sleepScaleMod * undertoneSizeMult;  // Breathes inversely
        
        // Apply blinking (only when not sleeping or zen)
        if (this.state.blinking && !this.state.sleeping && this.state.emotion !== 'zen') {
            const blinkProgress = Math.min(this.blinkTimer / 150, 1);
            const blinkCurve = Math.sin(blinkProgress * Math.PI);
            coreRadius *= (1 - blinkCurve * 0.7); // Squish vertically by 70%
        }
        
        // Apply jitter if needed (anger, fear, or undertone jitter)
        let jitterX = 0, jitterY = 0;
        const jitterAmount = this.state.jitterAmount || 0;
        
        // Handle episodic effects for undertones
        if (this.currentUndertone && this.episodicEffects[this.currentUndertone]) {
            const episode = this.episodicEffects[this.currentUndertone];
            const modifier = this.undertoneModifiers[this.currentUndertone];
            const now = performance.now();
            
            // Check if it's time to trigger a new episode
            if (!episode.active && now >= episode.nextTrigger) {
                episode.active = true;
                episode.startTime = now;
                
                // Set episode parameters based on undertone type
                switch(this.currentUndertone) {
                    case 'nervous':
                        episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                        episode.intensity = 2 + Math.random(); // 2-3px flutter
                        episode.nextTrigger = now + 3000 + Math.random() * 2000; // 3-5 seconds
                        break;
                    case 'confident':
                        episode.duration = 1000 + Math.random() * 1000; // 1-2 seconds
                        episode.intensity = 0.15; // 15% size expansion
                        episode.nextTrigger = now + 4000 + Math.random() * 2000; // 4-6 seconds
                        break;
                    case 'tired':
                        episode.duration = 1000 + Math.random() * 2000; // 1-3 seconds
                        episode.intensity = 0.2; // 20% size reduction
                        episode.nextTrigger = now + 5000 + Math.random() * 2000; // 5-7 seconds
                        break;
                    case 'intense':
                        episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                        episode.intensity = 0.5; // 50% glow boost, 5% size shrink
                        episode.nextTrigger = now + 3000 + Math.random() * 3000; // 3-6 seconds
                        break;
                    case 'subdued':
                        episode.duration = 2000 + Math.random() * 1000; // 2-3 seconds
                        episode.intensity = 0.3; // 30% glow dim, 10% size shrink
                        episode.nextTrigger = now + 4000 + Math.random() * 3000; // 4-7 seconds
                        break;
                }
            }
            
            // Apply episode effects if active
            if (episode.active) {
                const elapsed = now - episode.startTime;
                
                if (elapsed < episode.duration) {
                    const progress = elapsed / episode.duration;
                    
                    // Apply different effects based on undertone
                    switch(this.currentUndertone) {
                        case 'nervous':
                            // Quick shiver that settles
                            const damping = 1 - progress;
                            const frequency = 15;
                            const flutter = Math.sin(progress * Math.PI * frequency) * damping;
                            jitterX = flutter * episode.intensity;
                            jitterY = flutter * episode.intensity * 0.7;
                            break;
                            
                        case 'confident':
                            // Smooth chest puff that settles
                            const puffCurve = Math.sin(progress * Math.PI); // Smooth rise and fall
                            coreRadius *= (1 + episode.intensity * puffCurve);
                            glowRadius *= (1 + episode.intensity * 0.5 * puffCurve);
                            break;
                            
                        case 'tired':
                            // Drowsy sag with slow recovery
                            const sagCurve = Math.sin(progress * Math.PI * 0.5); // Slow droop
                            coreRadius *= (1 - episode.intensity * sagCurve);
                            // Also affect vertical position slightly
                            jitterY += sagCurve * 5; // Slight downward sag
                            break;
                            
                        case 'intense':
                            // Sharp contraction with glow surge
                            const focusCurve = 1 - Math.cos(progress * Math.PI); // Quick in-out
                            coreRadius *= (1 - 0.05 * focusCurve); // 5% shrink
                            glowRadius *= (1 + episode.intensity * focusCurve); // 50% glow boost
                            break;
                            
                        case 'subdued':
                            // Gentle inward pull
                            const withdrawCurve = Math.sin(progress * Math.PI * 0.5); // Slow pull
                            coreRadius *= (1 - 0.1 * withdrawCurve); // 10% shrink
                            glowRadius *= (1 - episode.intensity * withdrawCurve); // 30% glow dim
                            break;
                    }
                } else {
                    // Episode finished
                    episode.active = false;
                }
            }
        } else if (this.state.coreJitter || jitterAmount > 0) {
            // Regular jitter for other emotions
            const jitterStrength = Math.max(jitterAmount, this.state.coreJitter ? 2 : 0);
            jitterX = (Math.random() - 0.5) * jitterStrength;
            jitterY = (Math.random() - 0.5) * jitterStrength;
        }
        
        // Calculate positions with gaze offset
        const coreX = centerX + this.state.gazeOffset.x + jitterX;
        const coreY = centerY + this.state.gazeOffset.y + jitterY;
        
        // Apply rotation if present
        if (rotationAngle !== 0) {
            this.ctx.save();
            this.ctx.translate(coreX, coreY);
            this.ctx.rotate(rotationAngle);
            this.ctx.translate(-coreX, -coreY);
        }
        
        // Render glow (modified for recording state)
        // Skip normal glow during zen transition to prevent flash
        if (this.zenTransition.active) {
            // Zen handles its own glow in renderZenCore
            // Do nothing here to prevent flash
        } else if (this.state.recording) {
            // Pulsating red glow for recording
            const time = Date.now() / 1000;
            const recordPulse = 0.7 + Math.sin(time * 2) * 0.3; // Slower, gentle pulse
            // Don't apply gesture glow multiplier to recording glow to keep it stable
            const recordingGlowRadius = (this.config.referenceSize / this.config.coreSizeDivisor) * 2.5 * this.scaleFactor;
            this.renderRecordingGlow(coreX, coreY, recordingGlowRadius * 1.1, recordPulse);
        } else {
            // Normal glow
            this.renderGlow(coreX, coreY, glowRadius);
        }
        
        // Render speaking rings if active
        if (this.state.speaking) {
            this.renderSpeakingRings(coreX, coreY, coreRadius, deltaTime);
        }
        
        // Apply sleep opacity to core
        if (this.state.sleeping) {
            this.ctx.globalAlpha = sleepOpacityMod;
        }
        
        // Render core
        this.renderCore(coreX, coreY, coreRadius, deltaTime);
        
        // Reset alpha
        if (this.state.sleeping) {
            this.ctx.globalAlpha = 1;
        }
        
        // Restore context if rotated
        if (rotationAngle !== 0) {
            this.ctx.restore();
        }
        
        // Render recording indicator AFTER context restore so it's not affected by transforms
        if (this.state.recording) {
            // ABSOLUTELY FIXED position - no gesture or scale factors affect this
            const fixedX = logicalWidth / 2 - 100;  // Fixed 100px left of center
            const fixedY = logicalHeight / 2 - 100;  // Fixed 100px above center
            this.renderRecordingIndicator(fixedX, fixedY);
        }
        
        // Add sleep indicator if sleeping
        if (this.state.sleeping) {
            this.renderSleepIndicator(centerX, centerY - glowRadius - 20, deltaTime);
        }
        
        // Restore original context
        this.ctx = originalCtx;
        
        // Blit offscreen canvas to main canvas (single draw operation)
        originalCtx.drawImage(this.offscreenCanvas, 0, 0);
    }
    
    /**
     * Render the glowing aura
     */
    renderGlow(x, y, radius) {
        // Get canvas dimensions with fallbacks
        const canvasWidth = this.canvas?.width || 600;
        const canvasHeight = this.canvas?.height || 600;
        
        // Limit radius to prevent clipping at canvas boundaries
        const maxRadius = Math.min(radius, 
            x - 10,  // Distance to left edge
            y - 10,  // Distance to top edge
            canvasWidth - x - 10,  // Distance to right edge
            canvasHeight - y - 10  // Distance to bottom edge
        );
        const safeRadius = Math.max(50, maxRadius); // Ensure minimum radius
        
        // Create radial gradient for the glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, safeRadius);
        
        // Create gradient with emotion color - fade out before edge
        const color = this.state.glowColor;
        gradient.addColorStop(0, this.hexToRgba(color, 0.6));
        gradient.addColorStop(0.3, this.hexToRgba(color, 0.4));
        gradient.addColorStop(0.6, this.hexToRgba(color, 0.2));
        gradient.addColorStop(0.85, this.hexToRgba(color, 0.05)); // Fade earlier to prevent hard edge
        gradient.addColorStop(1, this.hexToRgba(color, 0));
        
        // Draw the glow as a circle, not filling the entire canvas
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Render recording glow (pulsating red)
     */
    renderRecordingGlow(x, y, radius, intensity) {
        // Get canvas dimensions with fallbacks
        const canvasWidth = this.canvas?.width || 600;
        const canvasHeight = this.canvas?.height || 600;
        
        // Limit radius to prevent clipping at canvas boundaries
        const maxRadius = Math.min(radius, 
            x - 10,  // Distance to left edge
            y - 10,  // Distance to top edge
            canvasWidth - x - 10,  // Distance to right edge
            canvasHeight - y - 10  // Distance to bottom edge
        );
        const safeRadius = Math.max(50, maxRadius); // Ensure minimum radius
        
        // Create radial gradient for the recording glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, safeRadius);
        
        // Pulsating red gradient - fade out before edge to prevent square clipping
        gradient.addColorStop(0, this.hexToRgba('#FF0000', 0.7 * intensity));
        gradient.addColorStop(0.3, this.hexToRgba('#FF0000', 0.5 * intensity));
        gradient.addColorStop(0.6, this.hexToRgba('#FF0000', 0.3 * intensity));
        gradient.addColorStop(0.85, this.hexToRgba('#FF0000', 0.1 * intensity)); // Fade earlier
        gradient.addColorStop(1, this.hexToRgba('#FF0000', 0));
        
        // Draw the recording glow
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Render the white core with eye narrowing effect
     */
    renderCore(x, y, radius, deltaTime = 16.67) {
        // Check if we're in zen transition
        if (this.zenTransition.active) {
            this.renderZenCore(x, y, radius);
            return;
        }
        
        this.ctx.save();
        
        // Get gaze intensity for eye narrowing (from GazeTracker proximity)
        const gazeIntensity = this.state.gazeIntensity || 0;
        
        // Calculate eye narrowing effect based on proximity
        let scaleX = 1 + 0.3 * gazeIntensity;  // Widen horizontally up to 30%
        let scaleY = 1 - 0.5 * gazeIntensity;  // Narrow vertically up to 50%
        
        // Apply emotion-specific eye settings (zen, focused)
        if (this.state.emotionEyeOpenness !== undefined) {
            scaleY = this.state.emotionEyeOpenness;
        }
        
        // Apply eye closing for sleep state
        if (this.state.sleeping) {
            scaleY *= this.state.eyeOpenness || 0.1;  // Close eye when sleeping
        }
        
        // Apply eye animation from gestures (like slow blink)
        if (this.gestureTransform && this.gestureTransform.eyeOpenness !== undefined) {
            scaleY *= this.gestureTransform.eyeOpenness;
        }
        
        // Animate squint amount smoothly
        if (this.state.targetSquintAmount !== undefined) {
            const squintSpeed = 0.02; // Speed of squint animation
            if (Math.abs(this.state.squintAmount - this.state.targetSquintAmount) > 0.01) {
                this.state.squintAmount += (this.state.targetSquintAmount - this.state.squintAmount) * squintSpeed * (deltaTime / 16.67);
            } else {
                this.state.squintAmount = this.state.targetSquintAmount;
            }
        }
        
        // Apply suspicion squinting
        if (this.state.isSuspicious) {
            // Narrow the eye for suspicion (gradual animation)
            scaleY *= (1 - this.state.squintAmount); // 0.4 squint = 60% of normal height
            
            // Add slow periodic scanning motion
            const now = Date.now();
            const scanInterval = 5000; // Scan every 5 seconds (slower)
            const scanDuration = 2000;  // Each scan takes 2s (slower)
            const timeSinceScan = now - this.state.lastScanTime;
            
            if (timeSinceScan > scanInterval) {
                this.state.lastScanTime = now;
                this.state.scanPhase = 0;
            }
            
            if (this.state.scanPhase < scanDuration) {
                this.state.scanPhase += deltaTime;
                const scanProgress = this.state.scanPhase / scanDuration;
                // Smooth scanning motion - look left, then right, then center
                let scanOffset = 0;
                if (scanProgress < 0.4) {
                    // Slowly look left
                    const leftProgress = scanProgress / 0.4;
                    scanOffset = -Math.sin(leftProgress * Math.PI / 2) * 20; // Max 20 pixels left
                } else if (scanProgress < 0.8) {
                    // Slowly look right  
                    const rightProgress = (scanProgress - 0.4) / 0.4;
                    scanOffset = -20 + Math.sin(rightProgress * Math.PI) * 40; // From -20 to +20
                } else {
                    // Return to center
                    const centerProgress = (scanProgress - 0.8) / 0.2;
                    scanOffset = 20 * (1 - centerProgress); // From +20 back to 0
                }
                x += scanOffset * this.scaleFactor;
            }
        }
        
        // Apply eye arc for Buddha eyes (zen state)
        let eyeArc = 0;
        if (this.state.emotionEyeArc !== undefined) {
            eyeArc = this.state.emotionEyeArc;
        }
        
        // Apply rotation to look at pointer when gaze is active
        let rotation = 0;
        if (gazeIntensity > 0.05 && !this.state.gazeLocked) {
            // Calculate angle to pointer (gazeOffset indicates direction)
            const angle = Math.atan2(this.state.gazeOffset.y, this.state.gazeOffset.x);
            rotation = angle + Math.PI / 2;
        }
        
        // Apply transformations
        this.ctx.translate(x, y);
        if (rotation !== 0) {
            this.ctx.rotate(rotation);
        }
        this.ctx.scale(scaleX, scaleY);
        
        // Add subtle shadow for depth
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowOffsetY = 2;
        
        // Draw white core with eye arc effect
        this.ctx.fillStyle = this.config.coreColor;
        this.ctx.beginPath();
        
        if (eyeArc !== 0 && scaleY < 0.5) {
            // For zen state, create a curved eye shape
            const startAngle = -Math.PI + eyeArc;
            const endAngle = eyeArc;
            this.ctx.arc(0, 0, radius, startAngle, endAngle, false);
            this.ctx.closePath();
        } else {
            // Normal circular eye
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        }
        this.ctx.fill();
        
        // Add inner glow for luminosity with nervous shimmer
        let shimmerAlpha = 1.0;
        if (this.state.undertone === 'nervous') {
            // Subtle flickering shimmer
            shimmerAlpha = 0.95 + Math.sin(Date.now() / 50) * 0.05; // 95-100% opacity flicker
        }
        
        const innerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmerAlpha})`);
        innerGradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.9 * shimmerAlpha})`);
        innerGradient.addColorStop(1, `rgba(255, 255, 255, ${0.8 * shimmerAlpha})`);
        
        this.ctx.fillStyle = innerGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    /**
     * Render zen meditation core with arc shape
     */
    renderZenCore(x, y, radius) {
        this.ctx.save();
        
        // Apply shake offset if in awakening phase
        if (this.state.shakeOffset) {
            x += this.state.shakeOffset;
        }
        
        // Apply drift Y if in awakening phase
        if (this.state.driftY) {
            y += this.state.driftY;
        }
        
        this.ctx.translate(x, y);
        
        // Apply gesture rotation if present (for spin gesture)
        if (this.gestureTransform && this.gestureTransform.rotation !== undefined) {
            this.ctx.rotate(this.gestureTransform.rotation * Math.PI / 180);
        }
        
        // Calculate zen energy pulsation (slow breathing effect)
        const time = Date.now() / 1000; // Time in seconds
        const basePulse = Math.sin(time * 0.5) * 0.5 + 1.5; // Base pulsation
        
        // Scale glow intensity based on transition phase
        // Very dim during bloom/retract, bright when fully in zen
        let glowIntensity = 0.1; // Start very dim
        if (this.zenTransition.phase === 'in') {
            // Full brightness when fully in zen
            glowIntensity = 1.0;
        } else if (this.zenTransition.phase === 'entering') {
            // Gradually brighten only after lotus is mostly formed
            glowIntensity = Math.max(0.1, (this.zenTransition.lotusMorph - 0.7) * 3.3); // Stay dim until 70% bloomed
        } else if (this.zenTransition.phase === 'exiting') {
            // Quickly dim when exiting
            glowIntensity = Math.max(0.1, this.zenTransition.lotusMorph * 0.5);
        }
        const zenPulse = basePulse * glowIntensity; // Apply intensity scaling
        
        // Only apply glow when arc has formed
        if (this.zenTransition.arcHeight > 0) {
            // GAUSSIAN GLOW LAYERS - Smooth exponential falloff
            // Pre-glow layers with decreasing intensity for Gaussian effect
            const glowLayers = 8; // More layers for smoother transition
            for (let i = 0; i < glowLayers; i++) {
                // Gaussian falloff: intensity = e^(-(distance^2))
                const layerIntensity = Math.exp(-(i * i) / 8) * zenPulse;
                const layerRadius = 60 + i * 25;
                
                this.ctx.shadowBlur = layerRadius * zenPulse;
                this.ctx.shadowColor = `rgba(255, 215, 0, ${0.2 * layerIntensity})`; // Reduced opacity
                
                // Invisible shape just for the glow
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.01)';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * (1.5 + i * 0.3), 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Main shadow - golden light (dimmer during transitions)
            this.ctx.shadowBlur = 80 * zenPulse;
            this.ctx.shadowColor = `rgba(255, 223, 0, ${0.6 * zenPulse})`; // Reduced from 1.2
            
            // INNER RADIANCE GRADIENT - Much darker during transitions
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 4);
            
            // During transitions, use much darker colors to see lotus
            if (this.zenTransition.phase !== 'in') {
                // Dark golden during transition - lotus will show as even darker cutout
                gradient.addColorStop(0, `rgba(184, 134, 11, ${0.8})`); // Dark goldenrod core
                gradient.addColorStop(0.3, `rgba(153, 101, 21, ${0.6})`); // Darker gold
                gradient.addColorStop(0.6, `rgba(139, 69, 19, ${0.4})`); // Saddle brown
                gradient.addColorStop(1, `rgba(101, 67, 33, 0)`); // Dark brown edge
            } else {
                // Full brightness only when fully in zen
                gradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`); // Pure white core
                gradient.addColorStop(0.1, `rgba(255, 255, 240, ${1.0 * zenPulse})`); // Bright cream
                gradient.addColorStop(0.2, `rgba(255, 250, 205, ${0.95 * zenPulse})`); // Warm light
                gradient.addColorStop(0.35, `rgba(255, 240, 150, ${0.85 * zenPulse})`); // Bright gold
                gradient.addColorStop(0.5, `rgba(255, 223, 0, ${0.7 * zenPulse})`); // Vibrant gold
                gradient.addColorStop(0.65, `rgba(255, 215, 0, ${0.5 * zenPulse})`); // Fading gold
                gradient.addColorStop(0.8, `rgba(255, 215, 0, ${0.3 * zenPulse})`); // Softer edge
                gradient.addColorStop(0.9, `rgba(255, 215, 0, ${0.15 * zenPulse})`); // Very soft
                gradient.addColorStop(0.95, `rgba(255, 215, 0, ${0.05 * zenPulse})`); // Almost gone
                gradient.addColorStop(1, `rgba(255, 215, 0, 0)`); // Fully transparent edge
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3})`; // Dimmer edge during transition
            this.ctx.lineWidth = 2;
            
            // STEP 1: Draw a circle with lotus cutout using evenodd fill rule
            this.ctx.beginPath();
            
            // Draw outer circle (clockwise)
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
            
            // CLEAN LOTUS SILHOUETTE - matching reference image
            const lotusSize = radius * 0.95; // Lotus fills nearly ALL of the orb
            
            // MORPHING LOTUS PETALS - animated based on lotusMorph value
            const morph = this.zenTransition.lotusMorph;
            const spread = this.zenTransition.petalSpread;
            const smile = this.zenTransition.smileCurve;
            
            // Center/Top petal - morphs from small circle to full petal
            // Only draw lotus if morph is significant (avoid tiny artifacts)
            if (morph > 0.1) {
                const centerPetalBase = radius * (0.05 + 0.15 * morph);
                this.ctx.moveTo(0, centerPetalBase); // Start at base center
                this.ctx.bezierCurveTo(
                    -radius * (0.05 + 0.25 * morph * spread), radius * 0.1,    // Left control
                    -radius * (0.05 + 0.3 * morph * spread), -radius * (0.1 + 0.4 * morph),  // Left control up
                    0, -radius * (0.2 + 0.65 * morph)                // Top point
                );
                this.ctx.bezierCurveTo(
                    radius * (0.05 + 0.3 * morph * spread), -radius * (0.1 + 0.4 * morph),   // Right control up
                    radius * (0.05 + 0.25 * morph * spread), radius * 0.1,     // Right control
                    0, centerPetalBase                 // Back to base
                );
                
                if (morph > 0.3) { // Only show side petals after some morphing
                const sidePetalAlpha = (morph - 0.3) / 0.7; // Fade in from 30% to 100%
                
                // Left petal - fades in and spreads
                this.ctx.moveTo(-radius * 0.1 * sidePetalAlpha, radius * 0.2); 
                this.ctx.bezierCurveTo(
                    -radius * (0.1 + 0.4 * sidePetalAlpha * spread), radius * 0.1,    
                    -radius * (0.2 + 0.5 * sidePetalAlpha * spread), -radius * (0.1 + 0.2 * sidePetalAlpha),   
                    -radius * (0.1 + 0.4 * sidePetalAlpha * spread), -radius * (0.2 + 0.45 * sidePetalAlpha)   
                );
                this.ctx.bezierCurveTo(
                    -radius * (0.05 + 0.15 * sidePetalAlpha), -radius * (0.1 + 0.4 * sidePetalAlpha),   
                    -radius * 0.05 * sidePetalAlpha, radius * 0.1,   
                    -radius * 0.1 * sidePetalAlpha, radius * 0.2     
                );
                
                // Right petal - fades in and spreads
                this.ctx.moveTo(radius * 0.1 * sidePetalAlpha, radius * 0.2); 
                this.ctx.bezierCurveTo(
                    radius * (0.1 + 0.4 * sidePetalAlpha * spread), radius * 0.1,     
                    radius * (0.2 + 0.5 * sidePetalAlpha * spread), -radius * (0.1 + 0.2 * sidePetalAlpha),    
                    radius * (0.1 + 0.4 * sidePetalAlpha * spread), -radius * (0.2 + 0.45 * sidePetalAlpha)    
                );
                this.ctx.bezierCurveTo(
                    radius * (0.05 + 0.15 * sidePetalAlpha), -radius * (0.1 + 0.4 * sidePetalAlpha),    
                    radius * 0.05 * sidePetalAlpha, radius * 0.1,    
                    radius * 0.1 * sidePetalAlpha, radius * 0.2      
                );
            }
            
            // Bottom smile - morphs from straight to curved smile
            if (smile > 0) {
                const smileDepth = radius * 0.2 * smile; // How deep the smile curves
                this.ctx.moveTo(-radius * 0.6, radius * (0.5 - 0.1 * smile));   // Corners rise with smile
                this.ctx.quadraticCurveTo(
                    0, radius * (0.5 + 0.1 * smile),     // Center dips for smile
                    radius * 0.6, radius * (0.5 - 0.1 * smile)  // Right corner rises
                );
                }
            }
            
            this.ctx.closePath();
            
            // Fill with gradient using evenodd rule to create the lotus cutout
            this.ctx.fill('evenodd');
            // Don't stroke the lotus cutout, only the outer circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Only add additional glow layers when fully in zen, not during transitions
            if (this.zenTransition.phase === 'in') {
                // Additional EXPANSIVE glow layers for inner radiance
                // Layer 1: BRILLIANT lotus core intensifier - from lower quarter
                const lotusRadius = radius * 2.0; // Larger radius for more expansion
                const arcHeight = this.zenTransition.arcHeight * radius; // Get arc height from transition state
                const glowOriginY = radius * 0.5; // Lower quarter origin
                const lotusGlow = this.ctx.createRadialGradient(0, glowOriginY, 0, 0, glowOriginY, lotusRadius * 1.2);
                lotusGlow.addColorStop(0, `rgba(255, 255, 255, ${1.0 * zenPulse})`);
                lotusGlow.addColorStop(0.25, `rgba(255, 252, 240, ${0.8 * zenPulse})`);
                lotusGlow.addColorStop(0.5, `rgba(255, 245, 200, ${0.6 * zenPulse})`);
                lotusGlow.addColorStop(0.75, `rgba(255, 235, 150, ${0.4 * zenPulse})`);
                lotusGlow.addColorStop(1, 'rgba(255, 223, 0, 0)');
                this.ctx.fillStyle = lotusGlow;
                this.ctx.fill();
                
                // Layer 2: GAUSSIAN outer halo for smooth falloff
                const outerHalo = this.ctx.createRadialGradient(0, -arcHeight/2, radius * 0.5, 0, -arcHeight/2, radius * 5);
                outerHalo.addColorStop(0, 'rgba(255, 223, 0, 0)');
                outerHalo.addColorStop(0.1, `rgba(255, 223, 0, ${0.25 * zenPulse})`);
                outerHalo.addColorStop(0.2, `rgba(255, 220, 0, ${0.2 * zenPulse})`);
                outerHalo.addColorStop(0.35, `rgba(255, 215, 0, ${0.15 * zenPulse})`);
                outerHalo.addColorStop(0.5, `rgba(255, 215, 0, ${0.1 * zenPulse})`);
                outerHalo.addColorStop(0.65, `rgba(255, 215, 0, ${0.06 * zenPulse})`);
                outerHalo.addColorStop(0.8, `rgba(255, 215, 0, ${0.03 * zenPulse})`);
                outerHalo.addColorStop(0.9, `rgba(255, 215, 0, ${0.01 * zenPulse})`);
                outerHalo.addColorStop(1, 'rgba(255, 215, 0, 0)');
                this.ctx.fillStyle = outerHalo;
                this.ctx.fill();
            }
        } else {
            // Draw horizontal line or circle during transition
            // Start with very dim golden color that brightens with lotus
            
            // No glow during transition to prevent flash
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
            
            // Use very dim golden color during transition
            const dimIntensity = 0.3; // Keep consistently dim during transition
            this.ctx.fillStyle = `rgba(255, 215, 0, ${dimIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Very subtle gradient during transition to see lotus clearly
            const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            coreGradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
            coreGradient.addColorStop(0.5, `rgba(255, 250, 230, 0.1)`);
            coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            this.ctx.fillStyle = coreGradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Render speaking animation rings
     */
    renderSpeakingRings(centerX, centerY, coreRadius, deltaTime) {
        // Spawn new rings periodically
        this.ringSpawnTimer += deltaTime;
        if (this.ringSpawnTimer >= this.ringSpawnInterval && this.speakingRings.length < this.maxRings) {
            this.speakingRings.push({
                radius: coreRadius,
                opacity: 0.8,
                speed: 0.15 // Expansion speed
            });
            this.ringSpawnTimer = 0;
        }
        
        // Update and render existing rings
        this.speakingRings = this.speakingRings.filter(ring => {
            // Update ring
            ring.radius += ring.speed * deltaTime;
            ring.opacity = Math.max(0, 0.8 * (1 - (ring.radius - coreRadius) / (coreRadius * 2)));
            
            // Render ring if visible
            if (ring.opacity > 0.01) {
                this.ctx.strokeStyle = this.hexToRgba(this.state.glowColor, ring.opacity);
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                return true;
            }
            return false;
        });
    }
    
    // Recording rings method removed - now using pulsating glow instead
    
    /**
     * Render recording indicator - stylized REC text only
     */
    renderRecordingIndicator(x, y) {
        const time = Date.now() / 1000;
        const pulse = 0.8 + Math.sin(time * 2) * 0.2; // Gentle pulse matching glow
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Outer glow for text
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = `rgba(255, 0, 0, ${pulse * 0.8})`;
        
        // Main REC text - solid red, matching sleep Z size
        const recSize = 80; // Match sleep Z average size
        this.ctx.font = `italic 900 ${recSize}px "Poppins", sans-serif`;
        this.ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('REC', 0, 0);
        
        // Inner highlight for cell-shading effect
        this.ctx.shadowBlur = 0;
        this.ctx.font = `italic 900 ${recSize - 1}px "Poppins", sans-serif`;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
        this.ctx.fillText('REC', -0.5, -0.5);
        
        this.ctx.restore();
    }
    
    /**
     * Render sleep indicator (Z's) with cell-shaded style and gradient fade
     */
    renderSleepIndicator(x, y, deltaTime) {
        // Spawn new Z periodically
        this.ringSpawnTimer += deltaTime;
        if (this.ringSpawnTimer >= 2000 && this.sleepZ.length < 3) {
            // Random variations for each Z
            const weights = ['300', '500', '700', '900'];
            const randomWeight = weights[Math.floor(Math.random() * weights.length)];
            const randomCase = Math.random() > 0.5 ? 'Z' : 'z';
            
            this.sleepZ.push({
                x: x + Math.random() * 30 - 15,
                y: y + 80,  // Much lower origin point
                size: (24 + Math.random() * 8) * 3,  // 3x larger
                opacity: 1.0,
                speed: -0.025,
                drift: Math.random() * 20 - 10,
                lifetime: 0,
                rotation: Math.random() * 30 - 15,
                text: randomCase,  // Store the random case
                weight: randomWeight  // Store the random weight
            });
            this.ringSpawnTimer = 0;
        }
        
        // Update and render Z's
        this.sleepZ = this.sleepZ.filter(z => {
            // Update position and lifetime
            z.lifetime += deltaTime;
            z.y += z.speed * deltaTime;
            z.x += Math.sin(z.lifetime * 0.0008) * z.drift * 0.008;
            z.rotation += deltaTime * 0.01;
            
            // Gradient fade out
            const fadeStart = 2000;
            const fadeEnd = 4000;
            if (z.lifetime < fadeStart) {
                z.opacity = 1.0;
            } else if (z.lifetime < fadeEnd) {
                z.opacity = 1.0 - ((z.lifetime - fadeStart) / (fadeEnd - fadeStart));
            } else {
                z.opacity = 0;
            }
            
            if (z.opacity > 0.01) {
                this.ctx.save();
                this.ctx.translate(z.x, z.y);
                this.ctx.rotate(z.rotation * Math.PI / 180);
                
                // Cell-shaded style
                const baseColor = this.state.glowColor || '#4a90e2';
                
                // Outer glow
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.hexToRgba(baseColor, z.opacity * 0.5);
                
                // Main Z with gradient
                const gradient = this.ctx.createLinearGradient(-z.size/2, -z.size/2, z.size/2, z.size/2);
                gradient.addColorStop(0, this.hexToRgba(baseColor, z.opacity));
                gradient.addColorStop(0.5, this.hexToRgba('#ffffff', z.opacity * 0.9));
                gradient.addColorStop(1, this.hexToRgba(baseColor, z.opacity * 0.7));
                
                // Use the random weight and italic style
                this.ctx.font = `italic ${z.weight || '900'} ${z.size}px 'Poppins', sans-serif`;
                this.ctx.fillStyle = gradient;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(z.text || 'Z', 0, 0);
                
                // Inner highlight with same weight
                this.ctx.shadowBlur = 0;
                this.ctx.font = `italic ${z.weight || '900'} ${z.size * 0.9}px 'Poppins', sans-serif`;
                this.ctx.fillStyle = this.hexToRgba('#ffffff', z.opacity * 0.3);
                this.ctx.fillText(z.text || 'Z', -1, -1);
                
                this.ctx.restore();
                return true;
            }
            return false;
        });
    }
    
    /**
     * Update animation timers
     */
    updateTimers(deltaTime) {
        // Breathing animation with irregular patterns for certain undertones
        let breathSpeed = this.config.breathingSpeed;
        let breathDepthOverride = null;
        
        // Special breathing for zen state
        if (this.state.emotion === 'zen') {
            // Super slow, big expansive breaths in zen
            breathSpeed *= 0.15; // Much slower (about 10 second cycles)
            breathDepthOverride = 0.2; // Much deeper breaths (20% variation)
        } else if (this.state.sleeping) {
            // Slower breathing when sleeping
            breathSpeed *= 0.5;
        }
        
        // Apply irregular breathing for nervous/tired
        if (this.state.breathIrregular) {
            // Add occasional hitches and variations
            const irregularFactor = 1 + Math.sin(Date.now() / 2000) * 0.3 + 
                                   Math.sin(Date.now() / 700) * 0.2;
            breathSpeed *= irregularFactor;
        }
        
        this.breathingPhase += (breathSpeed * deltaTime) / 1000;
        
        // Apply breath depth override if set (for zen)
        if (breathDepthOverride !== null) {
            this.state.breathDepth = breathDepthOverride;
        }
        
        // Blinking (only when not sleeping or in zen)
        if (!this.state.sleeping && this.state.emotion !== 'zen') {
            if (!this.state.blinking) {
                this.blinkTimer += deltaTime;
                if (this.blinkTimer >= this.nextBlinkTime) {
                    this.state.blinking = true;
                    this.blinkTimer = 0;
                }
            } else {
                this.blinkTimer += deltaTime;
                if (this.blinkTimer >= 150) { // 150ms blink duration
                    this.state.blinking = false;
                    this.blinkTimer = 0;
                    this.nextBlinkTime = this.getRandomBlinkTime();
                }
            }
        }
        
        // Note: Idle detection is handled by IdleBehavior.js, not here
    }
    
    /**
     * Apply all undertone modifiers to current state
     * @param {string|null} undertone - Undertone to apply
     */
    applyUndertoneModifiers(undertone) {
        if (!undertone || !this.undertoneModifiers[undertone]) {
            // Reset to defaults if no undertone
            this.state.sizeMultiplier = 1.0;
            this.state.jitterAmount = 0;
            this.state.episodicFlutter = false;
            this.state.glowRadiusMult = 1.0;
            this.state.breathRateMult = 1.0;
            this.state.breathDepthMult = 1.0;
            this.state.breathIrregular = false;
            this.state.particleRateMult = 1.0;
            this.state.particleBehaviorOverride = null;
            this.state.particleSpeedMult = 1.0;
            return;
        }
        
        const modifier = this.undertoneModifiers[undertone];
        
        // Apply all modifiers with smooth transitions
        this.state.sizeMultiplier = modifier.sizeMultiplier;
        this.state.jitterAmount = modifier.jitterAmount || 0;
        this.state.episodicFlutter = modifier.episodicFlutter || false;
        this.state.glowRadiusMult = modifier.glowRadiusMult;
        this.state.breathRateMult = modifier.breathRateMult;
        this.state.breathDepthMult = modifier.breathDepthMult;
        this.state.breathIrregular = modifier.breathIrregular;
        this.state.particleRateMult = modifier.particleRateMult;
        this.state.particleBehaviorOverride = modifier.particleBehavior;
        this.state.particleSpeedMult = modifier.particleSpeedMult;
    }
    
    /**
     * Apply undertone shifts to a color
     * @param {string} baseColor - Base hex color
     * @param {string|null} undertone - Undertone to apply
     * @returns {string} Modified hex color
     */
    applyUndertoneToColor(baseColor, undertone) {
        if (!undertone || !this.undertoneModifiers[undertone]) return baseColor;
        
        const modifier = this.undertoneModifiers[undertone];
        
        // Convert hex to HSL
        const rgb = this.hexToRgb(baseColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Apply much stronger undertone shifts
        hsl.h = (hsl.h + modifier.hueShift + 360) % 360;
        hsl.s = Math.max(0, Math.min(1, hsl.s * modifier.saturationMult));
        hsl.l = Math.max(0, Math.min(1, hsl.l * modifier.brightnessMult));
        
        // Convert back to hex
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }
    
    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    /**
     * Convert RGB to HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return { h: h * 360, s, l };
    }
    
    /**
     * Convert HSL to hex
     */
    hslToHex(h, s, l) {
        h = h / 360;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    
    /**
     * Start a color transition
     * @param {string} targetColor - Target hex color
     * @param {number} targetIntensity - Target glow intensity
     * @param {number} duration - Transition duration in ms
     */
    startColorTransition(targetColor, targetIntensity, duration = 1500) {
        // Don't start a new transition if we're already at the target
        if (this.state.glowColor === targetColor && 
            this.state.glowIntensity === targetIntensity) {
            return;
        }
        
        this.colorTransition = {
            active: true,
            fromColor: this.state.glowColor,
            toColor: targetColor,
            fromIntensity: this.state.glowIntensity,
            toIntensity: targetIntensity,
            progress: 0,
            startTime: performance.now(),
            duration: duration
        };
        
        // Start the animation loop
        this.animateColorTransition();
    }
    
    /**
     * Animate the color transition
     */
    animateColorTransition() {
        if (!this.colorTransition.active) return;
        
        const elapsed = performance.now() - this.colorTransition.startTime;
        const progress = Math.min(elapsed / this.colorTransition.duration, 1);
        
        // Use ease-out-quad for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 2);
        
        // Interpolate color
        this.state.glowColor = interpolateHsl(
            this.colorTransition.fromColor,
            this.colorTransition.toColor,
            eased
        );
        
        // Interpolate intensity
        this.state.glowIntensity = this.colorTransition.fromIntensity + 
            (this.colorTransition.toIntensity - this.colorTransition.fromIntensity) * eased;
        
        if (progress < 1) {
            // Cancel any existing color transition animation
            if (this.animationFrameIds.colorTransition) {
                cancelAnimationFrame(this.animationFrameIds.colorTransition);
                this.animationFrameIds.colorTransition = null;
            }
            this.animationFrameIds.colorTransition = requestAnimationFrame(() => this.animateColorTransition());
        } else {
            this.colorTransition.active = false;
            // Clean up animation frame ID
            this.animationFrameIds.colorTransition = null;
        }
    }
    
    /**
     * Set emotional state
     */
    setEmotionalState(emotion, properties, undertone = null) {
        // Store undertone for color processing
        this.state.undertone = undertone;
        
        // Apply all undertone modifiers (visual, breathing, particles)
        this.applyUndertoneModifiers(undertone);
        
        // Get base color and apply undertone shifts
        const baseColor = properties.glowColor || this.config.defaultGlowColor;
        const targetColor = this.applyUndertoneToColor(baseColor, undertone);
        
        // Apply intensity modifier from undertone
        const modifier = undertone ? this.undertoneModifiers[undertone] : null;
        const baseIntensity = properties.glowIntensity || 1.0;
        const targetIntensity = modifier ? baseIntensity * modifier.glowRadiusMult : baseIntensity;
        
        // Determine transition duration based on emotion
        let duration = 1500; // Default 1.5s
        if (emotion === 'anger' || emotion === 'fear') {
            duration = 800; // Quick transitions for urgent emotions
        } else if (emotion === 'sadness' || emotion === 'resting') {
            duration = 2000; // Slower for calming emotions
        } else if (emotion === 'zen') {
            duration = 2000; // Zen gets special timing during lotus bloom
        }
        
        // Update emotion state BEFORE handling transitions to avoid timing issues
        const previousEmotion = this.state.emotion;
        this.state.emotion = emotion;
        
        // Handle suspicion state
        if (emotion === 'suspicion') {
            this.state.isSuspicious = true;
            // Store target squint amount, we'll animate to it
            this.state.targetSquintAmount = properties && properties.coreSquint ? properties.coreSquint : 0.4;
            if (this.state.squintAmount === undefined) {
                this.state.squintAmount = 0; // Start from no squint
            }
            this.state.lastScanTime = Date.now();
            this.state.scanPhase = 0;
        } else {
            this.state.isSuspicious = false;
            this.state.targetSquintAmount = 0;
            if (this.state.squintAmount === undefined) {
                this.state.squintAmount = 0;
            }
        }
        
        // Handle zen state transitions specially
        if (emotion === 'zen' && previousEmotion !== 'zen') {
            // Entering zen - will handle its own color transition during lotus bloom
            this.enterZenMode(targetColor, targetIntensity);
        } else if (previousEmotion === 'zen' && emotion !== 'zen') {
            // Exiting zen - will handle its own color transition during lotus close
            this.exitZenMode(emotion, targetColor, targetIntensity);
        } else {
            // Standard color transition for all other state changes
            this.startColorTransition(targetColor, targetIntensity, duration);
        }
        
        // Apply breathing with undertone modifiers
        const baseBreathRate = properties.breathRate || 1.0;
        const baseBreathDepth = properties.breathDepth || this.config.breathingDepth;
        this.state.breathRate = modifier ? baseBreathRate * modifier.breathRateMult : baseBreathRate;
        this.state.breathDepth = modifier ? baseBreathDepth * modifier.breathDepthMult : baseBreathDepth;
        
        // Jitter combines emotion jitter with undertone jitter
        this.state.coreJitter = properties.coreJitter || (modifier && modifier.jitterAmount > 0);
        this.state.emotionEyeOpenness = properties.eyeOpenness;
        this.state.emotionEyeArc = properties.eyeArc;
    }
    
    /**
     * Set gaze data from GazeTracker
     * @param {Object} gazeData - Contains offset, proximity, and lock status
     */
    setGazeOffset(gazeData) {
        // Handle both old format (just offset) and new format (full data)
        if (typeof gazeData === 'object' && gazeData !== null) {
            if (gazeData.hasOwnProperty('x') && gazeData.hasOwnProperty('y')) {
                // Old format - just offset
                this.state.gazeOffset = gazeData;
            } else {
                // New format - full gaze data
                this.state.gazeOffset = gazeData.offset || { x: 0, y: 0 };
                this.state.gazeIntensity = gazeData.proximity || 0;
                this.state.gazeLocked = gazeData.isLocked || false;
            }
        }
        
        // Reset idle timer on interaction
        this.idleTimer = 0;
        if (this.isAsleep) {
            this.wakeUp();
        }
    }
    
    /**
     * Get current orb position (center + gaze offset)
     */
    getCurrentOrbPosition() {
        const logicalWidth = this.canvasManager.width;
        const logicalHeight = this.canvasManager.height;
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;
        
        return {
            x: centerX + this.state.gazeOffset.x,
            y: centerY + this.state.gazeOffset.y
        };
    }
    
    /**
     * Sets a custom scale for the orb (used for breathing exercises)
     * @param {number} scale - Scale factor (1.0 = normal)
     */
    setCustomScale(scale) {
        this.state.customScale = scale;
    }
    
    /**
     * Start speaking animation
     */
    startSpeaking() {
        this.state.speaking = true;
        this.speakingRings = [];
        this.ringSpawnTimer = 0;
    }
    
    /**
     * Stop speaking animation
     */
    stopSpeaking() {
        this.state.speaking = false;
        this.speakingRings = [];
    }
    
    /**
     * Enter sleep mode with animation
     */
    enterSleepMode() {
        this.state.sleeping = true;
        this.sleepZ = []; // Reset Z's
        this.state.eyeOpenness = 1.0; // Start with eyes open
        
        // Initialize dimming values (start at full brightness)
        this.state.sleepDimness = 1.0;
        this.state.sleepScale = 1.0;
        
        // Force end any active blink
        this.state.blinking = false;
        
        // Animate eye closing, then dimming
        this.animateEyeClose();
        
        console.log('EmotiveRenderer: Entering sleep mode');
    }
    
    /**
     * Animate eye closing for sleep, then dim
     */
    animateEyeClose() {
        // Cancel any existing eye animations
        if (this.animationFrameIds.eyeClose) {
            cancelAnimationFrame(this.animationFrameIds.eyeClose);
            this.animationFrameIds.eyeClose = null;
        }
        if (this.animationFrameIds.eyeOpen) {
            cancelAnimationFrame(this.animationFrameIds.eyeOpen);
            this.animationFrameIds.eyeOpen = null;
        }
        
        const startTime = performance.now();
        const eyeCloseDuration = 2000; // 2 seconds to close eyes
        const dimDuration = 1000; // 1 second to dim after eyes close
        
        const animate = () => {
            if (!this.state.sleeping) {
                // Clean up animation frame ID
                this.animationFrameIds.eyeClose = null;
                return; // Stop if woken up
            }
            
            const elapsed = performance.now() - startTime;
            
            if (elapsed < eyeCloseDuration) {
                // Phase 1: Close eyes
                const progress = elapsed / eyeCloseDuration;
                const eased = 1 - Math.pow(progress, 2);
                this.state.eyeOpenness = 0.1 + eased * 0.9; // Close to 0.1 (nearly closed)
                
                // Keep full brightness during eye closing
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                
                this.animationFrameIds.eyeClose = requestAnimationFrame(animate);
            } else if (elapsed < eyeCloseDuration + dimDuration) {
                // Phase 2: Dim the orb
                const dimProgress = (elapsed - eyeCloseDuration) / dimDuration;
                const dimEased = 1 - Math.pow(1 - dimProgress, 3); // Ease out cubic
                
                // Keep eyes closed
                this.state.eyeOpenness = 0.1;
                
                // Animate dimming and scaling
                this.state.sleepDimness = 1.0 - (dimEased * 0.4); // Dim to 0.6
                this.state.sleepScale = 1.0 - (dimEased * 0.1); // Scale to 0.9
                
                this.animationFrameIds.eyeClose = requestAnimationFrame(animate);
            } else {
                // Final state
                this.state.eyeOpenness = 0.1;
                this.state.sleepDimness = 0.6;
                this.state.sleepScale = 0.9;
                // Clean up animation frame ID
                this.animationFrameIds.eyeClose = null;
            }
        };
        
        this.animationFrameIds.eyeClose = requestAnimationFrame(animate);
    }
    
    /**
     * Wake up from sleep with animation
     */
    wakeUp() {
        if (!this.state.sleeping) return;
        
        this.state.sleeping = false;
        this.state.breathRate = 1.0;
        this.state.breathDepth = this.config.breathingDepth;
        this.sleepZ = []; // Clear Z's
        
        // Reset blinking state
        this.state.blinking = false;
        this.blinkTimer = 0;
        this.nextBlinkTime = this.getRandomBlinkTime();
        
        // Animate eye opening
        this.animateEyeOpen();
        
        // Quick shake animation
        this.state.coreJitter = true;
        setTimeout(() => {
            this.state.coreJitter = false;
        }, 200);
        
        console.log('EmotiveRenderer: Waking up');
    }
    
    /**
     * Animate eye opening after wake - brighten first, then open eyes
     */
    animateEyeOpen() {
        // Cancel any existing eye animations
        if (this.animationFrameIds.eyeOpen) {
            cancelAnimationFrame(this.animationFrameIds.eyeOpen);
            this.animationFrameIds.eyeOpen = null;
        }
        if (this.animationFrameIds.eyeClose) {
            cancelAnimationFrame(this.animationFrameIds.eyeClose);
            this.animationFrameIds.eyeClose = null;
        }
        
        const startTime = performance.now();
        const brightenDuration = 500; // 0.5 seconds to brighten
        const eyeOpenDuration = 1000; // 1 second to open eyes
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            
            if (elapsed < brightenDuration) {
                // Phase 1: Brighten the orb
                const progress = elapsed / brightenDuration;
                const eased = Math.sin(progress * Math.PI / 2); // Smooth acceleration
                
                // Animate brightening and scaling back
                this.state.sleepDimness = 0.6 + (eased * 0.4); // Brighten from 0.6 to 1.0
                this.state.sleepScale = 0.9 + (eased * 0.1); // Scale from 0.9 to 1.0
                
                // Keep eyes closed during brightening
                this.state.eyeOpenness = 0.1;
                
                this.animationFrameIds.eyeOpen = requestAnimationFrame(animate);
            } else if (elapsed < brightenDuration + eyeOpenDuration) {
                // Phase 2: Open eyes
                const eyeProgress = (elapsed - brightenDuration) / eyeOpenDuration;
                const eyeEased = Math.sin(eyeProgress * Math.PI / 2); // Smooth acceleration
                
                // Keep full brightness
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                
                // Animate eye opening
                this.state.eyeOpenness = 0.1 + eyeEased * 0.9; // Open from 0.1 to 1.0
                
                this.animationFrameIds.eyeOpen = requestAnimationFrame(animate);
            } else {
                // Final state
                this.state.eyeOpenness = 1.0;
                this.state.sleepDimness = 1.0;
                this.state.sleepScale = 1.0;
                // Clean up animation frame ID
                this.animationFrameIds.eyeOpen = null;
            }
        };
        
        this.animationFrameIds.eyeOpen = requestAnimationFrame(animate);
    }
    
    /**
     * Enter zen meditation mode with animation
     */
    enterZenMode(targetColor, targetIntensity) {
        // Cancel any existing zen animations
        if (this.animationFrameIds.zenEnter) {
            cancelAnimationFrame(this.animationFrameIds.zenEnter);
            this.animationFrameIds.zenEnter = null;
        }
        if (this.animationFrameIds.zenExit) {
            cancelAnimationFrame(this.animationFrameIds.zenExit);
            this.animationFrameIds.zenExit = null;
        }
        
        // Immediately set to zen color and ZERO intensity to avoid any flash
        this.state.glowColor = targetColor;
        this.state.glowIntensity = 0; // Start with no glow at all
        
        // Cancel any active color transition
        this.colorTransition.active = false;
        
        this.zenTransition = {
            active: true,
            phase: 'entering',
            startTime: performance.now(),
            previousEmotion: this.state.emotion,
            targetEmotion: null,
            scaleX: 1.0,
            scaleY: 1.0,
            arcHeight: 0,
            lotusMorph: 0,     // 0 = no lotus, 1 = full lotus
            petalSpread: 0,    // 0 = closed petals, 1 = full spread
            smileCurve: 0      // 0 = no smile, 1 = full smile
        };
        
        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'entering') {
                // Clean up animation frame ID
                this.animationFrameIds.zenEnter = null;
                return;
            }
            
            const elapsed = performance.now() - this.zenTransition.startTime;
            const horizontalNarrowDuration = 200; // 0.2s for sunset effect - FAST
            const arcFormDuration = 150; // 0.15s for arc formation - FAST
            const lotusMorphDuration = 200; // 0.2s for lotus to bloom - FAST
            
            if (elapsed < horizontalNarrowDuration) {
                // Phase 1: Horizontal narrowing (sunset)
                const progress = elapsed / horizontalNarrowDuration;
                const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0 - (eased * 0.8); // Narrow vertically to 0.2 (like sunset)
                this.zenTransition.arcHeight = 0;
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;
                
                this.animationFrameIds.zenEnter = requestAnimationFrame(animate);
            } else if (elapsed < horizontalNarrowDuration + arcFormDuration) {
                // Phase 2: Arc formation
                const arcProgress = (elapsed - horizontalNarrowDuration) / arcFormDuration;
                const arcEased = Math.sin(arcProgress * Math.PI / 2); // Smooth ease in
                
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2; // Keep narrow like horizon line
                this.zenTransition.arcHeight = arcEased * 1.5; // Arc to 150% height for pronounced curve
                
                // Start lotus morphing halfway through arc formation
                if (arcProgress > 0.5) {
                    const lotusProgress = (arcProgress - 0.5) * 2; // 0 to 1 in second half
                    this.zenTransition.lotusMorph = lotusProgress * 0.3; // Reach 30% by end of this phase
                }
                
                this.animationFrameIds.zenEnter = requestAnimationFrame(animate);
            } else if (elapsed < horizontalNarrowDuration + arcFormDuration + lotusMorphDuration) {
                // Phase 3: Lotus blooming - gradually bring up intensity
                const lotusProgress = (elapsed - horizontalNarrowDuration - arcFormDuration) / lotusMorphDuration;
                const lotusEased = 1 - Math.pow(1 - lotusProgress, 2); // Ease out quad
                
                // Glow intensity is now controlled by lotus morph in renderZenCore
                // this.state.glowIntensity = targetIntensity * lotusEased;
                
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2;
                this.zenTransition.arcHeight = 1.5;
                
                // Morph the lotus shape
                this.zenTransition.lotusMorph = 0.3 + (lotusEased * 0.7); // From 30% to 100%
                
                // Petals spread out gradually
                if (lotusProgress > 0.2) {
                    const petalProgress = (lotusProgress - 0.2) / 0.8; // 0 to 1 after 20%
                    this.zenTransition.petalSpread = Math.sin(petalProgress * Math.PI / 2); // Smooth ease
                }
                
                // Smile appears at the end
                if (lotusProgress > 0.6) {
                    const smileProgress = (lotusProgress - 0.6) / 0.4; // 0 to 1 in last 40%
                    this.zenTransition.smileCurve = Math.sin(smileProgress * Math.PI / 2); // Smooth ease
                }
                
                this.animationFrameIds.zenEnter = requestAnimationFrame(animate);
            } else {
                // Final state - in meditation with full lotus
                this.zenTransition.phase = 'in';
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2;  // Base narrow scale
                this.zenTransition.arcHeight = 1.5;
                this.zenTransition.lotusMorph = 1.0;
                this.zenTransition.petalSpread = 1.0;
                this.zenTransition.smileCurve = 1.0;
                
                // Set gentle vortex for zen state
                this.state.zenVortexIntensity = 1.0;  // Can be adjusted: 0.5 = very gentle, 2.0 = strong
                // Clean up animation frame ID
                this.animationFrameIds.zenEnter = null;
            }
        };
        
        this.animationFrameIds.zenEnter = requestAnimationFrame(animate);
    }
    
    /**
     * Exit zen meditation mode with awakening animation
     */
    exitZenMode(targetEmotion, targetColor, targetIntensity) {
        if (!this.zenTransition.active || this.zenTransition.phase !== 'in') return;
        
        // Cancel any existing zen animations
        if (this.animationFrameIds.zenEnter) {
            cancelAnimationFrame(this.animationFrameIds.zenEnter);
            this.animationFrameIds.zenEnter = null;
        }
        if (this.animationFrameIds.zenExit) {
            cancelAnimationFrame(this.animationFrameIds.zenExit);
            this.animationFrameIds.zenExit = null;
        }
        
        this.zenTransition.phase = 'exiting';
        this.zenTransition.startTime = performance.now();
        this.zenTransition.targetEmotion = targetEmotion;
        
        const animate = () => {
            if (!this.zenTransition.active || this.zenTransition.phase !== 'exiting') {
                // Clean up animation frame ID
                this.animationFrameIds.zenExit = null;
                return;
            }
            
            const elapsed = performance.now() - this.zenTransition.startTime;
            const straightenDuration = 150; // 0.15s to straighten arc - FAST
            const awakeDuration = 200; // 0.2s for awakening gestures - FAST
            const expandDuration = 200; // 0.2s to expand back - FAST
            const settleDuration = 100; // 0.1s for final settle - FAST
            
            if (elapsed < straightenDuration) {
                // Phase 1: Lotus closing and arc straightening - start color transition
                const progress = elapsed / straightenDuration;
                const eased = 1 - Math.pow(1 - progress, 2);
                
                // Start color transition at beginning of exit
                if (progress === 0 || !this.colorTransition.active) {
                    this.startColorTransition(targetColor, targetIntensity, straightenDuration);
                }
                
                this.zenTransition.arcHeight = 1.5 * (1 - eased); // Flatten arc from full height
                
                // Close lotus petals quickly
                this.zenTransition.smileCurve = 1.0 * (1 - eased); // Smile fades first
                if (progress > 0.3) {
                    const petalProgress = (progress - 0.3) / 0.7;
                    this.zenTransition.petalSpread = 1.0 * (1 - petalProgress); // Petals close
                }
                if (progress > 0.5) {
                    const morphProgress = (progress - 0.5) / 0.5;
                    this.zenTransition.lotusMorph = 1.0 * (1 - morphProgress); // Lotus disappears
                }
                
                this.animationFrameIds.zenExit = requestAnimationFrame(animate);
            } else if (elapsed < straightenDuration + awakeDuration) {
                // Phase 2: Awakening gestures
                const awakeProgress = (elapsed - straightenDuration) / awakeDuration;
                
                // Lotus is fully closed by now
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;
                
                // Slow blink (0-0.3)
                if (awakeProgress < 0.2) {
                    const blinkProg = awakeProgress / 0.2;
                    this.zenTransition.scaleY = 1.0 - (Math.sin(blinkProg * Math.PI) * 0.8);
                }
                // Gentle shake (0.3-0.6)
                else if (awakeProgress < 0.6) {
                    const shakeProg = (awakeProgress - 0.2) / 0.4;
                    this.zenTransition.scaleY = 1.0;
                    // Add small X offset for shake (will be applied in render)
                    this.state.shakeOffset = Math.sin(shakeProg * Math.PI * 4) * 3;
                }
                // Upward drift with brighten (0.6-1.0)
                else {
                    const driftProg = (awakeProgress - 0.6) / 0.4;
                    this.state.driftY = -10 * driftProg;
                    this.state.glowIntensity = 1.0 + (0.5 * driftProg); // Brighten
                }
                
                this.animationFrameIds.zenExit = requestAnimationFrame(animate);
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration) {
                // Phase 3: Horizontal expansion (sunrise)
                const expandProgress = (elapsed - straightenDuration - awakeDuration) / expandDuration;
                const expandEased = Math.sin(expandProgress * Math.PI / 2);
                
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 0.2 + (expandEased * 0.8); // Expand vertically back to 1.0 (sunrise)
                this.state.driftY = -10 * (1 - expandProgress); // Return to center
                this.state.glowIntensity = 1.5 - (0.5 * expandProgress); // Normal glow
                
                this.animationFrameIds.zenExit = requestAnimationFrame(animate);
            } else if (elapsed < straightenDuration + awakeDuration + expandDuration + settleDuration) {
                // Phase 4: Final settle pulse
                const settleProgress = (elapsed - straightenDuration - awakeDuration - expandDuration) / settleDuration;
                const pulse = Math.sin(settleProgress * Math.PI);
                
                this.zenTransition.scaleX = 1.0 + (pulse * 0.05);
                this.zenTransition.scaleY = 1.0 + (pulse * 0.05);
                
                this.animationFrameIds.zenExit = requestAnimationFrame(animate);
            } else {
                // Complete - reset to normal
                this.zenTransition.active = false;
                this.zenTransition.phase = null;
                this.zenTransition.scaleX = 1.0;
                this.zenTransition.scaleY = 1.0;
                this.zenTransition.arcHeight = 0;
                this.zenTransition.lotusMorph = 0;
                this.zenTransition.petalSpread = 0;
                this.zenTransition.smileCurve = 0;
                this.state.shakeOffset = 0;
                this.state.driftY = 0;
                // Clean up animation frame ID
                this.animationFrameIds.zenExit = null;
            }
        };
        
        this.animationFrameIds.zenExit = requestAnimationFrame(animate);
    }
    
    /**
     * Start recording mode
     */
    startRecording() {
        this.state.recording = true;
        console.log('EmotiveRenderer: Recording started');
    }
    
    /**
     * Stop recording mode
     */
    stopRecording() {
        this.state.recording = false;
        console.log('EmotiveRenderer: Recording stopped');
    }
    
    /**
     * Get random blink time (2-6 seconds)
     */
    getRandomBlinkTime() {
        return 2000 + Math.random() * 4000; // 2-6 seconds normally
    }
    
    /**
     * Convert hex to rgba
     */
    hexToRgba(hex, alpha = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
        }
        return `rgba(0, 0, 0, ${alpha})`;
    }
    
    /**
     * Set quality level for degradation manager compatibility
     * @param {number} quality - Quality level (0-1)
     */
    setQualityLevel(quality) {
        this.qualityLevel = Math.max(0, Math.min(1, quality));
        
        // Adjust rendering parameters based on quality
        if (this.qualityLevel < 0.5) {
            // Low quality mode
            this.ctx.imageSmoothingEnabled = false;
            this.state.breathDepth *= 0.5; // Reduce animation complexity
        } else if (this.qualityLevel < 0.8) {
            // Medium quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'medium';
        } else {
            // High quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
    }
    
    /**
     * Set quality reduction (for degradation manager)
     * @param {boolean} enabled - Whether quality reduction is enabled
     */
    setQualityReduction(enabled) {
        if (enabled) {
            this.setQualityLevel(0.5);
        } else {
            this.setQualityLevel(1.0);
        }
    }
    
    /**
     * Handle canvas context recovery
     * @param {CanvasRenderingContext2D} newContext - New context after recovery
     */
    handleContextRecovery(newContext) {
        this.ctx = newContext;
        console.log('EmotiveRenderer: Context recovered');
    }
    
    /**
     * Get the current undertone modifier for particle system
     * @returns {Object|null} Current undertone modifier or null
     */
    getUndertoneModifier() {
        if (!this.currentUndertone || !this.undertoneModifiers[this.currentUndertone]) {
            return null;
        }
        return this.undertoneModifiers[this.currentUndertone];
    }
    
    /**
     * Apply all active gesture animations
     * Returns combined transform object
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
            anim.progress = Math.min(elapsed / anim.params.duration, 1);
            
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
            }
            
            // Combine transforms
            transform.offsetX += gestureTransform.offsetX || 0;
            transform.offsetY += gestureTransform.offsetY || 0;
            transform.scale *= gestureTransform.scale || 1;
            transform.rotation += gestureTransform.rotation || 0;
            transform.glow *= gestureTransform.glow || 1;
            
            // Check if animation is complete
            if (anim.progress >= 1) {
                anim.active = false;
                console.log(`${gestureName} animation complete`);
            }
        }
        
        return transform;
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
        const glowIntensity = Math.sin(progress * Math.PI); // Fade in and out
        return {
            glow: 1 + (anim.params.glowPeak - 1) * glowIntensity
        };
    }
    
    applyFlicker(anim, progress) {
        const flickerPhase = Math.floor(progress * anim.params.frequency);
        const flicker = flickerPhase % 2 === 0 ? 1 : 0.5;
        return {
            glow: flicker * (anim.params.maxOpacity - anim.params.minOpacity) + anim.params.minOpacity
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
    
    /**
     * Start a gesture animation
     */
    startGesture(gestureName) {
        console.log(`EmotiveRenderer: Starting ${gestureName} animation`);
        
        // Get composed parameters based on current emotion and undertone
        const params = this.gestureCompositor.compose(
            gestureName,
            this.state.emotion,
            this.currentUndertone
        );
        
        // Set up the animation
        const anim = this.gestureAnimations[gestureName];
        if (anim) {
            anim.active = true;
            anim.startTime = performance.now();
            anim.progress = 0;
            anim.params = params;
            
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
            
            console.log(`${gestureName} params:`, params);
        }
    }
    
    /**
     * Get current active gesture information for particle system
     * @returns {Object|null} Current gesture with particleMotion and progress, or null
     */
    getCurrentGesture() {
        // Find the first active gesture with particle motion
        for (const [gestureName, anim] of Object.entries(this.gestureAnimations)) {
            if (anim.active && anim.params && anim.params.particleMotion) {
                const gestureInfo = {
                    name: gestureName,
                    particleMotion: anim.params.particleMotion,
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
    
    // Individual start methods for each gesture
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
        this.currentGesture = null;
    }
    
    /**
     * Check if any gesture is active
     */
    isGestureActive() {
        return Object.values(this.gestureAnimations).some(anim => anim.active);
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Cancel all animation frames to prevent memory leaks
        for (const key in this.animationFrameIds) {
            if (this.animationFrameIds[key]) {
                cancelAnimationFrame(this.animationFrameIds[key]);
                this.animationFrameIds[key] = null;
            }
        }
        
        // Clear animation states
        this.colorTransition.active = false;
        if (this.zenTransition) {
            this.zenTransition.active = false;
        }
        
        // Clear other resources
        this.speakingRings = [];
        
        // Clear gesture compositor cache
        if (this.gestureCompositor) {
            this.gestureCompositor.clearCache();
        }
    }
}

export default EmotiveRenderer;