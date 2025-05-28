'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ContentItem {
  id: string
  title: string
  type: 'BLOG_POST' | 'VIDEO' | 'IMAGE'
  isPublished: boolean
  createdAt: string
  description?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    subscribers: 0,
    content: 0,
    mrr: 0
  })
  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchStats()
    fetchContent()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      // Mock data for now - you can implement these APIs later
      setStats({
        subscribers: 23,
        content: 12,
        mrr: 230
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      setContentLoading(true)
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
        setStats(prev => ({ ...prev, content: data.length }))
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setContentLoading(false)
    }
  }

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchContent() // Refresh the list
      } else {
        alert('Failed to delete content')
      }
    } catch (error) {
      console.error('Failed to delete content:', error)
      alert('Failed to delete content')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      })
      
      if (response.ok) {
        await fetchContent() // Refresh the list
      } else {
        alert('Failed to update content')
      }
    } catch (error) {
      console.error('Failed to update content:', error)
      alert('Failed to update content')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Pagination
  const totalPages = Math.ceil(content.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContent = content.slice(startIndex, startIndex + itemsPerPage)

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4 animate-pulse">
            S
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading admin dashboard...</p>
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
              <span className="text-xl font-bold text-slate-900 dark:text-white">SatsClub Admin</span>
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
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your SatsClub content and subscribers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Subscribers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.subscribers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Content</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.content}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-2xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">${stats.mrr}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-2xl">₿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/admin/create/post"
                className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors block"
              >
                <div className="text-2xl mb-2">✍️</div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Create Post</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Write a new blog post</p>
              </Link>

              <Link 
                href="/admin/create/video"
                className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors block"
              >
                <div className="text-2xl mb-2">🎥</div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Upload Video</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Add premium video content</p>
              </Link>

              <Link 
                href="/admin/create/image"
                className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors block"
              >
                <div className="text-2xl mb-2">🖼️</div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Upload Image</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Share exclusive images</p>
              </Link>

              <Link
                href="/admin/settings"
                className="p-4 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors block"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Configure your site</p>
              </Link>
            </div>
          </div>

          {/* Content Management */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Content</h2>
              <button
                onClick={fetchContent}
                className="text-orange-600 hover:text-orange-500 font-medium"
                disabled={contentLoading}
              >
                {contentLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {contentLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400 mt-4">Loading content...</p>
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No content yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Start creating content for your subscribers</p>
                <Link
                  href="/admin/create/post"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <>
                {/* Content Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Content</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Created</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedContent.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="py-4 px-4">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate max-w-md">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(item.type)}</span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">{getTypeLabel(item.type)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => togglePublish(item.id, item.isPublished)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.isPublished
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              }`}
                            >
                              {item.isPublished ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/content/${item.id}/edit`}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => deleteContent(item.id)}
                                className="text-red-600 hover:text-red-500 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, content.length)} of {content.length} items
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? 'bg-orange-600 text-white'
                              : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 