import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.booking.findMany({
      where: {
        clientId: session.user.id,
        startTime: {
          gte: new Date()
        },
        status: 'SCHEDULED'
      },
      include: {
        therapist: {
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
    console.error('Error fetching client sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
