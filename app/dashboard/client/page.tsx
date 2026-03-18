'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentMood, setRecentMood] = useState<{mood: number, notes?: string} | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'CLIENT') {
      router.push('/auth/signin')
      return
    }

    // Fetch client data
    fetchClientData()
  }, [session, status, router])

  const fetchClientData = async () => {
    try {
      // Fetch upcoming sessions
      const sessionsResponse = await fetch('/api/client/sessions')
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        setUpcomingSessions(sessions)
      }

      // Fetch recent mood entry
      const moodResponse = await fetch('/api/client/mood/recent')
      if (moodResponse.ok) {
        const mood = await moodResponse.json()
        setRecentMood(mood)
      }
    } catch (error) {
      console.error('Error fetching client data:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'CLIENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OKU Therapy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/client/book" className="text-blue-600 hover:text-blue-800">
                Book Session
              </Link>
              <Link href="/dashboard/client/assessments" className="text-blue-600 hover:text-blue-800">
                Assessments
              </Link>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Welcome back!</h2>
                <p className="mt-1 text-sm text-gray-600">
                  How are you feeling today, {session.user?.name}?
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard/client/mood"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Log Mood
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
                <div className="mt-2 space-y-2">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session: any) => (
                      <div key={session.id} className="text-sm">
                        <p className="font-medium">{session.therapist.name}</p>
                        <p className="text-gray-600">{new Date(session.startTime).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No upcoming sessions</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href="/dashboard/client/book"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Book a session →
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Mood */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Recent Mood</h2>
                {recentMood ? (
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-blue-600">{recentMood.mood}/10</div>
                    <p className="text-sm text-gray-600 mt-1">{recentMood.notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No mood entries yet</p>
                )}
                <div className="mt-4">
                  <Link
                    href="/dashboard/client/mood"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View mood history →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg md:col-span-2 lg:col-span-3">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    href="/dashboard/client/book"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium">Book Session</div>
                  </Link>
                  <Link
                    href="/dashboard/client/assessments"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium">Take Assessment</div>
                  </Link>
                  <Link
                    href="/dashboard/client/mood"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">😊</div>
                    <div className="text-sm font-medium">Log Mood</div>
                  </Link>
                  <Link
                    href="/dashboard/client/history"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium">View History</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
