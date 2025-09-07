/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sway Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'sway',
    type: 'blending',
    emoji: '〰️',
    description: 'Gentle side-to-side swaying motion',
    
    defaultParams: {
        duration: 2000,
        amplitude: 30,
        frequency: 1,
        easing: 'easeInOutSine'
    },
    
    getMotion: function(progress, params = {}) {
        const amplitude = params.amplitude || this.defaultParams.amplitude;
        const frequency = params.frequency || this.defaultParams.frequency;
        
        // Smooth side-to-side motion
        const angle = progress * Math.PI * 2 * frequency;
        const x = Math.sin(angle) * amplitude;
        
        return {
            x: x,
            y: 0,
            scaleX: 1 + Math.abs(Math.sin(angle)) * 0.02, // Slight stretch on sway
            scaleY: 1 - Math.abs(Math.sin(angle)) * 0.01, // Slight compression
            rotation: Math.sin(angle) * 5, // Slight rotation
            strength: 0.7
        };
    }
};