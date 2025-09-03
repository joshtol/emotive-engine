import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ResourceManager from '../src/core/ResourceManager.js';

describe('ResourceManager', () => {
  let resourceManager;
  let mockResource;
  let mockCleanupFn;

  beforeEach(() => {
    resourceManager = new ResourceManager({
      enableLogging: false, // Disable logging for tests
      enableLeakDetection: false // Disable for most tests
    });
    
    mockResource = { id: 'test', active: true };
    mockCleanupFn = vi.fn();
  });

  afterEach(() => {
    if (resourceManager && !resourceManager.isDestroyed) {
      resourceManager.destroy();
    }
  });

  describe('Resource Registration', () => {
    it('should register a resource successfully', () => {
      const result = resourceManager.register('test-resource', mockResource, mockCleanupFn);
      
      expect(result).toBe(true);
      expect(resourceManager.getResourceCount()).toBe(1);
    });

    it('should require a valid name', () => {
      expect(resourceManager.register('', mockResource, mockCleanupFn)).toBe(false);
      expect(resourceManager.register(null, mockResource, mockCleanupFn)).toBe(false);
      expect(resourceManager.register(123, mockResource, mockCleanupFn)).toBe(false);
    });

    it('should require a cleanup function', () => {
      expect(resourceManager.register('test', mockResource, null)).toBe(false);
      expect(resourceManager.register('test', mockResource, 'not-a-function')).toBe(false);
    });

    it('should handle duplicate registration by replacing', () => {
      const firstCleanup = vi.fn();
      const secondCleanup = vi.fn();
      
      resourceManager.register('duplicate', mockResource, firstCleanup);
      resourceManager.register('duplicate', mockResource, secondCleanup);
      
      expect(resourceManager.getResourceCount()).toBe(1);
      expect(firstCleanup).toHaveBeenCalled();
    });

    it('should respect resource limits', () => {
      const limitedManager = new ResourceManager({ maxResources: 2, enableLogging: false });
      
      expect(limitedManager.register('res1', {}, vi.fn())).toBe(true);
      expect(limitedManager.register('res2', {}, vi.fn())).toBe(true);
      expect(limitedManager.register('res3', {}, vi.fn())).toBe(false);
      
      limitedManager.destroy();
    });

    it('should store resource metadata', () => {
      const metadata = { category: 'audio', priority: 'high' };
      resourceManager.register('test', mockResource, mockCleanupFn, {
        type: 'audioContext',
        metadata
      });
      
      const info = resourceManager.getResourceInfo();
      expect(info[0].type).toBe('audioContext');
      expect(info[0].metadata).toEqual(metadata);
    });
  });

  describe('Resource Unregistration', () => {
    beforeEach(() => {
      resourceManager.register('test-resource', mockResource, mockCleanupFn);
    });

    it('should unregister a resource successfully', () => {
      const result = resourceManager.unregister('test-resource');
      
      expect(result).toBe(true);
      expect(mockCleanupFn).toHaveBeenCalledWith(mockResource);
      expect(resourceManager.getResourceCount()).toBe(0);
    });

    it('should handle unregistering non-existent resource', () => {
      const result = resourceManager.unregister('non-existent');
      
      expect(result).toBe(false);
    });

    it('should handle cleanup function errors', () => {
      const errorCleanup = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup failed');
      });
      
      resourceManager.register('error-resource', {}, errorCleanup);
      const result = resourceManager.unregister('error-resource');
      
      expect(result).toBe(false);
      expect(errorCleanup).toHaveBeenCalled();
      expect(resourceManager.getResourceCount()).toBe(1); // Original resource still there
    });
  });

  describe('Cleanup Tasks', () => {
    it('should add and execute cleanup tasks', () => {
      const task1 = vi.fn();
      const task2 = vi.fn();
      
      resourceManager.addCleanupTask(task1, 20);
      resourceManager.addCleanupTask(task2, 10);
      
      const results = resourceManager.cleanup();
      
      expect(results.tasksExecuted).toBe(2);
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
    });

    it('should execute tasks in priority order', () => {
      const executionOrder = [];
      const task1 = vi.fn(() => executionOrder.push('task1'));
      const task2 = vi.fn(() => executionOrder.push('task2'));
      const task3 = vi.fn(() => executionOrder.push('task3'));
      
      resourceManager.addCleanupTask(task1, 10);
      resourceManager.addCleanupTask(task2, 30);
      resourceManager.addCleanupTask(task3, 20);
      
      resourceManager.cleanup();
      
      expect(executionOrder).toEqual(['task2', 'task3', 'task1']);
    });

    it('should handle task errors gracefully', () => {
      const errorTask = vi.fn().mockImplementation(() => {
        throw new Error('Task failed');
      });
      const normalTask = vi.fn();
      
      resourceManager.addCleanupTask(errorTask);
      resourceManager.addCleanupTask(normalTask);
      
      const results = resourceManager.cleanup();
      
      expect(results.tasksExecuted).toBe(1);
      expect(results.errors).toHaveLength(1);
      expect(normalTask).toHaveBeenCalled();
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      resourceManager.register('resource1', {}, vi.fn(), { type: 'timer', priority: 100 });
      resourceManager.register('resource2', {}, vi.fn(), { type: 'audioContext', priority: 70 });
      resourceManager.register('resource3', {}, vi.fn(), { type: 'default', priority: 10 });
    });

    it('should clean up all resources', () => {
      const results = resourceManager.cleanup();
      
      expect(results.success).toBe(true);
      expect(results.resourcesCleanedUp).toBe(3);
      expect(resourceManager.getResourceCount()).toBe(0);
    });

    it('should clean up resources in priority order', () => {
      const cleanupOrder = [];
      
      // Replace cleanup functions to track order
      const resources = resourceManager.getResourceInfo();
      resourceManager.resources.get('resource1').cleanupFn = () => cleanupOrder.push('timer');
      resourceManager.resources.get('resource2').cleanupFn = () => cleanupOrder.push('audioContext');
      resourceManager.resources.get('resource3').cleanupFn = () => cleanupOrder.push('default');
      
      resourceManager.cleanup();
      
      expect(cleanupOrder).toEqual(['timer', 'audioContext', 'default']);
    });

    it('should handle cleanup errors', () => {
      const errorCleanup = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup failed');
      });
      
      resourceManager.register('error-resource', {}, errorCleanup);
      const results = resourceManager.cleanup();
      
      expect(results.success).toBe(false);
      expect(results.errors).toHaveLength(1);
      expect(results.resourcesCleanedUp).toBe(3); // Other resources still cleaned up
    });
  });

  describe('Resource Monitoring', () => {
    it('should track resource counts by type', () => {
      resourceManager.register('timer1', {}, vi.fn(), { type: 'timer' });
      resourceManager.register('timer2', {}, vi.fn(), { type: 'timer' });
      resourceManager.register('audio1', {}, vi.fn(), { type: 'audioContext' });
      
      const counts = resourceManager.getResourceCountsByType();
      
      expect(counts.timer).toBe(2);
      expect(counts.audioContext).toBe(1);
    });

    it('should provide detailed resource information', () => {
      const startTime = Date.now();
      resourceManager.register('test', mockResource, mockCleanupFn, {
        type: 'timer',
        metadata: { interval: 1000 }
      });
      
      const info = resourceManager.getResourceInfo();
      
      expect(info).toHaveLength(1);
      expect(info[0].name).toBe('test');
      expect(info[0].type).toBe('timer');
      expect(info[0].registeredAt).toBeGreaterThanOrEqual(startTime);
      expect(info[0].age).toBeGreaterThanOrEqual(0);
      expect(info[0].metadata).toEqual({ interval: 1000 });
    });

    it('should generate usage reports', () => {
      resourceManager.register('test', mockResource, mockCleanupFn);
      
      const report = resourceManager.getUsageReport();
      
      expect(report.totalResources).toBe(1);
      expect(report.validation).toBeDefined();
      expect(report.leakDetection).toBeDefined();
      expect(report.isDestroyed).toBe(false);
    });
  });

  describe('Resource Validation', () => {
    it('should validate healthy resources', () => {
      resourceManager.register('healthy', { active: true }, vi.fn());
      
      const validation = resourceManager.validateResources();
      
      expect(validation.valid).toBe(1);
      expect(validation.invalid).toBe(0);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect null/undefined resources', () => {
      resourceManager.register('null-resource', null, vi.fn());
      resourceManager.register('undefined-resource', undefined, vi.fn());
      
      const validation = resourceManager.validateResources();
      
      expect(validation.valid).toBe(0);
      expect(validation.invalid).toBe(2);
      expect(validation.errors).toHaveLength(2);
    });

    it('should validate audio context state', () => {
      const closedAudioContext = { state: 'closed' };
      const activeAudioContext = { state: 'running' };
      
      resourceManager.register('closed-audio', closedAudioContext, vi.fn(), { type: 'audioContext' });
      resourceManager.register('active-audio', activeAudioContext, vi.fn(), { type: 'audioContext' });
      
      const validation = resourceManager.validateResources();
      
      expect(validation.valid).toBe(1);
      expect(validation.invalid).toBe(1);
    });

    it('should validate canvas context', () => {
      const invalidCanvas = {};
      const validCanvas = { canvas: document.createElement('canvas') };
      
      resourceManager.register('invalid-canvas', invalidCanvas, vi.fn(), { type: 'canvasContext' });
      resourceManager.register('valid-canvas', validCanvas, vi.fn(), { type: 'canvasContext' });
      
      const validation = resourceManager.validateResources();
      
      expect(validation.valid).toBe(1);
      expect(validation.invalid).toBe(1);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect old resources', () => {
      // Create a resource with old timestamp
      const oldResource = {
        name: 'old-resource',
        resource: {},
        cleanupFn: vi.fn(),
        type: 'default',
        priority: 10,
        registeredAt: Date.now() - 7200000, // 2 hours ago
        metadata: {}
      };
      
      resourceManager.resources.set('old-resource', oldResource);
      
      const leaks = resourceManager.detectLeaks();
      
      expect(leaks.potentialLeaks).toHaveLength(1);
      expect(leaks.potentialLeaks[0].name).toBe('old-resource');
    });

    it('should track resource growth', () => {
      // Simulate resource history
      const now = Date.now();
      resourceManager.resourceHistory = [
        { timestamp: now - 300000, count: 5 }, // 5 minutes ago
        { timestamp: now - 240000, count: 8 },
        { timestamp: now - 180000, count: 12 },
        { timestamp: now - 120000, count: 15 },
        { timestamp: now - 60000, count: 18 }
      ];
      
      // Add current resources to simulate growth
      for (let i = 0; i < 25; i++) {
        resourceManager.register(`resource-${i}`, {}, vi.fn());
      }
      
      const leaks = resourceManager.detectLeaks();
      
      expect(leaks.resourceGrowth).toBe(20); // 25 - 5
      expect(leaks.recommendations).toContain('Resource count has grown significantly - check for proper cleanup');
    });

    it('should clean old history entries', () => {
      const now = Date.now();
      resourceManager.resourceHistory = [
        { timestamp: now - 700000, count: 5 }, // 11+ minutes ago (should be removed)
        { timestamp: now - 300000, count: 8 }, // 5 minutes ago (should be kept)
      ];
      
      resourceManager.detectLeaks();
      
      expect(resourceManager.resourceHistory).toHaveLength(2); // Current + 5min ago
    });
  });

  describe('Lifecycle Management', () => {
    it('should prevent operations after destruction', () => {
      resourceManager.destroy();
      
      const result = resourceManager.register('test', {}, vi.fn());
      
      expect(result).toBe(false);
      expect(resourceManager.isDestroyed).toBe(true);
    });

    it('should handle multiple destroy calls', () => {
      const firstResult = resourceManager.destroy();
      const secondResult = resourceManager.destroy();
      
      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(true);
      expect(secondResult.message).toBe('Already destroyed');
    });

    it('should stop leak detection on destroy', () => {
      const leakDetectionManager = new ResourceManager({
        enableLeakDetection: true,
        leakDetectionInterval: 100,
        enableLogging: false
      });
      
      expect(leakDetectionManager.leakDetectionTimer).toBeDefined();
      
      leakDetectionManager.destroy();
      
      expect(leakDetectionManager.leakDetectionTimer).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const defaultManager = new ResourceManager();
      
      expect(defaultManager.config.maxResources).toBe(1000);
      expect(defaultManager.config.enableLeakDetection).toBe(true);
      expect(defaultManager.config.enableLogging).toBe(true);
      
      defaultManager.destroy();
    });

    it('should accept custom configuration', () => {
      const customManager = new ResourceManager({
        maxResources: 500,
        leakDetectionInterval: 60000,
        enableLeakDetection: false,
        enableLogging: false
      });
      
      expect(customManager.config.maxResources).toBe(500);
      expect(customManager.config.leakDetectionInterval).toBe(60000);
      expect(customManager.config.enableLeakDetection).toBe(false);
      
      customManager.destroy();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      // Create a resource that will throw during validation
      const problematicResource = {
        get canvas() {
          throw new Error('Property access failed');
        }
      };
      
      resourceManager.register('problematic', problematicResource, vi.fn(), { type: 'canvasContext' });
      
      const validation = resourceManager.validateResources();
      
      expect(validation.invalid).toBe(1);
      expect(validation.errors[0]).toContain('Validation error');
    });

    it('should handle missing console gracefully', () => {
      const originalConsole = global.console;
      delete global.console;
      
      const manager = new ResourceManager({ enableLogging: true });
      manager.log('info', 'Test message'); // Should not throw
      
      global.console = originalConsole;
      manager.destroy();
    });
  });

  describe('Memory Management', () => {
    it('should attempt garbage collection when available', () => {
      const mockGC = vi.fn();
      global.window = { gc: mockGC };
      
      resourceManager.forceGarbageCollection();
      
      expect(mockGC).toHaveBeenCalled();
      
      delete global.window;
    });

    it('should handle missing garbage collection', () => {
      // Ensure no window.gc
      delete global.window;
      
      // Should not throw
      expect(() => resourceManager.forceGarbageCollection()).not.toThrow();
    });

    it('should get memory usage when available', () => {
      global.performance = {
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000
        }
      };
      
      const usage = resourceManager.getMemoryUsage();
      
      expect(usage.used).toBe(1000000);
      expect(usage.total).toBe(2000000);
      expect(usage.limit).toBe(4000000);
      
      delete global.performance;
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex resource lifecycle', () => {
      // Register various resource types
      const audioContext = { state: 'running', close: vi.fn() };
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      const timer = setInterval(() => {}, 1000);
      
      resourceManager.register('audio', audioContext, (ctx) => ctx.close(), { type: 'audioContext' });
      resourceManager.register('canvas', canvasContext, () => {}, { type: 'canvasContext' });
      resourceManager.register('timer', timer, (id) => clearInterval(id), { type: 'timer' });
      
      // Add cleanup task
      const cleanupTask = vi.fn();
      resourceManager.addCleanupTask(cleanupTask, 50);
      
      // Validate everything is registered
      expect(resourceManager.getResourceCount()).toBe(3);
      
      // Generate report
      const report = resourceManager.getUsageReport();
      expect(report.totalResources).toBe(3);
      expect(report.resourcesByType.audioContext).toBe(1);
      expect(report.resourcesByType.canvasContext).toBe(1);
      expect(report.resourcesByType.timer).toBe(1);
      
      // Cleanup everything
      const results = resourceManager.cleanup();
      expect(results.success).toBe(true);
      expect(results.resourcesCleanedUp).toBe(3);
      expect(results.tasksExecuted).toBe(1);
      expect(cleanupTask).toHaveBeenCalled();
      expect(audioContext.close).toHaveBeenCalled();
    });

    it('should handle resource registration during cleanup', () => {
      // This tests edge case where cleanup function tries to register new resources
      const problematicCleanup = vi.fn(() => {
        resourceManager.register('new-resource', {}, vi.fn());
      });
      
      resourceManager.register('problematic', {}, problematicCleanup);
      resourceManager.destroy();
      
      expect(problematicCleanup).toHaveBeenCalled();
      expect(resourceManager.getResourceCount()).toBe(0); // Should not register during destruction
    });
  });
});