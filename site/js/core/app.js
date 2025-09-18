/**
 * EmotiveApp - Main application controller for the Emotive demo
 * Coordinates all modules and manages application lifecycle
 */
class EmotiveApp {
    constructor() {
        // Core modules
        this.mascot = null;
        this.engine = null;
        this.globalState = null;
        this.legacyBridge = null;
        this.moduleLoader = null;
        this.uiStrings = null;
        this.assetsConfig = null;
        this.iconsConfig = null;
        this.footerConfig = null;

        // External modules
        this.gestureScheduler = null;
        this.fpsCounter = null;

        // UI modules
        this.themeManager = null;
        this.tooltipSystem = null;
        this.displayManager = null;
        this.scrollbarCompensator = null;
        this.diceRoller = null;
        this.djScratcher = null;
        this.audioVisualizer = null;
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

        // State is now managed by GlobalStateManager
        this.state = null;

        // Configuration
        this.config = {
            defaultTheme: 'night',
            debugMode: localStorage.getItem('debugMode') === 'true' || false,
            logLevel: localStorage.getItem('logLevel') || 'info',
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

        // Logger for app
        this.logger = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize logger first
            if (window.loggerFactory) {
                this.logger = window.loggerFactory.getLogger('EmotiveApp');

                // Set debug mode if configured
                if (this.config.debugMode) {
                    window.loggerFactory.enableDebugMode();
                }
            } else {
                // Fallback to console if logger not available
                this.logger = console;
            }

            this.logger.info('Initializing Emotive App...');

            // Initialize global state manager first
            this.initGlobalState();

            // Initialize UI strings configuration
            this.initUIStrings();

            // Initialize assets configuration
            this.initAssetsConfig();

            // Initialize icons configuration
            this.initIconsConfig();

            // Initialize footer configuration
            this.initFooterConfig();

            // Initialize module loader
            this.initModuleLoader();

            // Load the engine
            await this.loadEngine();

            // Initialize mascot
            await this.initMascot();

            // Initialize external modules BEFORE UI modules
            // This ensures GestureScheduler is available when controllers are initialized
            await this.initExternalModules();

            // Initialize UI modules
            this.initUIModules();

            // Apply UI strings to DOM elements
            if (this.uiStrings) {
                this.uiStrings.init();
            }

            // Apply icons to DOM elements
            if (this.iconsConfig) {
                this.iconsConfig.init();
            }

            // Apply footer content to DOM
            if (this.footerConfig) {
                this.footerConfig.init();
            }

            // Set up event handlers
            this.setupEventHandlers();

            // Initialize legacy compatibility bridge
            this.initLegacyBridge();

            // Start mascot animation
            if (this.mascot) {
                this.mascot.start();
            }

            // Initial display update
            this.updateDisplay();

            this.logger.info('Emotive App initialized successfully');
            return this;

        } catch (error) {
            if (this.logger) {
                this.logger.error('Failed to initialize Emotive App:', error);
            } else {
                console.error('Failed to initialize Emotive App:', error);
            }
            throw error;
        }
    }

    /**
     * Initialize global state manager
     */
    initGlobalState() {
        if (window.GlobalStateManager) {
            this.globalState = new window.GlobalStateManager({
                defaultEmotion: 'neutral',
                defaultUndertone: '',
                defaultShowingFPS: false,
                defaultIsRecording: false,
                defaultTheme: this.config.defaultTheme,
                defaultSoundEnabled: false,
                syncToWindow: true,
                onChange: {
                    currentEmotion: (value) => this.updateDisplay(),
                    currentUndertone: (value) => this.updateDisplay(),
                    showingFPS: (value) => {
                        if (this.displayManager) {
                            this.displayManager.toggleFPS(value);
                        }
                    }
                }
            });
            this.globalState.init();

            // Create convenient state proxy
            this.state = this.globalState.state;
        } else {
            // Fallback to simple state object if GlobalStateManager not available
            this.state = {
                currentEmotion: 'neutral',
                currentUndertone: '',
                showingFPS: false,
                isRecording: false,
                soundEnabled: false
            };
        }
    }

    /**
     * Initialize UI strings configuration
     */
    initUIStrings() {
        if (window.UIStringsConfig) {
            this.uiStrings = new window.UIStringsConfig({
                // Can be customized here or loaded from JSON
                locale: 'en-US'
            });
            // Don't init yet - wait until DOM is ready
        }
    }

    /**
     * Initialize assets configuration
     */
    initAssetsConfig() {
        if (window.AssetsConfig) {
            // Get configuration from HTML data attributes
            const html = document.documentElement;
            const assetsBase = html.dataset.assetsBase || '../assets';
            const cacheVersion = html.dataset.cacheVersion || '1.0.0';

            this.assetsConfig = new window.AssetsConfig({
                assetsPath: assetsBase,
                cacheVersion: cacheVersion,
                images: {
                    favicon: `${assetsBase}/emotive-engine-icon.svg`,
                    headerLogo: `${assetsBase}/emotive-engine-full-BW.svg`
                },
                audio: {
                    demoTrack: `${assetsBase}/Electric Glow (Remix).wav`
                }
            });
            this.assetsConfig.init();
        }
    }

    /**
     * Initialize icons configuration
     */
    initIconsConfig() {
        if (window.IconsConfig) {
            this.iconsConfig = new window.IconsConfig({
                autoApply: false // Don't apply yet - wait for DOM
            });
            // Will be applied after UI modules are initialized
        }
    }

    /**
     * Initialize footer configuration
     */
    initFooterConfig() {
        if (window.FooterConfig) {
            this.footerConfig = new window.FooterConfig({
                autoApply: true // Apply when init() is called
            });
            // Will be applied after UI modules are initialized
        }
    }

    /**
     * Initialize module loader
     */
    initModuleLoader() {
        if (window.ModuleLoader) {
            this.moduleLoader = new window.ModuleLoader({
                enginePath: '../../../src/EmotiveMascot.js',
                gestureSchedulerPath: '../../../src/core/GestureScheduler.js',
                fpsCounterPath: '../../../src/utils/FPSCounter.js',
                onModuleLoad: (name, module) => {
                    console.log(`Module loaded: ${name}`);
                }
            });
        }
    }

    /**
     * Load the Emotive Engine dynamically
     */
    async loadEngine() {
        if (this.moduleLoader) {
            this.engine = await this.moduleLoader.loadEngine();
        } else {
            // Fallback to direct import
            const module = await import('../../src/EmotiveMascot.js');
            this.engine = module.default;
        }
        return this.engine;
    }

    /**
     * Initialize the mascot
     */
    async initMascot() {
        if (!this.engine) {
            throw new Error('Engine not loaded');
        }

        this.mascot = new this.engine(this.config.mascotOptions);

        // Initialize audio analyzer
        if (this.mascot.audioAnalyzer) {
            await this.mascot.audioAnalyzer.init();
        }

        // Disable sound initially
        setTimeout(() => {
            if (this.mascot.soundSystem) {
                this.mascot.soundSystem.isEnabled = false;
            }
        }, 100);

        // Make mascot globally accessible for legacy code
        window.mascot = this.mascot;
    }

    /**
     * Initialize UI modules
     */
    initUIModules() {
        // Initialize theme manager
        if (window.ThemeManager) {
            this.themeManager = new window.ThemeManager({
                defaultTheme: this.config.defaultTheme,
                onThemeChange: (theme) => this.onThemeChange(theme)
            });
            this.themeManager.init();
        }

        // Initialize notification system
        if (window.NotificationSystem) {
            this.notificationSystem = new window.NotificationSystem({
                maxNotifications: 3,
                stackNotifications: true,
                showProgress: true
            });
            this.notificationSystem.init();

            // Make globally accessible
            window.notifications = this.notificationSystem;
        }

        // Initialize display manager
        if (window.DisplayManager) {
            this.displayManager = new window.DisplayManager();
            this.displayManager.init(this.mascot);
        }

        // Initialize scrollbar compensator
        if (window.ScrollbarCompensator) {
            this.scrollbarCompensator = new window.ScrollbarCompensator({
                leftSelector: '.controls-left',
                rightSelector: '.controls-right',
                autoStart: true
            });
            this.scrollbarCompensator.init();
        }

        // Initialize dice roller
        if (window.DiceRoller) {
            this.diceRoller = new window.DiceRoller();

            // Add overlayable configuration
            this.diceRoller.config.overlayable = {
                selector: '.gesture-btn',
                attribute: 'data-gesture',
                excludeActive: true,
                animationType: 'toggle',
                cooldown: 500,
                weights: null
            };
        }

        // Initialize DJ scratcher
        const canvas = document.getElementById('emotive-canvas');
        if (window.DJScratcher && canvas) {
            this.djScratcher = new window.DJScratcher(canvas, this.mascot);
        }

        // Initialize audio visualizer
        if (window.AudioVisualizer) {
            this.audioVisualizer = new window.AudioVisualizer('spectrum-viz', this.mascot, {
                numBars: 16,
                minHeight: 2,
                maxHeight: 100,
                transitionTime: 0.15,
                logarithmicScale: 0.7
            });

            // Set up global functions for backward compatibility
            window.startAudioViz = () => this.audioVisualizer.start();
            window.stopAudioViz = () => this.audioVisualizer.stop();
        }

        // Initialize rhythm sync visualizer
        if (window.RhythmSyncVisualizer) {
            this.rhythmSyncVisualizer = new window.RhythmSyncVisualizer('rhythm-sync-container', {
                numBeats: 8,
                autoStart: true,
                showLabels: true
            });

            // Connect to mascot for BPM data
            if (this.mascot) {
                this.rhythmSyncVisualizer.connect(this.mascot);
            }

            // Make globally accessible
            window.rhythmSyncVisualizer = this.rhythmSyncVisualizer;
        }

        // Initialize randomizer controller
        if (window.RandomizerController) {
            this.randomizerController = new window.RandomizerController({
                cascadeDelay: 100,
                undertoneDelay: 100,
                shapeChanceOnChain: 0.1
            });
            this.randomizerController.init(this, this.diceRoller, this.mascot);

            // Make globally accessible for backward compatibility
            window.randomizer = this.randomizerController;
        }

        // Initialize gesture chain controller
        if (window.GestureChainController) {
            this.gestureChainController = new window.GestureChainController({
                shapeMorphChance: 0.1,
                pulsingDuration: 300,
                highlightDuration: 500
            });
            this.gestureChainController.init(this, this.mascot, window.gestureScheduler);

            // Make globally accessible for backward compatibility
            window.chainController = this.gestureChainController;
        }

        // Initialize undertone controller
        if (window.UndertoneController) {
            this.undertoneController = new window.UndertoneController({
                debounceDelay: 50,
                onDisplayUpdate: () => this.updateDisplay()
            });
            this.undertoneController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.undertoneController = this.undertoneController;
        }

        // Initialize system controls controller
        if (window.SystemControlsController) {
            this.systemControlsController = new window.SystemControlsController({
                defaultStates: {
                    fps: false,
                    blinking: true,
                    gaze: false,
                    recording: false
                }
            });
            this.systemControlsController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.systemControls = this.systemControlsController;
        }

        // Initialize emotion controller
        if (window.EmotionController) {
            this.emotionController = new window.EmotionController({
                defaultEmotion: 'neutral',
                onDisplayUpdate: () => this.updateDisplay(),
                onEmotionChange: (emotion) => {
                    if (this.globalState) {
                        this.globalState.set('currentEmotion', emotion);
                    } else {
                        this.state.currentEmotion = emotion;
                    }
                    this.updateDisplay();
                }
            });
            this.emotionController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.emotionController = this.emotionController;
        }

        // Initialize shape morph controller
        if (window.ShapeMorphController) {
            this.shapeMorphController = new window.ShapeMorphController({
                defaultMode: 'hybrid',
                defaultDuration: 1000,
                specialTransitions: {
                    'lunar-solar': 500,
                    'solar-lunar': 500
                }
            });
            this.shapeMorphController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.shapeMorphController = this.shapeMorphController;
        }

        // Initialize audio controller
        if (window.AudioController) {
            this.audioController = new window.AudioController({
                demoTrackPath: '../assets/Electric Glow (Remix).wav',
                autoShowPlayer: true,
                autoShowVisualizer: true
            });
            this.audioController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.audioController = this.audioController;
        }


        // Initialize dice controller
        if (window.DiceController) {
            this.diceController = new window.DiceController({
                overlayablePool: [
                    'wave', 'point', 'nod', 'shake',
                    'lean', 'tilt', 'reach', 'breathe',
                    'float', 'rain', 'runningman', 'charleston'
                ]
            });
            this.diceController.init(this, this.diceRoller);

            // Make globally accessible for backward compatibility
            window.diceController = this.diceController;
        }

        // Initialize gesture controller
        if (window.GestureController) {
            this.gestureController = new window.GestureController({
                triggeredDuration: 200,
                maxQueueSize: 4,
                requireBeatSync: true  // Beat-synced gestures when rhythm is active
            });
            this.gestureController.init(this, this.mascot);

            // Connect rhythm sync visualizer if available
            if (this.rhythmSyncVisualizer) {
                this.gestureController.setRhythmSyncVisualizer(this.rhythmSyncVisualizer);
            }

            // Gesture scheduler will be set in initExternalModules

            // Make globally accessible for backward compatibility
            window.gestureController = this.gestureController;
        }

        // Initialize orientation controller
        if (window.OrientationController) {
            this.orientationController = new window.OrientationController({
                transitionBlur: 30,
                revealBlur: 25,
                layoutChangeDelay: 150,
                blurRevealDelay: 50,
                resizeDebounce: 100,
                orientationDelay: 100,
                onOrientationChange: (newOrientation, previousOrientation) => {
                    console.log(`Orientation changed from ${previousOrientation} to ${newOrientation}`);
                }
            });
            this.orientationController.init(this, this.mascot);

            // Make globally accessible for backward compatibility
            window.orientationController = this.orientationController;
        }
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Window resize handler
        window.addEventListener('resize', () => {
            // Check scrollbar compensation on resize
            if (this.scrollbarCompensator) {
                this.scrollbarCompensator.check();
            }
        });

        // This would contain all the event handler setup
        // For now, keeping them in HTML for compatibility
        console.log('Event handlers setup complete');
    }

    /**
     * Initialize legacy compatibility bridge
     */
    initLegacyBridge() {
        if (window.LegacyCompatibilityBridge) {
            this.legacyBridge = new window.LegacyCompatibilityBridge({
                enableGlobalFunctions: true,
                enableElementReferences: true,
                logDeprecations: false // Set to true to see deprecation warnings
            });
            this.legacyBridge.init(this);

            // The bridge automatically creates these global functions:
            // - randomizeEmotion()
            // - randomizeUndertone()
            // - getUndertoneFromValue(value)
            // - updateDisplay()
            // - startAudioViz()
            // - stopAudioViz()
        }
    }

    /**
     * Handle theme change
     */
    onThemeChange(theme) {
        console.log('Theme changed to:', theme);
        // Any additional theme change logic
    }

    /**
     * Set emotion
     */
    setEmotion(emotion, undertone) {
        this.state.currentEmotion = emotion;
        this.state.currentUndertone = undertone || '';

        if (this.mascot) {
            this.mascot.setEmotion(emotion, undertone);
        }

        this.updateDisplay();
    }

    /**
     * Update display elements
     */
    updateDisplay() {
        if (this.displayManager) {
            this.displayManager.update(this.state.currentEmotion, this.state.currentUndertone);
        }
    }

    /**
     * Initialize external modules (gestures, FPS)
     */
    async initExternalModules() {
        // Load modules
        if (this.moduleLoader) {
            const modules = await this.moduleLoader.loadModules();
            if (modules) {
                const GestureScheduler = modules.GestureScheduler;
                const FPSCounter = modules.FPSCounter;

                // Initialize gesture scheduler
                if (GestureScheduler && this.mascot) {
                    this.gestureScheduler = new GestureScheduler(this.mascot);

                    // Make globally accessible for backward compatibility
                    window.gestureScheduler = this.gestureScheduler;

                    // Set reference in controllers that use it
                    if (this.gestureController) {
                        this.gestureController.setGestureScheduler(this.gestureScheduler);
                    }
                    if (this.gestureChainController) {
                        this.gestureChainController.setGestureScheduler(this.gestureScheduler);
                    }
                }

                // Initialize FPS counter
                if (FPSCounter) {
                    this.fpsCounter = new FPSCounter();

                    // Make globally accessible for backward compatibility
                    window.fpsCounter = this.fpsCounter;

                    // Start FPS update loop
                    this.startFPSUpdateLoop();
                }
            }
        }
    }

    /**
     * Start FPS counter update loop
     */
    startFPSUpdateLoop() {
        if (!this.fpsCounter) return;

        const updateFPSCounter = () => {
            if (this.fpsCounter) {
                this.fpsCounter.update();
                requestAnimationFrame(updateFPSCounter);
            }
        };
        updateFPSCounter();
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.mascot) {
            this.mascot.stop();
        }

        if (this.themeManager) {
            this.themeManager.destroy();
        }

        if (this.djScratcher) {
            this.djScratcher.destroy();
        }

        if (this.audioVisualizer) {
            this.audioVisualizer.destroy();
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.EmotiveApp = EmotiveApp;
}