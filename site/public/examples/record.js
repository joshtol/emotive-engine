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
  var videoTrack = null;
  var _recordStartTime = 0;
  var _recordingMp4 = false; // true when recording as MP4 with auto-capture stream

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

  // ── Frame copy ──
  // Copy source canvas content onto the mirror canvas for recording.
  var _mirrorInterval = null;
  function copyFrameToMirror() {
    if (!isRecording || !mirrorCtx || !sourceCanvas) return;
    if (_bgCanvas) {
      mirrorCtx.drawImage(_bgCanvas, 0, 0);
    } else {
      mirrorCtx.fillStyle = '#000000';
      mirrorCtx.fillRect(0, 0, mirrorCanvas.width, mirrorCanvas.height);
    }
    mirrorCtx.drawImage(sourceCanvas, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
    // For WebM (captureStream(0)), push frames manually via requestFrame().
    // For MP4 (captureStream(60)), the stream auto-captures — skip this.
    if (!_recordingMp4 && videoTrack && videoTrack.requestFrame) videoTrack.requestFrame();
  }

  // ── rAF hook ──
  // Grab frames right after the app's render callback. Primary method —
  // produces frame-accurate recordings synced to the render loop.
  var _origRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return _origRAF.call(window, function (timestamp) {
      callback(timestamp);
      copyFrameToMirror();
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

  // ── WebM Metadata ──
  // Inject Matroska Tags (TITLE, URL) into the WebM blob so video players
  // and file managers show attribution. Uses raw EBML encoding — no deps.

  // Encode an integer as a Matroska variable-length int (VINT)
  function encodeVINT(value) {
    if (value < 0x80) return [0x80 | value];
    if (value < 0x4000) return [0x40 | (value >> 8), value & 0xFF];
    if (value < 0x200000) return [0x20 | (value >> 16), (value >> 8) & 0xFF, value & 0xFF];
    return [0x10 | (value >> 24), (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
  }

  // Wrap data in an EBML element: [id bytes] [size VINT] [data bytes]
  function ebml(id, data) {
    var size = encodeVINT(data.length);
    var out = new Uint8Array(id.length + size.length + data.length);
    out.set(id, 0);
    out.set(size, id.length);
    out.set(data, id.length + size.length);
    return out;
  }

  function ebmlString(id, str) {
    return ebml(id, new TextEncoder().encode(str));
  }

  function simpleTag(name, value) {
    var tagName = ebmlString([0x45, 0xA3], name);    // TagName
    var tagStr  = ebmlString([0x44, 0x87], value);    // TagString
    var body = new Uint8Array(tagName.length + tagStr.length);
    body.set(tagName, 0);
    body.set(tagStr, tagName.length);
    return ebml([0x67, 0xC8], body);                  // SimpleTag
  }

  function buildTagsElement() {
    var targets = ebml([0x63, 0xC0], new Uint8Array(0)); // Targets (empty = global)
    var title = simpleTag('TITLE', 'Made with Emotive Engine');
    var url   = simpleTag('URL', 'https://github.com/joshtol/emotive-engine');

    // Tag = Targets + SimpleTags
    var tagBody = new Uint8Array(targets.length + title.length + url.length);
    tagBody.set(targets, 0);
    tagBody.set(title, targets.length);
    tagBody.set(url, targets.length + title.length);

    var tag = ebml([0x73, 0x73], tagBody);              // Tag
    return ebml([0x12, 0x54, 0xC3, 0x67], tag);         // Tags
  }

  // Read a Matroska variable-length integer (VINT) at position, return {value, length}
  function readVINT(data, pos) {
    var first = data[pos];
    if (first & 0x80) {
      var v = first & 0x7F;
      return { value: v === 0x7F ? -1 : v, length: 1 };
    }
    if (first & 0x40) {
      var v2 = ((first & 0x3F) << 8) | data[pos + 1];
      return { value: v2 === 0x3FFF ? -1 : v2, length: 2 };
    }
    if (first & 0x20) {
      var v3 = ((first & 0x1F) << 16) | (data[pos + 1] << 8) | data[pos + 2];
      return { value: v3 === 0x1FFFFF ? -1 : v3, length: 3 };
    }
    if (first & 0x10) {
      var v4 = ((first & 0x0F) << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3];
      return { value: v4 === 0x0FFFFFFF ? -1 : v4, length: 4 };
    }
    return { value: -1, length: 1 };
  }

  // Inject Duration element into the Info (Segment Information) element.
  // Chrome's MediaRecorder omits Duration, causing many platforms to reject the file.
  function injectDuration(data, durationMs) {
    // Find Info element (ID 0x1549A966)
    var infoPos = -1;
    for (var i = 0; i < data.length - 3; i++) {
      if (data[i] === 0x15 && data[i + 1] === 0x49 && data[i + 2] === 0xA9 && data[i + 3] === 0x66) {
        infoPos = i;
        break;
      }
    }
    if (infoPos === -1) return data;

    var sizeInfo = readVINT(data, infoPos + 4);
    if (sizeInfo.value < 0) return data; // unknown size, can't safely modify

    var contentStart = infoPos + 4 + sizeInfo.length;
    var contentEnd = contentStart + sizeInfo.value;

    // Build Duration element: ID [0x44, 0x89] + VINT size 8 [0x88] + float64
    var durElement = new Uint8Array(11);
    durElement[0] = 0x44;
    durElement[1] = 0x89;
    durElement[2] = 0x88; // VINT for 8
    var dv = new DataView(durElement.buffer, 3, 8);
    dv.setFloat64(0, durationMs);

    // Rebuild Info: same ID + new size VINT + old content + Duration
    var oldContent = data.subarray(contentStart, contentEnd);
    var newContentLen = sizeInfo.value + durElement.length;
    var newSizeVint = encodeVINT(newContentLen);

    var newInfo = new Uint8Array(4 + newSizeVint.length + newContentLen);
    newInfo[0] = 0x15; newInfo[1] = 0x49; newInfo[2] = 0xA9; newInfo[3] = 0x66;
    newInfo.set(newSizeVint, 4);
    newInfo.set(oldContent, 4 + newSizeVint.length);
    newInfo.set(durElement, 4 + newSizeVint.length + oldContent.length);

    // Splice into data, replacing old Info
    var oldInfoLen = 4 + sizeInfo.length + sizeInfo.value;
    var result = new Uint8Array(data.length - oldInfoLen + newInfo.length);
    result.set(data.subarray(0, infoPos), 0);
    result.set(newInfo, infoPos);
    result.set(data.subarray(infoPos + oldInfoLen), infoPos + newInfo.length);

    return result;
  }

  // Insert Duration into Info + Tags before first Cluster in the WebM blob.
  // Chrome's MediaRecorder uses unknown-size Segment, so no Segment size update needed.
  function injectMetadata(blob, durationMs, callback) {
    var reader = new FileReader();
    reader.onload = function () {
      var data = new Uint8Array(reader.result);

      // Step 1: Inject Duration into the Info element
      data = injectDuration(data, durationMs);

      // Step 2: Build and inject Tags before first Cluster
      var tags = buildTagsElement();
      var pos = -1;
      for (var i = 0; i < data.length - 3; i++) {
        if (data[i] === 0x1F && data[i + 1] === 0x43 && data[i + 2] === 0xB6 && data[i + 3] === 0x75) {
          pos = i;
          break;
        }
      }

      if (pos === -1) {
        callback(new Blob([data], { type: 'video/webm' }));
        return;
      }

      var result = new Uint8Array(data.length + tags.length);
      result.set(data.subarray(0, pos), 0);
      result.set(tags, pos);
      result.set(data.subarray(pos), pos + tags.length);

      callback(new Blob([result], { type: 'video/webm' }));
    };
    reader.readAsArrayBuffer(blob);
  }

  // ── MP4 mdhd duration fix ──
  // Chrome's MediaRecorder writes fragmented MP4 where mvhd.duration (timescale=1000)
  // and mdhd.duration (timescale=30000) get the SAME raw value. This means mdhd
  // reports ~0.3s instead of the real duration. Platforms read mdhd and reject
  // the video as "too short." Fix: find mdhd, recalculate duration for its timescale.
  function fixMp4Duration(blob, callback) {
    var reader = new FileReader();
    reader.onload = function () {
      var buf = new Uint8Array(reader.result);
      var dv = new DataView(buf.buffer);

      // Find moov atom
      var moovOff = -1, moovSize = 0;
      var off = 0;
      while (off + 8 <= buf.length) {
        var sz = dv.getUint32(off);
        if (sz < 8) break;
        var tag = String.fromCharCode(buf[off+4], buf[off+5], buf[off+6], buf[off+7]);
        if (tag === 'moov') { moovOff = off; moovSize = sz; break; }
        off += sz;
      }
      if (moovOff < 0) { callback(blob); return; }

      // Read mvhd to get true duration in seconds
      var trueDurationSec = 0;
      var c = moovOff + 8;
      while (c + 8 <= moovOff + moovSize) {
        var csz = dv.getUint32(c);
        if (csz < 8) break;
        var ctype = String.fromCharCode(buf[c+4], buf[c+5], buf[c+6], buf[c+7]);
        if (ctype === 'mvhd') {
          var ver = buf[c + 8];
          if (ver === 0) {
            trueDurationSec = dv.getUint32(c + 24) / dv.getUint32(c + 20);
          } else {
            // version 1: 8-byte fields
            var tsHi = dv.getUint32(c + 28);
            var durHi = dv.getUint32(c + 32);
            var durLo = dv.getUint32(c + 36);
            var dur64 = durHi * 0x100000000 + durLo;
            trueDurationSec = dur64 / tsHi;
          }
        }
        c += csz;
      }
      if (trueDurationSec <= 0) { callback(blob); return; }

      // Find and fix all mdhd atoms inside moov (recursive search for 'mdhd')
      var fixed = false;
      for (var i = moovOff; i + 8 <= moovOff + moovSize; i++) {
        if (buf[i+4] === 0x6D && buf[i+5] === 0x64 && buf[i+6] === 0x68 && buf[i+7] === 0x64) { // 'mdhd'
          var mdhdOff = i;
          var mdhdVer = buf[mdhdOff + 8];
          if (mdhdVer === 0) {
            var mdTs = dv.getUint32(mdhdOff + 20);
            var correctDur = Math.round(trueDurationSec * mdTs);
            dv.setUint32(mdhdOff + 24, correctDur);
            fixed = true;
          } else {
            // version 1: timescale at +28, duration at +32 (8 bytes)
            var mdTs1 = dv.getUint32(mdhdOff + 28);
            var correctDur1 = Math.round(trueDurationSec * mdTs1);
            // Write as 64-bit
            dv.setUint32(mdhdOff + 32, Math.floor(correctDur1 / 0x100000000));
            dv.setUint32(mdhdOff + 36, correctDur1 >>> 0);
            fixed = true;
          }
        }
      }

      if (fixed) {
        callback(new Blob([buf], { type: 'video/mp4' }));
      } else {
        callback(blob);
      }
    };
    reader.readAsArrayBuffer(blob);
  }

  // ── Countdown Overlay ──
  // Shows 3-2-1 over the canvas before recording starts, so the first
  // frame captures a clean animation state (not mid-transition).
  function showCountdown(callback) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    var num = document.createElement('div');
    num.style.cssText = 'font-size:96px;font-weight:700;color:rgba(255,255,255,0.85);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-shadow:0 2px 20px rgba(0,0,0,0.5);transition:transform 0.3s ease,opacity 0.3s ease;';
    overlay.appendChild(num);
    document.body.appendChild(overlay);

    var count = 3;
    function tick() {
      if (count <= 0) {
        document.body.removeChild(overlay);
        callback();
        return;
      }
      num.textContent = count;
      num.style.transform = 'scale(1.3)';
      num.style.opacity = '1';
      setTimeout(function () {
        num.style.transform = 'scale(0.8)';
        num.style.opacity = '0.3';
      }, 600);
      parent.postMessage({ type: 'emotive-rec-countdown', count: count }, '*');
      count--;
      setTimeout(tick, 1000);
    }
    tick();
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
      showCountdown(function () {
        beginRecorder();
      });
    });
  }

  function beginRecorder() {
    recordedChunks = [];

    // Prime the mirror canvas with the first frame BEFORE captureStream.
    // On mobile, captureStream on an empty canvas can produce zero-length tracks.
    // Can't use copyFrameToMirror() here — it checks isRecording which is still false.
    if (mirrorCtx && sourceCanvas) {
      if (_bgCanvas) {
        mirrorCtx.drawImage(_bgCanvas, 0, 0);
      } else {
        mirrorCtx.fillStyle = '#000000';
        mirrorCtx.fillRect(0, 0, mirrorCanvas.width, mirrorCanvas.height);
      }
      mirrorCtx.drawImage(sourceCanvas, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
    }

    // Validate mirror canvas has content
    if (!mirrorCanvas.width || !mirrorCanvas.height) {
      console.warn('[Record] Mirror canvas has zero dimensions:', mirrorCanvas.width, 'x', mirrorCanvas.height);
      parent.postMessage({ type: 'emotive-rec-error', error: 'Canvas has zero dimensions' }, '*');
      return;
    }

    // Codec preference list — ordered from best to most compatible.
    // isTypeSupported() can lie (Android Chrome says avc1.640028 is OK but the
    // encoder rejects it at runtime for canvas streams). So we try each codec
    // and fall back on failure.
    var codecChain = [
      { mime: 'video/mp4;codecs=avc1.640028', mp4: true },  // H.264 High L4.0
      { mime: 'video/mp4;codecs=avc1.42E01E', mp4: true },  // H.264 Baseline L3.0 (widely supported)
      { mime: 'video/mp4;codecs=avc1',        mp4: true },  // H.264 unspecified profile
      { mime: 'video/mp4',                    mp4: true },  // MP4 generic
      { mime: 'video/webm;codecs=vp9',        mp4: false }, // VP9
      { mime: 'video/webm;codecs=vp8',        mp4: false }, // VP8 (oldest fallback)
      { mime: 'video/webm',                   mp4: false }, // WebM generic
    ];

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var bitrate = isMobile ? 4000000 : 12000000;

    function tryCreateRecorder(startIndex) {
      // Find next supported codec
      var mimeType = null;
      var isMp4 = false;
      var idx = startIndex;
      for (; idx < codecChain.length; idx++) {
        if (MediaRecorder.isTypeSupported(codecChain[idx].mime)) {
          mimeType = codecChain[idx].mime;
          isMp4 = codecChain[idx].mp4;
          break;
        }
      }
      if (!mimeType) {
        parent.postMessage({ type: 'emotive-rec-error', error: 'No supported recording codec found' }, '*');
        return;
      }
      _recordingMp4 = isMp4;

      var stream;
      try {
        stream = mirrorCanvas.captureStream(isMp4 ? 60 : 0);
      } catch (e) {
        parent.postMessage({ type: 'emotive-rec-error', error: 'captureStream not supported' }, '*');
        return;
      }
      videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        parent.postMessage({ type: 'emotive-rec-error', error: 'No video track' }, '*');
        return;
      }

      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType, videoBitsPerSecond: bitrate });
      } catch (e) {
        // Constructor rejected this codec — try next one
        tryCreateRecorder(idx + 1);
        return;
      }

      mediaRecorder.onerror = function () {
        // Runtime encoder failure — detach onstop so the dying recorder
        // doesn't nuke mirrorCanvas/mirrorCtx that the retry needs.
        mediaRecorder.onstop = null;
        isRecording = false;
        if (_mirrorInterval) { clearInterval(_mirrorInterval); _mirrorInterval = null; }
        mediaRecorder = null;
        recordedChunks = [];
        tryCreateRecorder(idx + 1);
      };

      startRecorderWithCodec(isMp4);
    }

    tryCreateRecorder(0);
  }

  function startRecorderWithCodec(isMp4) {

    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    var recordedAsMp4 = isMp4;
    mediaRecorder.onstop = function () {
      // Detect immediate stop (recorder failed to actually record)
      var elapsed = performance.now() - _recordStartTime;
      var totalSize = 0;
      for (var i = 0; i < recordedChunks.length; i++) totalSize += recordedChunks[i].size;

      if (elapsed < 500 || totalSize < 100) {
        // Recording failed — stopped immediately or produced no data
        parent.postMessage({ type: 'emotive-rec-error', error: 'Recording failed (no data captured). Your browser may not support canvas recording.' }, '*');
        mediaRecorder = null;
        mirrorCanvas = null;
        mirrorCtx = null;
        _bgCanvas = null;
        videoTrack = null;
        _recordingMp4 = false;
        if (_mirrorInterval) { clearInterval(_mirrorInterval); _mirrorInterval = null; }
        return;
      }

      var blobType = recordedAsMp4 ? 'video/mp4' : 'video/webm';
      if (recordedAsMp4) {
        // MP4 — fix Chrome's mdhd duration bug, then send
        var rawMp4 = new Blob(recordedChunks, { type: blobType });
        fixMp4Duration(rawMp4, function (blob) {
          var blobUrl = URL.createObjectURL(blob);
          parent.postMessage({ type: 'emotive-rec-stopped', blobUrl: blobUrl, blob: blob, size: blob.size, format: 'mp4' }, '*');
        });
      } else {
        // WebM — inject duration + EBML metadata
        var durationMs = performance.now() - _recordStartTime;
        var raw = new Blob(recordedChunks, { type: blobType });
        injectMetadata(raw, durationMs, function (blob) {
          var blobUrl = URL.createObjectURL(blob);
          parent.postMessage({ type: 'emotive-rec-stopped', blobUrl: blobUrl, blob: blob, size: blob.size, format: 'webm' }, '*');
        });
      }
      mediaRecorder = null;
      mirrorCanvas = null;
      mirrorCtx = null;
      _bgCanvas = null;
      videoTrack = null;
      _recordingMp4 = false;
      if (_mirrorInterval) { clearInterval(_mirrorInterval); _mirrorInterval = null; }
    };

    // MP4: start() with no timeslice — browser writes one complete container.
    // Chunked timeslice breaks MP4 (moov atom only in first chunk, rest is
    // raw data that gets discarded on playback → truncated video).
    // WebM: start(100) for chunked collection (smoother stop, EBML is streamable).
    mediaRecorder.start(isMp4 ? undefined : 100);
    isRecording = true;
    _recordStartTime = performance.now();

    // Fallback: poll-based frame copy for mobile browsers that throttle rAF
    // in iframes. The rAF hook is the primary copy path (frame-accurate),
    // but this ensures frames are captured even when rAF is throttled.
    if (_mirrorInterval) clearInterval(_mirrorInterval);
    _mirrorInterval = setInterval(copyFrameToMirror, 1000 / 30); // 30fps fallback

    parent.postMessage({ type: 'emotive-rec-started' }, '*');
  }

  function stopRecording() {
    isRecording = false;
    if (_mirrorInterval) { clearInterval(_mirrorInterval); _mirrorInterval = null; }
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
