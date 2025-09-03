import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundSystem } from '../src/core/SoundSystem.js';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn()
    },
    connect: vi.fn()
  })),
  resume: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve())
};

describe('SoundSystem', () => {
  let soundSystem;
  let originalAudioContext;

  beforeEach(() => {
    // Mock AudioContext
    originalAudioContext = window.AudioContext;
    window.AudioContext = vi.fn(() => mockAudioContext);
    
    soundSystem = new SoundSystem();
  });

  afterEach(() => {
    // Restore original AudioContext
    window.AudioContext = originalAudioContext;
    
    if (soundSystem) {
      soundSystem.cleanup();
    }
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(soundSystem.isEnabled).toBe(false);
      expect(soundSystem.isInitialized).toBe(false);
      expect(soundSystem.masterVolume).toBe(0.5);
      expect(soundSystem.context).toBeNull();
    });

    it('should have emotional tone mappings', () => {
      expect(soundSystem.emotionalTones.size).toBe(8);
      expect(soundSystem.emotionalTones.get('neutral')).toEqual({
        frequency: 220,
        waveform: 'sine',
        volume: 0.1
      });
      expect(soundSystem.emotionalTones.get('joy')).toEqual({
        frequency: 440,
        waveform: 'triangle',
        volume: 0.15
      });
    });
  });

  describe('Static Methods', () => {
    it('should detect Web Audio API support', () => {
      expect(SoundSystem.isSupported()).toBe(true);
      
      // Test without support
      const originalAudioContext = window.AudioContext;
      delete window.AudioContext;
      delete window.webkitAudioContext;
      
      expect(SoundSystem.isSupported()).toBe(false);
      
      // Restore
      window.AudioContext = originalAudioContext;
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with Web Audio API support', async () => {
      const result = await soundSystem.initialize();
      
      expect(result).toBe(true);
      expect(soundSystem.isEnabled).toBe(true);
      expect(soundSystem.isInitialized).toBe(true);
      expect(soundSystem.context).toBe(mockAudioContext);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2); // master + effects
    });

    it('should handle suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      
      const result = await soundSystem.initialize();
      
      expect(result).toBe(true);
      expect(soundSystem.isEnabled).toBe(true);
    });

    it('should fail gracefully without Web Audio API support', async () => {
      delete window.AudioContext;
      delete window.webkitAudioContext;
      
      const result = await soundSystem.initialize();
      
      expect(result).toBe(false);
      expect(soundSystem.isEnabled).toBe(false);
      expect(soundSystem.isInitialized).toBe(false);
    });

    it('should handle initialization errors', async () => {
      window.AudioContext = vi.fn(() => {
        throw new Error('AudioContext creation failed');
      });
      
      const result = await soundSystem.initialize();
      
      expect(result).toBe(false);
      expect(soundSystem.isEnabled).toBe(false);
    });
  });

  describe('Audio Context Management', () => {
    beforeEach(async () => {
      await soundSystem.initialize();
    });

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      
      await soundSystem.resumeContext();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should handle resume errors gracefully', async () => {
      mockAudioContext.state = 'suspended';
      mockAudioContext.resume = vi.fn(() => Promise.reject(new Error('Resume failed')));
      
      // Should not throw
      await soundSystem.resumeContext();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('Volume Control', () => {
    beforeEach(async () => {
      await soundSystem.initialize();
    });

    it('should set master volume within valid range', () => {
      soundSystem.setMasterVolume(0.8);
      expect(soundSystem.getMasterVolume()).toBe(0.8);
      
      // Test clamping
      soundSystem.setMasterVolume(1.5);
      expect(soundSystem.getMasterVolume()).toBe(1.0);
      
      soundSystem.setMasterVolume(-0.5);
      expect(soundSystem.getMasterVolume()).toBe(0.0);
    });

    it('should update audio node gain when setting volume', () => {
      const gainNode = soundSystem.nodes.master;
      
      soundSystem.setMasterVolume(0.7);
      
      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.7, 0);
    });

    it('should handle volume setting when not initialized', () => {
      const uninitializedSystem = new SoundSystem();
      
      // Should not throw
      uninitializedSystem.setMasterVolume(0.5);
      expect(uninitializedSystem.getMasterVolume()).toBe(0.5);
    });
  });

  describe('Emotional Tones', () => {
    it('should return correct emotional tone configuration', () => {
      const neutralTone = soundSystem.getEmotionalTone('neutral');
      expect(neutralTone).toEqual({
        frequency: 220,
        waveform: 'sine',
        volume: 0.1
      });

      const joyTone = soundSystem.getEmotionalTone('joy');
      expect(joyTone).toEqual({
        frequency: 440,
        waveform: 'triangle',
        volume: 0.15
      });
    });

    it('should return null for unknown emotions', () => {
      const unknownTone = soundSystem.getEmotionalTone('unknown');
      expect(unknownTone).toBeNull();
    });

    it('should have all 8 emotional states mapped', () => {
      const emotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love'];
      
      emotions.forEach(emotion => {
        const tone = soundSystem.getEmotionalTone(emotion);
        expect(tone).toBeTruthy();
        expect(tone).toHaveProperty('frequency');
        expect(tone).toHaveProperty('waveform');
        expect(tone).toHaveProperty('volume');
      });
    });
  });

  describe('Availability Check', () => {
    it('should return false when not initialized', () => {
      expect(soundSystem.isAvailable()).toBe(false);
    });

    it('should return true when properly initialized', async () => {
      await soundSystem.initialize();
      expect(soundSystem.isAvailable()).toBe(true);
    });

    it('should return false when initialization failed', async () => {
      delete window.AudioContext;
      await soundSystem.initialize();
      expect(soundSystem.isAvailable()).toBe(false);
    });
  });

  describe('Ambient Tones', () => {
    let mockOscillator;
    let mockGainNode;

    beforeEach(async () => {
      mockOscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };

      mockGainNode = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        connect: vi.fn()
      };

      mockAudioContext.createOscillator = vi.fn(() => mockOscillator);
      mockAudioContext.createGain = vi.fn(() => mockGainNode);

      await soundSystem.initialize();
    });

    it('should set ambient tone for valid emotion', () => {
      soundSystem.setAmbientTone('neutral');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('sine');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(220, 0);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(soundSystem.currentOscillator).toBe(mockOscillator);
    });

    it('should handle invalid emotion gracefully', () => {
      soundSystem.setAmbientTone('invalid');

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
      expect(soundSystem.currentOscillator).toBeNull();
    });

    it('should transition between different emotional tones', () => {
      // Set initial tone
      soundSystem.setAmbientTone('neutral');
      const firstOscillator = soundSystem.currentOscillator;
      const firstGain = soundSystem.currentGain;

      // Reset mocks to track second call
      mockAudioContext.createOscillator.mockClear();
      mockAudioContext.createGain.mockClear();

      // Set new tone
      soundSystem.setAmbientTone('joy');

      // Should stop previous oscillator
      expect(firstGain.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
      expect(firstOscillator.stop).toHaveBeenCalled();

      // Should create new oscillator
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
      expect(mockOscillator.type).toBe('triangle');
    });

    it('should stop ambient tone with fade out', () => {
      soundSystem.setAmbientTone('neutral');
      const oscillator = soundSystem.currentOscillator;
      const gain = soundSystem.currentGain;

      soundSystem.stopAmbientTone();

      expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 0.5);
      expect(oscillator.stop).toHaveBeenCalledWith(0.5);
      expect(soundSystem.currentOscillator).toBeNull();
      expect(soundSystem.currentGain).toBeNull();
    });

    it('should handle ambient tone operations when not initialized', () => {
      const uninitializedSystem = new SoundSystem();

      // Should not throw
      uninitializedSystem.setAmbientTone('neutral');
      uninitializedSystem.stopAmbientTone();
      uninitializedSystem.updateAmbientVolume('joy');

      expect(uninitializedSystem.currentOscillator).toBeNull();
    });

    it('should update ambient volume when master volume changes', () => {
      soundSystem.setAmbientTone('joy');
      const gain = soundSystem.currentGain;

      soundSystem.setMasterVolume(0.8, 'joy');

      expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.15 * 0.8, 0.1);
    });

    it('should handle ambient tone errors gracefully', () => {
      mockAudioContext.createOscillator = vi.fn(() => {
        throw new Error('Oscillator creation failed');
      });

      // Should not throw
      soundSystem.setAmbientTone('neutral');

      expect(soundSystem.currentOscillator).toBeNull();
    });
  });

  describe('Gesture Sound Effects', () => {
    let mockOscillator;
    let mockGainNode;

    beforeEach(async () => {
      mockOscillator = {
        type: 'sine',
        frequency: { 
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };

      mockGainNode = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        connect: vi.fn()
      };

      mockAudioContext.createOscillator = vi.fn(() => mockOscillator);
      mockAudioContext.createGain = vi.fn(() => mockGainNode);

      await soundSystem.initialize();
    });

    it('should play bounce gesture sound with correct configuration', () => {
      soundSystem.playGestureSound('bounce');

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('triangle');
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.1); // 100ms duration
    });

    it('should play pulse gesture sound with swell envelope', () => {
      soundSystem.playGestureSound('pulse');

      expect(mockOscillator.type).toBe('sine');
      expect(mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(300, 0);
      expect(mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(450, 0.15);
      expect(mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(300, 0.3);
    });

    it('should apply emotional context modifiers', () => {
      soundSystem.playGestureSound('bounce', 'anger');

      // Anger should increase intensity (1.5x)
      // Base volume: 0.3, master volume: 0.5, anger intensity: 1.5
      // Expected base volume: 0.3 * 0.5 * 1.5 = 0.225
      const expectedBaseVolume = 0.3 * 0.5 * 1.5;
      
      // Check that volume envelope is applied with modified base volume
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(expectedBaseVolume * 1.0, 0); // First envelope point
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(expectedBaseVolume * 0.8, expect.any(Number)); // Second envelope point
    });

    it('should handle unknown gesture gracefully', () => {
      soundSystem.playGestureSound('unknown');

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle gesture sound errors gracefully', () => {
      mockAudioContext.createOscillator = vi.fn(() => {
        throw new Error('Oscillator creation failed');
      });

      // Should not throw
      soundSystem.playGestureSound('bounce');
    });

    it('should get correct gesture sound configurations', () => {
      const bounceConfig = soundSystem.getGestureSoundConfig('bounce');
      expect(bounceConfig).toEqual({
        duration: 100,
        waveform: 'triangle',
        volume: 0.3,
        frequencyEnvelope: [
          { time: 0, frequency: 200 },
          { time: 0.5, frequency: 400 },
          { time: 1, frequency: 300 }
        ],
        volumeEnvelope: [
          { time: 0, volume: 1.0 },
          { time: 0.1, volume: 0.8 },
          { time: 1, volume: 0.0 }
        ]
      });

      const pulseConfig = soundSystem.getGestureSoundConfig('pulse');
      expect(pulseConfig.duration).toBe(300);
      expect(pulseConfig.waveform).toBe('sine');
    });

    it('should return null for unknown gesture sound', () => {
      const unknownConfig = soundSystem.getGestureSoundConfig('unknown');
      expect(unknownConfig).toBeNull();
    });

    it('should have all 10 gesture sounds configured', () => {
      const gestures = ['bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt', 'expand', 'contract', 'flash', 'drift'];
      
      gestures.forEach(gesture => {
        const config = soundSystem.getGestureSoundConfig(gesture);
        expect(config).toBeTruthy();
        expect(config).toHaveProperty('duration');
        expect(config).toHaveProperty('waveform');
        expect(config).toHaveProperty('volume');
        expect(config).toHaveProperty('frequencyEnvelope');
        expect(config).toHaveProperty('volumeEnvelope');
      });
    });

    it('should get correct emotional modifiers', () => {
      const neutralMods = soundSystem.getEmotionalModifiers('neutral');
      expect(neutralMods).toEqual({ intensity: 1.0, speed: 1.0 });

      const angerMods = soundSystem.getEmotionalModifiers('anger');
      expect(angerMods).toEqual({ intensity: 1.5, speed: 1.4 });

      const sadnessMods = soundSystem.getEmotionalModifiers('sadness');
      expect(sadnessMods).toEqual({ intensity: 0.6, speed: 0.8 });

      // Unknown emotion should default to neutral
      const unknownMods = soundSystem.getEmotionalModifiers('unknown');
      expect(unknownMods).toEqual({ intensity: 1.0, speed: 1.0 });
    });

    it('should handle gesture sounds when not initialized', () => {
      const uninitializedSystem = new SoundSystem();

      // Should not throw
      uninitializedSystem.playGestureSound('bounce');
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources properly', async () => {
      await soundSystem.initialize();
      
      soundSystem.cleanup();
      
      expect(soundSystem.context).toBeNull();
      expect(soundSystem.isEnabled).toBe(false);
      expect(soundSystem.isInitialized).toBe(false);
      expect(soundSystem.currentOscillator).toBeNull();
      expect(soundSystem.currentGain).toBeNull();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      await soundSystem.initialize();
      mockAudioContext.close = vi.fn(() => {
        throw new Error('Close failed');
      });
      
      // Should not throw
      soundSystem.cleanup();
      
      expect(soundSystem.isEnabled).toBe(false);
    });

    it('should handle cleanup when not initialized', () => {
      // Should not throw
      soundSystem.cleanup();
      
      expect(soundSystem.isEnabled).toBe(false);
    });

    it('should stop oscillator during cleanup', async () => {
      const mockOscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };

      mockAudioContext.createOscillator = vi.fn(() => mockOscillator);
      mockAudioContext.createGain = vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        connect: vi.fn()
      }));

      await soundSystem.initialize();
      soundSystem.setAmbientTone('neutral');

      soundSystem.cleanup();

      expect(mockOscillator.stop).toHaveBeenCalled();
      expect(soundSystem.currentOscillator).toBeNull();
    });
  });
});