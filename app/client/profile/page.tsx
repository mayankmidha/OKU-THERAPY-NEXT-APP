'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type UserProfile = {
  email: string
  name: string | null
  phone?: string | null
  role: string
}

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string }
          setError(payload.error ?? 'Unable to load profile.')
          return
        }

        const payload = (await response.json()) as { user: UserProfile }
        setProfile(payload.user)
      } catch {
        setError('Unable to load profile right now.')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProfile()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/client/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Basic account details for the current MVP. Editable profile management can come next.
          </p>

          {isLoading ? <p className="mt-6 text-sm text-gray-600">Loading profile...</p> : null}
          {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

          {profile ? (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">Name</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{profile.name || 'Not provided'}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{profile.email}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{profile.phone || 'Not provided'}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">Role</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{profile.role}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </main>
    </div>
  )
}
