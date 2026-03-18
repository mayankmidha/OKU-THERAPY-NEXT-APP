'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type AdminStats = {
  totalUsers: number
  totalPractitioners: number
  totalClients: number
  totalAppointments: number
  totalRevenue: number
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

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPractitioners: 0,
    totalClients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
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
        const [statsResponse, usersResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users'),
        ])

        if (statsResponse.ok) {
          const statsData = (await statsResponse.json()) as AdminStats
          setStats(statsData)
        }

        if (usersResponse.ok) {
          const userData = (await usersResponse.json()) as AdminUser[]
          setUsers(userData)
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAdminData()
  }, [router, session, status])

  const handleVerifyPractitioner = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Error verifying practitioner:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">OKU Therapy - Admin</h1>
          <div className="flex items-center gap-4">
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/admin/users">
              Users
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-800" href="/admin/analytics">
              Analytics
            </Link>
            <button
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={() => void signOut({ callbackUrl: '/auth/login' })}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Practitioners</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalPractitioners}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Clients</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalClients}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Appointments</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalAppointments}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">Revenue</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-800" href="/admin/users">
              View all users
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.slice(0, 5).map((user) => {
                  const isPractitioner = user.role === 'PRACTITIONER'
                  const isVerified = user.practitionerProfile?.isVerified ?? true

                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name ?? 'Unnamed User'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isPractitioner ? (isVerified ? 'Verified' : 'Pending') : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {isPractitioner && !isVerified ? (
                          <button
                            className="mr-3 text-green-600 hover:text-green-900"
                            onClick={() => void handleVerifyPractitioner(user.id, true)}
                            type="button"
                          >
                            Verify
                          </button>
                        ) : null}
                        <Link className="text-blue-600 hover:text-blue-900" href={`/admin/users/${user.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
