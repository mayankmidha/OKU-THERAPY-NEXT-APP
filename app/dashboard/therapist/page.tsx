'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TherapistDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [totalClients, setTotalClients] = useState(0)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'THERAPIST') {
      router.push('/auth/signin')
      return
    }

    // Fetch therapist data
    fetchTherapistData()
  }, [session, status, router])

  const fetchTherapistData = async () => {
    try {
      // Fetch therapist profile
      const profileResponse = await fetch('/api/therapist/profile')
      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        setIsApproved(profile.isApproved)
      }

      // Fetch upcoming sessions
      const sessionsResponse = await fetch('/api/therapist/sessions')
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        setUpcomingSessions(sessions)
      }

      // Fetch client count
      const clientsResponse = await fetch('/api/therapist/clients/count')
      if (clientsResponse.ok) {
        const data = await clientsResponse.json()
        setTotalClients(data.count)
      }
    } catch (error) {
      console.error('Error fetching therapist data:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'THERAPIST') {
    return null
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-yellow-500 text-5xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-6">
              Your therapist account is currently under review. We'll notify you once it's approved.
            </p>
            <button
              onClick={() => router.push('/auth/signout')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OKU Therapy - Therapist</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/therapist/schedule" className="text-blue-600 hover:text-blue-800">
                Schedule
              </Link>
              <Link href="/dashboard/therapist/clients" className="text-blue-600 hover:text-blue-800">
                Clients
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
                  Ready to help your clients today, {session.user?.name}?
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard/therapist/schedule"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Schedule
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Your Practice</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
                    <div className="text-sm text-gray-600">Total Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{upcomingSessions.length}</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Sessions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Today's Sessions</h2>
                <div className="mt-2 space-y-2">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.slice(0, 3).map((session: any) => (
                      <div key={session.id} className="text-sm border-b pb-2">
                        <p className="font-medium">{session.client.name}</p>
                        <p className="text-gray-600">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No sessions today</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href="/dashboard/therapist/schedule"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View full schedule →
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
                    href="/dashboard/therapist/schedule"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium">View Schedule</div>
                  </Link>
                  <Link
                    href="/dashboard/therapist/clients"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-medium">Manage Clients</div>
                  </Link>
                  <Link
                    href="/dashboard/therapist/availability"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="text-sm font-medium">Set Availability</div>
                  </Link>
                  <Link
                    href="/dashboard/therapist/profile"
                    className="block text-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm font-medium">Edit Profile</div>
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
