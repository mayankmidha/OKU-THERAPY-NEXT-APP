'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

interface Therapist {
  id: string
  user: {
    name: string
    email: string
    image?: string
  }
  specialization: string[]
  experience?: number
  consultationFee?: number
}

export default function BookSessionPage() {
  const [services, setServices] = useState<Service[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchBookingData()
  }, [])

  const fetchBookingData = async () => {
    try {
      const response = await fetch('/api/client/book')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
        setTherapists(data.therapists)
      }
    } catch (error) {
      console.error('Error fetching booking data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!selectedService || !selectedTherapist || !selectedDate || !selectedTime) {
      setMessage('Please fill in all required fields')
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
          therapistId: selectedTherapist,
          serviceId: selectedService,
          startTime: startTime.toISOString(),
          notes
        }),
      })

      if (response.ok) {
        setMessage('Session booked successfully!')
        setTimeout(() => {
          router.push('/dashboard/client')
        }, 2000)
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to book session')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/client" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Book a Therapy Session</h1>
              <p className="text-gray-600 mt-1">Choose a therapist, service, and time that works for you</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service *
                </label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} min) - ${service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Therapist Selection */}
              <div>
                <label htmlFor="therapist" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Therapist *
                </label>
                <select
                  id="therapist"
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a therapist...</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.user.name} - {therapist.specialization.join(', ')}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a time...</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Booking...' : 'Book Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
