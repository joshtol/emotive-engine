/**
 * ═══════════════════════════════════════════════════════════════════════════════════════                                                                                                             
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                            ◐ ◑ ◒ ◓  EMOTION MAP  ◓ ◒ ◑ ◐                            
 *                                                                                       
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Emotion Configuration Map - Visual and Particle Settings
 * @author joshtol w/ Agents
 * @version 2.0.0
 * @module EmotionMap
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ This file defines VISUAL PROPERTIES for each emotional state.                     
 * ║ It works alongside EmotiveStateMachine.js which handles behavior logic.           
 * ║ Think of this as the "appearance" while StateMachine is the "behavior".           
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 SAFE TO MODIFY (Visual Only)                                                   
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • glowColor        : Hex color for the orb's glow effect (#RRGGBB)                
 * │ • glowIntensity    : 0.0-1.5 (brightness of glow, 1.0 = normal)                   
 * │ • particleColors   : Array of hex colors for particles ['#FFF', '#EEE']         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚠️  MODIFY WITH CAUTION (Affects Performance)                                     
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • particleRate     : 0-30 (particles spawned per second, high = lag)              
 * │ • minParticles     : 0-10 (minimum particles maintained)                          
 * │ • maxParticles     : 5-50 (maximum particles allowed, >30 may lag)                
 * │ • particleBehavior : Must match a behavior in Particle.js                         
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🚫 CRITICAL - DO NOT REMOVE (Required for Core System)                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • particleBehavior : Links to Particle.js behaviors (ambient/burst/rising/etc)    
 * │ • breathRate       : Controls animation timing (0.5-2.0, 1.0 = normal)            
 * │ • breathDepth      : Scale variation during breath (0.0-0.3, 0.1 = subtle)        
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ❌ DO NOT ADD HERE (Belongs in Other Files)                                       
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ ✗ Gesture configurations     → use gestureConfig.js                              
 * │ ✗ Sound settings            → use SoundSystem config                             
 * │ ✗ State transition logic    → use EmotiveStateMachine.js                         
 * │ ✗ Undertone modifiers       → use undertoneModifiers.js                          
 * │ ✗ Animation timing          → use AnimationController.js                         
 * │ ✗ Eye/core shape logic      → use EmotiveRenderer.js                             
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           ADDING NEW EMOTIONS                                     
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ 1. Copy an existing emotion block as template                                     
 * ║ 2. Modify ALL required properties (see CRITICAL section)                          
 * ║ 3. Add corresponding state in EmotiveStateMachine.js                              
 * ║ 4. Test particle behavior at different frame rates                                
 * ║ 5. Verify color contrast on light/dark backgrounds                                
 * ║ 6. Add emotion to valid emotions list in ErrorBoundary.js                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           TESTING CHECKLIST                                       
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ □ Particles spawn correctly without console errors                                
 * ║ □ Colors visible on both light (#FFF) and dark (#000) backgrounds                 
 * ║ □ Performance stays above 30 FPS with maxParticles                                
 * ║ □ Breathing animation looks natural (not too fast/slow)                           
 * ║ □ Smooth transitions to/from this emotion                                         
 * ║ □ particleBehavior exists in Particle.js                                          
 * ║ □ All particle colors are valid hex codes                                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export const emotionMap = {
    // ════════════════════════════════════════════════════════════════════════════════
    // NEUTRAL - The default calm state, baseline for all other emotions
    // ════════════════════════════════════════════════════════════════════════════════
    neutral: {
        glowColor: '#6B7FFF',        // [VISUAL] Soft periwinkle blue - calming but alive
        glowIntensity: 1.0,          // [VISUAL] Standard glow brightness (0.5-1.5)
        particleRate: 2,              // [PERFORMANCE] Particles per second - lower for calmer effect
        minParticles: 3,             // [PERFORMANCE] Minimum particles always present
        maxParticles: 8,             // [PERFORMANCE] Maximum particle cap
        particleBehavior: 'ambient', // [CRITICAL] Must exist in Particle.js behaviors
        breathRate: 1.0,             // [CRITICAL] Normal: 12-20 breaths/min (1.0 = 16 bpm)
        breathDepth: 0.08,           // [CRITICAL] 8% size variation during breathing
        coreJitter: false,           // [VISUAL] Whether core shakes/vibrates
        particleColors: ['#6B7FFF', '#8FA1FF', '#FFFFFF'] // [VISUAL] Blue to white gradient
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // JOY - Energetic happiness with upward, buoyant particles
    // ════════════════════════════════════════════════════════════════════════════════
    joy: {
        glowColor: '#FFC107',       // Warm amber - richer golden happiness
        glowIntensity: 1.3,
        particleRate: 12,          // Moderate particles for joy
        minParticles: 4,
        maxParticles: 8,
        particleBehavior: 'rising',
        breathRate: 1.5,           // Joy/Happiness: 20-30 breaths/min (excited)
        breathDepth: 0.10,         // 10% size variation - deeper excitement
        coreJitter: false,
        particleColors: ['#FFC107', '#FFB300', '#FF8F00', '#FFF8E1']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SADNESS - Slow, heavy state with downward drifting particles
    // ════════════════════════════════════════════════════════════════════════════════
    sadness: {
        glowColor: '#5C7CFA',       // Deep indigo - more melancholic
        glowIntensity: 0.7,
        particleRate: 8,           // Moderate particles for sadness
        minParticles: 1,
        maxParticles: 3,
        particleBehavior: 'falling',
        breathRate: 0.6,           // Sadness: 10-12 breaths/min (slow, sighing)
        breathDepth: 0.12,         // 12% size variation - deep sighs
        coreJitter: false,
        particleColors: ['#5C7CFA', '#7C4DFF', '#9575CD', '#3949AB']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // ANGER - Intense aggressive state with rapid, chaotic particles
    // ════════════════════════════════════════════════════════════════════════════════
    anger: {
        glowColor: '#FF5252',       // Bright crimson - more intense rage
        glowIntensity: 1.4,
        particleRate: 15,           // Reduced from 30 to prevent extreme behavior
        minParticles: 3,
        maxParticles: 8,
        particleBehavior: 'aggressive',
        breathRate: 2.2,           // Anger: 30-40 breaths/min (rapid, intense)
        breathDepth: 0.15,         // 15% size variation - heavy, forceful breathing
        coreJitter: true,          // Shake with anger
        particleColors: ['#FF5252', '#FF6E40', '#FF3D00', '#FFAB91']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // FEAR - Anxious state with particles fleeing from center
    // ════════════════════════════════════════════════════════════════════════════════
    fear: {
        glowColor: '#7C4DFF',       // Deep violet - more unsettling
        glowIntensity: 0.8,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 6,
        particleBehavior: 'scattering',
        breathRate: 2.5,           // Fear/Anxiety: 25-45 breaths/min (hyperventilation)
        breathDepth: 0.06,         // 6% size variation - very shallow, rapid breaths
        coreJitter: true,          // Trembling
        particleColors: ['#7C4DFF', '#651FFF', '#4A148C', '#311B92']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SURPRISE - Sudden shock with explosive particle burst
    // ════════════════════════════════════════════════════════════════════════════════
    surprise: {
        glowColor: '#FFAB00',       // Bright amber-orange - more pop
        glowIntensity: 1.4,
        particleRate: 18,
        minParticles: 3,
        maxParticles: 10,
        particleBehavior: 'burst',
        breathRate: 0.3,           // Surprise: Initial gasp then pause (6-8 breaths/min)
        breathDepth: 0.20,         // 20% size variation - huge initial gasp
        coreJitter: false,
        particleColors: ['#FFAB00', '#FFC400', '#FFD54F', '#FFECB3']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // DISGUST - Revulsion with particles pushing away from core
    // ════════════════════════════════════════════════════════════════════════════════
    disgust: {
        glowColor: '#66BB6A',       // Sickly lime-green - more nauseating
        glowIntensity: 0.9,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 4,
        particleBehavior: 'repelling',
        breathRate: 0.7,           // Disgust: 10-14 breaths/min (breath holding)
        breathDepth: 0.04,         // 4% size variation - restricted, shallow breathing
        coreJitter: false,
        particleColors: ['#66BB6A', '#9CCC65', '#D4E157', '#AED581']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // LOVE - Warm affection with particles orbiting harmoniously
    // ════════════════════════════════════════════════════════════════════════════════
    love: {
        glowColor: '#FF4081',       // Hot pink - more passionate
        glowIntensity: 1.1,
        particleRate: 10,          // Moderate particles for love
        minParticles: 2,
        maxParticles: 5,
        particleBehavior: 'orbiting',
        breathRate: 0.85,          // Love/Contentment: 12-16 breaths/min (calm, deep)
        breathDepth: 0.11,         // 11% size variation - full, satisfied breaths
        coreJitter: false,
        particleColors: ['#FF4081', '#FF80AB', '#FCE4EC', '#FFFFFF']
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SUSPICION - Watchful alertness with scanning, cautious particles
    // ════════════════════════════════════════════════════════════════════════════════
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
    
    // ════════════════════════════════════════════════════════════════════════════════
    // EXCITED - Fizzy, carbonated energy (using the cool fizzy effect!)
    // ════════════════════════════════════════════════════════════════════════════════
    excited: {
        glowColor: '#FF00FF',        // Hot magenta - pure excitement
        glowIntensity: 1.3,          // Bright, vibrant glow
        particleRate: 25,            // Very high spawn rate for fizzy effect
        minParticles: 30,            // Always bubbling
        maxParticles: 40,            // Lots of particles for carbonated look
        particleBehavior: 'fizzy',   // The new fizzy behavior!
        breathRate: 1.5,             // Fast, excited breathing
        breathDepth: 0.12,           // Deep, energetic breaths
        coreJitter: true,            // Vibrating with excitement
        particleColors: ['#FF00FF', '#FF1493', '#FF69B4', '#FFB6C1'] // Magenta to pink spectrum
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // RESTING - Deep relaxation with slow, languid particle drift
    // ════════════════════════════════════════════════════════════════════════════════
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
    
    // ════════════════════════════════════════════════════════════════════════════════
    // CONNECTING - System state during connection attempts
    // ════════════════════════════════════════════════════════════════════════════════
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
    
    // ════════════════════════════════════════════════════════════════════════════════
    // THINKING - Contemplative state with circular thought patterns
    // ════════════════════════════════════════════════════════════════════════════════
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
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SPEAKING - Active communication with steady particle flow
    // ════════════════════════════════════════════════════════════════════════════════
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
    
    // ════════════════════════════════════════════════════════════════════════════════
    // ZEN - Deep meditation with ultra-slow, golden particles
    // ════════════════════════════════════════════════════════════════════════════════
    zen: {
        glowColor: '#FFD700',       // Bright Gold
        glowIntensity: 1.2,         // Much brighter inner glow
        particleRate: 15,           // Mix of falling and orbiting
        minParticles: 10,            // Some particles always present
        maxParticles: 16,            // Not too many - peaceful
        particleBehavior: 'falling',  // Use falling like sadness (will mix with orbiting)
        breathRate: 0.1,            // Ultra-slow breathing
        breathDepth: 0.03,          // Very subtle
        coreJitter: false,
        particleColors: ['#FFD700', '#FFA500'],  // Bright golden to orange particles
        eyeOpenness: 0.3,           // Will be overridden by animation
        eyeArc: -0.8                // Strong arc for ∩ shape
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // FOCUSED - Intense concentration with directed particle flow
    // ════════════════════════════════════════════════════════════════════════════════
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
    // 'excited': 'surprise', // Removed - excited is now its own emotion with fizzy particles!
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