/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Disgust Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'disgust',
    emoji: '🤢',
    description: 'Revulsion with repelling particles',
    
    // Visual properties
    visual: {
        glowColor: '#84CFC5',       // Sickly cyan-green tone
        glowIntensity: 0.9,         // Subdued, nauseated glow
        particleRate: 12,           // Moderate particle generation
        minParticles: 5,            // Maintain visible repulsion
        maxParticles: 12,           // Controlled rejection display
        particleBehavior: 'repelling', // Particles flee from center
        breathRate: 0.7,            // Slow, queasy breathing
        breathDepth: 0.04,          // Shallow, uncomfortable breaths
        coreJitter: false,          // Stable but uneasy core
        particleColors: [
            { color: '#84CFC5', weight: 30 },  // Primary sickly cyan
            { color: '#9BB8B3', weight: 20 },  // Muted gray-green
            { color: '#00FFD9', weight: 20 },  // Sharp nauseating accent
            { color: '#A8E6DD', weight: 15 },  // Pale queasy highlights
            { color: '#4A8A80', weight: 15 }   // Deep unsettled undertone
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.9,        // Slightly slowed movements
        amplitude: 0.7,    // Restricted, withdrawn motion
        intensity: 0.9,    // Controlled repulsion force
        smoothness: 0.8,   // Mostly smooth with discomfort
        regularity: 1.0,   // Consistent rejection pattern
        addRecoil: true    // Recoiling motion effect
    },
    
    // Typical gestures for disgust
    typicalGestures: ['contract', 'shake', 'recoil', 'wobble'],
    
    // Transition configuration
    transitions: { 
        duration: 600,       // Moderate transition speed
        easing: 'easeIn',   // Gradual onset of revulsion
        priority: 4         // Mid-level priority state
    }
};