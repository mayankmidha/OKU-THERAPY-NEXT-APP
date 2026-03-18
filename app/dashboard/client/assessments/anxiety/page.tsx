'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const anxietyQuestions = [
  {
    id: 1,
    question: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 2,
    question: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 3,
    question: "Over the last 2 weeks, how often have you been bothered by worrying too much about different things?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 4,
    question: "Over the last 2 weeks, how often have you been bothered by trouble relaxing?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 5,
    question: "Over the last 2 weeks, how often have you been bothered by being so restless that it's hard to sit still?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 6,
    question: "Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  {
    id: 7,
    question: "Over the last 2 weeks, how often have you been bothered by feeling afraid, as if something awful might happen?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  }
]

export default function AnxietyAssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{score: number, severity: any} | null>(null)
  const router = useRouter()

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex })
  }

  const calculateScore = () => {
    let totalScore = 0
    Object.values(answers).forEach(value => {
      totalScore += value
    })
    return totalScore
  }

  const getSeverityLevel = (score: number) => {
    if (score <= 4) return { level: 'Minimal', color: 'green', description: 'Little to no anxiety' }
    if (score <= 9) return { level: 'Mild', color: 'yellow', description: 'Some anxiety symptoms' }
    if (score <= 14) return { level: 'Moderate', color: 'orange', description: 'Significant anxiety symptoms' }
    return { level: 'Severe', color: 'red', description: 'Severe anxiety symptoms' }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < anxietyQuestions.length) {
      alert('Please answer all questions')
      return
    }

    setIsLoading(true)
    const score = calculateScore()
    const severity = getSeverityLevel(score)

    try {
      const response = await fetch('/api/client/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ANXIETY',
          responses: answers,
          score: score,
          result: severity.level,
          interpretation: severity.description
        }),
      })

      if (response.ok) {
        setResult({ score, severity })
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
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

        <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Anxiety Assessment Results</h1>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`text-6xl mb-4 text-${result.severity.color}-600`}>
                    {result.severity.level === 'Minimal' ? '😊' : 
                     result.severity.level === 'Mild' ? '😐' : 
                     result.severity.level === 'Moderate' ? '😟' : '😢'}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.severity.level} Anxiety</h2>
                  <p className="text-gray-600 mb-4">Score: {result.score}/21</p>
                  <p className="text-gray-700">{result.severity.description}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">What this means:</h3>
                  <p className="text-blue-800 text-sm">
                    {result.severity.level === 'Minimal' && 'Your anxiety levels are within the normal range. Continue practicing self-care and healthy coping strategies.'}
                    {result.severity.level === 'Mild' && 'You may be experiencing some anxiety symptoms. Consider stress management techniques and self-care practices.'}
                    {result.severity.level === 'Moderate' && 'Your anxiety symptoms may be impacting your daily life. Consider speaking with a mental health professional.'}
                    {result.severity.level === 'Severe' && 'Your anxiety symptoms appear to be severe. We strongly recommend consulting with a mental health professional for support.'}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Link
                    href="/dashboard/client/book"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
                  >
                    Book a Session
                  </Link>
                  <Link
                    href="/dashboard/client/assessments"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
                  >
                    More Assessments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/client/assessments" className="text-blue-600 hover:text-blue-800">
                ← Back to Assessments
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">GAD-7 Anxiety Assessment</h1>
                <span className="text-sm text-gray-600">
                  {currentQuestion + 1} / {anxietyQuestions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / anxietyQuestions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {anxietyQuestions[currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {anxietyQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(anxietyQuestions[currentQuestion].id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        answers[anxietyQuestions[currentQuestion].id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentQuestion === anxietyQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || Object.keys(answers).length < anxietyQuestions.length}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Get Results'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(anxietyQuestions.length - 1, currentQuestion + 1))}
                    disabled={!answers[anxietyQuestions[currentQuestion].id]}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
