/**
 * DIRECTION TEST: SPIN LEFT (Y-axis rotation negative)
 * Tests negative Y-axis rotation (yaw)
 * Expected: Mascot should spin LEFT (counterclockwise when viewed from above)
 */
export default {
    name: 'testSpinLeft',
    emoji: '↶',
    type: 'override',
    description: 'TEST: Spin LEFT (counterclockwise)',

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
            // Smooth rotation left and back
            const rotationAmount = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, -rotationAmount * 0.5, 0],  // Y-axis: negative = left spin
                scale: 1.0
            };
        }
    }
};
