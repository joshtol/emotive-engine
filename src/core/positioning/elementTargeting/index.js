/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting Module Index
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Export all element targeting modules for easy importing
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/index
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides a single import point for all element targeting functionality, making    
 * ║ it easy to use any combination of targeting features in the engine.               
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

// Core element targeting
export { default as ElementTargeting } from './ElementTargeting.js';

// Callback-based targeting
export { default as ElementTargetingCallbacks } from './ElementTargetingCallbacks.js';

// Advanced targeting features
export { default as ElementTargetingAdvanced } from './ElementTargetingAdvanced.js';

// Context-aware targeting
export { default as ElementTargetingContext } from './ElementTargetingContext.js';

// Interactive targeting
export { default as ElementTargetingInteractions } from './ElementTargetingInteractions.js';

// Animation targeting
export { default as ElementTargetingAnimations } from './ElementTargetingAnimations.js';

// Visual effects targeting
export { default as ElementTargetingEffects } from './ElementTargetingEffects.js';

// Accessibility targeting
export { default as ElementTargetingAccessibility } from './ElementTargetingAccessibility.js';

// Import classes for ElementTargetingAll
import ElementTargetingCallbacks from './ElementTargetingCallbacks.js';
import ElementTargetingAdvanced from './ElementTargetingAdvanced.js';
import ElementTargetingContext from './ElementTargetingContext.js';
import ElementTargetingInteractions from './ElementTargetingInteractions.js';
import ElementTargetingAnimations from './ElementTargetingAnimations.js';
import ElementTargetingEffects from './ElementTargetingEffects.js';
import ElementTargetingAccessibility from './ElementTargetingAccessibility.js';

// Combined class that includes all features
export class ElementTargetingAll {
    constructor(positionController) {
        this.positionController = positionController;
        
        // Initialize all targeting modules
        this.callbacks = new ElementTargetingCallbacks(positionController);
        this.advanced = new ElementTargetingAdvanced(positionController);
        this.context = new ElementTargetingContext(positionController);
        this.interactions = new ElementTargetingInteractions(positionController);
        this.animations = new ElementTargetingAnimations(positionController);
        this.effects = new ElementTargetingEffects(positionController);
        this.accessibility = new ElementTargetingAccessibility(positionController);
    }

    // Delegate methods to appropriate modules
    moveToElementWithCallback(...args) { return this.callbacks.moveToElementWithCallback(...args); }
    moveToElementSequence(...args) { return this.callbacks.moveToElementSequence(...args); }
    moveToElementWithDelay(...args) { return this.callbacks.moveToElementWithDelay(...args); }
    moveToElementWithCondition(...args) { return this.callbacks.moveToElementWithCondition(...args); }
    moveToElementWithRepeat(...args) { return this.callbacks.moveToElementWithRepeat(...args); }
    moveToElementWithProximity(...args) { return this.callbacks.moveToElementWithProximity(...args); }

    moveToElementWithPath(...args) { return this.advanced.moveToElementWithPath(...args); }
    moveToElementWithEasing(...args) { return this.advanced.moveToElementWithEasing(...args); }
    moveToElementWithCollision(...args) { return this.advanced.moveToElementWithCollision(...args); }
    moveToElementWithAudio(...args) { return this.advanced.moveToElementWithAudio(...args); }
    moveToElementWithGaze(...args) { return this.advanced.moveToElementWithGaze(...args); }

    moveToElementWithScroll(...args) { return this.context.moveToElementWithScroll(...args); }
    moveToElementWithPhysics(...args) { return this.context.moveToElementWithPhysics(...args); }
    moveToElementWithGroup(...args) { return this.context.moveToElementWithGroup(...args); }
    moveToElementWithResponsive(...args) { return this.context.moveToElementWithResponsive(...args); }
    moveToElementWithAccessibility(...args) { return this.context.moveToElementWithAccessibility(...args); }

    moveToElementWithHover(...args) { return this.interactions.moveToElementWithHover(...args); }
    moveToElementWithClick(...args) { return this.interactions.moveToElementWithClick(...args); }
    moveToElementWithTouch(...args) { return this.interactions.moveToElementWithTouch(...args); }
    moveToElementWithFocus(...args) { return this.interactions.moveToElementWithFocus(...args); }
    moveToElementWithKeyboard(...args) { return this.interactions.moveToElementWithKeyboard(...args); }

    moveToElementWithBounce(...args) { return this.animations.moveToElementWithBounce(...args); }
    moveToElementWithShake(...args) { return this.animations.moveToElementWithShake(...args); }
    moveToElementWithPulse(...args) { return this.animations.moveToElementWithPulse(...args); }
    moveToElementWithWiggle(...args) { return this.animations.moveToElementWithWiggle(...args); }
    moveToElementWithCustom(...args) { return this.animations.moveToElementWithCustom(...args); }

    moveToElementWithTrail(...args) { return this.effects.moveToElementWithTrail(...args); }
    moveToElementWithParticles(...args) { return this.effects.moveToElementWithParticles(...args); }
    moveToElementWithGlow(...args) { return this.effects.moveToElementWithGlow(...args); }

    moveToElementWithScreenReader(...args) { return this.accessibility.moveToElementWithScreenReader(...args); }
    moveToElementWithKeyboardAccessible(...args) { return this.accessibility.moveToElementWithKeyboard(...args); }
    moveToElementWithHighContrast(...args) { return this.accessibility.moveToElementWithHighContrast(...args); }
    moveToElementWithReducedMotion(...args) { return this.accessibility.moveToElementWithReducedMotion(...args); }
    moveToElementWithFocusAccessible(...args) { return this.accessibility.moveToElementWithFocus(...args); }

    // Utility methods
    announceToScreenReader(...args) { return this.accessibility.announceToScreenReader(...args); }
    navigateFocus(...args) { return this.accessibility.navigateFocus(...args); }
    enableAccessibility(...args) { return this.accessibility.enableAccessibility(...args); }
    disableAccessibility(...args) { return this.accessibility.disableAccessibility(...args); }

    // Destroy all modules
    destroy() {
        this.callbacks.destroy();
        this.advanced.destroy();
        this.context.destroy();
        this.interactions.destroy();
        this.animations.destroy();
        this.effects.destroy();
        this.accessibility.destroy();
    }
}

// Default export for convenience
export default ElementTargetingAll;
