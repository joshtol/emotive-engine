/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scan Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Searchlight scanning gesture for suspicious states
 * @author Emotive Engine Team
 * @module gestures/transforms/scan
 * 
 * GESTURE TYPE:
 * type: 'override' - Takes complete control of particle motion
 * 
 * VISUAL EFFECT:
 * Particles sweep back and forth in a searchlight pattern, pausing at edges
 * to simulate surveillance scanning or paranoid checking behavior.
 */

export default {
    name: 'scan',
    emoji: '🔍',
    type: 'override',
    description: 'Searchlight scanning motion',
    
    // Default configuration
    config: {
        scanSpeed: 0.008,         // Slow, deliberate scanning
        scanWidth: 120,           // Width of scan arc in pixels
        pauseDuration: 300,       // Pause at edges in ms
        scanHeight: 40,           // Vertical variation
        layers: 3,                // Number of scan layers
        duration: 3000            // Total animation duration
    },
    
    // Rhythm configuration - scanning syncs to measures
    rhythm: {
        enabled: true,
        syncMode: 'measure',  // Scan sweeps align with measures
        
        // Scan timing to musical structure
        sweepSync: {
            beatsPerSweep: 4,         // One sweep per measure
            pauseOnDownbeat: true,    // Pause at measure start
            reverseOnBar: true,       // Change direction each bar
            curve: 'linear'           // Steady scan motion
        },
        
        // Layer activation by dynamics
        layerSync: {
            quiet: 1,                 // Single layer when quiet
            moderate: 2,              // Two layers at medium
            loud: 3,                  // All layers when loud
            stagger: 'sequential'     // Layers activate in order
        },
        
        // Pause duration on beats
        pauseSync: {
            onBeat: 500,              // Longer pause on beat
            offBeat: 100,             // Quick pause off beat
            accent: 800,              // Extra pause on accent
            subdivision: 'quarter'    // Check every quarter note
        },
        
        // Width modulation
        widthSync: {
            verse: 80,                // Narrow scan in verse
            chorus: 140,              // Wide scan in chorus
            bridge: 100,              // Medium in bridge
            transition: 'smooth'      // Smooth width changes
        },
        
        // Musical tension mapping
        dynamics: {
            forte: { scanSpeed: 0.012, layers: 4 },    // Frantic scanning
            piano: { scanSpeed: 0.004, layers: 1 }     // Slow, single beam
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Assign particles to different scan layers
        const layer = Math.floor(Math.random() * this.config.layers);
        
        particle.gestureData.scan = {
            layer: layer,
            phase: Math.random() * Math.PI * 2,  // Random starting phase
            direction: Math.random() < 0.5 ? 1 : -1,  // Start direction
            pauseTimer: 0,
            isPaused: false,
            originalX: particle.x,
            originalY: particle.y,
            scanOffset: (Math.random() - 0.5) * 20,  // Individual variation
            verticalOffset: layer * 30 - 30,  // Layer separation
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.scan) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.scan;
        const speed = motion.scanSpeed || this.config.scanSpeed;
        const width = motion.scanWidth || this.config.scanWidth;
        const pauseDuration = motion.pauseDuration || this.config.pauseDuration;
        
        // Handle pause at edges
        if (data.isPaused) {
            data.pauseTimer -= dt * 16;
            if (data.pauseTimer <= 0) {
                data.isPaused = false;
                data.direction *= -1;  // Reverse direction after pause
            }
        } else {
            // Update scan phase
            data.phase += speed * data.direction * dt;
            
            // Check for edge reached
            const scanPosition = Math.sin(data.phase);
            if (Math.abs(scanPosition) > 0.95) {
                data.isPaused = true;
                data.pauseTimer = pauseDuration;
            }
        }
        
        // Calculate position
        const scanX = Math.sin(data.phase) * width;
        const scanY = Math.cos(data.phase * 0.5) * (this.config.scanHeight / 2);
        
        // Apply layer-specific positioning
        particle.x = centerX + scanX + data.scanOffset;
        particle.y = centerY + scanY + data.verticalOffset;
        
        // Slow down during pauses for more realistic scanning
        if (data.isPaused) {
            particle.vx *= 0.85;
            particle.vy *= 0.85;
        } else {
            // Set velocity based on scan motion
            particle.vx = -Math.cos(data.phase) * width * speed * 60;
            particle.vy = -Math.sin(data.phase * 0.5) * this.config.scanHeight * speed * 30;
        }
        
        // Add slight jitter for realism
        if (Math.random() < 0.02) {
            particle.vx += (Math.random() - 0.5) * 2;
            particle.vy += (Math.random() - 0.5) * 2;
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.scan) {
            delete particle.gestureData.scan;
        }
    }
};