# Shared WebM Recording Utility — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a drop-in `record.js` script that any Emotive Engine example can add via a single `<script>` tag to enable WebM recording with a floating glass record button and native share modal.

**Architecture:** Self-initializing non-module script. Mirror canvas + rAF monkey-patch for frame capture. MediaRecorder with VP9 for WebM encoding. Web Share API with download fallback. All CSS injected via JS.

**Tech Stack:** Vanilla JS, MediaRecorder API, Web Share API, CSS backdrop-filter

---

### Task 1: Create record.js with CSS injection and floating button

**Files:**
- Create: `site/public/examples/record.js`

**Step 1: Create the script skeleton with self-initialization**

```javascript
// site/public/examples/record.js
// Drop-in WebM recording utility for Emotive Engine examples.
// Usage: <script src="/examples/record.js"></script>
(function () {
  'use strict';

  // ── State ──
  let mediaRecorder = null;
  let recordedChunks = [];
  let mirrorCanvas = null;
  let mirrorCtx = null;
  let origRAF = null;
  let sourceCanvas = null;
  let isRecording = false;

  // ── CSS Injection ──
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .emotive-rec-btn {
        position: fixed;
        bottom: 12px;
        left: 12px;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 0;
        cursor: pointer;
        border: none;
        padding: 0;
        background: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: opacity 0.3s;
      }
      .emotive-rec-dot {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .emotive-rec-dot-inner {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #e53e3e;
        transition: transform 0.2s;
      }
      .emotive-rec-btn.recording .emotive-rec-dot-inner {
        animation: emotive-rec-pulse 1s ease-in-out infinite;
      }
      @keyframes emotive-rec-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }
      .emotive-rec-pill {
        height: 36px;
        border-radius: 0 18px 18px 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-left: none;
        display: flex;
        align-items: center;
        padding: 0 14px 0 4px;
        overflow: hidden;
        max-width: 0;
        opacity: 0;
        transition: max-width 0.4s ease, opacity 0.3s ease, padding 0.4s ease;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.85);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
      .emotive-rec-pill.expanded {
        max-width: 200px;
        opacity: 1;
        padding: 0 14px 0 4px;
      }
      .emotive-rec-pill.recording {
        max-width: 200px;
        opacity: 1;
        padding: 0 14px 0 4px;
      }
      .emotive-rec-stop {
        display: inline-block;
        width: 10px;
        height: 10px;
        background: #e53e3e;
        border-radius: 2px;
        margin-left: 8px;
        flex-shrink: 0;
      }

      /* ── Share Modal ── */
      .emotive-share-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.25s;
      }
      .emotive-share-overlay.visible {
        opacity: 1;
      }
      .emotive-share-modal {
        background: rgba(20, 20, 25, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 90vw;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transform: scale(0.95);
        transition: transform 0.25s;
      }
      .emotive-share-overlay.visible .emotive-share-modal {
        transform: scale(1);
      }
      .emotive-share-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .emotive-share-title {
        font-size: 16px;
        font-weight: 600;
      }
      .emotive-share-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
      }
      .emotive-share-close:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }
      .emotive-share-preview {
        width: 100%;
        border-radius: 10px;
        background: #000;
        margin-bottom: 16px;
      }
      .emotive-share-actions {
        display: flex;
        gap: 10px;
      }
      .emotive-share-actions button {
        flex: 1;
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        font-family: inherit;
      }
      .emotive-share-btn {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
      .emotive-share-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }
      .emotive-share-dl {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.75);
      }
      .emotive-share-dl:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Floating Record Button ──
  let recBtn, recPill;

  function createRecordButton() {
    recBtn = document.createElement('button');
    recBtn.className = 'emotive-rec-btn';
    recBtn.setAttribute('aria-label', 'Record animation');

    recBtn.innerHTML = `
      <div class="emotive-rec-dot">
        <div class="emotive-rec-dot-inner"></div>
      </div>
      <div class="emotive-rec-pill">
        <span class="emotive-rec-label">Tap to record!</span>
      </div>
    `;

    recPill = recBtn.querySelector('.emotive-rec-pill');
    recBtn.addEventListener('click', toggleRecording);
    document.body.appendChild(recBtn);

    // Expand after 1s to draw attention
    setTimeout(() => {
      recPill.classList.add('expanded');
    }, 1000);

    // Collapse after 4s
    setTimeout(() => {
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
```

**Step 2: Add the script tag to one test example to verify button appears**

Add to `site/public/examples/3d/3d-demo.html` just before `</body>`:
```html
<script src="/examples/record.js"></script>
```

**Step 3: Verify in browser**

Run: `npm run dev` and open `http://localhost:5173/examples/3d/3d-demo.html`

Expected:
- Red dot button appears bottom-left
- After 1s, pill expands showing "Tap to record!"
- After 5s, pill collapses back to just the dot

**Step 4: Commit**

```bash
git add site/public/examples/record.js site/public/examples/3d/3d-demo.html
git commit -m "feat: add record.js skeleton with floating glass button"
```

---

### Task 2: Implement recording pipeline (mirror canvas + rAF patch + MediaRecorder)

**Files:**
- Modify: `site/public/examples/record.js`

**Step 1: Add canvas discovery function**

Add after the state variables block:

```javascript
function findCanvas() {
  return document.querySelector('canvas');
}
```

**Step 2: Add recording start/stop functions**

Add after `findCanvas`:

```javascript
function startRecording() {
  sourceCanvas = findCanvas();
  if (!sourceCanvas) return;

  mirrorCanvas = document.createElement('canvas');
  mirrorCanvas.width = sourceCanvas.width || sourceCanvas.clientWidth;
  mirrorCanvas.height = sourceCanvas.height || sourceCanvas.clientHeight;
  mirrorCtx = mirrorCanvas.getContext('2d');

  recordedChunks = [];

  const stream = mirrorCanvas.captureStream(60);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = function () {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
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
```

**Step 3: Add toggle and keyboard handler**

```javascript
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
```

**Step 4: Add placeholder share modal function**

```javascript
function showShareModal(blob) {
  // Placeholder — implemented in Task 3
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.download = 'recording.webm';
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Step 5: Verify in browser**

Open `http://localhost:5173/examples/3d/3d-demo.html`:
1. Click the red dot → pill expands to "REC ■", dot pulses
2. Wait a few seconds, click again → recording stops, .webm downloads
3. Open the downloaded .webm → should show the animation
4. Press R key → same toggle behavior

**Step 6: Commit**

```bash
git add site/public/examples/record.js
git commit -m "feat: implement recording pipeline with mirror canvas and rAF patch"
```

---

### Task 3: Implement share modal with video preview + Web Share API

**Files:**
- Modify: `site/public/examples/record.js`

**Step 1: Replace the placeholder `showShareModal` with full implementation**

```javascript
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
```

**Step 2: Verify in browser**

1. Record a short clip → modal appears with looping video preview
2. Click Download → .webm downloads
3. Click backdrop or × → modal closes smoothly
4. On mobile (or Chrome with Web Share API): Share button appears and triggers OS share sheet

**Step 3: Commit**

```bash
git add site/public/examples/record.js
git commit -m "feat: add share modal with video preview and Web Share API"
```

---

### Task 4: Add record.js script tag to all examples

**Files:**
- Modify: `site/public/examples/3d/3d-demo.html` (already added in Task 1)
- Modify: `site/public/examples/3d/moon-demo.html`
- Modify: `site/public/examples/3d/sun-demo.html`
- Modify: `site/public/examples/3d/crystal-demo.html`
- Modify: `site/public/examples/3d/blood-moon-demo.html`
- Modify: `site/public/examples/3d/groove-demo.html`
- Modify: `site/public/examples/3d/gesture-demo.html`
- Modify: `site/public/examples/3d/elemental-gestures.html`
- Modify: `site/public/examples/3d/dual-mascot.html`
- Modify: `site/public/examples/2d/basic-usage.html`
- Modify: `site/public/examples/2d/2d-hello-world.html`
- Modify: `site/public/examples/2d/rhythm-sync-demo.html`
- Modify: `site/public/examples/2d/event-handling.html`

**Step 1: Add the script tag to each example**

In each file, add this line just before the closing `</body>` tag:
```html
<script src="/examples/record.js"></script>
```

Do NOT add to:
- `site/public/examples/captures/asset-capture.html` (has its own recording system)
- `site/public/examples/3d/_demo-template.html` (template file, not a demo)

**Step 2: Verify in browser**

Spot-check 3 examples (one 3D, one 2D, one elemental):
- Each should show the floating record button
- Each should successfully record and show the share modal

**Step 3: Commit**

```bash
git add site/public/examples/3d/*.html site/public/examples/2d/*.html
git commit -m "feat: add record.js to all example pages"
```

---

### Task 5: Final verification and edge case testing

**Step 1: Test VP9 fallback**

In record.js, temporarily change the VP9 check to force fallback:
```javascript
const mimeType = 'video/webm';
```
Verify recording still works. Revert the change.

**Step 2: Test R key not firing in inputs**

Open elemental-gestures.html, click on any text input/select, press R. Recording should NOT start.

**Step 3: Test no-canvas graceful failure**

Create a temporary test HTML with just `<script src="/examples/record.js"></script>` and no canvas. The button should appear but clicking it should do nothing (no errors in console).

**Step 4: Test multiple recordings**

Record, stop, close modal. Record again, stop. Both recordings should work independently.

**Step 5: Commit any fixes**

```bash
git add site/public/examples/record.js
git commit -m "fix: edge case handling for recording utility"
```
