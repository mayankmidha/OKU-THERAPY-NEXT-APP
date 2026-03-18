import Link from 'next/link'
import { ReactNode } from 'react'

import { okuCtaCopy } from '@/lib/cta-copy'

type ShellLink = {
  href: string
  label: string
}

type AppShellProps = {
  title: string
  eyebrow: string
  description: string
  accentClassName: string
  backHref?: string
  backLabel?: string
  primaryAction?: {
    href: string
    label: string
  }
  secondaryAction?: {
    href: string
    label: string
  }
  nav?: ShellLink[]
  children: ReactNode
}

type StatCardProps = {
  label: string
  value: string | number
  detail: string
}

type SectionCardProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

type ActionCardProps = {
  href: string
  title: string
  description: string
  meta: string
}

export function AppShell({
  title,
  eyebrow,
  description,
  accentClassName,
  backHref,
  backLabel = 'Back',
  primaryAction,
  secondaryAction,
  nav = [],
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(193,219,210,0.28),_transparent_34%),linear-gradient(180deg,_#fcfaf5_0%,_#f5efe3_45%,_#f8f5ef_100%)] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-stone-200/80 bg-white/80 p-4 shadow-[0_20px_70px_rgba(60,42,24,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
              <div className="flex flex-wrap items-center gap-3">
                {backHref ? (
                  <Link
                    className="inline-flex items-center rounded-full border border-stone-300 bg-white px-4 py-2 font-medium transition hover:border-stone-400 hover:bg-stone-50"
                    href={backHref}
                  >
                    {backLabel}
                  </Link>
                ) : null}
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    className="rounded-full px-3 py-2 transition hover:bg-stone-100 hover:text-stone-900"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {secondaryAction ? (
                  <Link
                    className="inline-flex items-center rounded-full border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                    href={secondaryAction.href}
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
                {primaryAction ? (
                  <Link
                    className={`inline-flex items-center rounded-full px-5 py-2.5 font-medium text-white shadow-[0_12px_30px_rgba(61,53,42,0.18)] transition hover:opacity-95 ${accentClassName}`}
                    href={primaryAction.href}
                  >
                    {primaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
              <div className="rounded-[28px] bg-stone-950 px-6 py-8 text-stone-50 shadow-[0_22px_60px_rgba(20,16,12,0.22)] sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-300">{eyebrow}</p>
                <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">{description}</p>
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-[linear-gradient(145deg,_rgba(242,235,223,0.75),_rgba(255,255,255,0.95))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                  {okuCtaCopy.carePromise.heading}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                  {okuCtaCopy.carePromise.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </div>
  )
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white/90 p-6 shadow-[0_12px_30px_rgba(60,42,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
    </div>
  )
}

export function SectionCard({ title, description, action, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(60,42,24,0.07)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-stone-950">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  )
}

export function ActionCard({ href, title, description, meta }: ActionCardProps) {
  return (
    <Link
      className="group flex h-full flex-col rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,243,236,0.98))] p-5 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_16px_40px_rgba(60,42,24,0.08)]"
      href={href}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{meta}</p>
      <h3 className="mt-4 text-lg font-semibold text-stone-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <span className="mt-6 inline-flex items-center text-sm font-medium text-stone-900 transition group-hover:translate-x-1">
        Open
      </span>
    </Link>
  )
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning'
}) {
  const toneClassName =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-800'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-stone-200 text-stone-700'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClassName}`}>{children}</span>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50/90 px-6 py-10 text-center">
      <h3 className="font-serif text-2xl text-stone-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
