/**
 * ModuleLoader - Handles dynamic module loading and initialization
 * Centralizes all dynamic imports and module setup
 */
class ModuleLoader {
    constructor(options = {}) {
        // Configuration
        this.config = {
            // Module paths
            paths: {
                engine: options.enginePath || '../src/EmotiveMascot.js',
                gestureScheduler: options.gestureSchedulerPath || '../src/core/GestureScheduler.js',
                fpsCounter: options.fpsCounterPath || '../src/utils/FPSCounter.js',
                ...options.paths
            },

            // Loading options
            parallel: options.parallel !== false,
            retryCount: options.retryCount || 3,
            retryDelay: options.retryDelay || 1000,

            // Callbacks
            onModuleLoad: options.onModuleLoad || null,
            onModuleError: options.onModuleError || null,
            onAllLoaded: options.onAllLoaded || null,

            ...options
        };

        // Loaded modules storage
        this.modules = new Map();

        // Loading state
        this.state = {
            isLoading: false,
            loadedCount: 0,
            totalCount: 0,
            errors: []
        };
    }

    /**
     * Load the Emotive Engine
     */
    async loadEngine() {
        try {
            const module = await this.loadModule('engine', this.config.paths.engine);
            const Engine = module.default;

            // Store in modules map
            this.modules.set('EmotiveEngine', Engine);

            // Make globally available for legacy code
            if (typeof window !== 'undefined') {
                window.EmotiveEngine = Engine;
            }

            return Engine;
        } catch (error) {
            console.error('Failed to load Emotive Engine:', error);
            throw error;
        }
    }

    /**
     * Load gesture and FPS modules
     */
    async loadModules() {
        const moduleConfigs = [
            { name: 'gestureScheduler', path: this.config.paths.gestureScheduler },
            { name: 'fpsCounter', path: this.config.paths.fpsCounter }
        ];

        try {
            let modules;

            if (this.config.parallel) {
                // Load all modules in parallel
                modules = await Promise.all(
                    moduleConfigs.map(config => this.loadModule(config.name, config.path))
                );
            } else {
                // Load modules sequentially
                modules = [];
                for (const config of moduleConfigs) {
                    const module = await this.loadModule(config.name, config.path);
                    modules.push(module);
                }
            }

            // Extract and store modules
            const [gestureModule, fpsModule] = modules;

            this.modules.set('GestureScheduler', gestureModule.default);
            this.modules.set('FPSCounter', fpsModule.default);

            // Return modules for immediate use
            return {
                GestureScheduler: gestureModule.default,
                FPSCounter: fpsModule.default
            };
        } catch (error) {
            console.error('Failed to load modules:', error);
            throw error;
        }
    }

    /**
     * Load a single module with retry logic
     */
    async loadModule(name, path, retryCount = 0) {
        this.state.totalCount++;

        try {
            console.log(`Loading module: ${name} from ${path}`);

            const module = await import(path);

            this.state.loadedCount++;

            // Trigger callback
            if (this.config.onModuleLoad) {
                this.config.onModuleLoad(name, module);
            }

            return module;

        } catch (error) {
            if (retryCount < this.config.retryCount) {
                console.warn(`Retrying module load: ${name} (attempt ${retryCount + 1})`);

                // Wait before retry
                await new Promise(resolve =>
                    setTimeout(resolve, this.config.retryDelay)
                );

                return this.loadModule(name, path, retryCount + 1);
            }

            // Max retries reached
            this.state.errors.push({ name, path, error });

            // Trigger error callback
            if (this.config.onModuleError) {
                this.config.onModuleError(name, error);
            }

            throw error;
        }
    }

    /**
     * Load all configured modules
     */
    async loadAll() {
        this.state.isLoading = true;
        this.state.errors = [];

        try {
            // Load engine first as it's often a dependency
            await this.loadEngine();

            // Load gesture and FPS modules
            await this.loadModules();

            // Trigger completion callback
            if (this.config.onAllLoaded) {
                this.config.onAllLoaded(this.modules);
            }

            this.state.isLoading = false;

            return this.modules;

        } catch (error) {
            this.state.isLoading = false;
            throw error;
        }
    }

    /**
     * Get a loaded module
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Check if a module is loaded
     */
    hasModule(name) {
        return this.modules.has(name);
    }

    /**
     * Get all loaded modules
     */
    getAllModules() {
        return new Map(this.modules);
    }

    /**
     * Get loading progress
     */
    getProgress() {
        if (this.state.totalCount === 0) return 0;
        return (this.state.loadedCount / this.state.totalCount) * 100;
    }

    /**
     * Get loading state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Add a custom module path
     */
    addModulePath(name, path) {
        this.config.paths[name] = path;
    }

    /**
     * Clear all loaded modules
     */
    clear() {
        this.modules.clear();
        this.state.loadedCount = 0;
        this.state.totalCount = 0;
        this.state.errors = [];
    }

    /**
     * Reload a specific module
     */
    async reloadModule(name) {
        const path = this.config.paths[name];
        if (!path) {
            throw new Error(`No path configured for module: ${name}`);
        }

        // Clear from cache if possible
        this.modules.delete(name);

        // Reload
        return this.loadModule(name, path);
    }
}

// Export as ES6 module
export default ModuleLoader;