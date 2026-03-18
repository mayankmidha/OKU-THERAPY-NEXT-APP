'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPractitioners: 0,
    totalClients: 0,
    totalAppointments: 0,
    totalRevenue: 0
  })
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchAdminData()
  }, [session, status, router])

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const data = await usersResponse.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPractitioner = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch('/api/admin/users/verify', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, verified })
      })

      if (response.ok) {
        // Refresh users list
        fetchAdminData()
      }
    } catch (error) {
      console.error('Error verifying practitioner:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OKU Therapy - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">
                Users
              </Link>
              <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-800 font-medium">
                Analytics
              </Link>
              <div className="relative group">
                <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <span className="mr-2">{session.user?.name}</span>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 00-5.356-3A3 3 0 0012 14c-1.11 0-2.08.6-2.599 1.49V7a3 3 0 016-3H5a3 3 0 00-3 3v4a3 3 0 003 3h1.72L11 17l4-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-3A3 3 0 0012 14c-1.11 0-2.08.6-2.599 1.49V7a3 3 0 016-3H5a3 3 0 00-3 3v4a3 3 0 003 3h1.72L11 17l4-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Practitioners</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalPractitioners}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-3A3 3 0 0012 14c-1.11 0-2.08.6-2.599 1.49V7a3 3 0 016-3H5a3 3 0 00-3 3v4a3 3 0 003 3h1.72L11 17l4-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Clients</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalClients}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Appointments</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalAppointments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.11 0-2.08-.6-2.599 1.49V7a3 3 0 016-3H5a3 3 0 00-3 3v4a3 3 0 003 3h1.72L11 17l4-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Users
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 5).map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'PRACTITIONER' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.practitionerProfile?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.practitionerProfile?.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role === 'PRACTITIONER' && !user.practitionerProfile?.isVerified && (
                        <button
                          onClick={() => handleVerifyPractitioner(user.id, true)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Verify
                        </button>
                      )}
                      <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
