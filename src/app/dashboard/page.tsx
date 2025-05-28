'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchContent()
  }, [session, status, router])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4 animate-pulse">
            S
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading your content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SatsClub</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Welcome, {session?.user?.name}
              </span>
              <button 
                onClick={() => router.push('/api/auth/signout')}
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Your Premium Content
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Access all your exclusive content and updates
            </p>
          </div>

          {/* Content Grid */}
          {content.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No content yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Content will appear here once the creator publishes new posts.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item: any) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {item.thumbnail && (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'VIDEO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        item.type === 'IMAGE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      
                      <Link 
                        href={`/content/${item.id}`}
                        className="text-orange-600 hover:text-orange-500 font-medium text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 