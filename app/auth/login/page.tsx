'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
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
        setError('Invalid credentials')
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
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">OKU Therapy</h1>
            <p className="text-gray-600">Welcome back. Sign in to continue.</p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-xl">
            {message ? (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {message}
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    type="checkbox"
                  />
                  Remember me
                </label>
                <span className="text-sm text-gray-500">Password reset coming soon</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link className="font-medium text-blue-600 hover:text-blue-500" href="/auth/signup">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/90 p-4 text-center">
            <p className="mb-2 text-xs text-gray-600">Demo credentials</p>
            <p className="rounded bg-gray-100 p-2 font-mono text-xs">Client: client@demo.com / demo123</p>
            <p className="mt-1 rounded bg-gray-100 p-2 font-mono text-xs">
              Practitioner: practitioner@demo.com / demo123
            </p>
            <p className="mt-1 rounded bg-gray-100 p-2 font-mono text-xs">Admin: admin@demo.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
