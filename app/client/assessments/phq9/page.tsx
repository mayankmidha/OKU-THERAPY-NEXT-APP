'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const phq9Questions = [
  {
    id: 1,
    question: "Little interest or pleasure in doing things",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 2,
    question: "Feeling down, depressed, or hopeless",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 3,
    question: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 4,
    question: "Feeling tired or having little energy",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 5,
    question: "Poor appetite or overeating",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 6,
    question: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 7,
    question: "Trouble concentrating on things, such as reading the newspaper or watching television",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 8,
    question: "Moving or speaking so slowly that other people could have noticed",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  },
  {
    id: 9,
    question: "Thoughts that you would be better off dead, or of hurting yourself in some way",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 }
    ]
  }
]

export default function PHQ9Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  type SeverityLevel = {
  level: string;
  color: string;
  description: string;
}

type ResultType = {
  score: number | null;
  severity: SeverityLevel | null;
};

const [result, setResult] = useState<ResultType | null>(null);
  const router = useRouter()

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getSeverityLevel = (score: number) => {
    if (score <= 4) return { level: 'Minimal', color: 'green', description: 'Little to no depression' }
    if (score <= 9) return { level: 'Mild', color: 'yellow', description: 'Mild depression symptoms' }
    if (score <= 14) return { level: 'Moderate', color: 'orange', description: 'Moderate depression symptoms' }
    if (score <= 19) return { level: 'Moderately Severe', color: 'red', description: 'Moderately severe depression symptoms' }
    return { level: 'Severe', color: 'red', description: 'Severe depression symptoms' }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < phq9Questions.length) {
      alert('Please answer all questions')
      return
    }

    setIsLoading(true)
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
          interpretation: severity.description
        }),
      })

      if (response.ok) {
        const severityData = {
          level: severity.level,
          color: severity.color,
          description: severity.description
        }
        setResult(prev => ({ ...prev, score, severity: severityData }))
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${result.severity?.color === 'green' ? 'text-green-500' : result.severity?.color === 'yellow' ? 'text-yellow-500' : result.severity?.color === 'red' ? 'text-red-500' : 'text-gray-500'}`}>
              {result.severity?.level === 'Minimal' ? '😊' : 
               result.severity?.level === 'Mild' ? '😐' : 
               result.severity?.level === 'Moderate' ? '😟' : '😢'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.severity?.level} Depression</h2>
            <p className="text-gray-600 mb-4">Score: {result?.score}/27</p>
            <p className="text-gray-700 mb-6">{result.severity?.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What this means:</h3>
              <p className="text-blue-800 text-sm">
                {result.severity?.level === 'Minimal' && 'Your depression levels are within the normal range. Continue practicing self-care and healthy coping strategies.'}
                {result.severity?.level === 'Mild' && 'You may be experiencing some depression symptoms. Consider stress management techniques and self-care practices.'}
                {result.severity?.level === 'Moderate' && 'Your depression symptoms may be impacting your daily life. Consider speaking with a mental health professional.'}
                {result.severity?.level === 'Moderately Severe' && 'Your depression symptoms appear to be significant. We strongly recommend consulting with a mental health professional.'}
                {result.severity?.level === 'Severe' && 'Your depression symptoms appear to be severe. Please seek immediate professional help.'}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/client/book-appointment')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Book Appointment
              </button>
            </div>
          </div>
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
              <Link href="/client/assessments" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Assessments
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">PHQ-9 Depression Assessment</h1>
          <p className="text-gray-600 mb-8">
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {phq9Questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / phq9Questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / phq9Questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion + 1}. {phq9Questions[currentQuestion].question}
            </h3>
            <div className="space-y-3">
              {phq9Questions[currentQuestion].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(phq9Questions[currentQuestion].id, option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    answers[phq9Questions[currentQuestion].id] === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestion === phq9Questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Get Results'
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={!answers[phq9Questions[currentQuestion].id]}
                className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
