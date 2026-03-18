import { PrismaClient } from '@prisma/client'
import { seedDemoData } from '@/lib/demo-data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  const result = await seedDemoData(prisma)

  console.log('Database seeded successfully!')
  console.log('Demo users created:')
  for (const credential of result.credentials) {
    console.log(`- ${credential.role}: ${credential.email} / ${credential.password}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
