import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ResourceManager from '../src/core/ResourceManager.js';
import {
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
} from '../src/core/ResourceHelpers.js';

describe('ResourceHelpers', () => {
  let resourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager({ enableLogging: false });
  });

  afterEach(() => {
    if (resourceManager && !resourceManager.isDestroyed) {
      resourceManager.destroy();
    }
  });

  describe('Audio Context Registration', () => {
    it('should register audio context with proper cleanup', () => {
      const mockAudioContext = {
        state: 'running',
        close: vi.fn()
      };

      const result = registerAudioContext(resourceManager, 'test-audio', mockAudioContext);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      // Test cleanup
      resourceManager.cleanup();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle already closed audio context', () => {
      const mockAudioContext = {
        state: 'closed',
        close: vi.fn()
      };

      registerAudioContext(resourceManager, 'test-audio', mockAudioContext);
      resourceManager.cleanup();

      expect(mockAudioContext.close).not.toHaveBeenCalled();
    });

    it('should handle audio context close errors', () => {
      const mockAudioContext = {
        state: 'running',
        close: vi.fn().mockImplementation(() => {
          throw new Error('Close failed');
        })
      };

      registerAudioContext(resourceManager, 'test-audio', mockAudioContext);
      
      // Should not throw
      expect(() => resourceManager.cleanup()).not.toThrow();
    });
  });

  describe('Canvas Context Registration', () => {
    it('should register 2D canvas context with proper cleanup', () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        canvas: mockCanvas,
        clearRect: vi.fn()
      };

      const result = registerCanvasContext(resourceManager, 'test-canvas', mockContext);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      // Test cleanup
      resourceManager.cleanup();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    it('should register WebGL context with proper cleanup', () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        canvas: mockCanvas,
        clear: vi.fn(),
        COLOR_BUFFER_BIT: 16384,
        DEPTH_BUFFER_BIT: 256
      };

      registerCanvasContext(resourceManager, 'test-webgl', mockContext);
      resourceManager.cleanup();

      expect(mockContext.clear).toHaveBeenCalledWith(16384 | 256);
    });

    it('should remove canvas from DOM during cleanup', () => {
      const mockParent = document.createElement('div');
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        canvas: mockCanvas,
        clearRect: vi.fn()
      };

      mockParent.appendChild(mockCanvas);
      expect(mockCanvas.parentNode).toBe(mockParent);

      registerCanvasContext(resourceManager, 'test-canvas', mockContext);
      resourceManager.cleanup();

      expect(mockCanvas.parentNode).toBeNull();
    });
  });

  describe('Timer Registration', () => {
    it('should register and cleanup timer', () => {
      const timerId = 12345;
      global.clearTimeout = vi.fn();

      const result = registerTimer(resourceManager, 'test-timer', timerId);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.clearTimeout).toHaveBeenCalledWith(timerId);
    });

    it('should handle null timer ID', () => {
      global.clearTimeout = vi.fn();

      registerTimer(resourceManager, 'test-timer', null);
      resourceManager.cleanup();

      expect(global.clearTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Interval Registration', () => {
    it('should register and cleanup interval', () => {
      const intervalId = 54321;
      global.clearInterval = vi.fn();

      const result = registerInterval(resourceManager, 'test-interval', intervalId);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.clearInterval).toHaveBeenCalledWith(intervalId);
    });
  });

  describe('Animation Frame Registration', () => {
    it('should register and cleanup animation frame', () => {
      const frameId = 98765;
      global.cancelAnimationFrame = vi.fn();

      const result = registerAnimationFrame(resourceManager, 'test-frame', frameId);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(frameId);
    });
  });

  describe('Event Listener Registration', () => {
    it('should register and cleanup event listener', () => {
      const mockTarget = {
        removeEventListener: vi.fn()
      };
      const mockListener = vi.fn();
      const options = { passive: true };

      const result = registerEventListener(
        resourceManager,
        'test-listener',
        mockTarget,
        'click',
        mockListener,
        options
      );

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('click', mockListener, options);
    });

    it('should handle event listener removal errors', () => {
      const mockTarget = {
        removeEventListener: vi.fn().mockImplementation(() => {
          throw new Error('Remove failed');
        })
      };

      registerEventListener(resourceManager, 'test-listener', mockTarget, 'click', vi.fn());
      
      // Should not throw
      expect(() => resourceManager.cleanup()).not.toThrow();
    });
  });

  describe('Media Stream Registration', () => {
    it('should register and cleanup media stream', () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([mockTrack1, mockTrack2])
      };

      const result = registerMediaStream(resourceManager, 'test-stream', mockStream);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });

    it('should handle media stream cleanup errors', () => {
      const mockStream = {
        getTracks: vi.fn().mockImplementation(() => {
          throw new Error('getTracks failed');
        })
      };

      registerMediaStream(resourceManager, 'test-stream', mockStream);
      
      // Should not throw
      expect(() => resourceManager.cleanup()).not.toThrow();
    });
  });

  describe('Worker Registration', () => {
    it('should register and cleanup worker', () => {
      const mockWorker = {
        terminate: vi.fn()
      };

      const result = registerWorker(resourceManager, 'test-worker', mockWorker);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should handle worker termination errors', () => {
      const mockWorker = {
        terminate: vi.fn().mockImplementation(() => {
          throw new Error('Terminate failed');
        })
      };

      registerWorker(resourceManager, 'test-worker', mockWorker);
      
      // Should not throw
      expect(() => resourceManager.cleanup()).not.toThrow();
    });
  });

  describe('Object Pool Registration', () => {
    it('should register and cleanup object pool with cleanup method', () => {
      const mockPool = {
        cleanup: vi.fn()
      };

      const result = registerObjectPool(resourceManager, 'test-pool', mockPool);

      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(mockPool.cleanup).toHaveBeenCalled();
    });

    it('should try alternative cleanup methods', () => {
      const mockPool1 = { clear: vi.fn() };
      const mockPool2 = { reset: vi.fn() };
      const mockPool3 = { destroy: vi.fn() };

      registerObjectPool(resourceManager, 'pool1', mockPool1);
      registerObjectPool(resourceManager, 'pool2', mockPool2);
      registerObjectPool(resourceManager, 'pool3', mockPool3);

      resourceManager.cleanup();

      expect(mockPool1.clear).toHaveBeenCalled();
      expect(mockPool2.reset).toHaveBeenCalled();
      expect(mockPool3.destroy).toHaveBeenCalled();
    });
  });

  describe('Managed Resource Creation', () => {
    it('should create managed timeout', () => {
      global.setTimeout = vi.fn().mockReturnValue(123);
      global.clearTimeout = vi.fn();
      const callback = vi.fn();

      const timerId = createManagedTimeout(resourceManager, 'test-timeout', callback, 1000);

      expect(timerId).toBe(123);
      expect(global.setTimeout).toHaveBeenCalledWith(callback, 1000);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
    });

    it('should handle timeout registration failure', () => {
      global.setTimeout = vi.fn().mockReturnValue(123);
      global.clearTimeout = vi.fn();
      
      // Fill up resource manager to cause registration failure
      const limitedManager = new ResourceManager({ maxResources: 0, enableLogging: false });
      
      const timerId = createManagedTimeout(limitedManager, 'test-timeout', vi.fn(), 1000);

      expect(timerId).toBeNull();
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
      
      limitedManager.destroy();
    });

    it('should create managed interval', () => {
      global.setInterval = vi.fn().mockReturnValue(456);
      global.clearInterval = vi.fn();
      const callback = vi.fn();

      const intervalId = createManagedInterval(resourceManager, 'test-interval', callback, 500);

      expect(intervalId).toBe(456);
      expect(global.setInterval).toHaveBeenCalledWith(callback, 500);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.clearInterval).toHaveBeenCalledWith(456);
    });

    it('should create managed animation frame', () => {
      global.requestAnimationFrame = vi.fn().mockReturnValue(789);
      global.cancelAnimationFrame = vi.fn();
      const callback = vi.fn();

      const frameId = createManagedAnimationFrame(resourceManager, 'test-frame', callback);

      expect(frameId).toBe(789);
      expect(global.requestAnimationFrame).toHaveBeenCalledWith(callback);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(789);
    });

    it('should add managed event listener', () => {
      const mockTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
      const callback = vi.fn();
      const options = { once: true };

      const result = addManagedEventListener(
        resourceManager,
        'test-listener',
        mockTarget,
        'resize',
        callback,
        options
      );

      expect(result).toBe(true);
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('resize', callback, options);
      expect(resourceManager.getResourceCount()).toBe(1);

      resourceManager.cleanup();
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('resize', callback, options);
    });

    it('should handle event listener registration failure', () => {
      const mockTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
      
      // Fill up resource manager
      const limitedManager = new ResourceManager({ maxResources: 0, enableLogging: false });
      
      const result = addManagedEventListener(
        limitedManager,
        'test-listener',
        mockTarget,
        'click',
        vi.fn()
      );

      expect(result).toBe(false);
      expect(mockTarget.removeEventListener).toHaveBeenCalled();
      
      limitedManager.destroy();
    });
  });

  describe('Batch Registration', () => {
    it('should batch register multiple resources', () => {
      const resources = [
        {
          name: 'resource1',
          resource: { id: 1 },
          cleanupFn: vi.fn(),
          options: { type: 'test' }
        },
        {
          name: 'resource2',
          resource: { id: 2 },
          cleanupFn: vi.fn(),
          options: { type: 'test' }
        },
        {
          name: 'resource3',
          resource: { id: 3 },
          cleanupFn: vi.fn(),
          options: { type: 'test' }
        }
      ];

      const results = batchRegisterResources(resourceManager, resources);

      expect(results.successful).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.errors).toHaveLength(0);
      expect(resourceManager.getResourceCount()).toBe(3);
    });

    it('should handle batch registration errors', () => {
      const resources = [
        {
          name: 'valid',
          resource: {},
          cleanupFn: vi.fn()
        },
        {
          name: '', // Invalid name
          resource: {},
          cleanupFn: vi.fn()
        },
        {
          name: 'no-cleanup',
          resource: {},
          cleanupFn: null // Invalid cleanup function
        }
      ];

      const results = batchRegisterResources(resourceManager, resources);

      expect(results.successful).toBe(1);
      expect(results.failed).toBe(2);
      expect(results.errors).toHaveLength(2);
    });
  });

  describe('Resource Scope', () => {
    it('should create scoped resource manager', () => {
      const scope = createResourceScope(resourceManager, 'test-scope');

      expect(scope.register).toBeDefined();
      expect(scope.unregister).toBeDefined();
      expect(scope.cleanup).toBeDefined();
      expect(scope.getResourceCount).toBeDefined();
    });

    it('should register resources with scoped names', () => {
      const scope = createResourceScope(resourceManager, 'test-scope');
      
      const result = scope.register('resource1', {}, vi.fn());

      expect(result).toBe(true);
      expect(scope.getResourceCount()).toBe(1);
      expect(resourceManager.getResourceCount()).toBe(1);

      // Check that the resource is registered with scoped name
      const info = resourceManager.getResourceInfo();
      expect(info[0].name).toBe('test-scope:resource1');
    });

    it('should unregister scoped resources', () => {
      const scope = createResourceScope(resourceManager, 'test-scope');
      const cleanupFn = vi.fn();
      
      scope.register('resource1', {}, cleanupFn);
      expect(scope.getResourceCount()).toBe(1);

      const result = scope.unregister('resource1');

      expect(result).toBe(true);
      expect(scope.getResourceCount()).toBe(0);
      expect(resourceManager.getResourceCount()).toBe(0);
      expect(cleanupFn).toHaveBeenCalled();
    });

    it('should cleanup all scoped resources', () => {
      const scope = createResourceScope(resourceManager, 'test-scope');
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();
      
      scope.register('resource1', {}, cleanup1);
      scope.register('resource2', {}, cleanup2);
      expect(scope.getResourceCount()).toBe(2);

      const results = scope.cleanup();

      expect(results.successful).toBe(2);
      expect(results.failed).toBe(0);
      expect(scope.getResourceCount()).toBe(0);
      expect(resourceManager.getResourceCount()).toBe(0);
      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should handle scoped cleanup errors', () => {
      const scope = createResourceScope(resourceManager, 'test-scope');
      
      // Register a resource that will fail cleanup
      scope.register('failing-resource', {}, () => {
        throw new Error('Cleanup failed');
      });

      const results = scope.cleanup();

      expect(results.successful).toBe(0);
      expect(results.failed).toBe(1);
      expect(results.errors).toHaveLength(1);
      expect(scope.getResourceCount()).toBe(0); // Should still clear the scope
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex resource management scenario', () => {
      // Create various resource types
      const audioContext = { state: 'running', close: vi.fn() };
      const canvas = document.createElement('canvas');
      const canvasContext = { canvas, clearRect: vi.fn() };
      const eventTarget = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
      
      global.setTimeout = vi.fn().mockReturnValue(123);
      global.clearTimeout = vi.fn();
      global.setInterval = vi.fn().mockReturnValue(456);
      global.clearInterval = vi.fn();

      // Register resources using helpers
      registerAudioContext(resourceManager, 'audio', audioContext);
      registerCanvasContext(resourceManager, 'canvas', canvasContext);
      
      const timerId = createManagedTimeout(resourceManager, 'timer', vi.fn(), 1000);
      const intervalId = createManagedInterval(resourceManager, 'interval', vi.fn(), 500);
      
      addManagedEventListener(resourceManager, 'listener', eventTarget, 'click', vi.fn());

      // Verify all resources are registered
      expect(resourceManager.getResourceCount()).toBe(5);

      // Get usage report
      const report = resourceManager.getUsageReport();
      expect(report.totalResources).toBe(5);
      expect(report.resourcesByType.audioContext).toBe(1);
      expect(report.resourcesByType.canvasContext).toBe(1);
      expect(report.resourcesByType.timer).toBe(1);
      expect(report.resourcesByType.interval).toBe(1);
      expect(report.resourcesByType.eventListener).toBe(1);

      // Cleanup everything
      const results = resourceManager.cleanup();
      expect(results.success).toBe(true);
      expect(results.resourcesCleanedUp).toBe(5);

      // Verify all cleanup functions were called
      expect(audioContext.close).toHaveBeenCalled();
      expect(canvasContext.clearRect).toHaveBeenCalled();
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
      expect(global.clearInterval).toHaveBeenCalledWith(456);
      expect(eventTarget.removeEventListener).toHaveBeenCalled();
    });

    it('should work with scoped resources and batch registration', () => {
      const scope = createResourceScope(resourceManager, 'batch-scope');
      
      const resources = [
        { name: 'res1', resource: {}, cleanupFn: vi.fn() },
        { name: 'res2', resource: {}, cleanupFn: vi.fn() },
        { name: 'res3', resource: {}, cleanupFn: vi.fn() }
      ];

      // Register some resources directly
      resources.forEach((res, index) => {
        scope.register(`direct-${index}`, res.resource, res.cleanupFn);
      });

      // Register some resources via batch
      const batchResults = batchRegisterResources(resourceManager, resources);

      expect(batchResults.successful).toBe(3);
      expect(scope.getResourceCount()).toBe(3);
      expect(resourceManager.getResourceCount()).toBe(6); // 3 scoped + 3 batch

      // Cleanup scope only
      const scopeResults = scope.cleanup();
      expect(scopeResults.successful).toBe(3);
      expect(resourceManager.getResourceCount()).toBe(3); // Only batch resources remain

      // Cleanup everything else
      const finalResults = resourceManager.cleanup();
      expect(finalResults.resourcesCleanedUp).toBe(3);
    });
  });
});