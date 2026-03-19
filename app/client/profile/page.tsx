'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AppShell, SectionCard, StatCard } from '@/components/brand-app-shell'

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
    <AppShell
      accentClassName="bg-[#2f6a5b]"
      backHref="/client/dashboard"
      backLabel="Back to dashboard"
      description="This is the current MVP account summary. Editable profile fields can be layered in next without disrupting your current workspace."
      eyebrow="Profile"
      primaryAction={{ href: '/client/book-appointment', label: 'Book session' }}
      secondaryAction={{ href: '/client/appointments', label: 'See appointments' }}
      title="Your account details"
    >
      {isLoading ? (
        <div className="rounded-[28px] border border-stone-200 bg-white/90 p-8 text-center shadow-[0_14px_40px_rgba(60,42,24,0.07)]">
          Loading profile...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">{error}</div>
      ) : profile ? (
        <div className="space-y-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard detail="Name on your current account." label="Name" value={profile.name || 'Not provided'} />
            <StatCard detail="Primary email used to access the app." label="Email" value={profile.email} />
            <StatCard detail="Phone number available for support and scheduling." label="Phone" value={profile.phone || 'Not provided'} />
            <StatCard detail="Current role recognized by the platform." label="Role" value={profile.role} />
          </div>

          <SectionCard
            action={
              <Link
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                href="/client/dashboard"
              >
                Return to dashboard
              </Link>
            }
            description="The next product slice can add editable profile controls, preferences, and care history."
            title="Profile status"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Current MVP scope</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Profile viewing is live. This keeps the account surface reliable while the editable workflow is built.
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">What is next</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Notification preferences, richer personal details, and payment history can be added without changing the current route structure.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </AppShell>
  )
}
