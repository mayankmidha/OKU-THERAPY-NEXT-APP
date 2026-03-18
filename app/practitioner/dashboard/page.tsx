'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  PractitionerActionTile,
  PractitionerLoadingState,
  PractitionerPill,
  PractitionerSectionCard,
  PractitionerShell,
  PractitionerStatCard,
} from '@/components/practitioner-shell/practitioner-shell'

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
    return <PractitionerLoadingState message="Loading your dashboard..." />
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  return (
    <PractitionerShell
      badge="Practice command center"
      currentPath="/practitioner/dashboard"
      description={`A calm workspace for ${session.user.name ?? 'your practice'} with today's schedule, caseload, and quick actions in one place.`}
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
            href="/practitioner/appointments"
          >
            View appointments
          </Link>
          <Link
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            href="/practitioner/availability"
          >
            Manage availability
          </Link>
        </>
      }
      title={`Welcome back, ${session.user.name ?? 'Practitioner'}`}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <PractitionerPill tone="emerald">Verified practice</PractitionerPill>
        <PractitionerPill tone="sky">{todaysAppointments.length} appointment{todaysAppointments.length === 1 ? '' : 's'} today</PractitionerPill>
        <PractitionerPill tone="slate">{weekStats.clients} active clients</PractitionerPill>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PractitionerStatCard
          accent="from-sky-500 to-cyan-500"
          detail="Appointments scheduled for today."
          label="Today's appointments"
          value={todaysAppointments.length}
        />
        <PractitionerStatCard
          accent="from-emerald-500 to-teal-500"
          detail="Practice flow over the current week."
          label="This week"
          value={weekStats.appointments}
        />
        <PractitionerStatCard
          accent="from-violet-500 to-indigo-500"
          detail="Clients currently in your caseload."
          label="Active clients"
          value={weekStats.clients}
        />
        <PractitionerStatCard
          accent="from-amber-500 to-orange-500"
          detail="Completed sessions this week."
          label="Completed"
          value={weekStats.completed}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <PractitionerSectionCard
          action={
            <Link className="text-sm font-medium text-sky-700 transition hover:text-sky-900" href="/practitioner/appointments">
              View calendar
            </Link>
          }
          description="Today's appointments are surfaced here with time, client context, and note previews."
          title="Today's schedule"
        >
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <article
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
                  key={appointment.id}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{appointment.client.name ?? 'Client'}</h3>
                        <p className="mt-1 text-sm text-slate-500">{appointment.client.email}</p>
                      </div>
                    <PractitionerPill tone="emerald">Scheduled</PractitionerPill>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
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
                  </div>

                  {appointment.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{appointment.notes}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <p className="text-base font-medium text-slate-900">No appointments scheduled for today.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your calendar is clear, so this is a good time to update availability or review client context.
              </p>
            </div>
          )}
        </PractitionerSectionCard>

        <PractitionerSectionCard
          action={
            <Link className="text-sm font-medium text-sky-700 transition hover:text-sky-900" href="/practitioner/profile">
              Open profile
            </Link>
          }
          description="Fast access to the parts of the workspace you use most during a live day."
          title="Quick actions"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PractitionerActionTile
              accent="from-sky-500 to-cyan-500"
              description="Open your live schedule and review the day's flow."
              href="/practitioner/appointments"
              icon="A"
              title="Appointments"
            />
            <PractitionerActionTile
              accent="from-emerald-500 to-teal-500"
              description="See the people already in your care and their context."
              href="/practitioner/clients"
              icon="C"
              title="Clients"
            />
            <PractitionerActionTile
              accent="from-violet-500 to-indigo-500"
              description="Adjust working hours and weekly availability."
              href="/practitioner/availability"
              icon="V"
              title="Availability"
            />
            <PractitionerActionTile
              accent="from-amber-500 to-orange-500"
              description="Review your verified profile and update details."
              href="/practitioner/profile"
              icon="P"
              title="Profile"
            />
          </div>
        </PractitionerSectionCard>
      </div>
    </PractitionerShell>
  )
}
