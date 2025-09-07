/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Module Loader
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Universal dynamic module loader with fallback for browser environments
 * @author Emotive Engine Team
 * @module utils/ModuleLoader
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Dynamically loads modules with fallback for environments without import.meta.glob  
 * ║                                                                                    
 * ║ FEATURES:                                                                          
 * ║ • Works in both build tools and raw browser environments                          
 * ║ • Auto-discovery when available, manual registry as fallback                      
 * ║ • Validation ensures modules have correct structure                               
 * ║ • Plugin support for extensibility                                                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Universal module loader for dynamic imports
 */
class ModuleLoader {
    /**
     * Check if import.meta.glob is available
     * @returns {boolean}
     */
    static hasGlobSupport() {
        return typeof import.meta.glob === 'function';
    }
    
    /**
     * Load modules with automatic fallback
     * @param {string|Array} patternOrModules - Glob pattern or array of modules to load
     * @param {Object} registry - Object to store loaded modules
     * @param {Function} validator - Optional validation function
     * @returns {Promise<Object>} The populated registry
     */
    static async loadModules(patternOrModules, registry = {}, validator = null) {
        // If we have glob support (Vite, Webpack 5+), use it
        if (this.hasGlobSupport() && typeof patternOrModules === 'string') {
            return this.loadWithGlob(patternOrModules, registry, validator);
        }
        
        // Otherwise use manual loading
        if (Array.isArray(patternOrModules)) {
            return this.loadManual(patternOrModules, registry, validator);
        }
        
        // If given a string pattern without glob support, warn and return empty
        console.warn(`ModuleLoader: import.meta.glob not available and no manual modules provided`);
        return registry;
    }
    
    /**
     * Load modules using import.meta.glob (build tools only)
     * @private
     */
    static async loadWithGlob(pattern, registry = {}, validator = null) {
        try {
            const modules = import.meta.glob(pattern, { eager: true });
            
            for (const [path, module] of Object.entries(modules)) {
                try {
                    const mod = module.default || module;
                    
                    if (!mod) {
                        console.warn(`Empty module at ${path}`);
                        continue;
                    }
                    
                    if (validator && !validator(mod, path)) {
                        console.warn(`Invalid module structure at ${path}:`, mod);
                        continue;
                    }
                    
                    if (!mod.name) {
                        const filename = path.split('/').pop().replace('.js', '');
                        mod.name = filename;
                    }
                    
                    registry[mod.name] = mod;
                    
                } catch (error) {
                    console.error(`Failed to load module at ${path}:`, error);
                }
            }
            
            return registry;
            
        } catch (error) {
            console.error(`Failed to load modules matching ${pattern}:`, error);
            return registry;
        }
    }
    
    /**
     * Load modules manually (works everywhere)
     * @private
     */
    static async loadManual(modules, registry = {}, validator = null) {
        for (const module of modules) {
            try {
                const mod = module.default || module;
                
                if (!mod) continue;
                
                if (validator && !validator(mod, 'manual')) {
                    console.warn(`Invalid module structure:`, mod);
                    continue;
                }
                
                if (!mod.name) {
                    console.warn('Module missing name:', mod);
                    continue;
                }
                
                registry[mod.name] = mod;
                
            } catch (error) {
                console.error(`Failed to load module:`, error);
            }
        }
        
        return registry;
    }
    
    /**
     * Load modules from multiple sources
     * @param {Array} sources - Array of patterns or module arrays
     * @param {Object} registry - Object to store loaded modules
     * @param {Function} validator - Optional validation function
     * @returns {Promise<Object>} The populated registry
     */
    static async loadMultiple(sources, registry = {}, validator = null) {
        for (const source of sources) {
            await this.loadModules(source, registry, validator);
        }
        return registry;
    }
    
    /**
     * Create a module validator function
     * @param {Array<string>} requiredFields - Fields that must exist
     * @param {string} typeName - Type name for error messages
     * @returns {Function} Validator function
     */
    static createValidator(requiredFields, typeName) {
        return (module, path) => {
            for (const field of requiredFields) {
                if (!(field in module)) {
                    console.warn(`${typeName} at ${path} missing required field: ${field}`);
                    return false;
                }
            }
            return true;
        };
    }
    
    /**
     * Setup hot module replacement (if available)
     * @param {string} pattern - Glob pattern for modules
     * @param {Object} registry - Registry to update
     * @param {Function} reloadCallback - Callback after reload
     */
    static setupHMR(pattern, registry, reloadCallback) {
        if (import.meta.hot && this.hasGlobSupport()) {
            import.meta.hot.accept(pattern, async () => {
                Object.keys(registry).forEach(key => delete registry[key]);
                await this.loadModules(pattern, registry);
                if (reloadCallback) {
                    reloadCallback(registry);
                }
                console.log(`🔄 Hot reloaded modules for ${pattern}`);
            });
        }
    }
}

// ┌─────────────────────────────────────────────────────────────────────────────────────
// │ COMMON VALIDATORS
// └─────────────────────────────────────────────────────────────────────────────────────

/**
 * Validate gesture module structure
 */
export const validateGesture = ModuleLoader.createValidator(
    ['name', 'type', 'apply'],
    'Gesture'
);

/**
 * Validate emotion module structure
 */
export const validateEmotion = ModuleLoader.createValidator(
    ['name', 'color'],
    'Emotion'
);

/**
 * Validate particle behavior module structure
 */
export const validateBehavior = ModuleLoader.createValidator(
    ['name', 'apply'],
    'Behavior'
);

/**
 * Validate effect module structure
 */
export const validateEffect = ModuleLoader.createValidator(
    ['name', 'apply'],
    'Effect'
);

// Export the loader
export default ModuleLoader;