import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Get environment variables
    const BITVORA_COMMERCE_HOST = process.env.BITVORA_COMMERCE_HOST
    const BITVORA_COMMERCE_API_KEY = process.env.BITVORA_COMMERCE_API_KEY
    const BITVORA_COMMERCE_PRODUCT_ID = process.env.BITVORA_COMMERCE_PRODUCT_ID
    const NEXTAUTH_URL = process.env.NEXTAUTH_URL

    if (!BITVORA_COMMERCE_HOST || !BITVORA_COMMERCE_API_KEY || !BITVORA_COMMERCE_PRODUCT_ID) {
      console.error('Missing Bitvora Commerce environment variables')
      return NextResponse.json({ message: 'Payment system not configured' }, { status: 500 })
    }

    // Create checkout payload
    const checkoutPayload = {
      product_id: BITVORA_COMMERCE_PRODUCT_ID,
      redirect_url: `${NEXTAUTH_URL}/subscribe/thanks`,
      type: "subscription",
      metadata: {
        user_id: session.user.id
      },
      expiry_minutes: 1000
    }

    // Make request to Bitvora Commerce API
    const response = await fetch(`${BITVORA_COMMERCE_HOST}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITVORA_COMMERCE_API_KEY}`
      },
      body: JSON.stringify(checkoutPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bitvora API error:', response.status, errorText)
      return NextResponse.json({ message: 'Failed to create checkout' }, { status: 500 })
    }

    const checkoutData = await response.json()
    
    return NextResponse.json(checkoutData)
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 