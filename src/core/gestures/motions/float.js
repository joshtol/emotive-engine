/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Float Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'float',
    type: 'blending',
    emoji: '🎈',
    description: 'Gentle floating upward motion',
    
    defaultParams: {
        duration: 3000,
        amplitude: 40,
        wobbleAmount: 10,
        easing: 'easeInOutQuad'
    },
    
    getMotion: function(progress, params = {}) {
        const amplitude = params.amplitude || this.defaultParams.amplitude;
        const wobbleAmount = params.wobbleAmount || this.defaultParams.wobbleAmount;
        
        // Upward floating with slight wobble
        const y = -amplitude * progress;
        const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount;
        const x = wobble;
        
        // Slight expansion as it floats up
        const scale = 1 + progress * 0.1;
        
        return {
            x: x,
            y: y,
            scaleX: scale,
            scaleY: scale,
            rotation: wobble * 0.5,
            opacity: 1 - progress * 0.3, // Fade slightly as it floats
            strength: 0.6
        };
    }
};