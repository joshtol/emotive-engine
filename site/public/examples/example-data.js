/**
 * Emotive Engine — Shared Example Data
 *
 * Centralised emotion, gesture, and shape definitions for all 2D examples.
 * Emotion list matches the SVG emoticon assets in /assets/states/.
 *
 * Usage:
 *   <script src="/examples/example-data.js"></script>
 *   <script>
 *     renderEmotionButtons('my-container', emotion => mascot.setEmotion(emotion));
 *   </script>
 */

var EMOTIONS = [
    'joy', 'calm', 'excited', 'love',
    'sadness', 'anger', 'fear', 'surprise',
    'euphoria', 'disgust', 'neutral', 'glitch'
];

var GESTURES = ['bounce', 'spin', 'pulse', 'glow', 'breathe', 'expand'];

var SHAPES = ['circle', 'heart', 'star', 'sun', 'moon'];

/** Default gesture that pairs with each emotion for auto-expression */
var EMOTION_GESTURES = {
    joy:      'bounce',
    calm:     'breathe',
    excited:  'spin',
    love:     'glow',
    sadness:  'pulse',
    anger:    'pulse',
    fear:     'breathe',
    surprise: 'bounce',
    euphoria: 'spin',
    disgust:  'pulse',
    neutral:  'breathe',
    glitch:   'spin'
};

/**
 * Render emotion buttons into a container.
 *
 * @param {string}   containerId  - ID of the target container element
 * @param {function} onClick      - Called with the emotion name on click
 */
function renderEmotionButtons(containerId, onClick) {
    var container = document.getElementById(containerId);
    if (!container) return;

    EMOTIONS.forEach(function (emotion) {
        var btn = document.createElement('button');
        btn.className = 'emotion-btn';
        btn.setAttribute('data-emotion', emotion);
        btn.innerHTML =
            '<img src="/assets/states/' + emotion + '.svg" alt="" class="emotion-icon">' +
            '<span>' + emotion.charAt(0).toUpperCase() + emotion.slice(1) + '</span>';
        btn.addEventListener('click', function () { onClick(emotion); });
        container.appendChild(btn);
    });
}

/**
 * Create an emotion indicator that shows the active emotion's SVG.
 * Place a <div class="emotion-indicator" id="emotion-indicator"></div> in your HTML.
 *
 * @param {string} emotion - The emotion name to display
 */
function showEmotionIndicator(emotion) {
    var el = document.getElementById('emotion-indicator');
    if (!el) return;

    var img = el.querySelector('img');
    var label = el.querySelector('.emotion-label');

    if (!img) {
        img = document.createElement('img');
        img.alt = '';
        el.appendChild(img);
    }
    if (!label) {
        label = document.createElement('span');
        label.className = 'emotion-label';
        el.appendChild(label);
    }

    img.src = '/assets/states/' + emotion + '.svg';
    label.textContent = emotion;

    // Pop animation
    img.classList.add('pop');
    setTimeout(function () { img.classList.remove('pop'); }, 300);
}

/**
 * Render gesture buttons into a container.
 *
 * @param {string}   containerId  - ID of the target container element
 * @param {function} onClick      - Called with the gesture name on click
 */
function renderGestureButtons(containerId, onClick) {
    var container = document.getElementById(containerId);
    if (!container) return;

    GESTURES.forEach(function (gesture) {
        var btn = document.createElement('button');
        btn.setAttribute('data-gesture', gesture);
        btn.textContent = gesture.charAt(0).toUpperCase() + gesture.slice(1);
        btn.addEventListener('click', function () { onClick(gesture); });
        container.appendChild(btn);
    });
}

/**
 * Render shape buttons into a container.
 *
 * @param {string}   containerId  - ID of the target container element
 * @param {function} onClick      - Called with the shape name on click
 */
function renderShapeButtons(containerId, onClick) {
    var container = document.getElementById(containerId);
    if (!container) return;

    SHAPES.forEach(function (shape) {
        var btn = document.createElement('button');
        btn.className = 'emotion-btn';
        btn.setAttribute('data-shape', shape);
        btn.innerHTML =
            '<img src="/assets/shape-bar/' + shape + '.svg" alt="" class="emotion-icon shape-icon">' +
            '<span>' + shape.charAt(0).toUpperCase() + shape.slice(1) + '</span>';
        btn.addEventListener('click', function () { onClick(shape); });
        container.appendChild(btn);
    });
}

/**
 * Pick a random item from an array.
 */
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Make control-group sections collapsible by clicking their h3 headers.
 * Wraps each grid/content inside .control-group in a .collapsible-content div.
 * Call once after all buttons are rendered.
 */
function initCollapsibleSections() {
    document.querySelectorAll('.control-group h3').forEach(function (h3) {
        var group = h3.parentElement;
        var children = [];
        var sibling = h3.nextSibling;
        while (sibling) {
            children.push(sibling);
            sibling = sibling.nextSibling;
        }

        // Wrap everything after h3 in a collapsible container
        var wrapper = document.createElement('div');
        wrapper.className = 'collapsible-content';
        children.forEach(function (child) { wrapper.appendChild(child); });
        group.appendChild(wrapper);

        h3.addEventListener('click', function () {
            h3.classList.toggle('collapsed');
            wrapper.classList.toggle('collapsed');
        });
    });
}
