import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mood, notes, tags } = await req.json()

    if (!mood || mood < 1 || mood > 10) {
      return NextResponse.json(
        { error: 'Mood must be between 1 and 10' },
        { status: 400 }
      )
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        clientId: session.user.id,
        mood: parseInt(mood),
        notes: notes || '',
        tags: tags || []
      }
    })

    return NextResponse.json(moodEntry)
  } catch (error) {
    console.error('Error creating mood entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
