import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Check if user is subscribed
    // For now, we'll return published content

    const content = await prisma.content.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch content' },
      { status: 500 }
    )
  }
} 