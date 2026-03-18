'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

type AvailabilitySlot = {
  day: string
  endTime: string
  isAvailable: boolean
  startTime: string
}

const DEFAULT_SLOTS: AvailabilitySlot[] = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Saturday', startTime: '10:00', endTime: '14:00', isAvailable: false },
  { day: 'Sunday', startTime: '10:00', endTime: '14:00', isAvailable: false },
]

const STORAGE_KEY = 'oku-therapy-practitioner-availability'

function loadStoredSlots(): AvailabilitySlot[] {
  if (typeof window === 'undefined') {
    return DEFAULT_SLOTS
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return DEFAULT_SLOTS
  }

  try {
    return JSON.parse(stored) as AvailabilitySlot[]
  } catch {
    return DEFAULT_SLOTS
  }
}

export default function PractitionerAvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() => loadStoredSlots())
  const [message, setMessage] = useState('Availability is currently saved locally in this browser.')

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session || session.user.role !== 'PRACTITIONER') {
      router.replace('/auth/login')
      return
    }

  }, [router, session, status])

  useEffect(() => {
    if (status !== 'loading' && session?.user.role === 'PRACTITIONER') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
    }
  }, [session?.user.role, slots, status])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  const updateSlot = (day: string, patch: Partial<AvailabilitySlot>) => {
    setSlots((current) =>
      current.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)),
    )
    setMessage('Availability draft updated locally.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="font-medium text-blue-600 hover:text-blue-800" href="/practitioner/dashboard">
            ← Back to Dashboard
          </Link>
          <button className="text-sm text-gray-700 hover:text-gray-900" onClick={() => void signOut({ callbackUrl: '/auth/login' })} type="button">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
          <p className="mt-2 text-sm text-gray-600">Set a simple weekly availability draft. This currently stays in your browser until the availability API is added.</p>
        </div>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>

        <div className="space-y-4 rounded-xl bg-white p-6 shadow">
          {slots.map((slot) => (
            <div className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr,1fr,1fr_auto]" key={slot.day}>
              <div className="font-medium text-gray-900">{slot.day}</div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Start
                <input
                  className="rounded-md border border-gray-300 px-3 py-2"
                  disabled={!slot.isAvailable}
                  onChange={(event) => updateSlot(slot.day, { startTime: event.target.value })}
                  type="time"
                  value={slot.startTime}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                End
                <input
                  className="rounded-md border border-gray-300 px-3 py-2"
                  disabled={!slot.isAvailable}
                  onChange={(event) => updateSlot(slot.day, { endTime: event.target.value })}
                  type="time"
                  value={slot.endTime}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  checked={slot.isAvailable}
                  onChange={(event) => updateSlot(slot.day, { isAvailable: event.target.checked })}
                  type="checkbox"
                />
                Available
              </label>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
