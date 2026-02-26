/**
 * Dependency Injection module
 *
 * Provides CoreContext and SharedState for manager dependency injection.
 */

export { createCoreContext, createMockCoreContext } from './CoreContext.js';
export {
    createSharedState,
    createSharedStateFromMascot,
    createMockSharedState,
} from './SharedState.js';
