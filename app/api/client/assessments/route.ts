import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, responses, score, result, interpretation } = await req.json()

    if (!type || !responses) {
      return NextResponse.json(
        { error: 'Type and responses are required' },
        { status: 400 }
      )
    }

    const assessment = await prisma.assessment.create({
      data: {
        clientId: session.user.id,
        type,
        responses,
        score,
        result,
        interpretation
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
