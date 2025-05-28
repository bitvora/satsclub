'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Settings {
  siteName: string
  description?: string
  subscriptionPrice: number
  currency: string
  profilePicture?: string
  bannerPicture?: string
}

export default function Subscribe() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

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

          {/* Pricing Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-w-md mx-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white text-center">Monthly Subscription</h2>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-4xl">₿</span>
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ${settings?.subscriptionPrice || '10.00'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">/{settings?.currency || 'USD'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">per month</p>
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

              <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Pay with Bitcoin
              </button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                Secure Bitcoin payments powered by decentralized technology
              </p>
            </div>
          </div>

          {/* Back to Sign In */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already subscribed?{' '}
              <Link href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in to access content
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 