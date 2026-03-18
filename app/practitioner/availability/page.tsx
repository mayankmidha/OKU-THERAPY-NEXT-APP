'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  PractitionerLoadingState,
  PractitionerPill,
  PractitionerSectionCard,
  PractitionerShell,
  PractitionerStatCard,
} from '@/components/practitioner-shell/practitioner-shell'

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
  const [message, setMessage] = useState('Availability changes are saved automatically.')

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
    return <PractitionerLoadingState message="Loading availability..." />
  }

  if (!session || session.user.role !== 'PRACTITIONER') {
    return null
  }

  const updateSlot = (day: string, patch: Partial<AvailabilitySlot>) => {
    setSlots((current) =>
      current.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)),
    )
    setMessage('Availability updated.')
  }

  return (
    <PractitionerShell
      badge="Availability"
      currentPath="/practitioner/availability"
      description="Keep a polished weekly schedule of your working hours. Changes are saved automatically in this workspace."
      headerActions={
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          onClick={() => void signOut({ callbackUrl: '/auth/login' })}
          type="button"
        >
          Sign out
        </button>
      }
      heroActions={
        <Link
          className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          href="/practitioner/dashboard"
        >
          Back to dashboard
        </Link>
      }
      title="Weekly availability"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PractitionerStatCard
          accent="from-sky-500 to-cyan-500"
          detail="Days currently marked available."
          label="Available days"
          value={slots.filter((slot) => slot.isAvailable).length}
        />
        <PractitionerStatCard
          accent="from-emerald-500 to-teal-500"
          detail="Days currently marked off."
          label="Unavailable days"
          value={slots.filter((slot) => !slot.isAvailable).length}
        />
        <PractitionerStatCard
          accent="from-violet-500 to-indigo-500"
          detail="Ready for future scheduling sync."
          label="Save status"
          value="Automatic"
        />
      </div>

      <div className="mt-6">
        <PractitionerSectionCard
          action={<PractitionerPill tone="sky">Saved automatically</PractitionerPill>}
          description="Set weekly hours, block off time, and keep your schedule easy to review."
          title="Availability grid"
        >
          <div className="mb-5 rounded-[1.5rem] border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-800">
            {message}
          </div>

          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
                key={slot.day}
              >
                <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-center">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{slot.day}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <PractitionerPill tone={slot.isAvailable ? 'emerald' : 'slate'}>
                        {slot.isAvailable ? 'Available' : 'Off'}
                      </PractitionerPill>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    Start
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={!slot.isAvailable}
                      onChange={(event) => updateSlot(slot.day, { startTime: event.target.value })}
                      type="time"
                      value={slot.startTime}
                    />
                  </label>

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    End
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={!slot.isAvailable}
                      onChange={(event) => updateSlot(slot.day, { endTime: event.target.value })}
                      type="time"
                      value={slot.endTime}
                    />
                  </label>

                  <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    <input
                      checked={slot.isAvailable}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      onChange={(event) => updateSlot(slot.day, { isAvailable: event.target.checked })}
                      type="checkbox"
                    />
                    Toggle
                  </label>
                </div>
              </div>
            ))}
          </div>
        </PractitionerSectionCard>
      </div>
    </PractitionerShell>
  )
}
