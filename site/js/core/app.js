/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */

// Import all dependencies
import { emotiveState } from './global-state.js';
import { ThemeManager } from '../ui/theme-manager.js';
import { DisplayManager } from '../ui/display-manager.js';
import { ScrollbarCompensator } from '../ui/scrollbar-compensator.js';
import { DiceRoller } from '../ui/dice-roller.js';
// AudioVisualizer - lazy loaded when needed
import { RhythmSyncVisualizer } from '../ui/rhythm-sync-visualizer.js';
import { NotificationSystem } from '../ui/notification-system.js';

// Import lazy loader for non-critical components
import { lazyLoader } from '../utils/lazy-loader.js';

// Import controllers
import { RandomizerController } from '../controls/randomizer-controller.js';
import { GestureChainController } from '../controls/gesture-chain-controller.js';
import { UndertoneController } from '../controls/undertone-controller.js';
import { SystemControlsController } from '../controls/system-controls-controller.js';
import { EmotionController } from '../controls/emotion-controller.js';
import { ShapeMorphController } from '../controls/shape-morph-controller.js';
import { AudioController } from '../controls/audio-controller.js';
import { GestureController } from '../controls/gesture-controller.js';
import { OrientationController } from '../controls/orientation-controller.js';

// Import config modules
import { UIStringsConfig } from '../config/ui-strings.js';
import { IconsConfig } from '../config/icons-config.js';
import { FooterConfig } from '../config/footer-config.js';
import AssetsConfig from '../config/assets-config.js';
import SystemControlsConfig from '../config/system-controls-config.js';

// Import mascot engine
import { MascotEngine } from './mascot-engine-wrapper.js';

// Import event manager
import { eventManager } from './event-manager.js';

// Import UI generators
import SystemControlsGenerator from '../ui/system-controls-generator.js';

/**
 * EmotiveApp - Main application controller for the Emotive demo
 * Coordinates all modules and manages application lifecycle
 */
export class EmotiveApp {
    constructor(options = {}) {
        // Core modules
        this.mascot = null;
        this.engine = null;
        this.globalState = emotiveState;

        // UI modules
        this.themeManager = null;
        this.displayManager = null;
        this.scrollbarCompensator = null;
        this.diceRoller = null;
        this.audioVisualizer = null;
        this.rhythmSyncVisualizer = null;
        this.notificationSystem = null;

        // Controllers
        this.randomizerController = null;
        this.gestureChainController = null;
        this.undertoneController = null;
        this.systemControlsController = null;
        this.emotionController = null;
        this.shapeMorphController = null;
        this.audioController = null;
        this.diceController = null;
        this.gestureController = null;
        this.orientationController = null;

        // Config modules
        this.uiStrings = null;
        this.assetsConfig = null;
        this.iconsConfig = null;
        this.footerConfig = null;

        // Configuration
        this.config = {
            defaultTheme: 'night',
            debugMode: options.debug || false,
            autoPlay: false, // Browsers block autoplay until user interaction
            mascotOptions: {
                canvasId: 'emotive-canvas',
                startingEmotion: 'neutral',
                emotionalResponsiveness: 0.8,
                particleIntensity: 1.0,
                glowIntensity: 0.8,
                audioEnabled: true,
                showFPS: false,
                debugMode: false,
                renderMode: 'default',
                maxParticles: 100,
                topOffset: 0
            }
        };

        // Simple logger
        this.logger = console;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        this.logger.info('Initializing Emotive Engine...');

        // Show loading state
        this.showLoader(true);

        try {
            // Initialize event manager first
            eventManager.init(document.body);

            // Initialize config modules
            await this.initConfigs();

            // Initialize mascot engine
            await this.initMascot();

        // Initialize UI modules
        await this.initUIModules();

        // Initialize system controls generator
        this.systemControlsGenerator = new SystemControlsGenerator(this.systemControlsConfig);
        this.systemControlsGenerator.init();

        // Initialize controllers
        await this.initControllers();

            // Setup legacy event listeners (for non-delegated events)
            this.setupEventListeners();

            // Start animation
            this.start();

            // Hide loader
            this.showLoader(false);

            this.logger.info('Emotive Engine initialized successfully');

        } catch (error) {
            this.logger.error('Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Initialize configuration modules
     */
    async initConfigs() {
        // UI Strings
        this.uiStrings = new UIStringsConfig();
        this.uiStrings.init();

        // Assets config (already initialized in main.js, just store reference)
        this.assetsConfig = new AssetsConfig();

        // Icons config
        this.iconsConfig = new IconsConfig();
        this.iconsConfig.init();

        // Footer config (already initialized in main.js)
        this.footerConfig = new FooterConfig();

        // System Controls config
        this.systemControlsConfig = new SystemControlsConfig();
        this.systemControlsConfig.init();
    }

    /**
     * Initialize the mascot engine
     */
    async initMascot() {
        // Use the imported MascotEngine ES6 module
        this.engine = MascotEngine;

        if (!this.engine) {
            throw new Error('Mascot engine not found.');
        }

        // Create mascot instance (constructor handles initialization)
        this.mascot = new this.engine(this.config.mascotOptions);

        // Make globally available for compatibility
        window.mascot = this.mascot;

        this.logger.info('Mascot initialized');
    }

    /**
     * Initialize UI modules
     */
    async initUIModules() {
        // Theme Manager
        this.themeManager = new ThemeManager({
            defaultTheme: this.config.defaultTheme,
            mascot: this.mascot
        });
        this.themeManager.init();

        // Display Manager
        this.displayManager = new DisplayManager();
        this.displayManager.init();

        // Notification System
        this.notificationSystem = new NotificationSystem();
        this.notificationSystem.init();
        window.notifications = this.notificationSystem;

        // Scrollbar Compensator
        this.scrollbarCompensator = new ScrollbarCompensator();
        this.scrollbarCompensator.init();
        this.scrollbarCompensator.start();

        // Dice Roller
        this.diceRoller = new DiceRoller();


        // Rhythm Sync Visualizer
        this.rhythmSyncVisualizer = new RhythmSyncVisualizer('rhythm-sync-container', {
            mascot: this.mascot
        });
        this.rhythmSyncVisualizer.init();
        window.rhythmSyncVisualizer = this.rhythmSyncVisualizer;
    }


    /**
     * Initialize controllers
     */
    async initControllers() {
        // Randomizer Controller
        this.randomizerController = new RandomizerController({
            diceRoller: this.diceRoller
        });
        this.randomizerController.init();

        // Gesture Chain Controller
        this.gestureChainController = new GestureChainController();
        this.gestureChainController.init(this, this.mascot);

        // Undertone Controller
        this.undertoneController = new UndertoneController({
            mascot: this.mascot
        });
        this.undertoneController.init();

        // System Controls Controller
        this.systemControlsController = new SystemControlsController({
            mascot: this.mascot,
            displayManager: this.displayManager,
            audioVisualizer: this.audioVisualizer
        });
        this.systemControlsController.init();

        // Emotion Controller
        this.emotionController = new EmotionController({
            mascot: this.mascot,
            allowToggle: true,
            defaultEmotion: 'neutral'
        });
        this.emotionController.init();

        // Shape Morph Controller
        this.shapeMorphController = new ShapeMorphController({
            mascot: this.mascot,
            defaultShape: 'circle'
        });
        this.shapeMorphController.init();

        // Audio Controller
        this.audioController = new AudioController({
            mascot: this.mascot,
            audioVisualizer: this.audioVisualizer
        });
        this.audioController.init();

        // Dice controller removed - dice buttons removed from UI

        // Gesture Controller
        this.gestureController = new GestureController({
            mascot: this.mascot,
            allowToggle: true,
            cooldown: 100,
            rhythmScheduler: window.gestureScheduler
        });
        this.gestureController.init();

        // Orientation Controller
        this.orientationController = new OrientationController({
            mascot: this.mascot,
            sensitivity: 0.3,
            deadzone: 5
        });
        // Check if device orientation is supported
        if (window.DeviceOrientationEvent) {
            this.orientationController.init();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            if (this.mascot) {
                this.mascot.handleResize();
            }
        });

        // State change subscriptions
        this.globalState.subscribe('currentEmotion', () => this.updateDisplay());
        this.globalState.subscribe('currentUndertone', () => this.updateDisplay());
        this.globalState.subscribe('showingFPS', (value) => {
            if (this.displayManager) {
                this.displayManager.toggleFPS(value);
            }
        });
    }

    /**
     * Update display based on state
     */
    updateDisplay() {
        if (this.displayManager) {
            this.displayManager.updateEmotionDisplay(this.globalState.get('currentEmotion'));
            this.displayManager.updateUndertoneDisplay(this.globalState.get('currentUndertone'));
        }
    }

    /**
     * Show/hide loader
     */
    showLoader(show) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Start the application
     */
    start() {
        if (this.mascot) {
            this.mascot.start();
        }

        // Initialize displays
        this.updateDisplay();

        // Start any auto-play features
        if (this.config.autoPlay) {
            setTimeout(() => {
                if (this.audioController) {
                    this.audioController.loadDemoTrack();
                }
            }, 1000);
        }
    }

    /**
     * Stop the application
     */
    stop() {
        if (this.mascot) {
            this.mascot.stop();
        }

        if (this.audioController) {
            this.audioController.stop();
        }

        if (this.audioVisualizer) {
            this.audioVisualizer.stop();
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();

        // Clean up all controllers
        const controllers = [
            this.emotionController,
            this.gestureController,
            this.shapeMorphController,
            this.audioController,
            this.systemControlsController,
            this.undertoneController,
            this.gestureChainController,
            this.orientationController,
            this.diceController,
            this.randomizerController
        ];

        controllers.forEach(controller => {
            if (controller && controller.destroy) {
                controller.destroy();
            }
        });

        // Clean up UI modules
        if (this.audioVisualizer) {
            this.audioVisualizer.destroy();
        }

        if (this.scrollbarCompensator) {
            this.scrollbarCompensator.destroy();
        }

        // Clean up mascot
        if (this.mascot) {
            this.mascot.destroy();
        }

        // Clean up event manager
        eventManager.cleanup();
    }
}

// Export default
export default EmotiveApp;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.