/**
 * Intent Parsing System
 *
 * Provides natural language intent parsing for LLM integration.
 * Allows LLMs to express intent in plain text rather than API calls.
 *
 * @module core/intent
 *
 * @example
 * import { IntentParser } from './core/intent';
 *
 * const parser = new IntentParser();
 * const result = parser.parse('happy, bouncing, heart shape');
 * // { emotion: 'joy', gestures: ['bounce'], shape: 'heart', ... }
 */

export { IntentParser } from './IntentParser.js';
export { tokenize, isConnector, isNegation } from './tokenizer.js';
export { resolve, hasConflict, getPossibilities } from './conflictResolver.js';

// Re-export synonyms
export * from './synonyms/index.js';
