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

    const body = await request.json()
    const { title, description, content, type, isPublished } = body

    if (!title || !content || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Create content
    const newContent = await prisma.content.create({
      data: {
        title,
        description: description || null,
        content,
        type,
        isPublished: isPublished || false,
        adminId: session.user.id
      }
    })

    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all content for this admin
    const content = await prisma.content.findMany({
      where: {
        OR: [
          { adminId: session.user.id },
          { userId: session.user.id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        admin: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching admin content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 