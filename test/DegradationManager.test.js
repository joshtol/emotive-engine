/**
 * Tests for DegradationManager
 * Validates graceful degradation, manual controls, and progressive enhancement
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DegradationManager } from '../src/core/DegradationManager.js';
import { ErrorTypes } from '../src/core/ErrorResponse.js';

// Mock browser compatibility
vi.mock('../src/utils/browserCompatibility.js', () => ({
  browserCompatibility: {
    featureDetection: {
      getFeatures: () => ({
        webAudio: true,
        audioContext: true,
        canvas2d: true,
        requestAnimationFrame: true,
        performance: true
      })
    },
    capabilities: {
      level: 'full'
    },
    browserOptimizations: {
      getOptimizations: () => ({
        particleLimit: 50
      })
    }
  }
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now()
  }
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('DegradationManager', () => {
  let degradationManager;
  let eventCallback;

  beforeEach(() => {
    eventCallback = vi.fn();
    degradationManager = new DegradationManager({
      enableAutoOptimization: true,
      enableManualControls: true,
      enableProgressiveEnhancement: true
    });
    degradationManager.setEventCallback(eventCallback);
  });

  afterEach(() => {
    degradationManager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with optimal level', () => {
      const currentLevel = degradationManager.getCurrentLevel();
      
      expect(currentLevel.name).toBe('optimal');
      expect(currentLevel.particleLimit).toBe(50);
      expect(currentLevel.audioEnabled).toBe(true);
    });

    it('should assess available features', () => {
      const features = degradationManager.getAvailableFeatures();
      
      expect(features.audio).toBe(true);
      expect(features.particles).toBe(true);
      expect(features.animations).toBe(true);
    });

    it('should initialize with correct configuration', () => {
      expect(degradationManager.config.enableAutoOptimization).toBe(true);
      expect(degradationManager.config.enableManualControls).toBe(true);
      expect(degradationManager.config.enableProgressiveEnhancement).toBe(true);
    });
  });

  describe('Degradation Levels', () => {
    it('should have all degradation levels defined', () => {
      const levels = degradationManager.getAllLevels();
      
      expect(levels).toHaveLength(4);
      expect(levels[0].name).toBe('optimal');
      expect(levels[1].name).toBe('reduced');
      expect(levels[2].name).toBe('minimal');
      expect(levels[3].name).toBe('emergency');
    });

    it('should manually set degradation level by name', () => {
      const result = degradationManager.setLevel('minimal');
      
      expect(result).toBe(true);
      expect(degradationManager.getCurrentLevel().name).toBe('minimal');
      expect(eventCallback).toHaveBeenCalledWith('levelChanged', expect.any(Object));
    });

    it('should manually set degradation level by index', () => {
      const result = degradationManager.setLevel(2);
      
      expect(result).toBe(true);
      expect(degradationManager.getCurrentLevel().name).toBe('minimal');
    });

    it('should reject invalid degradation level', () => {
      const result = degradationManager.setLevel('invalid');
      
      expect(result).toBe(false);
      expect(degradationManager.getCurrentLevel().name).toBe('optimal');
    });
  });

  describe('Performance Monitoring', () => {
    it('should start and stop monitoring', () => {
      degradationManager.startMonitoring();
      expect(degradationManager.isMonitoring).toBe(true);
      
      degradationManager.stopMonitoring();
      expect(degradationManager.isMonitoring).toBe(false);
    });

    it('should apply degradation on poor performance', () => {
      degradationManager.startMonitoring();
      
      // Simulate poor performance
      for (let i = 0; i < 10; i++) {
        degradationManager.checkPerformance({ fps: 20, memoryUsage: 60 });
      }
      
      // Should degrade from optimal
      expect(degradationManager.getCurrentLevel().name).not.toBe('optimal');
    });

    it('should track performance history', () => {
      degradationManager.checkPerformance({ fps: 60, memoryUsage: 30 });
      degradationManager.checkPerformance({ fps: 55, memoryUsage: 35 });
      
      const stats = degradationManager.getPerformanceStats();
      
      expect(stats.samples).toBe(2);
      expect(stats.avgFPS).toBeGreaterThan(50);
    });

    it('should handle performance check with error handling', () => {
      const result = degradationManager.checkPerformanceEnhanced({ fps: 60 });
      
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Performance check completed');
    });
  });

  describe('Feature Management', () => {
    it('should check feature availability', () => {
      expect(degradationManager.isFeatureAvailable('audio')).toBe(true);
      expect(degradationManager.isFeatureAvailable('particles')).toBe(true);
      
      // Set to minimal level where audio is disabled
      degradationManager.setLevel('minimal');
      expect(degradationManager.isFeatureAvailable('audio')).toBe(false);
    });

    it('should get recommended settings', () => {
      const settings = degradationManager.getRecommendedSettings();
      
      expect(settings.maxParticles).toBe(50);
      expect(settings.enableAudio).toBe(true);
      expect(settings.targetFPS).toBe(60);
    });

    it('should provide feature availability report', () => {
      const report = degradationManager.getFeatureAvailabilityReport();
      
      expect(report.currentLevel).toBe('optimal');
      expect(report.availableFeatures.audio.available).toBe(true);
      expect(report.browserCapabilities).toBeDefined();
    });
  });

  describe('Manual Controls', () => {
    it('should manually disable features', () => {
      const result = degradationManager.disableFeature('audio');
      
      expect(result.success).toBe(true);
      expect(degradationManager.isFeatureAvailable('audio')).toBe(false);
      expect(eventCallback).toHaveBeenCalledWith('featureDisabled', expect.any(Object));
    });

    it('should manually enable features', () => {
      degradationManager.disableFeature('audio');
      const result = degradationManager.enableFeature('audio');
      
      expect(result.success).toBe(true);
      expect(degradationManager.isFeatureAvailable('audio')).toBe(true);
      expect(eventCallback).toHaveBeenCalledWith('featureEnabled', expect.any(Object));
    });

    it('should reject invalid feature names', () => {
      const result = degradationManager.disableFeature('invalidFeature');
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.INVALID_PARAMETER);
    });

    it('should set manual override', () => {
      const result = degradationManager.setManualOverride('minimal');
      
      expect(result.success).toBe(true);
      expect(degradationManager.getCurrentLevel().name).toBe('minimal');
      expect(eventCallback).toHaveBeenCalledWith('manualOverrideSet', expect.any(Object));
    });

    it('should remove manual override', () => {
      degradationManager.setManualOverride('minimal');
      const result = degradationManager.setManualOverride(null);
      
      expect(result.success).toBe(true);
      expect(eventCallback).toHaveBeenCalledWith('manualOverrideRemoved', expect.any(Object));
    });

    it('should respect manual controls configuration', () => {
      const restrictedManager = new DegradationManager({
        enableManualControls: false
      });
      
      const result = restrictedManager.disableFeature('audio');
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.FEATURE_NOT_SUPPORTED);
      
      restrictedManager.destroy();
    });
  });

  describe('Progressive Enhancement', () => {
    it('should test capabilities', () => {
      const testFn = () => true;
      const result = degradationManager.testCapability('advancedAudio', testFn);
      
      expect(result.success).toBe(true);
      expect(result.data.supported).toBe(true);
      expect(result.data.feature).toBe('advancedAudio');
    });

    it('should handle capability test failures', () => {
      const testFn = () => { throw new Error('Test failed'); };
      const result = degradationManager.testCapability('advancedAudio', testFn);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.FEATURE_NOT_SUPPORTED);
    });

    it('should apply progressive enhancement', () => {
      // First test some capabilities
      degradationManager.testCapability('advancedAudio', () => true);
      degradationManager.testCapability('advancedParticles', () => true);
      
      const result = degradationManager.applyProgressiveEnhancement();
      
      expect(result.success).toBe(true);
      expect(result.data.enhancements).toContain('advancedAudio');
      expect(eventCallback).toHaveBeenCalledWith('progressiveEnhancementApplied', expect.any(Object));
    });

    it('should get capability test results', () => {
      degradationManager.testCapability('testFeature', () => true);
      const results = degradationManager.getCapabilityTests();
      
      expect(results.testFeature).toBeDefined();
      expect(results.testFeature.supported).toBe(true);
    });

    it('should respect progressive enhancement configuration', () => {
      const restrictedManager = new DegradationManager({
        enableProgressiveEnhancement: false
      });
      
      const result = restrictedManager.testCapability('test', () => true);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.FEATURE_NOT_SUPPORTED);
      
      restrictedManager.destroy();
    });
  });

  describe('Status and Reporting', () => {
    it('should provide comprehensive degradation status', () => {
      const status = degradationManager.getDegradationStatus();
      
      expect(status.currentLevel).toBeDefined();
      expect(status.availableFeatures).toBeDefined();
      expect(status.featureReport).toBeDefined();
      expect(status.performanceStats).toBeDefined();
      expect(status.config).toBeDefined();
      expect(status.history).toBeDefined();
    });

    it('should explain feature unavailability reasons', () => {
      degradationManager.disableFeature('audio');
      const reason = degradationManager.getFeatureUnavailableReason('audio');
      
      expect(reason).toBe('Feature manually disabled');
    });

    it('should reset to optimal state', () => {
      degradationManager.setLevel('minimal');
      degradationManager.disableFeature('particles');
      
      degradationManager.reset();
      
      expect(degradationManager.getCurrentLevel().name).toBe('optimal');
      expect(eventCallback).toHaveBeenCalledWith('reset', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    it('should handle performance monitoring errors gracefully', () => {
      // Mock a scenario that could cause errors
      const originalCheckPerformance = degradationManager.checkPerformance;
      degradationManager.checkPerformance = () => {
        throw new Error('Performance check failed');
      };
      
      const result = degradationManager.checkPerformanceEnhanced();
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe(ErrorTypes.PERFORMANCE_DEGRADED);
      
      // Restore original method
      degradationManager.checkPerformance = originalCheckPerformance;
    });

    it('should skip performance checks during manual override', () => {
      degradationManager.setManualOverride('minimal');
      const result = degradationManager.checkPerformanceEnhanced({ fps: 10 });
      
      expect(result.success).toBe(true);
      expect(result.data.message).toContain('manual override active');
    });
  });

  describe('Accessibility Features', () => {
    it('should detect reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      const newManager = new DegradationManager();
      const features = newManager.getAvailableFeatures();
      
      expect(features.reducedMotion).toBe(true);
      
      newManager.destroy();
    });

    it('should detect high contrast preference', () => {
      // Mock high contrast preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      const newManager = new DegradationManager();
      const features = newManager.getAvailableFeatures();
      
      expect(features.highContrast).toBe(true);
      
      newManager.destroy();
    });
  });
});