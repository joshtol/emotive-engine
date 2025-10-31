/**
 * DIRECTION TEST: BACKWARD (away from camera)
 * Tests negative Z position movement
 * Expected: Mascot should move AWAY from camera (get smaller/farther)
 */
export default {
    name: 'testBackward',
    emoji: '↙️',
    type: 'override',
    description: 'TEST: Move BACKWARD away from camera',

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
            // Smooth movement backward away from camera and back
            const movement = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, -movement * 0.5],  // Z = -0.5 at peak (away from camera)
                rotation: [0, 0, 0],
                scale: 1.0
            };
        }
    }
};
