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
      description="A focused profile view."
      maxWidth="5xl"
      title="User profile"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel
          action={<AdminStatusPill tone={rolePill.tone}>{rolePill.label}</AdminStatusPill>}
          className="p-6"
          description={user.email}
          title={user.name ?? 'Unnamed user'}
          tone="light"
        >
          <p className="text-sm text-slate-500">Joined {joinedAt}</p>

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
          <AdminPanel className="p-6" description="Current access and review state." title="Account summary" tone="dark">
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>Read-only record for access, verification, and practitioner metadata.</p>
            </div>
          </AdminPanel>

          <AdminPanel
            action={<AdminStatusPill tone={user.role === 'PRACTITIONER' ? 'warning' : 'info'}>{user.role}</AdminStatusPill>}
            className="p-6"
            description="Role and review state."
            title="Status"
            tone="light"
          >
            <div className="mt-4 flex flex-wrap gap-3">
              <AdminStatusPill tone={rolePill.tone}>{rolePill.label}</AdminStatusPill>
            </div>
          </AdminPanel>
        </div>
      </div>

      {user.practitionerProfile ? (
        <AdminPanel
          action={<AdminStatusPill tone={user.practitionerProfile.isVerified ? 'success' : 'warning'}>{user.practitionerProfile.isVerified ? 'Verified' : 'Awaiting review'}</AdminStatusPill>}
          className="mt-6 p-6"
          description="Credential and profile details."
          title="Professional details"
          tone="light"
        >

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
        <AdminPanel className="mt-6 p-6" description="Client account, no practitioner record attached." title="Client profile" tone="light" />
      )}
    </AdminShell>
  )
}
