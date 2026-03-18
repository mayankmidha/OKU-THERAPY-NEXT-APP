'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type AppointmentSummary = {
  id: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED'
  practitioner: {
    name: string | null
  }
}

type AppointmentResponse = {
  upcoming: AppointmentSummary[]
  completed: number
}

type AssessmentHistoryItem = {
  id: string
  score: number | null
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentSummary[]>([])
  const [completedSessions, setCompletedSessions] = useState(0)
  const [assessmentsCompleted, setAssessmentsCompleted] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'CLIENT') {
      router.replace('/auth/login')
      return
    }

    const fetchClientData = async () => {
      try {
        const [appointmentsResponse, assessmentsResponse] = await Promise.all([
          fetch('/api/client/appointments'),
          fetch('/api/client/assessments'),
        ])

        if (appointmentsResponse.ok) {
          const appointments = (await appointmentsResponse.json()) as AppointmentResponse
          setUpcomingAppointments(appointments.upcoming)
          setCompletedSessions(appointments.completed)
        }

        if (assessmentsResponse.ok) {
          const assessments = (await assessmentsResponse.json()) as AssessmentHistoryItem[]
          setAssessmentsCompleted(assessments.length)
        }
      } catch (error) {
        console.error('Error fetching client data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchClientData()
  }, [router, session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'CLIENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">OKU Therapy</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/client/book-appointment">
              Book Appointment
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/client/assessments">
              Assessments
            </Link>
            <button
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={() => void signOut({ callbackUrl: '/auth/login' })}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h2 className="mb-2 text-3xl font-bold">Welcome back, {session.user.name}!</h2>
          <p className="text-blue-100">
            Your care plan, appointments, and assessments now live in one client workspace.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{upcomingAppointments.length}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{completedSessions}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Assessments Completed</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{assessmentsCompleted}</p>
          </div>
        </div>

        <section className="mt-8 rounded-lg bg-white p-6 shadow" id="quick-actions">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/client/book-appointment"
            >
              <div className="mb-2 text-3xl">📅</div>
              <div className="text-sm font-medium">Book Appointment</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/client/assessments"
            >
              <div className="mb-2 text-3xl">📝</div>
              <div className="text-sm font-medium">Take PHQ-9</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/client/mood-tracker"
            >
              <div className="mb-2 text-3xl">😊</div>
              <div className="text-sm font-medium">Track Mood</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/client/dashboard#upcoming-appointments"
            >
              <div className="mb-2 text-3xl">📌</div>
              <div className="text-sm font-medium">Upcoming Schedule</div>
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-lg bg-white p-6 shadow" id="upcoming-appointments">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/client/book-appointment">
              Book another
            </Link>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 5).map((appointment) => (
                <div className="rounded-lg border border-gray-200 p-4" key={appointment.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.practitioner.name ?? 'Assigned practitioner'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-2 text-5xl text-gray-300">📅</div>
              <p className="text-gray-600">No upcoming appointments yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
