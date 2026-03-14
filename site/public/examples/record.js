// site/public/examples/record.js
// Drop-in WebM recording utility for Emotive Engine examples.
// Usage: <script src="/examples/record.js"></script>
(function () {
  'use strict';

  // ── State ──
  var mediaRecorder = null;
  var recordedChunks = [];
  var mirrorCanvas = null;
  var mirrorCtx = null;
  var origRAF = null;
  var sourceCanvas = null;
  var isRecording = false;

  // ── CSS Injection ──
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.emotive-rec-btn {' +
        'position: fixed;' +
        'bottom: 12px;' +
        'left: 12px;' +
        'z-index: 99999;' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 0;' +
        'cursor: pointer;' +
        'border: none;' +
        'padding: 0;' +
        'background: none;' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
        'transition: opacity 0.3s;' +
      '}' +
      '.emotive-rec-dot {' +
        'width: 36px;' +
        'height: 36px;' +
        'border-radius: 50%;' +
        'background: rgba(0, 0, 0, 0.45);' +
        'backdrop-filter: blur(12px);' +
        '-webkit-backdrop-filter: blur(12px);' +
        'border: 1px solid rgba(255, 255, 255, 0.15);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'flex-shrink: 0;' +
      '}' +
      '.emotive-rec-dot-inner {' +
        'width: 12px;' +
        'height: 12px;' +
        'border-radius: 50%;' +
        'background: #e53e3e;' +
        'transition: transform 0.2s;' +
      '}' +
      '.emotive-rec-btn.recording .emotive-rec-dot-inner {' +
        'animation: emotive-rec-pulse 1s ease-in-out infinite;' +
      '}' +
      '@keyframes emotive-rec-pulse {' +
        '0%, 100% { opacity: 1; transform: scale(1); }' +
        '50% { opacity: 0.5; transform: scale(0.85); }' +
      '}' +
      '.emotive-rec-pill {' +
        'height: 36px;' +
        'border-radius: 0 18px 18px 0;' +
        'background: rgba(0, 0, 0, 0.45);' +
        'backdrop-filter: blur(12px);' +
        '-webkit-backdrop-filter: blur(12px);' +
        'border: 1px solid rgba(255, 255, 255, 0.15);' +
        'border-left: none;' +
        'display: flex;' +
        'align-items: center;' +
        'padding: 0 14px 0 4px;' +
        'overflow: hidden;' +
        'max-width: 0;' +
        'opacity: 0;' +
        'transition: max-width 0.4s ease, opacity 0.3s ease, padding 0.4s ease;' +
        'white-space: nowrap;' +
        'color: rgba(255, 255, 255, 0.85);' +
        'font-size: 12px;' +
        'font-weight: 500;' +
        'letter-spacing: 0.3px;' +
      '}' +
      '.emotive-rec-pill.expanded {' +
        'max-width: 200px;' +
        'opacity: 1;' +
        'padding: 0 14px 0 4px;' +
      '}' +
      '.emotive-rec-pill.recording {' +
        'max-width: 200px;' +
        'opacity: 1;' +
        'padding: 0 14px 0 4px;' +
      '}' +
      '.emotive-rec-stop {' +
        'display: inline-block;' +
        'width: 10px;' +
        'height: 10px;' +
        'background: #e53e3e;' +
        'border-radius: 2px;' +
        'margin-left: 8px;' +
        'flex-shrink: 0;' +
      '}' +

      /* ── Share Modal ── */
      '.emotive-share-overlay {' +
        'position: fixed;' +
        'inset: 0;' +
        'z-index: 100000;' +
        'background: rgba(0, 0, 0, 0.6);' +
        'backdrop-filter: blur(4px);' +
        '-webkit-backdrop-filter: blur(4px);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'opacity: 0;' +
        'transition: opacity 0.25s;' +
      '}' +
      '.emotive-share-overlay.visible {' +
        'opacity: 1;' +
      '}' +
      '.emotive-share-modal {' +
        'background: rgba(20, 20, 25, 0.85);' +
        'backdrop-filter: blur(20px);' +
        '-webkit-backdrop-filter: blur(20px);' +
        'border: 1px solid rgba(255, 255, 255, 0.12);' +
        'border-radius: 16px;' +
        'padding: 24px;' +
        'max-width: 400px;' +
        'width: 90vw;' +
        'color: #fff;' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
        'transform: scale(0.95);' +
        'transition: transform 0.25s;' +
      '}' +
      '.emotive-share-overlay.visible .emotive-share-modal {' +
        'transform: scale(1);' +
      '}' +
      '.emotive-share-header {' +
        'display: flex;' +
        'justify-content: space-between;' +
        'align-items: center;' +
        'margin-bottom: 16px;' +
      '}' +
      '.emotive-share-title {' +
        'font-size: 16px;' +
        'font-weight: 600;' +
      '}' +
      '.emotive-share-close {' +
        'background: none;' +
        'border: none;' +
        'color: rgba(255, 255, 255, 0.5);' +
        'font-size: 20px;' +
        'cursor: pointer;' +
        'padding: 4px 8px;' +
        'border-radius: 6px;' +
        'transition: color 0.15s, background 0.15s;' +
      '}' +
      '.emotive-share-close:hover {' +
        'color: #fff;' +
        'background: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.emotive-share-preview {' +
        'width: 100%;' +
        'border-radius: 10px;' +
        'background: #000;' +
        'margin-bottom: 16px;' +
      '}' +
      '.emotive-share-actions {' +
        'display: flex;' +
        'gap: 10px;' +
      '}' +
      '.emotive-share-actions button {' +
        'flex: 1;' +
        'padding: 10px 16px;' +
        'border-radius: 10px;' +
        'border: 1px solid rgba(255, 255, 255, 0.15);' +
        'font-size: 13px;' +
        'font-weight: 500;' +
        'cursor: pointer;' +
        'transition: background 0.15s, border-color 0.15s;' +
        'font-family: inherit;' +
      '}' +
      '.emotive-share-btn {' +
        'background: rgba(255, 255, 255, 0.12);' +
        'color: #fff;' +
      '}' +
      '.emotive-share-btn:hover {' +
        'background: rgba(255, 255, 255, 0.2);' +
        'border-color: rgba(255, 255, 255, 0.3);' +
      '}' +
      '.emotive-share-dl {' +
        'background: rgba(255, 255, 255, 0.06);' +
        'color: rgba(255, 255, 255, 0.75);' +
      '}' +
      '.emotive-share-dl:hover {' +
        'background: rgba(255, 255, 255, 0.12);' +
        'color: #fff;' +
      '}';
    document.head.appendChild(style);
  }

  // ── Canvas Discovery ──
  function findCanvas() {
    return document.querySelector('canvas');
  }

  // ── Recording Pipeline ──
  function startRecording() {
    sourceCanvas = findCanvas();
    if (!sourceCanvas) return;

    mirrorCanvas = document.createElement('canvas');
    mirrorCanvas.width = sourceCanvas.width || sourceCanvas.clientWidth;
    mirrorCanvas.height = sourceCanvas.height || sourceCanvas.clientHeight;
    mirrorCtx = mirrorCanvas.getContext('2d');

    recordedChunks = [];

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
      showShareModal(blob);
      mediaRecorder = null;
      mirrorCanvas = null;
      mirrorCtx = null;
    };

    mediaRecorder.start();
    isRecording = true;

    // Update button UI
    recBtn.classList.add('recording');
    recPill.classList.add('recording');
    recPill.querySelector('.emotive-rec-label').innerHTML = 'REC <span class="emotive-rec-stop"></span>';

    // Monkey-patch rAF to grab frames after each render
    origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (cb) {
      return origRAF.call(window, function (time) {
        cb(time);
        if (mirrorCtx && sourceCanvas && mediaRecorder && mediaRecorder.state === 'recording') {
          mirrorCtx.drawImage(sourceCanvas, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
        } else if (!isRecording) {
          window.requestAnimationFrame = origRAF;
        }
      });
    };
  }

  function stopRecording() {
    isRecording = false;

    if (origRAF) {
      window.requestAnimationFrame = origRAF;
      origRAF = null;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    // Update button UI
    recBtn.classList.remove('recording');
    recPill.classList.remove('recording');
    recPill.classList.remove('expanded');
    recPill.querySelector('.emotive-rec-label').textContent = 'Tap to record!';
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'r') return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    e.preventDefault();
    toggleRecording();
  }

  // ── Share Modal ──
  function showShareModal(blob) {
    var blobUrl = URL.createObjectURL(blob);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'emotive-share-overlay';

    var canShare = navigator.share && navigator.canShare &&
      navigator.canShare({ files: [new File([blob], 'recording.webm', { type: 'video/webm' })] });

    overlay.innerHTML =
      '<div class="emotive-share-modal">' +
        '<div class="emotive-share-header">' +
          '<span class="emotive-share-title">Recording ready!</span>' +
          '<button class="emotive-share-close">&times;</button>' +
        '</div>' +
        '<video class="emotive-share-preview" src="' + blobUrl + '" autoplay loop muted playsinline></video>' +
        '<div class="emotive-share-actions">' +
          (canShare ? '<button class="emotive-share-btn">Share</button>' : '') +
          '<button class="emotive-share-dl">Download</button>' +
        '</div>' +
      '</div>';

    function close() {
      overlay.classList.remove('visible');
      setTimeout(function () {
        overlay.remove();
        URL.revokeObjectURL(blobUrl);
      }, 250);
    }

    // Close on backdrop click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Close button
    overlay.querySelector('.emotive-share-close').addEventListener('click', close);

    // Share button (if available)
    var shareBtn = overlay.querySelector('.emotive-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var file = new File([blob], 'emotive-engine.webm', { type: 'video/webm' });
        navigator.share({
          files: [file],
          title: 'Emotive Engine',
        }).catch(function () { /* user cancelled share */ });
      });
    }

    // Download button
    overlay.querySelector('.emotive-share-dl').addEventListener('click', function () {
      var a = document.createElement('a');
      a.download = 'emotive-engine.webm';
      a.href = blobUrl;
      a.click();
    });

    document.body.appendChild(overlay);

    // Trigger transition
    requestAnimationFrame(function () {
      overlay.classList.add('visible');
    });
  }

  // ── Floating Record Button ──
  var recBtn, recPill;

  function createRecordButton() {
    recBtn = document.createElement('button');
    recBtn.className = 'emotive-rec-btn';
    recBtn.setAttribute('aria-label', 'Record animation');

    recBtn.innerHTML =
      '<div class="emotive-rec-dot">' +
        '<div class="emotive-rec-dot-inner"></div>' +
      '</div>' +
      '<div class="emotive-rec-pill">' +
        '<span class="emotive-rec-label">Tap to record!</span>' +
      '</div>';

    recPill = recBtn.querySelector('.emotive-rec-pill');
    recBtn.addEventListener('click', toggleRecording);
    document.body.appendChild(recBtn);

    // Expand after 1s to draw attention
    setTimeout(function () {
      recPill.classList.add('expanded');
    }, 1000);

    // Collapse after 5s
    setTimeout(function () {
      if (!isRecording) {
        recPill.classList.remove('expanded');
      }
    }, 5000);
  }

  // ── Initialization ──
  function init() {
    injectStyles();
    createRecordButton();
    document.addEventListener('keydown', onKeyDown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
