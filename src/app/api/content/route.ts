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

    // Check if user has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or has active subscription
    const hasAccess = user.role === 'ADMIN' || 
                     (user.role === 'SUBSCRIBER' && 
                      user.isSubscribed && 
                      (!user.subscriptionEnds || user.subscriptionEnds > new Date()))

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Active subscription required', code: 'SUBSCRIPTION_REQUIRED' },
        { status: 403 }
      )
    }

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