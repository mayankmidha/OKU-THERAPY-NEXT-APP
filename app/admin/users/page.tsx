import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AdminActionLink, AdminMetricCard, AdminPanel, AdminShell, AdminStatusPill } from '@/components/admin-shell'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AdminUserRow = {
  createdAt: Date
  email: string
  id: string
  name: string | null
  practitionerProfile: {
    isVerified: boolean
  } | null
  role: 'ADMIN' | 'CLIENT' | 'PRACTITIONER'
}

function getUserStatus(user: AdminUserRow) {
  if (user.role !== 'PRACTITIONER') {
    return { label: 'Active client', tone: 'info' as const }
  }

  return user.practitionerProfile?.isVerified
    ? { label: 'Verified practitioner', tone: 'success' as const }
    : { label: 'Pending verification', tone: 'warning' as const }
}

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const users = (await prisma.user.findMany({
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
      createdAt: 'desc',
    },
  })) as AdminUserRow[]

  const totalClients = users.filter((user) => user.role === 'CLIENT').length
  const totalPractitioners = users.filter((user) => user.role === 'PRACTITIONER').length
  const verifiedPractitioners = users.filter(
    (user) => user.role === 'PRACTITIONER' && user.practitionerProfile?.isVerified
  ).length
  const pendingPractitioners = users.filter(
    (user) => user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified
  ).length

  return (
    <AdminShell
      actions={
        <AdminActionLink href="/admin/dashboard" kind="secondary">
          Back to dashboard
        </AdminActionLink>
      }
      description="Browse accounts and open any profile."
      title="User directory"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard hint="All accounts" label="Total users" tone="sky" value={users.length} />
        <AdminMetricCard hint="Client accounts" label="Clients" tone="emerald" value={totalClients} />
        <AdminMetricCard hint="Practitioner accounts" label="Practitioners" tone="violet" value={totalPractitioners} />
        <AdminMetricCard hint="Approved for bookings" label="Verified" tone="emerald" value={verifiedPractitioners} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <AdminPanel
          action={<AdminStatusPill tone={pendingPractitioners ? 'warning' : 'success'}>{pendingPractitioners ? `${pendingPractitioners} pending` : 'All practitioners verified'}</AdminStatusPill>}
          className="overflow-hidden"
          description="Newest accounts first."
          title="All accounts"
          tone="light"
        >

          {users.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => {
                    const statusPill = getUserStatus(user)
                    const initials =
                      user.name
                        ?.split(' ')
                        .slice(0, 2)
                        .map((part) => part.charAt(0).toUpperCase())
                        .join('')
                        .slice(0, 2) ?? 'U'

                    return (
                      <tr key={user.id} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-950">{user.name ?? 'Unnamed user'}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <AdminStatusPill tone={user.role === 'PRACTITIONER' ? 'warning' : user.role === 'ADMIN' ? 'neutral' : 'info'}>
                            {user.role}
                          </AdminStatusPill>
                        </td>
                        <td className="px-6 py-4">
                          <AdminStatusPill tone={statusPill.tone}>{statusPill.label}</AdminStatusPill>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Link className="text-sm font-medium text-sky-700 transition hover:text-sky-800" href={`/admin/users/${user.id}`}>
                            View details
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-medium text-slate-950">No users yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">New clients and practitioners will appear here automatically.</p>
            </div>
          )}
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel
            className="p-6"
            description="Quick audit trail for the team."
            title="Verification workflow"
            tone="light"
          />

          <AdminPanel
            className="p-6"
            description="Current balance of approvals."
            title="Verification balance"
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
        </div>
      </div>
    </AdminShell>
  )
}
