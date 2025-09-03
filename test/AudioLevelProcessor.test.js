/**
 * AudioLevelProcessor Test Suite
 * Tests audio analysis, speech reactivity, volume spike detection, and audio context lifecycle management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioLevelProcessor } from '../src/core/AudioLevelProcessor.js';

// Mock Web Audio API
class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
    }
    
    createAnalyser() {
        return new MockAnalyserNode();
    }
    
    resume() {
        this.state = 'running';
        return Promise.resolve();
    }
    
    close() {
        this.state = 'closed';
        return Promise.resolve();
    }
}

class MockAnalyserNode {
    constructor() {
        this.fftSize = 256;
        this.frequencyBinCount = 128;
        this.smoothingTimeConstant = 0.8;
        this.mockFrequencyData = new Uint8Array(128).fill(50); // Default moderate level
    }
    
    getByteFrequencyData(array) {
        // Copy mock data to provided array
        for (let i = 0; i < Math.min(array.length, this.mockFrequencyData.length); i++) {
            array[i] = this.mockFrequencyData[i];
        }
    }
    
    // Helper method to simulate different audio levels
    setMockLevel(level) {
        const baseValue = Math.floor(level * 255);
        this.mockFrequencyData.fill(baseValue);
    }
}

describe('AudioLevelProcessor', () => {
    let processor;
    let mockAudioContext;
    let mockAnalyser;
    
    beforeEach(() => {
        // Mock performance.now
        vi.spyOn(performance, 'now').mockReturnValue(1000);
        
        // Create fresh instances
        processor = new AudioLevelProcessor();
        mockAudioContext = new MockAudioContext();
        
        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    
    afterEach(() => {
        processor.cleanup();
        vi.restoreAllMocks();
    });

    describe('Constructor and Configuration', () => {
        it('should initialize with default configuration', () => {
            const config = processor.getConfig();
            
            expect(config.spikeThreshold).toBe(1.5);
            expect(config.minimumSpikeLevel).toBe(0.1);
            expect(config.spikeMinInterval).toBe(1000);
            expect(config.historySize).toBe(10);
            expect(config.smoothingTimeConstant).toBe(0.8);
            expect(config.fftSize).toBe(256);
            expect(config.levelUpdateThrottle).toBe(100);
        });
        
        it('should accept custom configuration', () => {
            const customConfig = {
                spikeThreshold: 2.0,
                minimumSpikeLevel: 0.2,
                spikeMinInterval: 500,
                historySize: 15
            };
            
            const customProcessor = new AudioLevelProcessor(customConfig);
            const config = customProcessor.getConfig();
            
            expect(config.spikeThreshold).toBe(2.0);
            expect(config.minimumSpikeLevel).toBe(0.2);
            expect(config.spikeMinInterval).toBe(500);
            expect(config.historySize).toBe(15);
        });
        
        it('should start in inactive state', () => {
            expect(processor.isProcessingActive()).toBe(false);
            expect(processor.getCurrentLevel()).toBe(0);
            expect(processor.getLevelHistory()).toEqual([]);
        });
    });

    describe('Initialization and Cleanup', () => {
        it('should initialize successfully with valid AudioContext', () => {
            const success = processor.initialize(mockAudioContext);
            
            expect(success).toBe(true);
            expect(processor.isProcessingActive()).toBe(true);
            expect(processor.getAnalyser()).toBeTruthy();
        });
        
        it('should fail initialization without AudioContext', () => {
            const success = processor.initialize(null);
            
            expect(success).toBe(false);
            expect(processor.isProcessingActive()).toBe(false);
        });
        
        it('should fail initialization with invalid AudioContext', () => {
            const invalidContext = { invalid: true };
            const success = processor.initialize(invalidContext);
            
            expect(success).toBe(false);
            expect(processor.isProcessingActive()).toBe(false);
        });
        
        it('should handle suspended AudioContext', async () => {
            mockAudioContext.state = 'suspended';
            const resumeSpy = vi.spyOn(mockAudioContext, 'resume');
            
            processor.initialize(mockAudioContext);
            
            expect(resumeSpy).toHaveBeenCalled();
        });
        
        it('should cleanup resources properly', () => {
            processor.initialize(mockAudioContext);
            expect(processor.isProcessingActive()).toBe(true);
            
            processor.cleanup();
            
            expect(processor.isProcessingActive()).toBe(false);
            expect(processor.getCurrentLevel()).toBe(0);
            expect(processor.getLevelHistory()).toEqual([]);
            expect(processor.getAnalyser()).toBeNull();
        });
    });

    describe('Audio Level Processing', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should calculate RMS from frequency data', () => {
            // Set mock frequency data to known values
            mockAnalyser.setMockLevel(0.5); // 50% level
            
            processor.updateAudioLevel();
            
            const level = processor.getCurrentLevel();
            expect(level).toBeGreaterThan(0);
            expect(level).toBeLessThanOrEqual(1);
        });
        
        it('should update audio level history', () => {
            // Add multiple updates to build history
            for (let i = 0; i < 3; i++) {
                mockAnalyser.setMockLevel(0.3 + i * 0.1);
                processor.updateAudioLevel();
            }
            
            const history = processor.getLevelHistory();
            expect(history.length).toBe(3);
            // Just verify we have a history of the right length
            expect(history.every(level => level >= 0 && level <= 1)).toBe(true);
        });
        
        it('should maintain history size limit', () => {
            const config = { historySize: 5 };
            processor.updateConfig(config);
            
            // Add more samples than history size
            for (let i = 0; i < 10; i++) {
                mockAnalyser.setMockLevel(i / 10);
                processor.updateAudioLevel();
            }
            
            const history = processor.getLevelHistory();
            expect(history.length).toBe(5);
        });
        
        it('should handle processing errors gracefully', () => {
            // First establish a non-zero level
            mockAnalyser.setMockLevel(0.5);
            processor.updateAudioLevel();
            expect(processor.getCurrentLevel()).toBeGreaterThan(0);
            
            // Simulate analyser error by making getByteFrequencyData throw
            const originalGetByteFrequencyData = mockAnalyser.getByteFrequencyData;
            mockAnalyser.getByteFrequencyData = () => {
                throw new Error('Analyser error');
            };
            
            // Should not throw and should reset level to 0
            expect(() => processor.updateAudioLevel()).not.toThrow();
            expect(processor.getCurrentLevel()).toBe(0);
            
            // Restore original method
            mockAnalyser.getByteFrequencyData = originalGetByteFrequencyData;
        });
        
        it('should not process when inactive', () => {
            processor.cleanup();
            
            const initialLevel = processor.getCurrentLevel();
            processor.updateAudioLevel();
            
            expect(processor.getCurrentLevel()).toBe(initialLevel);
        });
    });

    describe('Volume Spike Detection', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should detect volume spikes', () => {
            let spikeDetected = false;
            let spikeData = null;
            processor.onVolumeSpike((data) => {
                spikeDetected = true;
                spikeData = data;
            });
            
            // Build baseline - use values that will definitely trigger spike
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            const baselineLevel = processor.getCurrentLevel();
            const history = processor.getLevelHistory();
            
            // Create a large spike
            mockAnalyser.setMockLevel(0.5); // Much larger spike
            processor.updateAudioLevel();
            
            const spikeLevel = processor.getCurrentLevel();
            
            // Debug output if spike not detected
            if (!spikeDetected) {
                console.log('Spike detection debug:', {
                    baselineLevel,
                    spikeLevel,
                    history,
                    ratio: spikeLevel / baselineLevel,
                    config: processor.getConfig()
                });
            }
            
            expect(spikeDetected).toBe(true);
        });
        
        it('should not detect spikes below threshold', () => {
            let spikeDetected = false;
            processor.onVolumeSpike(() => {
                spikeDetected = true;
            });
            
            // Build up baseline levels
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            // Create small increase (below threshold)
            mockAnalyser.setMockLevel(0.25); // 1.25x the baseline (below 1.5x threshold)
            processor.updateAudioLevel();
            
            expect(spikeDetected).toBe(false);
        });
        
        it('should respect minimum spike interval', () => {
            let spikeCount = 0;
            processor.onVolumeSpike(() => {
                spikeCount++;
            });
            
            // Build baseline with sufficient level
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            // First spike
            mockAnalyser.setMockLevel(0.35);
            processor.updateAudioLevel();
            
            // Second spike immediately (should be ignored)
            mockAnalyser.setMockLevel(0.4);
            processor.updateAudioLevel();
            
            expect(spikeCount).toBe(1);
            
            // Advance time beyond minimum interval
            vi.spyOn(performance, 'now').mockReturnValue(2500);
            
            // Clear history and rebuild baseline for new spike detection
            processor.clearHistory();
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            // Third spike (should be detected)
            mockAnalyser.setMockLevel(0.35);
            processor.updateAudioLevel();
            
            expect(spikeCount).toBe(2);
        });
        
        it('should provide detailed spike information', () => {
            let spikeData = null;
            processor.onVolumeSpike((data) => {
                spikeData = data;
            });
            
            // Build baseline with sufficient level
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            // Create spike
            mockAnalyser.setMockLevel(0.35);
            processor.updateAudioLevel();
            
            expect(spikeData).toBeTruthy();
            expect(spikeData.level).toBeGreaterThan(0);
            expect(spikeData.spikeRatio).toBeGreaterThan(1.5);
            expect(spikeData.threshold).toBe(1.5);
            expect(spikeData.timestamp).toBeTruthy();
        });
        
        it('should require minimum baseline level for spike detection', () => {
            let spikeDetected = false;
            processor.onVolumeSpike(() => {
                spikeDetected = true;
            });
            
            // Build very low baseline (below minimum)
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.05); // Below 0.1 minimum
                processor.updateAudioLevel();
            }
            
            // Create proportional spike
            mockAnalyser.setMockLevel(0.1); // 2x baseline but still low
            processor.updateAudioLevel();
            
            expect(spikeDetected).toBe(false);
        });
    });

    describe('Event Callbacks', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should call level update callback with throttling', () => {
            let updateCount = 0;
            let lastData = null;
            
            processor.onLevelUpdate((data) => {
                updateCount++;
                lastData = data;
            });
            
            // Multiple rapid updates
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.3);
                processor.updateAudioLevel();
            }
            
            // Should be throttled to 1 call
            expect(updateCount).toBe(1);
            expect(lastData.level).toBeTruthy();
            expect(lastData.rawData).toBeInstanceOf(Uint8Array);
            expect(lastData.timestamp).toBeTruthy();
            expect(lastData.history).toBeInstanceOf(Array);
        });
        
        it('should handle callback errors gracefully', () => {
            processor.onLevelUpdate(() => {
                throw new Error('Callback error');
            });
            
            // Should not throw
            expect(() => {
                mockAnalyser.setMockLevel(0.3);
                processor.updateAudioLevel();
            }).not.toThrow();
        });
        
        it('should validate callback functions', () => {
            expect(() => {
                processor.onLevelUpdate('not a function');
            }).toThrow('Level update callback must be a function');
            
            expect(() => {
                processor.onVolumeSpike(123);
            }).toThrow('Volume spike callback must be a function');
            
            expect(() => {
                processor.onError({});
            }).toThrow('Error callback must be a function');
        });
        
        it('should remove all callbacks', () => {
            processor.onLevelUpdate(() => {});
            processor.onVolumeSpike(() => {});
            processor.onError(() => {});
            
            processor.removeAllCallbacks();
            
            // Callbacks should be cleared (no way to directly test, but no errors should occur)
            mockAnalyser.setMockLevel(0.3);
            processor.updateAudioLevel();
        });
    });

    describe('Configuration Management', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should update configuration dynamically', () => {
            const newConfig = {
                spikeThreshold: 2.0,
                historySize: 15,
                levelUpdateThrottle: 50
            };
            
            processor.updateConfig(newConfig);
            const config = processor.getConfig();
            
            expect(config.spikeThreshold).toBe(2.0);
            expect(config.historySize).toBe(15);
            expect(config.levelUpdateThrottle).toBe(50);
        });
        
        it('should update analyser settings when configuration changes', () => {
            const newConfig = {
                fftSize: 512,
                smoothingTimeConstant: 0.5
            };
            
            processor.updateConfig(newConfig);
            
            const analyser = processor.getAnalyser();
            expect(analyser.fftSize).toBe(512);
            expect(analyser.smoothingTimeConstant).toBe(0.5);
        });
        
        it('should return configuration copy to prevent external modification', () => {
            const config = processor.getConfig();
            config.spikeThreshold = 999;
            
            const actualConfig = processor.getConfig();
            expect(actualConfig.spikeThreshold).not.toBe(999);
        });
    });

    describe('Statistics and Monitoring', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should provide comprehensive statistics', () => {
            // Add some history
            for (let i = 0; i < 3; i++) {
                mockAnalyser.setMockLevel(0.2 + i * 0.1);
                processor.updateAudioLevel();
            }
            
            const stats = processor.getStats();
            
            expect(stats.isActive).toBe(true);
            expect(stats.currentLevel).toBeGreaterThan(0);
            expect(stats.historySize).toBe(3);
            expect(stats.maxHistorySize).toBe(10);
            expect(stats.averageLevel).toBeGreaterThan(0);
            expect(stats.timeSinceLastSpike).toBeGreaterThanOrEqual(0);
        });
        
        it('should calculate average level correctly', () => {
            // Add known levels
            mockAnalyser.setMockLevel(0.2);
            processor.updateAudioLevel();
            const level1 = processor.getCurrentLevel();
            
            mockAnalyser.setMockLevel(0.3);
            processor.updateAudioLevel();
            const level2 = processor.getCurrentLevel();
            
            const stats = processor.getStats();
            const expectedAverage = (level1 + level2) / 2;
            expect(stats.averageLevel).toBeCloseTo(expectedAverage, 2);
        });
        
        it('should track time since last spike', () => {
            let spikeDetected = false;
            processor.onVolumeSpike(() => {
                spikeDetected = true;
            });
            
            // Build baseline and create spike with sufficient levels
            for (let i = 0; i < 5; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            mockAnalyser.setMockLevel(0.35);
            processor.updateAudioLevel();
            
            expect(spikeDetected).toBe(true);
            
            // Advance time
            vi.spyOn(performance, 'now').mockReturnValue(2000);
            
            const stats = processor.getStats();
            expect(stats.timeSinceLastSpike).toBe(1000);
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            processor.initialize(mockAudioContext);
            mockAnalyser = processor.getAnalyser();
        });
        
        it('should return frequency data copy', () => {
            mockAnalyser.setMockLevel(0.5);
            processor.updateAudioLevel();
            
            const freqData = processor.getFrequencyData();
            expect(freqData).toBeInstanceOf(Uint8Array);
            expect(freqData.length).toBeGreaterThan(0);
            
            // Modify returned array should not affect internal state
            freqData[0] = 999;
            const freqData2 = processor.getFrequencyData();
            expect(freqData2[0]).not.toBe(999);
        });
        
        it('should return level history copy', () => {
            mockAnalyser.setMockLevel(0.3);
            processor.updateAudioLevel();
            
            const history = processor.getLevelHistory();
            expect(history).toBeInstanceOf(Array);
            
            // Modify returned array should not affect internal state
            history.push(999);
            const history2 = processor.getLevelHistory();
            expect(history2).not.toContain(999);
        });
        
        it('should clear history on demand', () => {
            // Add some history
            for (let i = 0; i < 3; i++) {
                mockAnalyser.setMockLevel(0.2);
                processor.updateAudioLevel();
            }
            
            expect(processor.getLevelHistory().length).toBe(3);
            
            processor.clearHistory();
            
            expect(processor.getLevelHistory().length).toBe(0);
        });
        
        it('should return null for frequency data when not initialized', () => {
            processor.cleanup();
            
            const freqData = processor.getFrequencyData();
            expect(freqData).toBeNull();
        });
    });

    describe('Static Methods', () => {
        it('should detect Web Audio API support', () => {
            // Mock Web Audio API availability
            const originalAudioContext = window.AudioContext;
            window.AudioContext = MockAudioContext;
            
            expect(AudioLevelProcessor.isSupported()).toBe(true);
            
            // Test without Web Audio API
            delete window.AudioContext;
            delete window.webkitAudioContext;
            
            expect(AudioLevelProcessor.isSupported()).toBe(false);
            
            // Restore
            window.AudioContext = originalAudioContext;
        });
    });

    describe('Error Handling', () => {
        it('should emit error events', () => {
            let errorData = null;
            processor.onError((data) => {
                errorData = data;
            });
            
            // Trigger error during initialization
            processor.initialize(null);
            
            expect(errorData).toBeTruthy();
            expect(errorData.message).toContain('Failed to initialize AudioLevelProcessor');
            expect(errorData.timestamp).toBeTruthy();
        });
        
        it('should handle error callback exceptions', () => {
            processor.onError(() => {
                throw new Error('Error callback error');
            });
            
            // Should not throw when error callback fails
            expect(() => {
                processor.initialize(null);
            }).not.toThrow();
        });
    });
});