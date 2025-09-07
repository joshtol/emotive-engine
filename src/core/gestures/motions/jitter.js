/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jitter Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'jitter',
    type: 'blending',
    emoji: '⚡',
    description: 'Rapid random jittery movement',
    
    defaultParams: {
        duration: 500,
        intensity: 5,
        frequency: 30,
        easing: 'linear'
    },
    
    getMotion: function(progress, params = {}) {
        const intensity = params.intensity || this.defaultParams.intensity;
        const frequency = params.frequency || this.defaultParams.frequency;
        
        // High frequency random movement
        const time = progress * frequency;
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        
        // Random scale jitter
        const scaleJitter = 1 + (Math.random() - 0.5) * 0.05;
        
        return {
            x: x,
            y: y,
            scaleX: scaleJitter,
            scaleY: scaleJitter,
            rotation: (Math.random() - 0.5) * 3,
            strength: 0.9
        };
    }
};