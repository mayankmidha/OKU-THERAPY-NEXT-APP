import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assessmentAnswers = await prisma.assessmentAnswer.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        assessment: {
          select: {
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return NextResponse.json(assessmentAnswers)
  } catch (error) {
    console.error('Error fetching client assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
