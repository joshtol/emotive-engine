/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Excited Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'excited',
    emoji: '🤩',
    description: 'High energy with rapid particles',
    
    // Visual properties
    visual: {
        glowColor: '#FF6B35',       // Vibrant orange-red energy
        glowIntensity: 1.5,         // Stronger energetic aura
        particleRate: 25,           // Increased emission frequency (was 15)
        minParticles: 8,            // More constant particles (was 5)
        maxParticles: 30,           // More maximum particles (was 20)
        particleBehavior: 'burst',  // Explosive particle behavior
        breathRate: 2.0,            // Quick, excited breathing
        breathDepth: 0.14,          // Deep, energized breaths
        coreJitter: true,           // Vibrating with enthusiasm
        particleColors: [
            { color: '#FF6B35', weight: 25 },  // Vibrant orange energy
            { color: '#FF1744', weight: 20 },  // Red accent excitement
            { color: '#FFC107', weight: 15 },  // Amber sparkle
            { color: '#FF9100', weight: 15 },  // Deep orange burst
            { color: '#FFEB3B', weight: 10 },  // Yellow flash
            { color: '#FF5722', weight: 10 },  // Deep orange-red
            { color: '#FFF59D', weight: 5 }    // Pale yellow highlight
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.4,         // Quickened, energetic pace
        amplitude: 1.3,     // Expansive, enthusiastic movements
        intensity: 1.3,     // Strong energetic force
        smoothness: 0.8,    // Smooth with energetic bursts
        regularity: 0.7,    // Spontaneous, varied patterns
        addVibration: true  // Buzzing with excitement
    },
    
    // Typical gestures for excitement
    typicalGestures: ['bounce', 'spin', 'vibrate', 'expand', 'shake', 'pulse'],
    
    // Transition configuration
    transitions: { 
        duration: 300,              // Quick state entry
        easing: 'easeOutElastic',  // Bouncy, elastic entrance
        priority: 6                // High-energy priority level
    },
    
    // Rhythm configuration - excited syncs energetically to beat
    rhythm: {
        enabled: true,
        
        // Particle emission doubles on beat
        particleEmission: {
            syncMode: 'beat',
            burstSize: 5,           // Big bursts on beat
            offBeatRate: 0.5        // Calmer between beats
        },
        
        // Core jitter syncs to subdivisions
        jitterSync: {
            subdivision: 'sixteenth',  // Rapid jitter on 16th notes
            intensity: 0.8,           // Strong rhythm influence
            onBeat: 1.5              // Extra jitter on beat
        },
        
        // Glow pulses rapidly with beat
        glowSync: {
            intensityRange: [1.0, 1.8],
            syncTo: 'eighth',         // Pulse on 8th notes
            attack: 0.05,            // Very quick attack
            decay: 0.2               // Quick decay
        },
        
        // Different patterns create different excitement
        patternBehaviors: {
            'dubstep': {
                // Heavy drops create explosion effects
                particleEmission: { 
                    syncMode: 'beat',
                    burstSize: 10,      // Huge bursts on drop
                    dropMultiplier: 2   // Double on beat 3
                }
            },
            'breakbeat': {
                // Broken beats create chaotic energy
                jitterSync: {
                    subdivision: 'random',
                    intensity: 1.0
                }
            }
        }
    }
};