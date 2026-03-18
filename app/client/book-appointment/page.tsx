'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
        router.push('/client/dashboard')
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link className="font-medium text-blue-600 hover:text-blue-800" href="/client/dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Book an appointment</h1>
            <p className="mt-1 text-gray-600">Choose a practitioner, service, date, and time.</p>
          </div>

          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            {message ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="service">
                Service
              </label>
              <select
                id="service"
                required
                value={selectedService}
                onChange={(event) => setSelectedService(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration} min) - ${service.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="practitioner">
                Practitioner
              </label>
              <select
                id="practitioner"
                required
                value={selectedPractitioner}
                onChange={(event) => setSelectedPractitioner(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a practitioner...</option>
                {practitioners.map((practitioner) => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {practitioner.name} - {practitioner.practitionerProfile?.specialization.join(', ') ?? 'General practice'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="time">
                  Time
                </label>
                <select
                  id="time"
                  required
                  value={selectedTime}
                  onChange={(event) => setSelectedTime(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anything you'd like your practitioner to know before the session"
              />
            </div>

            <button
              className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Booking...' : 'Book appointment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
