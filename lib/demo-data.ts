import type { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const demoCredentials: Array<{ email: string; password: string; role: UserRole }> = [
  { email: 'client@demo.com', password: 'demo123', role: 'CLIENT' },
  { email: 'practitioner@demo.com', password: 'demo123', role: 'PRACTITIONER' },
  { email: 'admin@demo.com', password: 'demo123', role: 'ADMIN' },
]

const demoServices = [
  {
    name: 'Individual Therapy Session',
    description: 'One-on-one therapy session with a licensed practitioner.',
    duration: 60,
    price: 150,
    isActive: true,
  },
  {
    name: 'Initial Consultation',
    description: 'Introductory consultation to understand goals and next steps.',
    duration: 90,
    price: 200,
    isActive: true,
  },
  {
    name: 'Follow-up Session',
    description: 'Shorter follow-up session for continuity of care.',
    duration: 45,
    price: 120,
    isActive: true,
  },
] as const

const phq9Questions = [
  {
    id: 1,
    question: 'Little interest or pleasure in doing things',
    options: [
      { text: 'Not at all', value: 0 },
      { text: 'Several days', value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day', value: 3 },
    ],
  },
  {
    id: 2,
    question: 'Feeling down, depressed, or hopeless',
    options: [
      { text: 'Not at all', value: 0 },
      { text: 'Several days', value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day', value: 3 },
    ],
  },
  {
    id: 3,
    question: 'Trouble falling or staying asleep, or sleeping too much',
    options: [
      { text: 'Not at all', value: 0 },
      { text: 'Several days', value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day', value: 3 },
    ],
  },
] as const

export async function seedDemoData(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: {
      name: 'Demo Client',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1234567890',
    },
    create: {
      email: 'client@demo.com',
      name: 'Demo Client',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1234567890',
    },
  })

  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {
      dateOfBirth: new Date('1990-01-01'),
      gender: 'OTHER',
      medicalHistory: 'Demo client profile used for local development and QA.',
    },
    create: {
      userId: clientUser.id,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'OTHER',
      medicalHistory: 'Demo client profile used for local development and QA.',
    },
  })

  const practitionerUser = await prisma.user.upsert({
    where: { email: 'practitioner@demo.com' },
    update: {
      name: 'Dr. Demo Practitioner',
      password: hashedPassword,
      role: 'PRACTITIONER',
      phone: '+1234567891',
    },
    create: {
      email: 'practitioner@demo.com',
      name: 'Dr. Demo Practitioner',
      password: hashedPassword,
      role: 'PRACTITIONER',
      phone: '+1234567891',
    },
  })

  await prisma.practitionerProfile.upsert({
    where: { userId: practitionerUser.id },
    update: {
      licenseNumber: 'DEMO-LICENSE-123',
      specialization: ['General Therapy', 'Anxiety Support'],
      bio: 'Experienced practitioner specializing in anxiety, depression, and relationship counselling.',
      hourlyRate: 150,
      isVerified: true,
    },
    create: {
      userId: practitionerUser.id,
      licenseNumber: 'DEMO-LICENSE-123',
      specialization: ['General Therapy', 'Anxiety Support'],
      bio: 'Experienced practitioner specializing in anxiety, depression, and relationship counselling.',
      hourlyRate: 150,
      isVerified: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  for (const service of demoServices) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    })
  }

  const phq9Assessment = await prisma.assessment.upsert({
    where: { title: 'PHQ-9 Depression Assessment' },
    update: {
      description: 'Patient Health Questionnaire-9 for depression screening.',
      questions: phq9Questions,
      isActive: true,
    },
    create: {
      title: 'PHQ-9 Depression Assessment',
      description: 'Patient Health Questionnaire-9 for depression screening.',
      questions: phq9Questions,
      isActive: true,
    },
  })

  const defaultService = await prisma.service.findUnique({
    where: { name: 'Initial Consultation' },
  })

  if (defaultService) {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        clientId: clientUser.id,
        practitionerId: practitionerUser.id,
      },
    })

    if (!existingAppointment) {
      const startTime = new Date()
      startTime.setDate(startTime.getDate() + 1)
      startTime.setHours(10, 0, 0, 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + defaultService.duration)

      await prisma.appointment.create({
        data: {
          clientId: clientUser.id,
          practitionerId: practitionerUser.id,
          serviceId: defaultService.id,
          startTime,
          endTime,
          notes: 'Demo appointment for local MVP testing.',
          status: 'SCHEDULED',
        },
      })
    }
  }

  const latestMoodEntry = await prisma.moodEntry.findFirst({
    where: { userId: clientUser.id },
    orderBy: { createdAt: 'desc' },
  })

  if (!latestMoodEntry) {
    await prisma.moodEntry.create({
      data: {
        userId: clientUser.id,
        mood: 7,
        notes: 'Feeling steady and hopeful today.',
        tags: ['demo', 'baseline'],
      },
    })
  }

  const existingAssessmentAnswer = await prisma.assessmentAnswer.findFirst({
    where: {
      userId: clientUser.id,
      assessmentId: phq9Assessment.id,
    },
  })

  if (!existingAssessmentAnswer) {
    await prisma.assessmentAnswer.create({
      data: {
        userId: clientUser.id,
        assessmentId: phq9Assessment.id,
        answers: {
          1: 1,
          2: 2,
          3: 1,
        },
        score: 4,
      },
    })
  }

  return {
    credentials: demoCredentials,
  }
}
