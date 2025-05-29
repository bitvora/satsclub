'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { marked } from 'marked'

interface ContentItem {
  id: string
  title: string
  description?: string
  type: 'BLOG_POST' | 'VIDEO' | 'IMAGE'
  content: string
  thumbnail?: string
  isPublished: boolean
  createdAt: string
  admin?: {
    name: string
  }
  user?: {
    name: string
  }
}

export default function ContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [content, setContent] = useState<ContentItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/content/' + params?.id)
      return
    }

    if (params?.id) {
      fetchContent(params.id as string)
    }
  }, [session, status, router, params?.id])

  const fetchContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('You need a subscription to view this content')
          router.push('/subscribe')
          return
        } else if (response.status === 404) {
          setError('Content not found')
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to load content')
        }
        return
      }

      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
      setError('Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BLOG_POST': return '✍️'
      case 'VIDEO': return '🎥'
      case 'IMAGE': return '🖼️'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BLOG_POST': return 'Blog Post'
      case 'VIDEO': return 'Video'
      case 'IMAGE': return 'Image'
      default: return type
    }
  }

  const renderMarkdown = (markdownText: string) => {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true
    })
    
    return marked(markdownText)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4 animate-pulse">
            S
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Content Not Available</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Content not found</h1>
          <Link
            href="/dashboard"
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Back to Dashboard
          </Link>
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
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SatsClub</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Content Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getTypeIcon(content.type)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                content.type === 'VIDEO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                content.type === 'IMAGE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {getTypeLabel(content.type)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {content.title}
            </h1>
            
            {content.description && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                {content.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>By {content.admin?.name || content.user?.name || 'Author'}</span>
              <span>•</span>
              <span>{formatDate(content.createdAt)}</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            {/* Blog Post Content */}
            {content.type === 'BLOG_POST' && (
              <div className="p-8">
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:bg-slate-100 dark:prose-code:bg-slate-700 prose-code:text-slate-900 dark:prose-code:text-white"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(content.content)
                  }}
                />
              </div>
            )}

            {/* Video Content */}
            {content.type === 'VIDEO' && (
              <div>
                {content.thumbnail && (
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 text-2xl">🎥</span>
                      <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          Video File
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                          {content.content.startsWith('http') ? 'External video link' : 'Video file path'}
                        </p>
                        
                        {content.content.startsWith('http') ? (
                          <a 
                            href={content.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            Watch Video →
                          </a>
                        ) : (
                          <video 
                            controls 
                            className="w-full rounded-lg"
                            poster={content.thumbnail}
                          >
                            <source src={content.content} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Content */}
            {content.type === 'IMAGE' && (
              <div>
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 p-8">
                  <img 
                    src={content.content} 
                    alt={content.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                
                {content.description && (
                  <div className="p-8">
                    <p className="text-slate-700 dark:text-slate-300">
                      {content.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 