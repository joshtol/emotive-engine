/**
 * DIRECTION TEST: DOWN
 * Tests negative Y position movement
 * Expected: Mascot should move DOWN on screen
 */
export default {
    name: 'testDown',
    emoji: '⬇️',
    type: 'override',
    description: 'TEST: Move DOWN on screen',

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
            // Smooth movement down and back
            const movement = Math.sin(progress * Math.PI);

            return {
                position: [0, -movement * 0.5, 0],  // Y = -0.5 at peak
                rotation: [0, 0, 0],
                scale: 1.0
            };
        }
    }
};
