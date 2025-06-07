import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Check if user has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
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

    const contentId = params.id

    if (!contentId) {
      return NextResponse.json({ message: 'Content ID required' }, { status: 400 })
    }

    // Fetch the content
    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        isPublished: true // Only published content
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

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 