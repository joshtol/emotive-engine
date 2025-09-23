/*!
 * Event Manager - Centralized event delegation system
 * Replaces individual event listeners with efficient delegation
 */

import { debounce, throttle, rafThrottle } from '../utils/performance.js';

/**
 * EventManager - Centralized event delegation and management
 */
export class EventManager {
    constructor() {
        this.delegatedEvents = new Map();
        this.cleanupFunctions = new Map();
        this.throttledHandlers = new Map();
        this.debouncedHandlers = new Map();
    }

    /**
     * Initialize event delegation for the entire app
     * @param {Element} rootElement - Root element to delegate from (usually document.body)
     */
    init(rootElement = document.body) {
        this.rootElement = rootElement;
        this.setupGlobalEventDelegation();
        this.setupWindowEvents();
    }

    /**
     * Setup global event delegation for common UI interactions
     */
    setupGlobalEventDelegation() {
        // Button clicks - delegate all button interactions
        this.delegate('click', '[data-emotion]', (e) => this.handleEmotionClick(e));
        this.delegate('click', '[data-gesture]', (e) => this.handleGestureClick(e));
        this.delegate('click', '[data-chain]', (e) => this.handleChainClick(e));
        this.delegate('click', '[data-shape]', (e) => this.handleShapeClick(e));
        this.delegate('click', '[data-dice]', (e) => this.handleDiceClick(e));
        this.delegate('click', '[data-toggle]', (e) => this.handleToggleClick(e));
        this.delegate('click', '[data-randomize]', (e) => this.handleRandomizeClick(e));
        this.delegate('click', '[data-randomize-all]', (e) => this.handleRandomizeAllClick(e));
        
        // Form inputs
        this.delegate('input', 'input[type="range"]', (e) => this.handleSliderInput(e));
        this.delegate('change', 'input[type="file"]', (e) => this.handleFileSelect(e));
        
        // Audio controls
        this.delegate('click', '[data-audio-load]', (e) => this.handleAudioLoadClick(e));
        this.delegate('click', '[data-audio-play]', (e) => this.handleAudioPlayClick(e));
        
        // System controls
        this.delegate('click', '[data-fps-toggle]', (e) => this.handleFPSToggle(e));
        this.delegate('click', '[data-blinking-toggle]', (e) => this.handleBlinkingToggle(e));
        this.delegate('click', '[data-gaze-toggle]', (e) => this.handleGazeToggle(e));
        this.delegate('click', '[data-record-toggle]', (e) => this.handleRecordToggle(e));
    }

    /**
     * Setup window-level events with throttling
     */
    setupWindowEvents() {
        // Throttled resize handler
        const throttledResize = throttle(() => this.handleResize(), 100);
        window.addEventListener('resize', throttledResize);
        this.cleanupFunctions.set('resize', () => {
            window.removeEventListener('resize', throttledResize);
        });

        // Orientation change
        if ('orientation' in window) {
            const orientationHandler = () => this.handleOrientationChange();
            window.addEventListener('orientationchange', orientationHandler);
            this.cleanupFunctions.set('orientation', () => {
                window.removeEventListener('orientationchange', orientationHandler);
            });
        }

        // Audio events (delegated to audio elements)
        this.delegate('play', 'audio', (e) => this.handleAudioPlay(e));
        this.delegate('pause', 'audio', (e) => this.handleAudioPause(e));
        this.delegate('ended', 'audio', (e) => this.handleAudioEnded(e));
    }

    /**
     * Delegate event with automatic cleanup
     * @param {string} event - Event type
     * @param {string} selector - CSS selector
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    delegate(event, selector, handler, options = {}) {
        const delegatedHandler = (e) => {
            if (e.target.matches(selector)) {
                handler.call(e.target, e);
            }
        };

        this.rootElement.addEventListener(event, delegatedHandler, options);
        
        // Store for cleanup
        const key = `${event}:${selector}`;
        this.delegatedEvents.set(key, { handler: delegatedHandler, options });
    }

    /**
     * Create throttled handler
     * @param {Function} handler - Original handler
     * @param {number} delay - Throttle delay
     * @param {string} key - Unique key for the handler
     * @returns {Function} - Throttled handler
     */
    createThrottledHandler(handler, delay, key) {
        if (this.throttledHandlers.has(key)) {
            return this.throttledHandlers.get(key);
        }

        const throttled = throttle(handler, delay);
        this.throttledHandlers.set(key, throttled);
        return throttled;
    }

    /**
     * Create debounced handler
     * @param {Function} handler - Original handler
     * @param {number} delay - Debounce delay
     * @param {string} key - Unique key for the handler
     * @returns {Function} - Debounced handler
     */
    createDebouncedHandler(handler, delay, key) {
        if (this.debouncedHandlers.has(key)) {
            return this.debouncedHandlers.get(key);
        }

        const debounced = debounce(handler, delay);
        this.debouncedHandlers.set(key, debounced);
        return debounced;
    }

    /**
     * Event handlers - these will be called by the app controllers
     */
    
    // Emotion button handler
    handleEmotionClick(e) {
        console.log('EventManager handleEmotionClick called with:', e.target);
        const emotion = e.target.dataset.emotion;
        console.log('EventManager: Extracted emotion:', emotion);
        
        if (emotion && window.app?.emotionController) {
            console.log('EventManager: Calling emotionController.setEmotion with:', emotion);
            window.app.emotionController.setEmotion(emotion);
        } else if (emotion) {
            console.log('EventManager: Fallback - calling mascot.setEmotion with:', emotion);
            // Fallback: direct mascot call if controller not loaded yet
            if (window.app?.mascot) {
                window.app.mascot.setEmotion(emotion);
            }
        } else {
            console.warn('EventManager: No emotion found in dataset');
        }
    }

    // Gesture button handler
    handleGestureClick(e) {
        const gesture = e.target.dataset.gesture;
        if (gesture && window.app?.gestureController) {
            window.app.gestureController.triggerGesture(gesture);
        } else if (gesture) {
            // Fallback: direct mascot call if controller not loaded yet
            if (window.app?.mascot) {
                window.app.mascot.triggerGesture(gesture);
            }
        }
    }

    // Chain button handler
    handleChainClick(e) {
        const chainType = e.target.dataset.chain;
        if (chainType && window.app?.gestureChainController) {
            window.app.gestureChainController.executeChain(chainType, e.target);
        }
    }

    // Shape button handler
    handleShapeClick(e) {
        const shape = e.target.dataset.shape;
        if (shape && window.app?.shapeMorphController) {
            window.app.shapeMorphController.setShape(shape);
        } else if (shape) {
            // Fallback: direct mascot call if controller not loaded yet
            if (window.app?.mascot) {
                window.app.mascot.setShape(shape);
            }
        }
    }

    // Dice button handler
    handleDiceClick(e) {
        const diceType = e.target.dataset.dice;
        if (diceType && window.app?.diceController) {
            window.app.diceController.rollDice(diceType);
        }
    }

    // Toggle button handler
    handleToggleClick(e) {
        const toggleType = e.target.dataset.toggle;
        if (toggleType && window.app?.systemControlsController) {
            window.app.systemControlsController.toggle(toggleType);
        }
    }

    // Randomize button handler
    handleRandomizeClick(e) {
        if (window.app?.randomizerController) {
            window.app.randomizerController.randomizeEmotion();
        }
    }

    // Randomize all button handler
    handleRandomizeAllClick(e) {
        if (window.app?.randomizerController) {
            window.app.randomizerController.randomizeAll();
        }
    }

    // Slider input handler
    handleSliderInput(e) {
        const value = parseInt(e.target.value);
        const sliderType = e.target.dataset.slider || 'undertone';
        
        if (sliderType === 'undertone' && window.app?.undertoneController) {
            window.app.undertoneController.handleSliderInput(value);
        }
    }

    // File select handler
    handleFileSelect(e) {
        if (window.app?.audioController) {
            window.app.audioController.handleFileSelect(e);
        }
    }

    // Audio load button handler
    handleAudioLoadClick(e) {
        if (window.app?.audioController) {
            window.app.audioController.loadAndPlayDemoTrack();
        }
    }

    // Audio play button handler
    handleAudioPlayClick(e) {
        if (window.app?.audioController) {
            window.app.audioController.togglePlayPause();
        }
    }

    // System control handlers
    handleFPSToggle(e) {
        if (window.app?.systemControlsController) {
            window.app.systemControlsController.toggleFPS();
        }
    }

    handleBlinkingToggle(e) {
        if (window.app?.systemControlsController) {
            window.app.systemControlsController.toggleBlinking();
        }
    }

    handleGazeToggle(e) {
        if (window.app?.systemControlsController) {
            window.app.systemControlsController.toggleGaze();
        }
    }

    handleRecordToggle(e) {
        if (window.app?.systemControlsController) {
            window.app.systemControlsController.toggleRecording();
        }
    }

    // Window event handlers
    handleResize() {
        if (window.app?.mascot) {
            window.app.mascot.handleResize();
        }
        if (window.app?.orientationController) {
            window.app.orientationController.handleResize();
        }
    }

    handleOrientationChange() {
        if (window.app?.orientationController) {
            window.app.orientationController.handleOrientationEvent();
        }
    }

    // Audio event handlers
    handleAudioPlay(e) {
        if (window.app?.audioController) {
            window.app.audioController.handlePlay();
        }
    }

    handleAudioPause(e) {
        if (window.app?.audioController) {
            window.app.audioController.handlePause();
        }
    }

    handleAudioEnded(e) {
        if (window.app?.audioController) {
            window.app.audioController.handleEnded();
        }
    }

    /**
     * Cleanup all event listeners
     */
    cleanup() {
        // Cleanup delegated events
        for (const [key, { handler, options }] of this.delegatedEvents) {
            this.rootElement.removeEventListener(key.split(':')[0], handler, options);
        }
        this.delegatedEvents.clear();

        // Cleanup window events
        for (const [key, cleanupFn] of this.cleanupFunctions) {
            cleanupFn();
        }
        this.cleanupFunctions.clear();

        // Clear handler maps
        this.throttledHandlers.clear();
        this.debouncedHandlers.clear();
    }

    /**
     * Get statistics about event delegation
     * @returns {Object} - Event delegation statistics
     */
    getStats() {
        return {
            delegatedEvents: this.delegatedEvents.size,
            windowEvents: this.cleanupFunctions.size,
            throttledHandlers: this.throttledHandlers.size,
            debouncedHandlers: this.debouncedHandlers.size
        };
    }
}

// Export singleton instance
export const eventManager = new EventManager();
export default eventManager;
