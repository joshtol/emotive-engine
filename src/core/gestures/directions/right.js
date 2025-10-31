/**
 * DIRECTION TEST: RIGHT
 * Tests positive X position movement
 * Expected: Mascot should move RIGHT on screen
 */
export default {
    name: 'testRight',
    emoji: '➡️',
    type: 'override',
    description: 'TEST: Move RIGHT on screen',

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
            // Smooth movement right and back
            const movement = Math.sin(progress * Math.PI);

            return {
                position: [movement * 0.5, 0, 0],  // X = +0.5 at peak
                rotation: [0, 0, 0],
                scale: 1.0
            };
        }
    }
};
