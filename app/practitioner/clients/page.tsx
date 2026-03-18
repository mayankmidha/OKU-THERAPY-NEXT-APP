'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  PractitionerLoadingState,
  PractitionerPill,
  PractitionerSectionCard,
  PractitionerShell,
  PractitionerStatCard,
} from '@/components/practitioner-shell/practitioner-shell'

type PractitionerClient = {
  client: {
    clientProfile: {
      dateOfBirth: string | null
      gender: string | null
      medicalHistory: string | null
    } | null
    email: string
    name: string | null
  }
  id: string
  startTime: string
}

export default function PractitionerClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<PractitionerClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'PRACTITIONER') {
      router.replace('/auth/login')
      return
    }

    const fetchClients = async () => {
      try {
        const response = await fetch('/api/practitioner/clients')
        if (response.ok) {
          setClients((await response.json()) as PractitionerClient[])
        }
      } catch (error) {
        console.error('Error fetching practitioner clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchClients()
  }, [router, session, status])

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return clients
    }

    return clients.filter((entry) => {
      const name = entry.client.name?.toLowerCase() ?? ''
      const email = entry.client.email.toLowerCase()
      return name.includes(normalized) || email.includes(normalized)
    })
  }, [clients, query])

  const recentSessionDate = clients[0]?.startTime ? new Date(clients[0].startTime).toLocaleDateString() : 'Not yet'

  if (status === 'loading' || isLoading) {
    return <PractitionerLoadingState message="Loading clients..." />
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  return (
    <PractitionerShell
      badge="Caseload"
      currentPath="/practitioner/clients"
      description="A premium view of the people already in your care, with search, context, and gentle visual hierarchy."
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
            href="/practitioner/appointments"
          >
            Review appointments
          </Link>
        </>
      }
      title="Clients"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PractitionerStatCard
          accent="from-sky-500 to-cyan-500"
          detail="Clients currently visible in your caseload."
          label="Total clients"
          value={clients.length}
        />
        <PractitionerStatCard
          accent="from-emerald-500 to-teal-500"
          detail="How many clients match the current search."
          label="Search results"
          value={filteredClients.length}
        />
        <PractitionerStatCard
          accent="from-violet-500 to-indigo-500"
          detail="Most recently surfaced client session."
          label="Latest session"
          value={recentSessionDate}
        />
      </div>

      <div className="mt-6">
        <PractitionerSectionCard
          action={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Search
            </span>
          }
          description="Search by client name or email. The list stays tied to the current practice data."
          title="Client directory"
        >
          <div className="mb-5">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:w-96"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients"
              value={query}
            />
          </div>

          {filteredClients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredClients.map((entry) => {
                const initials = (entry.client.name ?? entry.client.email)
                  .split(' ')
                  .map((part) => part.charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <article
                    className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:bg-white"
                    key={entry.id}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/20">
                        {initials || 'C'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-950">{entry.client.name ?? 'Client'}</h3>
                            <p className="mt-1 text-sm text-slate-500">{entry.client.email}</p>
                          </div>
                          <PractitionerPill tone="emerald">Active</PractitionerPill>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            Last session: {new Date(entry.startTime).toLocaleDateString()}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            Gender: {entry.client.clientProfile?.gender ?? 'Not provided'}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            DOB:{' '}
                            {entry.client.clientProfile?.dateOfBirth
                              ? new Date(entry.client.clientProfile.dateOfBirth).toLocaleDateString()
                              : 'Not provided'}
                          </span>
                        </div>

                        {entry.client.clientProfile?.medicalHistory ? (
                          <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                            {entry.client.clientProfile.medicalHistory}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <p className="text-base font-medium text-slate-900">No clients match this search.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Try a different name or email, or clear the search to see the full caseload.
              </p>
            </div>
          )}
        </PractitionerSectionCard>
      </div>
    </PractitionerShell>
  )
}
