'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const assessments = [
  {
    id: 'anxiety',
    title: 'GAD-7 Anxiety Assessment',
    description: 'Assess your anxiety symptoms over the past 2 weeks',
    icon: '😰',
    duration: '5 minutes',
    questions: 7
  },
  {
    id: 'depression',
    title: 'PHQ-9 Depression Assessment',
    description: 'Evaluate symptoms of depression',
    icon: '😔',
    duration: '5 minutes',
    questions: 9
  },
  {
    id: 'adhd',
    title: 'ADHD Self-Assessment',
    description: 'Screen for symptoms of ADHD in adults',
    icon: '🧠',
    duration: '10 minutes',
    questions: 18
  },
  {
    id: 'burnout',
    title: 'Burnout Assessment',
    description: 'Check for signs of professional burnout',
    icon: '🔥',
    duration: '7 minutes',
    questions: 10
  },
  {
    id: 'trauma',
    title: 'PTSD Screening',
    description: 'Assess symptoms related to traumatic events',
    icon: '⚡',
    duration: '8 minutes',
    questions: 5
  }
]

export default function AssessmentsPage() {
  const router = useRouter()

  const handleAssessmentClick = (assessmentId: string) => {
    router.push(`/dashboard/client/assessments/${assessmentId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/client" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mental Health Assessments</h1>
            <p className="text-gray-600 mt-2">
              Take evidence-based assessments to better understand your mental health. 
              These tools can help you track symptoms and identify areas where you might benefit from support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAssessmentClick(assessment.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{assessment.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {assessment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {assessment.duration}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {assessment.questions} questions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Note</h3>
            <p className="text-blue-800 text-sm">
              These assessments are screening tools and not diagnostic instruments. 
              They can help you identify potential concerns but should not replace professional medical advice. 
              If you're experiencing severe symptoms or are in crisis, please seek immediate professional help or contact emergency services.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
