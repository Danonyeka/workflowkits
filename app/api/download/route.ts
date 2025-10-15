// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs' // fs requires Node runtime

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  // Accept either "project_charter_template.docx" or "download/project_charter_template.docx"
  const q = (url.searchParams.get('file') || '').trim()

  // Only allow a filename (or download/filename) – block traversal
  let rel = q.replace(/^\/+/, '')
  if (!rel || rel.includes('..')) {
    return NextResponse.json({ error: 'Bad path' }, { status: 400 })
  }

  // If caller passed "download/xxx", strip the leading "download/"
  rel = rel.replace(/^download\//, '')

  // Your existing structure: /data/download/<file>
  const dir = path.join(process.cwd(), 'data', 'download')
  const filePath = path.join(dir, rel)

  try {
    const stat = statSync(filePath)
    const stream = createReadStream(filePath)
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type':
          // crude guess; browsers handle by extension anyway
          rel.toLowerCase().endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'File not found', detail: e?.message },
      { status: 404 }
    )
  }
}
