# Dual-Path Recording Integration Guide

## 🎬 **Overview**

The dual-path recording system provides:

1. **Instant feedback** - Live canvas recording for immediate results
2. **Professional quality** - Background processing for perfect output

## 🚀 **Implementation Status**

### ✅ **Completed:**

- Frontend frame data capture during live recording
- API endpoints for processing request/status/video
- UI indicators for processing state
- Mock processing pipeline

### 🔧 **Next Steps:**

#### 1. **Install Dependencies**

```bash
npm install ffmpeg-static canvas
# OR for WebAssembly version:
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

#### 2. **Real Frame Rendering**

**File:** `src/app/api/process-recording/route.ts`

Replace `renderFrame()` mock with:

```javascript
import { createCanvas } from 'canvas';

async function renderFrame(frameData, targetResolution) {
    // Create high-resolution canvas
    const canvas = createCanvas(
        targetResolution.width,
        targetResolution.height
    );
    const ctx = canvas.getContext('2d');

    // Render mascot using exported engine functions
    await renderMascotFrame(ctx, frameData);

    // Export as PNG buffer
    return canvas.toBuffer('image/png');
}
```

#### 3. **FFmpeg Video Encoding**

```javascript
import ffmpeg from 'ffmpeg-static';

async function createVideoFromFrames(frameBuffers, duration) {
    const tempDir = path.join(tmpdir(), `render_${jobId}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Write frames as PNG sequence
    for (let i = 0; i < frameBuffers.length; i++) {
        await fs.writeFile(
            path.join(tempDir, `frame_${String(i).padStart(4, '0')}.png`),
            frameBuffers[i]
        );
    }

    // Encode video with FFmpeg
    const outputPath = path.join(tempDir, 'output.mp4');
    await ffmpeg([
        '-framerate',
        '10', // 10 FPS from our 100ms capture
        '-i',
        path.join(tempDir, 'frame_%04d.png'),
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '15', // High quality
        '-pix_fmt',
        'yuv420p',
        '-r',
        '30', // Output 30 FPS
        outputPath,
    ]);

    return await fs.readFile(outputPath);
}
```

#### 4. **Engine State Export**

**File:** `src/core/EmotiveMascot.js`

Add export method:

```javascript
exportState() {
  return {
    emotion: this.stateMachine.getEmotion(),
    undertone: this.stateMachine.getUndertone(),
    particleSystem: this.particleSystem.exportState(),
    renderer: this.renderer.exportState(),
    gestureSystem: this.gestureSystem.exportState(),
    timestamp: Date.now()
  }
}
```

#### 5. **Server-Side Engine**

**File:** `src/core/ServerRenderer.js`

```javascript
import EmotiveMascot from './EmotiveMascot.js';

class ServerRenderer {
    constructor() {
        this.mascot = new EmotiveMascot();
        // Configure for headless rendering
    }

    async renderFrame(stateData, resolution) {
        // Apply mascot state
        this.mascot.setState(stateData);

        // Render frame
        return this.mascot.renderToCanvas(resolution);
    }
}
```

## 🎯 **Benefits:**

### **Live Recording (Immediate):**

- ✅ Real-time user interaction
- ✅ Music sync
- ✅ Instant export for sharing
- ⚠️ Limited quality due to browser constraints

### **Background Processing (Perfect):**

- ✅ Native canvas resolution (4K+ possible)
- ✅ Perfect blend mode preservation
- ✅ Professional encoding quality
- ✅ No browser limitations
- ⏱️ Takes 2-5 minutes to process

## 🔧 **Production Considerations:**

1. **Queue Management** - Handle multiple concurrent jobs
2. **Cloud Storage** - Store generated videos
3. **Progress Webhooks** - Real-time progress updates
4. **Error Handling** - Graceful fallbacks
5. **Resource Limits** - Prevent server overload

## 📊 **Expected Results:**

- **Resolution:** 4K+ (vs current ~800px)
- **Glow Quality:** Perfect (vs current blending losses)
- **File Size:** Optimized via FFmpeg presets
- **Processing Time:** 1-3 minutes for 2-minute recording

---

**🎬 Bottom Line:** Users get instant gratification + eventual perfection!
