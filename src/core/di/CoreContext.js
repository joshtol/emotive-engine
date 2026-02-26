/**
 * CoreContext - Dependency injection container for manager classes
 *
 * Instead of passing the entire mascot instance to managers, we inject
 * only the specific dependencies they need. This creates explicit,
 * testable interfaces and breaks circular coupling.
 *
 * @example
 * // Before (tight coupling):
 * class SomeManager {
 *     constructor(mascot) {
 *         this.mascot = mascot;
 *     }
 *     doThing() {
 *         this.mascot.renderer.something();
 *         this.mascot.emit('event');
 *     }
 * }
 *
 * // After (explicit dependencies):
 * class SomeManager {
 *     constructor({ renderer, events }) {
 *         this.renderer = renderer;
 *         this.events = events;
 *     }
 *     doThing() {
 *         this.renderer.something();
 *         this.events.emit('event');
 *     }
 * }
 */

/**
 * @typedef {Object} CoreContext
 * @property {Object} renderer - The main EmotiveRenderer instance
 * @property {Object} errorBoundary - Error handling wrapper
 * @property {Object} stateMachine - Emotion state machine
 * @property {Object} particleSystem - Particle effects system
 * @property {Object} canvasManager - Canvas operations manager
 * @property {Object} animationController - Animation loop controller
 * @property {Object} config - Configuration object
 * @property {Object} events - Event emitter (emit, on, off, once)
 */

/**
 * Creates a CoreContext from a mascot instance
 * Used during migration to gradually convert managers
 *
 * @param {Object} mascot - The EmotiveMascot instance
 * @returns {CoreContext}
 */
export function createCoreContext(mascot) {
    return {
        renderer: mascot.renderer,
        errorBoundary: mascot.errorBoundary,
        stateMachine: mascot.stateMachine,
        particleSystem: mascot.particleSystem,
        canvasManager: mascot.canvasManager,
        animationController: mascot.animationController,
        config: mascot.config,
        events: {
            emit: (event, data) => mascot.emit(event, data),
            on: (event, cb) => mascot.eventManager.on(event, cb),
            off: (event, cb) => mascot.eventManager.off(event, cb),
            once: (event, cb) => mascot.eventManager.once(event, cb),
        },
    };
}

/**
 * Creates a minimal CoreContext for testing
 *
 * @param {Partial<CoreContext>} overrides - Properties to override
 * @returns {CoreContext}
 */
export function createMockCoreContext(overrides = {}) {
    return {
        renderer: { setEmotionalState: () => {}, startSpeaking: () => {}, stopSpeaking: () => {} },
        errorBoundary: { wrap: fn => fn, logError: () => {} },
        stateMachine: { getState: () => 'neutral', setState: () => {} },
        particleSystem: { spawn: () => {}, update: () => {}, clear: () => {} },
        canvasManager: { clear: () => {}, getContext: () => null },
        animationController: { start: () => {}, stop: () => {} },
        config: {},
        events: { emit: () => {}, on: () => {}, off: () => {}, once: () => {} },
        ...overrides,
    };
}

export default { createCoreContext, createMockCoreContext };
