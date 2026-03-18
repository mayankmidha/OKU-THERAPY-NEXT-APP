import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phone } = await req.json()
    const normalizedRole = String(role ?? '').toUpperCase()

    if (!email || !password || !normalizedRole) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role supplied' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizedRole as UserRole,
        phone: phone || null
      }
    })

    // Create role-specific profile
    if (normalizedRole === 'CLIENT') {
      await prisma.clientProfile.create({
        data: {
          userId: user.id
        }
      })
    } else if (normalizedRole === 'PRACTITIONER') {
      await prisma.practitionerProfile.create({
        data: {
          userId: user.id,
          specialization: [],
          isVerified: false // Requires admin verification
        }
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
