/*!
 * Lazy Loader Utility
 * Provides dynamic import functionality for code splitting
 */

/**
 * LazyLoader - Utility for dynamic imports and code splitting
 */
export class LazyLoader {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
    }

    /**
     * Load a module dynamically with caching
     * @param {string} modulePath - Path to the module
     * @param {string} exportName - Name of the export to return (optional)
     * @returns {Promise} - Promise that resolves to the module or specific export
     */
    async load(modulePath, exportName = null) {
        // Return cached module if available
        if (this.cache.has(modulePath)) {
            const module = this.cache.get(modulePath);
            return exportName ? module[exportName] : module;
        }

        // Return existing loading promise if already loading
        if (this.loading.has(modulePath)) {
            const module = await this.loading.get(modulePath);
            return exportName ? module[exportName] : module;
        }

        // Start loading
        const loadingPromise = this._loadModule(modulePath);
        this.loading.set(modulePath, loadingPromise);

        try {
            const module = await loadingPromise;
            this.cache.set(modulePath, module);
            this.loading.delete(modulePath);
            return exportName ? module[exportName] : module;
        } catch (error) {
            this.loading.delete(modulePath);
            throw error;
        }
    }

    /**
     * Load multiple modules in parallel
     * @param {Array} moduleSpecs - Array of {path, exportName} objects
     * @returns {Promise<Array>} - Array of loaded modules/exports
     */
    async loadMultiple(moduleSpecs) {
        const promises = moduleSpecs.map(spec => 
            this.load(spec.path, spec.exportName)
        );
        return Promise.all(promises);
    }

    /**
     * Preload modules without executing them
     * @param {Array<string>} modulePaths - Array of module paths
     * @returns {Promise} - Promise that resolves when all modules are preloaded
     */
    async preload(modulePaths) {
        const promises = modulePaths.map(path => 
            import(path).then(module => {
                this.cache.set(path, module);
                return module;
            })
        );
        return Promise.all(promises);
    }

    /**
     * Internal method to load a module
     * @private
     */
    async _loadModule(modulePath) {
        try {
            return await import(modulePath);
        } catch (error) {
            console.error(`Failed to load module: ${modulePath}`, error);
            throw error;
        }
    }

    /**
     * Clear cache for a specific module or all modules
     * @param {string} modulePath - Optional specific module path
     */
    clearCache(modulePath = null) {
        if (modulePath) {
            this.cache.delete(modulePath);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            cachedModules: this.cache.size,
            loadingModules: this.loading.size,
            cacheKeys: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
export const lazyLoader = new LazyLoader();

// Export default
export default lazyLoader;
