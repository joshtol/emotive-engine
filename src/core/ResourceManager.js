/**
 * ResourceManager - Centralized resource lifecycle management
 * 
 * Manages registration, cleanup, and monitoring of all system resources
 * including audio contexts, canvas contexts, timers, and event listeners.
 * Provides automatic resource disposal and leak detection.
 */
class ResourceManager {
  constructor(config = {}) {
    this.resources = new Map();
    this.cleanupTasks = [];
    this.isDestroyed = false;
    this.config = {
      maxResources: config.maxResources || 1000,
      leakDetectionInterval: config.leakDetectionInterval || 30000, // 30 seconds
      enableLeakDetection: config.enableLeakDetection !== false,
      enableLogging: config.enableLogging !== false,
      ...config
    };
    
    // Resource type counters for monitoring
    this.resourceCounts = new Map();
    
    // Leak detection
    this.leakDetectionTimer = null;
    this.resourceHistory = [];
    
    // Cleanup ordering - resources with higher priority are cleaned up first
    this.cleanupPriorities = new Map([
      ['timer', 100],
      ['interval', 100],
      ['animationFrame', 90],
      ['eventListener', 80],
      ['audioContext', 70],
      ['canvasContext', 60],
      ['webglContext', 60],
      ['mediaStream', 50],
      ['worker', 40],
      ['default', 10]
    ]);
    
    this.initializeLeakDetection();
  }

  /**
   * Register a resource for lifecycle management
   * @param {string} name - Unique identifier for the resource
   * @param {*} resource - The resource object
   * @param {Function} cleanupFn - Function to call when cleaning up the resource
   * @param {Object} options - Additional options
   * @returns {boolean} Success status
   */
  register(name, resource, cleanupFn, options = {}) {
    if (this.isDestroyed) {
      this.log('warn', `Cannot register resource "${name}" - ResourceManager is destroyed`);
      return false;
    }

    if (!name || typeof name !== 'string') {
      this.log('error', 'Resource name must be a non-empty string');
      return false;
    }

    if (!cleanupFn || typeof cleanupFn !== 'function') {
      this.log('error', `Cleanup function required for resource "${name}"`);
      return false;
    }

    // Check resource limits
    if (this.resources.size >= this.config.maxResources) {
      this.log('error', `Maximum resource limit (${this.config.maxResources}) exceeded`);
      return false;
    }

    // Check for duplicate registration
    if (this.resources.has(name)) {
      this.log('warn', `Resource "${name}" already registered - replacing`);
      this.unregister(name);
    }

    const resourceInfo = {
      name,
      resource,
      cleanupFn,
      type: options.type || 'default',
      priority: options.priority || this.cleanupPriorities.get(options.type) || 10,
      registeredAt: Date.now(),
      metadata: options.metadata || {}
    };

    this.resources.set(name, resourceInfo);
    this.updateResourceCounts(resourceInfo.type, 1);
    
    this.log('debug', `Registered resource "${name}" of type "${resourceInfo.type}"`);
    return true;
  }

  /**
   * Unregister and cleanup a specific resource
   * @param {string} name - Resource identifier
   * @returns {boolean} Success status
   */
  unregister(name) {
    if (!this.resources.has(name)) {
      this.log('warn', `Resource "${name}" not found for unregistration`);
      return false;
    }

    const resourceInfo = this.resources.get(name);
    
    try {
      resourceInfo.cleanupFn(resourceInfo.resource);
      this.updateResourceCounts(resourceInfo.type, -1);
      this.resources.delete(name);
      
      this.log('debug', `Unregistered resource "${name}"`);
      return true;
    } catch (error) {
      this.log('error', `Error cleaning up resource "${name}": ${error.message}`);
      // Still remove from registry even if cleanup failed
      this.resources.delete(name);
      this.updateResourceCounts(resourceInfo.type, -1);
      return false;
    }
  }

  /**
   * Register a cleanup task to be executed during shutdown
   * @param {Function} task - Cleanup task function
   * @param {number} priority - Execution priority (higher = earlier)
   */
  addCleanupTask(task, priority = 10) {
    if (typeof task !== 'function') {
      this.log('error', 'Cleanup task must be a function');
      return;
    }

    this.cleanupTasks.push({ task, priority });
    // Sort by priority (descending)
    this.cleanupTasks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Clean up all registered resources
   * @returns {Object} Cleanup results
   */
  cleanup() {
    if (this.isDestroyed) {
      return { success: true, message: 'Already destroyed' };
    }

    const results = {
      success: true,
      resourcesCleanedUp: 0,
      tasksExecuted: 0,
      errors: []
    };

    this.log('info', `Starting cleanup of ${this.resources.size} resources and ${this.cleanupTasks.length} tasks`);

    // Execute cleanup tasks first (in priority order)
    for (const { task, priority } of this.cleanupTasks) {
      try {
        task();
        results.tasksExecuted++;
      } catch (error) {
        results.errors.push(`Cleanup task error: ${error.message}`);
        this.log('error', `Cleanup task failed: ${error.message}`);
      }
    }

    // Clean up resources in priority order
    const sortedResources = Array.from(this.resources.values())
      .sort((a, b) => b.priority - a.priority);

    for (const resourceInfo of sortedResources) {
      try {
        resourceInfo.cleanupFn(resourceInfo.resource);
        results.resourcesCleanedUp++;
        this.log('debug', `Cleaned up resource "${resourceInfo.name}"`);
      } catch (error) {
        results.errors.push(`Resource "${resourceInfo.name}": ${error.message}`);
        this.log('error', `Failed to cleanup resource "${resourceInfo.name}": ${error.message}`);
        results.success = false;
      }
    }

    // Clear all collections
    this.resources.clear();
    this.resourceCounts.clear();
    this.cleanupTasks = [];

    this.log('info', `Cleanup completed: ${results.resourcesCleanedUp} resources, ${results.tasksExecuted} tasks, ${results.errors.length} errors`);
    return results;
  }

  /**
   * Destroy the ResourceManager and clean up all resources
   * @returns {Object} Destruction results
   */
  destroy() {
    if (this.isDestroyed) {
      return { success: true, message: 'Already destroyed' };
    }

    this.log('info', 'Destroying ResourceManager');
    
    // Stop leak detection
    this.stopLeakDetection();
    
    // Perform cleanup
    const results = this.cleanup();
    
    // Mark as destroyed
    this.isDestroyed = true;
    
    this.log('info', 'ResourceManager destroyed');
    return results;
  }

  /**
   * Get current resource count
   * @returns {number} Total number of registered resources
   */
  getResourceCount() {
    return this.resources.size;
  }

  /**
   * Get resource counts by type
   * @returns {Object} Resource counts by type
   */
  getResourceCountsByType() {
    return Object.fromEntries(this.resourceCounts);
  }

  /**
   * Get detailed resource information
   * @returns {Array} Array of resource information objects
   */
  getResourceInfo() {
    return Array.from(this.resources.values()).map(info => ({
      name: info.name,
      type: info.type,
      priority: info.priority,
      registeredAt: info.registeredAt,
      age: Date.now() - info.registeredAt,
      metadata: info.metadata
    }));
  }

  /**
   * Validate all registered resources
   * @returns {Object} Validation results
   */
  validateResources() {
    const results = {
      valid: 0,
      invalid: 0,
      errors: []
    };

    for (const [name, resourceInfo] of this.resources) {
      try {
        // Basic validation - check if resource still exists
        if (resourceInfo.resource === null || resourceInfo.resource === undefined) {
          results.invalid++;
          results.errors.push(`Resource "${name}" is null or undefined`);
          continue;
        }

        // Type-specific validation
        if (resourceInfo.type === 'audioContext' && resourceInfo.resource.state === 'closed') {
          results.invalid++;
          results.errors.push(`AudioContext "${name}" is closed`);
          continue;
        }

        if (resourceInfo.type === 'canvasContext' && !resourceInfo.resource.canvas) {
          results.invalid++;
          results.errors.push(`Canvas context "${name}" has no canvas`);
          continue;
        }

        results.valid++;
      } catch (error) {
        results.invalid++;
        results.errors.push(`Validation error for "${name}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection() {
    if (typeof window !== 'undefined' && window.gc) {
      try {
        window.gc();
        this.log('debug', 'Forced garbage collection');
      } catch (error) {
        this.log('warn', `Failed to force garbage collection: ${error.message}`);
      }
    } else {
      this.log('debug', 'Garbage collection not available');
    }
  }

  /**
   * Detect potential memory leaks
   * @returns {Object} Leak detection results
   */
  detectLeaks() {
    const now = Date.now();
    const currentCount = this.resources.size;
    
    // Add current count to history
    this.resourceHistory.push({ timestamp: now, count: currentCount });
    
    // Keep only last 10 minutes of history
    const tenMinutesAgo = now - 600000;
    this.resourceHistory = this.resourceHistory.filter(entry => entry.timestamp > tenMinutesAgo);
    
    const results = {
      potentialLeaks: [],
      resourceGrowth: 0,
      recommendations: []
    };

    // Check for consistent growth
    if (this.resourceHistory.length >= 5) {
      const oldestCount = this.resourceHistory[0].count;
      results.resourceGrowth = currentCount - oldestCount;
      
      if (results.resourceGrowth > 10) {
        results.recommendations.push('Resource count has grown significantly - check for proper cleanup');
      }
    }

    // Check for old resources
    const oneHourAgo = now - 3600000;
    for (const [name, resourceInfo] of this.resources) {
      if (resourceInfo.registeredAt < oneHourAgo) {
        results.potentialLeaks.push({
          name,
          type: resourceInfo.type,
          age: now - resourceInfo.registeredAt
        });
      }
    }

    if (results.potentialLeaks.length > 0) {
      results.recommendations.push(`Found ${results.potentialLeaks.length} resources older than 1 hour`);
    }

    return results;
  }

  /**
   * Get resource usage report
   * @returns {Object} Comprehensive resource usage report
   */
  getUsageReport() {
    const validation = this.validateResources();
    const leakDetection = this.detectLeaks();
    
    return {
      timestamp: Date.now(),
      totalResources: this.resources.size,
      resourcesByType: this.getResourceCountsByType(),
      validation,
      leakDetection,
      memoryUsage: this.getMemoryUsage(),
      isDestroyed: this.isDestroyed
    };
  }

  /**
   * Initialize leak detection monitoring
   * @private
   */
  initializeLeakDetection() {
    if (!this.config.enableLeakDetection) {
      return;
    }

    this.leakDetectionTimer = setInterval(() => {
      const leaks = this.detectLeaks();
      if (leaks.potentialLeaks.length > 0 || leaks.resourceGrowth > 20) {
        this.log('warn', `Potential memory leaks detected: ${leaks.potentialLeaks.length} old resources, growth: ${leaks.resourceGrowth}`);
      }
    }, this.config.leakDetectionInterval);
  }

  /**
   * Stop leak detection monitoring
   * @private
   */
  stopLeakDetection() {
    if (this.leakDetectionTimer) {
      clearInterval(this.leakDetectionTimer);
      this.leakDetectionTimer = null;
    }
  }

  /**
   * Update resource type counters
   * @private
   */
  updateResourceCounts(type, delta) {
    const current = this.resourceCounts.get(type) || 0;
    const newCount = Math.max(0, current + delta);
    
    if (newCount === 0) {
      this.resourceCounts.delete(type);
    } else {
      this.resourceCounts.set(type, newCount);
    }
  }

  /**
   * Get memory usage information
   * @private
   */
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Log messages with appropriate level
   * @private
   */
  log(level, message) {
    if (!this.config.enableLogging) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[ResourceManager ${timestamp}] ${message}`;
    
    if (typeof console !== 'undefined') {
      switch (level) {
        case 'error':
          console.error(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'info':
          console.info(logMessage);
          break;
        case 'debug':
          console.debug(logMessage);
          break;
        default:
          console.log(logMessage);
      }
    }
  }
}

export default ResourceManager;