/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Love Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'love',
    emoji: '💕',
    description: 'Warm affection with orbiting particles',
    
    // Visual properties
    visual: {
        glowColor: '#FF1493',       // Deep passionate pink (DeepPink)
        glowIntensity: 1.8,         // Strong, radiant warmth
        particleRate: 25,           // Generous particle flow
        minParticles: 10,           // Constant loving presence
        maxParticles: 18,           // Abundant affection display
        particleBehavior: 'orbiting', // Particles orbit romantically
        breathRate: 0.75,           // Slow, content breathing
        breathDepth: 0.15,          // Deep, satisfied breaths
        coreJitter: false,          // Stable, secure feeling
        particleColors: [
            { color: '#FF1493', weight: 30 },  // Deep passionate pink
            { color: '#FF69B4', weight: 25 },  // Hot pink
            { color: '#FF007F', weight: 15 },  // Rose red
            { color: '#FFB6C1', weight: 10 },  // Light pink highlights
            { color: '#FF45A0', weight: 10 },  // Vibrant magenta
            { color: '#E91E63', weight: 5 },   // Material pink accent
            { color: '#FFC0CB', weight: 5 }    // Soft pink glow
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.9,         // Gentle, romantic pace
        amplitude: 1.1,     // Slightly expanded movements
        intensity: 1.2,     // Enhanced emotional depth
        smoothness: 1.4,    // Extra smooth, flowing motion
        regularity: 1.2,    // Consistent, rhythmic patterns
        addWarmth: true     // Warm, inviting quality
    },
    
    // Typical gestures for love
    typicalGestures: ['pulse', 'sway', 'orbit', 'glow', 'breathe', 'float'],
    
    // Transition configuration
    transitions: { 
        duration: 700,         // Gradual emotional shift
        easing: 'easeInOut',  // Smooth, gentle transition
        priority: 5           // Moderate emotional priority
    },
    
    // Rhythm configuration - how love emotion responds to musical timing
    rhythm: {
        enabled: true,
        
        // Particle emission syncs to rhythm
        particleEmission: {
            syncMode: 'beat',        // Emit bursts on beat
            burstSize: 3,            // Extra particles per beat
            offBeatRate: 0.7         // Reduced emission between beats
        },
        
        // Orbital motion rhythm
        orbitalSync: {
            speedMultiplier: {
                onBeat: 1.2,         // Speed up on beat
                offBeat: 0.9,        // Slow between beats
                curve: 'ease'        // Smooth speed changes
            },
            radiusSync: {
                enabled: true,
                subdivision: 'quarter',  // Pulse radius on quarters
                amount: 0.15            // 15% radius variation
            }
        },
        
        // Glow pulsing with rhythm
        glowSync: {
            intensityRange: [1.4, 2.0],  // Min/max glow intensity
            syncTo: 'beat',              // Pulse on beats
            attack: 0.1,                 // Quick brightening
            decay: 0.6                   // Gentle fade
        },
        
        // Breathing synced to bars
        breathSync: {
            mode: 'bars',
            barsPerBreath: 2,    // One breath every 2 bars
            intensity: 1.0        // Full sync strength
        },
        
        // Pattern-specific overrides
        patternBehaviors: {
            'waltz': {
                // 3/4 time creates romantic swaying
                orbitalSync: { 
                    radiusSync: { subdivision: 'bar', amount: 0.25 }
                },
                particleEmission: { syncMode: 'bar', burstSize: 5 }
            },
            'swing': {
                // Jazzy, playful love
                orbitalSync: {
                    speedMultiplier: { onBeat: 1.5, curve: 'bounce' }
                }
            }
        },
        
        // Intensity modulation
        intensityMapping: {
            low: { particleRate: 0.6, glowIntensity: 0.8 },
            medium: { particleRate: 1.0, glowIntensity: 1.0 },
            high: { particleRate: 1.4, glowIntensity: 1.3 }
        }
    }
};