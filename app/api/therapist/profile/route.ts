import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const therapistProfile = await prisma.practitionerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!therapistProfile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
    }

    return NextResponse.json(therapistProfile)
  } catch (error) {
    console.error('Error fetching therapist profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
