# Rhythm System Batch Update Plan

## Remaining Files to Update

### Effect Gestures (11 files)
- breathe.js - Breathing sync to bars
- burst.js - Explosive bursts on beats
- drift.js - Lazy drift with tempo
- fade.js - Fade timing to beats
- flash.js - Flash on accents
- flicker.js - Flicker on subdivisions
- glow.js - Glow intensity with beat
- expand.js - Expansion on downbeats
- contract.js - Contraction between beats
- settle.js - Settling over bars
- wave.js - Wave motion per bar

### Transform Gestures (7 remaining)
- jump.js - Jump height on beat
- morph.js - Shape morphing per bar
- stretch.js - Stretch amount with beat
- tilt.js - Tilt angle synced
- hula.js - Hula-hoop rotation per bar
- orbital.js - Orbital patterns
- scan.js - Scan speed with tempo

### Particle Behaviors (20 files)
- ambient.js - Gentle floating with rhythm
- rising.js - Rise speed with tempo
- falling.js - Fall timing with beat
- popcorn.js - Pop on beats
- burst.js - Burst intensity
- aggressive.js - Attack on accents
- scattering.js - Scatter on beats
- radiant.js - Radiate with pulse
- repelling.js - Repel force with beat
- connecting.js - Connection timing
- resting.js - Rest between bars
- ascending.js - Ascend with tempo
- erratic.js - Chaos on subdivisions
- cautious.js - Careful movement
- surveillance.js - Scan patterns
- directed.js - Direction changes
- fizzy.js - Bubble rate

### Emotion States (12 remaining)
- anger.js - Aggressive rhythm
- disgust.js - Repulsive timing
- euphoria.js - Ecstatic beats
- fear.js - Nervous trembling
- focused.js - Locked to beat
- joy.js - Happy bouncing
- neutral.js - Subtle rhythm
- resting.js - Slow breathing
- sadness.js - Melancholic timing
- surprise.js - Sudden on accents
- suspicion.js - Cautious rhythm

## Standard Rhythm Configuration Template

```javascript
// Rhythm configuration - [description]
rhythm: {
    enabled: true,
    syncMode: '[beat/bar/subdivision/continuous]',
    
    // Primary sync parameter
    [parameter]Sync: {
        onBeat: 1.5,
        offBeat: 0.8,
        curve: '[linear/ease/bounce/pulse]'
    },
    
    // Duration in musical time
    durationSync: {
        mode: '[beats/bars]',
        [beats/bars]: 1
    },
    
    // Pattern-specific overrides
    patternOverrides: {
        'waltz': { /* 3/4 time adjustments */ },
        'swing': { /* Jazz swing feel */ },
        'dubstep': { /* Heavy drops */ },
        'breakbeat': { /* Chaotic patterns */ }
    }
}
```

## Apply Function Template

```javascript
// Apply rhythm modulation if present
let [parameter] = config.[parameter];
if (motion.rhythmModulation) {
    [parameter] *= (motion.rhythmModulation.[parameter]Multiplier || 1);
    [parameter] *= (motion.rhythmModulation.accentMultiplier || 1);
}
```