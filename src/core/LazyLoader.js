/**
 * Lazy loading system for on-demand feature loading
 * Reduces initial bundle size by loading features when needed
 */

export class LazyLoader {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '/dist/modules/';
        this.cache = new Map();
        this.loading = new Map();
        this.moduleMap = new Map([
            // Core modules
            ['core', () => import('../core-exports.js')],
            ['features', () => import('../features-exports.js')],
            ['plugins', () => import('../plugins-exports.js')],

            // Individual features
            ['particles', () => import('../core/ParticleSystem.js')],
            ['audio', () => import('../core/AudioAnalyzer.js')],
            ['emotions', () => import('../emotions/EmotionModel.js')],

            // Behaviors
            ['idle-behavior', () => import('../behaviors/IdleBehavior.js')],
            ['listening-behavior', () => import('../behaviors/ListeningBehavior.js')],
            ['speaking-behavior', () => import('../behaviors/SpeakingBehavior.js')],
            ['thinking-behavior', () => import('../behaviors/ThinkingBehavior.js')],

            // Plugins
            ['sparkle-plugin', () => import('../plugins/SparklePlugin.js')],
            ['confetti-plugin', () => import('../plugins/ConfettiEffectPlugin.js')],
            ['dialogue-plugin', () => import('../plugins/DialoguePlugin.js')]
        ]);

        this.preloadQueue = [];
        this.preloading = false;

        // Feature detection
        this.features = {
            dynamicImport: this.checkDynamicImport(),
            modulePreload: 'modulepreload' in document.createElement('link').relList,
            prefetch: 'prefetch' in document.createElement('link').relList
        };
    }

    checkDynamicImport() {
        try {
            new Function('import("")');
            return true;
        } catch {
            return false;
        }
    }

    async load(moduleName) {
        // Check cache first
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }

        // Check if already loading
        if (this.loading.has(moduleName)) {
            return this.loading.get(moduleName);
        }

        // Start loading
        const loadPromise = this._loadModule(moduleName);
        this.loading.set(moduleName, loadPromise);

        try {
            const module = await loadPromise;
            this.cache.set(moduleName, module);
            this.loading.delete(moduleName);
            return module;
        } catch (error) {
            this.loading.delete(moduleName);
            throw new Error(`Failed to load module '${moduleName}': ${error.message}`);
        }
    }

    async _loadModule(moduleName) {
        const loader = this.moduleMap.get(moduleName);

        if (loader) {
            // Use dynamic import
            return await loader();
        }

        // Fallback to URL-based loading
        const url = `${this.baseUrl}${moduleName}.js`;

        if (this.features.dynamicImport) {
            return await import(url);
        }

        // Fallback for older browsers
        return await this._loadScript(url);
    }

    async _loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = url;

            script.onload = () => {
                // Module should have registered itself globally
                const moduleName = url.split('/').pop().replace('.js', '');
                const module = window[moduleName] || window.EmotiveEngine[moduleName];

                if (module) {
                    resolve(module);
                } else {
                    reject(new Error(`Module not found after loading: ${url}`));
                }
            };

            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

            document.head.appendChild(script);
        });
    }

    preload(moduleNames) {
        if (!Array.isArray(moduleNames)) {
            moduleNames = [moduleNames];
        }

        for (const name of moduleNames) {
            if (!this.cache.has(name) && !this.preloadQueue.includes(name)) {
                this.preloadQueue.push(name);
            }
        }

        if (!this.preloading) {
            this._processPreloadQueue();
        }
    }

    async _processPreloadQueue() {
        if (this.preloadQueue.length === 0) {
            this.preloading = false;
            return;
        }

        this.preloading = true;
        const moduleName = this.preloadQueue.shift();

        try {
            await this.load(moduleName);
        } catch (error) {
            console.warn(`Failed to preload module '${moduleName}':`, error);
        }

        // Continue with next module
        this._processPreloadQueue();
    }

    prefetch(moduleNames) {
        if (!this.features.prefetch) return;

        if (!Array.isArray(moduleNames)) {
            moduleNames = [moduleNames];
        }

        for (const name of moduleNames) {
            const url = `${this.baseUrl}${name}.js`;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'script';
            link.href = url;
            document.head.appendChild(link);
        }
    }

    modulePreload(moduleNames) {
        if (!this.features.modulePreload) return;

        if (!Array.isArray(moduleNames)) {
            moduleNames = [moduleNames];
        }

        for (const name of moduleNames) {
            const url = `${this.baseUrl}${name}.js`;
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = url;
            document.head.appendChild(link);
        }
    }

    async loadFeature(featureName) {
        const featureMap = {
            particles: ['particles'],
            audio: ['audio'],
            emotions: ['emotions'],
            behaviors: ['idle-behavior', 'listening-behavior', 'speaking-behavior', 'thinking-behavior'],
            plugins: ['plugins']
        };

        const modules = featureMap[featureName];
        if (!modules) {
            throw new Error(`Unknown feature: ${featureName}`);
        }

        const loadPromises = modules.map(m => this.load(m));
        return await Promise.all(loadPromises);
    }

    async whenReady(moduleNames) {
        if (!Array.isArray(moduleNames)) {
            moduleNames = [moduleNames];
        }

        const promises = moduleNames.map(name => {
            if (this.cache.has(name)) {
                return Promise.resolve(this.cache.get(name));
            }
            if (this.loading.has(name)) {
                return this.loading.get(name);
            }
            return this.load(name);
        });

        return await Promise.all(promises);
    }

    isLoaded(moduleName) {
        return this.cache.has(moduleName);
    }

    getLoadedModules() {
        return Array.from(this.cache.keys());
    }

    clearCache(moduleName = null) {
        if (moduleName) {
            this.cache.delete(moduleName);
        } else {
            this.cache.clear();
        }
    }

    getStats() {
        return {
            loaded: this.cache.size,
            loading: this.loading.size,
            queued: this.preloadQueue.length,
            features: this.features,
            modules: this.getLoadedModules()
        };
    }
}

// Create singleton instance
export const lazyLoader = new LazyLoader();

// Helper function for easy loading
export async function lazyLoad(moduleName) {
    return await lazyLoader.load(moduleName);
}

// Helper function for preloading
export function preloadModules(...moduleNames) {
    lazyLoader.preload(moduleNames.flat());
}

// Helper function for prefetching
export function prefetchModules(...moduleNames) {
    lazyLoader.prefetch(moduleNames.flat());
}

export default LazyLoader;