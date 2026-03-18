'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AppShell, EmptyState, SectionCard, StatCard, StatusPill } from '@/components/brand-app-shell'

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
    <AppShell
      accentClassName="bg-[#2f6a5b]"
      backHref="/client/dashboard"
      backLabel="Back to dashboard"
      description="See what is upcoming, what you have completed, and where to re-enter care planning when you need it."
      eyebrow="Appointments"
      primaryAction={{ href: '/client/book-appointment', label: 'Book appointment' }}
      secondaryAction={{ href: '/client/assessments', label: 'Open assessments' }}
      title="Your therapy schedule"
    >
      {isLoading ? (
        <div className="rounded-[28px] border border-stone-200 bg-white/90 p-8 text-center shadow-[0_14px_40px_rgba(60,42,24,0.07)]">
          Loading appointments...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <StatCard
              detail="Sessions that are scheduled and still ahead."
              label="Upcoming"
              value={data?.upcoming.length ?? 0}
            />
            <StatCard
              detail="Sessions already completed in the current workspace."
              label="Completed"
              value={data?.completed ?? 0}
            />
          </div>

          <SectionCard
            action={
              <Link
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                href="/client/book-appointment"
              >
                Schedule another session
              </Link>
            }
            description="Upcoming sessions appear here with the practitioner and timing details you need."
            title="Upcoming appointments"
          >
            {data?.upcoming.length ? (
              <div className="space-y-4">
                {data.upcoming.map((appointment) => (
                  <div
                    className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,243,236,0.98))] p-5"
                    key={appointment.id}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-stone-950">
                          {appointment.practitioner?.name ?? 'Practitioner'}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-stone-600">
                          {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                          {new Date(appointment.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="mt-1 text-sm text-stone-500">
                          {appointment.practitioner?.practitionerProfile?.specialization?.join(', ') ||
                            'General therapy'}
                        </div>
                        {appointment.practitioner?.email ? (
                          <div className="mt-1 text-sm text-stone-500">{appointment.practitioner.email}</div>
                        ) : null}
                      </div>
                      <StatusPill>{appointment.status.replace('_', ' ')}</StatusPill>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                action={
                  <Link
                    className="inline-flex rounded-full bg-[#2f6a5b] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
                    href="/client/book-appointment"
                  >
                    Book your first appointment
                  </Link>
                }
                description="There are no scheduled sessions yet. Once you book, your upcoming care will appear here."
                title="No upcoming appointments"
              />
            )}
          </SectionCard>
        </div>
      )}
    </AppShell>
  )
}
