/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'suspicion',
    emoji: '🤨',
    description: 'Watchful alertness with scanning particles',
    
    // Visual properties
    visual: {
        glowColor: '#8B7355',       // Cautious brown-amber
        glowIntensity: 0.85,        // Subdued, watchful glow
        particleRate: 15,           // Moderate probing emission
        minParticles: 4,            // Constant vigilant presence
        maxParticles: 8,            // Limited cautious display
        particleBehavior: 'burst',  // Investigative bursts
        breathRate: 0.8,            // Controlled, measured breathing
        breathDepth: 0.05,          // Shallow, careful breaths
        coreJitter: false,          // Still, observant core
        particleColors: [
            { color: '#8B7355', weight: 30 },  // Primary suspicious brown
            { color: '#9A8A7A', weight: 20 },  // Neutral observation tone
            { color: '#A67C52', weight: 20 },  // Alert amber accent
            { color: '#B39880', weight: 15 },  // Light scrutiny highlights
            { color: '#5C4A3A', weight: 15 }   // Deep distrust shadows
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.8,         // Cautious, deliberate pace
        amplitude: 0.9,     // Slightly restricted range
        intensity: 0.9,     // Controlled investigation force
        smoothness: 0.9,    // Mostly smooth observation
        regularity: 0.6,    // Irregular, unpredictable scanning
        addWobble: true     // Uncertain, questioning motion
    },
    
    // Typical gestures for suspicion
    typicalGestures: ['scan', 'tilt', 'squint', 'peer', 'wobble'],
    
    // Transition configuration
    transitions: { 
        duration: 500,       // Moderate alertness shift
        easing: 'linear',   // Steady, controlled transition
        priority: 4         // Mid-level alert priority
    },
    
    // Special suspicion properties
    special: {
        coreSquint: 0.4,        // Eye narrowing amount
        scanInterval: 3000,     // Time between scans
        scanDuration: 800,      // Length of scanning motion
        scanAngle: 45          // Scanning angle range
    }
};