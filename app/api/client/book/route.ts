import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all available services
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get approved therapists
    const therapists = await prisma.therapistProfile.findMany({
      where: {
        isApproved: true,
        user: {
          role: 'THERAPIST'
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      services,
      therapists
    })
  } catch (error) {
    console.error('Error fetching booking data:', error)
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

    const { therapistId, serviceId, startTime, notes } = await req.json()

    if (!therapistId || !serviceId || !startTime) {
      return NextResponse.json(
        { error: 'Therapist, service, and start time are required' },
        { status: 400 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const startDateTime = new Date(startTime)
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000)

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        therapistId,
        serviceId,
        startTime: startDateTime,
        endTime: endDateTime,
        notes: notes || '',
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
            duration: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
