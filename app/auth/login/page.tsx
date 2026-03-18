'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { BrandAuthShell } from '@/components/brand-auth-shell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('We could not match those credentials. Please try again.')
        return
      }

      const userResponse = await fetch('/api/auth/user')

      if (!userResponse.ok) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      const userData = (await userResponse.json()) as {
        user: {
          role: 'CLIENT' | 'PRACTITIONER' | 'ADMIN'
        }
      }

      if (userData.user.role === 'CLIENT') {
        router.push('/client/dashboard')
      } else if (userData.user.role === 'PRACTITIONER') {
        router.push('/practitioner/dashboard')
      } else if (userData.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BrandAuthShell
      description="Return to your secure OKU Therapy workspace to review appointments, assessments, and the next steps in care."
      eyebrow="Login"
      footer={
        <p>
          Don&apos;t have an account yet?{' '}
          <Link className="font-medium text-[#2f6a5b] transition hover:text-stone-900" href="/auth/signup">
            Create one here
          </Link>
        </p>
      }
      title="Continue to your care space"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Private access</p>
        <h2 className="mt-3 font-serif text-3xl text-stone-950">Sign in calmly, pick up where you left off.</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
          Clients, practitioners, and admins are routed into the right workspace after sign-in.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {message ? (
          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-[20px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </div>

        <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
          Password reset is not yet live in the MVP, so use one of the seeded accounts while testing preview environments.
        </div>

        <button
          className="w-full rounded-full bg-[#2f6a5b] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Signing in...' : 'Continue to workspace'}
        </button>
      </form>

      <div className="mt-8 rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,243,236,0.98))] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Demo access</p>
        <div className="mt-4 space-y-2 font-mono text-xs text-stone-700">
          <p>client@demo.com / demo123</p>
          <p>practitioner@demo.com / demo123</p>
          <p>admin@demo.com / demo123</p>
        </div>
      </div>
    </BrandAuthShell>
  )
}
