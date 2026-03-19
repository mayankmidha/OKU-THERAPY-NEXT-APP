'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type AssessmentHistoryItem = {
  id: string
  score: number | null
  completedAt: string
  assessment: {
    title: string
    description: string | null
  }
}

const availableAssessments = [
  {
    id: 'phq9',
    title: 'PHQ-9 Depression Assessment',
    description: 'A calm self-check for depression symptoms over the last two weeks.',
    duration: '5 minutes',
    questions: 9,
  },
] as const

const supportCopy = [
  'This is a self-check, not a diagnosis.',
  'Take your time and answer honestly based on the last 2 weeks.',
  'If you feel unsafe, contact local emergency services or a trusted person right away.',
]

export default function AssessmentsPage() {
  const router = useRouter()
  const [completedAssessments, setCompletedAssessments] = useState<AssessmentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      try {
        const response = await fetch('/api/client/assessments')

        if (response.ok) {
          const data = (await response.json()) as AssessmentHistoryItem[]
          setCompletedAssessments(data)
        }
      } catch (error) {
        console.error('Error fetching assessment history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAssessmentHistory()
  }, [])

  const latestPhq9Score = completedAssessments.find(
    (assessment) => assessment.assessment.title === 'PHQ-9 Depression Assessment'
  )?.score

  const getScoreTone = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
      return {
        badge: 'bg-slate-100 text-slate-500',
        text: 'text-slate-500',
        label: 'Not yet completed',
      }
    }

    if (score <= 4) {
      return {
        badge: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        label: 'Low range',
      }
    }

    if (score <= 9) {
      return {
        badge: 'bg-amber-50 text-amber-700',
        text: 'text-amber-700',
        label: 'Mild range',
      }
    }

    if (score <= 14) {
      return {
        badge: 'bg-orange-50 text-orange-700',
        text: 'text-orange-700',
        label: 'Moderate range',
      }
    }

    return {
      badge: 'bg-rose-50 text-rose-700',
      text: 'text-rose-700',
      label: 'Higher range',
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(233,245,255,0.95),_rgba(248,250,252,1)_45%,_rgba(241,245,249,1)_100%)]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="rounded-[28px] border border-white/70 bg-white/85 px-8 py-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm font-medium text-slate-600">Loading your assessment space...</p>
          </div>
        </div>
      </div>
    )
  }

  const phqTone = getScoreTone(latestPhq9Score)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(233,245,255,0.95),_rgba(248,250,252,1)_40%,_rgba(241,245,249,1)_100%)] text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
            href="/client/dashboard"
          >
            Back to dashboard
          </Link>
          <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Private assessment space
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Mental health assessments</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A quiet place to check in with yourself.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              We are keeping the first release focused and supportive so the experience stays clear, calm, and useful.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {supportCopy.map((line) => (
                <div key={line} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {line}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Available now</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">PHQ-9 Depression Assessment</h2>
                </div>
                <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Recommended
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                A short evidence-based screening that helps you reflect on mood, energy, sleep, focus, and emotional strain.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Duration</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{availableAssessments[0].duration}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Questions</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{availableAssessments[0].questions}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Private and saved</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  onClick={() => router.push('/client/assessments/phq9')}
                  type="button"
                >
                  Start PHQ-9
                </button>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  href="/client/book-appointment"
                >
                  Book a session
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Most recent result</p>
              <div className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${phqTone.badge}`}>
                {phqTone.label}
              </div>
              <p className={`mt-4 text-3xl font-semibold tracking-tight ${phqTone.text}`}>
                {latestPhq9Score !== null && latestPhq9Score !== undefined ? `${latestPhq9Score}/27` : 'No score yet'}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                We surface this here so you can keep track of your latest check-in without hunting through the app.
              </p>
            </div>

            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Support note</p>
              <h3 className="mt-3 text-lg font-semibold text-rose-950">If something feels urgent</h3>
              <p className="mt-3 text-sm leading-6 text-rose-900">
                These tools are here to help you reflect, not replace urgent support. If you feel unsafe, call local emergency services or reach out to a trusted person right away.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Assessment history</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Your completed check-ins</h2>
            </div>
            <span className="text-sm text-slate-500">{completedAssessments.length} completed</span>
          </div>

          {completedAssessments.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {completedAssessments.map((assessment) => {
                const tone = getScoreTone(assessment.score)

                return (
                  <div
                    key={assessment.id}
                    className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {assessment.assessment.title}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                          {assessment.score !== null ? `${assessment.score}/27` : 'Score unavailable'}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {assessment.assessment.description ??
                            'Completed assessment saved in your client workspace.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${tone.badge}`}>{tone.label}</span>
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600">
                          {new Date(assessment.completedAt).toLocaleDateString()}
                        </span>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          onClick={() => router.push('/client/assessments/phq9')}
                          type="button"
                        >
                          Retake
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                📝
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">No assessments completed yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Start with PHQ-9 if you want a gentle check-in on how you have been feeling over the last two weeks.
              </p>
              <button
                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() => router.push('/client/assessments/phq9')}
                type="button"
              >
                Start PHQ-9
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
