# Shared WebM Recording Utility

## Purpose

A drop-in recording utility that any Emotive Engine example can add with a single `<script>` tag. Lets users record the canvas animation as WebM and share it via native OS share sheet or download.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Format | WebM only | Simple scope, universal browser support |
| Duration | Manual toggle | User controls start/stop |
| Canvas discovery | Auto-detect | `querySelector('canvas')` at record time, zero config |
| Integration | Single `<script src="/examples/record.js">` | Self-initializing, no module imports needed |
| Recording method | Mirror canvas + rAF patch | Proven approach from asset-capture.html, works with any canvas |
| Share mechanism | Web Share API + download fallback | Native OS share sheet on supported browsers |

## Architecture

### File

`site/public/examples/record.js` — non-module, self-initializing script. Injects its own CSS via `<style>` element.

### Recording Pipeline

1. Find canvas: `document.querySelector('canvas')`
2. Create offscreen mirror canvas at same dimensions
3. `mirrorCanvas.captureStream(60)` feeds `MediaRecorder` (VP9, 8 Mbps; falls back to plain `video/webm`)
4. Monkey-patch `window.requestAnimationFrame` — after each callback, `drawImage(sourceCanvas, ...)` onto mirror
5. On stop: restore original rAF, collect blob, show share modal

### UI Components

#### 1. Floating Glass Record Button (bottom-left)

- Fixed position, bottom-left corner (12px margin)
- Glass effect: `backdrop-filter: blur(12px)`, `rgba(0,0,0,0.45)` bg, `rgba(255,255,255,0.15)` border
- **Idle:** Small red dot (~12px circle, `#e53e3e`)
- **On load (1s delay):** Expands into pill — dot + "Tap to record!" text slides out to the right
- **After 4s:** Collapses back to just the dot
- **Recording:** Dot pulses (CSS animation), pill stays expanded showing "REC" + stop icon
- **R key** works as silent keyboard shortcut (ignored when focus is on input/textarea)

#### 2. Share Modal (after recording stops)

- Centered glass modal with backdrop overlay (click backdrop or X to close)
- **Video preview:** `<video>` element, blob URL, looping, muted, autoplay
- **Share button:** `navigator.share({ files: [webmFile], title: 'Emotive Engine' })` — hidden if Web Share API unavailable
- **Download button:** Blob → anchor → click, downloads as `recording.webm`
- On close: `URL.revokeObjectURL()` to free memory

### Flow

```
Page load → [●] appears → expands [● Tap to record!] → collapses [●]
User taps → recording starts → [● REC ■] pulsing
User taps → recording stops → share modal (preview + Share/Download)
User shares or downloads → modal closes → [●] ready again
```

### Edge Cases

- No canvas found: silent no-op
- R key ignored when typing in input/textarea (`e.target.tagName` check)
- VP9 unsupported: fallback to `video/webm` without codec spec
- Web Share API unavailable: Share button hidden, only Download shown
- Canvas resize during recording: mirror canvas created at start dimensions, consistent output
