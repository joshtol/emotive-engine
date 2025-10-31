/**
 * DIRECTION TEST: SHRINK (scale decrease)
 * Tests negative scale changes
 * Expected: Mascot should get SMALLER (scale from 1.0 to 0.5)
 */
export default {
    name: 'testShrink',
    emoji: '🔎',
    type: 'override',
    description: 'TEST: Shrink smaller (scale decrease)',

    config: {
        duration: 1000,
        musicalDuration: { musical: true, beats: 2 }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 5
    },

    apply(particle, progress) {
        // No 2D implementation - return false to use 3D-only mode
        return false;
    },

    '3d': {
        evaluate(progress) {
            // Smooth scale decrease and back
            const scaleAmount = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0 - scaleAmount * 0.5  // Scale from 1.0 to 0.5 at peak
            };
        }
    }
};
