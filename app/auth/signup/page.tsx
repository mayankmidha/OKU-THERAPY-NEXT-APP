'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { BrandAuthShell } from '@/components/brand-auth-shell'
import { okuCtaCopy } from '@/lib/cta-copy'

const roles = [
  {
    label: 'Client',
    value: 'CLIENT',
    description: 'Book sessions, complete assessments, and track your care journey.',
  },
  {
    label: 'Practitioner',
    value: 'PRACTITIONER',
    description: 'Create a professional account to manage appointments, clients, and availability.',
  },
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
    <BrandAuthShell
      description={okuCtaCopy.entry.signupDescription}
      eyebrow={okuCtaCopy.entry.signupBadge}
      footer={
        <p>
          Already have access?{' '}
          <Link className="font-medium text-[#2f6a5b] transition hover:text-stone-900" href="/auth/login">
            Sign in securely
          </Link>
        </p>
      }
      title={okuCtaCopy.entry.signupTitle}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Create access</p>
        <h2 className="mt-3 font-serif text-3xl text-stone-950">Choose the role that fits how you use the platform.</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
          Clients can start self-reflection and booking right away. Practitioner accounts can be created now and verified by admin after review.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">
            Full name
          </label>
          <input
            className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            id="name"
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="Aarav Sharma"
            required
            value={formData.name}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              id="email"
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={formData.email}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="phone">
              Phone
            </label>
            <input
              className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              id="phone"
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="+91 98765 43210"
              value={formData.phone}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            id="password"
            minLength={6}
            onChange={(event) => handleChange('password', event.target.value)}
            placeholder="Minimum 6 characters"
            required
            type="password"
            value={formData.password}
          />
        </div>

        <fieldset>
          <legend className="mb-3 block text-sm font-medium text-stone-700">Choose your role</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((role) => {
              const isSelected = formData.role === role.value

              return (
                <label
                  className={`rounded-[24px] border p-5 transition ${
                    isSelected
                      ? 'border-stone-900 bg-stone-950 text-stone-50 shadow-[0_14px_40px_rgba(20,16,12,0.18)]'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                  key={role.value}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    name="role"
                    onChange={() => handleChange('role', role.value)}
                    type="radio"
                    value={role.value}
                  />
                  <span className="block text-base font-semibold">{role.label}</span>
                  <span className={`mt-2 block text-sm leading-6 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                    {role.description}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <button
          className="w-full rounded-full bg-[#2f6a5b] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Creating account...' : formData.role === 'CLIENT' ? 'Start as a client' : 'Apply as a practitioner'}
        </button>
      </form>
    </BrandAuthShell>
  )
}
