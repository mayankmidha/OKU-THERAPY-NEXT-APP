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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        practitionerId: session.user.id,
        startTime: {
          gte: today,
          lt: tomorrow
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
                gender: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Calculate week stats
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const weekAppointments = await prisma.appointment.findMany({
      where: {
        practitionerId: session.user.id,
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      select: {
        clientId: true
      }
    })

    const completedThisWeek = await prisma.appointment.count({
      where: {
        practitionerId: session.user.id,
        status: 'COMPLETED',
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    })

    // Get unique clients this week
    const uniqueClients = new Set(weekAppointments.map((appointment) => appointment.clientId))
    const activeClients = uniqueClients.size

    return NextResponse.json({
      todays: todaysAppointments,
      stats: {
        appointments: weekAppointments.length,
        completed: completedThisWeek,
        clients: activeClients
      }
    })
  } catch (error) {
    console.error('Error fetching practitioner appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
