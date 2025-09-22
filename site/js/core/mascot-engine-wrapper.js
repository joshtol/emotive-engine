/*!
 * Mascot Engine ES6 Wrapper
 * This module loads the EmotiveMascot class from the source
 */

// Import the actual mascot engine from built files
import EmotiveMascot from '../mascot.js';

// Export as MascotEngine for compatibility
export { EmotiveMascot as MascotEngine };
export default EmotiveMascot;