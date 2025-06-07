'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Settings {
  siteName: string
  description?: string
  subscriptionPrice: number
  subscriptionPeriod: string
  currency: string
  profilePicture?: string
  bannerPicture?: string
}

interface CheckoutData {
  data: {
    id: string
    expires_at: string
    amount: number
    rates: {
      rates: {
        usd: number
        btc?: number
      }
    }
  }
}

type SubscriptionStep = 'pricing' | 'wallet-connect' | 'processing' | 'success' | 'error'

export default function Subscribe() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<SubscriptionStep>('pricing')
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [walletConnect, setWalletConnect] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/subscribe')
    }
  }, [session, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createCheckout = async () => {
    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create checkout')
      }

      const data = await response.json()
      setCheckoutData(data)
      setCurrentStep('wallet-connect')
    } catch (error) {
      console.error('Error creating checkout:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checkout')
      setCurrentStep('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const processSubscription = async () => {
    if (!checkoutData || !walletConnect.trim()) {
      setError('Please enter your wallet connect string')
      return
    }

    setIsProcessing(true)
    setError('')
    setCurrentStep('processing')

    try {
      // Process the subscription
      const response = await fetch('/api/subscription/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkoutId: checkoutData.data.id,
          walletConnect: walletConnect.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process subscription')
      }

      // Start checking payment status
      checkPaymentStatus()
    } catch (error) {
      console.error('Error processing subscription:', error)
      setError(error instanceof Error ? error.message : 'Failed to process subscription')
      setCurrentStep('error')
      setIsProcessing(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!checkoutData) return

    try {
      const response = await fetch(`/api/subscription/status/${checkoutData.data.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      const statusData = await response.json()
      
      if (statusData.paid) {
        setCurrentStep('success')
        setIsProcessing(false)
      } else {
        // Continue checking every 3 seconds
        setTimeout(checkPaymentStatus, 3000)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setError('Failed to verify payment status')
      setCurrentStep('error')
      setIsProcessing(false)
    }
  }

  const getBtcAmount = () => {
    if (!checkoutData?.data?.amount) return '0.00000000'
    // Amount is in sats, convert to BTC
    return (checkoutData.data.amount / 100000000).toFixed(8)
  }

  const formatExpiryTime = () => {
    if (!checkoutData?.data?.expires_at) return ''
    const expiryDate = new Date(checkoutData.data.expires_at)
    return expiryDate.toLocaleString()
  }

  const formatPeriodDisplay = (period: string) => {
    switch (period) {
      case 'DAILY': return 'day'
      case 'WEEKLY': return 'week'
      case 'MONTHLY': return 'month'
      case 'QUARTERLY': return 'quarter'
      case 'ANNUALLY': return 'year'
      default: return 'month'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4 animate-pulse">
            S
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto">
                S
              </div>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Subscribe to {settings?.siteName || 'SatsClub'}
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get access to premium content and support your favorite creator with Bitcoin
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-w-md mx-auto">
            
            {/* Step 1: Pricing */}
            {currentStep === 'pricing' && (
              <>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white text-center">
                    {settings?.subscriptionPeriod ? `${formatPeriodDisplay(settings.subscriptionPeriod).charAt(0).toUpperCase() + formatPeriodDisplay(settings.subscriptionPeriod).slice(1)}ly` : 'Monthly'} Subscription
                  </h2>
                </div>

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-4xl">₿</span>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {settings?.currency === 'BTC' ? '' : '$'}{settings?.subscriptionPrice || '10.00'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {settings?.currency === 'BTC' ? 'sats' : `/${settings?.currency || 'USD'}`}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      per {formatPeriodDisplay(settings?.subscriptionPeriod || 'MONTHLY')}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">Access to all premium content</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">Early access to new posts</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">Support with Bitcoin</span>
                    </div>
                  </div>

                  <button 
                    onClick={createCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Creating Checkout...' : 'Pay with Bitcoin'}
                  </button>

                  <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                    Secure Bitcoin payments powered by decentralized technology
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Wallet Connect */}
            {currentStep === 'wallet-connect' && checkoutData && (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white text-center">Connect Your Wallet</h2>
                </div>

                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      ₿ {getBtcAmount()} BTC
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Expires: {formatExpiryTime()}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="walletConnect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nostr Wallet Connect String
                    </label>
                    <textarea
                      id="walletConnect"
                      value={walletConnect}
                      onChange={(e) => setWalletConnect(e.target.value)}
                      placeholder="nostr+walletconnect://..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Paste your Nostr wallet connect string here to complete the payment
                    </p>
                  </div>

                  <button 
                    onClick={processSubscription}
                    disabled={isProcessing || !walletConnect.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Payment'}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Processing */}
            {currentStep === 'processing' && (
              <>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white text-center">Processing Payment</h2>
                </div>

                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Waiting for Payment Confirmation
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Your payment is being processed. This usually takes a few moments.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Please do not close this page. We're checking the Bitcoin network for your payment.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Success */}
            {currentStep === 'success' && (
              <>
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white text-center">Payment Successful!</h2>
                </div>

                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-green-600 dark:text-green-400 text-3xl">✓</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Welcome to {settings?.siteName}!
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Your subscription is now active. You have full access to all premium content.
                  </p>

                  <Link
                    href="/dashboard"
                    className="inline-block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Access Your Content
                  </Link>
                </div>
              </>
            )}

            {/* Step 5: Error */}
            {currentStep === 'error' && (
              <>
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white text-center">Payment Error</h2>
                </div>

                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-red-600 dark:text-red-400 text-3xl">✕</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Something went wrong
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    {error || 'An unexpected error occurred during payment processing.'}
                  </p>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                    Please try again or contact support if the problem persists.
                  </p>

                  <button
                    onClick={() => {
                      setCurrentStep('pricing')
                      setError('')
                      setCheckoutData(null)
                      setWalletConnect('')
                    }}
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Back to Sign In */}
          {currentStep === 'pricing' && (
            <div className="text-center mt-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already subscribed?{' '}
                <Link href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign in to access content
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 