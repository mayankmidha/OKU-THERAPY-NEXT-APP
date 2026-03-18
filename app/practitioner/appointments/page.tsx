'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

type AppointmentSummary = {
  endTime: string
  id: string
  notes: string | null
  startTime: string
  client: {
    email: string
    name: string | null
    clientProfile: {
      dateOfBirth: string | null
      gender: string | null
    } | null
  }
}

type AppointmentStats = {
  appointments: number
  clients: number
  completed: number
}

type AppointmentsResponse = {
  stats: AppointmentStats
  todays: AppointmentSummary[]
}

export default function PractitionerAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    appointments: 0,
    clients: 0,
    completed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'PRACTITIONER') {
      router.replace('/auth/login')
      return
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/practitioner/appointments')
        if (response.ok) {
          const data = (await response.json()) as AppointmentsResponse
          setAppointments(data.todays)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching practitioner appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAppointments()
  }, [router, session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading appointments...</p>
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
          <Link className="font-medium text-blue-600 hover:text-blue-800" href="/practitioner/dashboard">
            ← Back to Dashboard
          </Link>
          <button className="text-sm text-gray-700 hover:text-gray-900" onClick={() => void signOut({ callbackUrl: '/auth/login' })} type="button">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-sm text-gray-600">Today&apos;s schedule and this week&apos;s practice summary.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Today&apos;s appointments</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{appointments.length}</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">This week</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.appointments}</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Completed this week</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.completed}</div>
          </div>
        </div>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today</h2>
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/practitioner/clients">
              View clients
            </Link>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div className="rounded-lg border border-gray-200 p-4" key={appointment.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{appointment.client.name ?? 'Client'}</div>
                      <div className="mt-1 text-sm text-gray-600">{appointment.client.email}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(appointment.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Scheduled
                    </div>
                  </div>
                  {appointment.notes ? <p className="mt-3 text-sm text-gray-500">{appointment.notes}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-600">No appointments scheduled for today.</div>
          )}
        </section>
      </main>
    </div>
  )
}
