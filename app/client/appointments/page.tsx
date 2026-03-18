'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Appointment = {
  endTime: string
  id: string
  practitioner?: {
    email?: string | null
    name?: string | null
    practitionerProfile?: {
      specialization?: string[]
    } | null
  } | null
  startTime: string
  status: string
}

type AppointmentResponse = {
  completed: number
  upcoming: Appointment[]
}

export default function ClientAppointmentsPage() {
  const [data, setData] = useState<AppointmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/client/appointments')
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string }
          setError(payload.error ?? 'Unable to load appointments.')
          return
        }

        setData((await response.json()) as AppointmentResponse)
      } catch {
        setError('Unable to load appointments right now.')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAppointments()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/client/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Appointments</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review upcoming sessions and keep track of your care journey.
            </p>
          </div>
          <Link
            href="/client/book-appointment"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Book Appointment
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">Loading appointments...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">Upcoming appointments</div>
                  <div className="mt-1 text-2xl font-bold text-blue-900">{data?.upcoming.length ?? 0}</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm text-green-700">Completed sessions</div>
                  <div className="mt-1 text-2xl font-bold text-green-900">{data?.completed ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
              {data?.upcoming.length ? (
                <div className="mt-4 space-y-4">
                  {data.upcoming.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.practitioner?.name ?? 'Practitioner'}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                            {new Date(appointment.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {appointment.practitioner?.practitionerProfile?.specialization?.join(', ') ||
                              'General therapy'}
                          </div>
                        </div>
                        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                  No upcoming appointments yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
