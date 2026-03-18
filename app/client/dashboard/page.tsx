'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [completedSessions, setCompletedSessions] = useState(0)
  const [assessmentsCompleted, setAssessmentsCompleted] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'CLIENT') {
      router.push('/auth/login')
      return
    }

    fetchClientData()
  }, [session, status, router])

  const fetchClientData = async () => {
    try {
      // Fetch upcoming appointments
      const appointmentsResponse = await fetch('/api/client/appointments')
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json()
        setUpcomingAppointments(appointments.upcoming || [])
        setCompletedSessions(appointments.completed || 0)
      }

      // Fetch assessment count
      const assessmentsResponse = await fetch('/api/client/assessments')
      if (assessmentsResponse.ok) {
        const assessments = await assessmentsResponse.json()
        setAssessmentsCompleted(assessments.length || 0)
      }
    } catch (error) {
      console.error('Error fetching client data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'CLIENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OKU Therapy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/client/book-appointment" className="text-blue-600 hover:text-blue-800 font-medium">
                Book Appointment
              </Link>
              <Link href="/client/assessments" className="text-blue-600 hover:text-blue-800 font-medium">
                Assessments
              </Link>
              <div className="relative group">
                <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <span className="mr-2">{session.user?.name}</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {session.user?.name}! 👋
          </h2>
          <p className="text-blue-100 text-lg">
            How are you feeling today? Your mental health journey continues.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                    <dd className="text-lg font-semibold text-gray-900">{upcomingAppointments.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Sessions</dt>
                    <dd className="text-lg font-semibold text-gray-900">{completedSessions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Assessments Completed</dt>
                    <dd className="text-lg font-semibold text-gray-900">{assessmentsCompleted}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/client/book-appointment" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm font-medium">Book Appointment</div>
            </Link>
            <Link href="/client/assessments" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-sm font-medium">Take Assessment</div>
            </Link>
            <Link href="/client/mood-tracker" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-sm font-medium">Track Mood</div>
            </Link>
            <Link href="/client/profile" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm font-medium">Edit Profile</div>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <Link href="/client/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment: any) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.practitioner?.name}</h4>
                      <p className="text-sm text-gray-600">{new Date(appointment.startTime).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-2">📅</div>
              <p className="text-gray-600">No upcoming appointments</p>
              <Link href="/client/book-appointment" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Book Your First Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Wellness Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Wellness Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Daily Mindfulness</h4>
              <p className="text-sm text-gray-600">Take 5 minutes each day for deep breathing exercises. This can help reduce anxiety and improve focus.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Sleep Hygiene</h4>
              <p className="text-sm text-gray-600">Maintain a consistent sleep schedule and create a relaxing bedtime routine for better mental health.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
