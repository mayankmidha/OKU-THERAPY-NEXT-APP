'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import {
  AdminActionButton,
  AdminActionLink,
  AdminMetricCard,
  AdminPanel,
  AdminShell,
  AdminStatusPill,
} from '@/components/admin-shell'

type AdminStats = {
  pendingPractitioners?: number
  totalAppointments: number
  totalClients: number
  totalPractitioners: number
  totalRevenue: number
  totalUsers: number
  verifiedPractitioners?: number
}

type AdminUser = {
  id: string
  name: string | null
  email: string
  role: 'CLIENT' | 'PRACTITIONER' | 'ADMIN'
  practitionerProfile: {
    isVerified: boolean
  } | null
}

function getUserStatus(user: AdminUser) {
  if (user.role !== 'PRACTITIONER') {
    return { label: 'Active client', tone: 'info' as const }
  }

  return user.practitionerProfile?.isVerified
    ? { label: 'Verified practitioner', tone: 'success' as const }
    : { label: 'Pending verification', tone: 'warning' as const }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalAppointments: 0,
    totalClients: 0,
    totalPractitioners: 0,
    totalRevenue: 0,
    totalUsers: 0,
  })
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'ADMIN') {
      router.replace('/auth/login')
      return
    }

    const fetchAdminData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/users')])

        if (statsResponse.ok) {
          setStats((await statsResponse.json()) as AdminStats)
        }

        if (usersResponse.ok) {
          setUsers((await usersResponse.json()) as AdminUser[])
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAdminData()
  }, [router, session, status])

  const verifiedPractitioners =
    stats.verifiedPractitioners ?? users.filter((user) => user.role === 'PRACTITIONER' && user.practitionerProfile?.isVerified).length
  const pendingPractitioners =
    stats.pendingPractitioners ?? users.filter((user) => user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified).length

  const pendingUsers = useMemo(
    () => users.filter((user) => user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified),
    [users]
  )

  const handleVerifyPractitioner = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify({ userId, verified }),
      })

      if (!response.ok) {
        return
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                practitionerProfile: user.practitionerProfile
                  ? { ...user.practitionerProfile, isVerified: verified }
                  : null,
              }
            : user
        )
      )

      setStats((currentStats) => ({
        ...currentStats,
        pendingPractitioners: Math.max((currentStats.pendingPractitioners ?? 0) - 1, 0),
        verifiedPractitioners: (currentStats.verifiedPractitioners ?? 0) + 1,
      }))
    } catch (error) {
      console.error('Error verifying practitioner:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06111e] text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_32px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300" />
          <p className="mt-4 text-sm text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <AdminShell
      actions={
        <>
          <AdminActionLink href="/admin/users">View users</AdminActionLink>
          <AdminActionLink kind="primary" href="/admin/analytics">
            Open analytics
          </AdminActionLink>
          <AdminActionButton kind="danger" onClick={() => void signOut({ callbackUrl: '/auth/login' })}>
            Sign out
          </AdminActionButton>
        </>
      }
      description="Quick read on users, verification, and platform health."
      title="Admin dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard hint="All accounts" label="Total users" tone="sky" value={stats.totalUsers} />
        <AdminMetricCard hint="Client accounts" label="Clients" tone="emerald" value={stats.totalClients} />
        <AdminMetricCard hint="Practitioner accounts" label="Practitioners" tone="violet" value={stats.totalPractitioners} />
        <AdminMetricCard hint="Ready for bookings" label="Verified" tone="emerald" value={verifiedPractitioners} />
        <AdminMetricCard hint="Waiting on review" label="Pending" tone="amber" value={pendingPractitioners} />
        <AdminMetricCard hint="Session count" label="Appointments" tone="rose" value={stats.totalAppointments} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <AdminPanel className="overflow-hidden" tone="light">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Recent accounts</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Latest user activity</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The newest accounts surface here so the team can spot signups and pending practitioners.
              </p>
            </div>
            <AdminActionLink kind="ghost" href="/admin/users">
              View all users
            </AdminActionLink>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.slice(0, 5).map((user) => {
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
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                          {user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified ? (
                            <AdminActionButton
                              className="px-3 py-1.5 text-xs"
                              kind="primary"
                              onClick={() => void handleVerifyPractitioner(user.id, true)}
                            >
                              Verify
                            </AdminActionButton>
                          ) : null}
                          <Link className="text-sky-700 transition hover:text-sky-800" href={`/admin/users/${user.id}`}>
                            View details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel className="p-6" tone="dark">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">Verification queue</p>
                <h2 className="mt-2 text-lg font-semibold">Practitioners awaiting approval</h2>
              </div>
              <AdminStatusPill tone={pendingUsers.length ? 'warning' : 'success'}>
                {pendingUsers.length ? `${pendingUsers.length} pending` : 'All clear'}
              </AdminStatusPill>
            </div>

            <div className="mt-5 space-y-3">
              {pendingUsers.length ? (
                pendingUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{user.name ?? 'Unnamed practitioner'}</p>
                        <p className="mt-1 text-sm text-slate-300">{user.email}</p>
                      </div>
                      <AdminActionButton
                        className="px-3 py-1.5 text-xs"
                        kind="primary"
                        onClick={() => void handleVerifyPractitioner(user.id, true)}
                      >
                        Verify
                      </AdminActionButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  No practitioners are waiting on review.
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel className="p-6" tone="light">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Platform snapshot</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(stats.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Verification ratio</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {stats.totalPractitioners ? Math.round((verifiedPractitioners / stats.totalPractitioners) * 100) : 0}%
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">A compact live read on growth, approval, and throughput.</p>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  )
}
