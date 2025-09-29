import { createCanvas } from 'canvas'
import ffmpeg from 'ffmpeg-static'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

interface FrameData {
  timestamp: number
  recordingTime: number
  canvasWidth: number
  canvasHeight: number
  mascotState: any
  emotion: string | null
  undertone: string | null
  audioTime: number
  audioPlaying: boolean
  particleCount: number
  canvasSnapshot: string
}

interface ProcessingData {
  frameData: FrameData[]

  trackInfo: {
    path: string
    name: string
  }
  canvasResolution: {
    width: number
    height: number
  }
  duration: number
  timestamp: number
}

export class RecordingProcessor {
  private tempDir: string

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'emotive-recording')
  }

  async processRecording(jobId: string, data: ProcessingData): Promise<string> {
    console.log(`🚀 Starting high-res processing for job ${jobId}`)
    
    try {
      // Create processing directory
      const jobDir = path.join(this.tempDir, jobId)
      await fs.ensureDir(jobDir)

      // Set target resolution (4K for spectacular quality)
      const targetResolution = {
        width: Math.max(3840, data.canvasResolution.width * 4),
        height: Math.max(3840, data.canvasResolution.height * 4)
      }

      console.log(`📐 Rendering at ${targetResolution.width}x${targetResolution.height}`)

      // Render frames
      const frameBuffers = await this.renderFrames(data.frameData, targetResolution, jobDir)
      
      // Encode video
      const videoPath = await this.encodeVideo(frameBuffers, jobDir)
      
      // Read final video
      const videoBuffer = await fs.readFile(videoPath)
      
      // Cleanup
      await fs.remove(jobDir)
      
      return videoBuffer.toString('base64')
      
    } catch (error) {
      console.error(`❌ Processing failed for job ${jobId}:`, error)
      throw error
    }
  }

  private async renderFrames(frameData: FrameData[], jobDir: string) {
    const canvas = createCanvas(3840, 3840) // 4K canvas
    const ctx = canvas.getContext('2d')
    
    console.log(`🎨 Rendering ${frameData.length} frames...`)
    
    const frameBuffers: Buffer[] = []
    
    for (let i = 0; i < frameData.length; i++) {
      const frame = frameData[i]
      
      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Render mascot frame based on state
      await this.renderMascotFrame(ctx, frame, canvas.width, canvas.height)
      
      // Export frame
      const frameBuffer = canvas.toBuffer('image/png')
      frameBuffers.push(frameBuffer)
      
      // Save to temp directory for FFmpeg
      await fs.writeFile(path.join(jobDir, `frame_${String(i).padStart(6, '0')}.png`), frameBuffer)
      
      // Log progress
      if (i % 10 === 0) {
        console.log(`📊 Rendered ${i + 1}/${frameData.length} frames`)
      }
    }
    
    return frameBuffers
  }

  private async renderMascotFrame(ctx: any, frameData: FrameData, width: number, height: number) {
    const centerX = width / 2
    const centerY = height / 2
    
    // Scale factor for 4K (adjust based on original canvas size)
    const scaleFactor = width / frameData.canvasWidth
    
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(scaleFactor, scaleFactor)
    
    // Render emotion-based core with perfect glow effects
    this.renderEmotionCore(ctx, frameData.emotion, frameData.undertone)
    
    // Render particles with preserved blending modes
    this.renderParticles(ctx, frameData)
    
    // Render any special effects
    this.renderSpecialEffects(ctx, frameData)
    
    ctx.restore()
  }

  private renderEmotionCore(ctx: any, emotion: string | null, undertone: string | null) {
    if (!emotion) return
    
    const baseRadius = 200 // Large radius for 4K
    
    // Emotion-specific colors
    const emotionColors = this.getEmotionColors(emotion)
    
    // Create radial gradient for core
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius)
    gradient.addColorStop(0, emotionColors.primary)
    gradient.addColorStop(0.7, emotionColors.primary + '80') // 50% opacity
    gradient.addColorStop(1, emotionColors.primary + '00') // Transparent
    
    // Render core with perfect glow using screen blend mode
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Add undertone effects if present
    if (undertone) {
      this.renderUndertone(ctx, undertone, baseRadius, emotionColors)
    }
    
    ctx.restore()
  }

  private renderParticles(ctx: any, frameData: FrameData) {
    if (!frameData.particleCount || frameData.particleCount === 0) return
    
    // Generate particle positions based on emotion and timing
    const particles = this.generateParticles(frameData)
    
    ctx.save()
    
    particles.forEach(particle => {
      // Perfect particle rendering with glow
      ctx.globalCompositeOperation = 'screen'
      
      // Particle core
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      
      // Particle glow using multiple draws for intensity
      for (let glow = 0; glow < 3; glow++) {
        ctx.globalAlpha = 0.3 / (glow + 1)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * (2 + glow), 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    ctx.restore()
  }

  private renderSpecialEffects(ctx: any, frameData: FrameData) {
    // Add emotion-specific effects
    switch (frameData.emotion) {
      case 'surprise':
        this.renderSurpriseStars(ctx, frameData.recordingTime)
        break
      case 'love':
        this.renderHeartParticles(ctx, frameData)
        break
      case 'glitch':
        this.renderGlitchEffects(ctx, frameData.recordingTime)
        break
    }
  }

  private getEmotionColors(emotion: string) {
    const colors: { [key: string]: any } = {
      'happy': { primary: '#FFD700', secondary: '#FFA500' },
      'sad': { primary: '#4169E1', secondary: '#87CEEB' },
      'angry': { primary: '#FF4500', secondary: '#FF6347' },
      'surprise': { primary: '#FF69B4', secondary: '#FF1493' },
      'love': { primary: '#FF0080', secondary: '#FF6B9D' },
      'glitch': { primary: '#8000FF', secondary: '#FF00FF' },
      'neutral': { primary: '#808080', secondary: '#A0A0A0' }
    }
    
    return colors[emotion] || colors['neutral']
  }

  private generateParticles(frameData: FrameData) {
    const particles = []
    const count = Math.min(frameData.particleCount || 0, 50) // Cap for performance
    
    for (let i = 0; i < count; i++) {
      const angle = (frameData.timestamp / 100 + i) * Math.PI * 0.1
      const radius = 100 + Math.sin(frameData.timestamp * 0.01 + i) * 50
      
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 10 + Math.random() * 20,
        color: this.getEmotionColors(frameData.emotion || 'neutral').primary + 'CC' // 80% opacity
      })
    }
    
    return particles
  }

  private async encodeVideo(frameBuffers: Buffer[], jobDir: string): Promise<string> {
    console.log(`🎬 Encoding video from ${frameBuffers.length} frames...`)
    
    const inputPattern = path.join(jobDir, 'frame_%06d.png')
    const outputPath = path.join(jobDir, 'output.mp4')
    
    // FFmpeg command for high-quality H.264 encoding
    const ffmpegArgs = [
      '-framerate', '10', // Input framerate (10 FPS from our capture)
      '-i', inputPattern, // Input pattern
      '-c:v', 'libx264', // H.264 encoder
      '-preset', 'slow', // Quality preset (slower = better quality)
      '-crf', '15', // Constant Rate Factor (lower = better quality)
      '-pix_fmt', 'yuv420p', // Compatible pixel format
      '-r', '30', // Output framerate (30 FPS)
      '-movflags', '+faststart', // Optimize for streaming
      '-tune', 'film', // Optimization for film content
      '-bf', '2', // B frames for better compression
      '-g', '60', // GOP size
      outputPath // Output file
    ]
    
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process')
      const ffmpegProcess = spawn(ffmpeg!, ffmpegArgs)
      
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Video encoded successfully: ${outputPath}`)
          resolve(outputPath)
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`))
        }
      })
      
      ffmpegProcess.stderr.on('data', (data) => {
        console.log(`FFmpeg: ${data}`)
      })
    })
  }

  private renderUndertone(ctx: any, undertone: string, baseRadius: number, colors: any) {
    // Add undertone-specific effects
    const undertoneColor = colors.secondary + '40' // 25% opacity
    
    ctx.fillStyle = undertoneColor
    ctx.globalCompositeOperation = 'screen'
    ctx.beginPath()
    ctx.arc(0, 0, baseRadius * 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderSurpriseStars(ctx: any, time: number) {
    ctx.globalCompositeOperation = 'screen'
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 5
    
    for (let i = 0; i < 8; i++) {
      const angle = (time * 0.01 + i) * Math.PI * 0.25
      const radius = 300 + Math.sin(time * 0.02 + i) * 100
      
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      this.drawStar(ctx, x, y, 20)
    }
  }

  private renderHeartParticles(ctx: any, frameData: FrameData) {
    // Heart particle effects for love emotion
  }

  private renderGlitchEffects(ctx: any, time: number) {
    // Glitch-style effects
  }

  private drawStar(ctx: any, x: number, y: number, size: number) {
    ctx.save()
    ctx.translate(x, y)
    ctx.beginPath()
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 4) / 5
      const radius = i % 2 === 0 ? size : size / 2
      const starX = xradius * Math.cos(angle)
      const starY = radius * Math.sin(angle)
      
      if (i === 0) {
        ctx.moveTo(starX, starY)
      } else {
        ctx.lineTo(starX, starY)
      }
    }
    
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}
