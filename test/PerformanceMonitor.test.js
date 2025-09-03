/**
 * PerformanceMonitor Tests
 * Tests for the extracted PerformanceMonitor class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PerformanceMonitor from '../src/core/PerformanceMonitor.js';

describe('PerformanceMonitor', () => {
    let performanceMonitor;
    let mockSubsystems;

    beforeEach(() => {
        // Mock performance.now
        vi.spyOn(performance, 'now').mockReturnValue(1000);
        
        // Mock performance.memory
        Object.defineProperty(performance, 'memory', {
            value: {
                usedJSHeapSize: 10 * 1024 * 1024 // 10MB
            },
            configurable: true
        });

        // Create mock subsystems
        mockSubsystems = {
            particleSystem: {
                maxParticles: 50,
                originalMaxParticles: 50,
                setMaxParticles: vi.fn(),
                getActiveParticleCount: vi.fn().mockReturnValue(25),
                clearInactive: vi.fn()
            },
            gestureSystem: {
                getQueueLength: vi.fn().mockReturnValue(2),
                setComplexityReduction: vi.fn()
            },
            soundSystem: {
                getLatency: vi.fn().mockReturnValue(50),
                setQualityReduction: vi.fn()
            },
            renderer: {
                setQualityReduction: vi.fn()
            }
        };

        performanceMonitor = new PerformanceMonitor({
            targetFPS: 60,
            maxMemoryMB: 50
        });
        
        performanceMonitor.setSubsystems(mockSubsystems);
    });

    afterEach(() => {
        if (performanceMonitor) {
            performanceMonitor.destroy();
        }
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            const monitor = new PerformanceMonitor();
            const metrics = monitor.getMetrics();
            
            expect(metrics.targetFPS).toBe(60);
            expect(metrics.fps).toBe(0);
            expect(metrics.performanceDegradation).toBe(false);
            
            monitor.destroy();
        });

        it('should initialize with custom configuration', () => {
            const monitor = new PerformanceMonitor({
                targetFPS: 30,
                maxMemoryMB: 100
            });
            
            expect(monitor.config.targetFPS).toBe(30);
            expect(monitor.config.maxMemoryMB).toBe(100);
            
            monitor.destroy();
        });

        it('should set up optimization strategies', () => {
            expect(performanceMonitor.optimizations.size).toBeGreaterThan(0);
            expect(performanceMonitor.optimizations.has('reduceParticles')).toBe(true);
            expect(performanceMonitor.optimizations.has('simplifyGestures')).toBe(true);
        });
    });

    describe('Performance Tracking', () => {
        it('should track frame performance', () => {
            const startTime = 1000;
            const endTime = 1016; // 16ms frame time
            
            vi.spyOn(performance, 'now')
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            performanceMonitor.startFrame(startTime);
            performanceMonitor.endFrame(endTime);

            const metrics = performanceMonitor.getMetrics();
            expect(metrics.frameTime).toBe(16);
        });

        it('should calculate FPS over time', () => {
            // Simulate 60 frames over 1 second
            let currentTime = 1000;
            
            for (let i = 0; i < 60; i++) {
                performanceMonitor.startFrame(currentTime);
                currentTime += 16.67; // ~60 FPS
                performanceMonitor.endFrame(currentTime);
            }
            
            // Simulate 1 second passing for FPS calculation
            currentTime += 1000;
            performanceMonitor.startFrame(currentTime);
            performanceMonitor.endFrame(currentTime + 16.67);

            const metrics = performanceMonitor.getMetrics();
            expect(metrics.fps).toBeCloseTo(60, 0);
        });

        it('should update system metrics', () => {
            performanceMonitor.updateMetrics({
                particleCount: 30,
                gestureQueueLength: 5,
                audioLatency: 100
            });

            const metrics = performanceMonitor.getMetrics();
            expect(metrics.particleCount).toBe(30);
            expect(metrics.gestureQueueLength).toBe(5);
            expect(metrics.audioLatency).toBe(100);
        });
    });

    describe('Performance Optimization', () => {
        it('should apply optimizations when performance degrades', () => {
            // Mock low FPS
            performanceMonitor.metrics.fps = 20; // Below minFPS (30)
            
            performanceMonitor.checkThresholds();
            
            expect(mockSubsystems.particleSystem.setMaxParticles).toHaveBeenCalled();
            expect(performanceMonitor.performanceDegradation).toBe(true);
        });

        it('should not apply optimizations if already degraded', () => {
            performanceMonitor.performanceDegradation = true;
            performanceMonitor.metrics.fps = 20;
            
            performanceMonitor.checkThresholds();
            
            expect(mockSubsystems.particleSystem.setMaxParticles).not.toHaveBeenCalled();
        });

        it('should schedule recovery when performance improves', () => {
            performanceMonitor.performanceDegradation = true;
            performanceMonitor.metrics.fps = 55; // Above goodFPS (50)
            
            performanceMonitor.checkThresholds();
            
            expect(performanceMonitor.performanceRecoveryTimer).toBeTruthy();
        });

        it('should revert optimizations during recovery', () => {
            performanceMonitor.appliedOptimizations.add('reduceParticles');
            performanceMonitor.performanceDegradation = true;
            performanceMonitor.metrics.fps = 55;
            
            performanceMonitor.revertOptimizations();
            
            expect(performanceMonitor.performanceDegradation).toBe(false);
            expect(performanceMonitor.appliedOptimizations.size).toBe(0);
        });
    });

    describe('Memory Monitoring', () => {
        it('should track memory usage', () => {
            performanceMonitor.updateMemoryUsage();
            
            const metrics = performanceMonitor.getMetrics();
            expect(metrics.memoryUsage).toBeGreaterThan(0);
        });

        it('should detect memory leaks', () => {
            // Simulate growing memory usage
            const mockEmit = vi.fn();
            performanceMonitor.setEventCallback(mockEmit);
            
            // Add history with growing memory
            for (let i = 0; i < 10; i++) {
                performanceMonitor.memoryHistory.push({
                    timestamp: 1000 + i * 1000,
                    usage: 10 + i * 2 // Growing memory
                });
            }
            
            performanceMonitor.detectMemoryLeaks();
            
            expect(mockEmit).toHaveBeenCalledWith('memoryLeakDetected', expect.any(Object));
        });

        it('should handle memory pressure', () => {
            performanceMonitor.metrics.memoryUsage = 60; // Above maxMemoryMB (50)
            
            const mockEmit = vi.fn();
            performanceMonitor.setEventCallback(mockEmit);
            
            performanceMonitor.handleMemoryPressure();
            
            expect(mockEmit).toHaveBeenCalledWith('memoryPressure', expect.any(Object));
            expect(mockSubsystems.particleSystem.clearInactive).toHaveBeenCalled();
        });
    });

    describe('Configuration', () => {
        it('should update target FPS and related thresholds', () => {
            performanceMonitor.setTargetFPS(30);
            
            expect(performanceMonitor.config.targetFPS).toBe(30);
            expect(performanceMonitor.config.minFPS).toBe(30); // max(30, 30 * 0.5)
            expect(performanceMonitor.config.goodFPS).toBe(50); // max(50, 30 * 0.8)
        });

        it('should validate target FPS input', () => {
            expect(() => performanceMonitor.setTargetFPS(-1)).toThrow();
            expect(() => performanceMonitor.setTargetFPS(0)).toThrow();
            expect(() => performanceMonitor.setTargetFPS('invalid')).toThrow();
        });
    });

    describe('Reporting', () => {
        it('should generate comprehensive performance report', () => {
            performanceMonitor.metrics.fps = 45;
            performanceMonitor.metrics.memoryUsage = 25;
            
            const report = performanceMonitor.generateReport();
            
            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('performance');
            expect(report).toHaveProperty('optimizations');
            expect(report).toHaveProperty('recommendations');
            
            expect(report.performance.fps.current).toBe(45);
            expect(report.performance.memory.current).toBe(25);
        });

        it('should provide performance status', () => {
            performanceMonitor.metrics.fps = 55;
            expect(performanceMonitor.getPerformanceStatus()).toBe('excellent'); // 55 >= goodFPS (50)
            
            performanceMonitor.metrics.fps = 25;
            expect(performanceMonitor.getPerformanceStatus()).toBe('poor');
        });

        it('should generate optimization recommendations', () => {
            performanceMonitor.metrics.fps = 30; // Below target
            performanceMonitor.metrics.memoryUsage = 45; // Near limit
            
            const metrics = performanceMonitor.getMetrics();
            const recommendations = performanceMonitor.generateRecommendations(metrics);
            
            expect(recommendations).toBeInstanceOf(Array);
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations[0]).toHaveProperty('type');
            expect(recommendations[0]).toHaveProperty('priority');
            expect(recommendations[0]).toHaveProperty('message');
        });
    });

    describe('Event System', () => {
        it('should emit events through callback', () => {
            const mockCallback = vi.fn();
            performanceMonitor.setEventCallback(mockCallback);
            
            performanceMonitor.emit('testEvent', { data: 'test' });
            
            expect(mockCallback).toHaveBeenCalledWith('testEvent', { data: 'test' });
        });

        it('should validate event callback', () => {
            expect(() => performanceMonitor.setEventCallback('invalid')).toThrow();
            expect(() => performanceMonitor.setEventCallback(null)).toThrow();
        });
    });

    describe('Cleanup', () => {
        it('should clean up resources on destroy', () => {
            const mockCallback = vi.fn();
            performanceMonitor.setEventCallback(mockCallback);
            
            performanceMonitor.destroy();
            
            expect(performanceMonitor.subsystems).toEqual({});
            expect(performanceMonitor.eventCallback).toBeNull();
            expect(performanceMonitor.optimizations.size).toBe(0);
            expect(performanceMonitor.memoryCheckTimer).toBeNull();
        });

        it('should revert optimizations on destroy', () => {
            performanceMonitor.appliedOptimizations.add('reduceParticles');
            
            const revertSpy = vi.spyOn(performanceMonitor, 'revertOptimizations');
            
            performanceMonitor.destroy();
            
            expect(revertSpy).toHaveBeenCalled();
        });
    });
});