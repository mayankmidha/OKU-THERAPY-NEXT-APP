import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PRACTITIONER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const clients = await prisma.appointment.findMany({
      where: {
        practitionerId: session.user.id,
        status: {
          in: ['SCHEDULED', 'COMPLETED']
        }
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            clientProfile: {
              select: {
                dateOfBirth: true,
                gender: true,
                medicalHistory: true
              }
            }
          }
        }
      },
      distinct: ['clientId'],
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching practitioner clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
