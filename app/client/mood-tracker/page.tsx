'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AppShell, SectionCard, StatCard } from '@/components/brand-app-shell'

type MoodEntry = {
  id: string
  mood: number
  notes: string | null
  createdAt: string
}

const moodLabels: Record<number, string> = {
  1: 'Very low',
  2: 'Heavy',
  3: 'Drained',
  4: 'Uneasy',
  5: 'Flat',
  6: 'Holding steady',
  7: 'Fair',
  8: 'Light',
  9: 'Grounded',
  10: 'Strong',
}

export default function MoodTrackerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mood, setMood] = useState(7)
  const [notes, setNotes] = useState('')
  const [latestEntry, setLatestEntry] = useState<MoodEntry | null>(null)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'CLIENT') {
      router.replace('/auth/login')
      return
    }

    const fetchLatestMood = async () => {
      try {
        const response = await fetch('/api/client/mood/recent')

        if (response.ok) {
          const data = (await response.json()) as MoodEntry | null

          if (data) {
            setLatestEntry(data)
          }
        }
      } catch (error) {
        console.error('Error fetching latest mood entry:', error)
      }
    }

    void fetchLatestMood()
  }, [router, session, status])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/client/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          notes,
          tags: ['mood-tracker'],
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setMessage(data.error ?? 'Unable to save your mood entry.')
        return
      }

      const data = (await response.json()) as MoodEntry
      setLatestEntry(data)
      setNotes('')
      setMessage('Mood entry saved.')
    } catch {
      setMessage('Unable to save your mood entry.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell
      accentClassName="bg-[#2f6a5b]"
      backHref="/client/dashboard"
      backLabel="Back to dashboard"
      description="Small daily check-ins help your care space stay useful between therapy sessions."
      eyebrow="Mood tracker"
      primaryAction={{ href: '/client/assessments', label: 'Open assessments' }}
      secondaryAction={{ href: '/client/appointments', label: 'See appointments' }}
      title="Capture how today feels"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <StatCard detail="Your selected mood score for this check-in." label="Current score" value={`${mood}/10`} />
        <StatCard
          detail="A gentle label so the score feels easier to interpret."
          label="Current state"
          value={moodLabels[mood]}
        />
      </div>

      <SectionCard
        description="You can keep this brief. A short note can be enough to make later reflection easier."
        title="Daily check-in"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {message ? (
            <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
              {message}
            </div>
          ) : null}

          <div className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,243,236,0.98))] p-6">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-stone-700" htmlFor="mood">
                Mood score
              </label>
              <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-stone-50">
                {mood}/10
              </span>
            </div>
            <input
              className="mt-5 w-full accent-[#2f6a5b]"
              id="mood"
              max={10}
              min={1}
              onChange={(event) => setMood(Number(event.target.value))}
              type="range"
              value={mood}
            />
            <div className="mt-4 flex justify-between text-xs uppercase tracking-[0.2em] text-stone-500">
              <span>Very low</span>
              <span>Grounded</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="notes">
              Short reflection
            </label>
            <textarea
              className="min-h-[160px] w-full rounded-[24px] border border-stone-300 bg-white px-4 py-4 text-sm leading-6 text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              id="notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What contributed to how you are feeling today?"
              rows={4}
              value={notes}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-[#2f6a5b] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? 'Saving...' : 'Save mood entry'}
            </button>
            <Link
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              href="/client/dashboard"
            >
              Return to dashboard
            </Link>
          </div>
        </form>
      </SectionCard>

      {latestEntry ? (
        <SectionCard
          description="Your latest recorded entry appears here so you can keep a simple continuity of care."
          title="Latest saved entry"
        >
          <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Score</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">{latestEntry.mood}/10</p>
              <p className="mt-2 text-sm text-stone-600">{moodLabels[latestEntry.mood] ?? 'Check-in saved'}</p>
            </div>
            <div className="rounded-[24px] border border-stone-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Recorded</p>
              <p className="mt-3 text-sm text-stone-600">{new Date(latestEntry.createdAt).toLocaleString()}</p>
              {latestEntry.notes ? <p className="mt-4 text-sm leading-7 text-stone-700">{latestEntry.notes}</p> : null}
            </div>
          </div>
        </SectionCard>
      ) : null}
    </AppShell>
  )
}
