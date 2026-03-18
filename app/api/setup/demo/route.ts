import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash('demo123', 12)

    // Create demo client
    const clientUser = await prisma.user.upsert({
      where: { email: 'client@demo.com' },
      update: {},
      create: {
        email: 'client@demo.com',
        name: 'Demo Client',
        password: hashedPassword,
        role: 'CLIENT',
        clientProfile: {
          create: {
            dateOfBirth: new Date('1990-01-01'),
            gender: 'OTHER',
            phoneNumber: '+1234567890',
            address: '123 Demo Street, Demo City, DC 20001',
            emergencyContact: 'Emergency Contact',
            emergencyPhone: '+1987654321',
            insuranceProvider: 'Demo Insurance',
            insuranceId: 'DEMO123',
          }
        }
      }
    })

    // Create demo practitioner
    const practitionerUser = await prisma.user.upsert({
      where: { email: 'practitioner@demo.com' },
      update: {},
      create: {
        email: 'practitioner@demo.com',
        name: 'Dr. Demo Therapist',
        password: hashedPassword,
        role: 'PRACTITIONER',
        practitionerProfile: {
          create: {
            licenseNumber: 'DEMO-LICENSE-123',
            specialization: 'General Therapy',
            experience: '5 years',
            education: 'PhD in Clinical Psychology',
            bio: 'Experienced therapist specializing in anxiety, depression, and relationship counseling.',
            consultationFee: 150,
            isVerified: true,
            languages: ['English'],
          }
        }
      }
    })

    // Create demo admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        name: 'Demo Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    // Create demo services
    const services = [
      {
        name: 'Individual Therapy Session',
        description: 'One-on-one therapy session with licensed practitioner',
        duration: 60,
        price: 150.00,
        isActive: true
      },
      {
        name: 'Initial Consultation',
        description: 'First-time consultation and assessment',
        duration: 90,
        price: 200.00,
        isActive: true
      },
      {
        name: 'Follow-up Session',
        description: 'Follow-up therapy session',
        duration: 45,
        price: 120.00,
        isActive: true
      }
    ]

    for (const service of services) {
      await prisma.service.upsert({
        where: { name: service.name },
        update: {},
        create: service
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users created successfully!',
      users: [
        { email: 'client@demo.com', password: 'demo123', role: 'CLIENT' },
        { email: 'practitioner@demo.com', password: 'demo123', role: 'PRACTITIONER' },
        { email: 'admin@demo.com', password: 'demo123', role: 'ADMIN' }
      ]
    })
  } catch (error) {
    console.error('Demo setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create demo users' },
      { status: 500 }
    )
  }
}
