'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatePost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    isPublished: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'BLOG_POST'
        }),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.message || 'Something went wrong')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }

    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SatsClub Admin</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Create Blog Post
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Write and publish a new blog post for your subscribers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white text-lg"
                  placeholder="Enter an engaging title for your post..."
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Brief description of your post (shown in previews)..."
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content (Markdown Supported)
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={20}
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                  placeholder="Write your blog post content here using Markdown formatting...

# Example Heading
This is a **bold** word and this is *italic*.

- List item 1
- List item 2

[Link text](https://example.com)

```code
Code blocks are supported too!
```"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  💡 Tip: You can use Markdown formatting like **bold**, *italic*, headers, lists, and code blocks.
                </p>
              </div>

              {/* Publishing Options */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 bg-slate-100 border-slate-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Publish immediately (subscribers will see this post right away)
                  </label>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Leave unchecked to save as draft
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Post...' : formData.isPublished ? 'Publish Post' : 'Save Draft'}
                </button>
                
                <Link
                  href="/admin"
                  className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 