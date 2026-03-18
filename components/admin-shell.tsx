'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
] as const

type AdminShellProps = {
  actions?: ReactNode
  children: ReactNode
  description: string
  eyebrow?: string
  maxWidth?: '5xl' | '7xl'
  title: string
}

type MetricTone = 'sky' | 'emerald' | 'amber' | 'rose' | 'violet'

type AdminMetricCardProps = {
  hint?: string
  label: string
  tone?: MetricTone
  value: number | string
}

type AdminStatusTone = 'neutral' | 'success' | 'warning' | 'info'

type AdminStatusPillProps = {
  children: ReactNode
  tone?: AdminStatusTone
}

type AdminPanelTone = 'light' | 'dark' | 'soft'

type AdminPanelProps = {
  children: ReactNode
  className?: string
  tone?: AdminPanelTone
}

type AdminActionKind = 'primary' | 'secondary' | 'ghost' | 'danger'

type AdminActionButtonProps = {
  children: ReactNode
  className?: string
  kind?: AdminActionKind
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}

type AdminActionLinkProps = {
  children: ReactNode
  className?: string
  href: string
  kind?: AdminActionKind
}

const toneGradientClasses: Record<MetricTone, string> = {
  sky: 'from-sky-400 via-cyan-400 to-teal-400',
  emerald: 'from-emerald-400 via-teal-400 to-cyan-400',
  amber: 'from-amber-300 via-orange-400 to-rose-400',
  rose: 'from-rose-400 via-pink-400 to-fuchsia-400',
  violet: 'from-violet-400 via-indigo-400 to-sky-400',
}

const statusToneClasses: Record<AdminStatusTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
}

const panelToneClasses: Record<AdminPanelTone, string> = {
  dark: 'border-white/10 bg-white/5 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl',
  light: 'border-slate-200 bg-white text-slate-900 shadow-sm',
  soft: 'border-slate-200 bg-slate-50 text-slate-900 shadow-sm',
}

const actionKindClasses: Record<AdminActionKind, string> = {
  primary:
    'border border-sky-300/30 bg-sky-300/15 text-sky-50 shadow-[0_12px_30px_rgba(14,165,233,0.16)] hover:border-sky-300/50 hover:bg-sky-300/20',
  secondary: 'border border-white/10 bg-white/10 text-white hover:border-white/20 hover:bg-white/15',
  ghost: 'border border-transparent bg-transparent text-slate-200 hover:border-white/10 hover:bg-white/5',
  danger: 'border border-rose-300/20 bg-rose-300/10 text-rose-50 hover:border-rose-300/40 hover:bg-rose-300/20',
}

function isActiveLink(pathname: string | null, href: string) {
  if (!pathname) {
    return false
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminShell({
  actions,
  children,
  description,
  eyebrow = 'Admin control center',
  maxWidth = '7xl',
  title,
}: AdminShellProps) {
  const pathname = usePathname()
  const widthClass = maxWidth === '5xl' ? 'max-w-5xl' : 'max-w-7xl'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111e] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(135deg,_#06111e_0%,_#0b1728_45%,_#09131f_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute left-[-8rem] top-[-7rem] h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link
            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            href="/admin/dashboard"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/10">
              O
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                OKU Therapy
              </span>
              <span className="block text-sm font-medium text-white/90">Admin console</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActiveLink(pathname, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-sky-300/40 bg-sky-300/15 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.15)]'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className={`relative mx-auto w-full ${widthClass} px-4 py-8 sm:px-6 lg:px-8`}>
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_32px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
            </div>

            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
        </section>

        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}

export function AdminMetricCard({ hint, label, tone = 'sky', value }: AdminMetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneGradientClasses[tone]}`} />
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        {hint ? <p className="text-sm leading-6 text-slate-600">{hint}</p> : null}
      </div>
    </div>
  )
}

export function AdminStatusPill({ children, tone = 'neutral' }: AdminStatusPillProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClasses[tone]}`}>
      {children}
    </span>
  )
}

export function AdminPanel({ children, className = '', tone = 'light' }: AdminPanelProps) {
  return <section className={`rounded-[1.75rem] border ${panelToneClasses[tone]} ${className}`.trim()}>{children}</section>
}

export function AdminActionButton({
  children,
  className = '',
  disabled,
  kind = 'secondary',
  onClick,
  type = 'button',
}: AdminActionButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${actionKindClasses[kind]} ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export function AdminActionLink({ children, className = '', href, kind = 'secondary' }: AdminActionLinkProps) {
  return (
    <Link className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${actionKindClasses[kind]} ${className}`.trim()} href={href}>
      {children}
    </Link>
  )
}
