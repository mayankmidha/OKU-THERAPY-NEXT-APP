import { notFound, redirect } from 'next/navigation'

import { AdminActionLink, AdminPanel, AdminShell, AdminStatusPill } from '@/components/admin-shell'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency',
})

type AdminUserDetail = {
  createdAt: Date
  email: string
  id: string
  name: string | null
  practitionerProfile: {
    bio: string | null
    hourlyRate: number | null
    isVerified: boolean
    licenseNumber: string | null
    specialization: string[]
  } | null
  role: 'ADMIN' | 'CLIENT' | 'PRACTITIONER'
}

function getRolePill(user: AdminUserDetail) {
  if (user.role !== 'PRACTITIONER') {
    return { label: 'Active client', tone: 'info' as const }
  }

  return user.practitionerProfile?.isVerified
    ? { label: 'Verified practitioner', tone: 'success' as const }
    : { label: 'Pending verification', tone: 'warning' as const }
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const { userId } = await params
  const user = (await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      email: true,
      id: true,
      name: true,
      practitionerProfile: {
        select: {
          bio: true,
          hourlyRate: true,
          isVerified: true,
          licenseNumber: true,
          specialization: true,
        },
      },
      role: true,
    },
  })) as AdminUserDetail | null

  if (!user) {
    notFound()
  }

  const rolePill = getRolePill(user)
  const joinedAt = user.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <AdminShell
      actions={
        <>
          <AdminActionLink href="/admin/users">Back to users</AdminActionLink>
          <AdminActionLink kind="primary" href="/admin/dashboard">
            Dashboard
          </AdminActionLink>
        </>
      }
      description="A focused profile view for the admin team."
      maxWidth="5xl"
      title="User profile"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel className="p-6" tone="light">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Identity</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{user.name ?? 'Unnamed user'}</h2>
              <p className="mt-2 text-sm text-slate-600">{user.email}</p>
              <p className="mt-1 text-sm text-slate-500">Joined {joinedAt}</p>
            </div>
            <AdminStatusPill tone={rolePill.tone}>{rolePill.label}</AdminStatusPill>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Account ID</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-950">{user.id}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Role</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{user.role}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Joined</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{joinedAt}</p>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel className="p-6" tone="dark">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">Account summary</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>This profile shows the current admin record for access, verification, and practitioner metadata.</p>
              <p>For Phase 1, the detail page stays read-only.</p>
            </div>
          </AdminPanel>

          <AdminPanel className="p-6" tone="light">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AdminStatusPill tone={user.role === 'PRACTITIONER' ? 'warning' : 'info'}>{user.role}</AdminStatusPill>
              <AdminStatusPill tone={rolePill.tone}>{rolePill.label}</AdminStatusPill>
            </div>
          </AdminPanel>
        </div>
      </div>

      {user.practitionerProfile ? (
        <AdminPanel className="mt-6 p-6" tone="light">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Practitioner profile</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Professional details</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Credential and profile details used for review.</p>
            </div>
            <AdminStatusPill tone={user.practitionerProfile.isVerified ? 'success' : 'warning'}>
              {user.practitionerProfile.isVerified ? 'Verified' : 'Awaiting review'}
            </AdminStatusPill>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">License number</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{user.practitionerProfile.licenseNumber ?? 'Not set'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Hourly rate</p>
              <p className="mt-2 text-sm font-medium text-slate-950">
                {user.practitionerProfile.hourlyRate !== null
                  ? currencyFormatter.format(user.practitionerProfile.hourlyRate)
                  : 'Not set'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Specializations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.practitionerProfile.specialization.length ? (
                  user.practitionerProfile.specialization.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Not set</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bio</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{user.practitionerProfile.bio || 'No bio provided yet.'}</p>
            </div>
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel className="mt-6 p-6" tone="light">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Client profile</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">No practitioner record attached</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This account is treated as a client profile.</p>
        </AdminPanel>
      )}
    </AdminShell>
  )
}
