/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rhythm Integration Module
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * @fileoverview Integration layer between rhythm engine and existing subsystems
 * @author Emotive Engine Team
 * @module core/rhythmIntegration
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║ CONCEPT                                                                           
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This module connects the rhythm engine to existing subsystems without modifying   
 * ║ their core behavior. It reads rhythm configurations from individual files and     
 * ║ applies timing modulations based on musical events.                              
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 * 
 * INTEGRATION POINTS:
 * • Particle System - Emission timing, behavior modulation
 * • Gesture System - Animation sync, duration adjustment
 * • Emotion System - Intensity mapping, transition timing
 * • Renderer - Glow pulsing, visual effects sync
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────────┐
 * │  MODULAR RHYTHM FLOW                                                             │
 * │                                                                                   │
 * │  gesture.js ──┐                                                                  │
 * │  emotion.js ──┼→ [Integration] ← [Rhythm Engine]                                │
 * │  behavior.js ─┘         ↓                                                        │
 * │                   Apply Timing                                                   │
 * │                                                                                   │
 * └──────────────────────────────────────────────────────────────────────────────────┘
 */

import rhythmEngine from './rhythm.js';
import { RhythmInputEvaluator } from './RhythmInputEvaluator.js';

class RhythmIntegration {
    constructor() {
        this.enabled = false;
        this.adapter = null;
        this.subsystemConfigs = new Map();
        this.activeModulations = new Map();
        this._inputEvaluator = null;
    }
    
    /**
     * Initialize rhythm integration
     */
    initialize() {
        this.adapter = rhythmEngine.getAdapter();
        this.enabled = true;
        
        // Subscribe to rhythm events
        this.adapter.onBeat(this.handleBeat.bind(this));
        this.adapter.onBar(this.handleBar.bind(this));
        
    }
    
    /**
     * Update BPM from detected audio
     * @param {number} newBPM - Detected BPM from audio analysis
     */
    updateBPM(newBPM) {
        if (newBPM >= 60 && newBPM <= 220) {
            // Check if rhythm was manually stopped
            if (window.rhythmManuallyStoppedForCurrentAudio) {
                return; // Don't auto-update if manually stopped
            }

            // Auto-start rhythm engine if not running
            if (!rhythmEngine.isRunning) {

                // Auto-start the rhythm engine for gesture sync
                this.start(newBPM, 'straight');

                // Trigger the rhythm sync visualizer to show BPM
                if (window.rhythmSyncVisualizer && !window.rhythmSyncVisualizer.state.active) {
                    // Rhythm integration logging removed for production
                    window.rhythmSyncVisualizer.start();
                }

                return;
            }
            
            // If running, always update BPM regardless of whether it changed
            // This ensures new tracks get their correct BPM
            rhythmEngine.setBPM(newBPM);
            
            // BPM is now shown visually through the beat histogram bars
        }
    }
    
    /**
     * Register a subsystem's rhythm configuration
     * Called when loading gestures, emotions, behaviors, etc.
     */
    registerConfig(type, name, config) {
        if (!config.rhythm || !config.rhythm.enabled) return;
        
        const key = `${type}:${name}`;
        this.subsystemConfigs.set(key, {
            type,
            name,
            rhythmConfig: config.rhythm,
            originalConfig: config
        });
        
    }
    
    /**
     * Apply rhythm modulation to a gesture
     */
    applyGestureRhythm(gesture, _particle, _progress, _dt) {
        if (!this.enabled || !gesture.rhythm?.enabled) return {};
        

        const rhythmConfig = gesture.rhythm;
        const modulation = {};
        
        // Apply amplitude sync
        if (rhythmConfig.amplitudeSync) {
            const sync = rhythmConfig.amplitudeSync;
            const beatSync = this.adapter.getBeatSync(
                sync.offBeat || 0.8,
                sync.onBeat || 1.5,
                sync.curve || 'linear'
            );
            modulation.amplitudeMultiplier = beatSync;
        }
        
        // Apply wobble sync
        if (rhythmConfig.wobbleSync) {
            const sync = rhythmConfig.wobbleSync;
            if (this.adapter.isOnSubdivision(sync.subdivision, 0.1)) {
                modulation.wobbleMultiplier = 1 + sync.intensity;
            } else {
                modulation.wobbleMultiplier = 1;
            }
        }
        
        // Apply accent response
        if (rhythmConfig.accentResponse?.enabled) {
            const accentedValue = this.adapter.getAccentedValue(
                1,
                rhythmConfig.accentResponse.multiplier || 1.5
            );
            modulation.accentMultiplier = accentedValue;
        }
        
        // Apply pattern overrides
        const currentPattern = this.adapter.getPattern();
        if (currentPattern && rhythmConfig.patternOverrides?.[currentPattern]) {
            Object.assign(modulation, rhythmConfig.patternOverrides[currentPattern]);
        }
        
        return modulation;
    }
    
    /**
     * Apply rhythm modulation to particle emission
     */
    applyParticleRhythm(emotionState, _particleSystem) {
        if (!this.enabled || !emotionState.rhythm?.enabled) return {};
        
        const timeInfo = this.adapter.getTimeInfo();
        const rhythmConfig = emotionState.rhythm;
        const modulation = {};
        
        // Particle emission sync
        if (rhythmConfig.particleEmission) {
            const emission = rhythmConfig.particleEmission;
            
            if (emission.syncMode === 'beat' && this.adapter.isOnBeat(0.1)) {
                // Emit burst on beat
                modulation.emitBurst = emission.burstSize || 3;
            } else if (emission.offBeatRate !== undefined) {
                // Reduce emission between beats
                modulation.emissionRate = emission.offBeatRate;
            }
        }
        
        // Glow sync
        if (rhythmConfig.glowSync) {
            const glow = rhythmConfig.glowSync;
            const glowIntensity = this.adapter.getBeatSync(
                glow.intensityRange[0] || 1.0,
                glow.intensityRange[1] || 2.0,
                'pulse'
            );
            modulation.glowIntensity = glowIntensity;
        }
        
        // Breathing sync
        if (rhythmConfig.breathSync?.mode === 'bars') {
            const breath = rhythmConfig.breathSync;
            const barsElapsed = timeInfo.bar % breath.barsPerBreath;
            const breathProgress = barsElapsed / breath.barsPerBreath;
            modulation.breathPhase = breathProgress * Math.PI * 2;
        }
        
        return modulation;
    }
    
    /**
     * Apply rhythm to particle behavior
     */
    applyBehaviorRhythm(behavior, _particle, _dt) {
        if (!this.enabled || !behavior.rhythm?.enabled) return {};
        
        const timeInfo = this.adapter.getTimeInfo();
        const rhythmConfig = behavior.rhythm;
        const modulation = {};
        
        // Glitch timing for glitchy behavior
        if (rhythmConfig.glitchTiming) {
            const glitch = rhythmConfig.glitchTiming;
            const isOnSubdivision = this.adapter.isOnSubdivision(glitch.subdivision, 0.05);
            
            if (isOnSubdivision && Math.random() < glitch.probability) {
                const intensity = this.adapter.isOnBeat() 
                    ? glitch.intensityOnBeat 
                    : glitch.intensityOffBeat;
                modulation.triggerGlitch = true;
                modulation.glitchIntensity = intensity;
            }
        }
        
        // Orbital rhythm
        if (rhythmConfig.orbitRhythm) {
            const orbit = rhythmConfig.orbitRhythm;
            
            if (orbit.baseSpeed === 'tempo') {
                modulation.speedMultiplier = this.adapter.getBPM() / 120; // Normalize to 120 BPM
            }
            
            if (orbit.beatAcceleration && this.adapter.isOnBeat(0.1)) {
                modulation.speedBoost = orbit.beatAcceleration;
            }
            
            if (orbit.barReset && timeInfo.beatInBar === 0) {
                modulation.resetOrbit = true;
            }
        }
        
        // Stutter sync
        if (rhythmConfig.stutterSync) {
            const stutter = rhythmConfig.stutterSync;
            const pattern = this.adapter.getPattern();
            
            if (pattern && stutter.patterns?.[pattern]) {
                const patternConfig = stutter.patterns[pattern];
                
                if (patternConfig.freezeOnDrop && timeInfo.beatInBar === 2) {
                    modulation.freeze = true;
                    modulation.freezeDuration = patternConfig.dropDuration;
                } else if (patternConfig.randomFreeze && Math.random() < patternConfig.randomFreeze) {
                    modulation.freeze = true;
                    modulation.freezeDuration = patternConfig.duration;
                }
            }
        }
        
        return modulation;
    }
    
    /**
     * Handle beat event
     */
    handleBeat(beatInfo) {
        // Store beat info for subsystems to access
        this.lastBeatInfo = beatInfo;
        
        // Could trigger specific effects here if needed
        // But mainly subsystems will query rhythm state during their update
    }
    
    /**
     * Handle bar event
     */
    handleBar(barInfo) {
        // Store bar info for subsystems to access
        this.lastBarInfo = barInfo;
    }
    
    /**
     * Get duration adjusted for musical time
     */
    getMusicalDuration(rhythmConfig, originalDuration) {
        if (!this.enabled || !rhythmConfig?.durationSync) return originalDuration;
        
        const sync = rhythmConfig.durationSync;
        
        if (sync.mode === 'bars') {
            return this.adapter.beatsToMs(sync.bars * 4); // Assuming 4/4 time
        } else if (sync.mode === 'beats') {
            return this.adapter.beatsToMs(sync.beats);
        }
        
        return originalDuration;
    }
    
    /**
     * Check if rhythm is enabled globally
     */
    isEnabled() {
        return this.enabled && this.adapter.isPlaying();
    }
    
    /**
     * Start rhythm playback
     */
    start(bpm = 120, pattern = 'straight') {
        if (bpm) rhythmEngine.setBPM(bpm);
        if (pattern) rhythmEngine.setPattern(pattern);
        rhythmEngine.start();
        this.enabled = true;
    }
    
    /**
     * Stop rhythm playback
     */
    stop() {
        rhythmEngine.stop();
        this.enabled = false;
        // Unlock BPM when stopping
        this.bpmLocked = false;
        this.lockedBPM = null;
    }
    
    /**
     * Set rhythm pattern
     */
    setPattern(pattern) {
        rhythmEngine.setPattern(pattern);
    }
    
    /**
     * Set BPM
     */
    setBPM(bpm) {
        rhythmEngine.setBPM(bpm);
        // Update the locked BPM if manually changed
        if (this.bpmLocked) {
            this.lockedBPM = bpm;
            // BPM locking logging removed for production
        }
    }
    
    /**
     * Resample BPM - unlocks detection for one update
     */
    resampleBPM() {
        // BPM resampling logging removed for production
        this.bpmLocked = false;
        this.lockedBPM = null;
    }
    
    /**
     * Set time signature from detected pattern
     */
    setTimeSignature(signature) {
        this.timeSignature = signature;
        
        // Update UI if available
        const timeSigDisplay = document.getElementById('time-sig-display');
        if (timeSigDisplay) {
            timeSigDisplay.textContent = signature;
        }
        
        // Could update rhythm patterns based on time signature here
        // For example, switch to waltz pattern for 3/4
        if (signature === '3/4' && rhythmEngine.getPattern() !== 'waltz') {
            // Could auto-switch to waltz pattern
            // rhythmEngine.setPattern('waltz');
        }
    }
    
    /**
     * Get (or lazily create) the rhythm input evaluator.
     * @param {Object} [config] - Optional config overrides
     * @returns {RhythmInputEvaluator}
     */
    getInputEvaluator(config) {
        if (!this._inputEvaluator) {
            if (!this.adapter) this.initialize();
            this._inputEvaluator = new RhythmInputEvaluator(this.adapter, config);
        }
        return this._inputEvaluator;
    }

    /**
     * Get the effective BPM accounting for emotion modifiers (UP-RESONANCE-2 Feature 8).
     * @param {Object} [stateMachine] - EmotiveStateMachine for rhythm modifiers
     * @returns {number} Composite BPM
     */
    getEffectiveBPM(stateMachine) {
        if (!this.adapter) return 120;
        let bpm = this.adapter.getBPM();
        if (stateMachine && typeof stateMachine.getCurrentRhythmModifiers === 'function') {
            const mods = stateMachine.getCurrentRhythmModifiers();
            if (mods.tempoShift) bpm *= (1 + mods.tempoShift);
        }
        return Math.round(bpm * 100) / 100;
    }

    /**
     * Sync to external audio
     */
    syncToAudio(audioContext, audioSource) {
        rhythmEngine.syncToAudio(audioContext, audioSource);
    }
}

// Create singleton instance
const rhythmIntegration = new RhythmIntegration();

export { rhythmIntegration, RhythmIntegration };
export default rhythmIntegration;