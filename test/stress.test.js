/**
 * Stress Testing Framework - Comprehensive performance and stability testing
 * Tests system limits, memory management, and performance under load
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveMascot from '../src/EmotiveMascot.js';
import PerformanceMonitor from '../src/core/PerformanceMonitor.js';
import ParticleSystem from '../src/core/ParticleSystem.js';
import GestureSystem from '../src/core/GestureSystem.js';

describe('Stress Testing Framework', () => {
    let mascot;
    let canvas;
    let ctx;
    let performanceMonitor;
    
    beforeEach(() => {
        // Create canvas
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        ctx = canvas.getContext('2d');
        
        // Mock canvas context if needed
        if (!ctx) {
            ctx = {
                clearRect: vi.fn(),
                fillRect: vi.fn(),
                beginPath: vi.fn(),
                arc: vi.fn(),
                fill: vi.fn(),
                stroke: vi.fn(),
                save: vi.fn(),
                restore: vi.fn(),
                translate: vi.fn(),
                rotate: vi.fn(),
                scale: vi.fn(),
                createRadialGradient: vi.fn(() => ({
                    addColorStop: vi.fn()
                })),
                createLinearGradient: vi.fn(() => ({
                    addColorStop: vi.fn()
                }))
            };
            canvas.getContext = vi.fn(() => ctx);
        }
        
        document.body.appendChild(canvas);
        
        // Initialize performance monitor
        performanceMonitor = new PerformanceMonitor({
            targetFPS: 60,
            maxMemoryMB: 100
        });
    });
    
    afterEach(() => {
        if (mascot) {
            mascot.destroy();
            mascot = null;
        }
        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        if (performanceMonitor) {
            performanceMonitor.destroy();
        }
    });
    
    describe('Particle Count Stress Tests', () => {
        it('should handle maximum particle count without crashing', async () => {
            const particleSystem = new ParticleSystem({
                maxParticles: 100
            });
            
            // Spawn maximum particles
            for (let i = 0; i < 100; i++) {
                particleSystem.emit(
                    Math.random() * 800,
                    Math.random() * 600,
                    {
                        count: 1,
                        type: 'test',
                        speed: Math.random() * 5
                    }
                );
            }
            
            // Update multiple times
            const startTime = performance.now();
            for (let frame = 0; frame < 100; frame++) {
                particleSystem.update(16); // 60 FPS timing
                particleSystem.render(ctx);
            }
            const endTime = performance.now();
            
            const averageFrameTime = (endTime - startTime) / 100;
            
            expect(particleSystem.particles.length).toBeLessThanOrEqual(100);
            expect(averageFrameTime).toBeLessThan(33.33); // Should maintain 30+ FPS
        });
        
        it('should handle particle overflow gracefully', () => {
            const particleSystem = new ParticleSystem({
                maxParticles: 50
            });
            
            // Try to spawn way more than max
            for (let i = 0; i < 200; i++) {
                particleSystem.emit(400, 300, { count: 5 });
            }
            
            expect(particleSystem.particles.length).toBeLessThanOrEqual(50);
            expect(() => particleSystem.update(16)).not.toThrow();
        });
        
        it('should maintain performance with rapid particle spawning', () => {
            const particleSystem = new ParticleSystem({
                maxParticles: 50
            });
            
            const measurements = [];
            
            for (let i = 0; i < 60; i++) { // 1 second at 60 FPS
                const startFrame = performance.now();
                
                // Spawn particles rapidly
                particleSystem.emit(400, 300, { 
                    count: 10,
                    spread: Math.PI * 2,
                    speed: 5
                });
                
                particleSystem.update(16);
                particleSystem.render(ctx);
                
                const frameTime = performance.now() - startFrame;
                measurements.push(frameTime);
            }
            
            const averageFrameTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            const maxFrameTime = Math.max(...measurements);
            
            expect(averageFrameTime).toBeLessThan(16.67); // 60 FPS average
            expect(maxFrameTime).toBeLessThan(33.33); // No frame worse than 30 FPS
        });
    });
    
    describe('Gesture Execution Stress Tests', () => {
        it('should handle rapid gesture changes without memory leaks', async () => {
            const gestureSystem = new GestureSystem();
            const gestures = ['wobble', 'shake', 'spin', 'bounce'];
            
            // Measure initial memory (if available)
            const initialMemory = performance.memory?.usedJSHeapSize || 0;
            
            // Rapidly change gestures
            for (let i = 0; i < 1000; i++) {
                const gesture = gestures[i % gestures.length];
                gestureSystem.triggerGesture(gesture);
                gestureSystem.update(5); // Fast forward
            }
            
            // Check for memory growth
            const finalMemory = performance.memory?.usedJSHeapSize || 0;
            const memoryGrowth = finalMemory - initialMemory;
            
            // Memory growth should be minimal (less than 10MB for 1000 gestures)
            if (initialMemory > 0) {
                expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
            }
            
            // System should still be functional
            expect(() => gestureSystem.triggerGesture('wobble')).not.toThrow();
        });
        
        it('should handle gesture queue overflow', () => {
            const gestureSystem = new GestureSystem();
            
            // Queue many gestures
            for (let i = 0; i < 100; i++) {
                gestureSystem.queueGesture('wobble', { priority: Math.random() });
            }
            
            // Should enforce queue limit
            expect(gestureSystem.gestureQueue.length).toBeLessThanOrEqual(10);
            
            // Should still process normally
            let processed = 0;
            while (gestureSystem.hasQueuedGestures() && processed < 20) {
                gestureSystem.update(500);
                processed++;
            }
            
            expect(processed).toBeGreaterThan(0);
        });
        
        it('should maintain gesture chaining performance', () => {
            const gestureSystem = new GestureSystem();
            
            const startTime = performance.now();
            
            // Chain multiple gestures
            gestureSystem.triggerGesture('thinking');
            gestureSystem.queueGesture('sparkle');
            gestureSystem.queueGesture('wobble');
            gestureSystem.queueGesture('shake');
            
            // Process entire chain
            for (let i = 0; i < 200; i++) { // ~3.3 seconds
                gestureSystem.update(16);
            }
            
            const totalTime = performance.now() - startTime;
            const averageFrameTime = totalTime / 200;
            
            expect(averageFrameTime).toBeLessThan(16.67); // Should maintain 60 FPS
        });
    });
    
    describe('Memory Management Stress Tests', () => {
        it('should detect and handle memory leaks', async () => {
            if (!performance.memory) {
                console.log('Memory API not available, skipping memory tests');
                return;
            }
            
            const iterations = 100;
            const measurements = [];
            
            for (let i = 0; i < iterations; i++) {
                // Create and destroy mascot instances
                const tempMascot = new EmotiveMascot({
                    canvasId: canvas.id || 'test-canvas',
                    targetFPS: 60
                });
                
                // Perform operations
                tempMascot.setState('excited');
                tempMascot.runAnimation('sparkle');
                
                // Measure memory
                measurements.push(performance.memory.usedJSHeapSize);
                
                // Destroy
                tempMascot.destroy();
                
                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
                
                // Small delay to allow cleanup
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Check for memory growth trend
            const firstQuarter = measurements.slice(0, 25).reduce((a, b) => a + b, 0) / 25;
            const lastQuarter = measurements.slice(75).reduce((a, b) => a + b, 0) / 25;
            
            const growthRate = (lastQuarter - firstQuarter) / firstQuarter;
            
            // Should not grow more than 20%
            expect(growthRate).toBeLessThan(0.2);
        });
        
        it('should handle resource cleanup under stress', () => {
            const resources = [];
            
            // Create many resources
            for (let i = 0; i < 100; i++) {
                const particleSystem = new ParticleSystem({ maxParticles: 10 });
                const gestureSystem = new GestureSystem();
                
                resources.push({ particleSystem, gestureSystem });
            }
            
            // Destroy all resources
            resources.forEach(r => {
                r.particleSystem.destroy();
                r.gestureSystem.destroy();
            });
            
            // Check cleanup
            resources.forEach(r => {
                expect(r.particleSystem.particles).toEqual([]);
                expect(r.gestureSystem.currentGesture).toBeNull();
            });
        });
    });
    
    describe('Concurrent Instance Stress Tests', () => {
        it('should handle multiple mascot instances simultaneously', () => {
            const instances = [];
            const canvases = [];
            
            // Create multiple instances
            for (let i = 0; i < 5; i++) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 200;
                tempCanvas.height = 200;
                tempCanvas.id = `test-canvas-${i}`;
                document.body.appendChild(tempCanvas);
                canvases.push(tempCanvas);
                
                const instance = new EmotiveMascot({
                    canvasId: tempCanvas.id,
                    targetFPS: 30
                });
                
                instances.push(instance);
            }
            
            // Run all instances
            const startTime = performance.now();
            
            for (let frame = 0; frame < 60; frame++) { // 1 second
                instances.forEach(instance => {
                    instance.update(16);
                    instance.render();
                });
            }
            
            const totalTime = performance.now() - startTime;
            const averageFrameTime = totalTime / 60;
            
            // Should handle 5 instances at 30+ FPS
            expect(averageFrameTime).toBeLessThan(33.33);
            
            // Cleanup
            instances.forEach(instance => instance.destroy());
            canvases.forEach(c => c.parentNode?.removeChild(c));
        });
        
        it('should isolate instance failures', () => {
            const instance1 = new EmotiveMascot({
                canvasId: canvas.id || 'test-canvas'
            });
            
            const canvas2 = document.createElement('canvas');
            canvas2.id = 'test-canvas-2';
            document.body.appendChild(canvas2);
            
            const instance2 = new EmotiveMascot({
                canvasId: canvas2.id
            });
            
            // Cause an error in instance1
            instance1.setState('invalid-state');
            
            // Instance2 should still work
            expect(() => instance2.setState('happy')).not.toThrow();
            expect(() => instance2.runAnimation('sparkle')).not.toThrow();
            
            // Cleanup
            instance1.destroy();
            instance2.destroy();
            canvas2.parentNode?.removeChild(canvas2);
        });
    });
    
    describe('Long-Running Stability Tests', () => {
        it('should maintain stability over extended runtime', async () => {
            mascot = new EmotiveMascot({
                canvasId: canvas.id || 'test-canvas',
                targetFPS: 60
            });
            
            const startMemory = performance.memory?.usedJSHeapSize || 0;
            const frameTimings = [];
            
            // Simulate 10 seconds of runtime at 60 FPS
            for (let i = 0; i < 600; i++) {
                const frameStart = performance.now();
                
                // Vary the workload
                if (i % 60 === 0) {
                    mascot.setState(['happy', 'excited', 'calm'][Math.floor(i / 60) % 3]);
                }
                
                if (i % 30 === 0) {
                    mascot.runAnimation(['sparkle', 'wobble', 'shake'][Math.floor(i / 30) % 3]);
                }
                
                mascot.update(16);
                mascot.render();
                
                const frameTime = performance.now() - frameStart;
                frameTimings.push(frameTime);
                
                // Small delay to simulate real timing
                await new Promise(resolve => setTimeout(resolve, 1));
            }
            
            const endMemory = performance.memory?.usedJSHeapSize || 0;
            
            // Calculate statistics
            const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
            const maxFrameTime = Math.max(...frameTimings);
            const minFrameTime = Math.min(...frameTimings);
            
            // Performance should remain stable
            expect(avgFrameTime).toBeLessThan(16.67); // 60 FPS average
            expect(maxFrameTime).toBeLessThan(50); // No severe spikes
            
            // Memory should not grow excessively
            if (startMemory > 0) {
                const memoryGrowth = (endMemory - startMemory) / startMemory;
                expect(memoryGrowth).toBeLessThan(0.5); // Less than 50% growth
            }
        });
    });
    
    describe('Performance Degradation Tests', () => {
        it('should gracefully degrade under heavy load', () => {
            const monitor = new PerformanceMonitor({
                targetFPS: 60,
                minFPS: 30
            });
            
            // Simulate decreasing performance
            for (let fps = 60; fps >= 15; fps -= 5) {
                monitor.metrics.fps = fps;
                monitor.checkThresholds();
            }
            
            // Should have applied optimizations
            expect(monitor.performanceDegradation).toBe(true);
            expect(monitor.appliedOptimizations.size).toBeGreaterThan(0);
            
            // Simulate performance recovery
            for (let fps = 20; fps <= 60; fps += 5) {
                monitor.metrics.fps = fps;
                monitor.checkThresholds();
            }
            
            // Should schedule recovery
            expect(monitor.performanceRecoveryTimer).not.toBeNull();
        });
        
        it('should prioritize critical operations under stress', () => {
            const monitor = new PerformanceMonitor({
                frameSkipEnabled: true,
                adaptiveRenderingEnabled: true
            });
            
            // Simulate poor performance
            monitor.metrics.fps = 20;
            monitor.metrics.averageFrameTime = 50;
            
            const shouldSkip = monitor.shouldSkipFrame();
            const renderParams = monitor.getAdaptiveRenderingParams();
            
            expect(shouldSkip || renderParams.skipNonCritical).toBe(true);
            expect(renderParams.quality).toBeLessThan(1);
            expect(renderParams.priorityElements).not.toBeNull();
        });
    });
    
    describe('Browser Compatibility Stress Tests', () => {
        it('should handle missing APIs gracefully', () => {
            // Temporarily remove APIs
            const originalRAF = window.requestAnimationFrame;
            const originalPerformance = window.performance;
            
            window.requestAnimationFrame = undefined;
            window.performance = { now: Date.now };
            
            // Should still create without crashing
            const instance = new EmotiveMascot({
                canvasId: canvas.id || 'test-canvas'
            });
            
            expect(instance).toBeDefined();
            expect(() => instance.update(16)).not.toThrow();
            
            // Restore APIs
            window.requestAnimationFrame = originalRAF;
            window.performance = originalPerformance;
            
            instance.destroy();
        });
        
        it('should handle canvas context loss and recovery', () => {
            const lostEvent = new Event('webglcontextlost');
            const restoredEvent = new Event('webglcontextrestored');
            
            mascot = new EmotiveMascot({
                canvasId: canvas.id || 'test-canvas'
            });
            
            // Simulate context loss
            canvas.dispatchEvent(lostEvent);
            
            // Should handle gracefully
            expect(() => mascot.render()).not.toThrow();
            
            // Simulate context restoration
            canvas.dispatchEvent(restoredEvent);
            
            // Should recover
            expect(() => mascot.render()).not.toThrow();
        });
    });
});

describe('Performance Benchmarking', () => {
    let results;
    
    beforeEach(() => {
        results = {
            particleBenchmark: {},
            gestureBenchmark: {},
            renderBenchmark: {},
            memoryBenchmark: {}
        };
    });
    
    it('should benchmark particle system performance', () => {
        const particleCounts = [10, 25, 50, 100, 200];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        particleCounts.forEach(count => {
            const system = new ParticleSystem({ maxParticles: count });
            
            // Fill with particles
            for (let i = 0; i < count; i++) {
                system.emit(400, 300, { count: 1 });
            }
            
            // Measure update performance
            const updateStart = performance.now();
            for (let i = 0; i < 100; i++) {
                system.update(16);
            }
            const updateTime = performance.now() - updateStart;
            
            // Measure render performance
            const renderStart = performance.now();
            for (let i = 0; i < 100; i++) {
                system.render(ctx);
            }
            const renderTime = performance.now() - renderStart;
            
            results.particleBenchmark[count] = {
                updateTime: updateTime / 100,
                renderTime: renderTime / 100,
                totalTime: (updateTime + renderTime) / 100
            };
            
            system.destroy();
        });
        
        // Log results
        console.log('Particle Benchmark Results:', results.particleBenchmark);
        
        // Verify performance scales reasonably
        const times = Object.values(results.particleBenchmark).map(r => r.totalTime);
        const scaleFactor = times[times.length - 1] / times[0];
        
        // Should scale less than linearly (due to optimizations)
        expect(scaleFactor).toBeLessThan(20);
    });
    
    it('should benchmark gesture execution performance', () => {
        const gestures = ['wobble', 'shake', 'sparkle', 'thinking'];
        const gestureSystem = new GestureSystem();
        
        gestures.forEach(gesture => {
            const measurements = [];
            
            for (let i = 0; i < 50; i++) {
                gestureSystem.triggerGesture(gesture);
                
                const start = performance.now();
                // Run gesture to completion
                while (gestureSystem.currentGesture) {
                    gestureSystem.update(16);
                }
                const duration = performance.now() - start;
                
                measurements.push(duration);
            }
            
            results.gestureBenchmark[gesture] = {
                min: Math.min(...measurements),
                max: Math.max(...measurements),
                avg: measurements.reduce((a, b) => a + b, 0) / measurements.length
            };
        });
        
        console.log('Gesture Benchmark Results:', results.gestureBenchmark);
        
        // All gestures should complete reasonably quickly
        Object.values(results.gestureBenchmark).forEach(benchmark => {
            expect(benchmark.avg).toBeLessThan(3000); // 3 seconds max average
        });
    });
});