// site/public/examples/record.js
// Headless WebM recording service for Emotive Engine examples.
// Runs inside the iframe. Controlled by postMessage from the parent page.
// Usage: <script src="/examples/record.js"></script> (in <head>)
(function () {
  'use strict';

  if (window.__emotiveRecorderLoaded) return;
  window.__emotiveRecorderLoaded = true;

  // ── State ──
  var mediaRecorder = null;
  var recordedChunks = [];
  var mirrorCanvas = null;
  var mirrorCtx = null;
  var sourceCanvas = null;
  var isRecording = false;
  var _bgCanvas = null; // Pre-rendered background, built once at record start

  // Force preserveDrawingBuffer for ALL WebGL contexts so drawImage
  // can always read the rendered frame (without this, buffer is cleared
  // after compositing → black frames).
  var _origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl' || type === 'webgl2') {
      attrs = Object.assign({}, attrs, { preserveDrawingBuffer: true });
    }
    return _origGetContext.call(this, type, attrs);
  };

  function findCanvas() {
    var all = document.querySelectorAll('canvas');
    if (all.length <= 1) return all[0] || null;
    // Multiple canvases (3D examples have particles overlay + WebGL canvas).
    // Find the one with an existing WebGL context — that's the rendered scene.
    for (var i = all.length - 1; i >= 0; i--) {
      try {
        // getContext returns the EXISTING context if one was already created;
        // a 2D-context canvas returns null for webgl2/webgl.
        var gl = all[i].getContext('webgl2') || all[i].getContext('webgl');
        if (gl) return all[i];
      } catch (e) { /* skip */ }
    }
    // Fallback: last canvas (WebGL is appended after particles overlay)
    return all[all.length - 1];
  }

  // ── rAF hook ──
  // Grab frames right after the app's render callback and draw onto the
  // mirror canvas. With captureStream(60) the stream picks up changes
  // automatically — no manual requestFrame() needed.
  var _origRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return _origRAF.call(window, function (timestamp) {
      callback(timestamp);
      // Frame just rendered — copy to mirror canvas
      if (isRecording && mirrorCtx && sourceCanvas) {
        if (_bgCanvas) {
          mirrorCtx.drawImage(_bgCanvas, 0, 0);
        } else {
          mirrorCtx.fillStyle = '#000000';
          mirrorCtx.fillRect(0, 0, mirrorCanvas.width, mirrorCanvas.height);
        }
        mirrorCtx.drawImage(sourceCanvas, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
      }
    });
  };

  // ── Background Capture ──
  // Pre-render the page's CSS background (solid, gradient, image, or combo)
  // onto an offscreen canvas so the transparent WebGL content composites
  // over the correct background in recordings.
  //
  // Preloads all url() images BEFORE painting, so there is no flash.
  // Calls back with the finished canvas: callback(bgCanvas).

  function buildBgCanvas(w, h, callback) {
    var style = getComputedStyle(document.body);
    var bgColor = style.backgroundColor;
    var bgImage = style.backgroundImage; // may be comma-separated layers

    // Parse layers (CSS stacks first-on-top)
    var layers = (bgImage && bgImage !== 'none') ? splitBgLayers(bgImage) : [];

    // Collect url() images that need preloading
    var imageLoads = []; // { index, img }
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i].trim();
      if (layer.indexOf('url(') === 0) {
        var urlMatch = layer.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          var img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = urlMatch[1];
          imageLoads.push({ index: i, img: img });
        }
      }
    }

    // Wait for all images, then paint everything in order
    var remaining = imageLoads.length;
    if (remaining === 0) {
      callback(paintBg(w, h, bgColor, layers, imageLoads));
      return;
    }

    function onDone() {
      remaining--;
      if (remaining <= 0) {
        callback(paintBg(w, h, bgColor, layers, imageLoads));
      }
    }

    for (var j = 0; j < imageLoads.length; j++) {
      imageLoads[j].img.onload = onDone;
      imageLoads[j].img.onerror = onDone; // skip broken images
    }
  }

  function paintBg(w, h, bgColor, layers, imageLoads) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');

    // 1. Solid color base
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = bgColor;
    } else {
      ctx.fillStyle = '#000000';
    }
    ctx.fillRect(0, 0, w, h);

    // Build a lookup for preloaded images by layer index
    var imgByIndex = {};
    for (var k = 0; k < imageLoads.length; k++) {
      imgByIndex[imageLoads[k].index] = imageLoads[k].img;
    }

    // 2. Draw layers bottom-to-top (last in CSS = bottom)
    for (var i = layers.length - 1; i >= 0; i--) {
      var layer = layers[i].trim();
      if (layer.indexOf('linear-gradient') === 0) {
        drawLinearGradient(ctx, w, h, layer);
      } else if (imgByIndex[i] && imgByIndex[i].naturalWidth) {
        drawCoverImage(ctx, w, h, imgByIndex[i]);
      }
    }

    return c;
  }

  function drawCoverImage(ctx, w, h, img) {
    var scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var sw = img.naturalWidth * scale;
    var sh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  }

  // Split background-image on commas that are NOT inside parens
  function splitBgLayers(str) {
    var layers = [];
    var depth = 0;
    var current = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 0) {
        layers.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) layers.push(current.trim());
    return layers;
  }

  // Split a single gradient's arguments on commas outside parens
  function splitGradientArgs(inner) {
    var parts = [];
    var depth = 0;
    var current = '';
    for (var i = 0; i < inner.length; i++) {
      var ch = inner[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function drawLinearGradient(ctx, w, h, cssValue) {
    var inner = cssValue.slice(cssValue.indexOf('(') + 1, cssValue.lastIndexOf(')'));
    var parts = splitGradientArgs(inner);
    if (parts.length < 2) return;

    var angle = 180;
    var stopStart = 0;
    var first = parts[0];
    if (/^\d+deg$/.test(first)) {
      angle = parseInt(first, 10); stopStart = 1;
    } else if (first === 'to bottom')  { angle = 180; stopStart = 1; }
      else if (first === 'to right')   { angle = 90;  stopStart = 1; }
      else if (first === 'to left')    { angle = 270; stopStart = 1; }
      else if (first === 'to top')     { angle = 0;   stopStart = 1; }

    var stops = [];
    for (var j = stopStart; j < parts.length; j++) {
      var part = parts[j].trim();
      var pctMatch = part.match(/(\d+(?:\.\d+)?)%\s*$/);
      var pct = pctMatch ? parseFloat(pctMatch[1]) / 100 : null;
      var color = pctMatch ? part.slice(0, pctMatch.index).trim() : part;
      stops.push({ color: color, offset: pct });
    }
    if (stops.length === 0) return;
    if (stops[0].offset === null) stops[0].offset = 0;
    if (stops[stops.length - 1].offset === null) stops[stops.length - 1].offset = 1;
    for (var k = 1; k < stops.length - 1; k++) {
      if (stops[k].offset === null) stops[k].offset = k / (stops.length - 1);
    }

    var rad = (angle - 90) * Math.PI / 180;
    var cx = w / 2;
    var cy = h / 2;
    var len = Math.abs(w * Math.sin(rad + Math.PI / 2)) + Math.abs(h * Math.cos(rad + Math.PI / 2));
    var half = len / 2;
    var dx = Math.cos(rad) * half;
    var dy = Math.sin(rad) * half;
    var grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    for (var s = 0; s < stops.length; s++) {
      try { grad.addColorStop(stops[s].offset, stops[s].color); } catch (e) { /* skip */ }
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Recording Pipeline ──
  function startRecording() {
    sourceCanvas = findCanvas();
    if (!sourceCanvas) {
      parent.postMessage({ type: 'emotive-rec-error', error: 'No canvas found' }, '*');
      return;
    }

    mirrorCanvas = document.createElement('canvas');
    mirrorCanvas.width = sourceCanvas.width || sourceCanvas.clientWidth;
    mirrorCanvas.height = sourceCanvas.height || sourceCanvas.clientHeight;
    mirrorCtx = mirrorCanvas.getContext('2d');

    // Pre-render the CSS background (gradient, image, or both).
    // Waits for any url() images to load before starting the recorder.
    buildBgCanvas(mirrorCanvas.width, mirrorCanvas.height, function (bg) {
      _bgCanvas = bg;
      beginRecorder();
    });
  }

  function beginRecorder() {
    recordedChunks = [];

    // captureStream(60) = continuous 60fps capture from mirror canvas
    var stream = mirrorCanvas.captureStream(60);
    var mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 8000000,
    });

    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = function () {
      var blob = new Blob(recordedChunks, { type: 'video/webm' });
      var blobUrl = URL.createObjectURL(blob);
      parent.postMessage({ type: 'emotive-rec-stopped', blobUrl: blobUrl, size: blob.size }, '*');
      mediaRecorder = null;
      mirrorCanvas = null;
      mirrorCtx = null;
      _bgCanvas = null;
    };

    mediaRecorder.start(100); // collect data every 100ms for smoother stop
    isRecording = true;

    parent.postMessage({ type: 'emotive-rec-started' }, '*');
  }

  function stopRecording() {
    isRecording = false;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }

  // ── Listen for commands from parent ──
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'emotive-rec-start') {
      startRecording();
    } else if (e.data.type === 'emotive-rec-stop') {
      stopRecording();
    } else if (e.data.type === 'emotive-rec-ping') {
      notifyReady();
    }
  });

  // Tell the parent we're ready
  function notifyReady() {
    parent.postMessage({ type: 'emotive-rec-ready' }, '*');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyReady);
  } else {
    notifyReady();
  }
})();
