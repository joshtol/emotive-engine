import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { execFile } from 'child_process'
import ffmpegPath from 'ffmpeg-static'

export async function POST(req: NextRequest) {
  const data = await req.arrayBuffer()
  const id = `emotive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const tmpIn = join(tmpdir(), `${id}.webm`)
  const tmpOut = join(tmpdir(), `${id}.mp4`)

  try {
    await writeFile(tmpIn, Buffer.from(data))

    await new Promise<void>((resolve, reject) => {
      execFile(
        ffmpegPath as string,
        [
          '-i', tmpIn,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-y',
          tmpOut,
        ],
        { timeout: 30000 },
        (err) => (err ? reject(err) : resolve()),
      )
    })

    const mp4 = await readFile(tmpOut)
    return new NextResponse(mp4, {
      headers: { 'Content-Type': 'video/mp4' },
    })
  } finally {
    await unlink(tmpIn).catch(() => {})
    await unlink(tmpOut).catch(() => {})
  }
}
