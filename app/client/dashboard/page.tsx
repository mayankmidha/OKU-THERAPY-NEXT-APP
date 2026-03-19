'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ActionCard, AppShell, EmptyState, SectionCard, StatCard, StatusPill } from '@/components/brand-app-shell'

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
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fcfaf5_0%,_#f6efe3_100%)]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-stone-900" />
          <p className="mt-4 text-stone-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'CLIENT') {
    return null
  }

  return (
    <AppShell
      accentClassName="bg-[#2f6a5b]"
      description="Your appointments, mental health check-ins, and assessments now live in one calmer space so it is easier to stay connected to care."
      eyebrow="Client workspace"
      nav={[
        { href: '/client/appointments', label: 'Appointments' },
        { href: '/client/assessments', label: 'Assessments' },
        { href: '/client/mood-tracker', label: 'Mood tracker' },
        { href: '/client/profile', label: 'Profile' },
      ]}
      primaryAction={{ href: '/client/book-appointment', label: 'Book a session' }}
      secondaryAction={{ href: '/client/assessments/phq9', label: 'Take PHQ-9' }}
      title={`Welcome back${session.user.name ? `, ${session.user.name}` : ''}.`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          detail="Scheduled sessions that are still ahead of you."
          label="Upcoming appointments"
          value={upcomingAppointments.length}
        />
        <StatCard
          detail="Completed care sessions recorded in your workspace."
          label="Completed sessions"
          value={completedSessions}
        />
        <StatCard
          detail="Assessment submissions available in your mental health history."
          label="Assessments completed"
          value={assessmentsCompleted}
        />
      </div>

      <SectionCard
        action={
          <button
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            onClick={() => void signOut({ callbackUrl: '/auth/login' })}
            type="button"
          >
            Sign out
          </button>
        }
        description="These are the next helpful actions for staying on top of care between sessions."
        title="Continue your care plan"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            description="Browse available practitioners, choose a service, and reserve a time."
            href="/client/book-appointment"
            meta="Scheduling"
            title="Book your next session"
          />
          <ActionCard
            description="Complete a guided check-in and review your previous PHQ-9 submissions."
            href="/client/assessments"
            meta="Assessments"
            title="Track your symptoms"
          />
          <ActionCard
            description="Capture a simple daily check-in so your dashboard reflects how you are doing."
            href="/client/mood-tracker"
            meta="Mood"
            title="Log today's mood"
          />
          <ActionCard
            description="Review your account details and the basics of your current workspace."
            href="/client/profile"
            meta="Profile"
            title="Review your profile"
          />
        </div>
      </SectionCard>

      <SectionCard
        action={
          <Link
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            href="/client/appointments"
          >
            View all appointments
          </Link>
        }
        description="Your next confirmed sessions appear here so you can keep an eye on timing and continuity."
        title="Upcoming appointments"
      >
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div
                className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,243,236,0.98))] p-5"
                key={appointment.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-950">
                      {appointment.practitioner.name ?? 'Assigned practitioner'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {new Date(appointment.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      end time
                    </p>
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
                Book your first session
              </Link>
            }
            description="Once you book a session, it will appear here with timing and practitioner details."
            title="No upcoming sessions yet"
          />
        )}
      </SectionCard>
    </AppShell>
  )
}
