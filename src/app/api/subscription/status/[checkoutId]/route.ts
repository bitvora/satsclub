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
        // Get subscription settings to calculate the correct end date
        const settings = await prisma.settings.findFirst()
        const subscriptionPeriod = settings?.subscriptionPeriod || 'MONTHLY'
        
        // Calculate subscription end date based on period
        const now = new Date()
        let subscriptionEnds: Date
        
        switch (subscriptionPeriod) {
          case 'DAILY':
            subscriptionEnds = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
            break
          case 'WEEKLY':
            subscriptionEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
            break
          case 'MONTHLY':
            subscriptionEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
            break
          case 'QUARTERLY':
            subscriptionEnds = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
            break
          case 'ANNUALLY':
            subscriptionEnds = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 days
            break
          default:
            subscriptionEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days
        }

        // Check if user exists and update subscription status
        const existingUser = await prisma.user.findUnique({
          where: { id: session.user.id }
        })

        if (existingUser) {
          // Update user subscription status regardless of current role
          await prisma.user.update({
            where: { id: session.user.id },
            data: { 
              role: 'SUBSCRIBER',
              isSubscribed: true,
              subscriptionId: checkoutId,
              subscriptionEnds: subscriptionEnds
            }
          })
          
          console.log(`User ${session.user.id} subscription updated. Expires: ${subscriptionEnds.toISOString()}`)
        }

        // Check if payment event already exists to avoid duplicates
        const existingPaymentEvent = await prisma.paymentEvent.findFirst({
          where: {
            paymentId: checkoutId,
            eventType: 'payment_received'
          }
        })

        if (!existingPaymentEvent) {
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
        }
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