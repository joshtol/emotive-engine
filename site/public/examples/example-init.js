/**
 * Emotive Engine — Shared Example Initialization
 *
 * Provides:
 *   initMascot(canvasId, options?)  — create, configure, and start a mascot
 *   updateStatus(message, type?)    — update a .status element
 *
 * Usage (in any example HTML):
 *   <script src="/examples/example-init.js"></script>
 *   <script>
 *     let mascot;
 *     initMascot('mascot-canvas').then(m => { mascot = m; });
 *   </script>
 */

async function initMascot(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error(`Canvas #${canvasId} not found`);

    const EmotiveMascot = window.EmotiveMascot?.default || window.EmotiveMascot;
    if (!EmotiveMascot) {
        updateStatus('EmotiveMascot not loaded — check script path', 'error');
        throw new Error('EmotiveMascot not loaded');
    }

    // Use actual container dimensions instead of hardcoded values
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const width  = options.width  || Math.round(rect.width)  || 400;
    const height = options.height || Math.round(rect.height) || 400;
    canvas.width  = width;
    canvas.height = height;

    const mascot = new EmotiveMascot({
        canvasId,
        targetFPS: 60,
        enableAudio: false,
        defaultEmotion: options.emotion || 'neutral',
        enableGazeTracking: false,
        enableIdleBehaviors: false,
        ...options.config
    });

    window.mascot = mascot;
    await mascot.init(canvas);

    mascot.setBackdrop(options.backdrop || {
        enabled: true,
        radius: 3.5,
        intensity: 0.9,
        blendMode: 'normal',
        falloff: 'smooth',
        edgeSoftness: 0.95,
        coreTransparency: 0.25,
        responsive: true
    });

    mascot.start();
    return mascot;
}

/**
 * Update a status element (expects <div class="status" id="status">).
 */
function updateStatus(message, type) {
    type = type || 'info';
    var el = document.getElementById('status');
    if (!el) return;
    el.textContent = message;
    el.className = 'status ' + type;
}
