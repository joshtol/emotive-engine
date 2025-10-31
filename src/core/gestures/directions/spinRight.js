/**
 * DIRECTION TEST: SPIN RIGHT (Y-axis rotation positive)
 * Tests positive Y-axis rotation (yaw)
 * Expected: Mascot should spin RIGHT (clockwise when viewed from above)
 */
export default {
    name: 'testSpinRight',
    emoji: '↷',
    type: 'override',
    description: 'TEST: Spin RIGHT (clockwise)',

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
            // Smooth rotation right and back
            const rotationAmount = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, rotationAmount * 0.5, 0],  // Y-axis: positive = right spin
                scale: 1.0
            };
        }
    }
};
