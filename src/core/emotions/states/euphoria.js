/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Euphoria Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'euphoria',
    emoji: '🌟',
    description: 'Radiant hope and new beginnings',
    
    // Visual properties
    visual: {
        glowColor: '#FFD700',       // Golden radiance
        glowIntensity: 1.8,         // Brilliant, transcendent glow
        particleRate: 3,            // Steady, confident emission
        minParticles: 15,           // Abundant positive energy
        maxParticles: 30,           // Maximum radiant display
        particleBehavior: 'radiant', // Outward radiating particles
        breathRate: 1.3,            // Elevated, joyful breathing
        breathDepth: 0.25,          // Full, satisfied breaths
        coreJitter: false,          // Stable, confident core
        particleColors: [
            { color: '#FFD700', weight: 30 },  // Primary golden radiance
            { color: '#C4B888', weight: 20 },  // Warm champagne glow
            { color: '#FFFF00', weight: 20 },  // Pure light accent
            { color: '#FFE57F', weight: 15 },  // Soft golden highlights
            { color: '#B39A00', weight: 15 }   // Rich golden depth
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.4,         // Energized, flowing pace
        amplitude: 1.5,     // Expansive, reaching movements
        intensity: 1.6,     // Powerful positive force
        smoothness: 1.3,    // Extra fluid, graceful motion
        regularity: 0.8,    // Natural variation in rhythm
        addWarmth: true,    // Warm, inviting quality
        addLift: true       // Upward, elevating tendency
    },
    
    // Typical gestures for euphoria
    typicalGestures: ['expand', 'radiate', 'pulse', 'glow', 'float', 'bloom'],
    
    // Transition configuration
    transitions: { 
        duration: 600,           // Smooth emergence
        easing: 'easeOutExpo',  // Explosive, radiant entrance
        priority: 8             // High priority transcendent state
    }
};