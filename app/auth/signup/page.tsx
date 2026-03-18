'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const roles = [
  { label: 'Client', value: 'CLIENT' },
  { label: 'Practitioner', value: 'PRACTITIONER' },
] as const

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setError(data.error ?? 'Unable to create account.')
        return
      }

      router.push('/auth/login?message=Account%20created%20successfully')
    } catch {
      setError('Unable to create account right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your OKU Therapy account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role, sign up, and we&apos;ll route you into the app.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              required
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Aarav Sharma"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              minLength={6}
              required
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              value={formData.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 98765 43210"
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-gray-700">Role</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`rounded-xl border p-4 text-sm transition ${
                    formData.role === role.value
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <input
                    checked={formData.role === role.value}
                    className="sr-only"
                    name="role"
                    onChange={() => handleChange('role', role.value)}
                    type="radio"
                    value={role.value}
                  />
                  <span className="block font-medium">{role.label}</span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {role.value === 'CLIENT'
                      ? 'Book sessions, track mood, and complete assessments.'
                      : 'Create a professional account pending admin verification.'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="font-medium text-blue-600 hover:text-blue-500" href="/auth/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
