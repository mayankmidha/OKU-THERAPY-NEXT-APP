'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

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

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading clients...</p>
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="mt-2 text-sm text-gray-600">People you have already seen or have on your current caseload.</p>
          </div>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm sm:w-80"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients"
            value={query}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          {filteredClients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredClients.map((entry) => (
                <article className="rounded-lg border border-gray-200 p-4" key={entry.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium text-gray-900">{entry.client.name ?? 'Client'}</h2>
                      <p className="text-sm text-gray-600">{entry.client.email}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      Active
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-gray-600">
                    <div>Last session: {new Date(entry.startTime).toLocaleDateString()}</div>
                    <div>Gender: {entry.client.clientProfile?.gender ?? 'Not provided'}</div>
                    <div>Date of birth: {entry.client.clientProfile?.dateOfBirth ? new Date(entry.client.clientProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                  </div>
                  {entry.client.clientProfile?.medicalHistory ? (
                    <p className="mt-4 text-sm text-gray-500">{entry.client.clientProfile.medicalHistory}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-600">No clients match this search.</div>
          )}
        </div>
      </main>
    </div>
  )
}
