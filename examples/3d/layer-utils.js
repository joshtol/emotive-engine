/**
 * EMOTIVE ENGINE - Shared Layer Utilities for 3D Demos
 *
 * Common functionality for blend layer management across all 3D demos.
 * Handles layer cards, drag-and-drop, precision mode, and UI interactions.
 */

/**
 * Create a layer card with the standard layout:
 * - Row 1: Drag handle, Layer name, ON/OFF, X
 * - Row 2: Blend mode dropdown + Value (clickable for precision)
 * - Row 3: [−] slider [+]
 *
 * @param {Object} options
 * @param {Object} options.layer - Layer data {id, mode, strength, enabled}
 * @param {string[]} options.blendModeNames - Array of blend mode names
 * @param {string} options.prefix - Label prefix (e.g., "Layer", "Corona")
 * @param {Function} options.onUpdate - Called when layer changes
 * @param {Function} options.onDelete - Called when layer is deleted
 * @param {Function} options.onReorder - Called when layers are reordered
 * @returns {HTMLElement} The layer card element
 */
export function createLayerCard({ layer, blendModeNames, prefix = 'Layer', onUpdate, onDelete }) {
    const card = document.createElement('div');
    card.className = `layer-card${layer.enabled ? '' : ' disabled'}`;
    card.dataset.layerId = layer.id;
    card.draggable = true;

    card.innerHTML = `
        <div class="layer-header">
            <div class="layer-title">
                <span class="drag-handle">⠿</span>
                <span class="layer-name">${prefix} ${layer.id}</span>
            </div>
            <div class="layer-controls-header">
                <button class="toggle-btn ${layer.enabled ? '' : 'disabled'}">
                    ${layer.enabled ? 'ON' : 'OFF'}
                </button>
                <button class="delete-btn">×</button>
            </div>
        </div>
        <div class="layer-controls">
            <div class="layer-settings-row">
                <select class="blend-mode-select">
                    ${blendModeNames.map((name, idx) =>
        `<option value="${idx}"${layer.mode === idx ? ' selected' : ''}>${name}</option>`
    ).join('')}
                </select>
                <span class="fader-value">${layer.strength.toFixed(3)}</span>
            </div>
            <div class="fader-control">
                <button class="fader-step fader-step-down">−</button>
                <input type="range" class="fader-slider" min="0" max="5" step="0.1" value="${layer.strength}">
                <button class="fader-step fader-step-up">+</button>
            </div>
        </div>
    `;

    // Elements
    const toggleBtn = card.querySelector('.toggle-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const selectEl = card.querySelector('.blend-mode-select');
    const slider = card.querySelector('.fader-slider');
    const valueEl = card.querySelector('.fader-value');
    const stepDown = card.querySelector('.fader-step-down');
    const stepUp = card.querySelector('.fader-step-up');
    const dragHandle = card.querySelector('.drag-handle');

    // Update helper
    const updateValue = newValue => {
        layer.strength = Math.max(0, Math.min(5, newValue));
        slider.value = layer.strength;
        valueEl.textContent = layer.strength.toFixed(3);
        onUpdate?.();
    };

    // Toggle button
    toggleBtn.addEventListener('click', () => {
        layer.enabled = !layer.enabled;
        toggleBtn.textContent = layer.enabled ? 'ON' : 'OFF';
        toggleBtn.className = `toggle-btn ${layer.enabled ? '' : 'disabled'}`;
        card.classList.toggle('disabled', !layer.enabled);
        onUpdate?.();
    });

    // Delete button
    deleteBtn.addEventListener('click', () => onDelete?.(layer.id));

    // Native select - supports keyboard navigation (arrow keys work while focused)
    selectEl.addEventListener('change', () => {
        layer.mode = parseInt(selectEl.value, 10);
        onUpdate?.();
    });

    // Slider
    slider.addEventListener('input', e => {
        updateValue(parseFloat(e.target.value));
    });

    // Step buttons
    stepDown.addEventListener('click', () => updateValue(layer.strength - 0.1));
    stepUp.addEventListener('click', () => updateValue(layer.strength + 0.1));

    // Click on value to enter precision mode
    valueEl.addEventListener('click', () => {
        enterPrecisionMode(card, layer, slider, valueEl, blendModeNames, onUpdate);
    });

    // Drag handle - only allow drag when handle is used
    dragHandle.addEventListener('mousedown', () => { card.draggable = true; });
    dragHandle.addEventListener('touchstart', () => { card.draggable = true; }, { passive: true });

    // Prevent dragging when interacting with controls
    const interactiveElements = card.querySelectorAll('select, input, button, .fader-value');
    interactiveElements.forEach(el => {
        el.addEventListener('mousedown', e => {
            if (!e.target.closest('.drag-handle')) {
                card.draggable = false;
                e.stopPropagation();
            }
        });
        el.addEventListener('mouseup', () => { card.draggable = true; });
    });

    return card;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRECISION MODE
// ═══════════════════════════════════════════════════════════════════════════════

let activePrecisionCard = null;

function enterPrecisionMode(card, layer, mainSlider, valueEl, blendModeNames, onUpdate) {
    if (activePrecisionCard) exitPrecisionMode();

    // Clear any text selection
    window.getSelection()?.removeAllRanges();

    const currentValue = layer.strength;
    const range = 0.2;
    let min = Math.max(0, currentValue - range / 2);
    let max = Math.min(5, currentValue + range / 2);
    if (max >= 5) { min = 5 - range; max = 5; }
    if (min <= 0) { min = 0; max = range; }

    const precisionEl = document.createElement('div');
    precisionEl.className = 'precision-inline';
    precisionEl.innerHTML = `
        <div class="precision-inline-header">
            <span class="precision-inline-title">Fine Tune</span>
            <button class="precision-inline-close">Done</button>
        </div>
        <div class="precision-inline-value">${currentValue.toFixed(3)}</div>
        <div class="precision-inline-fader">
            <button class="fader-step fader-step-down">−</button>
            <input type="range" class="precision-inline-slider" min="${min}" max="${max}" step="0.001" value="${currentValue}">
            <button class="fader-step fader-step-up">+</button>
        </div>
        <div class="precision-inline-range">
            <span>${min.toFixed(2)}</span>
            <span>${max.toFixed(2)}</span>
        </div>
    `;

    card.classList.add('precision-mode');
    card.appendChild(precisionEl);

    const precisionSlider = precisionEl.querySelector('.precision-inline-slider');
    const precisionValue = precisionEl.querySelector('.precision-inline-value');
    const closeBtn = precisionEl.querySelector('.precision-inline-close');
    const stepDownBtn = precisionEl.querySelector('.fader-step-down');
    const stepUpBtn = precisionEl.querySelector('.fader-step-up');

    const updatePrecisionValue = newValue => {
        newValue = Math.max(0, Math.min(5, newValue));
        layer.strength = newValue;
        mainSlider.value = newValue;
        valueEl.textContent = newValue.toFixed(3);
        precisionValue.textContent = newValue.toFixed(3);

        // Re-center slider range
        let newMin = Math.max(0, newValue - 0.1);
        let newMax = Math.min(5, newValue + 0.1);
        if (newMax >= 5) { newMin = 4.8; newMax = 5; }
        if (newMin <= 0) { newMin = 0; newMax = 0.2; }
        precisionSlider.min = newMin;
        precisionSlider.max = newMax;
        precisionSlider.value = newValue;
        precisionEl.querySelector('.precision-inline-range').innerHTML =
            `<span>${newMin.toFixed(2)}</span><span>${newMax.toFixed(2)}</span>`;

        onUpdate?.();
    };

    activePrecisionCard = {
        card, layer, mainSlider, valueEl, precisionEl, precisionSlider, precisionValue, onUpdate
    };

    // Slider input
    precisionSlider.addEventListener('input', () => {
        const value = parseFloat(precisionSlider.value);
        layer.strength = value;
        mainSlider.value = value;
        valueEl.textContent = value.toFixed(3);
        precisionValue.textContent = value.toFixed(3);
        onUpdate?.();
    });

    // Step buttons
    stepDownBtn.addEventListener('click', () => updatePrecisionValue(layer.strength - 0.1));
    stepUpBtn.addEventListener('click', () => updatePrecisionValue(layer.strength + 0.1));

    // Close button
    closeBtn.addEventListener('click', exitPrecisionMode);

    // Tap value to type
    function handleValueClick() {
        const currentValueEl = activePrecisionCard?.precisionValue;
        if (!currentValueEl) return;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'precision-inline-input';
        input.value = layer.strength.toFixed(3);
        input.step = '0.001';
        input.min = '0';
        input.max = '5';

        currentValueEl.replaceWith(input);
        input.focus();
        input.select();

        const finishEdit = () => {
            let value = parseFloat(input.value);
            if (isNaN(value)) value = layer.strength;
            value = Math.max(0, Math.min(5, value));

            layer.strength = value;
            mainSlider.value = value;
            valueEl.textContent = value.toFixed(3);

            // Re-center slider range
            let newMin = Math.max(0, value - 0.1);
            let newMax = Math.min(5, value + 0.1);
            if (newMax >= 5) { newMin = 4.8; newMax = 5; }
            if (newMin <= 0) { newMin = 0; newMax = 0.2; }
            precisionSlider.min = newMin;
            precisionSlider.max = newMax;
            precisionSlider.value = value;
            precisionEl.querySelector('.precision-inline-range').innerHTML =
                `<span>${newMin.toFixed(2)}</span><span>${newMax.toFixed(2)}</span>`;

            onUpdate?.();

            // Restore value display
            const newValueEl = document.createElement('div');
            newValueEl.className = 'precision-inline-value';
            newValueEl.textContent = value.toFixed(3);
            input.replaceWith(newValueEl);
            activePrecisionCard.precisionValue = newValueEl;

            // Re-attach click handler
            newValueEl.addEventListener('click', handleValueClick);
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') input.blur();
        });
    }

    precisionValue.addEventListener('click', handleValueClick);
}

export function exitPrecisionMode() {
    if (!activePrecisionCard) return;
    const { card, precisionEl } = activePrecisionCard;
    card.classList.remove('precision-mode');
    precisionEl.remove();
    activePrecisionCard = null;
}

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') exitPrecisionMode();
});

// ═══════════════════════════════════════════════════════════════════════════════
// DRAG AND DROP
// ═══════════════════════════════════════════════════════════════════════════════

let _draggedElement = null;

export function setupDragAndDrop(container, layers, onReorder) {
    container.addEventListener('dragstart', e => {
        const card = e.target.closest('.layer-card');
        if (!card) return;
        _draggedElement = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragend', e => {
        const card = e.target.closest('.layer-card');
        if (!card) return;
        card.classList.remove('dragging');
        _draggedElement = null;
        container.querySelectorAll('.layer-card').forEach(c => c.classList.remove('drag-over'));
    });

    container.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const draggable = container.querySelector('.dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });

    container.addEventListener('drop', e => {
        e.stopPropagation();
        const cards = Array.from(container.querySelectorAll('.layer-card'));
        const newOrder = [];
        cards.forEach(card => {
            const layerId = parseInt(card.dataset.layerId, 10);
            const layer = layers.find(l => l.id === layerId);
            if (layer) newOrder.push(layer);
        });

        // Update the layers array in place
        layers.length = 0;
        layers.push(...newOrder);

        onReorder?.();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.layer-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

