/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *               ◐ ◑ ◒ ◓  GESTURE CONTROLLER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview GestureController - Gesture Triggering and Chain Execution
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module GestureController
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages gesture triggering, chain combos, and undertone updates. Provides unified
 * ║ interface for expressing individual gestures or executing complex gesture chains
 * ║ with timeline recording support.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Trigger individual gestures (bounce, pulse, shake, etc.)
 * │ • Execute gesture chain combos (rise, flow, burst, etc.)
 * │ • Parse chain syntax (simultaneous: +, sequential: >)
 * │ • Record gestures to timeline during recording
 * │ • Update emotional undertones
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class GestureController {
    /**
     * Create GestureController
     * @param {Function} getEngine - Function that returns the real engine instance
     * @param {Object} recording - Recording state object {isRecording, startTime, timeline}
     */
    constructor(getEngine, recording) {
        this._getEngine = getEngine;
        this._recording = recording;

        // Chain combo definitions
        this._chainDefinitions = {
            'rise': 'breathe > sway+lean+tilt',
            'flow': 'sway > lean+tilt > spin > bounce',
            'burst': 'jump > nod > shake > flash',
            'drift': 'sway+breathe+float+drift',
            'chaos': 'shake+shake > spin+flash > bounce+pulse > twist+sparkle',
            'morph': 'expand > contract > morph+glow > expand+flash',
            'rhythm': 'pulse > pulse+sparkle > pulse+flicker',
            'spiral': 'spin > orbital > twist > orbital+sparkle',
            'routine': 'nod > bounce > spin+sparkle > sway+pulse > nod+flash',
            'radiance': 'sparkle > pulse+flicker > shimmer',
            'twinkle': 'sparkle > flash > pulse+sparkle > shimmer+flicker',
            'stream': 'wave > nod+pulse > sparkle > flash'
        };
    }

    /**
     * Trigger a gesture
     * @param {string} gestureName - Name of gesture to trigger
     * @param {number} [timestamp] - Optional timestamp for recording
     *
     * @example
     * // Simple gesture
     * gestureController.triggerGesture('bounce');
     *
     * @example
     * // With custom timestamp for playback sync
     * gestureController.triggerGesture('pulse', 1500);
     */
    triggerGesture(gestureName, timestamp) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Record if in recording mode
        if (this._recording.isRecording()) {
            const time = timestamp || (Date.now() - this._recording.startTime());
            this._recording.timeline().push({
                type: 'gesture',
                name: gestureName,
                time
            });
        }

        // Trigger in engine
        engine.express(gestureName);
    }

    /**
     * Express a gesture (alias for triggerGesture for compatibility)
     * @param {string} gestureName - Name of gesture to express
     * @param {number} [timestamp] - Optional timestamp for recording
     *
     * @example
     * gestureController.express('shake');
     */
    express(gestureName, timestamp) {
        return this.triggerGesture(gestureName, timestamp);
    }

    /**
     * Execute a gesture chain combo
     * @param {string} chainName - Name of the chain combo to execute
     *
     * @example
     * // Execute 'rise' chain: breathe > sway+lean+tilt
     * gestureController.chain('rise');
     *
     * @example
     * // Execute 'burst' chain: jump > nod > shake > flash
     * gestureController.chain('burst');
     *
     * @example
     * // Available chains:
     * // - rise, flow, burst, drift, chaos, morph
     * // - rhythm, spiral, routine, radiance, twinkle, stream
     */
    chain(chainName) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        const chainDefinition = this._chainDefinitions[chainName.toLowerCase()];
        if (!chainDefinition) {
            console.warn(`Chain combo '${chainName}' not found`);
            return;
        }

        // Parse and execute chain
        if (!chainDefinition.includes('>')) {
            // Simultaneous gestures (e.g., 'sway+breathe+float+drift')
            const gestures = chainDefinition.split('+').map(g => g.trim()).filter(g => g.length > 0);
            gestures.forEach(gesture => {
                engine.express(gesture);
            });
        } else {
            // Sequential groups (e.g., 'jump > nod > shake > flash')
            const gestureGroups = chainDefinition.split('>').map(g => g.trim()).filter(g => g.length > 0);

            gestureGroups.forEach((group, groupIndex) => {
                setTimeout(() => {
                    // Each group can have simultaneous gestures (e.g., 'sway+pulse')
                    const simultaneousGestures = group.split('+').map(g => g.trim()).filter(g => g.length > 0);
                    simultaneousGestures.forEach(gesture => {
                        engine.express(gesture);
                    });
                }, groupIndex * 500); // 500ms delay between groups
            });
        }
    }

    /**
     * Update undertone
     * @param {string|null} undertone - Undertone name or null to clear
     *
     * @example
     * // Apply undertone
     * gestureController.updateUndertone('energetic');
     *
     * @example
     * // Clear undertone
     * gestureController.updateUndertone(null);
     *
     * @example
     * // Available undertones: subdued, tired, nervous, energetic, confident, intense
     */
    updateUndertone(undertone) {
        const engine = this._getEngine();
        if (!engine) throw new Error('Engine not initialized. Call init() first.');

        // Apply undertone to current emotion
        if (engine.updateUndertone && typeof engine.updateUndertone === 'function') {
            engine.updateUndertone(undertone);
        } else if (engine.addUndertone && typeof engine.addUndertone === 'function') {
            engine.addUndertone(undertone);
        }
    }

    /**
     * Get available chain combo names
     * @returns {Array<string>} List of chain names
     *
     * @example
     * const chains = gestureController.getAvailableChains();
     * console.log('Available chains:', chains);
     */
    getAvailableChains() {
        return Object.keys(this._chainDefinitions);
    }

    /**
     * Get chain definition
     * @param {string} chainName - Name of chain
     * @returns {string|null} Chain definition or null if not found
     *
     * @example
     * const def = gestureController.getChainDefinition('rise');
     * console.log(def); // 'breathe > sway+lean+tilt'
     */
    getChainDefinition(chainName) {
        return this._chainDefinitions[chainName.toLowerCase()] || null;
    }
}
