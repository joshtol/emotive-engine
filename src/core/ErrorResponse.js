/**
 * Re-export from canonical location for backwards-compatible import paths.
 * Several modules import from '../core/ErrorResponse.js' — this barrel
 * resolves that path to the actual file in core/events/.
 */
export { ErrorResponse, ErrorTypes, ErrorSeverity } from './events/ErrorResponse.js';
