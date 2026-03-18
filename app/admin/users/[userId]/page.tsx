import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/users">
            ← Back to users
          </Link>
          <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name ?? 'Unnamed User'}</h1>
              <p className="mt-2 text-sm text-gray-600">{user.email}</p>
              <p className="mt-1 text-sm text-gray-500">Joined {user.createdAt.toLocaleDateString()}</p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                user.role === 'PRACTITIONER'
                  ? user.practitionerProfile?.isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user.role === 'PRACTITIONER'
                ? user.practitionerProfile?.isVerified
                  ? 'Verified practitioner'
                  : 'Pending verification'
                : user.role}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Role</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{user.role}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          {user.practitionerProfile ? (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">Practitioner Profile</h2>
              <dl className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">License</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.practitionerProfile.licenseNumber ?? 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Hourly rate</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.practitionerProfile.hourlyRate ? `$${user.practitionerProfile.hourlyRate}` : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.practitionerProfile.specialization.length
                      ? user.practitionerProfile.specialization.join(', ')
                      : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Verification</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.practitionerProfile.isVerified ? 'Verified' : 'Pending'}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {user.practitionerProfile.bio || 'No bio provided yet.'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
