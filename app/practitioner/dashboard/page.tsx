'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PractitionerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todaysAppointments, setTodaysAppointments] = useState([])
  const [weekStats, setWeekStats] = useState({ appointments: 0, clients: 0, completed: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'PRACTITIONER') {
      router.push('/auth/login')
      return
    }

    fetchPractitionerData()
  }, [session, status, router])

  const fetchPractitionerData = async () => {
    try {
      // Fetch today's appointments
      const appointmentsResponse = await fetch('/api/practitioner/appointments')
      if (appointmentsResponse.ok) {
        const data = await appointmentsResponse.json()
        setTodaysAppointments(data.todays || [])
        setWeekStats(data.stats || { appointments: 0, clients: 0, completed: 0 })
      }
    } catch (error) {
      console.error('Error fetching practitioner data:', error)
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

  if (!session || session.user?.role !== 'PRACTITIONER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OKU Therapy - Practitioner</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/practitioner/appointments" className="text-blue-600 hover:text-blue-800 font-medium">
                Appointments
              </Link>
              <Link href="/practitioner/clients" className="text-blue-600 hover:text-blue-800 font-medium">
                Clients
              </Link>
              <Link href="/practitioner/availability" className="text-blue-600 hover:text-blue-800 font-medium">
                Availability
              </Link>
              <div className="relative group">
                <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <span className="mr-2">{session.user?.name}</span>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
        {/* Today's Schedule */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Today's Schedule</h2>
          <p className="text-green-100 text-lg">
            You have {todaysAppointments.length} appointment{todaysAppointments.length !== 1 ? 's' : ''} today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                    <dd className="text-lg font-semibold text-gray-900">{weekStats.appointments}</dd>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-3A3 3 0 0012 14c-1.11 0-2.08.6-2.599 1.49V7a3 3 0 016-3H5a3 3 0 00-3 3v4a3 3 0 003 3h1.72L11 17l4-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                    <dd className="text-lg font-semibold text-gray-900">{weekStats.appointments}</dd>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1m0 0v1a6 6 0 0112 0v1m0 0v1a6 6 0 01-12 0v-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Clients</dt>
                    <dd className="text-lg font-semibold text-gray-900">{weekStats.clients}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Sessions</dt>
                    <dd className="text-lg font-semibold text-gray-900">{weekStats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
            <Link href="/practitioner/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Calendar
            </Link>
          </div>
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment: any) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.client?.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.client?.email}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-1">Notes: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Join Call
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                        Notes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-2">📅</div>
              <p className="text-gray-600">No appointments scheduled for today</p>
              <Link href="/practitioner/availability" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Update Availability
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/practitioner/appointments" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm font-medium">Calendar</div>
            </Link>
            <Link href="/practitioner/clients" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-medium">My Clients</div>
            </Link>
            <Link href="/practitioner/availability" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-sm font-medium">Availability</div>
            </Link>
            <Link href="/practitioner/profile" className="group block text-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm font-medium">Profile</div>
            </Link>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Session Completion Rate</h4>
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-sm text-gray-600 mt-1">Great job maintaining your schedule!</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Average Rating</h4>
              <div className="text-2xl font-bold text-yellow-600">4.8/5.0</div>
              <p className="text-sm text-gray-600 mt-1">Clients are very satisfied</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
              <div className="text-2xl font-bold text-blue-600">2.3 hrs</div>
              <p className="text-sm text-gray-600 mt-1">Excellent response time</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
