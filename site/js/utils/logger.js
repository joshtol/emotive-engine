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
/**
 * Logger Utility - Centralized logging with levels and debug mode
 * Provides consistent logging across the application with filterable levels
 */
class Logger {
    constructor(name, options = {}) {
        this.name = name;
        this.config = {
            enabled: options.enabled !== false,
            level: options.level || 'info',
            showTimestamp: options.showTimestamp !== false,
            showName: options.showName !== false,
            colorize: options.colorize !== false,
            ...options
        };

        // Log levels with numeric values for comparison
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            none: 4
        };

        // Console styling for different levels
        this.styles = {
            debug: 'color: #888; font-style: italic;',
            info: 'color: #2196F3;',
            warn: 'color: #FF9800; font-weight: bold;',
            error: 'color: #F44336; font-weight: bold;',
            name: 'color: #9C27B0; font-weight: bold;',
            timestamp: 'color: #607D8B; font-size: 0.9em;'
        };
    }

    /**
     * Check if a log level should be output
     */
    shouldLog(level) {
        // Check global debug mode
        const debugMode = window.DEBUG_MODE ||
                         (window.app?.config?.debugMode) ||
                         localStorage.getItem('debugMode') === 'true';

        // In debug mode, show everything
        if (debugMode && level === 'debug') return true;

        // Otherwise check level threshold
        const currentLevel = this.levels[this.config.level] || 1;
        const messageLevel = this.levels[level] || 1;

        return this.config.enabled && messageLevel >= currentLevel;
    }

    /**
     * Format the log prefix
     */
    getPrefix(level) {
        const parts = [];

        if (this.config.showTimestamp) {
            const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
            parts.push(`[${timestamp}]`);
        }

        if (this.config.showName) {
            parts.push(`[${this.name}]`);
        }

        parts.push(`[${level.toUpperCase()}]`);

        return parts.join(' ');
    }

    /**
     * Debug level - detailed information for development
     */
    debug(...args) {
        if (!this.shouldLog('debug')) return;

        const prefix = this.getPrefix('debug');

        if (this.config.colorize && console.groupCollapsed) {
            console.groupCollapsed(`%c${prefix}`, this.styles.debug, ...args);
            console.trace();
            console.groupEnd();
        } else {
            console.log(`%c${prefix}`, this.styles.debug, ...args);
        }
    }

    /**
     * Info level - general information
     */
    info(...args) {
        if (!this.shouldLog('info')) return;

        const prefix = this.getPrefix('info');
        console.log(`%c${prefix}`, this.styles.info, ...args);
    }

    /**
     * Warning level - potential issues
     */
    warn(...args) {
        if (!this.shouldLog('warn')) return;

        const prefix = this.getPrefix('warn');
        console.warn(`%c${prefix}`, this.styles.warn, ...args);
    }

    /**
     * Error level - errors and failures
     */
    error(...args) {
        if (!this.shouldLog('error')) return;

        const prefix = this.getPrefix('error');
        console.error(`%c${prefix}`, this.styles.error, ...args);

        // Also log stack trace for errors
        if (args[0] instanceof Error) {
            console.error(args[0].stack);
        }
    }

    /**
     * Group related logs together
     */
    group(label, collapsed = true) {
        if (!this.shouldLog('debug')) return;

        const prefix = this.getPrefix('debug');
        const fullLabel = `%c${prefix} ${label}`;

        if (collapsed && console.groupCollapsed) {
            console.groupCollapsed(fullLabel, this.styles.name);
        } else if (console.group) {
            console.group(fullLabel, this.styles.name);
        }
    }

    /**
     * End a log group
     */
    groupEnd() {
        if (!this.shouldLog('debug')) return;
        if (console.groupEnd) console.groupEnd();
    }

    /**
     * Performance timing
     */
    time(label) {
        if (!this.shouldLog('debug')) return;
        console.time(`[${this.name}] ${label}`);
    }

    timeEnd(label) {
        if (!this.shouldLog('debug')) return;
        console.timeEnd(`[${this.name}] ${label}`);
    }

    /**
     * Table display for objects/arrays
     */
    table(data, columns) {
        if (!this.shouldLog('debug')) return;
        console.table(data, columns);
    }

    /**
     * Update logger configuration
     */
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.config.level = level;
        }
    }

    setEnabled(enabled) {
        this.config.enabled = enabled;
    }

    /**
     * Create a child logger with inherited settings
     */
    child(name, options = {}) {
        return new Logger(`${this.name}:${name}`, {
            ...this.config,
            ...options
        });
    }
}

/**
 * LoggerFactory - Creates and manages logger instances
 */
class LoggerFactory {
    constructor() {
        this.loggers = new Map();
        this.defaultConfig = {
            level: 'info',
            enabled: true,
            showTimestamp: true,
            showName: true,
            colorize: true
        };
    }

    /**
     * Get or create a logger
     */
    getLogger(name, options = {}) {
        if (!this.loggers.has(name)) {
            this.loggers.set(name, new Logger(name, {
                ...this.defaultConfig,
                ...options
            }));
        }
        return this.loggers.get(name);
    }

    /**
     * Set global log level
     */
    setGlobalLevel(level) {
        this.defaultConfig.level = level;
        // Update existing loggers
        this.loggers.forEach(logger => logger.setLevel(level));
    }

    /**
     * Enable/disable all loggers
     */
    setGlobalEnabled(enabled) {
        this.defaultConfig.enabled = enabled;
        this.loggers.forEach(logger => logger.setEnabled(enabled));
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        window.DEBUG_MODE = true;
        localStorage.setItem('debugMode', 'true');
        this.setGlobalLevel('debug');
        console.log('%c🔧 Debug Mode Enabled', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        window.DEBUG_MODE = false;
        localStorage.removeItem('debugMode');
        this.setGlobalLevel('info');
        console.log('%c🔧 Debug Mode Disabled', 'color: #F44336; font-size: 14px; font-weight: bold;');
    }

    /**
     * Check if debug mode is enabled
     */
    isDebugMode() {
        return window.DEBUG_MODE || localStorage.getItem('debugMode') === 'true';
    }
}

// Create singleton instance
const loggerFactory = new LoggerFactory();

// Check for debug mode on initialization
if (localStorage.getItem('debugMode') === 'true') {
    window.DEBUG_MODE = true;
}

// Export for ES6 modules
export { Logger, LoggerFactory, loggerFactory };

// Make available globally
if (typeof window !== 'undefined') {
    window.Logger = Logger;
    window.LoggerFactory = LoggerFactory;
    window.loggerFactory = loggerFactory;

    // Convenience methods
    window.getLogger = (name, options) => loggerFactory.getLogger(name, options);
    window.enableDebugMode = () => loggerFactory.enableDebugMode();
    window.disableDebugMode = () => loggerFactory.disableDebugMode();
}

export default loggerFactory;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.