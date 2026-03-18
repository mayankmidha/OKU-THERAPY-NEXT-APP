import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminAnalyticsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const [totalUsers, totalClients, totalPractitioners, verifiedPractitioners, pendingPractitioners, totalAppointments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PRACTITIONER' } }),
      prisma.practitionerProfile.count({ where: { isVerified: true } }),
      prisma.practitionerProfile.count({ where: { isVerified: false } }),
      prisma.appointment.count(),
    ])

  const completedAppointments = await prisma.appointment.findMany({
    where: { status: 'COMPLETED' },
    include: { payments: true },
  })

  const totalRevenue = completedAppointments.reduce((sum, appointment) => {
    return sum + appointment.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
  }, 0)

  const metrics = [
    { label: 'Total users', value: totalUsers },
    { label: 'Clients', value: totalClients },
    { label: 'Practitioners', value: totalPractitioners },
    { label: 'Verified practitioners', value: verifiedPractitioners },
    { label: 'Pending practitioners', value: pendingPractitioners },
    { label: 'Appointments', value: totalAppointments },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Analytics</h1>
            <p className="text-sm text-gray-500">A lightweight view of the current platform health.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/users">
              Users
            </Link>
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
            </div>
          ))}
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Completed revenue</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">What this page covers</h2>
          <p className="mt-2 text-sm text-gray-600">
            This is intentionally small for Phase 1. It gives the admin team a stable landing page and a
            trustworthy summary while deeper charts and reporting are built later.
          </p>
        </div>
      </main>
    </div>
  )
}
