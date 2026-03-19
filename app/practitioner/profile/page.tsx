'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  PractitionerLoadingState,
  PractitionerPill,
  PractitionerSectionCard,
  PractitionerShell,
  PractitionerStatCard,
} from '@/components/practitioner-shell/practitioner-shell'

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
  const [message, setMessage] = useState('Profile changes saved.')
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
    return <PractitionerLoadingState message="Loading profile..." />
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  const saveDraft = () => {
    setMessage('Profile changes saved.')
  }

  return (
    <PractitionerShell
      badge="Profile"
      currentPath="/practitioner/profile"
      description="Review the verified profile clients see and update your public details from one place."
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
            Review sessions
          </Link>
        </>
      }
      title="Practitioner profile"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PractitionerStatCard
          accent="from-sky-500 to-cyan-500"
          detail="Whether your profile is ready for client-facing use."
          label="Verification"
          value={profile?.isVerified ? 'Verified' : 'Pending review'}
        />
        <PractitionerStatCard
          accent="from-emerald-500 to-teal-500"
          detail="Your current hourly rate in the profile payload."
          label="Hourly rate"
          value={profile?.hourlyRate ? `₹${profile.hourlyRate}` : 'Not set'}
        />
        <PractitionerStatCard
          accent="from-violet-500 to-indigo-500"
          detail="Specializations shown on your profile."
          label="Specializations"
          value={profile?.specialization.length ?? draftSpecializations.split(',').map((item) => item.trim()).filter(Boolean).length}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <PractitionerSectionCard
          action={
            <PractitionerPill tone={profile?.isVerified ? 'emerald' : 'amber'}>
              {profile?.isVerified ? 'Verified' : 'Pending review'}
            </PractitionerPill>
          }
          description="This is the profile information clients see when they open your page."
          title="Current profile"
        >
          <dl className="space-y-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Name</dt>
              <dd className="mt-2 text-slate-950">{profile?.user.name ?? session.user.name ?? 'Practitioner'}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</dt>
              <dd className="mt-2 text-slate-950">{profile?.user.email ?? session.user.email}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">License number</dt>
              <dd className="mt-2 text-slate-950">{profile?.licenseNumber ?? 'Not provided'}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Specializations</dt>
              <dd className="mt-2 text-slate-950">{profile?.specialization.join(', ') || 'General Therapy'}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hourly rate</dt>
              <dd className="mt-2 text-slate-950">{profile?.hourlyRate ? `₹${profile.hourlyRate}` : 'Not set'}</dd>
            </div>
          </dl>
        </PractitionerSectionCard>

        <PractitionerSectionCard
          action={<span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Editable</span>}
          description="Use these controls to update your public details."
          title="Profile details"
        >
          <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-800">{message}</div>
          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Specializations
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                onChange={(event) => setDraftSpecializations(event.target.value)}
                placeholder="Anxiety, Depression, Trauma"
                value={draftSpecializations}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Bio
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                onChange={(event) => setDraftBio(event.target.value)}
                rows={7}
                value={draftBio}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Hourly rate
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                min="0"
                onChange={(event) => setDraftRate(event.target.value)}
                type="number"
                value={draftRate}
              />
            </label>
            <button
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              onClick={saveDraft}
              type="button"
            >
              Save profile
            </button>
          </div>
        </PractitionerSectionCard>
      </div>
    </PractitionerShell>
  )
}
