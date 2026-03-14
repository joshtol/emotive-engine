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
        mirrorCtx.clearRect(0, 0, mirrorCanvas.width, mirrorCanvas.height);
        mirrorCtx.drawImage(sourceCanvas, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
      }
    });
  };

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
