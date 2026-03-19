import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AdminStatsResponse = {
  pendingPractitioners: number
  totalAppointments: number
  totalClients: number
  totalPractitioners: number
  totalRevenue: number
  totalUsers: number
  verifiedPractitioners: number
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users by role
    const [totalUsers, totalClients, totalPractitioners, verifiedPractitioners, pendingPractitioners] =
      await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PRACTITIONER' } }),
      prisma.practitionerProfile.count({ where: { isVerified: true } }),
      prisma.practitionerProfile.count({ where: { isVerified: false } }),
    ])

    // Get total appointments
    const totalAppointments = await prisma.appointment.count()

    // Get total revenue (completed appointments with payments)
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        payments: true
      }
    })

    const totalRevenue = completedAppointments.reduce((sum, appointment) => {
      const appointmentTotal = appointment.payments.reduce((paymentSum, payment) => {
        return paymentSum + payment.amount
      }, 0)
      return sum + appointmentTotal
    }, 0)

    const payload: AdminStatsResponse = {
      pendingPractitioners,
      totalAppointments,
      totalUsers,
      totalClients,
      totalPractitioners,
      totalRevenue,
      verifiedPractitioners,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
