'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Practitioner {
  id: string
  name: string
  email: string
  practitionerProfile?: {
    specialization: string[]
    bio: string
    hourlyRate?: number
    licenseNumber?: string
  }
}

export default function BookAppointmentPage() {
  const [selectedPractitioner, setSelectedPractitioner] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [isLoadingPractitioners, setIsLoadingPractitioners] = useState(true)
  const router = useRouter()

  const specializations = [
    'Anxiety', 'Depression', 'Trauma', 'Relationships', 
    'ADHD', 'Bipolar Disorder', 'Eating Disorders', 'OCD',
    'PTSD', 'Substance Abuse', 'Grief', 'Stress Management'
  ]

  useEffect(() => {
    fetchPractitioners()
  }, [])

  const fetchPractitioners = async () => {
    try {
      const response = await fetch('/api/practitioners')
      if (response.ok) {
        const data = await response.json()
        setPractitioners(data)
      }
    } catch (error) {
      console.error('Error fetching practitioners:', error)
    } finally {
      setIsLoadingPractitioners(false)
    }
  }

  const filteredPractitioners = practitioners.filter(practitioner => 
    !specialization || practitioner.practitionerProfile?.specialization?.some(spec => 
      spec.toLowerCase().includes(specialization.toLowerCase())
    )
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!selectedPractitioner || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/client/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practitionerId: selectedPractitioner,
          startTime: `${selectedDate}T${selectedTime}`,
          notes
        }),
      })

      if (response.ok) {
        router.push('/client/dashboard?message=Appointment booked successfully')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  if (isLoadingPractitioners) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading practitioners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/client/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Specialization Filter */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialization (optional)
              </label>
              <select
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Practitioner Selection */}
            <div>
              <label htmlFor="practitioner" className="block text-sm font-medium text-gray-700 mb-2">
                Select Practitioner *
              </label>
              <select
                id="practitioner"
                value={selectedPractitioner}
                onChange={(e) => setSelectedPractitioner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a practitioner...</option>
                {filteredPractitioners.map((practitioner) => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {practitioner.name} - {practitioner.practitionerProfile?.specialization?.join(', ') || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Select Time *
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a time...</option>
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any specific concerns or topics you'd like to discuss..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
