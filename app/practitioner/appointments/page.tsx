'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  PractitionerLoadingState,
  PractitionerPill,
  PractitionerSectionCard,
  PractitionerShell,
  PractitionerStatCard,
} from '@/components/practitioner-shell/practitioner-shell'

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
    return <PractitionerLoadingState message="Loading appointments..." />
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  return (
    <PractitionerShell
      badge="Schedule"
      currentPath="/practitioner/appointments"
      description="Review today's calendar, weekly flow, and client context in a calmer, premium workspace."
      headerActions={
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          onClick={() => void signOut({ callbackUrl: '/auth/login' })}
          type="button"
        >
          Sign out
        </button>
      }
      heroActions={
        <>
          <Link
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            href="/practitioner/dashboard"
          >
            Back to dashboard
          </Link>
          <Link
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            href="/practitioner/clients"
          >
            View clients
          </Link>
        </>
      }
      title="Appointments"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PractitionerStatCard
          accent="from-sky-500 to-cyan-500"
          detail="Appointments scheduled for today."
          label="Today's appointments"
          value={appointments.length}
        />
        <PractitionerStatCard
          accent="from-emerald-500 to-teal-500"
          detail="Total appointments captured this week."
          label="This week"
          value={stats.appointments}
        />
        <PractitionerStatCard
          accent="from-amber-500 to-orange-500"
          detail="Completed appointments this week."
          label="Completed"
          value={stats.completed}
        />
      </div>

      <div className="mt-6">
        <PractitionerSectionCard
          action={
            <Link className="text-sm font-medium text-sky-700 transition hover:text-sky-900" href="/practitioner/clients">
              View clients
            </Link>
          }
          description="Today's sessions are shown here with time, client context, and note previews."
          title="Today's calendar"
        >
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <article
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
                  key={appointment.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-950">{appointment.client.name ?? 'Client'}</div>
                      <div className="mt-1 text-sm text-slate-500">{appointment.client.email}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                          {new Date(appointment.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(appointment.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                          {new Date(appointment.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <PractitionerPill tone="emerald">Scheduled</PractitionerPill>
                  </div>
                  {appointment.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{appointment.notes}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <p className="text-base font-medium text-slate-900">No appointments scheduled for today.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The day is open, which makes it a good time to review availability or client notes.
              </p>
            </div>
          )}
        </PractitionerSectionCard>
      </div>
    </PractitionerShell>
  )
}
