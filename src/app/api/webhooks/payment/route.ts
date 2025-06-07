import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-bitvora-signature') || request.headers.get('x-webhook-signature')
    
    // Verify webhook signature if webhook secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      const providedSignature = signature.replace('sha256=', '')
      
      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
      }
    }

    const webhookData = JSON.parse(body)
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2))

    // Handle different event types
    const eventType = webhookData.type || webhookData.event_type
    const checkoutData = webhookData.data || webhookData.checkout || webhookData

    switch (eventType) {
      case 'payment.success':
      case 'payment.completed':
      case 'checkout.paid':
      case 'subscription.created':
        await handlePaymentSuccess(checkoutData)
        break
      
      case 'payment.failed':
      case 'payment.cancelled':
        await handlePaymentFailure(checkoutData)
        break
      
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    // Store the raw webhook event
    await prisma.paymentEvent.create({
      data: {
        eventType: eventType || 'webhook_received',
        amount: checkoutData.amount ? parseFloat(checkoutData.amount.toString()) : null,
        currency: checkoutData.currency || 'BTC',
        paymentId: checkoutData.id || checkoutData.checkout_id,
        rawData: body,
        processed: true
      }
    })

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Store the failed webhook event for debugging
    try {
      const body = await request.text()
      await prisma.paymentEvent.create({
        data: {
          eventType: 'webhook_error',
          rawData: body,
          processed: false
        }
      })
    } catch (dbError) {
      console.error('Failed to store webhook error:', dbError)
    }

    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(checkoutData: any) {
  try {
    const checkoutId = checkoutData.id || checkoutData.checkout_id
    const userId = checkoutData.metadata?.user_id
    
    if (!checkoutId || !userId) {
      console.error('Missing required data in payment success webhook:', { checkoutId, userId })
      return
    }

    console.log(`Processing payment success for checkout ${checkoutId}, user ${userId}`)

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

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'SUBSCRIBER',
        isSubscribed: true,
        subscriptionId: checkoutId,
        subscriptionEnds: subscriptionEnds
      }
    })

    console.log(`User ${userId} subscription updated via webhook. Expires: ${subscriptionEnds.toISOString()}`)
  } catch (error) {
    console.error('Error handling payment success webhook:', error)
  }
}

async function handlePaymentFailure(checkoutData: any) {
  try {
    const checkoutId = checkoutData.id || checkoutData.checkout_id
    console.log(`Processing payment failure for checkout ${checkoutId}`)

    // Log the failed payment attempt
    await prisma.paymentEvent.create({
      data: {
        eventType: 'payment_failed',
        amount: checkoutData.amount ? parseFloat(checkoutData.amount.toString()) : null,
        currency: checkoutData.currency || 'BTC',
        paymentId: checkoutId,
        rawData: JSON.stringify(checkoutData),
        processed: true
      }
    })
  } catch (error) {
    console.error('Error handling payment failure webhook:', error)
  }
} 