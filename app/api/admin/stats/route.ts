import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total users by role
    const [totalUsers, totalClients, totalPractitioners] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PRACTITIONER' } })
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

    const totalRevenue = completedAppointments.reduce((sum: number, apt: any) => {
      const appointmentTotal = apt.payments.reduce((aptSum: number, payment: any) => aptSum + (payment?.amount || 0), 0)
      return sum + appointmentTotal
    }, 0)

    return NextResponse.json({
      totalUsers,
      totalClients,
      totalPractitioners,
      totalAppointments,
      totalRevenue
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
