'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateVideo() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublished: false
  })
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    if (!file) {
      setError('Please select a video file')
      return
    }

    setIsLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description || '')
      uploadFormData.append('type', 'VIDEO')
      uploadFormData.append('isPublished', formData.isPublished.toString())

      const response = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: uploadFormData
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
              Upload Video
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Upload and share a video with your subscribers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Video File
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  
                  {!file ? (
                    <>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Drag and drop your video file here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-block"
                      >
                        Choose Video File
                      </label>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Supported formats: MP4, WebM, MOV (Max size: 50MB)
                      </p>
                    </>
                  ) : (
                    <div className="text-left">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎬</span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white text-lg"
                  placeholder="Enter a compelling title for your video..."
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
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Describe what your video is about..."
                />
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
                    Publish immediately (subscribers will see this video right away)
                  </label>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Leave unchecked to save as draft
                </p>
              </div>

              {/* Upload Progress */}
              {isLoading && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploading...</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Uploading Video...' : formData.isPublished ? 'Upload & Publish' : 'Upload as Draft'}
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