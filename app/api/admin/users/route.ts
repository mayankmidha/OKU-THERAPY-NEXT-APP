import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AdminUserRecord = {
  createdAt: Date
  email: string
  id: string
  name: string | null
  practitionerProfile: {
    isVerified: boolean
  } | null
  role: 'ADMIN' | 'CLIENT' | 'PRACTITIONER'
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

    const users = await prisma.user.findMany({
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        practitionerProfile: {
          select: {
            isVerified: true,
          },
        },
        role: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, verified } = (await req.json()) as {
      userId?: string
      verified?: boolean
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Verification state must be a boolean' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.practitionerProfile.update({
      where: {
        userId: userId
      },
      data: {
        isVerified: verified
      }
    })

    return NextResponse.json(updatedUser as AdminUserRecord['practitionerProfile'])
  } catch (error) {
    console.error('Error updating user verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
