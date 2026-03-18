import Link from 'next/link'
import { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  description: string
  eyebrow: string
  footer: ReactNode
  children: ReactNode
}

export function BrandAuthShell({ title, description, eyebrow, footer, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(193,219,210,0.28),_transparent_34%),linear-gradient(180deg,_#fcfaf5_0%,_#f5efe3_45%,_#f8f5ef_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] bg-stone-950 p-8 text-stone-50 shadow-[0_24px_70px_rgba(20,16,12,0.22)] sm:p-10">
          <Link className="text-sm font-medium text-stone-300 transition hover:text-white" href="/">
            OKU Therapy
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.32em] text-stone-400">{eyebrow}</p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">{description}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Private by design</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Your workspace is role-aware and built around calmer clinical flows.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">One place for care</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Booking, assessments, and care follow-ups live in the same product experience.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-stone-200/80 bg-white/92 p-6 shadow-[0_20px_70px_rgba(60,42,24,0.08)] backdrop-blur sm:p-8">
          {children}
          <div className="mt-8 border-t border-stone-200 pt-6 text-sm text-stone-600">{footer}</div>
        </section>
      </div>
    </div>
  )
}
