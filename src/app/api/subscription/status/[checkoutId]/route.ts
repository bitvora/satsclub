import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const { checkoutId } = await params

    if (!checkoutId) {
      return NextResponse.json({ message: 'Checkout ID required' }, { status: 400 })
    }

    // Get environment variables
    const BITVORA_COMMERCE_HOST = process.env.BITVORA_COMMERCE_HOST
    const BITVORA_COMMERCE_API_KEY = process.env.BITVORA_COMMERCE_API_KEY

    if (!BITVORA_COMMERCE_HOST || !BITVORA_COMMERCE_API_KEY) {
      console.error('Missing Bitvora Commerce environment variables')
      return NextResponse.json({ message: 'Payment system not configured' }, { status: 500 })
    }

    // Check payment status with Bitvora
    const response = await fetch(`${BITVORA_COMMERCE_HOST}/checkout/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BITVORA_COMMERCE_API_KEY}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bitvora status check error:', response.status, errorText)
      return NextResponse.json({ message: 'Failed to check payment status' }, { status: 500 })
    }

    const checkoutData = await response.json()
    const paymentState = checkoutData.data?.state

    // If payment is successful, update user to subscriber
    if (paymentState === 'paid' || paymentState === 'overpaid') {
      try {
        // Check if user is already a subscriber
        const existingUser = await prisma.user.findUnique({
          where: { id: session.user.id }
        })

        if (existingUser && existingUser.role !== 'SUBSCRIBER') {
          // Update user role to subscriber
          await prisma.user.update({
            where: { id: session.user.id },
            data: { 
              role: 'SUBSCRIBER',
              isSubscribed: true,
              subscriptionId: checkoutId,
              subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          })
        }

        // Create payment event record
        await prisma.paymentEvent.create({
          data: {
            eventType: 'payment_received',
            amount: checkoutData.data?.amount || 0,
            currency: 'BTC',
            paymentId: checkoutId,
            rawData: JSON.stringify(checkoutData.data || {}),
            processed: true
          }
        })
      } catch (dbError) {
        console.error('Database error updating subscription status:', dbError)
        // Don't fail the request - payment was successful
      }
    }

    return NextResponse.json({
      checkoutId,
      state: paymentState,
      paid: paymentState === 'paid' || paymentState === 'overpaid',
      data: checkoutData.data
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 