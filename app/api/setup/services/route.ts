import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Create default services
    const services = await prisma.service.createMany({
      data: [
        {
          name: 'Individual Therapy Session',
          description: 'One-on-one therapy session with a licensed therapist',
          duration: 60,
          price: 120
        },
        {
          name: 'Initial Consultation',
          description: 'First-time consultation to assess your needs and match with a therapist',
          duration: 90,
          price: 150
        },
        {
          name: 'Couples Therapy',
          description: 'Therapy session for couples to work on relationship issues',
          duration: 90,
          price: 180
        },
        {
          name: 'Group Therapy',
          description: 'Small group therapy session focused on specific topics',
          duration: 120,
          price: 80
        },
        {
          name: 'Family Therapy',
          description: 'Family therapy session to improve communication and resolve conflicts',
          duration: 90,
          price: 200
        }
      ],
      skipDuplicates: true
    })

    return NextResponse.json({ 
      message: 'Default services created successfully',
      count: services.count 
    })
  } catch (error) {
    console.error('Error creating default services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
