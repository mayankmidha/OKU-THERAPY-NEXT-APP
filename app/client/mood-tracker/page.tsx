'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type MoodEntry = {
  id: string
  mood: number
  notes: string | null
  createdAt: string
}

export default function MoodTrackerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mood, setMood] = useState(7)
  const [notes, setNotes] = useState('')
  const [latestEntry, setLatestEntry] = useState<MoodEntry | null>(null)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'CLIENT') {
      router.replace('/auth/login')
      return
    }

    const fetchLatestMood = async () => {
      try {
        const response = await fetch('/api/client/mood/recent')

        if (response.ok) {
          const data = (await response.json()) as MoodEntry | null

          if (data) {
            setLatestEntry(data)
          }
        }
      } catch (error) {
        console.error('Error fetching latest mood entry:', error)
      }
    }

    void fetchLatestMood()
  }, [router, session, status])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/client/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          notes,
          tags: ['mood-tracker'],
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setMessage(data.error ?? 'Unable to save your mood entry.')
        return
      }

      const data = (await response.json()) as MoodEntry
      setLatestEntry(data)
      setNotes('')
      setMessage('Mood entry saved.')
    } catch {
      setMessage('Unable to save your mood entry.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6 lg:px-8">
          <Link className="font-medium text-blue-600 hover:text-blue-800" href="/client/dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="mt-2 text-gray-600">
            Capture a quick daily check-in so the client dashboard stays useful between sessions.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            ) : null}

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700" htmlFor="mood">
                Mood score: {mood}/10
              </label>
              <input
                id="mood"
                max={10}
                min={1}
                onChange={(event) => setMood(Number(event.target.value))}
                type="range"
                value={mood}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What contributed to how you're feeling today?"
              />
            </div>

            <button
              className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? 'Saving...' : 'Save mood entry'}
            </button>
          </form>

          {latestEntry ? (
            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-medium text-gray-900">Latest entry</h2>
              <p className="mt-2 text-sm text-gray-600">
                Score {latestEntry.mood}/10 on {new Date(latestEntry.createdAt).toLocaleString()}
              </p>
              {latestEntry.notes ? <p className="mt-2 text-gray-700">{latestEntry.notes}</p> : null}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
