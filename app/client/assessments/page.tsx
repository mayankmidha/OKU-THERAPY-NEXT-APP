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
    description: 'A quick, evidence-based screening for depression symptoms over the past two weeks.',
    duration: '5 minutes',
    questions: 9,
    icon: '📝',
  },
] as const

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

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
      return 'text-gray-400'
    }

    if (score <= 4) {
      return 'text-green-600'
    }

    if (score <= 9) {
      return 'text-yellow-600'
    }

    if (score <= 14) {
      return 'text-orange-600'
    }

    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link className="font-medium text-blue-600 hover:text-blue-800" href="/client/dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Mental Health Assessments</h1>
          <p className="text-lg text-gray-600">
            Phase 1 keeps assessments focused on PHQ-9 so the client experience stays production-buildable.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {availableAssessments.map((assessment) => (
            <button
              className="rounded-lg bg-white p-6 text-left shadow-lg transition hover:shadow-xl"
              key={assessment.id}
              onClick={() => router.push('/client/assessments/phq9')}
              type="button"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-4 text-4xl">{assessment.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                  <p className="text-sm text-gray-600">{assessment.duration}</p>
                </div>
              </div>

              <p className="mb-4 text-gray-700">{assessment.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{assessment.questions} questions</span>
                <span className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  Start Assessment
                </span>
              </div>

              {latestPhq9Score !== null && latestPhq9Score !== undefined ? (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Latest score</span>
                    <span className={`font-bold ${getScoreColor(latestPhq9Score)}`}>
                      {latestPhq9Score}/27
                    </span>
                  </div>
                </div>
              ) : null}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Assessment History</h2>
          {completedAssessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {completedAssessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{assessment.assessment.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={getScoreColor(assessment.score)}>
                          {assessment.score !== null ? assessment.score : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(assessment.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => router.push('/client/assessments/phq9')}
                          type="button"
                        >
                          Retake
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-4 text-5xl text-gray-300">📝</div>
              <p className="text-lg text-gray-600">No assessments completed yet.</p>
              <button
                className="mt-6 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
                onClick={() => router.push('/client/assessments/phq9')}
                type="button"
              >
                Start PHQ-9 Assessment
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
