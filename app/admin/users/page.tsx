import Link from 'next/link'
import { redirect } from 'next/navigation'

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

  const verifiedPractitioners = users.filter(
    (user) => user.role === 'PRACTITIONER' && user.practitionerProfile?.isVerified
  ).length
  const pendingPractitioners = users.filter(
    (user) => user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Users</h1>
            <p className="text-sm text-gray-500">Browse users and check practitioner verification status.</p>
          </div>
          <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/dashboard">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Total users</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{users.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Verified practitioners</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{verifiedPractitioners}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Pending practitioners</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{pendingPractitioners}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => {
                const isPractitioner = user.role === 'PRACTITIONER'
                const isVerified = user.practitionerProfile?.isVerified ?? true

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name ?? 'Unnamed User'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          isPractitioner
                            ? isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isPractitioner ? (isVerified ? 'Verified' : 'Pending') : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link className="text-blue-600 hover:text-blue-800" href={`/admin/users/${user.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
