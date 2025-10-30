/**
 * EpisodicEffectController - Manages episodic effects for emotional undertones
 *
 * Handles autonomous timing and triggering of episodic animation effects
 * for different undertones (nervous, confident, tired, intense, subdued).
 * Each undertone has unique episodic animations that occur at intervals:
 * - Nervous: Flutter/shiver effects
 * - Confident: Chest puff/power pose
 * - Tired: Drowsy sag/micro-sleep
 * - Intense: Laser focus/contraction
 * - Subdued: Withdrawal/inward pull
 *
 * @class EpisodicEffectController
 */
export class EpisodicEffectController {
    /**
     * Create an EpisodicEffectController
     * @param {Object} renderer - Reference to the EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        // Initialize episodic effects for each undertone
        this.episodicEffects = {
            nervous: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 2000 // 3-5 seconds
            },
            confident: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 2000 // 4-6 seconds
            },
            tired: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 5000 + Math.random() * 2000 // 5-7 seconds
            },
            intense: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 3000 + Math.random() * 3000 // 3-6 seconds
            },
            subdued: {
                active: false,
                startTime: 0,
                duration: 0,
                intensity: 0,
                nextTrigger: 4000 + Math.random() * 3000 // 4-7 seconds
            }
        };
    }

    /**
     * Get episodic effects state
     * @returns {Object} Episodic effects state
     */
    getEpisodicEffects() {
        return this.episodicEffects;
    }

    /**
     * Update and apply episodic effects for the current undertone
     * Modifies jitter and radius parameters based on active episodes
     *
     * @param {string} currentUndertone - Current undertone (nervous, confident, etc.)
     * @param {number} jitterX - Current X jitter amount (modified in place)
     * @param {number} jitterY - Current Y jitter amount (modified in place)
     * @param {number} coreRadius - Current core radius (modified in place)
     * @param {number} glowRadius - Current glow radius (modified in place)
     * @returns {Object} Modified values { jitterX, jitterY, coreRadius, glowRadius }
     */
    updateEpisodicEffects(currentUndertone, jitterX, jitterY, coreRadius, glowRadius) {
        if (!currentUndertone || !this.episodicEffects[currentUndertone]) {
            return { jitterX, jitterY, coreRadius, glowRadius };
        }

        const episode = this.episodicEffects[currentUndertone];
        const now = performance.now();

        // Check if it's time to trigger a new episode
        if (!episode.active && now >= episode.nextTrigger) {
            episode.active = true;
            episode.startTime = now;

            // Set episode parameters based on undertone type
            switch(currentUndertone) {
            case 'nervous':
                episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                episode.intensity = 2 + Math.random(); // 2-3px flutter
                episode.nextTrigger = now + 3000 + Math.random() * 2000; // 3-5 seconds
                break;
            case 'confident':
                episode.duration = 1000 + Math.random() * 1000; // 1-2 seconds
                episode.intensity = 0.15; // 15% size expansion
                episode.nextTrigger = now + 4000 + Math.random() * 2000; // 4-6 seconds
                break;
            case 'tired':
                episode.duration = 1000 + Math.random() * 2000; // 1-3 seconds
                episode.intensity = 0.2; // 20% size reduction
                episode.nextTrigger = now + 5000 + Math.random() * 2000; // 5-7 seconds
                break;
            case 'intense':
                episode.duration = 500 + Math.random() * 500; // 0.5-1 second
                episode.intensity = 0.5; // 50% glow boost, 5% size shrink
                episode.nextTrigger = now + 3000 + Math.random() * 3000; // 3-6 seconds
                break;
            case 'subdued':
                episode.duration = 2000 + Math.random() * 1000; // 2-3 seconds
                episode.intensity = 0.3; // 30% glow dim, 10% size shrink
                episode.nextTrigger = now + 4000 + Math.random() * 3000; // 4-7 seconds
                break;
            }
        }

        // Apply episode effects if active
        if (episode.active) {
            const elapsed = now - episode.startTime;

            if (elapsed < episode.duration) {
                const progress = elapsed / episode.duration;

                // Apply different effects based on undertone
                switch(currentUndertone) {
                case 'nervous': {
                    // Quick shiver that settles
                    const damping = 1 - progress;
                    const frequency = 15;
                    const flutter = Math.sin(progress * Math.PI * frequency) * damping;
                    jitterX = flutter * episode.intensity;
                    jitterY = flutter * episode.intensity * 0.7;
                    break;
                }

                case 'confident': {
                    // Smooth chest puff that settles
                    const puffCurve = Math.sin(progress * Math.PI); // Smooth rise and fall
                    coreRadius *= (1 + episode.intensity * puffCurve);
                    glowRadius *= (1 + episode.intensity * 0.5 * puffCurve);
                    break;
                }

                case 'tired': {
                    // Drowsy sag with slow recovery
                    const sagCurve = Math.sin(progress * Math.PI * 0.5); // Slow droop
                    coreRadius *= (1 - episode.intensity * sagCurve);
                    // Also affect vertical position slightly
                    jitterY += sagCurve * 5; // Slight downward sag
                    break;
                }

                case 'intense': {
                    // Sharp contraction with glow surge
                    const focusCurve = 1 - Math.cos(progress * Math.PI); // Quick in-out
                    coreRadius *= (1 - 0.05 * focusCurve); // 5% shrink
                    glowRadius *= (1 + episode.intensity * focusCurve); // 50% glow boost
                    break;
                }

                case 'subdued': {
                    // Gentle inward pull
                    const withdrawCurve = Math.sin(progress * Math.PI * 0.5); // Slow pull
                    coreRadius *= (1 - 0.1 * withdrawCurve); // 10% shrink
                    glowRadius *= (1 - episode.intensity * withdrawCurve); // 30% glow dim
                    break;
                }
                }
            } else {
                // Episode finished
                episode.active = false;
            }
        }

        return { jitterX, jitterY, coreRadius, glowRadius };
    }

    /**
     * Reset all episodic effects to default state
     */
    reset() {
        Object.keys(this.episodicEffects).forEach(key => {
            this.episodicEffects[key].active = false;
            this.episodicEffects[key].startTime = 0;
            this.episodicEffects[key].duration = 0;
            this.episodicEffects[key].intensity = 0;
        });
    }

    /**
     * Get the current episode state for a specific undertone
     * @param {string} undertone - Undertone name
     * @returns {Object|null} Episode state or null if not found
     */
    getEpisodeState(undertone) {
        return this.episodicEffects[undertone] || null;
    }

    /**
     * Check if an episode is active for a specific undertone
     * @param {string} undertone - Undertone name
     * @returns {boolean} True if episode is active
     */
    isEpisodeActive(undertone) {
        const episode = this.episodicEffects[undertone];
        return episode ? episode.active : false;
    }
}
