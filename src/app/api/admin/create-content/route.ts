import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, type, content, thumbnail, isPublished } = await request.json()

    if (!title || !type || !content) {
      return NextResponse.json({ message: 'Title, type, and content are required' }, { status: 400 })
    }

    // Validate content type
    if (!['BLOG_POST', 'VIDEO', 'IMAGE'].includes(type)) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 })
    }

    // Create the content
    const newContent = await prisma.content.create({
      data: {
        title,
        description,
        type,
        content,
        thumbnail,
        isPublished: isPublished || false,
        userId: session.user.id
      }
    })

    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 