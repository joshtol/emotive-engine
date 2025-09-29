import { NextRequest, NextResponse } from 'next/server'
import { RecordingProcessor } from '../lib/RecordingProcessor'

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

// Store for processing jobs
const processingJobs = new Map<string, any>()
const recordingProcessor = new RecordingProcessor()

export async function POST(request: NextRequest) {
  try {
    const data: ProcessingData = await request.json()
    
    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('🎬 Starting high-res processing job:', {
      jobId,
      frameCount: data.frameData.length,
      duration: data.duration,
      resolution: data.canvasResolution
    })
    
    // Start background processing
    processRecordingJob(jobId, data)
    
    // Store job info
    processingJobs.set(jobId, {
      status: 'processing',
      createdAt: Date.now(),
      frameCount: data.frameData.length,
      duration: data.duration,
      trackInfo: data.trackInfo
    })
    
    return NextResponse.json({
      success: true,
      jobId,
      status: 'processing',
      message: 'High-res processing started in background'
    })
    
  } catch (error) {
    console.error('❌ Processing request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start processing' },
      { status: 500 }
    )
  }
}

async function processRecordingJob(jobId: string, data: ProcessingData) {
  try {
    console.log(`🚀 Starting REAL processing job ${jobId}`)
    
    const estimatedTime = Math.max(30, data.frameData.length * 0.2) // ~200ms per frame for 4K
    console.log(`⏱️ Estimated processing time: ${estimatedTime}s`)
    
    // Update job status
    processingJobs.set(jobId, {
      ...processingJobs.get(jobId),
      status: 'rendering',
      progress: 0
    })
    
    // REAL PROCESSING: Use RecordingProcessor
    console.log(`🎬 Initiating ${data.frameData.length} frame rendering at 3840x3840...`)
    
    const processedVideoBuffer = await recordingProcessor.processRecording(jobId, data)
    
    console.log(`✅ High-res processing completed for job ${jobId}`)
    
    // Store completed job with video data
    processingJobs.set(jobId, {
      ...processingJobs.get(jobId),
      status: 'completed',
      progress: 100,
      completedAt: Date.now(),
      videoBuffer: processedVideoBuffer,
      videoId: `video_${jobId}`,
      resolution: '3840x3840',
      frameCount: data.frameData.length
    })
    
    console.log(`🎥 Job ${jobId} completed successfully! Quality: INSTANT to PERFECT`)
    
  } catch (error) {
    console.error(`❌ Processing job ${jobId} failed:`, error)
    
    processingJobs.set(jobId, {
      ...processingJobs.get(jobId),
      status: 'failed',
      error: error.message
    })
  }
}

// Mock functions removed - using real RecordingProcessor now

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID required' },
      { status: 400 }
    )
  }
  
  const job = processingJobs.get(jobId)
  
  if (!job) {
    return NextResponse.json(
      { success: false, error: 'Job not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    job
  })
}
