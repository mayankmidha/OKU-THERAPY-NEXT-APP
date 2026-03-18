import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientBookings = await prisma.booking.findMany({
      where: {
        therapistId: session.user.id,
        status: {
          in: ['SCHEDULED', 'COMPLETED']
        }
      },
      select: {
        clientId: true
      }
    })

    const uniqueClients = new Set(clientBookings.map((booking: any) => booking.clientId))
    const clientCount = uniqueClients.size

    return NextResponse.json({ count: clientCount })
  } catch (error) {
    console.error('Error fetching client count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
