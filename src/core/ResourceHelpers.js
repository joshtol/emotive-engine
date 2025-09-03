/**
 * ResourceHelpers - Utility functions for common resource management patterns
 * 
 * Provides convenient methods for registering common resource types
 * with the ResourceManager, including proper cleanup functions.
 */

/**
 * Register an audio context with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {AudioContext} audioContext - The audio context to register
 * @returns {boolean} Success status
 */
export function registerAudioContext(resourceManager, name, audioContext) {
  return resourceManager.register(
    name,
    audioContext,
    (ctx) => {
      if (ctx && ctx.state !== 'closed') {
        try {
          ctx.close();
        } catch (error) {
          console.warn(`Failed to close audio context: ${error.message}`);
        }
      }
    },
    { type: 'audioContext', priority: 70 }
  );
}

/**
 * Register a canvas context with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {CanvasRenderingContext2D|WebGLRenderingContext} context - The canvas context
 * @returns {boolean} Success status
 */
export function registerCanvasContext(resourceManager, name, context) {
  return resourceManager.register(
    name,
    context,
    (ctx) => {
      if (ctx && ctx.canvas) {
        // Clear the canvas
        if (ctx.clearRect) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (ctx.clear) {
          // WebGL context
          ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
        }
        
        // Remove from DOM if needed
        if (ctx.canvas.parentNode) {
          ctx.canvas.parentNode.removeChild(ctx.canvas);
        }
      }
    },
    { type: 'canvasContext', priority: 60 }
  );
}

/**
 * Register a timer (setTimeout) with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {number} timerId - The timer ID returned by setTimeout
 * @returns {boolean} Success status
 */
export function registerTimer(resourceManager, name, timerId) {
  return resourceManager.register(
    name,
    timerId,
    (id) => {
      if (id !== null && id !== undefined) {
        clearTimeout(id);
      }
    },
    { type: 'timer', priority: 100 }
  );
}

/**
 * Register an interval (setInterval) with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {number} intervalId - The interval ID returned by setInterval
 * @returns {boolean} Success status
 */
export function registerInterval(resourceManager, name, intervalId) {
  return resourceManager.register(
    name,
    intervalId,
    (id) => {
      if (id !== null && id !== undefined) {
        clearInterval(id);
      }
    },
    { type: 'interval', priority: 100 }
  );
}

/**
 * Register an animation frame request with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {number} frameId - The frame ID returned by requestAnimationFrame
 * @returns {boolean} Success status
 */
export function registerAnimationFrame(resourceManager, name, frameId) {
  return resourceManager.register(
    name,
    frameId,
    (id) => {
      if (id !== null && id !== undefined) {
        cancelAnimationFrame(id);
      }
    },
    { type: 'animationFrame', priority: 90 }
  );
}

/**
 * Register an event listener with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {EventTarget} target - The event target
 * @param {string} event - The event type
 * @param {Function} listener - The event listener function
 * @param {Object} options - Event listener options
 * @returns {boolean} Success status
 */
export function registerEventListener(resourceManager, name, target, event, listener, options = {}) {
  const listenerInfo = { target, event, listener, options };
  
  return resourceManager.register(
    name,
    listenerInfo,
    (info) => {
      if (info && info.target && info.target.removeEventListener) {
        try {
          info.target.removeEventListener(info.event, info.listener, info.options);
        } catch (error) {
          console.warn(`Failed to remove event listener: ${error.message}`);
        }
      }
    },
    { 
      type: 'eventListener', 
      priority: 80,
      metadata: { event, target: target.constructor.name }
    }
  );
}

/**
 * Register a media stream with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {MediaStream} stream - The media stream
 * @returns {boolean} Success status
 */
export function registerMediaStream(resourceManager, name, stream) {
  return resourceManager.register(
    name,
    stream,
    (mediaStream) => {
      if (mediaStream && mediaStream.getTracks) {
        try {
          mediaStream.getTracks().forEach(track => {
            track.stop();
          });
        } catch (error) {
          console.warn(`Failed to stop media stream tracks: ${error.message}`);
        }
      }
    },
    { type: 'mediaStream', priority: 50 }
  );
}

/**
 * Register a Web Worker with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {Worker} worker - The Web Worker
 * @returns {boolean} Success status
 */
export function registerWorker(resourceManager, name, worker) {
  return resourceManager.register(
    name,
    worker,
    (w) => {
      if (w && w.terminate) {
        try {
          w.terminate();
        } catch (error) {
          console.warn(`Failed to terminate worker: ${error.message}`);
        }
      }
    },
    { type: 'worker', priority: 40 }
  );
}

/**
 * Register an object pool with proper cleanup
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {Object} pool - The object pool with cleanup method
 * @returns {boolean} Success status
 */
export function registerObjectPool(resourceManager, name, pool) {
  return resourceManager.register(
    name,
    pool,
    (p) => {
      if (p) {
        // Try common cleanup method names
        if (typeof p.cleanup === 'function') {
          p.cleanup();
        } else if (typeof p.clear === 'function') {
          p.clear();
        } else if (typeof p.reset === 'function') {
          p.reset();
        } else if (typeof p.destroy === 'function') {
          p.destroy();
        }
      }
    },
    { type: 'objectPool', priority: 30 }
  );
}

/**
 * Create a resource-managed timeout
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {Function} callback - The callback function
 * @param {number} delay - The delay in milliseconds
 * @returns {number|null} Timer ID or null if registration failed
 */
export function createManagedTimeout(resourceManager, name, callback, delay) {
  const timerId = setTimeout(callback, delay);
  const success = registerTimer(resourceManager, name, timerId);
  
  if (!success) {
    clearTimeout(timerId);
    return null;
  }
  
  return timerId;
}

/**
 * Create a resource-managed interval
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {Function} callback - The callback function
 * @param {number} interval - The interval in milliseconds
 * @returns {number|null} Interval ID or null if registration failed
 */
export function createManagedInterval(resourceManager, name, callback, interval) {
  const intervalId = setInterval(callback, interval);
  const success = registerInterval(resourceManager, name, intervalId);
  
  if (!success) {
    clearInterval(intervalId);
    return null;
  }
  
  return intervalId;
}

/**
 * Create a resource-managed animation frame request
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {Function} callback - The callback function
 * @returns {number|null} Frame ID or null if registration failed
 */
export function createManagedAnimationFrame(resourceManager, name, callback) {
  const frameId = requestAnimationFrame(callback);
  const success = registerAnimationFrame(resourceManager, name, frameId);
  
  if (!success) {
    cancelAnimationFrame(frameId);
    return null;
  }
  
  return frameId;
}

/**
 * Add a resource-managed event listener
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {string} name - Resource name
 * @param {EventTarget} target - The event target
 * @param {string} event - The event type
 * @param {Function} listener - The event listener function
 * @param {Object} options - Event listener options
 * @returns {boolean} Success status
 */
export function addManagedEventListener(resourceManager, name, target, event, listener, options = {}) {
  target.addEventListener(event, listener, options);
  const success = registerEventListener(resourceManager, name, target, event, listener, options);
  
  if (!success) {
    target.removeEventListener(event, listener, options);
    return false;
  }
  
  return true;
}

/**
 * Batch register multiple resources
 * @param {ResourceManager} resourceManager - The resource manager instance
 * @param {Array} resources - Array of resource definitions
 * @returns {Object} Results with success count and errors
 */
export function batchRegisterResources(resourceManager, resources) {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const resourceDef of resources) {
    try {
      const { name, resource, cleanupFn, options } = resourceDef;
      const success = resourceManager.register(name, resource, cleanupFn, options);
      
      if (success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`Failed to register resource: ${name}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error registering resource: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Create a scoped resource manager that automatically cleans up
 * @param {ResourceManager} parentManager - The parent resource manager
 * @param {string} scopeName - Name for the scope
 * @returns {Object} Scoped manager with cleanup function
 */
export function createResourceScope(parentManager, scopeName) {
  const scopedResources = new Set();
  
  const scopedManager = {
    register(name, resource, cleanupFn, options = {}) {
      const scopedName = `${scopeName}:${name}`;
      const success = parentManager.register(scopedName, resource, cleanupFn, options);
      
      if (success) {
        scopedResources.add(scopedName);
      }
      
      return success;
    },
    
    unregister(name) {
      const scopedName = `${scopeName}:${name}`;
      const success = parentManager.unregister(scopedName);
      
      if (success) {
        scopedResources.delete(scopedName);
      }
      
      return success;
    },
    
    cleanup() {
      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };
      
      for (const resourceName of scopedResources) {
        const success = parentManager.unregister(resourceName);
        
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to cleanup: ${resourceName}`);
        }
      }
      
      scopedResources.clear();
      return results;
    },
    
    getResourceCount() {
      return scopedResources.size;
    }
  };
  
  return scopedManager;
}

export default {
  registerAudioContext,
  registerCanvasContext,
  registerTimer,
  registerInterval,
  registerAnimationFrame,
  registerEventListener,
  registerMediaStream,
  registerWorker,
  registerObjectPool,
  createManagedTimeout,
  createManagedInterval,
  createManagedAnimationFrame,
  addManagedEventListener,
  batchRegisterResources,
  createResourceScope
};