import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const practitioners = await prisma.user.findMany({
      where: {
        role: 'PRACTITIONER',
        practitionerProfile: {
          isVerified: true
        }
      },
      include: {
        practitionerProfile: {
          select: {
            specialization: true,
            bio: true,
            hourlyRate: true,
            licenseNumber: true
          }
        }
      }
    })

    return NextResponse.json(practitioners)
  } catch (error) {
    console.error('Error fetching practitioners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
