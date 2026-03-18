'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const assessments = [
  {
    id: 'phq9',
    title: 'PHQ-9 Depression Assessment',
    description: 'Screen for depression symptoms over the past 2 weeks',
    duration: '5 minutes',
    questions: 9,
    icon: '😔',
    color: 'blue'
  },
  {
    id: 'gad7',
    title: 'GAD-7 Anxiety Assessment',
    description: 'Assess anxiety severity and its impact on daily life',
    duration: '5 minutes',
    questions: 7,
    icon: '😰',
    color: 'yellow'
  },
  {
    id: 'dass21',
    title: 'DASS-21 Depression, Anxiety, and Stress Scale',
    description: 'Comprehensive assessment of mental health symptoms',
    duration: '10 minutes',
    questions: 21,
    icon: '📊',
    color: 'purple'
  },
  {
    id: 'adhd',
    title: 'ADHD Self-Assessment',
    description: 'Screen for symptoms of ADHD in adults',
    duration: '10 minutes',
    questions: 18,
    icon: '🧠',
    color: 'orange'
  },
  {
    id: 'ptsd',
    title: 'PTSD Screening',
    description: 'Assess symptoms related to traumatic events',
    duration: '8 minutes',
    questions: 5,
    icon: '⚡',
    color: 'red'
  }
]

export default function AssessmentsPage() {
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAssessmentHistory()
  }, [])

  const fetchAssessmentHistory = async () => {
    try {
      const response = await fetch('/api/client/assessments')
      if (response.ok) {
        const data = await response.json()
        setCompletedAssessments(data)
      }
    } catch (error) {
      console.error('Error fetching assessment history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartAssessment = (assessmentId: string) => {
    router.push(`/client/assessments/${assessmentId}`)
  }

  const getLatestScore = (assessmentId: string) => {
    const assessment = completedAssessments.find((a: any) => a.assessment?.title?.includes(assessmentId.toUpperCase()))
    return assessment && typeof assessment.score === 'number' ? assessment.score : null
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score !== null && score <= 4) return 'text-green-600'
    if (score !== null && score <= 9) return 'text-yellow-600'
    if (score !== null && score <= 14) return 'text-orange-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/client/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Assessments</h1>
          <p className="text-gray-600 text-lg">
            Take evidence-based assessments to better understand your mental health and track your progress over time.
          </p>
        </div>

        {/* Available Assessments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
              onClick={() => handleStartAssessment(assessment.id)}
            >
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{assessment.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                  <p className="text-sm text-gray-600">{assessment.duration}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{assessment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{assessment.questions} questions</span>
                <button className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                  assessment.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  assessment.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  assessment.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                  assessment.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}>
                  Start Assessment
                </button>
              </div>
              {getLatestScore(assessment.id) !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Latest Score:</span>
                    <span className={`font-bold ${getScoreColor(getLatestScore(assessment.id)!)}`}>
                      {getLatestScore(assessment.id)}/27
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Assessment History */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment History</h2>
          {completedAssessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedAssessments.map((assessment: any) => (
                    <tr key={assessment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.assessment?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assessment.score !== null && assessment.score !== undefined ? getScoreColor(assessment.score) : 'text-gray-400'
                        }`}>
                          {assessment.score !== null && assessment.score !== undefined ? assessment.score : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assessment.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleStartAssessment(assessment.id)}
                          className="text-blue-600 hover:text-blue-900"
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
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <p className="text-gray-600 text-lg mb-4">No assessments completed yet</p>
              <p className="text-gray-600">Take your first assessment to establish a baseline for your mental health journey.</p>
              <button
                onClick={() => router.push('/client/assessments/phq9')}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
