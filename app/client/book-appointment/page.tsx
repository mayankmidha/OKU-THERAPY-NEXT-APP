'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AppShell, SectionCard } from '@/components/brand-app-shell'

type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
}

type Practitioner = {
  id: string
  name: string | null
  email: string
  practitionerProfile: {
    specialization: string[]
    bio: string | null
    hourlyRate: number | null
  } | null
}

type BookingDataResponse = {
  services: Service[]
  practitioners: Practitioner[]
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedPractitioner, setSelectedPractitioner] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await fetch('/api/client/book')

        if (response.ok) {
          const data = (await response.json()) as BookingDataResponse
          setServices(data.services)
          setPractitioners(data.practitioners)
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
      }
    }

    void fetchBookingData()
  }, [])

  const selectedServiceDetails = useMemo(
    () => services.find((service) => service.id === selectedService) ?? null,
    [selectedService, services]
  )

  const selectedPractitionerDetails = useMemo(
    () => practitioners.find((practitioner) => practitioner.id === selectedPractitioner) ?? null,
    [practitioners, selectedPractitioner]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!selectedService || !selectedPractitioner || !selectedDate || !selectedTime) {
      setMessage('Please fill in all required fields.')
      setIsLoading(false)
      return
    }

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`)

      const response = await fetch('/api/client/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practitionerId: selectedPractitioner,
          serviceId: selectedService,
          startTime: startTime.toISOString(),
          notes,
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setMessage(data.error ?? 'Failed to book appointment.')
        return
      }

      setMessage('Appointment booked successfully.')
      window.setTimeout(() => {
        router.push('/client/appointments')
      }, 800)
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots: string[] = []

    for (let hour = 9; hour <= 17; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(slot)
      }
    }

    return slots
  }

  return (
    <AppShell
      accentClassName="bg-[#2f6a5b]"
      backHref="/client/dashboard"
      backLabel="Back to dashboard"
      description="Choose the type of session you need, who you would like to work with, and a time that feels workable."
      eyebrow="Booking"
      primaryAction={{ href: '/client/appointments', label: 'See your schedule' }}
      secondaryAction={{ href: '/client/assessments', label: 'Open assessments' }}
      title="Book a therapy session"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <SectionCard
          description="Phase 1 keeps booking simple and reliable: choose a service, practitioner, date, and time."
          title="Session details"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message ? (
              <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                {message}
              </div>
            ) : null}

            {services.length === 0 ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                No services are seeded yet. Add seeded services in the database to make booking available.
              </div>
            ) : null}

            <div>
              <label className="mb-3 block text-sm font-medium text-stone-700" htmlFor="service">
                Choose a service
              </label>
              <div className="grid gap-4">
                {services.map((service) => {
                  const isSelected = selectedService === service.id
                  return (
                    <button
                      className={`rounded-[24px] border p-5 text-left transition ${
                        isSelected
                          ? 'border-stone-900 bg-stone-950 text-stone-50 shadow-[0_14px_40px_rgba(20,16,12,0.18)]'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                      }`}
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <p className={`mt-2 text-sm leading-6 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                            {service.description || 'Therapy session'}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${isSelected ? 'text-stone-200' : 'text-stone-700'}`}>
                          ${service.price}
                        </div>
                      </div>
                      <div className={`mt-4 text-xs uppercase tracking-[0.24em] ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                        {service.duration} minutes
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-stone-700" htmlFor="practitioner">
                Choose a practitioner
              </label>
              <div className="grid gap-4">
                {practitioners.map((practitioner) => {
                  const isSelected = selectedPractitioner === practitioner.id
                  return (
                    <button
                      className={`rounded-[24px] border p-5 text-left transition ${
                        isSelected
                          ? 'border-[#2f6a5b] bg-[#edf5f2] shadow-[0_14px_40px_rgba(47,106,91,0.14)]'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                      }`}
                      key={practitioner.id}
                      onClick={() => setSelectedPractitioner(practitioner.id)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-950">
                            {practitioner.name ?? 'Practitioner'}
                          </h3>
                          <p className="mt-2 text-sm text-stone-600">
                            {practitioner.practitionerProfile?.specialization.join(', ') || 'General practice'}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {practitioner.practitionerProfile?.bio || 'A verified practitioner in the OKU Therapy workspace.'}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-stone-700">
                          {practitioner.practitionerProfile?.hourlyRate
                            ? `$${practitioner.practitionerProfile.hourlyRate}/hr`
                            : 'Rate available'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="date">
                  Select a date
                </label>
                <input
                  className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                  id="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  required
                  type="date"
                  value={selectedDate}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="time">
                  Select a time
                </label>
                <select
                  className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                  id="time"
                  onChange={(event) => setSelectedTime(event.target.value)}
                  required
                  value={selectedTime}
                >
                  <option value="">Choose a time...</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="notes">
                Anything you want your practitioner to know first
              </label>
              <textarea
                className="min-h-[160px] w-full rounded-[24px] border border-stone-300 bg-white px-4 py-4 text-sm leading-6 text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                id="notes"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="You can share what support you are looking for, any preferences, or anything relevant before the session."
                rows={4}
                value={notes}
              />
            </div>

            <button
              className="rounded-full bg-[#2f6a5b] px-6 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || services.length === 0}
              type="submit"
            >
              {isLoading ? 'Booking...' : 'Review and book'}
            </button>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard description="What this booking will look like based on your selections." title="Booking summary">
            <div className="space-y-5">
              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Service</p>
                <p className="mt-3 text-lg font-semibold text-stone-950">
                  {selectedServiceDetails?.name || 'Choose a service'}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {selectedServiceDetails?.description || 'Session details will appear here once you select a service.'}
                </p>
              </div>

              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Practitioner</p>
                <p className="mt-3 text-lg font-semibold text-stone-950">
                  {selectedPractitionerDetails?.name || 'Choose a practitioner'}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {selectedPractitionerDetails?.practitionerProfile?.specialization.join(', ') ||
                    'Specializations will appear here after selection.'}
                </p>
              </div>

              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Timing</p>
                <p className="mt-3 text-lg font-semibold text-stone-950">
                  {selectedDate && selectedTime ? `${selectedDate} at ${selectedTime}` : 'Choose a date and time'}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Sessions are confirmed instantly in this MVP flow once availability conditions are met.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard description="A few reminders before you book." title="Before your session">
            <ul className="space-y-3 text-sm leading-7 text-stone-700">
              <li>Choose the practitioner whose focus feels most aligned with the support you need.</li>
              <li>Your notes can stay brief. They simply help your practitioner prepare.</li>
              <li>If you would rather start with self-reflection, you can complete PHQ-9 before booking.</li>
            </ul>
            <Link
              className="mt-5 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              href="/client/assessments/phq9"
            >
              Take PHQ-9 first
            </Link>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
