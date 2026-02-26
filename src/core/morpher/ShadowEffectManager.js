/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *             ◐ ◑ ◒ ◓  SHADOW EFFECT MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ShadowEffectManager - Shadow Transition and Eclipse Effects
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module ShadowEffectManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages complex shadow transitions during shape morphing, including crescent
 * ║ shadows, lunar eclipse effects, solar transitions, and special shadow animations.
 * ║ Extracted from ShapeMorpher to isolate shadow rendering logic.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🌙 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Calculate shadow states during shape transitions
 * │ • Handle moon-to-other shape transitions with sliding shadows
 * │ • Manage lunar eclipse shadow effects
 * │ • Coordinate solar eclipse shadow movements
 * │ • Interpolate shadow properties (coverage, opacity, position)
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { SHAPE_DEFINITIONS } from '../shapes/shapeDefinitions.js';
import { shapeCache } from '../cache/ShapeCache.js';

export class ShadowEffectManager {
    /**
     * Create ShadowEffectManager
     * @param {Function} getMorpherState - Function that returns morpher state
     */
    constructor(getMorpherState) {
        this._getMorpherState = getMorpherState;
    }

    /**
     * Get current shadow state during transition
     * @returns {Object} Shadow definition with type, coverage, position, etc.
     *
     * Handles 7 special transition types:
     * - from_moon: Slide shadow away before morphing
     * - moon_to_lunar: Crescent transforms into lunar eclipse
     * - lunar_to_moon: Lunar eclipse transforms into crescent
     * - eclipse_enter_lunar: Shadow slides in and becomes lunar
     * - eclipse_exit_lunar: Lunar transforms and slides out
     * - eclipse_enter/exit: Solar eclipse shadow movements
     * - sun_fade/bloom: Solar effect transitions
     */
    getCurrentShadow() {
        const state = this._getMorpherState();

        // Default to circle if currentShape is somehow null/undefined
        const shapeName = state.currentShape || 'circle';
        const currentDef =
            shapeCache && shapeCache.isInitialized
                ? shapeCache.getShape(shapeName)
                : SHAPE_DEFINITIONS[shapeName];
        const targetDef = state.targetShape
            ? shapeCache && shapeCache.isInitialized
                ? shapeCache.getShape(state.targetShape)
                : SHAPE_DEFINITIONS[state.targetShape]
            : null;

        const currentShadow = currentDef?.shadow || { type: 'none' };
        const targetShadow = targetDef?.shadow || null;

        // If not transitioning, return current shadow
        if (!state.isTransitioning || !targetShadow) {
            return currentShadow;
        }

        // Handle eclipse progressions and other special transitions
        const easedProgress = state.morphProgress;

        // FROM MOON - ALWAYS slide shadow away first (other shapes)
        if (
            state.transitionConfig &&
            state.transitionConfig.type === 'from_moon' &&
            state.transitionConfig.slideOutCrescent
        ) {
            return this._calculateMoonSlideOut(easedProgress, state.transitionConfig);
        }

        // Moon to lunar - smooth crescent to eclipse transition
        if (state.transitionConfig && state.transitionConfig.type === 'moon_to_lunar') {
            return this._calculateMoonToLunar(easedProgress, state.transitionConfig);
        }

        // Eclipse entering lunar - smooth shadow entry
        if (state.transitionConfig && state.transitionConfig.type === 'eclipse_enter_lunar') {
            return this._calculateEclipseEnterLunar(easedProgress, state.transitionConfig);
        }

        // Lunar to moon - smooth shadow transformation and movement
        if (state.transitionConfig && state.transitionConfig.type === 'lunar_to_moon') {
            return this._calculateLunarToMoon(easedProgress, state.transitionConfig);
        }

        // Eclipse exiting lunar - smooth shadow exit
        if (state.transitionConfig && state.transitionConfig.type === 'eclipse_exit_lunar') {
            return this._calculateEclipseExitLunar(easedProgress, state.transitionConfig);
        }

        // Solar eclipse transitions
        if (state.transitionConfig && state.transitionConfig.type === 'eclipse_enter') {
            return this._calculateEclipseEnter(easedProgress, targetShadow);
        } else if (state.transitionConfig.type === 'eclipse_exit') {
            return this._calculateEclipseExit(easedProgress, currentShadow);
        } else if (state.transitionConfig.type === 'sun_fade') {
            return this._calculateSunFade(easedProgress, currentShadow);
        } else if (state.transitionConfig.type === 'sun_bloom') {
            return this._calculateSunBloom(easedProgress, targetShadow);
        }

        // Standard transition
        if (currentShadow.type !== 'none' || targetShadow.type !== 'none') {
            const coverage =
                (currentShadow.coverage || 0) +
                ((targetShadow.coverage || 0) - (currentShadow.coverage || 0)) * easedProgress;

            return {
                type: targetShadow.type !== 'none' ? targetShadow.type : currentShadow.type,
                coverage,
                angle: targetShadow.angle || currentShadow.angle || 0,
                softness: targetShadow.softness || currentShadow.softness || 0.2,
                progress: easedProgress,
            };
        }

        return currentShadow;
    }

    /**
     * Calculate moon shadow sliding out before morphing
     * @private
     */
    _calculateMoonSlideOut(easedProgress, transitionConfig) {
        const slideRatio = transitionConfig.shadowSlideRatio || 0.4;

        // PHASE 1: Shadow slides away
        if (easedProgress < slideRatio) {
            const slideProgress = easedProgress / slideRatio; // 0 to 1 during slide
            const angle = (-30 * Math.PI) / 180; // Moon shadow angle (bottom-left)

            // Shadow continues sliding in its direction (away to bottom-left)
            const startOffset = 0.7; // Where moon shadow normally sits
            const endOffset = 2.5; // Far off screen
            const currentOffset = startOffset + (endOffset - startOffset) * slideProgress;

            const offsetX = Math.cos(angle) * currentOffset;
            const offsetY = Math.sin(angle) * currentOffset;

            // Keep full opacity while sliding, slight fade at the end
            const coverage = slideProgress > 0.8 ? 0.85 * (1 - (slideProgress - 0.8) * 5) : 0.85;

            return {
                type: 'crescent',
                coverage,
                angle: -30,
                offset: currentOffset,
                shadowX: offsetX,
                shadowY: offsetY,
            };
        }

        // PHASE 2: No shadow, morph can proceed
        return { type: 'none' };
    }

    /**
     * Calculate moon to lunar eclipse transition
     * @private
     */
    _calculateMoonToLunar(easedProgress, transitionConfig) {
        const angle = (transitionConfig.startAngle * Math.PI) / 180;
        const offsetProgress = 1 - easedProgress; // Goes from 1 to 0 (crescent position to center)
        const offsetX = Math.cos(angle) * 0.7 * offsetProgress;
        const offsetY = Math.sin(angle) * 0.7 * offsetProgress;

        // Smooth transition from crescent to lunar
        const lunarBlend = Math.pow(easedProgress, 2); // Quadratic for smooth blend

        // Gradually change from crescent to lunar shadow
        if (easedProgress < 0.6) {
            // Still mostly crescent, moving to center
            return {
                type: 'crescent',
                coverage: 0.85 * (1 - lunarBlend * 0.2), // Slight fade
                angle: transitionConfig.startAngle,
                offset: 0.7 * offsetProgress,
                shadowX: offsetX,
                shadowY: offsetY,
            };
        } else {
            // Smooth blend to lunar shadow
            const blendPhase = (easedProgress - 0.6) / 0.4; // 0 to 1 for last 40%
            const smoothBlend = Math.sin((blendPhase * Math.PI) / 2); // Smooth S-curve

            return {
                type: 'lunar',
                coverage: 0.85 + 0.1 * smoothBlend, // Gradually increase to 0.95
                color: `rgba(80, 20, 0, ${0.7 + 0.2 * smoothBlend})`, // Fade in red
                shadowX: offsetX * (1 - smoothBlend), // Smooth center
                shadowY: offsetY * (1 - smoothBlend),
                diffusion: smoothBlend,
                shadowProgress: easedProgress,
            };
        }
    }

    /**
     * Calculate eclipse entering lunar phase
     * @private
     */
    _calculateEclipseEnterLunar(easedProgress, transitionConfig) {
        // First 30%: Just morph shape, no shadow (reduced from 40%)
        if (easedProgress < 0.3) {
            return { type: 'none' };
        }

        // Last 70%: Shadow smoothly enters and transforms
        const shadowProgress = (easedProgress - 0.3) / 0.7; // 0 to 1 for shadow animation
        const smoothProgress = Math.sin((shadowProgress * Math.PI) / 2); // Smooth ease-in
        const angle = (transitionConfig.startAngle * Math.PI) / 180;
        const offsetProgress = 1 - smoothProgress; // Goes from 1 to 0
        const offsetX = Math.cos(angle) * 0.7 * offsetProgress;
        const offsetY = Math.sin(angle) * 0.7 * offsetProgress;

        // Smooth transition throughout
        if (shadowProgress < 0.7) {
            // Crescent shadow sliding in with gradual fade
            const fadeIn = Math.pow(shadowProgress / 0.7, 0.5); // Smooth fade in
            return {
                type: 'crescent',
                coverage: 0.85 * fadeIn,
                angle: transitionConfig.startAngle,
                offset: 0.7 * offsetProgress,
                shadowX: offsetX,
                shadowY: offsetY,
            };
        } else {
            // Smooth blend to lunar
            const blendProgress = (shadowProgress - 0.7) / 0.3; // Last 30% for blend
            const smoothBlend = Math.sin((blendProgress * Math.PI) / 2); // Smooth curve

            return {
                type: 'lunar',
                coverage: 0.85 + 0.1 * smoothBlend,
                color: `rgba(80, 20, 0, ${0.6 + 0.3 * smoothBlend})`,
                shadowX: offsetX * (1 - smoothBlend),
                shadowY: offsetY * (1 - smoothBlend),
                diffusion: smoothBlend,
                shadowProgress,
            };
        }
    }

    /**
     * Calculate lunar to moon transition
     * @private
     */
    _calculateLunarToMoon(easedProgress, transitionConfig) {
        const angle = (transitionConfig.exitAngle * Math.PI) / 180;

        // Smooth movement curve
        const movementCurve = Math.sin((easedProgress * Math.PI) / 2); // Smooth ease-out
        const offsetX = Math.cos(angle) * 0.7 * movementCurve;
        const offsetY = Math.sin(angle) * 0.7 * movementCurve;

        // Smooth blend between lunar and crescent
        if (easedProgress < 0.6) {
            // Lunar shadow gradually transforming
            const transformPhase = easedProgress / 0.6;
            const smoothTransform = Math.pow(transformPhase, 0.7);

            return {
                type: 'lunar',
                coverage: 0.95 - 0.1 * smoothTransform,
                color: `rgba(80, 20, 0, ${0.9 - 0.3 * smoothTransform})`,
                shadowX: offsetX * 0.7, // Start moving earlier
                shadowY: offsetY * 0.7,
                diffusion: 1 - smoothTransform,
            };
        } else {
            // Smooth transition to crescent
            const crescentPhase = (easedProgress - 0.6) / 0.4;
            const fadeIn = Math.sin((crescentPhase * Math.PI) / 2);

            return {
                type: 'crescent',
                coverage: 0.85 * fadeIn + 0.1, // Smooth fade in
                angle: transitionConfig.exitAngle,
                offset: 0.7,
                shadowX: offsetX,
                shadowY: offsetY,
            };
        }
    }

    /**
     * Calculate eclipse exiting lunar phase
     * @private
     */
    _calculateEclipseExitLunar(easedProgress, transitionConfig) {
        // First 70%: Shadow smoothly exits
        if (easedProgress < 0.7) {
            const shadowProgress = easedProgress / 0.7; // 0 to 1 for shadow exit

            const angle = (transitionConfig.exitAngle * Math.PI) / 180;

            // Gradual transformation and movement
            if (shadowProgress < 0.4) {
                // Lunar shadow gradually transforming
                const transformPhase = shadowProgress / 0.4;
                const diffusion = 1 - transformPhase;
                const moveStart = transformPhase * 0.3; // Start moving early

                return {
                    type: 'lunar',
                    coverage: 0.95 - 0.1 * transformPhase,
                    color: `rgba(80, 20, 0, ${0.9 - 0.2 * transformPhase})`,
                    shadowX: Math.cos(angle) * 0.7 * moveStart,
                    shadowY: Math.sin(angle) * 0.7 * moveStart,
                    diffusion,
                };
            } else {
                // Smooth exit as crescent
                const exitPhase = (shadowProgress - 0.4) / 0.6;
                const smoothMove = Math.pow(exitPhase, 0.8);
                const offsetX = Math.cos(angle) * 0.7 * smoothMove;
                const offsetY = Math.sin(angle) * 0.7 * smoothMove;
                const fadeOut = 1 - Math.pow(exitPhase, 2); // Gradual fade

                return {
                    type: 'crescent',
                    coverage: 0.85 * fadeOut,
                    angle: transitionConfig.exitAngle,
                    offset: 0.7 * smoothMove,
                    shadowX: offsetX,
                    shadowY: offsetY,
                };
            }
        }

        // Last 30%: Just morph shape, no shadow
        return { type: 'none' };
    }

    /**
     * Calculate solar eclipse entering
     * @private
     */
    _calculateEclipseEnter(easedProgress, targetShadow) {
        const shadowX = 1.5 - easedProgress * 1.5; // From right

        return {
            ...targetShadow,
            shadowX,
            shadowProgress: easedProgress,
        };
    }

    /**
     * Calculate solar eclipse exiting
     * @private
     */
    _calculateEclipseExit(easedProgress, currentShadow) {
        const shadowX = -easedProgress * 1.5; // To left

        return {
            ...currentShadow,
            coverage: currentShadow.coverage * (1 - easedProgress),
            shadowX,
            shadowProgress: 1 - easedProgress,
        };
    }

    /**
     * Calculate sun effect fading
     * @private
     */
    _calculateSunFade(easedProgress, currentShadow) {
        // Smooth fading of sun effects
        const fadeMultiplier = 1 - easedProgress;

        // Gradual fade with different timing for each effect
        return {
            ...currentShadow,
            intensity: (currentShadow.intensity || 1) * Math.pow(fadeMultiplier, 0.7), // Slower fade
            corona: currentShadow.corona,
            coronaOpacity: fadeMultiplier, // Fade corona smoothly
            flares: currentShadow.flares,
            flaresOpacity: Math.pow(fadeMultiplier, 1.5), // Flares fade faster
            texture: currentShadow.texture,
            textureOpacity: Math.pow(fadeMultiplier, 2), // Texture fades fastest
            turbulence: (currentShadow.turbulence || 0.3) * fadeMultiplier,
        };
    }

    /**
     * Calculate sun effect blooming
     * @private
     */
    _calculateSunBloom(easedProgress, targetShadow) {
        // Smooth blooming of sun effects
        const bloomProgress = easedProgress;

        // Gradual bloom with different timing for each effect
        return {
            ...targetShadow,
            intensity: (targetShadow.intensity || 1) * Math.pow(bloomProgress, 1.5), // Start slow
            corona: targetShadow.corona,
            coronaOpacity: Math.pow(bloomProgress, 0.8), // Corona blooms gradually
            flares: targetShadow.flares,
            flaresOpacity: bloomProgress > 0.3 ? Math.pow((bloomProgress - 0.3) / 0.7, 0.7) : 0, // Flares appear later
            texture: targetShadow.texture,
            textureOpacity: bloomProgress > 0.5 ? Math.pow((bloomProgress - 0.5) / 0.5, 2) : 0, // Texture appears last
            turbulence: (targetShadow.turbulence || 0.3) * bloomProgress,
        };
    }
}
