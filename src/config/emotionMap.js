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
 * @version 2.2.0
 * @module EmotionMap
 * @changelog 2.2.0 - Added undertone saturation interaction with depth palettes
 * @changelog 2.1.0 - Enhanced particle colors with weighted distribution system
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
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 COLOR DEPTH TECHNIQUE (v2.1.0)                                                 
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ Create 3D particle depth using saturation levels from a base midtone:             
 * │                                                                                    
 * │ • MIDTONE (30%)      : Base color, occupies middle space                          
 * │ • DESATURATED (20%)  : Grayed version, appears distant/background                 
 * │ • OVERSATURATED (20%): Electric version, pops to foreground                       
 * │ • HIGHLIGHT (15%)    : Lighter shade, catches light                               
 * │ • SHADOW (15%)       : Darker shade, adds grounding                               
 * │                                                                                    
 * │ This creates an otherworldly depth effect where particles appear to float         
 * │ at different distances based on their saturation level. Desaturated particles     
 * │ recede into background mist, while oversaturated ones pop forward.                
 * │                                                                                    
 * │ Example: Neutral state uses supple blue (#32ACE2) as base, creating an            
 * │ aquarium-like portal effect with particles at varying depths.                     
 * │                                                                                    
 * │ UNDERTONE INTERACTION (v2.2.0):                                                   
 * │ Undertones dynamically adjust ALL particle colors' saturation levels:             
 * │ • INTENSE   : +60% saturation - Everything becomes electric and vibrant           
 * │ • CONFIDENT : +30% saturation - Colors become bolder and more present             
 * │ • NERVOUS   : +15% saturation - Slight heightening of all colors                  
 * │ • CLEAR     :   0% saturation - Colors appear as defined above                    
 * │ • TIRED     : -20% saturation - All colors become washed out and fading           
 * │ • SUBDUED   : -50% saturation - Colors become ghostly and barely visible          
 * │                                                                                    
 * │ This compounds with the depth palette, so an "intense" undertone makes            
 * │ the entire depth range more vibrant while maintaining relative depth differences. 
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
        glowColor: '#32ACE2',        // [VISUAL] Supple blue - otherworldly depth
        glowIntensity: 1.0,          // [VISUAL] Standard glow brightness (0.5-1.5)
        particleRate: 2,              // [PERFORMANCE] Particles per second - lower for calmer effect
        minParticles: 3,             // [PERFORMANCE] Minimum particles always present
        maxParticles: 8,             // [PERFORMANCE] Maximum particle cap
        particleBehavior: 'ambient', // [CRITICAL] Must exist in Particle.js behaviors
        breathRate: 1.0,             // [CRITICAL] Normal: 12-20 breaths/min (1.0 = 16 bpm)
        breathDepth: 0.08,           // [CRITICAL] 8% size variation during breathing
        coreJitter: false,           // [VISUAL] Whether core shakes/vibrates
        particleColors: [
            { color: '#32ACE2', weight: 30 },  // 30% supple blue midtone (base)
            { color: '#5A92A8', weight: 20 },  // 20% desaturated (background depth)
            { color: '#00B4FF', weight: 20 },  // 20% oversaturated (foreground pop)
            { color: '#7CC8F2', weight: 15 },  // 15% highlight (catching light)
            { color: '#1A5A74', weight: 15 }   // 15% shadow (grounding depth)
        ] // Otherworldly depth palette using saturation for 3D effect
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // JOY - Playful happiness with popcorn popping particles
    // ════════════════════════════════════════════════════════════════════════════════
    joy: {
        glowColor: '#FFD54F',       // Golden yellow - sunny happiness
        glowIntensity: 1.3,
        particleRate: 12,          // Frequent popping
        minParticles: 4,
        maxParticles: 8,
        particleBehavior: 'popcorn', // Spontaneous popping effect
        breathRate: 1.5,           // Joy/Happiness: 20-30 breaths/min (excited)
        breathDepth: 0.10,         // 10% size variation - deeper excitement
        coreJitter: false,
        particleColors: [
            { color: '#FFD54F', weight: 30 },  // 30% golden yellow midtone
            { color: '#C4B888', weight: 20 },  // 20% desaturated (distant warmth)
            { color: '#FFFF00', weight: 20 },  // 20% oversaturated (electric joy)
            { color: '#FFE082', weight: 15 },  // 15% highlight (sun-kissed)
            { color: '#B39C2F', weight: 15 }   // 15% shadow (deep gold)
        ] // Popcorn depth palette - sunny layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SADNESS - Slow, heavy state with downward drifting particles
    // ════════════════════════════════════════════════════════════════════════════════
    sadness: {
        glowColor: '#4090CE',       // Smooth azure - melancholic depth
        glowIntensity: 0.7,
        particleRate: 25,           // Moderate particles for sadness
        minParticles: 0,            // Start with none, let them build naturally
        maxParticles: 25,
        particleBehavior: 'falling',
        breathRate: 0.6,           // Sadness: 10-12 breaths/min (slow, sighing)
        breathDepth: 0.12,         // 12% size variation - deep sighs
        coreJitter: false,
        particleColors: [
            { color: '#4090CE', weight: 30 },  // 30% smooth azure midtone
            { color: '#6B97B8', weight: 20 },  // 20% desaturated (distant sorrow)
            { color: '#00A0FF', weight: 20 },  // 20% oversaturated (sharp tears)
            { color: '#70B8E8', weight: 15 },  // 15% highlight (glinting tear)
            { color: '#2A5A86', weight: 15 }   // 15% shadow (deep ocean)
        ] // Tearful depth palette - oceanic layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // ANGER - Intense aggressive state with rapid, chaotic particles
    // ════════════════════════════════════════════════════════════════════════════════
    anger: {
        glowColor: '#FF5252',       // Bright crimson - intense rage
        glowIntensity: 1.4,
        particleRate: 15,           // Reduced from 30 to prevent extreme behavior
        minParticles: 3,
        maxParticles: 8,
        particleBehavior: 'aggressive',
        breathRate: 2.2,           // Anger: 30-40 breaths/min (rapid, intense)
        breathDepth: 0.15,         // 15% size variation - heavy, forceful breathing
        coreJitter: true,          // Shake with anger
        particleColors: [
            { color: '#FF5252', weight: 30 },  // 30% bright red midtone
            { color: '#C47777', weight: 20 },  // 20% desaturated (smoldering)
            { color: '#FF0000', weight: 20 },  // 20% oversaturated (pure rage)
            { color: '#FF7B7B', weight: 15 },  // 15% highlight (hot flash)
            { color: '#B73636', weight: 15 }   // 15% shadow (dark fury)
        ] // Rage depth palette - burning layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // FEAR - Anxious state with particles fleeing from center
    // ════════════════════════════════════════════════════════════════════════════════
    fear: {
        glowColor: '#7B68EE',       // Medium slate blue - unsettling
        glowIntensity: 0.8,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 6,
        particleBehavior: 'scattering',
        breathRate: 2.5,           // Fear/Anxiety: 25-45 breaths/min (hyperventilation)
        breathDepth: 0.06,         // 6% size variation - very shallow, rapid breaths
        coreJitter: true,          // Trembling
        particleColors: [
            { color: '#7B68EE', weight: 30 },  // 30% slate blue midtone
            { color: '#9A91C4', weight: 20 },  // 20% desaturated (anxious fog)
            { color: '#6A4FFF', weight: 20 },  // 20% oversaturated (panic spike)
            { color: '#A296F3', weight: 15 },  // 15% highlight (cold sweat)
            { color: '#5445A0', weight: 15 }   // 15% shadow (dread)
        ] // Anxiety depth palette - nervous layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // SURPRISE - Sudden shock with explosive particle burst
    // ════════════════════════════════════════════════════════════════════════════════
    surprise: {
        glowColor: '#FFAB40',       // Bright orange - sudden pop
        glowIntensity: 1.4,
        particleRate: 18,
        minParticles: 3,
        maxParticles: 10,
        particleBehavior: 'burst',
        breathRate: 0.3,           // Surprise: Initial gasp then pause (6-8 breaths/min)
        breathDepth: 0.20,         // 20% size variation - huge initial gasp
        coreJitter: false,
        particleColors: [
            { color: '#FFAB40', weight: 30 },  // 30% bright orange midtone
            { color: '#C4A373', weight: 20 },  // 20% desaturated (fading shock)
            { color: '#FF9800', weight: 20 },  // 20% oversaturated (burst)
            { color: '#FFC773', weight: 15 },  // 15% highlight (flash)
            { color: '#B3772D', weight: 15 }   // 15% shadow (aftershock)
        ] // Shock depth palette - explosive layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // DISGUST - Revulsion with particles pushing away from core
    // ════════════════════════════════════════════════════════════════════════════════
    disgust: {
        glowColor: '#84CFC5',       // Eye tea green - unsettling mint
        glowIntensity: 0.9,
        particleRate: 12,
        minParticles: 2,
        maxParticles: 4,
        particleBehavior: 'repelling',
        breathRate: 0.7,           // Disgust: 10-14 breaths/min (breath holding)
        breathDepth: 0.04,         // 4% size variation - restricted, shallow breathing
        coreJitter: false,
        particleColors: [
            { color: '#84CFC5', weight: 30 },  // 30% eye tea green midtone (base)
            { color: '#9BB8B3', weight: 20 },  // 20% desaturated (foggy, distant nausea)
            { color: '#00FFD9', weight: 20 },  // 20% oversaturated (toxic bright mint)
            { color: '#A8E6DD', weight: 15 },  // 15% highlight (sickly pale)
            { color: '#4A8A80', weight: 15 }   // 15% shadow (deep bile green)
        ] // Nauseating depth palette - toxic fog with bright sick spots
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // LOVE - Warm affection with particles orbiting harmoniously
    // ════════════════════════════════════════════════════════════════════════════════
    love: {
        glowColor: '#DD4A9A',       // Magenta majesty - deep romantic
        glowIntensity: 1.9,
        particleRate: 10,          // Moderate particles for love
        minParticles: 2,
        maxParticles: 5,
        particleBehavior: 'orbiting',
        breathRate: 0.85,          // Love/Contentment: 12-16 breaths/min (calm, deep)
        breathDepth: 0.11,         // 11% size variation - full, satisfied breaths
        coreJitter: false,
        particleColors: [
            { color: '#DD4A9A', weight: 30 },  // 30% magenta majesty midtone (base)
            { color: '#B87298', weight: 20 },  // 20% desaturated (soft, distant romance)
            { color: '#FF00AA', weight: 20 },  // 20% oversaturated (electric passion)
            { color: '#F47BBD', weight: 15 },  // 15% highlight (glowing warmth)
            { color: '#8D2F63', weight: 15 }   // 15% shadow (deep intimate)
        ] // Romantic depth palette - passion layers from soft to intense
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
        particleColors: [
            { color: '#8B7355', weight: 30 },  // 30% amber-brown midtone
            { color: '#9A8A7A', weight: 20 },  // 20% desaturated (lurking)
            { color: '#A67C52', weight: 20 },  // 20% oversaturated (alert)
            { color: '#B39880', weight: 15 },  // 15% highlight (scanning)
            { color: '#5C4A3A', weight: 15 }   // 15% shadow (hidden)
        ] // Watchful depth palette - guarded layers
        // Special properties for suspicion
        //coreSquint: 0.4,            // Narrows the orb by 40%
        //scanInterval: 3000,         // Peer around every 3 seconds
        //scanDuration: 800,          // Quick scanning motion
        //scanAngle: 45               // Degrees to look left/right
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // EXCITED - High energy state with rapid, bouncing particles
    // ════════════════════════════════════════════════════════════════════════════════
    excited: {
        glowColor: '#FF1493',       // Deep pink - electric energy
        glowIntensity: 1.3,         // Bright, vibrant glow
        particleRate: 15,           // Fast particle generation
        minParticles: 5,
        maxParticles: 20,
        particleBehavior: 'burst',  // Using existing burst behavior for excitement
        breathRate: 2.0,            // Fast, excited breathing
        breathDepth: 0.14,          // Deep, energetic breaths
        coreJitter: true,           // Vibrating with excitement
        particleColors: [
            { color: '#FF1493', weight: 30 },  // 30% deep pink midtone
            { color: '#C47FA8', weight: 20 },  // 20% desaturated (contained energy)
            { color: '#FF00FF', weight: 20 },  // 20% oversaturated (peak excitement)
            { color: '#FF69B4', weight: 15 },  // 15% highlight (sparks)
            { color: '#B3006B', weight: 15 }   // 15% shadow (intense core)
        ] // Electric depth palette - vibrant layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // RESTING - Deep relaxation with slow, languid particle drift
    // ════════════════════════════════════════════════════════════════════════════════
    resting: {
        glowColor: '#9370DB',       // Medium purple - dreamy rest
        glowIntensity: 0.8,
        particleRate: 10,           // Visible particles
        minParticles: 3,
        maxParticles: 5,
        particleBehavior: 'resting',
        breathRate: 0.8,            // Human resting: 12-16 breaths/min
        breathDepth: 0.12,          // 12% - natural resting breath depth
        coreJitter: false,
        particleColors: [
            { color: '#9370DB', weight: 30 },  // 30% medium purple midtone
            { color: '#A591C4', weight: 20 },  // 20% desaturated (deep sleep)
            { color: '#B366FF', weight: 20 },  // 20% oversaturated (dream pulse)
            { color: '#B8A1E6', weight: 15 },  // 15% highlight (light dream)
            { color: '#674D9B', weight: 15 }   // 15% shadow (deep rest)
        ] // Restful depth palette - dreamy layers
    },
    
    // ════════════════════════════════════════════════════════════════════════════════
    // EUPHORIA - First day of spring, sunrise, new beginnings, radiant hope
    // ════════════════════════════════════════════════════════════════════════════════
    euphoria: {
        glowColor: '#FFD700',        // Pure gold - radiant sunrise
        glowIntensity: 1.8,          // Radiant, warm glow
        particleRate: 3,             // Abundant particles like sunbeams
        minParticles: 15,            // Always sparkling with life
        maxParticles: 30,            // Maximum celebration of renewal
        particleBehavior: 'radiant', // Particles radiate outward like sun rays
        breathRate: 1.3,             // Excited, energized breathing
        breathDepth: 0.25,           // Deep, refreshing breaths of spring air
        coreJitter: false,           // Stable, confident core
        particleColors: [
            { color: '#FFD700', weight: 30 },  // 30% pure gold midtone
            { color: '#C4B888', weight: 20 },  // 20% desaturated (soft dawn)
            { color: '#FFFF00', weight: 20 },  // 20% oversaturated (sun burst)
            { color: '#FFE57F', weight: 15 },  // 15% highlight (ray of light)
            { color: '#B39A00', weight: 15 }   // 15% shadow (golden depth)
        ] // Sunrise depth palette - radiant layers
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
        particleColors: [
            { color: '#00CED1', weight: 30 },  // 30% dark turquoise midtone (base)
            { color: '#4A9FA0', weight: 20 },  // 20% desaturated (background depth)
            { color: '#00FFFF', weight: 20 },  // 20% oversaturated (foreground pop)
            { color: '#5FE5E7', weight: 15 },  // 15% highlight (catching light)
            { color: '#006B6D', weight: 15 }   // 15% shadow (grounding depth)
        ],
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