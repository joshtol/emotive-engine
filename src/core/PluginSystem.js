/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ◐ ◑ ◒ ◓  PLUGIN SYSTEM  ◓ ◒ ◑ ◐                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Plugin System - Extensible Architecture for Custom Behaviors
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module PluginSystem
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The EXPANSION SLOT for creativity. Allows developers to extend the mascot         
 * ║ with custom emotions, gestures, particles, and behaviors without modifying        
 * ║ core code. Build your own emotional expressions!                                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔌 PLUGIN TYPES                                                                    
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • emotion  : Add custom emotional states                                          
 * │ • gesture  : Define new gesture animations                                        
 * │ • particle : Create custom particle behaviors                                     
 * │ • audio    : Add sound effects and tones                                          
 * │ • renderer : Modify rendering pipeline                                            
 * │ • behavior : Add complex behavioral patterns                                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 LIFECYCLE HOOKS                                                                 
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • init()     : Called when plugin is registered                                   
 * │ • update()   : Called every frame                                                 
 * │ • render()   : Called during render phase                                         
 * │ • destroy()  : Called when plugin is unregistered                                 
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class PluginSystem {
    constructor(config = {}) {
        this.config = {
            enablePlugins: config.enablePlugins !== false,
            validatePlugins: config.validatePlugins !== false,
            sandboxPlugins: config.sandboxPlugins !== false,
            maxPlugins: config.maxPlugins || 50,
            pluginTimeout: config.pluginTimeout || 5000,
            allowOverrides: config.allowOverrides !== false,
            ...config
        };

        // Store mascot reference for plugin access
        this.mascot = config.mascot || null;
        
        // Plugin registry
        this.plugins = new Map();
        this.pluginTypes = ['emotion', 'gesture', 'particle', 'audio', 'renderer', 'animation'];
        this.pluginsByType = new Map(this.pluginTypes.map(type => [type, new Set()]));
        
        // Plugin dependencies
        this.dependencies = new Map();
        this.dependencyGraph = new Map();
        
        // Plugin lifecycle states
        this.pluginStates = new Map();
        this.loadingPlugins = new Set();
        this.activePlugins = new Set();
        
        // Plugin hooks
        this.hooks = new Map([
            ['beforeInit', new Set()],
            ['afterInit', new Set()],
            ['beforeUpdate', new Set()],
            ['afterUpdate', new Set()],
            ['beforeRender', new Set()],
            ['afterRender', new Set()],
            ['beforeDestroy', new Set()],
            ['afterDestroy', new Set()]
        ]);
        
        // Plugin API exposed to plugins
        this.pluginAPI = this.createPluginAPI();
        
        // Conflict resolution
        this.conflicts = new Map();
        this.resolutionStrategies = {
            'override': this.overrideConflict.bind(this),
            'merge': this.mergeConflict.bind(this),
            'reject': this.rejectConflict.bind(this),
            'queue': this.queueConflict.bind(this)
        };
        
        // Plugin validation schemas
        this.validationSchemas = this.createValidationSchemas();
        
        // Sandbox environment for plugins
        this.sandbox = null;
        if (this.config.sandboxPlugins) {
            this.sandbox = this.createSandbox();
        }
        
        // PluginSystem initialized
    }
    
    /**
     * Create plugin API exposed to plugins
     * @returns {Object} Plugin API
     */
    createPluginAPI() {
        return {
            // Mascot instance access (primary interface for plugins)
            mascot: this.mascot,

            // Core functionality
            registerHook: this.registerHook.bind(this),
            emit: this.emitPluginEvent.bind(this),
            on: this.onPluginEvent.bind(this),

            // Access to other plugins
            getPlugin: this.getPlugin.bind(this),
            hasPlugin: this.hasPlugin.bind(this),

            // Utilities
            log: this.logFromPlugin.bind(this),
            error: this.errorFromPlugin.bind(this),

            // State management
            setState: this.setPluginState.bind(this),
            getState: this.getPluginState.bind(this),

            // Configuration
            getConfig: () => ({ ...this.config }),

            // Version info
            version: '1.0.0'
        };
    }
    
    /**
     * Create validation schemas for different plugin types
     * @returns {Map} Validation schemas
     */
    createValidationSchemas() {
        const schemas = new Map();
        
        // Base schema for all plugins
        const baseSchema = {
            name: { type: 'string', required: true },
            version: { type: 'string', required: true },
            type: { type: 'string', required: true, enum: this.pluginTypes },
            description: { type: 'string', required: false },
            author: { type: 'string', required: false },
            dependencies: { type: 'array', required: false },
            conflicts: { type: 'array', required: false },
            init: { type: 'function', required: true },
            destroy: { type: 'function', required: true }
        };
        
        // Emotion plugin schema
        schemas.set('emotion', {
            ...baseSchema,
            emotion: {
                type: 'object',
                required: true,
                properties: {
                    name: { type: 'string', required: true },
                    color: { type: 'string', required: true },
                    particleColor: { type: 'string', required: false },
                    animation: { type: 'object', required: true },
                    transitions: { type: 'object', required: false }
                }
            },
            updateEmotion: { type: 'function', required: true },
            renderEmotion: { type: 'function', required: false }
        });
        
        // Gesture plugin schema
        schemas.set('gesture', {
            ...baseSchema,
            gesture: {
                type: 'object',
                required: true,
                properties: {
                    name: { type: 'string', required: true },
                    duration: { type: 'number', required: true },
                    keyframes: { type: 'array', required: true },
                    compatibility: { type: 'object', required: false }
                }
            },
            executeGesture: { type: 'function', required: true },
            canExecute: { type: 'function', required: false }
        });
        
        // Particle plugin schema
        schemas.set('particle', {
            ...baseSchema,
            particle: {
                type: 'object',
                required: true,
                properties: {
                    name: { type: 'string', required: true },
                    maxParticles: { type: 'number', required: false },
                    behavior: { type: 'function', required: true },
                    render: { type: 'function', required: true }
                }
            },
            updateParticles: { type: 'function', required: true },
            spawnParticle: { type: 'function', required: false }
        });
        
        // Audio plugin schema
        schemas.set('audio', {
            ...baseSchema,
            audio: {
                type: 'object',
                required: true,
                properties: {
                    name: { type: 'string', required: true },
                    sounds: { type: 'object', required: true },
                    effects: { type: 'array', required: false }
                }
            },
            playSound: { type: 'function', required: true },
            processAudio: { type: 'function', required: false }
        });
        
        return schemas;
    }
    
    /**
     * Create sandbox environment for plugin execution
     * @returns {Object} Sandbox environment
     */
    createSandbox() {
        // Create a limited execution environment
        const sandbox = {
            // Safe global objects
            Math,
            Date,
            JSON,
            
            // Limited console
            console: {
                log: (...args) => null,
                warn: (...args) => null,
                error: (...args) => null
            },
            
            // No access to window, document, or other globals
            window: undefined,
            document: undefined,
            localStorage: undefined,
            sessionStorage: undefined,
            fetch: undefined,
            XMLHttpRequest: undefined,
            
            // Plugin API
            api: this.pluginAPI
        };
        
        return sandbox;
    }
    
    /**
     * Register a plugin
     * @param {Object} plugin - Plugin to register
     * @returns {boolean} Success status
     */
    async registerPlugin(plugin) {
        if (!this.config.enablePlugins) {
            // Plugins are disabled
            return false;
        }
        
        // Check plugin limit
        if (this.plugins.size >= this.config.maxPlugins) {
            // Maximum plugin limit reached
            return false;
        }
        
        // Validate plugin
        if (this.config.validatePlugins) {
            const validation = this.validatePlugin(plugin);
            if (!validation.valid) {
                // Plugin validation failed
                return false;
            }
        }
        
        // Check for conflicts
        const conflicts = this.checkConflicts(plugin);
        if (conflicts.length > 0 && !this.config.allowOverrides) {
            // Plugin conflicts detected
            return false;
        }
        
        // Resolve dependencies
        const dependencies = await this.resolveDependencies(plugin);
        if (!dependencies.resolved) {
            // Plugin dependencies not met
            return false;
        }
        
        // Initialize plugin in sandbox if enabled
        try {
            this.loadingPlugins.add(plugin.name);
            
            const context = this.config.sandboxPlugins ? this.sandbox : window;
            const initialized = await this.initializePlugin(plugin, context);
            
            if (!initialized) {
                throw new Error('Plugin initialization failed');
            }
            
            // Register plugin
            this.plugins.set(plugin.name, plugin);
            this.pluginsByType.get(plugin.type).add(plugin.name);
            this.pluginStates.set(plugin.name, 'active');
            this.activePlugins.add(plugin.name);
            
            // Store dependencies
            if (plugin.dependencies) {
                this.dependencies.set(plugin.name, plugin.dependencies);
                this.updateDependencyGraph(plugin.name, plugin.dependencies);
            }
            
            // Register hooks if provided
            if (plugin.hooks) {
                Object.entries(plugin.hooks).forEach(([hook, handler]) => {
                    this.registerHook(hook, handler, plugin.name);
                });
            }
            
            // Plugin registered
            
            // Emit registration event
            this.emitPluginEvent('pluginRegistered', {
                name: plugin.name,
                type: plugin.type,
                version: plugin.version
            });
            
            return true;
            
        } catch (error) {
            // Failed to register plugin
            return false;
        } finally {
            this.loadingPlugins.delete(plugin.name);
        }
    }
    
    /**
     * Validate a plugin against its schema
     * @param {Object} plugin - Plugin to validate
     * @returns {Object} Validation result
     */
    validatePlugin(plugin) {
        const errors = [];
        
        // Check required base properties
        if (!plugin.name || typeof plugin.name !== 'string') {
            errors.push('Plugin must have a valid name');
        }
        
        if (!plugin.type || !this.pluginTypes.includes(plugin.type)) {
            errors.push(`Plugin type must be one of: ${this.pluginTypes.join(', ')}`);
        }
        
        if (!plugin.version || typeof plugin.version !== 'string') {
            errors.push('Plugin must have a version');
        }
        
        if (typeof plugin.init !== 'function') {
            errors.push('Plugin must have an init function');
        }
        
        if (typeof plugin.destroy !== 'function') {
            errors.push('Plugin must have a destroy function');
        }
        
        // Validate type-specific schema
        if (plugin.type && this.validationSchemas.has(plugin.type)) {
            const schema = this.validationSchemas.get(plugin.type);
            const typeErrors = this.validateAgainstSchema(plugin, schema);
            errors.push(...typeErrors);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate object against schema
     * @param {Object} obj - Object to validate
     * @param {Object} schema - Schema to validate against
     * @returns {Array} Array of errors
     */
    validateAgainstSchema(obj, schema) {
        const errors = [];
        
        Object.entries(schema).forEach(([key, rules]) => {
            if (rules.required && !(key in obj)) {
                errors.push(`Missing required property: ${key}`);
            }
            
            if (key in obj) {
                const value = obj[key];
                
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`Property ${key} must be of type ${rules.type}`);
                }
                
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`Property ${key} must be one of: ${rules.enum.join(', ')}`);
                }
                
                if (rules.properties && typeof value === 'object') {
                    const subErrors = this.validateAgainstSchema(value, rules.properties);
                    errors.push(...subErrors.map(e => `${key}.${e}`));
                }
            }
        });
        
        return errors;
    }
    
    /**
     * Check for plugin conflicts
     * @param {Object} plugin - Plugin to check
     * @returns {Array} Array of conflicts
     */
    checkConflicts(plugin) {
        const conflicts = [];
        
        // Check explicit conflicts
        if (plugin.conflicts) {
            plugin.conflicts.forEach(conflictName => {
                if (this.plugins.has(conflictName)) {
                    conflicts.push(conflictName);
                }
            });
        }
        
        // Check type-specific conflicts
        if (plugin.type === 'emotion' || plugin.type === 'gesture') {
            // Check for name collisions
            this.plugins.forEach(existingPlugin => {
                if (existingPlugin.type === plugin.type) {
                    const existingName = existingPlugin[plugin.type]?.name;
                    const newName = plugin[plugin.type]?.name;
                    
                    if (existingName === newName) {
                        conflicts.push(`${plugin.type} name collision: ${newName}`);
                    }
                }
            });
        }
        
        return conflicts;
    }
    
    /**
     * Resolve plugin dependencies
     * @param {Object} plugin - Plugin to resolve dependencies for
     * @returns {Object} Resolution result
     */
    async resolveDependencies(plugin) {
        if (!plugin.dependencies || plugin.dependencies.length === 0) {
            return { resolved: true, missing: [] };
        }
        
        const missing = [];
        
        for (const dep of plugin.dependencies) {
            // Check if dependency is already loaded
            if (!this.plugins.has(dep)) {
                // Try to load dependency
                const loaded = await this.tryLoadDependency(dep);
                if (!loaded) {
                    missing.push(dep);
                }
            }
        }
        
        return {
            resolved: missing.length === 0,
            missing
        };
    }
    
    /**
     * Try to load a dependency
     * @param {string} dependencyName - Dependency name
     * @returns {boolean} Success status
     */
    tryLoadDependency(dependencyName) {
        // This would attempt to load the dependency
        // For now, just check if it exists
        return this.plugins.has(dependencyName);
    }
    
    /**
     * Update dependency graph
     * @param {string} pluginName - Plugin name
     * @param {Array} dependencies - Dependencies
     */
    updateDependencyGraph(pluginName, dependencies) {
        this.dependencyGraph.set(pluginName, new Set(dependencies));
        
        // Update reverse dependencies
        dependencies.forEach(dep => {
            if (!this.dependencyGraph.has(dep)) {
                this.dependencyGraph.set(dep, new Set());
            }
        });
    }
    
    /**
     * Initialize a plugin
     * @param {Object} plugin - Plugin to initialize
     * @param {Object} context - Execution context
     * @returns {boolean} Success status
     */
    async initializePlugin(plugin, context) {
        try {
            // Set timeout for initialization
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Plugin initialization timeout')), this.config.pluginTimeout);
            });
            
            // Initialize plugin
            const init = plugin.init.bind(context);
            const result = await Promise.race([
                init(this.pluginAPI),
                timeout
            ]);
            
            return result !== false;
        } catch (error) {
            // Plugin initialization error
            return false;
        }
    }
    
    /**
     * Unregister a plugin
     * @param {string} pluginName - Name of plugin to unregister
     * @returns {boolean} Success status
     */
    async unregisterPlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            // Plugin not found
            return false;
        }
        
        // Check for dependent plugins
        const dependents = this.getDependentPlugins(pluginName);
        if (dependents.length > 0) {
            // Cannot unregister plugin - required by dependents
            return false;
        }
        
        try {
            // Call destroy method
            if (typeof plugin.destroy === 'function') {
                await plugin.destroy();
            }
            
            // Remove from registries
            this.plugins.delete(pluginName);
            this.pluginsByType.get(plugin.type).delete(pluginName);
            this.pluginStates.delete(pluginName);
            this.activePlugins.delete(pluginName);
            this.dependencies.delete(pluginName);
            this.dependencyGraph.delete(pluginName);
            
            // Remove hooks
            this.hooks.forEach(hookSet => {
                hookSet.forEach(hook => {
                    if (hook.pluginName === pluginName) {
                        hookSet.delete(hook);
                    }
                });
            });
            
            // Plugin unregistered
            
            // Emit unregistration event
            this.emitPluginEvent('pluginUnregistered', { name: pluginName });
            
            return true;
        } catch (error) {
            // Failed to unregister plugin
            return false;
        }
    }
    
    /**
     * Get plugins dependent on a given plugin
     * @param {string} pluginName - Plugin name
     * @returns {Array} Array of dependent plugin names
     */
    getDependentPlugins(pluginName) {
        const dependents = [];
        
        this.dependencies.forEach((deps, name) => {
            if (deps.includes(pluginName)) {
                dependents.push(name);
            }
        });
        
        return dependents;
    }
    
    /**
     * Register a hook handler
     * @param {string} hookName - Hook name
     * @param {Function} handler - Handler function
     * @param {string} pluginName - Plugin name
     */
    registerHook(hookName, handler, pluginName) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, new Set());
        }
        
        this.hooks.get(hookName).add({
            handler,
            pluginName
        });
    }
    
    /**
     * Execute hooks for a given event
     * @param {string} hookName - Hook name
     * @param {*} data - Data to pass to hooks
     * @returns {Array} Results from hooks
     */
    async executeHooks(hookName, data) {
        const hooks = this.hooks.get(hookName);
        if (!hooks || hooks.size === 0) return [];
        
        const results = [];
        
        for (const hook of hooks) {
            try {
                const result = await hook.handler(data);
                results.push({ pluginName: hook.pluginName, result });
            } catch (error) {
                // Hook error in plugin
            }
        }
        
        return results;
    }
    
    /**
     * Get a plugin by name
     * @param {string} pluginName - Plugin name
     * @returns {Object} Plugin or null
     */
    getPlugin(pluginName) {
        return this.plugins.get(pluginName) || null;
    }
    
    /**
     * Check if a plugin exists
     * @param {string} pluginName - Plugin name
     * @returns {boolean} True if plugin exists
     */
    hasPlugin(pluginName) {
        return this.plugins.has(pluginName);
    }
    
    /**
     * Get plugins by type
     * @param {string} type - Plugin type
     * @returns {Array} Array of plugins
     */
    getPluginsByType(type) {
        const pluginNames = this.pluginsByType.get(type);
        if (!pluginNames) return [];
        
        return Array.from(pluginNames).map(name => this.plugins.get(name));
    }
    
    /**
     * Enable a plugin
     * @param {string} pluginName - Plugin name
     */
    enablePlugin(pluginName) {
        if (!this.plugins.has(pluginName)) return;
        
        this.pluginStates.set(pluginName, 'active');
        this.activePlugins.add(pluginName);
        
        const plugin = this.plugins.get(pluginName);
        if (plugin.onEnable) {
            plugin.onEnable();
        }
        
        this.emitPluginEvent('pluginEnabled', { name: pluginName });
    }
    
    /**
     * Disable a plugin
     * @param {string} pluginName - Plugin name
     */
    disablePlugin(pluginName) {
        if (!this.plugins.has(pluginName)) return;
        
        // Check dependents
        const dependents = this.getDependentPlugins(pluginName);
        if (dependents.length > 0) {
            // Disabling plugin will affect dependents
        }
        
        this.pluginStates.set(pluginName, 'disabled');
        this.activePlugins.delete(pluginName);
        
        const plugin = this.plugins.get(pluginName);
        if (plugin.onDisable) {
            plugin.onDisable();
        }
        
        this.emitPluginEvent('pluginDisabled', { name: pluginName });
    }
    
    /**
     * Emit plugin event
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    emitPluginEvent(eventName, data) {
        // This would integrate with the main event system
        if (this.onPluginEvent) {
            this.onPluginEvent(eventName, data);
        }
    }
    
    /**
     * Listen for plugin events
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    onPluginEvent(eventName, handler) {
        // This would integrate with the main event system
        // Placeholder for event listening
    }
    
    /**
     * Log from plugin context
     * @param {string} pluginName - Plugin name
     * @param {...*} args - Log arguments
     */
    logFromPlugin(pluginName, ...args) {
        // Plugin log message
    }
    
    /**
     * Error from plugin context
     * @param {string} pluginName - Plugin name
     * @param {...*} args - Error arguments
     */
    errorFromPlugin(pluginName, ...args) {
        // Plugin error message
    }
    
    /**
     * Set plugin state
     * @param {string} pluginName - Plugin name
     * @param {string} key - State key
     * @param {*} value - State value
     */
    setPluginState(pluginName, key, value) {
        if (!this.pluginStates.has(pluginName)) {
            this.pluginStates.set(pluginName, {});
        }
        
        const state = this.pluginStates.get(pluginName);
        if (typeof state === 'object') {
            state[key] = value;
        }
    }
    
    /**
     * Get plugin state
     * @param {string} pluginName - Plugin name
     * @param {string} key - State key
     * @returns {*} State value
     */
    getPluginState(pluginName, key) {
        const state = this.pluginStates.get(pluginName);
        if (typeof state === 'object') {
            return state[key];
        }
        return undefined;
    }
    
    /**
     * Conflict resolution strategies
     */
    overrideConflict(existing, incoming) {
        return incoming; // New plugin overrides existing
    }
    
    mergeConflict(existing, incoming) {
        return { ...existing, ...incoming }; // Merge properties
    }
    
    rejectConflict(existing, incoming) {
        return existing; // Keep existing, reject new
    }
    
    queueConflict(existing, incoming) {
        return [existing, incoming]; // Queue both
    }
    
    /**
     * Get plugin system status
     * @returns {Object} Status report
     */
    getStatus() {
        return {
            enabled: this.config.enablePlugins,
            totalPlugins: this.plugins.size,
            activePlugins: this.activePlugins.size,
            loadingPlugins: this.loadingPlugins.size,
            pluginsByType: Object.fromEntries(
                Array.from(this.pluginsByType.entries()).map(([type, plugins]) => [type, plugins.size])
            ),
            hooks: Object.fromEntries(
                Array.from(this.hooks.entries()).map(([hook, handlers]) => [hook, handlers.size])
            )
        };
    }
    
    /**
     * Destroy plugin system
     */
    async destroy() {
        // Unregister all plugins
        const pluginNames = Array.from(this.plugins.keys());
        
        for (const name of pluginNames) {
            await this.unregisterPlugin(name);
        }
        
        // Clear all data
        this.plugins.clear();
        this.pluginsByType.clear();
        this.dependencies.clear();
        this.dependencyGraph.clear();
        this.pluginStates.clear();
        this.activePlugins.clear();
        this.loadingPlugins.clear();
        this.hooks.clear();
        this.conflicts.clear();
        
        // PluginSystem destroyed
    }
}

export default PluginSystem;