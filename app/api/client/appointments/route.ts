import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: session.user.id,
        startTime: {
          gte: new Date()
        },
        status: {
          in: ['SCHEDULED', 'RESCHEDULED']
        }
      },
      include: {
        practitioner: {
          select: {
            name: true,
            email: true,
            practitionerProfile: {
              select: {
                specialization: true,
                hourlyRate: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    const completedCount = await prisma.appointment.count({
      where: {
        clientId: session.user.id,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      upcoming: appointments,
      completed: completedCount
    })
  } catch (error) {
    console.error('Error fetching client appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { practitionerId, startTime, notes } = await req.json()

    if (!practitionerId || !startTime) {
      return NextResponse.json(
        { error: 'Practitioner and start time are required' },
        { status: 400 }
      )
    }

    // Get practitioner to determine duration (default 60 minutes)
    const practitioner = await prisma.user.findUnique({
      where: { id: practitionerId },
      include: {
        practitionerProfile: true
      }
    })

    if (!practitioner || practitioner.role !== 'PRACTITIONER') {
      return NextResponse.json({ error: 'Invalid practitioner' }, { status: 404 })
    }

    const duration = practitioner.practitionerProfile?.hourlyRate ? 60 : 60 // Default 60 minutes
    const startDateTime = new Date(startTime)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    // Create appointment with default service
    const defaultService = await prisma.service.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const serviceId = defaultService?.id || 'default-service-id'

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        practitionerId,
        serviceId,
        startTime: startDateTime,
        endTime: endDateTime,
        notes: notes || '',
        status: 'SCHEDULED'
      },
      include: {
        practitioner: {
          select: {
            name: true,
            email: true,
            practitionerProfile: {
              select: {
                specialization: true,
                hourlyRate: true
              }
            }
          }
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
