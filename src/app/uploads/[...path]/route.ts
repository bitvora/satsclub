import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // For now, require authentication to access any uploads
    // Later you can implement more granular access control
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const filePath = params.path.join('/')
    const fullPath = join(process.cwd(), 'uploads', filePath)

    // Security check: ensure the path is within uploads directory
    if (!fullPath.startsWith(join(process.cwd(), 'uploads'))) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Check if the file exists in the database
    const content = await prisma.content.findFirst({
      where: {
        content: `/uploads/${filePath}`
      }
    })

    if (!content) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Check access permissions
    if (!content.isPublished && session.user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const buffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'mp4':
        contentType = 'video/mp4'
        break
      case 'webm':
        contentType = 'video/webm'
        break
      case 'mov':
        contentType = 'video/quicktime'
        break
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 