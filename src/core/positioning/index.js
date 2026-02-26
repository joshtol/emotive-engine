/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Positioning System Index
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Main positioning system that orchestrates all positioning modules
 * @author Emotive Engine Team
 * @module positioning/index
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides a unified interface for all positioning methods. Combines element
 * ║ targeting, input tracking, physics, animation, and responsive positioning.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import { ElementTargeting } from './elementTargeting/index.js';
import InputTracking from './InputTracking.js';
import Physics from './Physics.js';
import Animation from './Animation.js';
import Responsive from './Responsive.js';

class PositioningSystem {
    constructor(positionController) {
        this.positionController = positionController;

        // Initialize all positioning modules
        this.elementTargeting = new ElementTargeting(positionController);
        this.inputTracking = new InputTracking(positionController);
        this.physics = new Physics(positionController);
        this.animation = new Animation(positionController);
        this.responsive = new Responsive(positionController);

        // Method registry for easy access
        this.methods = new Map();
        this.registerMethods();
    }

    /**
     * Register all positioning methods for easy access
     */
    registerMethods() {
        // Element targeting methods
        this.methods.set(
            'moveToElement',
            this.elementTargeting.moveToElement.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToButton',
            this.elementTargeting.moveToButton.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToForm',
            this.elementTargeting.moveToForm.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToModal',
            this.elementTargeting.moveToModal.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToNavigation',
            this.elementTargeting.moveToNavigation.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToContent',
            this.elementTargeting.moveToContent.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToSidebar',
            this.elementTargeting.moveToSidebar.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToHeader',
            this.elementTargeting.moveToHeader.bind(this.elementTargeting)
        );
        this.methods.set(
            'moveToFooter',
            this.elementTargeting.moveToFooter.bind(this.elementTargeting)
        );
        this.methods.set(
            'watchElement',
            this.elementTargeting.watchElement.bind(this.elementTargeting)
        );

        // Input tracking methods
        this.methods.set('moveToMouse', this.inputTracking.moveToMouse.bind(this.inputTracking));
        this.methods.set('moveToTouch', this.inputTracking.moveToTouch.bind(this.inputTracking));
        this.methods.set('moveToAudio', this.inputTracking.moveToAudio.bind(this.inputTracking));
        this.methods.set(
            'moveToViewport',
            this.inputTracking.moveToViewport.bind(this.inputTracking)
        );

        // Physics methods
        this.methods.set('moveToGrid', this.physics.moveToGrid.bind(this.physics));
        this.methods.set('moveToGravity', this.physics.moveToGravity.bind(this.physics));
        this.methods.set('moveToMagnetic', this.physics.moveToMagnetic.bind(this.physics));
        this.methods.set('moveToAvoid', this.physics.moveToAvoid.bind(this.physics));
        this.methods.set('moveToRandom', this.physics.moveToRandom.bind(this.physics));

        // Animation methods
        this.methods.set('moveToPath', this.animation.moveToPath.bind(this.animation));
        this.methods.set('moveToTime', this.animation.moveToTime.bind(this.animation));
        this.methods.set('moveToScroll', this.animation.moveToScroll.bind(this.animation));
        this.methods.set('animateTo', this.animation.animateTo.bind(this.animation));

        // Responsive methods
        this.methods.set(
            'moveToResponsive',
            this.responsive.moveToResponsive.bind(this.responsive)
        );
        this.methods.set('moveToGroup', this.responsive.moveToGroup.bind(this.responsive));
        this.methods.set(
            'moveToAccessibility',
            this.responsive.moveToAccessibility.bind(this.responsive)
        );
    }

    /**
     * Call a positioning method by name
     * @param {string} methodName - Name of the method to call
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} Result of the method call
     */
    call(methodName, ...args) {
        const method = this.methods.get(methodName);
        if (method) {
            return method(...args);
        } else {
            console.warn(`Positioning method not found: ${methodName}`);
            return null;
        }
    }

    /**
     * Get list of available positioning methods
     * @returns {Array} Array of method names
     */
    getAvailableMethods() {
        return Array.from(this.methods.keys());
    }

    /**
     * Check if a positioning method exists
     * @param {string} methodName - Name of the method to check
     * @returns {boolean} True if method exists
     */
    hasMethod(methodName) {
        return this.methods.has(methodName);
    }

    /**
     * Stop all positioning systems
     */
    stopAll() {
        this.elementTargeting.stopWatchingAll();
        this.inputTracking.stopAllTracking();
        this.physics.stopAllPhysics();
        this.animation.stopAllAnimations();
        this.responsive.stopAllResponsive();
    }

    /**
     * Destroy the positioning system
     */
    destroy() {
        this.stopAll();
        this.elementTargeting.destroy();
        this.inputTracking.destroy();
        this.physics.destroy();
        this.animation.destroy();
        this.responsive.destroy();
        this.methods.clear();
        this.positionController = null;
    }
}

export default PositioningSystem;
