/**
 * Effects Registry Stub — Minimal Build
 * EffectsRenderManager, RenderFinalizationManager, RadiusCalculator call
 * isEffectActive(), applyEffect(), getEffect().
 * All return false/null so no effects run.
 */
export function registerEffect() {}
export function getEffect() { return null; }
export function applyEffect() { return false; }
export function isEffectActive() { return false; }
export function getAllEffects() { return []; }

export default { registerEffect, getEffect, applyEffect, isEffectActive, getAllEffects };
