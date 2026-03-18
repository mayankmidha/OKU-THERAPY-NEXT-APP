import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sessions = await prisma.appointment.findMany({
      where: {
        practitionerId: session.user.id,
        startTime: {
          gte: today,
          lt: tomorrow
        },
        status: 'SCHEDULED'
      },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        },
        service: {
          select: {
            name: true,
            duration: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching therapist sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
