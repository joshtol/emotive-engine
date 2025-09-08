// RHYTHM CONFIGURATION TO ADD TO TWITCH.JS
// Add this after the config object:

    // Rhythm configuration - twitch syncs to nervous subdivisions
    rhythm: {
        enabled: true,
        syncMode: 'subdivision',
        
        // Twitch probability increases on beat
        probabilitySync: {
            subdivision: 'sixteenth',
            onBeat: 0.3,        // 30% chance on beat
            offBeat: 0.05,      // 5% chance off beat
            accentBoost: 2.0    // Double on accents
        },
        
        // Intensity follows rhythm
        intensitySync: {
            onBeat: 2.0,
            offBeat: 0.8,
            curve: 'pulse'      // Sharp, sudden
        },
        
        // Pattern-specific twitching
        patternOverrides: {
            'breakbeat': {
                // Erratic broken twitches
                probabilitySync: { onBeat: 0.5, offBeat: 0.1 },
                intensitySync: { onBeat: 3.0, offBeat: 0.5 }
            },
            'dubstep': {
                // Heavy twitch on drop
                intensitySync: {
                    onBeat: 1.5,
                    dropBeat: 5.0,
                    curve: 'pulse'
                }
            }
        }
    },

// ALSO UPDATE THE APPLY FUNCTION:
// After: const intensity = motion.intensity || config.intensity;
// Add:
        
        // Apply rhythm modulation if present
        let modIntensity = intensity;
        let modFrequency = config.frequency;
        if (motion.rhythmModulation) {
            modIntensity *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            modIntensity *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.probabilityMultiplier) {
                modFrequency *= motion.rhythmModulation.probabilityMultiplier;
            }
        }