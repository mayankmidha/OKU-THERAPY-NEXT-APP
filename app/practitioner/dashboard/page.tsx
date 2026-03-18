'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type PractitionerAppointment = {
  id: string
  startTime: string
  endTime: string
  notes: string | null
  client: {
    name: string | null
    email: string
  }
}

type PractitionerDashboardResponse = {
  todays: PractitionerAppointment[]
  stats: {
    appointments: number
    clients: number
    completed: number
  }
}

export default function PractitionerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todaysAppointments, setTodaysAppointments] = useState<PractitionerAppointment[]>([])
  const [weekStats, setWeekStats] = useState({ appointments: 0, clients: 0, completed: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'PRACTITIONER') {
      router.replace('/auth/login')
      return
    }

    const fetchPractitionerData = async () => {
      try {
        const response = await fetch('/api/practitioner/appointments')

        if (response.ok) {
          const data = (await response.json()) as PractitionerDashboardResponse
          setTodaysAppointments(data.todays)
          setWeekStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching practitioner data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchPractitionerData()
  }, [router, session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">OKU Therapy - Practitioner</h1>
          <div className="flex items-center gap-4">
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/practitioner/appointments">
              Appointments
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/practitioner/clients">
              Clients
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/practitioner/availability">
              Availability
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
        <div className="mb-8 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white">
          <h2 className="mb-2 text-3xl font-bold">Today&apos;s Schedule</h2>
          <p className="text-green-100">
            You have {todaysAppointments.length} appointment{todaysAppointments.length === 1 ? '' : 's'} today.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Today&apos;s Appointments</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{todaysAppointments.length}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">This Week</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{weekStats.appointments}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Active Clients</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{weekStats.clients}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Completed This Week</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{weekStats.completed}</p>
          </div>
        </div>

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Today&apos;s Appointments</h3>
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/practitioner/appointments">
              View calendar
            </Link>
          </div>

          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div className="rounded-lg border border-gray-200 p-4" key={appointment.id}>
                  <h4 className="font-medium text-gray-900">{appointment.client.name ?? 'Client'}</h4>
                  <p className="text-sm text-gray-600">{appointment.client.email}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(appointment.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {appointment.notes ? <p className="mt-2 text-sm text-gray-500">{appointment.notes}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600">No appointments scheduled for today.</div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/practitioner/appointments"
            >
              <div className="mb-2 text-3xl">📅</div>
              <div className="text-sm font-medium">Calendar</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/practitioner/clients"
            >
              <div className="mb-2 text-3xl">👥</div>
              <div className="text-sm font-medium">My Clients</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/practitioner/availability"
            >
              <div className="mb-2 text-3xl">⏰</div>
              <div className="text-sm font-medium">Availability</div>
            </Link>
            <Link
              className="block rounded-lg border-2 border-gray-300 p-6 text-center transition hover:border-blue-500"
              href="/practitioner/profile"
            >
              <div className="mb-2 text-3xl">👤</div>
              <div className="text-sm font-medium">Profile</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
