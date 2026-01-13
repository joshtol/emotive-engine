/**
 * Suggestion utilities for providing helpful "did you mean?" feedback
 * @module utils/suggestions
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance between strings
 */
export function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Initialize first column
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Initialize first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Suggest the closest match from a list of valid options
 * @param {string} input - User input to match
 * @param {string[]} validOptions - Array of valid option strings
 * @param {number} [maxDistance=3] - Maximum edit distance to consider a match
 * @returns {string|null} Closest match or null if none within threshold
 *
 * @example
 * suggestClosestMatch('joye', ['joy', 'sadness', 'anger'])
 * // Returns: 'joy'
 *
 * @example
 * suggestClosestMatch('hapy', ['joy', 'sadness', 'anger', 'happy'])
 * // Returns: 'happy'
 */
export function suggestClosestMatch(input, validOptions, maxDistance = 3) {
    if (!input || typeof input !== 'string') {
        return null;
    }

    if (!Array.isArray(validOptions) || validOptions.length === 0) {
        return null;
    }

    const inputLower = input.toLowerCase().trim();
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const option of validOptions) {
        if (typeof option !== 'string') continue;

        const optionLower = option.toLowerCase();
        const distance = levenshteinDistance(inputLower, optionLower);

        if (distance < bestDistance && distance <= maxDistance) {
            bestDistance = distance;
            bestMatch = option;
        }
    }

    return bestMatch;
}

/**
 * Suggest multiple close matches from a list of valid options
 * @param {string} input - User input to match
 * @param {string[]} validOptions - Array of valid option strings
 * @param {number} [maxDistance=3] - Maximum edit distance to consider
 * @param {number} [maxResults=3] - Maximum number of suggestions to return
 * @returns {string[]} Array of close matches, sorted by similarity
 *
 * @example
 * suggestMultipleMatches('bonce', ['bounce', 'pulse', 'nod', 'bond'])
 * // Returns: ['bounce', 'bond']
 */
export function suggestMultipleMatches(input, validOptions, maxDistance = 3, maxResults = 3) {
    if (!input || typeof input !== 'string') {
        return [];
    }

    if (!Array.isArray(validOptions) || validOptions.length === 0) {
        return [];
    }

    const inputLower = input.toLowerCase().trim();
    const matches = [];

    for (const option of validOptions) {
        if (typeof option !== 'string') continue;

        const optionLower = option.toLowerCase();
        const distance = levenshteinDistance(inputLower, optionLower);

        if (distance <= maxDistance) {
            matches.push({ option, distance });
        }
    }

    // Sort by distance (closest first), then alphabetically
    matches.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        }
        return a.option.localeCompare(b.option);
    });

    return matches.slice(0, maxResults).map(m => m.option);
}

/**
 * Format a suggestion message for an invalid value
 * @param {string} paramName - Name of the parameter (e.g., 'emotion', 'gesture')
 * @param {string} invalidValue - The invalid value provided by the user
 * @param {string[]} validOptions - Array of valid options
 * @param {number} [maxDistance=3] - Maximum edit distance for suggestions
 * @returns {string} Formatted error message with suggestion
 *
 * @example
 * formatSuggestionMessage('emotion', 'joye', ['joy', 'sadness', 'anger'])
 * // Returns: "Unknown emotion 'joye'. Did you mean 'joy'?"
 */
export function formatSuggestionMessage(paramName, invalidValue, validOptions, maxDistance = 3) {
    const suggestion = suggestClosestMatch(invalidValue, validOptions, maxDistance);

    if (suggestion) {
        return `Unknown ${paramName} '${invalidValue}'. Did you mean '${suggestion}'?`;
    }

    // No close match found - show some valid options
    const displayOptions = validOptions.slice(0, 5);
    const optionsList = displayOptions.join(', ');
    const moreText = validOptions.length > 5 ? `, ... (${validOptions.length} total)` : '';

    return `Unknown ${paramName} '${invalidValue}'. Valid options: ${optionsList}${moreText}`;
}

export default {
    levenshteinDistance,
    suggestClosestMatch,
    suggestMultipleMatches,
    formatSuggestionMessage
};
