import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const content = await prisma.content.findUnique({
      where: {
        id: params.id,
        adminId: session.user.id // Ensure user can only access their own content
      },
      include: {
        admin: {
          select: {
            name: true
          }
        }
      }
    })

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, content, isPublished } = body

    // First check if the content exists and belongs to the user
    const existingContent = await prisma.content.findUnique({
      where: {
        id: params.id,
        adminId: session.user.id
      }
    })

    if (!existingContent) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    // Update the content
    const updatedContent = await prisma.content.update({
      where: {
        id: params.id
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(isPublished !== undefined && { isPublished })
      }
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // First check if the content exists and belongs to the user
    const existingContent = await prisma.content.findUnique({
      where: {
        id: params.id,
        adminId: session.user.id
      }
    })

    if (!existingContent) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    // Delete the content
    await prisma.content.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 