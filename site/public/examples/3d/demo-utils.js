/**
 * EMOTIVE ENGINE - Shared Demo Utilities
 *
 * Common functionality for all 3D demos:
 * - Collapsible sections (auto-initialized)
 * - Toggle handlers (wobble, particles, visual controls)
 * - SSS preset application
 * - Tidal lock camera behavior (for moon demos)
 * - Blend layer management
 */

import { createLayerCard, setupDragAndDrop } from '/examples/3d/layer-utils.js';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZED: COLLAPSIBLE SECTIONS
// Runs automatically when this module is imported
// ═══════════════════════════════════════════════════════════════════════════════

function initSectionToggles() {
    document.querySelectorAll('.section h2').forEach(h2 => {
        h2.addEventListener('click', e => {
            // Don't collapse if clicking on a toggle switch inside the header
            if (e.target.closest('.toggle-switch') || e.target.closest('.featured-gesture')) return;

            const content = h2.nextElementSibling;
            if (content?.classList.contains('section-content')) {
                h2.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            }
        });
    });
}

// Run immediately if DOM is already parsed (e.g. dynamically imported from a module
// with top-level await), otherwise wait for DOMContentLoaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionToggles);
} else {
    initSectionToggles();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOGGLE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Setup wobble toggle (typically in Emotions header)
 * @param {Function|Object} mascotGetter - Function returning mascot instance, or mascot instance directly
 */
export function setupWobbleToggle(mascotGetter) {
    const wobbleToggle = document.getElementById('wobble-toggle');
    if (!wobbleToggle) return;

    // Support both direct reference and getter function for deferred initialization
    const getMascot = typeof mascotGetter === 'function' ? mascotGetter : () => mascotGetter;

    wobbleToggle.addEventListener('click', e => {
        e.stopPropagation(); // Prevent collapsing the section
        const mascot = getMascot();
        if (!mascot) return;
        wobbleToggle.classList.toggle('active');
        const enabled = wobbleToggle.classList.contains('active');
        if (enabled) {
            mascot.enableWobble();
        } else {
            mascot.disableWobble();
        }
    });
}

/**
 * Setup particles toggle (typically in Visuals header)
 * @param {Function|Object} mascotGetter - Function returning mascot instance, or mascot instance directly
 */
export function setupParticlesToggle(mascotGetter) {
    const particlesToggle = document.getElementById('particles-toggle');
    if (!particlesToggle) return;

    // Support both direct reference and getter function for deferred initialization
    const getMascot = typeof mascotGetter === 'function' ? mascotGetter : () => mascotGetter;

    particlesToggle.addEventListener('click', e => {
        e.stopPropagation(); // Prevent collapsing the section
        const mascot = getMascot();
        if (!mascot) return;
        particlesToggle.classList.toggle('active');
        const enabled = particlesToggle.classList.contains('active');
        if (enabled) {
            mascot.enableParticles();
        } else {
            mascot.disableParticles();
        }
    });
}

/**
 * Setup standard visual toggle switches (Core Glow, Breathing, Auto-Rotate, Blinking)
 * Works with both button and toggle-switch elements
 * @param {Function|Object} mascotGetter - Function returning mascot instance, or mascot instance directly
 */
export function setupVisualToggles(mascotGetter) {
    // Support both direct reference and getter function for deferred initialization
    const getMascot = typeof mascotGetter === 'function' ? mascotGetter : () => mascotGetter;

    document.querySelectorAll('[data-action]').forEach(el => {
        const {action} = el.dataset;

        // Only handle visual toggle actions
        if (!['toggle-glow', 'toggle-breathing', 'toggle-auto-rotate', 'toggle-blink'].includes(action)) {
            return;
        }

        el.addEventListener('click', () => {
            const mascot = getMascot();
            if (!mascot) return;

            switch (action) {
            case 'toggle-glow':
                if (mascot.core3D?.coreGlowEnabled !== false) {
                    mascot.core3D.setCoreGlowEnabled(false);
                    el.classList.remove('active');
                } else {
                    mascot.core3D.setCoreGlowEnabled(true);
                    el.classList.add('active');
                }
                break;

            case 'toggle-blink':
                if (mascot.blinkingEnabled) {
                    mascot.disableBlinking();
                    el.classList.remove('active');
                } else {
                    mascot.enableBlinking();
                    el.classList.add('active');
                }
                break;

            case 'toggle-breathing':
                if (mascot.breathingEnabled) {
                    mascot.disableBreathing();
                    el.classList.remove('active');
                } else {
                    mascot.enableBreathing();
                    el.classList.add('active');
                }
                break;

            case 'toggle-auto-rotate':
                if (mascot.autoRotateEnabled) {
                    mascot.disableAutoRotate();
                    el.classList.remove('active');
                } else {
                    mascot.enableAutoRotate();
                    el.classList.add('active');
                }
                break;
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SSS PRESETS
// These match the presets in subsurfaceScattering.js but with demo-specific additions
// ═══════════════════════════════════════════════════════════════════════════════

export const sssPresets = {
    quartz: {
        sssStrength: 0.8,
        sssAbsorption: [2.8, 2.9, 3.0],
        sssScatterDistance: [0.2, 0.2, 0.25],
        sssThicknessBias: 0.60,
        sssThicknessScale: 1.8,
        sssCurvatureScale: 3.0,
        sssAmbient: 0.12,
        frostiness: 0.15,
        innerGlowStrength: 0.20,
        fresnelIntensity: 1.5,
        causticIntensity: 1.2
        // Soul blend layers come from CrystalSoul defaults (Color Burn + Multiply)
        // Shell/Rim/SSS layers are intentionally empty for clear quartz
    },
    emerald: {
        sssStrength: 2.0,
        sssAbsorption: [0.05, 4.0, 0.1],
        sssScatterDistance: [0.1, 0.5, 0.1],
        sssThicknessBias: 0.65,
        sssThicknessScale: 1.8,
        sssCurvatureScale: 3.0,
        sssAmbient: 0.10,
        frostiness: 0.20,
        innerGlowStrength: 0.15,
        fresnelIntensity: 1.2,
        emotionColorBleed: 0.35
    },
    ruby: {
        sssStrength: 1.8,
        sssAbsorption: [4.0, 0.03, 0.08],
        sssScatterDistance: [0.4, 0.04, 0.08],
        sssThicknessBias: 0.65,
        sssThicknessScale: 1.9,
        sssCurvatureScale: 2.5,
        sssAmbient: 0.08,
        frostiness: 0.12,
        innerGlowStrength: 0.12,
        fresnelIntensity: 1.2,
        causticIntensity: 1.15,
        emotionColorBleed: 0.35
    },
    sapphire: {
        sssStrength: 2.2,
        sssAbsorption: [0.15, 0.4, 4.0],
        sssScatterDistance: [0.1, 0.15, 0.5],
        sssThicknessBias: 0.65,
        sssThicknessScale: 1.8,
        sssCurvatureScale: 3.0,
        sssAmbient: 0.10,
        frostiness: 0.18,
        innerGlowStrength: 0.15,
        fresnelIntensity: 1.3,
        emotionColorBleed: 0.35
    },
    amethyst: {
        sssStrength: 2.5,
        sssAbsorption: [3.0, 0.05, 4.5],
        sssScatterDistance: [0.4, 0.05, 0.5],
        sssThicknessBias: 0.70,
        sssThicknessScale: 2.0,
        sssCurvatureScale: 3.0,
        sssAmbient: 0.08,
        frostiness: 0.18,
        innerGlowStrength: 0.12,
        fresnelIntensity: 1.4,
        emotionColorBleed: 0.35
    },
    topaz: {
        sssStrength: 1.5,
        sssAbsorption: [3.5, 2.0, 0.1],
        sssScatterDistance: [0.3, 0.2, 0.05],
        sssThicknessBias: 0.60,
        sssThicknessScale: 1.7,
        sssCurvatureScale: 2.8,
        sssAmbient: 0.12,
        frostiness: 0.14,
        innerGlowStrength: 0.18,
        fresnelIntensity: 1.4,
        causticIntensity: 1.1,
        emotionColorBleed: 0.25
    },
    citrine: {
        sssStrength: 1.6,
        sssAbsorption: [3.8, 2.5, 0.05],
        sssScatterDistance: [0.35, 0.25, 0.05],
        sssThicknessBias: 0.58,
        sssThicknessScale: 1.6,
        sssCurvatureScale: 2.6,
        sssAmbient: 0.14,
        frostiness: 0.12,
        innerGlowStrength: 0.22,
        fresnelIntensity: 1.3,
        causticIntensity: 1.2,
        emotionColorBleed: 0.20
    },
    diamond: {
        sssStrength: 0.5,
        sssAbsorption: [2.5, 2.5, 2.5],
        sssScatterDistance: [0.15, 0.15, 0.15],
        sssThicknessBias: 0.55,
        sssThicknessScale: 1.5,
        sssCurvatureScale: 4.0,
        sssAmbient: 0.15,
        frostiness: 0.08,
        innerGlowStrength: 0.25,
        fresnelIntensity: 2.0,
        causticIntensity: 1.5,
        emotionColorBleed: 0.0
    }
};

/**
 * Apply an SSS preset to a mascot's crystal material
 * @param {Object} mascot - EmotiveMascot3D instance
 * @param {string} presetName - Name of the preset (quartz, emerald, ruby, sapphire, amethyst)
 * @param {string} currentGeometry - Current geometry type (to skip heart-specific overrides)
 */
export function applySSSPreset(mascot, presetName, currentGeometry = 'crystal') {
    const preset = sssPresets[presetName];
    if (!preset || !mascot?.core3D?.customMaterial?.uniforms) return;

    const u = mascot.core3D.customMaterial.uniforms;

    // Apply SSS-specific values (these work for all geometries)
    if (u.sssStrength) u.sssStrength.value = preset.sssStrength;
    if (u.sssAbsorption) u.sssAbsorption.value.set(...preset.sssAbsorption);
    if (u.sssScatterDistance) u.sssScatterDistance.value.set(...preset.sssScatterDistance);
    if (u.sssThicknessBias) u.sssThicknessBias.value = preset.sssThicknessBias;
    if (u.sssThicknessScale) u.sssThicknessScale.value = preset.sssThicknessScale;
    if (u.sssCurvatureScale) u.sssCurvatureScale.value = preset.sssCurvatureScale;
    if (u.sssAmbient) u.sssAmbient.value = preset.sssAmbient;

    // Apply caustic intensity if specified
    if (preset.causticIntensity !== undefined && u.causticIntensity) {
        u.causticIntensity.value = preset.causticIntensity;
    }

    // Apply emotion color bleed (for colored gems, allows soul color to show through)
    if (u.emotionColorBleed) {
        u.emotionColorBleed.value = preset.emotionColorBleed ?? 0.0;
    }

    // Heart has its own calibrated appearance values - don't override them
    if (currentGeometry !== 'heart') {
        if (u.frostiness) u.frostiness.value = preset.frostiness;
        if (u.innerGlowStrength) u.innerGlowStrength.value = preset.innerGlowStrength;
        if (u.fresnelIntensity) u.fresnelIntensity.value = preset.fresnelIntensity;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIDAL LOCK CAMERA (for Moon demos)
// After user stops rotating, smoothly return camera to tidal lock position
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Setup tidal lock behavior for moon demos
 * @param {Object} mascot - EmotiveMascot3D instance
 * @param {number} idleDelay - Milliseconds to wait before returning to lock (default 2000)
 * @returns {Object} Controller with stop() method to disable tidal lock
 */
export function setupTidalLock(mascot, idleDelay = 2000) {
    let tidalLockTimeout = null;
    let isReturningToLock = false;
    let tidalLockAzimuth = 0;
    let tidalLockPolar = Math.PI / 2;
    let isEnabled = true;

    // Capture tidal lock position once controls are ready
    setTimeout(() => {
        const controls = mascot.core3D?.renderer?.controls;
        if (controls) {
            tidalLockAzimuth = controls.getAzimuthalAngle();
            tidalLockPolar = controls.getPolarAngle();
        }
    }, 100);

    // Smoothly animate back to tidal lock
    function returnToTidalLock() {
        if (!isEnabled) return;
        const controls = mascot.core3D?.renderer?.controls;
        if (!controls) return;

        isReturningToLock = true;
        const startAzimuth = controls.getAzimuthalAngle();
        const startPolar = controls.getPolarAngle();
        const startTime = performance.now();
        const duration = 1500;

        function animateReturn() {
            if (!isReturningToLock || !isEnabled) return;

            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentAzimuth = startAzimuth + (tidalLockAzimuth - startAzimuth) * eased;
            const currentPolar = startPolar + (tidalLockPolar - startPolar) * eased;

            const distance = controls.getDistance();
            const {target} = controls;
            const x = target.x + distance * Math.sin(currentPolar) * Math.sin(currentAzimuth);
            const y = target.y + distance * Math.cos(currentPolar);
            const z = target.z + distance * Math.sin(currentPolar) * Math.cos(currentAzimuth);
            controls.object.position.set(x, y, z);
            controls.update();

            if (progress < 1) {
                requestAnimationFrame(animateReturn);
            } else {
                isReturningToLock = false;
            }
        }

        animateReturn();
    }

    function onUserInteraction() {
        if (tidalLockTimeout) {
            clearTimeout(tidalLockTimeout);
            tidalLockTimeout = null;
        }
        isReturningToLock = false;
    }

    function onUserInteractionEnd() {
        if (!isEnabled) return;
        if (tidalLockTimeout) clearTimeout(tidalLockTimeout);
        tidalLockTimeout = setTimeout(returnToTidalLock, idleDelay);
    }

    // Named handler for pointermove (so we can remove it)
    function onPointerMove(e) {
        if (e.buttons > 0) onUserInteraction();
    }

    // Track canvas reference for cleanup
    let attachedCanvas = null;

    // Attach listeners once canvas is ready
    setTimeout(() => {
        const canvas = mascot.core3D?.renderer?.renderer?.domElement;
        if (canvas) {
            attachedCanvas = canvas;
            canvas.addEventListener('pointerdown', onUserInteraction);
            canvas.addEventListener('pointermove', onPointerMove);
            canvas.addEventListener('pointerup', onUserInteractionEnd);
            canvas.addEventListener('pointerleave', onUserInteractionEnd);
        }
    }, 200);

    // Return controller with cleanup methods
    return {
        stop() {
            isEnabled = false;
            if (tidalLockTimeout) {
                clearTimeout(tidalLockTimeout);
                tidalLockTimeout = null;
            }
            isReturningToLock = false;
        },
        start() {
            isEnabled = true;
        },
        /** Remove all event listeners (call when destroying mascot) */
        destroy() {
            this.stop();
            if (attachedCanvas) {
                attachedCanvas.removeEventListener('pointerdown', onUserInteraction);
                attachedCanvas.removeEventListener('pointermove', onPointerMove);
                attachedCanvas.removeEventListener('pointerup', onUserInteractionEnd);
                attachedCanvas.removeEventListener('pointerleave', onUserInteractionEnd);
                attachedCanvas = null;
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY: Check if geometry is crystal-type
// ═══════════════════════════════════════════════════════════════════════════════

export function isCrystalGeometry(geometry) {
    return ['crystal', 'heart', 'rough'].includes(geometry);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLEND LAYER MANAGEMENT
// Shared functionality for blend layer UI across all demos
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create and manage a blend layer group
 * @param {Object} options
 * @param {string} options.name - Short name for the layer type (Shell, Soul, Rim, SSS, Corona, Layer)
 * @param {string} options.containerId - ID of the container element
 * @param {string} options.addBtnId - ID of the add button
 * @param {number} options.maxLayers - Maximum number of layers (default 2)
 * @param {Function} options.updateShader - Function to update shader uniforms
 * @param {string[]} options.blendModeNames - Array of blend mode names
 * @returns {Object} Layer group controller with methods: addLayer, removeLayer, clearLayers, getLayers, syncFromShader
 */
export function createBlendLayerGroup({
    name,
    containerId,
    addBtnId,
    maxLayers = 2,
    updateShader,
    blendModeNames
}) {
    const container = document.getElementById(containerId);
    const addBtn = document.getElementById(addBtnId);
    if (!container) {
        console.warn(`Blend layer container not found: ${containerId}`);
        return null;
    }

    const layers = [];
    let nextLayerId = 1;

    function updateLayers() {
        updateShader?.(layers);
    }

    function addLayer(mode = 0, strength = 1.0, enabled = true, skipUpdate = false) {
        if (layers.length >= maxLayers) return null;
        const layer = { id: nextLayerId++, mode, strength, enabled };
        layers.push(layer);
        const card = createLayerCard({
            layer,
            blendModeNames,
            prefix: name,
            onUpdate: updateLayers,
            onDelete: removeLayer
        });
        container.appendChild(card);
        if (!skipUpdate) updateLayers();
        return layer;
    }

    function removeLayer(layerId) {
        const idx = layers.findIndex(l => l.id === layerId);
        if (idx === -1) return;
        layers.splice(idx, 1);
        container.querySelector(`[data-layer-id="${layerId}"]`)?.remove();
        updateLayers();
    }

    function clearLayers() {
        layers.length = 0;
        container.innerHTML = '';
        nextLayerId = 1;
    }

    function getLayers() {
        return layers;
    }

    // Setup drag and drop
    setupDragAndDrop(container, layers, updateLayers);

    // Setup add button
    if (addBtn) {
        addBtn.addEventListener('click', () => addLayer());
    }

    return {
        addLayer,
        removeLayer,
        clearLayers,
        getLayers,
        getContainer: () => container
    };
}

/**
 * Create shader update function for standard layer uniforms
 * @param {Function} getUniforms - Function that returns the uniforms object
 * @param {string} prefix - Uniform prefix (layer, shellLayer, rimLayer, sssLayer)
 * @param {number} maxLayers - Maximum number of layers
 * @returns {Function} Update function for use with createBlendLayerGroup
 */
export function createLayerShaderUpdater(getUniforms, prefix, maxLayers) {
    return layers => {
        const u = getUniforms();
        if (!u) return;

        for (let i = 0; i < maxLayers; i++) {
            const layer = layers[i];
            const idx = i + 1;
            if (u[`${prefix}${idx}Mode`]) u[`${prefix}${idx}Mode`].value = layer?.mode ?? 0;
            if (u[`${prefix}${idx}Strength`]) u[`${prefix}${idx}Strength`].value = layer?.strength ?? 0;
            if (u[`${prefix}${idx}Enabled`]) u[`${prefix}${idx}Enabled`].value = layer?.enabled ? 1 : 0;
        }
    };
}

/**
 * Sync blend layer UI from shader uniforms
 * @param {Object} layerGroup - Layer group controller from createBlendLayerGroup
 * @param {Function} getUniforms - Function that returns the uniforms object
 * @param {string} prefix - Uniform prefix (layer, shellLayer, rimLayer, sssLayer)
 * @param {number} maxLayers - Maximum number of layers
 */
export function syncLayersFromShader(layerGroup, getUniforms, prefix, maxLayers) {
    const u = getUniforms();
    if (!u || !layerGroup) return;

    layerGroup.clearLayers();

    for (let i = 1; i <= maxLayers; i++) {
        const enabledKey = `${prefix}${i}Enabled`;
        const enabledUniform = u[enabledKey];
        if (enabledUniform && enabledUniform.value > 0.5) {
            const mode = Math.round(u[`${prefix}${i}Mode`]?.value || 0);
            const strength = u[`${prefix}${i}Strength`]?.value || 1.0;
            layerGroup.addLayer(mode, strength, true, true);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRECISION SLIDER POPUP
// Auto-initializes for all .slider-value elements - click value to fine-tune
// ═══════════════════════════════════════════════════════════════════════════════

let activePrecisionPopup = null;

function closePrecisionPopup() {
    if (activePrecisionPopup) {
        activePrecisionPopup.remove();
        activePrecisionPopup = null;
    }
}

function openPrecisionPopup(valueElement, slider, title) {
    closePrecisionPopup();

    const rect = valueElement.getBoundingClientRect();
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const step = parseFloat(slider.step) || 0.01;
    const currentValue = parseFloat(slider.value);

    // Determine decimal places from step
    const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : 1;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'slider-precision-popup';
    popup.innerHTML = `
        <div class="slider-precision-header">
            <span class="slider-precision-title">${title}</span>
            <button class="slider-precision-close">Done</button>
        </div>
        <div class="slider-precision-value">${currentValue.toFixed(decimals)}</div>
        <div class="slider-precision-fader">
            <button class="fader-step" data-step="-1">−</button>
            <input type="range" class="slider-precision-slider" min="${min}" max="${max}" step="${step}" value="${currentValue}">
            <button class="fader-step" data-step="1">+</button>
        </div>
        <div class="slider-precision-range">
            <span>${min.toFixed(decimals)}</span>
            <span>${max.toFixed(decimals)}</span>
        </div>
    `;

    document.body.appendChild(popup);

    // Position popup - center in viewport on mobile, near element on desktop
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768;

    let left, top;

    if (isMobile) {
        // Center in viewport on mobile
        left = (viewportWidth - popupRect.width) / 2;
        top = (viewportHeight - popupRect.height) / 2;
    } else {
        // Position near the value element on desktop
        left = rect.left + (rect.width / 2) - (popupRect.width / 2);
        if (left + popupRect.width > viewportWidth - 10) {
            left = viewportWidth - popupRect.width - 10;
        }
        if (left < 10) left = 10;

        top = rect.bottom + 10;
        if (top + popupRect.height > viewportHeight - 10) {
            top = rect.top - popupRect.height - 10;
        }
        if (top < 10) top = 10;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    activePrecisionPopup = popup;

    // Elements
    const precisionSlider = popup.querySelector('.slider-precision-slider');
    const valueDisplay = popup.querySelector('.slider-precision-value');
    const closeBtn = popup.querySelector('.slider-precision-close');
    const stepBtns = popup.querySelectorAll('.fader-step');

    // Update function
    function updateValue(newValue) {
        newValue = Math.max(min, Math.min(max, newValue));
        precisionSlider.value = newValue;
        slider.value = newValue;
        valueDisplay.textContent = newValue.toFixed(decimals);

        // Update the original value element - preserve any suffix (%, °, x, etc.)
        const originalText = valueElement.textContent;
        const suffix = originalText.replace(/^[\d.\\-]+/, '');
        valueElement.textContent = newValue.toFixed(decimals) + suffix;

        // Dispatch input event to trigger any bound handlers
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Precision slider input
    precisionSlider.addEventListener('input', () => {
        updateValue(parseFloat(precisionSlider.value));
    });

    // Step buttons
    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = parseInt(btn.dataset.step, 10);
            updateValue(parseFloat(precisionSlider.value) + (step * direction));
        });
    });

    // Close button
    closeBtn.addEventListener('click', closePrecisionPopup);

    // Click outside to close
    setTimeout(() => {
        document.addEventListener('click', function handler(e) {
            if (!popup.contains(e.target) && e.target !== valueElement) {
                closePrecisionPopup();
                document.removeEventListener('click', handler);
            }
        });
    }, 0);

    // Escape to close
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            closePrecisionPopup();
            document.removeEventListener('keydown', handler);
        }
    });
}

// Auto-initialize precision mode for all sliders
function initPrecisionSliders() {
    document.querySelectorAll('.slider-value').forEach(valueEl => {
        const sliderControl = valueEl.closest('.slider-control');
        if (!sliderControl) return;

        const slider = sliderControl.querySelector('input[type="range"]');
        if (!slider) return;

        const labelEl = sliderControl.querySelector('.slider-label span:first-child');
        const title = labelEl ? labelEl.textContent : 'Fine Tune';

        // Add clickable cursor style
        valueEl.style.cursor = 'pointer';

        valueEl.addEventListener('click', e => {
            e.stopPropagation();
            openPrecisionPopup(valueEl, slider, title);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrecisionSliders);
} else {
    initPrecisionSliders();
}

// Export for manual use if needed
export { openPrecisionPopup, closePrecisionPopup };

// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// Shared utilities for button state, sliders, and color pickers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Set the active button within a group — removes .active from all matching
 * the selector, then adds it to the target element.
 * @param {string} selector - CSS selector for the button group
 * @param {Element} target - The button to make active
 */
export function setActiveButton(selector, target) {
    document.querySelectorAll(selector).forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
}

/**
 * Convert a hex color string to a normalized [0-1] RGB array.
 * @param {string} hex - Hex color (e.g. '#ff9400')
 * @returns {number[]} [r, g, b] with values 0-1
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [1.0, 1.0, 1.0];
}

/**
 * Wire up a color picker input to display RGB values and call a callback.
 * @param {string} pickerId - ID of the <input type="color">
 * @param {string} valueId - ID of the element to show "RGB: r, g, b"
 * @param {Function} onColorChange - Called with [r, g, b] (0-1) on each change
 */
export function setupColorPicker(pickerId, valueId, onColorChange) {
    const picker = document.getElementById(pickerId);
    if (!picker) return;
    picker.addEventListener('input', (e) => {
        const rgb = hexToRgb(e.target.value);
        const valueEl = document.getElementById(valueId);
        if (valueEl) valueEl.textContent = `RGB: ${rgb[0].toFixed(2)}, ${rgb[1].toFixed(2)}, ${rgb[2].toFixed(2)}`;
        onColorChange?.(rgb);
    });
}

/**
 * Wire up a range slider to update a display element and call a callback.
 * @param {string} sliderId - ID of the <input type="range">
 * @param {string} valueId - ID of the element to show the current value
 * @param {Function} onUpdate - Called with the parsed float value
 * @param {number} [decimals=2] - Number of decimal places in the display
 * @param {string} [suffix=''] - Suffix appended to the display value (e.g. '°', '%')
 */
export function setupSlider(sliderId, valueId, onUpdate, decimals = 2, suffix = '') {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    if (!slider) return;
    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        if (valueDisplay) valueDisplay.textContent = value.toFixed(decimals) + suffix;
        onUpdate(value);
    });
}

/**
 * Programmatically sync a slider and its display to a given value.
 * @param {string} id - Base ID (slider is `${id}-slider`, display is `${id}-value`)
 * @param {*} value - The value to set
 * @param {number} [decimals=2] - Decimal places for the display
 */
export function setSlider(id, value, decimals = 2) {
    const slider = document.getElementById(id + '-slider');
    const display = document.getElementById(id + '-value');
    if (slider && value !== undefined) {
        slider.value = value;
        if (display) display.textContent = value.toFixed(decimals);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTION BUTTONS
// Shared emotion button grid with SVG icons from /assets/states/
// ═══════════════════════════════════════════════════════════════════════════════

const EMOTIONS = [
    'joy', 'love', 'excited', 'euphoria',
    'calm', 'surprise', 'neutral', 'glitch',
    'sadness', 'anger', 'fear', 'disgust'
];

/**
 * Populate a container with emotion buttons using SVG icons.
 * Each button gets data-emotion="name" and calls onEmotionChange on click.
 * @param {string} containerId - ID of the container element to fill
 * @param {Function} onEmotionChange - Called with emotion name string on click
 * @param {Object} [options]
 * @param {string} [options.activeEmotion] - Initially active emotion (default: none)
 * @param {string} [options.basePath='/assets/states'] - Path to SVG directory
 */
export function createEmotionButtons(containerId, onEmotionChange, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const basePath = options.basePath || '/assets/states';
    const activeEmotion = options.activeEmotion || null;

    container.innerHTML = '';

    for (const emotion of EMOTIONS) {
        const btn = document.createElement('button');
        btn.dataset.emotion = emotion;
        btn.className = emotion === activeEmotion ? 'active' : '';
        btn.innerHTML = `<img src="${basePath}/${emotion}.svg" alt="${emotion}"><span>${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>`;
        btn.addEventListener('click', () => {
            setActiveButton(`#${containerId} [data-emotion]`, btn);
            onEmotionChange(emotion);
        });
        container.appendChild(btn);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG
// Shared collapsible log panel for demo activity
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create an activity logger that appends timestamped entries to a container.
 * @param {string} [containerId='activity-log'] - ID of the log container element
 * @returns {Function} log(message, type) — type is a CSS class: 'info', 'success', 'warn', 'error'
 */
export function createActivityLog(containerId = 'activity-log') {
    return (message, type = 'info') => {
        const el = document.getElementById(containerId);
        if (!el) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const time = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        entry.innerHTML = `<span class="log-time">${time}</span><span class="log-${type}">${message}</span>`;
        el.appendChild(entry);
        el.scrollTop = el.scrollHeight;
    };
}
