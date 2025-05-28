import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { ContentType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const isPublished = formData.get('isPublished') === 'true'

    if (!file || !title || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate and convert type
    if (!Object.values(ContentType).includes(type as ContentType)) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 })
    }

    const contentType = type as ContentType

    // Validate file type
    if (contentType === ContentType.VIDEO && !file.type.startsWith('video/')) {
      return NextResponse.json({ message: 'Invalid video file' }, { status: 400 })
    }
    
    if (contentType === ContentType.IMAGE && !file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Invalid image file' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    // Save to database
    const content = await prisma.content.create({
      data: {
        title,
        description: description || null,
        content: `/uploads/${filename}`, // Store relative path
        type: contentType,
        isPublished,
        adminId: session.user.id
      }
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 