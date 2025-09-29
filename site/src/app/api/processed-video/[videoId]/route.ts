import { NextRequest, NextResponse } from 'next/server'
import { processingJobs } from '../process-recording/route'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId
    
    console.log(`📥 Video request for ID: ${videoId}`)
    
    // Find the job by ID (you might want to use a database here)
    for (const [jobId, job] of processingJobs.entries()) {
      if (job.videoId === videoId) {
        if (job.status === 'completed' && job.videoBuffer) {
          // In real implementation, serve the actual MP4 file
          const response = new NextResponse(Buffer.from(job.videoBuffer, 'base64'))
          response.headers.set('Content-Type', 'video/mp4')
          response.headers.set('Content-Disposition', `attachment; filename="${videoId}_4k.mp4"`)
          return response
        } else if (job.status === 'processing' || job.status === 'rendering' || job.status === 'encoding') {
          return NextResponse.json(
            { success: false, error: 'Video still processing', status: job.status, progress: job.progress },
            { status: 202 }
          )
        } else if (job.status === 'failed') {
          return NextResponse.json(
            { success: false, error: 'Processing failed', details: job.error },
            { status: 500 }
          )
        }
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Video not found' },
      { status: 404 }
    )
    
  } catch (error) {
    console.error('❌ Video download error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
