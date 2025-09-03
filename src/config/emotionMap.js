/**
 * Emotive-style emotion visual mapping
 * Maps emotional states to visual parameters for the classic Emotive renderer
 */

export const emotionMap = {
    // Base emotions with Emotive-style visual parameters
    neutral: {
        glowColor: '#14B8A6',      // Original teal
        glowIntensity: 1.0,
        particleRate: 5,           // Moderate particle rate for visibility
        minParticles: 3,           // Always have at least 3 particles for gestures
        maxParticles: 6,           // Max 6 particles
        particleBehavior: 'ambient',
        breathRate: 1.0,           // Normal: 12-20 breaths/min (avg 16)
        breathDepth: 0.08,         // 8% size variation for visible breathing
        coreJitter: false,
        particleColors: ['#14B8A6', '#818CF8']
    },
    
    joy: {
        glowColor: '#FFD700',       // Warm gold
        glowIntensity: 1.3,
        particleRate: 12,          // Moderate particles for joy
        minParticles: 2,
        maxParticles: 4,
        particleBehavior: 'rising',
        breathRate: 1.5,           // Joy/Happiness: 20-30 breaths/min (excited)
        breathDepth: 0.10,         // 10% size variation - deeper excitement
        coreJitter: false,
        particleColors: ['#FFD700', '#FFA500']
    },
    
    sadness: {
        glowColor: '#4169E1',       // Deep blue
        glowIntensity: 0.7,
        particleRate: 8,           // Moderate particles for sadness
        minParticles: 1,
        maxParticles: 3,
        particleBehavior: 'falling',
        breathRate: 0.6,           // Sadness: 10-12 breaths/min (slow, sighing)
        breathDepth: 0.12,         // 12% size variation - deep sighs
        coreJitter: false,
        particleColors: ['#4169E1', '#1E90FF']
    },
    
    anger: {
        glowColor: '#DC143C',       // Crimson
        glowIntensity: 1.4,
        particleRate: 15,           // Reduced from 30 to prevent extreme behavior
        minParticles: 3,
        maxParticles: 8,
        particleBehavior: 'aggressive',
        breathRate: 2.2,           // Anger: 30-40 breaths/min (rapid, intense)
        breathDepth: 0.15,         // 15% size variation - heavy, forceful breathing
        coreJitter: true,          // Shake with anger
        particleColors: ['#DC143C', '#FF0000']
    },
    
    fear: {
        glowColor: '#8B008B',       // Dark magenta
        glowIntensity: 0.8,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 6,
        particleBehavior: 'scattering',
        breathRate: 2.5,           // Fear/Anxiety: 25-45 breaths/min (hyperventilation)
        breathDepth: 0.06,         // 6% size variation - very shallow, rapid breaths
        coreJitter: true,          // Trembling
        particleColors: ['#8B008B', '#9370DB']
    },
    
    surprise: {
        glowColor: '#FF8C00',       // Dark orange
        glowIntensity: 1.4,
        particleRate: 18,
        minParticles: 3,
        maxParticles: 10,
        particleBehavior: 'burst',
        breathRate: 0.3,           // Surprise: Initial gasp then pause (6-8 breaths/min)
        breathDepth: 0.20,         // 20% size variation - huge initial gasp
        coreJitter: false,
        particleColors: ['#FF8C00', '#FF6347']
    },
    
    disgust: {
        glowColor: '#9ACD32',       // Yellow-green
        glowIntensity: 0.9,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 4,
        particleBehavior: 'repelling',
        breathRate: 0.7,           // Disgust: 10-14 breaths/min (breath holding)
        breathDepth: 0.04,         // 4% size variation - restricted, shallow breathing
        coreJitter: false,
        particleColors: ['#9ACD32', '#ADFF2F']
    },
    
    love: {
        glowColor: '#FF69B4',       // Hot pink
        glowIntensity: 1.1,
        particleRate: 10,          // Moderate particles for love
        minParticles: 2,
        maxParticles: 5,
        particleBehavior: 'orbiting',
        breathRate: 0.85,          // Love/Contentment: 12-16 breaths/min (calm, deep)
        breathDepth: 0.11,         // 11% size variation - full, satisfied breaths
        coreJitter: false,
        particleColors: ['#FF69B4', '#FF1493']
    },
    
    suspicion: {
        glowColor: '#8B7355',       // Amber-brown, watchful color
        glowIntensity: 0.85,        // Slightly dimmed, cautious
        particleRate: 15,           // Higher rate for continuous particles
        minParticles: 4,
        maxParticles: 8,            // Lower max to allow continuous spawning
        particleBehavior: 'burst',  // Use burst but modify for suspicion
        breathRate: 0.8,            // Suspicion: 10-15 breaths/min (controlled, watching)
        breathDepth: 0.05,          // 5% size variation - shallow, controlled breathing
        coreJitter: false,
        particleColors: ['#8B7355', '#A0826D', '#704214'], // Amber to dark brown
        // Special properties for suspicion
        coreSquint: 0.4,            // Narrows the orb by 40%
        scanInterval: 3000,         // Peer around every 3 seconds
        scanDuration: 800,          // Quick scanning motion
        scanAngle: 45               // Degrees to look left/right
    },
    
    resting: {
        glowColor: '#7C3AED',       // Soft purple
        glowIntensity: 0.8,
        particleRate: 10,           // Visible particles
        minParticles: 3,
        maxParticles: 5,
        particleBehavior: 'resting',
        breathRate: 0.8,            // Human resting: 12-16 breaths/min
        breathDepth: 0.12,          // 12% - natural resting breath depth
        coreJitter: false,
        particleColors: ['#7C3AED', '#9333EA', '#A855F7']
    },
    
    // Special states from original Emotive
    connecting: {
        glowColor: '#14B8A6',       // Teal
        glowIntensity: 1.5,         // Brighter during connection
        particleRate: 15,           // Moderate particles when connecting
        particleBehavior: 'connecting',
        breathRate: 1.5,            // Faster breathing during connection
        breathDepth: 0.10,
        coreJitter: true,           // Jitter while connecting
        particleColors: ['#14B8A6', '#10B981']
    },
    
    thinking: {
        glowColor: '#818CF8',       // Indigo
        glowIntensity: 1.2,
        particleRate: 15,
        particleBehavior: 'orbiting',
        breathRate: 0.7,            // Slow, contemplative
        breathDepth: 0.12,
        coreJitter: false,
        particleColors: ['#818CF8', '#6366F1']
    },
    
    speaking: {
        glowColor: '#14B8A6',       // Teal
        glowIntensity: 1.3,
        particleRate: 8,            // Few particles while speaking
        particleBehavior: 'ambient',
        breathRate: 1.2,            // Slightly faster while speaking
        breathDepth: 0.15,          // Deeper breaths for speech
        coreJitter: false,
        particleColors: ['#14B8A6', '#818CF8']
    },
    
    zen: {
        glowColor: '#FFD700',       // Bright Gold
        glowIntensity: 1.2,         // Much brighter inner glow
        particleRate: 15,           // Mix of falling and orbiting
        minParticles: 3,            // Some particles always present
        maxParticles: 8,            // Not too many - peaceful
        particleBehavior: 'falling',  // Use falling like sadness (will mix with orbiting)
        breathRate: 0.1,            // Ultra-slow breathing
        breathDepth: 0.03,          // Very subtle
        coreJitter: false,
        particleColors: ['#FFD700', '#FFA500'],  // Bright golden to orange particles
        eyeOpenness: 0.3,           // Will be overridden by animation
        eyeArc: -0.8                // Strong arc for ∩ shape
    },
    
    focused: {
        glowColor: '#00CED1',       // Bright cyan
        glowIntensity: 1.2,
        particleRate: 10,           // Frequent, like synapses
        particleBehavior: 'directed',
        breathRate: 1.2,            // Alert breathing
        breathDepth: 0.08,
        coreJitter: true,           // Micro-adjustments
        particleColors: ['#00CED1', '#00FFFF'],
        eyeOpenness: 0.7,           // Narrowed for concentration
        microAdjustments: true
    }
};

// Emotion aliases for compatibility
export const emotionAliases = {
    'happy': 'joy',
    'excited': 'surprise',
    'calm': 'neutral',
    'curious': 'surprise',
    'frustrated': 'anger',
    'sad': 'sadness'
};

/**
 * Get Emotive visual parameters for an emotion
 * @param {string} emotion - The emotion name (or alias)
 * @returns {Object} Visual parameters for the emotion
 */
export function getEmotionParams(emotion) {
    // Check if it's an alias
    const mappedEmotion = emotionAliases[emotion] || emotion;
    
    // Return parameters or default to neutral
    return emotionMap[mappedEmotion] || emotionMap.neutral;
}

/**
 * Interpolate between two emotion states
 * @param {string} fromEmotion - Starting emotion
 * @param {string} toEmotion - Target emotion
 * @param {number} progress - Progress (0-1)
 * @returns {Object} Interpolated visual parameters
 */
export function interpolateEmotions(fromEmotion, toEmotion, progress) {
    const from = getEmotionParams(fromEmotion);
    const to = getEmotionParams(toEmotion);
    
    // Helper to interpolate colors
    const interpolateColor = (color1, color2, t) => {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        
        return rgbToHex(r, g, b);
    };
    
    // Interpolate numeric values
    const lerp = (a, b, t) => a + (b - a) * t;
    
    return {
        glowColor: interpolateColor(from.glowColor, to.glowColor, progress),
        glowIntensity: lerp(from.glowIntensity, to.glowIntensity, progress),
        particleRate: Math.round(lerp(from.particleRate, to.particleRate, progress)),
        particleBehavior: progress < 0.5 ? from.particleBehavior : to.particleBehavior,
        breathRate: lerp(from.breathRate, to.breathRate, progress),
        breathDepth: lerp(from.breathDepth, to.breathDepth, progress),
        coreJitter: progress < 0.5 ? from.coreJitter : to.coreJitter,
        particleColors: progress < 0.5 ? from.particleColors : to.particleColors
    };
}

// Color utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export default emotionMap;