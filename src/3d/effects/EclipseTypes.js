/**
 * Eclipse Type Configurations
 *
 * Defines parameters for different types of solar eclipses.
 * Each eclipse type has specific shadow coverage, corona configuration,
 * and Bailey's Beads characteristics.
 */

export const ECLIPSE_TYPES = {
    OFF: 'off',
    ANNULAR: 'annular',
    TOTAL: 'total'
};

export const ECLIPSE_CONFIG = {
    [ECLIPSE_TYPES.OFF]: {
        shadowCoverage: 0.0,
        coronaIntensity: 1.0,        // Base corona intensity
        coronaRaysEnabled: false,     // No rays when no eclipse
        baileyBeadsEnabled: false,
        baileyBeadsCount: 0,
        baileyBeadsSize: 0.0
    },

    [ECLIPSE_TYPES.ANNULAR]: {
        shadowCoverage: 0.789,       // Smaller shadow - leaves prominent "ring of fire"
        coronaIntensity: 0.8,        // Slightly reduced corona (moon blocks some)
        coronaRaysEnabled: false,     // No dramatic rays for annular
        baileyBeadsEnabled: true,
        baileyBeadsCount: 12,        // More beads for annular
        baileyBeadsSize: 0.015       // Smaller beads
    },

    [ECLIPSE_TYPES.TOTAL]: {
        shadowCoverage: 0.895,       // Larger shadow - nearly complete coverage
        coronaIntensity: 4.0,        // Dramatic corona effect visible
        coronaRaysEnabled: true,      // Enable dramatic rays for total eclipse
        baileyBeadsEnabled: true,
        baileyBeadsCount: 6,         // Fewer beads for total
        baileyBeadsSize: 0.025       // Larger, more dramatic beads
    }
};

/**
 * Corona Configuration
 * Detailed settings for the enhanced multi-layer corona system
 */
export const CORONA_CONFIG = {
    // Layer configuration (applies to all eclipse types)
    layers: [
        { name: 'inner', scale: 2.5, opacity: 0.6 },
        { name: 'middle', scale: 3.5, opacity: 0.4 },
        { name: 'outer', scale: 5.0, opacity: 0.25 }
    ],

    // Streamer configuration (plasma extensions)
    streamers: {
        enabled: true,
        count: 8,           // Number of streamers around corona
        length: 2.0,        // Length multiplier
        width: 0.15         // Width of each streamer
    },

    // Ray configuration (dramatic spikes for total eclipse)
    rays: {
        enabled: false,     // Enabled dynamically for total eclipse
        count: 16,          // Number of rays
        rayLength: 2.5,     // Ray length
        rayWidth: 0.05      // Ray thickness
    },

    // Animation configuration
    animations: {
        rotation: {
            enabled: true,
            speed: 0.05     // Radians per second
        },
        pulse: {
            enabled: true,
            freq: 0.3,      // Hz
            amp: 0.08       // Amplitude (0-1)
        },
        shimmer: {
            enabled: true,
            noiseScale: 1.5 // Noise frequency
        }
    }
};

/**
 * Get configuration for a specific eclipse type
 * @param {string} eclipseType - Eclipse type from ECLIPSE_TYPES
 * @returns {Object} Eclipse configuration
 */
export function getEclipseConfig(eclipseType) {
    return ECLIPSE_CONFIG[eclipseType] || ECLIPSE_CONFIG[ECLIPSE_TYPES.OFF];
}

/**
 * Get corona configuration
 * @returns {Object} Corona configuration
 */
export function getCoronaConfig() {
    return CORONA_CONFIG;
}
