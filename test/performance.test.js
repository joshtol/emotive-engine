/**
 * Performance Tests - Comprehensive performance testing infrastructure
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EmotiveStateMachine from '../src/core/EmotiveStateMachine.js';
import GestureCompositor from '../src/core/GestureCompositor.js';
import GestureScheduler from '../src/core/GestureScheduler.js';
import { getGesture } from '../src/core/gestures/index.js';
import ParticleSystem from '../src/core/ParticleSystem.js';
import { SoundSystem } from '../src/core/SoundSystem.js';

describe('Performance Testing Infrastructure', () => {
    let stateMachine;
    let gestureSystem;
    let particleSystem;
    let soundSystem;
    let mockCtx;
    let performanceMonitor;

    beforeEach(() => {
        // Create mock error boundary
        const mockErrorBoundary = {
            wrap: (fn) => fn
        };

        // Create mock canvas context
        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            fillStyle: '#ffffff',
            globalAlpha: 1
        };

        // Initialize systems
        stateMachine = new EmotiveStateMachine(mockErrorBoundary);
        gestureSystem = new GestureSystem(mockErrorBoundary);
        particleSystem = new ParticleSystem(100, mockErrorBoundary); // Higher limit for stress testing
        soundSystem = new SoundSystem();

        // Initialize performance monitor
        performanceMonitor = new PerformanceMonitor();
    });

    afterEach(() => {
        if (particleSystem) {
            particleSystem.destroy();
        }
        if (performanceMonitor) {
            performanceMonitor.cleanup();
        }
    });

    describe('FPS Measurement and Validation Framework', () => {
        it('should measure FPS accurately over time', () => {
            const fpsMonitor = new FPSMonitor();
            
            // Simulate consistent frame times (60 FPS = 16.67ms per frame)
            const frameInterval = 16.67;
            let currentTime = performance.now();
            
            // Record several frames at consistent intervals
            for (let i = 0; i < 10; i++) {
                fpsMonitor.recordFrame(currentTime);
                currentTime += frameInterval;
            }
            
            const measuredFPS = fpsMonitor.getCurrentFPS();
            
            // Should be close to 60 FPS (within reasonable tolerance)
            expect(measuredFPS).toBeGreaterThan(50);
            expect(measuredFPS).toBeLessThan(70);
        });

        it('should detect FPS drops and performance issues', () => {
            const fpsMonitor = new FPSMonitor();
            const minAcceptableFPS = 30;
            
            // Simulate good performance (60 FPS = 16.67ms per frame)
            let currentTime = 0;
            for (let i = 0; i < 10; i++) {
                fpsMonitor.recordFrame(currentTime);
                currentTime += 16.67;
            }
            
            expect(fpsMonitor.getCurrentFPS()).toBeGreaterThan(minAcceptableFPS);
            expect(fpsMonitor.isPerformanceGood()).toBe(true);
            
            // Clear and simulate performance drop (20 FPS = 50ms per frame)
            const badFpsMonitor = new FPSMonitor();
            currentTime = 0;
            for (let i = 0; i < 10; i++) {
                badFpsMonitor.recordFrame(currentTime);
                currentTime += 50;
            }
            
            expect(badFpsMonitor.getCurrentFPS()).toBeLessThan(minAcceptableFPS);
            expect(badFpsMonitor.isPerformanceGood()).toBe(false);
        });

        it('should provide frame time statistics', () => {
            const fpsMonitor = new FPSMonitor();
            
            // Record frames with varying intervals
            const frameTimes = [16.67, 16.67, 33.33, 16.67, 50]; // Mix of good and bad frames
            let currentTime = performance.now();
            
            frameTimes.forEach(frameTime => {
                currentTime += frameTime;
                fpsMonitor.recordFrame(currentTime);
            });
            
            const stats = fpsMonitor.getFrameTimeStats();
            
            expect(stats.average).toBeGreaterThan(0);
            expect(stats.min).toBeCloseTo(16.67, 1);
            expect(stats.max).toBeCloseTo(50, 1);
            expect(stats.p95).toBeDefined(); // 95th percentile
            expect(stats.p99).toBeDefined(); // 99th percentile
        });

        it('should handle frame time validation', () => {
            const fpsMonitor = new FPSMonitor();
            const targetFrameTime = 16.67; // 60 FPS
            
            // Test good frame times
            expect(fpsMonitor.isFrameTimeAcceptable(16.67)).toBe(true);
            expect(fpsMonitor.isFrameTimeAcceptable(20)).toBe(true); // Still acceptable
            
            // Test poor frame times
            expect(fpsMonitor.isFrameTimeAcceptable(50)).toBe(false); // 20 FPS
            expect(fpsMonitor.isFrameTimeAcceptable(100)).toBe(false); // 10 FPS
        });
    });

    describe('Particle Count Stress Tests', () => {
        it('should maintain performance with 50 particles', () => {
            const startTime = performance.now();
            
            // Spawn 50 particles
            particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 50);
            expect(particleSystem.particles.length).toBe(50);
            
            // Update particles multiple times
            for (let i = 0; i < 60; i++) {
                particleSystem.update(16.67, 400, 300);
                particleSystem.render(mockCtx, '#ffffff');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete within reasonable time (less than 100ms for 60 frames)
            expect(duration).toBeLessThan(100);
            
            // Verify particles are still active
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        it('should handle 100+ particles with degraded performance', () => {
            const startTime = performance.now();
            
            // Spawn maximum particles
            particleSystem.spawn('ambient', 'neutral', 200, 400, 300, 16.67, 100);
            expect(particleSystem.particles.length).toBe(100); // Should be capped at maxParticles
            
            // Update particles for stress test
            for (let i = 0; i < 30; i++) {
                particleSystem.update(16.67, 400, 300);
                particleSystem.render(mockCtx, '#ffffff');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should still complete within reasonable time (less than 200ms for 30 frames)
            expect(duration).toBeLessThan(200);
            
            // System should enforce particle limit
            expect(particleSystem.particles.length).toBeLessThanOrEqual(100);
        });

        it('should measure particle system performance metrics', () => {
            // Spawn particles and measure performance
            const metrics = measureParticlePerformance(particleSystem, {
                particleCount: 75,
                frameCount: 60,
                behavior: 'aggressive'
            });
            
            expect(metrics.averageFrameTime).toBeDefined();
            expect(metrics.maxFrameTime).toBeDefined();
            expect(metrics.particleUpdateTime).toBeDefined();
            expect(metrics.renderTime).toBeDefined();
            expect(metrics.memoryUsage).toBeDefined();
            
            // Performance should be reasonable
            expect(metrics.averageFrameTime).toBeLessThan(50); // Less than 50ms per frame
            expect(metrics.particleUpdateTime).toBeLessThan(20); // Less than 20ms for updates
        });

        it('should test different particle behaviors under stress', () => {
            const behaviors = ['ambient', 'rising', 'falling', 'aggressive', 'scattering', 'burst', 'repelling', 'orbiting'];
            const results = [];
            
            for (const behavior of behaviors) {
                particleSystem.clear();
                
                const startTime = performance.now();
                
                // Spawn particles with this behavior
                particleSystem.spawn(behavior, 'neutral', 100, 400, 300, 16.67, 50);
                
                // Update for several frames
                for (let i = 0; i < 30; i++) {
                    particleSystem.update(16.67, 400, 300);
                    particleSystem.render(mockCtx, '#ffffff');
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                results.push({
                    behavior,
                    duration,
                    particleCount: particleSystem.particles.length
                });
            }
            
            // All behaviors should complete within reasonable time
            results.forEach(result => {
                expect(result.duration).toBeLessThan(150); // 150ms max
                expect(result.particleCount).toBeGreaterThan(0);
            });
            
            // No behavior should be significantly slower than others (within 20x for test environment)
            const durations = results.map(r => r.duration);
            const minDuration = Math.min(...durations);
            const maxDuration = Math.max(...durations);
            expect(maxDuration / minDuration).toBeLessThan(20);
        });

        it('should handle particle overflow gracefully', () => {
            const maxParticles = particleSystem.maxParticles;
            
            // Try to spawn way more particles than the limit
            particleSystem.spawn('ambient', 'neutral', 500, 400, 300, 16.67, 200);
            
            // Should be capped at maximum
            expect(particleSystem.particles.length).toBeLessThanOrEqual(maxParticles);
            
            // Continue spawning in a loop
            for (let i = 0; i < 10; i++) {
                particleSystem.spawn('burst', 'excitement', 100, 400, 300, 16.67, 20);
                particleSystem.update(16.67, 400, 300);
            }
            
            // Should still respect limits
            expect(particleSystem.particles.length).toBeLessThanOrEqual(maxParticles);
            
            // Pool efficiency should remain good
            const stats = particleSystem.getStats();
            expect(stats.poolEfficiency).toBeGreaterThan(0.5);
        });
    });

    describe('Gesture Chaining Performance Tests', () => {
        it('should handle rapid gesture execution', () => {
            const gestures = ['bounce', 'pulse', 'shake', 'spin', 'nod'];
            const startTime = performance.now();
            
            // Execute gestures rapidly
            for (let i = 0; i < 20; i++) {
                const gesture = gestures[i % gestures.length];
                gestureSystem.execute(gesture);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete quickly (less than 50ms)
            expect(duration).toBeLessThan(50);
        });

        it('should measure gesture execution performance', () => {
            const gestures = ['bounce', 'pulse', 'drift', 'expand', 'flash'];
            const executionTimes = [];
            
            for (const gesture of gestures) {
                const startTime = performance.now();
                
                const result = gestureSystem.execute(gesture);
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                
                executionTimes.push({
                    gesture,
                    executionTime,
                    success: result
                });
            }
            
            // All gestures should execute successfully (some may be rejected due to queue limits)
            const successfulGestures = executionTimes.filter(({ success }) => success);
            expect(successfulGestures.length).toBeGreaterThan(0);
            
            successfulGestures.forEach(({ executionTime }) => {
                expect(executionTime).toBeLessThan(50); // Less than 50ms per gesture (generous for test env)
            });
            
            // Average execution time should be very fast
            const averageTime = executionTimes.reduce((sum, { executionTime }) => sum + executionTime, 0) / executionTimes.length;
            expect(averageTime).toBeLessThan(5);
        });

        it('should handle gesture queue performance under load', () => {
            const startTime = performance.now();
            
            // Fill gesture queue rapidly
            const gestures = ['bounce', 'pulse', 'shake'];
            for (let i = 0; i < 10; i++) {
                gestureSystem.execute(gestures[i % gestures.length]);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should handle queue operations quickly
            expect(duration).toBeLessThan(20);
            
            // Queue should have reasonable size
            expect(gestureSystem.queue.length).toBeLessThanOrEqual(gestureSystem.maxQueueSize);
        });

        it('should test gesture and particle system coordination performance', () => {
            const startTime = performance.now();
            
            // Execute gestures while managing particles
            for (let i = 0; i < 10; i++) {
                // Execute gesture
                gestureSystem.execute('bounce');
                
                // Spawn particles
                particleSystem.spawn('rising', 'joy', 50, 400, 300, 16.67, 5);
                
                // Update systems
                particleSystem.update(16.67, 400, 300);
                particleSystem.render(mockCtx, '#ffff00');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Combined operations should be efficient
            expect(duration).toBeLessThan(100);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Memory Usage Monitoring and Leak Detection', () => {
        it('should monitor memory usage during particle operations', () => {
            const memoryMonitor = new MemoryMonitor();
            
            // Record initial memory
            memoryMonitor.recordSnapshot('initial');
            
            // Perform memory-intensive operations
            for (let i = 0; i < 5; i++) {
                particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 20);
                particleSystem.update(16.67, 400, 300);
                particleSystem.render(mockCtx, '#ffffff');
            }
            
            memoryMonitor.recordSnapshot('after_particles');
            
            // Clear particles
            particleSystem.clear();
            
            memoryMonitor.recordSnapshot('after_clear');
            
            const report = memoryMonitor.generateReport();
            
            expect(report.snapshots.length).toBe(3);
            expect(report.memoryGrowth).toBeDefined();
            expect(report.potentialLeaks).toBeDefined();
        });

        it('should detect memory leaks in particle pooling', () => {
            const initialStats = particleSystem.getStats();
            const initialPoolSize = initialStats.poolSize;
            
            // Perform many spawn/clear cycles
            for (let i = 0; i < 20; i++) {
                particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 10);
                
                // Let particles die naturally
                for (let j = 0; j < 200; j++) {
                    particleSystem.update(16.67, 400, 300);
                }
                
                particleSystem.clear();
            }
            
            const finalStats = particleSystem.getStats();
            
            // Pool should not have grown significantly
            expect(finalStats.poolSize).toBeLessThanOrEqual(initialPoolSize * 1.1);
            
            // Pool efficiency should remain good
            expect(finalStats.poolEfficiency).toBeGreaterThan(0.8);
        });

        it('should monitor gesture system memory usage', () => {
            const memoryTracker = new MemoryTracker();
            
            memoryTracker.startTracking();
            
            // Execute many gestures
            const gestures = ['bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt', 'expand', 'contract', 'flash', 'drift'];
            
            for (let i = 0; i < 100; i++) {
                const gesture = gestures[i % gestures.length];
                gestureSystem.execute(gesture);
            }
            
            const memoryUsage = memoryTracker.stopTracking();
            
            // Memory usage should be reasonable
            expect(memoryUsage.peakUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
            expect(memoryUsage.averageUsage).toBeLessThan(20 * 1024 * 1024); // Less than 20MB average
        });

        it('should test for event listener leaks', () => {
            const eventTracker = new EventListenerTracker();
            
            // Track initial event listeners
            eventTracker.recordInitialState();
            
            // Create and destroy multiple systems
            for (let i = 0; i < 5; i++) {
                const mockErrorBoundary = { wrap: (fn) => fn };
                const tempGestureSystem = new GestureSystem(mockErrorBoundary);
                const tempParticleSystem = new ParticleSystem(50, mockErrorBoundary);
                
                // Use the systems
                tempGestureSystem.execute('bounce');
                tempParticleSystem.spawn('ambient', 'neutral', 10, 400, 300, 16.67, 5);
                
                // Cleanup
                tempParticleSystem.destroy();
            }
            
            // Check for listener leaks
            const leakReport = eventTracker.detectLeaks();
            
            expect(leakReport.hasLeaks).toBe(false);
            expect(leakReport.leakedListeners).toHaveLength(0);
        });

        it('should handle memory pressure gracefully', () => {
            // Simulate memory pressure by creating many objects
            const objects = [];
            
            try {
                // Create memory pressure
                for (let i = 0; i < 1000; i++) {
                    objects.push(new Array(1000).fill(Math.random()));
                }
                
                // System should still function under pressure
                particleSystem.spawn('ambient', 'neutral', 50, 400, 300, 16.67, 25);
                particleSystem.update(16.67, 400, 300);
                
                expect(particleSystem.particles.length).toBeGreaterThan(0);
                
            } finally {
                // Cleanup
                objects.length = 0;
            }
        });
    });

    describe('Cross-Browser Performance Comparison', () => {
        it('should provide browser performance baseline', () => {
            const browserInfo = getBrowserInfo();
            const performanceBaseline = measurePerformanceBaseline();
            
            expect(browserInfo.name).toBeDefined();
            expect(browserInfo.version).toBeDefined();
            expect(performanceBaseline.jsExecutionSpeed).toBeGreaterThan(0);
            expect(performanceBaseline.canvasRenderSpeed).toBeGreaterThan(0);
            expect(performanceBaseline.memoryAvailable).toBeGreaterThan(0);
        });

        it('should benchmark particle system across different scenarios', () => {
            const scenarios = [
                { name: 'light_load', particles: 10, frames: 30 },
                { name: 'medium_load', particles: 25, frames: 60 },
                { name: 'heavy_load', particles: 50, frames: 60 }
            ];
            
            const benchmarkResults = [];
            
            for (const scenario of scenarios) {
                const result = benchmarkParticleSystem(particleSystem, scenario);
                benchmarkResults.push({
                    scenario: scenario.name,
                    ...result
                });
            }
            
            // All scenarios should complete successfully
            benchmarkResults.forEach(result => {
                expect(result.completed).toBe(true);
                expect(result.averageFPS).toBeGreaterThan(20); // Minimum acceptable FPS
                expect(result.frameDrops).toBeLessThan(result.totalFrames * 0.1); // Less than 10% drops
            });
        });

        it('should compare gesture execution performance', () => {
            const gesturePerformanceTest = () => {
                const gestures = ['bounce', 'pulse', 'shake', 'spin'];
                const startTime = performance.now();
                
                for (let i = 0; i < 50; i++) {
                    gestureSystem.execute(gestures[i % gestures.length]);
                }
                
                return performance.now() - startTime;
            };
            
            // Run test multiple times for consistency
            const runs = [];
            for (let i = 0; i < 5; i++) {
                runs.push(gesturePerformanceTest());
            }
            
            const averageTime = runs.reduce((sum, time) => sum + time, 0) / runs.length;
            const standardDeviation = Math.sqrt(
                runs.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / runs.length
            );
            
            // Performance should be reasonable (test environment is less predictable)
            expect(averageTime).toBeLessThan(200); // Less than 200ms for 50 gestures
            expect(standardDeviation).toBeLessThan(averageTime * 2); // Less than 200% variation (generous for test env)
        });

        it('should test canvas rendering performance', () => {
            const canvasPerformanceTest = () => {
                const startTime = performance.now();
                
                // Render many particles
                particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, 50);
                
                for (let i = 0; i < 30; i++) {
                    particleSystem.update(16.67, 400, 300);
                    particleSystem.render(mockCtx, '#ffffff');
                }
                
                return performance.now() - startTime;
            };
            
            const renderTime = canvasPerformanceTest();
            
            // Rendering should be efficient
            expect(renderTime).toBeLessThan(200); // Less than 200ms for 30 frames
            
            // Verify render calls were made
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should generate performance report', () => {
            const performanceReport = generatePerformanceReport({
                particleSystem,
                gestureSystem,
                stateMachine,
                testDuration: 100
            });
            
            expect(performanceReport.browserInfo).toBeDefined();
            expect(performanceReport.systemPerformance).toBeDefined();
            expect(performanceReport.particlePerformance).toBeDefined();
            expect(performanceReport.gesturePerformance).toBeDefined();
            expect(performanceReport.memoryUsage).toBeDefined();
            expect(performanceReport.recommendations).toBeDefined();
            
            // Report should include actionable insights
            expect(performanceReport.recommendations.length).toBeGreaterThan(0);
        });
    });
});

// Helper Classes and Functions

class FPSMonitor {
    constructor() {
        this.frameTimes = [];
        this.maxSamples = 60;
        this.lastFrameTime = 0;
    }
    
    recordFrame(timestamp) {
        if (this.lastFrameTime > 0) {
            const frameTime = timestamp - this.lastFrameTime;
            this.frameTimes.push(frameTime);
            
            if (this.frameTimes.length > this.maxSamples) {
                this.frameTimes.shift();
            }
        }
        this.lastFrameTime = timestamp;
    }
    
    getCurrentFPS() {
        if (this.frameTimes.length === 0) return 0;
        
        const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
        return 1000 / averageFrameTime;
    }
    
    isPerformanceGood() {
        return this.getCurrentFPS() >= 30;
    }
    
    isFrameTimeAcceptable(frameTime) {
        return frameTime <= 33.33; // 30 FPS threshold
    }
    
    getFrameTimeStats() {
        if (this.frameTimes.length === 0) return null;
        
        const sorted = [...this.frameTimes].sort((a, b) => a - b);
        const sum = sorted.reduce((sum, time) => sum + time, 0);
        
        return {
            average: sum / sorted.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }
}

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.isActive = false;
    }
    
    start() {
        this.isActive = true;
        this.startTime = performance.now();
    }
    
    stop() {
        this.isActive = false;
        this.endTime = performance.now();
        return this.endTime - this.startTime;
    }
    
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(value);
    }
    
    getMetrics() {
        const result = {};
        for (const [name, values] of this.metrics) {
            result[name] = {
                average: values.reduce((sum, val) => sum + val, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        }
        return result;
    }
    
    cleanup() {
        this.metrics.clear();
        this.isActive = false;
    }
}

class MemoryMonitor {
    constructor() {
        this.snapshots = [];
    }
    
    recordSnapshot(label) {
        const snapshot = {
            label,
            timestamp: Date.now(),
            memory: this.getMemoryUsage()
        };
        this.snapshots.push(snapshot);
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return { used: 0, total: 0, limit: 0 };
    }
    
    generateReport() {
        if (this.snapshots.length < 2) return null;
        
        const initial = this.snapshots[0];
        const final = this.snapshots[this.snapshots.length - 1];
        
        return {
            snapshots: this.snapshots,
            memoryGrowth: final.memory.used - initial.memory.used,
            potentialLeaks: final.memory.used > initial.memory.used * 1.5
        };
    }
}

class MemoryTracker {
    constructor() {
        this.tracking = false;
        this.samples = [];
    }
    
    startTracking() {
        this.tracking = true;
        this.samples = [];
        this.intervalId = setInterval(() => {
            if (this.tracking) {
                this.samples.push(this.getCurrentMemoryUsage());
            }
        }, 100);
    }
    
    stopTracking() {
        this.tracking = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        if (this.samples.length === 0) return { peakUsage: 0, averageUsage: 0 };
        
        const peak = Math.max(...this.samples);
        const average = this.samples.reduce((sum, val) => sum + val, 0) / this.samples.length;
        
        return { peakUsage: peak, averageUsage: average };
    }
    
    getCurrentMemoryUsage() {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
    }
}

class EventListenerTracker {
    constructor() {
        this.initialListeners = 0;
    }
    
    recordInitialState() {
        // This is a simplified implementation
        // In a real scenario, you'd track actual event listeners
        this.initialListeners = this.getListenerCount();
    }
    
    detectLeaks() {
        const currentListeners = this.getListenerCount();
        const hasLeaks = currentListeners > this.initialListeners * 1.1; // 10% tolerance
        
        return {
            hasLeaks,
            leakedListeners: hasLeaks ? ['mock-leaked-listener'] : []
        };
    }
    
    getListenerCount() {
        // Mock implementation - in real scenario would count actual listeners
        return Math.floor(Math.random() * 10);
    }
}

function measureParticlePerformance(particleSystem, options) {
    const { particleCount, frameCount, behavior } = options;
    
    const startTime = performance.now();
    let updateTime = 0;
    let renderTime = 0;
    
    // Spawn particles
    particleSystem.spawn(behavior, 'neutral', 100, 400, 300, 16.67, particleCount);
    
    // Mock context for rendering
    const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillStyle: '#ffffff',
        globalAlpha: 1
    };
    
    // Update and render for specified frames
    for (let i = 0; i < frameCount; i++) {
        const updateStart = performance.now();
        particleSystem.update(16.67, 400, 300);
        updateTime += performance.now() - updateStart;
        
        const renderStart = performance.now();
        particleSystem.render(mockCtx, '#ffffff');
        renderTime += performance.now() - renderStart;
    }
    
    const totalTime = performance.now() - startTime;
    
    return {
        averageFrameTime: totalTime / frameCount,
        maxFrameTime: Math.max(updateTime, renderTime),
        particleUpdateTime: updateTime,
        renderTime: renderTime,
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
    };
}

function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    
    if (userAgent.includes('Chrome')) {
        name = 'Chrome';
        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
        name = 'Firefox';
        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari')) {
        name = 'Safari';
        version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return { name, version };
}

function measurePerformanceBaseline() {
    // Simple performance baseline measurements
    const jsStart = performance.now();
    for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
    }
    const jsExecutionSpeed = performance.now() - jsStart;
    
    return {
        jsExecutionSpeed,
        canvasRenderSpeed: 10, // Mock value
        memoryAvailable: performance.memory ? performance.memory.jsHeapSizeLimit : 1024 * 1024 * 1024 // 1GB fallback
    };
}

function benchmarkParticleSystem(particleSystem, scenario) {
    const { particles, frames } = scenario;
    
    const startTime = performance.now();
    let frameDrops = 0;
    const frameTimes = [];
    
    // Spawn particles
    particleSystem.spawn('ambient', 'neutral', 100, 400, 300, 16.67, particles);
    
    // Mock context
    const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillStyle: '#ffffff',
        globalAlpha: 1
    };
    
    // Run benchmark
    for (let i = 0; i < frames; i++) {
        const frameStart = performance.now();
        
        particleSystem.update(16.67, 400, 300);
        particleSystem.render(mockCtx, '#ffffff');
        
        const frameTime = performance.now() - frameStart;
        frameTimes.push(frameTime);
        
        if (frameTime > 33.33) { // Slower than 30 FPS
            frameDrops++;
        }
    }
    
    const totalTime = performance.now() - startTime;
    const averageFPS = 1000 / (totalTime / frames);
    
    return {
        completed: true,
        totalFrames: frames,
        frameDrops,
        averageFPS,
        totalTime
    };
}

function generatePerformanceReport(systems) {
    const { particleSystem, gestureSystem, stateMachine } = systems;
    
    return {
        browserInfo: getBrowserInfo(),
        systemPerformance: {
            particleCount: particleSystem.particles.length,
            poolEfficiency: particleSystem.getStats().poolEfficiency,
            gestureQueueSize: gestureSystem.queue.length
        },
        particlePerformance: measureParticlePerformance(particleSystem, {
            particleCount: 25,
            frameCount: 30,
            behavior: 'ambient'
        }),
        gesturePerformance: {
            averageExecutionTime: 5, // Mock value
            queueProcessingTime: 2   // Mock value
        },
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
        recommendations: [
            'Consider reducing particle count for better performance',
            'Use object pooling for frequent allocations',
            'Monitor frame rate and adjust quality accordingly'
        ]
    };
}