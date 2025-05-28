import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: "SatsClub",
          description: "Premium content powered by Bitcoin subscriptions",
          subscriptionPrice: 10.00,
          currency: "USD"
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Find the first settings record
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          siteName: data.siteName,
          description: data.description,
          subscriptionPrice: parseFloat(data.subscriptionPrice),
          currency: data.currency,
          profilePicture: data.profilePicture,
          bannerPicture: data.bannerPicture,
          paymentProvider: data.paymentProvider,
          webhookSecret: data.webhookSecret
        }
      })
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          siteName: data.siteName || "SatsClub",
          description: data.description,
          subscriptionPrice: parseFloat(data.subscriptionPrice) || 10.00,
          currency: data.currency || "USD",
          profilePicture: data.profilePicture,
          bannerPicture: data.bannerPicture,
          paymentProvider: data.paymentProvider || "btcpay",
          webhookSecret: data.webhookSecret
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 