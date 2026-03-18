'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

type PractitionerProfile = {
  bio: string | null
  isVerified: boolean
  licenseNumber: string | null
  specialization: string[]
  hourlyRate: number | null
  user: {
    email: string
    name: string | null
  }
}

const DRAFT_KEY = 'oku-therapy-practitioner-profile-draft'

function loadStoredDraft() {
  if (typeof window === 'undefined') {
    return {
      bio: '',
      rate: '150',
      specializations: 'General Therapy',
    }
  }

  const stored = window.localStorage.getItem(DRAFT_KEY)
  if (!stored) {
    return {
      bio: '',
      rate: '150',
      specializations: 'General Therapy',
    }
  }

  try {
    const draft = JSON.parse(stored) as {
      bio?: string
      rate?: string
      specializations?: string
    }

    return {
      bio: draft.bio ?? '',
      rate: draft.rate ?? '150',
      specializations: draft.specializations ?? 'General Therapy',
    }
  } catch {
    return {
      bio: '',
      rate: '150',
      specializations: 'General Therapy',
    }
  }
}

export default function PractitionerProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<PractitionerProfile | null>(null)
  const [draftBio, setDraftBio] = useState(() => loadStoredDraft().bio)
  const [draftRate, setDraftRate] = useState(() => loadStoredDraft().rate)
  const [draftSpecializations, setDraftSpecializations] = useState(() => loadStoredDraft().specializations)
  const [message, setMessage] = useState('Profile edits are stored locally for now.')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'PRACTITIONER') {
      router.replace('/auth/login')
      return
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/therapist/profile')
        if (response.ok) {
          const data = (await response.json()) as PractitionerProfile
          setProfile(data)
          setDraftBio(data.bio ?? '')
          setDraftRate(String(data.hourlyRate ?? 150))
          setDraftSpecializations(data.specialization.join(', '))
        }
      } catch (error) {
        console.error('Error fetching practitioner profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()

  }, [router, session, status])

  useEffect(() => {
    if (status !== 'loading' && session?.user.role === 'PRACTITIONER') {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          bio: draftBio,
          rate: draftRate,
          specializations: draftSpecializations,
        }),
      )
    }
  }, [draftBio, draftRate, draftSpecializations, session?.user.role, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  const saveDraft = () => {
    setMessage('Profile draft saved locally in this browser.')
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Practitioner Profile</h1>
          <p className="mt-2 text-sm text-gray-600">View your verified profile and keep a local draft of edits until the update API exists.</p>
        </div>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Current Profile</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-gray-900">{profile?.user.name ?? session.user.name ?? 'Practitioner'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-gray-900">{profile?.user.email ?? session.user.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">License Number</dt>
                <dd className="mt-1 text-gray-900">{profile?.licenseNumber ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Verification</dt>
                <dd className="mt-1 text-gray-900">{profile?.isVerified ? 'Verified' : 'Pending review'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Specializations</dt>
                <dd className="mt-1 text-gray-900">{profile?.specialization.join(', ') || 'General Therapy'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Hourly rate</dt>
                <dd className="mt-1 text-gray-900">{profile?.hourlyRate ? `₹${profile.hourlyRate}` : 'Not set'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Draft edits</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Specializations
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  onChange={(event) => setDraftSpecializations(event.target.value)}
                  placeholder="Anxiety, Depression, Trauma"
                  value={draftSpecializations}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Bio
                <textarea
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  onChange={(event) => setDraftBio(event.target.value)}
                  rows={6}
                  value={draftBio}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Hourly rate
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  min="0"
                  onChange={(event) => setDraftRate(event.target.value)}
                  type="number"
                  value={draftRate}
                />
              </label>
              <button
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={saveDraft}
                type="button"
              >
                Save draft locally
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
