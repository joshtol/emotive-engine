/**
 * DIRECTION TEST: GROW (scale increase)
 * Tests positive scale changes
 * Expected: Mascot should get BIGGER (scale from 1.0 to 1.5)
 */
export default {
    name: 'testGrow',
    emoji: '🔍',
    type: 'override',
    description: 'TEST: Grow bigger (scale increase)',

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
            // Smooth scale increase and back
            const scaleAmount = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0 + scaleAmount * 0.5  // Scale from 1.0 to 1.5 at peak
            };
        }
    }
};
