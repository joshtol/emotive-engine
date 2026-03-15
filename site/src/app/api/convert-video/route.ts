import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink, stat } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { execFile } from 'child_process'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegPath: string = require('ffmpeg-static')

export async function POST(req: NextRequest) {
  let tmpIn = '', tmpOut = ''
  try {
    const data = await req.arrayBuffer()
    if (data.byteLength === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 })
    }

    const id = `emotive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    tmpIn = join(tmpdir(), `${id}.webm`)
    tmpOut = join(tmpdir(), `${id}.mp4`)

    await writeFile(tmpIn, Buffer.from(data))
    const inputStat = await stat(tmpIn)
    console.log(`[convert-video] Input: ${(inputStat.size / 1024).toFixed(0)}KB, ffmpeg: ${ffmpegPath}`)

    await new Promise<void>((resolve, reject) => {
      execFile(
        ffmpegPath,
        [
          '-i', tmpIn,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-y',
          tmpOut,
        ],
        { timeout: 60000 },
        (err, _stdout, stderr) => {
          if (err) {
            console.error('[convert-video] ffmpeg failed:', err.message)
            if (stderr) console.error('[convert-video] stderr:', stderr.slice(-500))
            reject(err)
          } else {
            resolve()
          }
        },
      )
    })

    const mp4 = await readFile(tmpOut)
    console.log(`[convert-video] Output: ${(mp4.length / 1024).toFixed(0)}KB`)
    return new NextResponse(mp4, {
      headers: { 'Content-Type': 'video/mp4' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[convert-video] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    if (tmpIn) await unlink(tmpIn).catch(() => {})
    if (tmpOut) await unlink(tmpOut).catch(() => {})
  }
}
