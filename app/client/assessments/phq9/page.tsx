'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type SeverityLevel = 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe'

type AssessmentResult = {
  score: number
  severity: {
    color: 'emerald' | 'amber' | 'orange' | 'rose' | 'red'
    description: string
    level: SeverityLevel
    nextStep: string
  }
}

type Question = {
  id: number
  question: string
  guidance: string
}

const phq9Questions: Question[] = [
  {
    id: 1,
    question: 'Little interest or pleasure in doing things',
    guidance: 'Think about the last 2 weeks, not just today.',
  },
  {
    id: 2,
    question: 'Feeling down, depressed, or hopeless',
    guidance: 'Choose the answer that best reflects how often this has felt true.',
  },
  {
    id: 3,
    question: 'Trouble falling or staying asleep, or sleeping too much',
    guidance: 'Include both difficulty falling asleep and sleeping more than usual.',
  },
  {
    id: 4,
    question: 'Feeling tired or having little energy',
    guidance: 'This can include physical tiredness and emotional exhaustion.',
  },
  {
    id: 5,
    question: 'Poor appetite or overeating',
    guidance: 'Either change in appetite counts here.',
  },
  {
    id: 6,
    question: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
    guidance: 'Answer as honestly as you can. There is no right or wrong response.',
  },
  {
    id: 7,
    question: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    guidance: 'This may show up as difficulty focusing, finishing tasks, or staying present.',
  },
  {
    id: 8,
    question: 'Moving or speaking so slowly that other people could have noticed',
    guidance: 'If others might have noticed a change, include that in your answer.',
  },
  {
    id: 9,
    question: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
    guidance: 'Please answer carefully. Support resources are available after you finish.',
  },
]

const answerOptions = [
  { text: 'Not at all', value: 0 },
  { text: 'Several days', value: 1 },
  { text: 'More than half the days', value: 2 },
  { text: 'Nearly every day', value: 3 },
] as const

const supportLines = [
  'This screen is a self-check, not a diagnosis.',
  'Take your time and answer based on the last 2 weeks.',
  'If you feel unsafe, reach out to local emergency services or a trusted person right away.',
]

function getSeverityLevel(score: number): AssessmentResult['severity'] {
  if (score <= 4) {
    return {
      level: 'Minimal',
      color: 'emerald',
      description: 'Your answers suggest very few depressive symptoms right now.',
      nextStep: 'Continue with the care routine that is already supporting you, and revisit this check-in whenever you need it.',
    }
  }

  if (score <= 9) {
    return {
      level: 'Mild',
      color: 'amber',
      description: 'Your answers suggest some depressive symptoms that may be worth watching.',
      nextStep: 'A brief conversation with a practitioner can help you sort through what is happening and what support would help most.',
    }
  }

  if (score <= 14) {
    return {
      level: 'Moderate',
      color: 'orange',
      description: 'Your answers suggest symptoms that may be affecting your daily life.',
      nextStep: 'Booking a session soon is a good next step so a practitioner can help you review patterns, stressors, and support options.',
    }
  }

  if (score <= 19) {
    return {
      level: 'Moderately Severe',
      color: 'rose',
      description: 'Your answers suggest more significant depressive symptoms that deserve prompt attention.',
      nextStep: 'We recommend booking with a practitioner as soon as possible so you can get support and discuss the right care plan.',
    }
  }

  return {
    level: 'Severe',
    color: 'red',
    description: 'Your answers suggest severe depressive symptoms and we want you to get support quickly.',
    nextStep: 'Please seek professional help as soon as possible. If you feel at risk of harming yourself, contact emergency services or a trusted person immediately.',
  }
}

export default function PHQ9Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const router = useRouter()

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const calculateScore = () => Object.values(answers).reduce((sum, value) => sum + value, 0)

  const handleSubmit = async () => {
    if (Object.keys(answers).length < phq9Questions.length) {
      setSubmitError('Please answer all 9 questions to continue.')
      return
    }

    setIsLoading(true)
    setSubmitError('')

    const score = calculateScore()
    const severity = getSeverityLevel(score)

    try {
      const response = await fetch('/api/client/assessments/phq9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          score,
          result: severity.level,
          interpretation: severity.description,
        }),
      })

      if (!response.ok) {
        setSubmitError('We could not save your assessment right now. Please try again.')
        return
      }

      setResult({
        score,
        severity,
      })
    } catch {
      setSubmitError('Something went wrong while saving your assessment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const progress = Math.round(((currentQuestion + 1) / phq9Questions.length) * 100)
  const activeQuestion = phq9Questions[currentQuestion]
  const selectedAnswer = answers[activeQuestion.id]

  if (result) {
    const severityColorClasses = {
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      amber: 'border-amber-200 bg-amber-50 text-amber-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      rose: 'border-rose-200 bg-rose-50 text-rose-700',
      red: 'border-red-200 bg-red-50 text-red-700',
    } as const

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(240,249,255,0.95),_rgba(248,250,252,1)_45%,_rgba(241,245,249,1)_100%)] text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="mb-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                Assessment saved
              </div>

              <div className={`rounded-[24px] border p-6 ${severityColorClasses[result.severity.color]}`}>
                <p className="text-sm font-medium uppercase tracking-[0.18em]">{result.severity.level} range</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your PHQ-9 score is {result.score}/27
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7">{result.severity.description}</p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">What this means</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{result.severity.nextStep}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-medium text-slate-500">Good next step</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    If you want to talk through this score, book a session and share that you just completed the PHQ-9.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-semibold text-rose-800">Need immediate help?</p>
                <p className="mt-2 text-sm leading-6 text-rose-900">
                  If you feel at risk of harming yourself or someone else, contact local emergency services now or go to the nearest emergency department.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/client/dashboard')}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  type="button"
                >
                  Back to dashboard
                </button>
                <button
                  onClick={() => router.push('/client/book-appointment')}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  type="button"
                >
                  Book a session
                </button>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-[28px] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Support first</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">You do not have to carry this alone.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  This result is meant to help you notice patterns, not label you. A practitioner can help you understand the score in context.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <h3 className="text-lg font-semibold text-slate-900">Recommended next step</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{result.severity.nextStep}</p>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  If you want help translating this score into a care plan, we can connect you with a practitioner.
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(233,245,255,0.9),_rgba(248,250,252,1)_40%,_rgba(241,245,249,1)_100%)] text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/client/assessments"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
          >
            Back to assessments
          </Link>
          <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Confidential self-check
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">PHQ-9 assessment</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A calm, private check-in for how you have been feeling.</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Answer based on the last 2 weeks. You can move at your own pace, and you will see supportive next steps at the end.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {supportLines.map((line) => (
                  <div key={line} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Question {currentQuestion + 1} of {phq9Questions.length}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Current question</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {currentQuestion + 1}. {activeQuestion.question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{activeQuestion.guidance}</p>

              <div className="mt-6 space-y-3">
                {answerOptions.map((option) => {
                  const isSelected = selectedAnswer === option.value

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(activeQuestion.id, option.value)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      type="button"
                    >
                      <span className="font-medium">{option.text}</span>
                      <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        Select
                      </span>
                    </button>
                  )
                })}
              </div>

              {submitError ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {submitError}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setCurrentQuestion((current) => Math.max(0, current - 1))}
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  Previous
                </button>

                {currentQuestion === phq9Questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                  >
                    {isLoading ? 'Saving assessment...' : 'See results'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion((current) => Math.min(phq9Questions.length - 1, current + 1))}
                    disabled={selectedAnswer === undefined}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">How to use this</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Be honest, not perfect.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your answers help us understand what support might be useful. You can finish in a few minutes and revisit the screen anytime.
              </p>
            </div>

            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Safety note</p>
              <h3 className="mt-3 text-lg font-semibold text-rose-950">If you are in immediate danger</h3>
              <p className="mt-3 text-sm leading-6 text-rose-900">
                Contact local emergency services or a trusted person right away. This assessment is not a substitute for urgent help.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_16px_50px_rgba(15,23,42,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Next step</p>
              <h3 className="mt-3 text-lg font-semibold">If this score feels heavy, book a conversation next.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                A practitioner can help interpret the result and turn it into a practical care plan.
              </p>
              <button
                onClick={() => router.push('/client/book-appointment')}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                type="button"
              >
                Book appointment
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
