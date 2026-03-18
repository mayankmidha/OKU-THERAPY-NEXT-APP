import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDemoData } from '@/lib/demo-data'

export async function POST() {
  try {
    const result = await seedDemoData(prisma)

    return NextResponse.json({
      success: true,
      message: 'Demo users created successfully!',
      users: result.credentials
    })
  } catch (error) {
    console.error('Demo setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create demo users' },
      { status: 500 }
    )
  }
}
