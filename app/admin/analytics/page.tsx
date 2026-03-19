import { redirect } from 'next/navigation'

import { AdminActionLink, AdminMetricCard, AdminPanel, AdminShell, AdminStatusPill } from '@/components/admin-shell'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency',
})

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
    include: { payments: true },
    where: { status: 'COMPLETED' },
  })

  const totalRevenue = completedAppointments.reduce((sum, appointment) => {
    return sum + appointment.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
  }, 0)

  const verificationRate = totalPractitioners ? Math.round((verifiedPractitioners / totalPractitioners) * 100) : 0

  return (
    <AdminShell
      actions={
        <>
          <AdminActionLink href="/admin/users">Users</AdminActionLink>
          <AdminActionLink kind="primary" href="/admin/dashboard">
            Dashboard
          </AdminActionLink>
        </>
      }
      description="A compact read on platform health."
      title="Analytics"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard hint="All platform accounts" label="Total users" tone="sky" value={totalUsers} />
        <AdminMetricCard hint="Client accounts" label="Clients" tone="emerald" value={totalClients} />
        <AdminMetricCard hint="Practitioner accounts" label="Practitioners" tone="violet" value={totalPractitioners} />
        <AdminMetricCard hint="Approved for bookings" label="Verified" tone="emerald" value={verifiedPractitioners} />
        <AdminMetricCard hint="Waiting on review" label="Pending" tone="amber" value={pendingPractitioners} />
        <AdminMetricCard hint="Session count" label="Appointments" tone="rose" value={totalAppointments} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel
          action={<AdminStatusPill tone={totalRevenue ? 'success' : 'neutral'}>{totalRevenue ? 'Live data' : 'No revenue yet'}</AdminStatusPill>}
          className="p-6"
          description="Payment totals attached to completed appointments."
          title="Completed revenue"
          tone="light"
        >

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Completed revenue</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{currencyFormatter.format(totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Verification rate</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{verificationRate}%</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-800">
            Live read on onboarding, verification, and session activity.
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel
            action={<AdminStatusPill tone={pendingPractitioners ? 'warning' : 'success'}>{pendingPractitioners ? `${pendingPractitioners} pending` : 'Clear'}</AdminStatusPill>}
            className="p-6"
            description="Current approval balance."
            title="Verification queue"
            tone="dark"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Verified</p>
                <p className="mt-2 text-2xl font-semibold text-white">{verifiedPractitioners}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-white">{pendingPractitioners}</p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="p-6" description="Expanded charts come later." title="Phase 1 scope" tone="light" />
        </div>
      </div>
    </AdminShell>
  )
}
