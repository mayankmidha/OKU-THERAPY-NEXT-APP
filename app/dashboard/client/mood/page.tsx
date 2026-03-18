'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MoodTrackerPage() {
  const [mood, setMood] = useState(5)
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/client/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mood, 
          notes, 
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
        }),
      })

      if (response.ok) {
        setMessage('Mood logged successfully!')
        setMood(5)
        setNotes('')
        setTags('')
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to log mood')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤗', '😍']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/client" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">How are you feeling?</h1>
              <p className="text-gray-600 mt-1">Track your mood to monitor your mental health journey</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Mood Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Mood Level
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Very Low</span>
                    <span>Neutral</span>
                    <span>Very High</span>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl">{moodEmojis[mood - 1]}</span>
                    <div className="text-2xl font-bold text-gray-900 mt-2">{mood}/10</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's on your mind? What happened today?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="anxious, happy, stressed, grateful (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Logging...' : 'Log Mood'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
