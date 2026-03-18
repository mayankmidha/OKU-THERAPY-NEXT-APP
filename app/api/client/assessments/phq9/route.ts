import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers, score, result, interpretation } = await req.json()

    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    // Find or create PHQ-9 assessment
    let assessment = await prisma.assessment.findFirst({
      where: {
        title: 'PHQ-9 Depression Assessment'
      }
    })

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          title: 'PHQ-9 Depression Assessment',
          description: 'Patient Health Questionnaire-9 for depression screening',
          questions: phq9Questions
        }
      })
    }

    // Create assessment answer
    const assessmentAnswer = await prisma.assessmentAnswer.create({
      data: {
        userId: session.user.id,
        assessmentId: assessment.id,
        answers,
        score,
        completedAt: new Date()
      }
    })

    return NextResponse.json(assessmentAnswer)
  } catch (error) {
    console.error('Error submitting PHQ-9 assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PHQ-9 questions for reference
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
  // ... (other questions would be included in full implementation)
]
