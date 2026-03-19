## OKU Therapy SaaS MVP

This repo now contains the Phase 1 foundation for the OKU Therapy SaaS inside the existing Next.js App Router project. The WordPress-backed marketing pages remain intact, while the product app lives under the authenticated route groups below.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Configure your environment variables, especially `DATABASE_URL`, `AUTH_SECRET`, and `NEXTAUTH_URL`.

3. Seed demo data.

```bash
npm run db:seed
```

4. Start the app.

```bash
npm run dev
```

## Demo Users

- `client@demo.com` / `demo123`
- `practitioner@demo.com` / `demo123`
- `admin@demo.com` / `demo123`

## Route Structure

- Marketing pages: `/`, `/about-us`, `/people`
- Auth: `/auth/login`, `/auth/signup`
- Client app: `/client/dashboard`, `/client/book-appointment`, `/client/assessments`, `/client/mood-tracker`
- Practitioner app: `/practitioner/dashboard`
- Admin app: `/admin/dashboard`
- Legacy dashboard paths still exist as redirects so existing links do not break while the app is being migrated.

## Phase 1 Notes

- Prisma schema usage and seed data were aligned with the current MVP models.
- Auth now has a working login flow, signup page, role-aware redirects, and a corrected `/api/auth/user` response.
- Legacy `THERAPIST` dashboard drift was replaced with `PRACTITIONER` routes and redirect shims.
- Placeholder pages were added where needed so there are no broken dashboard links heading into later phases.

## Verification

```bash
npm run lint
npm run build
```
