'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/auth/login')
      return
    }

    if (session.user?.role === 'CLIENT') {
      router.replace('/client/dashboard')
      return
    }

    if (session.user?.role === 'PRACTITIONER') {
      router.replace('/practitioner/dashboard')
      return
    }

    if (session.user?.role === 'ADMIN') {
      router.replace('/admin/dashboard')
      return
    }

    router.replace('/auth/login')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
