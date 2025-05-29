import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const { checkoutId, walletConnect } = await request.json()

    if (!checkoutId || !walletConnect) {
      return NextResponse.json({ message: 'Checkout ID and wallet connect string required' }, { status: 400 })
    }

    // Get environment variables
    const BITVORA_COMMERCE_HOST = process.env.BITVORA_COMMERCE_HOST
    const BITVORA_COMMERCE_API_KEY = process.env.BITVORA_COMMERCE_API_KEY

    if (!BITVORA_COMMERCE_HOST || !BITVORA_COMMERCE_API_KEY) {
      console.error('Missing Bitvora Commerce environment variables')
      return NextResponse.json({ message: 'Payment system not configured' }, { status: 500 })
    }

    // Process subscription payment
    const response = await fetch(`${BITVORA_COMMERCE_HOST}/checkout/${checkoutId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITVORA_COMMERCE_API_KEY}`
      },
      body: JSON.stringify({
        wallet_connect: walletConnect
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bitvora subscription error:', response.status, errorText)
      return NextResponse.json({ message: 'Failed to process subscription' }, { status: 500 })
    }

    const subscriptionData = await response.json()
    
    // Return success - the frontend will then check the payment status
    return NextResponse.json({ 
      success: true, 
      checkoutId,
      data: subscriptionData 
    })
  } catch (error) {
    console.error('Error processing subscription:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 