import Link from 'next/link'
import type { ReactNode } from 'react'

type PractitionerNavLink = {
  href: string
  label: string
}

type PractitionerShellProps = {
  badge: string
  children: ReactNode
  currentPath: string
  description: string
  headerActions?: ReactNode
  heroActions?: ReactNode
  title: string
}

type PractitionerSectionCardProps = {
  action?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  description?: string
  title: string
}

type PractitionerStatCardProps = {
  accent?: string
  detail?: string
  label: string
  value: string | number
}

type PractitionerActionTileProps = {
  accent?: string
  description: string
  href: string
  icon: string
  title: string
}

type PractitionerPillTone = 'emerald' | 'sky' | 'amber' | 'rose' | 'slate'

type PractitionerLoadingStateProps = {
  message: string
}

const NAV_LINKS: PractitionerNavLink[] = [
  { href: '/practitioner/dashboard', label: 'Dashboard' },
  { href: '/practitioner/appointments', label: 'Appointments' },
  { href: '/practitioner/clients', label: 'Clients' },
  { href: '/practitioner/availability', label: 'Availability' },
  { href: '/practitioner/profile', label: 'Profile' },
]

const PILL_STYLES: Record<PractitionerPillTone, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-700',
}

function isActiveLink(currentPath: string, href: string) {
  if (currentPath === href) {
    return true
  }

  return currentPath.startsWith(`${href}/`)
}

export function PractitionerShell({
  badge,
  children,
  currentPath,
  description,
  headerActions,
  heroActions,
  title,
}: PractitionerShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f7fafc_0%,_#eff8f6_45%,_#f8fafc_100%)] text-slate-900">
      <div className="absolute left-[-7rem] top-[-7rem] h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute right-[-6rem] top-[18rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-[18%] h-72 w-72 rounded-full bg-teal-400/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Link
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                href="/practitioner/dashboard"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                  O
                </span>
                Practitioner Care
              </Link>

              <nav className="hidden flex-wrap items-center gap-1 rounded-full bg-slate-100 p-1.5 md:flex">
                {NAV_LINKS.map((link) => {
                  const active = isActiveLink(currentPath, link.href)

                  return (
                    <Link
                      className={[
                        'rounded-full px-4 py-2 text-sm font-medium transition',
                        active
                          ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:text-slate-900',
                      ].join(' ')}
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {headerActions ? <div className="flex flex-wrap items-center gap-3">{headerActions}</div> : null}
          </div>
        </header>

        <section className="mt-6 rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95)_0%,_rgba(240,249,255,0.92)_50%,_rgba(236,253,245,0.95)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {badge}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
            </div>

            {heroActions ? <div className="flex flex-wrap gap-3">{heroActions}</div> : null}
          </div>
        </section>

        <main className="pb-12 pt-6">{children}</main>
      </div>
    </div>
  )
}

export function PractitionerLoadingState({ message }: PractitionerLoadingStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f7fafc_0%,_#eff8f6_45%,_#f8fafc_100%)]">
      <div className="rounded-[2rem] border border-white/80 bg-white/90 px-8 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  )
}

export function PractitionerSectionCard({
  action,
  actions,
  children,
  className = '',
  description,
  title,
}: PractitionerSectionCardProps) {
  return (
    <section
      className={[
        'rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6',
        className,
      ].join(' ')}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {action || actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {action ? <div>{action}</div> : null}
            {actions ? <div>{actions}</div> : null}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function PractitionerStatCard({ accent = 'from-sky-500 to-cyan-500', detail, label, value }: PractitionerStatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p> : null}
    </div>
  )
}

export function PractitionerActionTile({
  accent = 'from-sky-500 to-emerald-500',
  description,
  href,
  icon,
  title,
}: PractitionerActionTileProps) {
  return (
    <Link
      className="group flex h-full flex-col rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_16px_50px_rgba(14,165,233,0.12)]"
      href={href}
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-lg font-semibold text-white shadow-lg shadow-sky-500/20`}>
        {icon}
      </div>
      <div className="mt-8 flex-1">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <span className="mt-6 inline-flex items-center text-sm font-medium text-sky-700 transition group-hover:text-sky-900">
        Open workspace
      </span>
    </Link>
  )
}

export function PractitionerPill({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: PractitionerPillTone
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${PILL_STYLES[tone]}`}>
      {children}
    </span>
  )
}
